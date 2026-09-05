<template>
  <div class="receipt-print-action" :class="{ 'is-compact': compact }">
    <div class="receipt-print-action-buttons">
      <ButtonGeneric
        variant="green"
        icon="bi-eye"
        :label="compact ? '' : $t('view.mobile.pos.viewReceiptBtn')"
        :title="$t('view.mobile.pos.viewReceiptBtn')"
        :block="!compact"
        @click.stop="onViewReceipt"
      />
      <ButtonGeneric
        variant="main"
        icon="bi-printer"
        :label="compact ? '' : $t('view.mobile.pos.sendToPrintBtn')"
        :title="$t('view.mobile.pos.sendToPrintBtn')"
        :block="!compact"
        :loading="isSendingToPrint"
        @click.stop="onSendToPrint"
      />
    </div>

    <div v-if="printQueueStatus" class="print-queue-status" :class="printQueueStatusClass">
      <i :class="['bi', printQueueStatusIcon]"></i>
      <span>{{ printQueueStatusText }}</span>
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
        <span class="title-text-lg d-block" @click.stop>{{ $t('view.mobile.pos.receiptPreviewTitle') }}</span>
      </template>
      <template #content>
        <pre class="receipt-preview-text" @click.stop>{{ receiptText }}</pre>
      </template>
      <template #action>
        <ButtonGeneric
          variant="main"
          icon="bi-printer"
          :label="$t('view.mobile.pos.sendToPrintBtn')"
          :loading="isSendingToPrint"
          @click.stop="onSendToPrint"
        />
      </template>
    </ModalView>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import { buildReceiptText } from '@/services/helper/pdf/receipt/receipt-text-builder.js'
import { buildReceiptFromInvoice } from '@/services/helper/receipt/build-receipt-from-invoice.js'
import { warning } from '@/services/alert/sweetAlerts.js'
import { usePrintJobApiStore } from '@/stores/modules/api/print/print-job-store.js'

import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

const ModalView = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

// poll ทุก 3 วิ สูงสุด 60 วิ (กันวนไม่รู้จบถ้า station ไม่ได้เปิดรับงาน) — เหมือน pos-done-view.vue เดิม
const POLL_INTERVAL_MS = 3000
const POLL_TIMEOUT_MS = 60000

export default {
  name: 'ReceiptPrintAction',

  components: {
    ButtonGeneric,
    ModalView
  },

  props: {
    // โหมด POS — ส่ง receiptData มาตรงๆ (มีอยู่แล้วในมือ ไม่ต้องยิง API)
    receiptData: {
      type: Object,
      default: null
    },
    // โหมดหน้ารายการบิล — ส่งแค่เลข invoice มา แล้ว component ไปดึงเองด้วย buildReceiptFromInvoice (lazy, โหลดตอนกดปุ่มเท่านั้น)
    invoiceNumber: {
      type: String,
      default: ''
    },
    // โหมดปุ่มเล็กสำหรับใส่ในการ์ด
    compact: {
      type: Boolean,
      default: false
    }
  },

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
      pollElapsedMs: 0,
      resolvedReceiptData: null // ผลลัพธ์จาก buildReceiptFromInvoice (โหมด invoiceNumber เท่านั้น)
    }
  },

  computed: {
    effectiveReceiptData() {
      return this.receiptData || this.resolvedReceiptData
    },

    effectiveInvoiceNumber() {
      return this.effectiveReceiptData?.invoiceNumber || this.invoiceNumber
    },

    receiptText() {
      if (!this.effectiveReceiptData) return ''
      return buildReceiptText(this.effectiveReceiptData)
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

  beforeUnmount() {
    this.stopPolling()
  },

  methods: {
    // โหลดข้อมูลตอนกดปุ่มเท่านั้น (lazy) — โหมด invoiceNumber ยิง API 2 ครั้ง (Invoice/Get + SaleOrder/Get)
    // ห้ามเรียกตอน render มิเช่นนั้นหน้ารายการบิลจะยิง 2×จำนวนการ์ดทันทีที่เปิดหน้า
    async ensureReceiptData() {
      if (this.effectiveReceiptData) return true
      if (!this.invoiceNumber) return false

      const data = await buildReceiptFromInvoice(this.invoiceNumber)
      if (!data) {
        warning(this.$t('view.mobile.pos.receiptLoadErrorMsg'))
        return false
      }
      this.resolvedReceiptData = data
      return true
    },

    async onViewReceipt() {
      const ok = await this.ensureReceiptData()
      if (!ok) return
      this.showReceiptModal = true
    },

    onCloseReceiptModal() {
      this.showReceiptModal = false
    },

    // เน็ตหลุด/ล้มเหลว — ห้ามขึ้นสำเร็จลอยๆ: printQueueStatus ตั้งเฉพาะ path สำเร็จเท่านั้น
    // (fetchEnqueue skipError:true ที่ store แล้ว โชว์ warning ข้อความ context เฉพาะแทน axios auto-alert)
    // finally เคลียร์ isSendingToPrint ทุก path (สำเร็จ/ล้มเหลว) ให้กดปุ่มใหม่ได้ทันที
    async onSendToPrint() {
      const ok = await this.ensureReceiptData()
      if (!ok) return

      this.isSendingToPrint = true
      try {
        await this.printJobStore.fetchEnqueue({
          invoiceNumber: this.effectiveInvoiceNumber,
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

    // poll สถานะพื้นหลัง — non-critical (แค่ badge) กันเน็ตหลุดชั่วคราวทำให้ error กระพริบรัวทุก 3 วิ
    async pollStatus() {
      try {
        const res = await this.printJobStore.fetchList({
          take: 1,
          search: { invoiceNumber: this.effectiveInvoiceNumber },
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
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/mobile';

.receipt-print-action {
  width: 100%;
}

.receipt-print-action-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--sp-sm);

  :deep(.btn) {
    min-height: 52px;
    font-size: 1.05rem;
  }
}

.receipt-print-action.is-compact {
  .receipt-print-action-buttons {
    flex-direction: row;
    gap: var(--sp-sm);
    margin-top: var(--sp-sm);

    :deep(.btn) {
      min-height: auto;
      font-size: 0.9rem;
      flex: 1;
    }
  }
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
  margin-top: var(--sp-sm);

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
