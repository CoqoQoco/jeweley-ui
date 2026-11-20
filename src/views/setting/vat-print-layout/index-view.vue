<template>
  <div class="app-container">
    <div class="title-text mb-3">ตั้งค่ารูปแบบพิมพ์ VAT (Bridge GDI)</div>

    <div class="mb-3">
      <ToggleGroupGeneric
        :modelValue="layoutKey"
        :options="versionOptions"
        :ariaLabel="$t('view.setting.vatPrintLayout.versionLabel')"
        @update:modelValue="onVersionChange"
      />
      <small class="form-text text-muted d-block mt-1">{{ $t('view.setting.vatPrintLayout.versionHelper') }}</small>
    </div>

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

          <div v-if="hasTotalQty" class="form-row">
            <label class="form-label-col">{{ $t('view.setting.vatPrintLayout.totalQty') }}</label>
            <div class="form-input-col">
              <div class="xy-pair">
                <span class="xy-tag">X</span>
                <input v-model.number="form.totalQty.x" type="number" step="0.01" class="form-control" />
                <span class="xy-tag">Y</span>
                <input v-model.number="form.totalQty.y" type="number" step="0.01" class="form-control" />
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
                  :dropdown="true"
                  class="printer-ac"
                  @update:modelValue="onPrinterChange"
                />
                <ButtonGeneric
                  variant="outline"
                  icon="bi-arrow-clockwise"
                  :label="$t('common.printer.reload')"
                  @click="loadPrinters"
                />
                <ButtonGeneric
                  variant="outline"
                  icon="bi-x-lg"
                  :title="$t('common.printer.clear')"
                  @click="onClearPrinter"
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

              <small v-if="printerOptions.length === 0" class="text-muted printer-status-msg">
                {{ $t('common.printer.manualHint') }}
              </small>

              <small v-if="isBarcodePrinterSelected" class="printer-status-msg printer-barcode-warning">
                <i class="bi bi-exclamation-triangle mr-1"></i>{{ $t('view.sale.invoiceDetail.printerIsBarcode') }}
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
import { buildVatPrintModel } from '@/services/helper/print/vat-print-model-builder.js'
import { VAT_LAYOUT_KEY, VAT_V2_LAYOUT_KEY, getVatLayoutDefaults } from '@/services/helper/print/vat-layout-defaults.js'
import { TAX_PAPER } from '@/services/helper/print/tax-paper.js'
import { printGeneric } from '@/services/api/print-bridge-service.js'
import { success, error } from '@/services/alert/sweetAlerts.js'
import AutoCompleteGeneric from '@/components/prime-vue/AutoCompleteGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import ToggleGroupGeneric from '@/components/generic/ToggleGroupGeneric.vue'
import { storage } from '@/services/storage.js'
import { getBarcodePrinterName } from '@/services/api/barcode-printer-config.js'
import { isBarcodePrinter, confirmIfBarcodePrinter } from '@/services/helper/print/document-printer-guard.js'
import { fetchPrinterList, PRINT_BRIDGE_BASE_URL } from '@/services/api/printer-config-service.js'

const PRINTER_STORAGE_KEYS = Object.values(TAX_PAPER).reduce((map, cfg) => {
  map[cfg.layoutKey] = cfg.printerStorageKey
  return map
}, {})

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

