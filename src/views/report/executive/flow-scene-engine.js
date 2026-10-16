// flow-scene-engine.js — ฉาก 3 มิติของแท็บ Flow (three.js)
// ไฟล์นี้ import three ตรงๆ จึงต้องถูกโหลดด้วย `import()` จาก flow-scene.vue เท่านั้น (แยก chunk ไม่เข้า bundle หลัก)
// engine ไม่รู้จัก Vue/i18n: รับ model ล้วน (update) แล้ววาด; label เป็น DOM ที่ component เรนเดอร์เอง engine แค่ย้ายตำแหน่ง
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import { SCENE_ZONES, ZONE_BOUNDS, STATIONS, BELTS, GATES, OVERVIEW_TARGET, OVERVIEW_DISTANCE, FLOOR, SCENE_TOKENS } from './flow-layout.js'
import { zoneOf } from './flow-helpers.js'

const HS = 0.0042 // สเกลความสูงของแท่งแม่พิมพ์ (ต่อ 1 งาน)
const PROD_SCALE = 0.00042 // สเกลความสูงของแท่งผลิต (ต่อ 1 ชิ้น)
const STATION_BY_ID = Object.fromEntries(STATIONS.map((s) => [s.id, s]))

export function createFlowEngine({ canvas, stage, reducedMotion = false, onSelect = () => {} }) {
  const palette = {}
  const themeMats = []
  const movers = []
  const groups = {}
  const frames = {}
  const plates = {}
  const stationState = {}
  const zoneState = {}
  const ownedGeometries = []
  let labelEls = {}
  let gateLabelEls = []
  let rafId = 0
  let active = true
  let disposed = false
  let anim = null
  let downAt = null
  let overviewFit = true // กล้องยังอยู่ที่มุมภาพรวมที่คำนวณเอง (ผู้ใช้ยังไม่ลาก/ซูม) → ปรับใหม่ตามขนาดการ์ด

  const probe = document.createElement('span')
  probe.style.display = 'none'
  stage.appendChild(probe)

  function readPalette() {
    Object.keys(SCENE_TOKENS).forEach((role) => {
      probe.style.color = `var(${SCENE_TOKENS[role]})`
      palette[role] = getComputedStyle(probe).color
    })
  }
  readPalette()

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(38, 2, 0.1, 500)
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))

  const projected = new THREE.Vector3()
  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()
  const target = new THREE.Vector3(OVERVIEW_TARGET[0], 0, OVERVIEW_TARGET[2])

  function mat(role, bucket) {
    const m = new THREE.MeshLambertMaterial({ color: palette[role] })
    const entry = { m, role }
    themeMats.push(entry)
    if (bucket) bucket.push(entry)
    return m
  }

  function geo(g) {
    ownedGeometries.push(g)
    return g
  }

  function box(w, h, d, x, y, z, role, group, bucket) {
    const mesh = new THREE.Mesh(geo(new THREE.BoxGeometry(w, h, d)), mat(role, bucket))
    mesh.position.set(x, y, z)
    group.add(mesh)
    if (bucket) bucket.push({ mesh })
    return mesh
  }

  function stack(group, x, z, w, d, segs, scale, bucket) {
    let y = 0.4
    segs.forEach(([value, role]) => {
      const h = value * scale
      if (h <= 0.001) return
      box(w, h, d, x, y + h / 2, z, role, group, bucket)
      y += h
    })
    return y
  }

  function clearDecor(group) {
    ;(group.userData.dyn || []).forEach((o) => {
      if (o.mesh) {
        group.remove(o.mesh)
        o.mesh.geometry.dispose()
      }
      if (o.m) {
        const i = themeMats.indexOf(o)
        if (i >= 0) themeMats.splice(i, 1)
        o.m.dispose()
      }
    })
    group.userData.dyn = []
  }

  // สร้างของตกแต่งตาม decor ของสถานี; คืนความสูงยอดไว้วางป้าย
  function decorate(group, decor) {
    const dyn = group.userData.dyn
    let top = 1.6
    switch (decor.type) {
      case 'prod': {
        const roles = ['b1', 'b2', 'b3', 'warn']
        top = Math.max(stack(group, -0.5, 0, 1.9, 1.7, decor.segs.map((v, k) => [v, roles[k]]), PROD_SCALE, dyn), 0.5)
        for (let i = 0; i < decor.cubes; i += 1) box(0.4, 0.4, 0.4, 1.55, 0.6 + i * 0.45, 0, 'b2', group, dyn)
        break
      }
      case 'mold': {
        top = Math.max(stack(group, 0, 0, 2.2, 1.9, [[Math.max(0, decor.open - decor.stale), 'b1'], [decor.stale, 'warn']], HS, dyn), 0.5)
        if (decor.open === 0) box(2.2, 0.06, 1.9, 0, 0.43, 0, 'b3', group, dyn)
        break
      }
      case 'matGold':
        for (let i = 0; i < 3; i += 1) box(1.2, 0.35, 0.6, -0.4 + i * 0.1, 0.55 + i * 0.35, 0, 'warn', group, dyn)
        top = 1.8
        break
      case 'matGem':
        for (let i = 0; i < 6; i += 1) {
          const o = new THREE.Mesh(geo(new THREE.OctahedronGeometry(0.28)), mat('dark', dyn))
          o.position.set(-0.8 + (i % 3) * 0.8, 0.7, -0.5 + Math.floor(i / 3) * 1.0)
          group.add(o)
          dyn.push({ mesh: o })
        }
        top = 1.6
        break
      case 'recv':
        box(0.3, 2.0, 0.3, -1.1, 1.4, -1.0, 'dark', group, dyn)
        box(0.3, 2.0, 0.3, 1.1, 1.4, -1.0, 'dark', group, dyn)
        box(2.5, 0.3, 0.45, 0, 2.5, -1.0, 'dark', group, dyn)
        for (let i = 0; i < 3; i += 1) box(0.5, 0.45, 0.5, -0.7 + i * 0.7, 0.62, 0.8, 'b1', group, dyn)
        top = 2.7
        break
      case 'sales':
        top = Math.max(stack(group, 0, 0, 1.8, 1.4, [[decor.value, decor.role]], 0.03, dyn), 0.8)
        break
      case 'hold':
        top = 0.9
        break
      case 'stockPad': {
        const h = Math.max(0.12, decor.max > 0 ? (4.0 * decor.value) / decor.max : 0.12)
        box(2.4, h, 1.9, 0, 0.4 + h / 2, 0, decor.selected ? 'warn' : 'b1', group, dyn)
        top = 0.4 + h
        break
      }
      default:
        top = 0.5
    }
    return top
  }

  // ------------------------------------------------------------ build static scene
  scene.add(new THREE.AmbientLight(0xffffff, 0.75))
  const sun = new THREE.DirectionalLight(0xffffff, 0.6)
  sun.position.set(-14, 30, 18)
  scene.add(sun)

  const floor = new THREE.Mesh(geo(new THREE.PlaneGeometry(FLOOR.w, FLOOR.d)), mat('floor'))
  floor.rotation.x = -Math.PI / 2
  floor.position.set(FLOOR.cx, -0.01, FLOOR.cz)
  scene.add(floor)

  const grid = new THREE.GridHelper(FLOOR.w, 45, palette.line, palette.line)
  grid.position.set(FLOOR.cx, 0.005, FLOOR.cz)
  grid.material.opacity = 0.4
  grid.material.transparent = true
  scene.add(grid)

  SCENE_ZONES.forEach((z) => {
    const g = new THREE.Group()
    g.userData.id = z.id
    const w = z.x1 - z.x0
    const dd = z.z1 - z.z0
    const plate = new THREE.Mesh(geo(new THREE.BoxGeometry(w, 0.5, dd)), mat(`zt${z.tone}`))
    plate.position.set(z.cx, 0.25, z.cz)
    g.add(plate)
    const t = 0.34
    const hh = 0.95
    ;[
      [w, t, z.cx, z.z0 + t / 2],
      [w, t, z.cx, z.z1 - t / 2],
      [t, dd, z.x0 + t / 2, z.cz],
      [t, dd, z.x1 - t / 2, z.cz]
    ].forEach(([bw, bd, x, zz]) => {
      const wall = new THREE.Mesh(geo(new THREE.BoxGeometry(bw, hh, bd)), mat('dark'))
      wall.position.set(x, hh / 2, zz)
      g.add(wall)
    })
    const frame = new THREE.Group()
    ;[
      [w + 1.2, 0.2, z.cx, z.z0 - 0.5],
      [w + 1.2, 0.2, z.cx, z.z1 + 0.5],
      [0.2, dd + 1.2, z.x0 - 0.5, z.cz],
      [0.2, dd + 1.2, z.x1 + 0.5, z.cz]
    ].forEach(([bw, bd, x, zz]) => {
      const m = new THREE.Mesh(geo(new THREE.BoxGeometry(bw, 0.5, bd)), mat('warn'))
      m.position.set(x, 0.25, zz)
      frame.add(m)
    })
    frame.visible = false
    g.add(frame)
    frames[z.id] = frame
    scene.add(g)
    plates[z.id] = g
    zoneState[z.id] = { pos: [z.cx, 0, z.z0 - 0.2], labelY: 1.6 }
  })

  STATIONS.forEach((s) => {
    const g = new THREE.Group()
    g.position.set(s.pos[0], 0.5, s.pos[2])
    g.userData.id = s.id
    g.userData.dyn = []
    const pad = new THREE.Mesh(geo(new THREE.BoxGeometry(s.w, 0.4, s.d)), mat('pad'))
    pad.position.y = 0.2
    g.add(pad)
    const frame = new THREE.Group()
    const t = 0.16
    ;[
      [s.w + 0.4, t, 0, (s.d + 0.4) / 2],
      [s.w + 0.4, t, 0, -(s.d + 0.4) / 2],
      [t, s.d + 0.4, (s.w + 0.4) / 2, 0],
      [t, s.d + 0.4, -(s.w + 0.4) / 2, 0]
    ].forEach(([bw, bd, x, zz]) => {
      const m = new THREE.Mesh(geo(new THREE.BoxGeometry(bw, 0.5, bd)), mat('sel'))
      m.position.set(x, 0.25, zz)
      frame.add(m)
    })
    frame.visible = false
    g.add(frame)
    frames[s.id] = frame
    scene.add(g)
    groups[s.id] = g
    stationState[s.id] = { sig: '', labelY: 2.7, pad }
  })

  function addBelt([x1, z1, x2, z2, count]) {
    const dx = x2 - x1
    const dz = z2 - z1
    const len = Math.sqrt(dx * dx + dz * dz)
    if (len < 0.2) return
    const b = new THREE.Mesh(geo(new THREE.BoxGeometry(Math.abs(dx) > 0.01 ? len : 0.8, 0.14, Math.abs(dz) > 0.01 ? len : 0.8)), mat('dark'))
    b.position.set((x1 + x2) / 2, 0.57, (z1 + z2) / 2)
    scene.add(b)
    if (reducedMotion) return
    const n = count || 1
    for (let i = 0; i < n; i += 1) {
      const c = new THREE.Mesh(geo(new THREE.BoxGeometry(0.4, 0.4, 0.4)), mat('b2'))
      c.position.y = 0.9
      scene.add(c)
      movers.push({ mesh: c, a: [x1, z1], b: [x2, z2], t: i / n })
    }
  }
  BELTS.forEach(addBelt)

  GATES.forEach((gt) => {
    const g = new THREE.Group()
    g.position.set(gt.pos[0], 0.5, gt.pos[1])
    box(0.35, 2.2, 0.35, -2.6, 1.1, 0, 'sel', g)
    box(0.35, 2.2, 0.35, 2.6, 1.1, 0, 'sel', g)
    box(5.55, 0.32, 0.35, 0, 2.3, 0, 'sel', g)
    scene.add(g)
  })

  const controls = new OrbitControls(camera, canvas)
  controls.enableDamping = !reducedMotion
  controls.dampingFactor = 0.08
  controls.maxPolarAngle = Math.PI / 2.15
  controls.minDistance = 14
  controls.maxDistance = 240
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
      const g = groups[s.id]
      const st = stationState[s.id]
      if (!g) return
      g.visible = s.visible
      const pad = st.pad
      if (pad.material.transparent !== !!s.hold) {
        pad.material.opacity = s.hold ? 0.5 : 1
        pad.material.transparent = !!s.hold
        pad.material.needsUpdate = true
      }
      const sig = JSON.stringify(s.decor)
      if (sig !== st.sig) {
        clearDecor(g)
        st.labelY = 0.5 + decorate(g, s.decor) + 0.6
        st.sig = sig
      }
      frames[s.id].visible = s.visible && next.selected === s.id
    })
    SCENE_ZONES.forEach((z) => {
      frames[z.id].visible = next.selected === z.id
    })
  }

  function setLabels(els, gates) {
    labelEls = els || {}
    gateLabelEls = gates || []
  }

  // ------------------------------------------------------------ loop
  function placeLabel(el, x, y, z, w, h) {
    projected.set(x, y, z).project(camera)
    el.style.transform = `translate(${((projected.x * 0.5 + 0.5) * w).toFixed(1)}px,${((-projected.y * 0.5 + 0.5) * h).toFixed(1)}px) translate(-50%,-100%)`
  }

  function frame(time) {
    rafId = 0
    if (disposed || !active) return
    if (!reducedMotion) {
      movers.forEach((o) => {
        const p = (time * 0.00012 + o.t) % 1
        o.mesh.position.x = o.a[0] + (o.b[0] - o.a[0]) * p
        o.mesh.position.z = o.a[1] + (o.b[1] - o.a[1]) * p
      })
    }
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
      const z = zoneState[id]
      if (z) return placeLabel(el, z.pos[0], z.labelY, z.pos[2], w, h)
      const s = STATION_BY_ID[id]
      if (s) placeLabel(el, s.pos[0], stationState[id].labelY, s.pos[2], w, h)
    })
    gateLabelEls.forEach((g) => {
      if (g.el) placeLabel(g.el, g.pos[0], 3.6, g.pos[1], w, h)
    })
    rafId = requestAnimationFrame(frame)
  }

  function setActive(on) {
    active = on
    if (on && !rafId && !disposed) rafId = requestAnimationFrame(frame)
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
    const objs = [...Object.values(groups), ...Object.values(plates)]
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
    Object.values(groups).forEach(clearDecor)
    ownedGeometries.forEach((g) => g.dispose())
    themeMats.forEach((o) => o.m.dispose())
    grid.geometry.dispose()
    grid.material.dispose()
    renderer.dispose()
    renderer.forceContextLoss()
    probe.remove()
  }

  return { update, setLabels, flyTo, setActive, resize, dispose }
}
