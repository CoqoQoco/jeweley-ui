<template>
  <div ref="root" class="app-container rfid-bind" @keydown="onRootKeydown" @click="onRootClick">
    <PageTitle
      :title="$t('view.stock.rfidBind.title')"
      :description="$t('view.stock.rfidBind.subtitle')"
      icon="bi-tag"
      :filled="true"
      :isShowBtnClose="false"
    />

    <BindReaderBar
      :state="tray.state.value"
      :deviceName="tray.deviceName.value"
      :activeKind="tray.activeKind.value"
      :errorKey="tray.errorKey.value"
      :connectionLost="tray.connectionLost.value"
      :elapsedSec="tray.elapsedSec.value"
      :busy="tray.busy.value"
      :live="tray.live.value"
      :canStop="tray.canStop.value"
      :paused="modalOpen"
      @start="onStartReader"
      @stop="onStopReader"
      @disconnect="tray.disconnect()"
    />

    <div class="bind-toolbar">
      <ButtonGeneric variant="main" icon="bi-plus-lg" :label="$t('view.stock.rfidBind.toolbar.addToQueue')" @click="openModal" />

      <FormFieldGeneric class="bind-toolbar__scan" inputId="rfid-bind-scan" :label="$t('view.stock.rfidBind.toolbar.scanLabel')">
        <InputTextGeneric
          id="rfid-bind-scan"
          v-model="scanText"
          icon="bi-upc"
          :bgInput="true"
          :placeholder="$t('view.stock.rfidBind.toolbar.scanPlaceholder')"
          autocomplete="off"
          @keydown="onScanKeydown"
        />
      </FormFieldGeneric>

      <div class="bind-toolbar__progress">
        <span>{{ $t('view.stock.rfidBind.toolbar.progress', { bound: boundCount, total: queue.length }) }}</span>
        <div class="progress-track" role="progressbar" :aria-valuenow="progressPct" aria-valuemin="0" aria-valuemax="100">
          <div class="progress-fill" :style="{ width: `${progressPct}%` }"></div>
        </div>
      </div>

      <CheckboxGeneric v-model="autoBind" :label="$t('view.stock.rfidBind.toolbar.autoBind')" @update:modelValue="onAutoBindChange" />
      <ButtonGeneric
        variant="plain"
        :icon="muted ? 'bi-volume-mute' : 'bi-volume-up'"
        :title="muted ? $t('view.stock.rfidBind.toolbar.unmute') : $t('view.stock.rfidBind.toolbar.mute')"
        :aria-label="muted ? $t('view.stock.rfidBind.toolbar.unmute') : $t('view.stock.rfidBind.toolbar.mute')"
        @click="toggleMute"
      />
    </div>

    <div v-if="restoreCount > 0" class="restore-box" role="status">
      <i class="bi bi-arrow-counterclockwise" aria-hidden="true"></i>
      <div class="restore-box__text">
        <span class="restore-box__title">{{ $t('view.stock.rfidBind.queue.restoreTitle', { count: restoreCount }) }}</span>
        <span>{{ $t('view.stock.rfidBind.queue.restoreHint') }}</span>
      </div>
      <ButtonGeneric variant="main" icon="bi-arrow-counterclockwise" :label="$t('view.stock.rfidBind.queue.restore', { count: restoreCount })" @click="restoreQueue" />
      <ButtonGeneric variant="outline" icon="bi-trash" :label="$t('view.stock.rfidBind.queue.discard')" @click="discardStored" />
    </div>

    <div class="bind-main">
      <div class="bind-main__left">
        <BindQueuePanel
          v-model:hideBound="hideBound"
          :queue="queue"
          :currentIndex="currentIndex"
          @select="onSelectQueue"
          @remove="removeFromQueue"
          @clear="confirmClear"
        />
        <RecentBoundList :items="recent" :busy="undoing" @undo="undoLast" />
      </div>

      <CurrentPieceCard
        class="bind-main__right"
        :unit="currentUnit"
        :index="Math.max(currentIndex, 0)"
        :kind="statusKind"
        :viaScan="viaScan"
        :notice="notice"
        :message="bindError"
        :epc="statusEpc"
        :count="decision.candidates.length"
        :otherNo="otherNo"
        :autoBind="autoBind"
        :lots="pickLots"
        :pickIndex="pickIndex"
        :unsupported="tray.state.value === 'unsupported'"
        :readerLost="tray.connectionLost.value"
        :busy="tray.busy.value"
        :supportedKinds="tray.supportedKinds"
        @add="openModal"
        @clear="confirmClear"
        @bind="onManualBind"
        @retry="retryBind"
        @connect="onConnect"
        @pick="choosePick"
        @pickCancel="cancelPick"
      />
    </div>

    <QueueAddModal :isShow="modalOpen" :existingQueue="queue" @closeModal="closeModal" @confirm="onQueueConfirm" @addUnits="onAddUnits" />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { useTrayReader } from '@/composables/useTrayReader.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { storage } from '@/services/storage.js'
