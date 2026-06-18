<template>
  <div class="app-container">
    <!-- Header Section -->
    <div class="card mb-3">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">
          <i class="bi bi-file-earmark-text mr-2"></i>
          {{ $t('view.sale.invoiceDetail.title') }}
          <span v-if="currentViewingVersion" class="badge badge-warning ml-2">
            <i class="bi bi-eye mr-1"></i>
            {{ $t('view.sale.invoiceDetail.viewingVersion') }}: {{ currentViewingVersion }}
          </span>
        </h5>
        <div>
          <button
            v-if="currentViewingVersion"
            class="btn btn-outline-main btn-sm mr-2"
            @click="restoreOriginalView"
          >
            <i class="bi bi-arrow-left mr-1"></i>
            {{ $t('view.sale.invoiceDetail.restoreOriginal') }}
          </button>
          <button class="btn btn-green btn-sm btn-header-action mr-2" @click="openVersionModal">
            <i class="bi bi-plus-circle mr-1"></i>
            {{ $t('view.sale.invoiceDetail.addVersion') }}
          </button>
          <button class="btn btn-green btn-sm btn-header-action mr-2" @click="reprintPDF">
            <i class="bi bi-printer mr-1"></i>
            {{ $t('view.sale.invoiceDetail.printInvoice') }}
          </button>
          <button class="btn btn-green btn-sm btn-header-action mr-2" @click="spikeTestHello">
            <i class="bi bi-usb-symbol mr-1"></i>
            {{ $t('view.sale.invoiceDetail.testHelloUsb') }}
          </button>
          <button class="btn btn-green btn-sm btn-header-action mr-2" @click="exportInvoiceExcel">
            <i class="bi bi-file-earmark-excel mr-1"></i>
            {{ $t('view.sale.invoiceDetail.exportExcel') }}
          </button>
          <button class="btn btn-green btn-sm btn-header-action mr-2" @click="printDeliveryNote">
            <i class="bi bi-truck mr-1"></i>
            {{ $t('view.sale.invoiceDetail.printDelivery') }}
          </button>
          <button
            class="btn btn-red btn-sm btn-header-action mr-2"
            @click="confirmReverseInvoice"
          >
            <i class="bi bi-arrow-counterclockwise mr-1"></i>
            {{ $t('view.sale.invoiceDetail.cancelDocument') }}
          </button>
          <button class="btn btn-outline-main btn-sm btn-header-action" @click="goBack">
            <i class="bi bi-arrow-left mr-1"></i>
            {{ $t('view.sale.invoiceDetail.goBack') }}
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
          <h6 class="mb-0"><i class="bi bi-file-earmark-text mr-2"></i>{{ $t('view.sale.invoiceDetail.invoiceAndCustomer') }}</h6>
        </div>
        <div class="card-body">
          <!-- Invoice Information Section -->
          <div class="info-section mb-2">
            <h6 class="section-title mb-2"><i class="bi bi-receipt mr-2"></i>{{ $t('view.sale.invoiceDetail.invoiceInfo') }}</h6>
            <div class="row">
              <div class="col-md-3">
                <div class="info-item">
                  <label class="info-label">{{ $t('view.sale.invoice.invoiceNumber') }}</label>
                  <p class="info-value font-weight-bold text-primary">
                    {{ invoiceData.invoiceNumber || '-' }}
                  </p>
                </div>
              </div>
              <div class="col-md-3">
                <div class="info-item">
                  <label class="info-label">{{ $t('view.sale.invoiceDetail.soNumber') }}</label>
                  <p class="info-value">{{ invoiceData.soNumber || '-' }}</p>
                </div>
              </div>
              <div class="col-md-3">
                <div class="info-item">
                  <label class="info-label">{{ $t('view.sale.invoice.createDate') }}</label>
                  <p class="info-value">{{ formatDate(invoiceData.createDate) }}</p>
                </div>
              </div>
              <div class="col-md-3">
                <div class="info-item">
                  <label class="info-label">{{ $t('view.sale.invoiceDetail.deliveryDateLabel') }}</label>
                  <p class="info-value">{{ formatDate(invoiceData.deliveryDate) }}</p>
                </div>
              </div>
            </div>
            <div class="row mt-1">
              <div class="col-md-3">
                <div class="info-item">
                  <label class="info-label">{{ $t('view.sale.invoice.status') }}</label>
                  <p class="info-value">
                    <span :class="getStatusBadgeClass(invoiceData.statusName)">
                      {{ invoiceData.statusName || '-' }}
                    </span>
                  </p>
                </div>
              </div>
              <div class="col-md-3">
                <div class="info-item">
                  <label class="info-label">{{ $t('view.sale.invoice.createBy') }}</label>
                  <p class="info-value">{{ invoiceData.createBy || '-' }}</p>
                </div>
              </div>
              <div class="col-md-3">
                <div class="info-item">
                  <label class="info-label">{{ $t('view.sale.invoiceDetail.currencyLabel') }}</label>
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
            <h6 class="section-title mb-2"><i class="bi bi-person mr-2"></i>{{ $t('view.sale.invoiceDetail.customerInfo') }}</h6>
            <div class="row">
              <div class="col-md-4">
                <div class="info-item">
                  <label class="info-label">{{ $t('view.sale.invoice.customerName') }}</label>
                  <p class="info-value font-weight-bold">
                    {{ invoiceData.customerName || '-' }}
                  </p>
                </div>
              </div>
              <div class="col-md-4">
                <div class="info-item">
                  <label class="info-label">{{ $t('view.sale.invoiceDetail.customerTel') }}</label>
                  <p class="info-value">
                    <i class="bi bi-telephone mr-1"></i>{{ invoiceData.customerTel || '-' }}
                  </p>
                </div>
              </div>
              <div class="col-md-4">
                <div class="info-item">
                  <label class="info-label">{{ $t('view.sale.invoiceDetail.customerEmail') }}</label>
                  <p class="info-value">
                    <i class="bi bi-envelope mr-1"></i>{{ invoiceData.customerEmail || '-' }}
                  </p>
                </div>
              </div>
            </div>
            <div class="row mt-1">
              <div class="col-md-12">
                <div class="info-item">
                  <label class="info-label">{{ $t('view.sale.invoiceDetail.customerAddress') }}</label>
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
          <h6 class="mb-0">{{ $t('view.sale.invoiceDetail.productList') }}</h6>
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
                <Column :header="$t('view.sale.invoiceDetail.imageHeader')" />
                <Column :header="$t('view.sale.saleOrder.stockNumberNew')" />
                <Column :header="$t('view.sale.saleOrder.stockNumberOld')" />
                <Column :header="$t('view.sale.saleOrder.productCode')" />
                <Column :header="$t('view.sale.saleOrder.description')" />
                <Column header="Gold (gms)" />
                <Column header="Diamond (cts)" />
                <Column header="Stone (cts)" />
                <Column :header="$t('view.sale.saleOrder.salePriceTHB')" />
                <Column :header="$t('view.sale.saleOrder.appraisalPriceTHB')" />
                <Column :header="$t('view.sale.saleOrder.discountPercent')" />
                <Column :header="$t('view.sale.invoiceDetail.priceAfterDiscount')" />
                <Column :header="$t('view.sale.saleOrder.convertedRate')" />
                <Column :header="'ราคาแปลง (' + (invoiceData.currencyUnit || 'THB') + ')'" />
                <Column :header="$t('view.sale.quotation.quantity')" />
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

            <Column field="priceOrigin" :header="$t('view.sale.saleOrder.salePriceTHB')" style="min-width: 150px">
              <template #body="slotProps">
                <div class="qty-container">
                  <span>{{
                    Number(slotProps.data.priceOrigin || slotProps.data.price || 0).toFixed(2)
                  }}</span>
                </div>
              </template>
            </Column>

            <Column field="appraisalPrice" :header="$t('view.sale.saleOrder.appraisalPriceTHB')" style="min-width: 150px">
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

            <Column field="discountPercent" :header="$t('view.sale.saleOrder.discountPercent')" style="min-width: 100px">
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

            <Column field="discountPrice" :header="$t('view.sale.invoiceDetail.priceAfterDiscount')" style="min-width: 150px">
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

            <Column field="currencyRate" :header="$t('view.sale.saleOrder.convertedRate')" style="min-width: 100px">
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

            <Column field="qty" :header="$t('view.sale.quotation.quantity')" style="width: 80px">
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
                      <span>{{ $t('view.sale.invoiceDetail.total') }}</span>
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
                      <span>{{ $t('view.sale.invoiceDetail.specialDiscount') }}:</span>
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
                      <span>{{ $t('view.sale.invoiceDetail.specialSurcharge') }}:</span>
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
                      <span class="font-weight-bold">{{ $t('view.sale.saleOrder.adjustedTotal') }}:</span>
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

              <!-- ยอดรวมก่อน VAT -->
              <Row>
                <Column :colspan="16">
                  <template #footer>
                    <div class="text-right type-container">
                      <span class="font-weight-bold">{{ $t('view.sale.saleOrder.beforeVatTotal') }}:</span>
                    </div>
                  </template>
                </Column>
                <Column>
                  <template #footer>
                    <div class="text-right type-container">
                      <span class="font-weight-bold">{{ formatNumber(totalBeforeVat) }}</span>
                    </div>
                  </template>
                </Column>
              </Row>

              <!-- VAT % และจำนวนเงิน VAT -->
              <Row>
                <Column :colspan="16">
                  <template #footer>
                    <div class="text-right type-container">
                      <span>VAT ({{ invoiceData.vatPercent || 0 }}%):</span>
                    </div>
                  </template>
                </Column>
                <Column>
                  <template #footer>
                    <div class="text-right type-container">
                      <span>{{ formatNumber(vatAmount) }}</span>
                    </div>
                  </template>
                </Column>
              </Row>

              <!-- ราคารวม (ก่อนปัด) -->
              <Row>
                <Column :colspan="16">
                  <template #footer>
                    <div class="text-right type-container">
                      <h6 class="mb-0">{{ $t('view.sale.quotation.preTotalBeforeRound') }}:</h6>
                    </div>
                  </template>
                </Column>
                <Column>
                  <template #footer>
                    <div class="text-right type-container">
                      <h6 class="mb-0">{{ formatNumber(grandTotalRaw) }}</h6>
                    </div>
                  </template>
                </Column>
              </Row>
              <!-- ปัดเศษ -->
              <Row v-if="roundingAdjustment > 0">
                <Column :colspan="16">
                  <template #footer>
                    <div class="text-right type-container">
                      <h6 class="mb-0">{{ $t('view.sale.quotation.rounding') }}:</h6>
                    </div>
                  </template>
                </Column>
                <Column>
                  <template #footer>
                    <div class="text-right type-container">
                      <h6 class="mb-0">+{{ formatNumber(roundingAdjustment) }}</h6>
                    </div>
                  </template>
                </Column>
              </Row>
              <!-- ยอดที่ต้องชำระ -->
              <Row>
                <Column :colspan="16">
                  <template #footer>
                    <div class="text-right type-container">
                      <h6 class="mb-0 text-primary">{{ $t('view.sale.quotation.payableTotal') }}:</h6>
                    </div>
                  </template>
                </Column>
                <Column>
                  <template #footer>
                    <div class="text-right type-container">
                      <h6 class="mb-0 font-weight-bold text-primary">
                        {{ formatNumber(grandTotalRounded) }}
                      </h6>
                    </div>
                  </template>
                </Column>
              </Row>
            </ColumnGroup>
          </DataTable>
        </div>
      </div>

      <!-- Payment and Financial Summary with Version List -->
      <div class="form-content-payment-container">
        <!-- Invoice Version List (3/12) -->
        <div class="">
          <div class="card-container mb-3">
            <div class="card-header">
              <h6 class="mb-0"><i class="bi bi-clock-history mr-2"></i>{{ $t('view.sale.invoiceDetail.invoiceVersions') }}</h6>
            </div>
            <div class="card-body p-2">
              <div v-if="versionList.length === 0" class="text-center text-muted py-3">
                <i class="bi bi-inbox" style="font-size: 2rem"></i>
                <p class="mb-0 mt-2">{{ $t('view.sale.invoiceDetail.noVersion') }}</p>
              </div>
              <div v-else class="version-list">
                <div
                  v-for="version in versionList"
                  :key="version.versionNumber"
                  class="version-item"
                  @click="viewVersion(version)"
                >
                  <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                      <div class="version-number">
                        <i class="bi bi-file-earmark-pdf mr-1"></i>
                        {{ version.versionNumber }}
                      </div>
                      <div class="version-meta">
                        <small class="text-muted">
                          <i class="bi bi-calendar3 mr-1"></i>
                          {{ formatDate(version.createDate) }}
                        </small>
                      </div>
                      <div class="version-meta">
                        <small class="text-muted">
                          <i class="bi bi-person mr-1"></i>
                          {{ version.createBy }}
                        </small>
                      </div>
                    </div>
                    <div class="version-actions">
                      <button
                        class="btn btn-sm btn-outline-main"
                        @click.stop="printVersion(version)"
                        title="พิมพ์ PDF"
                      >
                        <i class="bi bi-printer"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Payment and Financial Summary (9/12) -->
        <div class="">
          <div class="card-container mb-3">
            <div class="card-header">
              <h6 class="mb-0">
                <i class="bi bi-credit-card mr-2"></i>{{ $t('view.sale.invoiceDetail.paymentAndSummary') }}
              </h6>
              <button class="btn btn-sm btn-green" @click="showPaymentModal = true">
                <i class="bi bi-cash-coin mr-1"></i>
                {{ $t('view.sale.invoiceDetail.recordPayment') }}
              </button>
            </div>
            <div class="card-body">
              <!-- Payment Information Section -->
              <div class="info-section mb-4">
                <h6 class="section-title mb-3">
                  <i class="bi bi-wallet2 mr-2"></i>{{ $t('view.sale.invoiceDetail.paymentInfo') }}
                </h6>
                <div class="row">
                  <div class="col-md-3">
                    <div class="info-item">
                      <label class="info-label">{{ $t('view.sale.invoiceDetail.paymentMethod') }}</label>
                      <p class="info-value">
                        <i class="bi bi-cash-stack mr-2"></i>{{ invoiceData.paymentName || '-' }}
                      </p>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="info-item">
                      <label class="info-label">{{ $t('view.sale.invoiceDetail.paymentTerm') }}</label>
                      <p class="info-value">
                        <i class="bi bi-calendar-event mr-2"></i
                        >{{ invoiceData.paymentDay || 0 }} {{ $t('view.sale.invoiceDetail.dayUnit') }}
                        <span v-if="invoiceData.paymentDay > 0" class="text-muted ml-2"
                          >({{ calculateDueDate() }})</span
                        >
                      </p>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="info-item">
                      <label class="info-label">{{ $t('view.sale.saleOrder.depositPrice') }}</label>
                      <p class="info-value font-weight-bold text-success">
                        {{ formatPriceWithCurrency(invoiceData.deposit || 0) }}
                      </p>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="info-item">
                      <label class="info-label">{{ $t('view.sale.saleOrder.remainingBalance') }}</label>
                      <p class="info-value font-weight-bold text-danger">
                        {{ formatPriceWithCurrency(grandTotalRounded - (invoiceData.deposit || 0)) }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Financial Summary Section -->
              <div class="info-section">
                <h6 class="section-title mb-3"><i class="bi bi-calculator mr-2"></i>{{ $t('view.sale.invoiceDetail.financialSummary') }}</h6>
                <div class="row">
                  <div class="col-md-3">
                    <div class="info-item">
                      <label class="info-label">{{ $t('view.sale.invoiceDetail.currencyLabel') }}</label>
                      <p class="info-value">
                        {{ invoiceData.currencyUnit || 'THB' }}
                      </p>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="info-item">
                      <label class="info-label">{{ $t('view.sale.saleOrder.currencyRate') }}</label>
                      <p class="info-value">{{ formatNumber(invoiceData.currencyRate) }}</p>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="info-item">
                      <label class="info-label">{{ $t('view.sale.invoiceDetail.specialDiscount') }}</label>
                      <p class="info-value text-danger">
                        -{{ formatNumber(invoiceData.specialDiscount || 0) }}
                      </p>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="info-item">
                      <label class="info-label">{{ $t('view.sale.invoiceDetail.specialSurcharge') }}</label>
                      <p class="info-value text-success">
                        +{{ formatNumber(invoiceData.specialAddition || 0) }}
                      </p>
                    </div>
                  </div>
                </div>
                <div class="row mt-3">
                  <div class="col-md-4">
                    <div class="info-item">
                      <label class="info-label">Freight & Insurance</label>
                      <p class="info-value">
                        {{ formatNumber(invoiceData.freightAndInsurance || 0) }}
                      </p>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="info-item">
                      <label class="info-label">{{ $t('view.sale.saleOrder.adjustedTotal') }}</label>
                      <p class="info-value font-weight-bold">
                        {{ formatNumber(totalAfterDiscountAndAddition) }}
                      </p>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="info-item">
                      <label class="info-label">{{ $t('view.sale.saleOrder.beforeVatTotal') }}</label>
                      <p class="info-value font-weight-bold">
                        {{ formatNumber(totalBeforeVat) }}
                      </p>
                    </div>
                  </div>
                </div>
                <div class="row mt-3">
                  <div class="col-md-4">
                    <div class="info-item">
                      <label class="info-label">VAT (%)</label>
                      <p class="info-value">
                        {{ invoiceData.vatPercent || 0 }}%
                      </p>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="info-item">
                      <label class="info-label">VAT Amount</label>
                      <p class="info-value">
                        {{ formatNumber(vatAmount) }}
                      </p>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="info-item highlight-total">
                      <label class="info-label">{{ $t('view.sale.quotation.payableTotal') }}</label>
                      <p class="info-value font-weight-bold text-primary">
                        <i class="bi bi-receipt mr-2"></i>{{ formatPriceWithCurrency(grandTotalRounded) }}
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
              <h6 class="mb-0">{{ $t('view.sale.invoice.remark') }}</h6>
            </div>
            <div class="card-body">
              <p class="mb-0">{{ invoiceData.remark }}</p>
            </div>
          </div>

          <!-- Payment History Section -->
          <div class="card-container mb-3">
            <div class="card-header">
              <h6 class="mb-0"><i class="bi bi-clock-history mr-2"></i>{{ $t('view.sale.invoiceDetail.paymentHistory') }}</h6>
            </div>
            <div class="card-body">
              <!-- Empty State -->
              <div
                v-if="!invoiceData.payments || invoiceData.payments.length === 0"
                class="text-center text-muted py-4"
              >
                <i class="bi bi-inbox" style="font-size: 2rem"></i>
                <p class="mb-0 mt-2">{{ $t('view.sale.invoiceDetail.noPaymentHistory') }}</p>
              </div>

              <!-- Payment History Table -->
              <div v-else>
                <BaseDataTable
                  :items="invoiceData.payments"
                  :totalRecords="invoiceData.payments.length"
                  :columns="paymentColumns"
                  :paginator="false"
                  :scrollHeight="'300px'"
                  dataKey="running"
                >
                  <!-- Index Column Template -->
                  <template #indexTemplate="slotProps">
                    <div class="text-center">{{ slotProps.index + 1 }}</div>
                  </template>

                  <!-- Image Column Template -->
                  <template #imageTemplate="slotProps">
                    <div class="image-container text-center">
                      <imagePreview
                        v-if="slotProps.data.imagePath"
                        :imageName="slotProps.data.imagePath"
                        path="Images/Payment"
                        type="PATH"
                        :width="40"
                        :height="40"
                        :emitImage="true"
                      />
                      <span v-else class="text-muted">-</span>
                    </div>
                  </template>

                  <!-- Amount Column Template with Currency -->
                  <template #amountTemplate="slotProps">
                    <div class="text-right">
                      {{ formatNumber(slotProps.data.amount) }} {{ slotProps.data.currencyUnit }}
                    </div>
                  </template>

                  <!-- Action Column Template -->
                  <template #actionTemplate="slotProps">
                    <div class="text-center">
                      <button
                        class="btn btn-sm btn-red"
                        @click="confirmDeletePayment(slotProps.data)"
                        :title="$t('view.sale.invoiceDetail.deletePaymentBtn')"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </template>
                </BaseDataTable>

                <!-- Payment Summary Footer -->
                <div class="mt-3 pt-3 border-top">
                  <div class="row mb-2">
                    <div class="col-md-3">
                      <div class="info-item">
                        <label class="info-label">{{ $t('view.sale.invoiceDetail.paymentCount') }}</label>
                        <p class="info-value">{{ invoiceData.payments.length }} {{ $t('view.sale.invoiceDetail.timeUnit') }}</p>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="info-item">
                        <label class="info-label">{{ $t('view.sale.quotation.payableTotal') }}</label>
                        <p class="info-value font-weight-bold">
                          {{ formatNumber(grandTotalRounded) }} {{ invoiceData.currencyUnit }}
                        </p>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="info-item">
                        <label class="info-label">{{ $t('view.sale.invoiceDetail.deposit') }}</label>
                        <p class="info-value text-info">
                          {{ formatNumber(invoiceData.deposit || 0) }}
                          {{ invoiceData.currencyUnit }}
                        </p>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="info-item">
                        <label class="info-label">{{ $t('view.sale.invoiceDetail.paidAmount') }}</label>
                        <p class="info-value text-success">
                          {{ formatNumber(paidAmount) }} {{ invoiceData.currencyUnit }}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div class="row mt-2">
                    <div class="col-md-12">
                      <div class="info-item highlight-total">
                        <label class="info-label">{{ $t('view.sale.saleOrder.remainingBalance') }}</label>
                        <p
                          class="info-value font-weight-bold text-danger remaining-amount"
                        >
                          {{ formatNumber(grandTotalRounded - (invoiceData.deposit || 0) - paidAmount) }}
                          {{ invoiceData.currencyUnit }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Invoice Version Modal -->
      <InvoiceVersionModal
        :isShowModal="showVersionModal"
        :invoiceData="invoiceData"
        :invoiceItems="invoiceItems"
        @close-modal="showVersionModal = false"
        @save="handleSaveVersion"
        @preview="handlePreviewVersion"
      />

      <!-- Invoice Confirm Print Modal -->
      <InvoiceConfirmPrintModal
        :isShowModal="showConfirmPrintModal"
        :invoiceData="invoiceData"
        @close-modal="showConfirmPrintModal = false"
        @confirm-print="handleConfirmPrint"
      />

      <!-- Delivery Note Confirm Print Modal -->
      <DeliveryConfirmPrintModal
        :isShowModal="showDeliveryPrintModal"
        :invoiceData="invoiceData"
        @close-modal="showDeliveryPrintModal = false"
        @confirm-print="handleConfirmDeliveryPrint"
      />

      <!-- Invoice Confirm Excel Modal -->
      <ExcelExportConfirmModal
        :isShowModal="showConfirmExcelModal"
        :documentNumber="invoiceData.invoiceNumber || ''"
        :documentDate="invoiceData.invoiceDate ? new Date(invoiceData.invoiceDate) : new Date()"
        numberLabel="Invoice Number"
        dateLabel="Invoice Date"
        @close-modal="showConfirmExcelModal = false"
        @confirm-export="handleConfirmExcelExport"
      />

      <!-- Payment Record Modal -->
      <PaymentRecordModal
        :isShowModal="showPaymentModal"
        :invoiceData="invoiceData"
        :paidAmount="paidAmount"
        @close-modal="showPaymentModal = false"
        @save-payment="handleSavePayment"
      />
    </div>
  </div>
</template>

<script>
// eslint-disable-next-line no-restricted-imports
import DataTable from 'primevue/datatable'
// eslint-disable-next-line no-restricted-imports
import Column from 'primevue/column'
// eslint-disable-next-line no-restricted-imports
import ColumnGroup from 'primevue/columngroup'
// eslint-disable-next-line no-restricted-imports
import Row from 'primevue/row'
import imagePreview from '@/components/prime-vue/ImagePreviewEmit.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import InvoiceVersionModal from './modal/invoice-version-modal.vue'
import InvoiceConfirmPrintModal from './modal/invoice-confirm-print-modal.vue'
import DeliveryConfirmPrintModal from './modal/delivery-confirm-print-modal.vue'
import ExcelExportConfirmModal from '@/components/modal/excel-export-confirm-modal.vue'
import PaymentRecordModal from './modal/payment-record-modal.vue'
import { useInvoiceApiStore } from '@/stores/modules/api/sale/invoice-store.js'
import { usrSaleOrderApiStore } from '@/stores/modules/api/sale/sale-order-store.js'
import { error, success } from '@/services/alert/sweetAlerts.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { invoicePdfService } from '@/services/helper/pdf/invoice/invoice-pdf-integration.js'
import { invoiceExcelService } from '@/services/helper/excel/invoice/invoice-excel-integration.js'
import { deliveryPdfService } from '@/services/helper/pdf/delivery/delivery-pdf-integration.js'
import dayjs from 'dayjs'
import { ceilToInteger } from '@/services/utils/decimal.js'

export default {
  name: 'InvoiceDetailView',

  components: {
    DataTable,
    Column,
    ColumnGroup,
    Row,
    imagePreview,
    BaseDataTable,
    InvoiceVersionModal,
    InvoiceConfirmPrintModal,
    DeliveryConfirmPrintModal,
    ExcelExportConfirmModal,
    PaymentRecordModal
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
      type: 'STOCK-PRODUCT',
      showVersionModal: false,
      showConfirmPrintModal: false,
      showDeliveryPrintModal: false,
      showConfirmExcelModal: false,
      showPaymentModal: false,
      paidAmount: 0,
      versionList: [],
      originalInvoiceData: null,
      originalInvoiceItems: [],
      currentViewingVersion: null,
    }
  },

  computed: {
    paymentColumns() {
      return [
        { field: 'index', header: '#', width: '50px', sortable: false, align: 'center' },
        { field: 'image', header: this.$t('view.sale.invoiceDetail.imageHeader'), width: '80px', sortable: false, align: 'center' },
        {
          field: 'paymentDate',
          header: this.$t('view.sale.invoiceDetail.paymentDate'),
          minWidth: '120px',
          sortable: true,
          format: 'date'
        },
        {
          field: 'amount',
          header: this.$t('view.sale.invoiceDetail.amount'),
          minWidth: '120px',
          sortable: true,
          align: 'right'
        },
        {
          field: 'currencyUnit',
          header: this.$t('view.sale.invoiceDetail.currencyLabel'),
          width: '100px',
          sortable: false,
          align: 'center'
        },
        { field: 'paymentMethod', header: this.$t('view.sale.invoiceDetail.paymentMethod'), minWidth: '150px', sortable: true },
        { field: 'bankName', header: this.$t('view.sale.invoiceDetail.bank'), minWidth: '120px', sortable: false },
        { field: 'bankBranch', header: this.$t('view.sale.invoiceDetail.branch'), minWidth: '120px', sortable: false },
        {
          field: 'referenceNumber',
          header: this.$t('view.sale.invoiceDetail.referenceNumber'),
          minWidth: '150px',
          sortable: false
        },
        { field: 'remark', header: this.$t('view.sale.invoice.remark'), minWidth: '200px', sortable: false },
        { field: 'createBy', header: this.$t('view.sale.invoiceDetail.recordBy'), minWidth: '120px', sortable: true },
        {
          field: 'createDate',
          header: this.$t('view.sale.invoiceDetail.recordDate'),
          minWidth: '150px',
          sortable: true,
          format: 'datetime'
        },
        { field: 'action', header: this.$t('common.field.action'), width: '100px', sortable: false, align: 'center' }
      ]
    },
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

    // ยอดรวมก่อน VAT (รวม Freight & Insurance แล้ว)
    totalBeforeVat() {
      return this.totalAfterDiscountAndAddition + Number(this.invoiceData?.freightAndInsurance || 0)
    },

    // คำนวณค่า VAT จากเปอร์เซ็นต์
    vatAmount() {
      const vatPercent = Number(this.invoiceData?.vatPercent || 0)
      return (this.totalBeforeVat * vatPercent) / 100
    },

    // ยอดรวมสุดท้ายรวม VAT
    grandTotal() {
      return this.totalBeforeVat + this.vatAmount
    },
    grandTotalRaw() {
      return Number(this.totalBeforeVat) + Number(this.vatAmount)
    },
    grandTotalRounded() {
      return ceilToInteger(this.grandTotalRaw)
    },
    roundingAdjustment() {
      return this.grandTotalRounded - this.grandTotalRaw
    }
  },

  async mounted() {
    // Store the route we came from for navigation after delete
    this.fromRoute = this.$route.query.from || null

    // Get invoice number from route query
    const invoiceNumber = this.$route.query.invoiceNumber
    if (invoiceNumber) {
      await this.loadInvoiceData(invoiceNumber)
      // Load payment history after invoice data is loaded
      await this.loadPaymentHistory()
    } else {
      this.loadError = this.$t('view.sale.invoiceDetail.error.noInvoiceNumber')
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
        this.invoiceData = {
          ...invoiceResponse,
          vatPercent: invoiceResponse.vat || 0
        }
        

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

        //console.log('saleOrderData items', saleOrderData.items)

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

          this.invoiceItems = this.invoiceItems.filter((item) => {
            return invoiceResponse.confirmedItems.some(
              (invItem) => invItem.stockNumber === item.stockNumber
            )
          })

          this.invoiceItems.forEach((item) => {
            const confirmedItem = saleOrderData.stockConfirm.find(
              (ci) => ci.stockNumber === item.stockNumber
            )

            if (confirmedItem) {
              item.id = confirmedItem.id
              item.stockNumber = confirmedItem.stockNumber
              item.appraisalPrice = confirmedItem.priceOrigin
              item.qty = confirmedItem.qty
              item.discountPercent = confirmedItem.discount
              item.isConfirm = true
              item.isInvoice = true
              item.invoice = invoiceResponse.invoiceNumber
              item.invoiceItem = confirmedItem.invoiceItem
                 item.dkInvoiceNumber = confirmedItem.dkInvoiceNumber
            }
          })
        }

      }

      // Store original data
      this.originalInvoiceData = { ...this.invoiceData }
      this.originalInvoiceItems = [...this.invoiceItems]

      // Load invoice versions
      await this.loadVersions()
    },

    async loadVersions() {
      if (!this.invoiceData || !this.invoiceData.invoiceNumber) return

      const response = await this.invoiceStore.fetchListVersions({
        formValue: {
          invoiceNumber: this.invoiceData.invoiceNumber,
          soNumber: this.invoiceData.soNumber
        }
      })

      if (response && response.data) {
        this.versionList = response.data
      }
    },

    async viewVersion(version) {
      const response = await this.invoiceStore.fetchGetVersion({
        formValue: {
          versionNumber: version.versionNumber
        }
      })

      if (response && response.data) {
        const versionData = JSON.parse(response.data)

        // Update invoice data with version data
        this.currentViewingVersion = version.versionNumber
        this.invoiceData = {
          ...this.originalInvoiceData,
          currencyUnit: versionData.currencyUnit,
          currencyRate: versionData.currencyRate,
          specialDiscount: versionData.specialDiscount,
          specialAddition: versionData.specialAddition,
          freightAndInsurance: versionData.freightAndInsurance
        }

        // Update invoice items with version items
        this.invoiceItems = versionData.items || []

        // Update form sale order currency
        this.formSaleOrder.currencyUnit = versionData.currencyUnit
        this.formSaleOrder.currencyRate = versionData.currencyRate
      }
    },

    restoreOriginalView() {
      this.currentViewingVersion = null
      this.invoiceData = { ...this.originalInvoiceData }
      this.invoiceItems = [...this.originalInvoiceItems]
      this.formSaleOrder.currencyUnit = this.originalInvoiceData.currencyUnit
      this.formSaleOrder.currencyRate = this.originalInvoiceData.currencyRate
    },

    async printVersion(version) {
      const response = await this.invoiceStore.fetchGetVersion({
        formValue: {
          versionNumber: version.versionNumber
        }
      })

      if (response && response.data) {
        const versionData = JSON.parse(response.data)
        this.generateVersionPDF(versionData, { open: true, download: false })
      }
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
          priority: response.priority,
          discount: response.discount,
          freight: response.freight,
          remark: response.remark,
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
          confirmedItems: response.stockConfirm,
          currencyUnit: response.currencyUnit,
          currencyRate: response.currencyRate,
          markup: response.markup,
          goldPerOz: response.goldRate,
          customer: {
            name: response.customerName || '',
            address: response.customerAddress || '',
            phone: response.customerTel || '',
            email: response.customerEmail || '',
            remark: response.customerRemark || ''
          }
        }
      }

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
      // Open confirm print modal instead of direct print
      this.showConfirmPrintModal = true
    },
    async printDeliveryNote() {
      // Open delivery print modal instead of direct print
      this.showDeliveryPrintModal = true
    },
    async exportInvoiceExcel() {
      // Open confirm excel modal instead of direct export
      this.showConfirmExcelModal = true
    },
    async handleConfirmExcelExport({ documentNumber, documentDate }) {
      const excelData = {
        saleOrder: {
          soNumber: this.invoiceData.soNumber,
          date: this.invoiceData.createDate,
          expectedDeliveryDate: this.invoiceData.deliveryDate,
          paymentTerms: this.invoiceData.paymentName,
          depositPercent: this.invoiceData.depositPercent,
          remark: this.invoiceData.remark,
          specialDiscount: this.invoiceData.specialDiscount || 0,
          specialAddition: this.invoiceData.specialAddition || 0,
          freightAndInsurance: this.invoiceData.freightAndInsurance || 0,
          vatPercent: this.invoiceData.vatPercent || this.invoiceData.vat || 0
        },
        customer: {
          name: this.invoiceData.customerName,
          address: this.invoiceData.customerAddress,
          tel: this.invoiceData.customerTel,
          email: this.invoiceData.customerEmail,
          phone: this.invoiceData.customerTel
        },
        currency: {
          unit: this.invoiceData.currencyUnit || 'THB',
          rate: this.invoiceData.currencyRate || 1
        },
        items: this.invoiceItems
      }

      const options = {
        invoiceNo: documentNumber,
        invoiceDate: dayjs(documentDate),
        download: true
      }

      await invoiceExcelService.generateInvoiceExcel(excelData, options)
      success(this.$t('view.sale.invoiceDetail.success.exportExcel'), 'Invoice Excel')
    },
    async handleConfirmDeliveryPrint(printData) {
      if (!printData || !printData.deliveryNumber) {
        error(this.$t('view.sale.invoiceDetail.error.noDeliveryNote'), this.$t('view.sale.invoiceDetail.error.cannotCreatePDF'))
        return
      }

      {
        // Prepare data for Delivery Note PDF generation
        const deliveryData = {
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
            email: this.invoiceData.customerEmail,
            phone: this.invoiceData.customerTel
          },
          currency: {
            unit: this.invoiceData.currencyUnit || 'THB',
            rate: this.invoiceData.currencyRate || 1
          },
          items: this.invoiceItems
        }

        // Format date properly
        let formattedDate
        if (printData.deliveryDate instanceof Date) {
          formattedDate = dayjs(printData.deliveryDate)
        } else {
          formattedDate = dayjs(printData.deliveryDate)
        }

        const options = {
          deliveryNo: printData.deliveryNumber,
          deliveryDate: formattedDate,
          download: true,
          open: false
        }

        await deliveryPdfService.generateDeliveryPDF(deliveryData, options)
        success(this.$t('view.sale.invoiceDetail.success.deliveryNotePDF'), 'Delivery Note')
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
    confirmReverseInvoice() {
      confirmThenSubmit(
        this.$t('view.sale.invoiceDetail.confirm.cancelInvoice'),
        this.$t('view.sale.invoiceDetail.confirm.cancelInvoiceTitle'),
        async () => {
          await this.reverseInvoice()
        },
        { confirmText: this.$t('common.btn.confirm'), cancelText: this.$t('common.btn.cancel') },
        'warning'
      )
    },
    async reverseInvoice() {
      if (!this.invoiceData || !this.invoiceData.invoiceNumber) {
        error(this.$t('view.sale.invoiceDetail.error.noInvoiceData'), this.$t('view.sale.invoiceDetail.error.cannotCancel'))
        return
      }

      await this.invoiceStore.fetchDelete({
        formValue: { invoiceNumber: this.invoiceData.invoiceNumber }
      })

      success(this.$t('view.sale.invoiceDetail.success.cancelInvoice'), this.$t('view.sale.invoiceDetail.success.cancelInvoiceTitle'))

      if (this.fromRoute === 'sale-order' && this.invoiceData.soNumber) {
        this.$router.push({
          path: '/sale/sale-order',
          query: { soNumber: this.invoiceData.soNumber, mode: 'view' }
        })
      } else {
        this.$router.back()
      }
    },
    openVersionModal() {
      this.showVersionModal = true
    },
    async handleSaveVersion() {
      await this.loadVersions()
      this.showVersionModal = false
    },
    handlePreviewVersion(versionData) {
      this.generateVersionPDF(versionData, { open: true, download: false })
    },
    async handleConfirmPrint(printData) {
      if (!printData || !printData.invoiceNumber) {
        error(this.$t('view.sale.invoiceDetail.error.noInvoiceData'), this.$t('view.sale.invoiceDetail.error.cannotCreatePDF'))
        return
      }

      {
        const formattedDate = dayjs(printData.invoiceDate)

        // Prepare data for PDF generation with modified invoice number and date
        const pdfData = {
          saleOrder: {
            soNumber: this.invoiceData.soNumber,
            date: this.invoiceData.createDate,
            expectedDeliveryDate: this.invoiceData.deliveryDate,
            paymentTerms: this.invoiceData.paymentName,
            depositPercent: this.invoiceData.depositPercent,
            remark: this.invoiceData.remark,
            specialDiscount: this.invoiceData.specialDiscount || 0,
            specialAddition: this.invoiceData.specialAddition || 0,
            freightAndInsurance: this.invoiceData.freightAndInsurance || 0
          },
          customer: {
            name: this.invoiceData.customerName,
            address: this.invoiceData.customerAddress,
            tel: this.invoiceData.customerTel,
            email: this.invoiceData.customerEmail,
            phone: this.invoiceData.customerTel
          },
          currency: {
            unit: this.invoiceData.currencyUnit || 'THB',
            rate: this.invoiceData.currencyRate || 1
          },
          items: this.invoiceItems
        }

        const options = {
          invoiceNo: printData.invoiceNumber,
          invoiceDate: formattedDate,
          download: true,
          open: false,
          showCifLabel: printData.showCifLabel !== undefined ? printData.showCifLabel : true
        }

        if (printData.paperSize === 'vat-bridge') {
          const { printVat } = await import('@/services/api/print-bridge-service.js')
          const { getVatLayout } = await import('@/services/helper/print/vat-layout-store.js')
          const layout = await getVatLayout()
          const offsetMm = printData.continuousOffset || { x: 0, y: 0 }
          const layoutPayload = layout
            ? { ...layout, offsetX: (layout.offsetX ?? 0) + (offsetMm.x || 0), offsetY: (layout.offsetY ?? 0) + (offsetMm.y || 0) }
            : (offsetMm.x || offsetMm.y ? { offsetX: offsetMm.x, offsetY: offsetMm.y } : null)
          if (layoutPayload && printData.printerName != null) {
            layoutPayload.printerName = printData.printerName
          } else if (!layoutPayload && printData.printerName != null) {
            // no-op: printerName will be set in payload directly below if needed
          }
          const payload = {
            invoice: {
              invoiceNo: options.invoiceNo,
              invoiceDate: dayjs(options.invoiceDate).format('YYYY-MM-DD'),
              customer: {
                name: this.invoiceData.customerName || '',
                address: this.invoiceData.customerAddress || '',
                taxId: this.invoiceData.customerTaxId || ''
              },
              customerTaxId: this.invoiceData.customerTaxId || '',
              items: (this.invoiceItems || []).map(i => ({
                productNameEN: i.productNameEN || i.description || i.productNumber || '',
                qty: Number(i.qty) || 0,
                appraisalPrice: Number(i.appraisalPrice) || 0,
                discountPercent: Number(i.discountPercent) || 0
              })),
              currencyRate: Number(this.invoiceData.currencyRate) || 1,
              specialDiscount: Number(this.invoiceData.specialDiscount) || 0,
              specialAddition: Number(this.invoiceData.specialAddition) || 0,
              freightAndInsurance: Number(this.invoiceData.freightAndInsurance) || 0,
              vatPercent: Number(this.invoiceData.vatPercent) || 0
            }
          }
          if (layoutPayload) payload.layout = layoutPayload
          await printVat(payload)
          success(this.$t('view.sale.invoiceDetail.success.printVat'), 'Bridge GDI')
          return
        } else if (printData.paperSize === 'bill') {
          const { printBill } = await import('@/services/api/print-bridge-service.js')
          const { getBillLayout } = await import('@/services/helper/print/bill-layout-store.js')
          const billLayout = await getBillLayout()
          const offsetMm = printData.billOffset || { x: 0, y: 0 }
          const layoutPayload = billLayout
            ? { ...billLayout, offsetX: (billLayout.offsetX ?? 0) + (offsetMm.x || 0), offsetY: (billLayout.offsetY ?? 0) + (offsetMm.y || 0) }
            : (offsetMm.x || offsetMm.y ? { offsetX: offsetMm.x, offsetY: offsetMm.y } : null)
          if (layoutPayload && printData.printerName != null) {
            layoutPayload.printerName = printData.printerName
          }
          const billPayload = {
            invoice: {
              invoiceNo: options.invoiceNo,
              invoiceDate: dayjs(options.invoiceDate).format('YYYY-MM-DD'),
              customer: {
                name: this.invoiceData.customerName || '',
                address: this.invoiceData.customerAddress || '',
                taxId: this.invoiceData.customerTaxId || ''
              },
              customerTaxId: this.invoiceData.customerTaxId || '',
              items: (this.invoiceItems || []).map(i => {
                const mats = Array.isArray(i.materials) ? i.materials : []
                const goldWeight = mats.filter(m => m.type === 'Gold').reduce((s, m) => s + (Number(m.weight) || 0), 0)
                const stoneWeight = mats.filter(m => m.type === 'Gem').reduce((s, m) => s + (Number(m.weight) || 0), 0)
                const diamondWeight = mats.filter(m => m.type === 'Diamond').reduce((s, m) => s + (Number(m.weight) || 0), 0)
                return {
                  stockNumber: i.stockNumber || '',
                  productNumber: i.productNumber || '',
                  productNameEN: i.productNameEN || i.description || i.productNumber || '',
                  description: i.description || '',
                  qty: Number(i.qty) || 0,
                  appraisalPrice: Number(i.appraisalPrice) || 0,
                  discountPercent: Number(i.discountPercent) || 0,
                  goldWeight: goldWeight || null,
                  stoneWeight: stoneWeight || null,
                  diamondWeight: diamondWeight || null
                }
              }),
              currencyRate: Number(this.invoiceData.currencyRate) || 1,
              specialDiscount: Number(this.invoiceData.specialDiscount) || 0,
              specialAddition: Number(this.invoiceData.specialAddition) || 0,
              freightAndInsurance: Number(this.invoiceData.freightAndInsurance) || 0,
              vatPercent: Number(this.invoiceData.vatPercent) || 0
            }
          }
          if (layoutPayload) billPayload.layout = layoutPayload
          await printBill(billPayload)
          success(this.$t('view.sale.invoiceDetail.success.printBill'), 'Bridge GDI')
          return
        } else {
          await invoicePdfService.generateInvoicePDF(pdfData, options)
        }
        success(this.$t('view.sale.invoiceDetail.success.createPDF'), 'Invoice PDF')
      }
    },
    async generateVersionPDF(versionData, options = { open: false, download: true }) {
      {
        const pdfData = {
          saleOrder: {
            soNumber: this.invoiceData.soNumber,
            date: this.invoiceData.createDate,
            expectedDeliveryDate: this.invoiceData.deliveryDate,
            paymentTerms: this.invoiceData.paymentName,
            depositPercent: this.invoiceData.depositPercent,
            remark: this.invoiceData.remark,
            // Use version data for financial calculations
            specialDiscount: versionData.specialDiscount || 0,
            specialAddition: versionData.specialAddition || 0,
            freightAndInsurance: versionData.freightAndInsurance || 0
          },
          customer: {
            name: this.invoiceData.customerName,
            address: this.invoiceData.customerAddress,
            tel: this.invoiceData.customerTel,
            email: this.invoiceData.customerEmail,
            phone: this.invoiceData.customerTel
          },
          currency: {
            unit: versionData.currencyUnit || 'THB',
            rate: versionData.currencyRate || 1
          },
          // Use version items instead of original items
          items: versionData.items
        }

        const pdfOptions = {
          invoiceNo: `${this.invoiceData.invoiceNumber}-V${versionData.versionNumber}`,
          invoiceDate: dayjs(this.invoiceData.createDate).format('DD/MM/YYYY'),
          download: options.download,
          open: options.open
        }

        await invoicePdfService.generateInvoicePDF(pdfData, pdfOptions)

        if (options.download) {
          success(this.$t('view.sale.invoiceDetail.success.createPDF'), 'Invoice Version PDF')
        }
      }
    },
    async handleSavePayment(paymentData) {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('InvoiceNumber', paymentData.invoiceNumber)
      formData.append('PaymentDate', paymentData.paymentDate.toISOString())
      formData.append('Amount', paymentData.amount)
      formData.append('Payment', paymentData.payment) // Payment method ID (int)
      formData.append('PaymentName', paymentData.paymentName) // Payment method name (string)

      if (paymentData.bankCode) {
        formData.append('BankCode', paymentData.bankCode)
      }

      if (paymentData.bankBranch) {
        formData.append('BankBranch', paymentData.bankBranch)
      }

      if (paymentData.referenceNumber) {
        formData.append('ReferenceNumber', paymentData.referenceNumber)
      }

      if (paymentData.remark) {
        formData.append('Remark', paymentData.remark)
      }

      if (paymentData.receiptImage) {
        formData.append('ReceiptImage', paymentData.receiptImage)
      }

      // Call API to save payment record
      const response = await this.invoiceStore.createPayment(formData)

      if (response) {
        await this.loadInvoiceData(paymentData.invoiceNumber)
      }

      // Close modal after processing
      this.showPaymentModal = false
    },

    async loadPaymentHistory() {
      // Load payment records from API
      const response = await this.invoiceStore.fetchPaymentList({
        formValue: {
          invoiceNumber: this.invoiceData.invoiceNumber
        }
      })

      if (response && response.data) {
        // Calculate total paid amount
        this.paidAmount = response.data.reduce((sum, payment) => {
          return sum + payment.amount
        }, 0)
      }
    },

    confirmDeletePayment(paymentData) {
      confirmThenSubmit(
        this.$t('view.sale.invoiceDetail.confirm.deletePayment', { amount: this.formatNumber(paymentData.amount), currency: paymentData.currencyUnit }),
        this.$t('view.sale.invoiceDetail.confirm.deletePaymentTitle'),
        async () => {
          await this.deletePayment(paymentData)
        },
        { confirmText: this.$t('common.btn.confirm'), cancelText: this.$t('common.btn.cancel') },
        'warning'
      )
    },

    async deletePayment(paymentData) {
      if (!paymentData || !paymentData.running) {
        error(this.$t('view.sale.invoiceDetail.error.noPaymentData'), this.$t('view.sale.invoiceDetail.error.cannotDelete'))
        return
      }

      await this.invoiceStore.deletePayment({
        formValue: { paymentRunning: paymentData.running }
      })

      success(this.$t('view.sale.invoiceDetail.success.deletePayment'), this.$t('view.sale.invoiceDetail.success.deletePaymentTitle'))

      await this.loadInvoiceData(this.invoiceData.invoiceNumber)
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
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
}

.btn-header-action {
  min-width: 140px;
}

.card-header {
  background: var(--base-font-color);
  border-bottom: 1px solid var(--color-border);
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
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
  padding: 0.5rem 0;

  &:not(:last-child) {
    border-bottom: 1px solid var(--color-border);
  }

  .section-title {
    color: var(--base-font-color);
    font-weight: 600;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;

    i {
      color: var(--base-font-color);
      font-size: 0.85rem;
    }
  }
}

.info-item {
  margin-bottom: 0.25rem;

  .info-label {
    font-size: 0.7rem;
    color: #6c757d;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    margin-bottom: 0.15rem;
    display: block;
  }

  .info-value {
    font-size: var(--fs-sm);
    color: var(--base-font-color);
    margin-bottom: 0;
    padding: 0.35rem 0.5rem;
    background-color: var(--color-highlight-bg);
    border-radius: var(--radius-sm);
    min-height: 30px;
    display: flex;
    align-items: center;

    i {
      color: var(--base-font-color);
      font-size: 0.8rem;
    }
  }
}

// Invoice Version List styles
.version-list {
  max-height: calc(100vh - 300px);
  overflow-y: auto;
}

.version-item {
  padding: var(--sp-md);
  margin-bottom: var(--sp-sm);
  background: var(--color-highlight-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-border);
    border-color: var(--base-font-color);
    box-shadow: var(--shadow-sm);
  }

  .version-number {
    font-weight: 600;
    color: var(--base-font-color);
    font-size: 0.9rem;
    margin-bottom: 0.25rem;
  }

  .version-meta {
    font-size: 0.75rem;
    line-height: 1.4;
  }

  .version-actions {
    margin-left: 0.5rem;

    .btn {
      padding: 0.25rem 0.5rem;
      font-size: 0.875rem;
    }
  }
}

.form-content-payment-container {
  display: grid;
  grid-template-columns: 1fr 4fr;
  gap: var(--sp-sm);
}

.remaining-amount {
  font-size: var(--fs-lg);
}
</style>
