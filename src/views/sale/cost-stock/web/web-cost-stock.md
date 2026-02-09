
#### ช่วยเขียนเเละเเก้ไข code ตามรูปเเบบใน E:\coqo_duangkeaw\Code\jeweley-ui\CLAUDE.md เท่านั้นครับ
#### ถ้ามีการใช้ prime-vue components >> ตรวจสอบว่ามี generic-components ไหม >> ไม่มีให้สร้างไว้เพื่อ re-used >> สร้างเเละเช็ค ที่ E:\coqo_duangkeaw\Code\jeweley-ui\src\components\prime-vue

>> การตีราคาสินค้าใหม่
>> flow >>>>>  ออกเเบบแผนตีราคา(mobile) >> ตีราคา(web) >> ออกผลตีราคา(web & mobile)
>> ออกเเบบหน้าจอสำหรับตีคาสิน้คาใหม่ ต้องออกกเบบให้รองรับทั้งที่มีแผนมาเเละไม่มีแผนมา
>> **หมายเหตุ**: Web version รองรับ Tablet & Desktop เท่านั้น, Mobile จะมี route และ layout แยกต่างหาก

## 1. กรณีไม่มีแผน (Web - Tablet & Desktop)

  **Flow**: Get Stock >> ตีราคา >> บันทึก (export document) >> ตีราคาใหม่ >> บันทึก

  **Location**: `/sale/cost-stock-edit` (E:\coqo_duangkeaw\Code\jeweley-ui\src\views\sale\cost-stock\web\cost-edit\)

  ### Component Structure:
  ```
  /cost-stock/web/cost-edit/
  ├── index-view.vue (Main orchestrator)
  ├── components/
  │   ├── search-stock-view.vue (Stock search)
  │   └── appraisal-form-view.vue (Appraisal form)

  /components/prime-vue/
  └── AutoCompleteGeneric.vue (Reusable AutoComplete component)
  ```

  ### Features Implemented:
  ✅ Stock Information Section (Read-only)
     - เลขที่ผลิต (Stock Number)
     - รหัสสินค้า (Product Code)
     - รายละเอียด (Description)

  ✅ Customer Information (Modal-based Search & Create) - **Optional Field**
     - ค้นหาลูกค้า button (Search Customer - opens search modal)
     - เพิ่มลูกค้าใหม่ button (Create New Customer - opens create modal, auto-fill customer info)
     - ชื่อลูกค้า (Customer Name - display only)
     - ที่อยู่ (Customer Address - display only)
     - เบอร์โทร (Customer Phone - display only)
     - อีเมล (Customer Email - display only)
     - หมายเหตุ (Remark/Notes - editable)
     - **Note**: Customer information is optional, can save without customer data

  ✅ Price Appraisal Section
     - DataTable with groups: Gold, Gem, Worker, Embed, ETC
     - Auto-calculate total price per row (qty * qtyPrice + qtyWeight * qtyWeightPrice)
     - Group totals and grand total calculation
     - Add/remove transaction items with dropdown selection
     - **Auto-add "น้ำหนักแป้น" (RINGP)** for Ring products (productType === 'R')
       - Automatically added to Gold group when stock is fetched
       - Only added if not already exists in transaction items
     - **Smart Input for Item Description (All types use AutoCompleteGeneric)**:
       - **All AutoComplete allow free text input** (forceSelection: false)
       - **Enter key does NOT submit form** (prevented in AutoCompleteGeneric component)
       - **Existing items from stock**: Read-only (disabled)
       - **New items - Dynamic based on group**:
         - **Gold (ทอง)**: Hardcoded list + API combined (Master/MasterGold)
           - Hardcoded: "RINGP" (น้ำหนักแป้น)
           - API: Additional gold types from master database
           - Display: code only
           - Free text allowed for custom gold types
         - **Gem (วัถุดิบ)**: Search from StockGem API (พลอย/เพชร)
           - Minimum 3 characters to trigger search
           - Auto-fill price when selected
           - Free text allowed for custom gems
         - **Worker (งานช่าง)**: Static list (temporary master)
           - ค่าชุบ, ค่าแม่พิมพ์, ค่ายิงเลเซอร์, ค่าแรงทำแป้น, ค่าคัดพลอย
           - Free text allowed
         - **Embed (งานฝัง)**: Static list (temporary master)
           - งานฝังพลอย, งานฝังเพชร, งานฝังเกสร, งานฝังแบบตัวเรือน
           - Free text allowed
         - **ETC (รายการเพิ่มเติม)**: Static list (temporary master)
           - ค่าบรรจุภัณฑ์, ค่าขนส่ง, ค่าธรรมเนียม, ค่าใช้จ่ายอื่นๆ, ค่าตรวจสอบคุณภาพ
           - Free text allowed

  ✅ Action Buttons
     - บันทึก (Save) → isOriginCost = false
     - บันทึกและใช้เป็นต้นทุนหลัก (Save as Origin Cost) → isOriginCost = true
     - ยกเลิก (Cancel)

  ✅ Responsive Design (Tablet & Desktop)
     - Uses new web responsive utility classes from `responsive-style/web/`
     - DataTable with horizontal scroll on tablet
     - Button groups wrap naturally
     - Tested at 1024px (tablet) and 1280px+ (desktop)
     - Import: `@import '@/assets/scss/responsive-style/web';`

  ### Changes from Original Requirements:
  - ❌ Removed Materials Section (ทอง | เพชร | พลอย)
  - ❌ Removed "Cost Per Piece" display and "Use cost as appraisal price" checkbox (not used)
  - ✅ Stock information made read-only
  - ✅ Customer selection via modal with two options:
    - Search existing customer (CustomerSearchModal)
    - Create new customer (CustomerCreateModal) - auto-fills customer info after creation
  - ✅ Customer info display: name, address, phone, email (read-only)
  - ✅ Customer information is **optional** (not required for saving)
  - ✅ Remark field remains editable
  - ✅ Integrated with new API endpoint `AddProductCostDeatialVersion`
  - ✅ **Smart Input System** for transaction items:
    - Existing items from stock: Read-only input (cannot edit)
    - New items added by user: AutoCompleteGeneric with dynamic configuration
    - **All AutoComplete allow free text** - Users can type custom values not in lists
    - **Enter key prevention** - Pressing Enter in AutoComplete does NOT submit form
    - Gold: Hardcoded list (RINGP) + API combined
    - Gem: API search with auto-fill price
    - Worker/Embed/ETC: Temporary static lists with free text allowed
  - ✅ **Auto-add "น้ำหนักแป้น" (RINGP)** for Ring products (productType === 'R')
  - ✅ Responsive for Tablet & Desktop only (Mobile has separate routes)

  ### API Integration:

  #### 1. Save Appraisal API
  - ✅ **Implemented**: Save API endpoint `AddProductCostDeatialVersion`
  - API Store: `usrStockProductApiStore.fetchAddProductCostDeatialVersion()`
  - Location: `src/stores/modules/api/stock/product-api.js`
  - Request mapping:
    - Stock Number (stockNumber or stockNumberOrigin)
    - Customer Info (code, name, address, tel, email) - optional
    - Remark - optional
    - Price Transactions (prictransection array with qty, qtyPrice, qtyWeight, qtyWeightPrice)
    - **isOriginCost**:
      - `false` when clicking "บันทึก" (Save)
      - `true` when clicking "บันทึกและใช้เป็นต้นทุนหลัก" (Save as Origin Cost)

  #### 2. Master Data APIs (AutoComplete)

  **Gold (ทอง)**:
  - ✅ Source: Hardcoded list + API combined
  - Hardcoded list: `hardcodedGoldList` in component
    - RINGP (น้ำหนักแป้น)
  - API: `master-store.js` → `fetchGold()`
  - Endpoint: `Master/MasterGold`
  - Returns: Combined array (hardcoded + API, no duplicates)
  - Usage: Static list for AutoComplete
  - **Free text allowed**: Can type custom gold types not in list

  **Gem (วัถุดิบ/พลอย/เพชร)**:
  - ✅ Endpoint: `StockGem/Search`
  - Trigger: Minimum 3 characters typed
  - Returns: Array of gem/diamond items with name, code, price
  - Auto-fill: Automatically sets `qtyWeightPrice` when gem selected
  - **Free text allowed**: Can type custom gems not in database

  **Worker (งานช่าง)**:
  - ⏳ **Temporary**: Static list in component (`masterWorkerList`)
  - 🔜 **TODO**: Create API endpoint when master data is ready
  - Current items: ค่าชุบ, ค่าแม่พิมพ์, ค่ายิงเลเซอร์, ค่าแรงทำแป้น, ค่าคัดพลอย
  - **Free text allowed**: Can type custom worker items

  **Embed (งานฝัง)**:
  - ⏳ **Temporary**: Static list in component (`masterEmbedList`)
  - 🔜 **TODO**: Create API endpoint when master data is ready
  - Current items: งานฝังพลอย, งานฝังเพชร, งานฝังเกสร, งานฝังแบบตัวเรือน
  - **Free text allowed**: Can type custom embed items

  **ETC (รายการเพิ่มเติม)**:
  - ⏳ **Temporary**: Static list in component (`masterETCList`)
  - 🔜 **TODO**: Create API endpoint when master data is ready
  - Current items: ค่าบรรจุภัณฑ์, ค่าขนส่ง, ค่าธรรมเนียม, ค่าใช้จ่ายอื่นๆ, ค่าตรวจสอบคุณภาพ
  - **Free text allowed**: Can type custom ETC items

  ### Generic Components:

  #### AutoCompleteGeneric.vue
  **Location**: `src/components/prime-vue/AutoCompleteGeneric.vue`

  **Purpose**: Reusable AutoComplete component with support for both API and static list modes

  **Key Features**:
  - ✅ **Free text input** - Users can type any value (forceSelection: false by default)
  - ✅ **Enter key prevention** - Pressing Enter does NOT submit parent form
  - ✅ **Dual mode support** - API or static list modes
  - ✅ **Custom styling** - Flexible styling options

  **Modes**:
  1. **API Mode** (useStaticList: false) - Fetch data from API endpoint
  2. **Static List Mode** (useStaticList: true) - Use provided static options

  **Props**:
  - `modelValue` - v-model binding
  - **API Mode Props**:
    - `apiEndpoint` - API endpoint path (e.g., "StockGem/Search")
    - `searchField` - Field name for search query (default: "text")
    - `additionalSearchParams` - Additional search parameters (Object)
  - **Static List Mode Props**:
    - `staticOptions` - Array of static options (e.g., [{ code: 'RINGP', name: 'น้ำหนักแป้น' }])
    - `useStaticList` - Enable static list mode (default: false)
  - **Common Props**:
    - `placeholder` - Placeholder text
    - `optionLabel` - Field name for option display (default: "name")
    - `forceSelection` - Force user to select from list (default: false) **[IMPORTANT: Set to false for free text]**
    - `minLength` - Minimum characters to trigger search (default: 1)
    - `disabled` - Disable state
    - `customClass` - Custom CSS class
    - `customStyle` - Custom inline styles
    - `skipLoading` - Skip global loading indicator (default: true)

  **Events**:
  - `@update:modelValue` - Model value changed
  - `@item-select` - Item selected from suggestions
  - `@search-complete` - Search completed with results

  **Slots**:
  - `#option` - Custom option template (receives `{ option }`)

  **Usage Examples**:

  **API Mode (Gem Search)**:
  ```vue
  <AutoCompleteGeneric
    v-model="selectedGem"
    apiEndpoint="StockGem/Search"
    searchField="text"
    placeholder="ค้นหาพลอย/เพชร..."
    optionLabel="name"
    :forceSelection="true"
    :minLength="3"
    @item-select="onGemSelected"
  >
    <template #option="{ option }">
      <div>{{ option.name }} - {{ option.code }}</div>
    </template>
  </AutoCompleteGeneric>
  ```

  **Static List Mode (Gold)**:
  ```vue
  <AutoCompleteGeneric
    v-model="selectedGold"
    :useStaticList="true"
    :staticOptions="masterGoldList"
    placeholder="ค้นหาทอง..."
    optionLabel="code"
    :forceSelection="false"
    @item-select="onGoldSelected"
  >
    <template #option="{ option }">
      <div>{{ option.code }}</div>
    </template>
  </AutoCompleteGeneric>
  ```

  ### References:
  - Stock fetch logic: `quotation-view.vue` line 970
  - Original appraisal screen: `edit-stock-view.vue` ~line 100
  - AutoComplete pattern: `update-process-view.vue` line 333
