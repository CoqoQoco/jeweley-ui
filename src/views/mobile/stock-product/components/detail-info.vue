<template>
  <div class="detail-info">
    <div class="info-card">
      <div class="card-header">
        <i class="bi bi-image"></i>
        <span>{{ $t('view.stock.product.imageInternal') }}</span>
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
        <i class="bi bi-images"></i>
        <span>{{ $t('view.mobile.stockProduct.customerGalleryTitle') }}</span>
      </div>
      <div class="card-body">
        <div v-if="galleryImages.length" class="gallery-thumbs">
          <div v-for="(img, idx) in galleryImages" :key="idx" class="gallery-thumb-tile">
            <ImagePreview :imageName="img" :preview="false" :borderShow="false" :width="70" :height="70" />
          </div>
        </div>
        <div v-else class="no-gallery">
          <i class="bi bi-image"></i>
          <span>{{ $t('view.mobile.stockProduct.customerGalleryEmpty') }}</span>
        </div>
        <div v-if="galleryCaption" class="gallery-caption">{{ galleryCaption }}</div>
        <ButtonGeneric
          v-if="canManageGallery"
          variant="outline"
          icon="bi-images"
          :label="$t('view.mobile.stockProduct.manageGalleryBtn')"
          :block="true"
          class="mobile-mt-2"
          @click="goManageGallery"
        />
      </div>
    </div>

    <div class="info-card mobile-mt-2">
      <div class="card-header">
        <i class="bi bi-clipboard2-check-fill"></i>
        <span>{{ $t('view.stock.product.stockInfo') }}</span>
      </div>
      <div class="card-body">
        <div class="info-row">
          <span class="info-label">{{ primaryCodeLabel }}</span>
          <span class="info-value highlight">{{ primaryCode }}</span>
        </div>
        <div v-if="item.mold" class="info-row">
          <span class="info-label">{{ $t('view.stock.product.mold') }}</span>
          <span class="info-value highlight">{{ item.mold }}</span>
        </div>
        <div v-if="secondaryCode" class="info-row">
          <span class="info-label">{{ $t('view.stock.product.stockNumberNew') }}</span>
          <span class="info-value">{{ secondaryCode }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">{{ $t('view.stock.product.productNumber') }}</span>
          <span class="info-value">{{ item.productNumber || '-' }}</span>
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
import { useStockProductGalleryApiStore } from '@/stores/modules/api/stock/product-gallery-api.js'
import { useAuthStore } from '@/stores/modules/authen/authen-store.js'
import { formatDecimal } from '@/services/utils/decimal.js'
import { PermissionService } from '@/services/permission/permission.js'
import { PERMISSIONS } from '@/services/permission/config.js'

import ImagePreview from '@/components/prime-vue/ImagePreview.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

export default {
  name: 'DetailInfo',

  components: { ImagePreview, ButtonGeneric },

  setup() {
    const masterStore = useMasterApiStore()
    const galleryStore = useStockProductGalleryApiStore()
    const authStore = useAuthStore()
    return { masterStore, galleryStore, authStore }
  },

  props: {
    item: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      gallery: null
    }
  },

  computed: {
    galleryImages() {
      return this.gallery?.images || []
    },

    galleryCaption() {
      if (!this.gallery) return ''
      const parts = []
      const skuCount = this.gallery.skuImages?.length || 0
      const moldCount = this.gallery.moldImages?.length || 0
      if (skuCount) parts.push(this.$t('view.mobile.stockProduct.galleryCaptionSku', { n: skuCount }))
      if (moldCount) {
        parts.push(
          this.$t('view.mobile.stockProduct.galleryCaptionMold', { mold: this.gallery.mold, n: moldCount })
        )
      }
      return parts.join(' · ')
    },

    canManageGallery() {
      const user = this.authStore.user
      if (!user) return false
      const permissionService = new PermissionService(user, this.authStore.permissions)
      return permissionService.hasPermission(PERMISSIONS.STOCK_PRODUCT_GR_IMAGE_CREATE)
    },

    // เลขหลัก = เลขเก่า (stockNumberOrigin) เมื่อมี ไม่งั้น fallback เป็นเลขใหม่ (stockNumber)
    primaryCode() {
      return this.item.stockNumberOrigin || this.item.stockNumber || '-'
    },

    primaryCodeLabel() {
      return this.item.stockNumberOrigin
        ? this.$t('view.stock.product.stockNumberOld')
        : this.$t('view.stock.product.stockNumberNew')
    },

    // เลขรอง = เลขใหม่ โชว์เฉพาะตอนมีเลขเก่า (ไม่งั้นเลขใหม่ขึ้นเป็นเลขหลักไปแล้ว)
    secondaryCode() {
      return this.item.stockNumberOrigin ? this.item.stockNumber : ''
    },

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

  created() {
    this.loadGallery()
  },

  methods: {
    formatDecimal,

    async loadGallery() {
      const res = await this.galleryStore.fetchGet({ stockNumber: this.item.stockNumber, skipLoading: true })
      if (res) this.gallery = res
    },

    goManageGallery() {
      this.$router.push({
        name: 'mobile-stock-product-photos',
        params: { stockNumber: this.item.stockNumber },
        query: this.item.stockNumberOrigin ? { stockNumberOrigin: this.item.stockNumberOrigin } : {}
      })
    },

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

.gallery-thumbs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--sp-sm);
}

.gallery-thumb-tile {
  position: relative;
  aspect-ratio: 1 / 1;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: #f5f5f5;

  :deep(img),
  :deep(.p-image) {
    width: 100%;
    height: 100%;
  }

  :deep(img) {
    object-fit: cover;
  }
}

.no-gallery {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--sp-xs);
  padding: var(--sp-lg) 0;
  color: #999;
  text-align: center;

  i {
    font-size: 2rem;
  }

  span {
    font-size: 0.85rem;
  }
}

.gallery-caption {
  margin-top: var(--sp-sm);
  font-size: 0.8rem;
  color: #666;
}
</style>
