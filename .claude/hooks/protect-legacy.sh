#!/bin/bash
# Protect legacy CSS files from being modified

# เครื่องนี้ไม่มี python3 — เวอร์ชันเดิมใช้ python3 ทำให้ FILE_PATH ว่างและ hook ไม่เคยบล็อกอะไรเลย
# ใช้ node แทน (normalize backslash → slash ในตัวด้วย) ห้ามเปลี่ยนกลับไปใช้ python3
INPUT=$(cat)
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

if [[ "$FILE_PATH" == *"custom-style"* ]]; then
  echo "❌ Blocked: '$FILE_PATH' is a legacy file — Do NOT modify custom-style/" >&2
  exit 2
fi

exit 0
