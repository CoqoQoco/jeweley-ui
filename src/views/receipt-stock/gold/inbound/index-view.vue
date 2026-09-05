<template>
  <div class="app-container">
    <PageHeaderGeneric :title="$t('view.receiptStock.gold.inbound.title')" backRoute="stock-gold-list" />
    <form-view
      :mode="mode"
      :modelValue="form"
      @update:mode="mode = $event"
      @update:modelValue="form = $event"
      @submit="onSubmit"
    />
  </div>
</template>

<script>
import { useStockGoldApiStore } from '@/stores/modules/api/stock/gold-store.js'
import { formatISOString } from '@/services/utils/dayjs.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { success, warning } from '@/services/alert/sweetAlerts.js'

import PageHeaderGeneric from '@/components/generic/PageHeaderGeneric.vue'
import formView from './components/form-view.vue'

const defaultForm = () => ({
  goldCode: null,
  goldSizeCode: null,
  weight: null,
  requestDate: new Date(),
  remark: '',
  adjustType: 5
})

export default {
  name: 'StockGoldInboundView',

  components: {
    PageHeaderGeneric,
    formView
  },

  data() {
    return {
      mode: 'inbound',
      form: defaultForm()
    }
  },

  methods: {
    resetForm() {
      this.form = defaultForm()
    },

    validate() {
      if (!this.form.goldCode) {
        warning(this.$t('view.receiptStock.gold.inbound.errorGoldRequired'))
        return false
      }
      if (!this.form.goldSizeCode) {
        warning(this.$t('view.receiptStock.gold.inbound.errorGoldSizeRequired'))
        return false
      }
      if (!this.form.weight) {
        warning(this.$t('view.receiptStock.gold.inbound.errorWeightRequired'))
        return false
      }
      if (this.mode === 'adjust' && !this.form.remark) {
        warning(this.$t('view.receiptStock.gold.inbound.errorRemarkRequiredAdjust'))
        return false
      }
      return true
    },

    onSubmit() {
      if (!this.validate()) return

      confirmThenSubmit(
        `${this.form.goldCode} / ${this.form.goldSizeCode} : ${this.form.weight} ${this.$t('view.receiptStock.gold.inbound.unitGram')}`,
        this.$t('view.receiptStock.gold.inbound.confirmTitle'),
        async () => {
          const store = useStockGoldApiStore()
          const payload = {
            goldCode: this.form.goldCode,
            goldSizeCode: this.form.goldSizeCode,
            weight: Number(this.form.weight),
            requestDate: this.form.requestDate ? formatISOString(this.form.requestDate) : null,
            remark: this.form.remark || null
          }

          let res = null
          if (this.mode === 'inbound') {
            res = await store.inbound(payload)
          } else if (this.mode === 'openingBalance') {
            res = await store.openingBalance(payload)
          } else {
            payload.type = this.form.adjustType
            res = await store.adjust(payload)
          }

          if (res) {
            success(
              `${this.$t('view.receiptStock.gold.inbound.resultRunning')}: ${res.running} — ${this.$t('view.receiptStock.gold.inbound.resultRemainWeight')}: ${res.remainWeight}`,
              this.$t('view.receiptStock.gold.inbound.successMsg')
            )
            this.resetForm()
          }
        }
      )
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.app-container {
  padding: var(--sp-lg);
}
</style>
