<template>
  <div class="mt-2">
    <!-- @view="viewplan" -->
    <BaseDataTable
      :items="data.data"
      :totalRecords="data.total"
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
          <!-- <button class="ml-1 btn btn-sm btn btn-dark" title="โหมดดูรายละเอียด">
              <i class="bi bi-clipboard2-data-fill"></i>
            </button> -->
        </div>
      </template>
      <!-- Image Column -->
      <template #imageTemplate="{ data }">
        <div class="image-container">
          <imagePreview :imageName="data.mold" :type="mold" :width="30" :height="30" />
        </div>
      </template>

      <!-- WO Column -->
      <template #woTextTemplate="{ data }">
        {{ `${data.wo}-${data.woNumber}` }}
      </template>

      <!-- Status Column -->
      <template #formerStatusTemplate="{ data }">
        <div style="width: 150px" :class="getStatusSeverity(data.formerStatus)">
          {{ data.formerStatusName }}
        </div>
      </template>
      <template #targetStatusTemplate="{ data }">
        <div style="width: 150px" :class="getStatusSeverity(data.targetStatus)">
          {{ data.targetStatusName }}
        </div>
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
//import { formatDate, formatDateTime, formatISOString } from '@/services/utils/dayjs'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
//import swAlert from '@/services/alert/sweetAlerts'

const imagePreview = defineAsyncComponent(() => import('@/components/image/PreviewImage.vue'))
//const transferJobView = defineAsyncComponent(() => import('../modal/JobTransfer.vue'))

//import { mapState, mapActions } from 'pinia'
import { usePlanUpdateApiStore } from '@/stores/modules/api/plan-update-store.js'
import { formatDate, formatDateTime } from '@/services/utils/dayjs.js'
//import swAlert from '@/services/alert/sweetAlerts.js'

export default {
  name: 'ProductionPlanList',

  components: {
    BaseDataTable,
    imagePreview
  },

  props: {
    modelForm: {
      type: Object,
      default: () => ({}), // ให้ default เป็น empty object แทน
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
      data: {},

      // Columns Configuration
      columns: [
        {
          field: 'image',
          header: '',
          minWidth: '50px',
          sortable: false,
          align: 'center'
        },
        {
          field: 'woText',
          header: 'W.O.',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'mold',
          header: 'เเม่พิมพ์',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'transferNumber',
          header: 'เลขที่โอนงาน',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'formerStatus',
          header: 'แผนกโอนงาน',
          sortable: true,
          minWidth: '150px',
          align: 'center'
        },
        {
          field: 'targetStatus',
          header: 'แผนกรับโอน',
          sortable: true,
          minWidth: '150px',
          align: 'center'
        },
        {
          field: 'createDate',
          header: 'วันที่โอนงาน',
          sortable: true,
          minWidth: '150px',
          format: 'datetime'
        },
        {
          field: 'createBy',
          header: 'ผู้โอนงาน',
          sortable: true,
          minWidth: '150px',
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
          minWidth: '150px'
        },
        {
          field: 'gold',
          header: 'ประเภททอง/เงิน',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'goldSize',
          header: 'ขนาดทอง/เงิน',
          sortable: true,
          minWidth: '150px'
        }
      ]
    }
  },

  setup() {
    const planSearchStore = usePlanUpdateApiStore()
    return { planSearchStore }
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
      console.log(this.modelForm)
      this.take = 10
      this.skip = 0
      await this.fetchData()
    },
    async modelFormExport() {
      console.log(this.modelForm)
      await this.fetchDataExport()
    }
  },

  methods: {
    // ----- data table hnadle
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

    // ---- APIs
    async fetchData() {
      const res = await this.planSearchStore.fetchDataTransfer({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        form: this.form,
        masterStatus: this.planStatus
      })

      if (res) {
        this.data = { ...res }
      }
    },
    async fetchDataExport() {
      await this.planSearchStore.fetchDataTransferExport({
        sort: this.sort,
        form: this.form,
        masterStatus: this.planStatus
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
      }
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
  //background-color: #ffe6e6; /* ส้มอ่อน */
  //padding: 4px 8px;
  //border-radius: 4px;
}

.overdue-tag {
  background-color: #ff4d4d; /* สีแดง */
  color: white;
  padding: 2px 4px;
  border-radius: 2px;
  margin-left: 4px;
  font-size: 12px;
}
</style>
