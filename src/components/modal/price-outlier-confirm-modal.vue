<template>
  <modal
    :showModal="isShow"
    width="640px"
    headerVariant="main"
    :isShowActionPart="true"
    @closeModal="$emit('edit')"
  >
    <template #title>
      <span class="title-text-lg d-block">
        <i class="bi bi-exclamation-triangle-fill"></i>
        {{ $t('common.priceCheck.title') }}
      </span>
    </template>

    <template #content>
      <p class="intro">{{ $t('common.priceCheck.intro', { count: outliers.length }) }}</p>

      <div v-for="item in rows" :key="item.key" class="outlier-box">
        <div v-if="item.label" class="outlier-label">{{ item.label }}</div>
        <div class="outlier-caption">{{ $t('common.priceCheck.enteredPrice') }}</div>
        <div class="outlier-price">{{ item.priceText }}</div>

        <ul class="reason-list">
          <li v-for="(text, idx) in item.reasonTexts" :key="idx">{{ text }}</li>
        </ul>

        <div v-if="item.suggestedText" class="suggestion">
          <i class="bi bi-lightbulb"></i>
          {{ $t('common.priceCheck.suggestion', { price: item.suggestedText }) }}
        </div>
      </div>
    </template>

    <template #action>
      <ButtonGeneric variant="main" icon="bi-pencil" :label="$t('common.priceCheck.editPrice')" @click="$emit('edit')" />
      <ButtonGeneric
        v-if="hasSuggestion"
        variant="green"
        icon="bi-lightbulb"
        class="ml-2"
        :label="$t('common.priceCheck.useSuggested')"
        @click="$emit('useSuggested')"
      />
      <ButtonGeneric
        variant="outline"
        icon="bi-check2"
        class="ml-2"
        :label="$t('common.priceCheck.confirmPrice')"
        @click="$emit('confirm')"
      />
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'

import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import { formatPriceNumber, formatReasons } from '@/services/helper/price-check/price-check.js'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

export default {
  name: 'PriceOutlierConfirmModal',

  components: { modal, ButtonGeneric },

  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    // [{ key, label, price, reasons: [{code,value,reference}], suggestedPrice }]
    outliers: {
      type: Array,
      default: () => []
    }
  },

  emits: ['edit', 'useSuggested', 'confirm'],

  computed: {
    rows() {
      return this.outliers.map((o) => ({
        key: o.key,
        label: o.label,
        priceText: formatPriceNumber(o.price),
        reasonTexts: formatReasons((key, params) => this.$t(key, params), o.reasons),
        suggestedText: o.suggestedPrice !== null && o.suggestedPrice !== undefined ? formatPriceNumber(o.suggestedPrice) : ''
      }))
    },
    hasSuggestion() {
      return this.rows.some((r) => r.suggestedText)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.intro {
  margin: 0 0 var(--sp-lg);
  color: var(--base-font-color);
  font-weight: 600;
}

.outlier-box {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-highlight-bg);
  padding: var(--sp-lg);
  margin-bottom: var(--sp-md);

  &:last-child {
    margin-bottom: 0;
  }
}

.outlier-label {
  font-weight: 600;
  margin-bottom: var(--sp-xs);
}

.outlier-caption {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}

.outlier-price {
  font-size: var(--fs-xl);
  font-weight: 700;
  color: var(--base-font-color);
  margin-bottom: var(--sp-sm);
}

.reason-list {
  margin: 0 0 var(--sp-sm);
  padding-left: var(--sp-xl);
  font-size: var(--fs-base);
  line-height: var(--lh-md);
}

.suggestion {
  font-size: var(--fs-base);
  color: var(--base-green);
  font-weight: 600;
}
</style>
