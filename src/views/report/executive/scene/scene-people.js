// scene-people.js — คนในโรงงาน (ช่างนั่งโต๊ะ, คนเดินในโซน, ลูกค้าเข้า-ออกร้าน)
// เป็นของประกอบฉากล้วน ไม่ผูกกับข้อมูล: จำนวนและเส้นทางคงที่ ไม่ได้แทนจำนวนคนจริง
import * as THREE from 'three'

import { TOPY } from './scene-kit.js'
import { C, PEOPLE, CUSTOMERS } from './scene-palette.js'
import { ZONE_BOUNDS, ZONE_OFFSET, STATION_BY_ID } from '../flow-layout.js'

const midRow = (a, b) => (STATION_BY_ID[a].pos[2] + STATION_BY_ID[b].pos[2]) / 2

// [โซน, เลนเดิน, ความเร็ว (หน่วยโลก/วินาที), index สีเสื้อ, จุดเริ่ม 0..1]; เลน 'front' = แนวหน้าโซน, ตัวเลข = ค่า z
const WALKS = () => [
  ['z-mold', 'front', 1.0, 0, 0.0],
  ['z-mold', midRow('m-design', 'm-store'), 1.2, 1, 0.5],
  ['z-mold', 'front', 0.9, 2, 0.5],
  ['z-prod', midRow('p-design', 'p-cost'), 1.1, 3, 0.0],
  ['z-prod', midRow('p-design', 'p-cost'), 1.3, 0, 0.5],
  ['z-prod', 'front', 1.0, 1, 0.0],
  ['z-prod', 'front', 1.2, 2, 0.5],
  ['z-recv', 'front', 1.0, 3, 0.0],
  ['z-recv', 'front', 0.8, 1, 0.5],
  ['z-stock', 'front', 1.1, 0, 0.0],
  ['z-stock', 'front', 0.9, 2, 0.5],
  ['z-stock', 'front', 1.3, 3, 0.25],
  ['z-mat', 'front', 0.9, 1, 0.0],
  ['z-sales', 'front', 1.0, 2, 0.0],
  ['z-sales', 'front', 0.8, 3, 0.5],
  ['z-sales', 'front', 1.2, 0, 0.25]
]

export function createPeople(kit, scene, reducedMotion) {
  const walkers = []
  const g = kit.geometry

  function makePerson(color, scale = 1.35) {
    const group = new THREE.Group()
    const skin = kit.std(C.roseLight, 0.7, 0.05)
    const cloth = kit.std(color, 0.7, 0.05)
    kit.place(group, g.cyl(0.2, 0.27, 0.78, 12), cloth, 0, 0.95, 0)
    kit.place(group, g.sph(0.2, 14, 12), skin, 0, 1.52, 0)
    kit.place(group, g.cap(0.215), kit.std(C.white, 0.7, 0.05), 0, 1.56, 0)
    const limb = (x, y, len, mat, r) => {
      const pivot = new THREE.Group()
      pivot.position.set(x, y, 0)
      kit.place(pivot, g.cyl(r, r, len, 8), mat, 0, -len / 2, 0)
      group.add(pivot)
      return pivot
    }
    const trousers = kit.std(C.charcoal, 0.7, 0.05)
    const lL = limb(-0.11, 0.6, 0.6, trousers, 0.09)
    const lR = limb(0.11, 0.6, 0.6, trousers, 0.09)
    const aL = limb(-0.3, 1.28, 0.55, cloth, 0.07)
    const aR = limb(0.3, 1.28, 0.55, cloth, 0.07)
    group.scale.setScalar(scale)
    return { g: group, lL, lR, aL, aR }
  }

  function addWalker(path, speed, color, phase, scale) {
    const p = makePerson(color, scale)
    const i0 = Math.floor((phase || 0) * path.length) % path.length
    p.g.position.set(path[i0][0], TOPY, path[i0][1])
    scene.add(p.g)
    if (!reducedMotion) walkers.push({ p, path, i: i0, speed, t: Math.random() * 6 })
  }

  function lane(zoneId, where) {
    const z = ZONE_BOUNDS[zoneId]
    const zz = where === 'front' ? z.z1 - (zoneId === 'z-mat' ? 0.9 : 0.95) : where
    return [
      [z.x0 + 1.6, zz],
      [z.x1 - 1.6, zz]
    ]
  }

  // ลูกค้า: เดินเข้าประตูร้าน วนดูตู้โชว์ แล้วเดินออก (ตู้โชว์อยู่ x = 19.0 / 34.4 ในพิกัดตั้งต้นของโซนงานขาย)
  function customerPaths() {
    const zs = ZONE_BOUNDS['z-sales']
    const ox = ZONE_OFFSET['z-sales'][0]
    const dx = (zs.x0 + zs.x1) / 2
    const z1 = zs.z1
    const door = (x) => [
      [x, z1 + 4.5],
      [x, z1 - 0.9]
    ]
    const back = (x) => [
      [x, z1 - 0.9],
      [x, z1 + 4.5]
    ]
    const loop = (x, a, b) => [...door(x), [a, z1 - 0.9], [a, z1 - 3.2], [b, z1 - 3.2], [b, z1 - 0.9], ...back(x)]
    return [loop(dx, 18 + ox, 24 + ox), loop(dx, 37 + ox, 31 + ox), loop(dx + 1, dx - 6, dx + 6)]
  }

  function build() {
    WALKS().forEach(([zone, where, speed, colorIdx, phase]) => addWalker(lane(zone, where), speed, PEOPLE[colorIdx % PEOPLE.length], phase))
    customerPaths().forEach((path, i) => {
      addWalker(path, 0.9 + i * 0.12, CUSTOMERS[i % CUSTOMERS.length], i * 0.33, 1.35)
      addWalker(path.slice().reverse(), 0.8, CUSTOMERS[(i + 2) % CUSTOMERS.length], 0.5 + i * 0.1, 1.35)
    })
  }

  function tick(dt) {
    walkers.forEach((w) => {
      const tgt = w.path[(w.i + 1) % w.path.length]
      const gp = w.p.g.position
      const dx = tgt[0] - gp.x
      const dz = tgt[1] - gp.z
      const dist = Math.sqrt(dx * dx + dz * dz)
      const step = w.speed * dt
      if (dist <= step) {
        gp.x = tgt[0]
        gp.z = tgt[1]
        w.i = (w.i + 1) % w.path.length
      } else {
        gp.x += (dx / dist) * step
        gp.z += (dz / dist) * step
        w.p.g.rotation.y = Math.atan2(dx, dz)
      }
      w.t += dt * w.speed * 5.2
      const swing = Math.sin(w.t) * 0.55
      w.p.lL.rotation.x = swing
      w.p.lR.rotation.x = -swing
      w.p.aL.rotation.x = -swing * 0.8
      w.p.aR.rotation.x = swing * 0.8
      gp.y = TOPY + Math.abs(Math.sin(w.t)) * 0.05
    })
  }

  return { makePerson, build, tick }
}
