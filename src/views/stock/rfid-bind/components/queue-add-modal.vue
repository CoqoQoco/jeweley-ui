<template>
  <modal :showModal="isShow" width="96%" :fitHeight="true" :isShowActionPart="true" headerVariant="main" @closeModal="$emit('closeModal')">
    <template #title>
      <span class="title-text-lg d-block"><i class="bi bi-plus-square"></i> {{ $t('view.stock.rfidBind.modal.title') }}</span>
    </template>

    <template #content>
      <ToggleGroupGeneric class="qa-view-toggle" :modelValue="view" :options="viewOptions" :ariaLabel="$t('view.stock.rfidBind.modal.title')" @update:modelValue="onViewChange" />

      <div v-if="view === 'plan'" class="qa-plan">
        <form class="qa-plan__form" novalidate @submit.prevent="searchPlans">
          <FormFieldGeneric class="qa-plan__search" :label="$t('view.stock.rfidBind.plan.search')">
            <InputTextGeneric id="rfid-bind-plan-search" v-model="planSearch" :trim="true" :bgInput="true" icon="bi-search" :placeholder="$t('view.stock.rfidBind.plan.searchPlaceholder')" />
          </FormFieldGeneric>
          <FormFieldGeneric :label="$t('view.stock.rfidBind.modal.receiptDate')">
            <ToggleGroupGeneric :modelValue="planRange" :options="planRangeOptions" :ariaLabel="$t('view.stock.rfidBind.modal.receiptDate')" @update:modelValue="onPlanRangeChange" />
          </FormFieldGeneric>
          <ButtonGeneric variant="green" icon="bi-search" type="submit" :label="$t('common.btn.search')" />
        </form>

        <p v-if="planNotice" :class="['qa-plan__notice', { 'qa-plan__notice--warn': planNoticeWarn }]" role="status"><i :class="['bi', planNoticeWarn ? 'bi-exclamation-triangle-fill' : 'bi-check-circle-fill']" aria-hidden="true"></i> {{ planNotice }}</p>

        <BaseDataTable
          :items="plans"
          :totalRecords="planTotal"
          :columns="planColumns"
          dataKey="woText"
          :loading="planLoading"
          :perPage="planTake"
          :rowsPerPageOptions="[20, 50, 100]"
          :showGridlines="false"
          scrollHeight="calc(100vh - 428px)"
          @page="onPlanPage"
          @row-click="onPlanRowClick"
        >
          <template #imageTemplate="{ data }">
            <imagePreview v-if="data.imagePath" :imageName="data.imagePath" type="STOCK-PRODUCT" :width="32" :height="32" />
          </template>
          <template #woTextTemplate="{ data }"><span class="qa-stock__no">{{ data.woText }}</span></template>
          <template #nameTemplate="{ data }">{{ planName(data) }}</template>
          <template #lastReceiptDateTemplate="{ data }">{{ formatPlanDate(data.lastReceiptDate) }}</template>
          <template #unboundTemplate="{ data }">{{ data.unboundUnits }} / {{ data.totalUnits }}</template>
          <template #actionTemplate="{ data }">
            <span v-if="planQueued(data)" class="qa-tag qa-tag--bound">{{ $t('view.stock.rfidBind.plan.inQueue') }}</span>
            <ButtonGeneric v-else variant="main" icon="bi-plus-lg" :label="$t('view.stock.rfidBind.plan.addToQueue')" :disabled="planLoading" @click="addPlan(data, $event)" />
            <ButtonGeneric
              class="ml-2"
              variant="outline"
              icon="bi-list-ul"
              :title="$t('view.stock.rfidBind.plan.viewPieces')"
              :aria-label="$t('view.stock.rfidBind.plan.viewPieces')"
              :disabled="planLoading"
              @click="onPlanRowClick({ data }, $event)"
            />
          </template>
          <template #empty>
            <div class="qa-empty">
              <i class="bi bi-search" aria-hidden="true"></i>
              <p class="qa-empty__title">{{ $t('view.stock.rfidBind.plan.noResult') }}</p>
              <p class="qa-empty__hint">{{ $t('view.stock.rfidBind.plan.noResultHint') }}</p>
            </div>
          </template>
        </BaseDataTable>
      </div>

      <form v-else class="qa-form" novalidate @submit.prevent="onSearch">
        <div class="qa-grid">
          <FormFieldGeneric :label="$t('view.stock.rfidBind.modal.stockNumber')">
            <InputTextGeneric id="rfid-bind-filter-stock" v-model="filters.stockNumber" :trim="true" :bgInput="true" icon="bi-upc" />
          </FormFieldGeneric>
          <FormFieldGeneric :label="$t('view.stock.rfidBind.modal.stockNumberOrigin')">
            <InputTextGeneric v-model="filters.stockNumberOrigin" :trim="true" :bgInput="true" />
          </FormFieldGeneric>
          <FormFieldGeneric :label="$t('view.stock.rfidBind.modal.productNumber')">
            <InputTextGeneric v-model="filters.productNumber" :trim="true" :bgInput="true" />
          </FormFieldGeneric>
          <FormFieldGeneric :label="$t('view.stock.rfidBind.modal.location')">
            <MultiSelectGeneric v-model="filters.locationCodes" :options="locationOptions" optionLabel="label" optionValue="value" :placeholder="$t('view.stock.rfidBind.modal.allLocations')" :showClear="true" />
          </FormFieldGeneric>
          <FormFieldGeneric class="qa-grid__wide" :label="$t('view.stock.rfidBind.modal.receiptDate')">
            <ToggleGroupGeneric :modelValue="filters.receiptPreset" :options="receiptOptions" :ariaLabel="$t('view.stock.rfidBind.modal.receiptDate')" @update:modelValue="onToggleFilter('receiptPreset', $event)" />
          </FormFieldGeneric>
          <FormFieldGeneric class="qa-grid__wide" :label="$t('view.stock.rfidBind.modal.tagStatus')">
            <ToggleGroupGeneric :modelValue="filters.tagStatus" :options="tagOptions" :ariaLabel="$t('view.stock.rfidBind.modal.tagStatus')" @update:modelValue="onToggleFilter('tagStatus', $event)" />
          </FormFieldGeneric>
        </div>

        <div v-if="showMore" class="qa-grid qa-grid--more">
          <FormFieldGeneric :label="$t('view.stock.rfidBind.modal.productType')">
            <MultiSelectGeneric v-model="filters.productType" :options="masterStore.productType" optionLabel="description" optionValue="code" :showClear="true" />
          </FormFieldGeneric>
          <FormFieldGeneric :label="$t('view.stock.rfidBind.modal.gold')">
            <MultiSelectGeneric v-model="filters.gold" :options="masterStore.gold" optionLabel="nameTh" optionValue="nameEn" :showClear="true" />
          </FormFieldGeneric>
          <FormFieldGeneric :label="$t('view.stock.rfidBind.modal.goldSize')">
            <MultiSelectGeneric v-model="filters.goldSize" :options="masterStore.goldSize" optionLabel="nameTh" optionValue="nameEn" :showClear="true" />
          </FormFieldGeneric>
          <FormFieldGeneric :label="$t('view.stock.rfidBind.modal.materials')">
            <MultiSelectGeneric v-model="filters.materials" :options="materialOptions" optionLabel="label" optionValue="value" :showClear="true" />
          </FormFieldGeneric>
          <FormFieldGeneric :label="$t('view.stock.rfidBind.modal.receiptType')">
            <MultiSelectGeneric v-model="filters.receiptType" :options="receiptTypeOptions" optionLabel="description" optionValue="value" :showClear="true" />
          </FormFieldGeneric>
          <FormFieldGeneric :label="$t('view.stock.rfidBind.modal.receiptNumber')">
            <InputTextGeneric v-model="filters.receiptNumber" :trim="true" :bgInput="true" />
          </FormFieldGeneric>
          <FormFieldGeneric :label="$t('view.stock.rfidBind.modal.woText')">
            <InputTextGeneric v-model="filters.woText" :trim="true" :bgInput="true" />
          </FormFieldGeneric>
          <FormFieldGeneric :label="$t('view.stock.rfidBind.modal.mold')">
            <InputTextGeneric v-model="filters.mold" :trim="true" :bgInput="true" />
          </FormFieldGeneric>
          <FormFieldGeneric :label="$t('view.stock.rfidBind.modal.productName')">
            <InputTextGeneric v-model="filters.productName" :trim="true" :bgInput="true" />
          </FormFieldGeneric>
          <FormFieldGeneric :label="$t('view.stock.rfidBind.modal.size')">
            <InputTextGeneric v-model="filters.size" :trim="true" :bgInput="true" />
          </FormFieldGeneric>
        </div>

        <div class="qa-actions">
          <ButtonGeneric variant="outline" icon="bi-calendar-day" :label="$t('view.stock.rfidBind.modal.presetToday')" @click="applyPreset('today')" />
          <ButtonGeneric variant="outline" icon="bi-calendar-week" :label="$t('view.stock.rfidBind.modal.preset7d')" @click="applyPreset('7d')" />
          <ButtonGeneric
            variant="sub-main"
            :icon="showMore ? 'bi-chevron-up' : 'bi-chevron-down'"
            :label="advancedCount ? $t('view.stock.rfidBind.modal.moreActive', { count: advancedCount }) : $t('view.stock.rfidBind.modal.more')"
            @click="showMore = !showMore"
          />
          <ActiveFilterChipsGeneric v-if="planChips.length" class="qa-chips" :chips="planChips" @remove="clearPlanFilter" @clear-all="clearPlanFilter" />
          <ActiveFilterChipsGeneric v-if="!showMore" class="qa-chips" :chips="advancedChips" @remove="removeChip" @clear-all="clearAdvanced" />
          <div class="qa-actions__right">
            <ButtonGeneric variant="dark" icon="bi-x-circle" :title="$t('view.stock.rfidBind.modal.clearFilters')" :aria-label="$t('view.stock.rfidBind.modal.clearFilters')" @click="onClear" />
            <ButtonGeneric class="ml-2" variant="green" icon="bi-search" type="submit" :label="$t('common.btn.search')" />
          </div>
        </div>
      </form>

      <div v-if="view === 'detail'" class="qa-result">
        <div class="qa-result__head">
          <span class="qa-result__count">{{ searched ? $t('view.stock.rfidBind.modal.resultCount', { count: total }) : '' }}</span>
          <template v-if="pageAllSelected && total > items.length">
            <span class="qa-result__hint">{{ $t('view.stock.rfidBind.modal.pageSelected', { count: pageSelectableCount }) }}</span>
            <ButtonGeneric variant="plain" :label="$t('view.stock.rfidBind.modal.selectAllFound', { count: total })" @click="selectAllFound" />
          </template>
          <span v-if="selectInfo" class="qa-result__hint" role="status">{{ selectInfo }}</span>
        </div>

        <BaseDataTable
          :items="items"
          :totalRecords="total"
          :columns="columns"
          dataKey="unitId"
          :selectionMode="true"
          :itemsSelection="selection"
          :disabledItems="boundRows"
          :loading="detailLoading"
          :perPage="take"
          :rowsPerPageOptions="[20, 50, 100]"
          :showGridlines="false"
          scrollHeight="calc(100vh - 578px)"
          @update:itemsSelection="onSelectionChange"
          @page="handlePageChange"
        >
          <template #imageTemplate="{ data }">
            <imagePreview v-if="data.imagePath" :imageName="data.imagePath" type="STOCK-PRODUCT" :width="32" :height="32" />
          </template>
          <template #stockTemplate="{ data }">
            <div class="qa-stock">
              <span class="qa-stock__no">{{ numberOf(data) }}</span>
              <span v-if="secondaryOf(data)" class="qa-stock__sub">{{ secondaryOf(data) }}</span>
            </div>
          </template>
          <template #nameTemplate="{ data }">{{ nameOf(data) }}</template>
          <template #typeTemplate="{ data }">{{ data.productTypeName || data.productType || '-' }}</template>
          <template #unitTemplate="{ data }">{{ unitTextOf(data) || '-' }}</template>
          <template #tagTemplate="{ data }">
            <span v-if="data.epc" class="qa-tag qa-tag--bound">{{ $t('view.stock.rfidBind.modal.tagBoundBadge') }}</span>
            <span v-if="data.unitStatus === 'RESERVED'" class="qa-tag qa-tag--reserved">{{ $t('view.stock.rfidBind.modal.reserved') }}</span>
          </template>
          <template #epcTemplate="{ data }"><span class="qa-epc">{{ data.epc || '-' }}</span></template>
          <template #empty>
            <div class="qa-empty">
              <i class="bi bi-search" aria-hidden="true"></i>
              <p class="qa-empty__title">{{ searched ? $t('view.stock.rfidBind.modal.noResultTitle') : $t('view.stock.rfidBind.modal.notSearched') }}</p>
              <p v-if="searched" class="qa-empty__hint">{{ $t('view.stock.rfidBind.modal.noResultHint') }}</p>
            </div>
          </template>
        </BaseDataTable>
      </div>
    </template>

    <template #action>
      <div v-if="view === 'plan'" class="qa-footer qa-footer--plan">
        <ButtonGeneric variant="main" icon="bi-box-arrow-in-right" :label="$t('view.stock.rfidBind.plan.closeAndStart')" @click="$emit('closeModal')" />
      </div>
      <div v-else class="qa-footer">
        <div class="qa-footer__left">
          <span class="qa-footer__count">{{ $t('view.stock.rfidBind.modal.selected', { count: selection.length }) }}</span>
          <ButtonGeneric variant="dark" icon="bi-x-circle" :label="$t('view.stock.rfidBind.modal.clearSelected')" :disabled="!selection.length" @click="selection = []" />
        </div>
        <div class="qa-footer__right">
          <ToggleGroupGeneric v-model="mode" :options="modeOptions" :ariaLabel="$t('view.stock.rfidBind.modal.title')" />
          <ButtonGeneric variant="main" icon="bi-box-arrow-in-right" :label="selection.length ? $t('view.stock.rfidBind.modal.confirm', { count: selection.length }) : $t('view.stock.rfidBind.modal.confirmEmpty')" :disabled="!selection.length" @click="onConfirm" />
        </div>
      </div>
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import dataTablePaging from '@/composables/useDataTablePaging.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { storage } from '@/services/storage.js'
import { formatDate } from '@/services/utils/dayjs.js'
import { useStockRfidApiStore } from '@/stores/modules/api/stock/rfid-api.js'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'
import { useStockLocationApiStore } from '@/stores/modules/api/stock/stock-location-api.js'

