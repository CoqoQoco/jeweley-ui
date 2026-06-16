<!--
  SearchBarGeneric — search bar 4-section มาตรฐาน (ui-layout skill §1.1)
  Wrapper ที่บังคับ layout: pageTitle + form-col-container + btn-submit-container-between

  ตัวอย่างการใช้งาน:
  <SearchBarGeneric
    title="ค้นหาใบสั่งผลิต"
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
        <DropdownGeneric v-model="form.status" :options="statusOptions" placeholder="ทั้งหมด" :showClear="true" />
      </div>
    </template>

    <template #actions-right>
      <button class="btn btn-sm btn-main" type="submit" title="ค้นหา">
        <i class="bi bi-search"></i>
      </button>
      <button class="btn btn-sm btn-dark ml-2" type="button" @click="$emit('clear')" title="ล้าง">
        <i class="bi bi-x-circle"></i>
      </button>
      <button class="btn btn-sm btn-main ml-2" type="button" @click="$router.push({ name: 'create-route' })">
        <i class="bi bi-plus"></i>
      </button>
    </template>
  </SearchBarGeneric>

  Props:
    title — search bar title text (i18n caller ส่ง $t(...) มา)

  Slots:
    #fields        — filter fields (ใน .form-col-container)
    #actions-left  — bulk actions ฝั่งซ้าย (optional)
    #actions-right — search/clear/create buttons ฝั่งขวา

  Emits: search, clear
-->
<template>
  <div class="filter-container-searchBar">
    <form @submit.prevent="$emit('search')">
      <div>
        <pageTitle :title="title" :isShowBtnClose="false" />

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
    }
  },

  emits: ['search', 'clear']
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
