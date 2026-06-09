---
name: chrome-mcp-testing
description: ใช้ chrome-devtools MCP สร้างและรัน test case (E2E/manual UI test) กับ Jewelry UI — ใช้เมื่อต้องทดสอบ flow บนหน้าจอจริง, verify feature, เขียน test case, หรือ reproduce bug ผ่าน browser อัตโนมัติ
---

# Chrome DevTools MCP Testing

ใช้ chrome-devtools MCP tool เพื่อควบคุม browser อัตโนมัติ — ทดสอบ UI flow จริง, เก็บหลักฐาน screenshot และ assert ผลลัพธ์โดยไม่ต้องทดสอบมือ

---

## เมื่อไหร่ใช้ + Prerequisites

### ใช้เมื่อ
- ทดสอบ flow UI จริงตั้งแต่ต้นจนจบ (E2E)
- Verify feature หลัง implement เสร็จ
- Reproduce bug ที่รายงานมา
- Regression check ก่อน deploy

### ก่อนเริ่ม (Prerequisites)
- **Dev server** ต้องรันอยู่: `npm run dev` → http://localhost:5173
- **API (jewelry-api)** ต้องรันอยู่ที่ port ที่กำหนด
- ตรวจ server ก่อนด้วย `list_pages` หรือ `navigate_page` — ถ้าหน้าไม่โหลดหรือ timeout ให้แจ้ง user เปิด server ก่อน **ห้ามเดาว่ารันอยู่**

> tool จริงมี prefix `mcp__chrome-devtools__` (เช่น `mcp__chrome-devtools__navigate_page`) — ในเนื้อหา skill นี้เขียนชื่อสั้นเพื่ออ่านง่าย

---

## Chrome MCP Tools Reference

| กลุ่ม | Tools | ใช้ตอน |
|---|---|---|
| Navigate | `navigate_page`, `new_page`, `list_pages`, `select_page` | เปิด URL ใหม่, สลับ tab, ดูรายการ page |
| Inspect | `take_snapshot`, `take_screenshot` | อ่าน a11y tree + uid / เก็บหลักฐาน visual |
| Interact | `click`, `fill`, `fill_form`, `hover`, `type_text`, `press_key`, `upload_file` | กระทำกับ element (อ้างด้วย uid จาก snapshot) |
| Wait | `wait_for` | รอ text ปรากฏบนหน้าหลัง navigate หรือ submit |
| Observe/Assert | `list_console_messages`, `list_network_requests`, `get_network_request`, `evaluate_script` | ตรวจ console error, API call, DOM |
| Dialog | `handle_dialog` | จัดการ native browser dialog (alert/confirm) |

---

## Core Workflow

Loop มาตรฐานสำหรับทุก interaction:

```
navigate_page(url)
  → wait_for(ข้อความที่ต้องปรากฏบนหน้า)
  → take_snapshot()                    # ได้ uid ของแต่ละ element
  → click(uid) / fill(uid, value)      # interact ด้วย uid จาก snapshot นี้
  → wait_for(ผลลัพธ์ที่คาดหวัง)
  → take_snapshot()                    # snapshot ใหม่หลัง DOM เปลี่ยน
  → take_screenshot()                  # เก็บหลักฐาน
  → list_console_messages()            # ตรวจ error
  → list_network_requests()            # ตรวจ API call
  → บันทึกผล Pass/Fail
```

**กฎเหล็ก: ต้อง `take_snapshot` ใหม่ก่อน interact ทุกครั้งที่ DOM เปลี่ยน — uid ไม่คงที่ข้าม snapshot**

---

## Gotchas เฉพาะแอปนี้

### axios global loading overlay
- ไฟล์: `src/axios/axios-helper.js`, z-index 9999
- หลังกดปุ่มที่ยิง API ต้อง `wait_for` ให้ข้อมูลหรือผลลัพธ์ปรากฏก่อน snapshot ถัดไป
- ✅ `wait_for('ข้อความในตาราง')` หลัง submit
- ❌ `take_snapshot()` ทันทีหลังคลิก — อาจจับ loading overlay แทน

### sweetAlerts (SweetAlert2)
- ไฟล์: `src/services/alert/sweetAlerts.js`
- success/error/confirm popup ลอยอยู่บนหน้า — `take_snapshot` จะเห็นปุ่มใน popup (เช่น "ตกลง", "ยืนยัน", "ยกเลิก")
- ✅ `wait_for('ข้อความใน popup')` → `take_snapshot()` → `click(uid ของปุ่ม swal)`
- ❌ interact กับ element หน้าหลักขณะ popup ลอยอยู่

