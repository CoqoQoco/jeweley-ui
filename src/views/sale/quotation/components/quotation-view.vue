<template>
  <div class="mt-2">
    <form @submit.prevent="onSave">
      <!-- Customer Information Section -->
      <div class="base-customer">
        <div class="filter-container mt-2">
          <div class="form-col-container">
            <!-- date and invoice number -->
            <div class="form-col-container">
              <div>
                <span class="title-text">วันที่ใบเสนอราคา</span>
                <Calendar
                  class="w-100"
                  v-model="customer.quotationDate"
                  showIcon
                  :manualInput="true"
                  dateFormat="dd/mm/yy"
                />
              </div>

              <div>
                <span class="title-text">เลขที่ใบเสนอราคา</span>
                <div class="d-flex align-items-center gap-1">
                  <input
                    :class="['form-control bg-input input-bg']"
                    type="text"
                    v-model.trim="customer.invoiceNumber"
                    readonly
                  />
                  <button
                    class="btn btn-main btn-sm"
                    type="button"
                    @click="generateQuotationNumber"
                    title="สร้างเลขที่ใบเสนอราคาใหม่"
                  >
                    <i class="bi bi-arrow-clockwise"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- convert price -->
            <div class="form-col-container d-flex justify-content-end align-items-end">
              <div class="">
                <span class="title-text">Currency</span>
                <input
                  :class="['form-control bg-input', 'input-bg']"
                  type="text"
                  v-model.trim="customer.currencyUnit"
                  style="width: 100px"
                />
              </div>
              <div class="">
                <span class="title-text">Currency Rate</span>
                <input
                  :class="['form-control bg-input', 'input-bg']"
                  type="number"
                  v-model.number="customer.currencyMultiplier"
                  min="0"
                  step="any"
                  style="width: 100px"
                />
              </div>
              <div class="ml-2">
                <span class="title-text">Markup</span>
                <input
                  :class="['form-control bg-input', 'input-bg']"
                  type="number"
                  v-model.number="customer.markup"
                  min="0"
                  step="any"
                  style="width: 80px"
                />
              </div>
              <div class="ml-2">
                <span class="title-text">Discount (%)</span>
                <div class="d-flex align-items-center gap-1">
                  <input
                    :class="['form-control bg-input', 'input-bg']"
                    type="number"
                    v-model.number="customer.discountPercent"
                    min="0"
                    max="100"
                    step="any"
                    style="width: 80px"
                  />
                  <button
                    class="btn btn-main btn-sm"
                    type="button"
                    @click="applyGlobalDiscount"
                    title="กำหนดส่วนลดให้ทุกรายการ"
                  >
                    กำหนดทั้งหมด
                  </button>
                </div>
              </div>
              <div class="ml-2">
                <span class="title-text">Gold (US$/Oz.)</span>
                <input
                  :class="['form-control bg-input', 'input-bg']"
                  type="number"
                  v-model.number="customer.goldPerOz"
                  min="0"
                  max="10000"
                  step="any"
                  style="width: 80px"
                />
              </div>
            </div>
          </div>

          <!-- Customer Details Section -->
          <div class="customer-details-section mt-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="title-text-lg">ข้อมูลลูกค้า</span>
              <div>
                <button
                  class="btn btn-sm btn-main mr-2"
                  type="button"
                  @click="onSearchCustomer"
                  title="ค้นหาลูกค้า"
                >
                  <i class="bi bi-search mr-1"></i>
                  <span>ค้นหาลูกค้า</span>
                </button>
                <button
                  class="btn btn-sm btn-green"
                  type="button"
                  @click="onCreateCustomer"
                  title="เพิ่มลูกค้าใหม่"
                >
                  <i class="bi bi-person-plus mr-1"></i>
                  <span>เพิ่มลูกค้าใหม่</span>
                </button>
              </div>
            </div>

            <div class="customer-info-display">
              <div class="form-col-container">
                <div>
                  <span class="title-text">ชื่อลูกค้า</span>
                  <div class="customer-display-field">
                    {{ customer.name || '-' }}
                  </div>
                </div>
                <div>
                  <span class="title-text">ที่อยู่</span>
                  <div class="customer-display-field">
                    {{ customer.address || '-' }}
                  </div>
                </div>
                <div>
                  <span class="title-text">เบอร์โทร</span>
                  <div class="customer-display-field">
                    {{ customer.tel || '-' }}
                  </div>
                </div>
                <div>
                  <span class="title-text">อีเมล</span>
                  <div class="customer-display-field">
                    {{ customer.email || '-' }}
                  </div>
                </div>
              </div>
              <div class="form-col-container mt-2">
                <div>
                  <span class="title-text">หมายเหตุ</span>
                  <input
                    :class="['form-control bg-input', 'input-bg']"
                    type="text"
                    v-model.trim="customer.remark"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Item Source Actions -->
      <div class="filter-container mt-2">
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-sm btn-main" type="button" @click="onOpenCostVersionPicker">
            <i class="bi bi-clock-history mr-1"></i>
            <span>ดึงจากรายการตีราคา</span>
          </button>
        </div>
      </div>

      <!-- stock item -->
      <div class="base-datatable mt-2">
        <DataTable
          :value="customer.quotationItems"
          rowGroupMode="subheader"
          groupRowsBy="nameGroup"
          stripedRows
          showGridlines
          :rowClass="getRowClass"
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
              <Column header="ราคาขาย  (THB)" />
              <Column header="ราคาประเมิน (THB)" />
              <Column header="ส่วนลด" />
              <Column header="ราคาส่วนลด (THB)" />
              <Column header="แปลงเรท" />
              <Column :header="'ราคาแปลง (' + (customer.currencyUnit || '') + ') '" />
              <Column header="จำนวน" />
              <Column :header="'รวมราคา (' + (customer.currencyUnit || '') + ') '" />
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
                  @click="delItem(slotProps.index)"
                >
                  <span class="bi bi-trash"></span>
                </button>
                <button
                  class="btn btn-sm btn-main ml-2"
                  type="button"
                  title="แก้ไข"
                  @click="onEditStock(slotProps.data, slotProps.index)"
                >
                  <span class="bi bi-brush"></span>
                </button>
                <button
                  class="btn btn-sm btn-outline-dark ml-2"
                  type="button"
                  title="คัดลอก"
                  @click="copyItem(slotProps.data)"
                >
                  <span class="bi bi-files"></span>
                </button>
              </div>
            </template>
          </Column>

          <column field="image" header="" style="width: 50px">
            <template #body="slotProps">
              <div class="image-container">
                <div v-if="slotProps.data.imagePath">
                  <imagePreview
                    :imageName="slotProps.data.imagePath"
                    :type="type"
                    :width="25"
                    :height="25"
                  />
                </div>
              </div>
            </template>
          </column>

          <column field="stockNumber" header="เลขที่ผลิต" style="min-width: 150px">
            <template #body="slotProps">
              <span>{{
                `${
                  slotProps.data.stockNumberOrigin
                    ? slotProps.data.stockNumberOrigin || ''
                    : slotProps.data.stockNumber || ''
                }`
              }}</span>
            </template>
          </column>
          <column field="stockNumber" header="รหัสสินค้า" style="min-width: 150px">
            <template #body="slotProps">
              <div v-if="!slotProps.data.stockNumber">
                <input
                  v-model="slotProps.data.productNumber"
                  type="text"
                  class="form-control bg-input input-bg"
                  @blur="onBlueDescription(slotProps.data, slotProps.index, 'productNumber')"
                  style="background-color: #b5dad4; width: 100%"
                />
              </div>
              <div v-else>
                <span>{{ slotProps.data.productNumber }}</span>
              </div>
            </template>
          </column>

          <column field="description" header="รายละเอียด" style="min-width: 200px">
            <template #body="slotProps">
              <input
                v-model="slotProps.data.description"
                type="text"
                class="form-control bg-input input-bg"
                @blur="onBlueDescription(slotProps.data, slotProps.index, 'description')"
                style="background-color: #b5dad4; width: 100%"
              />
            </template>
          </column>

          <column field="gold" style="min-width: 120px; max-width: 300px">
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
          </column>

          <column field="diamond" style="min-width: 140px; max-width: 300px">
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
          </column>

          <column field="gem" style="min-width: 140px; max-width: 300px">
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
          </column>

          <column field="priceOrigin" header="ราคาขาย (THB)" style="min-width: 150px">
            <template #body="slotProps">
              <div class="qty-container">
                <span>{{
                  Number(slotProps.data.priceOrigin || slotProps.data.price || 0).toFixed(2)
                }}</span>
              </div>
            </template>
          </column>

          <column field="appraisalPrice" header="ราคาประเมิน (THB)" style="min-width: 150px">
            <template #body="slotProps">
              <div class="qty-container">
                <input
                  v-model.number="slotProps.data.appraisalPrice"
                  type="number"
                  class="form-control text-right bg-input input-bg"
                  min="0"
                  step="any"
                  @blur="onBluePrice(slotProps.data, slotProps.index, 'appraisalPrice')"
                  style="background-color: #b5dad4; width: 100%"
                />
              </div>
            </template>
          </column>

          <column field="discountPercent" header="ส่วนลด (%)" style="min-width: 100px">
            <template #body="slotProps">
              <div class="qty-container">
                <input
                  v-model.number="slotProps.data.discountPercent"
                  type="number"
                  class="form-control text-right bg-input input-bg"
                  min="0"
                  max="100"
                  step="any"
                  style="background-color: #b5dad4; width: 100%"
                  placeholder="0"
                />
              </div>
            </template>
          </column>

          <column field="discountPrice" header="ราคาส่วนลด (THB)" style="min-width: 150px">
            <template #body="slotProps">
              <div class="qty-container">
                <!-- <input
                  :value="
                    (
                      Number(slotProps.data.appraisalPrice || 0) *
                      (1 - (customer.discountPercent || 0) / 100)
                    ).toFixed(2)
                  "
                  type="number"
                  class="form-control text-right bg-input input-bg"
                  min="0"
                  step="any"
                  readonly
                  style="background-color: #b5dad4; width: 100%" -->
                <span>{{
                  (
                    Number(slotProps.data.appraisalPrice || 0) *
                    (1 - (slotProps.data.discountPercent || 0) / 100)
                  ).toFixed(2)
                }}</span>
              </div>
            </template>
          </column>

          <column field="currencyMultiplier" header="แปลงเรท" style="min-width: 100px">
            <template #body>
              <div class="qty-container">
                <span>{{ customer.currencyMultiplier }}</span>
              </div>
            </template>
          </column>

          <column
            field="priceAfterMultiply"
            :header="'ราคาแปลง (' + (customer.currencyUnit || '') + ') '"
            style="min-width: 150px"
          >
            <template #body="slotProps">
              <div class="qty-container">
                <span>{{
                  (
                    (Number(slotProps.data.appraisalPrice || 0) *
                      (1 - (slotProps.data.discountPercent || 0) / 100)) /
                    (customer.currencyMultiplier || 1)
                  ).toFixed(2)
                }}</span>
              </div>
            </template>
          </column>

          <column field="qty" header="จำนวน" style="width: 80px">
            <template #body="slotProps">
              <div class="qty-container">
                <input
                  v-model.number="slotProps.data.qty"
                  type="number"
                  class="form-control text-right bg-input input-bg"
                  min="0"
                  step="1"
                  @blur="onBlueQty(slotProps.data, slotProps.index, 'qty')"
                  style="background-color: #b5dad4; width: 100%"
                />
              </div>
            </template>
          </column>
          <column
            field="total"
            :header="'รวมราคา (' + (customer.currencyUnit || '') + ') '"
            style="min-width: 150px"
          >
            <template #body="slotProps">
              <div class="qty-container">
                <span>{{
                  (
                    ((Number(slotProps.data.appraisalPrice || 0) *
                      (1 - (slotProps.data.discountPercent || 0) / 100)) /
                      (customer.currencyMultiplier || 1)) *
                    (Number(slotProps.data.qty) || 0)
                  ).toFixed(2)
                }}</span>
              </div>
            </template>
          </column>

          <ColumnGroup type="footer">
            <!-- total -->
            <Row>
              <column :colspan="5">
                <template #footer>
                  <div class="text-left type-container">
                    <span class="mr-2">Net Weight Of Merchandise</span>
                    <span class="mr-2">{{ sumNetWeight }}</span>
                    <span>gms.</span>
                  </div>
                </template>
              </column>
              <column>
                <template #footer>
                  <div class="text-right type-container">
                    <span>รวม</span>
                  </div>
                </template>
              </column>
              <column>
                <template #footer>
                  <div class="text-right type-container">
                    <span>{{ sumGoldWeight }}</span>
                  </div>
                </template>
              </column>
              <column>
                <template #footer>
                  <div class="text-right type-container">
                    <span>{{ sumDiamondWeight }}</span>
                  </div>
                </template>
              </column>
              <column>
                <template #footer>
                  <div class="text-right type-container">
                    <span>{{ sumGemWeight }}</span>
                  </div>
                </template>
              </column>
              <column :colspan="2">
                <template #footer>
                  <div class="text-right type-container">
                    <span>{{ sumAppraisalPrice }}</span>
                  </div>
                </template>
              </column>
              <column :colspan="2">
                <template #footer>
                  <div class="text-right type-container">
                    <span>{{ sumDiscountPrice }}</span>
                  </div>
                </template>
              </column>
              <column :colspan="2">
                <template #footer>
                  <div class="text-right type-container">
                    <span>{{ sumConvertedPrice }}</span>
                  </div>
                </template>
              </column>
              <column>
                <template #footer>
                  <div class="text-right type-container">
                    <span>{{ sumQty }}</span>
                  </div>
                </template>
              </column>
              <column>
                <template #footer>
                  <div class="text-right type-container">
                    <span>{{ sumTotalConvertedPrice }}</span>
                  </div>
                </template>
              </column>
            </Row>
            <!-- ส่วนลดพิเศษ -->
            <Row>
              <column :colspan="16">
                <template #footer>
                  <div class="text-right type-container">
                    <span>ส่วนลดพิเศษ:</span>
                  </div>
                </template>
              </column>
              <column>
                <template #footer>
                  <div class="text-right qty-container">
                    <input
                      v-model.number="customer.specialDiscount"
                      type="number"
                      class="form-control text-right bg-input input-bg"
                      min="0"
                      step="0.01"
                      style="background-color: #b5dad4; width: 100%"
                    />
                  </div>
                </template>
              </column>
            </Row>
            <!-- ส่วนเพิ่มพิเศษ -->
            <Row>
              <column :colspan="16">
                <template #footer>
                  <div class="text-right type-container">
                    <span>ส่วนเพิ่มพิเศษ:</span>
                  </div>
                </template>
              </column>
              <column>
                <template #footer>
                  <div class="text-right qty-container">
                    <input
                      v-model.number="customer.specialAddition"
                      type="number"
                      class="form-control text-right bg-input input-bg"
                      min="0"
                      step="0.01"
                      style="background-color: #b5dad4; width: 100%"
                    />
                  </div>
                </template>
              </column>
            </Row>
            <!-- ยอดรวมหลังปรับ -->
            <Row>
              <column :colspan="16">
                <template #footer>
                  <div class="text-right type-container">
                    <span class="font-weight-bold">ยอดรวมหลังปรับ:</span>
                  </div>
                </template>
              </column>
              <column>
                <template #footer>
                  <div class="text-right type-container">
                    <span class="font-weight-bold">{{ formatPrice(totalAfterDiscountAndAddition) }}</span>
                  </div>
                </template>
              </column>
            </Row>
            <!-- freight -->
            <Row>
              <column :colspan="16">
                <template #footer>
                  <div class="text-right type-container">
                    <span>Freight & Insurance</span>
                  </div>
                </template>
              </column>
              <column>
                <template #footer>
                  <div class="qty-container">
                    <input
                      style="background-color: #b5dad4"
                      v-model="customer.freight"
                      type="number"
                      class="form-control text-right bg-input input-bg"
                      step="any"
                      min="0"
                      required
                      @blur="onBlueFreight(customer.freight)"
                    />
                  </div>
                </template>
              </column>
            </Row>
            <!-- ยอดรวมก่อน VAT -->
            <Row>
              <column :colspan="16">
                <template #footer>
                  <div class="text-right type-container">
                    <span class="font-weight-bold">ยอดรวมก่อน VAT:</span>
                  </div>
                </template>
              </column>
              <column>
                <template #footer>
                  <div class="text-right type-container">
                    <span class="font-weight-bold">{{ formatPrice(totalBeforeVat) }}</span>
                  </div>
                </template>
              </column>
            </Row>
            <!-- VAT -->
            <Row>
              <column :colspan="16">
                <template #footer>
                  <div class="text-right type-container d-flex align-items-center justify-content-end">
                    <span class="mr-2 mt-1">VAT (%) :</span>
                    <input
                      v-model.number="customer.vatPercent"
                      type="number"
                      class="form-control text-right bg-input input-bg"
                      min="0"
                      max="100"
                      step="0.01"
                      style="background-color: #b5dad4; width: 80px"
                      placeholder="0"
                    />
                  </div>
                </template>
              </column>
              <column>
                <template #footer>
                  <div class="text-right type-container">
                    <span>{{ formatPrice(vatAmount) }}</span>
                  </div>
                </template>
              </column>
            </Row>
            <!-- ราคารวม (Grand Total) -->
            <Row>
              <column :colspan="16">
                <template #footer>
                  <div class="text-right type-container">
                    <span>ราคารวม</span>
                  </div>
                </template>
              </column>
              <column>
                <template #footer>
                  <div class="text-right type-container">
                    <span>{{ formatPrice(grandTotal) }}</span>
                  </div>
                </template>
              </column>
            </Row>
          </ColumnGroup>
        </DataTable>
      </div>

      <div class="base-customer">
        <div class="filter-container mt-2">
          <div class="d-flex justify-content-center">
            <button class="btn btn-sm btn-green" type="button" @click="printInvoice()">
              <span>Quotation File</span>
            </button>
            <button class="btn btn-sm btn-green ml-2" type="button" @click="printBreakdown()">
              <span>Breakdown File</span>
            </button>
            <button class="btn btn-sm btn-main ml-2" type="submit">
              <span>Save Quotation</span>
            </button>
          </div>
        </div>
      </div>
    </form>

    <edit-stock-view
      :isShow="isShow.isEditStock"
      :modelStock="modelEditStock"
      @closeModal="onCloseEditStockModal"
    />

    <ConfirmCreatePdfView
      :showModal="showItemsPerPageModal"
      :defaultItemsPerPage="itemsPerPageInput"
      :quotationNumber="customer.invoiceNumber"
      @closeModal="showItemsPerPageModal = false"
      @confirm="onConfirmItemsPerPage"
      @saveAndCreate="onSaveAndCreatePdfAndSave"
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

    <CostVersionPickerModal
      :showModal="isShow.costVersionPicker"
      @closeModal="isShow.costVersionPicker = false"
      @itemSelected="onCostVersionItemSelected"
    />
  </div>
