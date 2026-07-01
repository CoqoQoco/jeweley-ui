<!--
  SearchBarGeneric — search bar 4-section มาตรฐาน (ui-layout skill §1.1)
  Wrapper ที่บังคับ layout: pageTitle + form-col-container + btn-submit-container-between

  ตัวอย่างการใช้งาน:
  <SearchBarGeneric
    title="ค้นหาใบสั่งผลิต"
    description="อธิบายหน้านี้สั้นๆ"
    @search="onSearch"
    @clear="onClear"
  >
    <template #fields>
      <div>
        <span class="title-text">เลขที่</span>
        <InputTextGeneric v-model="form.docNo" placeholder="เลขที่เอกสาร" :bgInput="true" />
      </div>
      <div>
        <span class="title-text">สถานะ</span>
        <MultiSelectGeneric v-model="form.status" :options="statusOptions" placeholder="ทั้งหมด" :showClear="true" />
      </div>
    </template>

    <template #actions-right>
      <ButtonGeneric variant="main" icon="bi-search" type="submit" :title="$t('common.btn.search')" />
      <ButtonGeneric variant="dark" icon="bi-x-circle" class="ml-2" :title="$t('common.btn.clear')" @click="$emit('clear')" />
      <ButtonGeneric variant="main" icon="bi-plus" class="ml-2" :title="$t('common.btn.create')" @click="$router.push({ name: 'create-route' })" />
    </template>
  </SearchBarGeneric>

  Props:
    title       — search bar title text (i18n caller ส่ง $t(...) มา)
    description — คำอธิบายหน้า (บังคับใส่ทุกหน้า list — i18n)

  Slots:
    #fields         — filter fields (ใน .form-col-container)
    #actions-left   — bulk actions ฝั่งซ้าย (optional)
    #actions-right  — search/clear/create buttons ฝั่งขวา (icon-only + :title tooltip)
    #header-actions — ปุ่มมุมขวาบนใน filled header (เช่นปุ่มสร้าง)

  Emits: search, clear
-->
<template>
  <div class="filter-container-searchBar">
    <form @submit.prevent="$emit('search')">
      <pageTitle :title="title" :description="description" :isShowBtnClose="false" :filled="true" :icon="icon">
        <template #rightSlot><slot name="header-actions" /></template>
      </pageTitle>

      <div class="search-bar-body">
        <div class="form-col-container">
          <slot name="fields" />
        </div>

        <div class="btn-submit-container-between">
          <div>
            <slot name="actions-left" />
          </div>
          <div>
            <slot name="actions-right" />
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const pageTitle = defineAsyncComponent(() => import('@/components/custom/page-title.vue'))

export default {
  name: 'SearchBarGeneric',

  components: {
    pageTitle
  },

  props: {
    title: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: 'bi-search'
    }
  },

  emits: ['search', 'clear']
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/mixin.scss';

// Wrapper card — card-base มาตรฐาน แต่ override padding=0 + overflow:hidden
// เพื่อให้ pageTitle filled band ชนขอบ wrapper ได้โดยธรรมชาติ (ไม่ต้องใช้ negative margin อีก)
.filter-container-searchBar {
  @include card-base;
  padding: 0;
  overflow: hidden;
}

// Header filled: margin-bottom var(--sp-xl) = gap ระหว่าง header band กับ filter fields
// ไม่ต้อง negative margin แล้ว — wrapper padding=0 + overflow:hidden จัดการให้
:deep(.page-title-filled) {
  //margin-bottom: var(--sp-xl);
}

// Body section — padding ด้านข้าง + ล่าง สมดุลกัน
.search-bar-body {
  //padding: 0 var(--sp-lg) var(--sp-lg);
padding: var(--sp-lg) var(--sp-lg) var(--sp-lg); /* ← เปลี่ยนเป็นแบบนี้ (top = 20px) */
}

// Filter fields grid — responsive auto-fit
.form-col-container {
  display: grid;
  gap: var(--sp-md);
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

// Action bar — flex space-between พร้อม flex-wrap รองรับจอแคบ
.btn-submit-container-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--sp-sm);
  border-top: 1px solid var(--color-border);
  padding-top: var(--sp-md);
  margin-top: var(--sp-md);
}

// Focus ring สำหรับ input controls ภายใน SearchBarGeneric
:deep(.form-col-container) {
  input.form-control:focus,
  textarea.form-control:focus {
    border-color: var(--base-font-color);
    box-shadow: 0 0 0 3px rgba(146, 19, 19, 0.08);
    outline: none;
  }

  .p-inputtext:focus {
    border-color: var(--base-font-color);
    box-shadow: 0 0 0 3px rgba(146, 19, 19, 0.08);
  }
}

// Chip teal สำหรับ MultiSelect ภายใน SearchBarGeneric
:deep(.p-multiselect-token) {
  background: var(--color-green-bg);
  color: var(--base-green);
  border: 1px solid var(--base-green);

  .p-multiselect-token-icon {
    color: var(--base-green);
  }
}
</style>
