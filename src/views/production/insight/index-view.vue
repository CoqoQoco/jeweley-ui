<!--
  ProductionInsightView — Dashboard v2 archetype (blueprint: docs/claude-design/blueprints/executive-production.md)
  หมวดย่อย 2 ชั้น (ToggleGroupGeneric) + ตัวกรองแบบ slide panel (FilterPanelGeneric) + chip ตัวกรอง
  (ActiveFilterChipsGeneric) — โหลดข้อมูลเฉพาะหมวดที่เปิด (mount ครั้งแรกแล้วค้างด้วย v-show)

  Phase 1: เฉพาะหมวด "ภาพรวม" มีเนื้อหาจริง — อีก 4 หมวดแสดง placeholder พร้อมลิงก์กลับไปหน้าเดิม
  ("งานค้าง"/"ทอง" รับเนื้อหาเสริมจาก host ผ่าน slot #wip-extra/#gold-extra เพื่อให้ /executive คง
  ตาราง stale-plans + gold trend เดิมไว้ ไม่ให้ boss เสียของ)

  URL sync: อ่าน query ครั้งเดียวใน created() แล้ว $router.replace ตอนเปลี่ยน — คง query key อื่นของ host
  ไว้เสมอ (เช่น executive ?tab=)
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
        class="production-insight__chips"
        :chips="activeChips"
        @remove="onRemoveChip"
        @clear-all="onClearFilter"
      />

      <ButtonGeneric variant="outline" icon="bi-sliders" class="production-insight__filter-btn" @click="openFilterPanel">
        {{ $t('view.productionInsight.filter.button') }}
        <span v-if="activeChips.length" class="production-insight__filter-badge">{{ activeChips.length }}</span>
      </ButtonGeneric>
    </div>

    <div class="production-insight__body">
      <OverviewSection v-show="activeSection === 'overview'" :filter="filter" @switch-section="onSwitchSection" />

      <template v-for="section in placeholderSections" :key="section.value">
        <div v-if="visitedSections.has(section.value)" v-show="activeSection === section.value" class="production-insight__placeholder-wrap">
          <div class="insight-placeholder">
            <i class="bi bi-signpost-2"></i>
            <p>{{ $t('view.productionInsight.placeholder.message') }}</p>
            <router-link :to="section.linkTo">
              {{ section.linkLabel }}
              <i class="bi bi-chevron-right"></i>
            </router-link>
          </div>
          <slot :name="`${section.value}-extra`" />
        </div>
      </template>
    </div>

    <FilterPanelGeneric
      :show="isFilterPanelOpen"
      :title="$t('view.productionInsight.filter.title')"
      width="420px"
      @apply="onFilterApply"
      @clear="onFilterClear"
      @close="onFilterPanelClose"
    >
      <template #global>
        <FormFieldGeneric :label="$t('view.production.dashboard.filterDateRange')">
          <DateRangeGeneric
            :startDate="draftFilter.start"
            :endDate="draftFilter.end"
            @update:startDate="draftFilter.start = $event"
            @update:endDate="draftFilter.end = $event"
          />
        </FormFieldGeneric>
        <FormFieldGeneric :label="$t('view.production.dashboard.filterGold')">
          <MultiSelectGeneric
            v-model="draftFilter.gold"
            :options="masterApiStore.gold"
            optionLabel="nameTh"
            optionValue="nameEn"
            :placeholder="$t('common.label.all')"
            :showClear="true"
          />
        </FormFieldGeneric>
        <FormFieldGeneric :label="$t('view.production.dashboard.filterGoldSize')">
          <MultiSelectGeneric
            v-model="draftFilter.goldSize"
            :options="masterApiStore.goldSize"
            optionLabel="nameTh"
            optionValue="nameEn"
            :placeholder="$t('common.label.all')"
            :showClear="true"
          />
        </FormFieldGeneric>
        <FormFieldGeneric :label="$t('view.production.dashboard.productType')">
          <MultiSelectGeneric
            v-model="draftFilter.productType"
            :options="masterApiStore.productType"
            optionLabel="nameTh"
            optionValue="code"
            :placeholder="$t('common.label.all')"
            :showClear="true"
          />
        </FormFieldGeneric>
        <FormFieldGeneric :label="$t('view.production.dashboard.customerType')">
          <MultiSelectGeneric
            v-model="draftFilter.customerType"
            :options="masterApiStore.customerType"
            optionLabel="nameTh"
            optionValue="code"
            :placeholder="$t('common.label.all')"
            :showClear="true"
          />
        </FormFieldGeneric>
      </template>
    </FilterPanelGeneric>
  </div>
</template>

<script>
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'
import {
  SECTION_VALUES,
  resolveActiveSection,
  buildDefaultFilter,
  buildDefaultDateRange,
  parseFilterQuery,
  filterToQuery,
  clearedFilterQueryKeys,
  buildActiveChips,
  formatChipDateRange
} from './insight-filters.js'

import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import ToggleGroupGeneric from '@/components/generic/ToggleGroupGeneric.vue'
import FilterPanelGeneric from '@/components/generic/FilterPanelGeneric.vue'
import ActiveFilterChipsGeneric from '@/components/generic/ActiveFilterChipsGeneric.vue'
import DateRangeGeneric from '@/components/prime-vue/DateRangeGeneric.vue'
import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'
import OverviewSection from './sections/overview-section.vue'

