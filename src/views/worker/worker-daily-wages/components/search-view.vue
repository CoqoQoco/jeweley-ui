<template>
  <div class="filter-container-searchBar">
    <form @submit.prevent="onSearch">
      <div>
        <pageTitle
          :title="`ตรวจสอบค่าแรงช่าง : ${worker.code ?? ''} - ${worker.nameTh ?? ''}`"
          :isShowBtnClose="false"
        />

        <div class="form-col-container">
          <div>
            <span class="title-text">วันที่ตรวจสอบ</span>
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
            <span class="title-text">ประเภทค่าแรง</span>
            <DropdownGeneric
              :modelValue="form.wageTypeFilter"
              :options="wageTypeOptions"
              optionLabel="label"
              optionValue="value"
              :showClear="false"
              @update:modelValue="onWageTypeChange"
            />
          </div>
        </div>

        <div class="btn-submit-container-between">
          <div>
            <button class="btn btn-sm btn-primary" type="button" @click="$emit('print-success')" title="พิมพ์สลิปสถานะสำเร็จ">
              <i class="bi bi-printer"></i>
              <span class="ml-1">พิมพ์สลิปสถานะสำเร็จ</span>
            </button>
            <button
              v-if="form.wageTypeFilter !== 'goldLoss'"
              class="btn btn-sm btn-primary ml-2"
              type="button"
              @click="$emit('print-tracking')"
              title="พิมพ์สลิปติดตามงาน"
            >
              <i class="bi bi-printer"></i>
              <span class="ml-1">พิมพ์สลิปติดตามงาน</span>
            </button>
            <router-link
              v-if="form.wageTypeFilter === 'goldLoss'"
              :to="{ name: 'worker-gold-loss-slip-list', params: { workerCode: worker && worker.code ? worker.code : '' } }"
              class="btn btn-sm btn-sub-main ml-2"
              title="ประวัติ Slip"
            >
              <i class="bi bi-list-ul"></i> ประวัติ Slip
            </router-link>
          </div>
          <div>
            <button class="btn btn-sm btn-main" type="submit" title="ค้นหา">
              <i class="bi bi-search"></i>
            </button>
            <button class="btn btn-sm btn-dark ml-2" type="button" @click="$emit('clear')" title="ล้าง">
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
const DropdownGeneric = defineAsyncComponent(() => import('@/components/prime-vue/DropdownGeneric.vue'))

export default {
  name: 'WorkerDailyWagesSearchView',

  components: {
    pageTitle,
    CalendarGeneric,
    DropdownGeneric
  },

  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    },
    worker: {
      type: Object,
      default: () => ({})
    }
  },

  emits: ['update:modelForm', 'search', 'clear', 'print-success', 'print-tracking'],

  data() {
    return {
      form: { ...this.modelForm },
      wageTypeOptions: [
        { label: 'แสดงค่าแรง', value: 'wages' },
        { label: 'แสดงงาน Gold Loss', value: 'goldLoss' }
      ]
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
    onWageTypeChange(value) {
      this.form = { ...this.form, wageTypeFilter: value }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
