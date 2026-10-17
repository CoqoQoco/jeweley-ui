// scene-decor.js — ส่วนของสถานีที่ผูกกับข้อมูลจริง (แท่งความสูง, ระดับเติมตู้คลัง) + ไฟเตือน
// รับ decor/alert จาก model ที่ engine ได้ใน update() ไม่คิดตัวเลขใหม่: สเกลความสูงอยู่ที่นี่ที่เดียว
import * as THREE from 'three'

import { TOPY } from './scene-kit.js'
import { C, ALERT_COLOR } from './scene-palette.js'

export const HS = 0.0042 // สเกลความสูงของแท่งแม่พิมพ์ (ต่อ 1 งาน)
export const PROD_SCALE = 0.00042 // สเกลความสูงของแท่งผลิต (ต่อ 1 ชิ้น)
export const SALES_SCALE = 0.03 // สเกลความสูงของแท่งงานขาย (ต่อ 1 ใบ)
const BAR_ROLES = ['b1', 'b2', 'b3', 'warn']
const DEFAULT_TOP = 1.6

export function createDecor(kit, cabinet) {
  const G = kit.geometry

  // แท่งทรงกระบอกซ้อนสีตามช่วงอายุ/สถานะ; คืนความสูงยอด (ในพิกัดสถานี)
  function stack(group, x, z, w, d, segs, scale, dyn) {
    const bar = new THREE.Group()
    bar.position.set(x, 0.4, z)
    group.add(bar)
    dyn.push(bar)
    const r = (Math.min(w, d) / 2) * 0.86
    let y = 0
    segs.forEach(([value, role]) => {
      const h = value * scale
      if (h <= 0.001) return
      const m = kit.place(bar, G.cyl(r, r, 1, 32), kit.role(role), 0, y + h / 2, 0)
      m.scale.y = h
      y += h
    })
    if (y > 0.25) {
      const ring = kit.place(bar, G.torus(r * 1.02, 0.07, 10, 36), kit.std(C.amber, 0.3, 0.8), 0, y + 0.02, 0)
      ring.rotation.x = Math.PI / 2
    }
    kit.grow(bar)
    return 0.4 + y
  }

  function beacon(group, x, z, color, dyn) {
    const grp = new THREE.Group()
    grp.position.set(x, -TOPY, z)
    kit.cylAt(grp, 0.06, 0.06, 1.5, 0, TOPY + 1.05, 0, C.charcoal, 0.5, 0.5, 10)
    kit.cylAt(grp, 0.2, 0.22, 0.12, 0, TOPY + 0.32, 0, C.charcoal, 0.5, 0.5, 14)
    kit.place(grp, G.sph(0.36, 16, 12), kit.glow(color, 1.8, true), 0, TOPY + 1.9, 0)
    const halo = kit.place(grp, G.torus(0.6, 0.06, 8, 28), kit.glow(color, 1.4, true), 0, TOPY + 1.9, 0)
    halo.rotation.x = Math.PI / 2
    group.add(grp)
    dyn.push(grp)
  }

  function stockFill(group, value, max, selected, dyn) {
    const { W, base, D } = cabinet
    const h = Math.max(0.12, max > 0 ? (4.0 * value) / max : 0.12)
    const m = kit.place(group, G.box(W - 0.2, 1, 0.07), kit.std(selected ? C.amber : C.maroon, 0.55, 0.1), 0, base + 0.1 + h / 2, D / 2 + 0.03 + 0.015)
    m.scale.y = h
    dyn.push(m)
    return 0.15 + 4.2 + 0.3
  }

  // สร้างส่วนที่ผูกข้อมูลของสถานี; คืนความสูงยอดไว้วางป้าย
  function build(group, st, dyn) {
    const d = st.decor
    let top = DEFAULT_TOP
    switch (d.type) {
      case 'prod': {
        top = Math.max(stack(group, -1.55, 0.15, 1.2, 1.2, d.segs.map((v, k) => [v, BAR_ROLES[k]]), PROD_SCALE, dyn), 0.5)
        for (let i = 0; i < d.cubes; i += 1) {
          const ball = kit.sphAt(group, 0.24, 2.0, 0.4 + 0.25 + i * 0.5, 1.0, i % 2 ? C.amber : C.white, 0.5, 0.2)
          dyn.push(ball)
        }
        break
      }
      case 'mold': {
        top = Math.max(stack(group, -1.5, 0.15, 1.3, 1.3, [[Math.max(0, d.open - d.stale), 'b1'], [d.stale, 'warn']], HS, dyn), 0.5)
        if (d.open === 0) dyn.push(kit.cylAt(group, 0.9, 0.9, 0.08, 0, 0.44, 0, C.amber, 0.6, 0.2))
        break
      }
      case 'matGold':
      case 'matGem':
        top = 4.6
        break
      case 'recv': {
        const arch = kit.place(group, G.torus(1.4, 0.13, 12, 36, Math.PI), kit.std(C.amber, 0.4, 0.6), 0, 0.5, -1.0)
        dyn.push(arch)
        dyn.push(kit.cylAt(group, 0.13, 0.13, 0.55, -1.4, 0.28, -1.0, C.sand, 0.6, 0.2, 12))
        dyn.push(kit.cylAt(group, 0.13, 0.13, 0.55, 1.4, 0.28, -1.0, C.sand, 0.6, 0.2, 12))
        for (let i = 0; i < 3; i += 1) dyn.push(kit.sphAt(group, 0.28, -0.7 + i * 0.7, 0.4 + 0.28, 0.8, i === 1 ? C.amber : C.white, 0.5, 0.2))
        top = 2.2
        break
      }
      case 'sales':
        top = Math.max(stack(group, 0, 0, 1.8, 1.4, [[d.value, d.role]], SALES_SCALE, dyn), 0.8)
        break
      case 'hold':
        top = 0.9
        break
      case 'stockPad':
        top = stockFill(group, d.value, d.max, d.selected, dyn)
        break
      default:
        break
    }
    if (st.alert) beacon(group, st.kind === 'mat' || st.kind === 'stockPad' ? 1.9 : 1.95, -1.3, ALERT_COLOR[st.alert], dyn)
    return TOPY + top + 0.6
  }

  function clear(dyn) {
    dyn.forEach((o) => o.removeFromParent())
    dyn.length = 0
  }

  return { build, clear }
}
