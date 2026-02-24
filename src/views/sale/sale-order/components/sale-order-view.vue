<template>
  <div class="mt-2">
    <!-- Sale Order Information Section -->
    <div class="card-container">
      <div class="card-header">
        <h6 class="mb-0">ข้อมูลใบสั่งขาย</h6>
      </div>
      <div class="card-body">
        <div class="form-col-container">
          <!-- Sale Order Number -->
          <div>
            <span class="title-text">เลขที่ใบสั่งขาย</span>
            <div class="d-flex align-items-center">
              <input
                :class="['form-control bg-input']"
                type="text"
                v-model.trim="formSaleOrder.number"
                readonly
                :disabled="isSONumberLocked"
              />
            </div>
          </div>

          <!-- Sale Order Date -->
          <div>
            <span class="title-text">วันที่ใบสั่งขาย</span>
            <Calendar
              class="w-100"
              v-model="formSaleOrder.date"
              showIcon
              :manualInput="false"
              placeholder="เลือกวันที่"
              dateFormat="dd/mm/yy"
              :disabled="isViewMode"
            />
          </div>

          <!-- Expected Delivery Date -->
          <div>
            <span class="title-text">วันที่คาดหวังส่งมอบ</span>
            <Calendar
              class="w-100"
              v-model="formSaleOrder.expectedDeliveryDate"
              showIcon
              :manualInput="false"
              placeholder="เลือกวันที่"
              dateFormat="dd/mm/yy"
              :disabled="isViewMode"
            />
          </div>
        </div>

        <div class="form-col-container mt-2">
          <!-- Quotation Reference -->
          <div>
            <span class="title-text">อ้างอิงใบเสนอราคา</span>
            <input
              :class="['form-control bg-input']"
              type="text"
              v-model.trim="formSaleOrder.quotationNumber"
              placeholder="QUO-2025-001"
              readonly
            />
          </div>

          <!-- Priority -->
          <div>
            <span class="title-text">ลำดับความสำคัญ</span>
            <Dropdown
              v-model="formSaleOrder.priority"
              :options="priorityOptions"
              optionLabel="name"
              optionValue="value"
              placeholder="เลือกลำดับความสำคัญ"
              class="w-100"
              :disabled="isViewMode"
            />
          </div>

          <div></div>
        </div>
      </div>
    </div>

    <!-- Customer Information Section (Like Quotation) -->
    <div class="card-container mt-3">
      <div class="card-header">
        <h6 class="mb-0">ข้อมูลลูกค้า</h6>
      </div>
      <div class="card-body">
        <div class="">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div>
              <button
                :class="[
                  'btn btn-sm mr-2',
                  `${hasSaleOrderNumber ? 'btn-secondary ' : 'btn-green'}`
                ]"
                type="button"
                @click="onSearchCustomer"
                title="ค้นหาลูกค้า"
                :disabled="hasSaleOrderNumber"
              >
                <i class="bi bi-search mr-1"></i>
                <span>ค้นหาลูกค้า</span>
              </button>
            </div>
          </div>

          <div class="customer-info-display">
            <div class="form-col-container">
              <div>
                <span class="title-text">ชื่อลูกค้า</span>
                <div class="customer-display-field">
                  {{ formSaleOrder.customerName || '-' }}
                </div>
              </div>
              <div>
                <span class="title-text">ที่อยู่</span>
                <div class="customer-display-field">
                  {{ formSaleOrder.customerAddress || '-' }}
                </div>
              </div>
              <div>
                <span class="title-text">เบอร์โทร</span>
                <div class="customer-display-field">
                  {{ formSaleOrder.customerPhone || '-' }}
                </div>
              </div>
              <div>
                <span class="title-text">อีเมล</span>
                <div class="customer-display-field">
                  {{ formSaleOrder.customerEmail || '-' }}
                </div>
              </div>
            </div>
            <div class="form-col-container mt-2">
              <div>
                <span class="title-text">หมายเหตุ</span>
                <input
                  :class="['form-control bg-input', 'input-bg']"
                  type="text"
                  v-model.trim="formSaleOrder.customerRemark"
                  :readonly="isViewMode"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Product Search Section (Like Quotation) -->
    <div class="card-container mt-3">
      <div class="card-header">
        <h6 class="mb-0">ค้นหาเพิ่มสินค้า</h6>
      </div>
      <div class="card-body">
        <form @submit.prevent="onSearchProduct">
          <div class="form-col-sm-container">
            <!-- Stock number (new) -->
            <div>
              <span class="title-text">เลขที่ผลิต (ใหม่)</span>
              <input
                :class="['form-control bg-input']"
                type="text"
                v-model.trim="productSearch.stockNumber"
                placeholder="EX: DK-2502-00X"
              />
            </div>

            <!-- Stock number (old) -->
            <div>
              <span class="title-text">เลขที่ผลิต (เก่า)</span>
              <input
                :class="['form-control bg-input']"
                type="text"
                v-model.trim="productSearch.stockNumberOrigin"
                placeholder="EX: AD054XX"
              />
            </div>

            <!-- Product number -->
            <div>
              <span class="title-text">รหัสสินค้า</span>
              <input
                :class="['form-control bg-input']"
                type="text"
                v-model.trim="productSearch.productNumber"
                placeholder="EX: R08X50XXXL"
              />
            </div>

            <div class="btn-submit-container-custom">
              <button class="btn btn-sm btn-green mr-2" type="submit" title="ค้นหา">
                <i class="bi bi-search"></i>
                <span class="ml-2">ค้นหา</span>
              </button>
            </div>
          </div>
        </form>

        <div class="line"></div>
        <div class="d-flex justify-content-start mt-2">
          <div class="mr-2">
            <span class="title-text">Currency</span>
            <input
              :class="['form-control bg-input', 'input-bg']"
              type="text"
              v-model.trim="formSaleOrder.currencyUnit"
              style="width: 150px"
              :readonly="isViewMode"
            />
          </div>
          <div class="mr-2">
            <span class="title-text">Currency Rate</span>
            <input
              :class="['form-control bg-input', 'input-bg']"
              type="number"
              v-model.number="formSaleOrder.currencyRate"
              min="0"
              step="any"
              style="width: 150px"
              :readonly="isViewMode"
              @input="recalculateAll"
            />
          </div>
          <div>
            <span class="title-text">Adjust Discount All (%)</span>
            <input
              :class="['form-control bg-input', 'input-bg']"
              type="number"
              v-model.number="overallDiscountPercent"
              min="0"
              max="100"
              step="any"
              style="width: 150px"
              :readonly="isViewMode"
              @input="applyOverallDiscount"
            />
          </div>
          <!-- <div class="mr-2">
            <span class="title-text">Markup</span>
            <input
              :class="['form-control bg-input', 'input-bg']"
              type="number"
              v-model.number="formSaleOrder.markup"
              min="0"
              step="any"
              style="width: 150px"
              :readonly="isViewMode"
              @input="recalculateAll"
            />
          </div>
          <div>
            <span class="title-text">Gold (US$/Oz.)</span>
            <input
              :class="['form-control bg-input', 'input-bg']"
              type="number"
              v-model.number="formSaleOrder.goldPerOz"
              min="0"
              max="10000"
              step="any"
              style="width: 150px"
              :readonly="isViewMode"
              @input="recalculateAll"
            />
          </div> -->
        </div>
      </div>
    </div>

    <!-- Stock Items Table (Like Quotation) -->
    <div class="card-container mt-3">
      <div class="card-header">
        <h6 class="mb-0">รายการสินค้า</h6>
        <div class="card-header-actions">
          <span class="badge badge-warning">{{ stockItems.length }} รายการ</span>
        </div>
      </div>
      <div class="card-body p-0">
        <DataTable
          :value="stockItemsWithGrouping"
          dataKey="stockNumber"
          :scrollable="true"
          scrollHeight="10000000px"
          class="p-datatable-sm"
          stripedRows
          responsiveLayout="scroll"
          showGridlines
          :rowGroupMode="'subheader'"
          :groupRowsBy="'groupKey'"
          :sortField="'sortOrder'"
          :sortOrder="1"
        >
          <ColumnGroup type="header">
            <Row>
              <Column header="" :colspan="2" />
              <Column header="" />
              <Column header="เลขที่ผลิต (ใหม่)" />
              <Column header="เลขที่ผลิต (เก่า)" />
              <Column header="รหัสสินค้า" />
              <Column header="สถานะการขาย" />
              <Column header="รายละเอียด" />
              <Column header="Gold (gms)" />
              <Column header="Diamond (cts)" />
              <Column header="Stone (cts)" />
              <Column header="ราคาขาย (THB)" />
              <Column header="ราคาประเมิน (THB)" />
              <Column header="ส่วนลด (%)" />
              <Column header="ราคาส่วนลด (THB)" />
              <Column header="แปลงเรท" />
              <Column :header="'ราคาแปลง (' + (formSaleOrder.currencyUnit || '') + ') '" />
              <Column header="จำนวน" />
              <Column :header="'รวมราคา (' + (formSaleOrder.currencyUnit || '') + ') '" />
            </Row>
          </ColumnGroup>

          <Column field="index" style="width: 10px">
            <template #body="slotProps">
              <span>{{ slotProps.index + 1 }}</span>
            </template>
          </Column>

          <Column field="action" style="width: 10px">
            <template #body="slotProps">
              <div class="d-flex justify-content-center align-items-center">
                <button
                  :class="[
                    'btn',
                    'btn-sm',
                    slotProps.data.isConfirm || slotProps.data.invoice ? 'btn-secondary' : 'btn-red'
                  ]"
                  type="button"
                  title="ลบ"
                  @click="deleteStockItem(slotProps.data)"
                  :disabled="slotProps.data.isConfirm || slotProps.data.invoice"
                >
                  <span class="bi bi-trash"></span>
                </button>
                <button
                  :class="[
                    'btn',
                    'btn-sm',
                    'ml-2',
                    slotProps.data.isConfirm || slotProps.data.invoice
                      ? 'btn-secondary'
                      : 'btn-main'
                  ]"
                  type="button"
                  title="แก้ไข"
                  @click="onEditStock(slotProps.data)"
                  :disabled="slotProps.data.isConfirm || slotProps.data.invoice"
                >
                  <span class="bi bi-brush"></span>
                </button>
                <button
                  v-if="slotProps.data.isConfirm && !slotProps.data.invoice"
                  class="btn btn-sm btn-danger ml-2"
                  type="button"
                  title="ยกเลิกยืนยันการขาย"
                  @click="reverseStockConfirm(slotProps.data)"
                >
                  <span class="bi bi-arrow-counterclockwise"></span>
                </button>
              </div>
            </template>
          </Column>

          <Column field="image" header="" style="width: 50px">
            <template #body="slotProps">
              <div class="image-container">
                <div v-if="slotProps.data.imagePath">
                  <imagePreview
                    :imageName="slotProps.data.imagePath"
                    :path="slotProps.data.imagePath"
                    :type="type"
                    :width="25"
                    :height="25"
                    :emitImage="true"
                    @image-loaded="handleImageLoaded($event, slotProps.data.stockNumber)"
                  />
                </div>
              </div>
            </template>
          </Column>

          <Column field="stockNumber" header="เลขที่ผลิต" style="min-width: 150px">
            <template #body="slotProps">
              <div class="d-flex flex-column">
                <span>{{ `${slotProps.data.stockNumber}` }}</span>
                <small v-if="slotProps.data.message" class="text-main">{{
                  `${slotProps.data.message}`
                }}</small>
              </div>
            </template>
          </Column>

          <Column field="stockNumber" header="เลขที่ผลิต" style="min-width: 150px">
            <template #body="slotProps">
              <span>{{
                `${
                  slotProps.data.stockNumberOrigin
                    ? slotProps.data.stockNumberOrigin || ''
                    : slotProps.data.stockNumber || ''
                }`
              }}</span>
            </template>
          </Column>

          <Column field="productNumber" header="รหัสสินค้า" style="min-width: 150px">
            <template #body="slotProps">
              <div v-if="!slotProps.data.stockNumber">
                <input
                  v-if="!slotProps.data.isConfirm && !slotProps.data.invoice"
                  v-model="slotProps.data.productNumber"
                  type="text"
                  class="form-control bg-input input-bg"
                  @blur="
                    onBlurDescription(slotProps.data, slotProps.data.stockNumber, 'productNumber')
                  "
                  style="background-color: #b5dad4; width: 100%"
                />
                <span v-else class="confirmed-text">
                  {{ slotProps.data.productNumber || '-' }}
                </span>
              </div>
              <div v-else>
                <span>{{ slotProps.data.productNumber }}</span>
              </div>
            </template>
          </Column>

          <!-- Confirmation Status Column for Stock Items -->
          <Column field="isConfirm" header="สถานะการขาย" style="min-width: 120px">
            <template #body="slotProps">
              <div v-if="!slotProps.data.isRemainProduct && !slotProps.data.isConfirm">
                <span class="text-center text-main">
                  {{ slotProps.data.message }}
                </span>
              </div>
              <div class="text-center" v-else-if="slotProps.data.invoice">
                <span class="badge badge-success">
                  {{ slotProps.data.invoice }}
                </span>
              </div>
              <div class="text-center" v-else>
                <span
                  :class="['badge', slotProps.data.isConfirm ? 'badge-success' : 'badge-warning']"
                >
                  {{ slotProps.data.isConfirm ? 'ยืนยันแล้ว' : 'รอยืนยัน' }}
                </span>
              </div>
            </template>
          </Column>

          <Column field="description" header="รายละเอียด" style="min-width: 200px">
            <template #body="slotProps">
              <input
                v-if="!slotProps.data.isConfirm && !slotProps.data.invoice"
                v-model="slotProps.data.description"
                type="text"
                class="form-control bg-input input-bg"
                @blur="onBlurDescription(slotProps.data, slotProps.data.stockNumber, 'description')"
                style="background-color: #b5dad4; width: 100%"
              />
              <span v-else class="confirmed-text">
                {{ slotProps.data.description || '-' }}
              </span>
            </template>
          </Column>

          <!-- Materials Columns like Quotation -->
          <Column field="gold" style="min-width: 120px; max-width: 300px">
            <template #body="slotProps">
              <div v-if="slotProps.data.materials">
                <div
                  v-for="(item, idx) in slotProps.data.materials.filter((m) => m.type === 'Gold')"
                  :key="idx"
                  class="material-cell"
                >
                  <div class="material-typecode-gold">
                    {{ item.typeCode }}
                  </div>
                  <div class="material-weight">
                    {{ item.weight ? item.weight.toFixed(2) : (0).toFixed(2) }}
                  </div>
                </div>
              </div>
            </template>
          </Column>

          <Column field="diamond" style="min-width: 140px; max-width: 300px">
            <template #body="slotProps">
              <div v-if="slotProps.data.materials">
                <div
                  v-for="(item, idx) in slotProps.data.materials.filter(
                    (m) => m.type === 'Diamond'
                  )"
                  :key="idx"
                  class="material-cell"
                >
                  <div class="material-typecode">
                    {{ `${item.qty ? `(${item.qty})` : ''} ${item.typeCode}` }}
                  </div>
                  <div class="material-weight">
                    {{ item.weight ? item.weight.toFixed(2) : (0).toFixed(2) }}
                  </div>
                </div>
              </div>
            </template>
          </Column>

          <Column field="gem" style="min-width: 140px; max-width: 300px">
            <template #body="slotProps">
              <div v-if="slotProps.data.materials">
                <div
                  v-for="(item, idx) in slotProps.data.materials.filter((m) => m.type === 'Gem')"
                  :key="idx"
                  class="material-cell"
                >
                  <div class="material-typecode">
                    {{ `${item.qty ? `(${item.qty})` : ''} ${item.typeCode}` }}
                  </div>
                  <div class="material-weight">
                    {{ item.weight ? item.weight.toFixed(2) : (0).toFixed(2) }}
                  </div>
                </div>
              </div>
            </template>
          </Column>

          <Column field="priceOrigin" header="ราคาขาย (THB)" style="min-width: 150px">
            <template #body="slotProps">
              <div class="qty-container">
                <span>{{
                  Number(slotProps.data.priceOrigin || slotProps.data.price || 0).toFixed(2)
                }}</span>
              </div>
            </template>
          </Column>

          <Column field="appraisalPrice" header="ราคาประเมิน (THB)" style="min-width: 150px">
            <template #body="slotProps">
              <div class="qty-container">
                <input
                  v-if="!slotProps.data.isConfirm && !slotProps.data.invoice"
                  v-model.number="slotProps.data.appraisalPrice"
                  type="number"
                  class="form-control text-right bg-input input-bg"
                  min="0"
                  step="any"
                  @blur="onBlurPrice(slotProps.data, slotProps.data.stockNumber, 'appraisalPrice')"
                  @input="recalculateAll"
                  style="background-color: #b5dad4; width: 100%"
                />
                <span v-else class="confirmed-text text-right">
                  {{ (Number(slotProps.data.appraisalPrice) || 0).toFixed(2) }}
                </span>
              </div>
            </template>
          </Column>

          <Column field="discountPercent" header="ส่วนลด (%)" style="min-width: 100px">
            <template #body="slotProps">
              <div class="qty-container">
                <input
                  v-if="!slotProps.data.isConfirm && !slotProps.data.invoice"
                  v-model.number="slotProps.data.discountPercent"
                  type="number"
                  class="form-control text-right bg-input input-bg"
                  min="0"
                  max="100"
                  step="any"
                  @blur="onBlurPrice(slotProps.data, slotProps.data.stockNumber, 'discountPercent')"
                  @input="recalculateAll"
                  style="background-color: #b5dad4; width: 100%"
                  placeholder="0"
                />
                <span v-else class="confirmed-text text-right">
                  {{ (Number(slotProps.data.discountPercent) || 0).toFixed(2) }}%
                </span>
              </div>
            </template>
          </Column>

          <Column field="discountPrice" header="ราคาส่วนลด (THB)" style="min-width: 150px">
            <template #body="slotProps">
              <div class="qty-container">
                <span>{{
                  (
                    Number(slotProps.data.appraisalPrice || 0) *
                    (1 - (slotProps.data.discountPercent || 0) / 100)
                  ).toFixed(2)
                }}</span>
              </div>
            </template>
          </Column>

          <Column field="currencyRate" header="แปลงเรท" style="min-width: 100px">
            <template #body>
              <div class="qty-container">
                <span>{{ formSaleOrder.currencyRate }}</span>
              </div>
            </template>
          </Column>

          <Column
            field="priceAfterMultiply"
            :header="'ราคาแปลง (' + (formSaleOrder.currencyUnit || '') + ') '"
            style="min-width: 150px"
          >
            <template #body="slotProps">
              <div class="qty-container">
                <span>{{
                  (
                    (Number(slotProps.data.appraisalPrice || 0) *
                      (1 - (slotProps.data.discountPercent || 0) / 100)) /
                    (formSaleOrder.currencyRate || 1)
                  ).toFixed(2)
                }}</span>
              </div>
            </template>
          </Column>

          <Column field="qty" header="จำนวน" style="width: 80px">
            <template #body="slotProps">
              <div class="qty-container">
                <input
                  v-if="!slotProps.data.isConfirm && !slotProps.data.invoice"
                  v-model.number="slotProps.data.qty"
                  type="number"
                  class="form-control text-right bg-input input-bg"
                  min="0"
                  step="1"
                  @blur="onBlurQty(slotProps.data, slotProps.data.stockNumber, 'qty')"
                  @input="recalculateAll"
                  style="background-color: #b5dad4; width: 100%"
                />
                <span v-else class="confirmed-text text-right">
                  {{ slotProps.data.qty || 0 }}
                </span>
              </div>
            </template>
          </Column>

          <Column
            field="total"
            :header="'รวมราคา (' + (formSaleOrder.currencyUnit || '') + ') '"
            style="min-width: 150px"
          >
            <template #body="slotProps">
              <div class="qty-container">
                <span>{{
                  (
                    ((Number(slotProps.data.appraisalPrice || 0) *
                      (1 - (slotProps.data.discountPercent || 0) / 100)) /
                      (formSaleOrder.currencyRate || 1)) *
                    (Number(slotProps.data.qty) || 0)
                  ).toFixed(2)
                }}</span>
              </div>
            </template>
          </Column>

          <!-- Row Group Template for Invoice Number -->
          <template #groupheader="slotProps">
            <!-- สินค้าที่มี Invoice แล้ว -->
            <div
              v-if="slotProps.data.invoice"
              class="p-1"
              style="background-color: #f8f9fa; border-left: 4px solid #038387"
            >
              <span class="font-weight-bold">เลขที่ Invoice: </span>
              <a
                href="#"
                @click.prevent="openInvoiceDetail(slotProps.data.invoice)"
                class="text-primary font-weight-bold"
                style="text-decoration: underline; cursor: pointer"
              >
                {{
                  slotProps.data.dkInvoiceNumber
                    ? `${slotProps.data.invoice} ( DK No:  ${slotProps.data.dkInvoiceNumber} )`
                    : slotProps.data.invoice
                }}
              </a>
              <!-- <span class="ml-3 badge badge-success">มี Invoice แล้ว</span> -->
            </div>
            <!-- สินค้าที่ยืนยันแล้วแต่ยังไม่มี Invoice (รอออก Invoice) -->
            <div
              v-else-if="slotProps.data.isConfirm"
              class="p-1"
              style="background-color: var(--base-green); border-left: 4px solid #038387"
            >
              <span class="font-weight-bold text-white">รอออก Invoice</span>
              <!-- <span class="ml-3 badge badge-light">ยืนยันแล้ว</span> -->
            </div>
            <!-- สินค้าที่ยังไม่ได้ยืนยัน (รอยืนยันสินค้า) -->
            <div
              v-else
              class="p-1"
              style="background-color: #fff3cd; border-left: 4px solid #fabc3f"
            >
              <span class="font-weight-bold badge badge-warning">รอยืนยันสินค้า</span>
              <!-- <span class="ml-3 badge badge-warning">ยังไม่ยืนยัน</span> -->
            </div>
          </template>

          <ColumnGroup type="footer">
            <!-- total -->
            <Row>
              <Column :colspan="6">
                <template #footer>
                  <div class="text-left type-container">
                    <span class="mr-2">Net Weight Of Merchandise</span>
                    <span class="mr-2">{{ getNetWeight(stockItems) }}</span>
                    <span>gms.</span>
                  </div>
                </template>
              </Column>
              <Column :colspan="1"></Column>
              <Column>
                <template #footer>
                  <div class="text-right type-container">
                    <span>รวม</span>
                  </div>
                </template>
              </Column>
              <Column>
                <template #footer>
                  <div class="text-right type-container">
                    <span>{{ getGoldWeight(stockItems) }}</span>
                  </div>
                </template>
              </Column>
              <Column>
                <template #footer>
                  <div class="text-right type-container">
                    <span>{{ getDiamondWeight(stockItems) }}</span>
                  </div>
                </template>
              </Column>
              <Column>
                <template #footer>
                  <div class="text-right type-container">
                    <span>{{ getGemWeight(stockItems) }}</span>
                  </div>
                </template>
              </Column>
              <Column :colspan="2">
                <template #footer>
                  <div class="text-right type-container">
                    <span>{{ getSumAppraisalPrice(stockItems) }}</span>
                  </div>
                </template>
              </Column>
              <Column :colspan="2">
                <template #footer>
                  <div class="text-right type-container">
                    <span>{{ getSumDiscountPrice(stockItems) }}</span>
                  </div>
                </template>
              </Column>
              <Column :colspan="2">
                <template #footer>
                  <div class="text-right type-container">
                    <span>{{ getSumConvertedPrice(stockItems) }}</span>
                  </div>
                </template>
              </Column>
              <Column>
                <template #footer>
                  <div class="text-right type-container">
                    <span>{{ getSumQty(stockItems) }}</span>
                  </div>
                </template>
              </Column>
              <Column>
                <template #footer>
                  <div class="text-right type-container">
                    <span>{{ getSumTotalConvertedPrice(stockItems) }}</span>
                  </div>
                </template>
              </Column>
              <!-- Status column footer (empty) -->
              <Column>
                <template #footer>
                  <div class="text-center">
                    <span></span>
                  </div>
                </template>
              </Column>
            </Row>
            <!-- freight -->
            <!-- <Row>
              <Column :colspan="17">
                <template #footer>
                  <div class="text-right type-container">
                    <span>Freight & Insurance</span>
                  </div>
                </template>
              </Column>
              <Column>
                <template #footer>
                  <div class="qty-container">
                    <input
                      style="background-color: #b5dad4"
                      v-model="formSaleOrder.freight"
                      type="number"
                      class="form-control text-right bg-input input-bg"
                      step="any"
                      min="0"
                      required
                      :readonly="isViewMode"
                      @blur="onBlurFreight(formSaleOrder.freight)"
                    />
                  </div>
                </template>
              </Column>
            </Row> -->
            <!-- ส่วนลดพิเศษ -->
            <Row>
              <Column :colspan="18">
                <template #footer>
                  <div class="text-right type-container">
                    <span>ส่วนลดพิเศษ:</span>
                  </div>
                </template>
              </Column>
              <Column>
                <template #footer>
                  <div class="text-right qty-container">
                    <input
                      v-model.number="formSaleOrder.specialDiscount"
                      type="number"
                      class="form-control text-right bg-input input-bg"
                      min="0"
                      step="0.01"
                      style="background-color: #b5dad4; width: 100%"
                      :readonly="isViewMode"
                    />
                  </div>
                </template>
              </Column>
            </Row>
            <!-- ส่วนเพิ่มพิเศษ -->
            <Row>
              <Column :colspan="18">
                <template #footer>
                  <div class="text-right type-container">
                    <span>ส่วนเพิ่มพิเศษ:</span>
                  </div>
                </template>
              </Column>
              <Column>
                <template #footer>
                  <div class="text-right qty-container">
                    <input
                      v-model.number="formSaleOrder.specialAddition"
                      type="number"
                      class="form-control text-right bg-input input-bg"
                      min="0"
                      step="0.01"
                      style="background-color: #b5dad4; width: 100%"
                      :readonly="isViewMode"
                    />
                  </div>
                </template>
              </Column>
            </Row>
            <!-- ยอดรวมหลังปรับ -->
            <Row>
              <Column :colspan="18">
                <template #footer>
                  <div class="text-right type-container">
                    <span class="font-weight-bold">ยอดรวมหลังปรับ:</span>
                  </div>
                </template>
              </Column>
              <Column>
                <template #footer>
                  <div class="text-right type-container">
                    <span class="font-weight-bold">{{ formatPrice(soTotalAfterSpecial) }}</span>
                  </div>
                </template>
              </Column>
            </Row>
            <!-- freight -->
            <Row>
              <Column :colspan="18">
                <template #footer>
                  <div class="text-right type-container">
                    <span>Freight & Insurance:</span>
                  </div>
                </template>
              </Column>
              <Column>
                <template #footer>
                  <div class="qty-container">
                    <input
                      style="background-color: #b5dad4"
                      v-model.number="formSaleOrder.freight"
                      type="number"
                      class="form-control text-right bg-input input-bg"
                      step="any"
                      min="0"
                      :readonly="isViewMode"
                    />
                  </div>
                </template>
              </Column>
            </Row>
            <!-- ยอดรวมก่อน VAT -->
            <Row>
              <Column :colspan="18">
                <template #footer>
                  <div class="text-right type-container">
                    <span class="font-weight-bold">ยอดรวมก่อน VAT:</span>
                  </div>
                </template>
              </Column>
              <Column>
                <template #footer>
                  <div class="text-right type-container">
                    <span class="font-weight-bold">{{ formatPrice(soTotalBeforeVat) }}</span>
                  </div>
                </template>
              </Column>
            </Row>
            <!-- VAT -->
            <Row>
              <Column :colspan="18">
                <template #footer>
                  <div class="text-right type-container d-flex align-items-center justify-content-end">
                    <span class="mr-2 mt-1">VAT (%) :</span>
                    <input
                      v-model.number="formSaleOrder.vatPercent"
                      type="number"
                      class="form-control text-right bg-input input-bg"
                      min="0"
                      max="100"
                      step="0.01"
                      style="background-color: #b5dad4; width: 80px"
                      placeholder="0"
                      :readonly="isViewMode"
                    />
                  </div>
                </template>
              </Column>
              <Column>
                <template #footer>
                  <div class="text-right type-container">
                    <span>{{ formatPrice(soVatAmount) }}</span>
                  </div>
                </template>
              </Column>
            </Row>
            <!-- ราคารวม (Grand Total) -->
            <Row>
              <Column :colspan="18">
                <template #footer>
                  <div class="text-right type-container">
                    <span>ราคารวม</span>
                  </div>
                </template>
              </Column>
              <Column>
                <template #footer>
                  <div class="text-right type-container">
                    <span>{{ formatPrice(soGrandTotal) }}</span>
                  </div>
                </template>
              </Column>
            </Row>
          </ColumnGroup>
        </DataTable>
      </div>
    </div>

    <!-- Copy Items Table (without Stock ID - requires production) -->
    <div class="card-container mt-3" v-if="copyItems.length > 0">
      <div class="card-header">
        <h6 class="mb-0">สินค้าสำเนา (ต้องออกใบสั่งผลิตก่อน)</h6>
        <div class="card-header-actions">
          <span class="badge badge-warning">{{ copyItems.length }} รายการ</span>
        </div>
      </div>
      <div class="card-body p-0">
        <DataTable
          :value="copyItems"
          dataKey="productNumber"
          :scrollable="true"
          scrollHeight="10000000px"
          class="p-datatable-sm"
          stripedRows
          responsiveLayout="scroll"
          showGridlines
        >
          <ColumnGroup type="header">
            <Row>
              <Column header="" :colspan="2" />
              <Column header="" />
              <Column header="เลขที่ผลิต" />
              <Column header="รหัสสินค้า" />
              <Column header="รายละเอียด" />
              <Column header="Gold (gms)" />
              <Column header="Diamond (cts)" />
              <Column header="Stone (cts)" />
              <Column header="ราคาขาย (THB)" />
              <Column header="ราคาประเมิน (THB)" />
              <Column header="ส่วนลด" />
              <Column header="ราคาส่วนลด (THB)" />
              <Column header="แปลงเรท" />
              <Column :header="'ราคาแปลง (' + (formSaleOrder.currencyUnit || '') + ') '" />
              <Column header="จำนวน" />
              <Column :header="'รวมราคา (' + (formSaleOrder.currencyUnit || '') + ') '" />
            </Row>
          </ColumnGroup>

          <Column field="index" style="width: 10px">
            <template #body="slotProps">
              <span>{{ slotProps.index + 1 }}</span>
            </template>
          </Column>

          <Column field="action" style="width: 10px">
            <template #body="slotProps">
              <div class="d-flex justify-content-center align-items-center">
                <button
                  class="btn btn-sm btn-red"
                  type="button"
                  title="ลบ"
                  @click="deleteCopyItem(slotProps.index)"
                >
                  <span class="bi bi-trash"></span>
                </button>
                <button
                  class="btn btn-sm btn-main ml-2"
                  type="button"
                  title="แก้ไข"
                  @click="onEditCopyItem(slotProps.data)"
                >
                  <span class="bi bi-brush"></span>
                </button>
                <button
                  class="btn btn-sm btn-warning ml-2"
                  type="button"
                  title="สร้างใบสั่งผลิต"
                  @click="createProductionOrder(slotProps.data)"
                >
                  <span class="bi bi-tools"></span>
                </button>
              </div>
            </template>
          </Column>

          <Column field="image" header="" style="width: 50px">
            <template #body="slotProps">
              <div class="image-container">
                <div v-if="slotProps.data.imagePath">
                  <imagePreview
                    :imageName="slotProps.data.imagePath"
                    :path="slotProps.data.imagePath"
                    :type="type"
                    :width="25"
                    :height="25"
                    :emitImage="true"
                    @image-loaded="handleImageLoaded($event, slotProps.data.stockNumber)"
                  />
                </div>
              </div>
            </template>
          </Column>

          <Column field="stockNumber" header="เลขที่ผลิต" style="min-width: 150px">
            <template #body>
              <span class="text-muted font-italic">ต้องผลิต</span>
            </template>
          </Column>

          <Column field="productNumber" header="รหัสสินค้า" style="min-width: 150px">
            <template #body="slotProps">
              <div>
                <input
                  v-if="!slotProps.data.isConfirm && !slotProps.data.invoice"
                  v-model="slotProps.data.productNumber"
                  type="text"
                  class="form-control bg-input input-bg"
                  @blur="
                    onBlurDescription(slotProps.data, slotProps.data.stockNumber, 'productNumber')
                  "
                  style="background-color: #b5dad4; width: 100%"
                />
                <span v-else class="confirmed-text">
                  {{ slotProps.data.productNumber || '-' }}
                </span>
              </div>
            </template>
          </Column>

          <Column field="description" header="รายละเอียด" style="min-width: 200px">
            <template #body="slotProps">
              <input
                v-if="!slotProps.data.isConfirm && !slotProps.data.invoice"
                v-model="slotProps.data.description"
                type="text"
                class="form-control bg-input input-bg"
                @blur="onBlurDescription(slotProps.data, slotProps.data.stockNumber, 'description')"
                style="background-color: #b5dad4; width: 100%"
              />
              <span v-else class="confirmed-text">
                {{ slotProps.data.description || '-' }}
              </span>
            </template>
          </Column>

          <!-- Materials Columns like Quotation -->
          <Column field="gold" style="min-width: 120px; max-width: 300px">
            <template #body="slotProps">
              <div v-if="slotProps.data.materials">
                <div
                  v-for="(item, idx) in slotProps.data.materials.filter((m) => m.type === 'Gold')"
                  :key="idx"
                  class="material-cell"
                >
                  <div class="material-typecode-gold">
                    {{ item.typeCode }}
                  </div>
                  <div class="material-weight">
                    {{ item.weight ? item.weight.toFixed(2) : (0).toFixed(2) }}
                  </div>
                </div>
              </div>
            </template>
          </Column>

          <Column field="diamond" style="min-width: 140px; max-width: 300px">
            <template #body="slotProps">
              <div v-if="slotProps.data.materials">
                <div
                  v-for="(item, idx) in slotProps.data.materials.filter(
                    (m) => m.type === 'Diamond'
                  )"
                  :key="idx"
                  class="material-cell"
                >
                  <div class="material-typecode">
                    {{ `${item.qty ? `(${item.qty})` : ''} ${item.typeCode}` }}
                  </div>
                  <div class="material-weight">
                    {{ item.weight ? item.weight.toFixed(2) : (0).toFixed(2) }}
                  </div>
                </div>
              </div>
            </template>
          </Column>

          <Column field="gem" style="min-width: 140px; max-width: 300px">
            <template #body="slotProps">
              <div v-if="slotProps.data.materials">
                <div
                  v-for="(item, idx) in slotProps.data.materials.filter((m) => m.type === 'Gem')"
                  :key="idx"
                  class="material-cell"
                >
                  <div class="material-typecode">
                    {{ `${item.qty ? `(${item.qty})` : ''} ${item.typeCode}` }}
                  </div>
                  <div class="material-weight">
                    {{ item.weight ? item.weight.toFixed(2) : (0).toFixed(2) }}
                  </div>
                </div>
              </div>
            </template>
          </Column>

          <Column field="priceOrigin" header="ราคาขาย (THB)" style="min-width: 150px">
            <template #body="slotProps">
              <div class="qty-container">
                <span>{{
                  Number(slotProps.data.priceOrigin || slotProps.data.price || 0).toFixed(2)
                }}</span>
              </div>
            </template>
          </Column>

          <Column field="appraisalPrice" header="ราคาประเมิน (THB)" style="min-width: 150px">
            <template #body="slotProps">
              <div class="qty-container">
                <input
                  v-if="!slotProps.data.isConfirm && !slotProps.data.invoice"
                  v-model.number="slotProps.data.appraisalPrice"
                  type="number"
                  class="form-control text-right bg-input input-bg"
                  min="0"
                  step="any"
                  @blur="
                    onBlurCopyPrice(slotProps.data, slotProps.data.stockNumber, 'appraisalPrice')
                  "
                  @input="recalculateAll"
                  style="background-color: #b5dad4; width: 100%"
                />
                <span v-else class="confirmed-text text-right">
                  {{ (Number(slotProps.data.appraisalPrice) || 0).toFixed(2) }}
                </span>
              </div>
            </template>
          </Column>

          <Column field="discountPercent" header="ส่วนลด (%)" style="min-width: 100px">
            <template #body="slotProps">
              <div class="qty-container">
                <input
                  v-if="!slotProps.data.isConfirm && !slotProps.data.invoice"
                  v-model.number="slotProps.data.discountPercent"
                  type="number"
                  class="form-control text-right bg-input input-bg"
                  min="0"
                  max="100"
                  step="any"
                  @blur="
                    onBlurCopyPrice(slotProps.data, slotProps.data.stockNumber, 'discountPercent')
                  "
                  @input="recalculateAll"
                  style="background-color: #b5dad4; width: 100%"
                  placeholder="0"
                />
                <span v-else class="confirmed-text text-right">
                  {{ (slotProps.data.discountPercent || 0).toFixed(2) }}%
                </span>
              </div>
            </template>
          </Column>

          <Column field="discountPrice" header="ราคาส่วนลด (THB)" style="min-width: 150px">
            <template #body="slotProps">
              <div class="qty-container">
                <span>{{
                  (
                    Number(slotProps.data.appraisalPrice || 0) *
                    (1 - (slotProps.data.discountPercent || 0) / 100)
                  ).toFixed(2)
                }}</span>
              </div>
            </template>
          </Column>

          <Column field="currencyRate" header="แปลงเรท" style="min-width: 100px">
            <template #body>
              <div class="qty-container">
                <span>{{ formSaleOrder.currencyRate }}</span>
              </div>
            </template>
          </Column>

          <Column
            field="priceAfterMultiply"
            :header="'ราคาแปลง (' + (formSaleOrder.currencyUnit || '') + ') '"
            style="min-width: 150px"
          >
            <template #body="slotProps">
              <div class="qty-container">
                <span>{{
                  (
                    (Number(slotProps.data.appraisalPrice || 0) *
                      (1 - (slotProps.data.discountPercent || 0) / 100)) /
                    (formSaleOrder.currencyRate || 1)
                  ).toFixed(2)
                }}</span>
              </div>
            </template>
          </Column>

          <Column field="qty" header="จำนวน" style="width: 80px">
            <template #body="slotProps">
              <div class="qty-container">
                <input
                  v-model.number="slotProps.data.qty"
                  type="number"
                  class="form-control text-right bg-input input-bg"
                  min="0"
                  step="1"
                  @blur="onBlurCopyQty(slotProps.data, slotProps.data.stockNumber, 'qty')"
                  @input="recalculateAll"
                  style="background-color: #b5dad4; width: 100%"
                />
              </div>
            </template>
          </Column>

          <Column
            field="total"
            :header="'รวมราคา (' + (formSaleOrder.currencyUnit || '') + ') '"
            style="min-width: 150px"
          >
            <template #body="slotProps">
              <div class="qty-container">
                <span>{{
                  (
                    ((Number(slotProps.data.appraisalPrice || 0) *
                      (1 - (slotProps.data.discountPercent || 0) / 100)) /
                      (formSaleOrder.currencyRate || 1)) *
                    (Number(slotProps.data.qty) || 0)
                  ).toFixed(2)
                }}</span>
              </div>
            </template>
          </Column>

          <ColumnGroup type="footer">
            <!-- total -->
            <Row>
              <Column :colspan="5">
                <template #footer>
                  <div class="text-left type-container">
                    <span class="mr-2">Net Weight Of Merchandise</span>
                    <span class="mr-2">{{ getNetWeight(copyItems) }}</span>
                    <span>gms.</span>
                  </div>
                </template>
              </Column>
              <Column>
                <template #footer>
                  <div class="text-right type-container">
                    <span>รวม</span>
                  </div>
                </template>
              </Column>
              <Column>
                <template #footer>
                  <div class="text-right type-container">
                    <span>{{ getGoldWeight(copyItems) }}</span>
                  </div>
                </template>
              </Column>
              <Column>
                <template #footer>
                  <div class="text-right type-container">
                    <span>{{ getDiamondWeight(copyItems) }}</span>
                  </div>
                </template>
              </Column>
              <Column>
                <template #footer>
                  <div class="text-right type-container">
                    <span>{{ getGemWeight(copyItems) }}</span>
                  </div>
                </template>
              </Column>
              <Column :colspan="2">
                <template #footer>
                  <div class="text-right type-container">
                    <span>{{ getSumAppraisalPrice(copyItems) }}</span>
                  </div>
                </template>
              </Column>
              <Column :colspan="2">
                <template #footer>
                  <div class="text-right type-container">
                    <span>{{ getSumDiscountPrice(copyItems) }}</span>
                  </div>
                </template>
              </Column>
              <Column :colspan="2">
                <template #footer>
                  <div class="text-right type-container">
                    <span>{{ getSumConvertedPrice(copyItems) }}</span>
                  </div>
                </template>
              </Column>
              <Column>
                <template #footer>
                  <div class="text-right type-container">
                    <span>{{ getSumQty(copyItems) }}</span>
                  </div>
                </template>
              </Column>
              <Column>
                <template #footer>
                  <div class="text-right type-container">
                    <span>{{ getSumTotalConvertedPrice(copyItems) }}</span>
                  </div>
                </template>
              </Column>
            </Row>
            <!-- total after discount -->
            <Row>
              <Column :colspan="16">
                <template #footer>
                  <div class="text-right type-container">
                    <span>ราคารวม (สินค้าสำเนา)</span>
                  </div>
                </template>
              </Column>
              <Column>
                <template #footer>
                  <div class="text-right type-container">
                    <span>{{ formatPrice(calculateCopyTotal()) }}</span>
                  </div>
                </template>
              </Column>
            </Row>
          </ColumnGroup>
        </DataTable>
      </div>
    </div>

    <!-- Order Summary -->
    <div class="card-container mt-3">
      <div class="card-header">
        <h6 class="mb-0">สรุปใบสั่งขาย</h6>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-3">
            <!-- Invoice Items Summary -->
            <div class="summary-section">
              <h6 class="text-success">
                <i class="bi bi-receipt-cutoff mr-1"></i>สินค้ามี Invoice
              </h6>
              <div class="summary-item">
                <span>จำนวน:</span>
                <span class="font-weight-bold text-success">{{ invoiceItemsCount }} รายการ</span>
              </div>
              <div class="summary-item">
                <span>ยอดรวม:</span>
                <span class="font-weight-bold text-success">{{
                  formatCurrency(invoiceItemsTotal)
                }}</span>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <!-- Confirmed Items Summary -->
            <div class="summary-section">
              <h6 class="text-primary"><i class="bi bi-check-circle mr-1"></i>สินค้ายืนยันแล้ว</h6>
              <div class="summary-item">
                <span>จำนวน:</span>
                <span class="font-weight-bold text-primary">{{ confirmedItemsCount }} รายการ</span>
              </div>
              <div class="summary-item">
                <span>ยอดรวม:</span>
                <span class="font-weight-bold text-primary">{{
                  formatCurrency(confirmedItemsTotal)
                }}</span>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <!-- Pending Confirmation Items Summary -->
            <div class="summary-section">
              <h6 class="text-warning"><i class="bi bi-clock-history mr-1"></i>สินค้ารอยืนยัน</h6>
              <div class="summary-item">
                <span>จำนวน:</span>
                <span class="font-weight-bold text-warning">{{ pendingItemsCount }} รายการ</span>
              </div>
              <div class="summary-item">
                <span>ยอดรวม:</span>
                <span class="font-weight-bold text-warning">{{
                  formatCurrency(pendingItemsTotal)
                }}</span>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <!-- Production Items Summary -->
            <div class="summary-section">
              <h6 class="text-info"><i class="bi bi-tools mr-1"></i>สินค้ารอสั่งผลิต</h6>
              <div class="summary-item">
                <span>จำนวน:</span>
                <span class="font-weight-bold text-info">{{ productionItemsCount }} รายการ</span>
              </div>
              <div class="summary-item">
                <span>ยอดรวม:</span>
                <span class="font-weight-bold text-info">{{
                  formatCurrency(productionItemsTotal)
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Grand Total Row -->
        <div class="row mt-3">
          <div class="col-md-12">
            <div class="summary-section border-top pt-3">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="mb-1">รวมทั้งหมด</h6>
                  <small class="text-muted">{{ selectedItemsCount }} รายการ</small>
                </div>
                <div class="text-right">
                  <div class="mb-1">
                    <span class="mr-2">ยอดรวมสินค้า:</span>
                    <span class="font-weight-bold">{{ formatCurrency(selectedItemsTotal) }}</span>
                  </div>
                  <div class="mb-1">
                    <span class="mr-2">ค่าขนส่ง:</span>
                    <span class="font-weight-bold">{{
                      formatCurrency(formSaleOrder.freight || 0)
                    }}</span>
                  </div>
                  <div class="border-top pt-2 mt-2">
                    <span class="h6 mr-2">ยอดรวมใบสั่งขาย:</span>
                    <span class="h5 font-weight-bold text-primary">{{
                      formatCurrency(totalOrderAmount)
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Notes -->
        <div class="row mt-3">
          <div class="col-md-12">
            <div>
              <span class="title-text">หมายเหตุใบสั่งขาย</span>
              <textarea
                class="form-control"
                rows="3"
                v-model="formSaleOrder.remark"
                placeholder="หมายเหตุเพิ่มเติมสำหรับใบสั่งขาย..."
                :readonly="isViewMode"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Validation Messages -->
        <div class="row mt-3" v-if="validationErrors.length > 0">
          <div class="col-md-12">
            <div class="alert alert-warning">
              <h6><i class="bi bi-exclamation-triangle mr-2"></i>ข้อควรระวัง:</h6>
              <ul class="mb-0">
                <li v-for="error in validationErrors" :key="error">{{ error }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="mt-4 pb-2">
      <!-- Edit Mode Buttons (hidden in view mode) -->

      <div v-if="!isViewMode" class="form-col-container">
        <div class="d-flex justify-content-start align-items-center">
          <button class="btn btn-outline-main mr-2" type="button" style="width: 200px">
            <i class="bi bi-trash mr-1"></i>
            ลบใบสั่งขาย
          </button>
        </div>
        <div class="d-flex justify-content-end align-items-center">
          <button
            class="btn btn-green mr-2"
            type="button"
            style="width: 200px"
            @click="openConfirmStockModal"
            :disabled="
              selectedItemsCount === 0 ||
              hasValidationErrors ||
              pendingConfirmationStockItemsCount === 0 ||
              !hasSaleOrderNumber
            "
          >
            <i class="bi bi-check-square mr-1"></i>
            ยืนยันการขาย
            <span v-if="pendingConfirmationStockItemsCount > 0" class="badge badge-warning ml-1">
              {{ pendingConfirmationStockItemsCount }}
            </span>
          </button>

          <button
            class="btn btn-green mr-2"
            type="button"
            style="width: 200px"
            @click="openInvoiceModal"
            :disabled="
              selectedItemsCount === 0 || hasValidationErrors || confirmedStockItemsCount === 0
            "
          >
            <i class="bi bi-receipt mr-1"></i>
            Invoice
            <span v-if="pendingInvoiceStockItemsCount > 0" class="badge badge-warning ml-1">
              {{ pendingInvoiceStockItemsCount }}
            </span>
          </button>

          <button
            class="btn btn-outline-main mr-2"
            type="button"
            style="width: 200px"
            @click="saveDraft"
            :disabled="selectedItemsCount === 0"
          >
            <span v-if="isOnDraft" class="spinner-border spinner-border-sm mr-2"></span>
            <i class="bi bi-file-earmark mr-1"></i>
            บันทึกร่าง
          </button>

          <div class="d-flex align-items-center" style="gap: 8px">
            <button
              class="btn btn-outline-main"
              type="button"
              style="width: 200px"
              @click="exportPDF"
              :disabled="stockItems.length === 0 || isExportingPDF"
            >
              <span v-if="isExportingPDF" class="spinner-border spinner-border-sm mr-2"></span>
              <i v-else class="bi bi-file-earmark-pdf mr-1"></i>
              Export PDF
            </button>
            <div
              class="d-flex align-items-center"
              style="gap: 4px; cursor: pointer; white-space: nowrap"
              @click="pdfShowCifLabel = !pdfShowCifLabel"
            >
              <input
                type="checkbox"
                v-model="pdfShowCifLabel"
                style="width: 14px; height: 14px; cursor: pointer"
              />
              <span style="font-size: 0.8rem; color: #555; cursor: pointer">C.I.F</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Back to List Button (visible in view mode) -->
      <button v-if="isViewMode" class="btn btn-secondary mr-2" type="button" @click="backToList">
        <i class="bi bi-arrow-left mr-1"></i>
        กลับรายการ
      </button>
    </div>
  </div>

  <!-- Edit Stock Modal -->
  <edit-stock-view
    :isShow="isShow.isEditStock"
    :modelStock="modelEditStock"
    @closeModal="onCloseEditStockModal"
  />

  <!-- Customer Modals -->
  <CustomerSearchModal
    :showModal="isShow.searchCustomer"
    @closeModal="onCloseCustomerModal"
    @customerSelected="onCustomerSelected"
  />

  <CustomerCreateModal
    :showModal="isShow.createCustomer"
    @closeModal="onCloseCustomerModal"
    @customerCreated="onCustomerCreated"
  />

  <!-- Confirm Stock Modal -->
  <ConfirmStockModal
    :isShowModal="isShow.confirmStockModal"
    :saleOrderData="formSaleOrder"
    :stockItems="stockItemsForInvoice"
    @close-modal="onCloseConfirmStockModal"
    @items-confirmed="onStockItemsConfirmed"
    @save-draft="saveDraft"
  />

  <!-- Invoice Modal -->
  <SaleOrderInvoiceModal
    :isShowModal="isShow.invoiceModal"
    :saleOrderData="formSaleOrder"
    :stockItems="confirmedStockItemsOnly"
    @close-modal="onCloseInvoiceModal"
    @invoice-created="onInvoiceCreated"
  />
</template>

<script>
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ColumnGroup from 'primevue/columngroup'
import Row from 'primevue/row'
import Calendar from 'primevue/calendar'
import Dropdown from 'primevue/dropdown'
import imagePreview from '@/components/prime-vue/ImagePreviewEmit.vue'
import editStockView from '@/views/sale/quotation/modal/edit-stock-view.vue'
import CustomerSearchModal from '@/views/sale/quotation/modal/customer-search-modal.vue'
import CustomerCreateModal from '@/views/sale/quotation/modal/customer-create-modal.vue'
import SaleOrderInvoiceModal from '../modal/invoice-modal.vue'
import ConfirmStockModal from '../modal/confirm-stock-modal.vue'
import { formatDecimal } from '@/services/utils/decimal.js'
import { success, error, warning, confirmSubmit } from '@/services/alert/sweetAlerts.js'
import { formatISOString } from '@/services/utils/dayjs.js'

import { SaleOrderPdfBuilder } from '@/services/helper/pdf/sale-order/sale-order-pdf-builder.js'
import { usrSaleOrderApiStore } from '@/stores/modules/api/sale/sale-order-store.js'
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'

export default {
  name: 'SaleOrderView',

  components: {
    DataTable,
    Column,
    ColumnGroup,
    Row,
    Calendar,
    Dropdown,
    SaleOrderInvoiceModal,
    ConfirmStockModal,
    imagePreview,
    editStockView,
    CustomerSearchModal,
    CustomerCreateModal
  },

  setup() {
    const productStore = usrStockProductApiStore()
    const saleOrderStore = usrSaleOrderApiStore()
    return { saleOrderStore, productStore }
  },

  emits: ['update:modelForm', 'update:modelQuotation', 'update:modelSaleOrder'],

  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    },
    modelQuotation: {
      type: Object,
      default: () => ({})
    },
    modelSaleOrder: {
      type: Object,
      default: () => ({})
    },
    isViewMode: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      isSONumberLocked: false,
      isOnDraft: false,
      isExportingPDF: false,
      pdfShowCifLabel: true,
      productSearch: {
        stockNumber: '',
        stockNumberOrigin: '',
        productNumber: ''
      },
      stockItems: [],
      copyItems: [],
      type: 'STOCK-PRODUCT',
      isLoadingData: false,

      // Modal states
      isShow: {
        isEditStock: false,
        searchCustomer: false,
        createCustomer: false,
        invoiceModal: false,
        confirmStockModal: false
      },
      modelEditStock: {},
      editStockNumber: null,
      overallDiscountPercent: 0,

      formSaleOrder: {
        salesOrderId: null,
        quotationId: null,
        customerId: null,
        customerName: '',
        customerAddress: '',
        customerPhone: '',
        customerEmail: '',
        number: '',
        date: new Date(),
        expectedDeliveryDate: null,
        quotationNumber: '',
        depositRequired: false,
        priority: 'normal',
        totalAmount: 0,
        remark: '',
        customerRemark: '',
        currencyUnit: 'US$',
        currencyRate: 33.0,
        markup: 3.5,
        goldPerOz: 2000,
        freight: 0,
        copyFreight: 0,
        specialDiscount: 0,
        specialAddition: 0,
        vatPercent: 0
      },

      priorityOptions: [
        { name: 'ปกติ', value: 'normal', id: 1 },
        { name: 'สำคัญ', value: 'high', id: 2 },
        { name: 'เร่งด่วน', value: 'urgent', id: 3 },
        { name: 'วิกฤต', value: 'critical', id: 4 }
      ]
    }
  },

  computed: {
    stockItemsWithGrouping() {
      return this.stockItems
        .map((item) => {
          let groupKey = ''
          let sortOrder = 0

          if (item.invoice) {
            groupKey = `invoice_${item.invoice}`
            sortOrder = 1
          } else if (item.isConfirm) {
            groupKey = 'confirmed_pending_invoice'
            sortOrder = 2
          } else {
            groupKey = 'pending_confirmation'
            sortOrder = 3
          }

          return {
            ...item,
            groupKey,
            sortOrder
          }
        })
        .sort((a, b) => {
          if (a.sortOrder !== b.sortOrder) {
            return a.sortOrder - b.sortOrder
          }

          if (a.invoice && b.invoice) {
            return a.invoice.localeCompare(b.invoice)
          }

          return 0
        })
    },

    hasQuotationData() {
      return this.stockItems.length > 0 || this.copyItems.length > 0
    },

    selectedItemsCount() {
      return this.stockItems.length + this.copyItems.length
    },

    selectedStockItemsCount() {
      return this.stockItems.length
    },

    selectedProductionItemsCount() {
      return this.copyItems.length
    },

    stockItemsForInvoice() {
      return this.stockItems.map((item, index) => ({
        ...item,
        //id: item.id || `stock_${index}_${Date.now()}`,
        isConfirm: item.isConfirm || false
      }))
    },

    confirmedStockItemsOnly() {
      return this.stockItems.filter((item) => item.isConfirm && !item.isInvoice)
    },

    confirmedStockItemsCount() {
      return this.confirmedStockItemsOnly.length
    },

    pendingConfirmationStockItems() {
      return this.stockItemsForInvoice.filter((item) => !item.isConfirm && item.isRemainProduct)
    },

    pendingConfirmationStockItemsCount() {
      return this.pendingConfirmationStockItems.length
    },

    pendingInvoiceStockItems() {
      return this.stockItemsForInvoice.filter((item) => item.isConfirm && !item.invoice)
    },
    pendingInvoiceStockItemsCount() {
      return this.pendingInvoiceStockItems.length
    },

    selectedItemsTotal() {
      const stockTotal = this.stockItems.reduce(
        (sum, item) => sum + this.getTotalConvertedPrice(item),
        0
      )
      const copyTotal = this.copyItems.reduce(
        (sum, item) => sum + this.getTotalConvertedPrice(item),
        0
      )
      return stockTotal + copyTotal
    },

    stockItemsTotal() {
      return this.stockItems.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 0), 0)
    },

    productionItemsTotal() {
      return this.copyItems.reduce((sum, item) => sum + this.getTotalConvertedPrice(item), 0)
    },

    // Summary by status - Invoice Items
    invoiceItems() {
      return this.stockItems.filter((item) => item.invoice)
    },

    invoiceItemsCount() {
      return this.invoiceItems.length
    },

    invoiceItemsTotal() {
      return this.invoiceItems.reduce((sum, item) => sum + this.getTotalConvertedPrice(item), 0)
    },

    // Summary by status - Confirmed Items (no invoice yet)
    confirmedItems() {
      return this.stockItems.filter((item) => item.isConfirm && !item.invoice)
    },

    confirmedItemsCount() {
      return this.confirmedItems.length
    },

    confirmedItemsTotal() {
      return this.confirmedItems.reduce((sum, item) => sum + this.getTotalConvertedPrice(item), 0)
    },

    // Summary by status - Pending Confirmation Items
    pendingItems() {
      return this.stockItems.filter(
        (item) => !item.isConfirm && !item.invoice && item.isRemainProduct
      )
    },

    pendingItemsCount() {
      return this.pendingItems.length
    },

    pendingItemsTotal() {
      return this.pendingItems.reduce((sum, item) => sum + this.getTotalConvertedPrice(item), 0)
    },

    // Summary by status - Production Items (Copy Items)
    productionItemsCount() {
      return this.copyItems.length
    },

    totalOrderAmount() {
      return this.selectedItemsTotal + (Number(this.formSaleOrder.freight) || 0)
    },

    validationErrors() {
      const errors = []

      if (!this.hasQuotationData) {
        errors.push('กรุณาเลือกใบเสนอราคาก่อน')
      }

      return errors
    },

    hasValidationErrors() {
      return this.validationErrors.length > 0
    },

    hasSaleOrderNumber() {
      //return this.formSaleOrder.number === null
      //return this.formSaleOrder.number && this.formSaleOrder.number.trim() !== ''
      //เช็คว่าเคยมีเลขที่ใบสั่งขายหรือไม่
      return this.formSaleOrder.number != null && this.formSaleOrder.number !== ''
    },

    soTotalAfterSpecial() {
      const total = Number(this.getSumTotalConvertedPrice(this.stockItems)) || 0
      return total - (this.formSaleOrder.specialDiscount || 0) + (this.formSaleOrder.specialAddition || 0)
    },
    soTotalBeforeVat() {
      return this.soTotalAfterSpecial + Number(this.formSaleOrder.freight || 0)
    },
    soVatAmount() {
      return this.soTotalBeforeVat * ((this.formSaleOrder.vatPercent || 0) / 100)
    },
    soGrandTotal() {
      return this.soTotalBeforeVat + this.soVatAmount
    }
  },

  watch: {
    modelForm: {
      handler(newVal) {
        if (newVal && Object.keys(newVal).length > 0) {
          this.handleProductSearch(newVal)
        }
      },
      deep: true
    },

    modelQuotation: {
      handler(newVal) {
        if (newVal && newVal.Number) {
          this.handleQuotationSearch(newVal)
        }
      },
      deep: true
    },

    modelSaleOrder: {
      handler(newVal) {
        if (this.isLoadingData) return

        if (newVal && Object.keys(newVal).length > 0) {
          if (newVal.items && Array.isArray(newVal.items) && newVal.items.length > 0) {
            this.loadQuotationData(newVal)
          } else if (newVal.number || newVal.customer || newVal.currencyUnit) {
            this.loadSaleOrderData(newVal)
          }
        }
      },
      deep: true,
      immediate: true
    }
  },

  methods: {
    // ============================================
    // DATA LOADING METHODS
    // ============================================

    loadQuotationData(saleOrderData) {
      if (!saleOrderData || !saleOrderData.items) return

      this.isLoadingData = true

      const newStockItems = saleOrderData.items.filter((item) => item.stockNumber != null)
      const newCopyItems = saleOrderData.items.filter((item) => item.stockNumber == null)

      this.formSaleOrder = {
        ...this.formSaleOrder,
        quotationNumber: saleOrderData.quotationNumber,
        customerName: saleOrderData.customer?.name || '',
        customerAddress: saleOrderData.customer?.address || '',
        customerPhone: saleOrderData.customer?.phone || '',
        customerEmail: saleOrderData.customer?.email || '',
        freight: saleOrderData.freight || 0,
        currencyUnit: saleOrderData.currencyUnit || 'US$',
        currencyRate: saleOrderData.currencyRate || 33.0,
        markup: saleOrderData.markup || 3.5,
        goldPerOz: saleOrderData.goldPerOz || 2000,
        number: null,
        specialDiscount: saleOrderData.specialDiscount || 0,
        specialAddition: saleOrderData.specialAddition || 0,
        vatPercent: saleOrderData.vatPercent || 0
      }

      newStockItems.forEach((item) => {
        if (!item.appraisalPrice) {
          item.appraisalPrice = item.price || 0
        }
      })
      newCopyItems.forEach((item) => {
        if (!item.appraisalPrice) {
          item.appraisalPrice = item.price || 0
        }
      })

      this.stockItems = newStockItems
      this.copyItems = newCopyItems

      this.$nextTick(() => {
        this.isLoadingData = false
      })
    },

    loadSaleOrderData(saleOrderData) {
      if (!saleOrderData) return

      this.isLoadingData = true

      //////console.log('Loading sale order data:', saleOrderData)

      Object.assign(this.formSaleOrder, {
        number: saleOrderData.number || '',
        date: saleOrderData.date || new Date(),
        expectedDeliveryDate: saleOrderData.expectedDeliveryDate || null,
        quotationNumber: saleOrderData.quotationNumber || '',
        depositRequired: saleOrderData.depositRequired || false,
        priority: saleOrderData.priority || 'normal',
        remark: saleOrderData.remark || '',
        customerRemark: saleOrderData.customer?.remark || '',

        customerCode: saleOrderData.customer?.code || '',
        customerName: saleOrderData.customer?.name || '',
        customerAddress: saleOrderData.customer?.address || '',
        customerPhone: saleOrderData.customer?.phone || '',
        customerEmail: saleOrderData.customer?.email || '',

        currencyUnit: saleOrderData.currencyUnit || 'US$',
        currencyRate: saleOrderData.currencyRate || 33.0,
        markup: saleOrderData.markup || 3.5,
        goldPerOz: saleOrderData.goldPerOz || 2000,
        freight: saleOrderData.freight || 0,
        copyFreight: saleOrderData.copyFreight || 0,
        specialDiscount: saleOrderData.specialDiscount || 0,
        specialAddition: saleOrderData.specialAddition || 0,
        vatPercent: saleOrderData.vatPercent || 0
      })

      if (saleOrderData.items) {
        if (saleOrderData.items.stockItems || saleOrderData.items.copyItems) {
          this.stockItems = saleOrderData.items.stockItems || []
          this.copyItems = saleOrderData.items.copyItems || []
        } else if (Array.isArray(saleOrderData.items)) {
          this.stockItems = saleOrderData.items.filter((item) => item.stockNumber != null)
          this.copyItems = saleOrderData.items.filter((item) => item.stockNumber == null)
        } else if (Array.isArray(saleOrderData.items.allItems)) {
          this.stockItems = saleOrderData.items.allItems.filter((item) => item.stockNumber != null)
          this.copyItems = saleOrderData.items.allItems.filter((item) => item.stockNumber == null)
        }
      }

      //////console.log('saleOrderData.confirmedItems', saleOrderData)
      //////console.log('saleOrderData.confirmedItems', saleOrderData.confirmedItems)

      this.stockItems.forEach((item) => {
        item.isConfirm = false
        item.isInvoice = false
        item.invoice = null
        item.invoiceItem = null
        item.dkInvoiceNumber = null

        const confirmedItem = saleOrderData.confirmedItems.find(
          (ci) => ci.stockNumber === item.stockNumber
        )

        if (confirmedItem) {
          item.id = confirmedItem.id
          item.stockNumber = confirmedItem.stockNumber

          item.isConfirm = confirmedItem.isConfirm
          item.invoiceItem = confirmedItem.invoiceItem
          item.dkInvoiceNumber = confirmedItem.dkInvoiceNumber
          item.isInvoice = confirmedItem.isInvoice
          item.invoice = confirmedItem.invoice

          if (confirmedItem.isConfirm) {
            item.appraisalPrice = confirmedItem.priceOrigin
            item.discountPercent = confirmedItem.discount
            item.qty = confirmedItem.qty
          }
          //item.discountPercent = confirmedItem.discount || 0

          item.isRemainProduct = confirmedItem.isRemainProduct
          item.message = confirmedItem.message
        }
      })

      this.$nextTick(() => {
        this.isLoadingData = false
      })
      ////console.log('get sale order stock items', this.stockItems)
    },

    async getSaleOrderData(soNumber) {
      const response = await this.saleOrderStore.fetchGet({
        formValue: { soNumber: soNumber }
      })

      let saleOrderData = {}

      if (response) {
        saleOrderData = {
          ...response,
          number: soNumber || '',
          date: response.createDate ? new Date(response.createDate) : new Date(),
          expectedDeliveryDate: response.deliveryDate ? new Date(response.deliveryDate) : null,
          quotationNumber: response.refQuotation || null,
          depositRequired: response.depositPercent ? true : false,
          priority: response.priority || 'normal',
          discount: response.discount || 0,
          freight: response.freight || 0,
          specialDiscount: response.specialDiscount || 0,
          specialAddition: response.specialAddition || 0,
          vatPercent: response.vat || 0,
          remark: response.remark || null,
          items: response.data
            ? (() => {
                try {
                  const parsedData = JSON.parse(response.data)
                  return parsedData
                } catch (e) {
                  //console.error('Error parsing data:', e)
                  return []
                }
              })()
            : [],
          confirmedItems: response.stockConfirm || [],
          currencyUnit: response.currencyUnit || 'US$',
          currencyRate: response.currencyRate || 33.0,
          markup: response.markup || 3.5,
          goldPerOz: response.goldRate || 2000,
          customer: {
            code: response.customerCode || '',
            name: response.customerName || '',
            address: response.customerAddress || '',
            phone: response.customerTel || '',
            email: response.customerEmail || '',
            remark: response.customerRemark || ''
          }
        }
      }

      //console.log('get new saleOrderData', saleOrderData)
      return saleOrderData
    },

    async handleQuotationSearch(quotationData) {
      this.formSaleOrder.quotationNumber = quotationData.Number
      await this.loadQuotationDataFromAPI()
    },

    loadQuotationDataFromAPI() {},

    handleProductSearch() {},

    // ============================================
    // CUSTOMER MANAGEMENT METHODS
    // ============================================

    onSearchCustomer() {
      this.isShow.searchCustomer = true
    },

    onCustomerSelected(customerData) {
      //console.log('Selected customer data:', customerData)
      this.formSaleOrder = {
        ...this.formSaleOrder,
        customerCode: customerData.code,
        customerName: customerData.nameTh || customerData.nameEn,
        customerAddress: customerData.address,
        customerPhone: customerData.telephone1,
        customerEmail: customerData.email,
        customerId: customerData.id
      }
      this.isShow.searchCustomer = false
    },

    onCustomerCreated(customerData) {
      this.formSaleOrder = {
        ...this.formSaleOrder,
        customerName: customerData.nameTh || customerData.nameEn || '',
        customerAddress: customerData.address || '',
        customerPhone: customerData.telephone1 || '',
        customerEmail: customerData.email || '',
        customerId: customerData.id
      }
      this.isShow.createCustomer = false
    },

    onCloseCustomerModal() {
      this.isShow.searchCustomer = false
      this.isShow.createCustomer = false
    },

    // ============================================
    // ITEM MANAGEMENT METHODS
    // ============================================

    async onSearchProduct() {
      ////console.log('Searching product with', this.productSearch)
      var data = await this.productStore.fetchDataGet({
        formValue: this.productSearch
      })

      if (data) {
        data = {
          ...data,
          price: data.productPrice ? Number(data.productPrice).toFixed(2) : 0,
          appraisalPrice: data.productPrice ? Number(data.productPrice).toFixed(2) : 0,
          description: data.productNameEn,
          group: 'product',
          planQty: data.planQty || 1,
          stockNumberOrigin: data.stockNumberOrigin || data.stockNumber,
          isRemainProduct: true,
          isConfirm: false,
          isInvoice: false
        }
      }

      if (data.stockNumber) {
        //check duplicate before push
        const existingIndex = this.stockItems.findIndex(
          (item) => item.stockNumber === data.stockNumber
        )
        if (existingIndex !== -1) {
          warning(`สินค้าหมายเลข ${data.stockNumber} มีอยู่ในรายการแล้ว`)
        } else {
          this.stockItems.push(data)
          this.recalculateAll()
        }
      }

      this.productSearch = {
        stockNumber: '',
        stockNumberOrigin: '',
        productNumber: ''
      }
    },

    deleteStockItem(stockNumber) {
      //this.stockItems.splice(index, 1)
      //////console.log('Deleting stock item', stockNumber)
      this.stockItems = this.stockItems.filter(
        (item) => item.stockNumber !== stockNumber.stockNumber
      )
      this.recalculateAll()
    },

    deleteCopyItem(index) {
      this.copyItems.splice(index, 1)
      this.recalculateAll()
    },

    onEditStock(item) {
      this.modelEditStock = JSON.parse(JSON.stringify(item))
      this.editStockNumber = item.stockNumber
      this.isShow.isEditStock = true
    },

    onEditCopyItem(item) {
      this.modelEditStock = JSON.parse(JSON.stringify(item))
      this.editStockNumber = item.stockNumber
      this.isShow.isEditStock = true
    },

    onCloseEditStockModal(payload) {
      this.isShow.isEditStock = false
      if (payload && payload.action === 'save' && payload.data) {
        const realIndex = this.stockItems.findIndex((i) => i.stockNumber === this.editStockNumber)
        if (realIndex !== -1) {
          this.stockItems[realIndex] = JSON.parse(JSON.stringify(payload.data))

          if (payload.data.priceDiscount !== undefined && payload.data.priceDiscount !== null) {
            this.stockItems[realIndex].discountPrice = payload.data.priceDiscount
          }
        }
      }
      this.modelEditStock = {}
      this.editStockNumber = null
    },

    handleImageLoaded(imageData, stockNumber) {
      const realIndex = this.stockItems.findIndex((i) => i.stockNumber === stockNumber)
      if (realIndex !== -1) {
        this.stockItems[realIndex] = {
          ...this.stockItems[realIndex],
          imageBlobPath: imageData.blobPath // เก็บ blobPath แทน base64
        }
      }
    },

    // ============================================
    // MODAL CONTROL METHODS
    // ============================================

    async openConfirmStockModal() {
      if (this.stockItems.length === 0) {
        warning('ไม่พบสินค้าสำหรับยืนยันการขาย')
        return
      }

      await this.fetchSaveSaleOrder('Draft')

      this.isShow.confirmStockModal = true
    },

    onCloseConfirmStockModal() {
      this.isShow.confirmStockModal = false
    },

    async onStockItemsConfirmed() {
      if (this.formSaleOrder.number) {
        const response = await this.getSaleOrderData(this.formSaleOrder.number)

        if (response) {
          this.loadSaleOrderData(response)
        }
      }
    },

    openInvoiceModal() {
      if (this.confirmedStockItemsCount === 0) {
        warning('กรุณายืนยันสินค้าก่อนออก Invoice')
        return
      }

      if (this.stockItems.length === 0) {
        warning('ไม่พบสินค้าสำหรับออก Invoice')
        return
      }

      this.isShow.invoiceModal = true
    },

    onCloseInvoiceModal() {
      this.isShow.invoiceModal = false
    },

    async onInvoiceCreated(invoiceData) {
      this.isShow.invoiceModal = false

      success(`เลขที่ Invoice: ${invoiceData.invoiceNumber}`, 'Invoice ถูกสร้างเรียบร้อยแล้ว')

      if (this.formSaleOrder.number) {
        const response = await this.getSaleOrderData(this.formSaleOrder.number)

        if (response) {
          this.loadSaleOrderData(response)
        }
      }
    },

    openInvoiceDetail(invoiceNumber) {
      this.$router.push({
        path: '/invoice-detail',
        query: { invoiceNumber: invoiceNumber }
      })
    },

    // ============================================
    // ACTION METHODS
    // ============================================

    async saveDraft() {
      await this.fetchSaveSaleOrder('Draft')
      this.isSONumberLocked = true
    },

    async fetchSaveSaleOrder() {
      this.isOnDraft = true

      const stockItemsData = this.stockItems.map((item) => {
        return {
          ...item,
          imageBlobPath: null // ไม่เก็บ blob path ลง database
        }
      })

      const copyItemsData = this.copyItems.map((item) => {
        return {
          ...item,
          imageBlobPath: null // ไม่เก็บ blob path ลง database
        }
      })

      const allItems = [...stockItemsData, ...copyItemsData]

      const formValue = {
        soNumber: this.formSaleOrder.number || '',
        soDate: this.formSaleOrder.date ? formatISOString(this.formSaleOrder.date) : null,
        deliveryDate: this.formSaleOrder.expectedDeliveryDate
          ? formatISOString(this.formSaleOrder.expectedDeliveryDate)
          : null,
        refQuotation: this.formSaleOrder.quotationNumber ?? null,
        priority: this.formSaleOrder.priority || null,
        customerName: this.formSaleOrder.customerName || null,
        customerCode: this.formSaleOrder.customerCode || null,
        customerAddress: this.formSaleOrder.customerAddress || null,
        customerTel: this.formSaleOrder.customerPhone || null,
        customerEmail: this.formSaleOrder.customerEmail || null,
        customerRemark: this.formSaleOrder.customerRemark || null,
        currencyUnit: this.formSaleOrder.currencyUnit || 'THB',
        currencyRate: this.formSaleOrder.currencyRate || 1.0,
        markup: this.formSaleOrder.markup || 0,
        goldRate: this.formSaleOrder.goldPerOz || 0,
        specialDiscount: this.formSaleOrder.specialDiscount || 0,
        specialAddition: this.formSaleOrder.specialAddition || 0,
        vat: this.formSaleOrder.vatPercent || 0,
        remark: this.formSaleOrder.remark || '',
        data: JSON.stringify({
          stockItems: stockItemsData,
          copyItems: copyItemsData,
          allItems: allItems,
          freight: this.formSaleOrder.freight || 0,
          copyFreight: this.formSaleOrder.copyFreight || 0
        })
      }

      try {
        const res = await this.saleOrderStore.fetchSave({
          formValue: formValue,
          skipLoading: true
        })
        if (res) {
          this.formSaleOrder.number = res
        }

        ////console.log('saveDraft completed', this.formSaleOrder)
      } catch (error) {
        ////console.error('Error saving draft:', error)
      } finally {
        this.isOnDraft = false
      }
    },

    async exportPDF() {
      if (this.stockItems.length === 0) {
        warning('ไม่มีสินค้าสำหรับสร้าง PDF')
        return
      }

      this.isExportingPDF = true
      const pdfData = {
        soNumber: this.formSaleOrder.number,
        createDate: this.formSaleOrder.date,
        customerName: this.formSaleOrder.customerName,
        customerAddress: this.formSaleOrder.customerAddress,
        customerTel: this.formSaleOrder.customerPhone,
        customerEmail: this.formSaleOrder.customerEmail,
        remark: this.formSaleOrder.remark,
        specialDiscount: this.formSaleOrder.specialDiscount || 0,
        specialAddition: this.formSaleOrder.specialAddition || 0,
        freight: this.formSaleOrder.freight || 0,
        vatPercent: this.formSaleOrder.vatPercent || 0,
        items: this.stockItems
      }
      const pdfBuilder = new SaleOrderPdfBuilder(pdfData, {
        currencyUnit: this.formSaleOrder.currencyUnit || 'THB',
        currencyRate: Number(this.formSaleOrder.currencyRate) || 1,
        showCifLabel: this.pdfShowCifLabel
      })
      const pdf = await pdfBuilder.generatePDF()
      const soNumber = this.formSaleOrder.number || 'DRAFT'
      pdf.download(`SO_${soNumber}.pdf`)
      this.isExportingPDF = false
    },

    async confirmOrder() {
      if (this.hasValidationErrors) {
        error('กรุณาแก้ไขข้อผิดพลาดก่อนยืนยันใบสั่งขาย', 'ไม่สามารถยืนยันได้')
        return
      }

      await this.fetchSaveSaleOrder('ยืนยันแล้ว')
      success('ยืนยันใบสั่งขายเรียบร้อยแล้ว', 'ยืนยันสำเร็จ')
    },

    cancelOrder() {
      confirmSubmit(
        'คุณต้องการยกเลิกการสร้างใบสั่งขายนี้หรือไม่?',
        'ยืนยันการยกเลิก',
        (result) => {
          if (result.isConfirm) {
            this.clearForm()
            success('ยกเลิกการสร้างใบสั่งขายแล้ว', 'ยกเลิกแล้ว')
          }
        },
        {
          confirmText: 'ยกเลิก',
          cancelText: 'กลับ'
        },
        'question'
      )
    },

    clearForm() {
      this.formSaleOrder = {
        salesOrderId: null,
        quotationId: null,
        customerId: null,
        customerName: '',
        customerAddress: '',
        customerPhone: '',
        customerEmail: '',
        number: '',
        date: new Date(),
        expectedDeliveryDate: null,
        quotationNumber: '',
        depositRequired: false,
        priority: 'normal',
        totalAmount: 0,
        remark: ''
      }
    },

    createProductionOrder() {},

    async reverseStockConfirm(item) {
      if (!item.isConfirm || item.invoice) {
        warning('ไม่สามารถยกเลิกการยืนยันได้', 'สินค้านี้ยังไม่ได้ยืนยันหรือออก Invoice แล้ว')
        return
      }

      const stockNumber = item.stockNumberOrigin || item.stockNumber
      const productInfo = item.productNumber ? `(${item.productNumber})` : ''

      //////console.log('reverseStockConfirm called for item:', item)

      confirmSubmit(
        `คุณต้องการยกเลิกการยืนยันสินค้า ${stockNumber} ${productInfo} หรือไม่?`,
        'ยืนยันการยกเลิก',
        async (result) => {
          //////console.log('Confirmation result:', result)
          if (result.isConfirmed) {
            await this.onReverseStockConfirm(item)
          }
        },
        {
          confirmText: 'ยืนยัน',
          cancelText: 'ยกเลิก'
        },
        'warning'
      )
    },

    async onReverseStockConfirm(item) {
      //////console.log('onReverseStockConfirm called for item:', item)
      const stockItemsToUnconfirm = [
        {
          id: item.id,
          stockNumber: item.stockNumber
        }
      ]

      await this.saleOrderStore.unconfirmStockItems({
        soNumber: this.formSaleOrder.number,
        stockItems: stockItemsToUnconfirm
      })

      const stockNumber = item.stockNumberOrigin || item.stockNumber
      success('ยกเลิกการยืนยันสำเร็จ', `ยกเลิกการยืนยันสินค้า ${stockNumber} แล้ว`)

      if (this.formSaleOrder.number) {
        const response = await this.getSaleOrderData(this.formSaleOrder.number)

        if (response) {
          this.loadSaleOrderData(response)
        }
      }
    },

    // ============================================
    // NAVIGATION METHODS
    // ============================================

    createProductionOrderForSale() {
      const productionItems = this.selectedItems.filter((item) => item.itemType === 'Production')

      if (productionItems.length === 0) {
        error('ไม่พบสินค้าที่ต้องผลิต', 'ไม่สามารถสร้างใบสั่งผลิตได้')
        return
      }

      this.$router.push({
        path: '/sale/production-order',
        query: {
          saleOrderId: this.formSaleOrder.salesOrderId || 'SO-DEMO',
          saleOrderNumber: this.formSaleOrder.number,
          customerName: this.formSaleOrder.customerName,
          items: JSON.stringify(productionItems)
        }
      })
    },

    createStockReservation() {
      const stockItems = this.selectedItems.filter((item) => item.itemType === 'Stock')

      if (stockItems.length === 0) {
        error('ไม่พบสินค้าคงคลังที่ต้องจอง', 'ไม่สามารถสร้างการจองได้')
        return
      }

      this.$router.push({
        path: '/sale/stock-reservation',
        query: {
          saleOrderId: this.formSaleOrder.salesOrderId || 'SO-DEMO',
          saleOrderNumber: this.formSaleOrder.number,
          customerName: this.formSaleOrder.customerName,
          items: JSON.stringify(stockItems)
        }
      })
    },

    createDeliveryNote() {
      this.$router.push({
        path: '/sale/delivery-note',
        query: {
          saleOrderId: this.formSaleOrder.salesOrderId || 'SO-DEMO',
          saleOrderNumber: this.formSaleOrder.number,
          customerName: this.formSaleOrder.customerName,
          totalAmount: this.totalOrderAmount
        }
      })
    },

    createInvoice() {
      this.$router.push({
        path: '/sale/invoice',
        query: {
          saleOrderId: this.formSaleOrder.salesOrderId || 'SO-DEMO',
          saleOrderNumber: this.formSaleOrder.number,
          customerName: this.formSaleOrder.customerName,
          totalAmount: this.totalOrderAmount,
          depositRequired: this.formSaleOrder.depositRequired
        }
      })
    },

    viewProductionStatus() {
      this.$router.push({
        path: '/sale/production-order',
        query: {
          mode: 'view',
          saleOrderNumber: this.formSaleOrder.number
        }
      })
    },

    viewStockStatus() {
      this.$router.push({
        path: '/sale/stock-reservation',
        query: {
          mode: 'view',
          saleOrderNumber: this.formSaleOrder.number
        }
      })
    },

    viewPaymentStatus() {
      this.$router.push({
        path: '/sale/payment-dashboard',
        query: {
          saleOrderNumber: this.formSaleOrder.number
        }
      })
    },

    backToList() {
      this.$router.push({ path: '/sale-order-list' })
    },

    // ============================================
    // HELPER/UTILITY METHODS
    // ============================================

    formatCurrency(amount, currency = null) {
      const formattedAmount = formatDecimal(amount, 2)
      const displayCurrency = currency || this.formSaleOrder.currencyUnit || 'THB'
      return formattedAmount + ' ' + displayCurrency
    },

    formatPrice(price) {
      const numPrice = Number(price)
      return numPrice.toLocaleString('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },

    getAppraisalPrice(item) {
      return item.appraisalPrice || item.price || 0
    },

    getDiscountedPrice(item) {
      const appraisalPrice = this.getAppraisalPrice(item)
      const discountPercent = item.discountPercent || 0
      return appraisalPrice * (1 - discountPercent / 100)
    },

    getConvertedPrice(item) {
      const discountedPrice = this.getDiscountedPrice(item)
      const currencyRate = this.formSaleOrder.currencyRate || 1
      return discountedPrice / currencyRate
    },

    getTotalConvertedPrice(item) {
      const convertedPrice = this.getConvertedPrice(item)
      const qty = item.qty || 0
      return convertedPrice * qty
    },

    recalculateAll() {
      this.$forceUpdate()
    },

    onBlurPrice(item, stockNumber, fieldName) {
      const realIndex = this.stockItems.findIndex((i) => i.stockNumber === item.stockNumber)
      if (realIndex === -1) return

      let newCal = {
        ...item,
        [fieldName]: item[fieldName] ? Number(item[fieldName]).toFixed(2) : 0,
        totalPrice: Number(item.price).toFixed(2)
      }
      this.stockItems[realIndex] = newCal
      this.recalculateAll()
    },

    onBlurFreight(freight) {
      this.formSaleOrder.freight = freight ? Number(freight).toFixed(2) : 0
    },

    onBlurQty(item, stockNumber, fieldName) {
      const realIndex = this.stockItems.findIndex((i) => i.stockNumber === item.stockNumber)
      if (realIndex === -1) return

      let newCal = {
        ...item,
        [fieldName]: item[fieldName] ? Number(item[fieldName]) : 0
      }
      this.stockItems[realIndex] = newCal
    },

    onBlurDescription(item, stockNumber, fieldName) {
      const realIndex = this.stockItems.findIndex((i) => i.stockNumber === item.stockNumber)
      if (realIndex === -1) return

      let newCal = {
        ...item,
        [fieldName]: item[fieldName] ? item[fieldName] : ''
      }
      this.stockItems[realIndex] = newCal
    },

    onBlurCopyPrice(item, stockNumber, fieldName) {
      const realIndex = this.copyItems.findIndex((i) => i.stockNumber === item.stockNumber)
      if (realIndex === -1) return

      let newCal = {
        ...item,
        [fieldName]: item[fieldName] ? Number(item[fieldName]).toFixed(2) : 0,
        totalPrice: Number(item.price).toFixed(2)
      }
      this.copyItems[realIndex] = newCal
      this.recalculateAll()
    },

    onBlurCopyQty(item, stockNumber, fieldName) {
      const realIndex = this.copyItems.findIndex((i) => i.stockNumber === item.stockNumber)
      if (realIndex === -1) return

      let newCal = {
        ...item,
        [fieldName]: item[fieldName] ? Number(item[fieldName]) : 0
      }
      this.copyItems[realIndex] = newCal
    },

    onBlurCopyFreight(freight) {
      this.formSaleOrder.copyFreight = freight ? Number(freight).toFixed(2) : 0
    },

    calculateGrandTotal() {
      const stockTotal = this.stockItems.reduce((sum, item) => {
        return sum + this.getTotalConvertedPrice(item)
      }, 0)
      let freight = Number(this.formSaleOrder.freight || 0)
      return stockTotal + freight
    },

    calculateStockTotal() {
      return this.getSumTotalConvertedPrice(this.stockItems) + (this.formSaleOrder.freight || 0)
    },

    calculateCopyTotal() {
      return this.getSumTotalConvertedPrice(this.copyItems) + (this.formSaleOrder.copyFreight || 0)
    },

    getNetWeight(items) {
      return items
        .reduce((sum, item) => {
          if (!item.materials) return sum
          return (
            sum +
            item.materials.reduce((matSum, mat) => {
              return matSum + (mat.weight || 0)
            }, 0)
          )
        }, 0)
        .toFixed(2)
    },

    getGoldWeight(items) {
      return items
        .reduce((sum, item) => {
          if (!item.materials) return sum
          return (
            sum +
            item.materials
              .filter((m) => m.type === 'Gold')
              .reduce((matSum, mat) => matSum + (mat.weight || 0), 0)
          )
        }, 0)
        .toFixed(2)
    },

    getDiamondWeight(items) {
      return items
        .reduce((sum, item) => {
          if (!item.materials) return sum
          return (
            sum +
            item.materials
              .filter((m) => m.type === 'Diamond')
              .reduce((matSum, mat) => matSum + (mat.weight || 0), 0)
          )
        }, 0)
        .toFixed(2)
    },

    getGemWeight(items) {
      return items
        .reduce((sum, item) => {
          if (!item.materials) return sum
          return (
            sum +
            item.materials
              .filter((m) => m.type === 'Gem')
              .reduce((matSum, mat) => matSum + (mat.weight || 0), 0)
          )
        }, 0)
        .toFixed(2)
    },

    getSumAppraisalPrice(items) {
      if (!items || !Array.isArray(items) || items.length === 0) return '0.00'

      const total = items.reduce((sum, item) => {
        const price = this.getAppraisalPrice(item)
        return sum + (Number(price) || 0)
      }, 0)

      return Number(total).toFixed(2)
    },

    getSumDiscountPrice(items) {
      if (!items || !Array.isArray(items) || items.length === 0) return '0.00'

      const total = items.reduce((sum, item) => {
        const price = this.getDiscountedPrice(item)
        return sum + (Number(price) || 0)
      }, 0)

      return Number(total).toFixed(2)
    },

    getSumConvertedPrice(items) {
      if (!items || !Array.isArray(items) || items.length === 0) return '0.00'

      const total = items.reduce((sum, item) => {
        const price = this.getConvertedPrice(item)
        return sum + (Number(price) || 0)
      }, 0)

      return Number(total).toFixed(2)
    },

    getSumQty(items) {
      if (!items || !Array.isArray(items) || items.length === 0) return 0

      return items.reduce((sum, item) => {
        return sum + (Number(item.qty) || 0)
      }, 0)
    },

    getSumTotalConvertedPrice(items) {
      if (!items || !Array.isArray(items) || items.length === 0) return '0.00'

      const total = items.reduce((sum, item) => {
        const price = this.getTotalConvertedPrice(item)
        return sum + (Number(price) || 0)
      }, 0)

      return Number(total).toFixed(2)
    },

    updateItemTotal(item) {
      item.lineTotal = item.isSelected ? (item.unitPrice || 0) * (item.quantity || 1) : 0
      this.updateSummary()
    },

    updateSummary() {
      this.formSaleOrder.totalAmount = this.totalOrderAmount
    },

    applyOverallDiscount() {
      if (this.overallDiscountPercent < 0 || this.overallDiscountPercent > 100) {
        warning('เปอร์เซ็นต์ส่วนลดต้องอยู่ระหว่าง 0 ถึง 100')
        return
      }

      this.stockItems.forEach((item) => {
        if (item.isConfirm || item.isInvoice) {
          return
        }

        const originalAppraisalPrice = item.appraisalPrice || item.price || 0
        const discountedPrice = originalAppraisalPrice * (1 - this.overallDiscountPercent / 100)
        item.discountPercent = this.overallDiscountPercent.toFixed(2)
        item.discountPrice = discountedPrice.toFixed(2)
      })

      this.recalculateAll()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/custom-style/standard-data-table.scss';

/* Quotation table styles */
.input-bg {
  background-color: #b5dad4 !important;
}

/* Align cell content to top for all columns */
:deep(.p-column-body),
:deep(.p-cell-text) {
  vertical-align: top !important;
}

:deep(.p-column-body) {
  vertical-align: top !important;
  padding: 0.5rem 0.75rem;
}

.qty-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-right: 5px;
}

.type-container {
  font-size: 13px;
  font-weight: bold;
  color: var(--base-font-color);
  padding: 5px;
}

.card-container {
  border: 1px solid #dddddd;
  border-radius: 5px;

  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  background-color: #f7f7f7;
}

.card-header {
  background: var(--base-font-color);
  border-bottom: 1px solid #e9ecef;
  border-radius: 5px 5px 0px 0px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  font-weight: 300;
  color: white;
}

.card-header-actions {
  display: flex;
  align-items: center;
}

.card-body {
  padding: 1rem;
}

.customer-info-display {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 8px 12px;
  min-height: 38px;
}

.product-description {
  font-size: 0.9rem;
  line-height: 1.4;
}

.availability-info,
.production-info {
  .badge {
    padding: 0.25em 0.5em;
    font-size: 0.75em;
    border-radius: 0.25rem;
  }
}

.badge {
  padding: 0.25em 0.5em;
  font-size: 0.75em;
  border-radius: 0.25rem;
  font-weight: 600;

  &.badge-info {
    background-color: #17a2b8;
    color: white;
  }

  &.badge-warning {
    background-color: #ffc107;
    color: #212529;
  }

  &.badge-success {
    background-color: #28a745;
    color: white;
  }

  &.badge-danger {
    background-color: #dc3545;
    color: white;
  }
}

/* Disabled confirmed item styles */
.disabled-confirmed {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Button disabled styles */
.btn.disabled,
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Custom disabled input styling */
input:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

/* Confirmed text styling */
.confirmed-text {
  display: block;
  padding: 8px 12px;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  color: #495057;
  font-weight: 500;
  width: 100%;
  min-height: 38px;
  line-height: 1.5;
}

.confirmed-text.text-right {
  text-align: right;
}

.summary-section {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  height: 100%;
  transition: all 0.3s ease;

  &:hover {
    background: #e9ecef;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  h6 {
    color: #495057;
    margin-bottom: 0.75rem;
    border-bottom: 1px solid #dee2e6;
    padding-bottom: 0.5rem;
    display: flex;
    align-items: center;

    i {
      font-size: 1.1rem;
    }
  }
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;

  &:last-child {
    margin-bottom: 0;
  }

  &.border-top {
    border-top: 1px solid #dee2e6;
    padding-top: 0.5rem;
    margin-top: 0.5rem;
  }
}

.form-check-input {
  margin: 0;
}

.is-invalid {
  border-color: #dc3545;
}

.invalid-feedback {
  display: block;
  width: 100%;
  margin-top: 0.25rem;
  font-size: 0.875em;
  color: #dc3545;
}

.alert {
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid transparent;
  border-radius: 0.25rem;

  &.alert-warning {
    color: #856404;
    background-color: #fff3cd;
    border-color: #ffeaa7;
  }
}

.text-right {
  text-align: right;
}

.text-muted {
  color: #6c757d !important;
}

.font-weight-bold {
  font-weight: 600;
}

.text-primary {
  color: #007bff !important;
}

.text-success {
  color: #28a745 !important;
}

.text-warning {
  color: #ffc107 !important;
}

.text-danger {
  color: #dc3545 !important;
}

.text-info {
  color: #17a2b8 !important;
}

/* Customer Section Styles */
.customer-details-section {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1rem;
  background-color: #f8f9fa;
}

.customer-display-field {
  background-color: white;
  border: 1px solid #ced4da;
  border-radius: 4px;
  padding: 0.375rem 0.75rem;
  min-height: 38px;
  display: flex;
  align-items: center;
  color: #495057;
  font-weight: 500;
}

.customer-display-field:empty:before {
  content: '-';
  color: #6c757d;
  font-style: italic;
}

.title-text-lg {
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--base-font-color);
}

.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Fix form layout issues */
.form-col-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  align-items: start;
}

.form-col-sm-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
  align-items: start;
}

/* Fix material cell layout */
.material-cell {
  display: flex;
  gap: 1px;
  align-items: flex-start;
  min-width: 0;
}
.material-typecode {
  flex: 5;
  text-align: left;
  margin-right: 0.5rem;
  min-width: 120px;
  word-break: break-word;
  white-space: normal;
  overflow-wrap: anywhere;
  vertical-align: top;
}
.material-typecode-gold {
  flex: 5;
  text-align: center;
  margin-right: 0.5rem;
  min-width: 0;
  word-break: break-word;
  white-space: normal;
  overflow-wrap: anywhere;
  vertical-align: top;
}
.material-weight {
  flex: 1;
  vertical-align: top;
}

/* DataTable cell alignment fixes */
:deep(.p-datatable-thead > tr > th) {
  text-align: center;
  vertical-align: middle;
  padding: 0.75rem 0.5rem;
  font-weight: 600;
}

:deep(.p-datatable-tbody > tr > td) {
  vertical-align: top;
  padding: 0.5rem;
}

:deep(.p-datatable-tfoot > tr > td) {
  vertical-align: middle;
  padding: 0.5rem;
  font-weight: 500;
}

/* Input field adjustments */
.qty-container input,
.form-control.bg-input {
  font-size: 0.875rem;
  padding: 0.375rem 0.5rem;
}

/* Button spacing */
.btn-action-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.25rem;
  flex-wrap: nowrap;
}

.btn-action-container .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  line-height: 1;
}

