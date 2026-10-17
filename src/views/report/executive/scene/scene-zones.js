// scene-zones.js — ฐานโซน (พื้น/ผนัง/หน้าต่าง/กรอบเลือก) + ของประกอบแต่ละโซน (ชั้นวาง, ตู้โชว์, หน้าร้าน ฯลฯ)
// ของประกอบทั้งหมดเป็นภาพประกอบ ไม่ผูกกับข้อมูล; พิกัดของประกอบเป็นพิกัดตั้งต้นของโซน แล้วเลื่อนตาม ZONE_OFFSET
import * as THREE from 'three'

import { TOPY } from './scene-kit.js'
import { C, ZONE_ACCENT } from './scene-palette.js'
import { SCENE_ZONES, ZONE_OFFSET } from '../flow-layout.js'

export function createZones(kit, bench, scene) {
  const G = kit.geometry
  const { boxAt: box, cylAt: cyl, place } = kit
  const Y = TOPY
  const plates = {}
  const frames = {}
  let storefrontSign = null

  function walls(g, z, accent) {
    const w = z.x1 - z.x0
    const dd = z.z1 - z.z0
    const H = 3.3
    const wall = kit.std(C.grey, 0.9, 0)
    const dado = kit.std(accent, 0.8, 0)
    place(g, G.box(w, H, 0.3), wall, z.cx, TOPY + H / 2, z.z0 + 0.15)
    place(g, G.box(w, 0.9, 0.34), dado, z.cx, TOPY + 0.45, z.z0 + 0.16, false)
    place(g, G.box(0.3, H, dd), wall, z.x0 + 0.15, TOPY + H / 2, z.cz)
    place(g, G.box(0.34, 0.9, dd), dado, z.x0 + 0.16, TOPY + 0.45, z.cz, false)
    const n = Math.max(2, Math.floor(w / 6))
    const glass = kit.std(C.mint, 0.1, 0.2, { emissive: C.mint, emissiveIntensity: 0.55, transparent: true, opacity: 0.85 })
    for (let i = 0; i < n; i += 1) {
      const wx = z.x0 + (w * (i + 0.5)) / n
      place(g, G.box(2.4, 1.3, 0.1), glass, wx, TOPY + 2.2, z.z0 + 0.34, false)
      box(g, 0.07, 1.3, 0.14, wx, TOPY + 2.2, z.z0 + 0.36, C.charcoal, 0.7, 0.1)
    }
  }

  function base(z) {
    const g = new THREE.Group()
    g.userData.id = z.id
    const w = z.x1 - z.x0
    const dd = z.z1 - z.z0
    place(g, G.slab(w + 1.0, dd + 1.0, 1.6, 0.3, 0.06), kit.role('plinth'), z.cx, 0, z.cz)
    place(g, G.slab(w, dd, 1.3, TOPY - 0.3, 0.05), kit.role(`zt${z.tone}`), z.cx, 0.3, z.cz, false)
    place(g, G.ring(w, dd, 1.3, 0.3, 0.16), kit.std(ZONE_ACCENT[z.id], 0.6, 0.1), z.cx, TOPY - 0.02, z.cz, false)
    walls(g, z, ZONE_ACCENT[z.id])
    const frame = new THREE.Group()
    place(frame, G.ring(w + 1.8, dd + 1.8, 1.9, 0.38, 0.4), kit.glow(C.amber, 0.9, true), z.cx, 0.2, z.cz, false)
    frame.visible = false
    g.add(frame)
    frames[z.id] = frame
    scene.add(g)
    plates[z.id] = g
  }

  function wallShelf(g, x, z, w, rows) {
    const bodyH = rows * 0.9 + 0.2
    box(g, w, bodyH, 0.7, x, Y + bodyH / 2, z, C.sand, 0.7, 0.1)
    for (let r = 0; r < rows; r += 1) {
      box(g, w - 0.1, 0.05, 0.62, x, Y + 0.25 + r * 0.9, z, C.roseDark, 0.7, 0.1)
      for (let i = 0; i < Math.floor(w / 0.7); i += 1) {
        const bx = x - w / 2 + 0.45 + i * 0.7
        if ((i + r) % 3 === 0) box(g, 0.5, 0.32, 0.4, bx, Y + 0.45 + r * 0.9, z + 0.08, C.white, 0.8, 0)
        else if ((i + r) % 3 === 1) box(g, 0.45, 0.28, 0.4, bx, Y + 0.42 + r * 0.9, z + 0.08, C.maroonDeep, 0.7, 0.1)
        else bench.ringJewel(g, bx, Y + 0.28 + r * 0.9, z + 0.08, C.amber, C.mint, 0.9)
      }
    }
  }

  function cartonStack(g, x, z) {
    box(g, 0.9, 0.6, 0.7, x, Y + 0.3, z, C.sand, 0.9, 0)
    box(g, 0.9, 0.6, 0.7, x + 1.0, Y + 0.3, z, C.sand, 0.9, 0)
    box(g, 0.8, 0.6, 0.65, x + 0.5, Y + 0.9, z, C.roseLight, 0.9, 0)
  }

  function buffingMachine(g, x, z) {
    box(g, 1.7, 0.8, 0.9, x, Y + 0.4, z, C.charcoal, 0.5, 0.4)
    box(g, 1.7, 0.1, 0.9, x, Y + 0.85, z, C.grey, 0.3, 0.7)
    box(g, 0.9, 0.5, 0.5, x, Y + 1.15, z - 0.2, C.charcoal, 0.5, 0.4)
    ;[-0.7, 0.7].forEach((dx) => {
      const wheel = place(g, G.cyl(0.42, 0.42, 0.16, 28), kit.std(dx < 0 ? C.white : C.sand, 0.9, 0), x + dx, Y + 1.2, z)
      wheel.rotation.z = Math.PI / 2
      kit.spin(wheel)
    })
    box(g, 0.6, 0.12, 0.35, x, Y + 0.95, z + 0.2, C.amber, 0.5, 0.3)
  }

  function safeBox(g, x, z) {
    box(g, 1.7, 1.9, 1.3, x, Y + 0.95, z, C.charcoal, 0.5, 0.6)
    box(g, 1.3, 1.5, 0.08, x, Y + 0.95, z + 0.66, C.charcoal, 0.4, 0.7)
    place(g, G.torus(0.28, 0.05, 10, 24), kit.std(C.amber, 0.3, 0.9), x, Y + 1.0, z + 0.72)
    cyl(g, 0.05, 0.05, 0.4, x + 0.4, Y + 1.0, z + 0.74, C.amber, 0.3, 0.9, 10).rotation.x = Math.PI / 2
  }

  function gondola(g, x, z, w) {
    const cols = [C.maroon, C.teal, C.roseDark, C.amber, C.mint, C.roseLight]
    box(g, w, 1.7, 0.12, x, Y + 0.95, z, C.charcoal, 0.5, 0.4)
    box(g, w, 0.18, 1.2, x, Y + 0.09, z, C.charcoal, 0.6, 0.3)
    box(g, w, 0.18, 0.4, x, Y + 1.88, z, C.maroon, 0.6, 0.1)
    for (let lv = 0; lv < 3; lv += 1) {
      const yy = Y + 0.42 + lv * 0.5
      ;[-1, 1].forEach((side) => {
        box(g, w - 0.1, 0.04, 0.42, x, yy, z + side * 0.27, C.grey, 0.4, 0.4)
        for (let i = 0; i < Math.floor(w / 0.5); i += 1) {
          const bx = x - w / 2 + 0.35 + i * 0.5
          const color = cols[(i + lv + (side > 0 ? 3 : 0)) % cols.length]
          if ((i + lv) % 4 === 3) bench.ringJewel(g, bx, yy + 0.02, z + side * 0.27, C.amber, C.red, 0.7)
          else box(g, 0.34, 0.2, 0.3, bx, yy + 0.12, z + side * 0.27, color, 0.7, 0.05)
        }
      })
    }
  }

  function storefront(g, cx, zf, x0, x1, accent, signText) {
    const doorW = 4.4
    const half = doorW / 2
    ;[
      [x0, cx - half],
      [cx + half, x1]
    ].forEach(([a, b]) => {
      const w = b - a
      const mx = (a + b) / 2
      box(g, w, 0.9, 0.2, mx, Y + 0.45, zf, C.grey, 0.6, 0.1)
      place(g, G.box(w, 1.6, 0.06), kit.std(C.tealPale, 0.05, 0.1, { transparent: true, opacity: 0.22 }), mx, Y + 1.7, zf, false)
      box(g, w, 0.9, 0.22, mx, Y + 0.45, zf, accent, 0.7, 0.1).scale.set(1, 0.35, 1)
    })
    ;[-half, half].forEach((dx) => box(g, 0.18, 3.0, 0.3, cx + dx, Y + 1.5, zf, C.charcoal, 0.5, 0.4))
    box(g, doorW + 0.5, 0.5, 0.34, cx, Y + 3.15, zf, C.maroon, 0.6, 0.1)
    storefrontSign = kit.sign(signText, C.white, C.maroon, 512, 96)
    place(g, G.plane(2.8, 0.42), kit.basic(storefrontSign), cx, Y + 3.15, zf + 0.18, false)
    box(g, doorW + 0.8, 0.1, 0.9, cx, Y + 3.5, zf + 0.5, C.maroon, 0.6, 0.1)
    box(g, doorW - 0.4, 0.04, 1.6, cx, Y + 0.02, zf + 0.4, C.charcoal, 0.9, 0)
    for (let i = 0; i < 3; i += 1) {
      place(g, G.cylOpen(0.2, 0.15, 0.22, 14), kit.std(C.teal, 0.6, 0.1, { side: THREE.DoubleSide }), x0 + 2.0 + i * 3.4, Y + 0.11, zf - 0.9, false)
    }
  }

  function props(texts) {
    const group = (id) => {
      const pg = new THREE.Group()
      pg.position.set(ZONE_OFFSET[id][0], 0, ZONE_OFFSET[id][1])
      plates[id].add(pg)
      return pg
    }
    wallShelf(group('z-mold'), -2.4, 3.2, 1.2, 3)

    const prod = group('z-prod')
    buffingMachine(prod, 0.2, 23.8)
    box(prod, 1.0, 0.7, 0.8, 21.9, Y + 0.35, 20.6, C.grey, 0.4, 0.5)
    cyl(prod, 0.32, 0.32, 0.3, 21.9, Y + 0.85, 20.6, C.grey, 0.3, 0.8, 20)

    const recv = group('z-recv')
    cartonStack(recv, -2.2, 35.8)
    wallShelf(recv, 3.0, 30.7, 2.8, 2)

    const stock = group('z-stock')
    cartonStack(stock, 14.6, 30.0)
    cartonStack(stock, 40.6, 30.0)

    safeBox(group('z-mat'), 42.0, 20.7)

    const sales = group('z-sales')
    gondola(sales, 19.0, 48.1, 4.4)
    gondola(sales, 34.4, 48.1, 4.4)
    storefront(sales, 26.9, 50.0, 13.6, 40.3, ZONE_ACCENT['z-sales'], texts.storefront)
    wallShelf(sales, 21.0, 41.6, 3.2, 2)
    wallShelf(sales, 33.0, 41.6, 3.2, 2)
  }

  function build(texts) {
    SCENE_ZONES.forEach(base)
    props(texts)
  }

  function setStorefrontText(text) {
    if (storefrontSign) kit.setSignText(storefrontSign, text)
  }

  return { build, plates, frames, setStorefrontText }
}
