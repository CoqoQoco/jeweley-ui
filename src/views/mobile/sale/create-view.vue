<template>
  <div class="mobile-sale-create-view">
    <!-- Header -->
    <!-- <div class="sale-header">
      <div class="mobile-container">
        <button class="mobile-btn-icon" @click="$router.back()">
          <i class="bi bi-arrow-left"></i>
        </button>
        <div class="header-content">
          <h2 class="mobile-title">สร้างใบสั่งขาย</h2>
          <p class="header-subtitle">Create Sale Order</p>
        </div>
      </div>
    </div> -->

    <div class="mobile-container mobile-mt-1">
      <!-- Section 1: Add Items -->
      <div class="section-card">
        <div class="section-header-bar">
          <h3 class="section-title">
            <i class="bi bi-plus-circle"></i>
            เพิ่มสินค้า
          </h3>
        </div>

        <!-- Tab Selector -->
        <AddItemMethodSelector
          :activeTab="addItemTab"
          @update:activeTab="addItemTab = $event"
        />

        <!-- Tab A: Appraisal Jobs -->
        <div v-if="addItemTab === 'appraisal'">
          <AppraisalJobList
            :selectedItems="items"
            @add-item="addItem"
          />
        </div>

        <!-- Tab B: Scan -->
        <div v-if="addItemTab === 'scan'" class="scan-section">
          <!-- QR Scanner -->
          <QrScanner @scan="handleScan" />

          <!-- Divider -->
          <div class="scanner-divider">
            <span>หรือ</span>
          </div>

          <!-- Manual Input -->
          <div class="manual-input-section">
            <input
              v-model="scanInput"
              type="text"
              class="form-control"
              placeholder="กรอกเลขที่ผลิต (Stock Number)"
              @keyup.enter="handleManualSearch"
            />
            <button class="mobile-btn mobile-btn-primary mobile-mt-2" @click="handleManualSearch">
              <i class="bi bi-search"></i>
              ค้นหาสินค้า
            </button>
          </div>
        </div>
      </div>

      <!-- Section 2: Item List -->
      <ItemList
        :items="items"
        @update-item="updateItem"
        @remove-item="removeItem"
      />

      <!-- Section 3: Currency Settings -->
      <div class="currency-section">
        <div class="section-header-inline">
          <h3 class="section-title-sm">
            <i class="bi bi-currency-exchange"></i>
            สกุลเงิน
          </h3>
        </div>
        <div class="currency-card">
          <div class="currency-row">
            <div class="currency-field">
              <label>Currency Unit</label>
              <input
                v-model.trim="currencyUnit"
                type="text"
                class="currency-input"
                placeholder="US$"
              />
            </div>
            <div class="currency-field">
              <label>Currency Rate</label>
              <input
                v-model.number="currencyRate"
                type="number"
                class="currency-input"
                min="0"
                step="any"
                placeholder="33.0"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Section 4: Customer Info -->
      <CustomerForm
        :customer="customer"
        @update:customer="customer = $event"
      />

      <!-- Section 5: Summary -->
      <SoSummary
        :items="items"
        :currencyUnit="currencyUnit"
        :currencyRate="currencyRate"
      />

      <!-- Action Buttons -->
      <div class="action-buttons mobile-mt-2">
        <!-- <button
          class="mobile-btn mobile-btn-outline"
          @click="saveDraft"
          :disabled="items.length === 0"
        >
          <i class="bi bi-save"></i>
          บันทึกร่าง
        </button> -->
        <button
          class="mobile-btn mobile-btn-primary"
          @click="createSaleOrder"
          :disabled="items.length === 0"
        >
          <i class="bi bi-check-circle"></i>
          บันทึกใบสั่งขาย
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { usrSaleOrderApiStore } from '@/stores/modules/api/sale/sale-order-store.js'
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import { warning, success, error } from '@/services/alert/sweetAlerts.js'
import AddItemMethodSelector from './components/add-item-method-selector.vue'
import AppraisalJobList from './components/appraisal-job-list.vue'
import ItemList from './components/item-list.vue'
import CustomerForm from './components/customer-form.vue'
import SoSummary from './components/so-summary.vue'
import QrScanner from '@/views/mobile/scan/components/qr-scanner.vue'

