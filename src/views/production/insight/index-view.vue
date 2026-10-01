<!--
  ProductionInsightView — Dashboard v2 archetype, Revision 2 (per-topic tabs)
  (blueprint: docs/claude-design/blueprints/executive-production.md, "Revision 2" section)

  เมนูย่อยชั้น 2 (ToggleGroupGeneric) 6 หมวด: งานค้างและคอขวด (default) / ส่งงานตรงเวลา / กำลังการผลิต /
  ทองและ Loss / ช่างและค่าแรง / วัตถุดิบที่กระทบการผลิต — ทุกหมวดใช้โครง 4 ส่วนเดียวกัน (InsightTabLayout):
  ปัญหาที่เกิดแล้ว / คาดการณ์ปัญหาที่จะเกิด / วิธีแก้ / รายงาน

  Revision 3: หมวด "งานค้างและคอขวด" (wip) + "ส่งงานตรงเวลา" (delivery) มีเนื้อหาจริงแล้ว (เรียก
  ProductionInsight/Wip, ProductionInsight/Delivery) — อีก 4 หมวดยังเป็น placeholder
  (topic-placeholder-section.vue) จนกว่าจะมี API ของหมวดนั้น — ตัวกรอง (FilterPanelGeneric) มีจริงแค่ 2 หมวด
  นี้ (wip: แผนก/ไม่ขยับเกิน (วัน)/เตือนล่วงหน้า (วัน)/เกณฑ์งานค้างเพิ่มเร็ว, delivery: แผนก/เตือนล่วงหน้า
  (วัน)) หมวดอื่นไม่มีตัวกรองให้กด (ปุ่ม/chip แถวตัวกรองซ่อนไปเลยเมื่อหมวดนั้นไม่มี filter — ดู
  hasFilterableFields) — ทั้ง 2 หมวดถือ range state (rangePreset/start/end/bucket) แยกกันเองใน
  filters.wip/filters.delivery แต่ sync ผ่าน URL query key ร่วมกัน (range/start/end ไม่มี prefix ตาม
  range-presets.js) เฉพาะของหมวดที่เปิดอยู่ ณ ขณะนั้นเท่านั้น (ดู syncStateToQuery)

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
  DELIVERY_DEFAULT_RISK_HORIZON_DAYS
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
        delivery: buildDefaultDeliveryFilter()
      },
      draftWipFilter: buildDefaultWipFilter(),
      draftDeliveryFilter: buildDefaultDeliveryFilter(),
      isFilterPanelOpen: false,
      isApplyingRouteQuery: false
    }
  },

  computed: {
    sectionOptions() {
      return SECTION_VALUES.map((value) => ({ value, label: this.$t(`view.productionInsight.nav.${value}`) }))
    },

    placeholderTopics() {
      return SECTION_VALUES.filter((v) => v !== 'wip' && v !== 'delivery')
    },

    departmentOptions() {
      return DEPARTMENT_KEYS.map((key) => ({ value: key, label: this.$t(`view.executive.department.${key}`) }))
    },

    // มีตัวกรองจริงแค่หมวด "งานค้างและคอขวด"/"ส่งงานตรงเวลา" — หมวดอื่นยังเป็น placeholder ไม่มี filter ให้กด
    hasFilterableFields() {
      return this.activeSection === 'wip' || this.activeSection === 'delivery'
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

    applyQueryToState(query) {
      this.isApplyingRouteQuery = true
      this.activeSection = resolveActiveSection(query.view)
      this.visitedSections.add(this.activeSection)
      this.filters.wip = parseWipFilterQuery(query)
      this.filters.delivery = parseDeliveryFilterQuery(query)
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
            : {}
      const clearedKeys =
        this.activeSection === 'wip'
          ? clearedWipFilterQueryKeys(this.filters.wip)
          : this.activeSection === 'delivery'
            ? clearedDeliveryFilterQueryKeys(this.filters.delivery)
            : []
      const query = { ...this.$route.query, view: this.activeSection, ...sectionQuery }
      clearedKeys.forEach((key) => delete query[key])
      this.$router.replace({ query }).catch(() => {})
    },

    openFilterPanel() {
      this.draftWipFilter = { ...this.filters.wip }
      this.draftDeliveryFilter = { ...this.filters.delivery }
      this.isFilterPanelOpen = true
    },

    closeFilterPanel() {
      this.isFilterPanelOpen = false
    },

    onFilterApply() {
      if (this.activeSection === 'wip') this.filters.wip = { ...this.draftWipFilter }
      else if (this.activeSection === 'delivery') this.filters.delivery = { ...this.draftDeliveryFilter }
      this.closeFilterPanel()
    },

    onFilterClear() {
      if (this.activeSection === 'wip') this.filters.wip = buildDefaultWipFilter()
      else if (this.activeSection === 'delivery') this.filters.delivery = buildDefaultDeliveryFilter()
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
      }
    },

    onClearFilter() {
      if (this.activeSection === 'wip') this.filters.wip = buildDefaultWipFilter()
      else if (this.activeSection === 'delivery') this.filters.delivery = buildDefaultDeliveryFilter()
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
