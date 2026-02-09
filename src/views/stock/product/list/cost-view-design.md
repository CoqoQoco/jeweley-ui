# Stock Product Cost View Features - Design Document

## 1. Overview

This document outlines the design and architecture for adding cost viewing features to the stock product list. Users will be able to view product cost details and cost history versions directly from the product list table.

### Features
1. **View Cost Details** - Display readonly cost breakdown for a stock item
2. **View Cost History** - Display and select from multiple cost appraisal versions

---

## 2. Component Architecture

### 2.1 File Structure (Proposed)
```
/stock/product/list/
├── index-view.vue                      # Main orchestrator (existing)
├── components/
│   ├── search-view.vue                 # Search component (existing)
│   ├── data-table-view.vue             # Product list table (existing - TO BE UPDATED)
│   ├── data-expand-view.vue            # Material details (existing)
│   ├── update-view.vue                 # Edit modal (existing)
│   ├── barcode-view.vue                # Barcode modal (existing)
│   ├── cost-detail-modal.vue           # NEW - View single cost detail
│   └── cost-history-modal.vue          # NEW - View cost history with versions
└── stock-product-list.md               # Documentation (existing - TO BE UPDATED)
```

### 2.2 Component Relationships
```
index-view.vue (Main Orchestrator)
├── search-view.vue (Search)
└── data-table-view.vue (Product List)
    ├── Actions Column
    │   ├── [Edit Button] → update-view.vue
    │   ├── [Barcode Button] → barcode-view.vue
    │   ├── [View Cost] → cost-detail-modal.vue (NEW)
    │   └── [View History] → cost-history-modal.vue (NEW)
    └── Expandable Rows
        └── data-expand-view.vue (Materials)
```

---

## 3. Detailed Component Design

### 3.1 Cost Detail Modal (`cost-detail-modal.vue`)

#### Purpose
Display readonly cost breakdown for a single stock item, replicating the structure of the appraisal form.

#### Props
```javascript
{
  visible: Boolean,           // Modal visibility
  stockNumber: String         // Stock number to fetch data for
}
```

#### Data Structure (from API: GetStockCostDetail)
Based on cost detail requirements, expected response structure:
```javascript
{
  // Stock Information
  stockNumber: String,
  productNumber: String,
  productNameTh: String,
  productNameEn: String,
  productType: String,
  productTypeName: String,
  wo: String,
  woNumber: String,
  description: String,

  // NO Customer Information (Cost detail doesn't include customer)

  // Price Transactions (Grouped by type)
  priceTransactions: [
    {
      nameGroup: String,        // 'Gold', 'Gem', 'Worker', 'Embed', 'ETC'
      nameDescription: String,  // Item description
      qty: Number,              // Quantity
      qtyPrice: Number,         // Price per quantity
      qtyWeight: Number,        // Weight
      qtyWeightPrice: Number,   // Price per weight
      totalPrice: Number        // Total for this item
    }
  ],

  // Summary - Only total of all items
  totalPrice: Number           // Sum of all transaction totals (รวมราคาทุกรายการ)
}
```

#### UI Layout (Cost Detail - No Customer Info)
```
┌─────────────────────────────────────────────────────────────┐
│ ดูต้นทุนสินค้า                                         [X]  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ข้อมูลสินค้า (Stock Information)                            │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ เลขที่ผลิต: [readonly]     รหัสสินค้า: [readonly]   │   │
│ │ ชื่อสินค้า TH: [readonly]   ประเภทสินค้า: [readonly] │   │
│ │ ชื่อสินค้า EN: [readonly]   W.O.: [readonly]         │   │
│ │ หมายเหตุ: [readonly]                                  │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ รายการต้นทุน (Cost Items) - Readonly Table                  │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ กลุ่ม │ รายการ │ จำนวน │ ราคา │ น้ำหนัก │ ราคา │ รวม │   │
│ ├──────────────────────────────────────────────────────┤   │
│ │ ทอง (Gold)                                            │   │
│ │   └─ น้ำหนักแป้น │ 10 │ 100 │ 50 │ 200 │ 11,000    │   │
│ │ เพชร (Gem)                                            │   │
│ │   └─ Diamond │ 5 │ 1000 │ - │ - │ 5,000             │   │
│ │ แรงงาน (Worker)                                        │   │
│ │   └─ Casting │ 1 │ 500 │ - │ - │ 500               │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ รวมราคาทุกรายการ: 16,500 บาท                                │
│                                                              │
│                                          [ปิด]              │
└─────────────────────────────────────────────────────────────┘
```

