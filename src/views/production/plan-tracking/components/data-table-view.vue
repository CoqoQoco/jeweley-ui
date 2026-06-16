<template>
  <div class="mt-2">
    <BaseDataTable
      :items="planSearchStore.dataPlanSearch.data"
      :totalRecords="planSearchStore.dataPlanSearch.total"
      :columns="columns"
      :perPage="take"
      @page="handlePageChange"
      @sort="handleSortChange"
    >
      <template #actionTemplate="{ data }">
        <div class="btn-action-container">
          <button class="btn btn-sm btn-green" @click="viewplan(data)">
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
        <div :class="getStatusSeverity(data.status)">
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
          <span v-if="data.isOverPlan" class="overdue-tag">{{ $t('view.production.planTracking.overdue') }}</span>
        </div>
      </template>

      <!-- Custom Footer/Paginator Buttons -->
      <template #paginator-buttons>
        <button
          :class="['btn btn-sm', isTranferJob ? 'btn-outline-main' : 'btn-main']"
          type="button"
          :disabled="isTranferJob"
          :title="$t('view.production.planTracking.transferJob')"
          @click="onTrnsferJob"
        >
          <span><i class="bi bi-arrow-down-up"></i></span>
          <span class="ml-2">{{ $t('view.production.planTracking.transferJob') }}</span>
        </button>
        <button
          :class="['btn btn-sm ml-2', isTransferProduct ? 'btn-outline-main' : 'btn-main']"
          type="button"
          :disabled="isTransferProduct"
          :title="$t('view.production.planTracking.transferProduct')"
          @click="onTrnsferProduct"
        >
          <span><i class="bi bi-cart-check-fill"></i></span>
          <span class="ml-2">{{ $t('view.production.planTracking.transferProduct') }}</span>
        </button>
      </template>
    </BaseDataTable>

    <TransferJob
      :isShow="isShow.transferJob"
      :masterStatusValue="planStatus"
      :stausTransferValue="statusTransfer"
      @closeModal="closeModal"
    />
    <TransferProduct
      :isShow="isShow.transferProduct"
      :masterStatusValue="planStatus"
      :stausTransferValue="statusTransfer"
      @closeModal="closeModal"
    ></TransferProduct>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

// External
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import { usePlanSearchApiStore } from '@/stores/modules/api/plan-search-store.js'
import { formatDate, formatDateTime } from '@/services/utils/dayjs.js'
import { warning } from '@/services/alert/sweetAlerts.js'
import dataTablePaging from '@/composables/useDataTablePaging.js'

// Local
import TransferJob from '../modal/TransferJob.vue'
import TransferProduct from '../modal/TransferProduct.vue'

const imagePreview = defineAsyncComponent(() => import('@/components/prime-vue/ImagePreview.vue'))

const interfaceIsShow = {
  transferJob: false,
  transferProduct: false
}

