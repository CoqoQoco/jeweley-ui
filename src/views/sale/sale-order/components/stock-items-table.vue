<template>
  <div class="card-container mt-3">
    <div class="card-header">
      <h6 class="mb-0">{{ $t('view.sale.saleOrder.itemList') }}</h6>
      <div class="card-header-actions">
        <span class="badge badge-warning">{{ stockItems.length }} {{ $t('view.sale.saleOrder.itemUnit') }}</span>
        <!-- Gear button for column settings -->
        <div class="stock-col-settings-wrapper">
          <button class="stock-col-settings-btn" @click.stop="isSettingsOpen = !isSettingsOpen" title="ตั้งค่าคอลัมน์">
            <i class="bi bi-gear-fill"></i>
          </button>
          <div v-if="isSettingsOpen" class="stock-col-settings-panel">
            <div class="stock-col-settings-header">
              <i class="bi bi-gear-fill"></i> ตั้งค่าคอลัมน์
            </div>
            <div class="stock-col-settings-list">
              <div v-for="col in columnFreezeList" :key="col.field" class="stock-col-settings-item">
                <span class="stock-col-settings-name">{{ col.label }}</span>
                <div class="stock-col-freeze-btns">
                  <button
                    :class="['freeze-btn', { active: isFrozenLeft(col.field) }]"
                    @click="toggleFreezeCol(col.field, 'left')"
                    title="ปักหมุดซ้าย"
                  ><i class="bi bi-pin-angle-fill"></i> ซ้าย</button>
                  <button
                    :class="['freeze-btn', { active: isFrozenRight(col.field) }]"
                    @click="toggleFreezeCol(col.field, 'right')"
                    title="ปักหมุดขวา"
                  ><i class="bi bi-pin-angle-fill"></i> ขวา</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="card-body p-0">
      <!-- eslint-disable-next-line no-restricted-imports -->
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
            <Column header="" :frozen="!!frozenCols['index']" :alignFrozen="frozenCols['index'] || undefined" />
            <Column header="" :frozen="!!frozenCols['action']" :alignFrozen="frozenCols['action'] || undefined" />
            <Column header="" :frozen="!!frozenCols['image']" :alignFrozen="frozenCols['image'] || undefined" />
            <Column :header="$t('view.sale.saleOrder.stockNumberNew')" :frozen="!!frozenCols['stockNumber']" :alignFrozen="frozenCols['stockNumber'] || undefined" />
            <Column :header="$t('view.sale.saleOrder.stockNumberOld')" :frozen="!!frozenCols['stockNumberOld']" :alignFrozen="frozenCols['stockNumberOld'] || undefined" />
            <Column :header="$t('view.sale.saleOrder.productCode')" :frozen="!!frozenCols['productNumber']" :alignFrozen="frozenCols['productNumber'] || undefined" />
            <Column :header="$t('view.sale.saleOrder.saleStatus')" :frozen="!!frozenCols['isConfirm']" :alignFrozen="frozenCols['isConfirm'] || undefined" />
            <Column :header="$t('view.sale.saleOrder.description')" :frozen="!!frozenCols['description']" :alignFrozen="frozenCols['description'] || undefined" />
            <Column header="Gold (gms)" :frozen="!!frozenCols['gold']" :alignFrozen="frozenCols['gold'] || undefined" />
            <Column header="Diamond (cts)" :frozen="!!frozenCols['diamond']" :alignFrozen="frozenCols['diamond'] || undefined" />
            <Column header="Stone (cts)" :frozen="!!frozenCols['gem']" :alignFrozen="frozenCols['gem'] || undefined" />
            <Column :header="$t('view.sale.saleOrder.salePriceTHB')" :frozen="!!frozenCols['priceOrigin']" :alignFrozen="frozenCols['priceOrigin'] || undefined" />
            <Column :header="$t('view.sale.saleOrder.appraisalPriceTHB')" :frozen="!!frozenCols['appraisalPrice']" :alignFrozen="frozenCols['appraisalPrice'] || undefined" />
            <Column :header="$t('view.sale.saleOrder.discountPercent')" :frozen="!!frozenCols['discountPercent']" :alignFrozen="frozenCols['discountPercent'] || undefined" />
            <Column :header="$t('view.sale.saleOrder.discountPriceTHB')" :frozen="!!frozenCols['discountPrice']" :alignFrozen="frozenCols['discountPrice'] || undefined" />
            <Column :header="$t('view.sale.saleOrder.convertedRate')" :frozen="!!frozenCols['currencyRate']" :alignFrozen="frozenCols['currencyRate'] || undefined" />
            <Column :header="$t('view.sale.saleOrder.convertedPrice') + ' (' + (formSaleOrder.currencyUnit || 'THB') + ')'" :frozen="!!frozenCols['priceAfterMultiply']" :alignFrozen="frozenCols['priceAfterMultiply'] || undefined" />
            <Column :header="$t('common.field.quantity')" :frozen="!!frozenCols['qty']" :alignFrozen="frozenCols['qty'] || undefined" />
            <Column :header="$t('view.sale.saleOrder.totalPrice') + ' (' + (formSaleOrder.currencyUnit || 'THB') + ')'" :frozen="!!frozenCols['total']" :alignFrozen="frozenCols['total'] || undefined" />
          </Row>
        </ColumnGroup>

        <Column field="index" style="width: 10px"
          :frozen="!!frozenCols['index']"
          :alignFrozen="frozenCols['index'] || undefined"
        >
          <template #body="slotProps">
            <span>{{ slotProps.index + 1 }}</span>
          </template>
        </Column>

        <Column field="action" style="width: 10px"
          :frozen="!!frozenCols['action']"
          :alignFrozen="frozenCols['action'] || undefined"
        >
          <template #body="slotProps">
            <div class="d-flex justify-content-center align-items-center">
              <button
                :class="[
                  'btn',
                  'btn-sm',
                  slotProps.data.isConfirm || slotProps.data.invoice ? 'btn-dark' : 'btn-red'
                ]"
                type="button"
                :title="$t('common.btn.delete')"
                @click="$emit('delete-item', slotProps.data)"
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
                    ? 'btn-dark'
                    : 'btn-main'
                ]"
                type="button"
                :title="$t('common.btn.edit')"
                @click="$emit('edit-item', slotProps.data)"
                :disabled="slotProps.data.isConfirm || slotProps.data.invoice"
              >
                <span class="bi bi-brush"></span>
              </button>
              <button
                v-if="slotProps.data.isConfirm && !slotProps.data.invoice"
                class="btn btn-sm btn-danger ml-2"
                type="button"
                :title="$t('view.sale.saleOrder.cancelConfirmTitle')"
                @click="$emit('cancel-confirmation', slotProps.data)"
              >
                <span class="bi bi-arrow-counterclockwise"></span>
              </button>
            </div>
          </template>
        </Column>

        <Column field="image" header="" style="width: 50px"
          :frozen="!!frozenCols['image']"
          :alignFrozen="frozenCols['image'] || undefined"
        >
          <template #body="slotProps">
            <div class="image-container">
              <div v-if="slotProps.data.imagePath">
                <imagePreview
                  :imageName="slotProps.data.imagePath"
                  :path="slotProps.data.imagePath"
                  type="STOCK-PRODUCT"
                  :width="25"
                  :height="25"
                  :emitImage="true"
                  @image-loaded="$emit('image-loaded', { imageData: $event, stockNumber: slotProps.data.stockNumber })"
                />
              </div>
            </div>
          </template>
        </Column>

        <Column field="stockNumber" :header="$t('view.sale.saleOrder.productionNumber')" style="min-width: 150px"
          :frozen="!!frozenCols['stockNumber']"
          :alignFrozen="frozenCols['stockNumber'] || undefined"
        >
          <template #body="slotProps">
            <div class="d-flex flex-column">
              <span>{{ `${slotProps.data.stockNumber}` }}</span>
              <small v-if="slotProps.data.message" class="text-main">{{
                `${slotProps.data.message}`
              }}</small>
            </div>
          </template>
        </Column>

        <Column field="stockNumber" :header="$t('view.sale.saleOrder.productionNumber')" style="min-width: 150px"
          :frozen="!!frozenCols['stockNumberOld']"
          :alignFrozen="frozenCols['stockNumberOld'] || undefined"
        >
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

        <Column field="productNumber" :header="$t('view.sale.saleOrder.productCode')" style="min-width: 150px"
          :frozen="!!frozenCols['productNumber']"
          :alignFrozen="frozenCols['productNumber'] || undefined"
        >
          <template #body="slotProps">
            <div v-if="!slotProps.data.stockNumber">
              <input
                v-if="!slotProps.data.isConfirm && !slotProps.data.invoice"
                v-model="slotProps.data.productNumber"
                type="text"
                class="form-control bg-input input-bg"
                @blur="$emit('blur-description', { item: slotProps.data, stockNumber: slotProps.data.stockNumber, field: 'productNumber', event: $event })"
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
        <Column field="isConfirm" :header="$t('view.sale.saleOrder.saleStatus')" style="min-width: 120px"
          :frozen="!!frozenCols['isConfirm']"
          :alignFrozen="frozenCols['isConfirm'] || undefined"
        >
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
                {{ slotProps.data.isConfirm ? $t('view.sale.saleOrder.statusConfirmed') : $t('view.sale.saleOrder.statusPending') }}
              </span>
            </div>
          </template>
        </Column>

        <Column field="description" :header="$t('view.sale.saleOrder.description')" style="min-width: 200px"
          :frozen="!!frozenCols['description']"
          :alignFrozen="frozenCols['description'] || undefined"
        >
          <template #body="slotProps">
            <input
              v-if="!slotProps.data.isConfirm && !slotProps.data.invoice"
              v-model="slotProps.data.description"
              type="text"
              class="form-control bg-input input-bg"
              @blur="$emit('blur-description', { item: slotProps.data, stockNumber: slotProps.data.stockNumber, field: 'description', event: $event })"
              style="background-color: #b5dad4; width: 100%"
            />
            <span v-else class="confirmed-text">
              {{ slotProps.data.description || '-' }}
            </span>
          </template>
        </Column>

        <!-- Materials Columns like Quotation -->
        <Column field="gold" style="min-width: 120px; max-width: 300px"
          :frozen="!!frozenCols['gold']"
          :alignFrozen="frozenCols['gold'] || undefined"
        >
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

        <Column field="diamond" style="min-width: 140px; max-width: 300px"
          :frozen="!!frozenCols['diamond']"
          :alignFrozen="frozenCols['diamond'] || undefined"
        >
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

        <Column field="gem" style="min-width: 140px; max-width: 300px"
          :frozen="!!frozenCols['gem']"
          :alignFrozen="frozenCols['gem'] || undefined"
        >
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

        <Column field="priceOrigin" :header="$t('view.sale.saleOrder.salePriceTHB')" style="min-width: 150px"
          :frozen="!!frozenCols['priceOrigin']"
          :alignFrozen="frozenCols['priceOrigin'] || undefined"
        >
          <template #body="slotProps">
            <div class="qty-container">
              <span>{{
                Number(slotProps.data.priceOrigin || slotProps.data.price || 0).toFixed(2)
              }}</span>
            </div>
          </template>
        </Column>

        <Column field="appraisalPrice" :header="$t('view.sale.saleOrder.appraisalPriceTHB')" style="min-width: 150px"
          :frozen="!!frozenCols['appraisalPrice']"
          :alignFrozen="frozenCols['appraisalPrice'] || undefined"
        >
          <template #body="slotProps">
            <div class="qty-container">
              <input
                v-if="!slotProps.data.isConfirm && !slotProps.data.invoice"
                v-model.number="slotProps.data.appraisalPrice"
                type="number"
                class="form-control text-right bg-input input-bg"
                min="0"
                step="any"
                @blur="$emit('blur-price', { item: slotProps.data, stockNumber: slotProps.data.stockNumber, field: 'appraisalPrice', event: $event })"
                style="background-color: #b5dad4; width: 100%"
              />
              <span v-else class="confirmed-text text-right">
                {{ (Number(slotProps.data.appraisalPrice) || 0).toFixed(2) }}
              </span>
            </div>
          </template>
        </Column>

        <Column field="discountPercent" :header="$t('view.sale.saleOrder.discountPercent')" style="min-width: 100px"
          :frozen="!!frozenCols['discountPercent']"
          :alignFrozen="frozenCols['discountPercent'] || undefined"
        >
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
                @blur="$emit('blur-price', { item: slotProps.data, stockNumber: slotProps.data.stockNumber, field: 'discountPercent', event: $event })"
                style="background-color: #b5dad4; width: 100%"
                placeholder="0"
              />
              <span v-else class="confirmed-text text-right">
                {{ (Number(slotProps.data.discountPercent) || 0).toFixed(2) }}%
              </span>
            </div>
          </template>
        </Column>

        <Column field="discountPrice" :header="$t('view.sale.saleOrder.discountPriceTHB')" style="min-width: 150px"
          :frozen="!!frozenCols['discountPrice']"
          :alignFrozen="frozenCols['discountPrice'] || undefined"
        >
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

        <Column field="currencyRate" :header="$t('view.sale.saleOrder.convertedRate')" style="min-width: 100px"
          :frozen="!!frozenCols['currencyRate']"
          :alignFrozen="frozenCols['currencyRate'] || undefined"
        >
          <template #body>
            <div class="qty-container">
              <span>{{ formSaleOrder.currencyRate }}</span>
            </div>
          </template>
        </Column>

        <Column
          field="priceAfterMultiply"
          :header="$t('view.sale.saleOrder.convertedPrice') + ' (' + (formSaleOrder.currencyUnit || '') + ')'"
          style="min-width: 150px"
          :frozen="!!frozenCols['priceAfterMultiply']"
          :alignFrozen="frozenCols['priceAfterMultiply'] || undefined"
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

        <Column field="qty" :header="$t('common.field.quantity')" style="width: 80px"
          :frozen="!!frozenCols['qty']"
          :alignFrozen="frozenCols['qty'] || undefined"
        >
          <template #body="slotProps">
            <div class="qty-container">
              <input
                v-if="!slotProps.data.isConfirm && !slotProps.data.invoice"
                v-model.number="slotProps.data.qty"
                type="number"
                class="form-control text-right bg-input input-bg"
                min="0"
                step="1"
                @blur="$emit('blur-qty', { item: slotProps.data, stockNumber: slotProps.data.stockNumber, field: 'qty', event: $event })"
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
          :header="$t('view.sale.saleOrder.totalPrice') + ' (' + (formSaleOrder.currencyUnit || '') + ')'"
          style="min-width: 150px"
          :frozen="!!frozenCols['total']"
          :alignFrozen="frozenCols['total'] || undefined"
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
            <span class="font-weight-bold">{{ $t('view.sale.saleOrder.invoiceLabel') }}: </span>
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
          </div>
          <!-- สินค้าที่ยืนยันแล้วแต่ยังไม่มี Invoice (รอออก Invoice) -->
          <div
            v-else-if="slotProps.data.isConfirm"
            class="p-1"
            style="background-color: var(--base-green); border-left: 4px solid #038387"
          >
            <span class="font-weight-bold text-white">{{ $t('view.sale.saleOrder.pendingInvoice') }}</span>
          </div>
          <!-- สินค้าที่ยังไม่ได้ยืนยัน (รอยืนยันสินค้า) -->
          <div
            v-else
            class="p-1"
            style="background-color: #fff3cd; border-left: 4px solid #fabc3f"
          >
            <span class="font-weight-bold badge badge-warning">{{ $t('view.sale.saleOrder.pendingConfirm') }}</span>
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
                  <span>{{ $t('view.sale.quotation.total') }}</span>
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
            <Column
              :frozen="isTotalFrozenRight"
              :alignFrozen="isTotalFrozenRight ? 'right' : undefined"
            >
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
          <!-- ส่วนลดพิเศษ -->
          <Row>
            <Column :colspan="18">
              <template #footer>
                <div class="text-right type-container">
                  <span>{{ $t('view.sale.quotation.specialDiscount') }}:</span>
                </div>
              </template>
            </Column>
            <Column
              :frozen="isTotalFrozenRight"
              :alignFrozen="isTotalFrozenRight ? 'right' : undefined"
            >
              <template #footer>
                <div class="text-right qty-container">
                  <input
                    :value="formSaleOrder.specialDiscount"
                    type="number"
                    class="form-control text-right bg-input input-bg"
                    min="0"
                    step="0.01"
                    style="background-color: #b5dad4; width: 100%"
                    @input="$emit('update:special-discount', Number($event.target.value))"
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
                  <span>{{ $t('view.sale.quotation.specialSurcharge') }}:</span>
                </div>
              </template>
            </Column>
            <Column
              :frozen="isTotalFrozenRight"
              :alignFrozen="isTotalFrozenRight ? 'right' : undefined"
            >
              <template #footer>
                <div class="text-right qty-container">
                  <input
                    :value="formSaleOrder.specialAddition"
                    type="number"
                    class="form-control text-right bg-input input-bg"
                    min="0"
                    step="0.01"
                    style="background-color: #b5dad4; width: 100%"
                    @input="$emit('update:special-addition', Number($event.target.value))"
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
                  <span class="font-weight-bold">{{ $t('view.sale.quotation.adjustedTotal') }}:</span>
                </div>
              </template>
            </Column>
            <Column
              :frozen="isTotalFrozenRight"
              :alignFrozen="isTotalFrozenRight ? 'right' : undefined"
            >
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
            <Column
              :frozen="isTotalFrozenRight"
              :alignFrozen="isTotalFrozenRight ? 'right' : undefined"
            >
              <template #footer>
                <div class="qty-container">
                  <input
                    style="background-color: #b5dad4"
                    :value="formSaleOrder.freight"
                    type="number"
                    class="form-control text-right bg-input input-bg"
                    step="any"
                    min="0"
                    @input="$emit('update:freight', Number($event.target.value))"
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
                  <span class="font-weight-bold">{{ $t('view.sale.quotation.beforeVatTotal') }}:</span>
                </div>
              </template>
            </Column>
            <Column
              :frozen="isTotalFrozenRight"
              :alignFrozen="isTotalFrozenRight ? 'right' : undefined"
            >
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
                    :value="formSaleOrder.vatPercent"
                    type="number"
                    class="form-control text-right bg-input input-bg"
                    min="0"
                    max="100"
                    step="0.01"
                    style="background-color: #b5dad4; width: 80px"
                    placeholder="0"
                    @input="$emit('update:vat-percent', Number($event.target.value))"
                  />
                </div>
              </template>
            </Column>
            <Column
              :frozen="isTotalFrozenRight"
              :alignFrozen="isTotalFrozenRight ? 'right' : undefined"
            >
              <template #footer>
                <div class="text-right type-container">
                  <span>{{ formatPrice(soVatAmount) }}</span>
                </div>
              </template>
            </Column>
          </Row>
          <!-- ราคารวม (ก่อนปัด) -->
          <Row>
            <Column :colspan="18">
              <template #footer>
                <div class="text-right type-container">
                  <span>{{ $t('view.sale.quotation.preTotalBeforeRound') }}</span>
                </div>
              </template>
            </Column>
            <Column
              :frozen="isTotalFrozenRight"
              :alignFrozen="isTotalFrozenRight ? 'right' : undefined"
            >
              <template #footer>
                <div class="text-right type-container">
                  <span>{{ formatPrice(grandTotalRaw) }}</span>
                </div>
              </template>
            </Column>
          </Row>
          <!-- ปัดเศษ -->
          <Row v-if="roundingAdjustment > 0">
            <Column :colspan="18">
              <template #footer>
                <div class="text-right type-container">
                  <span>{{ $t('view.sale.quotation.rounding') }}</span>
                </div>
              </template>
            </Column>
            <Column
              :frozen="isTotalFrozenRight"
              :alignFrozen="isTotalFrozenRight ? 'right' : undefined"
            >
              <template #footer>
                <div class="text-right type-container">
                  <span>+{{ formatPrice(roundingAdjustment) }}</span>
                </div>
              </template>
            </Column>
          </Row>
          <!-- ยอดที่ต้องชำระ -->
          <Row>
            <Column :colspan="18">
              <template #footer>
                <div class="text-right type-container">
                  <span class="font-weight-bold">{{ $t('view.sale.quotation.payableTotal') }}</span>
                </div>
              </template>
            </Column>
            <Column
              :frozen="isTotalFrozenRight"
              :alignFrozen="isTotalFrozenRight ? 'right' : undefined"
            >
              <template #footer>
                <div class="text-right type-container">
                  <span class="font-weight-bold">{{ formatPrice(grandTotalRounded) }}</span>
                </div>
              </template>
            </Column>
          </Row>
        </ColumnGroup>
      </DataTable>
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
import { formatDecimal } from '@/services/utils/decimal.js'

