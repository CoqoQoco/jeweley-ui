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
| ✅ ใช้ kebab-case ชื่อไฟล์ component เสมอ | Project convention |
| ✅ ตรวจ generic-components ก่อนใช้ PrimeVue ตรงๆ | Reusability |

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
| @.claude/skills/generic-components/SKILL.md | CalendarGeneric, AutoComplete |
