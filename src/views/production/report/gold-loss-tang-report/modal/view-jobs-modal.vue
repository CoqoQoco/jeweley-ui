<template>
  <modal :showModal="isShow" @closeModal="$emit('closeModal')">
    <template #content>
      <div class="modal-header">
        <h5 class="modal-title">รายการใบงาน Gold Loss</h5>
        <button type="button" class="btn-close" @click="$emit('closeModal')"></button>
      </div>
      <div class="p-3">
        <BaseDataTable
          :items="jobList"
          :columns="columns"
          :totalRecords="jobList.length"
          :paginator="false"
          :showGridlines="true"
          dataKey="id"
        >
          <template #totalMoneyDiffTemplate="{ data }">
            <span :style="colorStyle(data.totalMoneyDiff)">{{ fmtSign2(data.totalMoneyDiff) }}</span>
          </template>

          <template #actionTemplate="{ data }">
            <div class="d-flex gap-1 justify-content-center">
              <button class="btn btn-sm btn-green mr-2" @click="$emit('jobSelected', data.id)">
                <i class="bi bi-eye"></i>
              </button>
              <button class="btn btn-sm btn-main" @click="$emit('exportJobPdf', data.id)">
                <i class="bi bi-file-earmark-pdf"></i>
              </button>
            </div>
          </template>
        </BaseDataTable>
      </div>
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import { useGoldLossTangReportStore } from '@/stores/modules/api/plan/gold-loss-tang-report-store.js'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))

export default {
  name: 'ViewJobsModal',

  components: { modal, BaseDataTable },

  props: {
    isShow: {
      type: Boolean,
      default: false
    }
  },

  emits: ['closeModal', 'jobSelected', 'exportJobPdf'],

  data() {
    return {
      jobList: [],
      columns: [
        { field: 'documentNo', header: 'เลขที่ใบงาน', minWidth: '140px' },
        { field: 'createDate', header: 'วันที่สร้าง', minWidth: '120px', format: 'date' },
        { field: 'itemCount', header: 'จำนวนรายการ', minWidth: '120px', align: 'center' },
        { field: 'totalMoneyDiff', header: 'รวมเงิน ได้/ขาด', minWidth: '140px', align: 'right' },
        { field: 'createBy', header: 'ผู้สร้าง', minWidth: '120px' },
        { field: 'action', header: '', minWidth: '60px', sortable: false, align: 'center' }
      ]
    }
  },

  watch: {
    isShow(val) {
      if (val) {
        this.loadJobList()
      }
    }
  },

  methods: {
    async loadJobList() {
      const store = useGoldLossTangReportStore()
      const res = await store.fetchJobList({})
      if (res) {
        this.jobList = res || []
      }
    },

    fmtSign2(val) {
      if (val == null) return '0.00'
      const sign = val >= 0 ? '+' : '-'
      return `${sign}${Math.abs(val)
        .toFixed(2)
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
    },

    colorStyle(val) {
      if (val > 0) return 'color: var(--base-green)'
      if (val < 0) return 'color: var(--base-red)'
      return ''
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';
</style>
