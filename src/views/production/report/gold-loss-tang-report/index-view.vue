<template>
  <div class="app-container">
    <PageHeaderGeneric
      :title="editingId ? $t('view.production.goldLossTang.editTitle') : $t('view.production.goldLossTang.title')"
      backRoute="gold-loss-tang-report"
    >
      <template #actions>
        <ButtonGeneric
          variant="outline"
          icon="bi-journal-text"
          :label="$t('view.production.goldLossTang.manual')"
          @click="isShowManual = true"
        />
      </template>
    </PageHeaderGeneric>

    <ManualView :isShow="isShowManual" @closeModal="isShowManual = false" />

    <SearchConditionBar
      :workerCode="workerCode"
      :workerName="workerName"
      :dateStart="dateStart"
      :dateEnd="dateEnd"
      :goldFilter="goldFilter"
      class="mt-4"
      @open-search="openSearchModal"
    />

    <SearchJobsModal
      :isShow="isShowSearchModal"
      :workerCode="workerCode"
      :workerName="workerName"
      :dateStart="dateStart"
      :dateEnd="dateEnd"
      :goldFilter="goldFilter"
      @closeModal="isShowSearchModal = false"
      @search="onSearchConfirm"
    />

    <JobSelectTable
      :jobs="allJobs"
      v-model:selectedJobs="selectedJobs"
      :editingSlipId="editingId ? Number(editingId) : null"
      class="mt-4"
      @add-manual-job="onAddManualJob"
      @update-manual-job="onUpdateManualJob"
      @remove-manual-job="onRemoveManualJob"
    />

    <div class="form-row two-col mt-4">
      <IssuedLinesSection
        v-model:lines="issuedLines"
        :baseSum="issuedBaseSum"
        :nameOptions="issuedNameOptions"
      />
      <ReturnedLinesSection
        v-model:lines="returnedLines"
        :baseSum="returnedBaseSum"
        :nameOptions="returnedNameOptions"
      />
    </div>

    <SummaryPanel
      v-model:lossPercent="lossPercent"
      v-model:pricePerGram="pricePerGram"
      v-model:remark="remark"
      :calc="calc"
      :canSave="canSave"
      class="mt-4"
      @save="onSave"
    />
  </div>
</template>

<script>
import { useGoldLossTangStore } from '@/stores/modules/api/plan/gold-loss-tang-store.js'
import { calcGoldLossTang } from '@/services/utils/gold-loss-tang-calc.js'
import { formatISOString } from '@/services/utils/dayjs.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { success, warning } from '@/services/alert/sweetAlerts.js'
import { GoldLossTangPdfBuilder } from '@/services/helper/pdf/gold-loss/gold-loss-tang-pdf-builder.js'
import { ISSUED_SEED, RETURNED_SEED, mergeOptions } from './gold-loss-line-options.js'

import PageHeaderGeneric from '@/components/generic/PageHeaderGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

import SearchConditionBar from './components/search-condition-bar.vue'
import JobSelectTable from './components/job-select-table.vue'
import IssuedLinesSection from './components/issued-lines-section.vue'
import ReturnedLinesSection from './components/returned-lines-section.vue'
import SummaryPanel from './components/summary-panel.vue'
import ManualView from './modal/manual-view.vue'
import SearchJobsModal from './modal/search-jobs-modal.vue'

