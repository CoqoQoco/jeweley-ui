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
                <InputTextGeneric v-model="form.invoiceNo.x" type="number" step="0.01" />
                <span class="xy-tag">Y</span>
                <InputTextGeneric v-model="form.invoiceNo.y" type="number" step="0.01" />
              </div>
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">Date</label>
            <div class="form-input-col">
              <div class="xy-pair">
                <span class="xy-tag">X</span>
                <InputTextGeneric v-model="form.date.x" type="number" step="0.01" />
                <span class="xy-tag">Y</span>
                <InputTextGeneric v-model="form.date.y" type="number" step="0.01" />
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
                <InputTextGeneric v-model="form.customerName.x" type="number" step="0.01" />
                <span class="xy-tag">Y</span>
                <InputTextGeneric v-model="form.customerName.y" type="number" step="0.01" />
              </div>
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">เลขผู้เสียภาษีลูกค้า</label>
            <div class="form-input-col">
              <div class="xy-pair">
                <span class="xy-tag">X</span>
                <InputTextGeneric v-model="form.customerTaxId.x" type="number" step="0.01" />
                <span class="xy-tag">Y</span>
                <InputTextGeneric v-model="form.customerTaxId.y" type="number" step="0.01" />
              </div>
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">ที่อยู่ลูกค้า</label>
            <div class="form-input-col">
              <div class="xy-pair">
                <span class="xy-tag">X</span>
                <InputTextGeneric v-model="form.customerAddress.x" type="number" step="0.01" />
                <span class="xy-tag">Y</span>
                <InputTextGeneric v-model="form.customerAddress.y" type="number" step="0.01" />
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
                <InputTextGeneric v-model="form.itemsStart.x" type="number" step="0.01" />
                <span class="xy-tag">Y</span>
                <InputTextGeneric v-model="form.itemsStart.y" type="number" step="0.01" />
              </div>
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">ตำแหน่ง X — ลำดับ</label>
            <div class="form-input-col single-input">
              <InputTextGeneric v-model="form.itemNoX" type="number" step="0.01" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">Stock Number X</label>
            <div class="form-input-col single-input">
              <InputTextGeneric v-model="form.xStockNumber" type="number" step="0.01" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">Product Number X</label>
            <div class="form-input-col single-input">
              <InputTextGeneric v-model="form.xProductNumber" type="number" step="0.01" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">ชื่อสินค้า X (Product Name)</label>
            <div class="form-input-col single-input">
              <InputTextGeneric v-model="form.itemDescX" type="number" step="0.01" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">ราคาทุน X</label>
            <div class="form-input-col single-input">
              <InputTextGeneric v-model="form.xPriceBeforeDiscount" type="number" step="0.01" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">ราคาขาย + VAT X</label>
            <div class="form-input-col single-input">
              <InputTextGeneric v-model="form.xPriceIncludingVat" type="number" step="0.01" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">Qty X</label>
            <div class="form-input-col single-input">
              <InputTextGeneric v-model="form.itemQtyX" type="number" step="0.01" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">Gold (gms) X</label>
            <div class="form-input-col single-input">
              <InputTextGeneric v-model="form.xGoldWeight" type="number" step="0.01" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">Stone (cts) X</label>
            <div class="form-input-col single-input">
              <InputTextGeneric v-model="form.xStoneWeight" type="number" step="0.01" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">Diamond (cts) X</label>
            <div class="form-input-col single-input">
              <InputTextGeneric v-model="form.xDiamondWeight" type="number" step="0.01" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">Diamond Grade X</label>
            <div class="form-input-col single-input">
              <InputTextGeneric v-model="form.xDiamondGrade" type="number" step="0.01" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">ตำแหน่ง X — หมายเหตุ (ขนาดแป้นต่างหู)</label>
            <div class="form-input-col single-input">
              <InputTextGeneric v-model="form.xRemark" type="number" step="0.01" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">Unit Price X</label>
            <div class="form-input-col single-input">
              <InputTextGeneric v-model="form.itemPriceX" type="number" step="0.01" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">Amount X</label>
            <div class="form-input-col single-input">
              <InputTextGeneric v-model="form.itemAmountX" type="number" step="0.01" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">Row Height</label>
            <div class="form-input-col single-input">
              <InputTextGeneric v-model="form.rowHeight" type="number" step="0.01" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">แถวสูงสุด/หน้า</label>
            <div class="form-input-col single-input">
              <InputTextGeneric v-model="form.maxRowsPerPage" type="number" step="1" />
            </div>
          </div>
        </div>

        <!-- Display Toggles -->
        <div class="filter-container mb-3">
          <div class="title-text-lg mb-3">ตัวเลือกการแสดงผล</div>

          <div class="form-row">
            <label class="form-label-col">Page Number</label>
            <div class="form-input-col">
              <div class="xy-pair">
                <span class="xy-tag">X</span>
                <InputTextGeneric v-model="form.pageNumber.x" type="number" step="0.01" />
                <span class="xy-tag">Y</span>
                <InputTextGeneric v-model="form.pageNumber.y" type="number" step="0.01" />
              </div>
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">ใช้ปี พ.ศ. (Buddhist year)</label>
            <div class="form-input-col">
              <CheckboxGeneric v-model="form.useBuddhistYear" />
            </div>
          </div>

          <!-- Header group -->
          <div class="toggle-group-title mt-3 mb-1">Header</div>

          <div class="form-row">
            <label class="form-label-col">แสดง Invoice No.</label>
            <div class="form-input-col">
              <CheckboxGeneric v-model="form.showInvoiceNo" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">แสดงวันที่</label>
            <div class="form-input-col">
              <CheckboxGeneric v-model="form.showDate" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">แสดงเลขหน้า</label>
            <div class="form-input-col">
              <CheckboxGeneric v-model="form.showPageNumber" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">แสดงชื่อลูกค้า</label>
            <div class="form-input-col">
              <CheckboxGeneric v-model="form.showCustomerName" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">แสดงเลขผู้เสียภาษีลูกค้า</label>
            <div class="form-input-col">
              <CheckboxGeneric v-model="form.showCustomerTaxId" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">แสดงที่อยู่ลูกค้า</label>
            <div class="form-input-col">
              <CheckboxGeneric v-model="form.showCustomerAddress" />
            </div>
          </div>

          <!-- Table group -->
          <div class="toggle-group-title mt-3 mb-1">ตาราง</div>

          <div class="form-row">
            <label class="form-label-col">แสดงลำดับที่ (Item No.)</label>
            <div class="form-input-col">
              <CheckboxGeneric v-model="form.showItemNo" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">แสดงชื่อสินค้า (Description)</label>
            <div class="form-input-col">
              <CheckboxGeneric v-model="form.showDescription" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">แสดงคอลัมน์ Stock No.</label>
            <div class="form-input-col">
              <CheckboxGeneric v-model="form.showStockNumber" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">แสดงคอลัมน์ รหัสสินค้า</label>
            <div class="form-input-col">
              <CheckboxGeneric v-model="form.showProductNumber" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">แสดงคอลัมน์ "ราคาทุน"</label>
            <div class="form-input-col">
              <CheckboxGeneric v-model="form.showPriceBeforeDiscount" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">แสดงคอลัมน์ "ราคาขาย+VAT"</label>
            <div class="form-input-col">
              <CheckboxGeneric v-model="form.showPriceIncludingVat" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">แสดงน้ำหนักทอง (Gold gms)</label>
            <div class="form-input-col">
              <CheckboxGeneric v-model="form.showGoldWeight" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">แสดงน้ำหนักพลอย (Stone cts)</label>
            <div class="form-input-col">
              <CheckboxGeneric v-model="form.showStoneWeight" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">แสดงน้ำหนักเพชร (Diamond cts)</label>
            <div class="form-input-col">
              <CheckboxGeneric v-model="form.showDiamondWeight" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">แสดงเกรดเพชร (Diamond Grade)</label>
            <div class="form-input-col">
              <CheckboxGeneric v-model="form.showDiamondGrade" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">แสดงจำนวน (Qty)</label>
            <div class="form-input-col">
              <CheckboxGeneric v-model="form.showQty" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">แสดงราคาต่อหน่วย (Unit Price)</label>
            <div class="form-input-col">
              <CheckboxGeneric v-model="form.showUnitPrice" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">แสดงยอดรวมต่อแถว (Amount)</label>
            <div class="form-input-col">
              <CheckboxGeneric v-model="form.showAmount" />
            </div>
          </div>

          <!-- Footer group -->
          <div class="toggle-group-title mt-3 mb-1">Footer</div>

          <div class="form-row">
            <label class="form-label-col">แสดง Subtotal (ก่อน VAT)</label>
            <div class="form-input-col">
              <CheckboxGeneric v-model="form.showSubtotal" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">แสดง VAT</label>
            <div class="form-input-col">
              <CheckboxGeneric v-model="form.showVat" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">แสดง Total</label>
            <div class="form-input-col">
              <CheckboxGeneric v-model="form.showTotal" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">แสดงจำนวนเงินตัวอักษร</label>
            <div class="form-input-col">
              <CheckboxGeneric v-model="form.showAmountText" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">แสดงคอลัมน์ หมายเหตุ (ขนาดแป้นต่างหู)</label>
            <div class="form-input-col">
              <CheckboxGeneric v-model="form.showRemark" />
            </div>
          </div>

          <!-- VAT/price mode -->
          <div class="toggle-group-title mt-3 mb-1">รูปแบบ VAT / ราคา</div>

          <div class="form-row">
            <label class="form-label-col">คอลัมน์ Unit Price แสดง</label>
            <div class="form-input-col">
              <RadioGroupGeneric
                v-model="form.unitPriceMode"
                :options="unitPriceModeOptions"
                optionLabel="label"
                optionValue="value"
              />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">แสดงราคาทศนิยม 2 ตำแหน่ง</label>
            <div class="form-input-col">
              <CheckboxGeneric v-model="form.showDecimals" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">VAT % (ต่อหน่วย)</label>
            <div class="form-input-col single-input">
              <InputTextGeneric v-model="form.unitVatPercent" type="number" step="0.01" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">VAT % (สรุป)</label>
            <div class="form-input-col single-input">
              <InputTextGeneric v-model="form.summaryVatPercent" type="number" step="0.01" />
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
                <InputTextGeneric v-model="form.subtotal.x" type="number" step="0.01" />
                <span class="xy-tag">Y</span>
                <InputTextGeneric v-model="form.subtotal.y" type="number" step="0.01" />
              </div>
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">VAT</label>
            <div class="form-input-col">
              <div class="xy-pair">
                <span class="xy-tag">X</span>
                <InputTextGeneric v-model="form.vat.x" type="number" step="0.01" />
                <span class="xy-tag">Y</span>
                <InputTextGeneric v-model="form.vat.y" type="number" step="0.01" />
              </div>
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">Total</label>
            <div class="form-input-col">
              <div class="xy-pair">
                <span class="xy-tag">X</span>
                <InputTextGeneric v-model="form.total.x" type="number" step="0.01" />
                <span class="xy-tag">Y</span>
                <InputTextGeneric v-model="form.total.y" type="number" step="0.01" />
              </div>
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">จำนวนเงิน (ตัวอักษร)</label>
            <div class="form-input-col">
              <div class="xy-pair">
                <span class="xy-tag">X</span>
                <InputTextGeneric v-model="form.amountText.x" type="number" step="0.01" />
                <span class="xy-tag">Y</span>
                <InputTextGeneric v-model="form.amountText.y" type="number" step="0.01" />
              </div>
            </div>
          </div>
        </div>

        <!-- Font & Printer -->
        <div class="filter-container mb-3">
          <div class="title-text-lg mb-3">ฟอนต์ และเครื่องพิมพ์</div>

          <div class="form-row">
            <label class="form-label-col">Header Font Size</label>
            <div class="form-input-col single-input">
              <InputTextGeneric v-model="form.headerFontSize" type="number" step="1" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">ขนาดฟอนต์ลูกค้า</label>
            <div class="form-input-col single-input">
              <InputTextGeneric v-model="form.customerFontSize" type="number" step="1" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">{{ $t('view.sale.invoiceDetail.customerAddressMaxCharsLabel') }}</label>
            <div class="form-input-col single-input">
              <InputTextGeneric v-model="form.customerAddressMaxChars" type="number" step="1" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">Item Font Size</label>
            <div class="form-input-col single-input">
              <InputTextGeneric v-model="form.itemFontSize" type="number" step="1" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">Offset X (mm)</label>
            <div class="form-input-col single-input">
              <InputTextGeneric v-model="form.offsetX" type="number" step="0.5" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">Offset Y (mm)</label>
            <div class="form-input-col single-input">
              <InputTextGeneric v-model="form.offsetY" type="number" step="0.5" />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-col">Printer Name</label>
            <div class="form-input-col">
              <DropdownGeneric
                v-model="form.printerName"
                :options="printerOptions"
                optionLabel="label"
                optionValue="name"
                placeholder="เลือกเครื่องพิมพ์"
                :showClear="true"
              />
              <small v-if="printerOptions.length === 0" class="text-muted">
                ไม่พบรายชื่อเครื่องพิมพ์ — ตรวจสอบว่า bridge รันอยู่และ config มี Printers
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
import { getBillLayout, saveBillLayout } from '@/services/helper/print/bill-layout-store.js'
import { printGeneric } from '@/services/api/print-bridge-service.js'
import { buildBillPrintModel } from '@/services/helper/print/bill-print-model-builder.js'
import { success, error } from '@/services/alert/sweetAlerts.js'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import CheckboxGeneric from '@/components/prime-vue/CheckboxGeneric.vue'
import RadioGroupGeneric from '@/components/prime-vue/RadioGroupGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import { getPrinterList } from '@/services/api/printer-config-service.js'

