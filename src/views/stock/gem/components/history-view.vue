<template>
  <div>
    <modal :showModal="isShowModal" @closeModal="closeModal">
      <template v-slot:content>
        <div class="filter-container-highlight">
          <div class="form-col-container">
            <div class="d-flex justify-content-between">
              <span class="desc-text-white">
                {{ `ประวัติเพชร/พลอย: ${gem.name ?? 'loading...'}` }}
              </span>
              <span class="mr-5 desc-text-white">{{ `${take} รายการล่าสุด` }}</span>
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
        { field: 'requestDate', header: 'วันทำรายการ (ล่าสุด)', minWidth: '200px' },
        { field: 'running', header: 'เลขที่รายการ', minWidth: '200px' },
        { field: 'refRunning1', header: 'เลขที่อ้างอิง 1', minWidth: '200px' },
        { field: 'refRunning2', header: 'เลขที่อ้างอิง 2', minWidth: '200px' },
        { field: 'type', header: 'ประเภท', minWidth: '200px', sortable: false },
        { field: 'qty', header: 'จำนวน', minWidth: '200px', sortable: false },
        { field: 'qtyWeight', header: 'น้ำหนัก', minWidth: '200px', sortable: false },
        { field: 'previousRemianQty', header: 'จำนวนก่อนใช้', minWidth: '200px' },
        { field: 'previousRemianQtyWeight', header: 'น้ำหนักก่อนใช้', minWidth: '200px' },
        { field: 'pointRemianQty', header: 'จำนวนคงเหลือ', minWidth: '200px', sortable: false },
        { field: 'pointRemianQtyWeight', header: 'น้ำหนักคงเหลือ', minWidth: '200px' },
        { field: 'woText', header: 'W.O.', minWidth: '200px' },
        { field: 'mold', header: 'เเม่พิมพ์', minWidth: '200px' },
        { field: 'remark1', header: 'หมายเหตุ-1', minWidth: '200px' },
        { field: 'remark2', header: 'หมายเหตุ-2', minWidth: '200px' },
        { field: 'jobOrPo', header: 'Invoice/Ref No.', minWidth: '200px' },
        { field: 'subpplierName', header: 'ร้านผลิต/ชื่อร้าน', minWidth: '200px' },
        { field: 'supplierCost', header: 'ราคาทุน', minWidth: '200px', sortable: false },
        { field: 'code', header: 'รหัส', minWidth: '200px' },
        { field: 'groupName', header: 'หมวดหมู่', minWidth: '200px' },
        { field: 'size', header: 'ขนาด', minWidth: '200px' },
        { field: 'shape', header: 'รูปร่าง', minWidth: '200px' },
        { field: 'grade', header: 'เกรด', minWidth: '200px' },
        { field: 'price', header: 'ราคา', minWidth: '150px', sortable: false },
        { field: 'priceQty', header: 'ราคาต่อหน่วย', minWidth: '150px', sortable: false },
        { field: 'unitCode', header: 'หน่วย', minWidth: '150px' },
        { field: 'unit', header: 'รหัสหน่วย', minWidth: '150px' }
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
      masterType: [
        { id: 1, description: 'รับเข้าคลัง [พลอยใหม่]' },
        { id: 2, description: 'รับเข้าคลัง [พลอยนอกสต๊อก]' },
        { id: 3, description: 'รับเข้าคลัง [พลอยคืน]' },
        { id: 4, description: 'จ่ายออกคลัง' },
        { id: 5, description: 'ยืมออกคลัง' },
        { id: 6, description: 'คืนเข้าคลัง' },
        { id: 7, description: 'เบิกออกคลัง' }
      ],
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
