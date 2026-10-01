<!--
  ProductionInsightView — Dashboard v2 archetype, Revision 2 (per-topic tabs)
  (blueprint: docs/claude-design/blueprints/executive-production.md, "Revision 2" section)

  เมนูย่อยชั้น 2 (ToggleGroupGeneric) 6 หมวด: งานค้างและคอขวด (default) / ส่งงานตรงเวลา / กำลังการผลิต /
  ทองและ Loss / ช่างและค่าแรง / วัตถุดิบที่กระทบการผลิต — ทุกหมวดใช้โครง 4 ส่วนเดียวกัน (InsightTabLayout):
  ปัญหาที่เกิดแล้ว / คาดการณ์ปัญหาที่จะเกิด / วิธีแก้ / รายงาน

  Revision 5: หมวด "งานค้างและคอขวด" (wip) + "ส่งงานตรงเวลา" (delivery) + "ทองและ Loss" (gold) + "กำลังการ
  ผลิต" (capacity) มีเนื้อหาจริงแล้ว (เรียก ProductionInsight/Wip, Delivery, Gold, Capacity) — อีก 2 หมวดยังเป็น
  placeholder (topic-placeholder-section.vue) จนกว่าจะมี API ของหมวดนั้น — ตัวกรอง (FilterPanelGeneric) มีจริง
  แค่ 4 หมวดนี้ (wip: แผนก/ไม่ขยับเกิน (วัน)/เตือนล่วงหน้า (วัน)/เกณฑ์งานค้างเพิ่มเร็ว, delivery: แผนก/เตือน
  ล่วงหน้า (วัน), gold: ประเภทช่าง/ช่าง/ไม่ครบ slip เกิน (วัน), capacity: หน่วย ใบ/ชิ้น/แผนก) หมวดอื่นไม่มีตัว
  กรองให้กด (ปุ่ม/chip แถวตัวกรองซ่อนไปเลยเมื่อหมวดนั้นไม่มี filter — ดู hasFilterableFields) — ทั้ง 4 หมวดถือ
  range state (rangePreset/start/end/bucket) แยกกันเองใน filters.wip/filters.delivery/filters.gold/
  filters.capacity แต่ sync ผ่าน URL query key ร่วมกัน (range/start/end ไม่มี prefix ตาม range-presets.js)
  เฉพาะของหมวดที่เปิดอยู่ ณ ขณะนั้นเท่านั้น (ดู syncStateToQuery) — ตัวเลือกช่าง (workerCodes) ของหมวด gold มา
  จากข้อมูลที่ gold-section.vue ยิง Gold สำเร็จแล้ว emit ขึ้นมา (goldWorkerOptions) ไม่ใช่ list คงที่แบบแผนก
  ของ wip/delivery/capacity

  โหลดข้อมูลเฉพาะหมวดที่เปิด (mount ครั้งแรกแล้วค้างด้วย v-show/visitedSections) — URL sync: อ่าน query
  ครั้งเดียวใน created() แล้ว $router.replace ตอนเปลี่ยน คงค่า query key อื่นของ host ไว้เสมอ (เช่น
  executive ?tab=)
