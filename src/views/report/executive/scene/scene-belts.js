// scene-belts.js — สายพาน + ถาดชิ้นงานที่วิ่งบนสายพาน + ประตู A/B/C
// ถาดบนสายพานเป็นภาพประกอบบอกทิศทางงาน จำนวนถาดขึ้นกับความยาวสายพานเท่านั้น ไม่ได้แทนปริมาณงานจริง
import * as THREE from 'three'

import { TOPY } from './scene-kit.js'
import { C } from './scene-palette.js'
import { BELTS, GATES } from '../flow-layout.js'

export function createBelts(kit, scene, reducedMotion) {
  const G = kit.geometry
  const trays = []

  function addTray(lane, len, q, count) {
    const tray = new THREE.Group()
    kit.place(tray, G.box(0.62, 0.06, 0.42), kit.std(C.white, 0.6, 0.1), 0, 0.2, 0)
    kit.place(tray, G.box(0.3, 0.14, 0.24), kit.std(q % 2 ? C.maroon : C.teal, 0.6, 0.05), -0.1, 0.3, 0)
    const ring = kit.place(tray, G.torus(0.07, 0.025, 8, 16), kit.std(C.amber, 0.25, 0.9), 0.16, 0.3, 0)
    ring.rotation.x = Math.PI / 2
    lane.add(tray)
    const item = { tray, len, off: (q + 0.5) / count }
    tray.position.x = -len / 2 + 0.6 + item.off * (len - 1.2)
    trays.push(item)
  }

  function addBelt([x1, z1, x2, z2]) {
    const dx = x2 - x1
    const dz = z2 - z1
    const len = Math.sqrt(dx * dx + dz * dz)
    if (len < 0.2) return
    const lane = new THREE.Group()
    lane.position.set((x1 + x2) / 2, TOPY, (z1 + z2) / 2)
    lane.rotation.y = Math.atan2(-dz, dx)
    kit.place(lane, G.box(len, 0.14, 1.0), kit.role('belt'), 0, 0.04, 0)
    ;[-len / 2, len / 2].forEach((e) => kit.place(lane, G.cyl(0.5, 0.5, 0.14, 20), kit.role('belt'), e, 0.04, 0, false))
    const surface = kit.place(lane, G.plane(len, 0.72), kit.basic(kit.beltTexture(len)), 0, 0.12, 0, false)
    surface.rotation.x = -Math.PI / 2
    const count = Math.max(1, Math.floor(len / 3.2))
    for (let q = 0; q < count; q += 1) addTray(lane, len, q, count)
    scene.add(lane)
  }

  function addGate({ pos, rot }) {
    const gate = new THREE.Group()
    gate.position.set(pos[0], TOPY, pos[1])
    gate.rotation.y = rot
    kit.place(gate, G.torus(2.6, 0.18, 14, 40, Math.PI), kit.std(C.amber, 0.4, 0.5), 0, 0.2, 0)
    ;[-2.6, 2.6].forEach((x) => kit.place(gate, G.cyl(0.2, 0.24, 0.3, 14), kit.std(C.sand, 0.6, 0.2), x, 0.15, 0, false))
    scene.add(gate)
  }

  function build() {
    BELTS.forEach(addBelt)
    GATES.forEach(addGate)
  }

  function tick(dt) {
    if (reducedMotion) return
    trays.forEach((b) => {
      b.off = (b.off + (dt * 0.9) / b.len) % 1
      b.tray.position.x = -b.len / 2 + 0.6 + b.off * (b.len - 1.2)
    })
  }

  return { build, tick }
}