.d-flex {
  display: flex;
}

.align-items-center {
  align-items: center;
}

.mr-1 {
  margin-right: 0.25rem;
}

.mr-2 {
  margin-right: 0.5rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.mb-0 {
  margin-bottom: 0;
}

.demo-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.btn-action-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.25rem;
}

// Sales Flow Actions Styles
.sales-flow-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.flow-section {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
}

.flow-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;

  h6 {
    margin: 0;
    color: #495057;
    font-weight: 600;

    i {
      color: #6c757d;
    }
  }

  .badge {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;

    &.badge-info {
      background-color: #17a2b8;
    }

    &.badge-success {
      background-color: #28a745;
    }

    &.badge-primary {
      background-color: #007bff;
    }

    &.badge-warning {
      background-color: #ffc107;
      color: #212529;
    }
  }
}

.flow-section p {
  color: #6c757d;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  line-height: 1.4;
}

.flow-section .btn {
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;

  &:not(:last-child) {
    margin-right: 0.5rem;
  }
}

// Responsive design for smaller screens
@media (max-width: 768px) {
  .sales-flow-actions {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .flow-section {
    padding: 1rem;
  }

  .flow-section .btn {
    width: 100%;
    margin-right: 0;
    margin-bottom: 0.5rem;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.alert {
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid transparent;
  border-radius: 0.25rem;

  &.alert-info {
    color: #0c5460;
    background-color: #d1ecf1;
    border-color: #bee5eb;
  }
}

.btn-submit-container-custom {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 20px;
}

// Badge styles for confirmation status
.badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-weight: 600;

  &.badge-success {
    background-color: #28a745;
    color: white;
  }

  &.badge-warning {
    background-color: #ffc107;
    color: #212529;
  }
}
</style>
