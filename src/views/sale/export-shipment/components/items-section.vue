<template>
  <SectionCardGeneric :title="$t('view.sale.exportShipment.sectionItems')" icon="bi-box-seam" headerStyle="filled">
    <template #header-actions>
      <span class="items-count-badge">{{ $t('view.sale.exportShipment.itemsBadge', { count: items.length }) }}</span>
    </template>

    <div class="items-toolbar">
      <ButtonGeneric
        variant="main"
        icon="bi-plus-circle"
        :label="$t('view.sale.exportShipment.addFromStock')"
        :disabled="!editable"
        @click="$emit('add-item')"
      />
      <ButtonGeneric
        variant="outline"
        icon="bi-calculator"
        :label="$t('view.sale.exportShipment.recalcAll')"
        class="ml-2"
        :disabled="!editable || items.length === 0"
        @click="$emit('recalc-all')"
      />
      <ButtonGeneric
        v-if="editable && selectedItems.length"
        variant="red"
        icon="bi-trash"
        :label="$t('view.sale.exportShipment.deleteSelected', { count: selectedItems.length })"
        class="ml-2"
        @click="onRemoveSelected"
      />
    </div>

    <div v-if="items.length === 0" class="empty-state">
      <i class="bi bi-inbox empty-icon"></i>
      <span class="empty-text">{{ $t('view.sale.exportShipment.noItems') }}</span>
    </div>

    <BaseDataTable
      v-else
      :items="pagedItems"
      :totalRecords="items.length"
      :columns="columns"
      :perPage="perPage"
      :paginator="true"
      :rowsPerPageOptions="[20, 50, 100]"
      :selectionMode="editable"
      selectionType="multiple"
      :itemsSelection="selectedItems"
      dataKey="id"
      scrollHeight="480px"
      @update:itemsSelection="selectedItems = $event"
      @page="onPageChange"
    >
      <template #descriptionTemplate="{ data }">
        <span v-if="!editable">{{ data.description }}</span>
        <InputTextGeneric v-else :modelValue="data.description" @update:modelValue="updateField(data.id, 'description', $event)" />
      </template>

      <template #netWeightTemplate="{ data }">
        <div class="text-right">{{ fmt(data.netWeight, 3) }}</div>
      </template>

      <template #goldWeightTemplate="{ data }">
        <div class="text-right">{{ fmt(data.goldWeight, 2) }}</div>
      </template>

      <template #stoneWeightTemplate="{ data }">
        <div class="text-right">{{ fmt(data.stoneWeight, 2) }}</div>
      </template>

      <template #diamondWeightTemplate="{ data }">
        <div class="text-right">{{ fmt(data.diamondWeight, 3) }}</div>
      </template>

      <template #qtyTemplate="{ data }">
        <span v-if="!editable" class="text-right d-block">{{ data.qty }}</span>
        <InputTextGeneric v-else type="number" min="0" :modelValue="data.qty" @update:modelValue="updateField(data.id, 'qty', $event)" />
      </template>

      <template #unitPriceTemplate="{ data }">
        <span v-if="!editable" class="text-right d-block">{{ formatNumber(data.unitPrice) }}</span>
        <InputTextGeneric v-else type="number" min="0" step="0.01" :modelValue="data.unitPrice" @update:modelValue="updateField(data.id, 'unitPrice', $event)" />
      </template>

      <template #amountTemplate="{ data }">
        <div class="text-right">{{ formatNumber(computeAmount(data)) }}</div>
      </template>

      <template #parcelNoTemplate="{ data }">
        <span v-if="!editable">{{ data.parcelNo }}</span>
        <InputTextGeneric v-else type="number" min="0" :modelValue="data.parcelNo" @update:modelValue="updateField(data.id, 'parcelNo', $event)" />
      </template>

      <template v-if="editable" #actionTemplate="{ data }">
        <div class="text-center">
          <ButtonGeneric variant="red" icon="bi-trash" :title="$t('common.btn.delete')" @click="$emit('remove-items', [data.id])" />
        </div>
      </template>

      <template #footer>
        <div class="items-footer">
          <div class="items-footer-row">
            <span class="footer-label">{{ $t('view.sale.exportShipment.totalNetWeight') }}</span>
            <span class="footer-value">{{ fmt(totals.netWeight, 3) }}</span>
          </div>
          <div class="items-footer-row">
            <span class="footer-label">{{ $t('view.sale.exportShipment.totalGoldWeight') }}</span>
            <span class="footer-value">{{ fmt(totals.goldWeight, 2) }}</span>
          </div>
          <div class="items-footer-row">
            <span class="footer-label">{{ $t('view.sale.exportShipment.totalStoneWeight') }}</span>
            <span class="footer-value">{{ fmt(totals.stoneWeight, 2) }}</span>
          </div>
          <div class="items-footer-row">
            <span class="footer-label">{{ $t('view.sale.exportShipment.totalDiamondWeight') }}</span>
            <span class="footer-value">{{ fmt(totals.diamondWeight, 3) }}</span>
          </div>
          <div class="items-footer-row items-footer-row--highlight">
            <span class="footer-label">{{ $t('view.sale.exportShipment.grandTotalAmount') }}</span>
            <span class="footer-value">{{ formatNumber(totals.amount) }}</span>
          </div>
        </div>
      </template>
    </BaseDataTable>
  </SectionCardGeneric>
