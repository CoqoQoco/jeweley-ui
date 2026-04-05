---
name: modal-system
description: การสร้าง Modal dialog — ใช้เมื่อสร้าง modal, popup form, dialog แสดงรายละเอียด
---

# Modal System

## Base Component

**ไฟล์:** `src/components/modal/ModalView.vue`

ใช้ `vue-neat-modal` เป็น base — ห้ามใช้ PrimeVue Dialog ยกเว้นกรณีพิเศษ

---

## Props ของ ModalView

| Prop | Type | Default | คำอธิบาย |
|---|---|---|---|
| `showModal` | Boolean | - | เปิด/ปิด modal |
| `width` | String | `'85%'` | ความกว้าง (px หรือ %) |
| `clickToClose` | Boolean | `false` | คลิกนอก modal เพื่อปิด |
| `fitHeight` | Boolean | `false` | ปรับความสูงตาม viewport |
| `isShowActionPart` | Boolean | `false` | แสดง footer สำหรับ action buttons |

## Slots

| Slot | คำอธิบาย |
|---|---|
| `#title` | หัวข้อ modal |
| `#content` | เนื้อหาหลัก |
| `#action` | ปุ่ม action ใน footer (ต้อง `isShowActionPart=true`) |
| `#loading` | Loading overlay |

---

## วิธีสร้าง Modal ใหม่

### 1. สร้างไฟล์ modal

วางใน `modal/` subdirectory ของ feature:

```
views/feature-name/
├── index-view.vue
├── components/
└── modal/
    └── my-modal.vue      ← สร้างที่นี่
```

### 2. โครงสร้าง Modal Component

```vue
<template>
  <modal :showModal="isShow" @closeModal="$emit('closeModal')" width="900px">
    <template #title>
      <span class="title-text-lg">ชื่อ Modal</span>
    </template>
    <template #content>
      <!-- เนื้อหา -->
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))

export default {
  name: 'MyModal',

  components: { modal },

  props: {
    isShow: {
      type: Boolean,
      default: false
    }
  },

  emits: ['closeModal']
}
</script>
```

### 3. เรียกใช้จาก Parent

```vue
<template>
  <button class="btn btn-sm btn-main" @click="isShowModal = true">
    <i class="bi bi-plus"></i> เปิด Modal
  </button>

  <myModal
    :isShow="isShowModal"
    @closeModal="isShowModal = false"
    @submit="onSubmit"
  />
</template>

<script>
import myModal from './modal/my-modal.vue'

export default {
  components: { myModal },

  data() {
    return {
      isShowModal: false
    }
  },

  methods: {
    onSubmit(data) {
      // handle data
      this.isShowModal = false
    }
  }
}
</script>
```

---

## Pattern: Modal พร้อม Form

```vue
<template>
  <modal :showModal="isShow" @closeModal="$emit('closeModal')" width="600px"
    :isShowActionPart="true">
    <template #title>
      <span class="title-text-lg">สร้างรายการ</span>
    </template>
    <template #content>
      <div class="p-3">
        <div class="mb-2">
          <span class="title-text">ชื่อ</span>
          <input class="form-control" v-model="form.name" />
        </div>
        <div class="mb-2">
          <span class="title-text">ประเภท</span>
          <Dropdown v-model="form.type" :options="typeList"
            optionLabel="name" optionValue="id" />
        </div>
      </div>
    </template>
    <template #action>
      <button class="btn btn-sm btn-main" @click="onSubmit">
        <i class="bi bi-save"></i> บันทึก
      </button>
      <button class="btn btn-sm btn-outline-main" @click="$emit('closeModal')">
        ยกเลิก
      </button>
    </template>
  </modal>
</template>
```

---

## Pattern: Modal พร้อม DataTable

```vue
<template>
  <modal :showModal="isShow" @closeModal="$emit('closeModal')">
    <template #title>
      <span class="title-text-lg">รายการทั้งหมด</span>
    </template>
    <template #content>
      <div class="p-3">
        <BaseDataTable
          :items="items"
          :columns="columns"
          :totalRecords="total"
          :paginator="true"
          @page="handlePageChange"
        >
          <template #actionTemplate="{ data }">
            <button class="btn btn-sm btn-green" @click="onSelect(data)">
              <i class="bi bi-eye"></i>
            </button>
          </template>
        </BaseDataTable>
      </div>
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))

export default {
  components: { modal, BaseDataTable },
  // ...
}
</script>
```

---

## Import Pattern

| กรณี | วิธี Import |
|---|---|
| ModalView (base) | `defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))` |
| Modal ของ feature | Direct import: `import myModal from './modal/my-modal.vue'` |

---

## ขนาด Modal แนะนำ

| เนื้อหา | Width |
|---|---|
| Form เล็ก (2-3 fields) | `500px` - `600px` |
| Form กลาง | `700px` - `900px` |
| DataTable / เนื้อหาเยอะ | `1000px` - `1200px` |
| เต็มจอ | `85%` (default) |

---

## สิ่งที่ห้ามทำ

- ❌ ห้ามใช้ PrimeVue `<Dialog>` — ใช้ `ModalView.vue` เท่านั้น
- ❌ ห้ามใช้ `alert()` / `confirm()` ใน modal — ใช้ sweetAlerts
- ❌ ห้าม nest modal ซ้อนกันเกิน 2 ชั้น
- ❌ ห้ามใช้ `<table>` HTML ใน modal — ใช้ `DataTableWithPaging`
