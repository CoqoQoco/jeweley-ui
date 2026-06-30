<template>
  <SectionCardGeneric :title="$t('view.production.goldLossTang.returnedTitle')">
    <div class="base-sum mb-2">
      <span class="title-text">{{ $t('view.production.goldLossTang.baseFromJobs') }} ({{ $t('common.field.weight') }})</span>
      <span class="base-value">{{ fmt4(baseSum) }} {{ $t('view.production.goldLossTang.weightUnit') }}</span>
    </div>

    <div v-for="(line, idx) in lines" :key="idx" class="line-row mb-1">
      <FormFieldGeneric :label="$t('view.production.goldLossTang.lineName')">
        <InputTextGeneric
          :modelValue="line.name"
          :placeholder="$t('view.production.goldLossTang.lineName')"
          @update:modelValue="onUpdate(idx, 'name', $event)"
        />
      </FormFieldGeneric>
      <FormFieldGeneric :label="$t('view.production.goldLossTang.lineWeight')" class="ml-2">
        <InputTextGeneric
          :modelValue="line.weight"
          type="number"
          step="0.0001"
          :min="0"
          :placeholder="$t('view.production.goldLossTang.lineWeight')"
          @update:modelValue="onUpdate(idx, 'weight', $event)"
        />
      </FormFieldGeneric>
      <div class="line-delete ml-2">
        <ButtonGeneric
          variant="red"
          icon="bi-trash"
          @click="onRemove(idx)"
        />
      </div>
    </div>

    <div class="mt-2">
      <ButtonGeneric
        variant="main"
        icon="bi-plus"
        :label="$t('view.production.goldLossTang.addReturned')"
        @click="onAdd"
      />
    </div>

    <div class="total-row mt-2">
      <span class="title-text">{{ $t('view.production.goldLossTang.totalReturned') }}</span>
      <span class="total-value">{{ fmt4(total) }} {{ $t('view.production.goldLossTang.weightUnit') }}</span>
    </div>
  </SectionCardGeneric>
</template>

<script>
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import { warning } from '@/services/alert/sweetAlerts.js'

export default {
  name: 'GoldLossTangReturnedLinesSection',

  components: {
    SectionCardGeneric,
    FormFieldGeneric,
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
    fmt4(val) {
      if (val == null) return '0.0000'
      return Number(val).toFixed(4)
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

.base-sum {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--sp-sm) var(--sp-md);
  background: var(--color-highlight-bg);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
}

.base-value {
  font-weight: 600;
  color: var(--base-font-color);
}

.line-row {
  display: flex;
  align-items: flex-end;
  gap: var(--sp-sm);
}

.line-delete {
  display: flex;
  align-items: flex-end;
  padding-bottom: 2px;
}

.total-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--sp-sm) var(--sp-md);
  border-top: 2px solid var(--color-border);
}

.total-value {
  font-weight: 700;
  color: var(--base-font-color);
  font-size: var(--fs-lg);
}
</style>