</template>

<script>
import { formatNumber } from '@/services/utils/decimal.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'

export default {
  name: 'ExportShipmentItemsSection',

  components: {
    SectionCardGeneric,
    ButtonGeneric,
    InputTextGeneric,
    BaseDataTable
  },

  props: {
    items: {
      type: Array,
      default: () => []
    },
    editable: {
      type: Boolean,
      default: true
    }
  },

  emits: ['update:items', 'add-item', 'remove-items', 'recalc-all'],

  data() {
    return {
      skip: 0,
      perPage: 50,
      selectedItems: []
    }
  },

  computed: {
    pagedItems() {
      return this.items.slice(this.skip, this.skip + this.perPage)
    },

    totals() {
      return this.items.reduce(
        (acc, it) => {
          acc.netWeight += Number(it.netWeight) || 0
          acc.goldWeight += Number(it.goldWeight) || 0
          acc.stoneWeight += Number(it.stoneWeight) || 0
          acc.diamondWeight += Number(it.diamondWeight) || 0
          acc.amount += this.computeAmount(it)
          return acc
        },
        { netWeight: 0, goldWeight: 0, stoneWeight: 0, diamondWeight: 0, amount: 0 }
      )
    },

    columns() {
      const columns = [
        { field: 'itemNo', header: this.$t('view.sale.exportShipment.colItemNo'), width: '70px', sortable: false },
        { field: 'stockNumber', header: this.$t('view.sale.exportShipment.colStockNo'), minWidth: '110px', sortable: false },
        { field: 'description', header: this.$t('view.sale.exportShipment.colDescription'), minWidth: '200px', sortable: false },
        { field: 'netWeight', header: this.$t('view.sale.exportShipment.colNetWeight'), minWidth: '90px', sortable: false },
        { field: 'goldWeight', header: this.$t('view.sale.exportShipment.colGoldWeight'), minWidth: '90px', sortable: false },
        { field: 'stoneWeight', header: this.$t('view.sale.exportShipment.colStoneWeight'), minWidth: '90px', sortable: false },
        { field: 'diamondWeight', header: this.$t('view.sale.exportShipment.colDiamondWeight'), minWidth: '90px', sortable: false },
        { field: 'qty', header: this.$t('view.sale.exportShipment.colQty'), minWidth: '90px', sortable: false },
        { field: 'unitPrice', header: this.$t('view.sale.exportShipment.colUnitPrice'), minWidth: '110px', sortable: false },
        { field: 'amount', header: this.$t('view.sale.exportShipment.colAmount'), minWidth: '110px', sortable: false },
        { field: 'parcelNo', header: this.$t('view.sale.exportShipment.colParcelNo'), minWidth: '90px', sortable: false }
      ]

      if (this.editable) {
        columns.push({ field: 'action', header: '', width: '60px', sortable: false })
      }

      return columns
    }
  },

  watch: {
    items() {
      this.selectedItems = []
      if (this.skip >= this.items.length) this.skip = 0
    }
  },

  methods: {
    onPageChange(e) {
      this.skip = e.first
      this.perPage = e.rows
    },

    updateField(id, field, value) {
      const numericFields = ['qty', 'unitPrice', 'parcelNo']
      const parsed = numericFields.includes(field) ? Number(value) : value
      const updated = this.items.map((it) => (it.id === id ? { ...it, [field]: parsed } : it))
      this.$emit('update:items', updated)
    },

    computeAmount(data) {
      const unitPrice = Number(data.unitPrice) || 0
      const qty = Number(data.qty) || 0
      return Math.round(unitPrice * qty * 100) / 100
    },

    onRemoveSelected() {
      const ids = this.selectedItems.map((it) => it.id)
      if (!ids.length) return
      confirmThenSubmit(
        this.$t('view.sale.exportShipment.confirmRemoveMsg', { count: ids.length }),
        this.$t('view.sale.exportShipment.confirmRemoveTitle'),
        () => {
          this.$emit('remove-items', ids)
        }
      )
    },

    fmt(value, decimals = 2) {
      return (Number(value) || 0).toFixed(decimals)
    },

    formatNumber(value) {
      return formatNumber(value, 2)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.items-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--sp-xs);
  margin-bottom: var(--sp-md);
}

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
</style>