</template>

<script>
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ColumnGroup from 'primevue/columngroup'
import Row from 'primevue/row'
import Calendar from 'primevue/calendar'

import imagePreview from '@/components/prime-vue/ImagePreview.vue'
import editStockView from '@/views/sale/quotation/modal/edit-stock-view.vue'

import ConfirmCreatePdfView from '@/views/sale/quotation/modal/confirm-create-pdf-view.vue'
import CustomerSearchModal from '@/views/sale/quotation/modal/customer-search-modal.vue'
import CustomerCreateModal from '@/views/sale/quotation/modal/customer-create-modal.vue'
import CostVersionPickerModal from '@/views/sale/quotation/modal/cost-version-picker-modal.vue'
import { generateInvoicePdf } from '@/services/helper/pdf/quotation/quotation-pdf-integration.js'
import { generateBreakdownPdf } from '@/services/helper/pdf/quotation/breakdown-pdf-integration.js'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import { usrQuotationApiStore } from '@/stores/modules/api/sale/quotation-store.js'

import { formatDate, formatDateTime, formatISOString } from '@/services/utils/dayjs'
//import swAlert from '@/services/alert/sweetAlerts.js'
import dayjs from 'dayjs'

const interfaceForm = {
  discount: 0,
  freight: 0,
  quotationDate: new Date(),
  name: null,
  invoiceNumber: null,
  goldPerOz: 0,
  quotationItems: [],
  currencyMultiplier: 33.0,
  currencyUnit: 'US$',
  markup: 3.5,
  discountPercent: 0,
  specialDiscount: 0,
  specialAddition: 0,
  vatPercent: 0
}
const interfaceShow = {
  isEditStock: false,
  searchCustomer: false,
  createCustomer: false,
  costVersionPicker: false
}

