<template>
  <div class="app-container">
    <!-- Header Section -->
    <div class="card mb-3">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">
          <i class="bi bi-file-earmark-text mr-2"></i>
          รายละเอียด Invoice
        </h5>
        <div>
          <button class="btn btn-success btn-sm mr-2" @click="reprintPDF">
            <i class="bi bi-printer mr-1"></i>
            Reprint PDF
          </button>
          <button class="btn btn-danger btn-sm mr-2" @click="confirmReverseInvoice">
            <i class="bi bi-arrow-counterclockwise mr-1"></i>
            Reverse Invoice
          </button>
          <button class="btn btn-secondary btn-sm" @click="goBack">
            <i class="bi bi-arrow-left mr-1"></i>
            ย้อนกลับ
          </button>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="loadError" class="alert alert-danger">
      <i class="bi bi-exclamation-triangle mr-2"></i>
      {{ loadError }}
    </div>

    <!-- Invoice Detail Content -->
    <div v-else-if="invoiceData && invoiceData.invoiceNumber">
      <!-- Invoice and Customer Information -->
      <div class="card-container mb-3">
        <div class="card-header">
          <h6 class="mb-0"><i class="bi bi-file-earmark-text mr-2"></i>ข้อมูล Invoice และลูกค้า</h6>
        </div>
        <div class="card-body">
          <!-- Invoice Information Section -->
          <div class="info-section mb-4">
            <h6 class="section-title mb-3"><i class="bi bi-receipt mr-2"></i>ข้อมูล Invoice</h6>
            <div class="row">
              <div class="col-md-3">
                <div class="info-item">
                  <label class="info-label">เลขที่ Invoice</label>
                  <p class="info-value font-weight-bold text-primary">
                    {{ invoiceData.invoiceNumber || '-' }}
                  </p>
                </div>
              </div>
              <div class="col-md-3">
                <div class="info-item">
                  <label class="info-label">เลขที่ SO</label>
                  <p class="info-value">{{ invoiceData.soNumber || '-' }}</p>
                </div>
              </div>
              <div class="col-md-3">
                <div class="info-item">
                  <label class="info-label">วันที่สร้าง</label>
                  <p class="info-value">{{ formatDate(invoiceData.createDate) }}</p>
                </div>
              </div>
              <div class="col-md-3">
                <div class="info-item">
                  <label class="info-label">วันกำหนดส่ง</label>
                  <p class="info-value">{{ formatDate(invoiceData.deliveryDate) }}</p>
                </div>
              </div>
            </div>
            <div class="row mt-3">
              <div class="col-md-3">
                <div class="info-item">
                  <label class="info-label">สถานะ</label>
                  <p class="info-value">
                    <span :class="getStatusBadgeClass(invoiceData.statusName)">
                      {{ invoiceData.statusName || '-' }}
                    </span>
                  </p>
                </div>
              </div>
              <div class="col-md-3">
                <div class="info-item">
                  <label class="info-label">ผู้สร้าง</label>
                  <p class="info-value">{{ invoiceData.createBy || '-' }}</p>
                </div>
              </div>
              <div class="col-md-3">
                <div class="info-item">
                  <label class="info-label">สกุลเงิน</label>
                  <p class="info-value">
                    {{ invoiceData.currencyUnit || 'THB' }} ({{
                      formatNumber(invoiceData.currencyRate)
                    }})
                  </p>
                </div>
              </div>
              <div class="col-md-3"></div>
            </div>
          </div>

          <!-- Customer Information Section -->
          <div class="info-section">
            <h6 class="section-title mb-3"><i class="bi bi-person mr-2"></i>ข้อมูลลูกค้า</h6>
            <div class="row">
              <div class="col-md-4">
                <div class="info-item">
                  <label class="info-label">ชื่อลูกค้า</label>
                  <p class="info-value font-weight-bold">{{ invoiceData.customerName || '-' }}</p>
                </div>
              </div>
              <div class="col-md-4">
                <div class="info-item">
                  <label class="info-label">เบอร์โทร</label>
                  <p class="info-value">
                    <i class="bi bi-telephone mr-1"></i>{{ invoiceData.customerTel || '-' }}
                  </p>
                </div>
              </div>
              <div class="col-md-4">
                <div class="info-item">
                  <label class="info-label">อีเมล</label>
                  <p class="info-value">
                    <i class="bi bi-envelope mr-1"></i>{{ invoiceData.customerEmail || '-' }}
                  </p>
                </div>
              </div>
            </div>
            <div class="row mt-3">
              <div class="col-md-12">
                <div class="info-item">
                  <label class="info-label">ที่อยู่</label>
                  <p class="info-value">{{ invoiceData.customerAddress || '-' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Invoice Items -->
      <div class="card-container mb-3">
        <div class="card-header">
          <h6 class="mb-0">รายการสินค้า</h6>
        </div>
        <div class="card-body p-0">
          <DataTable
            :value="invoiceItems"
            class="p-datatable-sm"
            :scrollable="true"
            stripedRows
            responsiveLayout="scroll"
            showGridlines
          >
            <ColumnGroup type="header">
              <Row>
                <Column header="#" />
                <Column header="รูปภาพ" />
                <Column header="เลขที่ผลิต (ใหม่)" />
                <Column header="เลขที่ผลิต (เก่า)" />
                <Column header="รหัสสินค้า" />
                <Column header="รายละเอียด" />
                <Column header="Gold (gms)" />
                <Column header="Diamond (cts)" />
                <Column header="Stone (cts)" />
                <Column header="ราคาขาย (THB)" />
                <Column header="ราคาประเมิน (THB)" />
                <Column header="ส่วนลด (%)" />
                <Column header="ราคาส่วนลด (THB)" />
                <Column header="แปลงเรท" />
                <Column :header="'ราคาแปลง (' + (invoiceData.currencyUnit || 'THB') + ')'" />
                <Column header="จำนวน" />
                <Column :header="'รวมราคา (' + (invoiceData.currencyUnit || 'THB') + ')'" />
              </Row>
            </ColumnGroup>

            <Column field="index" style="width: 10px">
              <template #body="slotProps">
                <span>{{ slotProps.index + 1 }}</span>
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

            <Column field="description" header="รายละเอียด" style="min-width: 200px">
              <template #body="slotProps">
                <input
                  v-if="!slotProps.data.isConfirm && !slotProps.data.invoice"
                  v-model="slotProps.data.description"
                  type="text"
                  class="form-control bg-input input-bg"
                  @blur="
                    onBlurDescription(slotProps.data, slotProps.data.stockNumber, 'description')
                  "
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
                      onBlurPrice(slotProps.data, slotProps.data.stockNumber, 'appraisalPrice')
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
                      onBlurPrice(slotProps.data, slotProps.data.stockNumber, 'discountPercent')
                    "
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

            <!-- Footer -->
            <ColumnGroup type="footer">
              <!-- Total Row -->
              <Row>
                <!-- Columns: #, รูปภาพ, เลขที่ผลิต (ใหม่), เลขที่ผลิต (เก่า) = 4 cols -->
                <Column :colspan="4">
                  <template #footer>
                    <div class="text-left type-container">
                      <span class="mr-2">Net Weight Of Merchandise</span>
                      <span class="mr-2">{{ getNetWeight(invoiceItems) }}</span>
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
                      <span>{{ getGoldWeight(invoiceItems) }}</span>
                    </div>
                  </template>
                </Column>

                <Column>
                  <template #footer>
                    <div class="text-right type-container">
                      <span>{{ getDiamondWeight(invoiceItems) }}</span>
                    </div>
                  </template>
                </Column>

                <Column>
                  <template #footer>
                    <div class="text-right type-container">
                      <span>{{ getGemWeight(invoiceItems) }}</span>
                    </div>
                  </template>
                </Column>

                <!-- ราคาขาย + ราคาประเมิน = 2 cols -->
                <Column :colspan="2">
                  <template #footer>
                    <div class="text-right type-container">
                      <span>{{ getSumAppraisalPrice(invoiceItems) }}</span>
                    </div>
                  </template>
                </Column>
                <!-- ส่วนลด + ราคาส่วนลด = 2 cols -->
                <Column :colspan="2">
                  <template #footer>
                    <div class="text-right type-container">
                      <span>{{ getSumDiscountPrice(invoiceItems) }}</span>
                    </div>
                  </template>
                </Column>
                <!-- แปลงเรท + ราคาแปลง = 2 cols -->
                <Column :colspan="2">
                  <template #footer>
                    <div class="text-right type-container">
                      <span>{{ getSumConvertedPrice(invoiceItems) }}</span>
                    </div>
                  </template>
                </Column>
                <!-- จำนวน = 1 col -->
                <Column>
                  <template #footer>
                    <div class="text-right type-container">
                      <span>{{ getSumQty(invoiceItems) }}</span>
                    </div>
                  </template>
                </Column>
                <!-- รวมราคา = 1 col -->
                <Column>
                  <template #footer>
                    <div class="text-right type-container">
                      <span>{{ getSumTotalConvertedPrice(invoiceItems) }}</span>
                    </div>
                  </template>
                </Column>
              </Row>

              <!-- ส่วนลดพิเศษ -->
              <Row>
                <Column :colspan="16">
                  <template #footer>
                    <div class="text-right type-container">
                      <span>ส่วนลดพิเศษ:</span>
                    </div>
                  </template>
                </Column>
                <Column>
                  <template #footer>
                    <div class="text-right type-container">
                      <span>{{ formatNumber(invoiceData.specialDiscount || 0) }}</span>
                    </div>
                  </template>
                </Column>
              </Row>

              <!-- ส่วนเพิ่มพิเศษ -->
              <Row>
                <Column :colspan="16">
                  <template #footer>
                    <div class="text-right type-container">
                      <span>ส่วนเพิ่มพิเศษ:</span>
                    </div>
                  </template>
                </Column>
                <Column>
                  <template #footer>
                    <div class="text-right type-container">
                      <span>{{ formatNumber(invoiceData.specialAddition || 0) }}</span>
                    </div>
                  </template>
                </Column>
              </Row>

              <!-- ยอดรวมหลังปรับ -->
              <Row>
                <Column :colspan="16">
                  <template #footer>
                    <div class="text-right type-container">
                      <span class="font-weight-bold">ยอดรวมหลังปรับ:</span>
                    </div>
                  </template>
                </Column>
                <Column>
                  <template #footer>
                    <div class="text-right type-container">
                      <span class="font-weight-bold">{{
                        formatNumber(totalAfterDiscountAndAddition)
                      }}</span>
                    </div>
                  </template>
                </Column>
              </Row>

              <!-- Freight & Insurance -->
              <Row>
                <Column :colspan="16">
                  <template #footer>
                    <div class="text-right type-container">
                      <span>Freight & Insurance:</span>
                    </div>
                  </template>
                </Column>
                <Column>
                  <template #footer>
                    <div class="text-right type-container">
                      <span>{{ formatNumber(invoiceData.freightAndInsurance || 0) }}</span>
                    </div>
                  </template>
                </Column>
              </Row>

              <!-- ยอดรวมสุดท้าย -->
              <Row>
                <Column :colspan="16">
                  <template #footer>
                    <div class="text-right type-container">
                      <h6 class="mb-0 text-primary">ยอดรวม Invoice:</h6>
                    </div>
                  </template>
                </Column>
                <Column>
                  <template #footer>
                    <div class="text-right type-container">
                      <h6 class="mb-0 font-weight-bold text-primary">
                        {{ formatNumber(grandTotal) }}
                      </h6>
                    </div>
                  </template>
                </Column>
              </Row>
            </ColumnGroup>
          </DataTable>
        </div>
      </div>

      <!-- Payment and Financial Summary -->
      <div class="card-container mb-3">
        <div class="card-header">
          <h6 class="mb-0"><i class="bi bi-credit-card mr-2"></i>ข้อมูลการชำระเงินและสรุปยอด</h6>
        </div>
        <div class="card-body">
          <!-- Payment Information Section -->
          <div class="info-section mb-4">
            <h6 class="section-title mb-3"><i class="bi bi-wallet2 mr-2"></i>ข้อมูลการชำระเงิน</h6>
            <div class="row">
              <div class="col-md-3">
                <div class="info-item">
                  <label class="info-label">วิธีการชำระเงิน</label>
                  <p class="info-value">
                    <i class="bi bi-cash-stack mr-2"></i>{{ invoiceData.paymentName || '-' }}
                  </p>
                </div>
              </div>
              <div class="col-md-3">
                <div class="info-item">
                  <label class="info-label">ระยะเวลาชำระ (วัน)</label>
                  <p class="info-value">
                    <i class="bi bi-calendar-event mr-2"></i>{{ invoiceData.paymentDay || 0 }} วัน
                    <span v-if="invoiceData.paymentDay > 0" class="text-muted ml-2"
                      >({{ calculateDueDate() }})</span
                    >
                  </p>
                </div>
              </div>
              <div class="col-md-3">
                <div class="info-item">
                  <label class="info-label">ราคามัดจำ</label>
                  <p class="info-value font-weight-bold text-success">
                    {{ formatPriceWithCurrency(invoiceData.deposit || 0) }}
                  </p>
                </div>
              </div>
              <div class="col-md-3">
                <div class="info-item">
                  <label class="info-label">ยอดคงเหลือที่ต้องชำระ</label>
                  <p class="info-value font-weight-bold text-danger">
                    {{ formatPriceWithCurrency(grandTotal - (invoiceData.deposit || 0)) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Financial Summary Section -->
          <div class="info-section">
            <h6 class="section-title mb-3"><i class="bi bi-calculator mr-2"></i>สรุปยอดเงิน</h6>
            <div class="row">
              <div class="col-md-3">
                <div class="info-item">
                  <label class="info-label">สกุลเงิน</label>
                  <p class="info-value">
                    {{ invoiceData.currencyUnit || 'THB' }}
                  </p>
                </div>
              </div>
              <div class="col-md-3">
                <div class="info-item">
                  <label class="info-label">อัตราแลกเปลี่ยน</label>
                  <p class="info-value">{{ formatNumber(invoiceData.currencyRate) }}</p>
                </div>
              </div>
              <div class="col-md-3">
                <div class="info-item">
                  <label class="info-label">ส่วนลดพิเศษ</label>
                  <p class="info-value text-danger">
                    -{{ formatNumber(invoiceData.specialDiscount || 0) }}
                  </p>
                </div>
              </div>
              <div class="col-md-3">
                <div class="info-item">
                  <label class="info-label">ส่วนเพิ่มพิเศษ</label>
                  <p class="info-value text-success">
                    +{{ formatNumber(invoiceData.specialAddition || 0) }}
                  </p>
                </div>
              </div>
            </div>
            <div class="row mt-3">
              <div class="col-md-6">
                <div class="info-item">
                  <label class="info-label">Freight & Insurance</label>
                  <p class="info-value">
                    {{ formatNumber(invoiceData.freightAndInsurance || 0) }}
                  </p>
                </div>
              </div>
              <div class="col-md-3">
                <div class="info-item">
                  <label class="info-label">ยอดรวมหลังปรับ</label>
                  <p class="info-value font-weight-bold">
                    {{ formatNumber(totalAfterDiscountAndAddition) }}
                  </p>
                </div>
              </div>
              <div class="col-md-3">
                <div class="info-item highlight-total">
                  <label class="info-label">ยอดรวม Invoice</label>
                  <p class="info-value font-weight-bold text-primary">
                    <i class="bi bi-receipt mr-2"></i>{{ formatPriceWithCurrency(grandTotal) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Remark -->
      <div v-if="invoiceData.remark" class="card-container mb-3">
        <div class="card-header">
          <h6 class="mb-0">หมายเหตุ</h6>
        </div>
        <div class="card-body">
          <p class="mb-0">{{ invoiceData.remark }}</p>
        </div>
      </div>
    </div>

    <!-- No Data State -->
    <div v-else class="alert alert-warning">
      <i class="bi bi-info-circle mr-2"></i>
      ไม่พบข้อมูล Invoice
    </div>
  </div>
</template>

<script>
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ColumnGroup from 'primevue/columngroup'
import Row from 'primevue/row'
import imagePreview from '@/components/prime-vue/ImagePreviewEmit.vue'
import { useInvoiceApiStore } from '@/stores/modules/api/sale/invoice-store.js'
import { usrSaleOrderApiStore } from '@/stores/modules/api/sale/sale-order-store.js'
import { error, success, confirmSubmit } from '@/services/alert/sweetAlerts.js'
import { invoicePdfService } from '@/services/helper/pdf/invoice/invoice-pdf-integration.js'
import dayjs from 'dayjs'

export default {
  name: 'InvoiceDetailView',

  components: {
    DataTable,
    Column,
    ColumnGroup,
    Row,
    imagePreview
  },

  data() {
    return {
      invoiceData: null,
      invoiceItems: [],
      loadError: null,
      invoiceStore: useInvoiceApiStore(),
      saleOrderStore: usrSaleOrderApiStore(),
      fromRoute: null, // Store the route we came from
      formSaleOrder: {},
      type: 'STOCK-PRODUCT'
    }
  },

  computed: {
    totalSelectedAmount() {
      return Number(this.getSumTotalConvertedPrice(this.invoiceItems) || 0)
    },

    // ยอดรวมหลังหักส่วนลดพิเศษและเพิ่มส่วนพิเศษ
    totalAfterDiscountAndAddition() {
      const baseTotal = this.totalSelectedAmount
      const afterDiscount = baseTotal - Number(this.invoiceData?.specialDiscount || 0)
      const afterAddition = afterDiscount + Number(this.invoiceData?.specialAddition || 0)
      return afterAddition
    },

    // ยอดรวมสุดท้ายรวมค่าขนส่ง
    grandTotal() {
      return this.totalAfterDiscountAndAddition + Number(this.invoiceData?.freightAndInsurance || 0)
    }
  },

  async mounted() {
    // Store the route we came from for navigation after delete
    this.fromRoute = this.$route.query.from || null

    // Get invoice number from route query
    const invoiceNumber = this.$route.query.invoiceNumber
    if (invoiceNumber) {
      await this.loadInvoiceData(invoiceNumber)
    } else {
      this.loadError = 'ไม่พบเลขที่ Invoice ในระบบ'
    }
  },

  methods: {
    async loadInvoiceData(invoiceNumber) {
      // Load Invoice data - same structure as Sale Order
      const invoiceResponse = await this.invoiceStore.fetchGet({
        formValue: { invoiceNumber: invoiceNumber }
      })

      const saleOrderData = await this.getSaleOrderData(invoiceResponse.soNumber)
      if (saleOrderData) {
        this.invoiceData = invoiceResponse
        //console.log('saleOrderData', saleOrderData)
        //this.loadSaleOrderData(response, invoiceResponse)

        this.formSaleOrder = {
          number: saleOrderData.number || '',
          date: saleOrderData.date || new Date(),
          expectedDeliveryDate: saleOrderData.expectedDeliveryDate || null,
          quotationNumber: saleOrderData.quotationNumber || '',
          depositRequired: saleOrderData.depositRequired || false,
          priority: saleOrderData.priority || 'normal',
          remark: saleOrderData.remark || '',
          customerRemark: saleOrderData.customer?.remark || '',

          customerCode: saleOrderData.customerCode || '',
          customerName: saleOrderData.customerName || '',
          customerAddress: saleOrderData.customerAddress || '',
          customerPhone: saleOrderData.customerPhone || '',
          customerEmail: saleOrderData.customerEmail || '',

          currencyUnit: saleOrderData.currencyUnit || 'US$',
          currencyRate: saleOrderData.currencyRate || 33.0,
          markup: saleOrderData.markup || 3.5,
          goldPerOz: saleOrderData.goldPerOz || 2000,
          freight: saleOrderData.freight || 0,
          copyFreight: saleOrderData.copyFreight || 0
        }

        //this.invoiceItems = saleOrderData.items.stockItems || []

        if (saleOrderData.items) {
          if (saleOrderData.items.stockItems || saleOrderData.items.copyItems) {
            this.invoiceItems = saleOrderData.items.stockItems || []
          } else if (Array.isArray(saleOrderData.items)) {
            this.invoiceItems = saleOrderData.items.filter((item) => item.stockNumber != null)
          } else if (Array.isArray(saleOrderData.items.allItems)) {
            this.invoiceItems = saleOrderData.items.allItems.filter(
              (item) => item.stockNumber != null
            )
          }

          console.log('invoice data items', invoiceResponse)

          //filter this.invoiceItems in invoiceResponse.items
          this.invoiceItems = this.invoiceItems.filter((item) => {
            return invoiceResponse.confirmedItems.some(
              (invItem) => invItem.stockNumber === item.stockNumber
            )
          })
        }

        //console.log('this.saleOrderData', this.formSaleOrder)
        // this.invoiceItems = saleOrderData.items.allItems.filter(
        //   (item) => item.stockNumber != null
        // )
      }
    },

    loadSaleOrderData(saleOrderData) {
      if (!saleOrderData) return

      ////console.log('Loading sale order data:', saleOrderData)

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
        copyFreight: saleOrderData.copyFreight || 0
      })

      if (saleOrderData.items) {
        if (saleOrderData.items.stockItems || saleOrderData.items.copyItems) {
          this.invoiceItems = saleOrderData.items.stockItems || []
        } else if (Array.isArray(saleOrderData.items)) {
          this.invoiceItems = saleOrderData.items.filter((item) => item.stockNumber != null)
        } else if (Array.isArray(saleOrderData.items.allItems)) {
          this.invoiceItems = saleOrderData.items.allItems.filter(
            (item) => item.stockNumber != null
          )
        }
      }

      ////console.log('saleOrderData.confirmedItems', saleOrderData)
      ////console.log('saleOrderData.confirmedItems', saleOrderData.confirmedItems)

      this.stockItems.forEach((item) => {
        item.isConfirm = false
        item.isInvoice = false
        item.invoice = null
        item.invoiceItem = null

        item.discountPercent = item.discountPercent || 0

        const confirmedItem = saleOrderData.confirmedItems.find(
          (ci) => ci.stockNumber === item.stockNumber
        )

        if (confirmedItem) {
          item.id = confirmedItem.id
          item.stockNumber = confirmedItem.stockNumber

          item.isConfirm = confirmedItem.isConfirm
          item.isInvoice = confirmedItem.isInvoice
          item.invoice = confirmedItem.invoice

          item.invoiceItem = confirmedItem.invoiceItem

          item.isRemainProduct = confirmedItem.isRemainProduct
          item.message = confirmedItem.message
        }
      })
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
          remark: response.remark || null,
          items: response.data
            ? (() => {
                try {
                  const parsedData = JSON.parse(response.data)
                  return parsedData
                } catch (e) {
                  console.error('Error parsing data:', e)
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
            name: response.customerName || '',
            address: response.customerAddress || '',
            phone: response.customerTel || '',
            email: response.customerEmail || '',
            remark: response.customerRemark || ''
          }
        }
      }

      ////console.log('get new saleOrderData', saleOrderData)
      return saleOrderData
    },

    formatDate(date) {
      if (!date) return '-'
      return dayjs(date).format('DD/MM/YYYY')
    },
    formatNumber(value) {
      if (!value && value !== 0) return '0.00'
      return Number(value).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },
    formatPriceWithCurrency(price) {
      const currency = this.invoiceData?.currencyUnit || 'THB'
      return `${this.formatNumber(price)} ${currency}`
    },
    calculateDueDate() {
      if (!this.invoiceData?.paymentDay || this.invoiceData.paymentDay <= 0) return '-'
      const createDate = this.invoiceData.createDate
        ? new Date(this.invoiceData.createDate)
        : new Date()
      const dueDate = new Date(createDate)
      dueDate.setDate(dueDate.getDate() + this.invoiceData.paymentDay)
      return this.formatDate(dueDate)
    },
    getStatusBadgeClass(status) {
      const statusMap = {
        Draft: 'badge badge-secondary',
        Confirmed: 'badge badge-success',
        Cancelled: 'badge badge-danger',
        Pending: 'badge badge-warning'
      }
      return statusMap[status] || 'badge badge-info'
    },
    calculateTotal() {
      let total = 0
      this.invoiceItems.forEach((item) => {
        total += (item.price || 0) * (item.qty || 0)
      })

      // Apply discount
      total -= this.invoiceData.discount || 0

      return total
    },

    // Weight calculation methods - same as Sale Order
    getNetWeight(items) {
      if (!items || !Array.isArray(items) || items.length === 0) return '0.00'

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
      if (!items || !Array.isArray(items) || items.length === 0) return '0.00'

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
      if (!items || !Array.isArray(items) || items.length === 0) return '0.00'

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
      if (!items || !Array.isArray(items) || items.length === 0) return '0.00'

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

    // Price calculation methods
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
      const currencyRate = this.invoiceData.currencyRate || 1
      return discountedPrice / currencyRate
    },

    getTotalConvertedPrice(item) {
      const convertedPrice = this.getConvertedPrice(item)
      const qty = item.qty || 0
      return convertedPrice * qty
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

    calculateGrandTotal() {
      const total = this.invoiceItems.reduce((sum, item) => {
        return sum + this.getTotalConvertedPrice(item)
      }, 0)

      return total
    },
    goBack() {
      this.$router.back()
    },
    async reprintPDF() {
      try {
        if (!this.invoiceData || !this.invoiceData.invoiceNumber) {
          error('ไม่พบข้อมูล Invoice', 'ไม่สามารถสร้าง PDF ได้')
          return
        }

        // Prepare data for PDF generation matching the expected structure
        const pdfData = {
          saleOrder: {
            soNumber: this.invoiceData.soNumber,
            date: this.invoiceData.createDate,
            expectedDeliveryDate: this.invoiceData.deliveryDate,
            paymentTerms: this.invoiceData.paymentName,
            depositPercent: this.invoiceData.depositPercent,
            remark: this.invoiceData.remark
          },
          customer: {
            name: this.invoiceData.customerName,
            address: this.invoiceData.customerAddress,
            tel: this.invoiceData.customerTel,
            email: this.invoiceData.customerEmail
          },
          currency: {
            unit: this.invoiceData.currencyUnit || 'THB',
            rate: this.invoiceData.currencyRate || 1
          },
          items: this.invoiceItems
        }

        const options = {
          invoiceNo: this.invoiceData.invoiceNumber,
          invoiceDate: dayjs(this.invoiceData.createDate).format('DD/MM/YYYY'),
          download: true,
          open: false
        }

        //////console.log('Generating PDF with data:', pdfData)

        await invoicePdfService.generateInvoicePDF(pdfData, options)
        success('สร้าง PDF สำเร็จ', 'Invoice PDF')
      } catch (err) {
        console.error('Error generating PDF:', err)
        error(err.message || 'ไม่สามารถสร้าง PDF ได้', 'เกิดข้อผิดพลาด')
      }
    },
    getImageUrl(imagePath) {
      if (!imagePath) return ''
      // Construct full image URL based on API base path
      // Adjust this path according to your API configuration
      const baseUrl = this.$store.state.apiBaseUrl || 'https://localhost:49153'
      return `${baseUrl}/Images/Stock/${imagePath}`
    },
    handleImageError(event) {
      // Hide broken image or show placeholder
      event.target.style.display = 'none'
    },
    async confirmReverseInvoice() {
      try {
        // Show confirmation dialog
        confirmSubmit(
          'การยกเลิก Invoice จะลบข้อมูลการออก Invoice และคืนสถานะสินค้ากลับไปยัง Sale Order',
          'คุณต้องการยกเลิก Invoice นี้หรือไม่?',
          async (result) => {
            if (result.isConfirmed) {
              await this.reverseInvoice()
            }
          },
          {
            confirmText: 'ยืนยัน',
            cancelText: 'ยกเลิก'
          },
          'warning'
        )
      } catch (err) {
        console.error('Error in confirmation:', err)
      }
    },
    async reverseInvoice() {
      try {
        if (!this.invoiceData || !this.invoiceData.invoiceNumber) {
          error('ไม่พบข้อมูล Invoice', 'ไม่สามารถยกเลิก Invoice ได้')
          return
        }

        // Call delete API
        await this.invoiceStore.fetchDelete({
          formValue: { invoiceNumber: this.invoiceData.invoiceNumber }
        })

        // Show success message
        success('ยกเลิก Invoice สำเร็จ', 'Invoice ได้ถูกยกเลิกแล้ว')

        // Navigate based on where we came from
        if (this.fromRoute === 'sale-order' && this.invoiceData.soNumber) {
          // If we came from sale-order, go back to sale-order with the SO number
          // This will trigger the sale-order page to reload the data
          this.$router.push({
            path: '/sale/sale-order',
            query: { soNumber: this.invoiceData.soNumber, mode: 'view' }
          })
        } else {
          // Otherwise just go back to previous page
          this.$router.back()
        }
      } catch (err) {
        console.error('Error reversing invoice:', err)
        error(err.message || 'ไม่สามารถยกเลิก Invoice ได้', 'เกิดข้อผิดพลาด')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.app-container {
  padding: 1rem;
}

.card-container {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-header {
  background: var(--base-font-color);
  border-bottom: 1px solid #e9ecef;
  border-radius: 5px 5px 0px 0px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  font-weight: 300;
  color: white;
}

.card-body {
  padding: 1rem;
}

.form-control-plaintext {
  padding-top: 0.375rem;
  padding-bottom: 0.375rem;
  margin-bottom: 0;
  line-height: 1.5;
}

.badge {
  font-size: 0.875rem;
  padding: 0.375rem 0.75rem;
}

// Material cell styling for table
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
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.material-typecode-gold {
  flex: 5;
  text-align: left;
  margin-right: 0.5rem;
  min-width: 40px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  color: #d4af37;
  font-weight: 600;
}

.material-weight {
  flex: 3;
  text-align: right;
  min-width: 60px;
  margin-left: auto;
  font-weight: 500;
}

// Table styling - same as Sale Order
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

.qty-container {
  text-align: right;
  min-width: 80px;
}

.text-right {
  text-align: right;
}

.type-container {
  font-size: 13px;
  font-weight: bold;
  color: var(--base-font-color);
  padding: 5px;
}

.qty-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-right: 5px;
}

// Info section styles
.info-section {
  position: relative;
  padding: 1rem 0;

  &:not(:last-child) {
    border-bottom: 2px solid #f0f0f0;
  }

  .section-title {
    color: var(--base-font-color);
    font-weight: 600;
    font-size: 1rem;
    display: flex;
    align-items: center;
    margin-bottom: 1rem;

    i {
      color: var(--base-font-color);
    }
  }
}

.info-item {
  ฝฝmargin-bottom: 0.5rem;

  .info-label {
    font-size: 0.75rem;
    color: #6c757d;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.25rem;
    display: block;
  }

  .info-value {
    font-size: 0.95rem;
    color: #2c3e50;
    margin-bottom: 0;
    padding: 0.5rem;
    background-color: #f8f9fa;
    border-radius: 4px;
    min-height: 38px;
    display: flex;
    align-items: center;

    i {
      color: var(--base-font-color);
      font-size: 0.9rem;
    }
  }
}
</style>
