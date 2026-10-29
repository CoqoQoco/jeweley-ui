<template>
  <div>
    <modal
      :showModal="isShow"
      @closeModal="closeModal"
      width="800px"
      :isShowActionPart="true"
    >
      <template #title>
        <span class="title-text-lg px-3 pt-3 d-block">{{ $t('view.stock.moveLocation.moveTitle') }}</span>
      </template>

      <template #content>
        <div>
          <div class="summary-box mb-3">
            <span class="title-text">{{ $t('view.stock.moveLocation.selectedItems', { count: selectedItems.length }) }}</span>
            <div class="summary-list mt-1">
              <span
                v-for="item in selectedItems"
                :key="item.stockNumber"
                class="summary-tag"
              >
                {{ item.stockNumber }}
              </span>
            </div>
          </div>

          <div v-for="item in choiceItems" :key="item.stockNumber" class="lot-card mb-3">
            <div class="lot-card-head">
              <span class="title-text">{{ item.stockNumber }}</span>
              <span class="lot-card-meta">
                {{ $t('view.stock.moveLocation.lotQtyLabel', { qty: getPieceQty(item) }) }}
                · {{ locationLabel(item) }}
              </span>
            </div>
            <RadioGroupGeneric
              v-model="plans[item.stockNumber].mode"
              :options="modeOptions"
              :inline="true"
              @update:modelValue="onModeChange(item)"
            />

            <div v-if="plans[item.stockNumber].mode === 'qty'" class="form-row two-col mt-2">
              <div class="form-field">
                <span class="title-text">{{ $t('view.stock.moveLocation.fromLocation') }}</span>
                <DropdownGeneric
                  v-model="plans[item.stockNumber].fromLocationCode"
                  :options="fromLocationOptions(item)"
                  optionLabel="label"
                  optionValue="value"
                  :showClear="false"
                />
              </div>
              <div class="form-field">
                <span class="title-text">{{ $t('view.stock.moveLocation.moveQty') }}</span>
                <InputTextGeneric
                  v-model="plans[item.stockNumber].qty"
                  type="number"
                  :min="1"
                  :max="maxQtyFor(item)"
                  :step="1"
                />
              </div>
            </div>

            <div v-if="plans[item.stockNumber].mode === 'units'" class="mt-2">
              <div v-if="plans[item.stockNumber].units.length" class="unit-grid">
                <span class="unit-grid-head"></span>
                <span class="unit-grid-head">{{ $t('view.stock.moveLocation.unitNo') }}</span>
                <span class="unit-grid-head">{{ $t('view.stock.moveLocation.unitLocation') }}</span>
                <span class="unit-grid-head">{{ $t('view.stock.moveLocation.unitStatus') }}</span>
                <span class="unit-grid-head">{{ $t('view.stock.moveLocation.unitTag') }}</span>
                <template v-for="unit in plans[item.stockNumber].units" :key="unit.unitId">
                  <CheckboxGeneric
                    v-model="plans[item.stockNumber].unitIds"
                    :value="unit.unitId"
                    :binary="false"
                    :disabled="isUnitLocked(unit)"
                  />
                  <span>{{ unit.unitNo }}</span>
                  <span>{{ unit.locationCode || '-' }}</span>
                  <span>{{ unit.status }}</span>
                  <span>{{ unit.epc ? $t('view.stock.moveLocation.unitTagBound') : $t('view.stock.moveLocation.unitTagNone') }}</span>
                </template>
              </div>
              <span v-else class="lot-card-meta">{{ $t('view.stock.moveLocation.unitsEmpty') }}</span>
            </div>
          </div>

          <div class="form-row mb-3">
            <div class="form-field">
              <span class="title-text">{{ $t('view.stock.moveLocation.targetLocation') }} <span class="text-danger">*</span></span>
              <DropdownGeneric
                :modelValue="targetLocationCode"
                :options="locationOptions"
                optionLabel="label"
                optionValue="value"
                :placeholder="$t('view.stock.moveLocation.targetLocation')"
                :showClear="true"
                @update:modelValue="targetLocationCode = $event"
              />
            </div>
          </div>

          <div class="mb-3">
            <button
              class="btn btn-sm btn-outline-main"
              type="button"
              @click="toggleCreateForm"
            >
              <i :class="showCreateForm ? 'bi bi-dash' : 'bi bi-plus'"></i>
              {{ showCreateForm ? $t('view.stock.moveLocation.cancelTempSloc') : $t('view.stock.moveLocation.createTempSloc') }}
            </button>
          </div>

          <div v-if="showCreateForm" class="create-sloc-form p-3 mb-3">
            <h6 class="mb-3">{{ $t('view.stock.moveLocation.createTempTitle') }}</h6>
            <div class="form-row two-col mb-2">
              <div class="form-field">
                <span class="title-text">{{ $t('view.stock.moveLocation.code') }} <span class="text-danger">*</span></span>
                <input
                  type="text"
                  class="form-control"
                  v-model.trim="newSloc.code"
                  :placeholder="$t('view.stock.moveLocation.placeholder.tempSlocCode')"
                />
              </div>
              <div class="form-field">
                <span class="title-text">{{ $t('view.stock.moveLocation.name') }} <span class="text-danger">*</span></span>
                <input
                  type="text"
                  class="form-control"
                  v-model.trim="newSloc.nameTh"
                  :placeholder="$t('view.stock.moveLocation.placeholder.tempSlocName')"
                />
              </div>
            </div>
            <div class="form-row mb-2">
              <div class="form-field">
                <span class="title-text">{{ $t('view.stock.moveLocation.locType') }}</span>
                <DropdownGeneric
                  :modelValue="newSloc.type"
                  :options="typeOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="TEMP"
                  :showClear="false"
                  @update:modelValue="newSloc.type = $event"
                />
              </div>
            </div>
            <button class="btn btn-sm btn-green" type="button" @click="onAddSloc">
              <i class="bi bi-plus-circle"></i> {{ $t('view.stock.moveLocation.addSelect') }}
            </button>
          </div>
        </div>
      </template>

      <template #action>
        <button class="btn btn-sm btn-main" type="button" @click="onConfirmMove">
          <i class="bi bi-arrow-left-right"></i> {{ $t('view.stock.moveLocation.confirmMoveBtn') }}
        </button>
        <button class="btn btn-sm btn-outline-main ml-2" type="button" @click="closeModal">
          {{ $t('common.btn.cancel') }}
        </button>
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import RadioGroupGeneric from '@/components/prime-vue/RadioGroupGeneric.vue'
import CheckboxGeneric from '@/components/prime-vue/CheckboxGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import { warning, success, confirmSubmit } from '@/services/alert/sweetAlerts.js'
import { useStockLocationApiStore } from '@/stores/modules/api/stock/stock-location-api.js'
import { useStockMoveLocationApiStore } from '@/stores/modules/api/stock/stock-move-location-api.js'
import { useStockRfidApiStore } from '@/stores/modules/api/stock/rfid-api.js'
import { getPieceQty } from '@/services/utils/stock-piece-qty.js'
import {
  needsMoveChoice,
  getLocationRows,
  getExtraLocationCount,
  buildMoveUnitsPayload,
  validateMovePlan
} from '@/services/utils/stock-location.js'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

