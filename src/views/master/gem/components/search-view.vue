<template>
  <div class="filter-container-searchBar">
    <pageTitle
      title="ข้อมูลพลอย"
      description="เเก้ไขปรับปรุง/เพิ่ม พลอยเเละรายละเอียดต่างๆ"
      :isShowBtnClose="false"
      :isShowRightSlot="true"
    >
      <template #rightSlot>
        <button class="btn btn-sm btn-main" @click="onCreate">
          <span class="bi bi-database-fill-add"></span>
        </button>
      </template>
    </pageTitle>

    <form @submit.prevent="onSubmit">
      <div class="form-col-container">
        <div>
          <span class="title-text">ค้นหา</span>
          <input
            :class="['form-control bg-input']"
            type="text"
            v-model.trim="form.text"
            placeholder="EX: RU, Ruby, ทับทิมเเดง......"
          />
        </div>
      </div>

      <div class="btn-submit-container">
        <button class="btn btn-sm btn-main" type="submit">
          <span><i class="bi bi-search"></i></span>
        </button>
        <button class="btn btn-sm btn-dark ml-2" type="button">
          <span><i class="bi bi-x-circle"></i></span>
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
      //this.$router.push({ name: 'plan-gold-order' })

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
