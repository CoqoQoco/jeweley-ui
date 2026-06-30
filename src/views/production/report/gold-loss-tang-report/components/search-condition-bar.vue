<template>
  <SectionCardGeneric
    :title="$t('view.production.goldLossTang.conditionBarTitle')"
    icon="bi-funnel-fill"
    accent="green"
    headerStyle="legend"
  >
    <div v-if="!workerCode" class="condition-empty">
      <i class="bi bi-search condition-empty-icon"></i>
      <span class="condition-empty-text">{{ $t('view.production.goldLossTang.conditionEmpty') }}</span>
      <ButtonGeneric
        variant="green"
        icon="bi-search"
        :label="$t('view.production.goldLossTang.btnOpenSearch')"
        class="ml-3"
        @click="$emit('open-search')"
      />
    </div>

    <div v-else class="condition-chips-row">
      <div class="chips-group">
        <span class="condition-chip chip-worker">
          <i class="bi bi-person-fill mr-1"></i>
          {{ workerCode }} - {{ workerName }}
        </span>

        <span class="condition-chip chip-date">
          <i class="bi bi-calendar-range mr-1"></i>
          {{ formatDate(dateStart) }} — {{ formatDate(dateEnd) }}
        </span>

        <span
          v-for="g in goldFilter"
          :key="g"
          class="condition-chip chip-gold"
        >
          {{ g }}
        </span>
      </div>

      <ButtonGeneric
        variant="green"
        icon="bi-search"
        :label="$t('view.production.goldLossTang.btnNewSearch')"
        @click="$emit('open-search')"
      />
    </div>
  </SectionCardGeneric>
</template>

<script>
import { formatDate } from '@/services/utils/dayjs.js'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

export default {
  name: 'SearchConditionBar',

  components: {
    SectionCardGeneric,
    ButtonGeneric
  },

  props: {
    workerCode: {
      type: String,
      default: ''
    },
    workerName: {
      type: String,
      default: ''
    },
    dateStart: {
      type: [Date, null],
      default: null
    },
    dateEnd: {
      type: [Date, null],
      default: null
    },
    goldFilter: {
      type: Array,
      default: () => []
    }
  },

  emits: ['open-search'],

  methods: {
    formatDate(val) {
      if (!val) return '-'
      return formatDate(val)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.condition-empty {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--sp-sm);
  padding: var(--sp-sm) 0;
}

.condition-empty-icon {
  color: var(--base-green);
  font-size: 1.2rem;
}

.condition-empty-text {
  color: var(--base-font-color);
  opacity: 0.7;
  font-size: var(--fs-base);
}

.condition-chips-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--sp-sm);
}

.chips-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--sp-sm);
}

.condition-chip {
  display: inline-flex;
  align-items: center;
  border-radius: var(--radius-lg);
  padding: var(--sp-xs) var(--sp-md);
  font-size: var(--fs-sm);
  font-weight: 600;
  border: 1px solid;
}

.chip-worker {
  background: rgba(3, 131, 135, 0.1);
  border-color: var(--base-green);
  color: var(--base-green);
}

.chip-date {
  background: rgba(3, 131, 135, 0.07);
  border-color: var(--base-green);
  color: var(--base-green);
}

.chip-gold {
  background: var(--color-highlight-bg);
  border-color: var(--base-font-color);
  color: var(--base-font-color);
}
</style>
