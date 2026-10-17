<template>
  <div class="flow-view">
    <div class="flow-view__bar">
      <p class="flow-view__asof">{{ asOfText }}</p>
      <ButtonGeneric variant="outline" icon="bi-arrow-clockwise" :label="$t('common.btn.refresh')" @click="load" />
    </div>

    <template v-if="board">
      <FlowBossBoard :tiles="tiles" @select="onTile" />

      <SectionCardGeneric ref="mapCard" :title="$t('view.executive.flow.map.title')" icon="bi-diagram-3" accent="green" headerStyle="legend">
        <div class="flow-view__map">
          <FlowLensBar v-model:lens="lens" v-model:compare="compare" />
          <FlowScene :stations="stations" :zoneLabels="zoneLabels" :gates="gates" :selected="selected" :lens="lens" :active="active" @select="select" />
          <FlowChipBar :selected="selected" :stockLens="stockLens" :stations="stations" @select="setSelected" @update:stockLens="onStockLens" />
          <ul class="flow-view__notes">
            <li class="flow-view__note flow-view__note--warn">{{ $t('view.executive.flow.scene.beaconWarn') }}</li>
            <li class="flow-view__note flow-view__note--fail">{{ $t('view.executive.flow.scene.beaconFail') }}</li>
            <li class="flow-view__note">{{ $t('view.executive.flow.scene.decorNote') }}</li>
          </ul>
        </div>
      </SectionCardGeneric>

      <SectionCardGeneric :title="$t('view.executive.flow.detail.title')" icon="bi-table" accent="main" headerStyle="legend">
        <FlowPanel :blocks="blocks" @go="onGo" />
      </SectionCardGeneric>

      <p class="flow-view__footer">{{ $t('view.executive.flow.footer') }}</p>
    </template>

    <p v-else class="flow-view__empty">{{ $t('view.executive.flow.pending') }}</p>
  </div>
</template>

<script>
import { useExecutiveReportApiStore } from '@/stores/modules/api/report/executive-report-api.js'
import { formatDateTime } from '@/services/utils/dayjs.js'

import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'

import FlowBossBoard from './flow/flow-boss-board.vue'
import FlowLensBar from './flow/flow-lens-bar.vue'
import FlowScene from './flow/flow-scene.vue'
import FlowChipBar from './flow/flow-chip-bar.vue'
import FlowPanel from './flow/flow-panel.vue'

import { ZONE_IDS, API_ZONES } from '../flow-layout.js'
import { buildStationModels, buildBossTiles, buildGateLabels, zoneLabelText, zoneOf, parseFlowState, serializeFlowState } from '../flow-helpers.js'
import { buildPanelModel } from '../flow-panel-models.js'

const emptyZones = () => Object.fromEntries(API_ZONES.map((z) => [z, null]))

