#!/bin/bash
# Remind to update skills/docs/tracker when important files are changed

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('tool_input',{}).get('file_path',''))" 2>/dev/null)

if [[ -z "$FILE_PATH" ]]; then
  exit 0
fi

MESSAGES=""

if [[ "$FILE_PATH" == *"src/components/prime-vue/"* ]] || [[ "$FILE_PATH" == *"src/components/generic/"* ]]; then
  MESSAGES="${MESSAGES}📝 แก้ generic component แล้ว — อัปเดต skill generic-components/native-call-policy ให้ตรง props/emits\n"
  MESSAGES="${MESSAGES}🎨 ออกแบบ/แก้ UI — ต้องยึด docs/design-system.md; ถ้าเพิ่ม/เปลี่ยน design pattern ใหม่ → อัปเดต Design Decision Log ใน docs/design-system.md\n"
fi

if [[ "$FILE_PATH" == *"src/assets/scss/"* ]] && [[ "$FILE_PATH" != *"custom-style/"* ]]; then
  MESSAGES="${MESSAGES}🎨 แก้ SCSS แล้ว — ถ้าเพิ่ม/แก้ token/mixin ให้อัปเดต skill design-system; ห้าม hardcode สี/px\n"
fi

if [[ "$FILE_PATH" == *"src/views/"* ]] && [[ "$FILE_PATH" == *.vue ]]; then
  MESSAGES="${MESSAGES}🌐 แก้ไฟล์ view — ตรวจว่าไม่มี hardcode ภาษาไทยใหม่ (ใช้ \$t) + ใช้ generic component แทน native; ถ้าหน้านี้อยู่ใน migration ให้อัปเดต docs/refactor-migration.md\n"
  MESSAGES="${MESSAGES}🎨 ออกแบบ/แก้ UI — ต้องยึด docs/design-system.md (Core Principles + baseline); ถ้าเพิ่ม/เปลี่ยน design pattern ใหม่ → อัปเดต Design Decision Log ใน docs/design-system.md\n"
fi

if [[ "$FILE_PATH" == *".claude/skills/"* ]]; then
  MESSAGES="${MESSAGES}📚 แก้ skill — ตรวจว่า CLAUDE.md @reference ครบ และ description ยังตรง\n"
fi

if [[ -n "$MESSAGES" ]]; then
  printf "%b" "$MESSAGES" >&2
  exit 2
fi

exit 0
