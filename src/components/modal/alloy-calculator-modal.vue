<template>
  <modal :showModal="isShow" @closeModal="$emit('closeModal')" width="500px">
    <template #content>
      <div class="p-3">
        <span class="title-text-lg">{{ $t('view.sale.costStock.alloyCalculator.title') }}</span>

        <div class="row mb-2 mt-2">
          <div class="col-6">
            <span class="title-text">{{ $t('view.sale.costStock.alloyCalculator.mainGoldWeight') }}</span>
            <input class="form-control" type="text" :value="formatNumber(goldWeight)" disabled />
          </div>
          <div class="col-6">
            <span class="title-text">{{ $t('view.sale.costStock.alloyCalculator.karat') }}</span>
            <DropdownGeneric
              v-model="karat"
              :options="karatOptions"
              optionLabel="label"
              optionValue="value"
              :placeholder="$t('view.sale.costStock.alloyCalculator.selectKarat')"
            />
          </div>
        </div>

        <div v-if="goldColorFallback" class="alloy-fallback-note">
          {{ $t('view.sale.costStock.alloyCalculator.colorFallbackNote') }}
        </div>

        <table v-if="karat" class="table table-bordered table-sm mt-3">
          <tbody>
            <tr>
              <td>{{ $t('view.sale.costStock.alloyCalculator.goldColor') }}</td>
              <td class="text-right">{{ goldColorTypeCode }}</td>
            </tr>
            <tr>
              <td>{{ $t('common.field.weight') }}</td>
              <td class="text-right">{{ formatNumber(computedQtyWeight) }} g.</td>
            </tr>
            <tr>
              <td>{{ $t('view.sale.costStock.pricePerWeight') }}</td>
              <td class="text-right">{{ formatNumber(computedQtyWeightPrice) }}</td>
            </tr>
          </tbody>
        </table>

        <div class="text-right mt-3">
          <button
            type="button"
            class="btn btn-sm btn-green"
            :disabled="!canConfirm"
            @click="onConfirm"
          >
            <i class="bi bi-check-lg mr-1"></i>
            <span>{{ $t('common.btn.confirm') }}</span>
          </button>
        </div>
      </div>
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

export default {
  name: 'AlloyCalculatorModal',

  components: { modal, DropdownGeneric },

  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    goldWeight: {
      type: Number,
      default: 0
    },
    defaultKarat: {
      type: String,
      default: ''
    },
    goldColorTypeCode: {
      type: String,
      default: 'YG'
    },
    goldColorFallback: {
      type: Boolean,
      default: false
    },
    goldLossPercent: {
      type: Number,
      default: 0
    },
    alloyFactor18K: {
      type: Number,
      default: 0
    },
    alloyFactor14K: {
      type: Number,
      default: 0
    },
    alloyFactor9K: {
      type: Number,
      default: 0
    },
    alloyRateYgWgUsd: {
      type: Number,
      default: 0
    },
    alloyRatePgUsd: {
      type: Number,
      default: 0
    },
    currencyRate: {
      type: Number,
      default: 0
    }
  },

  emits: ['closeModal', 'select'],

  data() {
    return {
      karat: this.defaultKarat
    }
  },

  computed: {
    karatOptions() {
      return [
        { label: '18K', value: '18K' },
        { label: '14K', value: '14K' },
        { label: '9K', value: '9K' }
      ]
    },

    karatFactor() {
      switch (this.karat) {
        case '18K':
          return this.alloyFactor18K
        case '14K':
          return this.alloyFactor14K
        case '9K':
          return this.alloyFactor9K
        default:
          return 0
      }
    },

    alloyRateUsd() {
      const color = (this.goldColorTypeCode || '').toUpperCase()
      return color === 'PG' || color === 'RG' ? this.alloyRatePgUsd : this.alloyRateYgWgUsd
    },

    computedQtyWeight() {
      const weight = Number(this.goldWeight) || 0
      const factor = Number(this.karatFactor) || 0
      const raw = weight * (1 + (Number(this.goldLossPercent) || 0) / 100) * factor
      return this.roundPrice2(raw)
    },

    computedQtyWeightPrice() {
      const rate = Number(this.currencyRate) || 0
      return (Number(this.alloyRateUsd) || 0) * rate
    },

    canConfirm() {
      return !!this.karat && (Number(this.goldWeight) || 0) > 0
    }
  },

  watch: {
    isShow(val) {
      if (val) {
        this.karat = this.defaultKarat
      }
    }
  },

  methods: {
    onConfirm() {
      if (!this.canConfirm) return
      this.$emit('select', {
        karat: this.karat,
        qtyWeight: this.computedQtyWeight,
        qtyWeightPrice: this.computedQtyWeightPrice
      })
    },

    formatNumber(value) {
      const num = Number(value)
      if (!Number.isFinite(num)) return '0.00'
      return num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4
      })
    },

    // ปัดเป็นเลขจริง 2 ตำแหน่ง — ค่าเดียวกับ roundPrice2() ใน breakdown-pdf-builder.js
    // เพื่อให้ค่าที่ emit ออกไปตรงกับค่าที่แสดงบนหน้าจอเป๊ะ
    roundPrice2(num) {
      const n = Number(num)
      if (!Number.isFinite(n)) return 0
      return Math.round((n + Number.EPSILON) * 100) / 100
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.table th,
.table td {
  vertical-align: middle;
  padding: var(--sp-xs) var(--sp-sm);
}

.alloy-fallback-note {
  margin-top: var(--sp-sm);
  font-size: 0.8rem;
  color: var(--base-warning);
}
</style>
