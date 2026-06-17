<template>
  <div>
    <modal :showModal="isShowModal" @closeModal="closeModal">
      <template v-slot:content>
        <div class="filter-container-highlight">
          <div class="form-col-container">
            <div class="d-flex justify-content-between">
              <span class="desc-text-white">
                {{ $t('view.stock.gem.historyTitle', { name: gem.name ?? '...' }) }}
              </span>
              <span class="mr-5 desc-text-white">{{ $t('view.stock.gem.historyLatest', { take }) }}</span>
            </div>
          </div>
        </div>

        <div class="form-col-container p-2">
          <BaseDataTable
            :items="history.data"
            :totalRecords="history.total"
            :columns="columns"
            :perPage="take"
            :paginator="false"
          >
            <template #requestDateTemplate="{ data: row }">
              {{ formatDateTime(row.requestDate) }}
            </template>
            <template #typeTemplate="{ data: row }">
              <div>
                <span><i class="mr-1" :class="getIconQty(row.type)"></i></span>
                <span>{{ getTypeName(row.type) }}</span>
              </div>
            </template>
            <template #qtyTemplate="{ data: row }">
              <div>
                <span><i class="mr-1" :class="getIconQty(row.type)"></i></span>
                <span>{{ row.qty ? Number(row.qty).toFixed(3).toLocaleString() : '0.000' }}</span>
              </div>
            </template>
            <template #qtyWeightTemplate="{ data: row }">
              <div>
                <span><i class="mr-1" :class="getIconQty(row.type)"></i></span>
                <span>{{ row.qtyWeight ? Number(row.qtyWeight).toFixed(3).toLocaleString() : '0.000' }}</span>
              </div>
            </template>
            <template #previousRemianQtyTemplate="{ data: row }">
              {{ row.previousRemianQty ? Number(row.previousRemianQty).toFixed(3).toLocaleString() : '0.000' }}
            </template>
            <template #previousRemianQtyWeightTemplate="{ data: row }">
              {{ row.previousRemianQtyWeight ? Number(row.previousRemianQtyWeight).toFixed(3).toLocaleString() : '0.000' }}
            </template>
            <template #pointRemianQtyTemplate="{ data: row }">
              {{ row.pointRemianQty ? Number(row.pointRemianQty).toFixed(3).toLocaleString() : '0.000' }}
            </template>
            <template #pointRemianQtyWeightTemplate="{ data: row }">
              {{ row.pointRemianQtyWeight ? Number(row.pointRemianQtyWeight).toFixed(3).toLocaleString() : '0.000' }}
            </template>
            <template #supplierCostTemplate="{ data: row }">
              {{ row.supplierCost ? Number(row.supplierCost).toFixed(2).toLocaleString() : '0.000' }}
            </template>
            <template #priceTemplate="{ data: row }">
              {{ row.price ? Number(row.price).toFixed(3).toLocaleString() : '0.00' }}
            </template>
            <template #priceQtyTemplate="{ data: row }">
              {{ row.priceQty ? Number(row.priceQty).toFixed(3).toLocaleString() : '0.00' }}
            </template>
          </BaseDataTable>
        </div>
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

import api from '@/axios/axios-helper.js'
import { formatDate, formatDateTime } from '@/services/utils/dayjs.js'

