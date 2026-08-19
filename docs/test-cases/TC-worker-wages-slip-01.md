# TC-worker-wages-slip-01: สลิปค่าแรงตามพนักงาน (สถานะสำเร็จ) ต้องไม่หลุดขอบกระดาษ

**Feature**: พิมพ์สลิปค่าแรงตามพนักงาน — `worker-wages-success-pdf-builder.js`
**Ticket**: TK202608080002 (จำนวนเงินตกขอบกระดาษ หลังเพิ่มคอลัมน์ น้ำหนักจ่าย/น้ำหนักรับ)
**วันที่ทดสอบ**: 2026-08-19
**ผู้ทดสอบ**: Claude
**ผลรวม**: Pass (ครบทุกขั้น รวม UI flow เต็มรูปแบบ)

## Precondition

- UI dev server รันอยู่ที่ http://localhost:2002 (`npm run dev`)
- jewelry-api รันอยู่ที่ http://localhost:2001 (ตาม `VITE_JEWELRY_API_URL` ใน `.env`)
- มีข้อมูลค่าแรงของช่าง A005 ช่วง 14/08/2026 (มีอยู่จริงใน prod 16 แถว)
- ทดสอบนี้เป็น **read-only** ทั้งหมด — ไม่มีการเขียนข้อมูล

## Steps

| ขั้นที่ | Action | Expected Result |
|---|---|---|
| 1 | เปิด http://localhost:2002 แล้ว login | เข้าระบบได้ ไม่มี dialog "You are not authorized" |
| 2 | ไปหน้า `/worker-daily-wages/A005` | หน้าค่าแรงรายวันของช่าง A005 ปรากฏ |
| 3 | เลือกช่วงวันที่ 14/08/2026 - 14/08/2026 แล้วกดค้นหา | ตารางแสดง 16 แถว · รวม 34 ชิ้น / จ่าย 146.34 / รับ 116.49 / 3,444.00 บาท |
| 4 | กดปุ่ม "พิมพ์สลิปสถานะสำเร็จ" | เปิด tab ใหม่แสดง PDF (`generatePDF().open()`) |
| 5 | ตรวจ PDF | ทุกคอลัมน์อยู่ในกรอบกระดาษ A4 แนวตั้ง — โดยเฉพาะ **จำนวนเงิน** ต้องเห็นครบทุกแถวและแถวรวม · ไม่มีข้อความตัดกลางคำ |
| 6 | `list_console_messages()` | ไม่มี JavaScript error |

## Assertion แบบวัดค่า (ไม่พึ่งสายตา)

ขั้นที่ 5 ตัดสินด้วยตัวเลข ไม่ใช่การมองภาพ — ดึง PDF ที่ builder สร้างจริงใน browser ออกมาเป็น base64 แล้ววัดตำแหน่งหมึก

**5.1 สร้าง PDF จากโมดูลจริงผ่าน Vite dev server** (`evaluate_script` บน origin localhost:2002):

```js
async () => {
  const mod = await import('/src/services/helper/pdf/worker-wages/worker-wages-success-pdf-builder.js')
  const items = [ /* 16 แถวของ A005 14/08/2026 */ ]
  const builder = new mod.WorkerWagesSuccessPdfBuilder(
    { code: 'A005', nameTh: 'อภิรมย์' },
    { requestDateStart: '2026-08-14', requestDateEnd: '2026-08-14' },
    items, 'wages'
  )
  return await new Promise((resolve) => builder.generatePDF().getBase64(resolve))
}
```

**5.2 วัดตำแหน่งหมึกขวาสุดในไฟล์ PDF** (node — inflate content stream แล้วหา x ของ operator `Td`/`Tm`):

```js
const buf = fs.readFileSync('slip.pdf')            // decode จาก base64 ข้างบน
// ...หา stream ทุกก้อน → zlib.inflateSync → regex /([\d.]+)\s+([\d.]+)\s+Td|1\s+0\s+0\s+1\s+([\d.]+)\s+([\d.]+)\s+Tm/g
// PASS เมื่อ maxX <= 575.28 (ขอบ margin ขวา; กระดาษ A4 = 595.28, pageMargins [20,20,20,10])
```

