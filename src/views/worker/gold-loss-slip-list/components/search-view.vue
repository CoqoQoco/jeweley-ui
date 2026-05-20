<template>
  <div class="filter-container-searchBar">
    <form @submit.prevent="onSearch">
      <div>
        <pageTitle title="ประวัติ Gold Loss Slip" :isShowBtnClose="false" />

        <div class="form-col-container">
          <div>
            <span class="title-text">ช่วงวันที่</span>
            <div class="flex-group">
              <CalendarGeneric
                class="w-100"
                v-model="form.requestDateStart"
                :max-date="form.requestDateEnd"
                :manualInput="false"
                :showIcon="true"
                dateFormat="dd/mm/yy"
                placeholder="เริ่มต้น"
              />
              <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
              <CalendarGeneric
                class="w-100"
                v-model="form.requestDateEnd"
                :min-date="form.requestDateStart"
                :manualInput="false"
                :showIcon="true"
                dateFormat="dd/mm/yy"
                placeholder="สิ้นสุด"
              />
            </div>
          </div>

          <div>
            <span class="title-text">รหัสพนักงาน</span>
            <input class="form-control bg-input" v-model="form.workerCode" placeholder="รหัสพนักงาน" />
          </div>
        </div>

        <div class="btn-submit-container-between">
          <div></div>
          <div>
            <button class="btn btn-sm btn-main" type="submit" title="ค้นหา">
              <i class="bi bi-search"></i>
            </button>
            <button class="btn btn-sm btn-dark ml-2" type="button" @click="onClear" title="ล้าง">
              <i class="bi bi-x-circle"></i>
            </button>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))
const CalendarGeneric = defineAsyncComponent(() => import('@/components/prime-vue/CalendarGeneric.vue'))

export default {
  name: 'GoldLossSlipListSearchView',

  components: {
    pageTitle,
    CalendarGeneric
  },

  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    }
  },

  emits: ['update:modelForm', 'search', 'clear'],

  data() {
    return {
      form: { ...this.modelForm }
    }
  },

  watch: {
    modelForm: {
      handler(val) {
        this.form = { ...val }
      },
      deep: true
    },
    form: {
      handler(val) {
        this.$emit('update:modelForm', { ...val })
      },
      deep: true
    }
  },

  methods: {
    onSearch() {
      this.$emit('update:modelForm', { ...this.form })
      this.$emit('search')
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
</style>
