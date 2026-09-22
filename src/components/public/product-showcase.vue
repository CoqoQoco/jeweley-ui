<template>
  <div class="product-showcase">
    <div class="showcase-columns">
      <div class="showcase-media">
        <showcase-gallery :images="images" :alt="displayName" />
      </div>

      <div class="showcase-info">
        <div class="showcase-title-block">
          <div v-if="overlineText" class="showcase-overline">{{ overlineText }}</div>
          <div class="showcase-name-main">{{ mainName }}</div>
          <div v-if="subName" class="showcase-name-sub">{{ subName }}</div>
        </div>

        <div class="price-block">
          <div class="price-box">
            <div v-if="priceDisplay" class="price-box-price">{{ priceDisplay }}</div>
            <div v-if="priceDisplay" class="price-box-divider"></div>
            <div class="price-box-code">
              <span>{{ $t('view.public.showcase.codeMainLabel') }}</span>
              <span class="price-box-code-value">{{ mainCode }}</span>
            </div>
          </div>

          <div
            v-if="product.isAvailable !== null && product.isAvailable !== undefined"
            class="availability-pill"
            :class="product.isAvailable ? 'is-available' : 'is-unavailable'"
          >
            {{ product.isAvailable ? $t('view.public.showcase.availableYes') : $t('view.public.showcase.availableNo') }}
            <span v-if="product.isAvailable && product.availableQty > 1">
              · {{ $t('view.public.showcase.availableCount', { qty: product.availableQty }) }}
            </span>
          </div>
        </div>

        <showcase-spec
          :metalKarat="product.metalKarat"
          :metalColorCode="product.metalColorCode"
          :metalWeight="product.metalWeight"
          :metalWeightUnit="product.metalWeightUnit"
          :size="product.size"
          :earringStemSize="product.earringStemSize"
          :gems="product.gems"
        />

        <div class="showcase-trust">
          <div class="trust-tile">
            <i class="bi bi-flag"></i>
            <span>{{ $t('view.public.showcase.trustMadeInThailand') }}</span>
          </div>
          <div class="trust-tile">
            <i class="bi bi-award"></i>
            <span>{{ $t('view.public.showcase.trustHandcrafted') }}</span>
          </div>
        </div>

        <showcase-contact :productName="displayName" />
      </div>
    </div>

    <div class="showcase-footer">
      <img :src="footerIcon" alt="" class="showcase-footer-icon" />
      <span>{{ $t('view.public.showcase.footerText') }}</span>
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
import PUBLIC_PRODUCT_TYPE_I18N_KEY from '@/config/public-product-type-config.js'

import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import ShowcaseGallery from './showcase-gallery.vue'
import ShowcaseSpec from './showcase-spec.vue'
import ShowcaseContact from './showcase-contact.vue'

import footerIcon from '@/assets/duangkaew-icon.png'

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

  data() {
    return {
      footerIcon
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

    // API ส่ง productTypeName เป็นภาษาไทยอย่างเดียว — แปลผ่าน config เมื่อรู้จัก,
    // ถ้าไม่รู้จักให้แสดง raw text เฉพาะตอน locale=th (กันข้อความไทยโผล่หน้า EN)
    overlineText() {
      const raw = (this.product.productTypeName || '').trim()
      if (!raw) return ''

      const key = PUBLIC_PRODUCT_TYPE_I18N_KEY[raw]
      if (key) return this.$t(`view.public.showcase.productType.${key}`)

      return this.$i18n.locale === 'th' ? raw : ''
    },

    // API ปัจจุบันส่งแค่ imagePath เดียว — รองรับ images[] ล่วงหน้าสำหรับตอนอัปโหลดหลายรูป
    images() {
      const list =
        Array.isArray(this.product.images) && this.product.images.length
          ? this.product.images
          : this.product.imagePath
            ? [this.product.imagePath]
            : []
      return list.slice(0, 4)
    },

    mainCode() {
      return this.product.stockNumberOrigin || this.product.stockNumber
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
  padding-bottom: calc(var(--sp-xl) * 2);
}

.showcase-columns {
  padding: var(--sp-xl) var(--sp-lg) 0;
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

.showcase-title-block {
  text-align: center;
}

.showcase-overline {
  font-size: var(--fs-sm);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--showcase-accent);
  margin-bottom: var(--sp-xs);
}

.showcase-name-main {
  font-family: 'Taviraj', serif;
  font-weight: 500;
  font-size: var(--showcase-fs-name);
  color: var(--showcase-ink);
  line-height: var(--lh-md);
}

.showcase-name-sub {
  margin-top: var(--sp-xs);
  font-size: var(--fs-base);
  color: var(--showcase-muted);
}

.price-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-sm);
}

