// scene-kit.js — เครื่องมือสร้างวัตถุของฉาก Flow 3D: cache geometry/material ที่ใช้ซ้ำ + ตัวคุมแอนิเมชันเล็กๆ
// ทุก geometry/material/texture ที่สร้างผ่าน kit ถูก dispose ครั้งเดียวด้วย kit.dispose() — ตัวเรียกไม่ต้อง dispose เอง
import * as THREE from 'three'

import { ROLES, C } from './scene-palette.js'

// ความสูงพื้นโซน — วัตถุทุกอย่างที่วางบนโซนอ้างจากค่านี้
export const TOPY = 0.65

const SIGN_FONT = '"IBM Plex Sans Thai", sans-serif'

function roundedRect(path, w, d, r) {
  const x = -w / 2
  const y = -d / 2
  path.moveTo(x + r, y)
  path.lineTo(x + w - r, y)
  path.quadraticCurveTo(x + w, y, x + w, y + r)
  path.lineTo(x + w, y + d - r)
  path.quadraticCurveTo(x + w, y + d, x + w - r, y + d)
  path.lineTo(x + r, y + d)
  path.quadraticCurveTo(x, y + d, x, y + d - r)
  path.lineTo(x, y + r)
  path.quadraticCurveTo(x, y, x + r, y)
  return path
}

