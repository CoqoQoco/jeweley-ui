# Claude Design — Re-design UI Foundation

ชุดเอกสาร foundation สำหรับ **re-design UI ของ jeweley-ui ด้วย Claude Design** (เครื่องมือออกแบบ Beta บน claude.ai)
ทำทีละส่วนตาม **generic component / page archetype / token** เพราะทุกหน้าใช้ของกลางร่วมกัน → แก้ครั้งเดียว propagate ทั้งระบบ

> แผนเต็ม: `C:\Users\Chaisurs\.claude\plans\federated-moseying-brook.md`
> Source-of-truth ของ design เดิม: `docs/design-system.md` (+ 18 skills ใน `.claude/skills/`)

---

## ลำดับการอ่าน / ใช้งาน

| # | ไฟล์ | ใช้เมื่อ |
|---|---|---|
| 00 | [`00-design-language.md`](00-design-language.md) | seed Design System บน Claude Design (brand + token + 12 หลักการ) |
| 01 | [`01-component-catalog.md`](01-component-catalog.md) | spec ของ generic component 26 ตัว = หน่วยของการ redesign |
| 02 | [`02-information-architecture.md`](02-information-architecture.md) | module/page inventory + nav + page-type taxonomy |
| 03 | [`03-page-archetypes.md`](03-page-archetypes.md) | wireframe 5 archetype (List/Create-Edit/Detail/Dashboard/Modal) |
| 04 | [`04-redesign-playbook.md`](04-redesign-playbook.md) | loop การ redesign + prompt template + tracking table |
| 05 | [`05-claude-design-setup.md`](05-claude-design-setup.md) | คู่มือ setup โครงสร้างบน Claude Design (ผู้ใช้กดในเครื่องมือ) |

**MCP server**: `tools/design-system-mcp/` — เสิร์ฟ token/component/archetype สดจากไฟล์จริง (ไม่ drift)
ดู README ในโฟลเดอร์นั้นสำหรับวิธีต่อเข้า Claude Code / claude.ai

**Blueprints** (พิมพ์เขียว): `blueprints/<component>.md` — **บังคับ** ทุก design ที่ approve ต้องมี blueprint
ก่อน map เข้าโค้ด (template = `blueprints/_template.md`) → เป็นสัญญาระหว่างดีไซน์ ↔ โค้ด

---

## Flow ระดับสูง

```
Phase 0a  เอกสาร foundation (00–05)            ← ไฟล์ในโฟลเดอร์นี้
Phase 0b  design-system-mcp server             ← tools/design-system-mcp/
Phase 1   redesign component ทีละตัว (Claude Design)
Phase 2   redesign 5 archetypes
Phase 3   map กลับเข้า token/component (@ui-implementer) → lint+build+chrome-mcp verify
Phase 4   mobile (รอบถัดไป)
```

---

## กฎที่ต้องจำ

- redesign ที่ **token + ไฟล์ component กลาง** เท่านั้น — ห้ามไล่แก้ทีละหน้า
- คง props/emits/slots เดิมของ component (backward compatible)
- map เข้าโค้ดต้องผ่าน **`@ui-implementer`** เสมอ · `npm run lint` + `npm run build` เขียวทุกครั้ง
- ห้ามแตะ `src/assets/scss/custom-style/` (legacy) · ห้าม hardcode hex/px · ห้าม commit/push
- เพิ่ม pattern ใหม่ → บันทึก **Design Decision Log** ใน `docs/design-system.md`
