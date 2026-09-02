<template>
  <div class="pos-scan-bar">
    <div class="scan-bar-row">
      <InputTextGeneric
        v-model.trim="scanInput"
        icon="bi-upc-scan"
        :placeholder="scanPlaceholder"
        @keyup.enter="handleManualSearch"
      />
      <ButtonGeneric
        variant="green"
        icon="bi-search"
        :title="$t('common.btn.search')"
        @click="handleManualSearch"
      />
      <ButtonGeneric
        variant="outline"
        icon="bi-camera"
        :title="$t('view.mobile.pos.scanCameraBtn')"
        @click="showFullscreenScan = true"
      />
    </div>

    <div class="scan-field-toggle">
      <button
        type="button"
        class="field-btn"
        :class="{ active: searchField === 'stockNumber' }"
        @click="searchField = 'stockNumber'"
      >
        {{ $t('view.mobile.pos.fieldNewCode') }}
      </button>
      <button
        type="button"
        class="field-btn"
        :class="{ active: searchField === 'stockNumberOrigin' }"
        @click="searchField = 'stockNumberOrigin'"
      >
        {{ $t('view.mobile.pos.fieldOldCode') }}
      </button>
    </div>

    <PosScanFullscreen
      :visible="showFullscreenScan"
      :searchField="searchField"
      @close="showFullscreenScan = false"
    />
  </div>
</template>

<script>
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import { usePosCartStore } from '@/stores/modules/pos/pos-cart-store.js'
import { warning, error, success } from '@/services/alert/sweetAlerts.js'

import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import PosScanFullscreen from './pos-scan-fullscreen.vue'

export default {
  name: 'PosScanBar',

  components: {
    InputTextGeneric,
    ButtonGeneric,
    PosScanFullscreen
  },

  setup() {
    const productStore = usrStockProductApiStore()
    const posCartStore = usePosCartStore()
    return { productStore, posCartStore }
  },

  data() {
    return {
      scanInput: '',
      searchField: 'stockNumber',
      showFullscreenScan: false
    }
  },

  computed: {
    scanPlaceholder() {
      return this.searchField === 'stockNumber'
        ? this.$t('view.mobile.pos.scanPlaceholderNew')
        : this.$t('view.mobile.pos.scanPlaceholderOld')
    }
  },

  methods: {
    async handleManualSearch() {
      if (!this.scanInput) {
        warning(this.$t('view.mobile.pos.warnEnterCode'))
        return
      }
      await this.searchAndAddProduct(this.scanInput)
    },

    // ค้นเจอ → เพิ่มเข้าตะกร้าทันที ไม่ต้องมีขั้นยืนยัน (จุดที่ต้องเร็วที่สุด)
    async searchAndAddProduct(searchValue) {
      const response = await this.productStore.fetchDataGet({
        formValue: { [this.searchField]: searchValue }
      })

      if (!response) {
        error(this.$t('view.mobile.pos.errorProductNotFound'), this.$t('view.mobile.pos.errorCheckCode'))
        return
      }

      const costPrice = Number(response.productPrice) || 0
      const tagPriceMultiplier = Number(response.tagPriceMultiplier) || 1
      const tagPrice = costPrice * tagPriceMultiplier

      const result = this.posCartStore.addItem({
        stockNumber: response.stockNumber,
        productNumber: response.productNumber || '',
        description: response.productNameTh || response.productNameEn || '',
        costPrice: costPrice,
        price: tagPrice,
        appraisalPrice: tagPrice,
        tagPriceMultiplier: tagPriceMultiplier,
        discountPercent: 0,
        qty: 1,
        materials: response.materials || [],
        imagePath: response.imagePath || ''
      })

      if (!result.success) {
        if (result.reason === 'duplicate') {
          warning(this.$t('view.mobile.pos.warnDuplicateItem'))
        }
        this.scanInput = ''
        return
      }

      this.scanInput = ''
      success(this.$t('view.mobile.pos.successAddProduct'), response.stockNumber)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/mobile';

.pos-scan-bar {
  display: flex;
  flex-direction: column;
  gap: var(--sp-sm);
  margin-bottom: var(--sp-md);
}

.scan-bar-row {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);

  > :first-child {
    flex: 1;
  }
}

.scan-field-toggle {
  display: flex;
  gap: var(--sp-sm);
}

.field-btn {
  flex: 1;
  padding: 8px 12px;
  min-height: 44px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--color-border);
  background: var(--color-card-bg);
  color: #666;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.98);
  }

  &.active {
    border-color: var(--base-font-color);
    background: rgba(146, 19, 19, 0.05);
    color: var(--base-font-color);
    font-weight: 600;
  }
}
</style>
