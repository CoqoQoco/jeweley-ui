<template>
  <div class="app-container">
    <div class="title-text mb-3">ตั้งค่ารูปแบบพิมพ์ Bill (K&P) (Bridge GDI)</div>

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

        <!-- Extra Columns -->
        <div class="filter-container mb-3">
          <div class="title-text-lg mb-3">ตำแหน่งคอลัมน์เพิ่มเติม</div>

          <div class="form-row">
            <label class="form-label-col">Stock Number X</label>
            <div class="form-input-col">
              <input v-model.number="form.xStockNumber" type="number" step="0.01" class="form-control single" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">Stock บรรทัดที่ 2 — Δy</label>
            <div class="form-input-col">
              <input v-model.number="form.stockSecondLineDy" type="number" step="0.01" class="form-control single" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">ราคาก่อนลด X</label>
            <div class="form-input-col">
              <input v-model.number="form.xPriceBeforeDiscount" type="number" step="0.01" class="form-control single" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">ราคารวม VAT X</label>
            <div class="form-input-col">
              <input v-model.number="form.xPriceIncludingVat" type="number" step="0.01" class="form-control single" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">Gold (gms) X</label>
            <div class="form-input-col">
              <input v-model.number="form.xGoldWeight" type="number" step="0.01" class="form-control single" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">Stone (cts) X</label>
            <div class="form-input-col">
              <input v-model.number="form.xStoneWeight" type="number" step="0.01" class="form-control single" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">Diamond (cts) X</label>
            <div class="form-input-col">
              <input v-model.number="form.xDiamondWeight" type="number" step="0.01" class="form-control single" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">Page Number</label>
            <div class="form-input-col">
              <div class="xy-pair">
                <span class="xy-tag">X</span>
                <input v-model.number="form.pageNumber.x" type="number" step="0.01" class="form-control" />
                <span class="xy-tag">Y</span>
                <input v-model.number="form.pageNumber.y" type="number" step="0.01" class="form-control" />
              </div>
            </div>
          </div>
        </div>

        <!-- Display Toggles -->
        <div class="filter-container mb-3">
          <div class="title-text-lg mb-3">ตัวเลือกการแสดงผล</div>

          <div class="form-row">
            <label class="form-label-col">แสดงคอลัมน์ "ราคาก่อนลด"</label>
            <div class="form-input-col">
              <input v-model="form.showPriceBeforeDiscount" type="checkbox" class="form-check-input" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">แสดงคอลัมน์ "ราคารวม VAT"</label>
            <div class="form-input-col">
              <input v-model="form.showPriceIncludingVat" type="checkbox" class="form-check-input" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">ใช้ปี พ.ศ. (Buddhist year)</label>
            <div class="form-input-col">
              <input v-model="form.useBuddhistYear" type="checkbox" class="form-check-input" />
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

          <div class="form-row">
            <label class="form-label-col">Printer Name</label>
            <div class="form-input-col">
              <input v-model="form.printerName" type="text" class="form-control" placeholder="ชื่อเครื่องพิมพ์ใน Windows" />
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
import { getBillLayout, saveBillLayout, clearBillLayout } from '@/services/helper/print/bill-layout-store.js'
import { printBill } from '@/services/api/print-bridge-service.js'
import { success, error } from '@/services/alert/sweetAlerts.js'

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
  printerName: 'EPSON LQ-310 ESC/P2',
  offsetX: 0,
  offsetY: 0,
  xStockNumber: 1.0,
  stockSecondLineDy: 0.13,
  xPriceBeforeDiscount: 2.55,
  xPriceIncludingVat: 3.05,
  xGoldWeight: 3.6,
  xStoneWeight: 4.4,
  xDiamondWeight: 4.95,
  pageNumber: { x: 7.5, y: 2.4 },
  useBuddhistYear: true,
  showPriceBeforeDiscount: true,
  showPriceIncludingVat: true
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

export default {
  name: 'BillPrintLayoutView',

  data() {
    return {
      form: deepClone(DEFAULT_LAYOUT)
    }
  },

  mounted() {
    const saved = getBillLayout()
    if (saved) {
      this.form = { ...deepClone(DEFAULT_LAYOUT), ...saved }
      const nested = ['invoiceNo', 'date', 'customerName', 'customerTaxId', 'customerAddress', 'itemsStart', 'subtotal', 'vat', 'total', 'amountText', 'pageNumber']
      nested.forEach(key => {
        if (saved[key]) this.form[key] = { ...DEFAULT_LAYOUT[key], ...saved[key] }
      })
    }
  },

  methods: {
    onSave() {
      saveBillLayout(this.form)
      success('บันทึกค่า Layout สำเร็จ', 'Bill Print Layout')
    },

    onReset() {
      clearBillLayout()
      this.form = deepClone(DEFAULT_LAYOUT)
      success('Reset เป็นค่า default สำเร็จ', 'Bill Print Layout')
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
              qty: 1,
              appraisalPrice: 5000,
              discountPercent: 0,
              goldWeight: 1.22,
              stoneWeight: 0.44,
              diamondWeight: 0.18
            },
            {
              stockNumber: 'NEW00002',
              productNumber: 'R-TEST-002',
              productNameEN: 'Test Ring 2',
              qty: 2,
              appraisalPrice: 3000,
              discountPercent: 5,
              goldWeight: null,
              stoneWeight: null,
              diamondWeight: null
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
        await printBill(dummy)
        success('พิมพ์ทดสอบสำเร็จ', 'Bill Print Layout')
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

.form-check-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
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
</style>
