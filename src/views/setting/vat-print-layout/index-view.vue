<template>
  <div class="app-container">
    <div class="title-text mb-3">ตั้งค่ารูปแบบพิมพ์ VAT (Bridge GDI)</div>

    <div class="row">
      <div class="col-12 col-lg-10 col-xl-8">

        <!-- Header Positions -->
        <div class="filter-container mb-3">
          <div class="title-text-lg mb-3">ตำแหน่ง Header</div>

          <div class="form-row">
            <label class="form-label-col">Invoice No</label>
            <div class="form-input-col">
              <div class="xy-pair">
                <span class="xy-tag">X</span>
                <input v-model.number="form.invoiceNo.x" type="number" step="0.01" class="form-control" />
                <span class="xy-tag">Y</span>
                <input v-model.number="form.invoiceNo.y" type="number" step="0.01" class="form-control" />
              </div>
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">Date</label>
            <div class="form-input-col">
              <div class="xy-pair">
                <span class="xy-tag">X</span>
                <input v-model.number="form.date.x" type="number" step="0.01" class="form-control" />
                <span class="xy-tag">Y</span>
                <input v-model.number="form.date.y" type="number" step="0.01" class="form-control" />
              </div>
            </div>
          </div>
        </div>

        <!-- Customer Positions -->
        <div class="filter-container mb-3">
          <div class="title-text-lg mb-3">ตำแหน่งข้อมูลลูกค้า</div>

          <div class="form-row">
            <label class="form-label-col">ชื่อลูกค้า</label>
            <div class="form-input-col">
              <div class="xy-pair">
                <span class="xy-tag">X</span>
                <input v-model.number="form.customerName.x" type="number" step="0.01" class="form-control" />
                <span class="xy-tag">Y</span>
                <input v-model.number="form.customerName.y" type="number" step="0.01" class="form-control" />
              </div>
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">เลขผู้เสียภาษีลูกค้า</label>
            <div class="form-input-col">
              <div class="xy-pair">
                <span class="xy-tag">X</span>
                <input v-model.number="form.customerTaxId.x" type="number" step="0.01" class="form-control" />
                <span class="xy-tag">Y</span>
                <input v-model.number="form.customerTaxId.y" type="number" step="0.01" class="form-control" />
              </div>
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">ที่อยู่ลูกค้า</label>
            <div class="form-input-col">
              <div class="xy-pair">
                <span class="xy-tag">X</span>
                <input v-model.number="form.customerAddress.x" type="number" step="0.01" class="form-control" />
                <span class="xy-tag">Y</span>
                <input v-model.number="form.customerAddress.y" type="number" step="0.01" class="form-control" />
              </div>
            </div>
          </div>
        </div>

        <!-- Items Table -->
        <div class="filter-container mb-3">
          <div class="title-text-lg mb-3">ตารางรายการสินค้า</div>

          <div class="form-row">
            <label class="form-label-col">เริ่มต้นรายการ</label>
            <div class="form-input-col">
              <div class="xy-pair">
                <span class="xy-tag">X</span>
                <input v-model.number="form.itemsStart.x" type="number" step="0.01" class="form-control" />
                <span class="xy-tag">Y</span>
                <input v-model.number="form.itemsStart.y" type="number" step="0.01" class="form-control" />
              </div>
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">ตำแหน่ง X — ลำดับ</label>
            <div class="form-input-col">
              <input v-model.number="form.itemNoX" type="number" step="0.01" class="form-control single" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">ตำแหน่ง X — ชื่อสินค้า</label>
            <div class="form-input-col">
              <input v-model.number="form.itemDescX" type="number" step="0.01" class="form-control single" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">ตำแหน่ง X — จำนวน</label>
            <div class="form-input-col">
              <input v-model.number="form.itemQtyX" type="number" step="0.01" class="form-control single" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">ตำแหน่ง X — ราคา</label>
            <div class="form-input-col">
              <input v-model.number="form.itemPriceX" type="number" step="0.01" class="form-control single" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">ตำแหน่ง X — จำนวนเงิน</label>
            <div class="form-input-col">
              <input v-model.number="form.itemAmountX" type="number" step="0.01" class="form-control single" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">Row Height</label>
            <div class="form-input-col">
              <input v-model.number="form.rowHeight" type="number" step="0.01" class="form-control single" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">แถวสูงสุด/หน้า</label>
            <div class="form-input-col">
              <input v-model.number="form.maxRowsPerPage" type="number" step="1" class="form-control single" />
            </div>
          </div>
        </div>

        <!-- Summary Positions -->
        <div class="filter-container mb-3">
          <div class="title-text-lg mb-3">ตำแหน่งสรุปยอด</div>

          <div class="form-row">
            <label class="form-label-col">Subtotal</label>
            <div class="form-input-col">
              <div class="xy-pair">
                <span class="xy-tag">X</span>
                <input v-model.number="form.subtotal.x" type="number" step="0.01" class="form-control" />
                <span class="xy-tag">Y</span>
                <input v-model.number="form.subtotal.y" type="number" step="0.01" class="form-control" />
              </div>
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">VAT</label>
            <div class="form-input-col">
              <div class="xy-pair">
                <span class="xy-tag">X</span>
                <input v-model.number="form.vat.x" type="number" step="0.01" class="form-control" />
                <span class="xy-tag">Y</span>
                <input v-model.number="form.vat.y" type="number" step="0.01" class="form-control" />
              </div>
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">Total</label>
            <div class="form-input-col">
              <div class="xy-pair">
                <span class="xy-tag">X</span>
                <input v-model.number="form.total.x" type="number" step="0.01" class="form-control" />
                <span class="xy-tag">Y</span>
                <input v-model.number="form.total.y" type="number" step="0.01" class="form-control" />
              </div>
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">จำนวนเงิน (ตัวอักษร)</label>
            <div class="form-input-col">
              <div class="xy-pair">
                <span class="xy-tag">X</span>
                <input v-model.number="form.amountText.x" type="number" step="0.01" class="form-control" />
                <span class="xy-tag">Y</span>
                <input v-model.number="form.amountText.y" type="number" step="0.01" class="form-control" />
              </div>
            </div>
          </div>
        </div>

        <!-- Font & Printer -->
        <div class="filter-container mb-3">
          <div class="title-text-lg mb-3">ฟอนต์ และเครื่องพิมพ์</div>

          <div class="form-row">
            <label class="form-label-col">Header Font Size</label>
            <div class="form-input-col">
              <input v-model.number="form.headerFontSize" type="number" step="1" class="form-control single" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">Item Font Size</label>
            <div class="form-input-col">
              <input v-model.number="form.itemFontSize" type="number" step="1" class="form-control single" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">Offset X (mm)</label>
            <div class="form-input-col">
              <input v-model.number="form.offsetX" type="number" step="0.5" class="form-control single" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">Offset Y (mm)</label>
            <div class="form-input-col">
              <input v-model.number="form.offsetY" type="number" step="0.5" class="form-control single" />
            </div>
          </div>

          <div class="form-row printer-form-row">
            <label class="form-label-col">Printer Name</label>
            <div class="form-input-col">
              <div class="printer-select-row">
                <AutoCompleteGeneric
                  :modelValue="form.printerName"
                  :staticOptions="printerOptions"
                  :useStaticList="true"
                  optionLabel="label"
                  :placeholder="$t('common.printer.selectPlaceholder')"
                  :forceSelection="false"
                  customClass="printer-ac"
                  @update:modelValue="onPrinterChange"
                />
                <ButtonGeneric
                  variant="outline"
                  icon="bi-arrow-clockwise"
                  :label="$t('common.printer.reload')"
                  @click="loadPrinters"
                />
              </div>

              <div v-if="printerStatus === 'unreachable'" class="printer-status-box">
                <div class="printer-status-title">{{ $t('common.printer.statusUnreachableTitle') }}</div>
                <ul class="printer-status-list">
                  <li>{{ $t('common.printer.statusUnreachableStep1') }}</li>
                  <li>
                    {{ $t('common.printer.statusUnreachableStep2Prefix') }}
                    <a :href="printerHealthUrl" target="_blank" rel="noopener">{{ printerHealthUrl }}</a>
                    {{ $t('common.printer.statusUnreachableStep2Suffix') }}
                  </li>
                  <li>{{ $t('common.printer.statusUnreachableStep3') }}</li>
                </ul>
              </div>
              <small v-else-if="printerStatus === 'blocked'" class="text-muted printer-status-msg">
                {{ $t('common.printer.statusBlocked') }}
              </small>
              <small v-else-if="printerStatus === 'empty'" class="text-muted printer-status-msg">
                {{ $t('common.printer.statusEmpty') }}
              </small>

              <small v-if="printerSavedNotFoundMessage" class="text-warning printer-status-msg">
                {{ printerSavedNotFoundMessage }}
              </small>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="btn-submit-container mb-3">
          <div class="d-flex flex-wrap" style="gap: 8px;">
            <button class="btn btn-main" type="button" @click="onSave">
              <i class="bi bi-save mr-1"></i>บันทึก
            </button>
            <button class="btn btn-green" type="button" @click="onTestPrint">
              <i class="bi bi-printer mr-1"></i>พิมพ์ทดสอบ
            </button>
            <button class="btn btn-outline-main" type="button" @click="onReset">
              <i class="bi bi-arrow-counterclockwise mr-1"></i>Reset เป็นค่า default
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import { getVatLayout, saveVatLayout } from '@/services/helper/print/vat-layout-store.js'
import { printVat } from '@/services/api/print-bridge-service.js'
import { success, error } from '@/services/alert/sweetAlerts.js'
import AutoCompleteGeneric from '@/components/prime-vue/AutoCompleteGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import { storage } from '@/services/storage.js'
import { fetchPrinterList, PRINT_BRIDGE_BASE_URL } from '@/services/api/printer-config-service.js'

