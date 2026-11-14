<template>
  <div class="app-container rfid-basket">
    <PageTitle
      :title="$t('view.stock.rfidBasket.title')"
      :description="$t('view.stock.rfidBasket.subtitle')"
      icon="bi-basket"
      :filled="true"
      :isShowBtnClose="false"
    />

    <ReaderBar
      class="basket-card"
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
      @connect="onConnect"
      @start="tray.start()"
      @stop="tray.stop()"
      @disconnect="tray.disconnect()"
    />

    <SectionCardGeneric class="basket-card" :title="$t('view.stock.rfidBasket.listTitle')" icon="bi-list-ul" accent="main" headerStyle="legend">
      <div class="basket-toolbar">
        <div class="basket-toolbar-info">
          <ToggleGroupGeneric v-model="filter" :options="filterOptions" />
          <span class="basket-summary">
            {{ $t('view.stock.rfidBasket.summary', { products: summary.products, pieces: summary.pieces }) }}
          </span>
        </div>
        <div class="basket-toolbar-actions">
          <ButtonGeneric
            variant="green"
            icon="bi-arrow-repeat"
            :label="$t('view.stock.rfidBasket.actions.recheck')"
            :disabled="!entries.length"
            @click="recheckAll"
          />
          <ButtonGeneric
            class="ml-2"
            variant="outline"
            icon="bi-clipboard"
            :label="$t('view.stock.rfidBasket.actions.copy')"
            :disabled="!entries.length"
            @click="copyEpcs"
          />
          <ButtonGeneric
            class="ml-2"
            variant="red"
            icon="bi-trash"
            :label="$t('view.stock.rfidBasket.actions.clear')"
            :disabled="!entries.length"
            @click="confirmClear"
          />
        </div>
      </div>

      <BasketTable :items="visibleEntries" :now="now" :resetKey="`${filter}:${clearCount}`" @select="selectedEpc = $event" />
    </SectionCardGeneric>

    <TagDetailDrawer :entry="selectedEntry" @close="selectedEpc = ''" @remove="removeOne" />
  </div>
</template>

<script>
import { useStockRfidApiStore } from '@/stores/modules/api/stock/rfid-api.js'
import { useTrayReader } from '@/composables/useTrayReader.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { success, warning } from '@/services/alert/sweetAlerts.js'

import PageTitle from '@/components/custom/page-title.vue'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ToggleGroupGeneric from '@/components/generic/ToggleGroupGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import ReaderBar from './components/reader-bar.vue'
import BasketTable from './components/basket-table.vue'
import TagDetailDrawer from './components/tag-detail-drawer.vue'
import {
  CHECK_DEBOUNCE_MS,
  NEW_BADGE_MS,
  allEpcs,
  applyCheckResult,
  applyReads,
  chunkEpcs,
  countEntries,
  epcListText,
  filterEntries,
  isNewEntry,
  removeEntry,
  summarizeBound,
  uncheckedEpcs
} from './rfid-basket-logic.js'

