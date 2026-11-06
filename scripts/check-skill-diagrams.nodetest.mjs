// node --test scripts/check-skill-diagrams.nodetest.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, utimesSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { checkSkillDiagrams } from './check-skill-diagrams.mjs'

const SCRIPT = fileURLToPath(new URL('./check-skill-diagrams.mjs', import.meta.url))

function skill(root, name, files) {
  const dir = join(root, '.claude', 'skills', name)
  mkdirSync(dir, { recursive: true })
  for (const [f, mtimeSec] of Object.entries(files)) {
    const p = join(dir, f)
    writeFileSync(p, 'x')
    utimesSync(p, mtimeSec, mtimeSec)
  }
}
const mk = () => mkdtempSync(join(tmpdir(), 'skilldiag-'))

test('SKILL.md ใหม่กว่า diagram -> stale', () => {
  const root = mk()
  try {
    skill(root, 'a', { 'SKILL.md': 2000, 'diagram.json': 1000 })
    assert.deepEqual(checkSkillDiagrams(root), { stale: ['a'], missing: [] })
  } finally { rmSync(root, { recursive: true }) }
})
test('diagram ใหม่กว่า SKILL.md -> ไม่ stale', () => {
  const root = mk()
  try {
    skill(root, 'a', { 'SKILL.md': 1000, 'diagram-flow.html': 2000 })
    assert.deepEqual(checkSkillDiagrams(root), { stale: [], missing: [] })
  } finally { rmSync(root, { recursive: true }) }
})
test('มีหลาย diagram เทียบกับตัวใหม่สุด', () => {
  const root = mk()
  try {
    skill(root, 'a', { 'SKILL.md': 1500, 'diagram-old.json': 1000, 'diagram-new.html': 2000 })
    assert.deepEqual(checkSkillDiagrams(root).stale, [])
  } finally { rmSync(root, { recursive: true }) }
})
test('ไม่มี diagram เลย -> missing; โฟลเดอร์ที่ไม่มี SKILL.md ถูกข้าม', () => {
  const root = mk()
  try {
    skill(root, 'b', { 'SKILL.md': 1000, 'notes.md': 1000 })
    skill(root, 'c', { 'other.txt': 1000 })
    assert.deepEqual(checkSkillDiagrams(root), { stale: [], missing: ['b'] })
  } finally { rmSync(root, { recursive: true }) }
})
test('ไม่มี .claude/skills -> ว่างทั้งคู่', () => {
  const root = mk()
  try { assert.deepEqual(checkSkillDiagrams(root), { stale: [], missing: [] }) } finally { rmSync(root, { recursive: true }) }
})
test('CLI exit 0 เสมอ และพิมพ์ผลบนรีโปจริง', () => {
  const r = spawnSync(process.execPath, [SCRIPT], { encoding: 'utf8' })
  assert.equal(r.status, 0)
  assert.match(r.stdout + r.stderr, /check-skill-diagrams:/)
})
