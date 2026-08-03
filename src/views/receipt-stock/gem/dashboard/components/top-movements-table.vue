<template>
  <div class="top-movements-table">
    <SectionCardGeneric
      :title="$t('view.stock.gem.dashboard.topMovements')"
      icon="bi-arrow-left-right"
      accent="main"
      headerStyle="legend"
    >
      <div class="table-toolbar">
        <ButtonGeneric
          variant="green"
          icon="bi-file-earmark-excel"
          :title="$t('common.btn.export')"
          :disabled="!topMovements.length"
          @click="exportToExcel"
        />
      </div>

      <div v-if="topMovements && topMovements.length > 0">
        <BaseDataTable
          :items="topMovements"
          :columns="columns"
          :totalRecords="topMovements.length"
          :paginator="false"
          dataKey="code"
          scrollHeight="400px"
        >
          <template #categoryTemplate="{ data }">
            {{ data.groupName }} - {{ data.shape }}
          </template>
        </BaseDataTable>
      </div>
      <div v-else class="table-empty">
        <i class="bi bi-activity"></i>
        <p>{{ $t('view.stock.gem.dashboard.noMovements') }}</p>
      </div>
    </SectionCardGeneric>
  </div>
</template>

<script>
import { ExcelHelper } from '@/services/utils/excel-js.js'
import { formatDate } from '@/services/utils/dayjs.js'
import { success } from '@/services/alert/sweetAlerts.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  name: 'TopMovementsTable',

  components: {
    SectionCardGeneric,
    ButtonGeneric,
    BaseDataTable
  },

  props: {
    topMovements: {
      type: Array,
      default: () => []
    }
  },

  computed: {
    columns() {
      return [
        { field: 'code', header: this.$t('view.stock.gem.dashboard.gemCode'), minWidth: '120px', sortable: false },
        { field: 'category', header: this.$t('view.stock.gem.dashboard.category'), minWidth: '160px', sortable: false },
        { field: 'transactionCount', header: this.$t('view.stock.gem.dashboard.transactions'), minWidth: '100px', align: 'right', format: 'decimal0', sortable: false },
        { field: 'totalQuantityMoved', header: this.$t('view.stock.gem.dashboard.quantity'), minWidth: '110px', align: 'right', format: 'decimal0', sortable: false },
        { field: 'totalQuantityWeightMoved', header: this.$t('view.stock.gem.dashboard.weight'), minWidth: '110px', align: 'right', format: 'decimal3', sortable: false }
      ]
    }
  },

  methods: {
    exportToExcel() {
      if (!this.topMovements.length) return

      const dataExcel = this.topMovements.map((item) => ({
        [this.$t('view.stock.gem.dashboard.gemCode')]: item.code,
        [this.$t('view.stock.gem.dashboard.category')]: `${item.groupName} - ${item.shape}`,
        [this.$t('view.stock.gem.dashboard.transactions')]: item.transactionCount,
        [this.$t('view.stock.gem.dashboard.quantity')]: item.totalQuantityMoved,
        [this.$t('view.stock.gem.dashboard.weight')]: item.totalQuantityWeightMoved
      }))

      ExcelHelper.exportToExcel(dataExcel, {
        filename: `gem-top-movements_[${formatDate(new Date())}].xlsx`,
        sheetName: 'Top Movements'
      })

      success(this.$t('alert.exportSuccess'), this.$t('alert.success'))
    }
  }
}
</script>

<style lang="scss" scoped>
.top-movements-table {
  .table-toolbar {
    display: flex;
    justify-content: flex-end;
    margin-bottom: var(--sp-md);
  }

  .table-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    color: var(--base-sub-color);

    i {
      font-size: 48px;
      margin-bottom: var(--sp-lg);
    }
  }
}
</style>
