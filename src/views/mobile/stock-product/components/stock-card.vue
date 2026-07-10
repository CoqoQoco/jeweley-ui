<template>
  <div class="stock-card" @click="$emit('click')">
    <div class="stock-card-image">
      <ImagePreview
        v-if="item.imagePath"
        :imageName="item.imagePath"
        type="STOCK-PRODUCT"
        :width="60"
        :height="60"
      />
      <div v-else class="no-image">
        <i class="bi bi-image"></i>
      </div>
    </div>

    <div class="stock-card-content">
      <div class="stock-card-header">
        <span class="stock-number">{{ item.stockNumber }}</span>
        <i class="bi bi-chevron-right"></i>
      </div>
      <div class="product-name">{{ item.productNameTh || item.productNameEn || '-' }}</div>
      <div class="stock-card-meta">
        <span v-if="item.location" class="meta-item">
          <i class="bi bi-geo-alt"></i>
          {{ item.location }}
        </span>
        <span class="meta-item">
          <i class="bi bi-box-seam"></i>
          {{ $t('view.mobile.stockProduct.availableShort') }} {{ formatDecimal(item.qtyAvailable, 0) }}
        </span>
      </div>
      <div class="stock-card-price">{{ formatDecimal(item.productPrice, 2) }} ฿</div>
    </div>
  </div>
</template>

<script>
import { formatDecimal } from '@/services/utils/decimal.js'

import ImagePreview from '@/components/prime-vue/ImagePreview.vue'

export default {
  name: 'StockCard',

  components: { ImagePreview },

  props: {
    item: {
      type: Object,
      required: true
    }
  },

  emits: ['click'],

  methods: {
    formatDecimal(value, decimals) {
      if (value === null || value === undefined || value === '') return '0'
      return formatDecimal(value, decimals)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/mobile';

.stock-card {
  display: flex;
  gap: var(--sp-md);
  background: var(--color-card-bg);
  border-radius: var(--radius-lg);
  padding: var(--sp-md);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.99);
  }
}

.stock-card-image {
  width: 60px;
  height: 60px;
  flex-shrink: 0;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;

  .no-image {
    color: var(--color-border);
    font-size: 1.5rem;
  }
}

.stock-card-content {
  flex: 1;
  min-width: 0;
}

.stock-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .stock-number {
    font-weight: 700;
    color: var(--base-font-color);
    font-size: 0.95rem;
  }

  i {
    color: #ccc;
    font-size: 1rem;
  }
}

.product-name {
  font-size: 0.85rem;
  color: #333;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stock-card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-md);
  margin-top: 4px;

  .meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.75rem;
    color: #666;

    i {
      font-size: 0.75rem;
      color: #999;
    }
  }
}

.stock-card-price {
  margin-top: 4px;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--base-green);
}
</style>
