<template>
  <div class="filter-container-searchBar">
    <pageTitle
      title="จัดการแคตตาล็อก"
      description="สร้างและจัดการแคตตาล็อกสินค้าเครื่องประดับ"
      :isShowBtnClose="false"
      :isShowRightSlot="true"
    >
      <template #rightSlot>
        <button class="btn btn-sm btn-main" @click="onCreate">
          <span class="bi bi-journal-plus"></span> สร้าง catalog
        </button>
      </template>
    </pageTitle>

    <form @submit.prevent="onSubmit">
      <div class="form-col-container">
        <div>
          <span class="title-text">รหัส</span>
          <input
            :class="['form-control bg-input']"
            type="text"
            v-model.trim="form.code"
            placeholder="EX: CAT001"
          />
        </div>
        <div>
          <span class="title-text">ชื่อ</span>
          <input
            :class="['form-control bg-input']"
            type="text"
            v-model.trim="form.name"
            placeholder="EX: New Collection..."
          />
        </div>
      </div>

      <div class="btn-submit-container">
        <button class="btn btn-sm btn-green" type="submit">
          <span><i class="bi bi-search"></i></span> ค้นหา
        </button>
        <button class="btn btn-sm btn-outline-main ml-2" type="button" @click="onClear">
          <span><i class="bi bi-x-circle"></i></span> ล้าง
        </button>
      </div>
    </form>

    <addView :isShow="isShow.add" @closeModal="closeModal"></addView>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))

import addView from '../modal/create-view.vue'

const interfaceIsShowModal = {
  add: false
}

export default {
  components: {
    pageTitle,
    addView
  },
  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    }
  },
  watch: {
    modelForm: {
      handler(val) {
        this.form = { ...val }
      },
      deep: true
    }
  },
  data() {
    return {
      isShow: { ...interfaceIsShowModal },
      form: { ...this.modelForm }
    }
  },
  methods: {
    onSubmit() {
      this.$emit('search', this.form)
    },
    onClear() {
      this.$emit('clear')
    },
    onCreate() {
      this.isShow.add = true
    },
    closeModal(event) {
      this.isShow = { ...interfaceIsShowModal }

      if (event === 'fetch') {
        this.$emit('search', this.form)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
