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

    <SearchView
      v-model:workerCode="workerCode"
      v-model:workerName="workerName"
      v-model:dateStart="dateStart"
      v-model:dateEnd="dateEnd"
      v-model:goldFilter="goldFilter"
      class="mt-3"
      @search="onSearch"
    />

    <JobSelectTable
      v-if="jobs.length > 0"
      :jobs="jobs"
      v-model:selectionMap="selectionMap"
      :editingSlipId="editingId ? Number(editingId) : null"
      class="mt-3"
    />

    <div v-if="hasSelectedJobs" class="form-row two-col mt-3">
      <IssuedLinesSection
        v-model:lines="issuedLines"
        :baseSum="issuedBaseSum"
      />
      <ReturnedLinesSection
        v-model:lines="returnedLines"
        :baseSum="returnedBaseSum"
      />
    </div>

    <SummaryPanel
      v-if="hasSelectedJobs"
      v-model:lossPercent="lossPercent"
      v-model:pricePerGram="pricePerGram"
      v-model:remark="remark"
      :calc="calc"
      class="mt-3"
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

import PageHeaderGeneric from '@/components/generic/PageHeaderGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

import SearchView from './components/search-view.vue'
import JobSelectTable from './components/job-select-table.vue'
import IssuedLinesSection from './components/issued-lines-section.vue'
import ReturnedLinesSection from './components/returned-lines-section.vue'
import SummaryPanel from './components/summary-panel.vue'
import ManualView from './modal/manual-view.vue'

export default {
  name: 'GoldLossTangReport',

  components: {
    PageHeaderGeneric,
    ButtonGeneric,
    SearchView,
    JobSelectTable,
    IssuedLinesSection,
    ReturnedLinesSection,
    SummaryPanel,
    ManualView
  },

  data() {
    return {
      editingId: this.$route.params.id || null,
      isShowManual: false,

      workerCode: '',
      workerName: '',
      dateStart: null,
      dateEnd: null,
      goldFilter: [],

      jobs: [],
      selectionMap: {},

      issuedLines: [],
      returnedLines: [],

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

  computed: {
    selectedJobs() {
      return this.jobs.filter((j, idx) => {
        const key = `job-${idx}`
        if (!this.selectionMap[key]) return false
        if (!j.goldLossTangSlipId) return true
        return j.goldLossTangSlipId === Number(this.editingId)
      })
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
    }
  },

  methods: {
    async onSearch() {
      if (!this.workerCode) {
        warning(this.$t('view.production.goldLossTang.validationSelectWorker'))
        return
      }
      if (!this.dateStart || !this.dateEnd) {
        warning(this.$t('view.production.goldLossTang.validationSelectDate'))
        return
      }

      const store = useGoldLossTangStore()
      const res = await store.searchJobs({
        workerCode: this.workerCode,
        requestDateStart: formatISOString(this.dateStart),
        requestDateEnd: formatISOString(this.dateEnd),
        goldSize: this.goldFilter.length ? this.goldFilter : undefined
      })

      if (res) {
        this.jobs = Array.isArray(res) ? res : res.data || []
        this.selectionMap = {}
        this.issuedLines = []
        this.returnedLines = []
      }
    },

    onSave() {
      if (this.selectedJobs.length === 0 && this.issuedLines.length === 0) {
        warning(this.$t('view.production.goldLossTang.validationSelectJobs'))
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

      // โหลดงานก่อน (onSearch จะ reset issued/returned lines) แล้วค่อย prefill รายการเพิ่มเอง + selection
      await this.onSearch()

      this.issuedLines = (slip.issuedLines || []).map((l, i) => ({
        _id: `issued-${i}`,
        name: l.name || '',
        weight: l.weight != null ? String(l.weight) : ''
      }))
      this.returnedLines = (slip.returnedLines || []).map((l, i) => ({
        _id: `returned-${i}`,
        name: l.name || '',
        weight: l.weight != null ? String(l.weight) : ''
      }))

      const slipItems = slip.items || []
      const newMap = {}
      this.jobs.forEach((j, idx) => {
        const key = `job-${idx}`
        const match = slipItems.find(
          (si) => si.productionPlanId === j.productionPlanId && si.itemNo === j.itemNo
        )
        if (match) {
          newMap[key] = true
        }
      })
      this.selectionMap = newMap
    },

    async doSave() {
      const store = useGoldLossTangStore()

      const jobItems = this.selectedJobs.map((j) => ({
        productionPlanId: j.productionPlanId,
        itemNo: j.itemNo
      }))

      const issuedLinePayload = this.issuedLines
        .filter((l) => l.name || l.weight)
        .map((l) => ({ name: l.name, weight: parseFloat(l.weight) || 0 }))

      const returnedLinePayload = this.returnedLines
        .filter((l) => l.name || l.weight)
        .map((l) => ({ name: l.name, weight: parseFloat(l.weight) || 0 }))

      const payload = {
        workerCode: this.workerCode,
        workerName: this.workerName,
        requestDateStart: formatISOString(this.dateStart),
        requestDateEnd: formatISOString(this.dateEnd),
        lossPercent: parseFloat(this.lossPercent),
        pricePerGram: parseFloat(this.pricePerGram),
        remark: this.remark,
        items: jobItems,
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
          const builder = new GoldLossTangPdfBuilder(slipData)
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