export default {
  name: 'ExecutiveFlowView',

  components: { ButtonGeneric, SectionCardGeneric, FlowBossBoard, FlowLensBar, FlowScene, FlowChipBar, FlowPanel },

  props: {
    // แท็บ Flow กำลังเปิดอยู่ — แท็บถูกซ่อนแต่ยัง mount อยู่ (TabViewGeneric lazy ค้างไว้) จึงต้องหยุดวาดฉาก
    active: { type: Boolean, default: true },
    refreshToken: { type: Number, default: 0 }
  },

  setup() {
    const executiveReportStore = useExecutiveReportApiStore()
    return { executiveReportStore }
  },

  data() {
    return {
      board: null,
      zones: emptyZones(),
      selected: 'all',
      lens: 'default',
      compare: '',
      stockLens: 'sloc',
      stockSel: ''
    }
  },

  computed: {
    asOfText() {
      return this.board?.asOf ? this.$t('view.executive.asOf', { date: formatDateTime(this.board.asOf) }) : ''
    },

    // ข้อมูลทั้งหมดที่ helper ใช้ — zones ใช้ชื่อ API (mold|production|...)
    dataset() {
      return { board: this.board, zones: this.zones }
    },

    stations() {
      return buildStationModels(this.dataset, { stockLens: this.stockLens, stockSel: this.stockSel }, this.translate)
    },

    tiles() {
      return buildBossTiles(this.board, this.translate)
    },

    zoneLabels() {
      return ZONE_IDS.map((id) => ({
        id,
        text: zoneLabelText(id, this.lens, this.board, this.translate),
        active: this.selected === id || zoneOf(this.selected) === id
      }))
    },

    gates() {
      return buildGateLabels(this.dataset, this.translate)
    },

    blocks() {
      return buildPanelModel(
        { board: this.board, zones: this.zones, selected: this.selected, lens: this.lens, compare: this.compare, stockLens: this.stockLens, stockSel: this.stockSel },
        this.translate
      )
    },

    // state ที่เก็บใน URL (?flow=z-prod.worker) — '' = ค่าเริ่มต้น
    stateKey() {
      return serializeFlowState({ selected: this.selected, lens: this.lens, stockLens: this.stockLens })
    }
  },

  watch: {
    stateKey() {
      this.syncQuery()
    },

    '$route.query.flow'(value) {
      if (this.active && (value || '') !== this.stateKey) this.applyState(value)
    },

    active(on) {
      if (!on) return
      if (this.$route.query.flow) this.applyState(this.$route.query.flow)
      this.syncQuery()
      if (!this.board) this.load()
    },

    refreshToken() {
      if (this.active && this.board) this.load()
    }
  },

  created() {
    this.applyState(this.$route.query.flow)
  },

  mounted() {
    this.load()
  },

  methods: {
    translate(key, params) {
      return this.$t(key, params)
    },

    // board ครั้งแรกที่เย็นอาจใช้ ~10 วินาที (server cache 5 นาที) — โซนยิงพร้อมกันแล้วเติมทีละก้อนที่มาถึง
    async load() {
      const store = this.executiveReportStore
      await Promise.all([
        store.flowBoard().then((res) => {
          this.board = res || null
        }),
        ...API_ZONES.map((zone) =>
          store.flowZone(zone).then((res) => {
            this.zones[zone] = res?.[zone] ?? null
          })
        )
      ])
    },

    applyState(raw) {
      const state = parseFlowState(raw)
      this.selected = state.selected
      this.lens = state.lens
      this.stockLens = state.stockLens
      this.stockSel = ''
    },

    syncQuery() {
      if (!this.active) return
      if ((this.$route.query.flow || '') === this.stateKey) return
      const query = { ...this.$route.query }
      if (this.stateKey) query.flow = this.stateKey
      else delete query.flow
      this.$router.replace({ query }).catch(() => {})
    },

    // คลิกซ้ำที่เดิม = ยกเลิกกลับภาพรวม (ฉาก/ตาราง) — chip ใช้ setSelected ตรงๆ
    select(id) {
      this.setSelected(id === this.selected && id !== 'all' ? 'all' : id)
    },

    setSelected(id) {
      this.selected = id
      const station = this.stations.find((s) => s.id === id)
      if (station && station.kind === 'stockPad') this.stockSel = station.fullName || station.name
      else if (zoneOf(id) !== 'z-stock') this.stockSel = ''
    },

    onStockLens(key) {
      this.stockLens = key
      this.stockSel = ''
      if (zoneOf(this.selected) !== 'z-stock') this.setSelected('z-stock')
    },

    // tile ของกระดานผู้บริหาร: 'zone|lens|compare'
    onTile(target) {
      const [id, lens, compare] = String(target).split('|')
      this.lens = lens || 'default'
      this.compare = compare || ''
      this.setSelected(id || 'all')
      this.scrollToMap()
    },

    onGo(id) {
      this.setSelected(id)
      this.scrollToMap()
    },

    scrollToMap() {
      const el = this.$refs.mapCard?.$el
      if (!el || typeof el.scrollIntoView !== 'function') return
      const reduce = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
      el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    }
  }
}
</script>

<style lang="scss" scoped>
.flow-view {
  display: flex;
  flex-direction: column;
  gap: var(--sp-lg);
  min-width: 0;

  &__bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--sp-md);
  }

  &__asof {
    margin: 0;
    font-size: var(--fs-sm);
    color: var(--base-sub-color);
  }

  &__map {
    display: flex;
    flex-direction: column;
    gap: var(--sp-md);
  }

  &__notes {
    display: flex;
    flex-wrap: wrap;
    gap: var(--sp-xs) var(--sp-lg);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__note {
    display: flex;
    align-items: center;
    gap: var(--sp-xs);
    font-size: var(--fs-sm);
    color: var(--base-sub-color);

    &--warn::before,
    &--fail::before {
      content: '';
      flex: none;
      width: var(--sp-md);
      height: var(--sp-md);
      border-radius: 50%;
    }

    &--warn::before {
      background: var(--base-warning);
    }

    &--fail::before {
      background: var(--base-red);
    }
  }

  &__footer,
  &__empty {
    margin: 0;
    font-size: var(--fs-sm);
    color: var(--base-sub-color);
  }
}
</style>
