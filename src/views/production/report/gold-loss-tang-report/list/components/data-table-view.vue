<template>
  <div class="mt-2">
    <BaseDataTable
      :items="items"
      :totalRecords="items.length"
      :columns="columns"
      :paginator="false"
      scrollHeight="calc(100vh - 340px)"
    >
      <template #actionTemplate="{ data }">
        <ButtonGeneric
          variant="green"
          icon="bi-eye"
          :title="$t('view.production.goldLossTang.view')"
          @click="$emit('view', data)"
        />
        <ButtonGeneric
          variant="main"
          icon="bi-pencil"
          class="ml-2"
          :title="$t('common.btn.edit')"
          @click="$emit('edit', data)"
        />
        <ButtonGeneric
          variant="green"
          icon="bi-printer"
          class="ml-2"
          :title="$t('common.btn.export')"
          @click="$emit('print', data)"
        />
        <ButtonGeneric
          v-if="data.isActive !== false"
          variant="red"
          icon="bi-x-circle"
          class="ml-2"
          :title="$t('view.production.goldLossTang.cancelSlip')"
          @click="$emit('cancel', data)"
        />
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

export default {
  name: 'GoldLossTangListDataTableView',

  components: {
    BaseDataTable,
    ButtonGeneric
  },

  props: {
    items: {
      type: Array,
      default: () => []
    }
  },

  emits: ['view', 'edit', 'print', 'cancel'],

  computed: {
    columns() {
      return [
        { field: 'documentNo', header: this.$t('view.production.goldLossTang.colDocumentNo'), minWidth: '140px' },
        { field: 'workerCode', header: this.$t('view.production.goldLossTang.colWorkerCode'), minWidth: '100px' },
        { field: 'workerName', header: this.$t('view.production.goldLossTang.colWorkerName'), minWidth: '150px' },
        { field: 'requestDateStart', header: this.$t('view.production.goldLossTang.colDateStart'), minWidth: '110px', format: 'date' },
        { field: 'requestDateEnd', header: this.$t('view.production.goldLossTang.colDateEnd'), minWidth: '110px', format: 'date' },
        { field: 'issuedTotal', header: this.$t('view.production.goldLossTang.colIssuedTotal'), minWidth: '110px', align: 'right', format: 'decimal4' },
        { field: 'returnedTotal', header: this.$t('view.production.goldLossTang.colReturnedTotal'), minWidth: '110px', align: 'right', format: 'decimal4' },
        { field: 'diffLoss', header: this.$t('view.production.goldLossTang.colDiffLoss'), minWidth: '100px', align: 'right', format: 'decimal4' },
        { field: 'totalMoneyDiff', header: this.$t('view.production.goldLossTang.colMoney'), minWidth: '110px', align: 'right', format: 'decimal2' },
        { field: 'createDate', header: this.$t('view.production.goldLossTang.colCreateDate'), minWidth: '110px', format: 'date' },
        { field: 'action', header: '', minWidth: '200px', sortable: false }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';
</style>