import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import ToggleGroupGeneric from '@/components/generic/ToggleGroupGeneric.vue'
import ActiveFilterChipsGeneric from '@/components/generic/ActiveFilterChipsGeneric.vue'
import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import imagePreview from '@/components/prime-vue/ImagePreview.vue'
import {
  DEFAULT_FILTERS,
  MAX_SELECT_ALL,
  PAGE_FETCH_SIZE,
  activeAdvancedKeys,
  isPlanQueued,
  mergePlanUnits,
  normalizePlanSearch,
  planRangeFor,
  applySelectionChange,
  buildListRequest,
  isUnitBound,
  labelNumber,
  labelSecondary,
  productName,
  unitOfLot,
  unboundCount
} from '../rfid-bind-logic.js'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))
const FILTER_STORAGE_KEY = 'rfid-bind-filters'
const VIEW_STORAGE_KEY = 'rfid-bind-modal-view'

export default {
  name: 'RfidBindQueueAddModal',

  components: {
    modal,
    ButtonGeneric,
    InputTextGeneric,
    FormFieldGeneric,
    ToggleGroupGeneric,
    ActiveFilterChipsGeneric,
    MultiSelectGeneric,
    BaseDataTable,
    imagePreview
  },

  mixins: [dataTablePaging],

  props: {
    isShow: { type: Boolean, default: false },
    existingQueue: { type: Array, default: () => [] }
  },

  emits: ['closeModal', 'confirm', 'addUnits'],

  created() {
    this.mastersLoaded = false
    this.planSeq = 0
    this.detailSeq = 0
  },

  setup() {
    return {
      rfidStore: useStockRfidApiStore(),
      masterStore: useMasterApiStore(),
      locationStore: useStockLocationApiStore()
    }
  },

  data() {
    const saved = storage.getJSON(FILTER_STORAGE_KEY, {})
    const filters = { ...DEFAULT_FILTERS, ...(saved || {}) }
    return {
      filters,
      showMore: false,
      take: 50,
      items: [],
      total: 0,
      searched: false,
      selection: [],
      selectInfo: '',
      mode: 'append',
      view: storage.getItem(VIEW_STORAGE_KEY, 'plan') === 'detail' ? 'detail' : 'plan',
      planSearch: '',
      planRange: '7d',
      plans: [],
      planTotal: 0,
      planSkip: 0,
      planTake: 50,
      planNotice: '',
      planNoticeWarn: false,
      planLoading: false,
      detailLoading: false,
      queuedPlans: []
    }
  },

  computed: {
    locationOptions() {
      return this.locationStore.all
        .filter((item) => item.isActive)
        .map((item) => ({ value: item.code, label: `${item.code} — ${item.nameTh}` }))
    },

    materialOptions() {
      const diamond = { value: 'DIAMOND', label: this.$t('view.stock.product.materialDiamondOption') }
      const gems = this.masterStore.gem
        .filter((item) => {
          const nameEn = (item.nameEn || '').toLowerCase()
          const code = (item.code || '').toUpperCase()
          return !nameEn.includes('diamond') && !code.startsWith('DI')
        })
        .map((item) => ({ value: item.code, label: `${item.nameTh} (${item.nameEn})` }))
      return [diamond, ...gems]
    },

    receiptTypeOptions() {
      return [{ value: 'production', description: 'Production' }]
    },

    receiptOptions() {
      return [
        { value: '', label: this.$t('common.label.all') },
        { value: 'today', label: this.$t('view.stock.rfidBind.modal.receiptToday') },
        { value: '7d', label: this.$t('view.stock.rfidBind.modal.receipt7d') },
        { value: '30d', label: this.$t('view.stock.rfidBind.modal.receipt30d') }
      ]
    },

    tagOptions() {
      return [
        { value: 'unbound', label: this.$t('view.stock.rfidBind.modal.tagUnbound') },
        { value: 'bound', label: this.$t('view.stock.rfidBind.modal.tagBound') },
        { value: 'all', label: this.$t('view.stock.rfidBind.modal.tagAll') }
      ]
    },

    modeOptions() {
      return [
        { value: 'append', label: this.$t('view.stock.rfidBind.modal.modeAppend') },
        { value: 'replace', label: this.$t('view.stock.rfidBind.modal.modeReplace') }
      ]
    },

    viewOptions() {
      return [
        { value: 'plan', label: this.$t('view.stock.rfidBind.plan.tabPlan') },
        { value: 'detail', label: this.$t('view.stock.rfidBind.plan.tabDetail') }
      ]
    },

    planRangeOptions() {
      return [
        { value: '7d', label: this.$t('view.stock.rfidBind.modal.receipt7d') },
        { value: '30d', label: this.$t('view.stock.rfidBind.modal.receipt30d') },
        { value: '', label: this.$t('common.label.all') }
      ]
    },

    planColumns() {
      const t = (key) => this.$t(`view.stock.rfidBind.plan.${key}`)
      return [
        { field: 'image', header: this.$t('view.stock.rfidBind.modal.colImage'), width: '60px', sortable: false },
        { field: 'woText', header: t('colPlan'), minWidth: '140px', sortable: false },
        { field: 'name', header: this.$t('view.stock.rfidBind.modal.colName'), minWidth: '240px', sortable: false },
        { field: 'lastReceiptDate', header: t('colReceived'), minWidth: '110px', sortable: false },
        { field: 'unbound', header: t('colUnbound'), minWidth: '110px', sortable: false },
        { field: 'action', header: '', minWidth: '140px', sortable: false }
      ]
    },

    planChips() {
      return this.filters.wo ? [{ key: 'plan', label: this.$t('view.stock.rfidBind.plan.colPlan'), value: `${this.filters.wo}/${this.filters.woNumber}` }] : []
    },

    advancedKeys() {
      return activeAdvancedKeys(this.filters)
    },

    advancedCount() {
      return this.advancedKeys.length
    },

    advancedChips() {
      return this.advancedKeys.map((key) => {
        const value = this.filters[key]
        return { key, label: this.$t(`view.stock.rfidBind.modal.${key}`), value: Array.isArray(value) ? value.join(', ') : String(value) }
      })
    },

    boundRows() {
      return this.items.filter(isUnitBound)
    },

    pageSelectable() {
      return this.items.filter((unit) => !isUnitBound(unit))
    },

    pageSelectableCount() {
      return this.pageSelectable.length
    },

    pageAllSelected() {
      if (!this.pageSelectable.length) return false
      const ids = new Set(this.selection.map((unit) => unit.unitId))
      return this.pageSelectable.every((unit) => ids.has(unit.unitId))
    },

    columns() {
      const t = (key) => this.$t(`view.stock.rfidBind.modal.${key}`)
      const cols = [
        { field: 'image', header: t('colImage'), width: '60px', sortable: false },
        { field: 'stock', header: t('colStock'), minWidth: '150px', sortable: false },
        { field: 'name', header: t('colName'), minWidth: '220px', sortable: false },
        { field: 'type', header: t('colType'), minWidth: '100px', sortable: false },
        { field: 'locationCode', header: t('colLocation'), minWidth: '80px', sortable: false },
        { field: 'unit', header: t('colUnit'), minWidth: '70px', sortable: false },
        { field: 'tag', header: t('colTag'), minWidth: '130px', sortable: false }
      ]
      if (this.filters.tagStatus !== 'unbound') cols.push({ field: 'epc', header: t('colEpc'), minWidth: '220px', sortable: false })
      return cols
    }
  },

  watch: {
    isShow(value) {
      if (!value) return
      this.loadMasters()
      this.planNotice = ''
      this.queuedPlans = []
      if (this.view === 'plan') this.searchPlans()
      this.selection = []
      this.selectInfo = ''
      this.mode = this.existingQueue.length ? 'append' : 'replace'
      this.showMore = this.advancedCount > 0
      setTimeout(() => document.getElementById(this.view === 'plan' ? 'rfid-bind-plan-search' : 'rfid-bind-filter-stock')?.focus(), 200)
    }
  },

  methods: {
    // โหลด master ครั้งแรกที่เปิด modal (ไม่ยิง API ตอนเข้าหน้าผูกแท็กเฉยๆ)
    async loadMasters() {
      if (this.mastersLoaded) return
      this.mastersLoaded = true
      await this.locationStore.fetchAllForMap()
      await this.masterStore.fetchProductType()
      await this.masterStore.fetchGold()
      await this.masterStore.fetchGoldSize()
      await this.masterStore.fetchGem()
    },

    numberOf: labelNumber,
    secondaryOf: labelSecondary,
    unitTextOf: unitOfLot,

    nameOf(unit) {
      return productName(unit, this.$i18n.locale)
    },

    onViewChange(value) {
      this.view = value
      storage.setItem(VIEW_STORAGE_KEY, value)
      if (value === 'plan') this.searchPlans()
    },

    // ToggleGroup เปลี่ยนแล้วค้นใหม่ทันที (ไม่งั้นตารางค้างผลเก่า)
    onToggleFilter(key, value) {
      this.filters = { ...this.filters, [key]: value }
      this.onSearch()
    },

    onPlanRangeChange(value) {
      this.planRange = value
      this.searchPlans()
    },

    searchPlans() {
      this.planNotice = ''
      this.planSkip = 0
      this.fetchPlans()
    },

    onPlanPage(event) {
      this.planSkip = event.first
      this.planTake = event.rows
      this.fetchPlans()
    },

    async fetchPlans() {
      const range = planRangeFor(this.planRange)
      const seq = ++this.planSeq
      this.planLoading = true
      const res = await this.rfidStore.fetchListPlans({
        search: normalizePlanSearch(this.planSearch) || undefined,
        ...range,
        onlyIncomplete: true,
        skip: this.planSkip,
        take: this.planTake
      })
      if (seq !== this.planSeq) return
      this.planLoading = false
      this.plans = res?.items || []
      this.planTotal = res?.total || 0
    },

    planName(plan) {
      return (this.$i18n.locale === 'en' ? plan.productNameEn || plan.productNameTh : plan.productNameTh || plan.productNameEn) || ''
    },

    formatPlanDate(value) {
      return value ? formatDate(value) : '-'
    },

    planQueued(plan) {
      return this.queuedPlans.includes(plan.woText) || isPlanQueued(this.existingQueue, plan)
    },

    async addPlan(plan, event) {
      event?.stopPropagation()
      const res = await this.rfidStore.fetchListUnits({ wo: plan.wo, woNumber: plan.woNumber, tagStatus: 'unbound', skip: 0, take: 500 })
      const units = res?.items || []
      const merged = mergePlanUnits(this.existingQueue, units)
      this.$emit('addUnits', units)
      this.queuedPlans = [...this.queuedPlans, plan.woText]
      const truncated = res?.total > units.length
      this.planNoticeWarn = !!truncated
      this.planNotice = truncated
        ? this.$t('view.stock.rfidBind.scan.planTruncated', { plan: plan.woText, count: units.length, total: res.total })
        : this.$t('view.stock.rfidBind.plan.added', { plan: plan.woText, count: merged.added })
    },

    onPlanRowClick(event, domEvent) {
      domEvent?.stopPropagation?.()
      const plan = event?.data
      if (!plan) return
      this.filters = { ...DEFAULT_FILTERS, wo: plan.wo, woNumber: String(plan.woNumber), tagStatus: 'unbound' }
      this.showMore = false
      this.onViewChange('detail')
      this.onSearch()
    },

    clearPlanFilter() {
      this.filters = { ...this.filters, wo: '', woNumber: '' }
    },

    onSelectionChange(next) {
      this.selection = applySelectionChange(this.selection, next, this.items)
      this.selectInfo = ''
    },

    onSearch() {
      storage.setJSON(FILTER_STORAGE_KEY, this.filters)
      this.searched = true
      this.selectInfo = ''
      this.resetPaging()
    },

    async fetchData() {
      const body = buildListRequest(this.filters, { skip: this.skip, take: this.take })
      const seq = ++this.detailSeq
      this.detailLoading = true
      const res = await this.rfidStore.fetchListUnits(body)
      if (seq !== this.detailSeq) return
      this.detailLoading = false
      this.items = res?.items || []
      this.total = res?.total || 0
    },

    applyPreset(preset) {
      this.filters = { ...DEFAULT_FILTERS, receiptPreset: preset, tagStatus: 'unbound' }
      this.showMore = false
      this.onSearch()
    },

    onClear() {
      this.filters = { ...DEFAULT_FILTERS }
      storage.setJSON(FILTER_STORAGE_KEY, this.filters)
    },

    removeChip(key) {
      this.filters = { ...this.filters, [key]: Array.isArray(DEFAULT_FILTERS[key]) ? [] : '' }
    },

    clearAdvanced() {
      const next = { ...this.filters }
      for (const key of this.advancedKeys) next[key] = Array.isArray(DEFAULT_FILTERS[key]) ? [] : ''
      this.filters = next
    },

    async selectAllFound() {
      const found = []
      let skip = 0
      while (found.length < MAX_SELECT_ALL && skip < this.total) {
        const body = buildListRequest(this.filters, { skip, take: PAGE_FETCH_SIZE })
        const res = await this.rfidStore.fetchListUnits(body)
        const rows = res?.items || []
        if (!rows.length) break
        for (const unit of rows) if (!isUnitBound(unit) && found.length < MAX_SELECT_ALL) found.push(unit)
        skip += PAGE_FETCH_SIZE
      }
      const merged = new Map(this.selection.map((unit) => [unit.unitId, unit]))
      for (const unit of found) merged.set(unit.unitId, unit)
      this.selection = [...merged.values()]
      this.selectInfo =
        this.total > MAX_SELECT_ALL
          ? this.$t('view.stock.rfidBind.modal.selectAllLimit', { max: MAX_SELECT_ALL, count: found.length, total: this.total })
          : this.$t('view.stock.rfidBind.modal.selectAllDone', { count: found.length })
    },

    onConfirm() {
      const emitConfirm = () => this.$emit('confirm', { units: [...this.selection], mode: this.mode })
      const dropped = unboundCount(this.existingQueue)
      if (this.mode === 'replace' && dropped > 0) {
        confirmThenSubmit(
          this.$t('view.stock.rfidBind.modal.replaceDialog.message', { count: dropped }),
          this.$t('view.stock.rfidBind.modal.replaceDialog.title'),
          emitConfirm,
          {
            confirmText: this.$t('view.stock.rfidBind.modal.replaceDialog.confirm'),
            cancelText: this.$t('view.stock.rfidBind.modal.replaceDialog.cancel')
          }
        )
        return
      }
      emitConfirm()
    }
  }
}
</script>

