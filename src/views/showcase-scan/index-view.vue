<template>
  <div :class="rootClass">
    <PageHeaderGeneric
      v-if="!isMobileRoute"
      :title="$t('view.public.scan.pageTitle')"
      backRoute="stock-product-list"
    />

    <div class="scan-panel">
      <p class="scan-desc">{{ $t('view.public.scan.pageDesc') }}</p>

      <div class="scan-input-row">
        <InputTextGeneric
          v-model.trim="scanInput"
          icon="bi-upc-scan"
          :placeholder="$t('view.public.scan.inputPlaceholder')"
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
          :title="$t('view.public.scan.cameraBtn')"
          @click="showCamera = true"
        />
      </div>
    </div>

    <showcase-camera-scan :visible="showCamera" @detect="onCameraDetect" @close="showCamera = false" />
  </div>
</template>

<script>
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import { warning } from '@/services/alert/sweetAlerts.js'

import PageHeaderGeneric from '@/components/generic/PageHeaderGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import ShowcaseCameraScan from './components/showcase-camera-scan.vue'

export default {
  name: 'ShowcaseScan',

  components: {
    PageHeaderGeneric,
    InputTextGeneric,
    ButtonGeneric,
    ShowcaseCameraScan
  },

  setup() {
    const productStore = usrStockProductApiStore()
    return { productStore }
  },

  data() {
    return {
      scanInput: '',
      showCamera: false
    }
  },

  computed: {
    // route เดียวกันถูกใช้ทั้ง web (/showcase-scan) และ mobile (/mobile/showcase-scan) —
    // ฝั่ง mobile มี MobileTopBar แสดงชื่อหน้าจาก route meta อยู่แล้ว ไม่ต้องซ้อน PageHeaderGeneric อีกชั้น
    isMobileRoute() {
      return this.$route.name === 'mobile-showcase-scan'
    },

    rootClass() {
      return this.isMobileRoute ? 'mobile-container mobile-mt-2' : 'app-container'
    }
  },

  methods: {
    async handleManualSearch() {
      if (!this.scanInput) {
        warning(this.$t('view.public.scan.warnEnterCode'))
        return
      }
      const code = this.scanInput
      this.scanInput = ''
      await this.searchAndGo(code)
    },

    onCameraDetect(code) {
      this.showCamera = false
      this.searchAndGo(code)
    },

    // ลองรหัสเก่า (stockNumberOrigin) ก่อนเสมอ — เหมือน findProduct() ใน pos-scan-fullscreen.vue
    // เพราะ user สแกนป้ายรหัสเก่าเป็นหลักที่หน้างาน ไม่เจอค่อยลองรหัสใหม่ (stockNumber) อัตโนมัติ
    async findProduct(code) {
      const byOriginCode = await this.productStore.fetchDataGet({
        formValue: { stockNumberOrigin: code },
        skipError: true
      })
      if (byOriginCode) return byOriginCode

      return await this.productStore.fetchDataGet({
        formValue: { stockNumber: code },
        skipError: true
      })
    },

    async searchAndGo(code) {
      const product = await this.findProduct(code)
      if (!product) {
        warning(this.$t('view.public.scan.warnNotFound'))
        return
      }

      const link = await this.productStore.fetchPublicLink(product.stockNumber)
      if (!link?.path) return

      this.$router.push({ path: link.path, query: { from: 'showcase' } })
    }
  }
}
</script>

<style lang="scss" scoped>
.scan-panel {
  padding: var(--sp-xl);
}

.scan-desc {
  font-size: var(--fs-base);
  color: var(--color-border);
  margin-bottom: var(--sp-lg);
}

.scan-input-row {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);

  > :first-child {
    flex: 1;
  }
}
</style>
