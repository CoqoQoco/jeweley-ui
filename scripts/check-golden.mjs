// ตรวจว่า e2e/*.spec.js ทุกไฟล์ถูกจัดเป็น golden หรือ excluded ใน e2e/golden.json
// ใช้:  node scripts/check-golden.mjs           ตรวจอย่างเดียว
//       node scripts/check-golden.mjs --list    พิมพ์รายชื่อ golden บรรทัดละไฟล์
//       node scripts/check-golden.mjs --run     ตรวจ แล้วรัน playwright เฉพาะ golden (--workers=1)
//       node scripts/check-golden.mjs --run --with-vitest   รัน vitest ทั้งชุดก่อน (ปิดเป็นค่าเริ่มต้น: vitest เดิมของ repo มี test แดงค้างอยู่ ใช้ npm test แยก)
//
// excluded แต่ละรายการเป็น string เหตุผล หรือ { "reason": "...", "reviewBy": "YYYY-MM-DD" }
// WARNING (ไม่ fail): reviewBy เลยกำหนด หรือเหตุผลขึ้นต้น "รอตรวจ" แต่ไม่มี reviewBy
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'

const BANNED_RE = /\btest(\.describe)?\.(fail|skip|fixme|only)\b/

function listSpecs(dir, prefix = '') {
  const out = []
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules') continue
    if (e.isDirectory()) out.push(...listSpecs(join(dir, e.name), prefix + e.name + '/'))
    else if (e.name.endsWith('.spec.js')) out.push(prefix + e.name)
  }
  return out
}

const REVIEW_BY_RE = /^\d{4}-\d{2}-\d{2}$/

function reasonOf(entry) {
  if (typeof entry === 'string') return entry
  if (entry && typeof entry === 'object') return entry.reason
  return undefined
}

export function checkGolden(root, today = new Date()) {
  const e2eDir = join(root, 'e2e')
  const problems = []
  const warnings = []
  let cfg
  try {
    cfg = JSON.parse(readFileSync(join(e2eDir, 'golden.json'), 'utf8'))
  } catch (e) {
    return { problems: [`e2e/golden.json: อ่านไม่ได้หรือ JSON ไม่ถูกต้อง (${e.message})`], warnings, golden: [] }
  }
  const golden = Array.isArray(cfg.golden) ? cfg.golden : []
  const excluded = cfg.excluded && typeof cfg.excluded === 'object' ? cfg.excluded : {}
  const files = existsSync(e2eDir) ? listSpecs(e2eDir).sort() : []
  const fileSet = new Set(files)
  const exNames = Object.keys(excluded)

  for (const f of files) {
    if (!golden.includes(f) && !(f in excluded)) {
      problems.push(`R1 ${f}: ไม่อยู่ใน golden หรือ excluded ของ e2e/golden.json`)
    }
  }
  for (const n of [...golden, ...exNames]) {
    if (!fileSet.has(n)) problems.push(`R2 ${n}: อยู่ใน e2e/golden.json แต่ไม่มีไฟล์ e2e/${n}`)
  }
  for (const n of golden) {
    if (n in excluded) problems.push(`R3 ${n}: อยู่ทั้ง golden และ excluded`)
  }
  const todayStr = today.toISOString().slice(0, 10)
  for (const n of exNames) {
    const entry = excluded[n]
    const r = reasonOf(entry)
    if (typeof r !== 'string' || r.trim() === '') {
      problems.push(`R4 ${n}: excluded ต้องมีเหตุผล (ห้ามว่าง)`)
      continue
    }
    const reviewBy = entry && typeof entry === 'object' ? entry.reviewBy : undefined
    if (reviewBy !== undefined && !REVIEW_BY_RE.test(String(reviewBy))) {
      problems.push(`R4 ${n}: reviewBy ต้องเป็นรูปแบบ YYYY-MM-DD (ได้ "${reviewBy}")`)
      continue
    }
    if (reviewBy && String(reviewBy) < todayStr) {
      warnings.push(`${n}: reviewBy ${reviewBy} เลยกำหนดแล้ว -- ทบทวนว่าควรเข้า golden หรือยัง`)
    } else if (!reviewBy && r.trim().startsWith('รอตรวจ')) {
      warnings.push(`${n}: เหตุผลขึ้นต้น "รอตรวจ" แต่ไม่มี reviewBy -- ใส่ { reason, reviewBy } เพื่อกันค้างถาวร`)
    }
  }
  for (const n of golden) {
    if (!fileSet.has(n)) continue
    const lines = readFileSync(join(e2eDir, n), 'utf8').split(/\r?\n/)
    lines.forEach((line, i) => {
      if (line.trim().startsWith('//')) return
      const m = BANNED_RE.exec(line)
      if (m) problems.push(`R5 ${n}:${i + 1}: golden spec ห้ามมี ${m[0]}`)
    })
  }
  return { problems, warnings, golden }
}

function run(cmd, args, cwd) {
  return new Promise((res) => {
    // shell:true เพื่อให้ npx.cmd ทำงานบน Windows; args เป็น array ที่ไม่มีอักขระพิเศษ
    const p = spawn(cmd, args, { cwd, stdio: 'inherit', shell: process.platform === 'win32' })
    p.on('error', (e) => {
      console.error('check-golden: spawn ล้มเหลว: ' + e.message)
      res(1)
    })
    p.on('close', (code) => res(code ?? 1))
  })
}

async function main() {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
  const argv = process.argv.slice(2)
  const { problems, warnings, golden } = checkGolden(root)
  for (const w of warnings) console.warn('check-golden: WARNING ' + w)
  if (problems.length) {
    console.error('check-golden: FAIL')
    for (const p of problems) console.error('  - ' + p)
    console.error(`${problems.length} ปัญหา -- ไม่รัน playwright`)
    process.exit(1)
  }
  if (argv.includes('--list')) {
    for (const g of golden) console.log(g)
    return
  }
  if (!argv.includes('--run')) {
    console.log(`check-golden: OK (golden ${golden.length} ไฟล์)`)
    return
  }
  if (golden.length === 0) {
    console.error('check-golden: FAIL')
    console.error('  - golden ว่าง -- ไม่มี spec ให้รัน')
    process.exit(1)
  }
  console.log(`check-golden: OK (golden ${golden.length} ไฟล์) -- รัน playwright (workers=1)`)
  const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx'
  if (argv.includes('--with-vitest')) {
    const vcode = await run(npx, ['vitest', 'run'], root)
    if (vcode !== 0) process.exit(vcode)
  }
  const code = await run(npx, ['playwright', 'test', ...golden.map((g) => 'e2e/' + g), '--workers=1'], root)
  process.exit(code)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main()
}