#### Key Features
- All fields are **readonly** (disabled inputs or plain text display)
- Data grouped by transaction type (Gold, Gem, Worker, Embed, ETC)
- **NO Customer Information** (cost detail doesn't include customer)
- **NO "ต้นทุนต่อชิ้น" or "ราคาประเมิน"** fields
- Only displays **"รวมราคาทุกรายการ"** (total of all items)
- Close button only (no save functionality)

#### Reusable Strategy
**Option A**: Create standalone readonly component
- Pros: Clean separation, easier to maintain
- Cons: Code duplication from appraisal form

**Option B**: Reuse appraisal form with readonly mode
- Pros: DRY principle, consistent structure
- Cons: More complex component with mode logic

**Recommendation**: **Option A** - Create standalone component
- Appraisal form is already complex (large file)
- Readonly view has simpler requirements (no validation, no calculations)
- Easier to optimize for display-only purposes
- Can use simpler display components instead of form inputs

---

### 3.2 Cost History Modal (`cost-history-modal.vue`)

#### Purpose
Display list of cost appraisal versions and allow user to select and view any version.

#### Props
```javascript
{
  visible: Boolean,           // Modal visibility
  stockNumber: String         // Stock number to fetch versions for
}
```

#### Data Structure (from API: GetProductCostDetailVersion)
Expected response structure (Appraisal versions - same as cost detail):
```javascript
{
  stockNumber: String,
  versions: [
    {
      versionId: Number,
      versionNumber: Number,         // Version number (1, 2, 3...)
      createDate: Date,              // When this version was created
      createBy: String,              // User who created
      totalPrice: Number,            // รวมราคาทุกรายการ for this version
      remark: String,                // Version notes

      // Stock Information
      stockNumber: String,
      productNumber: String,
      productNameTh: String,
      productNameEn: String,
      productType: String,
      productTypeName: String,
      wo: String,
      woNumber: String,
      description: String,

      // Customer Information (Optional - may or may not exist)
      customerNumber: String,
      customerName: String,
      customerTel: String,

      // Price Transactions
      priceTransactions: [...]       // Full transaction details
    }
  ]
}
```

#### UI Layout (Two-Panel Design - Appraisal History)
```
┌──────────────────────────────────────────────────────────────────────┐
│ ดูประวัติตีราคา                                      [PDF] [ปิด] [X] │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│ ┌──────────────┐  ┌─────────────────────────────────────────────┐  │
│ │ Version List │  │ Version Detail (Readonly)                    │  │
│ ├──────────────┤  ├─────────────────────────────────────────────┤  │
│ │              │  │                                               │  │
│ │ [✓] V1       │  │ เวอร์ชัน: 1                                  │  │
│ │   2024-01-15 │  │ วันที่: 15/01/2024                           │  │
│ │   User: John │  │ ผู้สร้าง: John                               │  │
│ │   รวม: 15K   │  │                                               │  │
│ │              │  │ ข้อมูลสินค้า (Stock Information)             │  │
│ │ [ ] V2       │  │ ┌───────────────────────────────────────┐   │  │
│ │   2024-01-20 │  │ │ เลขที่ผลิต: [readonly]               │   │  │
│ │   User: Jane │  │ │ รหัสสินค้า: [readonly]                │   │  │
│ │   รวม: 16K   │  │ └───────────────────────────────────────┘   │  │
│ │              │  │                                               │  │
│ │ [ ] V3       │  │ ข้อมูลลูกค้า (Optional - if exists)          │  │
│ │   2024-01-25 │  │ ┌───────────────────────────────────────┐   │  │
│ │   User: John │  │ │ รหัสลูกค้า: [readonly]                │   │  │
│ │   รวม: 16.5K │  │ │ ชื่อลูกค้า: [readonly]                │   │  │
│ │              │  │ └───────────────────────────────────────┘   │  │
│ │              │  │                                               │  │
│ │              │  │ รายการตีราคา (Price Transactions)            │  │
│ │              │  │ ┌───────────────────────────────────────┐   │  │
│ │              │  │ │ ทอง (Gold)                            │   │  │
│ │              │  │ │   └─ Item 1 │ Qty │ Price │ Total    │   │  │
│ │              │  │ └───────────────────────────────────────┘   │  │
│ │              │  │                                               │  │
│ │              │  │ รวมราคาทุกรายการ: 15,000 บาท                 │  │
│ │              │  │                                               │  │
│ └──────────────┘  └─────────────────────────────────────────────┘  │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

#### UI Components
**Left Panel: Version List**
- Scrollable list of all versions
- Each item shows:
  - Version number (V1, V2, V3...)
  - Created date
  - Created by user
  - **รวมราคาทุกรายการ** (totalPrice)
- Radio button or selectable rows
- Default selection: Latest version (highest number)

**Right Panel: Version Detail**
- Same structure as Cost Detail Modal
- Stock information section
- **Customer information section (conditional - shown only if customer data exists)**
- Price transaction table (grouped by type)
- Summary showing only **รวมราคาทุกรายการ**
- Updates when different version is selected
- All fields readonly
- Shows full transaction breakdown

**Header Actions**
- **[PDF] Button** - Export selected version to PDF (similar to quotation PDF format)
- **[ปิด] Button** - Close modal

#### Alternative Layout Options
**Option A**: Dropdown + Detail View
```
┌────────────────────────────────────────────┐
│ เลือกเวอร์ชัน: [V3 - 2024-01-25 ▼]        │
│                                             │
│ (Full detail view below, same as cost      │
│  detail modal)                              │
└────────────────────────────────────────────┘
```
- Simpler for few versions
- Less visual comparison

**Option B**: Tab-based
```
┌────────────────────────────────────────────┐
│ [V1] [V2] [V3]                             │
│                                             │
│ (Active tab content shown below)            │
└────────────────────────────────────────────┘
```
- Good for few versions (≤5)
- Can get crowded with many versions

**Recommendation**: **Two-Panel Design** (shown above)
- Best for comparing versions
- Can handle many versions with scrolling
- Clear separation between list and detail
- Standard pattern for version/history UIs

---

## 4. API Integration

### 4.1 New API Methods in `product-api.js`

```javascript
// Location: /src/stores/modules/api/stock/product-api.js

export const usrStockProductApiStore = defineStore('stockProduct', {
  actions: {
    // Existing actions...

    /**
     * Fetch cost detail for a stock item
     * @param {String} stockNumber - Stock number to fetch
     * @returns {Promise} Cost detail response
     */
    async fetchGetStockCostDetail(stockNumber) {
      try {
        return await api.jewelry.post('StockProduct/GetStockCostDetail', null, {
          params: { stockNumber },
          skipLoading: false  // Show loading indicator
        })
      } catch (error) {
        console.error('Error fetching stock cost detail:', error)
        throw error
      }
    },

    /**
     * Fetch cost history versions for a stock item
     * @param {String} stockNumber - Stock number to fetch versions for
     * @returns {Promise} Cost history response with multiple versions
     */
    async fetchGetProductCostDetailVersion(stockNumber) {
      try {
        return await api.jewelry.get('StockProduct/GetProductCostDetailVersion', {
          params: { stockNumber },
          skipLoading: false  // Show loading indicator
        })
      } catch (error) {
        console.error('Error fetching product cost versions:', error)
        throw error
      }
    }
  }
})
```

### 4.2 API Endpoint Summary

| Endpoint | Method | Parameters | Response | Purpose |
|----------|--------|------------|----------|---------|
| `GetStockCostDetail` | POST | `stockNumber` (string) | Single cost detail object | Display current cost breakdown |
| `GetProductCostDetailVersion` | GET | `stockNumber` (string) | Array of version objects | Display cost history with versions |

**Note**: Based on the controller code:
- `GetStockCostDetail` uses POST method with query parameter
- `GetProductCostDetailVersion` uses GET method with query parameter

---

## 5. Data Table Action Buttons

### 5.1 Button Design (`data-table-view.vue` updates)

#### Current Actions Column
```vue
<Column header="จัดการ" :frozen="true" alignFrozen="right">
  <template #body="slotProps">
    <div class="text-center">
      <!-- Existing buttons -->
      <button @click="handleUpdate(slotProps.data)">แก้ไข</button>
      <button @click="handleBarcode(slotProps.data)">บาร์โค้ด</button>

      <!-- NEW: Cost view buttons -->
      <button @click="handleViewCost(slotProps.data)">
        ดูต้นทุน
      </button>
      <button @click="handleViewHistory(slotProps.data)">
        ดูประวัติ
      </button>
    </div>
  </template>
</Column>
```

#### Button Styling Recommendations
Use existing button classes from SCSS:
```scss
// Use PrimeVue button component for consistency
<Button
  icon="pi pi-calculator"
  v-tooltip.top="'ดูต้นทุนสินค้า'"
  class="p-button-sm p-button-info p-button-text"
  @click="handleViewCost(slotProps.data)"
/>

<Button
  icon="pi pi-history"
  v-tooltip.top="'ดูประวัติตีราคา'"
  class="p-button-sm p-button-secondary p-button-text"
  @click="handleViewHistory(slotProps.data)"
/>
```

**Button Icons** (PrimeVue Icons):
- Cost Detail: `pi pi-calculator` or `pi pi-money-bill`
- Cost History: `pi pi-history` or `pi pi-list`

---

## 6. Data Flow Diagram

### 6.1 View Cost Detail Flow
```
User clicks "ดูต้นทุน" button
    ↓
data-table-view.vue → handleViewCost(rowData)
    ↓
Emit event to parent (index-view.vue)
    ↓
index-view.vue → Open cost-detail-modal
    ↓
cost-detail-modal.vue → mounted/watch
    ↓
API Call: fetchGetStockCostDetail(stockNumber)
    ↓
Display cost detail in readonly format
    ↓
User clicks "ปิด" → Close modal
```

### 6.2 View Cost History Flow
```
User clicks "ดูประวัติ" button
    ↓
data-table-view.vue → handleViewHistory(rowData)
    ↓
Emit event to parent (index-view.vue)
    ↓
index-view.vue → Open cost-history-modal
    ↓
cost-history-modal.vue → mounted
    ↓
API Call: fetchGetProductCostDetailVersion(stockNumber)
    ↓
Display version list (default: select latest)
    ↓
User selects different version
    ↓
Update detail panel with selected version data
    ↓
User clicks "ปิด" → Close modal
```

---

## 7. Component Implementation Details

### 7.1 cost-detail-modal.vue Structure (Cost Detail - NO Customer)

```vue
<template>
  <Dialog
    v-model:visible="localVisible"
    header="ดูต้นทุนสินค้า"
    :modal="true"
    :style="{ width: '80vw' }"
    :closable="true"
  >
    <!-- Stock Information Section -->
    <div class="filter-container mb-3">
      <h5 class="title-text-lg">ข้อมูลสินค้า</h5>
      <div class="form-col-container">
        <div>
          <label>เลขที่ผลิต</label>
          <p class="font-weight-bold">{{ costData.stockNumber }}</p>
        </div>
        <!-- More fields... -->
      </div>
    </div>

    <!-- NO Customer Information Section (Cost detail doesn't include customer) -->

    <!-- Cost Items Table -->
    <div class="filter-container mb-3">
      <h5 class="title-text-lg">รายการต้นทุน</h5>
      <DataTable :value="groupedTransactions">
        <!-- Grouped table structure -->
      </DataTable>
    </div>

    <!-- Cost Summary - Only Total Price -->
    <div class="filter-container mb-3">
      <div class="flex-group">
        <span>รวมราคาทุกรายการ:</span>
        <span class="font-weight-bold">{{ formatCurrency(costData.totalPrice) }}</span>
      </div>
    </div>

    <template #footer>
      <Button label="ปิด" @click="handleClose" class="p-button-secondary" />
    </template>
  </Dialog>
</template>

<script>
export default {
  name: 'CostDetailModal',
  props: {
    visible: Boolean,
    stockNumber: String
  },
  data() {
    return {
      costData: {},
      loading: false
    }
  },
  watch: {
    visible(val) {
      if (val && this.stockNumber) {
        this.loadCostDetail()
      }
    }
  },
  methods: {
    async loadCostDetail() {
      // API call to fetchGetStockCostDetail
    },
    handleClose() {
      this.$emit('update:visible', false)
    }
  }
}
</script>
```

### 7.2 cost-history-modal.vue Structure (Appraisal History - May Include Customer)

```vue
<template>
  <Dialog
    v-model:visible="localVisible"
    header="ดูประวัติตีราคา"
    :modal="true"
    :style="{ width: '90vw', height: '80vh' }"
    :closable="true"
  >
    <div class="history-container">
      <!-- Left Panel: Version List -->
      <div class="version-list">
        <h5 class="title-text">รายการเวอร์ชัน</h5>
        <div
          v-for="version in versions"
          :key="version.versionId"
          class="version-item"
          :class="{ 'selected': selectedVersion?.versionId === version.versionId }"
          @click="selectVersion(version)"
        >
          <div class="version-header">
            <span class="version-number">V{{ version.versionNumber }}</span>
            <span class="version-date">{{ formatDate(version.createDate) }}</span>
          </div>
          <div class="version-info">
            <span>ผู้สร้าง: {{ version.createBy }}</span>
            <span>ต้นทุนต่อชิ้น: {{ formatCurrency(version.totalCost) }}</span>
            <span>ราคาประเมิน: {{ formatCurrency(version.productPrice) }}</span>
          </div>
        </div>
      </div>

      <!-- Right Panel: Version Detail (Appraisal format - different from cost detail) -->
      <div class="version-detail">
        <div v-if="selectedVersion">
          <!-- Stock Information -->
          <div class="filter-container mb-3">
            <h5 class="title-text-lg">ข้อมูลสินค้า</h5>
            <!-- Stock fields... -->
          </div>

          <!-- Customer Information (Conditional - shown only if exists) -->
          <div v-if="hasCustomerInfo(selectedVersion)" class="filter-container mb-3">
            <h5 class="title-text-lg">ข้อมูลลูกค้า</h5>
            <!-- Customer fields... -->
          </div>

          <!-- Price Appraisal Table -->
          <div class="filter-container mb-3">
            <h5 class="title-text-lg">รายการตีราคา</h5>
            <DataTable :value="groupedTransactions">
              <!-- Grouped table structure -->
            </DataTable>
          </div>

          <!-- Summary (Same as cost detail) -->
          <div class="filter-container mb-3">
            <div class="flex-group">
              <span>รวมราคาทุกรายการ:</span>
              <span class="font-weight-bold">{{ formatCurrency(selectedVersion.totalPrice) }}</span>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <p>กรุณาเลือกเวอร์ชันเพื่อดูรายละเอียด</p>
        </div>
      </div>
    </div>

    <template #footer>
      <Button
        label="Export PDF"
        icon="pi pi-file-pdf"
        @click="handleExportPDF"
        class="p-button-success"
        :disabled="!selectedVersion"
      />
      <Button label="ปิด" @click="handleClose" class="p-button-secondary" />
    </template>
  </Dialog>
</template>

<script>
export default {
  name: 'CostHistoryModal',
  props: {
    visible: Boolean,
    stockNumber: String
  },
  data() {
    return {
      versions: [],
      selectedVersion: null,
      loading: false
    }
  },
  watch: {
    visible(val) {
      if (val && this.stockNumber) {
        this.loadVersionHistory()
      }
    }
  },
  methods: {
    async loadVersionHistory() {
      // API call to fetchGetProductCostDetailVersion
      // Auto-select latest version (highest versionNumber)
    },
    selectVersion(version) {
      this.selectedVersion = version
    },
    hasCustomerInfo(version) {
      // Check if version has customer information
      return version && (version.customerNumber || version.customerName)
    },
    async handleExportPDF() {
      // Export selected version to PDF
      // Use appraisal PDF builder (similar to quotation PDF)
      if (!this.selectedVersion) return

      try {
        const { generateAppraisalPdf } = await import('@/services/helper/pdf/appraisal')
        await generateAppraisalPdf({
          version: this.selectedVersion,
          stockNumber: this.stockNumber,
          filename: `Appraisal_${this.stockNumber}_V${this.selectedVersion.versionNumber}.pdf`,
          openInNewTab: false
        })
      } catch (error) {
        console.error('Error exporting PDF:', error)
      }
    },
    handleClose() {
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style scoped lang="scss">
.history-container {
  display: flex;
  gap: 20px;
  height: 100%;
}

.version-list {
  width: 300px;
  border-right: 1px solid #ddd;
  padding-right: 15px;
  overflow-y: auto;
}

.version-detail {
  flex: 1;
  overflow-y: auto;
}

.version-item {
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 10px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #f5f5f5;
  }

  &.selected {
    border-color: var(--base-green);
    background-color: #e8f5e9;
  }
}
</style>
```

---

## 8. PDF Export Feature

### 8.1 PDF Structure (Similar to Quotation)
The PDF export for appraisal history will follow the quotation PDF structure:

```
┌─────────────────────────────────────────────────┐
│ Header Section                                   │
│ ├── Company Logo                                 │
│ ├── Company Info: Duang Kaew Jewelry            │
│ ├── Document Title: "APPRAISAL" or "ตีราคา"     │
│ ├── Document No: Appraisal-{stockNumber}-V{n}   │
│ └── Date: {appraisal date}                       │
├──────────────────────────────────────────────────┤
│ Information Section                              │
│ ├── From: Company Details                        │
│ └── Customer: {customer info if exists}          │
├──────────────────────────────────────────────────┤
│ Product Information                              │
│ ├── Stock Number                                 │
│ ├── Product Code                                 │
│ ├── Product Name (TH/EN)                         │
│ ├── Product Type                                 │
│ └── W.O.                                         │
├──────────────────────────────────────────────────┤
│ Transaction Table                                │
│ ┌─────┬───────┬────┬──────┬────────┬──────┬─────┐│
│ │Group│ Item  │Qty │Price │ Weight │Price │Total││
│ ├─────┼───────┼────┼──────┼────────┼──────┼─────┤│
│ │ Gold (ทอง)                                    ││
│ │  └─ น้ำหนักแป้น │10│100│50│200│11,000        ││
│ │ Gem (เพชร)                                    ││
│ │  └─ Diamond │5│1000│-│-│5,000                 ││
│ │ Worker (แรงงาน)                                ││
│ │  └─ Casting │1│500│-│-│500                    ││
│ └─────┴───────┴────┴──────┴────────┴──────┴─────┘│
├──────────────────────────────────────────────────┤
│ Summary                                          │
│ รวมราคาทุกรายการ: 16,500 บาท                     │
├──────────────────────────────────────────────────┤
│ Footer                                           │
│ ├── Version Info: V{n}                           │
│ ├── Created By: {user}                           │
│ ├── Created Date: {date}                         │
│ └── Signature Section                            │
└──────────────────────────────────────────────────┘
```

### 8.2 PDF Files Structure (To be Created)

```
/services/helper/pdf/appraisal/
├── appraisal-pdf-builder.js          # PDF builder class
└── appraisal-pdf-integration.js      # Integration helper
```

**appraisal-pdf-builder.js** - Key Features:
- Extends/similar to quotation PDF builder
- Company header with logo
- Stock product information
- Customer information (conditional)
- Transaction table grouped by type
- Summary showing total price only
- Version information footer
- Thai font support (THSarabunNew)
- Company colors (#921313 - red, #e0e0e0 - gray)

**appraisal-pdf-integration.js** - Export Function:
```javascript
export function generateAppraisalPdf({
  version,           // Selected version data
  stockNumber,       // Stock number
  filename,          // PDF filename
  openInNewTab       // Open in new tab or download
})
```

### 8.3 PDF Table Structure

**Transaction Table Columns**:
1. กลุ่ม (Group) - Gold, Gem, Worker, Embed, ETC
2. รายการ (Item) - Description
3. จำนวน (Qty) - Quantity
4. ราคา/หน่วย (Price per unit)
5. น้ำหนัก (Weight)
6. ราคา/น้ำหนัก (Price per weight)
7. รวม (Total)

**Grouped by Type**:
- ทอง (Gold)
- เพชร (Gem)
- แรงงาน (Worker)
- ฝังพลอย (Embed)
- อื่นๆ (ETC)

### 8.4 PDF Styling

**Colors** (consistent with company branding):
- Header Background: #e0e0e0 (light gray)
- Company Name: #921313 (dark red)
- Table Header: #921313 background, white text
- Summary Row: #e0e0e0 background, #921313 text
- Font: THSarabunNew

**Page Setup**:
- Page Size: A4
- Margins: [10, 10, 10, 40]
- Font Size: 13px default
- Multi-page support if needed

---

## 9. Implementation Plan & Task Breakdown

### Phase 1: API Integration (Priority: High)
- [x] Read and analyze API controller endpoints
- [ ] Write API methods in `product-api.js`
  - `fetchGetStockCostDetail(stockNumber)`
  - `fetchGetProductCostDetailVersion(stockNumber)`
- [ ] Test API endpoints with sample stock numbers

### Phase 2: Cost Detail Modal (Priority: High)
- [ ] Create `cost-detail-modal.vue` component
- [ ] Implement stock information section (readonly)
- [ ] Implement customer information section (readonly, conditional)
- [ ] Implement price transaction table (grouped, readonly)
- [ ] Implement cost summary display
- [ ] Add close functionality
- [ ] Style with existing SCSS classes

### Phase 3: Cost History Modal (Priority: High)
- [ ] Create `cost-history-modal.vue` component
- [ ] Implement two-panel layout (version list + detail)
- [ ] Implement version list with selection
- [ ] Reuse cost detail structure for version detail panel
- [ ] Add default selection (latest version)
- [ ] Add close functionality
- [ ] Style with existing SCSS classes

### Phase 4: Data Table Integration (Priority: High)
- [ ] Update `data-table-view.vue`
- [ ] Add "ดูต้นทุน" button in actions column
- [ ] Add "ดูประวัติ" button in actions column
- [ ] Implement click handlers (emit events to parent)
- [ ] Add tooltips for buttons
- [ ] Test button functionality

### Phase 5: Parent Component Integration (Priority: Medium)
- [ ] Update `index-view.vue`
- [ ] Import new modal components
- [ ] Add modal visibility state
- [ ] Add modal open handlers
- [ ] Pass stockNumber prop to modals
- [ ] Test modal open/close flow

### Phase 6: PDF Export Feature (Priority: Medium)
- [ ] Create `/services/helper/pdf/appraisal/` directory
- [ ] Create `appraisal-pdf-builder.js`
  - Based on quotation PDF builder structure
  - Implement header with company logo
  - Implement stock information section
  - Implement customer section (conditional)
  - Implement transaction table (grouped)
  - Implement summary section
  - Implement version footer
- [ ] Create `appraisal-pdf-integration.js`
  - Export function `generateAppraisalPdf`
  - Handle PDF generation and download
- [ ] Add Export PDF button to Cost History Modal
- [ ] Test PDF export functionality
- [ ] Test PDF with/without customer data
- [ ] Test PDF with different transaction types

### Phase 7: Documentation & Testing (Priority: Medium)
- [ ] Update `stock-product-list.md`
  - Document new features
  - Document new API endpoints
  - Document new modal components
  - Document PDF export feature
  - Add usage examples
- [ ] Test all user flows
- [ ] Test with various data scenarios (with/without customer, multiple versions, etc.)
- [ ] Test PDF export with various versions
- [ ] Cross-browser testing

---

## 9. User Experience Flow

### Scenario 1: View Cost Detail
```
1. User navigates to Stock Product List
2. User finds desired product in table
3. User clicks "ดูต้นทุน" button in actions column
4. Cost Detail Modal opens with loading indicator
5. API fetches cost data
6. Modal displays readonly cost breakdown:
   - Stock information
   - Customer information (if available)
   - Price transactions grouped by type
   - Cost summary
7. User reviews information
8. User clicks "ปิด" to close modal
```

### Scenario 2: View Cost History
```
1. User navigates to Stock Product List
2. User finds desired product in table
3. User clicks "ดูประวัติ" button in actions column
4. Cost History Modal opens with loading indicator
5. API fetches all cost versions
6. Modal displays:
   - Left panel: List of versions (V1, V2, V3...)
   - Right panel: Latest version detail (auto-selected)
7. User can select different versions from list
8. Right panel updates to show selected version detail
9. User can compare versions by switching selection
10. User clicks "ปิด" to close modal
```

---

## 10. Technical Considerations

### 10.1 Performance
- Use lazy loading for modals (load data only when opened)
- Cache version data to avoid re-fetching on version switch
- Consider pagination for version list if many versions exist (>50)

### 10.2 Error Handling
- Display friendly error messages if API fails
- Handle missing data gracefully (empty states)
- Validate stockNumber before API calls

### 10.3 Accessibility
- Use proper ARIA labels for buttons
- Ensure keyboard navigation works in version list
- Maintain focus management when opening/closing modals

### 10.4 Responsive Design
- Modal should be responsive (use % width, not fixed pixels)
- Two-panel layout should stack on smaller screens (if needed for tablet)
- Ensure buttons in actions column don't overflow

### 10.5 Reusability
Consider creating a shared component for displaying cost details since both modals use similar structure:
```
/components/
└── cost-detail-display.vue  (Shared readonly display component)
```
Used by:
- `cost-detail-modal.vue` - Single cost view
- `cost-history-modal.vue` - Version detail panel

---

## 11. Styling Guidelines

### Use Existing SCSS Classes
Reference: `/src/assets/scss/custom-style/standard-form.scss`

```scss
// Containers
.filter-container              // Standard boxes with shadow
.filter-container-main         // Main content containers

// Typography
.title-text-lg                 // Section headers (17px bold red)
.title-text                    // Sub-headers (14px bold red)
.desc-text                     // Description text (20px bold)

// Layouts
.form-col-container            // Responsive grid (auto-fit, min 250px)
.flex-group                    // Space-between flex layout

// Status/Badges (if needed for version status)
.box-status-success            // Green status
.box-status-show               // Yellow status
```

### Modal Sizing
- Cost Detail Modal: `width: 80vw` (large, similar to appraisal form)
- Cost History Modal: `width: 90vw, height: 80vh` (extra large for two panels)

---

## 12. Testing Checklist

### Functional Testing
- [ ] Cost detail modal opens correctly
- [ ] Cost detail displays all data correctly
- [ ] Cost detail handles missing customer data
- [ ] Cost history modal opens correctly
- [ ] Version list displays all versions
- [ ] Latest version is auto-selected
- [ ] Version selection updates detail panel
- [ ] Both modals close correctly
- [ ] API errors are handled gracefully
- [ ] Loading states work correctly

### UI/UX Testing
- [ ] Buttons have proper icons and tooltips
- [ ] Modals are sized appropriately
- [ ] Data is formatted correctly (currency, dates)
- [ ] Readonly fields are clearly non-editable
- [ ] Tables are properly grouped
- [ ] Version list is scrollable if many versions
- [ ] Detail panel is scrollable if long content

### Integration Testing
- [ ] Events are properly emitted/handled
- [ ] Stock number is correctly passed to modals
- [ ] Multiple modals can open/close without issues
- [ ] State is properly cleared when modal closes

---

## 13. Future Enhancements (Optional)

### Version Comparison
Add ability to compare two versions side-by-side:
```
┌─────────────────────────────────────────────┐
│ เปรียบเทียบเวอร์ชัน                         │
├─────────────────────────────────────────────┤
│ V1 (2024-01-15)  │  V3 (2024-01-25)        │
│ ต้นทุน: 15,000   │  ต้นทุน: 16,500         │
│ [Transaction details side-by-side]          │
└─────────────────────────────────────────────┘
```

### Export Functionality
Add export buttons to export cost details:
- Export to PDF
- Export to Excel
- Print preview

### Version Notes
Add ability to view detailed notes/remarks for each version:
```
Version 3 Notes:
- Updated gold price
- Added new gem items
- Adjusted labor costs
```

---

## 14. Summary

This design provides a comprehensive plan for adding cost viewing features to the stock product list. The implementation follows existing patterns in the codebase and reuses components where appropriate.

**Key Differences Between Cost Detail and Appraisal History**:

| Feature | Cost Detail (ต้นทุนสินค้า) | Appraisal History (ประวัติตีราคา) |
|---------|---------------------------|----------------------------------|
| Customer Info | ❌ No customer info | ✅ May have customer info (optional) |
| Summary Fields | Only "รวมราคาทุกรายการ" | Only "รวมราคาทุกรายการ" (SAME) |
| PDF Export | ❌ No PDF export | ✅ Export PDF feature |
| Purpose | Show production cost | Show appraisal/pricing history |
| API Endpoint | `GetStockCostDetail` | `GetProductCostDetailVersion` |
| Data Structure | Single cost record | Multiple versions (history) |

**Key Design Decisions**:
1. **Two separate modals** - Cost detail (readonly) and appraisal history (readonly + PDF)
2. **Same summary format** - Both modals show only "รวมราคาทุกรายการ"
3. **Standalone readonly modals** - Simpler than modifying appraisal form
4. **Two-panel history modal** - Best UX for version selection and viewing
5. **Conditional customer section** - Only shown in appraisal history if data exists
6. **PDF export feature** - Based on quotation PDF structure with company branding
7. **Consistent styling** - Uses existing SCSS classes and company colors
8. **Event-driven architecture** - Follows existing modal pattern in the codebase
9. **Lazy loading** - Data loaded only when modals open

**Implementation Estimate**:
- API Integration: 1-2 hours
- Cost Detail Modal: 3-4 hours
- Cost History Modal: 4-5 hours
- Data Table Integration: 1-2 hours
- PDF Export Feature: 4-6 hours
  - PDF Builder: 3-4 hours
  - PDF Integration: 1-2 hours
- Testing & Documentation: 3-4 hours
- **Total**: ~17-24 hours

**Ready for Implementation**: Yes, all design decisions are documented and ready to proceed.
