// node --test scripts/check-golden.nodetest.mjs  (ชื่อ .nodetest.mjs เพื่อไม่ให้ vitest หยิบไป)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { checkGolden } from './check-golden.mjs'

function fixture(files, cfg) {
  const root = mkdtempSync(join(tmpdir(), 'golden-'))
  mkdirSync(join(root, 'e2e'))
  for (const [n, c] of Object.entries(files)) {
    const p = join(root, 'e2e', n)
    mkdirSync(dirname(p), { recursive: true })
    writeFileSync(p, c)
  }
  writeFileSync(join(root, 'e2e', 'golden.json'), JSON.stringify(cfg))
  return root
}
const codes = (r) => r.problems.map((p) => p.slice(0, 2))

test('ผ่านเมื่อทุกอย่างครบ', () => {
  const root = fixture({ 'a.spec.js': 'test()', 'b.spec.js': '' }, { golden: ['a.spec.js'], excluded: { 'b.spec.js': 'x' } })
  try { assert.deepEqual(checkGolden(root).problems, []) } finally { rmSync(root, { recursive: true }) }
})
test('R1 spec ไม่ถูกจัดกลุ่ม', () => {
  const root = fixture({ 'a.spec.js': '', 'c.spec.js': '' }, { golden: ['a.spec.js'], excluded: {} })
  try {
    const r = checkGolden(root)
    assert.deepEqual(codes(r), ['R1'])
    assert.match(r.problems[0], /c\.spec\.js/)
  } finally { rmSync(root, { recursive: true }) }
})
test('R2 ชื่อที่ไม่มีไฟล์', () => {
  const root = fixture({ 'a.spec.js': '' }, { golden: ['a.spec.js', 'ghost.spec.js'], excluded: { 'gone.spec.js': 'x' } })
  try {
    const r = checkGolden(root)
    assert.deepEqual(codes(r), ['R2', 'R2'])
  } finally { rmSync(root, { recursive: true }) }
})
test('R3 อยู่ทั้งสองฝั่ง', () => {
  const root = fixture({ 'a.spec.js': '' }, { golden: ['a.spec.js'], excluded: { 'a.spec.js': 'x' } })
  try { assert.deepEqual(codes(checkGolden(root)), ['R3']) } finally { rmSync(root, { recursive: true }) }
})
test('R4 เหตุผลว่าง', () => {
  const root = fixture({ 'b.spec.js': '' }, { golden: [], excluded: { 'b.spec.js': '  ' } })
  try { assert.deepEqual(codes(checkGolden(root)), ['R4']) } finally { rmSync(root, { recursive: true }) }
})
test('R5 golden มี test.fail/skip/fixme/only พร้อมเลขบรรทัด', () => {
  const src = 'a\ntest.fail(1)\ntest.skip(2)\ntest.fixme(3)\ntest.only(4)\n'
  const root = fixture({ 'a.spec.js': src, 'b.spec.js': 'test.skip(1)' }, { golden: ['a.spec.js'], excluded: { 'b.spec.js': 'x' } })
  try {
    const r = checkGolden(root)
    assert.equal(r.problems.length, 4)
    assert.match(r.problems[0], /a\.spec\.js:2/)
    assert.match(r.problems[3], /a\.spec\.js:5/)
  } finally { rmSync(root, { recursive: true }) }
})

test('R5 จับ test.describe.skip( และ test.skip (  แต่ไม่จับบรรทัด comment', () => {
  const src = ['// test.skip(0)', "test.describe.skip('x')", "test.skip ('y')", ''].join(String.fromCharCode(10))
  const root = fixture({ 'a.spec.js': src }, { golden: ['a.spec.js'], excluded: {} })
  try {
    const r = checkGolden(root)
    assert.equal(r.problems.length, 2)
    assert.match(r.problems[0], /a\.spec\.js:2/)
    assert.match(r.problems[1], /a\.spec\.js:3/)
  } finally { rmSync(root, { recursive: true }) }
})
test('R1 สแกน subfolder และข้าม node_modules', () => {
  const root = fixture({ 'sub/n.spec.js': '', 'node_modules/x/y.spec.js': '' }, { golden: [], excluded: {} })
  try {
    const r = checkGolden(root)
    assert.deepEqual(codes(r), ['R1'])
    assert.match(r.problems[0], /sub\/n\.spec\.js/)
  } finally { rmSync(root, { recursive: true }) }
})
test('nested spec ที่จัดกลุ่มแล้วผ่าน', () => {
  const root = fixture({ 'sub/n.spec.js': '' }, { golden: [], excluded: { 'sub/n.spec.js': 'x' } })
  try { assert.deepEqual(checkGolden(root).problems, []) } finally { rmSync(root, { recursive: true }) }
})