### DataTableWithPaging
- ตารางมี pagination และ virtual scroll
- ✅ assert จำนวนแถวหรือข้อความผ่าน snapshot text หรือ `evaluate_script`
- ❌ อย่า assume ว่า row ที่ต้องการอยู่ในหน้าแรกเสมอ — scroll หรือเปลี่ยนหน้าก่อนถ้าจำเป็น

### Login ก่อนทุกหน้า
- เกือบทุกหน้าต้อง login ก่อนเข้าถึงได้
- ✅ ขอ credential จาก user ก่อนเริ่ม test หรือ reuse session ที่ login ค้างไว้
- ❌ ห้าม hardcode รหัสผ่านใน skill หรือ test case ใดๆ

### Thai text
- ✅ assert ด้วยข้อความไทยตรงๆ ใน `wait_for` ได้เลย เช่น `wait_for('บันทึกสำเร็จ')`

---

## Test Case Template + การเก็บไฟล์

### ที่เก็บ
`docs/test-cases/TC-<feature>-<NN>.md` (จาก repo root)

### Template

```markdown
# TC-<feature>-<NN>: <ชื่อ test case>

**Feature**: <ชื่อ feature>
**วันที่ทดสอบ**: YYYY-MM-DD
**ผู้ทดสอบ**: <ชื่อ>
**ผลรวม**: Pass / Fail

## Precondition
- dev server รันอยู่ที่ http://localhost:5173
- API รันอยู่
- <เงื่อนไขเพิ่มเติม เช่น มีข้อมูลในระบบ>

## Steps

| ขั้นที่ | Action | Expected Result |
|---|---|---|
| 1 | <สิ่งที่ทำ> | <ผลที่คาดหวัง> |
| 2 | <สิ่งที่ทำ> | <ผลที่คาดหวัง> |
| 3 | <สิ่งที่ทำ> | <ผลที่คาดหวัง> |

## หลักฐาน (Screenshots)
- `<ชื่อไฟล์-01>.png` — <คำอธิบาย>
- `<ชื่อไฟล์-02>.png` — <คำอธิบาย>

## หมายเหตุ
<บันทึก bug หรือข้อสังเกต>
```

### ตัวอย่างกรอกจริง: TC Login

```markdown
# TC-auth-01: ทดสอบ Login สำเร็จ

**Feature**: Authentication
**วันที่ทดสอบ**: 2026-06-08
**ผู้ทดสอบ**: Claude
**ผลรวม**: Pass

## Precondition
- dev server รันอยู่ที่ http://localhost:5173
- มี user account ในระบบ

## Steps

| ขั้นที่ | Action | Expected Result |
|---|---|---|
| 1 | เปิด http://localhost:5173 | หน้า login ปรากฏ มีช่อง username และ password |
| 2 | กรอก username และ password ที่ถูกต้อง | ข้อความปรากฏในช่อง |
| 3 | กดปุ่ม "เข้าสู่ระบบ" | loading overlay ปรากฏชั่วคราว แล้วเข้าสู่ dashboard |

## หลักฐาน (Screenshots)
- `tc-auth-01-login-page.png` — หน้า login ก่อนกรอก
- `tc-auth-01-dashboard.png` — dashboard หลัง login สำเร็จ

## หมายเหตุ
-
```

---

## Assertion Patterns

### ตรวจ UI
- `take_snapshot()` → อ่าน text ใน a11y tree — ถ้าข้อความปรากฏ = Pass
- `evaluate_script('document.querySelector(".selector").textContent')` — อ่าน DOM ตรงๆ

### ตรวจ API
- `list_network_requests()` — ดู URL และ status ของทุก request
- `get_network_request(requestId)` — ดู request/response payload ละเอียด
- ตรวจ status 200/201 = สำเร็จ, 4xx/5xx = ผิดพลาด

### ตรวจ Error
- `list_console_messages()` — ต้องไม่มี error ที่ไม่คาดคิด (JavaScript error, uncaught exception)
- console.warn ที่รู้อยู่แล้วสามารถ ignore ได้ถ้าไม่กระทบ feature

### เก็บหลักฐาน
- `take_screenshot()` ทุกจุดสำคัญ: ก่อน action, หลัง action, popup ผลลัพธ์

---

## สิ่งที่ห้ามทำ

- ❌ ห้าม interact กับ element ด้วย uid เก่าจาก snapshot ก่อนหน้า — ต้อง `take_snapshot` ใหม่เสมอหลัง DOM เปลี่ยน
- ❌ ห้าม hardcode credential หรือ password ใน test case หรือ skill
- ❌ ห้ามถือว่า dev server หรือ API รันอยู่โดยไม่ตรวจสอบก่อน
- ❌ ห้าม assert ทันทีหลังกดปุ่มโดยไม่ `wait_for` — ต้องรอ loading/popup หายก่อนเสมอ
