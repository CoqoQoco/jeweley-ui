<!--
  StatCardGeneric — KPI tile (สกัดจาก .kpi-card ใน ticket-dashboard.vue)
  consumer wrap หลายใบใน CSS grid เอง (component นี้ไม่ทำ grid ให้)

  ตัวอย่างการใช้งาน:
  <div class="kpi-grid">
    <StatCardGeneric icon="bi-card-list" :value="summary.total" :label="$t('view.x.kpi.total')" />
    <StatCardGeneric icon="bi-hourglass-split" :value="summary.pending" :label="$t('view.x.kpi.pending')" variant="warning" />
    <StatCardGeneric icon="bi-check-circle" :value="summary.resolved" :label="$t('view.x.kpi.resolved')" variant="green" />
    <StatCardGeneric icon="bi-search" :value="summary.unanalyzed" :label="$t('view.x.kpi.unanalyzed')" variant="grey" />
  </div>

  Props:
    icon    — Bootstrap icon class เช่น 'bi-card-list'
    value   — ค่าตัวเลข/ข้อความหลัก
    label   — คำอธิบาย (i18n caller ส่ง $t(...) มา)
    variant — 'main' | 'warning' | 'green' | 'grey' (default 'main') — สีวงกลม icon
-->
<template>
  <div class="stat-card">
    <div class="stat-icon" :class="`stat-icon--${variant}`">
      <i :class="['bi', icon]"></i>
    </div>
    <div class="stat-content">
      <div class="stat-value">{{ value }}</div>
      <div class="stat-label">{{ label }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StatCardGeneric',

  props: {
    icon: {
      type: String,
      required: true
    },
    value: {
      type: [String, Number],
      default: 0
    },
    label: {
      type: String,
      default: ''
    },
    variant: {
      type: String,
      default: 'main',
      validator: (v) => ['main', 'warning', 'green', 'grey'].includes(v)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/mixin.scss';

.stat-card {
  @include card-base;
  padding: var(--sp-md) var(--sp-lg);
  display: flex;
  align-items: center;
  gap: var(--sp-md);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--base-font-color);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  i {
    font-size: 20px;
    color: #fff;
  }

  &--warning {
    background: var(--base-warning);
  }

  &--green {
    background: var(--base-green);
  }

  &--grey {
    background: var(--base-sub-color);
  }
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: var(--fs-xl);
  font-weight: 700;
  color: var(--base-font-color);
  line-height: var(--lh-sm);
}

.stat-label {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
