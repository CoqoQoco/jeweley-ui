<template>
  <div class="detail-info">
    <div class="info-card">
      <div class="card-header">
        <i class="bi bi-image"></i>
        <span>{{ $t('view.stock.product.imageProduct') }}</span>
      </div>
      <div class="card-body image-body">
        <ImagePreview
          v-if="item.imagePath"
          :imageName="item.imagePath"
          type="STOCK-PRODUCT"
          :width="140"
          :height="140"
        />
        <div v-else class="no-image">
          <i class="bi bi-image"></i>
        </div>
      </div>
    </div>

    <div class="info-card mobile-mt-2">
      <div class="card-header">
        <i class="bi bi-clipboard2-check-fill"></i>
        <span>{{ $t('view.stock.product.stockInfo') }}</span>
      </div>
      <div class="card-body">
        <div class="info-row">
          <span class="info-label">{{ $t('view.stock.product.stockNumberNew') }}</span>
          <span class="info-value highlight">{{ item.stockNumber || '-' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">{{ $t('view.stock.product.stockNumberOld') }}</span>
          <span class="info-value">{{ item.stockNumberOrigin || '-' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">{{ $t('view.stock.product.productNumber') }}</span>
          <span class="info-value">{{ item.productNumber || '-' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">{{ $t('view.stock.product.mold') }}</span>
          <span class="info-value">{{ item.mold || '-' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">{{ $t('view.stock.product.productNameEn') }}</span>
          <span class="info-value">{{ item.productNameEn || '-' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">{{ $t('view.stock.product.productNameTh') }}</span>
          <span class="info-value">{{ item.productNameTh || '-' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">{{ $t('view.stock.product.productType') }}</span>
          <span class="info-value">{{ item.productTypeName || '-' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">{{ $t('view.stock.product.size') }}</span>
          <span class="info-value">{{ item.size || '-' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">{{ $t('view.stock.product.goldColor') }}</span>
          <span class="info-value">{{ item.productionType || '-' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">{{ $t('view.stock.product.goldType') }}</span>
          <span class="info-value">{{ item.productionTypeSize || '-' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">{{ $t('view.stock.product.wo') }}</span>
          <span class="info-value">{{ woDisplay }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">{{ $t('view.stock.product.locationHeader') }}</span>
          <span class="info-value">{{ item.location || '-' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">{{ $t('common.field.price') }}</span>
          <span class="info-value">{{ formatDecimal(item.productPrice, 2) }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">{{ $t('view.stock.product.receiver') }}</span>
          <span class="info-value">{{ item.createBy || '-' }}</span>
        </div>
      </div>
    </div>

    <div v-if="item.remark" class="info-card mobile-mt-2">
      <div class="card-header">
        <i class="bi bi-chat-left-text"></i>
        <span>{{ $t('common.field.remark') }}</span>
      </div>
      <div class="card-body">
        <div class="remark-text">{{ item.remark }}</div>
      </div>
    </div>

    <div v-if="materials.length" class="info-card mobile-mt-2">
      <div class="card-header">
        <i class="bi bi-gem"></i>
        <span>{{ $t('view.stock.product.materialsTitle') }}</span>
      </div>
      <div class="card-body materials-body">
        <div v-for="(m, idx) in materials" :key="idx" class="material-item">
          <div class="material-header">
            <span class="material-type">{{ getMaterialTypeLabel(m) }}</span>
            <span v-if="m.size" class="material-size">{{ m.size }}</span>
          </div>
          <div class="material-rows">
            <span>{{ $t('common.field.quantity') }}: {{ getQty(m) }}</span>
            <span>{{ $t('common.field.weight') }}: {{ getWeight(m) }}</span>
            <span>{{ $t('common.field.price') }}: {{ formatDecimal(m.price, 2) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'
import { formatDecimal } from '@/services/utils/decimal.js'

import ImagePreview from '@/components/prime-vue/ImagePreview.vue'

export default {
  name: 'DetailInfo',

  components: { ImagePreview },

  setup() {
    const masterStore = useMasterApiStore()
    return { masterStore }
  },

  props: {
    item: {
      type: Object,
      required: true
    }
  },

  computed: {
    materials() {
      return this.item?.materials || []
    },
    woDisplay() {
      return this.item.wo && this.item.woNumber ? `${this.item.wo}-${this.item.woNumber}` : '-'
    },
    masterGold() {
      return this.masterStore.gold
    }
  },

  methods: {
    formatDecimal,

    getMaterialTypeLabel(m) {
      if (m.type === 'Diamond') return this.getDiamondType(m.typeCode)
      if (m.type === 'Gold' || m.type === 'Silver') return this.getGoldType(m.typeCode)
      if (m.type === 'Gem') return this.getGemType(m.typeCode)
      return m.type || '-'
    },

    getGoldType(type) {
      return this.masterGold.find((g) => g.code === type)?.nameEn ?? 'Gold'
    },

    getGemType(type) {
      return type
    },

    getDiamondType(type) {
      return `Diamond${type ? ` (${type})` : ''}`
    },

    getQty(m) {
      return `${m.qty ?? 0}${m.qtyUnit ? ` ${m.qtyUnit}` : ''}`
    },

    getWeight(m) {
      return `${(m.weight ?? 0).toFixed(3)}${m.weightUnit ? ` ${m.weightUnit}` : ''}`
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/mobile';

.info-card {
  background: var(--color-card-bg);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.card-header {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  padding: var(--sp-md) var(--sp-lg);
  background: #f8f9fa;
  border-bottom: 1px solid var(--color-border);
  font-weight: 600;
  color: var(--base-font-color);
  font-size: 0.95rem;

  i {
    font-size: 1.1rem;
  }
}

.card-body {
  padding: var(--sp-lg);
}

.image-body {
  display: flex;
  align-items: center;
  justify-content: center;

  .no-image {
    width: 140px;
    height: 140px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
    border-radius: var(--radius-md);
    color: var(--color-border);
    font-size: 2.5rem;
  }
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
  gap: var(--sp-md);

  &:last-child {
    margin-bottom: 0;
  }
}

.info-label {
  font-size: 0.85rem;
  color: #666;
  font-weight: 500;
  flex-shrink: 0;
  min-width: 110px;
}

.info-value {
  font-size: 0.9rem;
  color: #333;
  text-align: right;
  word-break: break-word;

  &.highlight {
    color: var(--base-font-color);
    font-weight: 700;
    font-size: 1rem;
  }
}

.remark-text {
  font-size: 0.9rem;
  color: #333;
  line-height: 1.5;
}

.materials-body {
  display: flex;
  flex-direction: column;
  gap: var(--sp-sm);
}

.material-item {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--sp-md);
}

.material-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;

  .material-type {
    font-weight: 700;
    color: var(--base-font-color);
    font-size: 0.85rem;
  }

  .material-size {
    font-size: 0.75rem;
    color: #666;
  }
}

.material-rows {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 0.8rem;
  color: #444;
}
</style>
