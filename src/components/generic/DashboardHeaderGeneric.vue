<!--
  DashboardHeaderGeneric — header ของหน้า dashboard (สกัดจาก .dashboard-header ใน ticket-dashboard.vue)
  icon + title/subtitle + slot #controls (เช่น period DropdownGeneric) + ปุ่ม refresh

  ตัวอย่างการใช้งาน:
  <DashboardHeaderGeneric
    :title="$t('view.x.dashboard.title')"
    :subtitle="$t('view.x.dashboard.subtitle')"
    @refresh="loadDashboard"
  >
    <template #controls>
      <DropdownGeneric :modelValue="selectedPeriod" :options="periodOptions" optionLabel="label" optionValue="value"
        @update:modelValue="onPeriodChange" />
    </template>
  </DashboardHeaderGeneric>

  Props:
    title       — หัวข้อ dashboard (i18n caller ส่ง $t(...) มา)
    subtitle    — คำอธิบายรอง (optional, i18n caller ส่ง $t(...) มา)
    icon        — Bootstrap icon class (default 'bi-clipboard-data')
    showRefresh — แสดงปุ่ม refresh (default true)

  Slots:
    #controls — วางก่อนปุ่ม refresh (เช่น DropdownGeneric period)

  Emits: refresh
-->
<template>
  <div class="dashboard-header">
    <div class="dashboard-heading">
      <div class="dashboard-icon"><i :class="['bi', icon]"></i></div>
      <div class="dashboard-heading-text">
        <span class="dashboard-title">{{ title }}</span>
        <span v-if="subtitle" class="dashboard-subtitle">{{ subtitle }}</span>
      </div>
    </div>
    <div class="dashboard-controls">
      <slot name="controls" />
      <ButtonGeneric
        v-if="showRefresh"
        variant="outline"
        icon="bi-arrow-clockwise"
        :title="$t('common.btn.refresh')"
        class="ml-2"
        @click="$emit('refresh')"
      />
    </div>
  </div>
</template>

<script>
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

export default {
  name: 'DashboardHeaderGeneric',

  components: {
    ButtonGeneric
  },

  props: {
    title: {
      type: String,
      default: ''
    },
    subtitle: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: 'bi-clipboard-data'
    },
    showRefresh: {
      type: Boolean,
      default: true
    }
  },

  emits: ['refresh']
}
</script>

<style lang="scss" scoped>
.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--sp-lg);
  flex-wrap: wrap;
  gap: var(--sp-sm);
  border-bottom: 2px solid var(--base-font-color);
  padding-bottom: var(--sp-md);
}

.dashboard-heading {
  display: flex;
  align-items: center;
  gap: var(--sp-md);
}

.dashboard-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: var(--base-font-color);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  i {
    font-size: 22px;
    color: #fff;
  }
}

.dashboard-heading-text {
  display: flex;
  flex-direction: column;
}

.dashboard-title {
  font-size: var(--fs-xl);
  font-weight: 700;
  color: var(--base-font-color);
  line-height: var(--lh-sm);
}

.dashboard-subtitle {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}

.dashboard-controls {
  display: flex;
  align-items: center;
}
</style>
