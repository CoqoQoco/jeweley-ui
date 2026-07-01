// self-test ของ core logic (ไม่ต้องพึ่ง MCP SDK) — ตรวจว่า parser/validate ทำงานตรงกับ variable.scss
import assert from 'node:assert/strict'
import { getTokens, validateValue } from './src/parse-tokens.js'
import { COMPONENTS } from './src/data.js'

let failed = 0
const check = async (label, fn) => {
  try {
    await fn()
    console.log(`✓ ${label}`)
  } catch (e) {
    failed++
    console.error(`✗ ${label}\n   ${e.message}`)
  }
}

await check('get_design_tokens(colors) → --base-font-color = #921313', async () => {
  const { tokens } = await getTokens('colors')
  assert.equal(tokens['--base-font-color'], '#921313')
})

await check('get_design_tokens(spacing) → --sp-lg = 16px', async () => {
  const { tokens } = await getTokens('spacing')
  assert.equal(tokens['--sp-lg'], '16px')
})

await check('validate_value(color, #921313) → ผ่าน + suggest var(--base-font-color)', async () => {
  const r = await validateValue('color', '#921313')
  assert.equal(r.ok, true)
  assert.equal(r.token, '--base-font-color')
})

await check('validate_value(color, #123456) → ไม่ผ่าน', async () => {
  const r = await validateValue('color', '#123456')
  assert.equal(r.ok, false)
})

await check('validate_value(radius, 8px) → ผ่าน (--radius-md)', async () => {
  const r = await validateValue('radius', '8px')
  assert.equal(r.ok, true)
  assert.equal(r.token, '--radius-md')
})

await check('list_components → 26 ตัว', async () => {
  assert.equal(COMPONENTS.length, 26)
})

console.log(failed === 0 ? '\nALL PASS' : `\n${failed} FAILED`)
process.exit(failed === 0 ? 0 : 1)
