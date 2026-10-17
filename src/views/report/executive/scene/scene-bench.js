// scene-bench.js — โต๊ะช่าง/เครื่องมือประจำสถานี + ตู้วัตถุดิบ + ตู้คลังสินค้า (ส่วนที่ไม่ผูกข้อมูล)
// ของบนโต๊ะ (เครื่องมือ, อัญมณี, ช่างนั่ง) เป็นภาพประกอบบอกว่าสถานีทำอะไร ไม่ได้แทนปริมาณงาน
import * as THREE from 'three'

import { TOPY } from './scene-kit.js'
import { C, PEOPLE } from './scene-palette.js'

// สถานี → ชุดเครื่องมือบนโต๊ะ
const BENCH_KIND = {
  'm-design': 'cad',
  'm-resin': 'printer',
  'm-silver': 'wax',
  'm-trim': 'trim',
  'm-cut': 'cut',
  'm-store': 'store',
  'm-melt': 'melt',
  'p-design': 'design',
  'p-trim': 'trim',
  'p-raw': 'raw',
  'p-gem': 'gem',
  'p-set': 'set',
  'p-plate': 'plate',
  'p-cost': 'cost',
  recv: 'recv',
  'sale-quote': 'doc',
  'sale-so': 'doc',
  'sale-inv': 'doc',
  'sale-pay': 'doc'
}

const GEM_COLORS = [C.red, C.mint, C.amber, C.roseLight, C.teal, C.roseDark]
const CABINET = { W: 3.0, D: 1.5, H: 4.2, base: 0.15 }

