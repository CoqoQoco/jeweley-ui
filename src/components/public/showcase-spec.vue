<template>
  <div class="showcase-spec">
    <template v-if="materialText">
      <div class="spec-title">{{ $t('view.public.showcase.metalSectionTitle') }}</div>
      <div class="spec-row">
        <span class="spec-row-label">{{ $t('view.public.showcase.materialLabel') }}</span>
        <span class="spec-row-value">{{ materialText }}</span>
      </div>
      <div v-if="metalWeight" class="spec-row">
        <span class="spec-row-label">{{ $t('view.public.showcase.weightLabel') }}</span>
        <span class="spec-row-value">{{ formatWeight(metalWeight) }} {{ metalUnitLabel }}</span>
      </div>
      <div v-if="size" class="spec-row">
        <span class="spec-row-label">{{ $t('view.public.showcase.sizeLabel') }}</span>
        <span class="spec-row-value">{{ size }}</span>
      </div>
      <div v-if="earringStemSize" class="spec-row">
        <span class="spec-row-label">{{ $t('view.public.showcase.earringStemSizeLabel') }}</span>
        <span class="spec-row-value">{{ earringStemSize }}</span>
      </div>
    </template>

    <template v-if="gems && gems.length">
      <div class="spec-title" :class="{ 'spec-title--gap': materialText }">
        {{ $t('view.public.showcase.gemsSectionTitle') }}
      </div>
      <div v-for="(gem, index) in gems" :key="index" class="gem-row">
        <div class="gem-row-main">
          <span class="gem-row-name"><i class="bi bi-gem"></i>{{ gem.name }}</span>
          <span class="gem-row-value">
            {{ gem.qty }} {{ $t('view.public.showcase.gemQtyUnit') }} ·
            {{ formatWeight(gem.weight) }} {{ gemUnitLabel(gem.weightUnit) }}
          </span>
        </div>
        <div v-if="gem.origin" class="gem-row-origin">
          {{ $t('view.public.showcase.originLabel') }}: {{ gem.origin }}
        </div>
      </div>
    </template>
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
      // API ส่งหน่วยพร้อมจุดท้าย (เช่น "g.") — ตัดจุดก่อนเทียบเสมอ
      const unit = (this.metalWeightUnit || '').replace(/\.$/, '')
      if (unit === 'g') return this.$t('view.public.showcase.metalWeightUnitGram')
      return unit
    }
  },

  methods: {
    formatWeight(value) {
      if (value === null || value === undefined || value === '') return ''
      return formatDecimal(value, 2)
    },

    gemUnitLabel(unit) {
      // API ส่งหน่วยพร้อมจุดท้าย (เช่น "ct.") — ตัดจุดก่อนเทียบเสมอ
      const clean = (unit || '').replace(/\.$/, '')
      if (clean === 'ct') return this.$t('view.public.showcase.gemWeightUnitCarat')
      return clean
    }
  }
}
</script>

<style lang="scss" scoped>
.showcase-spec {
  background: var(--color-card-bg);
  border: 1px solid var(--showcase-line);
  border-radius: var(--showcase-radius-md);
  padding: var(--showcase-spec-pad-top) var(--sp-xl) var(--showcase-spec-pad-bottom);
}

.spec-title {
  padding-top: var(--sp-md);
  font-size: var(--showcase-fs-label);
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--base-font-color);

  &--gap {
    margin-top: var(--sp-sm);
  }
}

.spec-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--sp-md);
  padding: var(--sp-md) 0;
  border-top: 1px solid var(--showcase-line-soft);
  font-size: var(--showcase-fs-row);
}

.spec-row-label {
  color: var(--showcase-muted);
}

.spec-row-value {
  color: var(--showcase-ink);
  font-weight: 600;
  text-align: right;
}

.gem-row {
  padding: var(--sp-md) 0;
  border-top: 1px solid var(--showcase-line-soft);
}

.gem-row-main {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--sp-md);
}

.gem-row-name {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-sm);
  font-size: var(--showcase-fs-row);
  font-weight: 600;
  color: var(--showcase-ink);

  i {
    color: var(--showcase-accent);
  }
}

.gem-row-value {
  font-size: var(--showcase-fs-row);
  color: var(--showcase-muted);
  text-align: right;
}

.gem-row-origin {
  margin-top: var(--sp-xs);
  font-size: var(--fs-sm);
  color: var(--showcase-muted);
}
</style>