const PLACEHOLDER_SECTION_VALUES = SECTION_VALUES.filter((v) => v !== 'overview')

export default {
  name: 'ProductionInsightView',

  components: {
    ButtonGeneric,
    FormFieldGeneric,
    ToggleGroupGeneric,
    FilterPanelGeneric,
    ActiveFilterChipsGeneric,
    DateRangeGeneric,
    MultiSelectGeneric,
    OverviewSection
  },

  setup() {
    const masterApiStore = useMasterApiStore()
    return { masterApiStore }
  },

  data() {
    return {
      activeSection: 'overview',
      visitedSections: new Set(['overview']),
      filter: buildDefaultFilter(),
      draftFilter: buildDefaultFilter(),
      isFilterPanelOpen: false,
      isApplyingRouteQuery: false
    }
  },

  computed: {
    sectionOptions() {
      return SECTION_VALUES.map((value) => ({ value, label: this.$t(`view.productionInsight.nav.${value}`) }))
    },

    placeholderSections() {
      return PLACEHOLDER_SECTION_VALUES.map((value) => ({
        value,
        linkTo: value === 'gold' ? '/gold-loss-dashboard' : '/production-dashboard',
        linkLabel: this.$t(`view.productionInsight.placeholder.link.${value}`)
      }))
    },

    activeChips() {
      return buildActiveChips(
        [
          { key: 'dateRange', label: '', value: formatChipDateRange(this.filter.start, this.filter.end), alwaysShow: true },
          { key: 'gold', label: this.$t('view.production.dashboard.filterGold'), value: this.resolveCodesLabel(this.filter.gold, this.masterApiStore.gold, 'nameEn', 'nameTh') },
          { key: 'goldSize', label: this.$t('view.production.dashboard.filterGoldSize'), value: this.resolveCodesLabel(this.filter.goldSize, this.masterApiStore.goldSize, 'nameEn', 'nameTh') },
          { key: 'productType', label: this.$t('view.production.dashboard.productType'), value: this.resolveCodesLabel(this.filter.productType, this.masterApiStore.productType, 'code', 'nameTh') },
          { key: 'customerType', label: this.$t('view.production.dashboard.customerType'), value: this.resolveCodesLabel(this.filter.customerType, this.masterApiStore.customerType, 'code', 'nameTh') }
        ],
        this.activeSection
      )
    }
  },

  watch: {
    activeSection() {
      this.visitedSections.add(this.activeSection)
      this.syncStateToQuery()
    },

    filter: {
      handler() {
        this.syncStateToQuery()
      },
      deep: true
    }
  },

  methods: {
    resolveCodesLabel(codes, options, valueKey, labelKey) {
      if (!codes || !codes.length) return ''
      return codes
        .map((code) => {
          const found = (options || []).find((o) => o[valueKey] === code)
          return found ? found[labelKey] : code
        })
        .join(', ')
    },

    applyQueryToState(query) {
      this.isApplyingRouteQuery = true
      this.activeSection = resolveActiveSection(query.view)
      this.visitedSections.add(this.activeSection)
      this.filter = parseFilterQuery(query)
      this.$nextTick(() => {
        this.isApplyingRouteQuery = false
      })
    },

    syncStateToQuery() {
      if (this.isApplyingRouteQuery) return
      const query = { ...this.$route.query, view: this.activeSection, ...filterToQuery(this.filter) }
      clearedFilterQueryKeys(this.filter).forEach((key) => delete query[key])
      this.$router.replace({ query }).catch(() => {})
    },

    onSwitchSection(section) {
      this.activeSection = resolveActiveSection(section)
    },

    openFilterPanel() {
      this.draftFilter = { ...this.filter }
      this.isFilterPanelOpen = true
    },

    closeFilterPanel() {
      this.isFilterPanelOpen = false
    },

    onFilterApply() {
      this.filter = { ...this.draftFilter }
      this.closeFilterPanel()
    },

    onFilterClear() {
      this.filter = buildDefaultFilter()
      this.closeFilterPanel()
    },

    onFilterPanelClose() {
      this.closeFilterPanel()
    },

    onRemoveChip(key) {
      const next = { ...this.filter }
      if (key === 'dateRange') {
        const defaults = buildDefaultDateRange()
        next.start = defaults.start
        next.end = defaults.end
      } else {
        next[key] = []
      }
      this.filter = next
    },

    onClearFilter() {
      this.filter = buildDefaultFilter()
    }
  },

  created() {
    this.applyQueryToState(this.$route.query)
    if (!this.masterApiStore.gold.length) this.masterApiStore.fetchGold()
    if (!this.masterApiStore.goldSize.length) this.masterApiStore.fetchGoldSize()
    if (!this.masterApiStore.productType.length) this.masterApiStore.fetchProductType()
    if (!this.masterApiStore.customerType.length) this.masterApiStore.fetchCustomerType()
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

.production-insight__placeholder-wrap {
  display: flex;
  flex-direction: column;
  gap: var(--sp-lg);
}

.insight-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--sp-sm);
  padding: var(--sp-2xl);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-card-bg);
  color: var(--base-sub-color);
  text-align: center;

  i {
    font-size: var(--fs-xl);
    color: var(--base-sub-color);
  }

  p {
    margin: 0;
    font-size: var(--fs-base);
  }

  a {
    display: inline-flex;
    align-items: center;
    gap: var(--sp-xs);
    color: var(--base-green);
    font-weight: 600;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
