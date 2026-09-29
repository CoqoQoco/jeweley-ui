<!--
  ProductionInsightView — Dashboard v2 archetype, Revision 2 (per-topic tabs)
  (blueprint: docs/claude-design/blueprints/executive-production.md, "Revision 2" section)

  เมนูย่อยชั้น 2 (ToggleGroupGeneric) 6 หมวด: งานค้างและคอขวด (default) / ส่งงานตรงเวลา / กำลังการผลิต /
  ทองและ Loss / ช่างและค่าแรง / วัตถุดิบที่กระทบการผลิต — ทุกหมวดใช้โครง 4 ส่วนเดียวกัน (InsightTabLayout):
  ปัญหาที่เกิดแล้ว / คาดการณ์ปัญหาที่จะเกิด / วิธีแก้ / รายงาน

  Revision 2: เฉพาะหมวด "งานค้างและคอขวด" (wip) มีเนื้อหาจริง (เรียก ProductionInsight/Wip) — อีก 5 หมวด
  เป็น placeholder (topic-placeholder-section.vue) จนกว่าจะมี API ของหมวดนั้น — ตัวกรอง (FilterPanelGeneric)
  ตอนนี้มีจริงแค่หมวด wip เท่านั้น (แผนก/ไม่ขยับเกิน (วัน)/เตือนล่วงหน้า (วัน)) หมวดอื่นไม่มีตัวกรองให้กด
  (ปุ่ม/chip แถวตัวกรองซ่อนไปเลยเมื่อหมวดนั้นไม่มี filter — ดู hasFilterableFields)

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
      <WipSection v-show="activeSection === 'wip'" :filter="filters.wip" />

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
      <template v-if="activeSection === 'wip'" #section-title>{{ $t('view.productionInsight.wip.filterSectionTitle') }}</template>
      <template v-if="activeSection === 'wip'" #section>
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
  WIP_DEFAULT_RISK_WINDOW_DAYS
} from './insight-filters.js'

import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import ToggleGroupGeneric from '@/components/generic/ToggleGroupGeneric.vue'
import FilterPanelGeneric from '@/components/generic/FilterPanelGeneric.vue'
import ActiveFilterChipsGeneric from '@/components/generic/ActiveFilterChipsGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'
import WipSection from './sections/wip-section.vue'
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
    InputTextGeneric,
    MultiSelectGeneric,
    WipSection,
    TopicPlaceholderSection
  },

  data() {
    return {
      activeSection: 'wip',
      visitedSections: new Set(['wip']),
      filters: {
        wip: buildDefaultWipFilter()
      },
      draftWipFilter: buildDefaultWipFilter(),
      isFilterPanelOpen: false,
      isApplyingRouteQuery: false
    }
  },

  computed: {
    sectionOptions() {
      return SECTION_VALUES.map((value) => ({ value, label: this.$t(`view.productionInsight.nav.${value}`) }))
    },

    placeholderTopics() {
      return SECTION_VALUES.filter((v) => v !== 'wip')
    },

    departmentOptions() {
      return DEPARTMENT_KEYS.map((key) => ({ value: key, label: this.$t(`view.executive.department.${key}`) }))
    },

    // ตอนนี้มีตัวกรองจริงแค่หมวด "งานค้างและคอขวด" — หมวดอื่นยังเป็น placeholder ไม่มี filter ให้กด
    hasFilterableFields() {
      return this.activeSection === 'wip'
    },

    activeChips() {
      if (this.activeSection !== 'wip') return []
      const f = this.filters.wip
      return buildActiveChips([
        { key: 'departmentKeys', label: this.$t('view.productionInsight.wip.filterDept'), value: this.resolveDeptLabels(f.departmentKeys) },
        { key: 'staleDays', label: this.$t('view.productionInsight.wip.filterStaleDays'), value: f.staleDays !== WIP_DEFAULT_STALE_DAYS ? String(f.staleDays) : '' },
        { key: 'riskWindowDays', label: this.$t('view.productionInsight.wip.filterRiskWindowDays'), value: f.riskWindowDays !== WIP_DEFAULT_RISK_WINDOW_DAYS ? String(f.riskWindowDays) : '' }
      ])
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
      this.$nextTick(() => {
        this.isApplyingRouteQuery = false
      })
    },

    syncStateToQuery() {
      if (this.isApplyingRouteQuery) return
      const query = { ...this.$route.query, view: this.activeSection, ...wipFilterToQuery(this.filters.wip) }
      clearedWipFilterQueryKeys(this.filters.wip).forEach((key) => delete query[key])
      this.$router.replace({ query }).catch(() => {})
    },

    openFilterPanel() {
      this.draftWipFilter = { ...this.filters.wip }
      this.isFilterPanelOpen = true
    },

    closeFilterPanel() {
      this.isFilterPanelOpen = false
    },

    onFilterApply() {
      this.filters.wip = { ...this.draftWipFilter }
      this.closeFilterPanel()
    },

    onFilterClear() {
      this.filters.wip = buildDefaultWipFilter()
      this.closeFilterPanel()
    },

    onFilterPanelClose() {
      this.closeFilterPanel()
    },

    onRemoveChip(key) {
      const next = { ...this.filters.wip }
      if (key === 'departmentKeys') next.departmentKeys = []
      else if (key === 'staleDays') next.staleDays = WIP_DEFAULT_STALE_DAYS
      else if (key === 'riskWindowDays') next.riskWindowDays = WIP_DEFAULT_RISK_WINDOW_DAYS
      this.filters.wip = next
    },

    onClearFilter() {
      this.filters.wip = buildDefaultWipFilter()
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
