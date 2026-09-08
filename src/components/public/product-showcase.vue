<template>
  <div class="product-showcase">
    <div class="showcase-media">
      <showcase-gallery :imagePath="product.imagePath" :alt="displayName" />
    </div>

    <div class="showcase-info">
      <div class="showcase-name">
        <div class="showcase-name-main">{{ mainName }}</div>
        <div v-if="subName" class="showcase-name-sub">{{ subName }}</div>
      </div>

      <div class="showcase-codes">
        <div class="code-main">
          <span class="code-main-label">{{ $t('view.public.showcase.codeMainLabel') }}</span>
          <span class="code-main-value">{{ mainCode }}</span>
        </div>
        <div v-if="showSecondaryCode" class="code-secondary">
          <span class="code-secondary-label">{{ $t('view.public.showcase.codeNewLabel') }}</span>
          <span class="code-secondary-value">{{ product.stockNumber }}</span>
        </div>
        <div v-if="product.productNumber" class="code-tertiary">{{ product.productNumber }}</div>
      </div>

      <div v-if="priceDisplay" class="showcase-price">{{ priceDisplay }}</div>

      <div class="showcase-divider"></div>

      <showcase-spec
        :metalKarat="product.metalKarat"
        :metalColorCode="product.metalColorCode"
        :metalWeight="product.metalWeight"
        :metalWeightUnit="product.metalWeightUnit"
        :size="product.size"
        :earringStemSize="product.earringStemSize"
        :gems="product.gems"
        :isAvailable="product.isAvailable"
      />

      <div class="showcase-divider"></div>

      <div class="showcase-trust">
        <div class="trust-row">
          <i class="bi bi-flag"></i>
          <span>{{ $t('view.public.showcase.trustMadeInThailand') }}</span>
        </div>
        <div class="trust-row">
          <i class="bi bi-award"></i>
          <span>{{ $t('view.public.showcase.trustHandcrafted') }}</span>
        </div>
      </div>

      <showcase-contact :productName="displayName" />

      <div class="showcase-footer">{{ $t('view.public.showcase.footerText') }}</div>
    </div>

    <div v-if="showScanNext" class="showcase-scan-next-bar">
      <ButtonGeneric
        variant="main"
        icon="bi-upc-scan"
        :label="$t('view.public.showcase.scanNextBtn')"
        block
        @click="goScanNext"
      />
    </div>
  </div>
</template>

<script>
import { useDeviceStore } from '@/stores/modules/device/device-store.js'

import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import ShowcaseGallery from './showcase-gallery.vue'
import ShowcaseSpec from './showcase-spec.vue'
import ShowcaseContact from './showcase-contact.vue'

export default {
  name: 'ProductShowcase',

  components: {
    ButtonGeneric,
    ShowcaseGallery,
    ShowcaseSpec,
    ShowcaseContact
  },

  setup() {
    const deviceStore = useDeviceStore()
    return { deviceStore }
  },

  props: {
    product: {
      type: Object,
      required: true
    },
    showScanNext: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    displayName() {
      return this.product.productNameTh || this.product.productNameEn || this.mainCode
    },

    // ชื่อไทยตัวใหญ่ / อังกฤษตัวเล็ก สลับกันตามภาษาที่เลือก
    mainName() {
      return this.$i18n.locale === 'en'
        ? this.product.productNameEn || this.product.productNameTh
        : this.product.productNameTh || this.product.productNameEn
    },

    subName() {
      const sub =
        this.$i18n.locale === 'en' ? this.product.productNameTh : this.product.productNameEn
      return sub && sub !== this.mainName ? sub : ''
    },

    mainCode() {
      return this.product.stockNumberOrigin || this.product.stockNumber
    },

    showSecondaryCode() {
      return !!this.product.stockNumberOrigin
    },

    priceDisplay() {
      const price = this.product.displayPrice
      if (price === null || price === undefined) return ''

      const isWhole = Number.isInteger(price)
      const amount = new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: isWhole ? 0 : 2,
        maximumFractionDigits: isWhole ? 0 : 2
      }).format(price)

      return this.product.currency === 'THB' ? `฿${amount}` : `${amount} ${this.product.currency || ''}`.trim()
    }
  },

  methods: {
    // resolve route ที่มีจริงตาม hasRoute ก่อนเสมอ — กันพังถ้า route ใดยังไม่ถูก register
    goScanNext() {
      const preferredName = this.deviceStore.shouldUseMobileView ? 'mobile-showcase-scan' : 'showcase-scan'
      const fallbackName = this.deviceStore.shouldUseMobileView ? 'showcase-scan' : 'mobile-showcase-scan'

      let targetName = null
      if (this.$router.hasRoute(preferredName)) targetName = preferredName
      else if (this.$router.hasRoute(fallbackName)) targetName = fallbackName

      if (targetName) this.$router.push({ name: targetName })
    }
  }
}
</script>

<style lang="scss" scoped>
.product-showcase {
  padding: 0 var(--sp-xl) calc(var(--sp-xl) * 2);
  max-width: 560px;
  margin: 0 auto;
}

.showcase-media {
  margin-bottom: var(--sp-xl);
}

.showcase-info {
  display: flex;
  flex-direction: column;
  gap: var(--sp-xl);
}

.showcase-name {
  text-align: center;
}

.showcase-name-main {
  font-size: calc(var(--fs-xl) * 1.3);
  font-weight: 700;
  color: var(--base-sub-color);
  line-height: var(--lh-md);
}

.showcase-name-sub {
  margin-top: var(--sp-xs);
  font-size: var(--fs-base);
  color: var(--base-sub-color);
}

.showcase-codes {
  text-align: center;
}

.code-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-xs);
}

.code-main-label {
  font-size: var(--fs-sm);
  color: var(--color-border);
  letter-spacing: 0.04em;
}

.code-main-value {
  font-family: 'Courier New', Courier, monospace;
  font-size: var(--fs-xl);
  font-weight: 700;
  color: var(--base-font-color);
  letter-spacing: 0.04em;
}

.code-secondary {
  margin-top: var(--sp-xs);
  display: flex;
  justify-content: center;
  gap: var(--sp-xs);
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}

.code-secondary-value {
  font-family: 'Courier New', Courier, monospace;
}

.code-tertiary {
  margin-top: var(--sp-xs);
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}

.showcase-price {
  text-align: center;
  font-size: calc(var(--fs-xl) * 1.6);
  font-weight: 700;
  color: var(--base-font-color);
}

.showcase-divider {
  height: 1px;
  background: var(--color-border);
}

.showcase-trust {
  display: flex;
  flex-direction: column;
  gap: var(--sp-sm);
}

.trust-row {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  font-size: var(--fs-sm);
  color: var(--base-sub-color);

  i {
    color: var(--base-green);
  }
}

.showcase-footer {
  text-align: center;
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
  padding-top: var(--sp-lg);
}

.showcase-scan-next-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  padding: var(--sp-md) var(--sp-xl);
  padding-bottom: calc(var(--sp-md) + env(safe-area-inset-bottom, 0px));
  background: var(--color-card-bg);
  box-shadow: var(--shadow-lg);
}

@media (min-width: 900px) {
  .product-showcase {
    display: flex;
    align-items: flex-start;
    gap: var(--sp-2xl);
    max-width: 1100px;
    padding: 0 var(--sp-2xl) calc(var(--sp-xl) * 2);
  }

  .showcase-media {
    flex: 0 0 560px;
    max-width: 560px;
    margin-bottom: 0;
    position: sticky;
    top: var(--sp-xl);
  }

  .showcase-info {
    flex: 1;
    min-width: 0;
  }
}
</style>
