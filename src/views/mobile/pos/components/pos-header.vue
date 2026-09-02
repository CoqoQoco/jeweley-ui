<template>
  <div class="pos-header">
    <div class="pos-header-row">
      <button type="button" class="currency-chip" @click="toggleSettings">
        {{ settings.currency }} @ {{ settings.rate }}
      </button>

      <DropdownGeneric
        :modelValue="posCartStore.activeCartId"
        :options="cartOptions"
        optionLabel="label"
        optionValue="value"
        customClass="bill-dropdown"
        @update:modelValue="switchCart"
      />

      <ButtonGeneric
        variant="main"
        icon="bi-plus-lg"
        class="pos-icon-btn"
        :title="$t('view.mobile.pos.newCartBtn')"
        @click="onNewCart"
      />
      <ButtonGeneric
        variant="outline"
        icon="bi-question-circle"
        class="pos-icon-btn"
        :title="$t('view.mobile.pos.helpBtn')"
        @click="onOpenHelp"
      />
      <ButtonGeneric
        variant="outline"
        icon="bi-trash"
        class="pos-icon-btn"
        :title="$t('view.mobile.pos.removeCartBtn')"
        @click="onRemoveActiveCart"
      />
    </div>

    <div v-if="showSettings" class="pos-settings-panel">
      <div class="settings-row">
        <span class="settings-label">{{ $t('view.mobile.pos.workModeLabel') }}</span>
        <div class="mode-toggle">
          <button
            type="button"
            class="mode-btn"
            :class="{ active: settings.workMode === 'domestic' }"
            @click="setWorkMode('domestic')"
          >
            {{ $t('view.mobile.pos.workModeDomestic') }}
          </button>
          <button
            type="button"
            class="mode-btn"
            :class="{ active: settings.workMode === 'international' }"
            @click="setWorkMode('international')"
          >
            {{ $t('view.mobile.pos.workModeInternational') }}
          </button>
        </div>
      </div>

      <div class="settings-row">
        <span class="settings-label">{{ $t('view.mobile.pos.currencyLabel') }}</span>
        <div class="currency-chips">
          <button
            v-for="unit in CURRENCY_UNITS"
            :key="unit.code"
            type="button"
            class="currency-chip-btn"
            :class="{ active: settings.currency === unit.code }"
            @click="selectCurrency(unit.code)"
          >
            {{ unit.code }}
          </button>
        </div>
      </div>

      <div class="settings-row">
        <span class="settings-label">{{ $t('view.mobile.pos.rateLabel') }}</span>
        <InputTextGeneric
          type="number"
          :modelValue="String(settings.rate)"
          :min="0"
          step="any"
          @update:modelValue="onRateInput"
        />
      </div>

      <div class="settings-row">
        <span class="settings-label">{{ $t('view.mobile.pos.vatPercentLabel') }}</span>
        <InputTextGeneric
          type="number"
          :modelValue="String(settings.vatPercent)"
          :min="0"
          step="any"
          @update:modelValue="onVatPercentInput"
        />
      </div>

      <div class="settings-divider"></div>
      <button type="button" class="settings-link-row" @click="onGoToSaleHistory">
        <i class="bi bi-receipt-cutoff"></i>
        <span>{{ $t('view.mobile.pos.pastBillsLabel') }}</span>
        <i class="bi bi-chevron-right"></i>
      </button>
    </div>
  </div>
</template>

<script>
import { usePosCartStore } from '@/stores/modules/pos/pos-cart-store.js'
import { storage } from '@/services/storage.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { CURRENCY_UNITS } from '@/constants/currency-units.js'

import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'

const SETTINGS_STORAGE_KEY = 'pos-settings'

