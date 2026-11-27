<template>
  <div class="app-container">
    <search
      v-model:modelForm="form"
      :showTag="true"
      :tagMode="tagMode"
      :showExport="!tagMode"
      @search="onSearchFilter"
      @clear="onClearFilter"
      @export="onExport"
      @readTags="enterTagMode"
    ></search>

    <template v-if="tagMode">
      <ReaderBar
        class="tag-card"
        :state="tray.state.value"
        :deviceName="tray.deviceName.value"
        :activeKind="tray.activeKind.value"
        :errorKey="tray.errorKey.value"
        :connectionLost="tray.connectionLost.value"
        :elapsedSec="tray.elapsedSec.value"
        :busy="tray.busy.value"
        :live="tray.live.value"
        :canStop="tray.canStop.value"
        :supportedKinds="tray.supportedKinds"
        @connect="tray.connect($event)"
        @start="tray.start()"
        @stop="tray.stop()"
        @disconnect="tray.disconnect()"
      />

      <div class="tag-mode-bar tag-card" role="status">
        <div class="tag-mode-bar__text">
          <strong><i class="bi bi-funnel" aria-hidden="true"></i> {{ $t('view.stock.product.tag.modeTitle') }}</strong>
          <span>{{ $t('view.stock.product.tag.modeHint') }}</span>
        </div>
        <div class="tag-mode-bar__chips">
          <span class="tag-mode-chip">{{ $t('view.stock.product.tag.chipRead', { count: tagSummary.read }) }}</span>
          <span class="tag-mode-chip">{{ $t('view.stock.product.tag.chipFound', { count: tagSummary.found }) }}</span>
          <span class="tag-mode-chip" :class="{ 'tag-mode-chip--warn': tagSummary.unknown > 0 }">{{ $t('view.stock.product.tag.chipUnknown', { count: tagSummary.unknown }) }}</span>
          <span class="tag-mode-chip" :class="{ 'tag-mode-chip--warn': tagSummary.sold > 0 }">{{ $t('view.stock.product.tag.chipSold', { count: tagSummary.sold }) }}</span>
          <span v-if="tagSummary.pending" class="tag-mode-chip">{{ $t('view.stock.product.tag.chipPending', { count: tagSummary.pending }) }}</span>
        </div>
        <ButtonGeneric variant="dark" icon="bi-arrow-left" :label="$t('view.stock.product.tag.backToNormal')" @click="exitTagMode" />
      </div>
      <p v-if="tagTruncated" class="tag-warn" role="alert">
        {{ $t('view.stock.product.tag.truncated', { max: MAX_TAG_PIECES }) }}
      </p>
      <p v-if="!tagPieces.length" class="tag-empty">{{ $t('view.stock.product.tag.emptyHint') }}</p>
    </template>

    <dataTable
      v-show="!tagMode || tagPieces.length"
      v-model:modelForm="search"
      v-model:modelFormExport="formExport"
    ></dataTable>
  </div>
</template>

<script>
import search from './components/search-view.vue'
import dataTable from './components/data-table-view.vue'
import ReaderBar from '../../rfid-basket/components/reader-bar.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

import { useMasterApiStore } from '@/stores/modules/api/master-store.js'
import { useStockRfidApiStore } from '@/stores/modules/api/stock/rfid-api.js'
import { useTrayReader } from '@/composables/useTrayReader.js'
import {
  CHECK_DEBOUNCE_MS,
  applyCheckResult,
  applyReads,
  chunkEpcs,
  uncheckedEpcs
} from '../../rfid-basket/rfid-basket-logic.js'
import { CHECK_BACKOFF_MS, epcsOutsideBackoff } from '../../rfid-bind/rfid-bind-logic.js'
import { MAX_TAG_PIECES, piecesFromEntries, piecesSignature, summarizeTagReads } from './stock-tag-logic.js'

const interfaceForm = {
  //receiptDateStart: new Date(new Date().setDate(new Date().getDate())),
  //receiptDateEnd: new Date(),
  receiptType: null,
  stockNumberOriginal: null,

  stockNumber: null,
  mold: null,

  productNumber: null,
  productNameEn: null,
  productNameTh: null,

  woText: null,
  size: null,

  productType: [],
  gold: null,
  goldSize: null,
  hasCostDetail: null,
  pieceStatus: null,
  priceStatus: null,
  locationCodes: [],
  materials: [],
  materialMatch: 'all',
  priceMin: null,
  priceMax: null,
  tagStatus: null
}

