<template>
  <div>
    <modal :showModal="isShow" @closeModal="onClose" width="800px">
      <template v-slot:content>
        <!-- Header -->
        <div class="title-text-lg-bg">
          <span><i class="bi bi-upc-scan mr-2"></i></span>
          <span>{{ `พิมพ์ป้ายบาร์โค้ดพลอย | รหัส: ${barcodeData.barcode}` }}</span>
        </div>

        <!-- Preview Title -->
        <div class="pl-4 pt-2">
          <span class="title-text">ภาพตัวอย่าง</span>
        </div>

        <!-- Barcode Demo Preview -->
        <div class="form-col-container pl-4 pr-4">
          <div class="filter-container-bg-focus">
            <gemBarcodeDemo
              :stockCode="barcodeData.stockCode"
              :barcode="barcodeData.barcode"
              :description="barcodeData.description"
              :date="barcodeData.date"
              :goldType="barcodeData.goldType"
            />
          </div>
        </div>

        <!-- Printer Status & Actions -->
        <div class="pl-4 pr-4 pt-2 pb-2">
          <div class="title-text">
            <span class="bi bi-exclamation-circle mr-1"></span>
            <span>โปรดตรวจสอบสถานะโปรแกรมพิมพ์บาร์โค้ด และเครื่องพิมพ์ก่อนการใช้งานทุกครั้ง</span>
          </div>

          <div class="d-flex justify-content-between items-center">
            <!-- Printer Status -->
            <div class="vertical-center-container">
              <div class="printer-status-indicator">
                <div class="status-container">
                  <div
                    class="status-light"
                    :class="{
                      'status-red': printerStatus === 'error',
                      'status-green': printerStatus === 'success',
                      'status-yellow': printerStatus === 'unknown'
                    }"
                    @click="checkPrinter"
                  ></div>
                  <span
                    class="status-text"
                    :class="{
                      'text-red': printerStatus === 'error',
                      'text-green': printerStatus === 'success',
                      'text-yellow': printerStatus === 'unknown'
                    }"
                  >
                    {{ getPrinterStatusText(printerStatus) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Print Action -->
            <div class="vertical-center-container">
              <div>
                <span class="title-text">จำนวนพิมพ์</span>
              </div>
              <div class="ml-2 mr-2">
                <input
                  class="form-control text-center"
                  type="number"
                  v-model.number="copies"
                  min="1"
                  max="30"
                  style="
                    width: 50px;
                    font-size: 16px;
                    height: 30px;
                    border-radius: 4px;
                    border: 1px solid #ced4da;
                  "
                  @input="validateCopies"
                />
              </div>
              <button
                :class="['btn btn-sm', printerStatus !== 'success' ? 'btn-secondary' : 'btn-main']"
                :disabled="printerStatus !== 'success'"
                @click="onConfirmPrint"
              >
                <span class="bi bi-printer mr-1"></span>
                พิมพ์
              </button>
            </div>
          </div>
        </div>
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))
const gemBarcodeDemo = defineAsyncComponent(() =>
  import('@/components/custom/barcode-demo/gem-barcode-demo.vue')
)

import { gemBarcodeService } from '@/services/barcode/gem-barcode.js'
import { success } from '@/services/alert/sweetAlerts.js'

export default {
  components: {
    modal,
    gemBarcodeDemo
  },

  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    barcodeData: {
      type: Object,
      default: () => ({
        stockCode: '',
        barcode: '',
        description: '',
        date: '',
        goldType: ''
      })
    }
  },

  data() {
    return {
      copies: 1,
      printerStatus: 'unknown' // 'unknown', 'success', 'error'
    }
  },

  watch: {
    isShow(val) {
      if (val) {
        this.copies = 1
        // Check printer status when modal opens
        setTimeout(() => this.checkPrinter(), 1000)
      } else {
        this.printerStatus = 'unknown'
      }
    }
  },

  methods: {
    onClose() {
      this.$emit('close')
    },

    async checkPrinter() {
      this.printerStatus = 'unknown'

      const result = await gemBarcodeService.testPrinter()

      if (result.success && result.connected) {
        this.printerStatus = 'success'
      } else {
        this.printerStatus = 'error'
      }
    },

    getPrinterStatusText(status) {
      const statusMap = {
        unknown: 'กำลังตรวจสอบสถานะเครื่องพิมพ์...',
        success: 'เครื่องพิมพ์พร้อมใช้งาน',
        error: 'เครื่องพิมพ์ไม่พร้อมใช้งาน'
      }
      return statusMap[status] || statusMap.unknown
    },

    validateCopies() {
      if (this.copies < 1) {
        this.copies = 1
      } else if (this.copies > 30) {
        this.copies = 30
      }
      this.copies = Math.floor(this.copies)
    },

    async onConfirmPrint() {
      this.$emit('confirm', this.copies)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

input {
  margin-top: 0px !important;
}

.printer-status-indicator {
  display: flex;
  align-items: center;
}

.status-container {
  display: flex;
  align-items: center;
}

.status-light {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
}

.status-red {
  background-color: var(--base-red);
  box-shadow: 0 0 5px var(--base-red);
}

.status-green {
  background-color: var(--base-green);
  box-shadow: 0 0 5px var(--base-green);
}

.status-yellow {
  background-color: var(--base-warning);
  box-shadow: 0 0 5px var(--base-warning);
}

.status-text {
  font-size: 14px;
  font-weight: 700;
}

.text-red {
  color: var(--base-red);
  text-shadow: 0 0 15px var(--base-red);
}

.text-green {
  color: var(--base-green);
  text-shadow: 0 0 15px var(--base-green);
}

.text-yellow {
  color: var(--base-warning);
  text-shadow: 0 0 15px #ffcc00;
}

.filter-container-bg-focus {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border: 2px dashed var(--base-green);
  border-radius: 8px;
  padding: 10px;
}
</style>