<style lang="scss" scoped>
.qa-form {
  display: flex;
  flex-direction: column;
  gap: var(--sp-md);
}

.qa-view-toggle {
  margin-bottom: var(--sp-md);
}

.qa-plan__form {
  display: flex;
  align-items: flex-end;
  gap: var(--sp-md);
  flex-wrap: wrap;
  margin-bottom: var(--sp-sm);
}

.qa-plan__form > * {
  width: auto;
}

.qa-plan__form > .qa-plan__search {
  flex: 1 1 260px;
}

.qa-plan__notice {
  margin: 0 0 var(--sp-sm);
  font-size: var(--fs-base);
  font-weight: 600;
  color: var(--base-green);
}

.qa-plan__notice--warn {
  color: var(--base-font-sub-color);
}

.qa-footer.qa-footer--plan {
  justify-content: flex-end;
}

.qa-presets {
  display: flex;
  gap: var(--sp-sm);
}

.qa-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--sp-md);
}

.qa-grid__wide {
  grid-column: span 2;
}

.qa-actions {
  display: flex;
  align-items: center;
  gap: var(--sp-md);
  flex-wrap: wrap;
}

.qa-actions__right {
  margin-left: auto;
  display: flex;
}

.qa-result {
  margin-top: var(--sp-sm);
}

