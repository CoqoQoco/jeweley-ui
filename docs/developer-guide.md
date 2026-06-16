# Developer Guide — jeweley-ui

คู่มือนักพัฒนาหลังจาก Phase 0 Refactor เสร็จสมบูรณ์

---

## ภาพรวมสถาปัตยกรรม

```
jeweley-ui/
├── src/assets/scss/
│   ├── variable.scss        ← Design tokens (spacing/radius/shadow/typography/color)
│   ├── mixin.scss           ← Mixins (card-base, input-control, form-row-grid, button-variant)
│   └── main.scss            ← Global styles + btn-* classes
│
├── src/components/
│   ├── generic/             ← Generic UI wrappers (InputTextGeneric, ButtonGeneric ฯลฯ)
│   └── prime-vue/           ← PrimeVue wrappers (DataTableWithPaging, DropdownGeneric ฯลฯ)
│
├── src/composables/
│   ├── useDataTablePaging.js ← Options API mixin สำหรับ pagination + sort
│   └── useConfirmSubmit.js   ← Helper ห่อ confirmSubmit dialog
│
├── src/plugins/i18n/
│   └── config.js            ← i18n config + setLocale()
│
├── src/language/
│   ├── common/              ← common.btn.*, common.field.*, common.label.*
│   └── view/<feature>/      ← key เฉพาะแต่ละ feature
│
└── src/services/
    ├── alert/sweetAlerts.js ← แทน alert()/confirm()
    └── storage.js           ← แทน localStorage ตรงๆ
```

---

## ตารางชี้ Skill

| ต้องการทำอะไร | Skill ที่ต้องอ่าน |
|---|---|
| เขียน SCSS ใหม่ / ใช้ token spacing-radius-shadow | `@.claude/skills/design-system/SKILL.md` |
| เลือก component แทน native input/button/table/PrimeVue | `@.claude/skills/native-call-policy/SKILL.md` |
| เพิ่ม / ใช้ generic component | `@.claude/skills/generic-components/SKILL.md` |
| เพิ่ม key ภาษา / ใช้ $t() / สลับภาษา | `@.claude/skills/i18n-system/SKILL.md` |
| Page header / search bar / section card / form layout | `@.claude/skills/ui-layout/SKILL.md` |
| จัดโครงสร้าง folder / ตั้งชื่อไฟล์ | `@.claude/skills/code-structure/SKILL.md` |
| useDataTablePaging / confirmThenSubmit | `@.claude/skills/composables/SKILL.md` |
| สร้าง Modal | `@.claude/skills/modal-system/SKILL.md` |
| แสดงรูปจาก Azure Blob | `@.claude/skills/image-system/SKILL.md` |
| แสดง popup / confirm | `@.claude/skills/alert-system/SKILL.md` |
| จัดการ API call / loading | `@.claude/skills/error-handling/SKILL.md` |
| Responsive web layout | `@.claude/skills/responsive-web/SKILL.md` |
| Mobile component | `@.claude/skills/mobile-dev/SKILL.md` |
| ปุ่มคู่มือ + manual modal | `@.claude/skills/user-manual/SKILL.md` |
| ทดสอบ UI ด้วย chrome | `@.claude/skills/chrome-mcp-testing/SKILL.md` |

---

## Quick Reference: Import Path ที่ใช้บ่อย

```javascript
// Generic UI
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import TextareaGeneric from '@/components/generic/TextareaGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import PageHeaderGeneric from '@/components/generic/PageHeaderGeneric.vue'
import SearchBarGeneric from '@/components/generic/SearchBarGeneric.vue'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'

// PrimeVue Generics
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'
import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'
import CheckboxGeneric from '@/components/prime-vue/CheckboxGeneric.vue'

// Composables
import dataTablePaging from '@/composables/useDataTablePaging.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'

// Services
import { warning, error, success, confirmSubmit } from '@/services/alert/sweetAlerts.js'
import { storage } from '@/services/storage.js'
import { setLocale } from '@/plugins/i18n/config.js'
```

---

## ตัวอย่าง Form มาตรฐาน

Form ที่ใช้ generic component ครบชุด — ทำตามนี้เป็น reference สำหรับทุก feature ใหม่:

