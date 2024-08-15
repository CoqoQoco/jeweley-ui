<template>
  <div class="filter-container">
    <pageTitle
      title="กระบวนการสร้างเเบบเเม่พิมพ์"
      description=""
      :isShowBtnClose="false"
      :isShowRightSlot="true"
    >
      <template #rightSlot>
        <button class="btn btn-sm btn-main" @click="onCreate">สร้างเเบบเเม่พิมพ์ใหม่</button>
      </template>
    </pageTitle>
    <form @submit.prevent="onSubmit">
      <div class="form-col-container">
        <div>
          <span class="title-text">รหัสตั้งเเม่พิมพ์</span>
          <input type="text" class="form-control" v-model="form.moldColde" />
        </div>
        <div>
          <span class="title-text">วันตั้งเเม่พิมพ์</span>
          <div class="flex-group">
            <Calendar
              class="w-100"
              v-model="form.startCreate"
              :max-date="form.endCreate"
              showIcon
              placeholder="เริ่มต้น"
            />
            <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
            <Calendar
              class="w-100"
              v-model="form.endCreate"
              :min-date="form.startCreate"
              showIcon
              placeholder="สิ้นสุด"
            />
          </div>
        </div>
        <div>
          <span class="title-text">วันเเก้ไขเเม่พิมพ์ล่าสุด</span>
          <div class="flex-group">
            <Calendar
              class="w-100"
              v-model="form.startUpdate"
              :max-date="form.endUpdate"
              showIcon
              placeholder="เริ่มต้น"
            />
            <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
            <Calendar
              class="w-100"
              v-model="form.endUpdate"
              :min-date="form.startUpdate"
              showIcon
              placeholder="สิ้นสุด"
            />
          </div>
        </div>
        <div></div>
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
      //this.form = { ...this.modelForm }
      this.$emit('clear')
    },
    onCreate() {
      this.$router.push({ name: 'design-create' })
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
