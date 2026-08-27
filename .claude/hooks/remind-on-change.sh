#!/bin/bash
# Remind to update skills/docs/tracker when important files are changed
#
# หมายเหตุสำคัญ: เครื่องนี้ "ไม่มี python3" — เวอร์ชันเดิมใช้ python3 parse JSON
# ทำให้ FILE_PATH ว่างตลอดและ hook exit 0 เงียบๆ ทุกครั้ง (ตายมาตั้งแต่ 23 มิ.ย.)
# ตอนนี้ใช้ node แทน (มาพร้อมโปรเจกต์อยู่แล้ว) — ห้ามเปลี่ยนกลับไปใช้ python3

INPUT=$(cat)

# normalize backslash → slash ตั้งแต่ใน node เลย
# (Windows ส่ง path มาเป็น backslash ถ้าไม่แปลง กฎจะไม่เข้าสักข้อ
#  และ bash ${var//\\//} ใช้ไม่ได้จริง — เคยลองแล้วไม่แทนที่)
FILE_PATH=$(printf '%s' "$INPUT" | node -e '
let s = ""
process.stdin.on("data", (d) => (s += d)).on("end", () => {
  try {
    const j = JSON.parse(s)
    const p = (j && j.tool_input && j.tool_input.file_path) || ""
    process.stdout.write(p.split("\\").join("/"))
  } catch (e) {
    process.stdout.write("")
  }
})
' 2>/dev/null)

if [[ -z "$FILE_PATH" ]]; then
  exit 0
fi

MESSAGES=""

# ---------- helper: หาภาษาไทยที่ hardcode จริง (ข้าม $t(...) และ comment) ----------
find_hardcoded_thai() {
  node -e '
const fs = require("fs")
let src
try {
  src = fs.readFileSync(process.argv[1], "utf8")
} catch (e) {
  process.exit(1)
}
const hits = src
  .split("\n")
  .map((l, i) => [i + 1, l])
  .filter(([, l]) => /[฀-๿]/.test(l))
  .filter(([, l]) => !/\$t\(/.test(l))
  .filter(([, l]) => !/^\s*(\/\/|\/\*|\*|<!--)/.test(l))
  // dayjs format pattern ("วันddddที่ D MMMM YYYY") ไม่ใช่ข้อความที่ต้องเข้า $t
  .filter(([, l]) => !/\.format\(|dayjs/.test(l))
  .slice(0, 3)
if (!hits.length) process.exit(1)
process.stdout.write(hits.map(([n, l]) => "L" + n + ": " + l.trim().slice(0, 60)).join(" | "))
' "$1" 2>/dev/null
}

# ---------- helper: หา api.jewelry call ที่ขาด skipError ----------
find_missing_skiperror() {
  node -e '
const fs = require("fs")
let src
try {
  src = fs.readFileSync(process.argv[1], "utf8")
} catch (e) {
  process.exit(1)
}
const lines = src.split("\n")
const bad = []
lines.forEach((l, i) => {
  if (!/api\.jewelry\./.test(l)) return
  // call เขียนข้ามหลายบรรทัดได้ (fetchDailyPlan ยาว 23 บรรทัด)
  // จึงไล่นับวงเล็บจนบาลานซ์ แทนการ fix จำนวนบรรทัด — cap 80 กันไฟล์พัง
  let depth = 0
  let started = false
  let chunk = ""
  for (let j = i; j < Math.min(lines.length, i + 80); j++) {
    chunk += lines[j] + "\n"
    for (const ch of lines[j]) {
      if (ch === "(") {
        depth++
        started = true
      } else if (ch === ")") {
        depth--
      }
    }
    if (started && depth <= 0) break
  }
  if (!/skipError/.test(chunk)) bad.push(i + 1)
})
if (!bad.length) process.exit(1)
process.stdout.write(bad.map((n) => "L" + n).join(", "))
' "$1" 2>/dev/null
}

# ================= กฎเดิม =================

if [[ "$FILE_PATH" == *"src/components/prime-vue/"* ]] || [[ "$FILE_PATH" == *"src/components/generic/"* ]]; then
  MESSAGES="${MESSAGES}📝 แก้ generic component แล้ว — อัปเดต skill generic-components/native-call-policy ให้ตรง props/emits\n"
  MESSAGES="${MESSAGES}🎨 ถ้าเพิ่ม/เปลี่ยน design pattern ใหม่ → อัปเดต Design Decision Log ใน docs/design-system.md\n"
fi

if [[ "$FILE_PATH" == *"src/assets/scss/"* ]] && [[ "$FILE_PATH" != *"custom-style/"* ]]; then
  MESSAGES="${MESSAGES}🎨 แก้ SCSS แล้ว — ถ้าเพิ่ม/แก้ token/mixin ให้อัปเดต skill design-system; ห้าม hardcode สี/px\n"
fi

# view: เตือนเฉพาะเมื่อ "เจอภาษาไทย hardcode จริง" เท่านั้น (เดิมเตือนทุกไฟล์ = noise)
if [[ "$FILE_PATH" == *"src/views/"* ]] && [[ "$FILE_PATH" == *.vue ]]; then
  THAI_HITS=$(find_hardcoded_thai "$FILE_PATH")
  if [[ -n "$THAI_HITS" ]]; then
    MESSAGES="${MESSAGES}🌐 เจอภาษาไทย hardcode ในไฟล์นี้ → ย้ายไป \$t() ให้ครบ: ${THAI_HITS}\n"
    MESSAGES="${MESSAGES}🎨 ระหว่างแก้ ยึด docs/design-system.md + ใช้ generic component แทน native; ถ้าหน้านี้อยู่ใน migration ให้อัปเดต docs/refactor-migration.md\n"
  fi
fi

if [[ "$FILE_PATH" == *".claude/skills/"* ]]; then
  MESSAGES="${MESSAGES}📚 แก้ skill — ตรวจว่า CLAUDE.md @reference ครบ และ description ยังตรง\n"
fi

# ================= กฎใหม่: home dashboard =================
# หน้า /dashboard ประกอบตัวเองจาก dashboard-registry.js ตาม permission ของผู้ใช้
# feature ใหม่ทุกอย่างมีโอกาสต้องกลับมาแก้ที่นี่ ไม่งั้น dashboard จะค้างอยู่กับของเก่า

if [[ "$FILE_PATH" == *"src/router/web/"* ]]; then
  MESSAGES="${MESSAGES}🧭 เพิ่ม/แก้ route = feature ใหม่ → กลับไปดู src/views/dashboard/home/dashboard-registry.js\n"
  MESSAGES="${MESSAGES}   • ต้องมีปุ่มลัดใน quick-actions.vue ไหม (gate รายปุ่มตามสิทธิ์)\n"
  MESSAGES="${MESSAGES}   • ต้องมี widget/การ์ดตัวเลขบนหน้าแรกไหม\n"
  MESSAGES="${MESSAGES}   • ถ้าเป็นรายงาน → เพิ่มใน favorite-reports.vue ไหม\n"
fi

if [[ "$FILE_PATH" == *"src/services/permission/config.js"* ]]; then
  MESSAGES="${MESSAGES}🔑 แก้ permission แล้ว → ตรวจ dashboard ทั้ง 3 จุดว่ายังตรงกัน:\n"
  MESSAGES="${MESSAGES}   1) dashboard-registry.js — widget ไหน gate ด้วยสิทธิ์ใหม่นี้\n"
  MESSAGES="${MESSAGES}   2) home/index-view.vue computed flags — เพิ่ม flag ให้ตรง\n"
  MESSAGES="${MESSAGES}   3) home-dashboard-store.js loadDashboard() — ยิง endpoint เฉพาะเมื่อมีสิทธิ์\n"
  MESSAGES="${MESSAGES}   ⚠️ ใช้ PermissionService เท่านั้น ห้ามใช้ authStore.hasPermission (ไม่มี fallback)\n"
fi

if [[ "$FILE_PATH" == *"src/views/dashboard/home/"* ]]; then
  MESSAGES="${MESSAGES}🏠 แก้ home dashboard — 3 จุดนี้ต้องแก้พร้อมกันเสมอ ไม่งั้น widget จะโผล่แต่ไม่มีข้อมูล (หรือยิง API ทั้งที่ไม่มีสิทธิ์):\n"
  MESSAGES="${MESSAGES}   1) dashboard-registry.js — key + permissions + order\n"
  MESSAGES="${MESSAGES}   2) home/index-view.vue — flags + widgetProps ของ key นั้น\n"
  MESSAGES="${MESSAGES}   3) home-dashboard-store.js — fetch ต้องอยู่หลัง if (flags.…)\n"
  MESSAGES="${MESSAGES}   + ทุกกล่องห่อ SectionCardGeneric และทุกข้อความผ่าน \$t()\n"
fi

if [[ "$FILE_PATH" == *"home-dashboard-store.js"* ]]; then
  MISSING=$(find_missing_skiperror "$FILE_PATH")
  if [[ -n "$MISSING" ]]; then
    MESSAGES="${MESSAGES}🚨 พบ api.jewelry call ที่ขาด skipError: ${MISSING}\n"
    MESSAGES="${MESSAGES}   หน้าแรกยิงหลาย API พร้อมกัน — call ที่ล้มเพียงตัวเดียวจะเด้ง modal ทับทั้งหน้า\n"
    MESSAGES="${MESSAGES}   ต้องเป็น { skipLoading: true, skipError: true } ทุก call\n"
  fi
  MESSAGES="${MESSAGES}📡 เพิ่ม fetch ใหม่ใน store → ต้องใส่ไว้หลัง if (flags.…) ใน loadDashboard() ด้วย\n"
  MESSAGES="${MESSAGES}   role ที่ไม่มีสิทธิ์ต้องไม่มี network request ออกไปเลย (เช็คใน DevTools)\n"
fi

if [[ -n "$MESSAGES" ]]; then
  printf "%b" "$MESSAGES" >&2
  exit 2
fi

exit 0