import { useStockRfidApiStore } from '@/stores/modules/api/stock/rfid-api.js'
import { useAuthStore } from '@/stores/modules/authen/authen-store.js'

import PageTitle from '@/components/custom/page-title.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import CheckboxGeneric from '@/components/prime-vue/CheckboxGeneric.vue'
import BindReaderBar from './components/bind-reader-bar.vue'
import BindQueuePanel from './components/bind-queue-panel.vue'
import RecentBoundList from './components/recent-bound-list.vue'
import CurrentPieceCard from './components/current-piece-card.vue'
import QueueAddModal from './components/queue-add-modal.vue'
import { chunkEpcs } from '../rfid-basket/rfid-basket-logic.js'
import { playSuccess, playWarning, unlockAudio } from './rfid-bind-sound.js'
import {
  CHECK_BACKOFF_MS,
  RESTORE_CHUNK,
  classifyCheckResult,
  epcsOutsideBackoff,
  countBound,
  decideLabelResult,
  decideUnit,
  epcsNeedingCheck,
  evaluateTray,
  firstUnboundIndex,
  indexAfterBound,
  indexAfterMerge,
  isUnitBound,
  labelNumber,
  manualBindEpc,
  markBound,
  markUnbound,
  blockEpcsOnTray,
  SETTLE_MS,
  settleBlockEpcs,
  mergePlanUnits,
  mergeQueue,
  nextStreak,
  onTrayEpcs,
  parsePlanCode,
  parseStoredQueue,
  productName,
  pruneTray,
  queueStorageKey,
  releaseBlocked,
  shouldBlockAfterRecheck,
  unitOfLot,
  updateTray
} from './rfid-bind-logic.js'

const TICK_MS = 400
const FLASH_MS = 1500
const RECENT_MAX = 5
const AUTO_KEY = 'rfid-bind-auto'
const MUTE_KEY = 'rfid-bind-muted'

const IDLE_DECISION = { status: 'done', candidates: [], bindEpc: null, other: null }

