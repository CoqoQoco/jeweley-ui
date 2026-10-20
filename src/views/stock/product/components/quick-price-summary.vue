<template>
  <SectionCardGeneric
    :title="$t('view.stock.product.quickPrice.priceBoxTitle')"
    headerStyle="legend"
    icon="bi-tag"
    accent="main"
  >
    <div class="price-list">
      <div class="price-field">
        <span class="price-label">
          {{ isLot ? $t('view.stock.product.quickPrice.normalPricePerPiece') : $t('view.stock.product.quickPrice.normalPrice') }}
        </span>
        <span class="price-value price-value--lg">{{ formatMoney2(summary.salePrice) }}</span>
      </div>

      <div class="price-field">
        <span class="price-label">{{ $t('view.stock.product.tagPriceMultiplierLabel') }}</span>
        <span class="price-value">× {{ formatMoney2(summary.tagPriceMultiplier ?? 1) }}</span>
      </div>

      <div v-if="hasAppraisalFlag" class="price-field">
        <span class="price-label">{{ $t('view.stock.product.quickPrice.normalAppraisal') }}</span>
        <span class="price-value">
          <span class="tag-chip" :class="summary.hasNormalAppraisal ? 'tag-chip--ok' : 'tag-chip--none'">
            {{ summary.hasNormalAppraisal ? $t('view.stock.product.quickPrice.appraisedYes') : $t('view.stock.product.quickPrice.appraisedNo') }}
          </span>
        </span>
      </div>
    </div>

    <div class="quick-result">
      <span class="price-label">{{ $t('view.stock.product.quickPrice.newPrice') }}</span>
      <template v-if="hasQuickPrice">
        <div class="quick-result-main">
          <span class="price-value price-value--xl">{{ formatMoney2(summary.quickPrice) }}</span>
          <span v-if="isStale" class="tag-chip tag-chip--stale">
            {{ $t('view.stock.product.quickPrice.staleDays', { days: ageDays }) }}
          </span>
        </div>
        <span class="price-meta">{{ metaLine }}</span>
        <span class="price-meta">{{ detailLine }}</span>
        <span v-if="summary.quickPriceRemark" class="price-meta">
          {{ $t('common.field.remark') }}: {{ summary.quickPriceRemark }}
        </span>
      </template>
      <span v-else class="price-meta">{{ $t('view.stock.product.quickPrice.noQuickPrice') }}</span>
    </div>
  </SectionCardGeneric>
</template>

<script>
import { formatDate } from '@/services/utils/dayjs.js'
import {
  formatMoney2,
  formatPlainNumber,
  getQuickPriceAgeDays,
  isQuickPriceStale
} from '@/services/helper/quick-price.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'

export default {
  name: 'QuickPriceSummary',

  components: { SectionCardGeneric },

  props: {
    summary: {
      type: Object,
      default: () => ({})
    },
    isLot: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    hasAppraisalFlag() {
      return this.summary.hasNormalAppraisal !== undefined && this.summary.hasNormalAppraisal !== null
    },

    hasQuickPrice() {
      return this.summary.quickPrice !== null && this.summary.quickPrice !== undefined
    },

    ageDays() {
      return getQuickPriceAgeDays(this.summary.quickPriceDate)
    },

    isStale() {
      return isQuickPriceStale(this.summary.quickPriceDate)
    },

    metaLine() {
      const date = this.summary.quickPriceDate ? formatDate(this.summary.quickPriceDate) : ''
      return [date, this.summary.quickPriceBy].filter(Boolean).join(' · ')
    },

    detailLine() {
      const s = this.summary
      const roundingKey = [0, 10, 100, 1000].includes(Number(s.quickPriceRounding)) ? Number(s.quickPriceRounding) : 0
      return [
        this.$t('view.stock.product.quickPrice.goldPerGram', { price: formatPlainNumber(s.quickPriceGoldPrice) }),
        `${this.$t('view.stock.product.quickPrice.markup')} ${formatPlainNumber(s.quickPriceMarkup)}`,
        `+${formatPlainNumber(s.quickPricePercent ?? 0)}%`,
        this.$t(`view.stock.product.quickPrice.roundingSummary.r${roundingKey}`)
      ].join(' · ')
    }
  },

  methods: {
    formatMoney2
  }
}
</script>

<style lang="scss" scoped>
.price-list {
  display: flex;
  flex-direction: column;
  gap: var(--sp-md);
}

.price-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-md);
}

.price-label {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}

.price-value {
  font-size: var(--fs-base);
  font-weight: 600;

  &--lg {
    font-size: var(--fs-lg);
    font-weight: 700;
  }

  &--xl {
    font-size: var(--fs-xl);
    font-weight: 700;
    color: var(--base-font-color);
  }
}

.quick-result {
  display: flex;
  flex-direction: column;
  gap: var(--sp-xs);
  margin-top: var(--sp-lg);
  padding-top: var(--sp-lg);
  border-top: 1px solid var(--color-border);
}

.quick-result-main {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--sp-sm);
}

.price-meta {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
  line-height: var(--lh-md);
}

.tag-chip {
  display: inline-flex;
  padding: 0 var(--sp-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-size: var(--fs-sm);
  line-height: var(--lh-md);
  white-space: nowrap;

  &--ok {
    border-color: var(--base-green);
    color: var(--base-green);
  }

  &--none {
    color: var(--base-sub-color);
  }

  &--stale {
    border-color: var(--base-warning);
    color: var(--base-sub-color);
  }
}
</style>
