<template>
  <div class="filter-container">
    <pageTitle
      title="ติดตามงานเบิกเเม่พิมพ์"
      description=""
      :isShowBtnClose="false"
      :isShowRightSlot="false"
    >
    </pageTitle>
    <form @submit.prevent="onSubmit">
      <div class="form-col-container">
        <div>
          <span class="title-text">ค้นหา</span>
          <input type="text" class="form-control" v-model="form.text" />
        </div>
        <div>
          <span class="title-text">วันที่เบิก</span>
          <div class="flex-group">
            <Calendar
              class="w-100"
              v-model="form.checkOutDateStart"
              :max-date="form.checkOutDateEnd"
              showIcon
              placeholder="เริ่มต้น"
            />
            <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
            <Calendar
              class="w-100"
              v-model="form.checkOutDateEnd"
              :min-date="form.checkOutDateStart"
              showIcon
              placeholder="สิ้นสุด"
            />
          </div>
        </div>
        <div>
          <span class="title-text">กำหนดคืน</span>
          <div class="flex-group">
            <Calendar
              class="w-100"
              v-model="form.returnDateStart"
              :max-date="form.returnDateEnd"
              showIcon
              placeholder="เริ่มต้น"
            />
            <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
            <Calendar
              class="w-100"
              v-model="form.returnDateEnd"
              :min-date="form.returnDateStart"
              showIcon
              placeholder="สิ้นสุด"
            />
          </div>
        </div>
        <!-- <div></div> -->
      </div>
      <div class="btn-submit-container">
        <button class="btn btn-sm btn-main mr-2" type="submit">
          <span><i class="bi bi-search mr-2"></i></span>
          <span>ค้นหา</span>
        </button>
        <button class="btn btn-sm btn-secondary" type="button" @click="onClear">
          <span><i class="bi bi-x mr-2"></i></span>
          <span>ล้าง</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))

import Calendar from 'primevue/calendar'

export default {
  components: {
    pageTitle,
    Calendar
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
      form: { ...this.modelForm }
    }
  },
  methods: {
    onSubmit() {
      this.$emit('search', this.form)
    },
    onClear() {
      this.$emit('clear')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/custom-style/standard-form.scss';

.header-bar-container {
  display: grid;
  grid-template-columns: 2fr 2fr 2fr 2fr;
  gap: 10px;
  margin-bottom: 10px;
}
</style>
