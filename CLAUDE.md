# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

---

## Workflow Rule

**ทุก task → เสนอ Plan ก่อนเสมอ → รอ confirm → ค่อย implement**

---

## Development Commands

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run lint      # Run ESLint with auto-fix
npm run format    # Format code with Prettier
```

## Docker

```bash
docker build . -t jewelry-ui
docker run -d -p 8080:80 jewelry-ui
```

---

## Tech Stack

- **Vue 3** + Options API + Vite
- **Pinia** (state management) + **Vue Router** (role-based)
- **PrimeVue** (UI components) + **Vue i18n** (Thai/English)
- **SCSS**: `variable.scss`, `mixin.scss`, `responsive-style/web|mobile/`

---

## Directory Map

```
src/
├── axios/          ← axios config + error/loading interceptors (axios-helper.js)
├── assets/scss/
│   ├── custom-style/       ← ❌ Legacy — Do NOT modify
│   └── responsive-style/   ← ✅ New styles (web/ + mobile/)
├── components/prime-vue/   ← Generic PrimeVue wrappers
├── router/
│   ├── web/        ← Tablet & Desktop routes
│   └── mobile/     ← Mobile routes (/mobile/*)
├── services/alert/ ← sweetAlerts.js
├── stores/         ← Pinia stores
└── views/          ← Page components (organized by feature)
```

---

## Gotchas (Critical Rules)

| Rule | Why |
|---|---|
| ❌ ห้ามใช้ `try-catch` ครอบ API call | axios-helper.js จัดการ error อัตโนมัติ |
| ❌ ห้าม `this.loading = true/false` | axios-helper.js จัดการ loading อัตโนมัติ |
| ❌ ห้ามใช้ `alert()` / `confirm()` native | ใช้ sweetAlerts service เสมอ |
| ❌ ห้าม modify `custom-style/standard-form.scss` | Legacy — ห้ามแตะ |
| ✅ ใช้ kebab-case ชื่อไฟล์ component เสมอ | ยกเว้น `*Generic.vue` และ `File*.vue` |
| ✅ ตรวจ native-call-policy ก่อนเขียน input/button/table | ใช้ generic component แทนเสมอ |
| ✅ ตาราง DataTable ต้องใช้ `DataTableWithPaging` เท่านั้น | ห้ามใช้ `<table>` HTML หรือ PrimeVue DataTable ตรงๆ |
| ❌ ห้าม hardcode ข้อความไทยในโค้ดใหม่ | ใช้ `$t('common.btn.*')` / `$t('common.field.*')` |
| ❌ ห้าม hardcode สี/px ใน SCSS ใหม่ | ใช้ token `var(--sp-*)`, `var(--radius-*)`, `var(--base-*)` |
| ✅ Migration loop: แตะหน้าไหน → ใช้ token+generic+$t+composable ในไฟล์นั้น | ดู ui-implementer agent |
| ✅ ออกแบบ/แก้ UI → ยึด `docs/design-system.md` (source-of-truth); เพิ่ม pattern ใหม่ต้องอัปเดต Decision Log | มาตรฐาน design กลาง |

---

## Skills Reference

รายละเอียดทั้งหมดอยู่ใน `.claude/skills/`:

| Skill | ใช้เมื่อ |
|---|---|
| @.claude/skills/md-instruction/SKILL.md | เขียน/แก้ไขไฟล์ .md |
| @.claude/skills/component-patterns/SKILL.md | สร้าง component, naming, props |
| @.claude/skills/button-system/SKILL.md | เลือก button class, สี |
| @.claude/skills/alert-system/SKILL.md | แสดง popup, confirm, error |
| @.claude/skills/error-handling/SKILL.md | API call, async function |
| @.claude/skills/responsive-web/SKILL.md | Web layout, responsive classes |
| @.claude/skills/mobile-dev/SKILL.md | Mobile component, iOS safe area |
| @.claude/skills/image-system/SKILL.md | แสดงรูป, PDF images |
| @.claude/skills/generic-components/SKILL.md | CalendarGeneric, AutoComplete, MultiSelectGeneric, CheckboxGeneric + Generic UI ชุดใหม่ |
| @.claude/skills/modal-system/SKILL.md | สร้าง Modal, popup, dialog |
| @.claude/skills/pdf-system/SKILL.md | สร้าง PDF, export เอกสาร |
| @.claude/skills/excel-system/SKILL.md | export Excel, .xlsx, ExcelHelper, document builder |
| @.claude/skills/ui-layout/SKILL.md | Page header, card section, form row, button spacing |
| @.claude/skills/user-manual/SKILL.md | สร้างปุ่มคู่มือ + manual modal พร้อม screenshot |
| @.claude/skills/chrome-mcp-testing/SKILL.md | ทดสอบ UI ด้วย chrome MCP, สร้าง/รัน test case, verify feature, reproduce bug |
| @.claude/skills/design-system/SKILL.md | Token spacing/radius/shadow/typography/color, mixins, button standard |
| @.claude/skills/native-call-policy/SKILL.md | ตาราง ❌→✅ ทุก native element/PrimeVue/alert/localStorage |
| @.claude/skills/i18n-system/SKILL.md | namespace common.btn/field/label, $t(), setLocale, เพิ่ม key ใหม่ |
| @.claude/skills/composables/SKILL.md | useDataTablePaging mixin, confirmThenSubmit helper |
| @.claude/skills/code-structure/SKILL.md | naming kebab-case, folder layout, ที่อยู่ generic/composable/services |
