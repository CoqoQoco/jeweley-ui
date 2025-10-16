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

          <!-- Status -->
          <div>
            <span class="title-text">สถานะ</span>
            <Dropdown
              v-model="formSaleOrder.status"
              :options="statusOptions"
              optionLabel="name"
              optionValue="value"
              placeholder="เลือกสถานะ"
              class="w-100"
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

          <!-- Payment Terms -->
          <div>
            <span class="title-text">เงื่อนไขการชำระเงิน</span>
            <Dropdown
              v-model="formSaleOrder.paymentTerms"
              :options="paymentTermsOptions"
              optionLabel="name"
              optionValue="value"
              placeholder="เลือกเงื่อนไขการชำระ"
              class="w-100"
              :disabled="isViewMode"
              @change="onPaymentTermsChange"
            />
          </div>

          <!-- Deposit Percentage -->
          <div>
            <span class="title-text">เปอร์เซ็นต์เงินมัดจำ (%)</span>
            <input
              :class="['form-control bg-input']"
              type="number"
              min="0"
              max="100"
              step="0.01"
              v-model.number="formSaleOrder.depositPercentage"
              placeholder="50.00"
              :readonly="isViewMode"
              @input="updateSummary"
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
                class="btn btn-sm btn-green mr-2"
                type="button"
                @click="onSearchCustomer"
                title="ค้นหาลูกค้า"
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
        <div class="d-flex justify-content-start mt-2">
          <div class="mr-2">
            <span class="title-text">Currency</span>
            <input
              :class="['form-control bg-input', 'input-bg']"
              type="text"
              v-model.trim="formSaleOrder.currencyUnit"
              style="width: 100px"
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
              style="width: 100px"
              :readonly="isViewMode"
              @input="recalculateAll"
            />
          </div>
          <div class="mr-2">
            <span class="title-text">Markup</span>
            <input
              :class="['form-control bg-input', 'input-bg']"
              type="number"
              v-model.number="formSaleOrder.markup"
              min="0"
              step="any"
              style="width: 80px"
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
              style="width: 80px"
              :readonly="isViewMode"
              @input="recalculateAll"
            />
          </div>
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
          :value="stockItems"
          dataKey="stockNumber"
          :scrollable="true"
          scrollHeight="10000000px"
          class="p-datatable-sm"
          stripedRows
          responsiveLayout="scroll"
          showGridlines
        >
          <ColumnGroup type="header">
            <Row>
              <Column header="" :colspan="2" frozen />
              <Column header="" frozen />
              <Column header="เลขที่ผลิต" frozen />
              <Column header="รหัสสินค้า" frozen />
              <Column header="สถานะการขาย" />
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

          <Column field="index" style="width: 10px" frozen>
            <template #body="slotProps">
              <span>{{ slotProps.index + 1 }}</span>
            </template>
          </Column>

          <Column field="action" style="width: 10px" frozen>
            <template #body="slotProps">
              <div class="d-flex justify-content-center align-items-center">
                <button
                  :class="['btn', 'btn-sm', slotProps.data.isConfirmed ? 'btn-secondary' : 'btn-red']"
                  type="button"
                  title="ลบ"
                  @click="deleteStockItem(slotProps.index)"
                  :disabled="slotProps.data.isConfirmed"
                >
                  <span class="bi bi-trash"></span>
                </button>
                <button
                  :class="['btn', 'btn-sm', 'ml-2', slotProps.data.isConfirmed ? 'btn-secondary' : 'btn-main']"
                  type="button"
                  title="แก้ไข"
                  @click="onEditStock(slotProps.data, slotProps.index)"
                  :disabled="slotProps.data.isConfirmed"
                >
                  <span class="bi bi-brush"></span>
                </button>
                <!-- <button
                  class="btn btn-sm btn-outline-dark ml-2"
                  type="button"
                  title="คัดลอก"
                  @click="copyItem(slotProps.data)"
                >
                  <span class="bi bi-files"></span>
                </button> -->
              </div>
            </template>
          </Column>

          <Column field="image" header="" style="width: 50px" frozen>
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
                    @image-loaded="handleImageLoaded($event, slotProps.index)"
                  />
                </div>
              </div>
            </template>
          </Column>

          <Column field="stockNumber" header="เลขที่ผลิต" style="min-width: 150px" frozen>
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

          <Column field="productNumber" header="รหัสสินค้า" style="min-width: 150px" frozen>
            <template #body="slotProps">
              <div v-if="!slotProps.data.stockNumber">
                <input
                  v-if="!slotProps.data.isConfirmed"
                  v-model="slotProps.data.productNumber"
                  type="text"
                  class="form-control bg-input input-bg"
                  @blur="onBlurDescription(slotProps.data, slotProps.index, 'productNumber')"
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
          <Column field="isConfirmed" header="สถานะการขาย" style="min-width: 120px">
            <template #body="slotProps">
              <div class="text-center">
                <span
                  :class="['badge', slotProps.data.isConfirmed ? 'badge-success' : 'badge-warning']"
                >
                  {{ slotProps.data.isConfirmed ? 'ยืนยันแล้ว' : 'รอยืนยัน' }}
                </span>
              </div>
            </template>
          </Column>

          <Column field="description" header="รายละเอียด" style="min-width: 200px">
            <template #body="slotProps">
              <input
                v-if="!slotProps.data.isConfirmed"
                v-model="slotProps.data.description"
                type="text"
                class="form-control bg-input input-bg"
                @blur="onBlurDescription(slotProps.data, slotProps.index, 'description')"
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
                  v-if="!slotProps.data.isConfirmed"
                  v-model.number="slotProps.data.appraisalPrice"
                  type="number"
                  class="form-control text-right bg-input input-bg"
                  min="0"
                  step="any"
                  @blur="onBlurPrice(slotProps.data, slotProps.index, 'appraisalPrice')"
                  @input="recalculateAll"
                  style="background-color: #b5dad4; width: 100%"
                />
                <span v-else class="confirmed-text text-right">
                  {{ (slotProps.data.appraisalPrice || 0).toFixed(2) }}
                </span>
              </div>
            </template>
          </Column>

          <Column field="discountPercent" header="ส่วนลด (%)" style="min-width: 100px">
            <template #body="slotProps">
              <div class="qty-container">
                <input
                  v-if="!slotProps.data.isConfirmed"
                  v-model.number="slotProps.data.discountPercent"
                  type="number"
                  class="form-control text-right bg-input input-bg"
                  min="0"
                  max="100"
                  step="any"
                  @blur="onBlurPrice(slotProps.data, slotProps.index, 'discountPercent')"
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
                  v-if="!slotProps.data.isConfirmed"
                  v-model.number="slotProps.data.qty"
                  type="number"
                  class="form-control text-right bg-input input-bg"
                  min="0"
                  step="1"
                  @blur="onBlurQty(slotProps.data, slotProps.index, 'qty')"
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

          <!-- Confirmation Status Column for Stock Items -->
          <!-- <Column field="isConfirmed" header="สถานะการขาย" style="min-width: 120px">
            <template #body="slotProps">
              <div class="text-center">
                <span
                  :class="['badge', slotProps.data.isConfirmed ? 'badge-success' : 'badge-warning']"
                >
                  {{ slotProps.data.isConfirmed ? 'ยืนยันแล้ว' : 'รอยืนยัน' }}
                </span>
              </div>
            </template>
          </Column> -->

          <ColumnGroup type="footer">
            <!-- total -->
            <Row>
              <Column :colspan="5" frozen>
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
            <Row>
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
            </Row>
            <!-- total after discount -->
            <Row>
              <Column :colspan="17">
                <template #footer>
                  <div class="text-right type-container">
                    <span>ราคารวม</span>
                  </div>
                </template>
              </Column>
              <Column>
                <template #footer>
                  <div class="text-right type-container">
                    <span>{{ formatPrice(calculateGrandTotal()) }}</span>
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
                  @click="onEditCopyItem(slotProps.data, slotProps.index)"
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
                    @image-loaded="handleImageLoaded($event, slotProps.index)"
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
                  v-if="!slotProps.data.isConfirmed"
                  v-model="slotProps.data.productNumber"
                  type="text"
                  class="form-control bg-input input-bg"
                  @blur="onBlurDescription(slotProps.data, slotProps.index, 'productNumber')"
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
                v-if="!slotProps.data.isConfirmed"
                v-model="slotProps.data.description"
                type="text"
                class="form-control bg-input input-bg"
                @blur="onBlurDescription(slotProps.data, slotProps.index, 'description')"
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
                  v-if="!slotProps.data.isConfirmed"
                  v-model.number="slotProps.data.appraisalPrice"
                  type="number"
                  class="form-control text-right bg-input input-bg"
                  min="0"
                  step="any"
                  @blur="onBlurCopyPrice(slotProps.data, slotProps.index, 'appraisalPrice')"
                  @input="recalculateAll"
                  style="background-color: #b5dad4; width: 100%"
                />
                <span v-else class="confirmed-text text-right">
                  {{ (slotProps.data.appraisalPrice || 0).toFixed(2) }}
                </span>
              </div>
            </template>
          </Column>

          <Column field="discountPercent" header="ส่วนลด (%)" style="min-width: 100px">
            <template #body="slotProps">
              <div class="qty-container">
                <input
                  v-if="!slotProps.data.isConfirmed"
                  v-model.number="slotProps.data.discountPercent"
                  type="number"
                  class="form-control text-right bg-input input-bg"
                  min="0"
                  max="100"
                  step="any"
                  @blur="onBlurCopyPrice(slotProps.data, slotProps.index, 'discountPercent')"
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
                  @blur="onBlurCopyQty(slotProps.data, slotProps.index, 'qty')"
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
            <!-- freight -->
            <!-- <Row>
              <Column :colspan="16">
                <template #footer>
                  <div class="text-right type-container">
                    <span>Freight & Insurance (Copy Items)</span>
                  </div>
                </template>
              </Column>
              <Column>
                <template #footer>
                  <div class="qty-container">
                    <input
                      style="background-color: #b5dad4"
                      v-model="formSaleOrder.copyFreight"
                      type="number"
                      class="form-control text-right bg-input input-bg"
                      step="any"
                      min="0"
                     disabled
                      @blur="onBlurCopyFreight(formSaleOrder.copyFreight)"
                    />
                  </div>
                </template>
              </Column>
            </Row> -->
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
          <div class="col-md-4">
            <!-- Selected Items Summary -->
            <div class="summary-section">
              <h6>รายการที่เลือก</h6>
              <div class="summary-item">
                <span>สินค้าคงคลัง:</span>
                <span class="font-weight-bold">{{ selectedStockItemsCount }} รายการ</span>
              </div>
              <div class="summary-item">
                <span>สินค้าผลิต:</span>
                <span class="font-weight-bold">{{ selectedProductionItemsCount }} รายการ</span>
              </div>
              <div class="summary-item">
                <span>รวมทั้งหมด:</span>
                <span class="font-weight-bold">{{ selectedItemsCount }} รายการ</span>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <!-- Production Items Deposit -->
            <div class="summary-section" v-if="selectedProductionItemsCount > 0">
              <h6>เงินมัดจำสินค้าผลิต</h6>
              <div class="summary-item">
                <span>ยอดสินค้าผลิต:</span>
                <span class="font-weight-bold">{{ formatCurrency(productionItemsTotal) }}</span>
              </div>
              <div class="summary-item" v-if="formSaleOrder.depositRequired">
                <span>เงินมัดจำ ({{ formSaleOrder.depositPercentage || 0 }}%):</span>
                <span class="font-weight-bold text-info">{{
                  formatCurrency(productionDepositAmount)
                }}</span>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <!-- Total Summary -->
            <div class="summary-section">
              <h6>สรุปยอดรวม</h6>
              <div class="summary-item">
                <span>ยอดรวมรายการที่เลือก:</span>
                <span class="font-weight-bold">{{ formatCurrency(selectedItemsTotal) }}</span>
              </div>
              <div class="summary-item" v-if="formSaleOrder.depositRequired">
                <span>เงินมัดจำที่ต้องชำระ:</span>
                <span class="font-weight-bold text-success">{{
                  formatCurrency(totalDepositAmount)
                }}</span>
              </div>
              <div class="summary-item border-top pt-2 mt-2">
                <span class="h6">ยอดรวมใบสั่งขาย:</span>
                <span class="h6 font-weight-bold text-primary">{{
                  formatCurrency(totalOrderAmount)
                }}</span>
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

    <!-- Sales Flow Actions -->
    <div class="card-container mt-3" v-if="formSaleOrder.status === 'Confirmed'">
      <div class="card-header">
        <h6 class="mb-0">ขั้นตอนการดำเนินการต่อ</h6>
      </div>
      <div class="card-body">
        <div class="sales-flow-actions">
          <!-- Production Order Section -->
          <div class="flow-section" v-if="selectedProductionItemsCount > 0">
            <div class="flow-section-header">
              <h6><i class="bi bi-tools mr-2"></i>การผลิตสินค้า</h6>
              <span class="badge badge-info">{{ selectedProductionItemsCount }} รายการ</span>
            </div>
            <p class="text-muted">สินค้าที่ต้องผลิตตามคำสั่งซื้อ</p>
            <button
              class="btn btn-warning mr-2"
              @click="createProductionOrderForSale"
              :disabled="loading"
            >
              <i class="bi bi-tools mr-1"></i>
              สร้างใบสั่งผลิต
            </button>
            <button class="btn btn-outline-info" @click="viewProductionStatus">
              <i class="bi bi-eye mr-1"></i>
              ดูสถานะการผลิต
            </button>
          </div>

          <!-- Stock Reservation Section -->
          <div class="flow-section" v-if="selectedStockItemsCount > 0">
            <div class="flow-section-header">
              <h6><i class="bi bi-box mr-2"></i>การจองสต็อก</h6>
              <span class="badge badge-success">{{ selectedStockItemsCount }} รายการ</span>
            </div>
            <p class="text-muted">สินค้าคงคลังที่ต้องจองสำหรับลูกค้า</p>
            <button class="btn btn-info mr-2" @click="createStockReservation" :disabled="loading">
              <i class="bi bi-bookmark mr-1"></i>
              จองสต็อกสินค้า
            </button>
            <button class="btn btn-outline-info" @click="viewStockStatus">
              <i class="bi bi-eye mr-1"></i>
              ดูสถานะสต็อก
            </button>
          </div>

          <!-- Delivery Section -->
          <div class="flow-section">
            <div class="flow-section-header">
              <h6><i class="bi bi-truck mr-2"></i>การส่งมอบ</h6>
              <span class="badge badge-primary">พร้อมส่งมอบ</span>
            </div>
            <p class="text-muted">จัดส่งสินค้าให้ลูกค้าตามที่สั่งซื้อ</p>
            <button class="btn btn-primary mr-2" @click="createDeliveryNote" :disabled="loading">
              <i class="bi bi-truck mr-1"></i>
              สร้างใบส่งของ
            </button>
          </div>

          <!-- Invoice Section -->
          <div class="flow-section">
            <div class="flow-section-header">
              <h6><i class="bi bi-receipt mr-2"></i>การเรียกเก็บเงิน</h6>
              <span class="badge badge-warning">{{ formatCurrency(totalOrderAmount) }}</span>
            </div>
            <p class="text-muted">ออกใบแจ้งหนี้และติดตามการชำระเงิน</p>
            <button class="btn btn-success mr-2" @click="createInvoice" :disabled="loading">
              <i class="bi bi-receipt mr-1"></i>
              สร้างใบแจ้งหนี้
            </button>
            <button class="btn btn-outline-success" @click="viewPaymentStatus">
              <i class="bi bi-wallet2 mr-1"></i>
              ติดตามการชำระ
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="btn-submit-container mt-3">
      <!-- Edit Mode Buttons (hidden in view mode) -->

      <div v-if="!isViewMode" class="d-flex justify-content-end align-items-center">
        <button
          class="btn btn-green mr-2"
          type="button"
          @click="openConfirmStockModal"
          :disabled="
            loading ||
            selectedItemsCount === 0 ||
            hasValidationErrors ||
            pendingConfirmationStockItemsCount === 0
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
          @click="openInvoiceModal"
          :disabled="
            loading ||
            selectedItemsCount === 0 ||
            hasValidationErrors ||
            confirmedStockItemsCount === 0
          "
        >
          <i class="bi bi-receipt mr-1"></i>
          Invoice
        </button>

        <button
          class="btn btn-outline-main mr-2"
          type="button"
          @click="saveDraft"
          :disabled="loading || selectedItemsCount === 0 || formSaleOrder.status === 'Confirmed'"
        >
          <i class="bi bi-file-earmark mr-1"></i>
          บันทึกร่าง
        </button>

        <!-- <button class="btn btn-secondary mr-2" type="button" @click="clearForm">
          <i class="bi bi-arrow-clockwise mr-1"></i>
          ล้างข้อมูล
        </button>

        <button class="btn btn-outline-danger mr-2" type="button" @click="cancelOrder">
          <i class="bi bi-x-circle mr-1"></i>
          ยกเลิก
        </button> -->
      </div>

      <!-- Print Order Button (always visible) -->
      <!-- <button
        class="btn btn-outline-primary mr-2"
        type="button"
        @click="printSaleOrder"
        :disabled="formSaleOrder.status !== 'Confirmed'"
      >
        <i class="bi bi-printer mr-1"></i>
        พิมพ์ใบสั่งขาย
      </button> -->

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
  />

  <!-- Invoice Modal -->
  <SaleOrderInvoiceModal
    :isShowModal="isShow.invoiceModal"
    :saleOrderData="formSaleOrder"
    :stockItems="confirmedStockItemsOnly"
    @close-modal="onCloseInvoiceModal"
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
import { success, error, confirmSubmit } from '@/services/alert/sweetAlerts.js'
import { usrSaleOrderApiStore } from '@/stores/modules/api/sale/sale-order-store.js'
import { formatISOString } from '@/services/utils/dayjs.js'

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
    const saleOrderStore = usrSaleOrderApiStore()
    return { saleOrderStore }
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
      loading: false,
      isSONumberLocked: false, // Lock SO number after saving draft
      productSearch: {
        stockNumber: '',
        stockNumberOrigin: '',
        productNumber: ''
      },
      quotationItems: [], // Items from quotation
      stockItems: [], // Items with stock ID
      copyItems: [], // Items without stock ID (copy items)
      type: 'STOCK-PRODUCT',

      // Modal states
      isShow: {
        isEditStock: false,
        searchCustomer: false,
        createCustomer: false,
        invoiceModal: false,
        confirmStockModal: false
      },
      modelEditStock: {},
      editStockIndex: null,

      // Column definition for legacy support
      quotationItemColumns: [
        {
          field: 'isSelected',
          header: 'เลือก',
          width: '80px',
          sortable: false
        },
        {
          field: 'itemType',
          header: 'ประเภท',
          width: '100px'
        },
        {
          field: 'productNumber',
          header: 'รหัสสินค้า',
          minWidth: '120px'
        },
        {
          field: 'productName',
          header: 'ชื่อสินค้า',
          minWidth: '200px'
        },
        {
          field: 'availabilityInfo',
          header: 'สถานะ/ข้อมูลเพิ่มเติม',
          minWidth: '180px',
          sortable: false
        },
        {
          field: 'quantity',
          header: 'จำนวน',
          minWidth: '100px',
          sortable: false
        },
        {
          field: 'unitPrice',
          header: 'ราคาต่อหน่วย',
          minWidth: '120px',
          align: 'right',
          format: 'currency'
        },
        {
          field: 'lineTotal',
          header: 'ราคารวม',
          minWidth: '120px',
          align: 'right',
          sortable: false
        }
      ],

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
        status: 'Draft',
        quotationNumber: '',
        paymentTerms: 'Cash',
        depositRequired: false,
        depositPercentage: 50,
        priority: 'normal',
        totalAmount: 0,
        remark: '',
        customerRemark: '',
        // Currency and pricing properties
        currencyUnit: 'US$',
        currencyRate: 33.0,
        markup: 3.5,
        goldPerOz: 2000,
        freight: 0,
        copyFreight: 0
      },

      statusOptions: [
        { name: 'ร่าง', value: 'Draft', id: 1 },
        { name: 'ยืนยันแล้ว', value: 'Confirmed', id: 2 },
        { name: 'ส่งมอบบางส่วน', value: 'PartiallyFulfilled', id: 3 },
        { name: 'ส่งมอบครบถ้วน', value: 'Fulfilled', id: 4 }
      ],

      paymentTermsOptions: [
        { name: 'เงินสด', value: 'Cash', id: 1 },
        { name: 'เครดิต 30 วัน', value: 'Credit30', id: 2 },
        { name: 'เครดิต 60 วัน', value: 'Credit60', id: 3 },
        { name: 'มัดจำ + ยอดคงเหลือ', value: 'DepositAndBalance', id: 4 }
      ],

      priorityOptions: [
        { name: 'ปกติ', value: 'normal', id: 1 },
        { name: 'สำคัญ', value: 'high', id: 2 },
        { name: 'เร่งด่วน', value: 'urgent', id: 3 },
        { name: 'วิกฤต', value: 'critical', id: 4 }
      ]
    }
  },

  computed: {
    // Check if quotation data is loaded
    hasQuotationData() {
      return this.stockItems.length > 0 || this.copyItems.length > 0
    },

    // Selection state
    allItemsSelected() {
      return this.quotationItems.length > 0 && this.quotationItems.every((item) => item.isSelected)
    },

    selectedItems() {
      return this.quotationItems.filter((item) => item.isSelected)
    },

    selectedItemsCount() {
      // นับเฉพาะ stock items สำหรับใบสรุปใบสั่งขาย
      return this.stockItems.length
    },

    selectedStockItemsCount() {
      return this.stockItems.length
    },

    selectedProductionItemsCount() {
      return this.copyItems.length
    },

    // Stock items for invoice (exclude copy items)
    stockItemsForInvoice() {
      return this.stockItems.map((item, index) => ({
        ...item,
        id: item.id || `stock_${index}_${Date.now()}`,
        isConfirmed: item.isConfirmed || false
      }))
    },

    // Only confirmed stock items for invoice
    confirmedStockItemsOnly() {
      return this.stockItemsForInvoice.filter((item) => item.isConfirmed)
    },

    // Count of confirmed stock items
    confirmedStockItemsCount() {
      return this.confirmedStockItemsOnly.length
    },

    // Stock items pending confirmation (not confirmed yet)
    pendingConfirmationStockItems() {
      return this.stockItemsForInvoice.filter((item) => !item.isConfirmed)
    },

    // Count of stock items pending confirmation
    pendingConfirmationStockItemsCount() {
      return this.pendingConfirmationStockItems.length
    },

    // Price calculations - ใบสรุปใบสั่งขายรวมเฉพาะ stock items เท่านั้น
    selectedItemsTotal() {
      // รวมเฉพาะ stock items สำหรับใบสรุปใบสั่งขาย (ใช้ราคาแปลงแล้ว)
      return this.stockItems.reduce((sum, item) => sum + this.getTotalConvertedPrice(item), 0)
    },

    stockItemsTotal() {
      return this.stockItems.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 0), 0)
    },

    productionItemsTotal() {
      return this.copyItems.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 0), 0)
    },

    productionDepositAmount() {
      if (!this.formSaleOrder.depositRequired) return 0

      let stockTotal = this.stockItems.reduce(
        (sum, item) => sum + this.getTotalConvertedPrice(item),
        0
      )
      return ((stockTotal + 0) * (this.formSaleOrder.depositPercentage || 0)) / 100
    },

    totalDepositAmount() {
      return this.productionDepositAmount
    },

    totalOrderAmount() {
      // ใบสรุปใบสั่งขายรวมเฉพาะ stock items เท่านั้น (รวม freight)
      return this.selectedItemsTotal + (Number(this.formSaleOrder.freight) || 0)
    },

    // Validation
    validationErrors() {
      const errors = []

      if (!this.hasQuotationData) {
        errors.push('กรุณาเลือกใบเสนอราคาก่อน')
      }

      // Check production items deposit requirement
      if (this.copyItems.length > 0 && !this.formSaleOrder.depositRequired) {
        errors.push('สินค้าสำเนาต้องการเงินมัดจำ กรุณาเลือก "ต้องการเงินมัดจำ"')
      }

      return errors
    },

    hasValidationErrors() {
      return this.validationErrors.length > 0
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
        if (newVal && Object.keys(newVal).length > 0) {
          // Check if this is quotation data (has items) or sale order data (has other properties)
          if (newVal.items && Array.isArray(newVal.items) && newVal.items.length > 0) {
            this.loadQuotationData(newVal)
          } else if (newVal.number || newVal.customer || newVal.status || newVal.currencyUnit) {
            this.loadSaleOrderData(newVal)
          } else {
          }
        }
      },
      deep: true,
      immediate: true
    }
  },

  methods: {
    // Load quotation data and separate into tables
    loadQuotationData(saleOrderData) {
      if (!saleOrderData || !saleOrderData.items) return

      // Update sale order form data
      this.formSaleOrder = {
        ...this.formSaleOrder,
        quotationNumber: saleOrderData.quotationNumber,
        customerName: saleOrderData.customer?.name || '',
        customerAddress: saleOrderData.customer?.address || '',
        customerPhone: saleOrderData.customer?.phone || '',
        customerEmail: saleOrderData.customer?.email || '',
        freight: saleOrderData.freight || 0,
        // Copy currency settings from quotation if available
        currencyUnit: saleOrderData.currencyUnit || 'US$',
        currencyRate: saleOrderData.currencyRate || 33.0,
        markup: saleOrderData.markup || 3.5,
        goldPerOz: saleOrderData.goldPerOz || 2000,
        number: null
      }

      // Add appraisal price to items if not present
      this.stockItems.forEach((item) => {
        if (!item.appraisalPrice) {
          item.appraisalPrice = item.price || 0
        }
      })
      this.copyItems.forEach((item) => {
        if (!item.appraisalPrice) {
          item.appraisalPrice = item.price || 0
        }
      })

      // Separate items based on stockId
      this.stockItems = saleOrderData.items.filter((item) => item.stockNumber != null)
      this.copyItems = saleOrderData.items.filter((item) => item.stockNumber == null)
    },

    // Load sale order data from API
    loadSaleOrderData(saleOrderData) {
      if (!saleOrderData) return

      // Update sale order form data using Object.assign for better reactivity
      Object.assign(this.formSaleOrder, {
        number: saleOrderData.number || '',
        date: saleOrderData.date || new Date(),
        expectedDeliveryDate: saleOrderData.expectedDeliveryDate || null,
        status: saleOrderData.status || 'Draft',
        quotationNumber: saleOrderData.quotationNumber || '',
        paymentTerms: saleOrderData.paymentTerms || 'Cash',
        depositRequired: saleOrderData.depositRequired || false,
        depositPercentage: saleOrderData.depositAmount || 0,
        priority: saleOrderData.priority || 'normal',
        remark: saleOrderData.remark || '',
        customerRemark: saleOrderData.customer?.remark || '',

        // Customer information
        customerName: saleOrderData.customer?.name || '',
        customerAddress: saleOrderData.customer?.address || '',
        customerPhone: saleOrderData.customer?.phone || '',
        customerEmail: saleOrderData.customer?.email || '',

        // Financial data
        currencyUnit: saleOrderData.currencyUnit || 'US$',
        currencyRate: saleOrderData.currencyRate || 33.0,
        markup: saleOrderData.markup || 3.5,
        goldPerOz: saleOrderData.goldPerOz || 2000,
        freight: saleOrderData.freight || 0,
        copyFreight: saleOrderData.copyFreight || 0
      })

      // Force Vue to update the UI
      this.$nextTick(() => {
        this.$forceUpdate()
      })

      // Load items if available
      if (saleOrderData.items) {
        // Check if items is an object with stockItems/copyItems or an array
        if (saleOrderData.items.stockItems || saleOrderData.items.copyItems) {
          // Items is an object with separated arrays
          this.stockItems = saleOrderData.items.stockItems || []
          this.copyItems = saleOrderData.items.copyItems || []
        } else if (Array.isArray(saleOrderData.items)) {
          // Items is a flat array - separate based on stockNumber
          this.stockItems = saleOrderData.items.filter((item) => item.stockNumber != null)
          this.copyItems = saleOrderData.items.filter((item) => item.stockNumber == null)
        } else if (Array.isArray(saleOrderData.items.allItems)) {
          // Items has allItems array
          this.stockItems = saleOrderData.items.allItems.filter((item) => item.stockNumber != null)
          this.copyItems = saleOrderData.items.allItems.filter((item) => item.stockNumber == null)
        }
      }

      //check confirm stock in saleOrderData.confirmedItems for stock item
      this.stockItems.forEach((item) => {
        if (saleOrderData.confirmedItems.includes(item.stockNumber)) {
          item.isConfirmed = true
        }
      })

      // Recalculate totals
    },

    // Product search method (like quotation)
    async onSearchProduct() {
      try {
        this.loading = true

        // Mock implementation for now

        // Simulate API response
        const mockData = {
          stockNumber: this.productSearch.stockNumber || 'DK-2025-001',
          stockId: 'STK001',
          productNumber: this.productSearch.productNumber || 'R08R50001L',
          description: 'Gold Ring with Diamond',
          price: 50000,
          appraisalPrice: 55000,
          qty: 1,
          discountPercent: 0,
          isConfirmed: false,
          materials: [
            { type: 'Gold', typeCode: '18K', weight: 5.5 },
            { type: 'Diamond', typeCode: 'Round', weight: 0.5, qty: 1 }
          ]
        }

        // Add product to stockItems (will go to appropriate table based on stockId)
        if (mockData.stockId) {
          this.stockItems.push(mockData)
        } else {
          this.copyItems.push(mockData)
        }

        // Clear search form
        this.productSearch = {
          stockNumber: '',
          stockNumberOrigin: '',
          productNumber: ''
        }
      } catch (error) {
        console.error('Error searching product:', error)
      } finally {
        this.loading = false
      }
    },

    // Delete item methods (like quotation)
    deleteStockItem(index) {
      this.stockItems.splice(index, 1)
      this.recalculateAll()
    },

    deleteCopyItem(index) {
      this.copyItems.splice(index, 1)
      this.recalculateAll()
    },

    // Create production order for copy items
    createProductionOrder(item) {},

    // Demo data loading methods

    async handleProductSearch(searchData) {},

    async handleQuotationSearch(quotationData) {
      this.formSaleOrder.quotationNumber = quotationData.Number
      await this.loadQuotationDataFromAPI()
    },

    async loadQuotationDataFromAPI() {
      try {
        this.loading = true
      } catch (error) {
        console.error('Error loading quotation:', error)
      } finally {
        this.loading = false
      }
    },

    // Selection methods
    toggleAllItems() {
      const newState = !this.allItemsSelected
      this.quotationItems.forEach((item) => {
        item.isSelected = newState
        this.updateItemTotal(item)
      })
    },

    updateItemSelection(item) {
      this.updateItemTotal(item)
    },

    updateItemTotal(item) {
      item.lineTotal = item.isSelected ? (item.unitPrice || 0) * (item.quantity || 1) : 0
      this.updateSummary()
    },

    updateSummary() {
      this.formSaleOrder.totalAmount = this.totalOrderAmount
    },

    // Payment terms handling
    onPaymentTermsChange() {
      if (this.formSaleOrder.paymentTerms === 'DepositAndBalance') {
        this.formSaleOrder.depositRequired = true
      }
    },

    onDepositRequiredChange() {
      if (this.formSaleOrder.depositRequired && this.selectedProductionItemsCount > 0) {
        // Auto-set deposit percentage for production items
        if (!this.formSaleOrder.depositPercentage) {
          this.formSaleOrder.depositPercentage = 50
        }
      }
      this.updateSummary()
    },

    // Validation methods
    isQuantityInvalid(item) {
      if (item.itemType !== 'Stock') return false
      return item.isSelected && item.quantity > (item.stockAvailable || 0)
    },

    // Helper methods for UI
    getItemTypeClass(itemType) {
      return itemType === 'Stock' ? 'badge badge-info' : 'badge badge-warning'
    },

    getItemTypeIcon(itemType) {
      return itemType === 'Stock' ? 'bi bi-box' : 'bi bi-tools'
    },

    getItemTypeText(itemType) {
      return itemType === 'Stock' ? 'คงคลัง' : 'ผลิต'
    },

    getStockStatusClass(available, requested) {
      if (available >= requested) return 'text-success'
      if (available > 0) return 'text-warning'
      return 'text-danger'
    },

    // SO Number generation
    async generateSONumber() {
      try {
        this.loading = true
        const res = await this.saleOrderStore.fetchGenerateRunningNumber()
        if (res && res.data) {
          this.formSaleOrder.number = res
          success('สร้างเลขที่ใบสั่งขายเรียบร้อยแล้ว', 'สร้างเลขที่สำเร็จ')
        } else {
          throw new Error('Failed to generate SO number')
        }
      } catch (error) {
        console.error('Error generating SO number:', error)
        error('เกิดข้อผิดพลาดในการสร้างเลขที่ใบสั่งขาย', 'สร้างเลขที่ไม่สำเร็จ')
      } finally {
        this.loading = false
      }
    },

    // Action methods
    async saveDraft() {
      try {
        this.loading = true
        await this.fetchSaveSaleOrder('Draft')
        // Lock SO number after successful save
        this.isSONumberLocked = true
      } catch (error) {
        console.error('Error saving draft:', error)
        error('เกิดข้อผิดพลาดในการบันทึก', 'บันทึกไม่สำเร็จ')
      } finally {
        this.loading = false
      }
    },

    async fetchSaveSaleOrder(status = 'Draft') {
      // Prepare data for API (similar to quotation pattern)
      const stockItemsData = this.stockItems.map((item) => {
        return {
          ...item,
          imageBase64: null
        }
      })

      const copyItemsData = this.copyItems.map((item) => {
        return {
          ...item,
          imageBase64: null
        }
      })

      // Combine all items
      const allItems = [...stockItemsData, ...copyItemsData]

      const formValue = {
        soNumber: this.formSaleOrder.number || '',

        soDate: this.formSaleOrder.date ? formatISOString(this.formSaleOrder.date) : null,
        deliveryDate: this.formSaleOrder.expectedDeliveryDate
          ? formatISOString(this.formSaleOrder.expectedDeliveryDate)
          : null,

        status: this.statusOptions.find((s) => s.name === status)?.id || 0,
        statusName: status,

        refQuotation: this.formSaleOrder.quotationNumber || '',

        paymentName: this.formSaleOrder.paymentTerms || 0,
        payment:
          this.paymentTermsOptions.find((p) => p.value === this.formSaleOrder.paymentTerms)?.id ||
          '',

        depositPercent: this.formSaleOrder.depositPercentage || 0,

        priority: this.formSaleOrder.priority || 'ปกติ',

        // Customer Information
        customerName: this.formSaleOrder.customerName || '',
        customerCode: this.formSaleOrder.customerCode || 'CUST001',
        customerAddress: this.formSaleOrder.customerAddress || '',
        customerTel: this.formSaleOrder.customerPhone || '',
        customerEmail: this.formSaleOrder.customerEmail || '',
        customerRemark: this.formSaleOrder.customerRemark || '',

        // Currency and Pricing
        currencyUnit: this.formSaleOrder.currencyUnit || 'THB',
        currencyRate: this.formSaleOrder.currencyRate || 1.0,
        markup: this.formSaleOrder.markup || 0,
        goldRate: this.formSaleOrder.goldPerOz || 0,

        remark: this.formSaleOrder.remark || '',

        // Items data as JSON string
        data: JSON.stringify({
          stockItems: stockItemsData,
          copyItems: copyItemsData,
          allItems: allItems,
          freight: this.formSaleOrder.freight || 0,
          copyFreight: this.formSaleOrder.copyFreight || 0
        })
      }

      const res = await this.saleOrderStore.fetchSave({ formValue })
      if (res) {
        // Update form with saved data
        this.formSaleOrder.number = res
        return res
      } else {
        throw new Error('Save failed')
      }
    },

    async confirmOrder() {
      if (this.hasValidationErrors) {
        error('กรุณาแก้ไขข้อผิดพลาดก่อนยืนยันใบสั่งขาย', 'ไม่สามารถยืนยันได้')
        return
      }

      try {
        this.loading = true
        await this.fetchSaveSaleOrder('ยืนยันแล้ว')
        success('ยืนยันใบสั่งขายเรียบร้อยแล้ว', 'ยืนยันสำเร็จ')
      } catch (error) {
        console.error('Error confirming order:', error)
        error('เกิดข้อผิดพลาดในการยืนยัน', 'ยืนยันไม่สำเร็จ')
      } finally {
        this.loading = false
      }
    },

    cancelOrder() {
      confirmSubmit(
        'คุณต้องการยกเลิกการสร้างใบสั่งขายนี้หรือไม่?',
        'ยืนยันการยกเลิก',
        (result) => {
          if (result.isConfirmed) {
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
      this.quotationItems = []
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
        status: 'Draft',
        quotationNumber: '',
        paymentTerms: 'Cash',
        depositRequired: false,
        depositPercentage: 50,
        priority: 'normal',
        totalAmount: 0,
        remark: ''
      }
    },

    formatCurrency(amount, currency = null) {
      const formattedAmount = formatDecimal(amount, 2)
      const displayCurrency = currency || this.formSaleOrder.currencyUnit || 'THB'
      return formattedAmount + ' ' + displayCurrency
    },

    // Price calculation methods like quotation
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

    // Recalculate all prices when currency/rates change
    recalculateAll() {
      this.$forceUpdate()
    },

    // Handle price input blur event (like quotation)
    onBlurPrice(item, index, fieldName) {
      let newCal = {
        ...item,
        [fieldName]: item[fieldName] ? Number(item[fieldName]).toFixed(2) : 0,
        totalPrice: Number(item.price).toFixed(2)
      }
      this.stockItems[index] = newCal
      this.recalculateAll()
    },

    onBlurFreight(freight) {
      this.formSaleOrder.freight = freight ? Number(freight).toFixed(2) : 0
    },

    onBlurQty(item, index, fieldName) {
      let newCal = {
        ...item,
        [fieldName]: item[fieldName] ? Number(item[fieldName]) : 0
      }
      this.stockItems[index] = newCal
    },

    onBlurDescription(item, index, fieldName) {
      let newCal = {
        ...item,
        [fieldName]: item[fieldName] ? item[fieldName] : ''
      }
      this.stockItems[index] = newCal
    },

    // Copy item specific event handlers
    onBlurCopyPrice(item, index, fieldName) {
      let newCal = {
        ...item,
        [fieldName]: item[fieldName] ? Number(item[fieldName]).toFixed(2) : 0,
        totalPrice: Number(item.price).toFixed(2)
      }
      this.copyItems[index] = newCal
      this.recalculateAll()
    },

    onBlurCopyQty(item, index, fieldName) {
      let newCal = {
        ...item,
        [fieldName]: item[fieldName] ? Number(item[fieldName]) : 0
      }
      this.copyItems[index] = newCal
    },

    onBlurCopyFreight(freight) {
      this.formSaleOrder.copyFreight = freight ? Number(freight).toFixed(2) : 0
    },

    onEditCopyItem(item, index) {
      this.modelEditStock = JSON.parse(JSON.stringify(item))
      this.editStockIndex = index
      this.isShow.isEditStock = true
    },

    // Image handling
    handleImageLoaded(imageData, index) {
      if (this.stockItems[index]) {
        this.stockItems[index] = {
          ...this.stockItems[index],
          imageBase64: imageData.base64
        }
      }
    },

    // Edit stock modal
    onEditStock(item, index) {
      this.modelEditStock = JSON.parse(JSON.stringify(item))
      this.editStockIndex = index
      this.isShow.isEditStock = true
    },

    onCloseEditStockModal(payload) {
      this.isShow.isEditStock = false
      if (payload && payload.action === 'save' && payload.data) {
        this.stockItems[this.editStockIndex] = JSON.parse(JSON.stringify(payload.data))

        if (payload.data.priceDiscount !== undefined && payload.data.priceDiscount !== null) {
          this.stockItems[this.editStockIndex].discountPrice = payload.data.priceDiscount
        }
      }
      this.modelEditStock = {}
      this.editStockIndex = null
    },

    // Copy item functionality
    copyItem(item) {
      const newItem = JSON.parse(JSON.stringify(item))
      newItem.stockNumber = null
      newItem.stockNumberOrigin = null
      newItem._copyId = Date.now() + Math.random()

      if (newItem.materials && Array.isArray(newItem.materials)) {
        newItem.materials = newItem.materials.map((material) => ({ ...material }))
      }

      if (newItem.priceTransactions && Array.isArray(newItem.priceTransactions)) {
        newItem.priceTransactions = newItem.priceTransactions.map((transaction) => ({
          ...transaction
        }))
      }

      newItem.appraisalPrice = newItem.priceOrigin || newItem.price || 0
      newItem.discountPercent = newItem.discountPercent || 0
      newItem.isConfirmed = false
      this.stockItems.push(newItem)
    },

    // Customer-related methods
    onSearchCustomer() {
      this.isShow.searchCustomer = true
    },

    onCreateCustomer() {
      this.isShow.createCustomer = true
    },

    onCustomerSelected(customerData) {
      this.formSaleOrder = {
        ...this.formSaleOrder,
        customerName: customerData.nameTh || customerData.nameEn || '',
        customerAddress: customerData.address || '',
        customerPhone: customerData.telephone1 || '',
        customerEmail: customerData.email || '',
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

    // Format price like quotation
    formatPrice(price) {
      const numPrice = Number(price)
      return numPrice.toLocaleString('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },

    // Calculate totals - ใบสรุปใบสั่งขายรวมเฉพาะ stock items เท่านั้น
    calculateGrandTotal() {
      // รวมเฉพาะ stock items สำหรับใบสรุปใบสั่งขาย
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

    // Weight calculation methods
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

    // Sum calculation methods
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

    // Sales Flow Navigation Methods
    createProductionOrderForSale() {
      const productionItems = this.selectedItems.filter((item) => item.itemType === 'Production')

      if (productionItems.length === 0) {
        error('ไม่พบสินค้าที่ต้องผลิต', 'ไม่สามารถสร้างใบสั่งผลิตได้')
        return
      }

      // Navigate to Production Order with Sale Order data
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

      // Navigate to Stock Reservation with Sale Order data
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
      // Navigate to Delivery Note
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
      // Navigate to Invoice creation
      this.$router.push({
        path: '/sale/invoice',
        query: {
          saleOrderId: this.formSaleOrder.salesOrderId || 'SO-DEMO',
          saleOrderNumber: this.formSaleOrder.number,
          customerName: this.formSaleOrder.customerName,
          totalAmount: this.totalOrderAmount,
          paymentTerms: this.formSaleOrder.paymentTerms,
          depositRequired: this.formSaleOrder.depositRequired,
          depositAmount: this.totalDepositAmount
        }
      })
    },

    viewProductionStatus() {
      // Navigate to Production tracking
      this.$router.push({
        path: '/sale/production-order',
        query: {
          mode: 'view',
          saleOrderNumber: this.formSaleOrder.number
        }
      })
    },

    viewStockStatus() {
      // Navigate to Stock status
      this.$router.push({
        path: '/sale/stock-reservation',
        query: {
          mode: 'view',
          saleOrderNumber: this.formSaleOrder.number
        }
      })
    },

    viewPaymentStatus() {
      // Navigate to Payment tracking
      this.$router.push({
        path: '/sale/payment-dashboard',
        query: {
          saleOrderNumber: this.formSaleOrder.number
        }
      })
    },

    printSaleOrder() {
      try {
        success('กำลังสร้างไฟล์ PDF...', 'พิมพ์ใบสั่งขาย')
      } catch (error) {
        error('เกิดข้อผิดพลาดในการพิมพ์', 'พิมพ์ไม่สำเร็จ')
      }
    },

    backToList() {
      // Navigate back to sale order list
      this.$router.push({ path: '/sale-order-list' })
    },

    // Invoice modal methods
    openInvoiceModal() {
      if (this.confirmedStockItemsCount === 0) {
        alert('กรุณายืนยันสินค้าก่อนออก Invoice')
        return
      }

      if (this.stockItems.length === 0) {
        alert('ไม่พบสินค้าสำหรับออก Invoice')
        return
      }

      this.isShow.invoiceModal = true
    },

    onCloseInvoiceModal() {
      this.isShow.invoiceModal = false
    },

    // Confirm stock modal methods
    async openConfirmStockModal() {
      if (this.stockItems.length === 0) {
        alert('ไม่พบสินค้าสำหรับยืนยันการขาย')
        return
      }

      await this.fetchSaveSaleOrder('Draft')

      this.isShow.confirmStockModal = true
    },

    onCloseConfirmStockModal() {
      this.isShow.confirmStockModal = false
    },

    onStockItemsConfirmed(data) {
      // Update the confirmed status of items in stockItems array
      data.confirmedItems.forEach((confirmedItem) => {
        const index = this.stockItems.findIndex(
          (item) => item.id === confirmedItem.id || item.stockNumber === confirmedItem.stockNumber
        )
        if (index !== -1) {
          this.stockItems[index].isConfirmed = true
          this.stockItems[index].confirmedAt = confirmedItem.confirmedAt
        }
      })

      // Force reactivity update
      this.$forceUpdate()

      // Show success message with count
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
.btn.disabled, .btn:disabled {
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

  h6 {
    color: #495057;
    margin-bottom: 0.75rem;
    border-bottom: 1px solid #dee2e6;
    padding-bottom: 0.5rem;
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