export default {
  name: 'StockItemsTable',

  components: {
    DataTable,
    Column,
    ColumnGroup,
    Row,
    imagePreview
  },

  props: {
    stockItems: {
      type: Array,
      default: () => []
    },
    formSaleOrder: {
      type: Object,
      default: () => ({})
    },
    soTotalAfterSpecial: {
      type: Number,
      default: 0
    },
    soTotalBeforeVat: {
      type: Number,
      default: 0
    },
    soVatAmount: {
      type: Number,
      default: 0
    },
    grandTotalRaw: {
      type: Number,
      default: 0
    },
    grandTotalRounded: {
      type: Number,
      default: 0
    },
    roundingAdjustment: {
      type: Number,
      default: 0
    }
  },

  emits: ['delete-item', 'edit-item', 'cancel-confirmation', 'image-loaded', 'blur-price', 'blur-qty', 'blur-description', 'update:special-discount', 'update:special-addition', 'update:freight', 'update:vat-percent'],

  data() {
    return {
      isSettingsOpen: false,
      frozenCols: {}
    }
  },

  computed: {
    isTotalFrozenRight() {
      return this.frozenCols['total'] === 'right'
    },

    columnFreezeList() {
      return [
        { field: 'index', label: '#' },
        { field: 'action', label: 'Action' },
        { field: 'image', label: 'รูป' },
        { field: 'stockNumber', label: this.$t('view.sale.saleOrder.stockNumberNew') },
        { field: 'stockNumberOld', label: this.$t('view.sale.saleOrder.stockNumberOld') },
        { field: 'productNumber', label: this.$t('view.sale.saleOrder.productCode') },
        { field: 'isConfirm', label: this.$t('view.sale.saleOrder.saleStatus') },
        { field: 'description', label: this.$t('view.sale.saleOrder.description') },
        { field: 'gold', label: 'Gold (gms)' },
        { field: 'diamond', label: 'Diamond (cts)' },
        { field: 'gem', label: 'Stone (cts)' },
        { field: 'priceOrigin', label: this.$t('view.sale.saleOrder.salePriceTHB') },
        { field: 'appraisalPrice', label: this.$t('view.sale.saleOrder.appraisalPriceTHB') },
        { field: 'discountPercent', label: this.$t('view.sale.saleOrder.discountPercent') },
        { field: 'discountPrice', label: this.$t('view.sale.saleOrder.discountPriceTHB') },
        { field: 'currencyRate', label: this.$t('view.sale.saleOrder.convertedRate') },
        { field: 'priceAfterMultiply', label: this.$t('view.sale.saleOrder.convertedPrice') },
        { field: 'qty', label: this.$t('common.field.quantity') },
        { field: 'total', label: this.$t('view.sale.saleOrder.totalPrice') }
      ]
    },

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
    }
  },

  mounted() {
    document.addEventListener('click', this.handleOutsideClick)
  },

  beforeUnmount() {
    document.removeEventListener('click', this.handleOutsideClick)
  },

  methods: {
    isFrozenLeft(field) {
      return this.frozenCols[field] === 'left'
    },

    isFrozenRight(field) {
      return this.frozenCols[field] === 'right'
    },

    toggleFreezeCol(field, side) {
      const current = this.frozenCols[field]
      if (current === side) {
        const updated = { ...this.frozenCols }
        delete updated[field]
        this.frozenCols = updated
      } else {
        this.frozenCols = { ...this.frozenCols, [field]: side }
      }
    },

    handleOutsideClick(e) {
      const wrapper = this.$el.querySelector('.stock-col-settings-wrapper')
      if (wrapper && !wrapper.contains(e.target)) {
        this.isSettingsOpen = false
      }
    },

    openInvoiceDetail(invoiceNumber) {
      this.$router.push({
        path: '/invoice-detail',
        query: { invoiceNumber: invoiceNumber }
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
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

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
  gap: 8px;
}

.card-body {
  padding: 1rem;
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

.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
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

.badge {
  padding: 0.25em 0.5em;
  font-size: 0.75em;
  border-radius: 0.25rem;
  font-weight: 600;

  &.badge-warning {
    background-color: #ffc107;
    color: #212529;
  }

  &.badge-success {
    background-color: #28a745;
    color: white;
  }
}

.text-right {
  text-align: right;
}

.font-weight-bold {
  font-weight: 600;
}

.d-flex {
  display: flex;
}

.align-items-center {
  align-items: center;
}

.mr-2 {
  margin-right: 0.5rem;
}

/* Column settings gear */
.stock-col-settings-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  margin-left: 8px;
}

.stock-col-settings-btn {
  width: 2rem;
  height: 2rem;
  border: 1px solid rgba(255,255,255,0.5);
  border-radius: 4px;
  background: transparent;
  color: #ffffff;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  transition: all 0.2s;

  &:hover {
    background: rgba(255,255,255,0.2);
  }
}

.stock-col-settings-panel {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  min-width: 280px;
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 100;
}

.stock-col-settings-header {
  padding: 8px 12px;
  background: var(--base-font-color);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  border-radius: 6px 6px 0 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.stock-col-settings-list {
  max-height: 350px;
  overflow-y: auto;
}

.stock-col-settings-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13px;
  color: #333;

  &:last-child { border-bottom: none; }
}

.stock-col-settings-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 8px;
}

.stock-col-freeze-btns {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.freeze-btn {
  padding: 2px 6px;
  font-size: 11px;
  border: 1px solid #dee2e6;
  border-radius: 3px;
  background: #f8f9fa;
  color: #666;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  transition: all 0.15s;
  white-space: nowrap;

  &:hover {
    border-color: var(--base-font-color);
    color: var(--base-font-color);
  }

  &.active {
    background: var(--base-font-color);
    border-color: var(--base-font-color);
    color: #fff;
  }
}
</style>
