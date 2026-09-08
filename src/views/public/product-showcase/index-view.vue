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
import { usePublicProductApiStore } from '@/stores/modules/api/public/public-product-api.js'

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
    const token = this.$route.params.token
    const data = await this.publicProductStore.fetchPublicProduct(token)

    this.product = data
    this.loading = false

    if (this.pageTitle) document.title = this.pageTitle
  }
}
</script>

<style lang="scss" scoped>
.public-showcase-page {
  min-height: 100vh;
  background: var(--color-card-bg);
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
  background: var(--color-highlight-bg);
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
    color: var(--color-border);
    margin-bottom: var(--sp-lg);
  }
}

.not-found-title {
  font-size: var(--fs-xl);
  font-weight: 700;
  color: var(--base-sub-color);
  margin-bottom: var(--sp-sm);
}

.not-found-desc {
  font-size: var(--fs-base);
  color: var(--base-sub-color);
  margin-bottom: calc(var(--sp-xl) * 1.5);
}

.not-found-contact {
  text-align: left;
}
</style>
