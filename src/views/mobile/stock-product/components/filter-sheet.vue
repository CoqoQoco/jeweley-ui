<template>
  <Teleport to="body">
    <div v-if="isShow" class="filter-sheet-overlay">
      <div class="filter-sheet-container">
        <div class="filter-sheet-header">
          <h3 class="filter-sheet-title">
            <i class="bi bi-funnel"></i>
            {{ $t('view.mobile.stockProduct.filterTitle') }}
          </h3>
          <button type="button" class="btn-close-sheet" @click="onClose">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="filter-sheet-body">
          <div class="filter-field">
            <label>{{ $t('view.stock.product.stockNumberNew') }}</label>
            <InputTextGeneric v-model.trim="form.stockNumber" placeholder="EX: DK-2502-00X" />
          </div>

          <div class="filter-field">
            <label>{{ $t('view.stock.product.stockNumberOld') }}</label>
            <InputTextGeneric v-model.trim="form.stockNumberOrigin" placeholder="EX: A0211XX" />
          </div>

          <div class="filter-field">
            <label>{{ $t('view.stock.product.productNumber') }}</label>
            <InputTextGeneric v-model.trim="form.productNumber" placeholder="EX: R08X50XXXL" />
          </div>

          <div class="filter-field">
            <label>{{ $t('view.stock.product.locationFilterLabel') }}</label>
            <div class="chip-group">
              <button
                v-for="opt in locationOptions"
                :key="opt.value"
                type="button"
                class="chip-btn"
                :class="{ active: isSelected('locationCodes', opt.value) }"
                @click="toggleMulti('locationCodes', opt.value)"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>

          <div class="filter-field">
            <label>{{ $t('view.stock.product.receiptType') }}</label>
            <div class="chip-group">
              <button
                v-for="opt in receiptTypeOptions"
                :key="opt.value"
                type="button"
                class="chip-btn"
                :class="{ active: isSelected('receiptType', opt.value) }"
                @click="toggleMulti('receiptType', opt.value)"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>

          <div class="filter-field">
            <label>{{ $t('view.stock.product.mold') }}</label>
            <InputTextGeneric v-model.trim="form.mold" placeholder="EX: CN-2400XX" />
          </div>

          <div class="filter-field">
            <label>{{ $t('view.stock.product.productNameEn') }}</label>
            <InputTextGeneric v-model.trim="form.productNameEn" placeholder="EX: Gold Ring #66" />
          </div>

          <div class="filter-field">
            <label>{{ $t('view.stock.product.productNameTh') }}</label>
            <InputTextGeneric v-model.trim="form.productNameTh" placeholder="EX: แหวนทอง ขนาด #66" />
          </div>

          <div class="filter-field">
            <label>{{ $t('view.stock.product.wo') }}</label>
            <InputTextGeneric v-model.trim="form.woText" placeholder="EX: 6802017XX" />
          </div>

          <div class="filter-field">
            <label>{{ $t('view.stock.product.size') }}</label>
            <InputTextGeneric v-model.trim="form.size" placeholder="EX: #66" />
          </div>

          <div class="filter-field">
            <label>{{ $t('view.stock.product.productType') }}</label>
            <div class="chip-group">
              <button
                v-for="opt in productTypeOptions"
                :key="opt.value"
                type="button"
                class="chip-btn"
                :class="{ active: isSelected('productType', opt.value) }"
                @click="toggleMulti('productType', opt.value)"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>

          <div class="filter-field">
            <label>{{ $t('view.stock.product.goldColor') }}</label>
            <div class="chip-group">
              <button
                v-for="opt in goldOptions"
                :key="opt.value"
                type="button"
                class="chip-btn"
                :class="{ active: isSelected('gold', opt.value) }"
                @click="toggleMulti('gold', opt.value)"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>

          <div class="filter-field">
            <label>{{ $t('view.stock.product.goldType') }}</label>
            <div class="chip-group">
              <button
                v-for="opt in goldSizeOptions"
                :key="opt.value"
                type="button"
                class="chip-btn"
                :class="{ active: isSelected('goldSize', opt.value) }"
                @click="toggleMulti('goldSize', opt.value)"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>

          <div class="filter-field">
            <label>{{ $t('view.stock.product.costStatus') }}</label>
            <select v-model="form.hasCostDetail" class="mobile-select">
              <option :value="null">{{ $t('common.label.all') }}</option>
              <option :value="true">{{ $t('view.stock.product.hasCost') }}</option>
              <option :value="false">{{ $t('view.stock.product.noCost') }}</option>
            </select>
          </div>

          <div class="filter-field">
            <label>{{ $t('view.stock.product.pieceStatus') }}</label>
            <select v-model="form.pieceStatus" class="mobile-select">
              <option :value="null">{{ $t('common.label.all') }}</option>
              <option value="IN_STOCK">{{ $t('view.stock.product.inStock') }}</option>
              <option value="RESERVED">{{ $t('view.stock.product.reserved') }}</option>
              <option value="SOLD">{{ $t('view.stock.product.sold') }}</option>
            </select>
          </div>
        </div>

        <div class="filter-sheet-footer">
          <button type="button" class="mobile-btn mobile-btn-outline" @click="onClear">
            {{ $t('common.btn.clear') }}
          </button>
          <button type="button" class="mobile-btn mobile-btn-primary" @click="onApply">
            {{ $t('view.mobile.stockProduct.apply') }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'
import { useStockLocationApiStore } from '@/stores/modules/api/stock/stock-location-api.js'

import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'

export const defaultFilterForm = {
  stockNumber: null,
  stockNumberOrigin: null,
  productNumber: null,
  locationCodes: [],
  receiptType: [],
  mold: null,
  productNameEn: null,
  productNameTh: null,
  woText: null,
  size: null,
  productType: [],
  gold: [],
  goldSize: [],
  hasCostDetail: null,
  pieceStatus: null
}

export default {
  name: 'FilterSheet',

  components: { InputTextGeneric },

  setup() {
    const masterStore = useMasterApiStore()
    const locationStore = useStockLocationApiStore()
    return { masterStore, locationStore }
  },

  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    modelForm: {
      type: Object,
      default: () => ({})
    }
  },

  emits: ['close', 'apply', 'clear'],

  data() {
    return {
      form: { ...defaultFilterForm, ...this.modelForm },
      receiptTypeOptions: [{ value: 'production', label: 'Production' }]
    }
  },

  computed: {
    locationOptions() {
      return this.locationStore.all
        .filter((item) => item.isActive)
        .map((item) => ({ value: item.code, label: `${item.code} — ${item.nameTh}` }))
    },
    productTypeOptions() {
      return this.masterStore.productType.map((item) => ({ value: item.code, label: item.description }))
    },
    goldOptions() {
      return this.masterStore.gold.map((item) => ({ value: item.nameEn, label: item.nameTh }))
    },
    goldSizeOptions() {
      return this.masterStore.goldSize.map((item) => ({ value: item.nameEn, label: item.nameTh }))
    }
  },

  watch: {
    isShow(val) {
      if (val) {
        this.form = { ...defaultFilterForm, ...this.modelForm }
      }
    }
  },

  methods: {
    isSelected(field, value) {
      return (this.form[field] || []).includes(value)
    },

    toggleMulti(field, value) {
      const arr = [...(this.form[field] || [])]
      const idx = arr.indexOf(value)
      if (idx === -1) arr.push(value)
      else arr.splice(idx, 1)
      this.form[field] = arr
    },

    onApply() {
      this.$emit('apply', { ...this.form })
      this.$emit('close')
    },

    onClear() {
      this.form = { ...defaultFilterForm }
      this.$emit('clear')
      this.$emit('close')
    },

    onClose() {
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/mobile';

.filter-sheet-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #f5f5f5;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.filter-sheet-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.filter-sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-md);
  padding: var(--sp-md) var(--sp-lg);
  padding-top: calc(var(--sp-md) + env(safe-area-inset-top, 0px));
  background: var(--color-card-bg);
  border-bottom: 1px solid var(--color-border);

  .filter-sheet-title {
    display: flex;
    align-items: center;
    gap: var(--sp-sm);
    font-size: 1rem;
    font-weight: 600;
    color: #333;
    margin: 0;

    i {
      color: var(--base-font-color);
    }
  }

  .btn-close-sheet {
    background: none;
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
    font-size: 1.1rem;
    cursor: pointer;

    &:active {
      background: #f0f0f0;
    }
  }
}

.filter-sheet-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--sp-lg);
  display: flex;
  flex-direction: column;
  gap: var(--sp-lg);
}

.filter-field {
  label {
    display: block;
    font-size: 0.8rem;
    font-weight: 600;
    color: #666;
    margin-bottom: var(--sp-sm);
  }
}

.mobile-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  background: var(--color-card-bg);
  color: #333;
}

.chip-group {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-sm);
}

.chip-btn {
  padding: 8px 14px;
  border-radius: 9999px;
  border: 1.5px solid var(--color-border);
  background: var(--color-card-bg);
  color: #666;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.97);
  }

  &.active {
    border-color: var(--base-font-color);
    background: rgba(146, 19, 19, 0.08);
    color: var(--base-font-color);
    font-weight: 600;
  }
}

.filter-sheet-footer {
  display: flex;
  gap: var(--sp-md);
  padding: var(--sp-lg);
  padding-bottom: calc(var(--sp-lg) + env(safe-area-inset-bottom, 0px));
  background: var(--color-card-bg);
  border-top: 1px solid var(--color-border);

  .mobile-btn {
    flex: 1;
  }
}
</style>