-->
<template>
  <div class="production-insight">
    <div class="production-insight__toolbar">
      <ToggleGroupGeneric
        v-model="activeSection"
        :options="sectionOptions"
        :ariaLabel="$t('view.productionInsight.nav.ariaLabel')"
        class="production-insight__nav"
      />

      <RangePresetGeneric
        v-if="hasFilterableFields"
        :modelValue="rangeModelValue"
        :ariaLabel="$t('view.productionInsight.wip.rangeAriaLabel')"
        :helpText="$t('view.productionInsight.help.rangeControl')"
        @update:modelValue="onRangePresetChange"
      />

      <ActiveFilterChipsGeneric
        v-if="hasFilterableFields"
        class="production-insight__chips"
        :chips="activeChips"
        @remove="onRemoveChip"
        @clear-all="onClearFilter"
      />

      <ButtonGeneric v-if="hasFilterableFields" variant="outline" icon="bi-sliders" class="production-insight__filter-btn" @click="openFilterPanel">
        {{ $t('view.productionInsight.filter.button') }}
        <span v-if="activeChips.length" class="production-insight__filter-badge">{{ activeChips.length }}</span>
      </ButtonGeneric>
    </div>

    <div class="production-insight__body">
      <WipSection v-if="visitedSections.has('wip')" v-show="activeSection === 'wip'" :filter="filters.wip" :active="activeSection === 'wip'" />
      <DeliverySection
        v-if="visitedSections.has('delivery')"
        v-show="activeSection === 'delivery'"
        :filter="filters.delivery"
        :active="activeSection === 'delivery'"
      />
      <GoldSection
        v-if="visitedSections.has('gold')"
        v-show="activeSection === 'gold'"
        :filter="filters.gold"
        :active="activeSection === 'gold'"
        @workers-loaded="onGoldWorkersLoaded"
        @metal-change="onGoldMetalChange"
      />
      <CapacitySection
        v-if="visitedSections.has('capacity')"
        v-show="activeSection === 'capacity'"
        :filter="filters.capacity"
        :active="activeSection === 'capacity'"
      />

      <template v-for="topic in placeholderTopics" :key="topic">
        <TopicPlaceholderSection v-if="visitedSections.has(topic)" v-show="activeSection === topic" :topicKey="topic" />
      </template>
    </div>

    <FilterPanelGeneric
      v-if="hasFilterableFields"
      :show="isFilterPanelOpen"
      :title="$t('view.productionInsight.filter.title')"
      width="420px"
      @apply="onFilterApply"
      @clear="onFilterClear"
      @close="onFilterPanelClose"
    >
      <template #section-title>
        <template v-if="activeSection === 'wip'">{{ $t('view.productionInsight.wip.filterSectionTitle') }}</template>
        <template v-else-if="activeSection === 'delivery'">{{ $t('view.productionInsight.delivery.filterSectionTitle') }}</template>
        <template v-else-if="activeSection === 'gold'">{{ $t('view.productionInsight.gold.filterSectionTitle') }}</template>
        <template v-else-if="activeSection === 'capacity'">{{ $t('view.productionInsight.capacity.filterSectionTitle') }}</template>
      </template>
      <template #section>
        <template v-if="activeSection === 'wip'">
          <FormFieldGeneric :label="$t('view.productionInsight.wip.filterDept')">
            <MultiSelectGeneric
              v-model="draftWipFilter.departmentKeys"
              :options="departmentOptions"
              optionLabel="label"
              optionValue="value"
              :placeholder="$t('common.label.all')"
              :showClear="true"
            />
          </FormFieldGeneric>
          <FormFieldGeneric :label="$t('view.productionInsight.wip.filterStaleDays')">
            <InputTextGeneric v-model.number="draftWipFilter.staleDays" type="number" :min="1" />
          </FormFieldGeneric>
          <FormFieldGeneric :label="$t('view.productionInsight.wip.filterRiskWindowDays')">
            <InputTextGeneric v-model.number="draftWipFilter.riskWindowDays" type="number" :min="1" />
          </FormFieldGeneric>
          <FormFieldGeneric
            :label="$t('view.productionInsight.wip.filterGrowthThreshold')"
            :tip="$t('view.productionInsight.help.filterGrowthThreshold')"
          >
            <InputTextGeneric v-model.number="draftWipFilter.growthThresholdPercent" type="number" :min="1" />
          </FormFieldGeneric>
          <FormFieldGeneric
            :label="$t('view.productionInsight.wip.filterCustomRangeLabel')"
            :tip="$t('view.productionInsight.help.filterCustomRange')"
          >
            <DateRangeGeneric
              :startDate="draftWipFilter.start"
              :endDate="draftWipFilter.end"
              @update:startDate="onDraftCustomRangeChange('start', $event)"
              @update:endDate="onDraftCustomRangeChange('end', $event)"
            />
          </FormFieldGeneric>
        </template>

        <template v-else-if="activeSection === 'delivery'">
          <FormFieldGeneric :label="$t('view.productionInsight.delivery.filterDept')">
            <MultiSelectGeneric
              v-model="draftDeliveryFilter.departmentKeys"
              :options="departmentOptions"
              optionLabel="label"
              optionValue="value"
              :placeholder="$t('common.label.all')"
              :showClear="true"
            />
          </FormFieldGeneric>
          <FormFieldGeneric
            :label="$t('view.productionInsight.delivery.filterRiskHorizon')"
            :tip="$t('view.productionInsight.help.filterRiskHorizon')"
          >
            <InputTextGeneric v-model.number="draftDeliveryFilter.riskHorizonDays" type="number" :min="1" />
          </FormFieldGeneric>
          <FormFieldGeneric
            :label="$t('view.productionInsight.delivery.filterCustomRangeLabel')"
            :tip="$t('view.productionInsight.help.filterCustomRange')"
          >
            <DateRangeGeneric
              :startDate="draftDeliveryFilter.start"
              :endDate="draftDeliveryFilter.end"
              @update:startDate="onDraftCustomRangeChange('start', $event)"
              @update:endDate="onDraftCustomRangeChange('end', $event)"
            />
          </FormFieldGeneric>
        </template>

        <template v-else-if="activeSection === 'gold'">
          <FormFieldGeneric :label="$t('view.productionInsight.gold.filterMetal')">
            <ToggleGroupGeneric v-model="draftGoldFilter.metal" :options="metalOptions" :ariaLabel="$t('view.productionInsight.gold.metalToggleAriaLabel')" />
          </FormFieldGeneric>
          <FormFieldGeneric :label="$t('view.productionInsight.gold.filterWorkerType')">
            <MultiSelectGeneric
              v-model="draftGoldFilter.workerTypes"
              :options="workerTypeOptions"
              optionLabel="label"
              optionValue="value"
              :placeholder="$t('common.label.all')"
              :showClear="true"
            />
          </FormFieldGeneric>
          <FormFieldGeneric :label="$t('view.productionInsight.gold.filterWorkerCode')">
            <MultiSelectGeneric
              v-model="draftGoldFilter.workerCodes"
              :options="goldWorkerOptions"
              optionLabel="label"
              optionValue="value"
              :placeholder="$t('common.label.all')"
              :showClear="true"
            />
          </FormFieldGeneric>
          <FormFieldGeneric
            :label="$t('view.productionInsight.gold.filterOlderThan')"
            :tip="$t('view.productionInsight.help.filterOlderThan')"
          >
            <InputTextGeneric v-model.number="draftGoldFilter.olderThanDays" type="number" :min="1" />
          </FormFieldGeneric>
          <FormFieldGeneric
            :label="$t('view.productionInsight.gold.filterCustomRangeLabel')"
            :tip="$t('view.productionInsight.help.filterCustomRange')"
          >
            <DateRangeGeneric
              :startDate="draftGoldFilter.start"
              :endDate="draftGoldFilter.end"
              @update:startDate="onDraftCustomRangeChange('start', $event)"
              @update:endDate="onDraftCustomRangeChange('end', $event)"
            />
          </FormFieldGeneric>
        </template>

        <template v-else-if="activeSection === 'capacity'">
          <FormFieldGeneric :label="$t('view.productionInsight.capacity.filterUnit')">
            <ToggleGroupGeneric v-model="draftCapacityFilter.unit" :options="capacityUnitOptions" :ariaLabel="$t('view.productionInsight.capacity.unitToggleAriaLabel')" />
          </FormFieldGeneric>
          <FormFieldGeneric :label="$t('view.productionInsight.capacity.filterDept')" :tip="$t('view.productionInsight.help.capacityFilterDept')">
            <MultiSelectGeneric
              v-model="draftCapacityFilter.departmentKeys"
              :options="departmentOptions"
              optionLabel="label"
              optionValue="value"
              :placeholder="$t('common.label.all')"
              :showClear="true"
            />
          </FormFieldGeneric>
          <FormFieldGeneric
            :label="$t('view.productionInsight.capacity.filterCustomRangeLabel')"
            :tip="$t('view.productionInsight.help.filterCustomRange')"
          >
            <DateRangeGeneric
              :startDate="draftCapacityFilter.start"
              :endDate="draftCapacityFilter.end"
              @update:startDate="onDraftCustomRangeChange('start', $event)"
              @update:endDate="onDraftCustomRangeChange('end', $event)"
            />
          </FormFieldGeneric>
        </template>
      </template>
    </FilterPanelGeneric>
  </div>