export default {
  name: 'PosHeader',

  components: {
    InputTextGeneric,
    ButtonGeneric,
    DropdownGeneric
  },

  emits: ['update:settings'],

  setup() {
    const posCartStore = usePosCartStore()
    return { posCartStore }
  },

  data() {
    return {
      CURRENCY_UNITS,
      showSettings: false,
      settings: {
        workMode: 'domestic',
        currency: 'THB',
        rate: 1,
        // default 0 = ไม่คิด VAT เท่าพฤติกรรมเดิม — ต้องตั้งค่าเองใน "ตั้งค่ารอบงาน" ถ้าต้องการออก VAT
        vatPercent: 0
      }
    }
  },

  computed: {
    cartOptions() {
      const total = this.posCartStore.cartCount
      return this.posCartStore.carts.map((cart, idx) => ({
        label: this.$t('view.mobile.pos.billLabel', {
          n: idx + 1,
          total,
          count: this.posCartStore.cartItemCount(cart.id)
        }),
        value: cart.id
      }))
    }
  },

  created() {
    this.loadSettings()
    this.emitSettings()
  },

  methods: {
    loadSettings() {
      const saved = storage.getJSON(SETTINGS_STORAGE_KEY)
      if (saved) {
        this.settings = {
          workMode: saved.workMode === 'international' ? 'international' : 'domestic',
          currency: saved.currency || 'THB',
          rate: Number(saved.rate) || 1,
          vatPercent: Number(saved.vatPercent) || 0
        }
      }
    },

    persistSettings() {
      storage.setJSON(SETTINGS_STORAGE_KEY, this.settings)
      this.emitSettings()
    },

    emitSettings() {
      const codePrefix = this.settings.workMode === 'international' ? 'EX' : 'TH'
      const customerType = this.settings.workMode === 'international' ? 'E' : 'L'
      this.$emit('update:settings', { ...this.settings, codePrefix, customerType })
    },

    // "โหมดงาน" คุม 3 อย่างพร้อมกัน: สกุลเงิน default / prefix รหัสลูกค้า / type ลูกค้า
    setWorkMode(mode) {
      if (this.settings.workMode === mode) return
      this.settings.workMode = mode
      if (mode === 'international') {
        this.settings.currency = 'US$'
        this.settings.rate = 33
      } else {
        this.settings.currency = 'THB'
        this.settings.rate = 1
      }
      this.persistSettings()
    },

    selectCurrency(code) {
      this.settings.currency = code
      this.persistSettings()
    },

    onRateInput(value) {
      this.settings.rate = Number(value) || 0
      this.persistSettings()
    },

    onVatPercentInput(value) {
      this.settings.vatPercent = Number(value) || 0
      this.persistSettings()
    },

    toggleSettings() {
      this.showSettings = !this.showSettings
    },

    switchCart(cartId) {
      this.posCartStore.switchCart(cartId)
    },

    onNewCart() {
      this.posCartStore.newCart()
    },

    onRemoveActiveCart() {
      const cart = this.posCartStore.activeCart
      if (!cart) return
      confirmThenSubmit(
        this.$t('view.mobile.pos.confirmRemoveCartMsg'),
        this.$t('view.mobile.pos.confirmRemoveCartTitle'),
        () => this.posCartStore.removeCart(cart.id)
      )
    },

    onOpenHelp() {
      this.$router.push({ name: 'mobile-pos-help' })
    },

    onGoToSaleHistory() {
      this.$router.push('/mobile/sale')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/mobile';

.pos-header {
  --pos-control-h: 44px;

  background: var(--color-card-bg);
  border-bottom: 1px solid var(--color-border);
  padding: var(--sp-sm) var(--sp-md);
  padding-top: calc(var(--sp-sm) + env(safe-area-inset-top, 0px));
}

// แถวเดียว ห้ามตกบรรทัด — chip + dropdown ยืดหยุ่นแบ่งพื้นที่ที่เหลือเท่ากัน (flex-basis 0)
// ปุ่มไอคอน 3 ตัวคงที่ 44px เท่ากับ token --pos-control-h
.pos-header-row {
  display: flex;
  align-items: stretch;
  gap: var(--sp-xs);
  flex-wrap: nowrap;
}

.currency-chip {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1 1 0;
  min-width: 0;
  height: var(--pos-control-h);
  padding: 0 var(--sp-sm);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-highlight-bg);
  color: var(--base-font-color);
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;

  &:active {
    transform: scale(0.98);
  }
}

:deep(.bill-dropdown) {
  flex: 1 1 0;
  min-width: 0;
  height: var(--pos-control-h);
  display: flex;
  align-items: center;
  border-radius: var(--radius-md);
  overflow: hidden;

  .p-dropdown-label,
  .p-inputtext {
    height: 100%;
    display: flex;
    align-items: center;
    padding: 0 var(--sp-sm);
    font-size: 0.8rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .p-dropdown-trigger {
    width: 26px;
    flex-shrink: 0;
  }
}

.pos-icon-btn {
  flex: 0 0 var(--pos-control-h);
  width: var(--pos-control-h);
  height: var(--pos-control-h);
  min-width: var(--pos-control-h);
  padding: 0 !important;
  border-radius: var(--radius-md);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.pos-settings-panel {
  display: flex;
  flex-direction: column;
  gap: var(--sp-sm);
  margin-top: var(--sp-md);
  padding-top: var(--sp-md);
  border-top: 1px dashed var(--color-border);
}

.settings-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.settings-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: #666;
}

.mode-toggle {
  display: flex;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.mode-btn {
  flex: 1;
  padding: 8px 12px;
  min-height: 44px;
  border: none;
  background: var(--color-card-bg);
  color: #666;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &.active {
    background: var(--base-font-color);
    color: #fff;
  }
}

.currency-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.currency-chip-btn {
  padding: 6px 12px;
  min-height: 36px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--color-border);
  background: var(--color-card-bg);
  color: #666;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &.active {
    border-color: var(--base-font-color);
    background: rgba(146, 19, 19, 0.05);
    color: var(--base-font-color);
    font-weight: 600;
  }
}

.settings-divider {
  height: 1px;
  background: var(--color-border);
  margin: var(--sp-xs) 0;
}

.settings-link-row {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  width: 100%;
  min-height: var(--pos-control-h);
  padding: var(--sp-sm) var(--sp-xs);
  border: none;
  background: transparent;
  color: var(--base-font-color);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  text-align: left;

  i:first-child {
    font-size: 1rem;
  }

  span {
    flex: 1;
  }

  i:last-child {
    color: #999;
  }

  &:active {
    background: var(--color-highlight-bg);
  }
}
</style>
