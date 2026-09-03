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
            variant="green"
            icon="bi-eye"
            :label="$t('view.mobile.pos.viewReceiptBtn')"
            :block="true"
            @click="onViewReceipt"
          />
          <ButtonGeneric
            variant="main"
            icon="bi-printer"
            :label="$t('view.mobile.pos.sendToPrintBtn')"
            :block="true"
            :loading="isSendingToPrint"
            @click="onSendToPrint"
          />
          <div v-if="printQueueStatus" class="print-queue-status" :class="printQueueStatusClass">
            <i :class="['bi', printQueueStatusIcon]"></i>
            <span>{{ printQueueStatusText }}</span>
          </div>
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

        <button type="button" class="view-all-link" @click="onViewAllBills">
          {{ $t('view.mobile.pos.viewAllBillsBtn') }}
          <i class="bi bi-chevron-right"></i>
        </button>
      </div>
    </div>

    <ModalView
      :showModal="showReceiptModal"
      width="380px"
      :clickToClose="true"
      :isShowActionPart="true"
      headerVariant="main"
      @closeModal="onCloseReceiptModal"
    >
      <template #title>
        <span class="title-text-lg d-block">{{ $t('view.mobile.pos.receiptPreviewTitle') }}</span>
      </template>
      <template #content>
        <pre class="receipt-preview-text">{{ receiptText }}</pre>
      </template>
      <template #action>
        <ButtonGeneric
          variant="main"
          icon="bi-printer"
          :label="$t('view.mobile.pos.sendToPrintBtn')"
          :loading="isSendingToPrint"
          @click="onSendToPrint"
        />
      </template>
    </ModalView>
  </Teleport>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import { generateReceiptBlob } from '@/services/helper/pdf/receipt/receipt-80mm-builder.js'
import { canShareFiles, shareReceipt } from '@/services/helper/pdf/receipt/receipt-share.js'
import { buildReceiptText } from '@/services/helper/pdf/receipt/receipt-text-builder.js'
import { printReceiptText } from '@/services/helper/pdf/receipt/receipt-rawbt.js'
import { warning } from '@/services/alert/sweetAlerts.js'
import { usePrintJobApiStore } from '@/stores/modules/api/print/print-job-store.js'

import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

const ModalView = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

// poll ทุก 3 วิ สูงสุด 60 วิ (กันวนไม่รู้จบถ้า station ไม่ได้เปิดรับงาน)
const POLL_INTERVAL_MS = 3000
const POLL_TIMEOUT_MS = 60000

