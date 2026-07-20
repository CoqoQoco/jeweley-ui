<template>
  <modal :showModal="isShow" @closeModal="$emit('closeModal')" width="1280px" :isShowActionPart="true">
    <template #title>
      <span class="title-text-lg px-3 pt-3 d-block">{{ $t('view.worker.workerDailyWages.btnPrintSuccess') }} — Gold Loss Slip</span>
    </template>
    <template #content>
      <div class="p-3">
        <div class="d-flex justify-content-between mb-3">
          <span class="title-text">{{ $t('view.worker.workerList.fieldCode') }}: {{ worker.code }} - {{ worker.nameTh }}</span>
          <span class="title-text mr-4">
            {{ $t('view.worker.workerDailyWages.fieldDateRange') }}: {{ formatDate(dateRange.requestDateStart) }} - {{ formatDate(dateRange.requestDateEnd) }}
          </span>
        </div>

        <div class="section-card mb-3">
          <div class="section-card-header-row">
            <h6>{{ $t('view.worker.goldLossSlipModal.colInclude') }} ({{ selectedItems.length }}/{{ availableItems.length }} {{ $t('common.field.quantity') }})</h6>
          </div>

          <!-- Table-derived filter bar -->
          <div class="items-filter-bar mb-3">
            <div class="items-filter-row">
              <div class="filter-field">
                <span class="title-text mr-2">{{ $t('view.worker.goldLossSlipModal.filterGoldTypeLabel') }}:</span>
                <MultiSelectGeneric
                  v-model="filterGoldTypes"
                  :options="tableGoldTypeOptions"
                  optionLabel="label"
                  optionValue="value"
                  :placeholder="$t('view.worker.goldLossSlipModal.filterGoldTypePlaceholder')"
                  :filter="true"
                  :showClear="true"
                  class="gold-type-multiselect"
                />
              </div>
              <div class="filter-checkbox">
                <CheckboxGeneric
                  v-model="hideZero"
                  :label="$t('view.worker.goldLossSlipModal.hideZeroLabel')"
                />
              </div>
            </div>
            <div class="filter-count-row">
              <span class="count-label">
                {{ $t('view.worker.goldLossSlipModal.selectCountLabel', {
                  selected: selectedInDisplayed,
                  displayed: displayedItems.length,
                  total: availableItems.length
                }) }}
              </span>
              <CheckboxGeneric
                :modelValue="allSelected"
                @update:modelValue="onSelectAll"
                :label="$t('view.worker.goldLossSlipModal.selectAll')"
              />
            </div>
          </div>

          <BaseDataTable
            :items="displayedItems"
            :totalRecords="displayedItems.length"
            :columns="tableColumns"
            :paginator="false"
            scrollHeight="280px"
            dataKey="_key"
          >
            <template #selectTemplate="{ data }">
              <CheckboxGeneric
                :modelValue="selectionMap[data._key]"
                @update:modelValue="onRowSelect(data._key, $event)"
              />
            </template>
            <template #woTextTemplate="{ data }">
              <span>{{ data.wo }}{{ data.woNumber ? ' - ' + data.woNumber : '' }}</span>
            </template>
            <template #goldTemplate="{ data }">
              <span>{{ [data.gold, data.goldSize].filter((v) => v).join(' - ') }}</span>
            </template>
            <template #weightLossActualTemplate="{ data }">
              <span
                :class="data.weightLossActual > 0 ? 'loss-positive' : data.weightLossActual < 0 ? 'loss-negative' : ''"
              >{{ fmtSign(data.weightLossActual) }}</span>
            </template>
            <template #goldLossPriceTemplate="{ data }">
              <span>{{ fmt2(data.goldLossPrice) }}</span>
            </template>
            <template #totalWagesTemplate="{ data }">
              <span :class="moneyOf(data) === 0 ? 'zero-price-hint' : ''">
                {{ fmt2(data.totalWages) }}
                <span v-if="moneyOf(data) === 0" class="zero-price-badge">{{ $t('view.worker.goldLossSlipModal.moneyZeroHint') }}</span>
              </span>
            </template>
          </BaseDataTable>
        </div>

        <div class="section-card mb-3">
          <pageTitle :title="$t('view.worker.goldLossSlipModal.returnTitle')" :isShowBtnClose="false" />

          <div v-if="goldReturnItems.length === 0" class="text-muted text-center py-2" style="font-size:0.9rem">
            {{ $t('common.label.noData') }}
          </div>

          <div v-else>
            <!-- eslint-disable-next-line vue/no-restricted-syntax -->
            <!-- editable form table — rows contain inline inputs (InputTextGeneric + AutoCompleteGeneric) -->
            <table class="return-table w-100">
              <thead>
                <tr>
                  <th>{{ $t('view.worker.goldLossSlipModal.returnGoldTypeLabel') }}</th>
                  <th>{{ $t('view.worker.goldLossSlipModal.colGoldSize') }}</th>
                  <th>{{ $t('common.field.weight') }} (g)</th>
                  <th>{{ $t('view.worker.workerDailyWages.colGoldLossPrice') }}</th>
                  <th class="text-right">{{ $t('common.field.total') }}</th>
                  <th class="text-center">{{ $t('view.worker.goldLossSlipModal.colCountInCalc') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, idx) in goldReturnItems" :key="idx">
                  <td>
                    <span class="title-text">{{ row.gold || '-' }}</span>
                  </td>
                  <td>
                    <span class="title-text">{{ row.goldSize }}</span>
                  </td>
                  <td>
                    <InputTextGeneric
                      type="number"
                      step="0.01"
                      :min="0"
                      v-model.number="row.weight"
                    />
                  </td>
                  <td>
                    <AutoCompleteGeneric
                      :modelValue="getPriceDisplayValue(row)"
                      :useStaticList="true"
                      :staticOptions="getPriceOptions(row.goldSize)"
                      optionLabel="label"
                      :forceSelection="false"
                      :placeholder="$t('view.worker.workerDailyWages.colGoldLossPrice')"
                      customClass="price-ac"
                      @update:modelValue="onPriceChange(idx, $event)"
                    />
                  </td>
                  <td class="text-right">
                    <span>{{ fmt2(getRowAmount(row)) }}</span>
                  </td>
                  <td class="text-center">
                    <CheckboxGeneric v-model="row.countInCalc" />
                  </td>
                </tr>
              </tbody>
            </table>

            <div class="d-flex justify-content-end mt-2">
              <span class="summary-label mr-3">{{ $t('common.field.total') }} ({{ $t('common.field.price') }}):</span>
              <span class="summary-value">{{ fmt2(totalGoldReturnAmount) }}</span>
            </div>
          </div>
        </div>

        <div v-if="typeSummaries.length > 0" class="section-card mb-3">
          <h6>{{ $t('view.worker.goldLossSlipModal.typeSummaryTitle') }}</h6>
          <BaseDataTable
            :items="typeSummaries"
            :totalRecords="typeSummaries.length"
            :columns="typeSummaryColumns"
            :paginator="false"
            scrollHeight="auto"
          >
            <template #totalWeightLossTemplate="{ data }">
              <span :class="data.totalWeightLoss > 0 ? 'loss-positive' : data.totalWeightLoss < 0 ? 'loss-negative' : ''">
                {{ fmtSign(data.totalWeightLoss) }}
              </span>
            </template>
            <template #totalMoneyLossTemplate="{ data }">
              <span>{{ fmt2(data.totalMoneyLoss) }}</span>
            </template>
            <template #returnWeightTemplate="{ data }">
              <span>{{ fmt2(data.returnWeight) }}</span>
            </template>
            <template #returnAmountTemplate="{ data }">
              <span class="text-teal">{{ fmt2(data.returnAmount) }}</span>
            </template>
            <template #netWeightTemplate="{ data }">
              <span :class="data.netWeight > 0 ? 'loss-positive' : data.netWeight < 0 ? 'loss-negative' : ''">
                {{ fmtSign(data.netWeight) }}
              </span>
            </template>
            <template #netAmountTemplate="{ data }">
              <span :class="data.netAmount < 0 ? 'loss-negative' : data.netAmount > 0 ? 'loss-positive' : ''">
                {{ fmt2(data.netAmount) }}
              </span>
            </template>
          </BaseDataTable>
        </div>

        <div class="section-card mb-3">
          <h6>{{ $t('common.field.total') }}</h6>
          <div class="summary-row">
            <span class="summary-label">{{ $t('view.worker.workerDailyWages.colTotalWages') }}</span>
            <span class="summary-value">{{ fmt2(totalMoneyLoss) }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">(+) {{ $t('view.worker.goldLossSlipList.colGoldReturn') }}</span>
            <span class="summary-value text-teal">+ {{ fmt2(totalGoldReturnAmount) }}</span>
          </div>
          <hr class="my-2" />
          <div class="summary-row">
            <span class="summary-label fw-bold">{{ $t('common.btn.confirm') }}</span>
            <span class="summary-value" :class="netPayAmount < 0 ? 'loss-negative' : netPayAmount > 0 ? 'loss-positive' : ''">
              {{ fmtSign(netPayAmount) }}
            </span>
          </div>
          <hr class="my-2" />
          <div class="summary-row">
            <span class="summary-label">{{ $t('view.worker.workerDailyWages.colWeightLossActual') }}</span>
            <span class="summary-value" :class="totalWeightLoss > 0 ? 'loss-positive' : totalWeightLoss < 0 ? 'loss-negative' : ''">
              {{ fmtSign(totalWeightLoss) }}
            </span>
          </div>
          <div class="summary-row">
            <span class="summary-label">{{ $t('view.worker.goldLossSlipList.colGoldReturn') }}</span>
            <span class="summary-value">{{ fmt2(totalReturnWeight) }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">{{ $t('view.worker.goldLossSlipList.colNetWeightLoss') }}</span>
            <span
              class="summary-value"
              :class="netWeightLoss > 0 ? 'loss-positive' : netWeightLoss < 0 ? 'loss-negative' : ''"
            >{{ fmtSign(netWeightLoss) }}</span>
          </div>
        </div>

        <div>
          <TextareaGeneric
            v-model="remark"
            :placeholder="$t('common.field.remark')"
            :rows="2"
          />
        </div>
      </div>
    </template>

    <template #action>
      <ButtonGeneric
        variant="main"
        icon="bi-save"
        :label="`${$t('common.btn.save')} & ${$t('common.btn.export')}`"
        @click="onSave"
      />
      <ButtonGeneric
        variant="outline"
        :label="$t('common.btn.cancel')"
        class="ml-2"
        @click="$emit('closeModal')"
      />
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import dayjs from 'dayjs'
import api from '@/axios/axios-helper.js'
import { formatISOString } from '@/services/utils/dayjs'
import { warning, success } from '@/services/alert/sweetAlerts.js'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import AutoCompleteGeneric from '@/components/prime-vue/AutoCompleteGeneric.vue'
import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'
import CheckboxGeneric from '@/components/prime-vue/CheckboxGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import TextareaGeneric from '@/components/generic/TextareaGeneric.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))
const pageTitle = defineAsyncComponent(() => import('@/components/custom/page-title.vue'))

export default {
  name: 'GoldLossSlipModal',

  components: { modal, BaseDataTable, AutoCompleteGeneric, MultiSelectGeneric, CheckboxGeneric, ButtonGeneric, pageTitle, InputTextGeneric, TextareaGeneric },

  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    worker: {
      type: Object,
      default: () => ({})
    },
    dateRange: {
      type: Object,
      default: () => ({})
    },
    items: {
      type: Array,
      default: () => []
    }
  },

  emits: ['closeModal', 'saved'],

  data() {
    return {
      goldReturnItems: [],
      remark: '',
      filterGoldTypes: [],
      hideZero: true,
      selectionMap: {}
    }
  },

  computed: {
    tableColumns() {
      return [
        { field: 'select', header: '', minWidth: '50px', width: '50px', sortable: false },
        { field: 'woText', header: this.$t('view.worker.workerDailyWages.colWoText'), minWidth: '120px' },
        { field: 'jobDate', header: this.$t('view.worker.workerDailyWages.colJobDate'), minWidth: '100px', format: 'date' },
        { field: 'gold', header: this.$t('view.worker.workerDailyWages.colDescription'), minWidth: '140px', sortable: false },
        { field: 'lossPercent', header: this.$t('view.worker.workerDailyWages.colLossPercent'), minWidth: '80px', align: 'right', format: 'number' },
        { field: 'weightLossActual', header: this.$t('view.worker.workerDailyWages.colWeightLossActual'), minWidth: '110px', align: 'right' },
        { field: 'goldLossPrice', header: this.$t('view.worker.workerDailyWages.colGoldLossPrice'), minWidth: '120px', align: 'right' },
        { field: 'totalWages', header: this.$t('view.worker.workerDailyWages.colTotalWages'), minWidth: '110px', align: 'right', sortable: false }
      ]
    },

    typeSummaryColumns() {
      return [
        { field: 'goldType', header: this.$t('view.worker.goldLossSlipModal.colGoldType'), minWidth: '120px', sortable: false },
        { field: 'totalWeightLoss', header: this.$t('view.worker.goldLossSlipModal.colWeightLoss'), minWidth: '110px', align: 'right', sortable: false },
        { field: 'totalMoneyLoss', header: this.$t('view.worker.goldLossSlipModal.colMoneyLoss'), minWidth: '110px', align: 'right', sortable: false },
        { field: 'returnWeight', header: this.$t('view.worker.goldLossSlipModal.colReturnWeight'), minWidth: '100px', align: 'right', sortable: false },
        { field: 'returnAmount', header: this.$t('view.worker.goldLossSlipModal.colReturnAmount'), minWidth: '110px', align: 'right', sortable: false },
        { field: 'netWeight', header: this.$t('view.worker.goldLossSlipModal.colNetWeight'), minWidth: '100px', align: 'right', sortable: false },
        { field: 'netAmount', header: this.$t('view.worker.goldLossSlipModal.colNetAmount'), minWidth: '110px', align: 'right', sortable: false }
      ]
    },

    availableItems() {
      return this.items.filter((i) => !i.workerGoldLossSlipId)
    },

    availableItemsWithSelection() {
      return this.availableItems.map((item, idx) => ({
        ...item,
        _key: this.getItemKey(item, idx)
      }))
    },

    tableGoldTypeOptions() {
      const seen = new Set()
      const result = []
      for (const item of this.availableItems) {
        const combined = [item.gold, item.goldSize].filter(Boolean).join(' - ')
        if (combined && !seen.has(combined)) {
          seen.add(combined)
          result.push({ label: combined, value: combined })
        }
      }
      return result
    },

    displayedItems() {
      return this.availableItemsWithSelection.filter((item) => {
        const combined = [item.gold, item.goldSize].filter(Boolean).join(' - ')
        if (this.filterGoldTypes.length > 0 && !this.filterGoldTypes.includes(combined)) {
          return false
        }
        if (this.hideZero && this.moneyOf(item) === 0) {
          return false
        }
        return true
      })
    },

    selectedInDisplayed() {
      return this.displayedItems.filter((item) => !!this.selectionMap[item._key]).length
    },

    selectedItems() {
      return this.availableItems.filter((item, idx) => {
        const key = this.getItemKey(item, idx)
        return !!this.selectionMap[key]
      })
    },

    allSelected() {
      if (this.displayedItems.length === 0) return false
      return this.displayedItems.every((item) => !!this.selectionMap[item._key])
    },

    totalWeightLoss() {
      return this.selectedItems.reduce((sum, i) => sum + (i.weightLossActual || 0), 0)
    },

    totalReturnWeight() {
      return this.goldReturnItems
        .filter((r) => r.countInCalc !== false)
        .reduce((sum, r) => sum + (r.weight || 0), 0)
    },

    netWeightLoss() {
      return this.totalWeightLoss + this.totalReturnWeight
    },

    totalMoneyLoss() {
      return this.selectedItems.reduce((sum, i) => sum + (i.totalWages || 0), 0)
    },

    totalGoldReturnAmount() {
      return this.goldReturnItems
        .filter((r) => r.countInCalc !== false)
        .reduce((sum, r) => sum + this.getRowAmount(r), 0)
    },

    netPayAmount() {
      return this.totalMoneyLoss + this.totalGoldReturnAmount
    },

    typeSummaries() {
      const purityKey = (gold, goldSize) => {
        if (gold === 'SV') return 'SILVER'
        return [gold, goldSize].filter((v) => v).join(' - ') || gold || goldSize || ''
      }
      const map = {}

      for (const item of this.selectedItems) {
        const key = purityKey(item.gold, item.goldSize)
        if (!map[key]) {
          map[key] = { goldType: key, totalWeightLoss: 0, totalMoneyLoss: 0, returnWeight: 0, returnAmount: 0 }
        }
        map[key].totalWeightLoss += item.weightLossActual || 0
        map[key].totalMoneyLoss += this.moneyOf(item)
      }

      for (const row of this.goldReturnItems.filter((r) => r.countInCalc !== false)) {
        const key = purityKey(row.gold, row.goldSize)
        if (!map[key]) {
          map[key] = { goldType: key, totalWeightLoss: 0, totalMoneyLoss: 0, returnWeight: 0, returnAmount: 0 }
        }
        map[key].returnWeight += row.weight || 0
        map[key].returnAmount += this.getRowAmount(row)
      }

      return Object.values(map).map((entry) => ({
        ...entry,
        netWeight: entry.totalWeightLoss - entry.returnWeight,
        netAmount: entry.totalMoneyLoss + entry.returnAmount
      }))
    }
  },

  watch: {
    isShow(val) {
      if (val) {
        this.remark = ''
        this.filterGoldTypes = []
        this.hideZero = true
        this.initSelectionMap()
        if (this.goldReturnItems.length === 0) {
          this.initReturnRowsFromItems()
        }
      }
    },

    items() {
      if (this.isShow) {
        this.initSelectionMap()
      }
    },

    filterGoldTypes() {
      this.syncSelectionToDisplayed(true)
    },

    hideZero() {
      this.syncSelectionToDisplayed(false)
    }
  },

  methods: {
    getItemKey(item, idx) {
      return `row-${idx}`
    },

    formatDate(val) {
      if (!val) return ''
      return dayjs(val).format('DD/MM/YYYY')
    },

    fmtSign(val) {
      if (val == null) return '0.00'
      const v = Number(val)
      const abs = Math.abs(v).toFixed(2)
      if (v > 0) return `+${abs}`
      if (v < 0) return `-${abs}`
      return abs
    },

    fmt2(val) {
      if (val == null) return '0.00'
      return Number(val).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    },

    moneyOf(item) {
      return Number(item.totalWages || 0)
    },

    initSelectionMap() {
      const map = {}
      this.availableItems.forEach((item, idx) => {
        const key = this.getItemKey(item, idx)
        map[key] = this.moneyOf(item) !== 0
      })
      this.selectionMap = map
    },

    syncSelectionToDisplayed(autoSelectDisplayed) {
      const displayedKeys = new Set(this.displayedItems.map((item) => item._key))
      const map = { ...this.selectionMap }
      this.availableItemsWithSelection.forEach((item) => {
        if (!displayedKeys.has(item._key)) {
          map[item._key] = false
        } else if (autoSelectDisplayed) {
          map[item._key] = true
        }
      })
      this.selectionMap = map
    },

    onRowSelect(key, val) {
      this.selectionMap = { ...this.selectionMap, [key]: val }
    },

    onSelectAll(val) {
      const map = { ...this.selectionMap }
      this.displayedItems.forEach((item) => {
        map[item._key] = val
      })
      this.selectionMap = map
    },

    getPriceOptions(goldSize) {
      const prices = this.availableItems
        .filter((i) => i.goldSize === goldSize)
        .map((i) => i.goldLossPrice ?? i.wages)
        .filter((p) => p != null)
      const distinct = [...new Set(prices)]
      return distinct.map((p) => ({ label: this.fmt2(p), value: p }))
    },

    getPriceDisplayValue(row) {
      if (row.pricePerGram == null || row.pricePerGram === 0) return null
      return { label: this.fmt2(row.pricePerGram), value: row.pricePerGram }
    },

    onPriceChange(idx, val) {
      const row = this.goldReturnItems[idx]
      if (val == null) {
        row.pricePerGram = 0
      } else if (typeof val === 'object' && val !== null) {
        row.pricePerGram = Number(val.value) || 0
      } else {
        const parsed = parseFloat(String(val).replace(/,/g, ''))
        row.pricePerGram = isNaN(parsed) ? 0 : parsed
      }
    },

    getRowAmount(row) {
      return (row.weight || 0) * (row.pricePerGram || 0)
    },

    initReturnRowsFromItems() {
      const groups = new Map()
      for (const it of this.availableItems) {
        if (!it.goldSize) continue
        const key = `${it.gold || ''}|${it.goldSize}`
        if (!groups.has(key)) {
          groups.set(key, { gold: it.gold, goldSize: it.goldSize, price: it.goldLossPrice ?? it.wages ?? 0 })
        }
      }
      this.goldReturnItems = Array.from(groups.values()).map((meta) => ({
        goldSize: meta.goldSize,
        gold: meta.gold,
        weight: 0,
        pricePerGram: meta.price,
        amount: 0,
        countInCalc: true
      }))
    },

    async onSave() {
      if (this.selectedItems.length === 0) {
        warning(this.$t('common.label.noData'), this.$t('common.field.quantity'))
        return
      }

      const payload = {
        workerCode: this.worker.code,
        workerName: this.worker.nameTh,
        requestDateStart: formatISOString(this.dateRange.requestDateStart),
        requestDateEnd: formatISOString(this.dateRange.requestDateEnd),
        remark: this.remark,
        goldReturnItems: this.goldReturnItems.map((r) => ({
          goldSize: r.goldSize,
          gold: r.gold,
          weight: r.weight || 0,
          pricePerGram: r.pricePerGram || 0,
          amount: this.getRowAmount(r),
          countInCalc: r.countInCalc
        })),
        items: this.selectedItems.map((i) => ({
          productionPlanStatusDetailId: i.id,
          productionPlanId: i.productionPlanId,
          itemNo: i.itemNo,
          wo: i.wo,
          woNumber: i.woNumber,
          productNumber: i.productNumber,
          productName: i.productName,
          gold: i.gold,
          goldSize: i.goldSize,
          jobDate: i.jobDate,
          goldQtySend: i.goldQtySend,
          goldWeightSend: i.goldWeightSend,
          goldQtyCheck: i.goldQtyCheck,
          goldWeightCheck: i.goldWeightCheck,
          lossPercent: i.lossPercent,
          weightLossAllowed: i.weightLossAllowed,
          weightLossActual: i.weightLossActual,
          goldLossPrice: i.goldLossPrice ?? 0,
          moneyDiff: i.totalWages
        }))
      }

      const res = await api.jewelry.post('Worker/CreateGoldLossSlip', payload)
      if (res) {
        success(this.$t('common.btn.save') + ' — ' + (res.documentNo || ''))
        this.$emit('saved', { slip: res })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';

.section-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--sp-lg);
  background: var(--color-card-bg) !important;

  h6 {
    color: var(--base-font-color);
    font-weight: 600;
    padding-bottom: var(--sp-sm);
    border-bottom: 1px solid #f0f0f0;
    margin-bottom: var(--sp-md);
    background: transparent !important;
  }
}

.section-card-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--sp-sm);
  margin-bottom: var(--sp-md);
  padding-bottom: var(--sp-sm);
  border-bottom: 1px solid #f0f0f0;

  h6 {
    border-bottom: none;
    padding-bottom: 0;
    margin-bottom: 0;
    color: var(--base-font-color);
    font-weight: 600;
  }
}