export default {
  name: 'MobileSaleCreateView',

  components: {
    AddItemMethodSelector,
    AppraisalJobList,
    ItemList,
    CustomerForm,
    SoSummary,
    QrScanner
  },

  setup() {
    const saleOrderStore = usrSaleOrderApiStore()
    const productStore = usrStockProductApiStore()
    return { saleOrderStore, productStore }
  },

  data() {
    return {
      addItemTab: 'appraisal',
      scanInput: '',
      items: [],
      currencyUnit: 'US$',
      currencyRate: 33.0,
      customer: {
        customerCode: '',
        customerName: '',
        customerTel: '',
        customerEmail: '',
        customerAddress: '',
        remark: ''
      }
    }
  },

  methods: {
    addItem(item) {
      this.items.push(item)
    },

    updateItem(index, updatedItem) {
      this.items[index] = updatedItem
    },

    removeItem(index) {
      this.items.splice(index, 1)
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
        formValue: { stockNumber: searchValue }
      })

      if (!response) {
        error('ไม่พบข้อมูลสินค้า', 'กรุณาตรวจสอบเลขที่ผลิต')
        return
      }

      // Check duplicate
      const exists = this.items.some((item) => item.stockNumber === response.stockNumber)
      if (exists) {
        warning('สินค้านี้ถูกเพิ่มในรายการแล้ว')
        return
      }

      const productPrice = Number(response.productPrice) || 0

      this.items.push({
        stockNumber: response.stockNumber,
        productNumber: response.productNumber || '',
        description: response.productNameTh || response.productNameEn || '',
        price: productPrice,
        appraisalPrice: productPrice,
        discountPercent: 0,
        qty: 1,
        materials: [],
        imagePath: response.imagePath || '',
        source: 'scan'
      })

      this.scanInput = ''
      success('เพิ่มสินค้าสำเร็จ', `${response.stockNumber}`)
    },

    async saveDraft() {
      await this.saveOrder('Draft')
    },

    async createSaleOrder() {
      if (this.items.length === 0) {
        warning('กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ')
        return
      }
      if (!this.customer.customerCode) {
        warning('กรุณาเลือกลูกค้า', 'ข้อมูลไม่ครบถ้วน')
        return
      }
      if (!this.currencyUnit) {
        warning('กรุณาระบุสกุลเงิน', 'ข้อมูลไม่ครบถ้วน')
        return
      }
      await this.saveOrder('Confirmed')
    },

    async saveOrder(status) {
      // Generate SO number
      const runningResult = await this.saleOrderStore.fetchGenerateRunningNumber()
      if (!runningResult) {
        error('ไม่สามารถสร้างเลขที่ใบสั่งขายได้')
        return
      }

      const soNumber = runningResult.soNumber || runningResult

      // สร้าง stockItems ตาม format ของ web
      const stockItems = this.items
        .filter((item) => item.stockNumber)
        .map((item) => ({
          stockNumber: item.stockNumber,
          productNumber: item.productNumber || '',
          description: item.description || '',
          price: Number(item.price) || 0,
          appraisalPrice: Number(item.appraisalPrice) || Number(item.price) || 0,
          discountPercent: Number(item.discountPercent) || 0,
          qty: Number(item.qty) || 1,
          materials: item.materials || [],
          imagePath: item.imagePath || '',
          imageBlobPath: null
        }))

      // copyItems สำหรับรายการที่ไม่มี stockNumber
      const copyItems = this.items
        .filter((item) => !item.stockNumber)
        .map((item) => ({
          stockNumber: null,
          productNumber: item.productNumber || '',
          description: item.description || '',
          price: Number(item.price) || 0,
          appraisalPrice: Number(item.appraisalPrice) || Number(item.price) || 0,
          discountPercent: Number(item.discountPercent) || 0,
          qty: Number(item.qty) || 1,
          materials: item.materials || [],
          imagePath: null,
          imageBlobPath: null
        }))

      const formValue = {
        soNumber: soNumber,
        status: status,
        customerCode: this.customer.customerCode || null,
        customerName: this.customer.customerName || '',
        customerTel: this.customer.customerTel || '',
        customerEmail: this.customer.customerEmail || '',
        customerAddress: this.customer.customerAddress || '',
        remark: this.customer.remark || '',
        currencyUnit: this.currencyUnit || 'US$',
        currencyRate: this.currencyRate || 33.0,
        priority: 'mobile',
        // items เป็น JSON string ในฟิลด์ data
        data: JSON.stringify({
          stockItems: stockItems,
          copyItems: copyItems,
          allItems: [...stockItems, ...copyItems],
          freight: 0,
          copyFreight: 0
        })
      }

      const result = await this.saleOrderStore.fetchSave({ formValue })

      if (result) {
        const statusLabel = status === 'Draft' ? 'บันทึกร่าง' : 'สร้างใบสั่งขาย'
        success(`เลขที่: ${soNumber}`, `${statusLabel}สำเร็จ`, () => {
          this.$router.push({
            name: 'mobile-sale-detail',
            params: { soNumber: soNumber }
          })
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/mobile';

.mobile-sale-create-view {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40px;
}

.sale-header {
  background: linear-gradient(135deg, var(--base-font-color) 0%, var(--base-font-sub-color) 100%);
  padding: 16px 0;
  color: white;
  margin-bottom: 8px;

  .mobile-container {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .mobile-btn-icon {
    background: rgba(255, 255, 255, 0.15);
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.2rem;
    cursor: pointer;

    &:active {
      background: rgba(255, 255, 255, 0.25);
    }
  }

  .header-content {
    flex: 1;

    .header-subtitle {
      margin: 2px 0 0 0;
      opacity: 0.9;
      font-size: 0.8rem;
    }
  }
}

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

.currency-section {
  margin-top: 16px;

  .section-header-inline {
    margin-bottom: 10px;
  }

  .section-title-sm {
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

.currency-card {
  background: white;
  border-radius: 10px;
  padding: 14px;
  border: 1px solid #e8e8e8;

  .currency-row {
    display: flex;
    gap: 12px;

    .currency-field {
      flex: 1;

      label {
        display: block;
        font-size: 0.8rem;
        font-weight: 500;
        color: #555;
        margin-bottom: 6px;
      }

      .currency-input {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        font-size: 0.9rem;
        outline: none;
        transition: border-color 0.2s ease;

        &:focus {
          border-color: var(--base-font-color);
        }

        &::placeholder {
          color: #bbb;
        }
      }
    }
  }
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;

  .mobile-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;

    i {
      font-size: 1.1rem;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}
</style>
