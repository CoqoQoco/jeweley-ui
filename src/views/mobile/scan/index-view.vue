<template>
  <div class="mobile-scan-view">
    <div class="mobile-container">
      <!-- <h2 class="mobile-title">สแกน QR / Barcode</h2> -->

      <!-- Step 1: Select Scan Type -->
      <div v-if="!selectedScanType" class="scan-type-selection">
        <p class="selection-description">เลือกประเภทที่ต้องการสแกน</p>

        <div class="scan-type-grid">
          <div
            v-for="type in scanTypes"
            :key="type.id"
            class="scan-type-card"
            @click="selectScanType(type)"
          >
            <div class="scan-type-icon">
              <i :class="type.icon"></i>
            </div>
            <div class="scan-type-label">{{ type.label }}</div>
            <div v-if="type.description" class="scan-type-description">{{ type.description }}</div>
          </div>
        </div>
      </div>

      <!-- Step 2: Scanner & Results -->
      <div v-else class="scan-interface">
        <!-- Header with back button -->
        <div class="scan-header">
          <button class="mobile-btn-icon" @click="resetScan">
            <i class="bi bi-arrow-left"></i>
          </button>
          <div class="scan-header-title">
            <i :class="selectedScanType.icon"></i>
            <span>{{ selectedScanType.label }}</span>
          </div>
        </div>

        <!-- Scanner Section -->
        <div v-if="!scannedProduct" class="scanner-section">
          <!-- QR/Barcode Scanner -->
          <QrScanner @scan="handleScan" />

          <!-- Divider -->
          <div class="scanner-divider">
            <span>หรือ</span>
          </div>

          <!-- Manual Input -->
          <div class="manual-input-section">
            <input
              v-model="manualInput"
              type="text"
              class="form-control"
              placeholder="กรอกเลขที่ผลิตหรือรหัสสินค้า"
              @keyup.enter="handleManualSearch"
            />
            <button class="mobile-btn mobile-btn-primary mobile-mt-2" @click="handleManualSearch">
              <i class="bi bi-search"></i>
              ค้นหา
            </button>
          </div>
        </div>

        <!-- Product Detail Section -->
        <div v-if="scannedProduct" class="product-section">
          <ProductDetailCard :product="scannedProduct" :priceTransactions="scannedProduct.priceTransactions" :imageType="imageType" />

          <!-- Action Zone (Placeholder for future features) -->
          <div class="action-zone mobile-mt-3">
            <div class="action-zone-header">
              <i class="bi bi-lightning-charge"></i>
              <span>การดำเนินการ</span>
            </div>

            <div class="action-buttons">
              <!-- Future actions will be added here -->
              <button class="mobile-btn mobile-btn-outline" disabled>
                <i class="bi bi-box-seam"></i>
                อัพเดทสต็อก
              </button>
              <button class="mobile-btn mobile-btn-outline" disabled>
                <i class="bi bi-printer"></i>
                พิมพ์ป้าย
              </button>
              <button class="mobile-btn mobile-btn-outline" disabled>
                <i class="bi bi-geo-alt"></i>
                เปลี่ยนที่จัดเก็บ
              </button>
            </div>

            <p class="action-note">
              <i class="bi bi-info-circle"></i>
              ฟีเจอร์การดำเนินการจะพัฒนาในอนาคต
            </p>
          </div>

          <!-- Scan Again Button -->
          <div class="mobile-mt-3">
            <button class="mobile-btn mobile-btn-secondary mobile-btn-block" @click="resetProduct">
              <i class="bi bi-arrow-repeat"></i>
              สแกนอีกครั้ง
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import { warning, error } from '@/services/alert/sweetAlerts.js'
import ProductDetailCard from './components/product-detail-card.vue'
import QrScanner from './components/qr-scanner.vue'

