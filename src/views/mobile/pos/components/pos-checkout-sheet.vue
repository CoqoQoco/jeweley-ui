<template>
  <Teleport to="body">
    <div v-if="visible" class="pos-checkout-overlay">
      <div class="pos-checkout-container">
        <div class="checkout-header">
          <button type="button" class="btn-close-modal" @click="onClose">
            <i class="bi bi-x-lg"></i>
          </button>
          <h3 class="checkout-title">
            <i class="bi bi-credit-card"></i>
            {{ $t('view.mobile.pos.checkoutSheetTitle') }}
          </h3>
        </div>

        <div class="checkout-body">
          <div class="amount-due-card">
            <span class="amount-due-label">{{ $t('view.mobile.pos.amountToCollect') }}</span>
            <span class="amount-due-value">{{ formatCurrency(totalToCollect) }} {{ currencyUnit }}</span>
          </div>

          <div class="method-grid">
            <button
              v-for="method in paymentMethods"
              :key="method.key"
              type="button"
              class="method-btn"
              :class="{ active: selectedMethod === method.key }"
              @click="selectMethod(method.key)"
            >
              <i :class="['bi', method.icon]"></i>
              <span>{{ method.label }}</span>
            </button>
          </div>

          <div v-if="selectedMethod" class="entry-panel">
            <template v-if="selectedMethod === 'cash'">
              <div class="quick-chip-row">
                <button type="button" class="quick-chip" @click="setQuickCash('exact')">
                  {{ $t('view.mobile.pos.cashQuickExact') }}
                </button>
                <button type="button" class="quick-chip" @click="setQuickCash(1000)">1,000</button>
                <button type="button" class="quick-chip" @click="setQuickCash(2000)">2,000</button>
                <button type="button" class="quick-chip" @click="setQuickCash(5000)">5,000</button>
              </div>
              <div class="entry-field">
                <label>{{ $t('view.mobile.pos.cashAmountLabel') }}</label>
                <InputTextGeneric
                  v-model="entry.tenderedCash"
                  type="number"
                  :min="0"
                  step="0.01"
                  inputmode="decimal"
                />
              </div>
              <div v-if="changeAmount > 0" class="change-banner">
                <span>{{ $t('view.mobile.pos.changeAmountLabel') }}</span>
                <span class="change-value">{{ formatCurrency(changeAmount) }} {{ currencyUnit }}</span>
              </div>
            </template>

            <template v-else-if="selectedMethod === 'transfer' || selectedMethod === 'cheque'">
              <div class="entry-field">
                <label>{{ $t('view.mobile.pos.bankLabel') }}</label>
                <DropdownGeneric
                  v-model="entry.bankCode"
                  :options="bankList"
                  optionLabel="nameTh"
                  optionValue="code"
                  :filter="true"
                  :placeholder="$t('view.mobile.pos.bankPlaceholder')"
                />
              </div>
              <div v-if="selectedMethod === 'cheque'" class="entry-field">
                <label>{{ $t('view.mobile.pos.branchLabel') }}</label>
                <InputTextGeneric
                  v-model.trim="entry.bankBranch"
                  :placeholder="$t('view.mobile.pos.branchPlaceholder')"
                />
              </div>
              <div class="entry-field">
                <label>{{ $t('view.mobile.pos.referenceNumberLabel') }}</label>
                <InputTextGeneric
                  v-model.trim="entry.referenceNumber"
                  :placeholder="$t('view.mobile.pos.referenceNumberPlaceholder')"
                />
              </div>
              <div class="entry-field">
                <label>{{ $t('view.mobile.pos.paymentAmountLabel') }}</label>
                <InputTextGeneric v-model="entry.amount" type="number" :min="0" step="0.01" inputmode="decimal" />
              </div>
            </template>

            <template v-else-if="selectedMethod === 'creditCard'">
              <div class="entry-field">
                <label>{{ $t('view.mobile.pos.referenceNumberLabel') }}</label>
                <InputTextGeneric
                  v-model.trim="entry.referenceNumber"
                  :placeholder="$t('view.mobile.pos.referenceNumberPlaceholder')"
                />
              </div>
              <div class="entry-field">
                <label>{{ $t('view.mobile.pos.paymentAmountLabel') }}</label>
                <InputTextGeneric v-model="entry.amount" type="number" :min="0" step="0.01" inputmode="decimal" />
              </div>
            </template>

            <template v-else-if="selectedMethod === 'credit'">
              <div class="entry-field">
                <label>{{ $t('view.mobile.pos.paymentDayLabel') }}</label>
                <InputTextGeneric v-model="entry.paymentDay" type="number" :min="0" step="1" inputmode="numeric" />
              </div>
              <div class="entry-field">
                <label>{{ $t('view.mobile.pos.paymentAmountLabel') }}</label>
                <InputTextGeneric v-model="entry.amount" type="number" :min="0" step="0.01" inputmode="decimal" />
              </div>
            </template>

            <ButtonGeneric
              variant="main"
              icon="bi-plus-circle"
              :label="$t('view.mobile.pos.addPaymentBtn')"
              :block="true"
              @click="addPayment"
            />
          </div>

          <div v-if="payments.length > 0" class="payment-list">
            <div class="payment-list-title">{{ $t('view.mobile.pos.paymentListTitle') }}</div>
            <div v-for="p in payments" :key="p.key" class="payment-line">
              <div class="payment-line-info">
                <span class="payment-line-name">{{ p.paymentName }}</span>
                <span v-if="p.bankName" class="payment-line-detail">
                  {{ p.bankName }}<template v-if="p.bankBranch"> · {{ p.bankBranch }}</template>
                </span>
                <span v-if="p.referenceNumber" class="payment-line-detail">{{ p.referenceNumber }}</span>
              </div>
              <span class="payment-line-amount">{{ formatCurrency(p.amount) }}</span>
              <button
                type="button"
                class="btn-remove-payment"
                :title="$t('view.mobile.pos.removePaymentBtn')"
                @click="removePayment(p.key)"
              >
                <i class="bi bi-x-circle"></i>
              </button>
            </div>
          </div>

          <div class="checkout-summary">
            <div class="summary-row">
              <span>{{ $t('view.mobile.pos.summaryTotalLabel') }}</span>
              <span>{{ formatCurrency(totalToCollect) }} {{ currencyUnit }}</span>
            </div>
            <div class="summary-row">
              <span>{{ $t('view.mobile.pos.summaryPaid') }}</span>
              <span>{{ formatCurrency(paidTotal) }} {{ currencyUnit }}</span>
            </div>
            <div class="summary-row" :class="{ warn: remaining > 0 }">
              <span>{{ $t('view.mobile.pos.summaryRemaining') }}</span>
              <span>{{ formatCurrency(remaining) }} {{ currencyUnit }}</span>
            </div>
          </div>
        </div>

        <div class="checkout-footer">
          <ButtonGeneric
            variant="main"
            icon="bi-check-circle"
            :label="$t('view.mobile.pos.confirmPaymentBtn')"
            :block="true"
            @click="onConfirm"
          />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
