<template>
  <div class="mt-3">
    <BaseDataTable
      :items="items"
      :totalRecords="total"
      :columns="columns"
      :perPage="take"
      dataKey="running"
      :emptyMessage="$t('view.sale.exportShipment.noData')"
      @page="$emit('page', $event)"
      @sort="$emit('sort', $event)"
    >
      <template #documentDateTemplate="{ data }">
        <div>{{ formatDate(data.documentDate) }}</div>
      </template>

      <template #actionTemplate="{ data }">
        <div class="btn-action-container">
          <ButtonGeneric variant="green" icon="bi-pencil" :title="$t('common.btn.edit')" @click="$emit('edit', data)" />
          <ButtonGeneric variant="red" icon="bi-trash" class="ml-2" :title="$t('common.btn.delete')" @click="$emit('delete', data)" />
        </div>
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
import { formatDate } from '@/services/utils/dayjs.js'

import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

export default {
  name: 'ExportShipmentDataTableView',

  components: {
    BaseDataTable,
    ButtonGeneric
  },

  props: {
    items: {
      type: Array,
      default: () => []
    },
    total: {
      type: Number,
      default: 0
    },
    take: {
      type: Number,
      default: 10
    },
    skip: {
      type: Number,
      default: 0
    }
  },

  emits: ['page', 'sort', 'edit', 'delete'],

  computed: {
    columns() {
      return [
        { field: 'documentNumber', header: this.$t('view.sale.exportShipment.colDocumentNumber'), minWidth: '130px', sortable: true },
        { field: 'customNumber', header: this.$t('view.sale.exportShipment.colCustomNumber'), minWidth: '130px', sortable: true },
        { field: 'documentDate', header: this.$t('view.sale.exportShipment.colDocumentDate'), minWidth: '110px', sortable: true },
        { field: 'consigneeName', header: this.$t('view.sale.exportShipment.colConsigneeName'), minWidth: '180px', sortable: true },
        { field: 'eventName', header: this.$t('view.sale.exportShipment.colEventName'), minWidth: '160px', sortable: false },
        { field: 'statusName', header: this.$t('view.sale.exportShipment.colStatus'), minWidth: '110px', sortable: false },
        { field: 'action', header: this.$t('view.sale.exportShipment.colAction'), minWidth: '110px', sortable: false }
      ]
    }
  },

  methods: {
    formatDate(val) {
      return val ? formatDate(val) : ''
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';

.btn-action-container {
  display: flex;
  align-items: center;
}
</style>