function drawSign(canvas, text, fg, bg) {
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  if (bg) {
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }
  ctx.fillStyle = fg
  ctx.font = `700 ${Math.round(canvas.height * 0.5)}px ${SIGN_FONT}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 4)
}

function floorCanvas() {
  const size = 1024
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  const glow = ctx.createRadialGradient(size / 2, size / 2, 30, size / 2, size / 2, size / 2)
  glow.addColorStop(0, 'rgba(224,224,224,1)')
  glow.addColorStop(0.6, 'rgba(224,224,224,0.95)')
  glow.addColorStop(1, 'rgba(224,224,224,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, size, size)
  const grid = document.createElement('canvas')
  grid.width = size
  grid.height = size
  const gx = grid.getContext('2d')
  gx.strokeStyle = 'rgba(57,57,57,0.10)'
  gx.lineWidth = 1
  for (let i = 0; i <= size; i += 32) {
    gx.beginPath()
    gx.moveTo(i, 0)
    gx.lineTo(i, size)
    gx.stroke()
    gx.beginPath()
    gx.moveTo(0, i)
    gx.lineTo(size, i)
    gx.stroke()
  }
  gx.globalCompositeOperation = 'destination-in'
  const mask = gx.createRadialGradient(size / 2, size / 2, 20, size / 2, size / 2, size / 2)
  mask.addColorStop(0, 'rgba(255,255,255,1)')
  mask.addColorStop(0.7, 'rgba(255,255,255,0.5)')
  mask.addColorStop(1, 'rgba(255,255,255,0)')
  gx.fillStyle = mask
  gx.fillRect(0, 0, size, size)
  ctx.drawImage(grid, 0, 0)
  return canvas
}

function chevronCanvas() {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = C.charcoal
  ctx.fillRect(0, 0, 128, 64)
  ctx.strokeStyle = 'rgba(250,188,63,0.95)'
  ctx.lineWidth = 7
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(44, 14)
  ctx.lineTo(80, 32)
  ctx.lineTo(44, 50)
  ctx.stroke()
  return canvas
}

export function createKit({ reducedMotion = false } = {}) {
  const geos = new Map()
  const mats = new Map()
  const textures = []
  const glows = []
  const beltTextures = []
  const spinners = []
  let growers = []
  let growIdx = 0
  let chevron = null

  const cached = (key, make) => {
    let g = geos.get(key)
    if (!g) {
      g = make()
      geos.set(key, g)
    }
    return g
  }

  // ---------------------------------------------------------------- geometry (cached)
  const geometry = {
    box: (w, h, d) => cached(`b${w},${h},${d}`, () => new THREE.BoxGeometry(w, h, d)),
    cyl: (rt, rb, h, seg = 24) => cached(`c${rt},${rb},${h},${seg}`, () => new THREE.CylinderGeometry(rt, rb, h, seg)),
    cylOpen: (rt, rb, h, seg) => cached(`co${rt},${rb},${h},${seg}`, () => new THREE.CylinderGeometry(rt, rb, h, seg, 1, true)),
    sph: (r, ws = 18, hs = 14) => cached(`s${r},${ws},${hs}`, () => new THREE.SphereGeometry(r, ws, hs)),
    torus: (r, t, rs, ts, arc = Math.PI * 2) => cached(`t${r},${t},${rs},${ts},${arc}`, () => new THREE.TorusGeometry(r, t, rs, ts, arc)),
    cap: (r) => cached(`cp${r}`, () => new THREE.SphereGeometry(r, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2)),
    octa: (r) => cached(`o${r}`, () => new THREE.OctahedronGeometry(r)),
    cone: (r, h, seg, open = false) => cached(`n${r},${h},${seg},${open}`, () => new THREE.ConeGeometry(r, h, seg, 1, open)),
    plane: (w, h) => cached(`p${w},${h}`, () => new THREE.PlaneGeometry(w, h)),
    halfRound: (r, h, seg) => cached(`hr${r},${h},${seg}`, () => new THREE.CylinderGeometry(r, r, h, seg, 1, false, -Math.PI / 2, Math.PI)),
    slab: (w, d, r, h, bevel) =>
      cached(`sl${w},${d},${r},${h},${bevel}`, () => {
        const g = new THREE.ExtrudeGeometry(roundedRect(new THREE.Shape(), w, d, r), {
          depth: h,
          bevelEnabled: !!bevel,
          bevelThickness: bevel || 0,
          bevelSize: bevel || 0,
          bevelSegments: 3,
          curveSegments: 10
        })
        g.rotateX(-Math.PI / 2)
        return g
      }),
    ring: (w, d, r, t, h) =>
      cached(`rg${w},${d},${r},${t},${h}`, () => {
        const shape = roundedRect(new THREE.Shape(), w, d, r)
        shape.holes.push(roundedRect(new THREE.Path(), w - 2 * t, d - 2 * t, Math.max(0.1, r - t)))
        const g = new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: false, curveSegments: 10 })
        g.rotateX(-Math.PI / 2)
        return g
      })
  }

  // ---------------------------------------------------------------- material (cached)
  function std(color, rough = 0.55, metal = 0.15, extra = null) {
    const key = `${color}|${rough}|${metal}|${extra ? JSON.stringify(extra) : ''}`
    let m = mats.get(key)
    if (!m) {
      m = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...(extra || {}) })
      mats.set(key, m)
    }
    return m
  }

  function role(name) {
    const r = ROLES[name]
    return std(r.color, r.rough, r.metal)
  }

  // วัสดุเรืองแสง; pulse = กะพริบ (ปิดเมื่อ reducedMotion → สว่างคงที่)
  function glow(color, intensity, pulse = false) {
    const key = `glow|${color}|${intensity}|${pulse}`
    let m = mats.get(key)
    if (!m) {
      m = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: intensity, roughness: 0.4, metalness: 0.1 })
      mats.set(key, m)
      if (!reducedMotion) glows.push({ m, base: intensity, pulse })
    }
    return m
  }

  function basic(map, extra = null) {
    const m = new THREE.MeshBasicMaterial({ map, ...(extra || {}) })
    mats.set(`basic${mats.size}`, m)
    return m
  }

  // ---------------------------------------------------------------- placing
  function place(parent, geo, mat, x = 0, y = 0, z = 0, cast = true) {
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.set(x, y, z)
    mesh.castShadow = cast
    mesh.receiveShadow = true
    parent.add(mesh)
    return mesh
  }

  const boxAt = (g, w, h, d, x, y, z, color, rough, metal, extra) => place(g, geometry.box(w, h, d), std(color, rough, metal, extra), x, y, z)
  const cylAt = (g, rt, rb, h, x, y, z, color, rough, metal, seg) => place(g, geometry.cyl(rt, rb, h, seg), std(color, rough, metal), x, y, z)
  const sphAt = (g, r, x, y, z, color, rough, metal, extra) => place(g, geometry.sph(r), std(color, rough, metal, extra), x, y, z)

  function spin(mesh) {
    if (!reducedMotion) spinners.push(mesh)
    return mesh
  }

  function gem(g, x, y, z, color, r = 0.3) {
    const mesh = place(g, geometry.octa(r), std(color, 0.12, 0.1, { emissive: color, emissiveIntensity: 0.5, flatShading: true }), x, y, z)
    return spin(mesh)
  }

  // ---------------------------------------------------------------- textures
  function sign(text, fg, bg, w, h) {
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const texture = new THREE.CanvasTexture(canvas)
    texture.userData = { fg, bg }
    drawSign(canvas, text, fg, bg)
    textures.push(texture)
    // ฟอนต์ไทยอาจยังโหลดไม่เสร็จตอนวาดครั้งแรก → วาดซ้ำเมื่อพร้อม
    if (document.fonts?.load) {
      document.fonts
        .load(`700 ${Math.round(h * 0.5)}px ${SIGN_FONT}`, text)
        .then(() => {
          drawSign(canvas, texture.userData.text ?? text, fg, bg)
          texture.needsUpdate = true
        })
        .catch(() => {})
    }
    return texture
  }

  function setSignText(texture, text) {
    texture.userData.text = text
    drawSign(texture.image, text, texture.userData.fg, texture.userData.bg)
    texture.needsUpdate = true
  }

  function floorTexture() {
    const t = new THREE.CanvasTexture(floorCanvas())
    textures.push(t)
    return t
  }

  // texture ลายลูกศรของสายพาน — แยก clone ต่อสายพาน (repeat ต่างกันตามความยาว) แต่ใช้ภาพเดียวกัน
  function beltTexture(length) {
    if (!chevron) {
      chevron = new THREE.CanvasTexture(chevronCanvas())
      chevron.wrapS = chevron.wrapT = THREE.RepeatWrapping
      textures.push(chevron)
    }
    const t = chevron.clone()
    t.needsUpdate = true
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(length / 1.5, 1)
    beltTextures.push(t)
    return t
  }

  // ---------------------------------------------------------------- animation
  function grow(obj) {
    if (reducedMotion) return
    obj.scale.y = 0.001
    growers.push({ obj, t0: performance.now() + (growIdx++ % 24) * 45, dur: 800 })
  }

  function tick(time, dt) {
    if (reducedMotion) return
    glows.forEach((q) => {
      q.m.emissiveIntensity = q.base * (q.pulse ? 0.55 + 0.45 * Math.sin(time / 260) : 0.85 + 0.15 * Math.sin(time / 700))
    })
    beltTextures.forEach((t) => {
      t.offset.x -= dt * 0.36
    })
    spinners.forEach((m) => {
      m.rotation.y += dt * 1.2
    })
    if (growers.length) {
      const now = performance.now()
      growers = growers.filter((q) => {
        if (!q.obj.parent) return false
        const p = Math.min(1, (now - q.t0) / q.dur)
        if (p < 0) return true
        q.obj.scale.y = Math.max(0.001, 1 - Math.pow(1 - p, 3))
        return p < 1
      })
    }
  }

  // เปลี่ยนเปิด/ปิดเงาแล้ว shader ต้องคอมไพล์ใหม่
  function refreshMaterials() {
    mats.forEach((m) => {
      m.needsUpdate = true
    })
  }

  function dispose() {
    geos.forEach((g) => g.dispose())
    mats.forEach((m) => m.dispose())
    textures.forEach((t) => t.dispose())
    beltTextures.forEach((t) => t.dispose())
    geos.clear()
    mats.clear()
    glows.length = 0
    spinners.length = 0
    beltTextures.length = 0
    growers = []
  }

  return {
    geometry,
    std,
    role,
    glow,
    basic,
    place,
    boxAt,
    cylAt,
    sphAt,
    gem,
    spin,
    sign,
    setSignText,
    floorTexture,
    beltTexture,
    grow,
    tick,
    refreshMaterials,
    dispose
  }
}
