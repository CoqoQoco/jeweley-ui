// scene-palette.js — สีของฉาก Flow 3D (ใช้เฉพาะสีที่มีใน variable.scss / design-system.md)
// three.js อ่านค่า CSS var ไม่ได้และแอปไม่มี dark mode จึงเก็บเป็นค่าคงที่ที่นี่ที่เดียว

export const C = {
  maroon: '#921313',
  maroonDeep: '#360505',
  teal: '#038387',
  tealPale: '#e6f4f4',
  grey: '#e0e0e0',
  charcoal: '#393939',
  amber: '#fabc3f',
  red: '#ff4d4d',
  roseLight: '#edc2b3',
  roseDark: '#c97f6d',
  sand: '#dad4b5',
  mint: '#b5dad4',
  white: '#ffffff'
}

// role ของวัสดุ → สี + ความหยาบ/โลหะ (ใช้กับพื้น แท่นสถานี แท่งข้อมูล)
export const ROLES = {
  pad: { color: C.white, rough: 0.5, metal: 0.12 },
  dark: { color: C.maroonDeep, rough: 0.7, metal: 0.25 },
  b1: { color: C.maroon, rough: 0.32, metal: 0.18 },
  b2: { color: C.roseDark, rough: 0.42, metal: 0.12 },
  b3: { color: C.roseLight, rough: 0.6, metal: 0.06 },
  warn: { color: C.amber, rough: 0.34, metal: 0.25 },
  zt1: { color: C.tealPale, rough: 0.88, metal: 0 },
  zt2: { color: C.sand, rough: 0.88, metal: 0 },
  zt3: { color: C.grey, rough: 0.88, metal: 0 },
  plinth: { color: C.charcoal, rough: 0.9, metal: 0 },
  belt: { color: C.charcoal, rough: 0.8, metal: 0.2 }
}

// สีแถบประจำโซน (ขอบพื้นโซน + แถบผนัง)
export const ZONE_ACCENT = {
  'z-mold': C.teal,
  'z-prod': C.maroon,
  'z-recv': C.mint,
  'z-stock': C.charcoal,
  'z-mat': C.amber,
  'z-sales': C.roseDark
}

export const PEOPLE = [C.maroon, C.teal, C.roseDark, C.charcoal]
export const CUSTOMERS = [C.roseLight, C.mint, C.sand, C.white, C.amber]

export const ALERT_COLOR = { fail: C.red, warn: C.amber }

export const LIGHTS = { hemiSky: 0xffffff, hemiGround: 0xe0e0e0, hemi: 0.75, sun: 0xffffff, sunI: 0.75, rim: 0xe6f4f4, rimI: 0.15 }
