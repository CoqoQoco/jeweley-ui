<template>
  <div class="mt-2">
    <BaseDataTable
      :items="planCompletedStore.dataPlanCompleted.data"
      :totalRecords="planCompletedStore.dataPlanCompleted.total"
      :columns="columns"
      :perPage="take"
      @page="handlePageChange"
      @sort="handleSortChange"
    >
      <template #actionTemplate="{ data }">
        <div class="btn-action-container">
          <button class="btn btn-sm btn btn-green" @click="viewplan(data)">
            <i class="bi bi-search"></i>
          </button>
        </div>
      </template>

      <!-- Image Column -->
      <template #imageTemplate="{ data }">
        <div class="image-container">
          <div>
            <imagePreview :imageName="data.mold" :type="mold" :width="25" :height="25" />
          </div>
          <div v-if="data.moldSub" class="ml-2">
            <imagePreview :imageName="data.moldSub" :type="mold" :width="25" :height="25" />
          </div>
        </div>
      </template>

      <!-- WO Column -->
      <template #woTextTemplate="{ data }">
        {{ `${data.wo}-${data.woNumber}` }}
      </template>

      <!-- Status Column -->
      <template #statusTemplate="{ data }">
        <div style="width: 150px" :class="getStatusSeverity(data.status)">
          {{ data.statusName }}
        </div>
      </template>

      <!-- Last Update Status Column -->
      <template #lastUpdateStatusTemplate="{ data }">
        <div class="notification">
          <span>{{ data.lastUpdateStatus ? formatDate(data.lastUpdateStatus) : `` }}</span>
        </div>
      </template>

      <!-- Request Date Column -->
      <template #requestDateTemplate="{ data }">
        <div class="notification">
          <span>{{ formatDate(data.requestDate) }}</span>
          <span v-if="data.isOverPlan" class="overdue-tag">เกินกำหนด</span>
        </div>
      </template>

      <!-- Gold Plated Column -->
      <template #goldPlatedTemplate="{ data }">
        <div class="gold-info">
          <div class="gold-type">{{ data.goldPlated || '-' }}</div>
        </div>
      </template>

      <!-- Success Status Template -->
      <template #successStatusTemplate="{ data }">
        <div class="success-status">
          <span v-if="data.isSuccessWithoutCost" class="success-tag">เสร็จแล้ว (ไม่คิดราคา)</span>
          <span v-else class="success-tag complete">เสร็จแล้ว</span>
        </div>
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

const imagePreview = defineAsyncComponent(() => import('@/components/prime-vue/ImagePreview.vue'))

import { usePlanSearchApiStore } from '@/stores/modules/api/plan-search-store.js'
import { formatDate, formatDateTime } from '@/services/utils/dayjs.js'

