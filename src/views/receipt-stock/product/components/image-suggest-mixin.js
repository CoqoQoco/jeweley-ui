import { stockProductImageApiStor } from '@/stores/modules/api/stock/image-api.js'

import {
  applyImageSuggestion,
  buildImageSuggestItems,
  dropAutoImage,
  needsImageSuggest
} from './image-suggest.js'

const IMAGE_SUGGEST_DEBOUNCE_MS = 400

// ฝั่งที่ใช้ต้องมี: imageSuggestRows() / imageSuggestKey(row)
export default {
  data() {
    return {
      imageSuggestTimer: null,
      imageSuggestPending: []
    }
  },

  beforeUnmount() {
    clearTimeout(this.imageSuggestTimer)
  },

  methods: {
    onImageSuggestProductChanged(row) {
      if (!row) return
      if (row.imagePath && row.imageSuggestAuto !== true) return
      if (!this.imageSuggestPending.includes(row)) this.imageSuggestPending.push(row)
      clearTimeout(this.imageSuggestTimer)
      this.imageSuggestTimer = setTimeout(() => {
        const rows = this.imageSuggestPending
        this.imageSuggestPending = []
        this.runImageSuggest(rows)
      }, IMAGE_SUGGEST_DEBOUNCE_MS)
    },

    async runImageSuggest(rows = this.imageSuggestRows(), options = {}) {
      const keyOf = (row) => this.imageSuggestKey(row)
      for (const row of rows) {
        if (row.imageSuggestAuto === true && !String(row.productNumber ?? '').trim()) dropAutoImage(row)
      }
      const items = buildImageSuggestItems(rows, keyOf, options)
      if (!items.length) return

      const sent = new Map(rows.map((row) => [keyOf(row), String(row.productNumber ?? '').trim()]))
      const hits = await stockProductImageApiStor().fetchSuggestByProduct({ items })
      const hitByKey = new Map(hits.map((h) => [h.key, h]))

      for (const item of items) {
        const row = rows.find((r) => keyOf(r) === item.key)
        if (!row || String(row.productNumber ?? '').trim() !== item.productNumber) continue
        if (!needsImageSuggest(row, options) || sent.get(item.key) !== item.productNumber) continue
        const hit = hitByKey.get(item.key)
        if (hit) applyImageSuggestion(row, hit)
        else dropAutoImage(row)
      }
    }
  }
}