**เกณฑ์ผ่าน**: `maxX <= 575.28`

| | ก่อนแก้ | หลังแก้ |
|---|---|---|
| ตำแหน่งหมึกขวาสุด | **581.89** ❌ (เลยขอบ margin, ห่างขอบกระดาษ 13.4pt → เลขโดนตัด) | **550.53** ✅ |
| ความกว้างตาราง vs พื้นที่พิมพ์ได้ | 498.64 / 464.28 → ล้น +34.36pt | 515.28 / 515.28 → 0.00pt |

## ผลการรัน (2026-08-19)

| ขั้น | ผล | หมายเหตุ |
|---|---|---|
| 1-2 | **Pass** | login แล้วเข้าหน้า `/worker-daily-wages/A005` ได้ (แสดง "ตรวจสอบค่าแรงช่าง : A005 - อภิวัฒ") |
| 3 | **Pass** | ตั้งวันที่ 14/08/2026 ทั้งสองช่อง → ค้นหา → "จำนวน 16 รายการ" ตรงกับข้อมูล prod |
| 4 | **Pass** | กด "พิมพ์สลิปสถานะสำเร็จ" → builder สร้าง PDF 12,529 bytes (ดัก blob ผ่าน `URL.createObjectURL` แทนการเปิด tab ใหม่) |
| 5 | **Pass** | maxX = **550.53** ≤ 575.28 ✅ · ทุกคอลัมน์อยู่ในหน้า · แถวรวม 34 / 146.34 / 116.49 / 3,444.00 ครบ · 1 หน้า |
| 6 | **Pass** | ไม่มี console error |

ตรวจซ้ำอีกทางก่อนหน้านี้: เรียกโมดูล builder ตรงๆ ผ่าน Vite dev server (`import('/src/services/helper/pdf/...')`) ด้วยข้อมูลชุดเดียวกัน → maxX = 550.53 เท่ากัน

ทดสอบเสริมนอก browser (node harness ยิงไฟล์ builder ตัวเดียวกัน + monkey-patch `columnCalculator.buildColumnWidths`):

| ชุดข้อมูล | overflow |
|---|---|
| wages — ข้อมูลจริง A005 | 0.00pt ✅ |
| wages — stress (รหัสสินค้า 15 ตัว, แผนก "คัดพลอย", รายละเอียดไทยยาว, ยอด 18,762.25) | 0.00pt ✅ |
| goldLoss — จริง + stress | 0.00pt ✅ |

## หลักฐาน (Screenshots)

- `tc-worker-wages-slip-01-before.png` — ก่อนแก้: คอลัมน์จำนวนเงินถูกตัดที่ขอบขวา
- `tc-worker-wages-slip-01-after.png` — หลังแก้: ภาพสลิปที่ได้จากการกดปุ่มพิมพ์จริงในแอป
- `tc-worker-wages-slip-01-after.pdf` — ไฟล์ PDF ตัวจริงที่แอปสร้างตอนกดปุ่ม (ไว้ตรวจซ้ำ)

## หมายเหตุ

- ปุ่มพิมพ์ใช้ `generatePDF().open()` → เปิด blob URL ใน tab ใหม่ ซึ่ง **Chrome MCP screenshot ไม่ติดภาพ PDF viewer** — ใน test ให้ดัก `URL.createObjectURL` + stub `window.open` เพื่อดึงไฟล์มาตรวจแทนการเปิด tab แล้ว render เป็น PNG ด้วย `uv run --with pypdfium2 --with pillow`
- ช่องวันที่เป็น PrimeVue Calendar แบบ `readonly` → `fill` ข้อความตรงๆ ไม่ติด ต้องกดปุ่มปฏิทินแล้วคลิกวันที่ (หัวปฏิทินเป็นภาษาอังกฤษ เช่น "August 2026")
- ตารางผลลัพธ์มี ~100+ แถว ทำให้ `take_snapshot` ใหญ่เกิน token limit — ใช้ `evaluate_script` อ่านค่าที่ต้องการแทน
- ห้ามรัน E2E ที่เขียนข้อมูลบนเครื่อง local — API local ชี้ DB prod
