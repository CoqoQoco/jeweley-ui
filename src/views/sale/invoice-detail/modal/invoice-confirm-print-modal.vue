<template>
  <DrawerGeneric
    :show="isShowModal"
    :title="titleText"
    width="480px"
    :isShowActionPart="true"
    headerVariant="main"
    :sideShow="showHistory && !draftMode"
    sideWidth="280px"
    @close="closeModal"
  >
    <template #title>
      <span class="drawer-print-title">
        <i class="bi bi-printer mr-2"></i>
        {{ titleText }}
      </span>
    </template>

    <template #side>
      <div v-if="!draftMode" class="print-history-panel">
        <div class="print-history-header">
          <i class="bi bi-clock-history mr-2"></i>
          {{ $t('view.sale.invoiceDetail.printHistory') }}
        </div>
        <div class="print-history-count">
          {{ $t('view.sale.invoiceDetail.printHistoryCount', { count: printLogs.length }) }}
        </div>
        <div v-if="printLogs.length === 0" class="print-history-empty">
          <i class="bi bi-printer mr-1"></i>
          {{ $t('view.sale.invoiceDetail.printHistoryEmpty') }}
        </div>
        <div v-else class="print-history-list">
          <div v-for="log in printLogs" :key="log.running" class="print-history-item">
            <div class="print-history-item__copy">#{{ log.copyNo }}</div>
            <div class="print-history-item__type">{{ getPaperTypeLabel(log.paperType) }}</div>
            <div v-if="getPriceModeLabel(log.data)" class="print-history-item__mode">{{ getPriceModeLabel(log.data) }}</div>
            <div class="print-history-item__date">{{ formatLogDate(log.printedAt) }}</div>
            <div class="print-history-item__by">{{ log.printedBy }}</div>
          </div>
        </div>
      </div>
    </template>

    <template #content>
      <div class="invoice-confirm-print-container p-3">

        <!-- Form Container -->
        <div class="filter-container mb-2">
          <div class="title-text-lg mb-2">
            <i class="bi bi-file-text mr-2"></i>{{ $t('view.sale.invoiceDetail.docInfo') }}
          </div>
          <div class="p-3">
            <div v-if="draftMode" class="draft-bill-note mb-3">
              <div class="draft-bill-note__title">
                <i class="bi bi-file-earmark-text mr-1"></i>{{ $t('view.sale.invoiceDetail.draftBillBadge') }}
              </div>
              <div class="draft-bill-note__text">{{ $t('view.sale.invoiceDetail.draftBillNote') }}</div>
            </div>

            <div v-if="!draftMode" class="form-group mb-3">
              <label class="form-label">
                <i class="bi bi-hash mr-1"></i>Invoice Number
              </label>
              <InputTextGeneric
                v-model="printData.invoiceNumber"
                type="text"
                :placeholder="$t('view.sale.invoiceDetail.invoiceNumberPlaceholder')"
              />
              <small class="form-text text-muted">
                {{ $t('view.sale.invoiceDetail.originalValue') }}: {{ originalData.invoiceNumber }}
              </small>
            </div>

            <div v-if="!draftMode" class="form-group mb-3">
              <label class="form-label">
                <i class="bi bi-calendar-event mr-1"></i>Invoice Date
              </label>
              <CalendarGeneric
                v-model="printData.invoiceDate"
                dateFormat="dd/mm/yy"
                :placeholder="$t('view.sale.invoiceDetail.selectDate')"
                :showIcon="true"
                :showButtonBar="true"
                class="w-100"
              />
              <small class="form-text text-muted">
                {{ $t('view.sale.invoiceDetail.originalValue') }}: {{ formatDate(originalData.invoiceDate) }}
              </small>
            </div>

            <div class="form-group mb-3">
              <label class="form-label">
                <i class="bi bi-person-badge mr-1"></i>{{ $t('common.field.seller') }}
              </label>
              <InputTextGeneric
                v-model="printData.sellerName"
                type="text"
                :placeholder="$t('common.field.seller')"
              />
            </div>

            <div v-if="!draftMode" class="form-group mb-3">
              <div class="d-flex justify-content-between align-items-center">
                <label class="form-label mb-0">
                  <i class="bi bi-file-earmark mr-1"></i>{{ $t('view.sale.invoiceDetail.paperSize') }}
                </label>
                <button
                  class="btn btn-sm btn-outline-main"
                  type="button"
                  @click="showHistory = !showHistory"
                >
                  <i class="bi bi-clock-history mr-1"></i>
                  {{ $t('view.sale.invoiceDetail.printHistory') }} ({{ printLogs.length }})
                </button>
              </div>
              <RadioGroupGeneric
                v-model="paperSize"
                :options="paperSizeOptions"
                optionLabel="label"
                optionValue="value"
              />
              <small v-if="paperSize === 'vat-bridge-v2'" class="form-text text-muted">
                {{ $t('view.sale.invoiceDetail.paperTaxV2Hint') }}
              </small>
            </div>

            <div v-if="paperSize === 'a4' && !isMaterial" class="form-group mb-3">
              <CheckboxGeneric
                v-model="printData.showCifLabel"
                :label="$t('view.sale.invoiceDetail.showCifLabel')"
              />
            </div>

            <div v-if="paperSize === 'a4' && !isMaterial" class="form-group mb-3">
              <CheckboxGeneric
                v-model="printData.showSeller"
                :label="$t('view.sale.invoiceDetail.showSeller')"
              />
            </div>

            <div v-if="paperSize === 'a4'" class="form-group mb-3">
              <CheckboxGeneric
                v-model="printData.hideCompanyHeader"
                :label="$t('view.sale.invoiceDetail.hideCompanyHeader')"
              />
            </div>

            <div v-if="paperSize === 'a4'" class="form-group mb-3">
              <CheckboxGeneric
                v-model="printData.showImages"
                :label="$t('view.sale.invoiceDetail.showImages')"
                @update:modelValue="onShowImagesChange"
              />
            </div>

            <div v-if="!isMaterial && invoiceTemplate !== 'summary'" class="form-group mb-3">
              <CheckboxGeneric
                v-model="printData.mergeSilverLines"
                :label="$t('view.sale.invoiceDetail.mergeSilverLines')"
              />
            </div>

            <div v-if="!isMaterial" class="form-group mb-3">
              <CheckboxGeneric
                v-model="printData.showDecimals"
                :label="$t('common.field.showDecimals')"
                @update:modelValue="onShowDecimalsChange"
              />
            </div>

            <div v-if="paperSize === 'a4'" class="form-group mb-3">
              <label class="form-label">
                <i class="bi bi-list-ol mr-1"></i>{{ $t('view.sale.invoiceDetail.itemsPerPage') }}
              </label>
              <InputTextGeneric
                v-model="printData.itemsPerPage"
                type="number"
                min="1"
                max="20"
              />
              <small class="form-text text-muted">
                {{ $t('view.sale.invoiceDetail.itemsPerPageHint') }}
              </small>
            </div>

            <div v-if="paperSize === 'a4'" class="form-group mb-3">
              <label class="form-label">
                <i class="bi bi-layout-text-window mr-1"></i>{{ $t('view.sale.invoiceDetail.template') }}
              </label>
              <DropdownGeneric
                v-model="invoiceTemplate"
                :options="templateOptions"
                optionLabel="label"
                optionValue="value"
              />
            </div>

            <div v-if="paperSize === 'bill' || isTaxPaper" class="form-group mb-3">
              <label class="form-label">
                <i class="bi bi-printer mr-1"></i>{{ $t('view.sale.invoiceDetail.printer') }}
              </label>
              <div class="printer-select-row">
                <AutoCompleteGeneric
                  :modelValue="selectedPrinter"
                  :staticOptions="printerOptions"
                  :useStaticList="true"
                  optionLabel="label"
                  :placeholder="$t('view.sale.invoiceDetail.selectPrinter')"
                  :forceSelection="false"
                  :dropdown="true"
                  class="printer-ac"
                  @update:modelValue="onPrinterChange"
                />
                <ButtonGeneric
                  variant="outline"
                  icon="bi-arrow-clockwise"
                  :label="$t('common.printer.reload')"
                  @click="loadPrinters"
                />
                <ButtonGeneric
                  variant="outline"
                  icon="bi-x-lg"
                  :title="$t('common.printer.clear')"
                  @click="onClearPrinter"
                />
              </div>

              <div v-if="printerStatus === 'unreachable'" class="printer-status-box">
                <div class="printer-status-title">{{ $t('common.printer.statusUnreachableTitle') }}</div>
                <ul class="printer-status-list">
                  <li>{{ $t('common.printer.statusUnreachableStep1') }}</li>
                  <li>
                    {{ $t('common.printer.statusUnreachableStep2Prefix') }}
                    <a :href="printerHealthUrl" target="_blank" rel="noopener">{{ printerHealthUrl }}</a>
                    {{ $t('common.printer.statusUnreachableStep2Suffix') }}
                  </li>
                  <li>{{ $t('common.printer.statusUnreachableStep3') }}</li>
                </ul>
              </div>
              <small v-else-if="printerStatus === 'blocked'" class="form-text text-muted printer-status-msg">
                {{ $t('common.printer.statusBlocked') }}
              </small>
              <small v-else-if="printerStatus === 'empty'" class="form-text text-muted printer-status-msg">
                {{ $t('common.printer.statusEmpty') }}
              </small>

              <small v-if="printerOptions.length === 0" class="form-text text-muted printer-status-msg">
                {{ $t('common.printer.manualHint') }}
              </small>

              <small v-if="isBarcodePrinterSelected" class="form-text printer-status-msg printer-barcode-warning">
                <i class="bi bi-exclamation-triangle mr-1"></i>{{ $t('view.sale.invoiceDetail.printerIsBarcode') }}
              </small>

              <small v-if="printerSavedNotFoundMessage" class="form-text text-warning printer-status-msg">
                {{ printerSavedNotFoundMessage }}
              </small>
            </div>

            <div v-if="paperSize === 'bill'" class="form-group mb-3">
              <div class="row">
                <div class="col-6">
                  <label class="form-label">
                    <i class="bi bi-arrows-move mr-1"></i>Offset X (mm)
                  </label>
                  <InputTextGeneric
                    v-model="billOffset.x"
                    type="number"
                    step="0.5"
                  />
                </div>
                <div class="col-6">
                  <label class="form-label">
                    <i class="bi bi-arrows-move mr-1"></i>Offset Y (mm)
                  </label>
                  <InputTextGeneric
                    v-model="billOffset.y"
                    type="number"
                    step="0.5"
                  />
                </div>
              </div>
              <small class="form-text text-muted">
                {{ $t('view.sale.invoiceDetail.offsetHint') }}
              </small>
            </div>

            <div v-if="paperSize === 'bill'" class="form-group mb-3">
              <label class="form-label">
                <i class="bi bi-layout-three-columns mr-1"></i>{{ $t('view.sale.invoiceDetail.billColumnToggles') }}
              </label>

              <!-- Header group -->
              <div class="bill-element-group mb-2">
                <div class="bill-element-group-title">{{ $t('view.sale.invoiceDetail.billGroupHeader') }}</div>
                <div class="bill-column-toggles">
                  <CheckboxGeneric
                    v-if="!draftMode"
                    v-model="billElementFlags.showInvoiceNo"
                    :label="$t('view.sale.invoiceDetail.billElemInvoiceNo')"
                    @update:modelValue="onBillFlagChange"
                  />
                  <CheckboxGeneric
                    v-model="billElementFlags.showDate"
                    :label="$t('view.sale.invoiceDetail.billElemDate')"
                    @update:modelValue="onBillFlagChange"
                  />
                  <CheckboxGeneric
                    v-model="billElementFlags.showPageNumber"
                    :label="$t('view.sale.invoiceDetail.billElemPageNumber')"
                    @update:modelValue="onBillFlagChange"
                  />
                  <CheckboxGeneric
                    v-model="billElementFlags.showCustomerName"
                    :label="$t('view.sale.invoiceDetail.billElemCustomerName')"
                    @update:modelValue="onBillFlagChange"
                  />
                  <CheckboxGeneric
                    v-model="billElementFlags.showCustomerTaxId"
                    :label="$t('view.sale.invoiceDetail.billElemCustomerTaxId')"
                    @update:modelValue="onBillFlagChange"
                  />
                  <CheckboxGeneric
                    v-model="billElementFlags.showCustomerAddress"
                    :label="$t('view.sale.invoiceDetail.billElemCustomerAddress')"
                    @update:modelValue="onBillFlagChange"
                  />
                </div>
              </div>

              <!-- Table group -->
              <div class="bill-element-group mb-2">
                <div class="bill-element-group-title">{{ $t('view.sale.invoiceDetail.billGroupTable') }}</div>
                <div class="bill-column-toggles">
                  <CheckboxGeneric
                    v-model="billElementFlags.showItemNo"
                    :label="$t('view.sale.invoiceDetail.billElemItemNo')"
                    @update:modelValue="onBillFlagChange"
                  />
                  <CheckboxGeneric
                    v-model="billElementFlags.showDescription"
                    :label="$t('view.sale.invoiceDetail.billElemDescription')"
                    @update:modelValue="onBillFlagChange"
                  />
                  <CheckboxGeneric
                    v-model="billElementFlags.showStockNumber"
                    :label="$t('view.sale.invoiceDetail.billColumnStockNumber')"
                    @update:modelValue="onBillFlagChange"
                  />
                  <CheckboxGeneric
                    v-model="billElementFlags.showProductNumber"
                    :label="$t('view.sale.invoiceDetail.billColumnProductNumber')"
                    @update:modelValue="onBillFlagChange"
                  />
                  <RadioGroupGeneric
                    v-model="billElementFlags.productCodeMode"
                    :disabled="!billElementFlags.showProductNumber"
                    :options="productCodeModeOptions"
                    optionLabel="label"
                    optionValue="value"
                    inline
                    @update:modelValue="onBillFlagChange"
                  />
                  <CheckboxGeneric
                    v-model="billElementFlags.showPriceBeforeDiscount"
                    :label="$t('view.sale.invoiceDetail.billElemPriceBeforeDiscount')"
                    @update:modelValue="onBillFlagChange"
                  />
                  <CheckboxGeneric
                    v-model="billElementFlags.showPriceIncludingVat"
                    :label="$t('view.sale.invoiceDetail.billElemPriceIncludingVat')"
                    @update:modelValue="onBillFlagChange"
                  />
                  <CheckboxGeneric
                    v-model="billElementFlags.showGoldWeight"
                    :label="$t('view.sale.invoiceDetail.billElemGoldWeight')"
                    @update:modelValue="onBillFlagChange"
                  />
                  <CheckboxGeneric
                    v-model="billElementFlags.showStoneWeight"
                    :label="$t('view.sale.invoiceDetail.billElemStoneWeight')"
                    @update:modelValue="onBillFlagChange"
                  />
                  <CheckboxGeneric
                    v-model="billElementFlags.showDiamondWeight"
                    :label="$t('view.sale.invoiceDetail.billElemDiamondWeight')"
                    @update:modelValue="onBillFlagChange"
                  />
                  <CheckboxGeneric
                    v-model="billElementFlags.showDiamondGrade"
                    :label="$t('view.sale.invoiceDetail.billElemDiamondGrade')"
                    @update:modelValue="onBillFlagChange"
                  />
                  <CheckboxGeneric
                    v-model="billElementFlags.showQty"
                    :label="$t('view.sale.invoiceDetail.billElemQty')"
                    @update:modelValue="onBillFlagChange"
                  />
                  <CheckboxGeneric
                    v-model="billElementFlags.showUnitPrice"
                    :label="$t('view.sale.invoiceDetail.billElemUnitPrice')"
                    @update:modelValue="onBillFlagChange"
                  />
                  <CheckboxGeneric
                    v-model="billElementFlags.showAmount"
                    :label="$t('view.sale.invoiceDetail.billElemAmount')"
                    @update:modelValue="onBillFlagChange"
                  />
                </div>
              </div>

              <!-- Footer group -->
              <div class="bill-element-group mb-2">
                <div class="bill-element-group-title">{{ $t('view.sale.invoiceDetail.billGroupFooter') }}</div>
                <div class="bill-column-toggles">
                  <CheckboxGeneric
                    v-model="billElementFlags.showSubtotal"
                    :label="$t('view.sale.invoiceDetail.billElemSubtotal')"
                    @update:modelValue="onBillFlagChange"
                  />
                  <CheckboxGeneric
                    v-model="billElementFlags.showTotal"
                    :label="$t('view.sale.invoiceDetail.billElemTotal')"
                    @update:modelValue="onBillFlagChange"
                  />
                  <CheckboxGeneric
                    v-model="billElementFlags.showAmountText"
                    :label="$t('view.sale.invoiceDetail.billElemAmountText')"
                    @update:modelValue="onBillFlagChange"
                  />
                  <CheckboxGeneric
                    v-model="billElementFlags.showRemark"
                    :label="$t('view.sale.invoiceDetail.billColumnRemark')"
                    @update:modelValue="onBillFlagChange"
                  />
                  <CheckboxGeneric
                    v-model="billElementFlags.showSoNumber"
                    :label="$t('view.sale.invoiceDetail.billElemSoNumber')"
                    @update:modelValue="onBillFlagChange"
                  />
                  <CheckboxGeneric
                    v-model="billElementFlags.showTotalQty"
                    :label="$t('view.sale.invoiceDetail.billElemTotalQty')"
                    @update:modelValue="onBillFlagChange"
                  />
                </div>
                <div class="mt-2">
                  <label class="form-label">{{ $t('view.sale.invoiceDetail.billCustomRemarkLabel') }}</label>
                  <InputTextGeneric v-model="customRemark" :maxlength="60" />
                  <small class="form-text text-muted">{{ (customRemark || '').length }}/60</small>
                </div>
              </div>

              <!-- VAT / Price mode -->
              <div class="bill-element-group">
                <div class="bill-element-group-title">{{ $t('view.sale.invoiceDetail.billGroupVatMode') }}</div>
                <RadioGroupGeneric
                  v-model="billElementFlags.unitPriceMode"
                  :options="unitPriceModeOptions"
                  optionLabel="label"
                  optionValue="value"
                  @update:modelValue="onBillFlagChange"
                />
                <div v-if="billElementFlags.unitPriceMode === 'addVat' || billElementFlags.unitPriceMode === 'subVat'" class="mt-2">
                  <label class="form-label">
                    <i class="bi bi-percent mr-1"></i>{{ $t('view.sale.invoiceDetail.unitVatPercentLabel') }}
                  </label>
                  <InputTextGeneric
                    v-model="billElementFlags.unitVatPercent"
                    type="number"
                    step="0.01"
                    min="0"
                    @blur="onBillFlagChange"
                  />
                </div>
              </div>

              <!-- Footer VAT % -->
              <div class="bill-element-group mt-2">
                <div class="bill-element-group-title">{{ $t('view.sale.invoiceDetail.billGroupFooterVat') }}</div>
                <CheckboxGeneric
                  v-model="billElementFlags.showVat"
                  :label="$t('view.sale.invoiceDetail.billElemVat')"
                  @update:modelValue="onShowVatToggle"
                />
                <div v-if="billElementFlags.showVat" class="mt-2">
                  <label class="form-label">
                    <i class="bi bi-percent mr-1"></i>{{ $t('view.sale.invoiceDetail.summaryVatPercentLabel') }}
                  </label>
                  <InputTextGeneric
                    v-model="billElementFlags.summaryVatPercent"
                    type="number"
                    step="0.01"
                    min="0"
                    @blur="onBillFlagChange"
                  />
                </div>
              </div>

              <div v-if="billTotalMismatch" class="bill-mismatch-warning mt-2">
                <div class="bill-mismatch-text">
                  <i class="bi bi-exclamation-triangle mr-1"></i>
                  {{ $t('view.sale.invoiceDetail.billTotalMismatch', { bill: formatMoney(billTotals.grandTotal), invoice: formatMoney(invoiceTotalExSpecial) }) }}
                </div>
                <div v-if="hasMismatchActions" class="bill-mismatch-actions mt-2">
                  <ButtonGeneric v-if="showUseSubVatBtn" variant="outline" class="mr-2" :label="$t('view.sale.invoiceDetail.billUseSubVat')" @click="onUseSubVat" />
                  <ButtonGeneric v-if="showUseTagBtn" variant="outline" class="mr-2" :label="$t('view.sale.invoiceDetail.billUseTag')" @click="onUseTag" />
                  <ButtonGeneric v-if="showHideVatBtn" variant="outline" class="mr-2" :label="$t('view.sale.invoiceDetail.billHideFooterVat')" @click="onHideFooterVat" />
                  <ButtonGeneric v-if="showShowVatBtn" variant="outline" class="mr-2" :label="$t('view.sale.invoiceDetail.billShowFooterVat')" @click="onShowFooterVat" />
                </div>
              </div>

              <div v-if="paperSize === 'bill' && hasSpecialAmounts" class="bill-special-info mt-2">
                <i class="bi bi-info-circle mr-1"></i>{{ $t('view.sale.invoiceDetail.billSpecialNotIncluded') }}
              </div>
            </div>

            <div v-if="paperSize === 'bill' && billGemTypes.length > 0" class="form-group mb-3">
              <div class="bill-element-group">
                <div class="bill-element-group-title">{{ $t('view.sale.invoiceDetail.billGemColumnsTitle') }}</div>
                <small class="form-text text-muted mb-2">{{ $t('view.sale.invoiceDetail.billGemColumnsHint') }}</small>
                <div v-for="gem in billGemTypes" :key="gem.key" class="bill-gem-row">
                  <div class="bill-gem-info">
                    <span class="bill-gem-label">{{ gem.label || $t('view.sale.invoiceDetail.billGemUnnamed') }}</span>
                    <small class="text-muted">
                      {{ $t('view.sale.invoiceDetail.billGemPieces', { count: gem.pieceCount }) }}
                      · {{ $t('view.sale.invoiceDetail.billGemWeight', { weight: gem.totalWeight.toFixed(2) }) }}
                    </small>
                  </div>
                  <ToggleGroupGeneric
                    :modelValue="gemColumnMap[gem.key]"
                    :options="gemColumnOptions"
                    size="sm"
                    :ariaLabel="gem.label || $t('view.sale.invoiceDetail.billGemUnnamed')"
                    @update:modelValue="onGemColumnChange(gem.key, $event)"
                  />
                </div>
              </div>
            </div>

            <div v-if="isTaxPaper" class="form-group mb-3">
              <FormFieldGeneric
                :label="$t('view.sale.invoiceDetail.taxVatPercentLabel')"
                inputId="tax-vat-percent"
                :error="taxVatError"
              >
                <InputTextGeneric
                  id="tax-vat-percent"
                  v-model="taxVatPercent"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  :disabled="isTaxVatLocked"
                />
              </FormFieldGeneric>
              <small v-if="isTaxVatLocked" class="form-text text-muted">
                {{ $t('view.sale.invoiceDetail.taxVatPercentLockedHint') }}
              </small>
              <small v-else class="form-text text-muted">
                {{ $t('view.sale.invoiceDetail.taxVatPercentHint') }}
              </small>
            </div>

            <div v-if="isTaxPaper" class="form-group mb-3">
              <div class="row">
                <div class="col-6">
                  <label class="form-label">
                    <i class="bi bi-arrows-move mr-1"></i>Offset X (mm)
                  </label>
                  <InputTextGeneric
                    v-model="continuousOffset.x"
                    type="number"
                    step="0.5"
                  />
                </div>
                <div class="col-6">
                  <label class="form-label">
                    <i class="bi bi-arrows-move mr-1"></i>Offset Y (mm)
                  </label>
                  <InputTextGeneric
                    v-model="continuousOffset.y"
                    type="number"
                    step="0.5"
                  />
                </div>
              </div>
              <small class="form-text text-muted">
                {{ $t('view.sale.invoiceDetail.offsetHint') }}
              </small>
            </div>
          </div>
        </div>

        <!-- Info Container -->
        <div class="filter-container-search mb-2">
          <div class="p-2">
            <div class="d-flex align-items-start">
              <i class="bi bi-info-circle text-info mr-2 info-icon"></i>
              <div>
                <p class="mb-1 info-text">
                  {{ $t('view.sale.deliveryNote.printOnlyNote') }}
                </p>
                <p class="mb-0 info-text">
                  {{ $t('view.sale.deliveryNote.originalNotChanged') }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #action>
      <button class="btn btn-main mr-2" type="button" :disabled="!!taxVatError" @click="onPreviewPDF">
        <i class="bi bi-eye mr-1"></i>
        {{ $t('view.sale.invoiceDetail.previewBtn') }}
      </button>

      <button class="btn btn-green mr-2" type="button" :disabled="!!taxVatError" @click="onConfirmPrint">
        <i class="bi bi-printer mr-1"></i>
        {{ $t('view.sale.invoiceDetail.printBtn') }}
      </button>

      <button class="btn btn-outline-main" type="button" @click="closeModal">
        <i class="bi bi-x-circle mr-1"></i>
        {{ $t('common.btn.cancel') }}
      </button>
    </template>
  </DrawerGeneric>
</template>

<script>
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import { warning } from '@/services/alert/sweetAlerts.js'
import { storage } from '@/services/storage.js'
import dayjs from 'dayjs'
import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import AutoCompleteGeneric from '@/components/prime-vue/AutoCompleteGeneric.vue'
import CheckboxGeneric from '@/components/prime-vue/CheckboxGeneric.vue'
import RadioGroupGeneric from '@/components/prime-vue/RadioGroupGeneric.vue'
import DrawerGeneric from '@/components/generic/DrawerGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import ToggleGroupGeneric from '@/components/generic/ToggleGroupGeneric.vue'
import { fetchPrinterList, PRINT_BRIDGE_BASE_URL } from '@/services/api/printer-config-service.js'
import { listBillGemTypes, defaultColumnFor } from '@/services/helper/print/bill-gem-columns.js'
import { formatDocumentMoney } from '@/services/utils/money.js'
import { computeBillTotals } from '@/services/helper/print/bill-print-model-builder.js'
import { getBarcodePrinterName } from '@/services/api/barcode-printer-config.js'
import { pickDocumentPrinter, isBarcodePrinter, confirmIfBarcodePrinter } from '@/services/helper/print/document-printer-guard.js'
import { getBillLayout } from '@/services/helper/print/bill-layout-store.js'
import { getVatLayout } from '@/services/helper/print/vat-layout-store.js'
import { TAX_PAPER, isTaxContinuousPaper, getTaxPaperConfig, isTaxVatPercentLocked, defaultTaxVatPercent } from '@/services/helper/print/tax-paper.js'
import { useInvoiceApiStore } from '@/stores/modules/api/sale/invoice-store.js'
import { isMaterialInvoice } from '@/constants/invoice-types.js'
import { DRAFT_INVOICE_NUMBER } from '@/services/helper/print/so-draft-bill.js'

const BILL_PRINTER_STORAGE_KEY = 'print-bridge-printer-bill'

function vatOrDefault(val) {
  if (val === undefined || val === null || val === '') return 7
  const num = Number(val)
  return Number.isFinite(num) ? num : 7
}

export default {
  name: 'InvoiceConfirmPrintModal',

  components: {
    DrawerGeneric,
    FormFieldGeneric,
    CalendarGeneric,
    DropdownGeneric,
    AutoCompleteGeneric,
    CheckboxGeneric,
    RadioGroupGeneric,
    InputTextGeneric,
    ButtonGeneric,
    ToggleGroupGeneric
  },

  props: {
    isShowModal: {
      type: Boolean,
      default: false
    },
    invoiceData: {
      type: Object,
      default: () => ({})
    },
    isPreviewOpen: {
      type: Boolean,
      default: false
    },
    sellerName: {
      type: String,
      default: ''
    },
    invoiceItems: {
      type: Array,
      default: () => []
    },
    invoiceTotalExSpecial: {
      type: Number,
      default: null
    },
    draftMode: {
      type: Boolean,
      default: false
    }
  },

  emits: ['close-modal', 'confirm-print', 'preview-print'],

  data() {
    return {
      invoiceStore: useInvoiceApiStore(),
      printLogs: [],
      gemColumnMap: {},
      gemChoiceTouched: false,
      customRemark: '',
      showHistory: false,
      originalData: {
        invoiceNumber: '',
        invoiceDate: ''
      },
      printData: {
        invoiceNumber: '',
        invoiceDate: '',
        sellerName: '',
        showCifLabel: true,
        showSeller: true,
        hideCompanyHeader: false,
        showImages: true,
        showDecimals: true,
        mergeSilverLines: true,
        itemsPerPage: 10
      },
      invoiceTemplate: 'standard',
      paperSize: this.draftMode ? 'bill' : 'vat-bridge',
      continuousOffset: { x: 0, y: 0 },
      billOffset: { x: 0, y: 0 },
      printerOptions: [],
      printerStatus: null,
      selectedPrinter: null,
      defaultBillPrinter: null,
      defaultTaxPrinters: {},
      taxVatPercent: 7,
      billElementFlags: {
        // Header
        showInvoiceNo: true,
        showDate: true,
        showPageNumber: true,
        showCustomerName: true,
        showCustomerTaxId: true,
        showCustomerAddress: true,
        // Table
        showItemNo: true,
        showDescription: true,
        showStockNumber: true,
        showProductNumber: true,
        showPriceBeforeDiscount: true,
        showPriceIncludingVat: true,
        showGoldWeight: true,
        showStoneWeight: true,
        showDiamondWeight: true,
        showDiamondGrade: true,
        showQty: true,
        showUnitPrice: true,
        showAmount: true,
        showRemark: true,
        showSoNumber: true,
        // Footer
        showSubtotal: true,
        showVat: true,
        showTotal: true,
        showAmountText: true,
        showTotalQty: true,
        productCodeMode: 'product',
        // Unit price mode
        unitPriceMode: 'tag',
        unitVatPercent: 7,
        summaryVatPercent: 7
      },
      billVatOverridden: false,
      billVatSavedShowVat: true,
      billVatTouched: false,
      autoPreviewTimer: null
    }
  },

  computed: {
    titleText() {
      return this.draftMode
        ? this.$t('view.sale.invoiceDetail.draftBillTitle')
        : this.$t('view.sale.invoiceDetail.confirmPrintTitle')
    },

    // MATERIAL: ไม่มี A4 standard/bill กระดาษต่อเนื่อง/summary เท่านั้น (D5 ในแผน)
    isMaterial() {
      return isMaterialInvoice(this.invoiceData)
    },

    templateOptions() {
      const options = [
        { value: 'standard', label: this.$t('view.sale.invoiceDetail.templateStandard') },
        { value: 'summary', label: this.$t('view.sale.invoiceDetail.templateSummary') }
      ]
      return this.isMaterial ? options.filter((o) => o.value === 'summary') : options
    },

    paperSizeOptions() {
      const options = [
        { value: 'a4', label: this.$t('view.sale.invoiceDetail.paperA4') },
        { value: 'bill', label: this.$t('view.sale.invoiceDetail.paperBill') },
        { value: 'vat-bridge', label: this.$t('view.sale.invoiceDetail.paperTax') },
        { value: 'vat-bridge-v2', label: this.$t('view.sale.invoiceDetail.paperTaxV2') }
      ]
      return this.isMaterial ? options.filter((o) => o.value !== 'bill') : options
    },

    unitPriceModeOptions() {
      return [
        { value: 'tag', label: this.$t('view.sale.invoiceDetail.priceModeTag') },
        { value: 'addVat', label: this.$t('view.sale.invoiceDetail.priceModeAddVat') },
        { value: 'subVat', label: this.$t('view.sale.invoiceDetail.priceModeSubVat') }
      ]
    },

    productCodeModeOptions() {
      return [
        { value: 'product', label: this.$t('view.sale.invoiceDetail.billProductCodeModeProduct') },
        { value: 'mold', label: this.$t('view.sale.invoiceDetail.billProductCodeModeMold') }
      ]
    },

    printerHealthUrl() {
      return `${PRINT_BRIDGE_BASE_URL}/health`
    },

    isBarcodePrinterSelected() {
      return isBarcodePrinter(this.selectedPrinter, getBarcodePrinterName())
    },

    printerSavedNotFoundMessage() {
      if (this.printerStatus !== 'ok' || !this.selectedPrinter) return ''
      const found = this.printerOptions.some((p) => p.name === this.selectedPrinter)
      return found ? '' : this.$t('common.printer.savedNotFound', { name: this.selectedPrinter })
    },

    billGemTypes() {
      return listBillGemTypes(this.invoiceItems)
    },

    isTaxPaper() {
      return isTaxContinuousPaper(this.paperSize)
    },

    taxVatError() {
      if (!this.isTaxPaper || this.isTaxVatLocked) return ''
      const raw = this.taxVatPercent
      const n = Number(raw)
      if (raw === '' || raw === null || raw === undefined || !Number.isFinite(n) || n < 0 || n > 100) {
        return this.$t('view.sale.invoiceDetail.taxVatPercentInvalid')
      }
      return ''
    },

    isTaxVatLocked() {
      return isTaxVatPercentLocked(this.invoiceData)
    },

    invoiceVatPercent() {
      return Number(this.invoiceData?.vatPercent) || 0
    },

    hasSpecialAmounts() {
      const d = this.invoiceData || {}
      return [d.specialDiscount, d.specialAddition, d.freightAndInsurance].some((v) => (Number(v) || 0) !== 0)
    },

    billTotals() {
      const items = (this.invoiceItems || []).map((i) => ({
        qty: Number(i.qty) || 0,
        appraisalPrice: Number(i.appraisalPrice) || 0,
        discountPercent: Number(i.discountPercent) || 0
      }))
      return computeBillTotals({ items, currencyRate: this.invoiceData?.currencyRate }, this.billElementFlags)
    },

    showUseSubVatBtn() {
      return !!this.billElementFlags.showVat && this.billElementFlags.unitPriceMode !== 'subVat'
    },

    showHideVatBtn() {
      return !!this.billElementFlags.showVat
    },

    showShowVatBtn() {
      return !this.billElementFlags.showVat && this.invoiceVatPercent > 0
    },

    showUseTagBtn() {
      return this.billElementFlags.unitPriceMode !== 'tag' && (this.invoiceVatPercent > 0 || !this.billElementFlags.showVat)
    },

    hasMismatchActions() {
      return this.showUseSubVatBtn || this.showHideVatBtn || this.showShowVatBtn || this.showUseTagBtn
    },

    billTotalMismatch() {
      if (this.paperSize !== 'bill' || this.invoiceTotalExSpecial === null) return false
      if (!this.invoiceItems || this.invoiceItems.length === 0) return false
      return Math.abs(this.billTotals.grandTotal - this.invoiceTotalExSpecial) > 1
    },

    gemColumnOptions() {
      return [
        { value: 'stone', label: this.$t('view.sale.invoiceDetail.billGemColStone') },
        { value: 'diamond', label: this.$t('view.sale.invoiceDetail.billGemColDiamond') },
        { value: 'none', label: this.$t('view.sale.invoiceDetail.billGemColNone') }
      ]
    },

    previewWatchSnapshot() {
      return {
        paperSize: this.paperSize,
        taxVatPercent: this.taxVatPercent,
        offsetX: this.continuousOffset.x,
        offsetY: this.continuousOffset.y,
        billOffsetX: this.billOffset.x,
        billOffsetY: this.billOffset.y,
        billFlags: { ...this.billElementFlags },
        gemColumnMap: { ...this.gemColumnMap },
        customRemark: this.customRemark,
        showDecimals: this.printData.showDecimals,
        showImages: this.printData.showImages,
        mergeSilverLines: this.printData.mergeSilverLines,
        selectedPrinter: this.selectedPrinter,
        invoiceNumber: this.printData.invoiceNumber,
        invoiceDate: this.printData.invoiceDate,
        sellerName: this.printData.sellerName
      }
    }
  },

  watch: {
    isShowModal: {
      handler(newVal) {
        if (newVal) {
          this.initializePrintData()
          this.printLogs = []
          this.gemChoiceTouched = false
          this.gemColumnMap = {}
          this.prefillGemColumnMap()
          this.fetchPrintLogs()
          this.billVatTouched = false
          this.taxVatPercent = defaultTaxVatPercent(this.invoiceData)
          this.applyBillVatDefault()
        }
      },
      immediate: true
    },
    previewWatchSnapshot() {
      this.scheduleAutoPreview()
    },
    billGemTypes() {
      this.prefillGemColumnMap(true)
    },
    paperSize(newVal) {
      if (newVal === 'bill') {
        this.selectedPrinter = this.defaultBillPrinter
        this.billVatTouched = false
      } else if (isTaxContinuousPaper(newVal)) {
        this.selectedPrinter = this.defaultTaxPrinters[newVal] ?? null
        this.loadContinuousOffset(newVal)
      } else {
        this.selectedPrinter = null
      }
      this.applyBillVatDefault()
    }
  },

  async mounted() {
    this.loadContinuousOffset(this.paperSize)

    const savedBill = storage.getItem('invoice-bill-offset')
    if (savedBill) {
      try {
        const parsed = JSON.parse(savedBill)
        if (parsed && typeof parsed === 'object') {
          this.billOffset = {
            x: Number(parsed.x) || 0,
            y: Number(parsed.y) || 0
          }
        }
      } catch (e) {
        this.billOffset = { x: 0, y: 0 }
      }
    }

    const savedColumnFlags = storage.getItem('bill-print-column-flags')
    if (savedColumnFlags) {
      try {
        const parsed = JSON.parse(savedColumnFlags)
        if (parsed && typeof parsed === 'object') {
          const boolFlag = (key) => parsed[key] !== undefined ? Boolean(parsed[key]) : true
          this.billElementFlags = {
            showInvoiceNo: boolFlag('showInvoiceNo'),
            showDate: boolFlag('showDate'),
            showPageNumber: boolFlag('showPageNumber'),
            showCustomerName: boolFlag('showCustomerName'),
            showCustomerTaxId: boolFlag('showCustomerTaxId'),
            showCustomerAddress: boolFlag('showCustomerAddress'),
            showItemNo: boolFlag('showItemNo'),
            showDescription: boolFlag('showDescription'),
            showStockNumber: boolFlag('showStockNumber'),
            showProductNumber: boolFlag('showProductNumber'),
            showPriceBeforeDiscount: boolFlag('showPriceBeforeDiscount'),
            showPriceIncludingVat: boolFlag('showPriceIncludingVat'),
            showGoldWeight: boolFlag('showGoldWeight'),
            showStoneWeight: boolFlag('showStoneWeight'),
            showDiamondWeight: boolFlag('showDiamondWeight'),
            showDiamondGrade: boolFlag('showDiamondGrade'),
            showQty: boolFlag('showQty'),
            showUnitPrice: boolFlag('showUnitPrice'),
            showAmount: boolFlag('showAmount'),
            showRemark: boolFlag('showRemark'),
            showSoNumber: boolFlag('showSoNumber'),
            showSubtotal: boolFlag('showSubtotal'),
            showVat: boolFlag('showVat'),
            showTotal: boolFlag('showTotal'),
            showAmountText: boolFlag('showAmountText'),
            showTotalQty: boolFlag('showTotalQty'),
            productCodeMode: parsed.productCodeMode === 'mold' ? 'mold' : 'product',
            unitPriceMode: parsed.unitPriceMode || 'tag',
            unitVatPercent: vatOrDefault(parsed.unitVatPercent),
            summaryVatPercent: vatOrDefault(parsed.summaryVatPercent)
          }
        }
      } catch (e) {
        // keep defaults
      }
    }

    const savedShowHistory = storage.getItem('invoice-print-show-history')
    if (savedShowHistory !== null) {
      this.showHistory = savedShowHistory === 'true'
    }

    await this.loadPrinters()

    const taxPaperSizes = Object.keys(TAX_PAPER)
    const [billLayout, ...taxLayouts] = await Promise.all([
      getBillLayout(),
      ...taxPaperSizes.map((size) => getVatLayout(TAX_PAPER[size].layoutKey))
    ])
    const barcodePrinter = getBarcodePrinterName()
    this.defaultBillPrinter = pickDocumentPrinter([storage.getItem(BILL_PRINTER_STORAGE_KEY), billLayout?.printerName], barcodePrinter)
    const taxPrinters = {}
    taxPaperSizes.forEach((size, i) => {
      taxPrinters[size] = pickDocumentPrinter([storage.getItem(TAX_PAPER[size].printerStorageKey), taxLayouts[i]?.printerName], barcodePrinter)
    })
    this.defaultTaxPrinters = taxPrinters

    if (this.paperSize === 'bill') {
      this.selectedPrinter = this.defaultBillPrinter
    } else if (this.isTaxPaper) {
      this.selectedPrinter = this.defaultTaxPrinters[this.paperSize] ?? null
    }
  },

  beforeUnmount() {
    if (this.autoPreviewTimer) {
      clearTimeout(this.autoPreviewTimer)
    }
  },

  methods: {
    async loadPrinters() {
      const result = await fetchPrinterList()
      this.printerStatus = result.status
      this.printerOptions = result.printers
    },

    loadContinuousOffset(paperSize) {
      const taxPaper = getTaxPaperConfig(paperSize)
      if (!taxPaper) return
      this.continuousOffset = { x: 0, y: 0 }
      const saved = storage.getItem(taxPaper.offsetStorageKey)
      if (!saved) return
      try {
        const parsed = JSON.parse(saved)
        if (parsed && typeof parsed === 'object') {
          this.continuousOffset = { x: Number(parsed.x) || 0, y: Number(parsed.y) || 0 }
        }
      } catch (e) {
        this.continuousOffset = { x: 0, y: 0 }
      }
    },

    onPrinterChange(value) {
      this.selectedPrinter = typeof value === 'object' && value !== null ? value.name : value
    },

    onClearPrinter() {
      this.selectedPrinter = ''
    },

    scheduleAutoPreview() {
      if (this.autoPreviewTimer) {
        clearTimeout(this.autoPreviewTimer)
      }
      if (!this.isPreviewOpen) return

      this.autoPreviewTimer = setTimeout(() => {
        if (!this.draftMode && (!this.printData.invoiceNumber || !this.printData.invoiceNumber.trim())) return
        if (!this.printData.invoiceDate) return
        this.$emit('preview-print', this.buildPrintData())
      }, 250)
    },

    async fetchPrintLogs() {
      this.printLogs = []
      if (this.draftMode) {
        this.customRemark = ''
        return
      }
      if (!this.invoiceData || !this.invoiceData.invoiceNumber) return
      const res = await this.invoiceStore.fetchPrintLogList({ invoiceNumber: this.invoiceData.invoiceNumber })
      if (res && res.data) {
        this.printLogs = res.data
      } else {
        this.printLogs = []
      }
      this.prefillCustomRemark()
      this.prefillGemColumnMap()
    },

    onGemColumnChange(key, value) {
      this.gemChoiceTouched = true
      this.gemColumnMap = { ...this.gemColumnMap, [key]: value }
    },

    prefillGemColumnMap(onlyNew = false) {
      const keepCurrent = onlyNew || this.gemChoiceTouched
      const saved = [...this.printLogs]
        .filter((log) => log.paperType === 'bill')
        .sort((a, b) => String(b.printedAt || '').localeCompare(String(a.printedAt || '')))
        .map((log) => {
          try {
            return JSON.parse(log.data || '{}').gemColumnMap
          } catch {
            return null
          }
        })
        .find((map) => map && typeof map === 'object')
      const next = {}
      this.billGemTypes.forEach((gem) => {
        if (keepCurrent && this.gemColumnMap[gem.key]) {
          next[gem.key] = this.gemColumnMap[gem.key]
          return
        }
        const value = saved?.[gem.key]
        next[gem.key] = ['stone', 'diamond', 'none'].includes(value) ? value : defaultColumnFor(gem)
      })
      this.gemColumnMap = next
    },

    prefillCustomRemark() {
      this.customRemark = ''
      const latest = [...this.printLogs]
        .filter((log) => log.paperType === 'bill')
        .sort((a, b) => String(b.printedAt || '').localeCompare(String(a.printedAt || '')))
        .map((log) => {
          try {
            return JSON.parse(log.data || '{}').customRemark
          } catch {
            return ''
          }
        })
        .find(Boolean)
      if (latest) this.customRemark = String(latest).slice(0, 60)
    },

    getPaperTypeLabel(paperType) {
      const map = {
        'a4': this.$t('view.sale.invoiceDetail.paperTypeA4'),
        'a4-summary': this.$t('view.sale.invoiceDetail.paperTypeA4Summary'),
        'bill': this.$t('view.sale.invoiceDetail.paperTypeBill'),
        'vat': this.$t('view.sale.invoiceDetail.paperTypeVat'),
        'vat-v2': this.$t('view.sale.invoiceDetail.paperTypeVatV2'),
        'guarantee-card': this.$t('view.sale.invoiceDetail.paperTypeGuarantee')
      }
      return map[paperType] || paperType
    },

    getPriceModeLabel(dataJson) {
      if (!dataJson) return ''
      try {
        const parsed = JSON.parse(dataJson)
        const mode = parsed.unitPriceMode || parsed.priceMode
        if (!mode) return ''
        if (mode === 'addVat') return this.$t('view.sale.invoiceDetail.priceModeAddVat')
        if (mode === 'subVat') return this.$t('view.sale.invoiceDetail.priceModeSubVat')
        return this.$t('view.sale.invoiceDetail.priceModeTag')
      } catch {
        return ''
      }
    },

    formatLogDate(date) {
      if (!date) return '-'
      return dayjs(date).format('DD/MM/YYYY HH:mm')
    },

    initializePrintData() {
      this.originalData = {
        invoiceNumber: this.invoiceData.invoiceNumber || '',
        invoiceDate: this.invoiceData.invoiceDate || ''
      }

      const savedShowDecimals = storage.getItem('invoice-print-show-decimals-v2')
      const showDecimals = savedShowDecimals !== null
        ? savedShowDecimals === 'true'
        : true

      const showImages = storage.getItem('invoice-print-show-images') !== 'false'

      this.printData = {
        invoiceNumber: this.draftMode ? DRAFT_INVOICE_NUMBER : (this.invoiceData.invoiceNumber || ''),
        invoiceDate: new Date(),
        sellerName: this.sellerName || '',
        showCifLabel: true,
        showSeller: true,
        hideCompanyHeader: false,
        showImages,
        showDecimals: this.isMaterial ? true : showDecimals,
        mergeSilverLines: true,
        itemsPerPage: 10
      }

      if (this.draftMode) {
        this.paperSize = 'bill'
        this.invoiceTemplate = 'standard'
      } else if (this.isMaterial) {
        // MATERIAL: ไม่มีตัวเลือกกระดาษต่อเนื่อง 'bill' และ template อื่นนอกจาก summary
        if (this.paperSize === 'bill') this.paperSize = 'vat-bridge'
        this.invoiceTemplate = 'summary'
      } else {
        this.invoiceTemplate = 'standard'
      }
    },

    onShowDecimalsChange(val) {
      if (this.draftMode) return
      storage.setItem('invoice-print-show-decimals-v2', String(val))
    },

    onShowImagesChange(val) {
      storage.setItem('invoice-print-show-images', String(val))
    },

    formatDate(date) {
      if (!date) return '-'
      return dayjs(date).format('DD/MM/YYYY')
    },

    applyBillVatDefault() {
      const shouldOverride = this.paperSize === 'bill' && this.invoiceVatPercent === 0
        && this.billElementFlags.unitPriceMode === 'tag' && !this.billVatTouched
      if (shouldOverride && !this.billVatOverridden) {
        this.billVatSavedShowVat = this.billElementFlags.showVat
        this.billElementFlags.showVat = false
        this.billVatOverridden = true
      } else if (!shouldOverride && this.billVatOverridden) {
        this.billElementFlags.showVat = this.billVatSavedShowVat
        this.billVatOverridden = false
      }
    },

    formatMoney(val) {
      return formatDocumentMoney(val)
    },

    onUseSubVat() {
      this.billElementFlags.unitPriceMode = 'subVat'
      this.onBillFlagChange()
    },

    onUseTag() {
      this.billElementFlags.unitPriceMode = 'tag'
      this.onBillFlagChange()
    },

    onHideFooterVat() {
      this.onShowVatToggle(false)
    },

    onShowFooterVat() {
      this.onShowVatToggle(true)
    },

    onShowVatToggle(val) {
      this.billVatTouched = true
      this.billVatOverridden = false
      this.billElementFlags.showVat = val
      this.onBillFlagChange()
    },

    onBillFlagChange() {
      this.applyBillVatDefault()
      const toSave = { ...this.billElementFlags }
      if (this.billVatOverridden) toSave.showVat = this.billVatSavedShowVat
      if (this.draftMode) return
      storage.setItem('bill-print-column-flags', JSON.stringify(toSave))
    },

    closeModal() {
      if (this.autoPreviewTimer) {
        clearTimeout(this.autoPreviewTimer)
        this.autoPreviewTimer = null
      }
      this.$emit('close-modal')
    },

    buildPrintData() {
      const normalizedDate = new Date(this.printData.invoiceDate)
      normalizedDate.setHours(0, 0, 0, 0)

      if (this.isTaxPaper) {
        storage.setItem(getTaxPaperConfig(this.paperSize).offsetStorageKey, JSON.stringify(this.continuousOffset))
      } else if (this.paperSize === 'bill') {
        storage.setItem('invoice-bill-offset', JSON.stringify(this.billOffset))
      }

      return {
        ...this.invoiceData,
        invoiceNumber: this.printData.invoiceNumber.trim(),
        invoiceDate: normalizedDate,
        sellerName: this.printData.sellerName ? this.printData.sellerName.trim() : '',
        showCifLabel: this.paperSize === 'a4' && !this.isMaterial ? this.printData.showCifLabel : false,
        showSeller: this.paperSize === 'a4' && !this.isMaterial ? this.printData.showSeller : false,
        hideCompanyHeader: this.paperSize === 'a4' ? this.printData.hideCompanyHeader : false,
        showImages: this.paperSize === 'a4' ? this.printData.showImages !== false : true,
        showDecimals: this.isMaterial ? true : this.printData.showDecimals,
        mergeSilverLines: this.isMaterial || this.invoiceTemplate === 'summary' ? false : !!this.printData.mergeSilverLines,
        itemsPerPage: Number(this.printData.itemsPerPage) || 10,
        invoiceTemplate: this.invoiceTemplate,
        paperSize: this.paperSize,
        continuousOffset: { ...this.continuousOffset },
        taxVatPercent: this.isTaxVatLocked ? defaultTaxVatPercent(this.invoiceData) : (Number(this.taxVatPercent) || 0),
        billOffset: { ...this.billOffset },
        printerName: this.selectedPrinter,
        customRemark: (this.customRemark || '').trim(),
        gemColumnMap: { ...this.gemColumnMap },
        ...this.billElementFlags,
        ...(this.draftMode ? { showInvoiceNo: true } : {})
      }
    },

    validatePrintData() {
      if (this.taxVatError) return false

      if (!this.draftMode && (!this.printData.invoiceNumber || !this.printData.invoiceNumber.trim())) {
        warning(this.$t('view.sale.invoiceDetail.validation.invoiceNumberRequired'), this.$t('common.label.incompleteData'))
        return false
      }

      if (!this.printData.invoiceDate) {
        warning(this.$t('view.sale.invoiceDetail.validation.invoiceDateRequired'), this.$t('common.label.incompleteData'))
        return false
      }

      return true
    },

    onConfirmPrint() {
      if (!this.validatePrintData()) return

      confirmIfBarcodePrinter(this.selectedPrinter, getBarcodePrinterName(), this.barcodePrinterConfirmTexts(), () => {
        this.$emit('confirm-print', this.buildPrintData())
        this.closeModal()
      })
    },

    barcodePrinterConfirmTexts() {
      return {
        message: this.$t('view.sale.invoiceDetail.printerIsBarcodeConfirmMsg'),
        title: this.$t('view.sale.invoiceDetail.printerIsBarcodeConfirmTitle'),
        confirmText: this.$t('view.sale.invoiceDetail.printerIsBarcodeConfirmBtn'),
        cancelText: this.$t('common.btn.cancel')
      }
    },

    onPreviewPDF() {
      if (!this.validatePrintData()) return

      const printDataToEmit = this.buildPrintData()
      this.$emit('preview-print', printDataToEmit)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form';

.invoice-confirm-print-container {
  // Component-specific styles only
}

.drawer-print-title {
  font-size: var(--fs-lg);
  font-weight: 700;
  color: #ffffff;
}

.draft-bill-note {
  padding: var(--sp-md);
  border: 1px solid var(--base-warning);
  border-radius: var(--radius-md);
  background: var(--status-open-bg);
  font-size: var(--fs-sm);

  &__title {
    font-weight: 700;
    color: var(--base-font-color);
    margin-bottom: var(--sp-xs);
  }
}

.info-icon {
  font-size: var(--fs-lg);
}

.info-text {
  font-size: var(--fs-sm);
  color: #6c757d;
}

.form-label {
  font-weight: 600;
  color: var(--base-sub-color);
  margin-bottom: 0.5rem;
  display: block;

  i {
    color: var(--base-font-color);
  }
}

.form-text {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.875rem;
}

.printer-select-row {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: var(--sp-sm);

  .printer-ac {
    flex: 1 1 200px;
    min-width: 200px;
  }
}

.printer-status-box {
  margin-top: var(--sp-xs);
  padding: var(--sp-sm) var(--sp-md);
  border: 1px solid var(--base-red);
  border-radius: var(--radius-sm);
  background: #fff5f5;
}

.printer-status-title {
  font-weight: 700;
  color: var(--base-red);
  margin-bottom: var(--sp-xs);
  font-size: var(--fs-sm);
}

.printer-status-list {
  margin: 0;
  padding-left: var(--sp-lg);
  font-size: var(--fs-sm);
  color: var(--base-sub-color);

  a {
    color: var(--base-green);
  }
}

.printer-barcode-warning {
  color: var(--base-font-color);

  .bi {
    color: var(--status-open);
  }
}

.printer-status-msg {
  display: block;
  margin-top: var(--sp-xs);
}

.bill-element-group {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--sp-sm);
  background: #fafafa;
}

.bill-mismatch-warning {
  padding: var(--sp-md);
  border: 1px solid var(--base-warning);
  border-radius: var(--radius-md);
  background: var(--status-open-bg);
  font-size: var(--fs-sm);
}

.bill-special-info {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}

.bill-element-group-title {
  font-size: var(--fs-sm);
  font-weight: 600;
  color: var(--base-font-color);
  margin-bottom: var(--sp-xs);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.bill-gem-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-sm);
  padding: var(--sp-xs) 0;
}

.bill-gem-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.bill-gem-label {
  font-weight: 600;
  color: var(--base-font-color);
}

.bill-column-toggles {
  display: flex;
  flex-direction: column;
  gap: var(--sp-xs);
}

// History side panel
.print-history-panel {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.print-history-header {
  background: var(--base-font-color);
  color: #ffffff;
  font-size: var(--fs-sm);
  font-weight: 700;
  padding: var(--sp-sm) var(--sp-md);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}

.print-history-count {
  padding: var(--sp-xs) var(--sp-md);
  font-size: var(--fs-sm);
  color: var(--base-font-color);
  font-weight: 600;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-highlight-bg);
  flex-shrink: 0;
}

.print-history-empty {
  padding: var(--sp-lg) var(--sp-md);
  text-align: center;
  color: #6c757d;
  font-size: var(--fs-sm);
}

.print-history-list {
  flex: 1;
  overflow-y: auto;
}

.print-history-item {
  padding: var(--sp-sm) var(--sp-md);
  border-bottom: 1px solid var(--color-border);
  font-size: var(--fs-sm);

  &:last-child {
    border-bottom: none;
  }

  &__copy {
    font-weight: 700;
    color: var(--base-font-color);
    display: inline;
  }

  &__type {
    display: inline;
    margin-left: var(--sp-xs);
    font-weight: 600;
  }

  &__mode {
    font-size: 11px;
    color: #6c757d;
    margin-top: 2px;
  }

  &__date {
    font-size: 11px;
    color: #6c757d;
    margin-top: 2px;
  }

  &__by {
    font-size: 11px;
    color: var(--base-green);
    margin-top: 1px;
  }
}

// PrimeVue Calendar full width
:deep(.p-calendar) {
  width: 100%;

  .p-inputtext {
    width: 100%;
    border: 1px solid #ced4da;
    border-radius: var(--radius-sm);
    padding: 0.5rem 0.75rem;
    font-size: var(--base-font-size);

    &:focus {
      border-color: var(--base-green);
      box-shadow: 0 0 0 0.2rem rgba(3, 131, 135, 0.25);
      outline: none;
    }
  }
}
</style>
