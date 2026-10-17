// flow-scene-engine.js — ฉาก 3 มิติของแท็บ Flow (three.js) · ธีมโรงงานเครื่องประดับ
// ไฟล์นี้ (และไฟล์ใน scene/) import three ตรงๆ จึงต้องถูกโหลดด้วย `import()` จาก flow-scene.vue เท่านั้น (แยก chunk ไม่เข้า bundle หลัก)
// engine ไม่รู้จัก Vue/i18n: รับ model ล้วน (update) แล้ววาด; label เป็น DOM ที่ component เรนเดอร์เอง engine แค่ย้ายตำแหน่ง
//
// ข้อมูลจริงที่ฉากแสดง: ความสูงแท่งผลิต/แม่พิมพ์, ระดับเติมตู้คลังสินค้า, ไฟเตือนบนสถานี (stationAlert)
// ของประกอบฉาก (ถาดบนสายพาน, ตู้วัตถุดิบ, ชั้นวาง, ของบนโต๊ะช่าง, คนเดิน, ลูกค้า) เป็นภาพประกอบ ไม่ได้แทนปริมาณ
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import { SCENE_ZONES, ZONE_BOUNDS, STATIONS, STATION_BY_ID, OVERVIEW_TARGET, OVERVIEW_DISTANCE, FLOOR } from './flow-layout.js'
import { zoneOf, stationAlert } from './flow-helpers.js'
import { createKit, TOPY } from './scene/scene-kit.js'
import { createPeople } from './scene/scene-people.js'
import { createBench } from './scene/scene-bench.js'
import { createDecor } from './scene/scene-decor.js'
import { createZones } from './scene/scene-zones.js'
import { createBelts } from './scene/scene-belts.js'
import { C, LIGHTS } from './scene/scene-palette.js'

const ZONE_LABEL_Y = 1.9
const GATE_LABEL_Y = 4.2
const SHADOW_SPAN = 70
// three r155+ ใช้แสงแบบ physically-correct (ไม่คูณ π ให้แล้ว) — คูณกลับเพื่อให้ความสว่างเท่ากับต้นแบบ (r128)
const LEGACY_LIGHT = Math.PI
const LOW_FPS_MS = 45
const FPS_WARMUP_FRAMES = 20
const FPS_SAMPLE_FRAMES = 90