const PRINTER_STORAGE_KEY = 'print-bridge-printer-vat'

const DEFAULT_LAYOUT = {
  invoiceNo: { x: 6.0, y: 1.8 },
  date: { x: 6.0, y: 2.2 },
  customerName: { x: 1.2, y: 1.75 },
  customerTaxId: { x: 1.2, y: 1.95 },
  customerAddress: { x: 1.2, y: 2.15 },
  itemsStart: { x: 0, y: 3.1 },
  itemNoX: 0.6,
  itemDescX: 1.1,
  itemQtyX: 4.15,
  itemPriceX: 5.15,
  itemAmountX: 6.48,
  subtotal: { x: 6.5, y: 7.6 },
  vat: { x: 6.5, y: 7.98 },
  total: { x: 6.5, y: 8.3 },
  amountText: { x: 1.0, y: 8.3 },
  rowHeight: 0.17,
  maxRowsPerPage: 25,
  headerFontSize: 12,
  itemFontSize: 10,
  printerName: '',
  offsetX: 0,
  offsetY: 0
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

export default {
  name: 'VatPrintLayoutView',

  components: { AutoCompleteGeneric, ButtonGeneric },

  data() {
    return {
      form: deepClone(DEFAULT_LAYOUT),
      printerOptions: [],
      printerStatus: null
    }
  },

  computed: {
    printerHealthUrl() {
      return `${PRINT_BRIDGE_BASE_URL}/health`
    },

    printerSavedNotFoundMessage() {
      if (this.printerStatus !== 'ok' || !this.form.printerName) return ''
      const found = this.printerOptions.some((p) => p.name === this.form.printerName)
      return found ? '' : this.$t('common.printer.savedNotFound', { name: this.form.printerName })
    }
  },

  async mounted() {
    const saved = await getVatLayout()
    if (saved) {
      this.form = { ...deepClone(DEFAULT_LAYOUT), ...saved }
      const nested = ['invoiceNo', 'date', 'customerName', 'customerTaxId', 'customerAddress', 'itemsStart', 'subtotal', 'vat', 'total', 'amountText']
      nested.forEach(key => {
        if (saved[key]) this.form[key] = { ...DEFAULT_LAYOUT[key], ...saved[key] }
      })
    }

    const storedPrinter = storage.getItem(PRINTER_STORAGE_KEY)
    if (storedPrinter) {
      this.form.printerName = storedPrinter
    }

    await this.loadPrinters()
  },

  methods: {
    async loadPrinters() {
      const result = await fetchPrinterList()
      this.printerStatus = result.status
      this.printerOptions = result.printers
    },

    onPrinterChange(value) {
      this.form.printerName = typeof value === 'object' && value !== null ? value.name : value
    },

    async onSave() {
      if (this.form.printerName) {
        storage.setItem(PRINTER_STORAGE_KEY, this.form.printerName)
      } else {
        storage.removeItem(PRINTER_STORAGE_KEY)
      }
      const payload = { ...this.form }
      delete payload.printerName
      await saveVatLayout(payload)
      success('บันทึกค่า Layout สำเร็จ', 'VAT Print Layout')
    },

    onReset() {
      this.form = deepClone(DEFAULT_LAYOUT)
      success('Reset เป็นค่า default สำเร็จ', 'VAT Print Layout')
    },

    async onTestPrint() {
      const dummy = {
        invoice: {
          invoiceNo: 'TEST-' + Date.now(),
          invoiceDate: new Date().toISOString().slice(0, 10),
          customer: { name: 'ทดสอบ พิมพ์', address: '123 ถนนทดสอบ', taxId: '0000000000000' },
          customerTaxId: '0000000000000',
          items: [
            {
              stockNumber: 'NEW00001',
              productNumber: 'R-TEST-001',
              productNameEN: 'Test Ring 1',
              qty: 2,
              appraisalPrice: 5000,
              discountPercent: 10,
              goldWeight: 1.22,
              stoneWeight: 0.44,
              diamondWeight: 0.18
            },
            {
              stockNumber: 'NEW00002',
              productNumber: 'R-TEST-002',
              productNameEN: 'Test Ring 2',
              qty: 3,
              appraisalPrice: 3000,
              discountPercent: 5,
              goldWeight: 0.85,
              stoneWeight: 0.22,
              diamondWeight: 0.05
            }
          ],
          currencyRate: 1,
          specialDiscount: 0,
          specialAddition: 0,
          freightAndInsurance: 0,
          vatPercent: 7
        },
        layout: this.form,
        printerName: this.form.printerName || null
      }
      try {
        await printVat(dummy)
        success('พิมพ์ทดสอบสำเร็จ', 'VAT Print Layout')
      } catch (err) {
        error(err.message || 'ไม่สามารถพิมพ์ทดสอบได้', 'เกิดข้อผิดพลาด')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.form-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;

  &.printer-form-row {
    align-items: flex-start;
  }

  .form-label-col {
    flex: 0 0 220px;
    margin-bottom: 0;
    font-weight: 600;
    color: var(--base-sub-color);
    font-size: 0.85rem;
  }

  .form-input-col {
    flex: 1;

    .form-control.single {
      max-width: 160px;
    }
  }

  .xy-pair {
    display: flex;
    align-items: center;
    gap: 8px;

    .xy-tag {
      font-size: 0.8rem;
      color: var(--base-sub-color);
      font-weight: 600;
      flex-shrink: 0;
    }

    .form-control {
      flex: 1;
    }
  }
}

.form-control {
  border: 1px solid #ced4da;
  border-radius: 4px;
  padding: 0.4rem 0.6rem;
  font-size: var(--base-font-size);
  width: 100%;

  &:focus {
    border-color: var(--base-green);
    box-shadow: 0 0 0 0.2rem rgba(3, 131, 135, 0.25);
    outline: none;
  }
}

@media (max-width: 576px) {
  .form-row {
    flex-direction: column;
    align-items: stretch;

    .form-label-col {
      flex: none;
    }

    .form-input-col .form-control.single {
      max-width: 100%;
    }
  }
}

.printer-select-row {
  display: flex;
  align-items: flex-start;
  gap: var(--sp-sm);

  :deep(.printer-ac) {
    flex: 1;
  }
}

.printer-status-box {
  margin-top: var(--sp-xs);
  padding: var(--sp-sm) var(--sp-md);
  border: 1px solid var(--base-red);
  border-radius: var(--radius-sm);
  background: #fff5f5;
}

.printer-status-title {
  font-weight: 700;
  color: var(--base-red);
  margin-bottom: var(--sp-xs);
  font-size: var(--fs-sm);
}

.printer-status-list {
  margin: 0;
  padding-left: var(--sp-lg);
  font-size: var(--fs-sm);
  color: var(--base-sub-color);

  a {
    color: var(--base-green);
  }
}

.printer-status-msg {
  display: block;
  margin-top: var(--sp-xs);
}
</style>
