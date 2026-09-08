<template>
  <div class="pos-scan-bar">
    <div class="scan-bar-row">
      <InputTextGeneric
        v-model.trim="scanInput"
        icon="bi-upc-scan"
        :placeholder="$t('view.mobile.pos.scanPlaceholder')"
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

    <PosScanFullscreen :visible="showFullscreenScan" @close="showFullscreenScan = false" />
  </div>
</template>

<script>
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import { usePosCartStore } from '@/stores/modules/pos/pos-cart-store.js'
import { warning, error, success } from '@/services/alert/sweetAlerts.js'
import { getPieceQtyAvailable } from '@/services/utils/stock-piece-qty.js'

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
      showFullscreenScan: false
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

    // ลองรหัสเก่า (stockNumberOrigin) ก่อนเสมอ — user สแกนป้ายรหัสเก่าเป็นหลักที่หน้างาน
    // ไม่เจอค่อยลองรหัสใหม่ (stockNumber) อัตโนมัติ — ผู้ใช้ไม่ต้องเลือกเอง
    async findProduct(searchValue) {
      const byOriginCode = await this.productStore.fetchDataGet({
        formValue: { stockNumberOrigin: searchValue },
        skipError: true
      })
      if (byOriginCode) return byOriginCode

      return await this.productStore.fetchDataGet({
        formValue: { stockNumber: searchValue },
        skipError: true
      })
    },

    // ค้นเจอ → เพิ่มเข้าตะกร้าทันที ไม่ต้องมีขั้นยืนยัน (จุดที่ต้องเร็วที่สุด)
    async searchAndAddProduct(searchValue) {
      const response = await this.findProduct(searchValue)

      if (!response) {
        if (!navigator.onLine) {
          error(this.$t('view.mobile.pos.errorNetworkIssue'), this.$t('view.mobile.pos.errorNetworkTitle'))
        } else {
          error(this.$t('view.mobile.pos.errorProductNotFound'), this.$t('view.mobile.pos.errorCheckCode'))
        }
        return
      }

      // silver lot: gate ด้วย qtyAvailable ของ piece เอง (ไม่ใช้ status) — qtyAvailable <= 0 = ขายไม่ได้แล้ว
      const qtyAvailable = getPieceQtyAvailable(response)
      if (qtyAvailable <= 0) {
        warning(this.$t('view.mobile.pos.warnUnavailableItem'))
        this.scanInput = ''
        return
      }

      const costPrice = Number(response.productPrice) || 0
      const tagPriceMultiplier = Number(response.tagPriceMultiplier) || 1
      const tagPrice = costPrice * tagPriceMultiplier

      const result = this.posCartStore.addItem({
        stockNumber: response.stockNumber,
        stockNumberOrigin: response.stockNumberOrigin || '',
        productNumber: response.productNumber || '',
        mold: response.mold || '',
        description: response.productNameTh || response.productNameEn || '',
        costPrice: costPrice,
        price: tagPrice,
        appraisalPrice: tagPrice,
        tagPriceMultiplier: tagPriceMultiplier,
        discountPercent: 0,
        qty: 1,
        qtyAvailable: qtyAvailable,
        materials: response.materials || [],
        imagePath: response.imagePath || ''
      })

      if (!result.success) {
        if (result.reason === 'exceed-available') {
          warning(this.$t('view.mobile.pos.qtyExceedAvailable'))
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
</style>
