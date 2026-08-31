<template>
  <div class="pos-header">
    <div class="pos-header-row">
      <div class="pos-header-left">
        <span class="pos-brand">POS</span>
        <button type="button" class="currency-chip" @click="toggleSettings">
          <i class="bi bi-cash-coin"></i>
          {{ settings.currency }} @ {{ settings.rate }}
          <i class="bi bi-gear-fill"></i>
        </button>
        <ButtonGeneric
          variant="outline"
          icon="bi-question-circle"
          class="help-btn"
          :title="$t('view.mobile.pos.helpBtn')"
          @click="onOpenHelp"
        />
      </div>

      <div class="pos-header-right">
        <span class="cart-count-badge">{{ posCartStore.cartCount }}</span>
        <DropdownGeneric
          :modelValue="posCartStore.activeCartId"
          :options="cartOptions"
          optionLabel="label"
          optionValue="value"
          customClass="bill-dropdown"
          @update:modelValue="switchCart"
        />
        <ButtonGeneric
          variant="dark"
          icon="bi-trash"
          :title="$t('view.mobile.pos.removeCartBtn')"
          @click="onRemoveActiveCart"
        />
        <ButtonGeneric
          variant="main"
          icon="bi-plus-lg"
          :title="$t('view.mobile.pos.newCartBtn')"
          @click="onNewCart"
        />
      </div>
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
      return this.posCartStore.carts.map((cart, idx) => ({
        label: `${this.$t('view.mobile.pos.billLabel', { n: idx + 1 })} (${this.posCartStore.cartItemCount(cart.id)})`,
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
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/mobile';

.pos-header {
  background: var(--color-card-bg);
  border-bottom: 1px solid var(--color-border);
  padding: var(--sp-sm) var(--sp-md);
  padding-top: calc(var(--sp-sm) + env(safe-area-inset-top, 0px));
}

.pos-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-sm);
  flex-wrap: wrap;
}

.pos-header-left {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
}

.pos-brand {
  font-size: 1rem;
  font-weight: 700;
  color: var(--base-font-color);
}

.help-btn {
  min-width: 44px;
  min-height: 44px;
  padding: 0;
  border-radius: var(--radius-md);
}

.currency-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-highlight-bg);
  color: var(--base-font-color);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;

  &:active {
    transform: scale(0.98);
  }
}

.pos-header-right {
  display: flex;
  align-items: center;
  gap: var(--sp-xs);

  :deep(.bill-dropdown) {
    width: 130px;

    .p-inputtext {
      padding: 8px 10px;
      font-size: 0.8rem;
    }
  }
}

.cart-count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 4px;
  border-radius: 10px;
  background: var(--base-font-color);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
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
</style>