</template>

<script>
import {
  SECTION_VALUES,
  resolveActiveSection,
  buildDefaultWipFilter,
  parseWipFilterQuery,
  wipFilterToQuery,
  clearedWipFilterQueryKeys,
  buildActiveChips,
  WIP_DEFAULT_STALE_DAYS,
  WIP_DEFAULT_RISK_WINDOW_DAYS,
  WIP_DEFAULT_GROWTH_THRESHOLD_PERCENT,
  buildDefaultDeliveryFilter,
  parseDeliveryFilterQuery,
  deliveryFilterToQuery,
  clearedDeliveryFilterQueryKeys,
  DELIVERY_DEFAULT_RISK_HORIZON_DAYS,
  buildDefaultGoldFilter,
  parseGoldFilterQuery,
  goldFilterToQuery,
  clearedGoldFilterQueryKeys,
  GOLD_DEFAULT_OLDER_THAN_DAYS,
  GOLD_METAL_VALUES,
  GOLD_DEFAULT_METAL,
  buildDefaultCapacityFilter,
  parseCapacityFilterQuery,
  capacityFilterToQuery,
  clearedCapacityFilterQueryKeys,
  CAPACITY_UNIT_VALUES,
  CAPACITY_DEFAULT_UNIT
} from './insight-filters.js'
import { resolvePresetRange, resolveCustomBucket } from '@/services/utils/range-presets.js'

