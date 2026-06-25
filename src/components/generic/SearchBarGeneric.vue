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
    #fields        — filter fields (ใน .form-col-container)
    #actions-left  — bulk actions ฝั่งซ้าย (optional)
    #actions-right — search/clear/create buttons ฝั่งขวา (icon-only + :title tooltip)

  Emits: search, clear
-->
<template>
  <div class="filter-container-searchBar">
    <form @submit.prevent="$emit('search')">
      <div>
        <pageTitle :title="title" :description="description" :isShowBtnClose="false" />

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
    }
  },

  emits: ['search', 'clear']
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