```vue
<template>
  <div class="app-container">
    <!-- Page Header (หน้า create/edit) -->
    <PageHeaderGeneric
      :title="isEditMode ? $t('view.myFeature.titleEdit') : $t('view.myFeature.titleCreate')"
      backRoute="my-feature-list"
    />

    <!-- Section Card -->
    <SectionCardGeneric :title="$t('view.myFeature.sectionInfo')">
      <!-- Form row 2 columns -->
      <div class="form-row two-col">
        <FormFieldGeneric :label="$t('common.field.code')" :required="true">
          <InputTextGeneric v-model="form.code" :trim="true" />
        </FormFieldGeneric>
        <FormFieldGeneric :label="$t('common.field.name')" :required="true">
          <InputTextGeneric v-model="form.name" />
        </FormFieldGeneric>
      </div>

      <div class="form-row two-col">
        <FormFieldGeneric :label="$t('common.field.type')">
          <DropdownGeneric
            v-model="form.type"
            :options="typeOptions"
            :showClear="true"
          />
        </FormFieldGeneric>
        <FormFieldGeneric :label="$t('common.field.status')">
          <DropdownGeneric
            v-model="form.status"
            :options="statusOptions"
          />
        </FormFieldGeneric>
      </div>

      <FormFieldGeneric :label="$t('common.field.remark')">
        <TextareaGeneric v-model="form.remark" :rows="3" />
      </FormFieldGeneric>

      <!-- Action buttons -->
      <div class="mt-3">
        <ButtonGeneric
          variant="main"
          icon="bi-save"
          :label="$t('common.btn.save')"
          @click="onSave"
        />
        <ButtonGeneric
          variant="outline"
          :label="$t('common.btn.cancel')"
          class="ml-2"
          @click="$router.push({ name: 'my-feature-list' })"
        />
      </div>
    </SectionCardGeneric>
  </div>
</template>

<script>
import { useMyFeatureStore } from '@/stores/modules/api/my-feature-store.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { success } from '@/services/alert/sweetAlerts.js'

import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import TextareaGeneric from '@/components/generic/TextareaGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import PageHeaderGeneric from '@/components/generic/PageHeaderGeneric.vue'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'

export default {
  name: 'my-feature-form',

  components: {
    InputTextGeneric, TextareaGeneric, ButtonGeneric,
    FormFieldGeneric, PageHeaderGeneric, SectionCardGeneric,
    DropdownGeneric
  },

  data() {
    return {
      form: { code: '', name: '', type: null, status: null, remark: '' },
      typeOptions: [],
      statusOptions: []
    }
  },

  computed: {
    isEditMode() { return !!this.$route.params.id },
    store() { return useMyFeatureStore() }
  },

  async mounted() {
    await this.loadMasterData()
    if (this.isEditMode) await this.loadDetail()
  },

  methods: {
    async loadMasterData() {
      const res = await this.store.getOptions()
      if (res) {
        this.typeOptions = res.types
        this.statusOptions = res.statuses
      }
    },

    async loadDetail() {
      const res = await this.store.getById(this.$route.params.id)
      if (res) this.form = { ...res }
    },

    onSave() {
      if (!this.form.code || !this.form.name) {
        return
      }
      confirmThenSubmit(
        `${this.form.code} : ${this.form.name}`,
        this.$t('common.btn.confirm'),
        async () => {
          const res = this.isEditMode
            ? await this.store.update(this.$route.params.id, this.form)
            : await this.store.create(this.form)
          if (res) {
            success(this.$t('common.btn.save'))
            this.$router.push({ name: 'my-feature-list' })
          }
        }
      )
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/mixin.scss';
@import '@/assets/scss/responsive-style/web';

.form-row {
  margin-bottom: var(--sp-lg);

  &.two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--sp-lg);

    @media (max-width: 1024px) {
      grid-template-columns: 1fr;
    }
  }
}
</style>
```

---

## Flow Docs ที่มีอยู่ในระบบ

| ไฟล์ | เนื้อหา |
|---|---|
| `src/layout/mobile/MOBILE_LAYOUT.md` | โครงสร้าง Layout สำหรับ Mobile |
| `src/router/ROUTING_STRATEGY.md` | กลยุทธ์ routing web vs mobile |
| `src/views/production/PRDUCTION_FLOW.md` | flow ระบบผลิต |
| `src/views/mobile/sale/SALE_MOBILES_FLOW.md` | flow ขาย mobile |
| `src/views/mobile/tasks/TASKS_MOBILE_FLOW.md` | flow tasks mobile |

---

## กฎห้ามทำ (สรุป)

- ❌ ห้าม hardcode สี `#921313`, `#e0e0e0` ใน SCSS ใหม่ — ใช้ `var(--base-*)`, `var(--color-*)`
- ❌ ห้าม `try-catch` ครอบ API call — axios-helper.js จัดการให้อัตโนมัติ
- ❌ ห้าม `this.loading = true/false` — axios-helper.js จัดการให้อัตโนมัติ
- ❌ ห้าม `alert()` / `confirm()` native — ใช้ sweetAlerts
- ❌ ห้าม `localStorage` ตรงๆ — ใช้ `storage` service
- ❌ ห้าม hardcode ข้อความไทยในโค้ดใหม่ — ใช้ `$t()`
- ❌ ห้ามใช้ native input/button/table หรือ PrimeVue ตรงๆ — ดู native-call-policy skill
