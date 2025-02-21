<template>
  <div class="filter-container-searchBar">
    <pageTitle :title="title" description="" :isShowBtnClose="false" :isShowRightSlot="false">
      <template #rightSlot>
        <button class="btn btn-sm btn-main" @click="onCreate">สร้างเเบบเเม่พิมพ์ใหม่</button>
      </template>
    </pageTitle>
    <form @submit.prevent="onSubmit">
      <div class="form-col-container">
        <div>
          <span class="title-text">ค้นหา</span>
          <input
            type="text"
            class="form-control"
            v-model="form.text"
            placeholder="รหัส/ประเภท/ช่าง..."
          />
        </div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <div class="btn-submit-container">
        <button class="btn btn-sm btn-main mr-2" type="submit">
          <span><i class="bi bi-search"></i></span>
          <!-- <span>ค้นหา</span> -->
        </button>
        <button class="btn btn-sm btn-secondary" @click="onClear" type="button">
          <span><i class="bi bi-x"></i></span>
          <!-- <span>ล้าง</span> -->
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))

//import Calendar from 'primevue/calendar'

export default {
  components: {
    pageTitle
    //Calendar
  },
  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    form() {
      return this.modelForm
    }
  },
  data() {
    return {
      title: 'เเบบเเม่พิมพ์สำเร็จ'
    }
  },
  methods: {
    onSubmit() {
      this.$emit('search')
    },
    onClear() {
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
