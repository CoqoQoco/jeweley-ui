<template>
  <div class="public-showcase-page">
    <showcase-header />

    <div v-if="loading" class="showcase-skeleton">
      <div class="skeleton-box skeleton-image"></div>
      <div class="skeleton-box skeleton-line skeleton-line--lg"></div>
      <div class="skeleton-box skeleton-line skeleton-line--md"></div>
      <div class="skeleton-box skeleton-line skeleton-line--sm"></div>
    </div>

    <div v-else-if="!product" class="showcase-not-found">
      <i class="bi bi-search"></i>
      <p class="not-found-title">{{ $t('view.public.showcase.notFoundTitle') }}</p>
      <p class="not-found-desc">{{ $t('view.public.showcase.notFoundDesc') }}</p>
      <showcase-contact class="not-found-contact" />
    </div>

    <product-showcase v-else :product="product" :showScanNext="isFromShowcase" />
  </div>
</template>

<script>
import '@fontsource/taviraj/500.css'
import '@fontsource/taviraj/600.css'
import '@fontsource/ibm-plex-sans-thai/400.css'
import '@fontsource/ibm-plex-sans-thai/500.css'
import '@fontsource/ibm-plex-sans-thai/600.css'
import '@fontsource/ibm-plex-mono/600.css'

import { usePublicProductApiStore } from '@/stores/modules/api/public/public-product-api.js'
import { applyLocale } from '@/plugins/i18n/config.js'
import { storage } from '@/services/storage.js'

import ShowcaseHeader from '@/components/public/showcase-header.vue'
import ShowcaseContact from '@/components/public/showcase-contact.vue'
import ProductShowcase from '@/components/public/product-showcase.vue'

export default {
  name: 'PublicProductShowcase',

  components: {
    ShowcaseHeader,
    ShowcaseContact,
    ProductShowcase
  },

  setup() {
    const publicProductStore = usePublicProductApiStore()
    return { publicProductStore }
  },

  data() {
    return {
      loading: true,
      product: null
    }
  },

  computed: {
    isFromShowcase() {
      return this.$route.query.from === 'showcase'
    },

    pageTitle() {
      if (!this.product) return ''
      return this.$i18n.locale === 'en'
        ? this.product.productNameEn || this.product.productNameTh
        : this.product.productNameTh || this.product.productNameEn
    }
  },

  watch: {
    '$i18n.locale'() {
      if (this.pageTitle) document.title = this.pageTitle
    }
  },

  async created() {
    // หน้าลูกค้าเปิดเป็น EN เสมอ — ตั้งก่อน render ครั้งแรก ไม่เขียนทับภาษาระบบหลังบ้าน (คืนค่าตอน beforeUnmount)
    applyLocale('en')

    const token = this.$route.params.token
    const data = await this.publicProductStore.fetchPublicProduct(token)

    this.product = data
    this.loading = false

    if (this.pageTitle) document.title = this.pageTitle
  },

  beforeUnmount() {
    // staff ออกจากหน้านี้ (เช่นกด "สแกนชิ้นถัดไป") — คืน locale ของระบบหลังบ้านให้ถูกต้อง
    applyLocale(storage.getItem('lang', 'th'))
  }
}
</script>

<style lang="scss" scoped>
.public-showcase-page {
  min-height: 100vh;
  background: var(--showcase-bg);
  font-family: 'IBM Plex Sans Thai', sans-serif;
}

.showcase-skeleton {
  max-width: 560px;
  margin: 0 auto;
  padding: 0 var(--sp-xl);
  display: flex;
  flex-direction: column;
  gap: var(--sp-lg);
}

.skeleton-box {
  background: var(--showcase-tile);
  border-radius: var(--radius-lg);
  animation: showcase-skeleton-pulse 1.4s ease-in-out infinite;
}

.skeleton-image {
  width: 100%;
  aspect-ratio: 1 / 1;
}

.skeleton-line {
  height: var(--sp-lg);

  &--lg {
    width: 70%;
  }

  &--md {
    width: 50%;
  }

  &--sm {
    width: 35%;
  }
}

@keyframes showcase-skeleton-pulse {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

.showcase-not-found {
  max-width: 420px;
  margin: 0 auto;
  padding: calc(var(--sp-xl) * 2) var(--sp-xl);
  text-align: center;

  i {
    font-size: 3rem;
    color: var(--showcase-box-border);
    margin-bottom: var(--sp-lg);
  }
}

.not-found-title {
  font-size: var(--fs-xl);
  font-weight: 700;
  color: var(--showcase-ink);
  margin-bottom: var(--sp-sm);
}

.not-found-desc {
  font-size: var(--fs-base);
  color: var(--showcase-muted);
  margin-bottom: calc(var(--sp-xl) * 1.5);
}

.not-found-contact {
  text-align: left;
}
</style>
