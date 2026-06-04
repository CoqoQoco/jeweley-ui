---
name: user-manual
description: สร้างปุ่มคู่มือ + manual modal พร้อม screenshot สำหรับหน้า feature — ใช้เมื่อต้องการ in-app user guide, help modal, คู่มือการใช้งาน
---

# User Manual Pattern

มาตรฐานสำหรับสร้างปุ่ม "คู่มือ" และ manual modal พร้อม screenshot ในระบบ

**Reference จริง**: `src/views/stock/move-location/modal/manual-view.vue`

---

## 1. ปุ่มเปิดคู่มือ

วางในกลุ่มขวาของ `.btn-submit-container-between` — ก่อนปุ่ม search:

```vue
<button class="btn btn-sm btn-outline-main mr-2" type="button" @click="$emit('manual')" title="คู่มือการใช้งาน">
  <i class="bi bi-journal-text"></i> คู่มือ
</button>
```

- ใช้ `btn-outline-main` (รอง — ไม่ใช่ action หลัก)
- ใช้ icon `bi bi-journal-text`
- label: "คู่มือ"
- ใช้ `mr-2` (Bootstrap 4) เพื่อเว้นระยะก่อนปุ่มถัดไป
- emit event ชื่อ `'manual'` ออกสู่ parent

### เพิ่ม emits

```javascript
emits: ['search', 'clear', 'manual']  // เพิ่ม 'manual'
```

---

## 2. Parent — รับ event + mount modal

```vue
<template>
  <searchView
    @manual="isShowManual = true"
  />
  <manualView
    :isShow="isShowManual"
    @closeModal="isShowManual = false"
  />
</template>

<script>
import manualView from './modal/manual-view.vue'

export default {
  components: { manualView },
  data() {
    return {
      isShowManual: false
    }
  }
}
</script>
```

---

## 3. Manual Modal — โครงสร้าง

ไฟล์: `modal/manual-view.vue` (kebab-case เสมอ)

```vue
<template>
  <modal
    :showModal="isShow"
    @closeModal="$emit('closeModal')"
    width="900px"
    :fitHeight="true"
    :clickToClose="true"
  >
    <template #title>
      <span class="title-text-lg px-3 pt-3 d-block">คู่มือการใช้งาน — <ชื่อฟีเจอร์></span>
    </template>

    <template #content>
      <div class="p-3">
        <!-- section ก) -->
        <h6 class="section-heading">ก) ชื่อ section</h6>

        <!-- step cards -->
        <div class="item-card">
          <div class="item-card-header">
            <span class="step-number">1</span>
            <span class="step-title">หัวข้อขั้นตอน</span>
          </div>
          <div class="item-card-body">
            <p class="step-desc">คำอธิบายสั้นๆ</p>
            <img :src="imgExample" alt="คำอธิบายรูป" class="manual-img" />
          </div>
        </div>

        <!-- section ข) -->
        <h6 class="section-heading mt-4">ข) ชื่อ section</h6>
        <!-- ... step cards ... -->
      </div>
    </template>
  </modal>
</template>
```

### Config modal

| Prop | ค่า | เหตุผล |
|---|---|---|
| `width` | `"900px"` | พอดีกับ screenshot กว้าง |
| `fitHeight` | `true` | modal ปรับสูงตาม content |
| `clickToClose` | `true` | คู่มือ read-only ปิดได้โดยคลิกนอก |

---

## 4. ที่เก็บ Screenshot

```
src/assets/manuals/<feature-name>/NN-ชื่อ.png
```

ตัวอย่าง:
```
src/assets/manuals/move-location/01-list.png
src/assets/manuals/move-location/02-select.png
src/assets/manuals/move-location/03-modal-target.png
```

### Import แบบ static (ต้องใช้เสมอ)

```javascript
import imgList from '@/assets/manuals/move-location/01-list.png'
import imgSelect from '@/assets/manuals/move-location/02-select.png'
```

แล้ว return ใน `data()`:

```javascript
data() {
  return {
    imgList,
    imgSelect
  }
}
```

ใช้ใน template:

```vue
<img :src="imgList" alt="หน้าแสดงรายการ" class="manual-img" />
```

**❌ Bad — ห้ามใช้ path string ตรงๆ:**
```vue
<img src="@/assets/manuals/move-location/01-list.png" />
```

---

## 5. SCSS ที่ต้องมี

```scss
<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';  // title-text-lg
@import '@/assets/scss/responsive-style/web';

.section-heading {
  color: var(--base-font-color);
  font-weight: 600;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
  background: transparent !important;
  margin-bottom: 16px;
}

.item-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
}

.item-card-header {
  background: #fdf2f2;
  color: var(--base-font-color);
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.step-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--base-font-color);
  color: #ffffff;
  font-size: 0.8rem;
  font-weight: 700;
  flex-shrink: 0;
}

.step-title {
  font-weight: 600;
  font-size: 0.95rem;
}

.item-card-body {
  padding: 12px 16px;
}

.step-desc {
  margin-bottom: 10px;
  font-size: 0.9rem;
  color: #444;
  line-height: 1.6;
}

.manual-img {
  width: 100%;
  max-width: 820px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: rgba(0, 0, 0, 0.06) 0 2px 8px;
  display: block;
}
</style>
```

---

## 6. Script โครงสร้างเต็ม

```javascript
import { defineAsyncComponent } from 'vue'

import imgStep1 from '@/assets/manuals/<feature>/01-step1.png'
import imgStep2 from '@/assets/manuals/<feature>/02-step2.png'

const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))

export default {
  name: 'ManualView',

  components: { modal },

  props: {
    isShow: {
      type: Boolean,
      default: false
    }
  },

  emits: ['closeModal'],

  data() {
    return {
      imgStep1,
      imgStep2
    }
  }
}
```

---

## ✅ / ❌

**✅ Good:**
```vue
<!-- ปุ่มในกลุ่มขวาก่อน search -->
<button class="btn btn-sm btn-outline-main mr-2" type="button" @click="$emit('manual')">
  <i class="bi bi-journal-text"></i> คู่มือ
</button>

<!-- modal width 900px + fitHeight + clickToClose -->
<modal :showModal="isShow" width="900px" :fitHeight="true" :clickToClose="true">
```

```javascript
// import static
import imgSelect from '@/assets/manuals/move-location/02-select.png'
data() { return { imgSelect } }
```

**❌ Bad:**
```vue
<!-- ห้ามวางปุ่มคู่มือหลังปุ่ม clear -->
<button class="btn btn-sm btn-dark" @click="onClear">ล้าง</button>
<button class="btn btn-sm btn-outline-main ml-2" @click="$emit('manual')">คู่มือ</button>

<!-- ห้ามใช้ path string ตรงๆ -->
<img src="@/assets/manuals/feature/01.png" />

<!-- ห้ามใช้ btn-main สำหรับปุ่มคู่มือ (ไม่ใช่ primary action) -->
<button class="btn btn-sm btn-main" @click="$emit('manual')">คู่มือ</button>
```
