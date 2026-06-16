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
                :modelValue="modelForm.requestDateStart"
                :max-date="modelForm.requestDateEnd"
                :manualInput="false"
                :showIcon="true"
                dateFormat="dd/mm/yy"
                placeholder="เริ่มต้น"
                @update:modelValue="update('requestDateStart', $event)"
              />
              <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
              <CalendarGeneric
                class="w-100"
                :modelValue="modelForm.requestDateEnd"
                :min-date="modelForm.requestDateStart"
                :manualInput="false"
                :showIcon="true"
                dateFormat="dd/mm/yy"
                placeholder="สิ้นสุด"
                @update:modelValue="update('requestDateEnd', $event)"
              />
            </div>
          </div>

          <div>
            <span class="title-text">ประเภทค่าแรง</span>
            <DropdownGeneric
              :modelValue="modelForm.wageTypeFilter"
              :options="wageTypeOptions"
              optionLabel="label"
              optionValue="value"
              :showClear="false"
              @update:modelValue="update('wageTypeFilter', $event)"
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
              v-if="modelForm.wageTypeFilter !== 'goldLoss'"
              class="btn btn-sm btn-primary ml-2"
              type="button"
              @click="$emit('print-tracking')"
              title="พิมพ์สลิปติดตามงาน"
            >
              <i class="bi bi-printer"></i>
              <span class="ml-1">พิมพ์สลิปติดตามงาน</span>
            </button>
            <router-link
              v-if="modelForm.wageTypeFilter === 'goldLoss'"
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

const pageTitle = defineAsyncComponent(() => import('@/components/custom/page-title.vue'))
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
      wageTypeOptions: [
        { label: 'แสดงค่าแรง', value: 'wages' },
        { label: 'แสดงงาน Gold Loss', value: 'goldLoss' }
      ]
    }
  },

  methods: {
    update(field, value) {
      this.$emit('update:modelForm', { ...this.modelForm, [field]: value })
    },
    onSearch() {
      this.$emit('search')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