export function createFlowEngine({ canvas, stage, reducedMotion = false, onSelect = () => {}, texts = {}, shadows = true }) {
  // ต้นแบบวาดสีแบบไม่ผ่าน color management (r128) — ปิดไว้เพื่อให้สีในฉากตรงกับค่า hex ใน palette แล้วคืนค่าตอน dispose
  const prevColorManagement = THREE.ColorManagement.enabled
  THREE.ColorManagement.enabled = false

  const kit = createKit({ reducedMotion })
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(38, 2, 0.1, 600)
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  const projected = new THREE.Vector3()
  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()
  const target = new THREE.Vector3(OVERVIEW_TARGET[0], 0, OVERVIEW_TARGET[2])

  const stationState = {}
  const zoneLabelPos = {}
  let labelEls = {}
  let gateLabelEls = []
  let rafId = 0
  let active = true
  let disposed = false
  let anim = null
  let downAt = null
  let lastTime = 0
  let overviewFit = true // กล้องยังอยู่ที่มุมภาพรวมที่คำนวณเอง (ผู้ใช้ยังไม่ลาก/ซูม) → ปรับใหม่ตามขนาดการ์ด
  let shadowsOn = false
  const fps = { frames: 0, sum: 0, done: false }

  const people = createPeople(kit, scene, reducedMotion)
  const bench = createBench(kit, people)
  const decor = createDecor(kit, bench.cabinet)
  const zones = createZones(kit, bench, scene)
  const belts = createBelts(kit, scene, reducedMotion)

  // ------------------------------------------------------------ build static scene
  const hemi = new THREE.HemisphereLight(LIGHTS.hemiSky, LIGHTS.hemiGround, LIGHTS.hemi * LEGACY_LIGHT)
  scene.add(hemi)
  const sun = new THREE.DirectionalLight(LIGHTS.sun, LIGHTS.sunI * LEGACY_LIGHT)
  sun.target.position.set(OVERVIEW_TARGET[0], 0, OVERVIEW_TARGET[2])
  sun.position.set(OVERVIEW_TARGET[0] - 16, 50, OVERVIEW_TARGET[2] + 13)
  sun.shadow.mapSize.set(2048, 2048)
  sun.shadow.bias = -0.0006
  Object.assign(sun.shadow.camera, { left: -SHADOW_SPAN, right: SHADOW_SPAN, top: SHADOW_SPAN, bottom: -SHADOW_SPAN, near: 1, far: 160 })
  scene.add(sun.target)
  scene.add(sun)
  const rim = new THREE.DirectionalLight(LIGHTS.rim, LIGHTS.rimI * LEGACY_LIGHT)
  rim.position.set(44, 24, -30)
  scene.add(rim)

  const floorGeo = kit.geometry.plane(FLOOR.w, FLOOR.d)
  const floor = kit.place(scene, floorGeo, kit.basic(kit.floorTexture(), { transparent: true }), FLOOR.cx, -0.02, FLOOR.cz, false)
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = false
  const shadowFloor = new THREE.Mesh(floorGeo, new THREE.ShadowMaterial({ opacity: 0.4 }))
  shadowFloor.rotation.x = -Math.PI / 2
  shadowFloor.position.set(FLOOR.cx, -0.01, FLOOR.cz)
  shadowFloor.receiveShadow = true
  scene.add(shadowFloor)

  zones.build({ storefront: texts.storefront || '' })
  SCENE_ZONES.forEach((z) => {
    zoneLabelPos[z.id] = [z.cx, ZONE_LABEL_Y, z.z0 - 0.2]
  })

  const padMat = kit.role('pad')
  const holdMat = kit.std(C.white, 0.5, 0.12, { transparent: true, opacity: 0.45 })

  STATIONS.forEach((s) => {
    const group = new THREE.Group()
    group.position.set(s.pos[0], TOPY, s.pos[2])
    group.userData.id = s.id
    const { rug } = bench.buildStation(group, s)
    const frame = new THREE.Group()
    const ring = kit.place(frame, kit.geometry.torus(Math.min(s.w, s.d) * 0.54 + 0.35, 0.13, 10, 48), kit.glow(C.white, 0.95, true), 0, 0.3, 0, false)
    ring.rotation.x = Math.PI / 2
    frame.visible = false
    group.add(frame)
    scene.add(group)
    stationState[s.id] = { group, frame, rug, hold: false, dyn: [], sig: '', labelY: TOPY + 1.6 + 0.6 }
  })

  belts.build()
  people.build()

  function setShadows(on) {
    if (on === shadowsOn) return
    shadowsOn = on
    renderer.shadowMap.enabled = on
    sun.castShadow = on
    shadowFloor.visible = on
    kit.refreshMaterials()
  }
  setShadows(shadows)

  const controls = new OrbitControls(camera, canvas)
  controls.enableDamping = !reducedMotion
  controls.dampingFactor = 0.08
  controls.maxPolarAngle = Math.PI / 2.15
  controls.minDistance = 14
  controls.maxDistance = 300
  controls.target.copy(target)
  controls.addEventListener('start', () => {
    overviewFit = false
  })

  // ------------------------------------------------------------ camera
  function offsetFor(dist) {
    const aspect = stage.clientWidth / Math.max(stage.clientHeight, 1)
    const k = Math.max(1, 2.0 / aspect)
    return new THREE.Vector3(0, 0.92, 0.38).normalize().multiplyScalar(dist * k)
  }

  function fit() {
    camera.position.copy(target).add(offsetFor(OVERVIEW_DISTANCE))
    camera.lookAt(target)
  }

  function flyTo(id, instant = false) {
    overviewFit = id === 'all'
    const z = id === 'all' ? null : ZONE_BOUNDS[zoneOf(id)]
    const t = z ? new THREE.Vector3(z.cx, 0, z.cz) : new THREE.Vector3(OVERVIEW_TARGET[0], 0, OVERVIEW_TARGET[2])
    const p1 = t.clone().add(offsetFor(z ? z.d : OVERVIEW_DISTANCE))
    if (reducedMotion || instant) {
      camera.position.copy(p1)
      controls.target.copy(t)
      anim = null
      return
    }
    anim = { t0: performance.now(), dur: 700, p0: camera.position.clone(), p1, t0v: controls.target.clone(), t1v: t }
  }

  function resize() {
    const w = stage.clientWidth
    const h = stage.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    if (overviewFit && !anim) {
      camera.position.copy(target).add(offsetFor(OVERVIEW_DISTANCE))
      controls.target.copy(target)
    }
  }

  // ------------------------------------------------------------ model
  function update(next) {
    next.stations.forEach((s) => {
      const st = stationState[s.id]
      if (!st) return
      st.group.visible = s.visible
      if (st.hold !== !!s.hold) {
        st.hold = !!s.hold
        st.rug.material = st.hold ? holdMat : padMat
      }
      const alert = stationAlert(s)
      const sig = JSON.stringify([s.decor, alert])
      if (sig !== st.sig) {
        decor.clear(st.dyn)
        st.labelY = decor.build(st.group, { id: s.id, kind: s.kind, decor: s.decor, alert }, st.dyn)
        st.sig = sig
      }
      st.frame.visible = s.visible && next.selected === s.id
    })
    SCENE_ZONES.forEach((z) => {
      zones.frames[z.id].visible = next.selected === z.id
    })
  }

  function setLabels(els, gates) {
    labelEls = els || {}
    gateLabelEls = gates || []
  }

  function setTexts(next) {
    if (next?.storefront) zones.setStorefrontText(next.storefront)
  }

  // ------------------------------------------------------------ loop
  function placeLabel(el, x, y, z, w, h) {
    projected.set(x, y, z).project(camera)
    el.style.transform = `translate(${((projected.x * 0.5 + 0.5) * w).toFixed(1)}px,${((-projected.y * 0.5 + 0.5) * h).toFixed(1)}px) translate(-50%,-100%)`
  }

  // เครื่องช้า: เฉลี่ยเฟรมเกิน LOW_FPS_MS หลังอุ่นเครื่อง → ปิดเงาอัตโนมัติ
  function watchFps(dtMs) {
    if (fps.done || !shadowsOn) return
    fps.frames += 1
    if (fps.frames <= FPS_WARMUP_FRAMES) return
    fps.sum += dtMs
    if (fps.frames === FPS_WARMUP_FRAMES + FPS_SAMPLE_FRAMES) {
      fps.done = true
      if (fps.sum / FPS_SAMPLE_FRAMES > LOW_FPS_MS) setShadows(false)
    }
  }

  function frame(time) {
    rafId = 0
    if (disposed || !active) return
    const dtMs = lastTime ? time - lastTime : 16
    const dt = Math.min(0.1, dtMs / 1000)
    lastTime = time
    watchFps(dtMs)
    kit.tick(time, dt)
    people.tick(dt)
    belts.tick(dt)
    if (anim) {
      const q = Math.min(1, (time - anim.t0) / anim.dur)
      const e = q < 0.5 ? 2 * q * q : 1 - Math.pow(-2 * q + 2, 2) / 2
      camera.position.lerpVectors(anim.p0, anim.p1, e)
      controls.target.lerpVectors(anim.t0v, anim.t1v, e)
      if (q >= 1) anim = null
    }
    controls.update()
    renderer.render(scene, camera)
    const w = stage.clientWidth
    const h = stage.clientHeight
    Object.keys(labelEls).forEach((id) => {
      const el = labelEls[id]
      if (!el) return
      const z = zoneLabelPos[id]
      if (z) return placeLabel(el, z[0], z[1], z[2], w, h)
      const s = STATION_BY_ID[id]
      if (s) placeLabel(el, s.pos[0], stationState[id].labelY, s.pos[2], w, h)
    })
    gateLabelEls.forEach((g) => {
      if (g.el) placeLabel(g.el, g.pos[0], GATE_LABEL_Y, g.pos[1], w, h)
    })
    rafId = requestAnimationFrame(frame)
  }

  function setActive(on) {
    active = on
    if (on && !rafId && !disposed) {
      lastTime = 0
      rafId = requestAnimationFrame(frame)
    }
    if (!on && rafId) {
      cancelAnimationFrame(rafId)
      rafId = 0
    }
  }

  // ------------------------------------------------------------ picking
  const visibleChain = (o) => {
    let cur = o
    while (cur) {
      if (cur.visible === false) return false
      cur = cur.parent
    }
    return true
  }
  const onPointerDown = (e) => {
    downAt = [e.clientX, e.clientY]
  }
  const onPointerUp = (e) => {
    if (!downAt || Math.abs(e.clientX - downAt[0]) + Math.abs(e.clientY - downAt[1]) > 6) return
    const r = canvas.getBoundingClientRect()
    pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
    raycaster.setFromCamera(pointer, camera)
    const objs = [...Object.values(stationState).map((s) => s.group), ...Object.values(zones.plates)]
    const hit = raycaster.intersectObjects(objs, true).find((h) => visibleChain(h.object))
    if (!hit) return
    let o = hit.object
    while (o && !o.userData.id) o = o.parent
    if (o) onSelect(o.userData.id)
  }
  canvas.addEventListener('pointerdown', onPointerDown)
  canvas.addEventListener('pointerup', onPointerUp)

  const resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(resize) : null
  if (resizeObserver) resizeObserver.observe(stage)

  fit()
  resize()
  rafId = requestAnimationFrame(frame)

  function dispose() {
    disposed = true
    if (rafId) cancelAnimationFrame(rafId)
    rafId = 0
    canvas.removeEventListener('pointerdown', onPointerDown)
    canvas.removeEventListener('pointerup', onPointerUp)
    if (resizeObserver) resizeObserver.disconnect()
    controls.dispose()
    sun.shadow.dispose()
    shadowFloor.material.dispose()
    kit.dispose()
    renderer.dispose()
    renderer.forceContextLoss()
    THREE.ColorManagement.enabled = prevColorManagement
  }

  return { update, setLabels, setTexts, setShadows, flyTo, setActive, resize, dispose }
}