const DEFAULT_LAYOUT = {
  invoiceNo: { x: 6.0, y: 1.8 },
  date: { x: 6.0, y: 2.2 },
  customerName: { x: 1.2, y: 1.75 },
  customerTaxId: { x: 1.2, y: 1.95 },
  customerAddress: { x: 1.2, y: 2.15 },
  itemsStart: { x: 0, y: 3.1 },
  itemNoX: 0.18,
  xStockNumber: 0.45,
  xProductNumber: 1.10,
  itemDescX: 1.75,
  xPriceBeforeDiscount: 2.60,
  xPriceIncludingVat: 3.30,
  itemQtyX: 3.95,
  xGoldWeight: 4.45,
  xStoneWeight: 5.15,
  xDiamondWeight: 5.85,
  xDiamondGrade: 6.20,
  itemPriceX: 6.75,
  itemAmountX: 8.0,
  stockSecondLineDy: 0.13,
  pageNumber: { x: 7.5, y: 2.4 },
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
  offsetY: 8,
  useBuddhistYear: true,
  showPriceBeforeDiscount: true,
  showPriceIncludingVat: true,
  xRemark: 2.0,
  showRemark: true,
  showStockNumber: true,
  showProductNumber: true,
  // Header element flags
  showInvoiceNo: true,
  showDate: true,
  showPageNumber: true,
  showCustomerName: true,
  showCustomerTaxId: true,
  showCustomerAddress: true,
  // Table element flags
  showItemNo: true,
  showDescription: true,
  showGoldWeight: true,
  showStoneWeight: true,
  showDiamondWeight: true,
  showDiamondGrade: true,
  showQty: true,
  showUnitPrice: true,
  showAmount: true,
  // Footer element flags
  showSubtotal: true,
  showVat: true,
  showTotal: true,
  showAmountText: true,
  // Unit price mode and VAT percents
  unitPriceMode: 'tag',
  unitVatPercent: 7,
  summaryVatPercent: 7,
  showDecimals: true,
  // Customer font size (separate from header)
  customerFontSize: 12,
  // Address word-wrap: max characters per line
  customerAddressMaxChars: 70
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

export default {
  name: 'BillPrintLayoutView',

  components: { DropdownGeneric, CheckboxGeneric, RadioGroupGeneric, InputTextGeneric },

  data() {
    return {
      form: deepClone(DEFAULT_LAYOUT),
      printerOptions: []
    }
  },

  computed: {
    unitPriceModeOptions() {
      return [
        { value: 'tag', label: 'ราคาป้าย' },
        { value: 'addVat', label: '+VAT' },
        { value: 'subVat', label: '−VAT' }
      ]
    }
  },

  async mounted() {
    const saved = await getBillLayout()
    if (saved) {
      this.form = { ...deepClone(DEFAULT_LAYOUT), ...saved }
      const nested = ['invoiceNo', 'date', 'customerName', 'customerTaxId', 'customerAddress', 'itemsStart', 'subtotal', 'vat', 'total', 'amountText', 'pageNumber']
      nested.forEach(key => {
        if (saved[key]) this.form[key] = { ...DEFAULT_LAYOUT[key], ...saved[key] }
      })
    }
    this.printerOptions = await getPrinterList()
  },

  methods: {
    coerceNumerics(obj) {
      const result = deepClone(obj)
      const numFields = [
        'itemNoX', 'xStockNumber', 'xProductNumber', 'itemDescX', 'xPriceBeforeDiscount',
        'xPriceIncludingVat', 'itemQtyX', 'xGoldWeight', 'xStoneWeight', 'xDiamondWeight', 'xDiamondGrade',
        'itemPriceX', 'itemAmountX', 'xRemark', 'rowHeight', 'maxRowsPerPage',
        'headerFontSize', 'customerFontSize', 'itemFontSize', 'offsetX', 'offsetY', 'stockSecondLineDy',
        'unitVatPercent', 'summaryVatPercent', 'customerAddressMaxChars'
      ]
      numFields.forEach(k => { if (result[k] !== undefined) result[k] = Number(result[k]) })
      const xyFields = ['invoiceNo', 'date', 'customerName', 'customerTaxId', 'customerAddress', 'itemsStart', 'subtotal', 'vat', 'total', 'amountText', 'pageNumber']
      xyFields.forEach(k => {
        if (result[k]) { result[k].x = Number(result[k].x); result[k].y = Number(result[k].y) }
      })
      return result
    },

    async onSave() {
      await saveBillLayout(this.coerceNumerics(this.form))
      success('บันทึกค่า Layout สำเร็จ', 'Bill Print Layout')
    },

    onReset() {
      this.form = deepClone(DEFAULT_LAYOUT)
      success('Reset เป็นค่า default สำเร็จ', 'Bill Print Layout')
    },

    async onTestPrint() {
      const dummyInvoice = {
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
            diamondWeight: 0.18,
            earringStemSize: '10 มม.'
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
            diamondWeight: 0.05,
            earringStemSize: '8 มม.'
          }
        ],
        currencyRate: 1,
        specialDiscount: 0,
        specialAddition: 0,
        freightAndInsurance: 0,
        vatPercent: 7
      }
      try {
        const model = buildBillPrintModel(dummyInvoice, this.coerceNumerics(this.form), { printerName: this.form.printerName || null })
        await printGeneric(model)
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

    &.single-input {
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
  }
}

.toggle-group-title {
  font-size: var(--fs-sm);
  font-weight: 700;
  color: var(--base-font-color);
  text-transform: uppercase;
  letter-spacing: 0.03em;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--color-border);
}

@media (max-width: 576px) {
  .form-row {
    flex-direction: column;
    align-items: stretch;

    .form-label-col {
      flex: none;
    }

    .form-input-col.single-input {
      max-width: 100%;
    }
  }
}
</style>
