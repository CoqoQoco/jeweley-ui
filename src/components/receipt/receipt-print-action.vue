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
      contentPadding="none"
      @closeModal="onCloseReceiptModal"
    >
      <template #title>
        <span class="title-text-lg d-block" @click.stop>{{ $t('view.mobile.pos.receiptPreviewTitle') }}</span>
      </template>
      <template #content>
        <div class="receipt-preview-wrap" @click.stop>
          <div v-if="!canvasRenderFailed" class="receipt-preview-toolbar">
            <ButtonGeneric
              :variant="isZoomed ? 'outline' : 'main'"
              :label="$t('view.mobile.pos.receiptActualSizeBtn')"
              @click="setZoomMode(false)"
            />
            <ButtonGeneric
              :variant="isZoomed ? 'main' : 'outline'"
              :label="$t('view.mobile.pos.receiptZoomBtn')"
              @click="setZoomMode(true)"
            />
          </div>

          <!-- wrapper เลื่อนแนวนอนแทนการหดกระดาษ — ต้องแยกจาก toolbar ไม่งั้น toolbar เลื่อนตามไปด้วย -->
          <div v-if="!canvasRenderFailed" class="receipt-preview-scroll">
            <div
              class="receipt-preview-paper"
              :class="{ 'is-zoomed': isZoomed }"
              :style="{ '--receipt-width-mm': receiptWidthMmVar }"
            >
              <div v-if="isRenderingCanvasPreview" class="receipt-preview-loading">
                <i class="bi bi-arrow-repeat spin"></i>
              </div>
              <div ref="canvasHost" class="receipt-canvas-host"></div>
            </div>
          </div>

          <pre v-else class="receipt-preview-text">{{ receiptText }}</pre>
        </div>
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
import { renderReceiptCanvas, RECEIPT_WIDTH_MM } from '@/services/helper/receipt/receipt-image-preview.js'
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
      resolvedReceiptData: null, // ผลลัพธ์จาก buildReceiptFromInvoice (โหมด invoiceNumber เท่านั้น)

      isZoomed: false, // default = ขนาดจริง (canvas 73.152mm) — true = ขยายเต็มจอ
      isRenderingCanvasPreview: false,
      // canvas วาดพัง (โลโก้/browser ไม่รองรับ) → ตกกลับไปแสดง <pre> ข้อความเดิม กันไม่ให้ modal พัง
      canvasRenderFailed: false
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

    // ผูก CSS var จาก RECEIPT_WIDTH_MM (73.152mm) ให้ preview กว้าง "เท่าตัวจริง" — ห้าม hardcode ค่า mm ซ้ำ
    receiptWidthMmVar() {
      return `${RECEIPT_WIDTH_MM}mm`
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
    // render canvas ตอนเปิด modal เท่านั้น — เปิดซ้ำ (data เดิม) ก็ต้อง re-render เพราะ canvasHost เพิ่งถูก mount ใหม่
    showReceiptModal(value) {
      if (value) this.$nextTick(() => this.renderCanvasPreview())
    },

    // ข้อมูลใบเสร็จเปลี่ยนระหว่างเปิด modal อยู่ (เช่น resolvedReceiptData เพิ่งโหลดเสร็จ) — re-render ให้ตรงของใหม่
    receiptText() {
      if (this.showReceiptModal) this.$nextTick(() => this.renderCanvasPreview())
    }
  },

  beforeUnmount() {
    this.stopPolling()
  },

  methods: {
    setZoomMode(zoomed) {
      this.isZoomed = zoomed
    },

    // วาดใบเสร็จเป็น canvas ลง canvasHost — พังกรณีไหนก็ตาม (โลโก้โหลดไม่ได้, browser ไม่รองรับ)
    // ให้ตกกลับไปแสดง <pre> ข้อความเดิมแทน ห้ามทำให้ modal พัง (ดู receipt-image-preview.js)
    async renderCanvasPreview() {
      this.canvasRenderFailed = false
      this.isRenderingCanvasPreview = true
      try {
        const canvas = await renderReceiptCanvas(this.receiptText)
        const host = this.$refs.canvasHost
        if (!host) return // modal ปิดไปแล้วก่อน render เสร็จ (race)
        host.innerHTML = ''
        host.appendChild(canvas)
      } catch {
        this.canvasRenderFailed = true
      } finally {
        this.isRenderingCanvasPreview = false
      }
    },

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

.receipt-preview-wrap {
  display: flex;
  flex-direction: column;
  // ห้ามใช้ align-items:center ตรงนี้ — ดูคอมเมนต์ที่ .receipt-preview-scroll ว่าทำไม
  align-items: stretch;
  gap: var(--sp-sm);
  background: var(--color-highlight-bg);
  padding: var(--sp-md);
  border-radius: var(--radius-md);
}

.receipt-preview-toolbar {
  display: flex;
  gap: var(--sp-xs);
  align-self: flex-end;
}

// ครอบกระดาษแล้วเลื่อนแนวนอนแทนการหดกระดาษเมื่อจอแคบกว่าความกว้างจริง (73.152mm)
// ต้องไม่ใช้ justify-content/align-items:center ตรงนี้ — บั๊กคลาสสิกของ flexbox คือเมื่อ content ล้น
// การ center ด้วย flex align จะซ่อน overflow ฝั่งซ้ายจน scroll ไปไม่ถึง จึงปล่อยเป็น block ธรรมดา
// แล้วให้กระดาษ margin:0 auto เอง (auto margin จะยุบเป็น 0 เองเมื่อ content กว้างเกิน container
// ทำให้ชนขอบซ้ายพอดีและเลื่อนไปเห็นขอบขวาได้ครบ)
.receipt-preview-scroll {
  width: 100%;
  overflow-x: auto;
}

// กล่องกระดาษ — โหมดขนาดจริง (default) ต้องกว้างตาม --receipt-width-mm เสมอ ห้ามหดแม้จอแคบกว่านี้
// (เดิมมี max-width:100% ทำให้กระดาษหดเงียบๆ บนจอแคบ ผู้ใช้เข้าใจผิดว่ายังเป็นขนาดจริงอยู่) ให้เลื่อนแนวนอนแทน
.receipt-preview-paper {
  position: relative;
  // ต้องบังคับ content-box ตรงนี้ (โปรเจกต์ reset เป็น border-box ทั้งหมด) เพราะ border 1px จะถูกนับรวมใน
  // width แล้วแย่งพื้นที่พิมพ์จริงไปข้างละ 1px (276.48px เหลือ 274.88px = เล็กกว่าของจริง 0.42mm)
  // canvas/host ข้างในใช้ width:100% ของกล่องนี้ — content-box จึงทำให้พื้นที่ 100% นั้น = --receipt-width-mm
  // เป๊ะ ส่วนเส้นขอบ 1px บวกออกไปนอกความกว้างแทน ห้ามเปลี่ยนกลับเป็น border-box มิเช่นนั้น canvas จะแคบกว่าตัวจริงอีก
  box-sizing: content-box;
  width: var(--receipt-width-mm);
  margin: 0 auto;
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-md);

  // โหมดขยาย — แสดง canvas ที่ความกว้างธรรมชาติ 576px (ตรงพิกเซลจริงของภาพ คมสุด ไม่ยืด/หดทับความละเอียด)
  // 576 ต้องตรงกับ WIDTH_DOTS ใน receipt-image-preview.js เสมอ — ถ้าแก้ที่นั่นต้องตามแก้ที่นี่ด้วย
  &.is-zoomed {
    width: 576px;
  }
}

.receipt-canvas-host {
  width: 100%;
  line-height: 0; // canvas เป็น inline element มี baseline gap ใต้ภาพ ต้องปิดด้วย line-height:0

  :deep(canvas) {
    display: block;
    width: 100%;
    height: auto;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.receipt-preview-loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-card-bg);
  font-size: 1.5rem;
  color: var(--base-font-color);

  .spin {
    display: inline-block;
    animation: spin 0.8s linear infinite;
  }
}

// fallback เมื่อ canvas วาดพัง — ใบเสร็จเป็น ASCII จัดคอลัมน์ด้วย space กว้าง 47 ตัวอักษร (ดู receipt-text-builder.js)
// ต้อง monospace เป๊ะเพื่อให้คอลัมน์ตรงกับที่จะพิมพ์จริง, overflow-x เผื่อจอแคบกว่า 47 ตัวอักษรที่ font-size นี้
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
