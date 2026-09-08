<template>
  <div class="showcase-spec">
    <div v-if="materialText" class="spec-section">
      <div class="spec-section-title">{{ $t('view.public.showcase.metalSectionTitle') }}</div>
      <div class="spec-row">
        <i class="bi bi-gem"></i>
        <span>{{ materialText }}</span>
      </div>
      <div v-if="metalWeight" class="spec-row">
        <i class="bi bi-speedometer2"></i>
        <span>{{ $t('view.public.showcase.weightLabel') }} {{ formatWeight(metalWeight) }} {{ metalUnitLabel }}</span>
      </div>
      <div v-if="size" class="spec-row">
        <i class="bi bi-rulers"></i>
        <span>{{ $t('view.public.showcase.sizeLabel') }} {{ size }}</span>
      </div>
      <div v-if="earringStemSize" class="spec-row">
        <i class="bi bi-rulers"></i>
        <span>{{ $t('view.public.showcase.earringStemSizeLabel') }} {{ earringStemSize }}</span>
      </div>
    </div>

    <div v-if="gems && gems.length" class="spec-section">
      <div class="spec-section-title">{{ $t('view.public.showcase.gemsSectionTitle') }}</div>
      <div v-for="(gem, index) in gems" :key="index" class="gem-row">
        <div class="gem-row-main">
          <span class="gem-name">{{ gem.name }}</span>
          <span class="gem-detail">
            {{ gem.qty }} {{ $t('view.public.showcase.gemQtyUnit') }} ·
            {{ formatWeight(gem.weight) }} {{ gemUnitLabel(gem.weightUnit) }}
          </span>
        </div>
        <div v-if="gem.origin" class="gem-origin">
          {{ $t('view.public.showcase.originLabel') }}: {{ gem.origin }}
        </div>
      </div>
    </div>

    <div
      v-if="isAvailable !== null && isAvailable !== undefined"
      class="availability-badge"
      :class="isAvailable ? 'is-available' : 'is-unavailable'"
    >
      {{ isAvailable ? $t('view.public.showcase.availableYes') : $t('view.public.showcase.availableNo') }}
      <span v-if="isAvailable && availableQty > 1">
        · {{ $t('view.public.showcase.availableCount', { qty: availableQty }) }}
      </span>
    </div>
  </div>
</template>

<script>
import { formatDecimal } from '@/services/utils/decimal.js'

// mapping รหัสสี metal → ชื่อวัสดุ (i18n key ใน view.public.showcase)
const METAL_COLOR_LABEL_KEY = {
  WG: 'materialWhiteGold',
  YG: 'materialYellowGold',
  PG: 'materialPinkGold',
  RG: 'materialPinkGold'
}

export default {
  name: 'ShowcaseSpec',

  props: {
    metalKarat: {
      type: String,
      default: ''
    },
    metalColorCode: {
      type: String,
      default: ''
    },
    metalWeight: {
      type: Number,
      default: null
    },
    metalWeightUnit: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: ''
    },
    earringStemSize: {
      type: String,
      default: ''
    },
    gems: {
      type: Array,
      default: () => []
    },
    isAvailable: {
      type: Boolean,
      default: null
    },
    availableQty: {
      type: Number,
      default: null
    }
  },

  computed: {
    materialText() {
      const karat = this.metalKarat
      const colorCode = this.metalColorCode

      if (!karat && !colorCode) return ''
      if (karat === 'SILVER') return this.$t('view.public.showcase.materialSilver')

      const labelKey = METAL_COLOR_LABEL_KEY[colorCode]
      if (labelKey) {
        const colorLabel = this.$t(`view.public.showcase.${labelKey}`)
        return karat ? `${colorLabel} ${karat}` : colorLabel
      }

      // ไม่รู้จักรหัสสี — แสดง raw code ที่มีต่อกัน กันข้อมูลหาย
      return [colorCode, karat].filter(Boolean).join(' ')
    },

    metalUnitLabel() {
      if (this.metalWeightUnit === 'g') return this.$t('view.public.showcase.metalWeightUnitGram')
      return this.metalWeightUnit || ''
    }
  },

  methods: {
    formatWeight(value) {
      if (value === null || value === undefined || value === '') return ''
      return formatDecimal(value, 2)
    },

    gemUnitLabel(unit) {
      if (unit === 'ct') return this.$t('view.public.showcase.gemWeightUnitCarat')
      return unit || ''
    }
  }
}
</script>

<style lang="scss" scoped>
.showcase-spec {
  display: flex;
  flex-direction: column;
  gap: var(--sp-xl);
}

.spec-section-title {
  font-size: var(--fs-sm);
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--base-font-color);
  margin-bottom: var(--sp-md);
  padding-bottom: var(--sp-sm);
  border-bottom: 1px solid var(--color-border);
}

.spec-row {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  font-size: var(--fs-lg);
  color: var(--base-sub-color);
  line-height: var(--lh-md);

  + .spec-row {
    margin-top: var(--sp-sm);
  }

  i {
    color: var(--base-font-color);
    font-size: var(--fs-base);
    width: 20px;
    text-align: center;
    flex-shrink: 0;
  }
}

.gem-row {
  + .gem-row {
    margin-top: var(--sp-md);
  }
}

.gem-row-main {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--sp-sm);
}

.gem-name {
  font-size: var(--fs-lg);
  font-weight: 600;
  color: var(--base-sub-color);
}

.gem-detail {
  font-size: var(--fs-base);
  color: var(--base-sub-color);
}

.gem-origin {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
  margin-top: var(--sp-xs);
}

.availability-badge {
  align-self: flex-start;
  padding: var(--sp-xs) var(--sp-lg);
  border-radius: var(--radius-lg);
  font-size: var(--fs-sm);
  font-weight: 700;

  &.is-available {
    background: var(--color-green-bg);
    color: var(--base-green);
  }

  &.is-unavailable {
    background: var(--color-highlight-bg);
    color: var(--base-red);
  }
}
</style>
