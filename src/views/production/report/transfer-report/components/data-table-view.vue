<template>
  <div class="mt-2">
    <BaseDataTable
      :items="transferReportStore.dataSearch.data"
      :totalRecords="transferReportStore.dataSearch.total"
      :columns="columns"
      :perPage="take"
      @page="handlePageChange"
      @sort="handleSortChange"
    >
      <template #formerStatusTemplate="{ data }">
        {{ statusName(data.formerStatus) }}
      </template>

      <template #targetStatusTemplate="{ data }">
        {{ statusName(data.targetStatus) }}
      </template>

      <template #footer>
        <div>{{ $t('view.production.transferReport.totalRecords', { total: transferReportStore.dataSearch.total }) }}</div>
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import dataTablePaging from '@/composables/useDataTablePaging.js'

import { useTransferReportApiStore } from '@/stores/modules/api/production/transfer-report-api.js'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'

export default {
  name: 'TransferReportDataTableView',

  mixins: [dataTablePaging],

  components: {
    BaseDataTable
  },

  setup() {
    const transferReportStore = useTransferReportApiStore()
    const masterApiStore = useMasterApiStore()
    return { transferReportStore, masterApiStore }
  },

  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    },
    modelFormExport: {
      type: Object,
      default: () => ({})
    }
  },

  computed: {
    columns() {
      return [
        {
          field: 'createDate',
          header: this.$t('view.production.transferReport.colCreateDate'),
          sortable: true,
          minWidth: '150px',
          format: 'datetime'
        },
        {
          field: 'transferNumber',
          header: this.$t('view.production.transferReport.colTransferNumber'),
          sortable: true,
          minWidth: '140px'
        },
        {
          field: 'woText',
          header: this.$t('view.production.transferReport.colWoText'),
          sortable: true,
          minWidth: '140px'
        },
        {
          field: 'productNumber',
          header: this.$t('view.production.transferReport.colProductNumber'),
          sortable: true,
          minWidth: '140px'
        },
        {
          field: 'productName',
          header: this.$t('view.production.transferReport.colProductName'),
          sortable: true,
          minWidth: '160px'
        },
        {
          field: 'mold',
          header: this.$t('view.production.transferReport.colMold'),
          sortable: true,
          minWidth: '130px'
        },
        {
          field: 'formerStatus',
          header: this.$t('view.production.transferReport.colFormerStatus'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'targetStatus',
          header: this.$t('view.production.transferReport.colTargetStatus'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'workerName',
          header: this.$t('view.production.transferReport.colWorker'),
          sortable: true,
          minWidth: '140px'
        },
        {
          field: 'customerName',
          header: this.$t('view.production.transferReport.colCustomer'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'createBy',
          header: this.$t('view.production.transferReport.colCreateBy'),
          sortable: true,
          minWidth: '140px'
        },
        {
          field: 'remark',
          header: this.$t('view.production.transferReport.colRemark'),
          sortable: false,
          minWidth: '150px'
        }
      ]
    }
  },

  watch: {
    async modelForm() {
      this.resetPaging()
    },
    async modelFormExport() {
      await this.transferReportStore.fetchReportExport({
        sort: this.sort,
        formValue: this.modelFormExport,
        masterStatus: this.masterApiStore.planStatus
      })
    }
  },

  methods: {
    statusName(statusId) {
      return this.masterApiStore.planStatus.find((item) => item.id === statusId)?.nameTh ?? statusId
    },

    async fetchData() {
      await this.transferReportStore.fetchReport({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        formValue: this.modelForm
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';
</style>
