<template>
  <div class="mobile-sale-detail-view">
    <!-- Loading -->
    <div v-if="isLoading" class="mobile-container mobile-mt-2">
      <div class="mobile-loading">
        <div class="spinner"></div>
        <div class="loading-text">กำลังโหลดข้อมูล...</div>
      </div>
    </div>

    <!-- SO Detail Content -->
    <div v-else-if="soData" class="mobile-container mobile-mt-1">
      <!-- SO Info Card -->
      <div class="info-card">
        <div class="card-header">
          <i class="bi bi-receipt"></i>
          <span>ข้อมูลใบสั่งขาย</span>
          <span
            class="header-status-badge"
            :style="{ background: getStatusColor(soData.status) }"
          >
            {{ getStatusLabel(soData.status) }}
          </span>
        </div>
        <div class="card-body">
          <div class="info-row">
            <span class="info-label">เลขที่ SO:</span>
            <span class="info-value highlight">{{ soData.soNumber }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">วันที่สร้าง:</span>
            <span class="info-value">{{ formatDate(soData.createDate) }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">ผู้สร้าง:</span>
            <span class="info-value">{{ soData.createBy || '-' }}</span>
          </div>
          <div v-if="soData.currencyUnit" class="info-row">
            <span class="info-label">สกุลเงิน:</span>
            <span class="info-value">{{ soData.currencyUnit }} (Rate: {{ soData.currencyRate || 1 }})</span>
          </div>
        </div>
      </div>

      <!-- Customer Info Card -->
      <div v-if="hasCustomerInfo" class="info-card mobile-mt-2">
        <div class="card-header">
          <i class="bi bi-person"></i>
          <span>ข้อมูลลูกค้า</span>
        </div>
        <div class="card-body">
          <div v-if="soData.customerName" class="info-row">
            <span class="info-label">ชื่อลูกค้า:</span>
            <span class="info-value">{{ soData.customerName }}</span>
          </div>
          <div v-if="soData.customerTel" class="info-row">
            <span class="info-label">เบอร์โทร:</span>
            <span class="info-value">{{ soData.customerTel }}</span>
          </div>
          <div v-if="soData.customerAddress" class="info-row remark-row">
            <span class="info-label">ที่อยู่:</span>
            <span class="info-value">{{ soData.customerAddress }}</span>
          </div>
        </div>
      </div>

      <!-- ==================== EDIT MODE ==================== -->
      <template v-if="isEditing">
        <!-- Add Item Section -->
        <div class="section-card mobile-mt-2">
          <div class="section-header-bar">
            <h3 class="section-title">
              <i class="bi bi-plus-circle"></i>
              เพิ่มสินค้า
            </h3>
          </div>

          <AddItemMethodSelector
            :activeTab="addItemTab"
            @update:activeTab="addItemTab = $event"
          />

          <!-- Tab A: Appraisal Jobs -->
          <div v-if="addItemTab === 'appraisal'">
            <AppraisalJobList
              :selectedItems="editItems"
              @add-item="addEditItem"
            />
          </div>

          <!-- Tab B: Scan -->
          <div v-if="addItemTab === 'scan'" class="scan-section">
            <div class="search-field-selector">
              <label class="field-selector-label">ค้นหาด้วย</label>
              <div class="field-selector-options">
                <button
                  v-for="option in searchFieldOptions"
                  :key="option.value"
                  class="field-option-btn"
                  :class="{ active: searchField === option.value }"
                  @click="searchField = option.value"
                >
                  <i :class="option.icon"></i>
                  {{ option.label }}
                </button>
              </div>
            </div>

            <QrScanner @scan="handleScan" />

            <div class="scanner-divider"><span>หรือ</span></div>

            <div class="manual-input-section">
              <input
                v-model="scanInput"
                type="text"
                class="form-control"
                :placeholder="searchFieldPlaceholder"
                @keyup.enter="handleManualSearch"
              />
              <button class="mobile-btn mobile-btn-primary mobile-mt-2" @click="handleManualSearch">
                <i class="bi bi-search"></i>
                ค้นหาสินค้า
              </button>
            </div>
          </div>
        </div>

        <!-- Invoiced Items (read-only, locked) -->
        <div v-if="invoicedItems.length > 0" class="items-section mobile-mt-2">
          <div class="section-header">
            <h3 class="section-title locked-title">
              <i class="bi bi-lock"></i>
              ออก Invoice แล้ว ({{ invoicedItems.length }})
            </h3>
          </div>
          <div class="items-container">
            <SoItemCard
              v-for="(item, index) in invoicedItems"
              :key="'inv-' + item.stockNumber + '-' + index"
              :item="item"
            />
          </div>
        </div>

        <!-- Editable Items -->
        <ItemList
          :items="editItems"
          @update-item="updateEditItem"
          @remove-item="removeEditItem"
        />
      </template>

      <!-- ==================== VIEW MODE ==================== -->
      <template v-else>
        <!-- Items List (read-only) -->
        <div class="items-section mobile-mt-2">
          <div class="section-header">
            <h3 class="section-title">
              <i class="bi bi-box-seam"></i>
              รายการสินค้า ({{ soItems.length }})
            </h3>
          </div>
          <div class="items-container">
            <SoItemCard
              v-for="(item, index) in soItems"
              :key="item.stockNumber + '-' + index"
              :item="item"
            />
          </div>
        </div>
      </template>

      <!-- Summary -->
      <div class="summary-card mobile-mt-2">
        <div class="summary-row">
          <span class="summary-label">จำนวนรายการ</span>
          <span class="summary-value">{{ displayItemCount }} รายการ</span>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-row">
          <span class="summary-label">F.O.B Bangkok (รวมสินค้า)</span>
          <span class="summary-value">{{ formatCurrency(displayTotalAmount) }} {{ displayCurrency }}</span>
        </div>
        <div v-if="Number(soData.specialDiscount) > 0" class="summary-row">
          <span class="summary-label">ส่วนลดพิเศษ</span>
          <span class="summary-value discount">-{{ formatCurrency(soData.specialDiscount) }}</span>
        </div>
        <div v-if="Number(soData.specialAddition) > 0" class="summary-row">
          <span class="summary-label">ส่วนเพิ่มพิเศษ</span>
          <span class="summary-value addition">+{{ formatCurrency(soData.specialAddition) }}</span>
        </div>
        <div v-if="Number(soData.freight) > 0" class="summary-row">
          <span class="summary-label">Freight & Insurance</span>
          <span class="summary-value">{{ formatCurrency(soData.freight) }}</span>
        </div>
        <div v-if="hasFinancialFields" class="summary-divider"></div>
        <div v-if="hasFinancialFields" class="summary-row">
          <span class="summary-label">ยอดรวมก่อน VAT</span>
          <span class="summary-value">{{ formatCurrency(soTotalBeforeVat) }} {{ displayCurrency }}</span>
        </div>
        <div v-if="Number(soData.vat) > 0" class="summary-row">
          <span class="summary-label">VAT ({{ soData.vat }}%)</span>
          <span class="summary-value">{{ formatCurrency(soVatAmount) }}</span>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-row total">
          <span class="summary-label">{{ hasFinancialFields ? 'ยอดรวมสุทธิ' : 'ยอดรวมทั้งหมด' }}</span>
          <span class="summary-value">{{ formatCurrency(soGrandTotal) }} {{ displayCurrency }}</span>
        </div>
        <div v-if="hasCurrencyConversion" class="summary-row reference">
          <span class="summary-label">เทียบเท่า</span>
          <span class="summary-value">{{ formatCurrency(currentTotalAmountTHB) }} บาท</span>
        </div>
      </div>

      <!-- Remark -->
      <div v-if="soData.remark" class="info-card mobile-mt-2">
        <div class="card-header">
          <i class="bi bi-chat-left-text"></i>
          <span>หมายเหตุ</span>
        </div>
        <div class="card-body">
          <div class="remark-text">{{ soData.remark }}</div>
        </div>
      </div>

      <!-- Invoice Info (if invoiced) -->
      <div v-if="soData.invoiceNumber" class="info-card mobile-mt-2">
        <div class="card-header invoice-header">
          <i class="bi bi-file-earmark-check"></i>
          <span>ข้อมูล Invoice</span>
        </div>
        <div class="card-body">
          <div class="info-row">
            <span class="info-label">เลขที่ Invoice:</span>
            <span class="info-value highlight">{{ soData.invoiceNumber }}</span>
          </div>
        </div>
      </div>

      <!-- ==================== INVOICE CREATION FORM ==================== -->
      <div v-if="showInvoiceForm" class="mobile-mt-2">
        <InvoiceCreationForm
          :soData="soData"
          :stockItems="stockItems"
          @invoice-created="onInvoiceCreated"
          @cancel="showInvoiceForm = false"
        />
      </div>

      <!-- ==================== ACTION BUTTONS ==================== -->
      <div v-else class="action-buttons mobile-mt-3">
        <template v-if="isEditing">
          <button
            class="mobile-btn mobile-btn-primary"
            @click="saveChanges"
            :disabled="editItems.length === 0 && invoicedItems.length === 0"
          >
            <i class="bi bi-check-circle"></i>
            บันทึกการแก้ไข
          </button>
          <button class="mobile-btn mobile-btn-outline" @click="cancelEdit">
            <i class="bi bi-x-circle"></i>
            ยกเลิก
          </button>
        </template>

        <template v-else>
          <!-- Edit SO -->
          <button
            v-if="!allItemsInvoiced"
            class="mobile-btn mobile-btn-outline"
            @click="startEdit"
          >
            <i class="bi bi-pencil-square"></i>
            แก้ไขรายการ
          </button>

          <!-- Print PDF -->
          <button
            class="mobile-btn mobile-btn-outline"
            @click="handlePrintPDF"
            :disabled="exportingPDF"
          >
            <i class="bi" :class="exportingPDF ? 'bi-hourglass-split spin-icon' : 'bi-file-pdf'"></i>
            {{ exportingPDF ? 'กำลังสร้าง PDF...' : 'พิมพ์ใบสั่งขาย' }}
          </button>

          <!-- Create Invoice -->
          <button
            class="mobile-btn mobile-btn-success"
            @click="showInvoiceForm = true"
            :disabled="allItemsInvoiced"
          >
            <i class="bi bi-file-earmark-check"></i>
            {{ allItemsInvoiced ? 'ออก Invoice แล้วทั้งหมด'
               : hasUnconfirmedItems ? 'Confirm Stock + ออก Invoice'
               : 'ออก Invoice' }}
          </button>
        </template>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="mobile-container mobile-mt-2">
      <div class="mobile-empty-state">
        <i class="bi bi-exclamation-circle"></i>
        <div class="empty-title">ไม่พบข้อมูล</div>
        <div class="empty-subtitle">ไม่สามารถโหลดข้อมูลใบสั่งขายได้</div>
        <button class="mobile-btn mobile-btn-primary mobile-mt-2" @click="loadSaleOrder">
          <i class="bi bi-arrow-clockwise"></i>
          ลองอีกครั้ง
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { usrSaleOrderApiStore } from '@/stores/modules/api/sale/sale-order-store.js'
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import { SaleOrderPdfBuilder } from '@/services/helper/pdf/sale-order/sale-order-pdf-builder.js'
import { success, error, warning } from '@/services/alert/sweetAlerts.js'
import SoItemCard from './components/so-item-card.vue'
import AddItemMethodSelector from './components/add-item-method-selector.vue'
import AppraisalJobList from './components/appraisal-job-list.vue'
import ItemList from './components/item-list.vue'
import InvoiceCreationForm from './components/invoice-creation-form.vue'
import QrScanner from '@/views/mobile/scan/components/qr-scanner.vue'
import dayjs from 'dayjs'
import 'dayjs/locale/th'

dayjs.locale('th')

export default {
  name: 'MobileSaleDetailView',

  components: {
    SoItemCard,
    AddItemMethodSelector,
    AppraisalJobList,
    ItemList,
    InvoiceCreationForm,
    QrScanner
  },

  setup() {
    const saleOrderStore = usrSaleOrderApiStore()
    const productStore = usrStockProductApiStore()
    return { saleOrderStore, productStore }
  },

  data() {
    return {
      soData: null,
      stockItems: [],
      copyItems: [],
      isLoading: false,
      exportingPDF: false,
      // Invoice form
      showInvoiceForm: false,
      // Edit mode
      isEditing: false,
      editItems: [],
      addItemTab: 'scan',
      scanInput: '',
      searchField: 'stockNumber',
      searchFieldOptions: [
        { value: 'stockNumber', label: 'รหัสสินค้าใหม่', icon: 'bi bi-upc-scan' },
        { value: 'stockNumberOrigin', label: 'รหัสสินค้าเก่า', icon: 'bi bi-tag' }
      ]
    }
  },

  computed: {
    soNumber() {
      return this.$route.params.soNumber || '-'
    },

    soItems() {
      return [...this.stockItems, ...this.copyItems]
    },

    hasCustomerInfo() {
      if (!this.soData) return false
      return !!(this.soData.customerName || this.soData.customerTel || this.soData.customerAddress)
    },

    // items ที่ออก invoice แล้ว (ล็อค แก้ไขไม่ได้)
    invoicedItems() {
      return this.stockItems.filter((item) => item.isInvoice)
    },

    // ตรวจว่ามี items ที่ยังไม่ confirm (มี stockNumber แต่ยังไม่ isConfirm และยังไม่ isInvoice)
    hasUnconfirmedItems() {
      return this.stockItems.some(item => item.stockNumber && !item.isConfirm && !item.isInvoice)
    },

    // ตรวจว่าทุก item ออก invoice แล้วหรือยัง
    allItemsInvoiced() {
      if (this.soItems.length === 0) return false
      const stockWithNumber = this.stockItems.filter((item) => item.stockNumber)
      if (stockWithNumber.length === 0) return false
      return stockWithNumber.every((item) => item.isInvoice)
    },

    // items ทั้งหมดรวม edit + invoiced (สำหรับคำนวณ summary ตอน edit)
    allCurrentItems() {
      return this.isEditing ? [...this.invoicedItems, ...this.editItems] : this.soItems
    },

    displayItemCount() {
      return this.allCurrentItems.length
    },

    currentTotalAmountTHB() {
      return this.allCurrentItems.reduce((sum, item) => {
        const price = Number(item.appraisalPrice || item.price) || 0
        const qty = Number(item.qty) || 1
        const discountPercent = Number(item.discountPercent) || 0
        return sum + price * qty * (1 - discountPercent / 100)
      }, 0)
    },

    displayCurrency() {
      return this.soData?.currencyUnit || 'THB'
    },

    hasCurrencyConversion() {
      const rate = Number(this.soData?.currencyRate)
      return !!(this.soData?.currencyUnit && rate && rate !== 1)
    },

    displayTotalAmount() {
      if (!this.hasCurrencyConversion) return this.currentTotalAmountTHB
      const rate = Number(this.soData?.currencyRate) || 1
      return this.currentTotalAmountTHB / rate
    },

    searchFieldPlaceholder() {
      return this.searchField === 'stockNumber'
        ? 'กรอกรหัสสินค้าใหม่ (Stock Number)'
        : 'กรอกรหัสสินค้าเก่า (Origin)'
    },

    hasFinancialFields() {
      if (!this.soData) return false
      return Number(this.soData.specialDiscount) > 0
        || Number(this.soData.specialAddition) > 0
        || Number(this.soData.freight) > 0
        || Number(this.soData.vat) > 0
    },

    soTotalAfterSpecial() {
      return this.displayTotalAmount
        - Number(this.soData?.specialDiscount || 0)
        + Number(this.soData?.specialAddition || 0)
    },

    soTotalBeforeVat() {
      return this.soTotalAfterSpecial + Number(this.soData?.freight || 0)
    },

    soVatAmount() {
      const vatPercent = Number(this.soData?.vat || 0)
      return (this.soTotalBeforeVat * vatPercent) / 100
    },

    soGrandTotal() {
      if (!this.hasFinancialFields) return this.displayTotalAmount
      return this.soTotalBeforeVat + this.soVatAmount
    }
  },

  mounted() {
    this.loadSaleOrder().then(() => {
      if (this.$route.query.openInvoice === 'true') {
        this.showInvoiceForm = true
      }
    })
  },

  methods: {
    // ==================== Load ====================
    async loadSaleOrder() {
      this.isLoading = true
      this.soData = null
      this.stockItems = []
      this.copyItems = []

      const response = await this.saleOrderStore.fetchGet({
        formValue: { soNumber: this.soNumber }
      })

      if (response) {
        this.soData = response
        this.parseItems(response)
      }
      this.isLoading = false
    },

    parseItems(response) {
      let parsedData = null
      if (response.data && typeof response.data === 'string') {
        try {
          parsedData = JSON.parse(response.data)
        } catch (e) {
          console.error('Error parsing SO data:', e)
        }
      } else if (response.data && typeof response.data === 'object') {
        parsedData = response.data
      }

      if (!parsedData) return

      // Extract freight from parsed data JSON into soData for PDF builder
      if (parsedData.freight != null) {
        this.soData.freight = Number(parsedData.freight) || 0
      }

      if (parsedData.stockItems || parsedData.copyItems) {
        this.stockItems = parsedData.stockItems || []
        this.copyItems = parsedData.copyItems || []
      } else if (parsedData.allItems) {
        this.stockItems = parsedData.allItems.filter((item) => item.stockNumber != null)
        this.copyItems = parsedData.allItems.filter((item) => item.stockNumber == null)
      } else if (Array.isArray(parsedData)) {
        this.stockItems = parsedData.filter((item) => item.stockNumber != null)
        this.copyItems = parsedData.filter((item) => item.stockNumber == null)
      }

      const stockConfirm = response.stockConfirm || []
      if (stockConfirm.length > 0) {
        this.stockItems.forEach((item) => {
          const confirmed = stockConfirm.find((c) => c.stockNumber === item.stockNumber)
          if (confirmed) {
            item.isConfirm = confirmed.isConfirm
            item.isInvoice = confirmed.isInvoice
            item.invoice = confirmed.invoice
            item.isRemainProduct = confirmed.isRemainProduct
            item.message = confirmed.message
          }
        })
      }
    },

    // ==================== Edit Mode ====================
    startEdit() {
      // copy non-invoiced items เป็น working copy
      const nonInvoiced = this.soItems.filter((item) => !item.isInvoice)
      this.editItems = nonInvoiced.map((item) => ({ ...item }))
      this.isEditing = true
    },

    cancelEdit() {
      this.isEditing = false
      this.editItems = []
      this.scanInput = ''
    },

    addEditItem(item) {
      this.editItems.push(item)
    },

    updateEditItem(index, updatedItem) {
      this.editItems[index] = updatedItem
    },

    removeEditItem(index) {
      this.editItems.splice(index, 1)
    },

    async handleScan(decodedText) {
      if (!decodedText) return
      this.scanInput = decodedText
      await this.searchAndAddProduct(decodedText)
    },

    async handleManualSearch() {
      if (!this.scanInput || !this.scanInput.trim()) {
        warning('กรุณากรอกเลขที่ผลิต')
        return
      }
      await this.searchAndAddProduct(this.scanInput.trim())
    },

    async searchAndAddProduct(searchValue) {
      const response = await this.productStore.fetchDataGet({
        formValue: { [this.searchField]: searchValue }
      })

      if (!response) {
        error('ไม่พบข้อมูลสินค้า', 'กรุณาตรวจสอบรหัสสินค้า')
        return
      }

      // Check duplicate ทั้ง editItems + invoicedItems
      const allItems = [...this.invoicedItems, ...this.editItems]
      const exists = allItems.some((item) => item.stockNumber === response.stockNumber)
      if (exists) {
        warning('สินค้านี้ถูกเพิ่มในรายการแล้ว')
        return
      }

      const costPrice = Number(response.productPrice) || 0
      const tagPriceMultiplier = Number(response.tagPriceMultiplier) || 1
      const tagPrice = costPrice * tagPriceMultiplier

      this.editItems.push({
        stockNumber: response.stockNumber,
        productNumber: response.productNumber || '',
        description: response.productNameTh || response.productNameEn || '',
        costPrice: costPrice,
        price: tagPrice,
        appraisalPrice: tagPrice,
        tagPriceMultiplier: tagPriceMultiplier,
        discountPercent: 0,
        qty: 1,
        materials: response.materials || [],
        imagePath: response.imagePath || '',
        source: 'scan'
      })

      this.scanInput = ''
      success('เพิ่มสินค้าสำเร็จ', `${response.stockNumber}`)
    },

    async saveChanges() {
      // รวม invoicedItems + editItems กลับเป็น stockItems / copyItems
      const allItems = [...this.invoicedItems, ...this.editItems]

      const newStockItems = allItems
        .filter((item) => item.stockNumber)
        .map((item) => ({
          stockNumber: item.stockNumber,
          productNumber: item.productNumber || '',
          description: item.description || '',
          costPrice: Number(item.costPrice) || 0,
          price: Number(item.price) || 0,
          appraisalPrice: Number(item.appraisalPrice) || Number(item.price) || 0,
          tagPriceMultiplier: Number(item.tagPriceMultiplier) || 1,
          discountPercent: Number(item.discountPercent) || 0,
          qty: Number(item.qty) || 1,
          materials: item.materials || [],
          imagePath: item.imagePath || '',
          imageBlobPath: item.imageBlobPath || null
        }))

      const newCopyItems = allItems
        .filter((item) => !item.stockNumber)
        .map((item) => ({
          stockNumber: null,
          productNumber: item.productNumber || '',
          description: item.description || '',
          costPrice: Number(item.costPrice) || 0,
          price: Number(item.price) || 0,
          appraisalPrice: Number(item.appraisalPrice) || Number(item.price) || 0,
          tagPriceMultiplier: Number(item.tagPriceMultiplier) || 1,
          discountPercent: Number(item.discountPercent) || 0,
          qty: Number(item.qty) || 1,
          materials: item.materials || [],
          imagePath: null,
          imageBlobPath: null
        }))

      const existingFreight = Number(this.soData.freight) || 0

      const formValue = {
        soNumber: this.soData.soNumber,
        customerCode: this.soData.customerCode || null,
        customerName: this.soData.customerName || '',
        customerTel: this.soData.customerTel || '',
        customerEmail: this.soData.customerEmail || '',
        customerAddress: this.soData.customerAddress || '',
        remark: this.soData.remark || '',
        currencyUnit: this.soData.currencyUnit || 'US$',
        currencyRate: this.soData.currencyRate || 33.0,
        priority: this.soData.priority || 'mobile',
        soDate: this.soData.soDate || null,
        deliveryDate: this.soData.deliveryDate || null,
        refQuotation: this.soData.refQuotation || null,
        markup: this.soData.markup || null,
        goldRate: this.soData.goldRate || null,
        specialDiscount: this.soData.specialDiscount || 0,
        specialAddition: this.soData.specialAddition || 0,
        vat: this.soData.vat || 0,
        freight: existingFreight,
        data: JSON.stringify({
          stockItems: newStockItems,
          copyItems: newCopyItems,
          allItems: [...newStockItems, ...newCopyItems],
          freight: existingFreight,
          copyFreight: existingFreight
        })
      }

      const result = await this.saleOrderStore.fetchSave({ formValue })

      if (result) {
        this.isEditing = false
        this.editItems = []
        success('บันทึกการแก้ไขสำเร็จ')
        await this.loadSaleOrder()
      }
    },

    // ==================== PDF ====================
    async handlePrintPDF() {
      if (!this.soData) {
        warning('ไม่พบข้อมูลใบสั่งขาย')
        return
      }

      this.exportingPDF = true
      try {
        const pdfData = {
          ...this.soData,
          items: this.soItems,
          totalAmount: this.currentTotalAmountTHB
        }
        const pdfBuilder = new SaleOrderPdfBuilder(pdfData, {
          currencyUnit: this.soData.currencyUnit || 'THB',
          currencyRate: Number(this.soData.currencyRate) || 1
        })
        const pdf = await pdfBuilder.generatePDF()
        const filename = `SO_${this.soData.soNumber}_${dayjs().format('YYYYMMDDHHmmss')}.pdf`
        pdf.download(filename)
        success('สร้าง PDF สำเร็จ')
      } catch (err) {
        console.error('Error generating PDF:', err)
        error(err.message || 'เกิดข้อผิดพลาดในการสร้าง PDF')
      } finally {
        this.exportingPDF = false
      }
    },

    // ==================== Invoice ====================
    onInvoiceCreated() {
      this.showInvoiceForm = false
      this.loadSaleOrder()
    },

    // ==================== Helpers ====================
    getStatusColor(status) {
      switch (status) {
        case 'Draft':
          return '#9e9e9e'
        case 'Confirmed':
          return '#2196f3'
        case 'Invoiced':
          return '#4caf50'
        default:
          return '#9e9e9e'
      }
    },

    getStatusLabel(status) {
      switch (status) {
        case 'Draft':
          return 'ร่าง'
        case 'Confirmed':
          return 'ยืนยันแล้ว'
        case 'Invoiced':
          return 'ออก Invoice แล้ว'
        default:
          return status || 'ร่าง'
      }
    },

    formatDate(dateString) {
      if (!dateString) return '-'
      return dayjs(dateString).format('DD/MM/YYYY HH:mm')
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

.mobile-sale-detail-view {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: calc(40px + env(safe-area-inset-bottom, 0px));
}

.info-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  font-weight: 600;
  color: var(--base-font-color);
  font-size: 0.95rem;

  i {
    font-size: 1.1rem;
  }

  .header-status-badge {
    margin-left: auto;
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 0.75rem;
    color: white;
    font-weight: 500;
  }

  &.invoice-header {
    background: #e8f5e9;
    color: #2e7d32;
    border-bottom-color: #c8e6c9;
  }
}

.card-body {
  padding: 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
  gap: 12px;

  &:last-child {
    margin-bottom: 0;
  }

  &.remark-row {
    flex-direction: column;
    gap: 4px;
  }
}

.info-label {
  font-size: 0.85rem;
  color: #666;
  font-weight: 500;
  flex-shrink: 0;
  min-width: 100px;
}

.info-value {
  font-size: 0.9rem;
  color: #333;
  text-align: right;
  word-break: break-word;

  &.highlight {
    color: var(--base-font-color);
    font-weight: 600;
    font-size: 1rem;
  }
}

.remark-text {
  font-size: 0.9rem;
  color: #333;
  line-height: 1.5;
}

// ==================== Items Section ====================
.items-section {
  .section-header {
    margin-bottom: 10px;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1rem;
    font-weight: 600;
    color: #333;
    margin: 0;

    i {
      color: var(--base-font-color);
    }

    &.locked-title {
      color: #999;

      i {
        color: #999;
      }
    }
  }

  .items-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
}

// ==================== Edit Mode - Add Item ====================
.section-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.section-header-bar {
  margin-bottom: 12px;

  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1rem;
    font-weight: 600;
    color: #333;
    margin: 0;

    i {
      color: var(--base-font-color);
    }
  }
}

.scan-section {
  .search-field-selector {
    margin-bottom: 12px;

    .field-selector-label {
      display: block;
      font-size: 0.8rem;
      font-weight: 500;
      color: #888;
      margin-bottom: 6px;
    }

    .field-selector-options {
      display: flex;
      gap: 8px;
    }

    .field-option-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 10px 12px;
      border-radius: 8px;
      border: 1.5px solid #e0e0e0;
      background: white;
      color: #666;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;

      &:active {
        transform: scale(0.98);
      }

      &.active {
        border-color: var(--base-font-color);
        background: rgba(146, 19, 19, 0.05);
        color: var(--base-font-color);
        font-weight: 600;
      }
    }
  }

  .scanner-divider {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 20px 0;

    &::before,
    &::after {
      content: '';
      flex: 1;
      height: 1px;
      background: #e0e0e0;
    }

    span {
      padding: 0 16px;
      color: #999;
      font-size: 0.9rem;
    }
  }

  .manual-input-section {
    max-width: 300px;
    margin: 0 auto;

    input {
      text-align: center;
    }
  }
}

// ==================== Summary ====================
.summary-card {
  background: white;
  border-radius: 10px;
  padding: 16px;
  border: 1px solid #e8e8e8;

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

      &.discount {
        color: #f44336;
      }

      &.addition {
        color: #4caf50;
      }
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

// ==================== Action Buttons ====================
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;

  .mobile-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;

    i {
      font-size: 1.1rem;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  .mobile-btn-success {
    background: var(--base-green, #4caf50);
    color: white;
    border: none;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;

    &:active:not(:disabled) {
      opacity: 0.9;
    }
  }
}

.spin-icon {
  animation: spin 2s linear infinite;
}

.mobile-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid var(--base-font-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .loading-text {
    margin-top: 16px;
    color: #666;
    font-size: 0.9rem;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.mobile-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  text-align: center;

  i {
    font-size: 4rem;
    color: #ddd;
    margin-bottom: 16px;
  }

  .empty-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #666;
    margin-bottom: 4px;
  }

  .empty-subtitle {
    font-size: 0.85rem;
    color: #999;
  }
}
</style>