.items-filter-bar {
  background: var(--color-highlight-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--sp-sm) var(--sp-md);
}

.items-filter-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--sp-md);
}

.filter-field {
  display: flex;
  align-items: center;
  gap: var(--sp-xs);
}

.filter-checkbox {
  display: flex;
  align-items: center;
}

.gold-type-multiselect {
  min-width: 220px;
  max-width: 320px;
}

.filter-count-row {
  margin-top: var(--sp-xs);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-md);
}

.count-label {
  font-size: var(--fs-sm);
  color: var(--base-font-color);
  font-weight: 500;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.summary-label {
  font-weight: 500;
  color: var(--base-font-color);
}

.summary-value {
  font-weight: 600;
}

.text-teal {
  color: var(--base-green);
}

.loss-positive {
  color: var(--base-green);
  font-weight: 600;
}

.loss-negative {
  color: var(--base-red);
  font-weight: 600;
}

.zero-price-hint {
  color: var(--base-red);
  opacity: 0.7;
}

.zero-price-badge {
  font-size: var(--fs-sm);
  background: var(--color-highlight-bg);
  color: var(--base-font-color);
  border-radius: var(--radius-sm);
  padding: 1px var(--sp-xs);
  margin-left: var(--sp-xs);
  font-weight: 600;
  border: 1px solid var(--base-font-color);
  opacity: 0.8;
}

.return-table {
  border-collapse: collapse;
  font-size: var(--fs-base);

  th, td {
    padding: 6px 8px;
    border-bottom: 1px solid #f0f0f0;
    vertical-align: middle;
  }

  th {
    font-weight: 600;
    color: var(--base-font-color);
    border-bottom: 2px solid var(--color-border);
    white-space: nowrap;
  }

  .text-right {
    text-align: right;
  }

  .text-center {
    text-align: center;
  }
}

:deep(.price-ac) {
  width: 100%;

  .p-autocomplete-input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    font-size: var(--fs-base);
  }
}
</style>
