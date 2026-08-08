<template>
  <SectionCardGeneric
    :title="$t('view.sale.materialSale.sectionItems')"
    icon="bi-gem"
    headerStyle="filled"
  >
    <template #header-actions>
      <span class="items-count-badge">{{ $t('view.sale.materialSale.itemsBadge', { count: items.length }) }}</span>
    </template>

    <div v-if="items.length === 0" class="empty-state">
      <i class="bi bi-inbox empty-icon"></i>
      <span class="empty-text">{{ $t('view.sale.materialSale.noItems') }}</span>
    </div>

    <BaseDataTable
      v-else
      :items="items"
      :totalRecords="items.length"
      :columns="columns"
      :paginator="false"
      scrollHeight="420px"
      dataKey="gemCode"
    >
      <template #noTemplate="{ index }">
        <div>{{ index + 1 }}</div>
      </template>

      <template #gemCodeTemplate="{ data }">
        <div>{{ data.gemCode }}</div>
      </template>

      <template #descriptionTemplate="{ data, index }">
        <span v-if="!editable">{{ data.description }}</span>
        <InputTextGeneric
          v-else
          :modelValue="data.description"
          @update:modelValue="updateField(index, 'description', $event)"
        />
      </template>

      <template #qtyPieceTemplate="{ data, index }">
        <span v-if="!editable" class="text-right d-block">{{ formatInt(data.qtyPiece) }}</span>
        <template v-else>
          <InputTextGeneric
            type="number"
            :modelValue="data.qtyPiece"
            @update:modelValue="updateField(index, 'qtyPiece', $event)"
          />
          <small v-if="data.remainQty !== undefined && data.remainQty !== null" :class="['hint-text', { 'hint-exceed': isExceed(data.qtyPiece, data.remainQty) }]">
            {{ $t('view.sale.materialSale.remainQtyHint', { qty: formatInt(data.remainQty) }) }}
          </small>
        </template>
      </template>

      <template #priceInclVatTemplate="{ data, index }">
        <span v-if="!editable" class="text-right d-block">{{ formatNumber(data.priceInclVat) }}</span>
        <template v-else>
          <InputTextGeneric
            type="number"
            step="0.01"
            :modelValue="data.priceInclVat"
            @update:modelValue="updateField(index, 'priceInclVat', $event)"
          />
          <small v-if="data.refStockPrice !== undefined && data.refStockPrice !== null" class="hint-text">
            {{ $t('view.sale.materialSale.stockPriceHint', { price: formatNumber(data.refStockPrice) }) }}
          </small>
        </template>
      </template>

      <template #qtyWeightTemplate="{ data, index }">
        <span v-if="!editable" class="text-right d-block">{{ formatNumber(data.qtyWeight) }}</span>
        <template v-else>
          <InputTextGeneric
            type="number"
            step="0.01"
            :modelValue="data.qtyWeight"
            @update:modelValue="updateField(index, 'qtyWeight', $event)"
          />
          <small v-if="data.remainWeight !== undefined && data.remainWeight !== null" :class="['hint-text', { 'hint-exceed': isExceed(data.qtyWeight, data.remainWeight) }]">
            {{ $t('view.sale.materialSale.remainWeightHint', { weight: formatNumber(data.remainWeight) }) }}
          </small>
        </template>
      </template>

      <template #priceExclVatTemplate="{ data }">
        <div class="text-right">{{ formatNumber(data.priceExclVat) }}</div>
      </template>

      <template #amountTemplate="{ data }">
        <div class="text-right">{{ formatNumber(data.amount) }}</div>
      </template>

      <template v-if="editable" #actionTemplate="{ index }">
        <div class="text-center">
          <ButtonGeneric variant="red" icon="bi-trash" :title="$t('common.btn.delete')" @click="$emit('remove', index)" />
        </div>
      </template>

      <template #footer>
        <div class="items-footer">
          <div class="items-footer-row">
            <span class="footer-label">{{ $t('view.sale.materialSale.subTotal') }}</span>
            <span class="footer-value">{{ formatNumber(subTotal) }}</span>
          </div>
          <div class="items-footer-row">
            <span class="footer-label">{{ $t('view.sale.materialSale.vatLabel', { percent: vatPercent }) }}</span>
            <span class="footer-value">{{ formatNumber(vatAmount) }}</span>
          </div>
          <div class="items-footer-row items-footer-row--highlight">
            <span class="footer-label">{{ $t('view.sale.materialSale.grandTotal') }}</span>
            <span class="footer-value">{{ formatNumber(grandTotal) }}</span>
          </div>
        </div>
      </template>
    </BaseDataTable>
  </SectionCardGeneric>
