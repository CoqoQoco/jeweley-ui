# 05 · Claude Design — Setup โครงสร้างโปรเจกต์

> **วัตถุประสงค์**: ขั้นตอนตั้งค่า "โครงสร้างโปรเจกต์" บน Claude Design (claude.ai Beta) ให้พร้อม redesign
> ผู้ใช้เป็นคนกดในเครื่องมือ — เอกสารนี้บอกว่ากดอะไร วางอะไร ตามลำดับ

---

## ภาพรวมโครงสร้างที่จะวาง

```
Design System: "Duangkeaw Jewelry DS"         ← foundation (seed จาก 00 + 01)
  ├─ Color tokens        (จาก 00-design-language)
  ├─ Spacing / Radius / Elevation / Type
  └─ Component specs     (จาก 01-component-catalog)

Projects:
  ├─ P0 · Foundation & Components   ← Phase 1 redesign component ทีละตัว
  ├─ P1 · Archetype — List page
  ├─ P2 · Archetype — Create/Edit
  ├─ P3 · Archetype — Detail / Dashboard
  ├─ P4 · Archetype — Modal form
  └─ P5+ · ต่อ business module (ใช้ archetype ที่ approve)
```

---

## ขั้นที่ 1 — สร้าง Design System

1. หน้าแรก Claude Design → กดเมนู **Design System** (chip ใต้กล่อง prompt) → **สร้างใหม่**
2. ตั้งชื่อ: `Duangkeaw Jewelry DS`
3. วาง seed: copy **`00-design-language.md`** ทั้งไฟล์ลงช่อง prompt/description ของ design system
   - ถ้ามีช่องแยกสำหรับ color → กรอก palette จากตารางใน `00`
4. เพิ่ม component specs: copy ส่วนที่ต้องการจาก **`01-component-catalog.md`**
5. (ทางเลือก) แนบ screenshot หน้าจริง 2–3 หน้า (list/form/modal) เป็น visual reference

> **ทางที่ดีกว่า — ต่อ MCP**: ถ้า `design-system-mcp` (ดู `06`/ไฟล์ server) deploy เป็น remote ได้แล้ว
> และ Claude Design รับ custom connector → เพิ่มเป็น Connector แล้วให้มันดึง token สด แทนการ copy-paste
> (ยังต้องเทสต์ว่า Beta รองรับ — เป็น gate)

---

## ขั้นที่ 2 — สร้าง Project "Foundation & Components" (P0)

1. **start a blank project** หรือเลือก template **Wireframe** / **Prototype**
2. ผูกกับ Design System `Duangkeaw Jewelry DS`
3. ทำทีละ component ตามลำดับใน `04-redesign-playbook.md` (Phase 1 รอบ 1→7)
   - ใช้ **Prompt Template (Component)** จาก `04`
   - 1 component = 1 frame/section ในโปรเจกต์ พร้อม annotation state

---

## ขั้นที่ 3 — สร้าง Project ต่อ Archetype (P1–P4)

1. โปรเจกต์ละ 1 archetype (List / Create-Edit / Detail+Dashboard / Modal)
2. ใช้ wireframe จาก `03-page-archetypes.md` วางเป็นโครง
3. ดึง component ที่ approve จาก P0 มาประกอบ
4. ตรวจ responsive (desktop + tablet ≤1024px)

---

## ขั้นที่ 4 — Project ต่อ Business Module (P5+, ภายหลัง)

หยิบ archetype ที่ approve แล้วมาเติม content จริงต่อ module (เริ่ม sale/production ที่ซับซ้อนสุด)
ดู module list ใน `02-information-architecture.md`

---

## Model ในเครื่องมือ

- งานดีไซน์ที่ต้องความละเอียด/ตัดสินใจ visual → เลือก model ที่แรงสุดที่มีในตัวเลือก
- งาน iterate เร็วๆ หลายรอบ → model เร็วได้

---

## Output → กลับเข้าโค้ด

ทุกดีไซน์ที่ approve → จดค่าที่เปลี่ยน (token/variant/ขนาด) ลง **Tracking Table** ใน `04` →
ส่งให้ `@ui-implementer` map เข้า `variable.scss`/ไฟล์ component (Phase 3) → **อย่าแก้โค้ดจากในเครื่องมือ Claude Design ตรงๆ**

---

## Checklist ตั้งค่าเสร็จ

- [ ] มี Design System `Duangkeaw Jewelry DS` พร้อม palette + token
- [ ] component specs จาก `01` อยู่ใน design system
- [ ] Project P0 (Foundation & Components) สร้างแล้ว ผูก design system
- [ ] Project P1–P4 (archetypes) สร้างโครงจาก `03` แล้ว
- [ ] (ถ้าใช้) ทดสอบ connector `design-system-mcp` ดึง token ได้