export default {
  name: 'PlanCompletedAllGoldList',

  components: {
    BaseDataTable,
    imagePreview
  },

  props: {
    modelForm: {
      type: Object,
      default: () => ({}),
      required: true
    },
    modelFormExport: {
      type: Object,
      default: () => ({})
    },
    formValueExport: {
      type: Object,
      default: () => ({})
    },
    masterPlanStatus: {
      type: Array,
      default: () => [],
      required: true
    }
  },

  data() {
    return {
      mold: 'MOLD',
      take: 10,
      skip: 0,
      sort: [],

      // Columns Configuration based on PlanCompleted Response model
      columns: [
        {
          field: 'action',
          header: '',
          minWidth: '50px',
          sortable: false,
          align: 'center',
          bodyTemplate: 'actionTemplate'
        },
        {
          field: 'image',
          header: '',
          minWidth: '50px',
          sortable: false,
          align: 'center',
          bodyTemplate: 'imageTemplate'
        },
        {
          field: 'woText',
          header: 'W.O.',
          sortable: true,
          minWidth: '150px',
          bodyTemplate: 'woTextTemplate'
        },
        {
          field: 'mold',
          header: 'เเม่พิมพ์',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'status',
          header: 'สถานะใบงาน',
          sortable: true,
          minWidth: '150px',
          align: 'center',
          bodyTemplate: 'statusTemplate'
        },
        {
          field: 'lastUpdateStatus',
          header: 'วันที่อัปเดตสถานะ',
          sortable: true,
          minWidth: '150px',
          bodyTemplate: 'lastUpdateStatusTemplate'
        },
        {
          field: 'requestDate',
          header: 'วันส่งงานลูกค้า',
          sortable: true,
          minWidth: '150px',
          bodyTemplate: 'requestDateTemplate'
        },
        {
          field: 'productNumber',
          header: 'รหัสสินค้า',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'productTypeName',
          header: 'ประเภทสินค้า',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'productQty',
          header: 'จำนวนสินค้า',
          sortable: true,
          minWidth: '100px',
          align: 'center'
        },
        {
          field: 'customerNumber',
          header: 'รหัสลูกค้า',
          sortable: true,
          minWidth: '120px'
        },
        {
          field: 'customerName',
          header: 'ชื่อลูกค้า',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'customerTypeName',
          header: 'ประเภทลูกค้า',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'gold',
          header: 'สีของทอง/เงิน',
          sortable: true,
          minWidth: '120px'
        },
        {
          field: 'goldSize',
          header: 'ประเภททอง/เงิน',
          sortable: true,
          minWidth: '120px'
        },
        {
          field: 'goldPlated',
          header: 'ทองชุบ',
          sortable: true,
          minWidth: '120px',
          bodyTemplate: 'goldPlatedTemplate'
        },
        {
          field: 'goldQtySend',
          header: 'จำนวนจ่าย',
          sortable: true,
          minWidth: '120px',
          align: 'right'
        },
        {
          field: 'goldWeightSend',
          header: 'น้ำหนักจ่าย',
          sortable: true,
          minWidth: '130px',
          align: 'right'
        },
        {
          field: 'goldQtyCheck',
          header: 'จำนวนรับ',
          sortable: true,
          minWidth: '130px',
          align: 'right'
        },
        {
          field: 'goldWeightCheck',
          header: 'น้ำหนักรับ',
          sortable: true,
          minWidth: '140px',
          align: 'right'
        },
        {
          field: 'description',
          header: 'หมายเหตุ',
          sortable: false,
          minWidth: '150px'
        },
        {
          field: 'createDate',
          header: 'วันสร้างใบงาน',
          sortable: true,
          minWidth: '150px',
          format: 'date'
        },
        // {
        //   field: 'successStatus',
        //   header: 'สถานะความสำเร็จ',
        //   sortable: false,
        //   minWidth: '150px',
        //   bodyTemplate: 'successStatusTemplate'
        // }
      ]
    }
  },

  setup() {
    const planCompletedStore = usePlanSearchApiStore()
    return { planCompletedStore }
  },

  computed: {
    form() {
      return this.modelForm || {}
    },
    planStatus() {
      return this.masterPlanStatus
    }
  },

  watch: {
    async modelForm() {
      console.log('modelForm changed:', this.modelForm)
      this.take = 10
      this.skip = 0
      await this.fetchData()
    },
    async modelFormExport() {
      console.log('modelFormExport changed:', this.modelFormExport)
      await this.fetchDataExport()
    }
  },

  methods: {
    // ----- data table handle
    handlePageChange(e) {
      this.skip = e.first
      this.take = e.rows
      this.fetchData()
    },

    handleSortChange(e) {
      this.skip = e.first
      this.take = e.rows
      this.sort = e.multiSortMeta.map((item) => ({
        field: item.field,
        dir: item.order === 1 ? 'asc' : 'desc'
      }))
      this.fetchData()
    },

    // ----- event
    viewplan(item) {
      console.log('viewplan', item)
      const id = item.id
      window.open(`/plan-order-tracking-update/${id}`, '_blank')
    },

    // ---- APIs
    async fetchData() {
      await this.planCompletedStore.fetchPlanCompleted({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        formValue: this.form
      })
    },
    async fetchDataExport() {
      await this.planCompletedStore.fetchPlanCompletedExport({
        sort: this.sort,
        formValue: this.form
      })
    },

    // handle page
    getStatusSeverity(status) {
      switch (status) {
        case 9999:
          return 'box-status-process'
        case 500:
          return 'box-status-disable'
        case 100:
        case 95:
          return 'box-status-success'
        case 10:
          return 'box-status-process'
        case 49:
        case 54:
        case 59:
        case 69:
        case 79:
        case 84:
        case 89:
        case 94:
          return 'box-status-process'
        case 50:
        case 55:
        case 60:
        case 70:
        case 80:
        case 85:
        case 90:
          return 'box-status-show'
        default:
          return 'box-status-process'
      }
    },
    getStatusName(status) {
      return status
    },
    formatDateTime(date) {
      return date ? formatDateTime(date) : ''
    },
    formatDate(date) {
      return formatDate(date)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';

.notification {
  display: inline-flex;
  align-items: center;
}

.overdue-tag {
  background-color: #ff4d4d;
  color: white;
  padding: 2px 4px;
  border-radius: 2px;
  margin-left: 4px;
  font-size: 12px;
}

.image-container {
  display: flex;
  justify-content: start;
  align-items: center;
  margin-left: 4px;
}

.gold-info {
  display: flex;
  flex-direction: column;
  .gold-type {
    font-weight: 600;
    color: #d4af37;
  }
}


.success-status {
  .success-tag {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    
    &.complete {
      background-color: #28a745;
      color: white;
    }
    
    &:not(.complete) {
      background-color: #17a2b8;
      color: white;
    }
  }
}
</style>