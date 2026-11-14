import { useReceiptLotApiStore } from '@/stores/modules/api/receipt/receipt-lot-api.js'
import {
  filterTopUpCandidates,
  normalizeProductNumber,
  pickSuggestedLot
} from '@/services/helper/receipt-lot/receipt-lot.js'

const SUGGEST_DEBOUNCE_MS = 500
const SUGGEST_BATCH_SIZE = 50

// ฝั่งที่ใช้ต้องมี: suggestRows() / suggestIsSilver(row) / suggestApply(row, lot) / suggestRevert(row)
// state ต่อแถว: suggestLots (ล็อตที่เติมได้ -- ใช้ในหน้าเท่านั้น), suggestAuto (เติมอัตโนมัติอยู่),
// suggestDismissedFor (รหัสสินค้าที่ผู้ใช้ยกเลิกล็อตแนะนำ -- ว่าง = ไม่เคยยกเลิก) -- สองตัวหลังส่งไปกับร่าง

// ร่างเก็บ suggestAuto + suggestDismissedFor + topUpStockNumber ไว้ ตัดเฉพาะรายการล็อตในหน้า
export function stripSuggestFields(row) {
  const copy = { ...row }
  delete copy.suggestLots
  return copy
}

// payload ยืนยันไม่ต้องมี state ของ suggestion ทั้งหมด
export function stripAllSuggestFields(row) {
  const copy = stripSuggestFields(row)
  delete copy.suggestAuto
  delete copy.suggestDismissedFor
  return copy
}

export function markSuggestDismissed(row) {
  row.suggestAuto = false
  row.suggestDismissedFor = normalizeProductNumber(row.productNumber)
}

export function isSuggestDismissed(row, num) {
  return !!row.suggestDismissedFor && normalizeProductNumber(row.suggestDismissedFor) === num
}

export default {
  data() {
    return {
      suggestTimer: null
    }
  },

  beforeUnmount() {
    clearTimeout(this.suggestTimer)
  },

  methods: {
    scheduleSuggest() {
      clearTimeout(this.suggestTimer)
      this.suggestTimer = setTimeout(() => this.runSuggest(), SUGGEST_DEBOUNCE_MS)
    },

    onSuggestInputChanged(row) {
      if (row.suggestAuto) {
        this.suggestRevert(row)
        row.suggestAuto = false
      }
      row.suggestLots = []
      this.scheduleSuggest()
    },

    async runSuggest() {
      const targets = []
      for (const row of this.suggestRows()) {
        const num = normalizeProductNumber(row.productNumber)
        if (!this.suggestIsSilver(row)) {
          if (row.suggestAuto) {
            this.suggestRevert(row)
            row.suggestAuto = false
          }
          row.suggestLots = []
          continue
        }
        if (num) targets.push({ row, num })
      }
      if (!targets.length) return

      const numbers = [...new Set(targets.map((t) => t.num))]
      const lotsByNumber = new Map()
      const store = useReceiptLotApiStore()
      try {
        for (let i = 0; i < numbers.length; i += SUGGEST_BATCH_SIZE) {
          const groups = await store.fetchSuggestByProduct(numbers.slice(i, i + SUGGEST_BATCH_SIZE))
          groups.forEach((g) => lotsByNumber.set(normalizeProductNumber(g.productNumber), g.lots || []))
        }
      } catch {
        // คำแนะนำเป็นแค่ตัวช่วย -- API ล้มต้องไม่กระทบการกรอกหน้านี้
        return
      }

      for (const { row, num } of targets) {
        if (normalizeProductNumber(row.productNumber) !== num || !this.suggestIsSilver(row)) continue
        this.applySuggestion(row, lotsByNumber.get(num) || [], num)
      }
    },

    applySuggestion(row, lots, num) {
      const rowLocation = row.location || 'MAIN'
      row.suggestLots = filterTopUpCandidates({ lots, rowLocation, rowIsSilver: true })
      if (row.topUpStockNumber || isSuggestDismissed(row, num)) return

      const lot = pickSuggestedLot({
        lots,
        rowLocation,
        rowIsSilver: true,
        rowSize: row.size,
        rowStud: row.studEarring,
        rowStem: row.earringStemSize
      })
      if (!lot) return
      this.suggestApply(row, lot)
      row.suggestAuto = true
    }
  }
}