import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import ToggleGroupGeneric from '@/components/generic/ToggleGroupGeneric.vue'
import FilterPanelGeneric from '@/components/generic/FilterPanelGeneric.vue'
import ActiveFilterChipsGeneric from '@/components/generic/ActiveFilterChipsGeneric.vue'
import RangePresetGeneric from '@/components/generic/RangePresetGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'
import DateRangeGeneric from '@/components/prime-vue/DateRangeGeneric.vue'
import WipSection from './sections/wip-section.vue'
import DeliverySection from './sections/delivery-section.vue'
import GoldSection from './sections/gold-section.vue'
import CapacitySection from './sections/capacity-section.vue'
import TopicPlaceholderSection from './sections/topic-placeholder-section.vue'

const DEPARTMENT_KEYS = ['design', 'trim', 'rawPolish', 'gemSort', 'setting', 'plating', 'costCard']

export default {
  name: 'ProductionInsightView',

  components: {
    ButtonGeneric,
    FormFieldGeneric,
    ToggleGroupGeneric,
    FilterPanelGeneric,
    ActiveFilterChipsGeneric,
    RangePresetGeneric,
    InputTextGeneric,
    MultiSelectGeneric,
    DateRangeGeneric,
    WipSection,
    DeliverySection,
    GoldSection,
    CapacitySection,
    TopicPlaceholderSection
  },

  data() {
    return {
      activeSection: 'wip',
      // ว่างตั้งต้นเสมอ — created() เป็นคน add หมวดที่ resolve จาก query จริง (applyQueryToState) ก่อน mount
      // ครั้งแรก กัน WipSection (หรือหมวดไหนก็ตาม) mount+ยิง endpoint ทิ้งทั้งที่ผู้ใช้เปิดมาที่หมวดอื่น
      // (เช่น ?view=delivery) — ห้าม hardcode ['wip'] ตรงนี้อีก
      visitedSections: new Set(),
      filters: {
        wip: buildDefaultWipFilter(),
        delivery: buildDefaultDeliveryFilter(),
        gold: buildDefaultGoldFilter(),
        capacity: buildDefaultCapacityFilter()
      },
      draftWipFilter: buildDefaultWipFilter(),
      draftDeliveryFilter: buildDefaultDeliveryFilter(),
      draftGoldFilter: buildDefaultGoldFilter(),
      draftCapacityFilter: buildDefaultCapacityFilter(),
      // ตัวเลือกช่างของหมวด gold — มาจาก Gold.workers ที่ gold-section.vue emit ขึ้นมาหลังยิงสำเร็จ (ไม่ใช่
      // list คงที่แบบแผนกของ wip/delivery) ว่างก่อน gold-section.vue ยิงครั้งแรก
      goldWorkerOptions: [],
      isFilterPanelOpen: false,
      isApplyingRouteQuery: false
    }
  },

  computed: {
    sectionOptions() {
      return SECTION_VALUES.map((value) => ({ value, label: this.$t(`view.productionInsight.nav.${value}`) }))
    },

    placeholderTopics() {
      return SECTION_VALUES.filter((v) => v !== 'wip' && v !== 'delivery' && v !== 'gold' && v !== 'capacity')
    },

    departmentOptions() {
      return DEPARTMENT_KEYS.map((key) => ({ value: key, label: this.$t(`view.executive.department.${key}`) }))
    },

    workerTypeOptions() {
      return [80, 50].map((workerType) => ({ value: String(workerType), label: this.$t(`view.productionInsight.gold.workerType.${workerType}`) }))
    },

    metalOptions() {
      return GOLD_METAL_VALUES.map((value) => ({ value, label: this.$t(`view.productionInsight.gold.metalLabel.${value}`) }))
    },

    capacityUnitOptions() {
      return CAPACITY_UNIT_VALUES.map((value) => ({ value, label: this.$t(`view.productionInsight.capacity.unitLabel.${value}`) }))
    },

    // มีตัวกรองจริงแค่หมวด "งานค้างและคอขวด"/"ส่งงานตรงเวลา"/"ทองและ Loss"/"กำลังการผลิต" — หมวดอื่นยังเป็น
    // placeholder ไม่มี filter ให้กด
    hasFilterableFields() {
      return this.activeSection === 'wip' || this.activeSection === 'delivery' || this.activeSection === 'gold' || this.activeSection === 'capacity'
    },

    activeChips() {
      if (this.activeSection === 'wip') {
        const f = this.filters.wip
        return buildActiveChips([
          { key: 'departmentKeys', label: this.$t('view.productionInsight.wip.filterDept'), value: this.resolveDeptLabels(f.departmentKeys) },
          { key: 'staleDays', label: this.$t('view.productionInsight.wip.filterStaleDays'), value: f.staleDays !== WIP_DEFAULT_STALE_DAYS ? String(f.staleDays) : '' },
          { key: 'riskWindowDays', label: this.$t('view.productionInsight.wip.filterRiskWindowDays'), value: f.riskWindowDays !== WIP_DEFAULT_RISK_WINDOW_DAYS ? String(f.riskWindowDays) : '' },
          {
            key: 'growthThresholdPercent',
            label: this.$t('view.productionInsight.wip.filterGrowthThreshold'),
            value: f.growthThresholdPercent !== WIP_DEFAULT_GROWTH_THRESHOLD_PERCENT ? String(f.growthThresholdPercent) : ''
          }
        ])
      }
      if (this.activeSection === 'delivery') {
        const f = this.filters.delivery
        return buildActiveChips([
          { key: 'departmentKeys', label: this.$t('view.productionInsight.delivery.filterDept'), value: this.resolveDeptLabels(f.departmentKeys) },
          {
            key: 'riskHorizonDays',
            label: this.$t('view.productionInsight.delivery.filterRiskHorizon'),
            value: f.riskHorizonDays !== DELIVERY_DEFAULT_RISK_HORIZON_DAYS ? String(f.riskHorizonDays) : ''
          }
        ])
      }
      if (this.activeSection === 'gold') {
        const f = this.filters.gold
        return buildActiveChips([
          {
            key: 'metal',
            label: this.$t('view.productionInsight.gold.filterMetal'),
            value: f.metal !== GOLD_DEFAULT_METAL ? this.$t(`view.productionInsight.gold.metalLabel.${f.metal}`) : ''
          },
          { key: 'workerTypes', label: this.$t('view.productionInsight.gold.filterWorkerType'), value: this.resolveWorkerTypeLabels(f.workerTypes) },
          { key: 'workerCodes', label: this.$t('view.productionInsight.gold.filterWorkerCode'), value: this.resolveWorkerCodeLabels(f.workerCodes) },
          {
            key: 'olderThanDays',
            label: this.$t('view.productionInsight.gold.filterOlderThan'),
            value: f.olderThanDays !== GOLD_DEFAULT_OLDER_THAN_DAYS ? String(f.olderThanDays) : ''
          }
        ])
      }
      if (this.activeSection === 'capacity') {
        const f = this.filters.capacity
        return buildActiveChips([
          {
            key: 'unit',
            label: this.$t('view.productionInsight.capacity.filterUnit'),
            value: f.unit !== CAPACITY_DEFAULT_UNIT ? this.$t(`view.productionInsight.capacity.unitLabel.${f.unit}`) : ''
          },
          { key: 'departmentKeys', label: this.$t('view.productionInsight.capacity.filterDept'), value: this.resolveDeptLabels(f.departmentKeys) }
        ])
      }
      return []
    },

    // RangePresetGeneric เป็น controlled component — ส่ง state ปัจจุบันของหมวดที่เปิดอยู่เข้าไปแสดงผล
    rangeModelValue() {
      const f = this.filters[this.activeSection]
      if (!f) return { preset: '3m', start: null, end: null }
      return { preset: f.rangePreset, start: f.start, end: f.end }
    }
  },

  watch: {
    activeSection() {
      this.visitedSections.add(this.activeSection)
      this.syncStateToQuery()
    },

    filters: {
      handler() {
        this.syncStateToQuery()
      },
      deep: true
    }
  },

  methods: {
    resolveDeptLabels(keys) {
      if (!keys || !keys.length) return ''
      return keys.map((key) => this.$t(`view.executive.department.${key}`)).join(', ')
    },

    resolveWorkerTypeLabels(workerTypes) {
      if (!workerTypes || !workerTypes.length) return ''
      return workerTypes.map((workerType) => this.$t(`view.productionInsight.gold.workerType.${workerType}`)).join(', ')
    },

    resolveWorkerCodeLabels(workerCodes) {
      if (!workerCodes || !workerCodes.length) return ''
      return workerCodes
        .map((code) => this.goldWorkerOptions.find((o) => o.value === code)?.label || code)
        .join(', ')
    },

    onGoldWorkersLoaded(workers) {
      this.goldWorkerOptions = (workers || []).map((w) => ({ value: w.workerCode, label: `${w.workerCode} ${w.workerName}` }))
    },

    applyQueryToState(query) {
      this.isApplyingRouteQuery = true
      this.activeSection = resolveActiveSection(query.view)
      this.visitedSections.add(this.activeSection)
      this.filters.wip = parseWipFilterQuery(query)
      this.filters.delivery = parseDeliveryFilterQuery(query)
      this.filters.gold = parseGoldFilterQuery(query)
      this.filters.capacity = parseCapacityFilterQuery(query)
      this.$nextTick(() => {
        this.isApplyingRouteQuery = false
      })
    },

    syncStateToQuery() {
      if (this.isApplyingRouteQuery) return
      const sectionQuery =
        this.activeSection === 'wip'
          ? wipFilterToQuery(this.filters.wip)
          : this.activeSection === 'delivery'
            ? deliveryFilterToQuery(this.filters.delivery)
            : this.activeSection === 'gold'
              ? goldFilterToQuery(this.filters.gold)
              : this.activeSection === 'capacity'
                ? capacityFilterToQuery(this.filters.capacity)
                : {}
      const clearedKeys =
        this.activeSection === 'wip'
          ? clearedWipFilterQueryKeys(this.filters.wip)
          : this.activeSection === 'delivery'
            ? clearedDeliveryFilterQueryKeys(this.filters.delivery)
            : this.activeSection === 'gold'
              ? clearedGoldFilterQueryKeys(this.filters.gold)
              : this.activeSection === 'capacity'
                ? clearedCapacityFilterQueryKeys(this.filters.capacity)
                : []
      const query = { ...this.$route.query, view: this.activeSection, ...sectionQuery }
      clearedKeys.forEach((key) => delete query[key])
      this.$router.replace({ query }).catch(() => {})
    },

    openFilterPanel() {
      this.draftWipFilter = { ...this.filters.wip }
      this.draftDeliveryFilter = { ...this.filters.delivery }
      this.draftGoldFilter = { ...this.filters.gold }
      this.draftCapacityFilter = { ...this.filters.capacity }
      this.isFilterPanelOpen = true
    },

    closeFilterPanel() {
      this.isFilterPanelOpen = false
    },

    onFilterApply() {
      if (this.activeSection === 'wip') this.filters.wip = { ...this.draftWipFilter }
      else if (this.activeSection === 'delivery') this.filters.delivery = { ...this.draftDeliveryFilter }
      else if (this.activeSection === 'gold') this.filters.gold = { ...this.draftGoldFilter }
      else if (this.activeSection === 'capacity') this.filters.capacity = { ...this.draftCapacityFilter }
      this.closeFilterPanel()
    },

    onFilterClear() {
      if (this.activeSection === 'wip') this.filters.wip = buildDefaultWipFilter()
      else if (this.activeSection === 'delivery') this.filters.delivery = buildDefaultDeliveryFilter()
      else if (this.activeSection === 'gold') this.filters.gold = buildDefaultGoldFilter()
      else if (this.activeSection === 'capacity') this.filters.capacity = buildDefaultCapacityFilter()
      this.closeFilterPanel()
    },

    onFilterPanelClose() {
      this.closeFilterPanel()
    },

    onRemoveChip(key) {
      if (this.activeSection === 'wip') {
        const next = { ...this.filters.wip }
        if (key === 'departmentKeys') next.departmentKeys = []
        else if (key === 'staleDays') next.staleDays = WIP_DEFAULT_STALE_DAYS
        else if (key === 'riskWindowDays') next.riskWindowDays = WIP_DEFAULT_RISK_WINDOW_DAYS
        else if (key === 'growthThresholdPercent') next.growthThresholdPercent = WIP_DEFAULT_GROWTH_THRESHOLD_PERCENT
        this.filters.wip = next
      } else if (this.activeSection === 'delivery') {
        const next = { ...this.filters.delivery }
        if (key === 'departmentKeys') next.departmentKeys = []
        else if (key === 'riskHorizonDays') next.riskHorizonDays = DELIVERY_DEFAULT_RISK_HORIZON_DAYS
        this.filters.delivery = next
      } else if (this.activeSection === 'gold') {
        const next = { ...this.filters.gold }
        if (key === 'metal') next.metal = GOLD_DEFAULT_METAL
        else if (key === 'workerTypes') next.workerTypes = []
        else if (key === 'workerCodes') next.workerCodes = []
        else if (key === 'olderThanDays') next.olderThanDays = GOLD_DEFAULT_OLDER_THAN_DAYS
        this.filters.gold = next
      } else if (this.activeSection === 'capacity') {
        const next = { ...this.filters.capacity }
        if (key === 'unit') next.unit = CAPACITY_DEFAULT_UNIT
        else if (key === 'departmentKeys') next.departmentKeys = []
        this.filters.capacity = next
      }
    },

    // ToggleGroupGeneric ทอง/เงิน ข้าง GoldKpiGroup เป็น state เดียวกับฟิลด์ "โลหะ" ในแผงตัวกรอง — ใช้ทันที
    // ไม่ผ่าน draft/apply เหมือน onRangePresetChange (ไม่ใช่ปุ่ม "ใช้ตัวกรอง" ปกติ) — sync query เองตรงๆ
    // (กัน syncStateToQuery ของ filters watcher ทำงาน เพราะมันรีบิลด์ query ของทั้ง section แล้วลบ key ที่
    // กลับเป็นค่า default ทิ้งแบบ blanket — ถ้า range ปัจจุบันบังเอิญเป็นค่า default 3m จะโดนลบ query.range
    // ทิ้งไปด้วยทั้งที่ไม่เกี่ยวกับการสลับโลหะเลย) — แก้เฉพาะ key gldMetal คง key อื่นทั้งหมดไว้ตามเดิม
    onGoldMetalChange(value) {
      this.isApplyingRouteQuery = true
      this.filters.gold = { ...this.filters.gold, metal: value }
      this.$nextTick(() => {
        this.isApplyingRouteQuery = false
        const query = { ...this.$route.query, view: 'gold' }
        if (value === GOLD_DEFAULT_METAL) delete query.gldMetal
        else query.gldMetal = value
        this.$router.replace({ query }).catch(() => {})
      })
    },

    onClearFilter() {
      if (this.activeSection === 'wip') this.filters.wip = buildDefaultWipFilter()
      else if (this.activeSection === 'delivery') this.filters.delivery = buildDefaultDeliveryFilter()
      else if (this.activeSection === 'gold') this.filters.gold = buildDefaultGoldFilter()
      else if (this.activeSection === 'capacity') this.filters.capacity = buildDefaultCapacityFilter()
    },

    // กดปุ่ม preset ใน RangePresetGeneric (แถบเครื่องมือ) — ใช้ทันที ไม่ผ่าน draft/apply เหมือน field อื่น
    // ในแผงตัวกรอง (สอดคล้องกับการสลับหมวด/nav ที่ใช้ทันทีเช่นกัน)
    onRangePresetChange({ preset, start, end }) {
      if (this.activeSection === 'wip') {
        this.filters.wip = { ...this.filters.wip, rangePreset: preset, start, end, bucket: resolvePresetRange(preset)?.bucket || this.filters.wip.bucket }
      } else if (this.activeSection === 'delivery') {
        this.filters.delivery = {
          ...this.filters.delivery,
          rangePreset: preset,
          start,
          end,
          bucket: resolvePresetRange(preset)?.bucket || this.filters.delivery.bucket
        }
      } else if (this.activeSection === 'gold') {
        this.filters.gold = { ...this.filters.gold, rangePreset: preset, start, end, bucket: resolvePresetRange(preset)?.bucket || this.filters.gold.bucket }
      } else if (this.activeSection === 'capacity') {
        // bucket ของหมวด "กำลังการผลิต" เป็นรายเดือนเสมอ (ยืนยันจาก API agent) ไม่ผันตาม preset แบบหมวดอื่น
        // (สัปดาห์ไม่มีความหมายกับเลข "ใบออก/เดือน")
        this.filters.capacity = { ...this.filters.capacity, rangePreset: preset, start, end, bucket: 'month' }
      }
    },

    // แก้ช่วงเวลากำหนดเองในแผงตัวกรอง — ตั้ง rangePreset เป็น 'custom' ทันทีที่แตะ (ยังอยู่ใน draft จนกว่า
    // จะกด "ใช้ตัวกรอง") ให้ RangePresetGeneric เลิก highlight ปุ่ม preset เมื่อ apply แล้ว
    onDraftCustomRangeChange(field, value) {
      if (this.activeSection === 'wip') {
        this.draftWipFilter = {
          ...this.draftWipFilter,
          [field]: value,
          rangePreset: 'custom',
          bucket: resolveCustomBucket(field === 'start' ? value : this.draftWipFilter.start, field === 'end' ? value : this.draftWipFilter.end)
        }
      } else if (this.activeSection === 'delivery') {
        this.draftDeliveryFilter = {
          ...this.draftDeliveryFilter,
          [field]: value,
          rangePreset: 'custom',
          bucket: resolveCustomBucket(field === 'start' ? value : this.draftDeliveryFilter.start, field === 'end' ? value : this.draftDeliveryFilter.end)
        }
      } else if (this.activeSection === 'gold') {
        this.draftGoldFilter = {
          ...this.draftGoldFilter,
          [field]: value,
          rangePreset: 'custom',
          bucket: resolveCustomBucket(field === 'start' ? value : this.draftGoldFilter.start, field === 'end' ? value : this.draftGoldFilter.end)
        }
      } else if (this.activeSection === 'capacity') {
        // bucket เป็นรายเดือนเสมอ (ดู onRangePresetChange) แม้กำหนดช่วงเองก็ไม่คำนวณจากความยาวช่วงแบบหมวดอื่น
        this.draftCapacityFilter = { ...this.draftCapacityFilter, [field]: value, rangePreset: 'custom', bucket: 'month' }
      }
    }
  },

  created() {
    this.applyQueryToState(this.$route.query)
  }
}
</script>

