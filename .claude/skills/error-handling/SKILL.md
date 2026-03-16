---
name: error-handling
description: กฎการจัดการ error และ loading state — ใช้เมื่อเขียน API call, async function, หรือ form submission ใดๆ
---

# Error Handling & Loading State

## กฎหลัก

> axios middleware ใน `src/axios/axios-helper.js` จัดการ **error** และ **loading** อัตโนมัติอยู่แล้ว

ดังนั้น:
- ❌ ห้ามใช้ try-catch ครอบ API call ธรรมดา
- ❌ ห้าม set `this.loading = true/false` สำหรับ API call ผ่าน Pinia store

---

## Error Handling

**✅ Good — ให้ axios จัดการเอง:**
```javascript
async loadData() {
  const response = await this.store.fetchData()
  this.data = response.data
}
```

**❌ Bad — try-catch ที่ไม่จำเป็น:**
```javascript
async loadData() {
  try {
    const response = await this.store.fetchData()
    this.data = response.data
  } catch (err) {
    error(err.message, 'ไม่สามารถโหลดข้อมูลได้')  // axios จัดการให้อยู่แล้ว
  }
}
```

**✅ Good — try-catch เฉพาะเมื่อมี recovery logic จริงๆ:**
```javascript
async loadData() {
  try {
    const response = await this.store.fetchData()
    this.data = response.data
  } catch (err) {
    this.data = this.getDefaultData()  // fallback ที่ต้องการจริงๆ
  }
}
```

### เมื่อไหร่ใช้ try-catch ได้
- ต้องการ retry หรือ fallback data
- ต้องการ prevent error propagation สำหรับ non-critical operation
- มี error handling หลายสถานการณ์ซับซ้อน

### เมื่อไหร่ห้ามใช้ try-catch
- Standard API call ผ่าน Pinia store
- Simple data fetching
- Form submission ทั่วไป

---

## Loading State

**✅ Good — ให้ axios middleware จัดการ:**
```javascript
async loadData() {
  const response = await this.store.fetchData()
  this.data = response.data
}
```

**❌ Bad — manual loading:**
```javascript
async loadData() {
  this.loading = true   // ❌
  const response = await this.store.fetchData()
  this.data = response.data
  this.loading = false  // ❌
}
```

**✅ Good — local loading เฉพาะกรณีที่ต้องการ button-specific spinner:**
```javascript
async loadData() {
  this.buttonLoading = true  // เฉพาะ UI พิเศษที่ global loading ไม่ครอบคลุม
  const response = await this.store.fetchData()
  this.data = response.data
  this.buttonLoading = false
}
```

### เมื่อไหร่ใช้ local loading ได้
- Component-specific spinner (เช่น ปุ่มเดียวใน form ที่มีหลาย action)
- Multiple simultaneous API calls ที่ต้องแยก track
- Custom loading behavior ที่ต่างจาก global

### เมื่อไหร่ห้ามใช้ local loading
- Standard API call ผ่าน Pinia store
- Page-level data fetching
- Form submission ทั่วไป