export default {
  name: 'ProductionPlanList',

  mixins: [dataTablePaging],

  components: {
    BaseDataTable,
    imagePreview,
    TransferJob,
    TransferProduct
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
      isShow: { ...interfaceIsShow },
      mold: 'MOLD',
      statusTransfer: 0
    }
  },

  setup() {
    const planSearchStore = usePlanSearchApiStore()
    return { planSearchStore }
  },

  computed: {
    columns() {
      return [
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
          align: 'center'
        },
        {
          field: 'woText',
          header: this.$t('view.production.planTracking.colWo'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'mold',
          header: this.$t('view.production.planTracking.colMold'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'status',
          header: this.$t('view.production.planTracking.colStatus'),
          sortable: true,
          minWidth: '150px',
          align: 'center'
        },
        {
          field: 'lastUpdateStatus',
          header: this.$t('view.production.planTracking.colStatusDate'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'requestDate',
          header: this.$t('view.production.planTracking.colRequestDate'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'productNumber',
          header: this.$t('view.production.planTracking.colProductCode'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'productTypeName',
          header: this.$t('view.production.planTracking.colProductType'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'productQty',
          header: this.$t('view.production.planTracking.colProductQty'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'gold',
          header: this.$t('view.production.planTracking.colGoldColor'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'goldSize',
          header: this.$t('view.production.planTracking.colGoldType'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'customerNumber',
          header: this.$t('view.production.planTracking.colCustomerCode'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'customerName',
          header: this.$t('view.production.planTracking.colCustomerName'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'customerTypeName',
          header: this.$t('view.production.planTracking.colCustomerType'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'createDate',
          header: this.$t('view.production.planTracking.colCreateDate'),
          sortable: true,
          minWidth: '150px',
          format: 'date'
        }
      ]
    },

    form() {
      return this.modelForm || {}
    },
    planStatus() {
      return this.masterPlanStatus
    },
    isTranferJob() {
      let res = true
      if (this.modelForm && this.modelForm.status && this.modelForm.status.length === 1) {
        const allow = [10, 50, 60, 70, 80, 85, 90, 94, 95]
        allow.includes(this.modelForm.status[0]) && this.planSearchStore.dataPlanSearch.total > 0
          ? (res = false)
          : (res = true)
      }
      return res
    },
    isTransferProduct() {
      let res = true
      if (this.modelForm && this.modelForm.status && this.modelForm.status.length === 1) {
        const allow = [95]
        allow.includes(this.modelForm.status[0]) && this.planSearchStore.dataPlanSearch.total > 0
          ? (res = false)
          : (res = true)
      }
      return res
    }
  },

  watch: {
    async modelForm() {
      this.resetPaging()
    },
    async modelFormExport() {
      await this.fetchDataExport()
    }
  },

  methods: {
    // ----- event
    viewplan(item) {
      const id = item.id
      window.open(`/plan-order-tracking-update/${id}`, '_blank')
    },
    async onTrnsferJob() {
      if (this.planSearchStore.dataPlanSearcTotalRecord > this.planSearchStore.totalTransferAllow) {
        warning(
          `${this.$t('view.production.planTracking.transferLimit')} ${this.planSearchStore.totalTransferAllow} ${this.$t('view.production.planTracking.transferLimitUnit')}`,
          this.$t('view.production.planTracking.transferLimitTitle')
        )
      } else {
        this.statusTransfer = this.modelForm.status[0]
        await this.fetchDataTransfer()
        this.isShow.transferJob = true
      }
    },
    async onTrnsferProduct() {
      if (this.planSearchStore.dataPlanSearcTotalRecord > this.planSearchStore.totalTransferAllow) {
        warning(
          `${this.$t('view.production.planTracking.transferLimit')} ${this.planSearchStore.totalTransferAllow} ${this.$t('view.production.planTracking.transferLimitUnit')}`,
          this.$t('view.production.planTracking.transferLimitTitle')
        )
      } else {
        this.statusTransfer = this.modelForm.status[0]
        await this.fetchDataTransfer()
        this.isShow.transferProduct = true
      }
    },
    closeModal(action) {
      this.isShow = { ...interfaceIsShow }
      if (action === 'fetch') {
        this.fetchData()
      }
    },

    // ---- APIs
    async fetchData() {
      await this.planSearchStore.fetchData({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        formValue: this.form
      })
    },
    async fetchDataExport() {
      const res = await this.planSearchStore.fetchDataExport({
        sort: this.sort,
        formValue: this.form
      })

      if (res) {
        //excel
      }
    },
    async fetchDataTransfer() {
      await this.planSearchStore.fetchDataTransfer({
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
}

.overdue-tag {
  background-color: var(--base-red);
  color: white;
  padding: 2px 4px;
  border-radius: var(--radius-sm);
  margin-left: 4px;
  font-size: var(--fs-sm);
}

.image-container {
  display: flex;
  justify-content: start;
  align-items: center;
  margin-left: 4px;
}
</style>
