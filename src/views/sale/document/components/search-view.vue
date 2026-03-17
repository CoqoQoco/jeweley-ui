<template>
  <div class="filter-container-searchBar">
    <pageTitle
      title="เอกสารสินค้า"
      description="จัดการเอกสาร PDF ประจำเดือน — upload, download, tag และลบเอกสาร"
      :isShowBtnClose="false"
    />

    <form @submit.prevent="onSearch">
      <div class="form-col-container">
        <!-- เดือน -->
        <div>
          <span class="title-text">เดือน</span>
          <select class="form-control bg-input" v-model="form.month">
            <option :value="null">ทั้งหมด</option>
            <option v-for="m in months" :key="m.value" :value="m.value">{{ m.label }}</option>
          </select>
        </div>

        <!-- ปี -->
        <div>
          <span class="title-text">ปี</span>
          <select class="form-control bg-input" v-model="form.year">
            <option :value="null">ทั้งหมด</option>
            <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>

        <!-- ค้นหาชื่อไฟล์ / tag -->
        <div>
          <span class="title-text">ชื่อไฟล์ / Tag</span>
          <input
            class="form-control bg-input"
            type="text"
            v-model.trim="form.keyword"
            placeholder="ค้นหาชื่อไฟล์หรือ tag"
          />
        </div>
      </div>

      <div class="btn-submit-container">
        <button class="btn btn-sm btn-main mr-2" type="submit" title="ค้นหา">
          <span><i class="bi bi-search"></i></span>
        </button>
        <button class="btn btn-sm btn-dark mr-2" type="button" @click="onClear" title="ล้าง">
          <span><i class="bi bi-x-circle"></i></span>
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import pageTitle from '@/components/custom/PageTitle.vue'

const MONTHS = [
  { value: 1, label: 'มกราคม' },
  { value: 2, label: 'กุมภาพันธ์' },
  { value: 3, label: 'มีนาคม' },
  { value: 4, label: 'เมษายน' },
  { value: 5, label: 'พฤษภาคม' },
  { value: 6, label: 'มิถุนายน' },
  { value: 7, label: 'กรกฎาคม' },
  { value: 8, label: 'สิงหาคม' },
  { value: 9, label: 'กันยายน' },
  { value: 10, label: 'ตุลาคม' },
  { value: 11, label: 'พฤศจิกายน' },
  { value: 12, label: 'ธันวาคม' }
]

const interfaceForm = {
  month: null,
  year: null,
  keyword: null
}

export default {
  name: 'SaleDocumentSearchView',

  components: { pageTitle },

  emits: ['search', 'clear', 'update:modelForm'],

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
    const currentYear = new Date().getFullYear()
    const years = Array.from({ length: 4 }, (_, i) => currentYear - i)

    return {
      form: { ...interfaceForm },
      months: MONTHS,
      years
    }
  },

  methods: {
    onSearch() {
      this.$emit('search', { ...this.form })
    },

    onClear() {
      this.form = { ...interfaceForm }
      this.$emit('clear')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