export default {
  name: 'RfidBindIndexView',

  components: { PageTitle, ButtonGeneric, InputTextGeneric, FormFieldGeneric, CheckboxGeneric, BindReaderBar, BindQueuePanel, RecentBoundList, CurrentPieceCard, QueueAddModal },

  setup() {
    const rfidStore = useStockRfidApiStore()
    const authStore = useAuthStore()
    const tray = useTrayReader()
    return { rfidStore, authStore, tray }
  },

  data() {
    return {
      queue: [],
      currentIndex: -1,
      hideBound: false,
      recent: [],
      scanText: '',
      autoBind: storage.getItem(AUTO_KEY, '1') !== '0',
      muted: storage.getItem(MUTE_KEY, '0') === '1',
      modalOpen: false,
      decision: IDLE_DECISION,
      inFlight: false,
      undoing: false,
      bindError: '',
      notice: null,
      viaScan: false,
      pickLots: [],
      pickIndex: 0,
      restoreCount: 0,
      userStopped: false
    }
  },

  computed: {
    currentUnit() {
      return this.queue[this.currentIndex] || null
    },

    boundCount() {
      return countBound(this.queue)
    },

    progressPct() {
      return this.queue.length ? Math.round((this.boundCount / this.queue.length) * 100) : 0
    },

    storageKey() {
      return queueStorageKey(this.authStore.user?.username)
    },

    readerReady() {
      return this.tray.state.value === 'reading'
    },

    otherNo() {
      const piece = this.decision.other
      return piece ? piece.stockNumberOrigin || piece.stockNumber || '' : ''
    },

    statusEpc() {
      if (this.decision.candidates.length === 1) return this.decision.candidates[0]
      const current = this.currentUnit
      return current && current.epc ? current.epc : ''
    },

    // กล่องสถานะที่จะแสดง (เรียงตามความสำคัญ)
    statusKind() {
      if (!this.queue.length) return 'empty'
      if (this.pickLots.length) return 'pick'
      if (!this.currentUnit) return 'done'
      if (isUnitBound(this.currentUnit)) return 'boundInfo'
      if (!this.tray.live.value || !this.readerReady) return this.tray.state.value === 'connected' ? 'waiting' : 'readerOff'
      if (this.modalOpen) return 'paused'
      if (this.bindError) return 'error'
      if (this.inFlight) return 'binding'
      return this.decision.status === 'done' ? 'waiting' : this.decision.status
    },

  },

  watch: {
    queue: {
      deep: true,
      handler(list) {
        if (list.length) storage.setJSON(this.storageKey, list)
        else storage.removeItem(this.storageKey)
      }
    },

    'tray.state.value'(state, previous) {
      if (state === 'connected' && !this.userStopped) this.tray.start()
      if (state === 'reading') {
        this.$nextTick(() => this.focusScan())
        this.armSettle()
      }
      if (state === 'disconnected' || state === 'error') this.userStopped = false
      if (previous === 'reading' && state !== 'reading') this.refresh(false)
    },

    statusKind(kind, previous) {
      if (kind === previous) return
      if (['multi', 'taken', 'sold', 'error'].includes(kind)) this.sound(playWarning)
    }
  },

  created() {
    this.trayMap = new Map()
    this.known = new Map()
    this.blocked = new Set()
    this.ignore = new Set()
    this.pending = new Set()
    this.checkBackoff = new Map()
    this.settleUntil = 0
    this.settlePending = false
    this.streak = { epc: '', count: 0 }
    this.tickTimer = null
    this.flashTimer = null
    this.failedEpc = ''
    this.noticeTimer = null
    this.tray.setBatchHandler((batch) => this.applyBatch(batch))
    const stored = parseStoredQueue(storage.getJSON(this.storageKey, []))
    this.restoreCount = stored.length
  },

  mounted() {
    if (this.tray.supportedKinds.length) this.tray.autoReconnect()
    this.tickTimer = setInterval(() => this.refresh(false), TICK_MS)
    this.focusScan()
    this.openFromQuery()
  },

  beforeUnmount() {
    clearInterval(this.tickTimer)
    clearTimeout(this.flashTimer)
    clearTimeout(this.noticeTimer)
  },

  methods: {
    // ---------- เครื่องอ่าน ----------
    async onConnect(kind) {
      unlockAudio()
      this.userStopped = false
      await this.tray.connect(kind)
      this.$nextTick(() => this.focusScan())
    },

    onStartReader() {
      unlockAudio()
      this.userStopped = false
      this.tray.start()
      this.$nextTick(() => this.focusScan())
    },

    onStopReader() {
      this.userStopped = true
      this.tray.stop()
    },

    applyBatch(batch) {
      const settled = settleBlockEpcs(batch, this.settleUntil, Date.now())
      if (settled.length) this.blocked = blockEpcsOnTray(this.blocked, settled)
      this.trayMap = updateTray(this.trayMap, batch)
      this.refresh(true)
    },

    // ---------- ตัดสินใจจากถาด ----------
    refresh(isBatch) {
      const now = Date.now()
      this.trayMap = pruneTray(this.trayMap, now)
      this.blocked = releaseBlocked(this.blocked, this.trayMap, now)
      const onTray = onTrayEpcs(this.trayMap, now)
      const toCheck = epcsOutsideBackoff(epcsNeedingCheck(onTray, this.known, this.pending, now), this.checkBackoff, now)
      if (toCheck.length) this.checkEpcs(toCheck)

      const bindingOn = this.readerReady && !this.modalOpen && !this.bindError
      const current = this.currentUnit && !isUnitBound(this.currentUnit) ? this.currentUnit : null
      const candidates = evaluateTray({
        onTray,
        known: this.known,
        blocked: this.blocked,
        current,
        inFlight: this.inFlight,
        streak: this.streak,
        autoBind: false,
        ignore: this.ignore
      }).candidates
      this.streak = nextStreak(this.streak, candidates, isBatch)
      const next = evaluateTray({
        onTray,
        known: this.known,
        blocked: this.blocked,
        current,
        inFlight: this.inFlight,
        streak: this.streak,
        autoBind: this.autoBind && bindingOn,
        ignore: this.ignore
      })
      if (!this.sameDecision(this.decision, next)) this.decision = next
      if (next.bindEpc) this.doBind(next.bindEpc)
    },

    sameDecision(a, b) {
      return (
        a.status === b.status &&
        a.bindEpc === b.bindEpc &&
        a.otherEpc === b.otherEpc &&
        a.candidates.length === b.candidates.length &&
        a.candidates.every((epc, i) => epc === b.candidates[i])
      )
    },

    async checkEpcs(epcs) {
      for (const chunk of chunkEpcs(epcs)) {
        chunk.forEach((epc) => this.pending.add(epc))
        const result = await this.rfidStore.fetchByEpcs(chunk, { skipLoading: true, skipError: true }).catch(() => null)
        chunk.forEach((epc) => this.pending.delete(epc))
        if (!result) {
          chunk.forEach((epc) => this.checkBackoff.set(epc, Date.now() + CHECK_BACKOFF_MS))
          continue
        }
        for (const [epc, entry] of classifyCheckResult(result, chunk, Date.now())) {
          if (shouldBlockAfterRecheck(this.known.get(epc), entry)) this.blocked.add(epc)
          this.known.set(epc, entry)
        }
      }
      this.refresh(false)
    },

    // ---------- ผูก / เลิกผูก ----------
    async doBind(epc) {
      const unit = this.currentUnit
      if (!unit || this.inFlight || isUnitBound(unit)) return
      this.inFlight = true
      this.bindError = ''
      let failure = ''
      // ต้องจับ error เอง: หน้านี้แสดงข้อผิดพลาดในกล่องสถานะ (inline) ไม่ใช้ popup ที่ดึงโฟกัสออกจากช่องยิงป้าย
      try {
        await this.rfidStore.fetchBind(
          { epc, stockNumber: unit.stockNumber, productCode: unit.productCode, unitId: unit.unitId },
          { skipError: true, skipLoading: true }
        )
      } catch (error) {
        failure = error?.response?.data?.message || this.$t('view.stock.rfidBind.status.errorUnknown')
      }
      this.inFlight = false
      this.streak = { epc: '', count: 0 }
      if (failure) {
        this.blocked.add(epc)
        this.known.delete(epc)
        this.bindError = failure
        this.failedEpc = epc
        this.refresh(false)
        return
      }
      this.onBound(unit, epc)
    },

    onBound(unit, epc) {
      const boundDate = new Date().toISOString()
      this.known.set(epc, { state: 'bound', session: true, checkedAt: Date.now(), piece: { stockNumber: unit.stockNumber, stockNumberOrigin: unit.stockNumberOrigin, unitId: unit.unitId } })
      this.ignore.add(epc)
      this.queue = markBound(this.queue, unit.unitId, epc, boundDate)
      const no = labelNumber(unit)
      this.recent = [
        { unitId: unit.unitId, no, unitText: unitOfLot(unit), epc, time: dayjs().format('HH:mm:ss'), stockNumber: unit.stockNumber, productCode: unit.productCode },
        ...this.recent
      ].slice(0, RECENT_MAX)
      this.sound(playSuccess)
      this.flash(this.$t('view.stock.rfidBind.status.justBound', { no }), 'success')
      this.viaScan = false
      this.currentIndex = indexAfterBound(this.queue, this.currentIndex, unit.unitId)
      this.refresh(false)
      this.$nextTick(() => this.focusScan())
    },

    onManualBind() {
      unlockAudio()
      const epc = manualBindEpc(this.decision, this.inFlight)
      if (epc) this.doBind(epc)
      this.$nextTick(() => this.focusScan())
    },

    retryBind() {
      const epc = this.failedEpc
      this.bindError = ''
      if (!epc) return
      this.blocked.delete(epc)
      this.doBind(epc)
      this.$nextTick(() => this.focusScan())
    },

    async undoLast() {
      const last = this.recent[0]
      if (!last || this.undoing) return
      this.undoing = true
      let failed = false
      try {
        await this.rfidStore.fetchUnbind(
          { epc: last.epc, unitId: last.unitId, stockNumber: last.stockNumber, productCode: last.productCode },
          { skipError: true, skipLoading: true }
        )
      } catch {
        failed = true
      }
      this.undoing = false
      if (failed) {
        this.sound(playWarning)
        this.flash(this.$t('view.stock.rfidBind.status.errorUnknown'), 'warn')
        return
      }
      this.known.set(last.epc, { state: 'free' })
      this.ignore.delete(last.epc)
      this.blocked.add(last.epc)
      this.queue = markUnbound(this.queue, last.unitId)
      this.recent = this.recent.slice(1)
      const index = this.queue.findIndex((unit) => unit.unitId === last.unitId)
      if (index >= 0) this.currentIndex = index
      this.bindError = ''
      this.viaScan = false
      this.setNotice(this.$t('view.stock.rfidBind.recent.undone', { no: last.no }), 'info')
      this.refresh(false)
      this.focusScan()
    },

    // ---------- ยิงป้าย ----------
    async onScanKeydown(event) {
      if (this.pickLots.length) {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault()
          const step = event.key === 'ArrowDown' ? 1 : -1
          this.pickIndex = (this.pickIndex + step + this.pickLots.length) % this.pickLots.length
        } else if (event.key === 'Enter') {
          event.preventDefault()
          this.choosePick(this.pickIndex)
        } else if (event.key === 'Escape') {
          event.preventDefault()
          this.cancelPick()
        }
        return
      }
      if (event.key !== 'Enter') return
      event.preventDefault()
      unlockAudio()
      const code = this.scanText.trim()
      if (code) {
        this.scanText = ''
        const plan = parsePlanCode(code)
        if (plan) await this.resolvePlan(plan)
        else await this.resolveScan(code)
      } else {
        this.onManualBind()
      }
    },

    // มาจากหน้าตรวจคลัง (?stock=<เลขที่ผลิต>&productCode=<ล็อต>) — ใส่ชิ้นนั้นเข้าคิวแล้วกระโดดไป
    async openFromQuery() {
      const code = String(this.$route.query.stock || '').trim()
      if (!code) return
      const productCode = String(this.$route.query.productCode || '')
      this.$router.replace({ query: {} })
      if (this.restoreCount > 0) await this.restoreQueue()
      const res = await this.rfidStore.fetchResolveLabel(code)
      const items = (res?.items || []).filter((unit) => !productCode || unit.productCode === productCode)
      const result = decideLabelResult(items, this.queue)
      if (result.kind === 'notFound' || result.kind === 'allBound') {
        this.sound(playWarning)
        this.setNotice(this.$t(`view.stock.rfidBind.scan.${result.kind}`, { code }), 'warn')
      } else if (result.kind === 'multi') {
        this.pickLots = result.lots.map((lot) => ({
          key: lot.key,
          unit: lot.unit,
          line: this.$t('view.stock.rfidBind.scan.pickLine', {
            no: labelNumber(lot.unit),
            name: productName(lot.unit, this.$i18n.locale),
            count: lot.freeCount
          })
        }))
        this.pickIndex = 0
      } else {
        const previousId = this.currentUnit?.unitId
        this.applyScanResult(result, code)
        this.guardTrayOnSwitch(previousId)
        this.settlePending = true
        this.armSettle()
      }
      this.focusScan()
    },

    // เริ่มนับช่วง settle เมื่อเครื่องอ่านเริ่มอ่านจริง (แท็กที่ค้างบนถาดจากหน้าก่อนจะถูกบล็อก)
    armSettle() {
      if (!this.settlePending || this.tray.state.value !== 'reading') return
      this.settlePending = false
      this.settleUntil = Date.now() + SETTLE_MS
    },

    async resolveScan(code) {
      const res = await this.rfidStore.fetchResolveLabel(code)
      const result = decideLabelResult(res?.items || [], this.queue)
      if (result.kind === 'notFound') {
        this.sound(playWarning)
        this.setNotice(this.$t('view.stock.rfidBind.scan.notFound', { code }), 'warn')
      } else if (result.kind === 'allBound') {
        this.sound(playWarning)
        this.setNotice(this.$t('view.stock.rfidBind.scan.allBound', { code }), 'warn')
      } else if (result.kind === 'multi') {
        this.pickLots = result.lots.map((lot) => ({
          key: lot.key,
          unit: lot.unit,
          line: this.$t('view.stock.rfidBind.scan.pickLine', {
            no: labelNumber(lot.unit),
            name: productName(lot.unit, this.$i18n.locale),
            count: lot.freeCount
          })
        }))
        this.pickIndex = 0
      } else {
        this.applyScanResult(result, code)
      }
      this.focusScan()
    },

    async resolvePlan(plan) {
      const res = await this.rfidStore.fetchListUnits({ wo: plan.wo, woNumber: plan.woNumber, tagStatus: 'unbound', skip: 0, take: 500 })
      const units = res?.items || []
      if (!units.length) {
        this.sound(playWarning)
        this.setNotice(this.$t('view.stock.rfidBind.scan.planEmpty', { plan: plan.label }), 'warn')
      } else {
        const previousId = this.currentUnit?.unitId
        const merged = mergePlanUnits(this.queue, units)
        this.queue = merged.queue
        if (merged.firstIndex >= 0) this.currentIndex = merged.firstIndex
        this.restoreCount = 0
        this.viaScan = true
        this.bindError = ''
        this.guardTrayOnSwitch(previousId)
        const truncated = res.total > units.length
        this.setNotice(
          truncated
            ? this.$t('view.stock.rfidBind.scan.planTruncated', { plan: plan.label, count: units.length, total: res.total })
            : this.$t('view.stock.rfidBind.scan.planAdded', { plan: plan.label, count: merged.added }),
          truncated ? 'warn' : 'info',
          truncated ? 8000 : 4000
        )
        this.refresh(false)
      }
      this.focusScan()
    },

    // ชิ้นปัจจุบันเปลี่ยนโดยไม่ได้ยิงป้ายชิ้น/คลิกคิว: แท็กที่วางอยู่บนถาดแล้วห้ามไหลไปผูกกับชิ้นใหม่
    guardTrayOnSwitch(previousId) {
      if (this.currentUnit?.unitId === previousId) return
      this.streak = { epc: '', count: 0 }
      this.decision = IDLE_DECISION
      this.blocked = blockEpcsOnTray(this.blocked, onTrayEpcs(this.trayMap, Date.now()))
    },

    // เพิ่มทั้งแผนจาก modal (modal ไม่ปิด)
    onAddUnits(units) {
      const previousId = this.currentUnit?.unitId
      const merged = mergePlanUnits(this.queue, units)
      this.queue = merged.queue
      this.restoreCount = 0
      if (this.currentIndex < 0 || !this.currentUnit || isUnitBound(this.currentUnit)) this.currentIndex = firstUnboundIndex(this.queue)
      this.guardTrayOnSwitch(previousId)
      this.refresh(false)
    },

    applyScanResult(result, code) {
      if (result.kind === 'append') {
        this.queue = [...this.queue, result.unit]
        this.currentIndex = this.queue.length - 1
        this.setNotice(this.$t('view.stock.rfidBind.scan.appended', { code }), 'info')
      } else {
        this.currentIndex = this.queue.findIndex((unit) => unit.unitId === result.unitId)
        this.setNotice(this.$t('view.stock.rfidBind.scan.jumped', { code }), 'info')
      }
      this.viaScan = true
      this.bindError = ''
      this.refresh(false)
    },

    choosePick(index) {
      const lot = this.pickLots[index]
      if (!lot) return
      this.pickLots = []
      this.applyScanResult(decideUnit(lot.unit, this.queue), labelNumber(lot.unit))
      this.focusScan()
    },

    cancelPick() {
      this.pickLots = []
      this.focusScan()
    },

    // ---------- คิว ----------
    onSelectQueue(index) {
      this.currentIndex = index
      this.viaScan = false
      this.bindError = ''
      this.refresh(false)
      this.focusScan()
    },

    removeFromQueue(index) {
      const wasCurrent = index === this.currentIndex
      this.queue = this.queue.filter((_, i) => i !== index)
      if (!this.queue.length) this.currentIndex = -1
      else if (wasCurrent) this.currentIndex = firstUnboundIndex(this.queue)
      else if (index < this.currentIndex) this.currentIndex -= 1
      this.focusScan()
    },

    confirmClear() {
      confirmThenSubmit(
        this.$t('view.stock.rfidBind.queue.clearDialog.message', { count: this.queue.length }),
        this.$t('view.stock.rfidBind.queue.clearDialog.title'),
        () => {
          this.queue = []
          this.currentIndex = -1
          this.bindError = ''
          this.focusScan()
        },
        {
          confirmText: this.$t('view.stock.rfidBind.queue.clearDialog.confirm'),
          cancelText: this.$t('view.stock.rfidBind.queue.clearDialog.cancel')
        }
      )
    },

    openModal() {
      this.modalOpen = true
    },

    closeModal() {
      this.modalOpen = false
      this.$nextTick(() => this.focusScan())
    },

    onQueueConfirm({ units, mode }) {
      const previousId = this.currentUnit?.unitId
      const before = mode === 'replace' ? 0 : this.queue.length
      this.queue = mergeQueue(this.queue, units, mode)
      const added = this.queue.length - before
      this.restoreCount = 0
      this.currentIndex = indexAfterMerge(this.queue, previousId, mode)
      this.guardTrayOnSwitch(previousId)
      this.bindError = ''
      this.viaScan = false
      this.modalOpen = false
      this.setNotice(this.$t('view.stock.rfidBind.modal.queued', { count: added }), 'info')
      this.$nextTick(() => this.focusScan())
    },

    // ---------- กู้คิว ----------
    async restoreQueue() {
      const stored = parseStoredQueue(storage.getJSON(this.storageKey, []))
      const fresh = new Map()
      let failed = false
      for (const ids of chunkEpcs(stored.map((unit) => unit.unitId), RESTORE_CHUNK)) {
        // ต้องจับ error เอง: ตรวจไม่สำเร็จให้คงคิวเดิมไว้ทั้งก้อนแล้วแจ้งในหน้า (ไม่ใช้ popup)
        try {
          const res = await this.rfidStore.fetchListUnits(
            { unitIds: ids, tagStatus: 'all', skip: 0, take: RESTORE_CHUNK },
            { skipLoading: true, skipError: true }
          )
          for (const unit of res?.items || []) fresh.set(unit.unitId, unit)
        } catch {
          failed = true
          break
        }
      }
      const previousId = this.currentUnit?.unitId
      this.restoreCount = 0
      if (!failed) this.recent = this.recent.filter((item) => !fresh.has(item.unitId) || fresh.get(item.unitId).epc)
      if (failed) {
        this.queue = stored
        this.currentIndex = firstUnboundIndex(stored)
        this.setNotice(this.$t('view.stock.rfidBind.queue.restoreCheckFailed', { count: stored.length }), 'warn', 8000)
      } else {
        const merged = stored.filter((unit) => fresh.has(unit.unitId)).map((unit) => fresh.get(unit.unitId))
        this.queue = merged
        this.currentIndex = firstUnboundIndex(merged)
        this.setNotice(this.$t('view.stock.rfidBind.queue.restored', { count: merged.length, removed: stored.length - merged.length }), 'info')
      }
      this.guardTrayOnSwitch(previousId)
      this.focusScan()
    },

    discardStored() {
      storage.removeItem(this.storageKey)
      this.restoreCount = 0
      this.focusScan()
    },

    // ---------- เบ็ดเตล็ด ----------
    onAutoBindChange(value) {
      storage.setItem(AUTO_KEY, value ? '1' : '0')
      this.focusScan()
    },

    toggleMute() {
      this.muted = !this.muted
      storage.setItem(MUTE_KEY, this.muted ? '1' : '0')
      unlockAudio()
      this.focusScan()
    },

    sound(play) {
      if (!this.muted) play()
    },

    flash(text, kind) {
      this.setNotice(text, kind, FLASH_MS)
    },

    setNotice(text, kind, ms = 4000) {
      this.notice = { text, kind }
      clearTimeout(this.noticeTimer)
      this.noticeTimer = setTimeout(() => {
        this.notice = null
      }, ms)
    },

    focusScan() {
      if (this.modalOpen) return
      const input = document.getElementById('rfid-bind-scan')
      if (input && document.activeElement !== input) input.focus()
    },

    // คืนโฟกัสช่องยิงป้ายเมื่อคลิกพื้นที่ว่าง (ไม่แย่งโฟกัสจากปุ่ม/ช่องกรอกอื่น)
    onRootClick(event) {
      if (event.target.closest('button, a, input, select, textarea, [role="option"], [tabindex]')) return
      this.focusScan()
    },

    onRootKeydown(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z' && !this.modalOpen && !this.scanText) {
        event.preventDefault()
        this.undoLast()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.rfid-bind {
  display: flex;
  flex-direction: column;
  gap: var(--sp-md);
}

.bind-toolbar {
  display: flex;
  align-items: flex-end;
  gap: var(--sp-lg);
  flex-wrap: wrap;
  padding: var(--sp-md) var(--sp-lg);
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.bind-toolbar__scan {
  flex: 1 1 300px;
}

.bind-toolbar__progress {
  display: flex;
  flex-direction: column;
  gap: var(--sp-xs);
  min-width: 200px;
  font-size: var(--fs-base);
  font-weight: 600;
}

.progress-track {
  height: var(--sp-sm);
  background: var(--status-closed-bg);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--base-green);
}

.restore-box {
  display: flex;
  align-items: center;
  gap: var(--sp-lg);
  flex-wrap: wrap;
  padding: var(--sp-md) var(--sp-lg);
  border: 1px solid var(--base-warning);
  background: var(--status-open-bg);
  border-radius: var(--radius-md);

  > i {
    font-size: var(--fs-xl);
  }
}

.restore-box__text {
  display: flex;
  flex-direction: column;
  flex: 1 1 240px;
  font-size: var(--fs-base);
}

.restore-box__title {
  font-weight: 700;
}

.bind-main {
  display: flex;
  gap: var(--sp-md);
  align-items: flex-start;
  flex-wrap: wrap;
}

.bind-main__left {
  flex: 1 1 340px;
  max-width: 440px;
  display: flex;
  flex-direction: column;
  gap: var(--sp-md);
  min-width: 0;
}

.bind-main__right {
  flex: 999 1 520px;
  min-width: 0;
}

@media (prefers-reduced-motion: reduce) {
  .rfid-bind * {
    animation: none !important;
    transition: none !important;
  }
}
</style>