export default {
  name: 'RfidBasketIndexView',

  components: { PageTitle, SectionCardGeneric, ToggleGroupGeneric, ButtonGeneric, ReaderBar, BasketTable, TagDetailDrawer },

  setup() {
    const rfidStore = useStockRfidApiStore()
    const tray = useTrayReader()
    return { rfidStore, tray }
  },

  data() {
    return {
      entries: [],
      filter: 'all',
      selectedEpc: '',
      clearCount: 0,
      now: Date.now(),
      checkTimer: null,
      nowTimer: null
    }
  },

  computed: {
    counts() {
      return countEntries(this.entries)
    },

    summary() {
      return summarizeBound(this.entries)
    },

    visibleEntries() {
      return filterEntries(this.entries, this.filter)
    },

    selectedEntry() {
      return this.entries.find((entry) => entry.epc === this.selectedEpc) || null
    },

    filterOptions() {
      const label = (key) => this.$t(`view.stock.rfidBasket.filter.${key}`)
      return [
        { value: 'all', label: `${label('all')} (${this.counts.total})` },
        { value: 'bound', label: `${label('bound')} (${this.counts.bound})` },
        { value: 'unbound', label: `${label('unbound')} (${this.counts.unbound})` },
        { value: 'unchecked', label: `${label('unchecked')} (${this.counts.unchecked})` }
      ]
    }
  },

  watch: {
    'tray.state.value'(state, previous) {
      // หยุดอ่านแล้ว (กดหยุดหรือหลุด) → ตรวจแท็กที่ยังไม่ตรวจอัตโนมัติ
      if (previous === 'reading' && state !== 'reading') this.scheduleAutoCheck()
    }
  },

  created() {
    this.tray.setBatchHandler((batch) => this.applyBatch(batch))
  },

  mounted() {
    if (this.tray.supportedKinds.length) this.tray.autoReconnect()
  },

  beforeUnmount() {
    clearTimeout(this.checkTimer)
    clearInterval(this.nowTimer)
  },

  methods: {
    onConnect(kind) {
      this.tray.connect(kind)
    },

    applyBatch(batch) {
      this.entries = applyReads(this.entries, batch)
      this.now = Date.now()
      this.startNowTick()
    },

    // ป้าย "ใหม่" หายเองหลัง NEW_BADGE_MS — เดินนาฬิกาเฉพาะตอนมีแถวใหม่
    startNowTick() {
      if (this.nowTimer) return
      this.nowTimer = setInterval(() => {
        this.now = Date.now()
        if (!this.entries.some((entry) => isNewEntry(entry, this.now))) {
          clearInterval(this.nowTimer)
          this.nowTimer = null
        }
      }, Math.min(1000, NEW_BADGE_MS))
    },

    scheduleAutoCheck() {
      clearTimeout(this.checkTimer)
      this.checkTimer = setTimeout(() => this.checkEpcs(uncheckedEpcs(this.entries)), CHECK_DEBOUNCE_MS)
    },

    recheckAll() {
      this.checkEpcs(allEpcs(this.entries))
    },

    async checkEpcs(epcs) {
      for (const chunk of chunkEpcs(epcs)) {
        const result = await this.rfidStore.fetchByEpcs(chunk)
        if (result) this.entries = applyCheckResult(this.entries, result, chunk)
      }
    },

    async copyEpcs() {
      try {
        await navigator.clipboard.writeText(epcListText(this.entries))
      } catch {
        warning(this.$t('view.stock.rfidBasket.copyFailed'))
        return
      }
      success(this.$t('view.stock.rfidBasket.copied', { count: this.entries.length }))
    },

    confirmClear() {
      confirmThenSubmit(
        this.$t('view.stock.rfidBasket.clearDialog.message', { count: this.entries.length }),
        this.$t('view.stock.rfidBasket.clearDialog.title'),
        () => {
          this.entries = []
          this.clearCount += 1
          this.selectedEpc = ''
        },
        {
          confirmText: this.$t('view.stock.rfidBasket.clearDialog.confirm'),
          cancelText: this.$t('view.stock.rfidBasket.clearDialog.cancel')
        }
      )
    },

    removeOne(epc) {
      this.entries = removeEntry(this.entries, epc)
      this.selectedEpc = ''
    }
  }
}
</script>

<style lang="scss" scoped>
.rfid-basket {
  display: flex;
  flex-direction: column;
  gap: var(--sp-md);
}

.rfid-basket .basket-card {
  padding: var(--sp-md) var(--sp-lg);
}

.basket-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-md);
  flex-wrap: wrap;
  margin-bottom: var(--sp-md);
}

.basket-toolbar-info {
  display: flex;
  align-items: center;
  gap: var(--sp-lg);
  flex-wrap: wrap;
}

.basket-toolbar-actions {
  display: flex;
  margin-left: auto;
}

.basket-summary {
  font-weight: 600;
  color: var(--base-sub-color);
}
</style>