export default {
  name: 'QuotationView',

  components: {
    DataTable,
    Column,
    ColumnGroup,
    Row,
    imagePreview,
    Calendar,
    editStockView,
    ConfirmCreatePdfView,
    CustomerSearchModal,
    CustomerCreateModal,
    CostVersionPickerModal
  },

  setup() {
    const productStore = usrStockProductApiStore()
    const masterStore = useMasterApiStore()
    const quotationStore = usrQuotationApiStore()
    return { productStore, masterStore, quotationStore }
  },

  props: {
    modelForm: {
      type: Object,
      default: () => ({}),
      required: true
    },
    modelQuotation: {
      type: Object,
      default: () => ({}),
      required: true
    }
  },

  computed: {
    form() {
      return this.modelForm || {}
    },
    sumGoldWeight() {
      let sum = 0
      this.customer.quotationItems.forEach((item) => {
        if (item.materials) {
          item.materials
            .filter((m) => m.type === 'Gold')
            .forEach((m) => {
              sum += Number(m.weight) || 0
            })
        }
      })
      return sum.toFixed(2)
    },
    sumDiamondWeight() {
      let sum = 0
      this.customer.quotationItems.forEach((item) => {
        if (item.materials) {
          item.materials
            .filter((m) => m.type === 'Diamond')
            .forEach((m) => {
              sum += Number(m.weight) || 0
            })
        }
      })
      return sum.toFixed(2)
    },
    sumGemWeight() {
      let sum = 0
      this.customer.quotationItems.forEach((item) => {
        if (item.materials) {
          item.materials
            .filter((m) => m.type === 'Gem')
            .forEach((m) => {
              sum += Number(m.weight) || 0
            })
        }
      })
      return sum.toFixed(2)
    },
    sumQty() {
      let sum = 0
      this.customer.quotationItems.forEach((item) => {
        sum += Number(item.qty) || 0
      })
      return sum
    },
    sumConvertPrice() {
      let sum = 0
      this.customer.quotationItems.forEach((item) => {
        sum += (Number(item.discountPrice) || 0) * this.customer.currencyMultiplier
      })
      return sum.toFixed(2)
    },
    sumAppraisalPrice() {
      let sum = 0
      this.customer.quotationItems.forEach((item) => {
        sum += Number(item.appraisalPrice) || 0
      })
      return sum.toFixed(2)
    },
    sumDiscountPrice() {
      let sum = 0
      this.customer.quotationItems.forEach((item) => {
        sum += (Number(item.appraisalPrice) || 0) * (1 - (item.discountPercent || 0) / 100)
      })
      return sum.toFixed(2)
    },
    sumConvertedPrice() {
      let sum = 0
      this.customer.quotationItems.forEach((item) => {
        sum +=
          ((Number(item.appraisalPrice) || 0) * (1 - (item.discountPercent || 0) / 100)) /
          (this.customer.currencyMultiplier || 1)
      })
      return sum.toFixed(2)
    },
    sumTotalConvertedPrice() {
      let sum = 0
      this.customer.quotationItems.forEach((item) => {
        sum +=
          (((Number(item.appraisalPrice) || 0) * (1 - (item.discountPercent || 0) / 100)) /
            (this.customer.currencyMultiplier || 1)) *
          (Number(item.qty) || 0)
      })
      return sum.toFixed(2)
    },
    sumNetWeight() {
      let gold = 0
      let diamond = 0
      let gem = 0
      this.customer.quotationItems.forEach((item) => {
        if (item.materials) {
          item.materials.forEach((m) => {
            if (m.type === 'Gold') gold += Number(m.weight) || 0
            if (m.type === 'Diamond') diamond += Number(m.weight) || 0
            if (m.type === 'Gem') gem += Number(m.weight) || 0
          })
        }
      })
      const net = (diamond + gem) / 5 + gold
      return net ? net.toFixed(2) : (0).toFixed(2)
    },
    totalAfterDiscountAndAddition() {
      const total = Number(this.sumTotalConvertedPrice) || 0
      return total - (this.customer.specialDiscount || 0) + (this.customer.specialAddition || 0)
    },
    totalBeforeVat() {
      return this.totalAfterDiscountAndAddition + Number(this.customer.freight || 0)
    },
    vatAmount() {
      return this.totalBeforeVat * ((this.customer.vatPercent || 0) / 100)
    },
    grandTotal() {
      return (this.totalBeforeVat + this.vatAmount).toFixed(2)
    },
    masterGold() {
      return this.masterStore.gold
    },
    masterGem() {
      return this.masterStore.gem
    },
    masterDiamondGrade() {
      return this.masterStore.diamondGrade
    }
  },

  watch: {
    async modelForm() {
      await this.fetchGetData()
    },
    async modelQuotation() {
      await this.fetchGetQuotation()
    }
  },

  data() {
    return {
      // quotationItems: [],
      // groupOrderRunning: {
      //   product: 1,
      //   etc: 5
      // },
      type: 'STOCK-PRODUCT',
      customer: {
        ...interfaceForm
        // quotationItems: [],
        // currencyMultiplier: 1,
        // currencyUnit: 'THB',
        // markup: 0,
        // discountPercent: 0
      },
      groupOrderRunning: {
        product: 1,
        etc: 5
      },
      isShow: { ...interfaceShow, isEditStock: false },
      modelEditStock: {},
      editStockIndex: null,
      showItemsPerPageModal: false,
      itemsPerPageInput: 10,
      pendingInvoiceParams: null
    }
  },

  methods: {
    generateQuotationNumber() {
      const now = dayjs()
      const dateStr = now.format('YYYYMMDD')
      const timeStr = now.format('HHmmss')
      this.customer.invoiceNumber = `QT-${dateStr}-${timeStr}`
    },
    delItem(index) {
      this.customer.quotationItems.splice(index, 1)
    },

    calTotalPrice(items) {
      // ใช้ currencyMultiplier ในการคำนวณราคารวม
      const sum = items.reduce((total, item) => {
        return (
          total +
          (Number(item.price) / (this.customer.currencyMultiplier || 1)) * (Number(item.qty) || 1)
        )
      }, 0)
      return sum.toFixed(2)
    },
    calTotalPriceAfterDiscount(items) {
      // ใช้ currencyMultiplier และ per-item discountPercent ในการคำนวณราคารวมหลังหักส่วนลด
      const sum = items.reduce((total, item) => {
        const priceAfterDiscount =
          (((Number(item.appraisalPrice) || 0) * (1 - (item.discountPercent || 0) / 100)) /
            (this.customer.currencyMultiplier || 1)) *
          (Number(item.qty) || 1)
        return total + priceAfterDiscount
      }, 0)

      // + finsurance
      const freight = Number(this.customer.freight) || 0
      return (sum + freight).toFixed(2)
    },

    getGroupName(id) {
      switch (id) {
        case 'product':
          return 'รายการสินค้า'

        default:
          return 'Unknown'
      }
    },
    getDescription(stock) {
      return `${stock.productNameEn} ${stock.size ?? ''}`
    },
    GetMaterial(materials, fieldName, type) {
      let result = ''
      if (materials) {
        materials = materials.filter((item) => {
          return item.type === type
        })

        materials.forEach((item) => {
          result += `${item[fieldName]} `
        })
      }
      return result
    },
    onBluePrice(item, index, fieldName) {
      // แปลงค่าเป็นทศนิยม 3 ตำแหน่งเมื่อออกจาก input
      let newCal = {
        ...item,
        [fieldName]: item[fieldName] ? Number(item[fieldName]).toFixed(2) : 0,
        totalPrice: Number(item.price).toFixed(2)
      }

      // ในVue 3, เราสามารถอัปเดตได้โดยตรง
      this.customer.quotationItems[index] = newCal

      //console.log('onBluePrice' + fieldName, this.quotationItems[item])
      //console.log('onBluePrice' + fieldName, this.quotationItems)
      //this.onUpdateQty(item)
    },
    onBlueFreight(freight) {
      // แปลงค่าเป็นทศนิยม 3 ตำแหน่งเมื่อออกจาก input
      this.customer.freight = freight ? Number(freight).toFixed(2) : 0
    },
    onBlueQty(item, index, fieldName) {
      let newCal = {
        ...item,
        [fieldName]: item[fieldName] ? Number(item[fieldName]) : 0
      }
      this.customer.quotationItems[index] = newCal
    },
    onBlueDescription(item, index, fieldName) {
      let newCal = {
        ...item,
        [fieldName]: item[fieldName] ? item[fieldName] : ''
      }
      this.customer.quotationItems[index] = newCal
    },
    // ฟังก์ชันสำหรับจัดรูปแบบตัวเลขให้มีลูกน้ำและทศนิยม 2 ตำแหน่ง
    formatPrice(price) {
      const numPrice = Number(price)

      // ใช้ toLocaleString เพื่อจัดรูปแบบตัวเลขให้มีลูกน้ำคั่นและทศนิยม 2 ตำแหน่ง
      return numPrice.toLocaleString('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },

    applyGlobalDiscount() {
      this.customer.quotationItems.forEach((item) => {
        item.discountPercent = this.customer.discountPercent || 0
      })
    },
    async fetchGetData() {
      var data = await this.productStore.fetchDataGet({ formValue: this.form })

      if (data) {
        data = {
          ...data,
          price: data.productPrice ? Number(data.productPrice).toFixed(2) : 0,
          appraisalPrice: data.productPrice ? Number(data.productPrice).toFixed(2) : 0,
          description: data.productNameEn,
          group: 'product',
          planQty: data.planQty || 1,
          stockNumberOrigin: data.stockNumberOrigin || data.stockNumber,
          discountPercent: this.customer.discountPercent || 0
        }

        //data is object
        this.customer.quotationItems.push(data)
      }
    },
    formatDateTime(date) {
      return date ? formatDateTime(date) : ''
    },
    formatDate(date) {
      return date ? formatDate(date) : ''
    },

    printInvoice() {
      // เปิด modal รับค่าจำนวนรายการต่อหน้า
      this.pendingInvoiceParams = {
        items: this.customer.quotationItems,
        customer: this.customer,
        invoiceDate: this.customer.quotationDate,
        filename: `Invoice_${dayjs().format('YYYYMMDD_HHmmss')}.pdf`,
        openInNewTab: true
        // ไม่ต้องเปิด window ตรงนี้ ให้ไปเปิดใน onConfirmItemsPerPage แทน
        // targetWindow: window.open('', '_blank')
      }
      this.showItemsPerPageModal = true
    },
    onConfirmItemsPerPage(itemsPerPage, showCifLabel) {
      this.showItemsPerPageModal = false
      if (!this.pendingInvoiceParams) return
      // เปิด window ที่นี่เพื่อหลีกเลี่ยง popup block เฉพาะตอนยืนยัน
      const win1 = window.open('', '_blank')
      generateInvoicePdf({
        ...this.pendingInvoiceParams,
        itemsPerPage: itemsPerPage,
        targetWindow: win1,
        customer: { ...this.pendingInvoiceParams.customer, showCifLabel: showCifLabel !== undefined ? showCifLabel : true }
      })
      this.pendingInvoiceParams = null
    },
    printBreakdown() {
      const filename = `Breakdown_${dayjs().format('YYYYMMDD_HHmmss')}.pdf`
      const win1 = window.open('', '_blank')

      console.log('printBreakdown', this.customer.quotationItems, this.customer)
      generateBreakdownPdf({
        items: this.customer.quotationItems,
        customer: this.customer,
        invoiceDate: this.customer.quotationDate,
        filename,
        openInNewTab: true,
        targetWindow: win1
      })
    },
    onEditStock(item, index) {
      this.modelEditStock = JSON.parse(JSON.stringify(item))
      this.editStockIndex = index
      this.isShow.isEditStock = true
    },
    onCloseEditStockModal(payload) {
      this.isShow.isEditStock = false
      if (payload && payload.action === 'save' && payload.data) {
        // อัปเดตข้อมูลในตาราง - ใช้ deep copy เพื่อป้องกัน reference issues
        this.customer.quotationItems[this.editStockIndex] = JSON.parse(JSON.stringify(payload.data))

        // sync discountPrice ถ้ามี priceDiscount (จาก modal)
        if (payload.data.priceDiscount !== undefined && payload.data.priceDiscount !== null) {
          this.customer.quotationItems[this.editStockIndex].discountPrice =
            payload.data.priceDiscount
        }
      }
      // รีเซ็ต editing state
      this.modelEditStock = {}
      this.editStockIndex = null
    },
    copyItem(item) {
      // Deep copy the item
      const newItem = JSON.parse(JSON.stringify(item))

      // Reset identifiers to make it a true copy
      newItem.stockNumber = null
      newItem.stockNumberOrigin = null

      // Generate unique ID for the copied item to prevent reference issues
      newItem._copyId = Date.now() + Math.random()

      // Ensure materials array is a new instance
      if (newItem.materials && Array.isArray(newItem.materials)) {
        newItem.materials = newItem.materials.map((material) => ({ ...material }))
      }

      // Ensure priceTransactions array is a new instance
      if (newItem.priceTransactions && Array.isArray(newItem.priceTransactions)) {
        newItem.priceTransactions = newItem.priceTransactions.map((transaction) => ({
          ...transaction
        }))
      }

      // Reset any computed/calculated prices to ensure independent calculation
      newItem.appraisalPrice = newItem.priceOrigin || newItem.price || 0

      this.customer.quotationItems.push(newItem)
    },

    onOpenCostVersionPicker() {
      this.isShow.costVersionPicker = true
    },

    async onCostVersionItemSelected(version) {
      this.isShow.costVersionPicker = false

      // 1. Fetch stock product data (materials, imagePath, etc.)
      const data = await this.productStore.fetchDataGet({
        formValue: { stockNumber: version.stockNumber }
      })

      if (data) {
        // 2. Calculate appraisal price from cost version
        const costTotal = (version.prictransection || []).reduce(
          (sum, t) => sum + (t.totalPrice || 0),
          0
        )
        const appraisalPrice = costTotal * (version.tagPriceMultiplier || 1)

        // 3. Map prictransection → priceTransactions format
        const priceTransactions = (version.prictransection || []).map((t) => ({
          nameGroup: t.nameGroup,
          nameDescription: t.nameDescription,
          qty: t.qty,
          qtyPrice: t.qtyPrice,
          qtyWeight: t.qtyWeight,
          qtyWeightPrice: t.qtyWeightPrice,
          totalPrice: t.totalPrice
        }))

        // 4. Add item to quotation
        const item = {
          ...data,
          price: data.productPrice ? Number(data.productPrice).toFixed(2) : 0,
          priceOrigin: data.productPrice ? Number(data.productPrice).toFixed(2) : 0,
          appraisalPrice: Number(appraisalPrice).toFixed(2),
          description: data.productNameEn,
          group: 'product',
          planQty: data.planQty || 1,
          qty: 1,
          stockNumberOrigin: data.stockNumberOrigin || data.stockNumber,
          materials: data.materials || [],
          priceTransactions: priceTransactions,
          source: 'costVersion',
          costVersionRunning: version.running,
          discountPercent: this.customer.discountPercent || 0
        }

        this.customer.quotationItems.push(item)
      }
    },

    onSave() {
      this.fetchSaveQuotation()
    },
    async fetchSaveQuotation() {
      //console.log('fetchSaveQuotation', this.customer)

      const dataSave = this.customer.quotationItems

      const formValue = {
        number: this.customer.invoiceNumber,

        customerName: this.customer.name ? this.customer.name.trim() : '',
        customerAddress: this.customer.address ? this.customer.address.trim() : '',
        customerPhone: this.customer.tel ? this.customer.tel.trim() : '',
        customerEmail: this.customer.email ? this.customer.email.trim() : '',

        currency: this.customer.currencyUnit ? this.customer.currencyUnit.trim() : '',
        currencyRate: this.customer.currencyMultiplier || 1,

        markup: this.customer.markup || 0,
        discount: this.customer.discountPercent || 0,

        freight: this.customer.freight || 0,
        date: this.customer.quotationDate ? formatISOString(this.customer.quotationDate) : '',
        remark: this.customer.remark ? this.customer.remark.trim() : '',

        specialDiscount: this.customer.specialDiscount || 0,
        specialAddition: this.customer.specialAddition || 0,
        vat: this.customer.vatPercent || 0,
        goldPerOz: this.customer.goldPerOz || 0,

        //data is quoatationItems in parse in json string
        data: JSON.stringify(dataSave || [])
      }

      const res = await this.quotationStore.fetchSave({ formValue })
      if (res) {
        // แสดงข้อความสำเร็จ
      } else {
        // แสดงข้อความผิดพลาด
      }
    },
    async fetchGetQuotation() {

      console.log('Fetching quotation with number:', this.modelQuotation)
      const formValue = {
        number: this.modelQuotation.number || null
      }

      const res = await this.quotationStore.fetchGet({ formValue })

      if (res) {
        this.customer = {
          ...this.customer,
          ...res,
          quotationItems: res.data ? JSON.parse(res.data) : [],
          freight: res.freight || 0,

          currencyUnit: res.currency || 'THB',
          currencyMultiplier: res.currencyRate || 1,

          markup: res.markUp || 0,
          discountPercent: res.discount || 0,

          invoiceNumber: res.number || null,
          remark: res.remark || '',

          name: res.customerName || '',
          address: res.customerAddress || '',
          tel: res.customerPhone || '',
          email: res.customerEmail || '',

          specialDiscount: res.specialDiscount || 0,
          specialAddition: res.specialAddition || 0,
          vatPercent: res.vat || 0,
          goldPerOz: res.goldPerOz || 0
        }
        console.log('fetchGetQuotation', res)
        this.customer.quotationDate = res.date ? new Date(res.date) : new Date()
      }
    },
    onSaveAndCreatePdfAndSave(itemsPerPage, showCifLabel) {
      // Save the quotation first
      this.fetchSaveQuotation().then(() => {
        // After saving, generate and open the PDF
        const win1 = window.open('', '_blank')
        generateInvoicePdf({
          items: this.customer.quotationItems,
          customer: { ...this.customer, showCifLabel: showCifLabel !== undefined ? showCifLabel : true },
          invoiceDate: this.customer.quotationDate,
          filename: `Invoice_${dayjs().format('YYYYMMDD_HHmmss')}.pdf`,
          openInNewTab: true,
          itemsPerPage: itemsPerPage,
          targetWindow: win1
        })
      })
    },

    // Customer-related methods
    onSearchCustomer() {
      this.isShow.searchCustomer = true
    },

    onCreateCustomer() {
      this.isShow.createCustomer = true
    },

    onCustomerSelected(customerData) {
      this.customer = {
        ...this.customer,
        name: customerData.nameTh || customerData.nameEn || '',
        address: customerData.address || '',
        tel: customerData.telephone1 || '',
        email: customerData.email || '',
        customerId: customerData.id
      }
      this.isShow.searchCustomer = false
    },

    onCustomerCreated(customerData) {
      this.customer = {
        ...this.customer,
        name: customerData.nameTh || customerData.nameEn || '',
        address: customerData.address || '',
        tel: customerData.telephone1 || '',
        email: customerData.email || '',
        customerId: customerData.id
      }
      this.isShow.createCustomer = false
    },

    onCloseCustomerModal() {
      this.isShow.searchCustomer = false
      this.isShow.createCustomer = false
    },

    getRowClass(data, index) {
      // เพิ่มสีไฮไลท์สำหรับ row ที่กำลังแก้ไข
      if (this.editStockIndex === index) {
        return 'editing-row'
      }
      return ''
    }
  },

  async created() {
    this.generateQuotationNumber()
    this.$nextTick(async () => {
      await this.masterStore.fetchGold()
      await this.masterStore.fetchGem()
      await this.masterStore.fetchDiamondGrade()
    })
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/overide-prime-vue/data-table-dub.scss';

.input-bg {
  background-color: #b5dad4 !important;
}

.remark-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 0.5rem;
}

.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
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
  //margin: 0px 0px 10px 0px;
}

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

/* --- align cell content to top for all columns --- */
:deep(.p-column-body),
:deep(.p-cell-text),
.qty-container,
.type-container,
.form-control {
  align-items: flex-start !important;
  vertical-align: top !important;
}
:deep(.p-column-body) {
  vertical-align: top !important;
}
:deep(.p-column-body) > * {
  align-items: flex-start !important;
  justify-content: flex-start !important;
  display: flex;
}

/* Highlight row being edited */
:deep(.editing-row) {
  background-color: #fff3cd !important; /* Light yellow background */
  border-left: 4px solid #ffc107 !important; /* Yellow left border */
}

:deep(.editing-row:hover) {
  background-color: #fff3cd !important; /* Keep same color on hover */
}

:deep(.editing-row .p-column-body) {
  background-color: transparent !important;
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
</style>