test('R4 excluded แบบ object ต้องมี reason ไม่ว่าง', () => {
  const root = fixture(
    { 'a.spec.js': '', 'b.spec.js': '' },
    { golden: [], excluded: { 'a.spec.js': { reason: 'x', reviewBy: '2999-01-01' }, 'b.spec.js': { reviewBy: '2999-01-01' } } }
  )
  try {
    const r = checkGolden(root)
    assert.deepEqual(codes(r), ['R4'])
    assert.match(r.problems[0], /b\.spec\.js/)
  } finally { rmSync(root, { recursive: true }) }
})
test('R4 reviewBy รูปแบบผิด', () => {
  const root = fixture({ 'a.spec.js': '' }, { golden: [], excluded: { 'a.spec.js': { reason: 'x', reviewBy: '06/11/2026' } } })
  try { assert.deepEqual(codes(checkGolden(root)), ['R4']) } finally { rmSync(root, { recursive: true }) }
})
test('WARNING เมื่อ reviewBy เลยกำหนด (ไม่ใช่ problem)', () => {
  const root = fixture({ 'a.spec.js': '' }, { golden: [], excluded: { 'a.spec.js': { reason: 'x', reviewBy: '2026-01-01' } } })
  try {
    const r = checkGolden(root, new Date('2026-11-06T00:00:00Z'))
    assert.deepEqual(r.problems, [])
    assert.equal(r.warnings.length, 1)
    assert.match(r.warnings[0], /a\.spec\.js.*2026-01-01/)
  } finally { rmSync(root, { recursive: true }) }
})
test('ไม่ WARNING เมื่อ reviewBy ยังไม่ถึง และวันครบกำหนดพอดีไม่ถือว่าเลย', () => {
  const root = fixture(
    { 'a.spec.js': '', 'b.spec.js': '' },
    { golden: [], excluded: { 'a.spec.js': { reason: 'x', reviewBy: '2026-12-31' }, 'b.spec.js': { reason: 'x', reviewBy: '2026-11-06' } } }
  )
  try {
    const r = checkGolden(root, new Date('2026-11-06T10:00:00Z'))
    assert.deepEqual(r.problems, [])
    assert.deepEqual(r.warnings, [])
  } finally { rmSync(root, { recursive: true }) }
})
test('WARNING เมื่อเหตุผลขึ้นต้น รอตรวจ แต่ไม่มี reviewBy (string และ object)', () => {
  const root = fixture(
    { 'a.spec.js': '', 'b.spec.js': '', 'c.spec.js': '' },
    {
      golden: [],
      excluded: {
        'a.spec.js': 'รอตรวจความนิ่ง',
        'b.spec.js': { reason: 'รอตรวจความนิ่ง' },
        'c.spec.js': { reason: 'รอตรวจความนิ่ง', reviewBy: '2999-01-01' }
      }
    }
  )
  try {
    const r = checkGolden(root)
    assert.deepEqual(r.problems, [])
    assert.equal(r.warnings.length, 2)
    assert.match(r.warnings[0], /a\.spec\.js/)
    assert.match(r.warnings[1], /b\.spec\.js/)
  } finally { rmSync(root, { recursive: true }) }
})
test('เหตุผลธรรมดาแบบ string ไม่มี WARNING', () => {
  const root = fixture({ 'a.spec.js': '' }, { golden: [], excluded: { 'a.spec.js': 'อ่านอย่างเดียว' } })
  try {
    const r = checkGolden(root)
    assert.deepEqual(r.problems, [])
    assert.deepEqual(r.warnings, [])
  } finally { rmSync(root, { recursive: true }) }
})
