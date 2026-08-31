<template>
  <Teleport to="body">
    <div v-if="visible" class="pos-done-overlay">
      <div class="pos-done-container">
        <div class="done-icon">
          <i class="bi bi-check-circle-fill"></i>
        </div>
        <div class="done-title">{{ $t('view.mobile.pos.doneTitle') }}</div>

        <div class="done-info-card">
          <div class="info-row">
            <span>{{ $t('view.mobile.pos.doneInvoiceLabel') }}</span>
            <span>{{ result.invoiceNumber || '-' }}</span>
          </div>
          <div class="info-row">
            <span>{{ $t('view.mobile.pos.doneSoLabel') }}</span>
            <span>{{ result.soNumber || '-' }}</span>
          </div>
          <div class="info-divider"></div>
          <div class="info-row bold">
            <span>{{ $t('view.mobile.pos.doneGrandTotal') }}</span>
            <span>{{ formatCurrency(result.grandTotal) }} {{ currencyUnit }}</span>
          </div>
          <div class="info-row">
            <span>{{ $t('view.mobile.pos.donePaid') }}</span>
            <span>{{ formatCurrency(result.paidAmount) }} {{ currencyUnit }}</span>
          </div>
          <div v-if="hasRemaining" class="info-row warn">
            <span>{{ $t('view.mobile.pos.doneRemaining') }}</span>
            <span>{{ formatCurrency(result.remainingAmount) }} {{ currencyUnit }}</span>
          </div>
        </div>

        <div class="done-actions">
          <ButtonGeneric
            variant="main"
            icon="bi-share"
            :label="$t('view.mobile.pos.shareReceiptBtn')"
            :block="true"
            @click="onShare"
          />
          <ButtonGeneric
            variant="outline"
            icon="bi-printer"
            :label="$t('view.mobile.pos.printReceiptBtn')"
            :block="true"
            @click="onPrint"
          />
          <ButtonGeneric
            variant="green"
            icon="bi-arrow-repeat"
            :label="$t('view.mobile.pos.sellMoreBtn')"
            :block="true"
            @click="onSellMore"
          />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
import { generateReceiptBlob } from '@/services/helper/pdf/receipt/receipt-80mm-builder.js'
import { canShareFiles, shareReceipt, printReceipt } from '@/services/helper/pdf/receipt/receipt-share.js'
import { warning } from '@/services/alert/sweetAlerts.js'

import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

export default {
  name: 'PosDoneView',

  components: {
    ButtonGeneric
  },

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    // { soNumber, invoiceNumber, grandTotal, paidAmount, remainingAmount, isDuplicate,
    //   customer, items, payments, currencyUnit, currencyRate } — ประกอบไว้ที่ index-view.vue ตอน checkout สำเร็จ
    result: {
      type: Object,
      default: () => ({})
    }
  },

  emits: ['sell-more'],

  computed: {
    currencyUnit() {
      return this.result?.currencyUnit || 'THB'
    },

    hasRemaining() {
      return Number(this.result?.remainingAmount) > 0
    },

    // แปลงเป็น shape ที่ receipt-80mm-builder.js รับ — grandTotal/paidAmount/remainingAmount ใช้ค่าจาก backend ตรงๆ ห้ามคำนวณทับ
    receiptData() {
      const r = this.result || {}
      return {
        invoiceNumber: r.invoiceNumber,
        soNumber: r.soNumber,
        date: new Date().toISOString(),
        customer: { name: r.customer?.name || '' },
        items: (r.items || []).map((item) => ({
          stockNumber: item.stockNumber,
          description: item.description,
          appraisalPrice: item.appraisalPrice ?? item.price,
          discountPercent: item.discountPercent,
          qty: item.qty
        })),
        payments: (r.payments || []).map((p) => ({ paymentName: p.paymentName, amount: p.amount })),
        currencyUnit: r.currencyUnit,
        currencyRate: r.currencyRate,
        specialDiscount: r.specialDiscount,
        specialAddition: r.specialAddition,
        freightAndInsurance: r.freightAndInsurance,
        vatPercent: r.vatPercent,
        grandTotal: r.grandTotal,
        paidAmount: r.paidAmount,
        remainingAmount: r.remainingAmount
      }
    }
  },

  methods: {
    async onShare() {
      const blob = await generateReceiptBlob(this.receiptData)
      const filename = `${this.result?.invoiceNumber || 'receipt'}.pdf`
      const canShare = canShareFiles()
      const outcome = await shareReceipt(blob, filename)
      if (!canShare && outcome?.method === 'download') {
        warning(this.$t('view.mobile.pos.shareUnavailableMsg'))
      }
    },

    async onPrint() {
      const blob = await generateReceiptBlob(this.receiptData)
      await printReceipt(blob)
    },

    onSellMore() {
      this.$emit('sell-more')
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

.pos-done-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #f5f5f5;
  z-index: 1200;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.pos-done-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--sp-2xl) var(--sp-md);
  padding-top: calc(var(--sp-2xl) + env(safe-area-inset-top, 0px));
  padding-bottom: calc(var(--sp-2xl) + env(safe-area-inset-bottom, 0px));
  gap: var(--sp-lg);
}

.done-icon {
  font-size: 4rem;
  color: var(--base-green, #038387);
}

.done-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #333;
}

.done-info-card {
  width: 100%;
  max-width: 420px;
  background: var(--color-card-bg);
  border-radius: var(--radius-md);
  padding: var(--sp-lg);
  border: 1px solid var(--color-border);

  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;
    font-size: 0.9rem;
    color: #666;

    &.bold {
      font-size: 1.05rem;
      font-weight: 700;
      color: #333;
    }

    &.warn {
      color: var(--base-red);
      font-weight: 700;
    }
  }

  .info-divider {
    height: 1px;
    background: #f0f0f0;
    margin: 6px 0;
  }
}

.done-actions {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: var(--sp-sm);

  :deep(.btn) {
    min-height: 52px;
    font-size: 1.05rem;
  }
}
</style>
