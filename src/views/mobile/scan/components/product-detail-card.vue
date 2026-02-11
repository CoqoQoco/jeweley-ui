<template>
  <div class="product-detail-card">
    <!-- Product Image -->
    <div class="product-image-section">
      <div v-if="product.imagePath" class="product-image">
        <imagePreview
          :imageName="product.imagePath"
          :path="product.imagePath"
          :type="imageType"
          :width="imageSize"
          :height="imageSize"
          :preview="true"
        />
      </div>
      <div v-else class="product-image-placeholder">
        <i class="bi bi-image"></i>
        <span>ไม่มีรูปภาพ</span>
      </div>
    </div>

    <!-- Product Information -->
    <div class="product-info-section">
      <!-- Stock Numbers -->
      <div class="info-group">
        <div class="info-row">
          <span class="info-label">เลขที่ผลิต (ใหม่):</span>
          <span class="info-value highlight">{{ product.stockNumber || '-' }}</span>
        </div>
        <div v-if="product.stockNumberOrigin" class="info-row">
          <span class="info-label">เลขที่ผลิต (เก่า):</span>
          <span class="info-value">{{ product.stockNumberOrigin }}</span>
        </div>
      </div>

      <!-- Product Details -->
      <div class="info-group">
        <div class="info-row">
          <span class="info-label">รหัสสินค้า:</span>
          <span class="info-value">{{ product.productNumber || '-' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">แม่พิมพ์:</span>
          <span class="info-value">{{ product.mold || '-' }}</span>
        </div>
        <div v-if="product.productNameEn" class="info-row">
          <span class="info-label">ชื่อสินค้า (EN):</span>
          <span class="info-value">{{ product.productNameEn }}</span>
        </div>
        <div v-if="product.productNameTh" class="info-row">
          <span class="info-label">ชื่อสินค้า (TH):</span>
          <span class="info-value">{{ product.productNameTh }}</span>
        </div>
        <div v-if="product.productTypeName" class="info-row">
          <span class="info-label">ประเภทสินค้า:</span>
          <span class="info-value">{{ product.productTypeName }}</span>
        </div>
        <div v-if="product.size" class="info-row">
          <span class="info-label">ขนาด:</span>
          <span class="info-value">{{ product.size }}</span>
        </div>
      </div>

      <!-- Production Info -->
      <div class="info-group">
        <div v-if="product.productionType" class="info-row">
          <span class="info-label">สีของทอง/เงิน:</span>
          <span class="info-value">{{ product.productionType }}</span>
        </div>
        <div v-if="product.productionTypeSize" class="info-row">
          <span class="info-label">ประเภททอง/เงิน:</span>
          <span class="info-value">{{ product.productionTypeSize }}</span>
        </div>
        <div v-if="product.woText" class="info-row">
          <span class="info-label">W.O.:</span>
          <span class="info-value">{{ product.woText }}</span>
        </div>
      </div>

      <!-- Price & Location -->
      <div class="info-group">
        <div v-if="product.productPrice !== null && product.productPrice !== undefined" class="info-row">
          <span class="info-label">ราคา:</span>
          <span class="info-value price">{{ formatPrice(product.productPrice) }} บาท</span>
        </div>
        <div v-if="product.location" class="info-row">
          <span class="info-label">จัดเก็บ:</span>
          <span class="info-value">{{ product.location }}</span>
        </div>
      </div>

      <!-- Materials Summary (if available) -->
      <div v-if="hasMaterials" class="info-group materials-section">
        <div class="materials-header">
          <i class="bi bi-gem"></i>
          <span>วัตถุดิบ</span>
        </div>

        <!-- Gold -->
        <div v-if="product.goldTotal > 0" class="material-row">
          <span class="material-label">ทอง:</span>
          <span class="material-value">{{ formatWeight(product.goldTotal) }} กรัม</span>
        </div>

        <!-- Diamond -->
        <div v-if="product.diamondTotal > 0" class="material-row">
          <span class="material-label">เพชร:</span>
          <span class="material-value">{{ formatWeight(product.diamondTotal) }} กะรัต</span>
        </div>

        <!-- Gems -->
        <div v-if="product.gemTotal > 0" class="material-row">
          <span class="material-label">พลอย:</span>
          <span class="material-value">{{ formatWeight(product.gemTotal) }} กะรัต</span>
        </div>
      </div>

      <!-- Remark -->
      <div v-if="product.remark" class="info-group">
        <div class="info-row remark-row">
          <span class="info-label">หมายเหตุ:</span>
          <span class="info-value">{{ product.remark }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import imagePreview from '@/components/prime-vue/ImagePreview.vue'

export default {
  name: 'ProductDetailCard',

  components: {
    imagePreview
  },

  props: {
    product: {
      type: Object,
      required: true,
      default: () => ({})
    },
    imageType: {
      type: String,
      default: 'STOCK-PRODUCT'
    },
    imageSize: {
      type: Number,
      default: 200
    }
  },

  computed: {
    hasMaterials() {
      return (
        (this.product.goldTotal && this.product.goldTotal > 0) ||
        (this.product.diamondTotal && this.product.diamondTotal > 0) ||
        (this.product.gemTotal && this.product.gemTotal > 0)
      )
    }
  },

  methods: {
    formatPrice(value) {
      if (!value && value !== 0) return '-'
      return new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value)
    },

    formatWeight(value) {
      if (!value && value !== 0) return '-'
      return new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3
      }).format(value)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/mobile';

.product-detail-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.product-image-section {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;

  .product-image {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .product-image-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 200px;
    height: 200px;
    background: white;
    border: 2px dashed #ddd;
    border-radius: 8px;
    color: #999;

    i {
      font-size: 3rem;
      margin-bottom: 8px;
    }

    span {
      font-size: 0.9rem;
    }
  }
}

.product-info-section {
  padding: 16px;
}

.info-group {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  gap: 12px;

  &:last-child {
    margin-bottom: 0;
  }

  &.remark-row {
    flex-direction: column;
    gap: 4px;
  }
}

.info-label {
  font-size: 0.85rem;
  color: #666;
  font-weight: 500;
  flex-shrink: 0;
  min-width: 120px;
}

.info-value {
  font-size: 0.9rem;
  color: #333;
  text-align: right;
  word-break: break-word;

  &.highlight {
    color: var(--base-font-color);
    font-weight: 600;
    font-size: 1rem;
  }

  &.price {
    color: var(--base-green);
    font-weight: 600;
  }
}

.materials-section {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;

  .materials-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    color: var(--base-font-color);
    margin-bottom: 12px;
    font-size: 0.95rem;

    i {
      font-size: 1.1rem;
    }
  }

  .material-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .material-label {
    font-size: 0.85rem;
    color: #666;
  }

  .material-value {
    font-size: 0.85rem;
    color: #333;
    font-weight: 500;
  }
}
</style>