</template>

<script>
// External dependencies
import { formatNumber } from '@/services/utils/decimal.js'

// Local components
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  name: 'MaterialSaleItemsSection',

  components: {
    SectionCardGeneric,
    ButtonGeneric,
    InputTextGeneric,
    BaseDataTable
  },

  props: {
    items: { type: Array, default: () => [] },
    editable: { type: Boolean, default: true },
    subTotal: { type: Number, default: 0 },
    vatPercent: { type: [String, Number], default: 7 },
    vatAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 }
  },

  emits: ['update:items', 'remove'],

  computed: {
    columns() {
      const columns = [
        { field: 'no', header: this.$t('view.sale.materialSale.colItemNo'), width: '50px', sortable: false },
        { field: 'gemCode', header: this.$t('view.sale.materialSale.colGemCode'), minWidth: '110px', sortable: false },
        { field: 'description', header: this.$t('view.sale.materialSale.colDescription'), minWidth: '180px', sortable: false },
        { field: 'qtyPiece', header: this.$t('view.sale.materialSale.colQtyPiece'), minWidth: '130px', sortable: false },
        { field: 'priceInclVat', header: this.$t('view.sale.materialSale.colPriceInclVat'), minWidth: '150px', sortable: false },
        { field: 'qtyWeight', header: this.$t('view.sale.materialSale.colQtyWeight'), minWidth: '130px', sortable: false },
        { field: 'priceExclVat', header: this.$t('view.sale.materialSale.colPriceExclVat'), minWidth: '130px', sortable: false },
        { field: 'amount', header: this.$t('view.sale.materialSale.colAmount'), minWidth: '130px', sortable: false }
      ]

      if (this.editable) {
        columns.push({ field: 'action', header: '', width: '60px', sortable: false })
      }

      return columns
    }
  },

  methods: {
    updateField(index, field, value) {
      const updated = this.items.map((it, i) => (i === index ? { ...it, [field]: value } : it))
      this.$emit('update:items', updated)
    },

    isExceed(entered, remain) {
      return Number(entered) > Number(remain)
    },

    formatNumber(val) {
      return formatNumber(val, 2)
    },

    formatInt(val) {
      return formatNumber(val, 0)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.items-count-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--sp-xs) var(--sp-md);
  background: var(--overlay-white-chip);
  color: var(--on-inverse);
  border-radius: var(--radius-sm);
  font-size: var(--fs-sm);
  font-weight: 700;
  white-space: nowrap;
}

.items-footer {
  padding: var(--sp-sm) 0;
}

.items-footer-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: var(--sp-md);
  padding: var(--sp-xs) var(--sp-lg);
  font-size: var(--fs-base);
  color: var(--base-font-color);
}

.items-footer-row--highlight {
  margin-top: var(--sp-xs);
  padding-top: var(--sp-sm);
  border-top: 1px solid var(--color-border);
  font-weight: 700;
  font-size: var(--fs-lg);
}

.footer-label {
  opacity: 0.8;
}

.footer-value {
  min-width: 120px;
  text-align: right;
  font-weight: 600;
}

.items-footer-row--highlight .footer-value {
  font-weight: 700;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--sp-2xl) var(--sp-lg);
  gap: var(--sp-sm);
}

.empty-icon {
  font-size: 2.5rem;
  color: var(--base-green);
  opacity: 0.5;
}

.empty-text {
  color: var(--base-font-color);
  opacity: 0.6;
  font-size: var(--fs-base);
}

.hint-text {
  display: block;
  color: var(--base-sub-color);
  font-size: var(--fs-sm);
  margin-top: var(--sp-xs);
}

.hint-exceed {
  color: var(--base-red);
  font-weight: 700;
}
</style>
