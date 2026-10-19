<template>
  <div class="mt-2">
    <BaseDataTable
      :items="rows"
      :itemsSelection="selection"
      :totalRecords="rows.length"
      :columns="columns"
      dataKey="rowKey"
      :paginator="false"
      :selectionMode="true"
      scrollHeight="calc(100vh - 560px)"
      class="base-data-table"
      @update:itemsSelection="$emit('update:selection', $event)"
    >
      <template #printCountTemplate="{ data }">
        <InputTextGeneric
          class="copies-input"
          type="number"
          :min="1"
          :max="maxCopies"
          :modelValue="data.printCount"
          :aria-label="$t('view.stock.printBarcode.colCopies')"
          @update:modelValue="$emit('change-copies', { rowKey: data.rowKey, value: $event })"
          @blur="$emit('commit-copies', data.rowKey)"
        />
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
import { MAX_COPIES_PER_ROW } from '@/services/helper/barcode/print-batch.js'

import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'

export default {
  components: { BaseDataTable, InputTextGeneric },

  props: {
    rows: {
      type: Array,
      default: () => []
    },
    selection: {
      type: Array,
      default: () => []
    }
  },

  emits: ['update:selection', 'change-copies', 'commit-copies'],

  data() {
    return {
      maxCopies: MAX_COPIES_PER_ROW
    }
  },

  computed: {
    columns() {
      return [
        { field: 'labelCode', header: this.$t('view.stock.printBarcode.colCode'), sortable: false, minWidth: '170px' },
        { field: 'productNumber', header: this.$t('view.stock.product.productNumber'), sortable: false, minWidth: '150px' },
        { field: 'productNameEn', header: this.$t('view.stock.product.productNameEn'), sortable: false, minWidth: '180px' },
        { field: 'size', header: this.$t('view.stock.product.size'), sortable: false, minWidth: '80px' },
        { field: 'location', header: this.$t('view.stock.product.locationHeader'), sortable: false, minWidth: '110px' },
        { field: 'woText', header: this.$t('view.stock.product.wo'), sortable: false, minWidth: '120px' },
        {
          field: 'productPrice',
          header: this.$t('common.field.price'),
          sortable: false,
          minWidth: '110px',
          align: 'right',
          format: 'decimal2'
        },
        {
          field: 'printCount',
          header: this.$t('view.stock.printBarcode.colCopies'),
          sortable: false,
          minWidth: '110px',
          align: 'center'
        }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';

.base-data-table {
  :deep(.p-datatable) {
    z-index: 0 !important;
  }
}

.copies-input {
  max-width: calc(var(--sp-2xl) * 3);
  margin: 0 auto;
  text-align: center;
}
</style>
