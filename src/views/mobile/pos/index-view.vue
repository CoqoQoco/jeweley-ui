<template>
  <div class="mobile-pos-view">
    <PosHeader @update:settings="onSettingsUpdate" />

    <div class="mobile-container mobile-mt-1">
      <PosScanBar />

      <SectionCardGeneric
        :title="$t('view.mobile.pos.cartTitle')"
        icon="bi-cart-fill"
        headerStyle="legend"
        class="pos-cart-section"
      >
        <div v-if="cartItems.length > 0" class="pos-cart-list">
          <PosCartLine
            v-for="(item, idx) in cartItems"
            :key="item.stockNumber + '-' + idx"
            :item="item"
            :index="idx"
            :currencyUnit="settings.currency"
            @update="onUpdateItem"
            @remove="onRemoveItem"
          />
        </div>
        <div v-else class="mobile-empty-state">
          <i class="bi bi-cart"></i>
          <div class="empty-title">{{ $t('view.mobile.pos.cartEmptyTitle') }}</div>
          <div class="empty-subtitle">{{ $t('view.mobile.pos.cartEmptySubtitle') }}</div>
        </div>
      </SectionCardGeneric>

      <PosCustomerChip
        :customer="activeCustomer"
        :codePrefix="settings.codePrefix"
        :customerType="settings.customerType"
        @update:customer="onUpdateCustomer"
      />

      <div class="pos-summary-card">
        <div class="summary-row">
          <span class="summary-label">{{ $t('view.mobile.pos.summaryItemCount') }}</span>
          <span class="summary-value">{{ itemCount }} {{ $t('view.mobile.pos.summaryItemUnit') }}</span>
        </div>
        <div class="summary-divider"></div>
        <div v-if="vatPercent > 0" class="summary-row">
          <span class="summary-label">{{ $t('view.mobile.pos.summaryVatLabel', { percent: vatPercent }) }}</span>
          <span class="summary-value">{{ formatCurrency(vatAmount) }} {{ displayCurrencyUnit }}</span>
        </div>
        <div class="summary-row total">
          <span class="summary-label">{{ $t('view.mobile.pos.summaryTotalLabel') }}</span>
          <span class="summary-value">{{ formatCurrency(displayTotal) }} {{ displayCurrencyUnit }}</span>
        </div>
        <div v-if="hasCurrencyConversion" class="summary-row reference">
          <span class="summary-label">{{ $t('view.mobile.pos.summaryEquivalent') }}</span>
          <span class="summary-value">{{ formatCurrency(totalTHB) }} {{ $t('view.mobile.pos.summaryBahtUnit') }}</span>
        </div>
      </div>

      <div v-if="isPending" class="pos-pending-banner">
        <i class="bi bi-exclamation-triangle-fill"></i>
        <div class="pending-text">
          <div class="pending-title">{{ $t('view.mobile.pos.pendingBannerTitle') }}</div>
          <div class="pending-subtitle">{{ $t('view.mobile.pos.pendingBannerMsg') }}</div>
        </div>
      </div>

      <template v-if="isPending">
        <ButtonGeneric
          variant="main"
          icon="bi-arrow-repeat"
          :label="$t('view.mobile.pos.resendBtn')"
          :block="true"
          class="pos-checkout-btn"
          @click="onResendCheckout"
        />
        <ButtonGeneric
          variant="outline"
          icon="bi-pencil"
          :label="$t('view.mobile.pos.editCartInsteadBtn')"
          :block="true"
          class="mobile-mt-1"
          @click="onCancelPending"
        />
      </template>
      <ButtonGeneric
        v-else
        variant="main"
        icon="bi-credit-card"
        :label="checkoutLabel"
        :disabled="cartItems.length === 0"
        :block="true"
        class="pos-checkout-btn"
        @click="onCheckout"
      />
    </div>

    <PosCheckoutSheet
      :visible="showCheckoutSheet"
      :totalToCollect="displayTotal"
      :currencyUnit="displayCurrencyUnit"
      @close="showCheckoutSheet = false"
      @confirm="onConfirmPayment"
    />

    <PosDoneView :visible="showDoneView" :result="checkoutResult" @sell-more="onSellMore" />
  </div>
</template>

<script>
import { usePosCartStore } from '@/stores/modules/pos/pos-cart-store.js'
import { usePosApiStore } from '@/stores/modules/api/pos/pos-api-store.js'
import { error } from '@/services/alert/sweetAlerts.js'

import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import PosHeader from './components/pos-header.vue'
import PosScanBar from './components/pos-scan-bar.vue'
import PosCartLine from './components/pos-cart-line.vue'
import PosCustomerChip from './components/pos-customer-chip.vue'
import PosCheckoutSheet from './components/pos-checkout-sheet.vue'
import PosDoneView from './components/pos-done-view.vue'