import { useMasterBankStore } from '@/stores/modules/api/master/master-bank-store.js'
import { warning } from '@/services/alert/sweetAlerts.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'

import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'

// payment code ตาม contract ของ POST /Pos/Checkout — 1=เงินสด 2=โอน 3=เช็ค 4=บัตรเครดิต 5=เครดิต(กำหนดวัน)
const PAYMENT_METHODS = [
  { code: 1, key: 'cash', icon: 'bi-cash-stack', labelKey: 'paymentMethodCash' },
  { code: 2, key: 'transfer', icon: 'bi-bank', labelKey: 'paymentMethodTransfer' },
  { code: 3, key: 'cheque', icon: 'bi-journal-check', labelKey: 'paymentMethodCheque' },
  { code: 4, key: 'creditCard', icon: 'bi-credit-card', labelKey: 'paymentMethodCreditCard' },
  { code: 5, key: 'credit', icon: 'bi-calendar-week', labelKey: 'paymentMethodCredit' }
]

function emptyEntry() {
  return {
    tenderedCash: '',
    amount: '',
    bankCode: null,
    bankBranch: '',
    referenceNumber: '',
    paymentDay: ''
  }
}

export default {
  name: 'PosCheckoutSheet',

  components: {
    InputTextGeneric,
    ButtonGeneric,
    DropdownGeneric
  },

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    totalToCollect: {
      type: Number,
      default: 0
    },
    currencyUnit: {
      type: String,
      default: 'THB'
    }
  },

  emits: ['close', 'confirm'],

  setup() {
    const masterBankStore = useMasterBankStore()
    return { masterBankStore }
  },

  data() {
    return {
      bankList: [],
      selectedMethod: null,
      payments: [],
      entry: emptyEntry()
    }
  },

  computed: {
    paymentMethods() {
      return PAYMENT_METHODS.map((m) => ({ ...m, label: this.$t(`view.mobile.pos.${m.labelKey}`) }))
    },

    paidTotal() {
      return this.payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
    },

    remaining() {
      return Math.max(this.totalToCollect - this.paidTotal, 0)
    },

    appliedCashAmount() {
      const tendered = Number(this.entry.tenderedCash) || 0
      return Math.min(tendered, this.remaining)
    },

    changeAmount() {
      const tendered = Number(this.entry.tenderedCash) || 0
      return Math.max(tendered - this.remaining, 0)
    }
  },

  watch: {
    // เปิด sheet รอบใหม่ (false → true) = เริ่มบิลใหม่ ต้องล้างรายการชำระเก่าทิ้ง
    // ถ้ายัง visible ค้างอยู่ (เช่น backend validate ไม่ผ่าน แล้วให้แก้ไขต่อ) ไม่ reset เพื่อให้แก้ไขรายการเดิมได้
    visible(newVal) {
      if (newVal) {
        this.selectedMethod = null
        this.payments = []
        this.entry = emptyEntry()
      }
    }
  },

  async mounted() {
    const response = await this.masterBankStore.fetchBankList()
    this.bankList = response || []
  },

  methods: {
    selectMethod(key) {
      this.selectedMethod = key
      this.entry = emptyEntry()
      if (key !== 'cash' && this.remaining > 0) {
        this.entry.amount = String(this.remaining.toFixed(2))
      }
    },

    setQuickCash(value) {
      this.entry.tenderedCash = value === 'exact' ? String(this.remaining.toFixed(2)) : String(value)
    },

    addPayment() {
      const method = PAYMENT_METHODS.find((m) => m.key === this.selectedMethod)
      if (!method) return

      let amount = 0
      let bankCode = null
      let bankName = null
      let bankBranch = null
      let referenceNumber = null
      let paymentDay = null

      if (method.key === 'cash') {
        amount = this.appliedCashAmount
        if (!amount || amount <= 0) {
          warning(this.$t('view.mobile.pos.warnPaymentAmountRequired'))
          return
        }
      } else {
        amount = Number(this.entry.amount) || 0
        if (!amount || amount <= 0) {
          warning(this.$t('view.mobile.pos.warnPaymentAmountRequired'))
          return
        }
        referenceNumber = this.entry.referenceNumber || null
      }

      if (method.key === 'transfer' || method.key === 'cheque') {
        if (!this.entry.bankCode) {
          warning(this.$t('view.mobile.pos.warnBankRequired'))
          return
        }
        bankCode = this.entry.bankCode
        const bank = this.bankList.find((b) => b.code === bankCode)
        bankName = bank ? bank.nameTh || bank.nameEn || bank.code : bankCode
      }

      if (method.key === 'cheque') {
        if (!this.entry.bankBranch) {
          warning(this.$t('view.mobile.pos.warnBranchRequired'))
          return
        }
        bankBranch = this.entry.bankBranch
      }

      if (method.key === 'credit') {
        paymentDay = this.entry.paymentDay ? Number(this.entry.paymentDay) : null
      }

      this.payments.push({
        key: `${method.code}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        payment: method.code,
        paymentName: this.$t(`view.mobile.pos.${method.labelKey}`),
        amount,
        bankCode,
        bankName,
        bankBranch,
        referenceNumber,
        paymentDay,
        remark: null
      })

      this.selectedMethod = null
      this.entry = emptyEntry()
    },

    removePayment(key) {
      this.payments = this.payments.filter((p) => p.key !== key)
    },

    onConfirm() {
      if (this.remaining > 0) {
        confirmThenSubmit(
          this.$t('view.mobile.pos.confirmUnderpaidMsg', {
            amount: this.formatCurrency(this.remaining),
            unit: this.currencyUnit
          }),
          this.$t('view.mobile.pos.confirmUnderpaidTitle'),
          () => this.emitConfirm()
        )
        return
      }
      this.emitConfirm()
    },

    emitConfirm() {
      this.$emit('confirm', this.payments.map((p) => ({ ...p })))
    },

    onClose() {
      this.$emit('close')
    },

    formatCurrency(value) {
      if (value === null || value === undefined) return '0.00'
      return new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(Number(value))
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/mobile';

.pos-checkout-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #f5f5f5;
  z-index: 1100;
  display: flex;
  flex-direction: column;
}

.pos-checkout-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.checkout-header {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  padding: var(--sp-sm) var(--sp-md);
  padding-top: calc(var(--sp-sm) + env(safe-area-inset-top, 0px));
  background: var(--color-card-bg);
  border-bottom: 1px solid var(--color-border);

  .btn-close-modal {
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

  .checkout-title {
    display: flex;
    align-items: center;
    gap: var(--sp-xs);
    font-size: 1rem;
    font-weight: 600;
    color: #333;
    margin: 0;

    i {
      color: var(--base-font-color);
    }
  }
}

.checkout-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--sp-md);
  display: flex;
  flex-direction: column;
  gap: var(--sp-md);
}

.amount-due-card {
  background: var(--base-font-color);
  border-radius: var(--radius-md);
  padding: var(--sp-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;

  .amount-due-label {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.8);
  }

  .amount-due-value {
    font-size: 1.6rem;
    font-weight: 700;
    color: #fff;
  }
}

.method-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--sp-sm);
}

.method-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 64px;
  padding: var(--sp-sm);
  border-radius: var(--radius-md);
  border: 1.5px solid var(--color-border);
  background: var(--color-card-bg);
  color: #666;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  i {
    font-size: 1.3rem;
  }

  &:active {
    transform: scale(0.98);
  }

  &.active {
    border-color: var(--base-font-color);
    background: rgba(146, 19, 19, 0.05);
    color: var(--base-font-color);
    font-weight: 600;
  }
}

.entry-panel {
  display: flex;
  flex-direction: column;
  gap: var(--sp-sm);
  background: var(--color-card-bg);
  border-radius: var(--radius-md);
  padding: var(--sp-md);
  border: 1px solid var(--color-border);
}

.quick-chip-row {
  display: flex;
  gap: var(--sp-sm);
  flex-wrap: wrap;
}

.quick-chip {
  flex: 1;
  min-width: 64px;
  min-height: 44px;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--color-border);
  background: var(--color-highlight-bg);
  color: var(--base-font-color);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;

  &:active {
    transform: scale(0.97);
  }
}

.entry-field {
  label {
    display: block;
    font-size: 0.8rem;
    color: #666;
    margin-bottom: 4px;
  }
}

.change-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--sp-sm);
  border-radius: var(--radius-md);
  background: rgba(3, 131, 135, 0.08);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--base-green, #038387);

  .change-value {
    font-size: 1rem;
  }
}

.payment-list {
  display: flex;
  flex-direction: column;
  gap: var(--sp-sm);

  .payment-list-title {
    font-size: 0.85rem;
    font-weight: 600;
    color: #666;
  }
}

.payment-line {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  background: var(--color-card-bg);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  padding: var(--sp-sm) var(--sp-md);

  .payment-line-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .payment-line-name {
    font-size: 0.85rem;
    font-weight: 600;
    color: #333;
  }

  .payment-line-detail {
    font-size: 0.75rem;
    color: #999;
  }

  .payment-line-amount {
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--base-font-color);
    white-space: nowrap;
  }

  .btn-remove-payment {
    background: none;
    border: none;
    color: #999;
    font-size: 1.2rem;
    padding: 4px;
    line-height: 1;
    cursor: pointer;

    &:active {
      color: var(--base-red);
    }
  }
}

.checkout-summary {
  background: var(--color-card-bg);
  border-radius: var(--radius-md);
  padding: var(--sp-md);
  border: 1px solid var(--color-border);

  .summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;
    font-size: 0.9rem;
    color: #333;

    &.warn {
      color: var(--base-red);
      font-weight: 700;
    }
  }
}

.checkout-footer {
  padding: var(--sp-md);
  padding-bottom: calc(var(--sp-md) + env(safe-area-inset-bottom, 0px));
  background: var(--color-card-bg);
  border-top: 1px solid var(--color-border);

  :deep(.btn) {
    min-height: 52px;
    font-size: 1.05rem;
  }
}
</style>
