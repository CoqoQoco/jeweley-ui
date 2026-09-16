<template>
  <div class="source-list">
    <div v-if="!sources.length" class="source-empty">
      {{ $t('view.stock.convert.noSource') }}
    </div>

    <div v-for="(item, index) in sources" :key="item.stockNumber || index" class="source-card">
      <div class="source-card-header">
        <div class="source-card-title">
          <span class="source-stock-number">{{ item.stockNumber || '-' }}</span>
          <span v-if="item.stockNumberOrigin" class="source-stock-number-origin">({{ item.stockNumberOrigin }})</span>
        </div>
        <ButtonGeneric
          v-if="removable"
          variant="red"
          icon="bi-trash"
          :title="$t('common.btn.delete')"
          @click="$emit('remove', index)"
        />
      </div>

      <div class="source-card-body">
        <div class="source-field">
          <span class="source-label">{{ $t('view.stock.convert.productNumber') }}</span>
          <span class="source-value">{{ item.productNumber || '-' }}</span>
        </div>
        <div class="source-field">
          <span class="source-label">{{ $t('view.stock.convert.productNameEn') }}</span>
          <span class="source-value">{{ item.productNameEn || '-' }}</span>
        </div>
        <div class="source-field">
          <span class="source-label">{{ $t('view.stock.convert.picker.location') }}</span>
          <span class="source-value">{{ locationText(item) }}</span>
        </div>
        <div class="source-field">
          <span class="source-label">{{ $t('view.stock.convert.picker.colCost') }}</span>
          <span class="source-value">{{ formatDecimal(costOf(item), 2) }}</span>
        </div>
      </div>

      <materialTable v-if="item.materials" :items="item.materials" variant="compact" />
    </div>

    <div v-if="sources.length" class="source-total">
      {{ $t('view.stock.convert.sourceCostTotalLabel') }}: {{ formatDecimal(totalCost, 2) }}
    </div>
  </div>
</template>

<script>
import { formatDecimal } from '@/services/utils/decimal.js'

import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import materialTable from '@/views/stock/product/components/material-table.vue'

export default {
  name: 'StockConvertSourceListSection',

  components: {
    ButtonGeneric,
    materialTable
  },

  props: {
    sources: {
      type: Array,
      default: () => []
    },
    removable: {
      type: Boolean,
      default: false
    }
  },

  emits: ['remove'],

  computed: {
    totalCost() {
      return this.sources.reduce((sum, item) => sum + this.costOf(item), 0)
    }
  },

  methods: {
    formatDecimal,

    // productCost = ต้นทุนจริงที่ StockConvert/Get คืนมา (ItemDto) — authoritative เมื่อมี
    // productPrice = ราคาขาย จาก StockProduct/List — ใช้เป็นค่าประเมินเฉพาะตอนยังไม่ได้ Create (เลือกจาก picker)
    costOf(item) {
      return Number(item.productCost ?? item.productPrice ?? item.cost ?? item.price ?? 0) || 0
    },

    locationText(item) {
      return item.location || item.locationName || item.locationCode || '-'
    }
  }
}
</script>

<style lang="scss" scoped>
.source-list {
  display: flex;
  flex-direction: column;
  gap: var(--sp-lg);
}

.source-empty {
  text-align: center;
  color: var(--base-sub-color);
  padding: var(--sp-lg);
}

.source-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--sp-lg);
  background: var(--color-card-bg);
}

.source-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--sp-sm);
}

.source-card-title {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
}

.source-stock-number {
  font-weight: 700;
  color: var(--base-font-color);
}

.source-stock-number-origin {
  color: var(--base-sub-color);
}

.source-card-body {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--sp-sm) var(--sp-lg);
  margin-bottom: var(--sp-md);

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.source-field {
  display: flex;
  flex-direction: column;
  gap: var(--sp-xs);
}

.source-label {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}

.source-value {
  font-weight: 600;
}

.source-total {
  text-align: right;
  font-weight: 700;
  color: var(--base-font-color);
}
</style>
