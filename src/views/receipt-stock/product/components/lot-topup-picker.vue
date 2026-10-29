<template>
  <div class="lot-topup-picker">
    <span class="title-text">{{ $t('view.receiptStock.product.receiptLot.searchLabel') }}</span>
    <div class="lot-search-row">
      <InputTextGeneric
        v-model.trim="keyword"
        :placeholder="$t('view.receiptStock.product.receiptLot.searchPlaceholder')"
        autocomplete="off"
        @keydown.enter.prevent="onSearch"
      />
      <ButtonGeneric
        variant="green"
        icon="bi-search"
        :label="$t('common.btn.search')"
        @click="onSearch"
      />
    </div>

    <span v-if="topUpStockNumber" class="topup-badge">
      {{ $t('view.receiptStock.product.receiptLot.topUpBadge', { stockNumber: topUpStockNumber }) }}
    </span>

    <p v-if="searched && lots.length === 0" class="lot-note">
      {{ $t('view.receiptStock.product.receiptLot.notFound') }}
    </p>

    <template v-if="lots.length > 0">
      <p v-if="!isSilver" class="lot-warn">
        <i class="bi bi-exclamation-triangle"></i>
        {{ $t('view.receiptStock.product.receiptLot.goldDuplicateWarn') }}
      </p>

      <div v-for="item in lotViews" :key="item.lot.stockNumber" class="lot-item">
        <div class="lot-info">
          <div class="lot-main">
            <strong>{{ item.lot.stockNumber }}</strong>
            <span v-if="item.lot.stockNumberOrigin" class="lot-sub">
              {{ $t('view.receiptStock.product.receiptLot.lotOldNumber') }}:
              {{ item.lot.stockNumberOrigin }}
            </span>
          </div>
          <div class="lot-sub">
            {{ item.lot.productNumber }}
            {{ item.lot.productNameTh || item.lot.productNameEn }}
          </div>
          <div class="lot-sub">
            {{ $t('view.receiptStock.product.receiptLot.lotLocation') }}: {{ item.lot.locationCode }}
            ·
            {{
              $t('view.receiptStock.product.receiptLot.lotQty', {
                available: item.lot.qtyAvailable,
                qty: item.lot.qty
              })
            }}
            ·
            <span :class="{ 'lot-sold': isSold(item.lot) }">{{ statusText(item.lot) }}</span>
          </div>
          <div v-if="item.reason" class="lot-reason">
            {{ reasonText(item.reason) }}
          </div>
        </div>
        <ButtonGeneric
          :variant="item.lot.stockNumber === topUpStockNumber ? 'main' : 'outline'"
          :disabled="!item.canTopUp"
          :label="$t('view.receiptStock.product.receiptLot.topUpBtn')"
          @click="$emit('select', item.lot)"
        />
      </div>

      <ButtonGeneric
        :variant="topUpStockNumber ? 'outline' : 'main'"
        :label="$t('view.receiptStock.product.receiptLot.newLotBtn')"
        @click="$emit('select', null)"
      />
    </template>
  </div>
</template>

<script>
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

import { useReceiptLotApiStore } from '@/stores/modules/api/receipt/receipt-lot-api.js'
import { evaluateTopUp, pickDefaultLot } from '@/services/helper/receipt-lot/receipt-lot.js'

export default {
  name: 'LotTopupPicker',

  components: {
    InputTextGeneric,
    ButtonGeneric
  },

  props: {
    location: {
      type: String,
      default: ''
    },
    isSilver: {
      type: Boolean,
      default: false
    },
    topUpStockNumber: {
      type: String,
      default: ''
    }
  },

  emits: ['select'],

  setup() {
    const receiptLotStore = useReceiptLotApiStore()
    return { receiptLotStore }
  },

  data() {
    return {
      keyword: '',
      lots: [],
      searched: false
    }
  },

  computed: {
    lotViews() {
      return this.lots.map((lot) => ({
        lot,
        ...evaluateTopUp({ lot, rowLocation: this.location, rowIsSilver: this.isSilver })
      }))
    },

    selectedLotInvalid() {
      if (!this.topUpStockNumber) return false
      const item = this.lotViews.find((x) => x.lot.stockNumber === this.topUpStockNumber)
      return !!item && !item.canTopUp
    }
  },

  watch: {
    selectedLotInvalid(invalid) {
      if (invalid) this.$emit('select', null)
    }
  },

  methods: {
    async onSearch() {
      if (!this.keyword) return
      this.lots = await this.receiptLotStore.fetchSearch(this.keyword)
      this.searched = true

      const defaultLot = pickDefaultLot({
        lots: this.lots,
        rowLocation: this.location,
        rowIsSilver: this.isSilver
      })
      this.$emit('select', defaultLot)
    },

    isSold(lot) {
      return String(lot.status ?? '').toUpperCase() === 'SOLD'
    },

    statusText(lot) {
      return this.isSold(lot)
        ? this.$t('view.receiptStock.product.receiptLot.statusSold')
        : lot.status || ''
    },

    reasonText(reason) {
      return reason === 'location'
        ? this.$t('view.receiptStock.product.receiptLot.reasonLocation')
        : this.$t('view.receiptStock.product.receiptLot.reasonMetal')
    }
  }
}
</script>

<style lang="scss" scoped>
.lot-topup-picker {
  display: flex;
  flex-direction: column;
  gap: var(--sp-xs);
}

.title-text {
  font-weight: 500;
  color: var(--base-font-color);
}

.lot-search-row {
  display: flex;
  gap: var(--sp-sm);
  align-items: center;
}

.topup-badge {
  align-self: flex-start;
  padding: 2px var(--sp-sm);
  border-radius: var(--radius-sm);
  background-color: var(--base-warning);
  color: var(--base-font-color);
  font-size: var(--fs-sm);
  font-weight: 700;
}

.lot-note {
  margin: 0;
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}

.lot-warn {
  margin: 0;
  font-size: var(--fs-sm);
  font-weight: 600;
  color: var(--base-red);
}

.lot-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--sp-sm);
  padding: var(--sp-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: #ffffff;
}

.lot-main {
  display: flex;
  gap: var(--sp-sm);
  align-items: baseline;
}

.lot-sub {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}

.lot-sold {
  color: var(--base-red);
  font-weight: 700;
}

.lot-reason {
  font-size: var(--fs-sm);
  color: var(--base-red);
}
</style>