export default {
  components: {
    modal,
    BaseDataTable
  },
  props: {
    isShow: {
      type: Boolean,
      required: true,
      default: false
    },
    modelGem: {
      type: Object,
      required: true,
      default: () => {}
    }
  },
  computed: {
    isShowModal() {
      return this.isShow
    },
    gem() {
      return this.modelGem
    },
    columns() {
      return [
        { field: 'requestDate', header: this.$t('view.stock.gem.txDate'), minWidth: '200px' },
        { field: 'running', header: this.$t('view.stock.gem.txRunning'), minWidth: '200px' },
        { field: 'refRunning1', header: this.$t('view.stock.gem.txRef1'), minWidth: '200px' },
        { field: 'refRunning2', header: this.$t('view.stock.gem.txRef2'), minWidth: '200px' },
        { field: 'type', header: this.$t('view.stock.gem.txType'), minWidth: '200px', sortable: false },
        { field: 'qty', header: this.$t('view.stock.gem.txQty'), minWidth: '200px', sortable: false },
        { field: 'qtyWeight', header: this.$t('view.stock.gem.txWeight'), minWidth: '200px', sortable: false },
        { field: 'previousRemianQty', header: this.$t('view.stock.gem.txPrevQty'), minWidth: '200px' },
        { field: 'previousRemianQtyWeight', header: this.$t('view.stock.gem.txPrevWeight'), minWidth: '200px' },
        { field: 'pointRemianQty', header: this.$t('view.stock.gem.txRemainQty'), minWidth: '200px', sortable: false },
        { field: 'pointRemianQtyWeight', header: this.$t('view.stock.gem.txRemainWeight'), minWidth: '200px' },
        { field: 'woText', header: this.$t('view.stock.gem.txWo'), minWidth: '200px' },
        { field: 'mold', header: this.$t('view.stock.gem.txMold'), minWidth: '200px' },
        { field: 'remark1', header: this.$t('view.stock.gem.txRemark1'), minWidth: '200px' },
        { field: 'remark2', header: this.$t('view.stock.gem.txRemark2'), minWidth: '200px' },
        { field: 'jobOrPo', header: this.$t('view.stock.gem.txInvoice'), minWidth: '200px' },
        { field: 'subpplierName', header: this.$t('view.stock.gem.txSupplier'), minWidth: '200px' },
        { field: 'supplierCost', header: this.$t('view.stock.gem.txCost'), minWidth: '200px', sortable: false },
        { field: 'code', header: this.$t('view.stock.gem.txCode'), minWidth: '200px' },
        { field: 'groupName', header: this.$t('view.stock.gem.txGroup'), minWidth: '200px' },
        { field: 'size', header: this.$t('view.stock.gem.txSize'), minWidth: '200px' },
        { field: 'shape', header: this.$t('view.stock.gem.txShape'), minWidth: '200px' },
        { field: 'grade', header: this.$t('view.stock.gem.txGrade'), minWidth: '200px' },
        { field: 'price', header: this.$t('view.stock.gem.txPrice'), minWidth: '150px', sortable: false },
        { field: 'priceQty', header: this.$t('view.stock.gem.txPriceUnit'), minWidth: '150px', sortable: false },
        { field: 'unitCode', header: this.$t('view.stock.gem.txUnit'), minWidth: '150px' },
        { field: 'unit', header: this.$t('view.stock.gem.txUnitCode'), minWidth: '150px' }
      ]
    },
    masterType() {
      return [
        { id: 1, description: this.$t('view.stock.gem.typeNewGem') },
        { id: 2, description: this.$t('view.stock.gem.typeOutStock') },
        { id: 3, description: this.$t('view.stock.gem.typeReturn') },
        { id: 4, description: this.$t('view.stock.gem.typeIssue') },
        { id: 5, description: this.$t('view.stock.gem.typeBorrow') },
        { id: 6, description: this.$t('view.stock.gem.typeReturnIn') },
        { id: 7, description: this.$t('view.stock.gem.typeWithdraw') }
      ]
    }
  },
  watch: {
    modelGem: {
      handler() {
        this.fetchHistory(this.modelGem.code)
      },
      deep: true
    }
  },
  data() {
    return {
      history: {},
      sort: [
        {
          field: 'requestDate',
          dir: 'desc'
        }
      ],
      take: 100
    }
  },
  methods: {
    // ----- event
    closeModal() {
      this.$emit('closeModal')
    },

    // ------ APIs
    async fetchHistory() {
      const params = {
        take: this.take,
        skip: 0,
        sort: this.sort,
        search: {
          requestDateStart: null,
          requestDateEnd: null,
          type: null,

          code: this.gem.code ?? null,
          groupName: null,
          grade: null,
          shape: null,
          size: null,
          status: ['completed']
        }
      }
      const res = await api.jewelry.post('ReceiptAndIssueStockGem/ListTransection', params)
      if (res) {
        this.history = { ...res }
      }
    },

    // ----- helper
    formatDateTime(date) {
      return date ? formatDateTime(date) : ''
    },
    formatDate(date) {
      return formatDate(date)
    },
    getTypeName(type) {
      return this.masterType.find((item) => item.id === type)?.description
    },
    getIconQty(type) {
      switch (type) {
        case 1:
        case 2:
        case 3:
        case 6:
          return 'bi bi-arrow-down-square-fill text-success'
        case 4:
        case 7:
          return 'bi bi-arrow-up-square-fill text-danger'
        case 5:
          return 'bi bi-arrow-right-square-fill text-secondary'
        default:
          return ''
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';
</style>
