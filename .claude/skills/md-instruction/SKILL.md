---
name: md-instruction
description: คู่มือการเขียนและปรับปรุงไฟล์ .md ในโปรเจกต์นี้ — ใช้เมื่อต้องสร้างหรือแก้ไข CLAUDE.md, SKILL.md, หรือ documentation ใดๆ
---

# MD Writing Instruction

คู่มือนี้กำหนดรูปแบบมาตรฐานในการเขียน `.md` ทุกไฟล์ในโปรเจกต์นี้

---

## กฎหลัก (ห้ามละเมิด)

1. **CLAUDE.md ห้ามเกิน 200 บรรทัด** — ย้ายรายละเอียดไปที่ skill แทน
2. **ทุก SKILL.md ต้องมี frontmatter** `name` และ `description` ที่ชัดเจน — description สำคัญมากสำหรับ auto-activation
3. **ห้าม copy เนื้อหาซ้ำ** ระหว่างไฟล์ — ใช้ `@filename` อ้างอิงแทน
4. **Plan ก่อนเสมอ รอ confirm ถึงจะ implement**

---

## โครงสร้างไฟล์ที่กำหนด

```
jeweley-ui/
├── CLAUDE.md                        ← < 200 บรรทัด, overview + gotchas + @references
└── .claude/
    ├── settings.json
    └── skills/
        ├── md-instruction/SKILL.md  ← คู่มือนี้
        ├── component-patterns/SKILL.md
        ├── button-system/SKILL.md
        ├── alert-system/SKILL.md
        ├── error-handling/SKILL.md
        ├── responsive-web/SKILL.md
        ├── mobile-dev/SKILL.md
        ├── image-system/SKILL.md
        └── generic-components/SKILL.md
```

---

## รูปแบบ SKILL.md (Template)

```markdown
---
name: <ชื่อ skill kebab-case>
description: <อธิบายสั้นๆ ว่า skill นี้ใช้เมื่อไหร่ — ใช้ภาษาไทย + English technical term>
---

# <ชื่อ Section>

## หัวข้อหลัก

### หัวข้อย่อย

**สิ่งสำคัญ**: ...

\`\`\`vue / javascript / scss
// ตัวอย่าง
\`\`\`

**✅ Good:**
\`\`\`
ตัวอย่างที่ถูกต้อง
\`\`\`

**❌ Bad:**
\`\`\`
ตัวอย่างที่ไม่ควรทำ
\`\`\`
```

---

## กฎการเขียน

### ภาษา
- ใช้ **ภาษาไทย** สำหรับคำอธิบาย
- ใช้ **English** เฉพาะ technical term (component, store, axios, etc.)
- ห้ามแปล technical term เป็นไทย

### Heading
- `#` — ชื่อ skill / หัวข้อหลักของไฟล์ (1 อันต่อไฟล์)
- `##` — หมวดหมู่หลัก
- `###` — หัวข้อย่อย
- ห้ามข้ามระดับ (เช่น `##` ตามด้วย `####`)

### Table
- ใช้ table เมื่อมีข้อมูล 3+ แถวที่มีโครงสร้างเหมือนกัน
- ทุก table ต้องมี header row
- จัด column ให้สั้น กระชับ

### Code Block
- ระบุ language เสมอ: ` ```vue `, ` ```javascript `, ` ```scss `, ` ```bash `
- ตัวอย่างต้องเป็น code จริงจากโปรเจกต์ ไม่ใช่ pseudocode

### ✅ / ❌ Pattern
- ใช้คู่กันเสมอ — ถ้ามี ✅ Good ต้องมี ❌ Bad ด้วย
- วางไว้ท้าย section ไม่ใช่กลาง

---

## วิธีปรับปรุง CLAUDE.md

เมื่อต้องเพิ่ม/แก้ไข content ใน CLAUDE.md:

1. ถามตัวเองว่า "content นี้เป็น gotcha / rule สำคัญ หรือเป็น how-to detail?"
   - **Gotcha / rule** → เขียนใน CLAUDE.md (สั้น 1-3 บรรทัด)
   - **How-to detail** → สร้าง/แก้ไข skill แล้ว @reference จาก CLAUDE.md
2. ถ้า CLAUDE.md เกิน 200 บรรทัดหลังแก้ → ต้อง extract section ที่ยาวที่สุดออกเป็น skill ใหม่

---

## วิธีสร้าง Skill ใหม่

1. สร้าง directory: `.claude/skills/<skill-name>/`
2. สร้างไฟล์: `SKILL.md` ตาม template ด้านบน
3. ตั้ง `description` ให้ครอบคลุม keyword ที่ user จะพูดถึง skill นี้
4. เพิ่ม reference ใน CLAUDE.md: `@.claude/skills/<skill-name>/SKILL.md`
