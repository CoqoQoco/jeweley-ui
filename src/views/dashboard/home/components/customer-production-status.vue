<template>
  <SectionCardGeneric :title="$t('view.dashboard.home.customerProductionStatus.title')" icon="bi-people" accent="main" headerStyle="legend">
    <div class="cps-toggle">
      <RadioGroupGeneric v-model="onlyMine" :options="toggleOptions" optionLabel="label" optionValue="value" :inline="true" @update:modelValue="onToggleChange" />
    </div>

    <div v-if="items.length" class="cps-list">
      <div v-for="(item, idx) in items" :key="item.customerCode || item.customerNumber || idx" class="cps-row">
        <span class="cps-name">{{ item.customerName || item.customerCode || item.customerNumber }}</span>
        <div class="cps-badges">
          <span class="cps-badge cps-badge--process">{{ $t('view.dashboard.home.customerProductionStatus.inProduction') }}: {{ item.inProductionCount ?? item.inProduction ?? 0 }}</span>
          <span class="cps-badge cps-badge--done">{{ $t('view.dashboard.home.customerProductionStatus.completed') }}: {{ item.completedCount ?? item.completed ?? 0 }}</span>
          <span class="cps-badge cps-badge--overdue">{{ $t('view.dashboard.home.customerProductionStatus.overdue') }}: {{ item.overdueCount ?? item.overdue ?? 0 }}</span>
        </div>
      </div>
    </div>
    <div v-else class="empty-state">
      <i class="bi bi-inbox"></i>
      <span>{{ $t('view.dashboard.home.customerProductionStatus.empty') }}</span>
    </div>
  </SectionCardGeneric>
</template>

<script>
import { useHomeDashboardStore } from '@/stores/modules/api/dashboard/home-dashboard-store.js'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import RadioGroupGeneric from '@/components/prime-vue/RadioGroupGeneric.vue'

export default {
  name: 'CustomerProductionStatus',

  components: {
    SectionCardGeneric,
    RadioGroupGeneric
  },

  setup() {
    const homeDashboardStore = useHomeDashboardStore()
    return { homeDashboardStore }
  },

  data() {
    return {
      onlyMine: true
    }
  },

  computed: {
    items() {
      return this.homeDashboardStore.customerProductionStatus.data
    },

    toggleOptions() {
      return [
        { value: true, label: this.$t('view.dashboard.home.customerProductionStatus.onlyMine') },
        { value: false, label: this.$t('view.dashboard.home.customerProductionStatus.all') }
      ]
    }
  },

  methods: {
    onToggleChange(val) {
      this.homeDashboardStore.fetchCustomerProductionStatus(val)
    }
  }
}
</script>

<style lang="scss" scoped>
.cps-toggle {
  margin-bottom: var(--sp-md);
}

.cps-list {
  display: flex;
  flex-direction: column;
  gap: var(--sp-sm);
}

.cps-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--sp-sm);
  padding: var(--sp-sm) 0;
  border-bottom: 1px solid var(--color-border);

  &:last-child {
    border-bottom: none;
  }
}

.cps-name {
  font-weight: 600;
  color: var(--base-font-color);
}

.cps-badges {
  display: flex;
  gap: var(--sp-sm);
  flex-wrap: wrap;
}

.cps-badge {
  font-size: var(--fs-sm);
  padding: 2px var(--sp-sm);
  border-radius: var(--radius-sm);
  background: var(--color-highlight-bg);
  color: var(--base-sub-color);

  &--process {
    color: var(--base-warning);
  }

  &--done {
    color: var(--base-green);
  }

  &--overdue {
    color: var(--base-red);
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-sm);
  padding: var(--sp-xl) 0;
  color: var(--base-sub-color);

  i {
    font-size: 28px;
  }
}
</style>
