---
name: composables
description: วิธีใช้ composable/mixin ที่มีอยู่ — useDataTablePaging (paging+sort mixin) และ confirmThenSubmit (confirm dialog helper) — ใช้เมื่อสร้าง DataTable ที่มี paging หรือ form ที่ต้องยืนยันก่อน submit
---

# Composables

## useDataTablePaging

**ไฟล์:** `src/composables/useDataTablePaging.js`

**Pattern**: Options API mixin — ใช้กับ `mixins: [dataTablePaging]`

เพิ่ม data: `skip`, `take`, `sort` และ methods: `handlePageChange`, `handleSortChange`, `resetPaging`

**ข้อกำหนด**: component ที่ใช้ mixin นี้ **ต้องมี `fetchData()` method เองเสมอ** — mixin จะเรียก `this.fetchData()` หลังทุก page/sort change

### วิธีใช้

```javascript
import dataTablePaging from '@/composables/useDataTablePaging.js'

export default {
  mixins: [dataTablePaging],

  data() {
    return {
      dataList: [],
      total: 0
    }
  },

  mounted() {
    this.fetchData()
  },

  methods: {
    async fetchData() {
      const res = await this.myStore.fetchList({
        take: this.take,    // จาก mixin
        skip: this.skip,    // จาก mixin
        sort: this.sort     // จาก mixin
      })
      if (res) {
        this.dataList = res.data
        this.total = res.total
      }
    },

    onSearch() {
      this.resetPaging()  // reset skip=0 แล้วเรียก fetchData() อัตโนมัติ
    }
  }
}
```

### Template

```vue
<BaseDataTable
  :items="dataList"
  :totalRecords="total"
  :columns="columns"
  :perPage="take"
  @page="handlePageChange"
  @sort="handleSortChange"
/>
```

### ค่า default ของ mixin

| Data | Default | คำอธิบาย |
|---|---|---|
| `skip` | 0 | offset สำหรับ pagination |
| `take` | 10 | จำนวน record ต่อหน้า |
| `sort` | `[]` | sort array `[{ field, dir }]` |

### Methods ที่ได้จาก mixin

| Method | ทำงาน |
|---|---|
| `handlePageChange(e)` | ตั้ง skip/take จาก event แล้วเรียก fetchData() |
| `handleSortChange(e)` | ตั้ง skip/take/sort จาก event แล้วเรียก fetchData() |
| `resetPaging()` | reset skip=0 แล้วเรียก fetchData() |

**✅ Good:**
```javascript
mixins: [dataTablePaging],
methods: {
  async fetchData() {
    const res = await this.store.getList({ skip: this.skip, take: this.take, sort: this.sort })
    if (res) { this.list = res.data; this.total = res.total }
  }
}
```

**❌ Bad — เขียน handlePageChange เองซ้ำ:**
```javascript
methods: {
  handlePageChange(e) {   // ❌ เขียนซ้ำจาก mixin
    this.skip = e.first
    this.take = e.rows
    this.fetchData()
  }
}
```

---

## confirmThenSubmit

**ไฟล์:** `src/composables/useConfirmSubmit.js`

Helper function ห่อ `sweetAlerts.confirmSubmit` — ลดโค้ดซ้ำใน form/modal ที่ต้องยืนยันก่อน submit

### Import

```javascript
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
```

### Signature

```javascript
confirmThenSubmit(message, title, onConfirm, buttonInfo?, icon?, msgStyle?)
```

| Param | Type | คำอธิบาย |
|---|---|---|
| `message` | string | ข้อความในกล่องยืนยัน (เช่น รหัส : ชื่อรายการ) |
| `title` | string | หัวข้อกล่องยืนยัน |
| `onConfirm` | Function | callback เมื่อผู้ใช้กด "ยืนยัน" |
| `buttonInfo` | Object? | ปรับ label ปุ่ม `{ confirmText?, cancelText? }` |
| `icon` | string? | `'warning'` (default), `'question'`, `'info'` |
| `msgStyle` | string? | inline style สำหรับ message |

### ตัวอย่าง

```javascript
// แบบ basic — บันทึก
confirmThenSubmit(
  `${this.form.code} : ${this.form.name}`,
  'ยืนยันการบันทึก',
  async () => {
    await this.onSubmit()
  }
)

// แบบกำหนด buttonInfo — ลบ
confirmThenSubmit(
  `รหัส: ${item.code}`,
  'ยืนยันการลบ',
  () => this.onDelete(item.id),
  { confirmText: 'ลบเลย', cancelText: 'ยกเลิก' }
)
```

**✅ Good — ใช้ confirmThenSubmit:**
```javascript
onSave() {
  confirmThenSubmit(`${this.form.code} : ${this.form.name}`, 'ยืนยันบันทึก', async () => {
    await this.myStore.save(this.form)
    success('บันทึกสำเร็จ')
  })
}
```

**❌ Bad — เขียน confirmSubmit ตรงๆ ซ้ำทุก method:**
```javascript
onSave() {
  confirmSubmit(`${this.form.code} : ${this.form.name}`, 'ยืนยันบันทึก', async () => {
    await this.myStore.save(this.form)
    success('บันทึกสำเร็จ')
  })
}
```

หมายเหตุ: `confirmThenSubmit` และ `confirmSubmit` ทำงานเหมือนกัน แต่การใช้ `confirmThenSubmit` ทำให้ track ได้ว่าทุก submit ผ่าน composable เดียวกัน