<style lang="scss" scoped>
// แถบเดียว: nav (ซ้าย) + chips (กลาง, ยืดเต็มที่เหลือ) + ปุ่มตัวกรอง (ขวา) — sticky ใต้ mainbar เสมอ
// (mainbar เป็น position:sticky;top:0 ของทั้งหน้าอยู่แล้ว — ใช้ var(--mainbar-height) แทน hardcode px
// กันซ้อน/มีช่องโหว่ใต้ mainbar ตอนเลื่อนหน้าจอ ถ้าความสูง mainbar เปลี่ยนแก้ที่เดียวใน variable.scss)
.production-insight__toolbar {
  position: sticky;
  top: var(--mainbar-height);
  z-index: 5;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--sp-md);
  background: var(--color-card-bg);
  border-bottom: 1px solid var(--color-border);
  padding: var(--sp-sm) 0;
  margin-bottom: var(--sp-lg);
}

.production-insight__nav {
  flex-shrink: 0;
}

.production-insight__chips {
  flex: 1 1 240px;
  min-width: 0;
  margin-top: 0;
}

.production-insight__filter-btn {
  flex-shrink: 0;
  margin-left: auto;
}

@media (max-width: 1024px) {
  .production-insight__nav {
    flex-basis: 100%;
  }
}

.production-insight__filter-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  margin-left: var(--sp-xs);
  border-radius: var(--radius-lg);
  background: var(--base-font-color);
  color: var(--on-inverse);
  font-size: var(--fs-sm);
  font-weight: 700;
}
</style>
