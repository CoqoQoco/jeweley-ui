# PLAN: แก้ปัญหา Calendar ส่งวันที่ไม่ตรง (เลือก 21 ได้ 22, เลือก 23 ได้ 22)

## สถานะ: Pending Confirmation

---

## 1. Root Cause Analysis

### ปัญหาที่เกิด
หน้า `quotation/index-view.vue` เมื่อเลือกวันที่ใน CalendarGeneric เช่น เลือกวันที่ 21 แต่ API ได้รับวันที่ 22 หรือเลือก 23 แต่ได้ 22 — วันที่ที่ส่งไป API เป็นค่า **เก่า** เสมอ ไม่ใช่ค่าที่เลือกใหม่

### สาเหตุที่แท้จริง: Vue Watcher Timing Issue

**ลำดับเหตุการณ์ที่เกิดขึ้น:**

```
1. User คลิกวันที่ใน PrimeVue Calendar
2. PrimeVue Calendar อัปเดต v-model → localValue ใน CalendarGeneric เปลี่ยน ✅
3. PrimeVue Calendar emit "date-select" event → CalendarGeneric ส่งต่อ → parent onDateChange() ถูกเรียก
4. onDateChange() → loadList() → อ่าน this.filterDate ← ยังเป็นค่าเก่า! ❌
5. (ภายหลัง) Vue watcher บน localValue ทำงาน → emit update:modelValue → parent filterDate อัปเดต
```

**ปัญหาอยู่ที่ขั้นตอน 4-5**: Vue 3 Options API watcher ใช้ `flush: 'pre'` (default) ซึ่ง **ไม่ทำงานทันที** เมื่อ data เปลี่ยน แต่จะถูก queue ไว้ทำงานก่อน render ถัดไป

ดังนั้น เมื่อ `date-select` event ถูก emit จาก CalendarGeneric ไปยัง parent:
- `localValue` ใน CalendarGeneric **เปลี่ยนแล้ว** (v-model binding เป็น sync)
- แต่ watcher ที่ `emit('update:modelValue', newVal)` **ยังไม่ทำงาน** (queued)
- parent `filterDate` **ยังเป็นค่าเก่า**
- `onDateChange()` → `loadList()` อ่าน `this.filterDate` ได้ค่าเก่า

### ทำไมอาการเป็น +1 หรือ -1 ไม่แน่นอน?

เพราะค่าที่ API ได้รับคือ **ค่าเก่า** (วันที่ก่อนหน้าที่เลือกอยู่) ไม่ใช่ค่าใหม่:
- `filterDate` เริ่มต้น = วันนี้ (22)
- เลือกวันที่ 21 → API ได้ 22 (ค่าเก่า) → ดูเหมือน +1
- เลือกวันที่ 23 → API ได้ 22 (ค่าเก่า) → ดูเหมือน -1

### โค้ดที่มีปัญหา

**CalendarGeneric.vue** (บรรทัด 98-110):
```javascript
watch: {
  modelValue(newVal) {
    this.localValue = newVal
  },
  localValue(newVal) {
    // ← watcher นี้ถูก queue ไว้ ไม่ทำงานทันที!
    this.$emit('update:modelValue', newVal)
  }
},

methods: {
  onDateSelect(event) {
    // ← event นี้ถูก emit ก่อนที่ watcher ข้างบนจะทำงาน
    this.$emit('date-select', event)
  }
}
```

**index-view.vue** (บรรทัด 101-103):
```javascript
onDateChange() {
  // ← this.filterDate ยังเป็นค่าเก่า ณ จุดนี้
  this.loadList()
},
```

---

## 2. วิธีแก้ไข

### แก้ที่ CalendarGeneric.vue (Root Cause Fix)

**วิธีแก้**: ใน `onDateSelect()` ให้ emit `update:modelValue` แบบ synchronous ก่อน emit `date-select` — เพื่อให้ parent v-model อัปเดตก่อนที่ event handler จะทำงาน

**ไฟล์**: `src/components/prime-vue/CalendarGeneric.vue`

```javascript
// ก่อนแก้:
methods: {
  onDateSelect(event) {
    this.$emit('date-select', event)
  }
}

// หลังแก้:
methods: {
  onDateSelect(event) {
    // Force v-model sync update ก่อน date-select event
    // เพราะ watcher บน localValue ใช้ flush:'pre' (async)
    // ต้อง emit update:modelValue ตรงนี้เพื่อให้ parent ได้ค่าใหม่ทันที
    this.$emit('update:modelValue', this.localValue)
    this.$emit('date-select', event)
  }
}
```

**เหตุผล**:
- `this.$emit()` ใน Vue 3 trigger parent event handler แบบ **synchronous**
- เมื่อ `onDateSelect` ถูกเรียก, `localValue` เปลี่ยนเป็นค่าใหม่แล้ว (v-model กับ PrimeVue Calendar เป็น sync)
- โดย emit `update:modelValue` ก่อน `date-select` → parent `filterDate` จะอัปเดตก่อน `onDateChange()` ทำงาน
- watcher ที่ queued อยู่จะยังทำงานทีหลัง แต่ emit ค่าเดิมซ้ำ ซึ่งไม่มีผลข้างเคียง (Vue ไม่ re-render ถ้าค่าเท่าเดิม)

### ลำดับเหตุการณ์หลังแก้

```
1. User คลิกวันที่ใน PrimeVue Calendar
2. PrimeVue Calendar อัปเดต v-model → localValue เปลี่ยน ✅
3. PrimeVue Calendar emit "date-select" → CalendarGeneric.onDateSelect() ถูกเรียก
4. onDateSelect() emit "update:modelValue" → parent filterDate อัปเดตทันที ✅
5. onDateSelect() emit "date-select" → parent onDateChange() ถูกเรียก
6. onDateChange() → loadList() → อ่าน this.filterDate → ได้ค่าใหม่ ✅
```

---

## 3. สรุปไฟล์ที่ต้องแก้ไข

| # | ไฟล์ | สิ่งที่เปลี่ยน |
|---|------|--------------|
| 1 | `src/components/prime-vue/CalendarGeneric.vue` | เพิ่ม `this.$emit('update:modelValue', this.localValue)` ใน `onDateSelect()` ก่อน emit `date-select` |

**หมายเหตุ**: แก้แค่ 1 ไฟล์, 1 บรรทัด — เป็น root cause fix ที่ CalendarGeneric ทำให้ทุก component ที่ใช้ CalendarGeneric ได้ประโยชน์

---

## 4. Verification

1. เปิดหน้า Quotation List (mobile)
2. ค่าเริ่มต้นเป็นวันนี้ → รายการแสดงถูกต้อง
3. เลือกวันที่อื่น (เช่น เมื่อวาน) → รายการต้อง reload เป็นของวันนั้น ไม่ใช่วันเดิม
4. เลือกวันที่อีกครั้ง (เช่น พรุ่งนี้) → รายการต้อง reload เป็นของวันใหม่
5. กด Today ใน button bar → กลับเป็นวันนี้ถูกต้อง
6. ตรวจสอบ Network tab: `quotationDateStart` / `quotationDateEnd` ต้องตรงกับวันที่ที่เลือก
