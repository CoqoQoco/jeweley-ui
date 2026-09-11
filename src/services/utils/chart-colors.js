// chart-colors.js — ApexCharts hex color constants
//
// mirror จาก src/assets/scss/variable.scss — ต้อง sync กันเสมอ
// (apexcharts อ่าน CSS var ไม่ได้ ต้องใช้ hex ตรงๆ)
// rose-gold (--rose-gold-light/-dark) สงวนไว้ให้ --nav-active-gradient เท่านั้น ห้ามใช้เป็นสีกราฟ
export const CHART_TOKENS = {
  primary: '#921313', // --base-font-color
  green: '#038387', // --base-green
  warning: '#fabc3f', // --base-warning
  red: '#ff4d4d', // --base-red
  sub: '#393939', // --base-sub-color
  border: '#e0e0e0' // --color-border
}

// palette เริ่มต้นสำหรับ categorical chart (donut/bar หลายชุด)
export const CHART_PALETTE = [
  CHART_TOKENS.primary,
  CHART_TOKENS.green,
  CHART_TOKENS.warning,
  CHART_TOKENS.red,
  CHART_TOKENS.sub
]