.price-box {
  min-width: var(--showcase-price-box-w);
  padding: var(--sp-lg) var(--sp-2xl) var(--showcase-price-pad-bottom);
  border: 1px solid var(--showcase-box-border);
  border-radius: var(--showcase-radius-sm);
  background: var(--color-card-bg);
  text-align: center;
}

.price-box-price {
  font-family: 'Taviraj', serif;
  font-weight: 600;
  font-size: var(--showcase-fs-price);
  color: var(--base-font-color);
}

.price-box-divider {
  width: var(--showcase-divider-w);
  height: 1px;
  background: var(--showcase-line);
  margin: var(--sp-sm) auto;
}

.price-box-code {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: var(--sp-xs);
  font-size: var(--showcase-fs-label);
  color: var(--showcase-muted);
}

.price-box-code-value {
  font-family: 'IBM Plex Mono', monospace;
  font-weight: 600;
  color: var(--showcase-ink);
}

.availability-pill {
  padding: var(--sp-xs) var(--sp-lg);
  border-radius: var(--radius-lg);
  font-size: var(--fs-sm);
  font-weight: 700;

  &.is-available {
    background: var(--color-green-bg);
    color: var(--base-green);
  }

  &.is-unavailable {
    background: var(--color-highlight-bg);
    color: var(--base-red);
  }
}

.showcase-trust {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-sm);
}

.trust-tile {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  padding: var(--sp-md);
  border-radius: var(--showcase-radius-sm);
  background: var(--showcase-tile);
  font-size: var(--showcase-fs-label);
  color: var(--showcase-text-soft);

  i {
    color: var(--base-font-color);
    font-size: var(--fs-lg);
    flex-shrink: 0;
  }
}

.showcase-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-sm);
  margin-top: calc(var(--sp-xl) * 2);
  padding: var(--sp-lg) var(--sp-xl) 0;
  border-top: 1px solid var(--showcase-line);
  text-align: center;
  font-size: var(--fs-sm);
  color: var(--showcase-muted);
}

.showcase-footer-icon {
  width: var(--showcase-footer-icon);
  height: var(--showcase-footer-icon);
  object-fit: contain;
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
  .showcase-columns {
    display: grid;
    grid-template-columns: var(--showcase-media-w) minmax(0, 1fr);
    gap: var(--showcase-gap-lg);
    max-width: none;
    width: min(var(--showcase-container-w), calc(100% - 2 * var(--sp-2xl)));
    margin: 0 auto;
    padding: var(--showcase-content-pad-top-lg) 0 0;
  }

  .showcase-media {
    margin-bottom: 0;
    position: sticky;
    top: var(--sp-xl);
  }

  .showcase-title-block {
    text-align: left;
  }

  .price-block {
    align-items: flex-start;
  }

  .price-box {
    min-width: var(--showcase-price-box-w-lg);
    text-align: left;
  }

  .price-box-divider {
    margin: var(--sp-sm) 0;
  }

  .price-box-code {
    justify-content: flex-start;
    font-size: var(--fs-base);
  }

  .showcase-name-main {
    font-size: var(--showcase-fs-name-lg);
  }

  .price-box-price {
    font-size: var(--showcase-fs-price-lg);
  }

  .showcase-footer {
    flex-direction: row;
    justify-content: center;
  }
}
</style>