.qa-result__head {
  display: flex;
  align-items: center;
  gap: var(--sp-md);
  flex-wrap: wrap;
  min-height: var(--sp-2xl);
  margin-bottom: var(--sp-sm);
}

.qa-result__count {
  font-weight: 700;
  color: var(--base-font-color);
}

.qa-result__hint {
  font-size: var(--fs-base);
  color: var(--base-sub-color);
}

.qa-stock {
  display: flex;
  flex-direction: column;
}

.qa-stock__no {
  font-weight: 700;
}

.qa-stock__sub {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}

.qa-tag {
  display: inline-block;
  margin-right: var(--sp-xs);
  font-size: var(--fs-sm);
  font-weight: 600;
  border: 1px solid currentColor;
  border-radius: var(--radius-lg);
  padding: 0 var(--sp-sm);

  &--bound {
    color: var(--base-green);
    background: var(--status-resolved-bg);
  }

  &--reserved {
    color: var(--base-font-color);
    background: var(--status-open-bg);
  }
}

.qa-epc {
  font-family: monospace;
  font-size: var(--fs-sm);
}

.qa-empty {
  text-align: center;
  padding: var(--sp-xl);
  color: var(--base-sub-color);

  i {
    font-size: var(--fs-xl);
  }
}

.qa-empty__title {
  margin: var(--sp-sm) 0 0;
  font-weight: 600;
}

.qa-empty__hint {
  margin: var(--sp-xs) 0 0;
  font-size: var(--fs-base);
}

.qa-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-lg);
  flex-wrap: wrap;
  text-align: left;
}

.qa-footer__left,
.qa-footer__right {
  display: flex;
  align-items: center;
  gap: var(--sp-md);
}

.qa-footer__count {
  font-weight: 700;
}
</style>
