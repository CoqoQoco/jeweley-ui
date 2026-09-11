<!--
  SourceStripGeneric — แถบคาดบนสุดของ tab/หน้าที่ต้องประกาศ "ต้นทางข้อมูล"
  ใช้เมื่อหน้าจอรวมข้อมูลจากหลายต้นทางที่คีย์คนละที่ (เช่น gold-loss-dashboard: PLAN vs SLIP)
  บอก 3 อย่างเสมอ: ที่มา (ตาราง) · คีย์จากหน้าไหน · นับอะไร/ไม่นับอะไร + ปุ่ม ⓘ กางคำอธิบายยาว

  ตัวอย่างการใช้งาน:
  <SourceStripGeneric source="plan" />
  <SourceStripGeneric source="slip-tang" />
  <SourceStripGeneric source="both" />

  Props:
    source — 'plan' | 'slip-tang' | 'slip-setter' | 'both' (ข้อความอยู่ใน i18n namespace goldLossDashboard.sourceStrip)

  Slots: ไม่มี (ข้อความมาจาก i18n ทั้งหมด เพื่อบังคับให้ทุก source ต้องมีข้อความกำกับ)
-->
<template>
  <div class="source-strip-generic" :class="`source-strip-generic--${accentKey}`">
    <div class="source-strip-generic__row">
      <span class="source-strip-generic__badge">{{ badgeLabel }}</span>
      <i class="bi source-strip-generic__icon" :class="iconClass"></i>
      <span class="source-strip-generic__text">{{ summaryText }}</span>
      <button
        type="button"
        class="source-strip-generic__toggle"
        :aria-expanded="expanded"
        @click="expanded = !expanded"
      >
        <i class="bi" :class="expanded ? 'bi-chevron-up' : 'bi-info-circle'"></i>
        {{ expanded ? $t('view.production.goldLossDashboard.sourceStrip.hideInfo') : $t('view.production.goldLossDashboard.sourceStrip.showInfo') }}
      </button>
    </div>
    <p v-if="expanded" class="source-strip-generic__detail">{{ detailText }}</p>
  </div>
</template>

<script>
const SOURCE_KEY_MAP = {
  plan: 'plan',
  'slip-tang': 'slipTang',
  'slip-setter': 'slipSetter',
  both: 'both'
}

const SOURCE_ACCENT_MAP = {
  plan: 'plan',
  'slip-tang': 'slip',
  'slip-setter': 'slip',
  both: 'both'
}

const SOURCE_ICON_MAP = {
  plan: 'bi-clipboard-data',
  'slip-tang': 'bi-receipt',
  'slip-setter': 'bi-receipt',
  both: 'bi-link-45deg'
}

const SOURCE_BADGE_MAP = {
  plan: 'PLAN',
  'slip-tang': 'SLIP',
  'slip-setter': 'SLIP',
  both: 'BOTH'
}

export default {
  name: 'SourceStripGeneric',

  props: {
    source: {
      type: String,
      required: true,
      validator: (v) => Object.keys(SOURCE_KEY_MAP).includes(v)
    }
  },

  data() {
    return {
      expanded: false
    }
  },

  computed: {
    i18nKey() {
      return SOURCE_KEY_MAP[this.source]
    },

    accentKey() {
      return SOURCE_ACCENT_MAP[this.source]
    },

    iconClass() {
      return SOURCE_ICON_MAP[this.source]
    },

    badgeLabel() {
      return SOURCE_BADGE_MAP[this.source]
    },

    summaryText() {
      return this.$t(`view.production.goldLossDashboard.sourceStrip.${this.i18nKey}.summary`)
    },

    detailText() {
      return this.$t(`view.production.goldLossDashboard.sourceStrip.${this.i18nKey}.detail`)
    }
  }
}
</script>

<style lang="scss" scoped>
// เดิมเป็นแถบพื้นสีเต็มความกว้าง (highlight/green/progress bg) — เบาลงเป็นบรรทัดคำอธิบายเล็ก
// ใต้หัวข้อแทน (แค่เส้นใต้บาง + badge สีตาม accent) เพราะแย่งสายตาจากตัวเลข KPI มากเกินไป
.source-strip-generic {
  padding-bottom: var(--sp-sm);
  margin-bottom: var(--sp-lg);
  border-bottom: 1px solid var(--color-border);
}

.source-strip-generic__row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--sp-sm);
}

.source-strip-generic__badge {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  padding: 1px 6px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--base-sub-color);
  color: var(--base-sub-color);
  flex-shrink: 0;
}

.source-strip-generic--plan .source-strip-generic__badge {
  border-color: var(--base-font-color);
  color: var(--base-font-color);
}

.source-strip-generic--slip .source-strip-generic__badge {
  border-color: var(--base-green);
  color: var(--base-green);
}

.source-strip-generic--both .source-strip-generic__badge {
  border-color: var(--status-progress);
  color: var(--status-progress);
}

.source-strip-generic__icon {
  font-size: var(--fs-base);
  color: var(--base-sub-color);
  flex-shrink: 0;
}

.source-strip-generic__text {
  flex: 1;
  min-width: 200px;
  font-size: var(--fs-sm);
  font-weight: 500;
  color: var(--base-sub-color);
}

.source-strip-generic__toggle {
  border: none;
  background: transparent;
  padding: 0;
  font-size: var(--fs-sm);
  font-weight: 600;
  color: var(--base-font-color);
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    text-decoration: underline;
  }
}

.source-strip-generic__detail {
  margin: var(--sp-xs) 0 0;
  font-size: var(--fs-sm);
  line-height: var(--lh-md);
  color: var(--base-font-sub-color);
}
</style>
