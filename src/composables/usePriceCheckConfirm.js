/**
 * usePriceCheckConfirm — mixin ตรวจราคาผิดปกติก่อนบันทึก (StockProduct/PriceCheck)
 *
 * วิธีใช้ในหน้าที่บันทึกราคา:
 *   mixins: [priceCheckConfirm]
 *   template: <PriceOutlierConfirmModal
 *               :isShow="priceCheckModal.show"
 *               :outliers="priceCheckModal.outliers"
 *               @edit="onPriceCheckEdit"
 *               @useSuggested="onPriceCheckUseSuggested"
 *               @confirm="onPriceCheckConfirm" />
 *
 *   const ok = await this.confirmPriceOrAbort(entries, {
 *     onApplySuggestions: (list) => { ... },   // list = [{ key, price }]
 *     onFocus: () => this.$refs.priceInput?.focus()
 *   })
 *   if (!ok) return
 *
 * คืน true = บันทึกต่อได้ (ไม่มีราคาผิดปกติ / API ตรวจไม่ได้ / ผู้ใช้กดยืนยันราคา)
 * คืน false = หยุดบันทึก (กดแก้ไขราคา / ใช้ราคาที่แนะนำ)
 */
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import { findPriceOutliers, collectSuggestions } from '@/services/helper/price-check/price-check.js'

export default {
  data() {
    return {
      priceCheckModal: { show: false, outliers: [] },
      priceCheckPending: null
    }
  },

  methods: {
    async confirmPriceOrAbort(entries, options = {}) {
      const store = usrStockProductApiStore()
      const outliers = await findPriceOutliers((items) => store.priceCheck(items), entries)
      if (!outliers.length) return true

      return new Promise((resolve) => {
        this.priceCheckPending = { resolve, options }
        this.priceCheckModal = { show: true, outliers }
      })
    },

    finishPriceCheck(proceed, afterClose) {
      const pending = this.priceCheckPending
      const outliers = this.priceCheckModal.outliers
      this.priceCheckModal = { show: false, outliers: [] }
      this.priceCheckPending = null
      if (!pending) return
      if (afterClose) afterClose(pending.options, outliers)
      pending.resolve(proceed)
    },

    onPriceCheckConfirm() {
      this.finishPriceCheck(true)
    },

    onPriceCheckEdit() {
      this.finishPriceCheck(false, (options) => {
        if (options.onFocus) this.$nextTick(() => options.onFocus())
      })
    },

    onPriceCheckUseSuggested() {
      this.finishPriceCheck(false, (options, outliers) => {
        if (options.onApplySuggestions) options.onApplySuggestions(collectSuggestions(outliers))
        if (options.onFocus) this.$nextTick(() => options.onFocus())
      })
    }
  }
}