export default {
  name: 'PosDoneView',

  components: {
    ButtonGeneric,
    ModalView
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

  setup() {
    const printJobStore = usePrintJobApiStore()
    return { printJobStore }
  },

  data() {
    return {
      showReceiptModal: false,
      isSendingToPrint: false,
      printQueueStatus: null, // null | 'PENDING' | 'PRINTING' | 'PRINTED' | 'FAILED'
      pollIntervalId: null,
      pollElapsedMs: 0
    }
  },

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
          stockNumberOrigin: item.stockNumberOrigin,
          description: item.description,
          appraisalPrice: item.appraisalPrice ?? item.price,
          discountPercent: item.discountPercent,
          qty: item.qty
        })),
        payments: (r.payments || []).map((p) => ({
          payment: p.payment,
          paymentName: p.paymentName,
          bankCode: p.bankCode,
          amount: p.amount
        })),
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
    },

    // ใช้ทั้ง modal preview (<pre> monospace) และ payload ที่ส่งเข้าคิวพิมพ์ — ต้องเป็นข้อความชุดเดียวกับที่จะพิมพ์จริงเป๊ะ
    receiptText() {
      return buildReceiptText(this.receiptData)
    },

    printQueueStatusText() {
      if (this.printQueueStatus === 'PRINTED') return this.$t('view.mobile.pos.printQueueStatusPrinted')
      if (this.printQueueStatus === 'FAILED') return this.$t('view.mobile.pos.printQueueStatusFailed')
      return this.$t('view.mobile.pos.printQueueStatusPending')
    },

    printQueueStatusClass() {
      if (this.printQueueStatus === 'PRINTED') return 'is-success'
      if (this.printQueueStatus === 'FAILED') return 'is-error'
      return 'is-pending'
    },

    printQueueStatusIcon() {
      if (this.printQueueStatus === 'PRINTED') return 'bi-check-circle-fill'
      if (this.printQueueStatus === 'FAILED') return 'bi-x-circle-fill'
      return 'bi-hourglass-split'
    }
  },

  watch: {
    // ปิดหน้าจบบิล (visible=false) — หยุด poll + เคลียร์สถานะคิว/modal กันโผล่ค้างตอนเปิดบิลใหม่
    visible(newValue) {
      if (!newValue) {
        this.stopPolling()
        this.showReceiptModal = false
        this.printQueueStatus = null
      }
    }
  },

  beforeUnmount() {
    this.stopPolling()
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

    // ปุ่มพิมพ์ใช้เส้นทางข้อความล้วน (ไม่ใช่ PDF/ภาพ) เพราะเครื่องพิมพ์หน้างานพ่นกระดาษมั่วเมื่อเจอ raster —
    // receiptData เดียวกับที่ onShare ใช้ (data shape เดียวกับ receipt-80mm-builder.js)
    async onPrint() {
      const text = buildReceiptText(this.receiptData)
      const result = await printReceiptText(text)
      if (!result.success) {
        warning(this.$t('view.mobile.pos.printUnavailableMsg'))
      }
    },

    onViewReceipt() {
      this.showReceiptModal = true
    },

    onCloseReceiptModal() {
      this.showReceiptModal = false
    },

    // เน็ตหลุด/ล้มเหลว — ห้ามขึ้นสำเร็จลอยๆ: printQueueStatus ตั้งเฉพาะ path สำเร็จเท่านั้น
    // (fetchEnqueue skipError:true ที่ store แล้ว โชว์ warning ข้อความ context เฉพาะแทน axios auto-alert)
    // finally เคลียร์ isSendingToPrint ทุก path (สำเร็จ/ล้มเหลว) ให้กดปุ่มใหม่ได้ทันที
    async onSendToPrint() {
      this.isSendingToPrint = true
      try {
        await this.printJobStore.fetchEnqueue({
          invoiceNumber: this.result?.invoiceNumber,
          payload: this.receiptText
        })
        this.printQueueStatus = 'PENDING'
        this.showReceiptModal = false
        this.startPolling()
      } catch {
        warning(this.$t('view.mobile.pos.printQueueEnqueueErrorMsg'))
      } finally {
        this.isSendingToPrint = false
      }
    },

    startPolling() {
      this.stopPolling()
      this.pollElapsedMs = 0
      this.pollIntervalId = setInterval(() => {
        this.pollElapsedMs += POLL_INTERVAL_MS
        if (this.pollElapsedMs >= POLL_TIMEOUT_MS) {
          this.stopPolling()
          return
        }
        this.pollStatus()
      }, POLL_INTERVAL_MS)
    },

    stopPolling() {
      if (this.pollIntervalId) {
        clearInterval(this.pollIntervalId)
        this.pollIntervalId = null
      }
    },

    // poll สถานะพื้นหลัง — non-critical (แค่ badge บนหน้าจบบิล) กันเน็ตหลุดชั่วคราวทำให้ error กระพริบรัวทุก 3 วิ
    async pollStatus() {
      try {
        const res = await this.printJobStore.fetchList({
          take: 1,
          search: { invoiceNumber: this.result?.invoiceNumber },
          skipLoading: true,
          skipError: true
        })
        const job = res?.data?.[0]
        if (!job?.status) return
        this.printQueueStatus = job.status
        if (job.status === 'PRINTED' || job.status === 'FAILED') {
          this.stopPolling()
        }
      } catch {
        // เน็ตหลุดระหว่าง poll พื้นหลัง — ปล่อยให้ tick ถัดไปลองใหม่ ไม่ต้องขึ้น error ซ้ำ
      }
    },

    onSellMore() {
      this.$emit('sell-more')
    },

    onViewAllBills() {
      this.$router.push('/mobile/sale')
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
@import '@/assets/scss/custom-style/standard-form.scss';
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

.view-all-link {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
  margin-top: var(--sp-xs);
  padding: var(--sp-sm);
  border: none;
  background: transparent;
  color: var(--base-font-color);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
}

.print-queue-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-xs);
  padding: var(--sp-sm);
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  font-weight: 600;

  &.is-pending {
    background: var(--color-highlight-bg);
    color: var(--base-font-color);
  }

  &.is-success {
    background: var(--color-green-bg);
    color: var(--base-green);
  }

  &.is-error {
    background: var(--status-cancelled-bg);
    color: var(--base-red);
  }
}

// ใบเสร็จเป็น ASCII จัดคอลัมน์ด้วย space กว้าง 47 ตัวอักษร (ดู receipt-text-builder.js) — ต้อง monospace
// เป๊ะเพื่อให้คอลัมน์ตรงกับที่จะพิมพ์จริง, overflow-x เผื่อจอแคบกว่า 47 ตัวอักษรที่ font-size นี้
.receipt-preview-text {
  width: 100%;
  margin: 0;
  padding: var(--sp-md);
  font-family: 'Courier New', Courier, monospace;
  font-size: var(--fs-sm);
  line-height: var(--lh-sm);
  white-space: pre;
  overflow-x: auto;
  background: var(--color-highlight-bg);
  border-radius: var(--radius-md);
  color: #333;
}
</style>
