<template>
  <SectionCardGeneric
    :title="$t('view.production.goldLossTang.issuedTitle')"
    icon="bi-box-arrow-up"
    accent="main"
    headerStyle="legend"
  >
    <div class="lines-box">
      <div class="lines-grid">
        <div class="lines-row lines-row--base">
          <span class="row-label title-text">{{ $t('view.production.goldLossTang.baseFromJobs') }} ({{ $t('common.field.weight') }})</span>
          <span class="row-weight row-weight--right">{{ fmt2(baseSum) }} {{ $t('view.production.goldLossTang.weightUnit') }}</span>
          <span class="row-action"></span>
        </div>

        <div class="lines-row lines-row--header">
          <span class="row-label title-text">{{ $t('view.production.goldLossTang.lineName') }}</span>
          <span class="row-weight title-text">{{ $t('view.production.goldLossTang.lineWeight') }}</span>
          <span class="row-action"></span>
        </div>

        <template v-if="lines.length > 0">
          <div v-for="(line, idx) in lines" :key="idx" class="lines-row lines-row--input">
            <InputTextGeneric
              :modelValue="line.name"
              :placeholder="$t('view.production.goldLossTang.lineName')"
              @update:modelValue="onUpdate(idx, 'name', $event)"
            />
            <InputTextGeneric
              :modelValue="line.weight"
              type="number"
              step="0.01"
              :min="0"
              :placeholder="$t('view.production.goldLossTang.lineWeight')"
              @update:modelValue="onUpdate(idx, 'weight', $event)"
            />
            <ButtonGeneric
              variant="red"
              icon="bi-trash"
              @click="onRemove(idx)"
            />
          </div>
        </template>
        <div v-else class="lines-row lines-row--empty">
          <span class="empty-hint">{{ $t('view.production.goldLossTang.noExtraLines') }}</span>
        </div>
      </div>

      <div class="lines-add">
        <ButtonGeneric
          variant="main"
          icon="bi-plus"
          :label="$t('view.production.goldLossTang.addIssued')"
          @click="onAdd"
        />
      </div>

      <div class="lines-footer">
        <div class="lines-grid">
          <div class="lines-row lines-row--total">
            <span class="row-label title-text">{{ $t('view.production.goldLossTang.totalIssued') }}</span>
            <span class="row-weight row-weight--right total-value">{{ fmt2(total) }} {{ $t('view.production.goldLossTang.weightUnit') }}</span>
            <span class="row-action"></span>
          </div>
        </div>
      </div>
    </div>
  </SectionCardGeneric>
</template>

<script>
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import { warning } from '@/services/alert/sweetAlerts.js'

export default {
  name: 'GoldLossTangIssuedLinesSection',

  components: {
    SectionCardGeneric,
    InputTextGeneric,
    ButtonGeneric
  },

  props: {
    lines: {
      type: Array,
      default: () => []
    },
    baseSum: {
      type: Number,
      default: 0
    }
  },

  emits: ['update:lines'],

  computed: {
    total() {
      const extraSum = this.lines.reduce((sum, l) => sum + (parseFloat(l.weight) || 0), 0)
      return this.baseSum + extraSum
    }
  },

  methods: {
    fmt2(val) {
      if (val == null) return '0.00'
      return Number(val).toFixed(2)
    },

    onAdd() {
      this.$emit('update:lines', [...this.lines, { name: '', weight: '' }])
    },

    onRemove(idx) {
      const newLines = this.lines.filter((_, i) => i !== idx)
      this.$emit('update:lines', newLines)
    },

    onUpdate(idx, field, val) {
      if (field === 'weight') {
        const num = parseFloat(val)
        if (!isNaN(num) && num < 0) {
          warning(this.$t('view.production.goldLossTang.validationWeightPositive'))
          return
        }
      }
      const newLines = this.lines.map((l, i) => {
        if (i !== idx) return l
        return { ...l, [field]: val }
      })
      this.$emit('update:lines', newLines)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';
@import '@/assets/scss/custom-style/standard-form.scss';

.lines-box {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.lines-grid {
  display: grid;
  grid-template-columns: 1fr 140px 44px;
  gap: var(--sp-xs) var(--sp-sm);
  align-items: center;
}

.lines-add {
  margin-top: var(--sp-sm);
}

.lines-footer {
  margin-top: auto;
  padding-top: var(--sp-sm);
  border-top: 2px solid var(--color-border);
}

.lines-row {
  display: contents;

  &--base {
    .row-label {
      padding: var(--sp-xs) var(--sp-sm);
      color: var(--base-font-color);
      background: var(--color-highlight-bg);
      border-radius: var(--radius-sm);
    }
    .row-weight {
      background: var(--color-highlight-bg);
      padding: var(--sp-xs);
      border-radius: var(--radius-sm);
      border: 1px solid var(--base-font-color);
    }
  }

  &--header {
    .row-label,
    .row-weight {
      font-weight: 700;
      color: var(--base-font-color);
      font-size: var(--fs-sm);
      padding-bottom: var(--sp-xs);
      border-bottom: 1px solid var(--color-border);
    }
  }

  &--input {
    > * {
      width: 100%;
    }
  }

  &--empty {
    grid-column: 1 / -1;
  }

  &--total {
    .row-label {
      padding: var(--sp-xs) 0;
      color: var(--base-font-color);
      padding-top: var(--sp-sm);
    }
    .row-weight {
      padding-top: var(--sp-sm);
    }
    .row-action {
      padding-top: var(--sp-sm);
    }
  }
}

.row-weight {
  text-align: left;

  &--right {
    text-align: right;
    font-weight: 600;
    color: var(--base-font-color);
    padding-right: var(--sp-xs);
  }
}

.row-action {
  display: flex;
  justify-content: center;
}

.total-value {
  font-weight: 700;
  color: var(--base-font-color);
  font-size: var(--fs-lg);
}

.empty-hint {
  display: block;
  text-align: center;
  color: var(--base-font-color);
  opacity: 0.45;
  font-size: var(--fs-sm);
  padding: var(--sp-md) 0;
  grid-column: 1 / -1;
}
</style>
