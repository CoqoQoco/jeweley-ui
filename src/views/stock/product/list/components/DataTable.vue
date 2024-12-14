<template>
  <div class="mt-2">
    <!-- @view="viewplan" -->
    <BaseDataTable
      :items="stockProductStore.dataSearch.data"
      :totalRecords="stockProductStore.dataSearch.total"
      :columns="columns"
      :perPage="take"
      :scrollHeight="'calc(100vh - 290px)'"
      @page="handlePageChange"
      @sort="handleSortChange"
    >
      <!-- action -->
      <!-- <template #actionTemplate="{ data }">
        <div class="btn-action-container">
          <button class="btn btn-sm btn btn-green" @click="viewplan(data)">
            <i class="bi bi-search"></i>
          </button>
        </div>
      </template> -->

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

      <!-- Request Date Column -->
      <!-- <template #receiptDateTemplate="{ data }">
        <div class="notification">
          <span>{{ formatDate(data.receiptDate) }}</span>
        </div>
      </template> -->

      <!-- Custom Footer/Paginator Buttons -->
      <!-- <template #paginator-buttons>
       
      </template> -->
    </BaseDataTable>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
//import { formatDate, formatDateTime, formatISOString } from '@/services/utils/dayjs'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

const imagePreview = defineAsyncComponent(() => import('@/components/image/PreviewImage.vue'))

//import { mapState, mapActions } from 'pinia'
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import { formatDate, formatDateTime } from '@/services/utils/dayjs.js'
//import swAlert from '@/services/alert/sweetAlerts.js'

export default {
  name: 'ProductionPlanList',

  components: {
    BaseDataTable,
    imagePreview
    //TransferJob,
    //TransferProduct
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

      // Columns Configuration
      columns: [
        // {
        //   field: 'action',
        //   header: '',
        //   minWidth: '50px',
        //   sortable: false,
        //   align: 'center',
        //   bodyTemplate: 'actionTemplate'
        // },
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
          field: 'receiptNumber',
          header: 'เลขที่รับสินค้า',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'receiptDate',
          header: 'วันที่รับสินค้า',
          sortable: true,
          minWidth: '150px',
          format: 'datetime'
        },
        {
          field: 'stockNumber',
          header: 'เลขที่สินค้า',
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
          header: 'สีของทอง/เงิน',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'goldSize',
          header: 'ประเภททอง/เงิน',
          sortable: true,
          minWidth: '150px'
        }
      ]
    }
  },

  setup() {
    const stockProductStore = usrStockProductApiStore()
    return { stockProductStore }
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
      await this.stockProductStore.fetchDataSearch({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        form: this.form
      })
    },
    async fetchDataExport() {
      console.log('fetchDataExport')
      await this.stockProductStore.fetchDataSearchExport({
        sort: this.sort,
        form: this.form
      })
    },

    // handle page
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
