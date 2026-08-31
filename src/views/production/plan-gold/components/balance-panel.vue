<template>
  <SectionCardGeneric headerStyle="legend" icon="bi-calculator" accent="green" :title="title" class="mt-4">
    <div class="balance-row">
      <span class="balance-text">
        {{ $t('view.production.planGold.balanceIssued') }} {{ fmt2(balance.issued) }}
        − {{ $t('view.production.planGold.balanceReturned') }} {{ fmt2(balance.returned) }}
        = {{ $t('view.production.planGold.balanceDiff') }} {{ fmt2(balance.amount) }}
      </span>
      <span
        v-if="balance.diff !== 0"
        :class="['balance-tag', balance.diff > 0 ? 'balance-tag--short' : 'balance-tag--over']"
      >
        {{ balance.diff > 0 ? $t('view.production.planGold.balanceShort') : $t('view.production.planGold.balanceOver') }}
        {{ fmt2(balance.amount) }}
      </span>
      <ButtonGeneric
        v-if="balance.diff !== 0"
        variant="outline"
        type="button"
        :label="$t('view.production.planGold.balanceApply')"
        @click="$emit('apply')"
      />
    </div>
  </SectionCardGeneric>
</template>

<script>
// External dependencies
import { fmt2 } from '@/services/utils/gold-loss-tang-calc.js'

// Local components
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

export default {
  name: 'BalancePanel',

  components: {
    SectionCardGeneric,
    ButtonGeneric
  },

  props: {
    title: {
      type: String,
      default: ''
    },
    balance: {
      type: Object,
      default: () => ({ issued: 0, returned: 0, diff: 0, amount: 0 })
    }
  },

  emits: ['apply'],

  methods: {
    fmt2(val) {
      return fmt2(val)
    }
  }
}
</script>

<style lang="scss" scoped>
.balance-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--sp-sm);
}

.balance-text {
  font-weight: 500;
}

.balance-tag {
  padding: var(--sp-xs) var(--sp-sm);
  border-radius: var(--radius-sm);
  font-weight: 700;
}

.balance-tag--short {
  background: var(--color-highlight-bg);
  color: var(--base-font-color);
}

.balance-tag--over {
  background: var(--color-green-bg);
  color: var(--base-green);
}
</style>
