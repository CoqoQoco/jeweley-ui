// อ่าน design token สดจาก src/assets/scss/variable.scss (ไม่ hardcode → ไม่ drift)
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// tools/design-system-mcp/src/ -> ../../../src/assets/scss/variable.scss
export const VARIABLE_SCSS = resolve(__dirname, '../../../src/assets/scss/variable.scss')

// จัดกลุ่ม CSS custom property ตาม prefix → group
function groupOf(name) {
  if (name.startsWith('--sp-')) return 'spacing'
  if (name.startsWith('--radius-')) return 'radius'
  if (name.startsWith('--shadow-')) return 'shadow'
  if (name.startsWith('--fs-') || name.startsWith('--lh-')) return 'typography'
  if (
    name.startsWith('--base-') ||
    name.startsWith('--color-')
  ) {
    if (name === '--base-font-size') return 'typography'
    return 'colors'
  }
  return 'other'
}

/**
 * Parse variable.scss → { groups: { colors, spacing, radius, shadow, typography }, raw }
 * ดึงจากบล็อก :root { --name: value; } เป็นหลัก (canonical CSS vars)
 */
export async function parseTokens(scssPath = VARIABLE_SCSS) {
  const text = await readFile(scssPath, 'utf8')

  const groups = {
    colors: {},
    spacing: {},
    radius: {},
    shadow: {},
    typography: {},
    other: {}
  }

  // เฉพาะภายในบล็อก :root { ... }
  const rootMatch = text.match(/:root\s*\{([\s\S]*?)\}/)
  const rootBody = rootMatch ? rootMatch[1] : text

  const varRe = /(--[a-z0-9-]+)\s*:\s*([^;]+);/gi
  let m
  while ((m = varRe.exec(rootBody)) !== null) {
    const name = m[1].trim()
    const value = m[2].trim()
    const g = groupOf(name)
    groups[g][name] = value
  }

  return {
    source: scssPath,
    groups
  }
}

const VALID_GROUPS = ['colors', 'spacing', 'radius', 'shadow', 'typography']

export async function getTokens(group) {
  const { groups, source } = await parseTokens()
  if (group && VALID_GROUPS.includes(group)) {
    return { source, group, tokens: groups[group] }
  }
  // ทั้งหมด (ตัด other ที่ไม่ใช่ token หลักออก)
  const all = {}
  for (const g of VALID_GROUPS) Object.assign(all, { [g]: groups[g] })
  return { source, group: 'all', tokens: all }
}

/**
 * validate ว่า value ที่ส่งมา "ตรง token" หรือไม่ (สะท้อน guardrail ห้าม hardcode)
 * kind: 'color' | 'spacing' | 'radius'
 */
export async function validateValue(kind, value) {
  const { groups } = await parseTokens()
  const norm = String(value).trim().toLowerCase()

  const map = { color: 'colors', spacing: 'spacing', radius: 'radius' }
  const g = map[kind]
  if (!g) {
    return { ok: false, kind, value, reason: `kind ไม่รองรับ: ${kind} (ใช้ color|spacing|radius)` }
  }

  const entries = Object.entries(groups[g])
  const hit = entries.find(([, v]) => v.trim().toLowerCase() === norm)
  if (hit) {
    return {
      ok: true,
      kind,
      value,
      token: hit[0],
      suggestion: `ใช้ var(${hit[0]})`
    }
  }
  return {
    ok: false,
    kind,
    value,
    reason: `ค่า "${value}" ไม่ตรง token ใดในกลุ่ม ${g} — ห้าม hardcode, ใช้ token ที่มีอยู่`,
    allowed: Object.fromEntries(entries)
  }
}
