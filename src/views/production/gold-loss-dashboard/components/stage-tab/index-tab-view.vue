<template>
  <div>
    <SourceStripGeneric source="plan" />

    <div class="group-by-row">
      <span class="title-text">{{ $t('view.production.goldLossDashboard.groupByLabel') }}</span>
      <div class="group-by-toggle" role="tablist">
        <button
          type="button"
          class="group-by-toggle__btn"
          :class="{ 'group-by-toggle__btn--active': groupBy === 'stage' }"
          @click="setGroupBy('stage')"
        >
          {{ $t('view.production.goldLossDashboard.groupByStage') }}
        </button>
        <button
          type="button"
          class="group-by-toggle__btn"
          :class="{ 'group-by-toggle__btn--active': groupBy === 'gold' }"
          @click="setGroupBy('gold')"
        >
          {{ $t('view.production.goldLossDashboard.groupByGold') }}
        </button>
      </div>
    </div>

    <ByStageView v-if="groupBy === 'stage'" ref="byStageRef" :modelForm="stageModelForm" />
    <ByGoldTypeView v-else :period="period" :defaultDept="defaultDept" />
  </div>
</template>

<script>
import SourceStripGeneric from '@/components/generic/SourceStripGeneric.vue'
import ByStageView from './by-stage-view.vue'
import ByGoldTypeView from './by-gold-type-view.vue'

// แผนกที่มีการคืนทองจริง — ห้ามรวม 95 (บัตรต้นทุน) / 100 (สำเร็จ) / 500 เพราะไม่มีการคืนทองให้คำนวณ loss
const GOLD_LOSS_STAGE_CODES = [50, 60, 70, 80, 90]

export default {
  name: 'GoldLossStageTabView',

  components: {
    SourceStripGeneric,
    ByStageView,
    ByGoldTypeView
  },

  props: {
    filter: {
      type: Object,
      default: () => ({})
    },
    initialGroup: {
      type: String,
      default: 'stage'
    }
  },

  emits: ['update:group'],

  data() {
    return {
      groupBy: this.initialGroup === 'gold' ? 'gold' : 'stage'
    }
  },

  computed: {
    // GoldLossByStageReport ทำงานเป็นรายเดือน — ตัดช่วงวันที่ของ shared filter เหลือเดือนเดียวจากวันสิ้นสุด (ถ้าไม่ได้เลือกใช้เดือนปัจจุบัน)
    period() {
      const end = this.filter.end ? new Date(this.filter.end) : new Date()
      return {
        year: end.getFullYear(),
        month: end.getMonth() + 1
      }
    },

    effectiveStatus() {
      return this.filter.status && this.filter.status.length ? this.filter.status : GOLD_LOSS_STAGE_CODES
    },

    stageModelForm() {
      return {
        year: this.period.year,
        month: this.period.month,
        status: this.effectiveStatus
      }
    },

    defaultDept() {
      return this.effectiveStatus[0] || GOLD_LOSS_STAGE_CODES[0]
    }
  },

  methods: {
    setGroupBy(value) {
      if (this.groupBy === value) return
      this.groupBy = value
      this.$emit('update:group', value)
    },

    exportExcel() {
      if (this.groupBy === 'stage' && this.$refs.byStageRef) {
        this.$refs.byStageRef.exportExcel()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.group-by-row {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  margin-bottom: var(--sp-lg);

  .title-text {
    white-space: nowrap;
    font-weight: 600;
    color: var(--base-font-color);
  }
}

.group-by-toggle {
  display: inline-flex;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.group-by-toggle__btn {
  border: none;
  background: var(--color-card-bg);
  padding: var(--sp-xs) var(--sp-lg);
  font-size: var(--fs-base);
  font-weight: 600;
  color: var(--base-sub-color);
  cursor: pointer;

  & + & {
    border-left: 1px solid var(--color-border);
  }

  &:hover {
    background: var(--color-highlight-bg);
  }

  &--active {
    background: var(--base-font-color);
    color: #fff;
  }
}
</style>