const defaultNewSloc = () => ({
  code: null,
  nameTh: null,
  type: 'TEMP'
})

export default {
  name: 'MoveLocationView',

  components: {
    modal,
    DropdownGeneric,
    RadioGroupGeneric,
    CheckboxGeneric,
    InputTextGeneric
  },

  setup() {
    const locationStore = useStockLocationApiStore()
    const moveStore = useStockMoveLocationApiStore()
    const rfidStore = useStockRfidApiStore()
    return { locationStore, moveStore, rfidStore }
  },

  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    selectedItems: {
      type: Array,
      default: () => []
    }
  },

  emits: ['closeModal', 'fetch'],

  computed: {
    locationOptions() {
      return this.locationStore.all
        .filter((item) => item.isActive)
        .map((item) => ({ value: item.code, label: `${item.code} — ${item.nameTh}` }))
    },
    targetLocationLabel() {
      const found = this.locationOptions.find((o) => o.value === this.targetLocationCode)
      return found ? found.label : this.targetLocationCode
    },
    choiceItems() {
      return this.selectedItems.filter((item) => needsMoveChoice(item) && this.plans[item.stockNumber])
    },
    modeOptions() {
      return [
        { value: 'whole', label: this.$t('view.stock.moveLocation.modeWhole') },
        { value: 'qty', label: this.$t('view.stock.moveLocation.modeQty') },
        { value: 'units', label: this.$t('view.stock.moveLocation.modeUnits') }
      ]
    },
    typeOptions() {
      return [
        { value: 'WAREHOUSE', label: this.$t('view.stock.moveLocation.warehouse') },
        { value: 'SHOWROOM', label: this.$t('view.stock.moveLocation.showroom') },
        { value: 'BRANCH', label: this.$t('view.stock.moveLocation.branch') },
        { value: 'TEMP', label: this.$t('view.stock.moveLocation.temp') }
      ]
    }
  },

  watch: {
    async isShow(val) {
      if (val) {
        this.initPlans()
        await this.locationStore.fetchAllForMap()
      } else {
        this.reset()
      }
    }
  },

  data() {
    return {
      targetLocationCode: null,
      plans: {},
      showCreateForm: false,
      newSloc: defaultNewSloc()
    }
  },

  methods: {
    getPieceQty,

    initPlans() {
      const plans = {}
      this.selectedItems.forEach((item) => {
        plans[item.stockNumber] = { mode: 'whole', fromLocationCode: null, qty: 1, unitIds: [], units: [] }
      })
      this.plans = plans
    },

    locationLabel(item) {
      const extra = getExtraLocationCount(item)
      return extra > 0
        ? this.$t('view.stock.product.locationExtra', { code: item.location || '-', n: extra })
        : item.location || '-'
    },

    fromLocationOptions(item) {
      return getLocationRows(item).map((row) => ({
        value: row.code,
        label: this.$t('view.stock.moveLocation.pieceAvailableAt', { code: row.code, qty: row.available ?? row.qty })
      }))
    },

    maxQtyFor(item) {
      const row = getLocationRows(item).find((r) => r.code === this.plans[item.stockNumber]?.fromLocationCode)
      if (row) return Number(row.qty)
      return Math.max(getPieceQty(item), 1)
    },

    isUnitLocked(unit) {
      return unit.status === 'SOLD' || (!!this.targetLocationCode && unit.locationCode === this.targetLocationCode)
    },

    async onModeChange(item) {
      const plan = this.plans[item.stockNumber]
      if (plan.mode === 'qty' && !plan.fromLocationCode) {
        const rows = getLocationRows(item)
        plan.fromLocationCode = rows.length ? rows[0].code : item.location || null
      }
      if (plan.mode === 'units' && !plan.units.length) {
        const res = await this.rfidStore.fetchByStock({ stockNumber: item.stockNumber, productCode: item.productCode })
        plan.units = res?.units || []
      }
    },

    reset() {
      this.plans = {}
      this.targetLocationCode = null
      this.showCreateForm = false
      this.newSloc = defaultNewSloc()
    },

    closeModal() {
      this.reset()
      this.$emit('closeModal')
    },

    toggleCreateForm() {
      this.showCreateForm = !this.showCreateForm
      if (!this.showCreateForm) {
        this.newSloc = defaultNewSloc()
      }
    },

    async onAddSloc() {
      if (!this.newSloc.code || !this.newSloc.code.trim()) {
        warning(this.$t('view.stock.moveLocation.warnCode'), this.$t('view.stock.moveLocation.incomplete'))
        return
      }
      if (!this.newSloc.nameTh || !this.newSloc.nameTh.trim()) {
        warning(this.$t('view.stock.moveLocation.warnName'), this.$t('view.stock.moveLocation.incomplete'))
        return
      }

      const newCode = this.newSloc.code
      await this.locationStore.create({
        code: newCode,
        nameTh: this.newSloc.nameTh,
        nameEn: null,
        type: this.newSloc.type || 'TEMP',
        isTemporary: true,
        isActive: true,
        isSalesPoint: true,
        sortOrder: null
      })
      await this.locationStore.fetchAllForMap()
      this.targetLocationCode = newCode
      this.showCreateForm = false
      this.newSloc = defaultNewSloc()
    },

    onConfirmMove() {
      if (!this.targetLocationCode) {
        warning(this.$t('view.stock.moveLocation.warnTarget'), this.$t('view.stock.moveLocation.incomplete'))
        return
      }

      const plans = this.selectedItems.map((item) => ({
        stockNumber: item.stockNumber,
        ...(this.plans[item.stockNumber] || { mode: 'whole' })
      }))
      for (const [i, plan] of plans.entries()) {
        const maxQty = plan.mode === 'qty' ? this.maxQtyFor(this.selectedItems[i]) : null
        const invalid = validateMovePlan(plan, maxQty)
        if (invalid) {
          const key = invalid === 'qty' ? 'warnQtyPlan' : 'warnUnitsPlan'
          warning(this.$t(`view.stock.moveLocation.${key}`, { stockNumber: plan.stockNumber }), this.$t('view.stock.moveLocation.incomplete'))
          return
        }
      }

      const count = this.selectedItems.length
      const label = this.targetLocationLabel
      const hasPartial = plans.some((p) => p.mode !== 'whole')

      confirmSubmit(
        this.$t('view.stock.moveLocation.confirmMove', { count, label }),
        this.$t('view.stock.moveLocation.confirmMoveTitle'),
        async () => {
          if (hasPartial) {
            const res = await this.moveStore.moveUnits(
              buildMoveUnitsPayload({ targetLocationCode: this.targetLocationCode, plans })
            )
            success(
              res?.movedCount != null
                ? this.$t('view.stock.moveLocation.movedPieces', { count: res.movedCount })
                : this.$t('view.stock.moveLocation.moveSuccess')
            )
          } else {
            const stockNumbers = this.selectedItems.map((item) => item.stockNumber)
            await this.moveStore.moveLocation({
              stockNumbers,
              targetLocationCode: this.targetLocationCode
            })
            success(this.$t('view.stock.moveLocation.moveSuccess'))
          }
          this.$emit('fetch')
          this.closeModal()
        }
      )
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';

.summary-box {
  background: #fdf2f2;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px 16px;
}

.summary-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.summary-tag {
  background: var(--base-font-color);
  color: #fff;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
}

.lot-card {
  border: 1px solid var(--base-border-color, #e0e0e0);
  border-radius: var(--radius-md, 8px);
  padding: var(--sp-md, 12px) var(--sp-lg, 16px);
}

.lot-card-head {
  display: flex;
  justify-content: space-between;
  gap: var(--sp-md, 12px);
  margin-bottom: var(--sp-sm, 8px);
}

.lot-card-meta {
  font-size: 0.85rem;
  color: var(--base-font-color);
}

.unit-grid {
  display: grid;
  grid-template-columns: auto 1fr 1fr 1fr 1fr;
  align-items: center;
  gap: var(--sp-xs, 4px) var(--sp-md, 12px);
  font-size: 0.85rem;
  max-height: 240px;
  overflow-y: auto;
}

.unit-grid-head {
  font-weight: 600;
}

.create-sloc-form {
  border: 1px dashed var(--base-font-color);
  border-radius: 8px;
  background: #fdf9f9;

  h6 {
    color: var(--base-font-color);
    font-weight: 600;
    padding-bottom: 8px;
    border-bottom: 1px solid #f0f0f0;
    background: transparent !important;
  }
}

.form-row {
  margin-bottom: 12px;

  &.two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;

    @media (max-width: 600px) {
      grid-template-columns: 1fr;
    }
  }
}

.form-field {
  width: 100%;

  .title-text {
    display: block;
    margin-bottom: 6px;
  }
}

input.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.9rem;
  line-height: 1.4;

  &:focus {
    border-color: var(--base-font-color);
    box-shadow: none;
    outline: none;
  }
}
</style>
