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
      <template #labelPriceTemplate="{ data }">
        <div class="label-price-cell">
          <span v-if="labelSymbol" class="label-price-symbol">{{ labelSymbol }}</span>
          <InputTextGeneric
            class="label-price-input"
            type="number"
            :min="0"
            :step="0.01"
            :modelValue="labelPriceValue(data)"
            :aria-label="$t('view.stock.printBarcode.labelPriceInput')"
            @update:modelValue="$emit('change-label-price', { rowKey: data.rowKey, value: $event })"
            @blur="onLabelPriceBlur(data)"
          />
          <template v-if="isEdited(data)">
            <span class="label-price-edited">{{ $t('view.stock.printBarcode.labelPriceEdited') }}</span>
            <ButtonGeneric
              variant="plain"
              icon="bi-arrow-counterclockwise"
              :title="$t('view.stock.printBarcode.labelPriceReset')"
              @click="$emit('reset-label-price', data.rowKey)"
            />
          </template>
        </div>
      </template>

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
import { LABEL_CURRENCY_SYMBOLS, computeLabelPrice, normalizeLabelPriceInput, formatLabelPriceInput } from '@/services/helper/barcode/label-price.js'

import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

export default {
  components: { BaseDataTable, InputTextGeneric, ButtonGeneric },

  props: {
    rows: {
      type: Array,
      default: () => []
    },
    selection: {
      type: Array,
      default: () => []
    },
    showLabelPrice: {
      type: Boolean,
      default: false
    },
    labelCurrency: {
      type: String,
      default: 'USD'
    },
    labelRate: {
      type: [String, Number],
      default: ''
    }
  },

  emits: ['update:selection', 'change-copies', 'commit-copies', 'change-label-price', 'reset-label-price'],

  data() {
    return {
      maxCopies: MAX_COPIES_PER_ROW
    }
  },

  computed: {
    labelSymbol() {
      return LABEL_CURRENCY_SYMBOLS[this.labelCurrency]
    },

    columns() {
      const labelPriceColumn = this.showLabelPrice
        ? [
            {
              field: 'labelPrice',
              header: this.$t('view.stock.printBarcode.labelPriceInput'),
              sortable: false,
              minWidth: '240px',
              align: 'center'
            }
          ]
        : []
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
        ...labelPriceColumn,
        {
          field: 'printCount',
          header: this.$t('view.stock.printBarcode.colCopies'),
          sortable: false,
          minWidth: '110px',
          align: 'center'
        }
      ]
    }
  },

  methods: {
    onLabelPriceBlur(row) {
      if (this.isEdited(row)) {
        this.$emit('change-label-price', { rowKey: row.rowKey, value: normalizeLabelPriceInput(row.labelPriceOverride) })
      }
    },

    isEdited(row) {
      return row.labelPriceOverride !== null && row.labelPriceOverride !== undefined
    },

    labelPriceValue(row) {
      if (this.isEdited(row)) return row.labelPriceOverride
      return formatLabelPriceInput(computeLabelPrice(row.productPrice, this.labelCurrency, this.labelRate))
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

.label-price-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-sm);
}

.label-price-input {
  max-width: calc(var(--sp-2xl) * 4);
}

.label-price-symbol {
  font-weight: 700;
}

.label-price-edited {
  font-size: var(--fs-sm);
  color: var(--base-font-color);
  background: var(--status-open-bg);
  padding: 0 var(--sp-xs);
  border-radius: var(--radius-sm);
  white-space: nowrap;
}

.copies-input {
  max-width: calc(var(--sp-2xl) * 3);
  margin: 0 auto;
  text-align: center;
}
</style>