export default {
  name: 'ReportGr',

  components: {
    search,
    dataTable,
    ReaderBar,
    ButtonGeneric
  },

  setup() {
    const masterStore = useMasterApiStore()
    const rfidStore = useStockRfidApiStore()
    const tray = useTrayReader()
    return { masterStore, rfidStore, tray, MAX_TAG_PIECES }
  },

  computed: {
    masterGold() {
      return this.masterStore.gold
    },
    masterGem() {
      return this.masterStore.gem
    },
    masterDiamondGrade() {
      return this.masterStore.diamondGrade
    },
    tagSummary() {
      return summarizeTagReads(this.tagEntries)
    },
    allTagPieces() {
      return piecesFromEntries(this.tagEntries, Number.MAX_SAFE_INTEGER)
    },
    tagPieces() {
      return this.allTagPieces.slice(0, MAX_TAG_PIECES)
    },
    tagTruncated() {
      return this.allTagPieces.length > MAX_TAG_PIECES
    }
  },

  data() {
    return {
      isLoading: false,
      isExport: false,
      form: { ...interfaceForm },
      formExport: { ...interfaceForm },
      search: {},
      tagMode: false,
      tagEntries: []
    }
  },

  methods: {
    // ค้นปกติระหว่างโหมดอ่านแท็ก = ออกจากโหมดแท็กก่อน (หยุดอ่าน ล้างตัวกรองแท็ก) แล้วค้นตามฟอร์ม
    async onSearchFilter(data) {
      if (this.tagMode) await this.leaveTagMode()
      this.search = { ...data }
    },

    onClearFilter() {
      this.form = { ...interfaceForm }
    },

    enterTagMode() {
      this.tagMode = true
      this.tagEntries = []
      this.appliedSignature = ''
      this.checkBackoff = new Map()
      this.tray.setBatchHandler((batch) => this.applyBatch(batch))
      if (this.tray.supportedKinds.length) this.tray.autoReconnect()
    },

    async leaveTagMode() {
      clearTimeout(this.checkTimer)
      this.checkTimer = null
      this.tray.setBatchHandler(() => {})
      if (this.tray.canStop.value) await this.tray.stop()
      this.tagMode = false
      this.tagEntries = []
    },

    async exitTagMode() {
      await this.leaveTagMode()
      this.search = { ...this.form }
    },

    applyBatch(batch) {
      if (!this.tagMode) return
      this.tagEntries = applyReads(this.tagEntries, batch)
      // ผลอ่านเข้ามาทุก ~300ms ตลอดที่อ่าน — รวมแท็กใหม่ไว้แล้วตรวจทีเดียวหลัง CHECK_DEBOUNCE_MS (ไม่รีเซ็ตตัวนับ ไม่งั้นไม่เคยยิง)
      if (!this.checkTimer && uncheckedEpcs(this.tagEntries).length) this.scheduleCheck(CHECK_DEBOUNCE_MS)
    },

    scheduleCheck(ms) {
      clearTimeout(this.checkTimer)
      this.checkTimer = setTimeout(() => {
        this.checkTimer = null
        this.checkTags()
      }, ms)
    },

    async checkTags() {
      if (!this.tagMode) return
      if (this.checking) {
        this.scheduleCheck(CHECK_DEBOUNCE_MS)
        return
      }
      this.checking = true
      const epcs = epcsOutsideBackoff(uncheckedEpcs(this.tagEntries), this.checkBackoff, Date.now())
      let failed = false
      for (const chunk of chunkEpcs(epcs)) {
        const result = await this.rfidStore.fetchByEpcs(chunk, { skipLoading: true, skipError: true }).catch(() => null)
        if (!result) {
          failed = true
          chunk.forEach((epc) => this.checkBackoff.set(epc, Date.now() + CHECK_BACKOFF_MS))
          continue
        }
        this.tagEntries = applyCheckResult(this.tagEntries, result, chunk)
      }
      this.checking = false
      this.applyTagFilter()
      if (failed) this.scheduleCheck(CHECK_BACKOFF_MS)
    },

    // ยังไม่มีชิ้นที่รู้จัก = ไม่ยิง List (pieces ว่างฝั่ง API = ไม่กรอง คืนทั้งหมด)
    applyTagFilter() {
      if (!this.tagMode || !this.tagPieces.length) return
      const signature = piecesSignature(this.tagPieces)
      if (signature === this.appliedSignature) return
      this.appliedSignature = signature
      this.search = { pieces: this.tagPieces }
    },

    onExport(data) {
      this.formExport = { ...data }
    }
  },

  beforeUnmount() {
    clearTimeout(this.checkTimer)
  },

  async created() {
    this.checkTimer = null
    this.checking = false
    this.appliedSignature = ''
    this.checkBackoff = new Map()
    this.$nextTick(async () => {
      await this.masterStore.fetchGold()
      await this.masterStore.fetchGoldSize()
      await this.masterStore.fetchProductType()
      await this.masterStore.fetchGem()
    })
  }
}
</script>

<style lang="scss" scoped>
.tag-card {
  margin-top: var(--sp-md);
}

.tag-mode-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-md);
  flex-wrap: wrap;
  padding: var(--sp-md) var(--sp-lg);
  background: var(--color-card-bg);
  border: 1px solid var(--base-warning);
  border-radius: var(--radius-md);
}

.tag-mode-bar__text {
  display: flex;
  flex-direction: column;
  gap: var(--sp-xs);
  font-size: var(--fs-base);
}

.tag-mode-bar__chips {
  display: flex;
  gap: var(--sp-sm);
  flex-wrap: wrap;
  margin-left: auto;
}

.tag-mode-chip {
  padding: 0 var(--sp-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-size: var(--fs-base);
  font-weight: 600;
  white-space: nowrap;

  &--warn {
    border-color: var(--base-warning);
    background: var(--status-open-bg);
  }
}

.tag-warn {
  margin: var(--sp-sm) 0 0;
  font-weight: 600;
}

.tag-empty {
  margin: var(--sp-lg) 0;
  color: var(--base-sub-color);
  text-align: center;
}
</style>