export default {
  name: 'GoldLossTangReport',

  components: {
    PageHeaderGeneric,
    ButtonGeneric,
    SearchConditionBar,
    JobSelectTable,
    IssuedLinesSection,
    ReturnedLinesSection,
    SummaryPanel,
    ManualView,
    SearchJobsModal
  },

  data() {
    return {
      editingId: this.$route.params.id || null,
      isShowManual: false,
      isShowSearchModal: false,
      hasSearched: false,

      workerCode: '',
      workerName: '',
      dateStart: null,
      dateEnd: null,
      goldFilter: [],

      jobs: [],
      selectedJobs: [],
      manualJobs: [],
      manualJobSeq: 0,

      issuedLines: [],
      returnedLines: [],
      issuedNameOptions: [],
      returnedNameOptions: [],

      lossPercent: '',
      pricePerGram: '',
      remark: ''
    }
  },

  async created() {
    if (this.editingId) {
      await this.loadEditData()
    }
  },

  mounted() {
    this.loadLineOptions()
  },

  computed: {
    allJobs() {
      return [...this.jobs, ...this.manualJobs]
    },

    hasSelectedJobs() {
      return this.selectedJobs.length > 0 || this.issuedLines.length > 0 || this.returnedLines.length > 0
    },

    issuedBaseSum() {
      return this.selectedJobs.reduce((sum, j) => sum + (parseFloat(j.goldWeightSend) || 0), 0)
    },

    returnedBaseSum() {
      return this.selectedJobs.reduce((sum, j) => sum + (parseFloat(j.goldWeightCheck) || 0), 0)
    },

    calc() {
      return calcGoldLossTang(
        this.selectedJobs,
        this.issuedLines,
        this.returnedLines,
        this.lossPercent,
        this.pricePerGram
      )
    },

    canSave() {
      return (
        this.hasSelectedJobs &&
        !!this.lossPercent &&
        !!this.pricePerGram
      )
    }
  },

  methods: {
    async loadLineOptions() {
      const store = useGoldLossTangStore()
      const res = await store.getLineOptions()
      this.issuedNameOptions = mergeOptions(ISSUED_SEED, res?.issued)
      this.returnedNameOptions = mergeOptions(RETURNED_SEED, res?.returned)
    },

    openSearchModal() {
      this.isShowSearchModal = true
    },

    onSearchConfirm(payload) {
      const hasPendingData =
        this.jobs.length > 0 ||
        this.issuedLines.length > 0 ||
        this.returnedLines.length > 0 ||
        this.selectedJobs.length > 0

      if (hasPendingData) {
        confirmThenSubmit(
          this.$t('view.production.goldLossTang.resetSearchWarning'),
          this.$t('view.production.goldLossTang.resetSearchTitle'),
          () => {
            this.doSearch(payload)
          }
        )
      } else {
        this.doSearch(payload)
      }
    },

    async doSearch(payload) {
      this.workerCode = payload.workerCode
      this.workerName = payload.workerName
      this.dateStart = payload.dateStart
      this.dateEnd = payload.dateEnd
      this.goldFilter = payload.goldFilter || []

      const store = useGoldLossTangStore()
      const res = await store.searchJobs({
        workerCode: this.workerCode,
        requestDateStart: formatISOString(this.dateStart),
        requestDateEnd: formatISOString(this.dateEnd),
        goldSize: this.goldFilter.length ? this.goldFilter : undefined
      })

      const selectedManualUids = new Set(
        this.selectedJobs.filter((j) => j._manual).map((j) => j._uid)
      )
      this.selectedJobs = this.manualJobs.filter((j) => selectedManualUids.has(j._uid))
      this.issuedLines = []
      this.returnedLines = []

      const rawJobs = res ? (Array.isArray(res) ? res : res.data || []) : []
      this.jobs = rawJobs.map((j) => ({ ...j, _uid: `${j.productionPlanId}-${j.itemNo}` }))

      this.hasSearched = true
    },

    onAddManualJob(formData) {
      const uid = `manual-${this.manualJobSeq++}`
      const row = { ...formData, _uid: uid, _manual: true, productionPlanId: null, itemNo: null }
      this.manualJobs = [...this.manualJobs, row]
      this.selectedJobs = [...this.selectedJobs, row]
    },

    onUpdateManualJob(formData) {
      const { _uid } = formData
      this.manualJobs = this.manualJobs.map((j) => (j._uid === _uid ? { ...j, ...formData } : j))
      this.selectedJobs = this.selectedJobs.map((j) => (j._uid === _uid ? { ...j, ...formData } : j))
    },

    onRemoveManualJob(uid) {
      this.manualJobs = this.manualJobs.filter((j) => j._uid !== uid)
      this.selectedJobs = this.selectedJobs.filter((j) => j._uid !== uid)
    },

    validateManualJobs() {
      const manualSelected = this.selectedJobs.filter((j) => j._manual)
      for (let i = 0; i < manualSelected.length; i++) {
        const j = manualSelected[i]
        const sendNum = parseFloat(j.goldWeightSend)
        const checkNum = parseFloat(j.goldWeightCheck)
        const hasValidWeights =
          j.goldWeightSend !== '' && j.goldWeightSend != null && !isNaN(sendNum) && sendNum >= 0 &&
          j.goldWeightCheck !== '' && j.goldWeightCheck != null && !isNaN(checkNum) && checkNum >= 0

        if (!j.wo || !j.jobDate || !j.gold || !j.goldSize || !hasValidWeights) {
          warning(this.$t('view.production.goldLossTang.validationManualJobIncompleteRow', { n: i + 1 }))
          return false
        }
      }
      return true
    },

    onSave() {
      if (this.selectedJobs.length === 0 && this.issuedLines.length === 0) {
        warning(this.$t('view.production.goldLossTang.validationSelectJobs'))
        return
      }
      if (!this.validateManualJobs()) {
        return
      }
      if (!this.lossPercent) {
        warning(this.$t('view.production.goldLossTang.validationLossPercent'))
        return
      }
      if (!this.pricePerGram) {
        warning(this.$t('view.production.goldLossTang.validationPricePerGram'))
        return
      }

      const workerDisplay = `${this.workerCode} - ${this.workerName}`
      confirmThenSubmit(
        workerDisplay,
        this.$t('view.production.goldLossTang.confirmSave'),
        async () => {
          await this.doSave()
        }
      )
    },

    async loadEditData() {
      const store = useGoldLossTangStore()
      const res = await store.getSlip(Number(this.editingId))
      if (!res) return
      const slip = res.data || res

      this.workerCode = slip.workerCode || ''
      this.workerName = slip.workerName || ''
      this.dateStart = slip.requestDateStart ? new Date(slip.requestDateStart) : null
      this.dateEnd = slip.requestDateEnd ? new Date(slip.requestDateEnd) : null
      this.lossPercent = slip.lossPercent != null ? String(slip.lossPercent) : ''
      this.pricePerGram = slip.pricePerGram != null ? String(slip.pricePerGram) : ''
      this.remark = slip.remark || ''

      await this.doSearch({
        workerCode: this.workerCode,
        workerName: this.workerName,
        dateStart: this.dateStart,
        dateEnd: this.dateEnd,
        goldFilter: []
      })

      this.issuedLines = (slip.issuedLines || []).map((l, i) => ({
        _id: `issued-${i}`,
        name: l.name || '',
        weight: l.weight != null ? String(l.weight) : '',
        countInCalc: l.countInCalc !== false
      }))
      this.returnedLines = (slip.returnedLines || []).map((l, i) => ({
        _id: `returned-${i}`,
        name: l.name || '',
        weight: l.weight != null ? String(l.weight) : '',
        countInCalc: l.countInCalc !== false
      }))

      const slipItems = slip.items || []
      const normalItems = slipItems.filter((si) => si.productionPlanId != null)
      const manualItems = slipItems.filter((si) => si.productionPlanId == null)

      this.manualJobs = manualItems.map((si, i) => ({
        _uid: `manual-edit-${i}`,
        _manual: true,
        productionPlanId: null,
        itemNo: null,
        wo: si.wo || '',
        woNumber: si.woNumber != null ? si.woNumber : null,
        productNumber: si.productNumber || null,
        gold: si.gold || '',
        goldSize: si.goldSize || '',
        jobDate: si.jobDate ? new Date(si.jobDate) : null,
        goldWeightSend: si.goldWeightSend != null ? Number(si.goldWeightSend) : 0,
        goldWeightCheck: si.goldWeightCheck != null ? Number(si.goldWeightCheck) : 0,
        goldQtyCheck: si.goldQtyCheck != null ? Number(si.goldQtyCheck) : null
      }))

      const matchedNormal = this.jobs.filter((j) =>
        normalItems.some(
          (si) => si.productionPlanId === j.productionPlanId && si.itemNo === j.itemNo
        )
      )
      this.selectedJobs = [...matchedNormal, ...this.manualJobs]
    },

    async doSave() {
      const store = useGoldLossTangStore()

      const jobItems = this.selectedJobs
        .filter((j) => !j._manual)
        .map((j) => ({
          productionPlanId: j.productionPlanId,
          itemNo: j.itemNo
        }))

      const manualItems = this.selectedJobs
        .filter((j) => j._manual)
        .map((j) => ({
          productionPlanId: null,
          itemNo: null,
          wo: j.wo,
          woNumber: j.woNumber,
          productNumber: j.productNumber,
          gold: j.gold,
          goldSize: j.goldSize,
          jobDate: j.jobDate ? formatISOString(j.jobDate) : null,
          goldWeightSend: parseFloat(j.goldWeightSend) || 0,
          goldWeightCheck: parseFloat(j.goldWeightCheck) || 0,
          goldQtyCheck: j.goldQtyCheck != null ? parseFloat(j.goldQtyCheck) : null
        }))

      const issuedLinePayload = this.issuedLines
        .filter((l) => l.name || l.weight)
        .map((l) => ({ name: l.name, weight: parseFloat(l.weight) || 0, countInCalc: l.countInCalc !== false }))

      const returnedLinePayload = this.returnedLines
        .filter((l) => l.name || l.weight)
        .map((l) => ({ name: l.name, weight: parseFloat(l.weight) || 0, countInCalc: l.countInCalc !== false }))

      const payload = {
        workerCode: this.workerCode,
        workerName: this.workerName,
        requestDateStart: formatISOString(this.dateStart),
        requestDateEnd: formatISOString(this.dateEnd),
        lossPercent: parseFloat(this.lossPercent),
        pricePerGram: parseFloat(this.pricePerGram),
        remark: this.remark,
        items: [...jobItems, ...manualItems],
        issuedLines: issuedLinePayload,
        returnedLines: returnedLinePayload
      }

      if (this.editingId) {
        const res = await store.updateSlip({ id: Number(this.editingId), ...payload })
        if (res) {
          success(this.$t('view.production.goldLossTang.updateSuccess'))
          this.$router.push({ name: 'gold-loss-tang-report' })
        }
      } else {
        const res = await store.createSlip(payload)
        if (res) {
          success(this.$t('view.production.goldLossTang.saveSuccess'))
          const slipData = res.data || res
          const builder = new GoldLossTangPdfBuilder(slipData, { includeJobs: true })
          builder.generatePDF().open()
          this.$router.push({ name: 'gold-loss-tang-report' })
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.app-container {
  padding: var(--sp-lg);
}

.form-row {
  display: grid;
  gap: var(--sp-md);

  &.two-col {
    grid-template-columns: 1fr 1fr;

    @media (max-width: 1024px) {
      grid-template-columns: 1fr;
    }
  }
}
</style>