// ปัดยอดให้ตรงกับ backend MathHelper.CeilMoney เป๊ะ: Math.Ceiling(Math.Round(v, 2, AwayFromZero))
// ห้ามใช้ ceilToInteger จาก services/utils/decimal.js ตรงๆ — พบว่ามี floating-point bug ที่ค่า x.005 บางค่า
// (เช่น 1.005, 8192.005 ปัดผิดทิศทาง เพราะ 1.005*100 ได้ 100.49999999999999 ใน JS ตรงๆ)
// ใช้ trick "ต่อ string exponent" (num.toString() + 'e2') แทนการคูณลอยตัวตรงๆ กัน drift นี้
function ceilMoney(value) {
  const num = Number(value)
  if (!Number.isFinite(num) || num <= 0) return 0
  const str = num.toString()
  const scaled = /e/i.test(str) ? num * 100 : Number(`${str}e2`)
  const roundedScaled = Math.round(scaled)
  return Math.ceil(roundedScaled / 100)
}

export default {
  name: 'MobilePosIndexView',

  components: {
    ButtonGeneric,
    SectionCardGeneric,
    PosHeader,
    PosScanBar,
    PosCartLine,
    PosCustomerChip,
    PosCheckoutSheet,
    PosDoneView
  },

  setup() {
    const posCartStore = usePosCartStore()
    const posApiStore = usePosApiStore()
    return { posCartStore, posApiStore }
  },

  data() {
    return {
      settings: {
        workMode: 'domestic',
        currency: 'THB',
        rate: 1,
        codePrefix: 'TH',
        customerType: 'L',
        vatPercent: 0
      },
      showCheckoutSheet: false,
      showDoneView: false,
      checkoutResult: null
    }
  },

  created() {
    // กันพังกรณี activeCart เป็น null (เช่น localStorage ข้อมูลเพี้ยน/schema เก่า) — สร้างบิลใหม่อัตโนมัติ
    // แทนที่จะปล่อยให้หน้า POS ใช้งานไม่ได้จนกว่าจะ reload
    this.ensureActiveCart()
  },

  computed: {
    activeCart() {
      return this.posCartStore.activeCart
    },

    cartItems() {
      return this.activeCart?.items || []
    },

    activeCustomer() {
      return this.activeCart?.customer || { code: 'WALKIN', name: '', tel: '' }
    },

    itemCount() {
      return this.posCartStore.cartItemCount()
    },

    totalTHB() {
      return this.posCartStore.cartTotal()
    },

    hasCurrencyConversion() {
      return this.settings.currency !== 'THB' && !!this.settings.rate && this.settings.rate !== 1
    },

    displayCurrencyUnit() {
      return this.settings.currency || 'THB'
    },

    // afterSpecial ตรงกับ backend MathHelper.ComputeTotals: subTotal - specialDiscount + specialAddition + freight
    // ตอนนี้ specialDiscount ถูกหักไว้แล้วใน totalTHB (ดู pos-cart-store.cartTotal) — SpecialAddition/FreightAndInsurance
    // ยังคง 0 เสมอ (ไม่มี UI) — ถ้าเพิ่มทีหลังต้องหารด้วย rate เหมือน SpecialDiscount ก่อนบวกเข้าที่นี่
    afterSpecialTotal() {
      const rate = Number(this.settings.rate) || 1
      return this.hasCurrencyConversion ? this.totalTHB / rate : this.totalTHB
    },

    vatPercent() {
      return Number(this.settings.vatPercent) || 0
    },

    vatAmount() {
      return this.afterSpecialTotal * (this.vatPercent / 100)
    },

    // raw ก่อนปัด — ตรงกับ backend "raw" ใน ComputeTotals
    grandTotalRaw() {
      return this.afterSpecialTotal + this.vatAmount
    },

    // ยอดที่ใช้ "เก็บเงิน" จริง ต้องตรงกับ backend GrandTotalRounded เป๊ะ (CeilMoney)
    displayTotal() {
      return ceilMoney(this.grandTotalRaw)
    },

    checkoutLabel() {
      if (this.cartItems.length === 0) return this.$t('view.mobile.pos.checkoutBtnEmpty')
      return this.$t('view.mobile.pos.checkoutBtn', {
        amount: this.formatCurrency(this.displayTotal),
        unit: this.displayCurrencyUnit
      })
    },

    // ยิง checkout ไปแล้วแต่เน็ตหลุด (ไม่รู้ผล) — รอกด "ส่งอีกครั้ง" ด้วย idempotencyKey เดิม
    isPending() {
      return this.activeCart?.status === 'pending'
    }
  },

  methods: {
    ensureActiveCart() {
      if (!this.posCartStore.activeCart) {
        this.posCartStore.newCart()
      }
    },

    onSettingsUpdate(settings) {
      this.settings = settings
    },

    onUpdateItem(index, updatedItem) {
      this.posCartStore.updateItem(index, updatedItem)
    },

    onRemoveItem(index) {
      this.posCartStore.removeItem(index)
    },

    onUpdateCustomer(customer) {
      this.posCartStore.setCustomer(customer)
    },

    onCheckout() {
      this.showCheckoutSheet = true
    },

    async onConfirmPayment(payments) {
      const context = this.buildCheckoutContext(payments)
      if (!context) return
      await this.submitCheckout(context)
    },

    async onResendCheckout() {
      const pending = this.activeCart?.pendingCheckout
      if (!pending) return
      await this.submitCheckout(pending, { isResend: true })
    },

    // ยกเลิกสถานะ "รอส่ง" โดยไม่ยิง API — ให้ผู้ใช้กลับไปแก้ไขรายการ/ยอดชำระได้เอง แล้วค่อยกด "รับเงิน" ใหม่
    onCancelPending() {
      this.posCartStore.clearCartPending(this.activeCart?.id)
    },

    // ประกอบ payload ตาม contract ของ POST /Pos/Checkout — activeCart.customer.code default เป็น WALKIN เสมอ
    // (ถ้า WALKIN ยังไม่ถูก seed ใน DB จริง backend จะ error กลับมา ให้ axios-helper แสดง message ตามปกติ)
    buildCheckoutContext(payments) {
      const cart = this.activeCart
      if (!cart) return null
      const creditPayment = payments.find((p) => p.payment === 5 && p.paymentDay)
      // discountBill เก็บเป็นฐานบาทเสมอ (ดู pos-cart-store.cartTotal) แต่ InvoiceService.Create ของ backend
      // หาร CurrencyRate ให้ subtotal ก่อนหักส่วนลดท้ายบิล — SpecialDiscount ที่ backend รับจึงต้องเป็น
      // "สกุลเงินที่ขาย" ไม่ใช่บาท ห้ามเอาการหารนี้ออก ไม่งั้นขายต่างประเทศจะลดยอดเกินจริง
      const rate = Number(this.settings.rate) || 1

      const payload = {
        IdempotencyKey: cart.idempotencyKey,
        CustomerCode: cart.customer.code || 'WALKIN',
        CustomerName: cart.customer.name || null,
        CustomerAddress: null,
        CustomerTel: cart.customer.tel || null,
        CustomerEmail: null,
        CustomerRemark: null,
        CurrencyUnit: this.settings.currency,
        CurrencyRate: this.settings.rate,
        SpecialDiscount: (Number(cart.discountBill) || 0) / rate,
        // ยังคง 0 ตายตัว (ไม่มี UI) — ถ้าเพิ่มทีหลังต้องหารด้วย rate เหมือน SpecialDiscount ก่อนส่ง ไม่งั้นขายต่างประเทศจะบวก/หักเกินจริง
        SpecialAddition: 0,
        FreightAndInsurance: 0,
        Vat: this.vatPercent,
        Items: cart.items.map((item) => ({
          StockNumber: item.stockNumber,
          ProductNumber: item.productNumber || '',
          AppraisalPrice: Number(item.appraisalPrice ?? item.price) || 0,
          DiscountPercent: Number(item.discountPercent) || 0,
          Qty: Number(item.qty) || 1
        })),
        Payments: payments.map((p) => ({
          Payment: p.payment,
          PaymentName: p.paymentName,
          Amount: p.amount,
          PaymentDate: new Date().toISOString(),
          ReferenceNumber: p.referenceNumber || null,
          BankCode: p.bankCode || null,
          BankBranch: p.bankBranch || null,
          Remark: p.remark || null
        })),
        DkInvoiceNumber: null,
        Remark: cart.note || null,
        PaymentDay: creditPayment ? creditPayment.paymentDay : null,
        Deposit: null
      }

      return {
        cartId: cart.id,
        payload,
        payments,
        customer: cart.customer,
        items: cart.items,
        currencyUnit: this.settings.currency,
        currencyRate: this.settings.rate
      }
    },

    // ทนเน็ตหลุด: fail แบบไม่มี response (network/timeout) = มาร์กบิลเป็น "รอส่ง" ให้กดส่งซ้ำได้ด้วย idempotencyKey เดิม
    // (idempotencyKey เดิมกันบิลซ้ำที่ backend อยู่แล้ว) — fail แบบมี response (validate ไม่ผ่าน) แปลว่ายังไม่สร้างบิล
    // ปล่อยให้ sheet เปิดค้างไว้ให้แก้ไขแล้วลองใหม่ได้เลย ไม่ต้องมาร์ก pending
    // isResend=true = มาจาก "ส่งอีกครั้ง" (onResendCheckout) ด้วย idempotencyKey เดิมที่ตั้งใจไว้ — isDuplicate:true ตรงนี้ถือว่าสำเร็จตามปกติ
    async submitCheckout(context, { isResend = false } = {}) {
      try {
        const res = await this.posApiStore.checkout(context.payload)

        // ยิงครั้งแรก (ไม่ใช่ resend) แต่ backend บอกว่า key นี้ถูกใช้ไปแล้ว = สถานการณ์ที่ไม่ควรเกิด
        // (ตะกร้าถือ idempotencyKey ที่ backend บันทึกบิลไปแล้วก่อนหน้านี้) ห้ามพาไปหน้าจบบิลด้วยข้อมูลบิลเก่า
        if (res?.isDuplicate && !isResend) {
          this.posCartStore.clearCartPending(context.cartId)
          this.posCartStore.clearActiveCart()
          this.showCheckoutSheet = false
          error(
            this.$t('view.mobile.pos.errorDuplicateBillMsg'),
            this.$t('view.mobile.pos.errorDuplicateBillTitle')
          )
          return
        }

        this.posCartStore.clearCartPending(context.cartId)
        this.checkoutResult = {
          ...res,
          customer: context.customer,
          items: context.items,
          payments: context.payments,
          currencyUnit: context.currencyUnit,
          currencyRate: context.currencyRate,
          specialDiscount: context.payload.SpecialDiscount,
          specialAddition: context.payload.SpecialAddition,
          freightAndInsurance: context.payload.FreightAndInsurance,
          vatPercent: context.payload.Vat
        }
        // เคลียร์ตะกร้าทันทีตอนปิดบิลสำเร็จ (ไม่รอกด "ขายต่อ") ได้ idempotencyKey ใหม่ทันที
        // กันเคส: ออกจากหน้าไปโดยไม่กด "ขายต่อ" แล้วกลับมาใส่สินค้าชุดใหม่ในตะกร้าเดิมที่ยังถือ key เก่าอยู่
        this.posCartStore.clearActiveCart()
        this.showCheckoutSheet = false
        this.showDoneView = true
      } catch (err) {
        if (!err?.response) {
          this.posCartStore.markCartPending(context, context.cartId)
          this.showCheckoutSheet = false
        }
      }
    },

    onSellMore() {
      this.showDoneView = false
      this.checkoutResult = null
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

.mobile-pos-view {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: calc(40px + env(safe-area-inset-bottom, 0px));
}

.pos-cart-section {
  margin-top: var(--sp-2xl);
}

.pos-cart-list {
  display: flex;
  flex-direction: column;
  gap: var(--sp-sm);
}

.pos-summary-card {
  background: var(--color-card-bg);
  border-radius: var(--radius-md);
  padding: var(--sp-lg);
  border: 1px solid var(--color-border);
  margin-top: var(--sp-md);

  .summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;

    .summary-label {
      font-size: 0.9rem;
      color: #666;
    }

    .summary-value {
      font-size: 0.9rem;
      font-weight: 600;
      color: #333;
    }

    &.total {
      .summary-label {
        font-size: 1rem;
        font-weight: 600;
        color: #333;
      }

      .summary-value {
        font-size: 1.15rem;
        font-weight: 700;
        color: var(--base-font-color);
      }
    }

    &.reference {
      .summary-label,
      .summary-value {
        font-size: 0.8rem;
        font-weight: 400;
        color: #999;
      }
    }
  }

  .summary-divider {
    height: 1px;
    background: #f0f0f0;
    margin: 6px 0;
  }
}

.pos-checkout-btn {
  margin-top: var(--sp-lg);
  min-height: 52px;
  font-size: 1.05rem;
}

.pos-pending-banner {
  display: flex;
  align-items: flex-start;
  gap: var(--sp-sm);
  margin-top: var(--sp-lg);
  padding: var(--sp-md);
  border-radius: var(--radius-md);
  background: rgba(255, 194, 27, 0.12);
  border: 1px solid var(--base-warning, #ffc21b);

  i {
    font-size: 1.2rem;
    color: var(--base-warning, #ffc21b);
    margin-top: 2px;
  }

  .pending-title {
    font-size: 0.9rem;
    font-weight: 700;
    color: #333;
  }

  .pending-subtitle {
    font-size: 0.8rem;
    color: #666;
  }
}
</style>