export default {
  name: 'VatPrintLayoutView',

  components: { AutoCompleteGeneric, ButtonGeneric, ToggleGroupGeneric },

  data() {
    return {
      layoutKey: VAT_LAYOUT_KEY,
      form: deepClone(getVatLayoutDefaults(VAT_LAYOUT_KEY)),
      printerOptions: [],
      printerStatus: null
    }
  },

  computed: {
    versionOptions() {
      return [
        { value: VAT_LAYOUT_KEY, label: this.$t('view.setting.vatPrintLayout.versionOld') },
        { value: VAT_V2_LAYOUT_KEY, label: this.$t('view.setting.vatPrintLayout.versionNew') }
      ]
    },

    hasTotalQty() {
      return !!getVatLayoutDefaults(this.layoutKey).totalQty
    },

    printerHealthUrl() {
      return `${PRINT_BRIDGE_BASE_URL}/health`
    },

    isBarcodePrinterSelected() {
      return isBarcodePrinter(this.form.printerName, getBarcodePrinterName())
    },

    printerSavedNotFoundMessage() {
      if (this.printerStatus !== 'ok' || !this.form.printerName) return ''
      const found = this.printerOptions.some((p) => p.name === this.form.printerName)
      return found ? '' : this.$t('common.printer.savedNotFound', { name: this.form.printerName })
    }
  },

  async mounted() {
    await this.loadVersion(VAT_LAYOUT_KEY)
    await this.loadPrinters()
  },

  methods: {
    async loadVersion(layoutKey) {
      const defaults = getVatLayoutDefaults(layoutKey)
      const saved = await getVatLayout(layoutKey)
      this.layoutKey = layoutKey
      this.form = deepClone(defaults)
      if (saved) {
        this.form = { ...deepClone(defaults), ...saved }
        const nested = ['invoiceNo', 'date', 'customerName', 'customerTaxId', 'customerAddress', 'itemsStart', 'subtotal', 'vat', 'total', 'amountText', 'totalQty']
        nested.forEach(key => {
          if (saved[key] && defaults[key]) this.form[key] = { ...defaults[key], ...saved[key] }
        })
      }

      const storedPrinter = storage.getItem(PRINTER_STORAGE_KEYS[layoutKey])
      if (storedPrinter) {
        this.form.printerName = storedPrinter
      }
    },

    async onVersionChange(layoutKey) {
      if (layoutKey === this.layoutKey) return
      await this.loadVersion(layoutKey)
    },

    async loadPrinters() {
      const result = await fetchPrinterList()
      this.printerStatus = result.status
      this.printerOptions = result.printers
    },

    onPrinterChange(value) {
      this.form.printerName = typeof value === 'object' && value !== null ? value.name : value
    },

    onClearPrinter() {
      this.form.printerName = ''
    },

    async onSave() {
      const printerKey = PRINTER_STORAGE_KEYS[this.layoutKey]
      if (this.form.printerName) {
        storage.setItem(printerKey, this.form.printerName)
      } else {
        storage.removeItem(printerKey)
      }
      const payload = { ...this.form }
      delete payload.printerName
      await saveVatLayout(payload, this.layoutKey)
      success('บันทึกค่า Layout สำเร็จ', 'VAT Print Layout')
    },

    onReset() {
      this.form = deepClone(getVatLayoutDefaults(this.layoutKey))
      success('Reset เป็นค่า default สำเร็จ', 'VAT Print Layout')
    },

    onTestPrint() {
      confirmIfBarcodePrinter(
        this.form.printerName,
        getBarcodePrinterName(),
        {
          message: this.$t('view.sale.invoiceDetail.printerIsBarcodeConfirmMsg'),
          title: this.$t('view.sale.invoiceDetail.printerIsBarcodeConfirmTitle'),
          confirmText: this.$t('view.sale.invoiceDetail.printerIsBarcodeConfirmBtn'),
          cancelText: this.$t('common.btn.cancel')
        },
        () => this.doTestPrint()
      )
    },

    async doTestPrint() {
      const invoice = {
        invoiceNo: 'TEST-' + Date.now(),
        invoiceDate: new Date().toISOString().slice(0, 10),
        customer: { name: 'ทดสอบ พิมพ์', address: '123 ถนนทดสอบ', taxId: '0000000000000' },
        customerTaxId: '0000000000000',
        items: [
          { productNameEN: 'Test Ring 1', qty: 2, appraisalPrice: 5000, discountPercent: 10 },
          { productNameEN: 'Test Ring 2', qty: 3, appraisalPrice: 3000, discountPercent: 5 }
        ],
        currencyRate: 1,
        specialDiscount: 0,
        specialAddition: 0,
        freightAndInsurance: 0,
        vatPercent: 7
      }
      const model = buildVatPrintModel(invoice, this.form, {
        printerName: this.form.printerName || null,
        layoutKey: this.layoutKey
      })
      try {
        await printGeneric(model)
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
  flex-wrap: wrap;
  gap: var(--sp-sm);

  .printer-ac {
    flex: 1 1 200px;
    min-width: 200px;
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

.printer-barcode-warning {
  color: var(--base-font-color);

  .bi {
    color: var(--status-open);
  }
}

.printer-status-msg {
  display: block;
  margin-top: var(--sp-xs);
}
</style>
