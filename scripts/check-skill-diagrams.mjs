// เตือนเมื่อ SKILL.md ถูกแก้หลัง diagram ของ skill นั้น (diagram อาจเก่าแล้ว)
// ไล่ <repo-root>/.claude/skills/*/ ที่มี SKILL.md  (repo-root = ขึ้นจาก jeweley-ui 1 ชั้น)
//   - มี diagram*.json|html และ mtime ของ SKILL.md ใหม่กว่า diagram ตัวใหม่สุด -> WARNING
//   - ไม่มี diagram เลย -> INFO
// exit 0 เสมอ (เป็นแค่คำเตือน ไม่ block)
import { readdirSync, statSync, existsSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const DIAGRAM_RE = /^diagram.*\.(json|html)$/i

export function checkSkillDiagrams(repoRoot) {
  const skillsDir = join(repoRoot, '.claude', 'skills')
  const stale = []
  const missing = []
  if (!existsSync(skillsDir)) return { stale, missing }

  for (const e of readdirSync(skillsDir, { withFileTypes: true })) {
    if (!e.isDirectory()) continue
    const dir = join(skillsDir, e.name)
    const skillMd = join(dir, 'SKILL.md')
    if (!existsSync(skillMd)) continue

    const diagrams = readdirSync(dir).filter((f) => DIAGRAM_RE.test(f))
    if (diagrams.length === 0) {
      missing.push(e.name)
      continue
    }
    const newestDiagram = Math.max(...diagrams.map((f) => statSync(join(dir, f)).mtimeMs))
    if (statSync(skillMd).mtimeMs > newestDiagram) stale.push(e.name)
  }
  stale.sort()
  missing.sort()
  return { stale, missing }
}

function main() {
  const uiRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
  const { stale, missing } = checkSkillDiagrams(resolve(uiRoot, '..'))
  if (stale.length) {
    console.warn(`check-skill-diagrams: WARNING SKILL.md ใหม่กว่า diagram (${stale.length} skill): ${stale.join(', ')}`)
  }
  if (missing.length) {
    console.log(`check-skill-diagrams: INFO skill ที่ยังไม่มี diagram (${missing.length}): ${missing.join(', ')}`)
  }
  if (!stale.length && !missing.length) console.log('check-skill-diagrams: OK')
  process.exit(0)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main()
}
