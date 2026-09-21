<template>
  <div class="mobile-scan-view">
    <div class="mobile-container">
      <div class="scan-bar-row">
        <InputTextGeneric
          :modelValue="scanInput"
          icon="bi-upc-scan"
          :placeholder="$t('view.mobile.scan.scanPlaceholder')"
          @update:modelValue="onManualInput"
          @keyup.enter="handleManualSearch"
        />
        <ButtonGeneric
          variant="green"
          icon="bi-search"
          :title="$t('common.btn.search')"
          :loading="isSearching"
          :disabled="isSearching"
          @click="handleManualSearch"
        />
        <ButtonGeneric
          variant="outline"
          icon="bi-camera"
          :title="$t('view.mobile.scan.cameraBtn')"
          @click="showCamera = true"
        />
      </div>

      <div v-if="!scannedProduct" class="mobile-empty-state mobile-mt-3">
        <i class="bi bi-upc-scan"></i>
        <div class="empty-title">{{ $t('view.mobile.scan.emptyTitle') }}</div>
        <div class="empty-subtitle">{{ $t('view.mobile.scan.emptySubtitle') }}</div>
      </div>

      <div v-else class="product-section mobile-mt-3">
        <ProductDetailCard :product="scannedProduct" :priceTransactions="scannedProduct.priceTransactions" :imageType="imageType" />

        <!-- Action Zone (Placeholder for future features) -->
        <div class="action-zone mobile-mt-3">
          <div class="action-zone-header">
            <i class="bi bi-lightning-charge"></i>
            <span>{{ $t('view.mobile.scan.actionZoneTitle') }}</span>
          </div>

          <div class="action-buttons">
            <ButtonGeneric
              v-if="scannedProduct.priceTransactions && scannedProduct.priceTransactions.length > 0"
              variant="main"
              icon="bi-file-earmark-plus"
              :label="$t('view.mobile.scan.createCostPlanBtn')"
              @click="handleCreateCostPlan"
            />

            <ButtonGeneric
              variant="outline"
              icon="bi-box-seam"
              :label="$t('view.mobile.scan.updateStockBtn')"
              :block="true"
              :disabled="true"
            />
            <ButtonGeneric
              variant="outline"
              icon="bi-printer"
              :label="$t('view.mobile.scan.printLabelBtn')"
              :block="true"
              :disabled="true"
            />
            <ButtonGeneric
              variant="outline"
              icon="bi-geo-alt"
              :label="$t('view.mobile.scan.changeLocationBtn')"
              :block="true"
              :disabled="true"
            />
          </div>

          <p class="action-note">
            <i class="bi bi-info-circle"></i>
            {{ $t('view.mobile.scan.futureFeaturesNote') }}
          </p>
        </div>
      </div>
    </div>

    <CameraScanGeneric :visible="showCamera" @detect="onCameraDetect" @close="showCamera = false" />
  </div>
</template>

<script>
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import { warning, error, success } from '@/services/alert/sweetAlerts.js'
import { fetchStockProduct } from '@/services/utils/stock-scan.js'

import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import CameraScanGeneric from '@/components/generic/CameraScanGeneric.vue'
import ProductDetailCard from './components/product-detail-card.vue'

export default {
  name: 'MobileScanView',

  components: {
    InputTextGeneric,
    ButtonGeneric,
    CameraScanGeneric,
    ProductDetailCard
  },

  setup() {
    const productStore = usrStockProductApiStore()
    return { productStore }
  },

  data() {
    return {
      scanInput: '',
      scannedProduct: null,
      imageType: 'STOCK-PRODUCT',
      showCamera: false,
      isSearching: false
    }
  },

  methods: {
    // uppercase อย่างเดียว ไม่เติมขีดแล้ว เพราะเลขใหม่ไม่มีขีด และ backend หาเจอทั้งแบบมี/ไม่มีขีด
    onManualInput(value) {
      this.scanInput = value.toUpperCase()
    },

    async handleManualSearch() {
      if (!this.scanInput || !this.scanInput.trim()) {
        warning(this.$t('view.mobile.scan.warnEnterCode'))
        return
      }

      await this.searchProduct(this.scanInput.trim())
    },

    onCameraDetect(code) {
      this.showCamera = false
      this.searchProduct(String(code).toUpperCase().trim())
    },

    // ลองรหัสเก่า (stockNumberOrigin) ก่อนเสมอ — user สแกนป้ายรหัสเก่าเป็นหลักที่หน้างาน
    // ไม่เจอค่อยลองรหัสใหม่ (stockNumber) อัตโนมัติ — ผู้ใช้ไม่ต้องเลือกเอง
    async findProduct(code) {
      const byOriginCode = await fetchStockProduct(this.productStore, { stockNumberOrigin: code })
      if (byOriginCode.status !== 'not-found') return byOriginCode

      return await fetchStockProduct(this.productStore, { stockNumber: code })
    },

    async searchProduct(code) {
      if (this.isSearching) return
      this.isSearching = true

      const { data, status, httpStatus } = await this.findProduct(code)

      if (status === 'ok') {
        this.scannedProduct = data
        this.scanInput = ''
      } else if (status === 'not-found') {
        error(this.$t('view.mobile.scan.errorProductNotFound'), this.$t('view.mobile.scan.errorCheckCode'))
      } else {
        error(this.$t('view.mobile.scan.errorLookupFailed', { status: httpStatus || 'Network' }))
      }

      this.isSearching = false
    },

    async handleCreateCostPlan() {
      const response = await this.productStore.fetchCreateProductCostDeatialPlan({
        stockNumber: this.scannedProduct.stockNumber,
        remark: ''
      })

      if (response) {
        const planNumber = response.planNumber || response
        success(this.$t('view.mobile.scan.successCreateCostPlan', { planNumber }), this.$t('view.mobile.scan.successCreateCostPlanTitle'))
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/mobile';

.mobile-scan-view {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: calc(70px + env(safe-area-inset-bottom, 0px));
}

.scan-bar-row {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);

  > :first-child {
    flex: 1;
  }
}

// Action Zone
.action-zone {
  background: var(--color-card-bg);
  border-radius: var(--radius-lg);
  padding: var(--sp-lg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  .action-zone-header {
    display: flex;
    align-items: center;
    gap: var(--sp-sm);
    font-size: 1rem;
    font-weight: 600;
    color: var(--base-font-color);
    margin-bottom: var(--sp-lg);

    i {
      font-size: 1.2rem;
    }
  }

  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: var(--sp-sm);
    margin-bottom: var(--sp-md);
  }

  .action-note {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.8rem;
    color: #999;
    margin: 0;
    padding-top: var(--sp-md);
    border-top: 1px solid #f0f0f0;

    i {
      font-size: 0.9rem;
    }
  }
}
</style>
