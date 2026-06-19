<template>
  <div class="mt-2">
    <!-- @view="viewplan" -->
    <BaseDataTable
      :items="planBOMApiStore.bomData.data"
      :totalRecords="planBOMApiStore.bomData.total"
      :columns="columns"
      :perPage="take"
      @page="handlePageChange"
      @sort="handleSortChange"
    >
      <!-- <template #actionTemplate="{ data }">
        <div class="btn-action-container">
          <button class="btn btn-sm btn btn-green" @click="viewplan(data)">
            <i class="bi bi-search"></i>
          </button>
        
        </div>
      </template> -->

      <!-- WO Column -->
      <template #woTextTemplate="{ data }">
        {{ `${data.wo}-${data.woNumber}` }}
      </template>

      <!-- Last Update Status Column -->
      <template #totalTemplate="{ data }">
        <div class="notification">
          <span>
            {{
              Number(data.qty * data.qtyPrice + data.qtyWeight * data.qtyWeightPrice).toFixed(2)
            }}</span
          >
        </div>
      </template>

      <!-- Custom Footer/Paginator Buttons -->
      <template #paginator-buttons> </template>
    </BaseDataTable>
  </div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import dataTablePaging from '@/composables/useDataTablePaging.js'

import { usePlanBOMApiStore } from '@/stores/modules/api/plan/plan-bom-store.js'

export default {
  name: 'ProductionPlanList',

  components: {
    BaseDataTable
  },

  mixins: [dataTablePaging],

  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    },
    modelFormExport: {
      type: Object,
      default: () => ({})
    },
    masterPlanStatus: {
      type: Array,
      default: () => []
    }
  },

  setup() {
    const planBOMApiStore = usePlanBOMApiStore()
    return { planBOMApiStore }
  },

  computed: {
    form() {
      return this.modelForm || {}
    },
    planStatus() {
      return this.masterPlanStatus
    },
    columns() {
      return [
        {
          field: 'completedDate',
          header: this.$t('view.production.planBom.colDate'),
          sortable: true,
          width: '120px',
          format: 'datetime'
        },
        {
          field: 'woText',
          header: 'W.O.',
          sortable: true,
          width: '120px'
        },
        {
          field: 'mold',
          header: this.$t('view.production.planBom.colMold'),
          sortable: true,
          width: '120px'
        },
        {
          field: 'productTypeName',
          header: this.$t('view.production.planBom.colProductType'),
          sortable: true,
          minWidth: '120px'
        },
        {
          field: 'name',
          header: this.$t('view.production.planBom.colName'),
          sortable: false,
          minWidth: '200px'
        },
        {
          field: 'qty',
          header: this.$t('common.field.quantity'),
          sortable: true,
          width: '110px',
          align: 'right',
          format: 'number'
        },
        {
          field: 'qtyPrice',
          header: this.$t('view.production.planBom.colPricePerQty'),
          sortable: true,
          width: '110px',
          align: 'right',
          format: 'decimal2'
        },
        {
          field: 'qtyWeight',
          header: this.$t('common.field.weight'),
          sortable: true,
          width: '110px',
          maxWidth: '110px',
          align: 'right',
          format: 'decimal3'
        },
        {
          field: 'qtyWeightPrice',
          header: this.$t('view.production.planBom.colPricePerWeight'),
          sortable: true,
          width: '110px',
          align: 'right',
          format: 'decimal2'
        },
        {
          field: 'total',
          header: this.$t('view.production.planBom.colTotal'),
          sortable: true,
          width: '110px',
          align: 'right',
          format: 'decimal2'
        }
      ]
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
    async fetchData() {
      await this.planBOMApiStore.fetchList({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        formValue: this.form
      })
    },

    async fetchDataExport() {
      await this.planBOMApiStore.fetchListReport({
        take: 0,
        skip: 0,
        sort: this.sort,
        formValue: this.form
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';
</style>