export function createBench(kit, people) {
  const G = kit.geometry
  const { boxAt: box, cylAt: cyl, place } = kit
  const Y = TOPY
  let workerIdx = 0

  const screenMat = (color) => kit.std(C.maroonDeep, 0.3, 0, { emissive: color, emissiveIntensity: 0.9 })
  const gemMat = (color, ei = 0.35) => kit.std(color, 0.1, 0.1, { emissive: color, emissiveIntensity: ei, flatShading: true })

  function ringJewel(g, x, y, z, metal, gem, s = 1) {
    const grp = new THREE.Group()
    grp.position.set(x, y, z)
    place(grp, G.torus(0.16 * s, 0.04 * s, 10, 24), kit.std(metal || C.amber, 0.25, 0.9), 0, 0.16 * s, 0)
    if (gem) place(grp, G.octa(0.075 * s), gemMat(gem), 0, 0.36 * s, 0)
    g.add(grp)
    return grp
  }

  function seatedPerson(g, x, z, color) {
    const p = people.makePerson(color, 1.35)
    p.g.position.set(x, Y - 0.3, z)
    p.lL.rotation.x = -1.3
    p.lR.rotation.x = -1.3
    p.aL.rotation.x = -1.05
    p.aR.rotation.x = -1.05
    g.add(p.g)
    cyl(g, 0.3, 0.3, 0.1, x, Y + 0.48, z, C.maroon, 0.8, 0.1, 16)
    cyl(g, 0.05, 0.05, 0.5, x, Y + 0.22, z, C.charcoal, 0.5, 0.6, 8)
  }

  function benchTools(g, x, z, kind) {
    const T = Y + 0.9
    const mon = (cx, cz, col = C.teal) => {
      place(g, G.box(0.8, 0.5, 0.05), screenMat(col), cx, T + 0.5, cz)
      box(g, 0.06, 0.25, 0.06, cx, T + 0.15, cz, C.charcoal, 0.5, 0.5)
    }
    switch (kind) {
      case 'design':
        box(g, 0.7, 0.03, 0.5, x - 0.5, T + 0.02, z + 0.12, C.white, 0.9, 0)
        box(g, 0.5, 0.02, 0.03, x - 0.5, T + 0.05, z + 0.1, C.maroon, 0.5, 0.2)
        ringJewel(g, x + 0.3, T - 0.03, z + 0.1, C.grey, C.mint, 1.0)
        break
      case 'trim':
        box(g, 0.5, 0.05, 0.1, x - 0.3, T + 0.03, z + 0.2, C.grey, 0.3, 0.8)
        box(g, 0.14, 0.05, 0.35, x - 0.6, T + 0.03, z + 0.15, C.roseDark, 0.5, 0.2)
        ringJewel(g, x + 0.35, T - 0.03, z + 0.05, C.amber, null, 1.1)
        break
      case 'raw':
        cyl(g, 0.28, 0.28, 0.1, x - 0.45, T + 0.06, z + 0.1, C.grey, 0.3, 0.8, 28)
        box(g, 0.1, 0.2, 0.1, x - 0.45, T - 0.02, z + 0.1, C.charcoal, 0.5, 0.5)
        ringJewel(g, x + 0.4, T - 0.03, z + 0.15, C.amber, null, 1.0)
        break
      case 'gem':
        box(g, 0.9, 0.04, 0.5, x - 0.2, T + 0.02, z + 0.12, C.charcoal, 0.6, 0.1)
        GEM_COLORS.forEach((cl, k) => place(g, G.octa(0.07), gemMat(cl), x - 0.52 + (k % 3) * 0.28, T + 0.1, z + 0.02 + Math.floor(k / 3) * 0.22))
        break
      case 'set': {
        box(g, 0.4, 0.06, 0.4, x - 0.5, T + 0.03, z + 0.1, C.charcoal, 0.4, 0.5)
        const tube = place(g, G.cyl(0.1, 0.14, 0.7, 16), kit.std(C.grey, 0.3, 0.7), x - 0.5, T + 0.45, z)
        tube.rotation.x = 0.35
        ringJewel(g, x + 0.25, T - 0.03, z + 0.1, C.amber, C.red, 1.2)
        box(g, 0.04, 0.02, 0.4, x + 0.6, T + 0.02, z + 0.15, C.grey, 0.2, 0.9)
        break
      }
      case 'plate':
        ;[-0.55, 0.15].forEach((dx, k) => {
          place(g, G.box(0.6, 0.45, 0.5), kit.std(C.tealPale, 0.1, 0.1, { transparent: true, opacity: 0.55 }), x + dx, T + 0.22, z + 0.15)
          place(g, G.box(0.54, 0.05, 0.44), kit.glow(k ? C.amber : C.teal, 0.6), x + dx, T + 0.34, z + 0.15)
        })
        box(g, 0.05, 0.5, 0.05, x + 0.65, T + 0.25, z + 0.15, C.charcoal, 0.5, 0.5)
        box(g, 0.4, 0.04, 0.05, x + 0.5, T + 0.5, z + 0.15, C.charcoal, 0.5, 0.5)
        ringJewel(g, x + 0.4, T - 0.03, z + 0.28, C.amber, null, 0.8)
        break
      case 'cost':
        box(g, 0.5, 0.1, 0.4, x - 0.5, T + 0.03, z + 0.15, C.grey, 0.3, 0.7)
        cyl(g, 0.17, 0.17, 0.04, x - 0.5, T + 0.1, z + 0.15, C.white, 0.3, 0.6, 20)
        mon(x + 0.35, z - 0.05, C.amber)
        box(g, 0.35, 0.02, 0.25, x + 0.3, T, z + 0.3, C.white, 0.9, 0)
        break
      case 'cad':
        mon(x - 0.25, z - 0.05, C.teal)
        kit.spin(place(g, G.octa(0.14), kit.std(C.tealPale, 0.1, 0.1, { emissive: C.mint, emissiveIntensity: 0.9, flatShading: true }), x - 0.25, T + 0.55, z + 0.05))
        box(g, 0.35, 0.03, 0.2, x + 0.4, T, z + 0.2, C.charcoal, 0.5, 0.3)
        break
      case 'printer':
        box(g, 0.9, 0.35, 0.7, x - 0.2, T + 0.18, z + 0.1, C.white, 0.4, 0.3)
        place(g, G.box(0.85, 0.7, 0.65), kit.std(C.tealPale, 0.1, 0.1, { transparent: true, opacity: 0.35 }), x - 0.2, T + 0.7, z + 0.1)
        place(g, G.cyl(0.22, 0.22, 0.1, 20), kit.glow(C.amber, 0.8, true), x - 0.2, T + 0.42, z + 0.1)
        kit.gem(g, x - 0.2, T + 0.75, z + 0.1, C.amber, 0.14)
        break
      case 'wax':
        box(g, 0.8, 0.7, 0.6, x - 0.3, T + 0.35, z + 0.1, C.white, 0.4, 0.4)
        cyl(g, 0.22, 0.22, 0.5, x - 0.3, T + 0.95, z + 0.1, C.grey, 0.3, 0.6, 18)
        place(g, G.sph(0.05, 10, 8), kit.glow(C.amber, 1.0, true), x + 0.05, T + 0.45, z + 0.42)
        break
      case 'cut':
        box(g, 0.7, 0.18, 0.5, x - 0.3, T + 0.09, z + 0.15, C.roseDark, 0.8, 0)
        box(g, 0.7, 0.18, 0.5, x - 0.3, T + 0.27, z + 0.15, C.roseLight, 0.8, 0)
        box(g, 0.45, 0.03, 0.06, x + 0.4, T + 0.03, z + 0.2, C.grey, 0.2, 0.9)
        break
      case 'store':
        box(g, 0.5, 0.35, 0.4, x - 0.5, T + 0.18, z + 0.1, C.sand, 0.9, 0)
        box(g, 0.5, 0.35, 0.4, x - 0.5, T + 0.53, z + 0.1, C.grey, 0.9, 0)
        box(g, 0.45, 0.3, 0.4, x + 0.25, T + 0.15, z + 0.12, C.sand, 0.9, 0)
        break
      case 'melt':
        cyl(g, 0.3, 0.36, 0.5, x - 0.3, T + 0.25, z + 0.1, C.charcoal, 0.8, 0.3, 20)
        place(g, G.cyl(0.2, 0.2, 0.06, 18), kit.glow(C.red, 1.2, true), x - 0.3, T + 0.52, z + 0.1)
        box(g, 0.3, 0.3, 0.3, x + 0.4, T + 0.15, z + 0.2, C.grey, 0.4, 0.5)
        break
      case 'recv':
        cyl(g, 0.28, 0.3, 0.14, x - 0.5, T + 0.07, z + 0.15, C.grey, 0.3, 0.7, 24)
        box(g, 0.3, 0.1, 0.06, x - 0.5, T + 0.2, z + 0.1, C.teal, 0.3, 0.2, { emissive: C.teal, emissiveIntensity: 0.6 })
        box(g, 0.45, 0.35, 0.4, x + 0.3, T + 0.18, z + 0.1, C.sand, 0.9, 0)
        ringJewel(g, x + 0.3, T + 0.35, z + 0.1, C.amber, C.red, 0.7)
        break
      default:
        mon(x - 0.35, z - 0.05, C.teal)
        box(g, 0.4, 0.1, 0.3, x + 0.35, T + 0.05, z + 0.2, C.white, 0.9, 0)
        box(g, 0.4, 0.04, 0.3, x + 0.4, T + 0.12, z + 0.22, C.tealPale, 0.9, 0)
        ringJewel(g, x - 0.3, T - 0.03, z + 0.3, C.amber, C.red, 0.8)
        break
    }
  }

  function jewelerBench(g, x, z, kind, color) {
    box(g, 2.0, 0.1, 0.9, x, Y + 0.85, z, C.sand, 0.6, 0.1)
    ;[
      [-0.9, -0.38],
      [0.9, -0.38],
      [-0.9, 0.38],
      [0.9, 0.38]
    ].forEach(([ox, oz]) => box(g, 0.08, 0.8, 0.08, x + ox, Y + 0.4, z + oz, C.charcoal, 0.7, 0.1))
    box(g, 2.0, 0.28, 0.06, x, Y + 0.7, z + 0.42, C.roseDark, 0.7, 0.1)
    const pin = place(g, G.halfRound(0.34, 0.06, 20), kit.std(C.tealPale, 0.8, 0), x, Y + 0.93, z - 0.3)
    pin.rotation.y = Math.PI
    cyl(g, 0.05, 0.05, 0.9, x + 0.8, Y + 1.35, z - 0.25, C.charcoal, 0.5, 0.6, 8)
    const shade = place(g, G.cone(0.2, 0.26, 16, true), kit.std(C.white, 0.6, 0.2, { side: THREE.DoubleSide }), x + 0.62, Y + 1.78, z - 0.25)
    shade.rotation.z = 0.6
    place(g, G.sph(0.07, 10, 8), kit.glow(C.amber, 1.0), x + 0.66, Y + 1.7, z - 0.25)
    const loupe = place(g, G.torus(0.1, 0.02, 8, 18), kit.std(C.charcoal, 0.4, 0.6), x - 0.55, Y + 0.95, z + 0.1)
    loupe.rotation.x = Math.PI / 2
    benchTools(g, x, z, kind)
    seatedPerson(g, x, z - 0.8, color)
  }

  // ตู้เหล็ก 4.2 สูง: ใช้ทั้งตู้วัตถุดิบ (ภาพประกอบ) และตู้คลังสินค้า (มีแท่งระดับเติมบนบานตู้แยกต่างหาก)
  function cabinetShell(g) {
    const { W, D, H, base } = CABINET
    const fz = D / 2 + 0.03
    box(g, W, base, D, 0, base / 2, 0, C.charcoal, 0.6, 0.3)
    box(g, W, H, D, 0, base + H / 2, 0, C.grey, 0.7, 0.15)
    box(g, W + 0.1, 0.12, D + 0.1, 0, base + H + 0.06, 0, C.charcoal, 0.5, 0.4)
    box(g, W - 0.2, H - 0.2, 0.04, 0, base + H / 2, fz, C.white, 0.8, 0.05)
    for (let k = 1; k < 12; k += 1) box(g, W - 0.2, 0.025, 0.1, 0, base + 0.1 + k * 0.35, fz + 0.03, C.grey, 0.5, 0.3)
    return fz
  }

  // ตู้คลังสินค้า: ส่วนโครงสร้างคงที่ (แท่งระดับเติมอยู่ใน scene-decor เพราะผูกข้อมูล)
  function stockCabinet(g) {
    const { W, base } = CABINET
    const fz = cabinetShell(g)
    for (let j = 0; j < 12; j += 1) box(g, 0.5, 0.05, 0.1, 0, base + 0.1 + j * 0.35 + 0.17, fz + 0.06, C.charcoal, 0.4, 0.6)
    return { W, fz }
  }

  // ตู้วัตถุดิบ (ทอง/พลอย): ภาพประกอบ ไม่ผูกปริมาณสต็อก
  function materialCabinet(g, id) {
    const { W, base } = CABINET
    const fz = cabinetShell(g)
    const goldStock = id === 'mat-gold'
    ;[1.0, 2.5].forEach((yy) => {
      box(g, W - 0.3, 0.3, 0.06, 0, base + yy, fz + 0.7, C.charcoal, 0.5, 0.4)
      box(g, W - 0.3, 0.06, 0.7, 0, base + yy - 0.12, fz + 0.38, C.charcoal, 0.5, 0.4)
      if (goldStock) {
        for (let r = 0; r < 3; r += 1) for (let i = 0; i < 4 - r; i += 1) box(g, 0.5, 0.12, 0.26, -0.9 + r * 0.25 + i * 0.55, base + yy - 0.03 + r * 0.13, fz + 0.4, C.amber, 0.25, 0.95)
      } else {
        GEM_COLORS.forEach((cl, j) => place(g, G.octa(0.12), gemMat(cl), -0.9 + j * 0.36, base + yy + 0.04, fz + 0.4))
      }
    })
  }

  // ฐานของสถานี: พรมรอง + โต๊ะช่าง (หรือตู้) — คืน mesh พรมไว้สลับเป็นแบบโปร่งเมื่อสถานีถูกระงับ
  function buildStation(group, st) {
    const rug = place(group, G.slab(4.3, 3.3, 0.5, 0.12, 0.02), kit.role('pad'), 0, 0, 0, false)
    if (st.kind === 'stockPad') stockCabinet(group)
    else if (st.kind === 'mat') materialCabinet(group, st.id)
    else {
      const wg = new THREE.Group()
      wg.scale.setScalar(1.3)
      wg.position.y = -TOPY * 1.3
      group.add(wg)
      jewelerBench(wg, 0.55, 0.7, BENCH_KIND[st.id] || 'doc', PEOPLE[workerIdx % PEOPLE.length])
      workerIdx += 1
    }
    return { rug }
  }

  return { buildStation, ringJewel, cabinet: CABINET }
}