export default {
  name: 'MobileScanView',

  components: {
    ProductDetailCard,
    QrScanner
  },

  setup() {
    const productStore = usrStockProductApiStore()
    return { productStore }
  },

  data() {
    return {
      selectedScanType: null,
      manualInput: '',
      scannedProduct: null,
      imageType: 'STOCK-PRODUCT',

      // Scan types configuration
      scanTypes: [
        {
          id: 'stock-product',
          label: 'สแกนสินค้า',
          description: 'สแกนสต็อกสินค้าสำเร็จรูป',
          icon: 'bi bi-gem',
          apiMethod: 'fetchDataGet'
        }
        // Future scan types can be added here:
        // {
        //   id: 'production',
        //   label: 'สแกนแผนผลิต',
        //   description: 'สแกนแผนการผลิต',
        //   icon: 'bi bi-gear-fill',
        //   apiMethod: 'fetchProductionPlan'
        // },
        // {
        //   id: 'mold',
        //   label: 'สแกนแม่พิมพ์',
        //   description: 'สแกนข้อมูลแม่พิมพ์',
        //   icon: 'bi bi-box',
        //   apiMethod: 'fetchMold'
        // }
      ]
    }
  },

  methods: {
    selectScanType(type) {
      this.selectedScanType = type
    },

    resetScan() {
      this.selectedScanType = null
      this.manualInput = ''
      this.scannedProduct = null
    },

    resetProduct() {
      this.manualInput = ''
      this.scannedProduct = null
    },

    async handleManualSearch() {
      if (!this.manualInput || !this.manualInput.trim()) {
        warning('กรุณากรอกเลขที่ผลิตหรือรหัสสินค้า')
        return
      }

      await this.searchProduct(this.manualInput.trim())
    },

    async handleScan(decodedText) {
      // Called by QR/Barcode scanner component
      if (!decodedText) return

      // Show scanned value in input
      this.manualInput = decodedText

      // Search product
      await this.searchProduct(decodedText)
    },

    async searchProduct(searchValue) {
      if (this.selectedScanType.id === 'stock-product') {
        await this.searchStockProduct(searchValue)
      }
      // Future scan types will be handled here
    },

    async searchStockProduct(searchValue) {
      const formValue = {
        stockNumber: searchValue
        //productNumber: searchValue
      }

      const response = await this.productStore.fetchDataGet({ formValue })

      if (response) {
        this.scannedProduct = response
      } else {
        error('ไม่พบข้อมูลสินค้า', 'กรุณาตรวจสอบเลขที่ผลิตหรือรหัสสินค้า')
        this.scannedProduct = null
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/mobile';

.mobile-scan-view {
  min-height: 100vh;
  background: #f5f5f5;
  //padding-bottom: 80px;
}

// Scan Type Selection
.scan-type-selection {
  .selection-description {
    font-size: 0.95rem;
    color: #666;
    margin-bottom: 16px;
    text-align: center;
  }
}

.scan-type-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.scan-type-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;

  &:active {
    transform: scale(0.98);
    border-color: var(--base-font-color);
  }

  .scan-type-icon {
    width: 60px;
    height: 60px;
    margin: 0 auto 12px;
    background: linear-gradient(135deg, var(--base-font-color) 0%, var(--base-font-sub-color) 100%);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;

    i {
      font-size: 1.8rem;
      color: white;
    }
  }

  .scan-type-label {
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 4px;
  }

  .scan-type-description {
    font-size: 0.85rem;
    color: #666;
  }
}

// Scan Interface
.scan-interface {
  .scan-header {
    display: flex;
    align-items: center;
    gap: 12px;
    //margin-bottom: 16px;
    //padding: 12px;
    background: white;
    //border-radius: 12px;
    //box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

    .mobile-btn-icon {
      flex-shrink: 0;
    }

    .scan-header-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1rem;
      font-weight: 600;
      color: var(--base-font-color);

      i {
        font-size: 1.2rem;
      }
    }
  }
}

// Scanner Section
.scanner-section {
  margin-bottom: 16px;
}

.scanner-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20px 0;
  position: relative;

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

// Product Section
.product-section {
  // Product detail card styles are in the component
}

// Action Zone
.action-zone {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  .action-zone-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1rem;
    font-weight: 600;
    color: var(--base-font-color);
    margin-bottom: 16px;

    i {
      font-size: 1.2rem;
    }
  }

  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 12px;

    button {
      display: flex;
      align-items: center;
      gap: 8px;
      justify-content: center;

      i {
        font-size: 1.1rem;
      }
    }
  }

  .action-note {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.8rem;
    color: #999;
    margin: 0;
    padding-top: 12px;
    border-top: 1px solid #f0f0f0;

    i {
      font-size: 0.9rem;
    }
  }
}
</style>
