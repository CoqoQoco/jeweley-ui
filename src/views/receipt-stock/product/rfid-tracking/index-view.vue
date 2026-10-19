<template>
  <div class="app-container rfid-tracking">
    <PageTitle
      :title="$t('view.stock.stockRfidTracking.title')"
      :description="$t('view.stock.stockRfidTracking.subtitle')"
      icon="bi-broadcast"
      :filled="true"
      :isShowBtnClose="false"
    />

    <div class="rfid-tracking-layout">
      <div class="rfid-tracking-side">
        <ReceiptPicker
          v-model:search="receiptSearch"
          v-model:onlyIncomplete="onlyIncomplete"
          :items="receipts"
          :total="receiptTotal"
          :selected="selectedReceipt"
          @select="selectReceipt"
          @refresh="loadReceipts"
          @filter-change="loadReceipts"
        />
        <RecentFeed :items="recent" />
      </div>

      <div class="rfid-tracking-main">
        <template v-if="selectedReceipt && detail">
          <ReceiptProgress :total="detail.total" :bound="detail.bound" :failing="pollFailures > 0" />
          <PieceTable
            v-model:filter="pieceFilter"
            :receiptNumber="selectedReceipt"
            :items="visiblePieces"
            :changedKeys="changedKeys"
          />
        </template>
        <div v-else class="rfid-tracking-empty">{{ $t('view.stock.stockRfidTracking.selectPrompt') }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { useStockRfidApiStore } from '@/stores/modules/api/stock/rfid-api.js'
import { useRfidLivePoll } from '@/composables/useRfidLivePoll.js'

import PageTitle from '@/components/custom/page-title.vue'
import ReceiptPicker from './components/receipt-picker.vue'
import ReceiptProgress from './components/receipt-progress.vue'
import PieceTable from './components/piece-table.vue'
import RecentFeed from './components/recent-feed.vue'
import { mapPieces, filterPieces, diffChangedKeys, mergeRecent, RECENT_FEED_CAP } from './rfid-tracking-helpers.js'

const RECEIPT_PAGE_SIZE = 50
const HIGHLIGHT_MS = 2500

export default {
  name: 'RfidTrackingIndexView',

  components: {
    PageTitle,
    ReceiptPicker,
    ReceiptProgress,
    PieceTable,
    RecentFeed
  },

  setup() {
    const rfidStore = useStockRfidApiStore()
    // task จริงผูกใน created() (ต้องใช้ this) — poll เรียกผ่าน holder.run
    const holder = { run: async () => {} }
    const poll = useRfidLivePoll(() => holder.run())
    return { rfidStore, holder, pollStart: poll.start, pollStop: poll.stop, pollFailures: poll.failures }
  },

  data() {
    return {
      receiptSearch: '',
      onlyIncomplete: true,
      receipts: [],
      receiptTotal: 0,
      selectedReceipt: '',
      detail: null,
      pieces: [],
      pieceFilter: 'all',
      changedKeys: {},
      highlightTimer: null,
      recent: [],
      recentLastId: null
    }
  },

  computed: {
    visiblePieces() {
      return filterPieces(this.pieces, this.pieceFilter)
    }
  },

  created() {
    this.holder.run = () => this.pollTick()
  },

  async mounted() {
    await this.loadReceipts()
    await this.loadRecent(true)
    const queryReceipt = this.$route.query.receiptNumber
    if (queryReceipt) await this.selectReceipt(String(queryReceipt))
    this.pollStart()
  },

  beforeUnmount() {
    this.pollStop()
    clearTimeout(this.highlightTimer)
  },

  methods: {
    async loadReceipts() {
      const res = await this.rfidStore.fetchListReceipts({
        search: this.receiptSearch.trim(),
        onlyIncomplete: this.onlyIncomplete,
        skip: 0,
        take: RECEIPT_PAGE_SIZE
      })
      if (!res) return
      this.receipts = res.items || []
      this.receiptTotal = res.total || 0
    },

    async selectReceipt(receiptNumber) {
      this.selectedReceipt = receiptNumber
      this.detail = null
      this.pieces = []
      this.pieceFilter = 'all'
      this.changedKeys = {}
      if (String(this.$route.query.receiptNumber || '') !== receiptNumber) {
        this.$router.replace({ query: { ...this.$route.query, receiptNumber } })
      }
      const res = await this.rfidStore.fetchListByReceipt(receiptNumber)
      this.applyDetail(receiptNumber, res)
    },

    applyDetail(receiptNumber, res) {
      if (!res || receiptNumber !== this.selectedReceipt) return
      const next = mapPieces(res.items)
      const changed = diffChangedKeys(this.detail ? this.pieces : null, next)
      this.detail = { total: res.total, bound: res.bound }
      this.pieces = next
      this.syncReceiptCounts(receiptNumber, res)
      if (Object.keys(changed).length) this.flashChanged(changed)
    },

    syncReceiptCounts(receiptNumber, res) {
      const row = this.receipts.find((r) => r.receiptNumber === receiptNumber)
      if (!row) return
      row.totalPieces = res.total
      row.boundPieces = res.bound
      row.remainingPieces = Math.max(res.total - res.bound, 0)
    },

    flashChanged(changed) {
      this.changedKeys = changed
      clearTimeout(this.highlightTimer)
      this.highlightTimer = setTimeout(() => {
        this.changedKeys = {}
      }, HIGHLIGHT_MS)
    },

    async loadRecent(initial = false) {
      const res = await this.rfidStore.fetchListRecent(
        { sinceId: initial ? null : this.recentLastId, take: RECENT_FEED_CAP },
        { poll: !initial }
      )
      if (!res) return
      const items = res.items || []
      if (items.length) this.recent = mergeRecent(this.recent, items, { initial: initial || this.recentLastId === null })
      if (res.lastId !== null && res.lastId !== undefined) this.recentLastId = res.lastId
    },

    async pollTick() {
      const receiptNumber = this.selectedReceipt
      if (receiptNumber) {
        const res = await this.rfidStore.fetchListByReceipt(receiptNumber, { poll: true })
        this.applyDetail(receiptNumber, res)
      }
      await this.loadRecent()
    }
  }
}
</script>

<style lang="scss" scoped>
.rfid-tracking-layout {
  display: grid;
  grid-template-columns: minmax(300px, 360px) 1fr;
  gap: var(--sp-lg);
  margin-top: var(--sp-lg);
  align-items: start;
}

.rfid-tracking-side {
  display: flex;
  flex-direction: column;
  gap: var(--sp-lg);
}

.rfid-tracking-main {
  min-width: 0;
}

.rfid-tracking-empty {
  padding: var(--sp-xl);
  text-align: center;
  color: var(--base-sub-color);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-lg);
}

@media (max-width: 1024px) {
  .rfid-tracking-layout {
    grid-template-columns: 1fr;
  }
}
</style>
