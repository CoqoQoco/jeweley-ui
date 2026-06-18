<template>
  <div class="appraisal-form-container">
    <form @submit.prevent="onSubmit">
      <!-- Stock Information Section -->
      <div class="filter-container mt-2">
        <div class="vertical-center-container mb-2">
          <span class="title-text-lg bi bi-clipboard2-check-fill mr-2"></span>
          <span class="title-text-lg">{{ $t('view.sale.costStock.stockInfo') }}</span>
        </div>

        <div class="form-col-sm-container">
          <div>
            <span class="title-text">{{ $t('view.sale.costStock.stockNumber') }}</span>
            <input
              class="form-control form-control-sm"
              type="text"
              :value="stock.stockNumber || stock.stockNumberOrigin"
              readonly
              disabled
            />
          </div>
          <div>
            <span class="title-text">{{ $t('view.sale.costStock.productCode') }}</span>
            <input
              class="form-control form-control-sm"
              type="text"
              v-model="localStock.productNumber"
              readonly
              disabled
            />
          </div>

          <div>
            <span class="title-text">{{ $t('view.sale.costStock.description') }}</span>
            <input
              class="form-control form-control-sm"
              type="text"
              v-model="localStock.description"
              readonly
              disabled
            />
          </div>

          <div>
            <span class="title-text">{{ $t('view.sale.costStock.mold') }}</span>
            <input
              class="form-control form-control-sm"
              type="text"
              :value="localStock.mold || '-'"
              readonly
              disabled
            />
          </div>

          <div>
            <span class="title-text">{{ $t('view.sale.costStock.woNumber') }}</span>
            <input
              class="form-control form-control-sm"
              type="text"
              :value="localStock.wo && localStock.woNumber ? `${localStock.wo}${localStock.woNumber}` : (localStock.wo || '-')"
              readonly
              disabled
            />
          </div>
        </div>

        <!-- Plan Information (Only show when planRunning exists) -->
        <template v-if="localStock.planRunning">
          <div class="line mt-3 mb-3"></div>

          <div class="vertical-center-container mb-2">
            <span class="title-text-lg bi bi-list-check mr-2"></span>
            <span class="title-text-lg">{{ $t('view.sale.costStock.planInfo') }}</span>
          </div>

          <div class="plan-info-display">
            <div class="form-col-sm-container">
              <div>
                <span class="title-text">{{ $t('view.sale.costStock.planNumber') }}</span>
                <div class="plan-display-field">
                  {{ localStock.planRunning }}
                </div>
              </div>
              <div>
                <span class="title-text">{{ $t('view.sale.costStock.planCreateDate') }}</span>
                <div class="plan-display-field">
                  {{ formatDate(localStock.planCreateDate) }}
                </div>
              </div>
              <div>
                <span class="title-text">{{ $t('view.sale.costStock.planCreateBy') }}</span>
                <div class="plan-display-field">
                  {{ localStock.planCreateBy }}
                </div>
              </div>
              <div></div>
            </div>

            </div>
        </template>

        <!-- Plan Cost Button — แสดงตลอด -->
        <div class="mt-3 responsive-btn-group">
          <button
            class="btn btn-sm btn-main"
            type="button"
            @click="showPlanCostModal = true"
          >
            <i class="bi bi-graph-up mr-1"></i>
            <span>{{ $t('view.sale.costStock.viewPlanCost') }}</span>
          </button>
          <button
            class="btn btn-sm btn-main"
            type="button"
            @click="openKitco"
          >
            <i class="bi bi-currency-dollar mr-1"></i>
            <span>{{ $t('view.sale.costStock.checkGoldPrice') }}</span>
          </button>
        </div>

        <!-- Custom Stock Info -->
        <div class="line mt-3 mb-3"></div>

        <div class="vertical-center-container mb-2">
          <span class="title-text-lg bi bi-pencil-square mr-2"></span>
          <span class="title-text-lg">{{ $t('view.sale.costStock.customStockInfo') }}</span>
        </div>
        <div class="responsive-text-note mb-2">
          {{ $t('view.sale.costStock.customStockNote') }}
        </div>

        <div
          v-for="(item, index) in customInfoItems"
          :key="index"
          class="custom-info-row mb-2"
        >
          <input
            class="form-control form-control-sm custom-info-label"
            type="text"
            v-model="item.label"
            :placeholder="$t('view.sale.costStock.placeholder.appraisalTitle')"
          />
          <input
            class="form-control form-control-sm custom-info-value"
            type="text"
            v-model="item.value"
            :placeholder="$t('view.sale.costStock.placeholder.appraisalValue')"
          />
          <button
            class="btn btn-sm btn-red"
            type="button"
            @click="removeCustomInfoItem(index)"
          >
            <i class="bi bi-trash"></i>
          </button>
        </div>

        <button class="btn btn-sm btn-main mt-1" type="button" @click="addCustomInfoItem">
          <i class="bi bi-plus mr-1"></i>{{ $t('view.sale.costStock.addItem') }}
        </button>

        <!-- Customer Information -->
        <div class="line mt-3 mb-3"></div>

        <div class="vertical-center-container mb-2">
          <span class="title-text-lg bi bi-person-fill mr-2"></span>
          <span class="title-text-lg">{{ $t('view.sale.costStock.customerSection') }}</span>
        </div>

        <div class="mb-2">
          <button
            class="btn btn-sm btn-green mr-2"
            type="button"
            @click="onSearchCustomer"
            :title="$t('view.sale.costStock.searchCustomer')"
          >
            <i class="bi bi-search mr-1"></i>
            <span>{{ $t('view.sale.costStock.searchCustomer') }}</span>
          </button>
          <button
            class="btn btn-sm btn-main"
            type="button"
            @click="onCreateCustomer"
            :title="$t('view.sale.costStock.addCustomer')"
          >
            <i class="bi bi-database-fill-add mr-1"></i>
            <span>{{ $t('view.sale.costStock.addCustomer') }}</span>
          </button>
        </div>

        <div class="customer-info-display">
          <div class="form-col-sm-container">
            <div>
              <span class="title-text">{{ $t('view.sale.costStock.customerName') }}</span>
              <div class="customer-display-field">
                {{ localStock.customerName || '-' }}
              </div>
            </div>
            <div>
              <span class="title-text">{{ $t('view.sale.costStock.customerAddress') }}</span>
              <div class="customer-display-field">
                {{ localStock.customerAddress || '-' }}
              </div>
            </div>
            <div>
              <span class="title-text">{{ $t('common.field.phone') }}</span>
              <div class="customer-display-field">
                {{ localStock.customerPhone || '-' }}
              </div>
            </div>
            <div>
              <span class="title-text">{{ $t('common.field.email') }}</span>
              <div class="customer-display-field">
                {{ localStock.customerEmail || '-' }}
              </div>
            </div>
          </div>
          <div class="form-col-sm-container mt-2">
            <div>
              <span class="title-text">{{ $t('common.field.remark') }}</span>
              <textarea
                class="form-control form-control-sm"
                v-model="localStock.remark"
                :placeholder="$t('view.sale.costStock.placeholder.remark')"
                rows="2"
                autocomplete="off"
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- Price Appraisal Section -->
      <div class="filter-container mt-3 pb-4">
        <div class="vertical-center-container mb-2">
          <span class="title-text-lg bi bi-calculator mr-2"></span>
          <span class="title-text-lg">{{ $t('view.sale.costStock.appraisalSection') }}</span>
        </div>

        <div class="responsive-text-note">
          {{ $t('view.sale.costStock.perItemNote') }}
        </div>

        <div class="responsive-table-wrapper">
        <DataTable
          :value="tranItems"
          rowGroupMode="subheader"
          groupRowsBy="nameGroup"
          stripedRows
          showGridlines
        >
          <ColumnGroup type="header">
            <Row>
              <Column :header="$t('view.sale.costStock.jobDetail')" :colspan="3" />
              <Column :header="$t('common.field.quantity')" />
              <Column :header="$t('view.sale.costStock.pricePerQty')" />
              <Column :header="$t('common.field.weight')" />
              <Column :header="$t('view.sale.costStock.pricePerWeight')" />
              <Column :header="$t('view.sale.costStock.totalPrice')" />
            </Row>
          </ColumnGroup>

          <Column field="nameGroup" />
          <Column field="index" style="width: 10px">
            <template #body="slotProps">
              <span>{{ slotProps.index + 1 }}</span>
            </template>
          </Column>

          <Column field="action" style="width: 10px">
            <template #body="slotProps">
              <button
                class="btn btn-sm btn-red"
                type="button"
                @click="delTranItem(slotProps.index)"
              >
                <span class="bi bi-trash"></span>
              </button>
            </template>
          </Column>

          <Column field="nameDescription">
            <template #body="slotProps">
              <!-- AutoComplete for new items -->
              <AutoCompleteGeneric
                v-if="slotProps.data.isAdd"
                v-model="slotProps.data.nameDescription"
                :apiEndpoint="getApiEndpoint(slotProps.data.nameGroup)"
                :searchField="getSearchField(slotProps.data.nameGroup)"
                :useStaticList="useStaticList(slotProps.data.nameGroup)"
                :staticOptions="getStaticOptions(slotProps.data.nameGroup)"
                :placeholder="getPlaceholder(slotProps.data.nameGroup)"
                :optionLabel="getOptionLabel(slotProps.data.nameGroup)"
                :forceSelection="false"
                :minLength="getMinLength(slotProps.data.nameGroup)"
                customStyle="background-color: #b5dad4; width: 100%"
                @item-select="onItemSelect($event, slotProps.data)"
              >
                <template #option="{ option }">
                  <div class="flex align-options-center">
                    <div>{{ getOptionDisplay(option, slotProps.data.nameGroup) }}</div>
                  </div>
                </template>
              </AutoCompleteGeneric>

              <!-- Readonly input for existing items -->
              <input
                v-else
                type="text"
                class="form-control"
                v-model="slotProps.data.nameDescription"
                readonly
                disabled
              />
            </template>
          </Column>

          <Column field="qty" style="width: 130px">
            <template #body="slotProps">
              <input
                style="background-color: #b5dad4"
                v-model="slotProps.data.qty"
                type="number"
                class="form-control no-spinners text-right"
                step="any"
                min="0"
                required
                @blur="onBluePrice(slotProps.data, 'qty')"
              />
            </template>
          </Column>

          <Column field="qtyPrice" style="width: 110px">
            <template #body="slotProps">
              <input
                style="background-color: #b5dad4"
                v-model="slotProps.data.qtyPrice"
                type="number"
                class="form-control text-right"
                step="any"
                min="0"
                required
                @blur="onBluePrice(slotProps.data, 'qtyPrice')"
              />
            </template>
          </Column>

          <Column field="qtyWeight" style="width: 110px">
            <template #body="slotProps">
              <input
                style="background-color: #b5dad4"
                v-model="slotProps.data.qtyWeight"
                type="number"
                class="form-control text-right"
                step="any"
                min="0"
                required
                @blur="onBluePrice(slotProps.data, 'qtyWeight')"
              />
            </template>
          </Column>

          <Column field="qtyWeightPrice" style="width: 110px">
            <template #body="slotProps">
              <input
                style="background-color: #b5dad4"
                v-model="slotProps.data.qtyWeightPrice"
                type="number"
                class="form-control text-right"
                step="any"
                min="0"
                required
                @blur="onBluePrice(slotProps.data, 'qtyWeightPrice')"
              />
            </template>
          </Column>

          <Column field="totalPrice" style="width: 150px">
            <template #body="slotProps">
              <input
                v-model="slotProps.data.totalPrice"
                class="form-control text-right"
                min="0"
                disabled
              />
            </template>
          </Column>

          <template #groupheader="slotProps">
            <div class="flex align-items-center gap-2 type-container">
              <span><i class="bi bi-clipboard2-check mr-2"></i></span>
              <span>{{ getGroupName(slotProps.data.nameGroup) }}</span>
            </div>
          </template>

          <template #groupfooter="slotProps">
            <div class="d-flex align-items-center justify-content-between gap-2 type-container">
              <div>
                <span><i class="bi bi-clipboard2-check-fill mr-2"></i></span>
                <span>{{ $t('view.sale.costStock.costPrefix') }}</span>
                <span>{{ getGroupName(slotProps.data.nameGroup) }}</span>
              </div>
              <div class="text-right mr-2">
                {{ calculateGroupTotal(slotProps.data.nameGroup).toFixed(2) }}
              </div>
            </div>
          </template>

          <ColumnGroup type="footer">
            <Row>
              <Column :colspan="7">
                <template #footer>
                  <div class="text-right type-container">
                    <span>{{ $t('view.sale.costStock.totalCostTHB') }}</span>
                  </div>
                </template>
              </Column>
              <Column :colspan="1">
                <template #footer>
                  <div class="text-right type-container">
                    <span>{{ caltotalPrice(tranItems) }}</span>
                  </div>
                </template>
              </Column>
            </Row>
            <Row v-if="hasCurrencyConversion">
              <Column :colspan="7">
                <template #footer>
                  <div class="text-right type-container currency-summary-row">
                    <span>{{ $t('view.sale.costStock.totalCostCurrency', { currency: displayCurrency }) }}</span>
                  </div>
                </template>
              </Column>
              <Column :colspan="1">
                <template #footer>
                  <div class="text-right type-container currency-summary-row">
                    <span>{{ displayTotalCost }}</span>
                  </div>
                </template>
              </Column>
            </Row>
            <Row>
              <Column :colspan="5">
                <template #footer>
                  <div class="text-right type-container">
                    <span>{{ $t('view.sale.costStock.appraisalPrice', { currency: displayCurrency }) }}</span>
                  </div>
                </template>
              </Column>
              <Column :colspan="2">
                <template #footer>
                  <div class="tag-price-multiplier">
                    <span class="multiplier-label">{{ $t('view.sale.costStock.costPrefix') }} ×</span>
                    <input
                      v-model="tagPriceMultiplier"
                      type="number"
                      class="form-control form-control-sm text-right"
                      step="any"
                      min="0"
                    />
                  </div>
                </template>
              </Column>
              <Column :colspan="1">
                <template #footer>
                  <div class="text-right type-container tag-price-value">
                    <span>{{ displayTagPrice }}</span>
                  </div>
                </template>
              </Column>
            </Row>
            <Row v-if="hasCurrencyConversion">
              <Column :colspan="7">
                <template #footer>
                  <div class="text-right type-container tag-reference-text">
                    <span>{{ $t('view.sale.costStock.appraisalPrice', { currency: 'THB' }) }}</span>
                  </div>
                </template>
              </Column>
              <Column :colspan="1">
                <template #footer>
                  <div class="text-right type-container tag-reference-text">
                    <span>{{ tagPrice }}</span>
                  </div>
                </template>
              </Column>
            </Row>
          </ColumnGroup>
        </DataTable>
        </div>

        <!-- Add Transaction Item -->
        <div class="responsive-action-group mt-2">
          <DropdownGeneric
            v-model="masterValue"
            :options="masterType"
            optionLabel="name"
            optionValue="code"
            :placeholder="$t('common.label.all')"
          />
          <button
            type="button"
            class="btn btn-sm btn-green"
            :title="$t('view.sale.costStock.addItem')"
            @click="addTranItem"
          >
            <span><i class="bi bi-plus mr-1"></i></span>
            <span>{{ $t('view.sale.costStock.addItem') }}</span>
          </button>
        </div>
      </div>

      <!-- Currency Conversion Section -->
      <div class="filter-container mt-3">
        <div class="vertical-center-container mb-2">
          <span class="title-text-lg bi bi-currency-exchange mr-2"></span>
          <span class="title-text-lg">{{ $t('view.sale.costStock.currency') }}</span>
        </div>
        <div class="form-col-sm-container">
          <div>
            <span class="title-text">{{ $t('view.sale.costStock.currencyUnit') }}</span>
            <AutoCompleteGeneric
              :modelValue="currencyUnit"
              :staticOptions="CURRENCY_UNITS"
              :useStaticList="true"
              optionLabel="code"
              :placeholder="$t('view.sale.costStock.placeholder.currencyUnit')"
              :forceSelection="false"
              customClass="appraisal-currency-ac"
              @update:modelValue="onCurrencyChange"
            >
              <template #option="{ option }">
                <span>{{ option.label }}</span>
              </template>
            </AutoCompleteGeneric>
          </div>
          <div>
            <span class="title-text">{{ $t('view.sale.costStock.currencyRate') }}</span>
            <input
              class="form-control form-control-sm"
              type="number"
              v-model.number="currencyRate"
              min="0"
              step="0.01"
              :placeholder="$t('view.sale.costStock.placeholder.currencyRate')"
            />
          </div>
          <div></div>
          <div></div>
        </div>

        <!-- Currency Rate Summary Preview -->
        <div v-if="hasCurrencyConversion" class="currency-preview-block mt-3">
          <div class="currency-preview-row">
            <span class="currency-preview-label">{{ $t('view.sale.costStock.currencyRate') }}</span>
            <span class="currency-preview-value">1 {{ currencyUnit }} = {{ currencyRate?.toFixed(2) }} THB</span>
          </div>
          <div class="currency-preview-row">
            <span class="currency-preview-label">{{ $t('view.sale.costStock.totalCostCurrency', { currency: currencyUnit }) }}</span>
            <span class="currency-preview-value font-weight-bold">{{ displayTotalCost }}</span>
          </div>
          <div class="currency-preview-row">
            <span class="currency-preview-label">{{ $t('view.sale.costStock.appraisalPrice', { currency: currencyUnit }) }}</span>
            <span class="currency-preview-value font-weight-bold">{{ displayTagPrice }}</span>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="filter-container mt-3 pb-4">
        <div class="responsive-btn-group">
          <button class="btn btn-sm btn-green" type="submit">
            <span class="bi bi-save mr-2"></span>
            <span>{{ $t('common.btn.save') }}</span>
          </button>
          <button class="btn btn-sm btn-main" type="button" @click="onSaveAsOriginCost">
            <span class="bi bi-save mr-2"></span>
            <span>{{ $t('view.sale.costStock.saveAsOrigin') }}</span>
          </button>
          <button
            class="btn btn-sm btn-main"
            type="button"
            @click="onPreviewPDF"
            :disabled="exportingPreviewPDF"
          >
            <span class="bi bi-file-pdf mr-2"></span>
            <span>{{ exportingPreviewPDF ? $t('view.sale.costStock.previewPdfLoading') : $t('view.sale.costStock.previewPdf') }}</span>
          </button>
          <button class="btn btn-sm btn-outline-main" type="button" @click="onCancel">
            <span class="bi bi-x mr-2"></span>
            <span>{{ $t('common.btn.cancel') }}</span>
          </button>
        </div>
      </div>
    </form>

    <!-- Customer Search Modal -->
    <CustomerSearchModal
      :showModal="showCustomerSearch"
      @closeModal="onCloseCustomerModal"
      @customerSelected="onCustomerSelected"
    />

    <!-- Customer Create Modal -->
    <CustomerCreateModal
      :showModal="showCustomerCreate"
      @closeModal="onCloseCustomerModal"
      @customerCreated="onCustomerCreated"
    />

    <!-- Plan Cost Modal -->
    <PlanCostModal
      v-model:visible="showPlanCostModal"
      :planPriceItems="planPriceItems"
      :planQty="planProductQty"
      :wo="localStock.wo"
      :woNumber="localStock.woNumber"
    />
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

import AutoCompleteGeneric from '@/components/prime-vue/AutoCompleteGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import { CURRENCY_UNITS } from '@/constants/currency-units.js'
import CustomerSearchModal from '@/views/sale/quotation/modal/customer-search-modal.vue'
import CustomerCreateModal from '@/views/sale/quotation/modal/customer-create-modal.vue'
import PlanCostModal from './plan-cost-modal.vue'

import { useMasterApiStore } from '@/stores/modules/api/master-store.js'
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { formatDate } from '@/services/utils/dayjs.js'
import { AppraisalHistoryPdfBuilder } from '@/services/helper/pdf/appraisal/appraisal-history-pdf-builder.js'
import dayjs from 'dayjs'

export default {
  name: 'AppraisalFormView',

  components: {
    DropdownGeneric,
    DataTable,
    Column,
    ColumnGroup,
    Row,
    AutoCompleteGeneric,
    CustomerSearchModal,
    CustomerCreateModal,
    PlanCostModal
  },

  props: {
    stock: {
      type: Object,
      required: true,
      default: () => ({})
    }
  },

  emits: ['save', 'cancel'],

  setup() {
    const masterStore = useMasterApiStore()
    const productStore = usrStockProductApiStore()
    return { masterStore, productStore, formatDate }
  },

  computed: {
    hardcodedGoldList() {
      return [
        { code: 'น้ำหนักแป้น', name: this.$t('view.sale.costStock.goldListPlate') },
        { code: 'Gold Loss', name: this.$t('view.sale.costStock.goldListGoldLoss') },
        { code: 'Alloy', name: this.$t('view.sale.costStock.goldListAlloy') }
      ]
    },

    tagPrice() {
      const total = this.tranItems.reduce((sum, item) => sum + Number(item.totalPrice), 0)
      return (total * (Number(this.tagPriceMultiplier) || 0)).toFixed(2)
    },

    hasCurrencyConversion() {
      return !!(this.currencyUnit && this.currencyRate && this.currencyRate > 0 && this.currencyRate !== 1)
    },

    displayCurrency() {
      return this.hasCurrencyConversion ? this.currencyUnit : 'THB'
    },

    displayTotalCost() {
      const total = this.tranItems.reduce((sum, item) => sum + Number(item.totalPrice), 0)
      if (!this.hasCurrencyConversion) return total.toFixed(2)
      return (total / this.currencyRate).toFixed(2)
    },

    displayTagPrice() {
      const tagPriceNum = Number(this.tagPrice) || 0
      if (!this.hasCurrencyConversion) return tagPriceNum.toFixed(2)
      return (tagPriceNum / this.currencyRate).toFixed(2)
    },

    masterType() {
      return [
        { code: 'Gold', name: this.$t('view.sale.costStock.group.gold') },
        { code: 'Gem', name: this.$t('view.sale.costStock.group.material') },
        { code: 'Worker', name: this.$t('view.sale.costStock.group.worker') },
        { code: 'Embed', name: this.$t('view.sale.costStock.group.embed') },
        { code: 'ETC', name: this.$t('view.sale.costStock.group.etc') }
      ]
    },

    masterWorkerList() {
      return [
        { code: 'WORKER01', name: this.$t('view.sale.costStock.workerJobs.plating') },
        { code: 'WORKER02', name: this.$t('view.sale.costStock.workerJobs.mold') },
        { code: 'WORKER03', name: this.$t('view.sale.costStock.workerJobs.laser') },
        { code: 'WORKER04', name: this.$t('view.sale.costStock.workerJobs.baseWork') },
        { code: 'WORKER05', name: this.$t('view.sale.costStock.workerJobs.gemSort') }
      ]
    },

    masterEmbedList() {
      return [
        { code: 'EMBED01', name: this.$t('view.sale.costStock.embedJobs.gem') },
        { code: 'EMBED02', name: this.$t('view.sale.costStock.embedJobs.diamond') },
        { code: 'EMBED03', name: this.$t('view.sale.costStock.embedJobs.flower') },
        { code: 'EMBED04', name: this.$t('view.sale.costStock.embedJobs.bezel') }
      ]
    },

    masterETCList() {
      return [
        { code: 'ETC01', name: this.$t('view.sale.costStock.etcJobs.packaging') },
        { code: 'ETC02', name: this.$t('view.sale.costStock.etcJobs.shipping') },
        { code: 'ETC03', name: this.$t('view.sale.costStock.etcJobs.fee') },
        { code: 'ETC04', name: this.$t('view.sale.costStock.etcJobs.other') },
        { code: 'ETC05', name: this.$t('view.sale.costStock.etcJobs.qc') }
      ]
    },

    masterGoldList() {
      // Combine hardcoded gold list with API gold list
      const apiGold = this.masterStore.gold || []
      const combined = [...this.hardcodedGoldList]

      // Add API gold items that don't exist in hardcoded list
      apiGold.forEach((apiItem) => {
        const exists = combined.some(
          (item) => item.code.toLowerCase() === apiItem.code.toLowerCase()
        )
        if (!exists) {
          combined.push(apiItem)
        }
      })

      return combined
    },

    planPriceItems() {
      return this.localStock.planPriceItems || []
    },

    hasPlanProductionCost() {
      return this.planPriceItems.length > 0
    },

    planProductQty() {
      return Number(this.localStock.planQty) || 1
    }
  },


  watch: {
    stock: {
      handler(val) {
        if (!val) return
        this.localStock = { ...val }
        this.tagPriceMultiplier = val.tagPriceMultiplier || 1
        this.currencyUnit = val.currencyUnit || ''
        this.currencyRate = val.currencyRate || null
        this.customInfoItems = (val.customStockInfo || []).map((item) => ({
          label: item.label || '',
          value: item.value || ''
        }))

        // Initialize transaction items from priceTransactions only
        if (this.localStock.priceTransactions && this.localStock.priceTransactions.length > 0) {
          this.tranItems = this.localStock.priceTransactions.map((item) => ({
            nameGroup: item.nameGroup || (item.type === 'Diamond' ? 'Gem' : item.type) || 'ETC',
            nameDescription:
              item.nameDescription || item.typeCode || item.description || item.type || '',
            qty: Number(item.qty) || 0,
            qtyPrice: Number(item.qtyPrice) || 0,
            qtyWeight: Number(item.qtyWeight) || 0,
            qtyWeightPrice: Number(item.qtyWeightPrice) || 0,
            totalPrice: Number(item.totalPrice).toFixed(2) || '0.00',
            isAdd: true
          }))
        } else {
          this.tranItems = []
        }

        // Auto-add "น้ำหนักแป้น" for Ring products (productType === 'R')
        if (this.localStock.productType === 'ES') {
          const hasRingP = this.tranItems.some(
            (item) =>
              item.nameGroup === 'Gold' &&
              (item.nameDescription === 'RINGP' || item.nameDescription === 'น้ำหนักแป้น')
          )

          if (!hasRingP) {
            this.tranItems.push({
              nameGroup: 'Gold',
              nameDescription: 'น้ำหนักแป้น',
              qty: 0,
              qtyPrice: 0,
              qtyWeight: 0,
              qtyWeightPrice: 0,
              totalPrice: '0.00',
              isAdd: true
            })

            // Sort by group order
            this.tranItems = this.tranItems.sort(
              (a, b) => this.groupOrderRunning[a.nameGroup] - this.groupOrderRunning[b.nameGroup]
            )
          }
        }
      },
      immediate: true
    }
  },

  data() {
    return {
      CURRENCY_UNITS,
      localStock: {},
      tranItems: [],
      tagPriceMultiplier: 1,
      currencyUnit: '',
      currencyRate: null,
      masterValue: 'ETC',
      showCustomerSearch: false,
      showCustomerCreate: false,
      exportingPreviewPDF: false,
      showPlanCostModal: false,
      customInfoItems: [],

      groupOrderRunning: {
        Gold: 1,
        Worker: 2,
        Embed: 3,
        Gem: 4,
        ETC: 5
      },


    }
  },

  methods: {
    addCustomInfoItem() {
      this.customInfoItems.push({ label: '', value: '' })
    },

    removeCustomInfoItem(index) {
      this.customInfoItems.splice(index, 1)
    },

    addTranItem() {
      this.tranItems.push({
        nameGroup: this.masterValue ?? 'ETC',
        nameDescription: '',
        qty: 0,
        qtyPrice: 0,
        qtyWeight: 0,
        qtyWeightPrice: 0,
        totalPrice: '0.00',
        isAdd: true
      })
      this.tranItems = this.tranItems.sort(
        (a, b) => this.groupOrderRunning[a.nameGroup] - this.groupOrderRunning[b.nameGroup]
      )
    },

    delTranItem(index) {
      this.tranItems.splice(index, 1)
    },

    onCurrencyChange(value) {
      if (typeof value === 'object' && value !== null) {
        this.currencyUnit = value.code || ''
      } else {
        this.currencyUnit = value || ''
      }
    },

    onBluePrice(item, fieldName) {
      item[fieldName] = item[fieldName] ? Number(item[fieldName]) : 0
      item.totalPrice = (
        (Number(item.qty) || 0) * (Number(item.qtyPrice) || 0) +
        (Number(item.qtyWeight) || 0) * (Number(item.qtyWeightPrice) || 0)
      ).toFixed(2)
    },

    getGroupName(id) {
      switch (id) {
        case 'Gold':
          return this.$t('view.sale.costStock.group.gold')
        case 'Gem':
          return this.$t('view.sale.costStock.group.material')
        case 'Worker':
          return this.$t('view.sale.costStock.group.worker')
        case 'Embed':
          return this.$t('view.sale.costStock.group.embed')
        case 'ETC':
          return this.$t('view.sale.costStock.group.etc')
        default:
          return id
      }
    },

    caltotalPrice(data) {
      let total = 0
      data.forEach((item) => {
        total += Number(item.totalPrice)
      })
      return total.toFixed(2)
    },

    calculateGroupTotal(groupName) {
      return this.tranItems
        .filter((item) => item.nameGroup === groupName)
        .reduce((total, item) => total + Number(item.totalPrice), 0)
    },

    onSubmit() {
      confirmThenSubmit('', this.$t('view.sale.costStock.confirm.save'), async () => {
        await this.fetchSave(false)
      })
    },

    onSaveAsOriginCost() {
      confirmThenSubmit('', this.$t('view.sale.costStock.confirm.saveAsOrigin'), async () => {
        await this.fetchSave(true)
      })
    },

    async fetchSave(isOriginCost = false) {
      // Mapping data to match API request structure
      const requestData = {
        stockNumber: this.localStock.stockNumber || this.localStock.stockNumberOrigin,
        planRunning: this.localStock.planRunning || null,
        customerCode: this.localStock.customerCode || null,
        customerName: this.localStock.customerName || null,
        customerAddress: this.localStock.customerAddress || null,
        customerTel: this.localStock.customerPhone || null,
        customerEmail: this.localStock.customerEmail || null,
        remark: this.localStock.remark || null,
        tagPriceMultiplier: Number(this.tagPriceMultiplier) || 1,
        currencyUnit: this.currencyUnit || null,
        currencyRate: this.currencyRate ? Number(this.currencyRate) : null,
        customStockInfo: this.customInfoItems
          .filter((i) => i.label.trim())
          .map((i) => ({ label: i.label.trim(), value: i.value.trim() })),
        prictransection: this.tranItems.map((item, index) => ({
          no: index + 1,
          name: item.nameGroup || '',
          nameDescription: item.nameDescription || '',
          nameGroup: item.nameGroup || '',
          date: null,
          qty: Number(item.qty) || 0,
          qtyPrice: Number(item.qtyPrice) || 0,
          qtyWeight: Number(item.qtyWeight) || 0,
          qtyWeightPrice: Number(item.qtyWeightPrice) || 0
        })),
        isOriginCost: isOriginCost
      }

      const response = await this.productStore.fetchAddProductCostDeatialVersion({
        formValue: requestData
      })

      if (response) {
        this.$emit('save', this.localStock)
      }
    },

    onCancel() {
      this.$emit('cancel')
    },

    // Customer Management Methods
    onSearchCustomer() {
      this.showCustomerSearch = true
    },

    onCreateCustomer() {
      this.showCustomerCreate = true
    },

    openKitco() {
      window.open('https://www.kitco.com/', '_blank', 'noopener,noreferrer')
    },

    async onPreviewPDF() {
      this.exportingPreviewPDF = true
      const versionData = {
        running: 'Preview',
        createDate: new Date().toISOString(),
        createBy: '-',
        remark: this.localStock.remark || null,
        customerName: this.localStock.customerName || null,
        customerCode: this.localStock.customerCode || null,
        customerTel: this.localStock.customerPhone || null,
        tagPriceMultiplier: Number(this.tagPriceMultiplier) || 1,
        currencyUnit: this.currencyUnit || '',
        currencyRate: this.currencyRate || null,
        prictransection: this.tranItems.map((item, index) => ({
          no: index + 1,
          name: item.nameGroup || '',
          nameDescription: item.nameDescription || '',
          nameGroup: item.nameGroup || '',
          qty: Number(item.qty) || 0,
          qtyPrice: Number(item.qtyPrice) || 0,
          qtyWeight: Number(item.qtyWeight) || 0,
          qtyWeightPrice: Number(item.qtyWeightPrice) || 0,
          totalPrice: Number(item.totalPrice) || 0
        }))
      }
      const customStockInfo = this.customInfoItems
        .filter((i) => i.label.trim())
        .map((i) => ({ label: i.label.trim(), value: i.value.trim() }))
      const pdfOptions = {
        ...(this.currencyUnit ? { currencyUnit: this.currencyUnit, currencyRate: this.currencyRate } : {}),
        ...(customStockInfo.length ? { customStockInfo } : {})
      }
      const pdfBuilder = new AppraisalHistoryPdfBuilder(this.localStock, versionData, pdfOptions)
      const pdf = await pdfBuilder.generatePDF()
      pdf.open()
      this.exportingPreviewPDF = false
    },

    onCustomerSelected(customerData) {
      this.localStock.customerCode = customerData.code
      this.localStock.customerName = customerData.nameTh || customerData.nameEn
      this.localStock.customerAddress = customerData.address
      this.localStock.customerPhone = customerData.telephone1
      this.localStock.customerEmail = customerData.email
      this.localStock.customerId = customerData.id
      this.showCustomerSearch = false
    },

    onCustomerCreated(customerData) {
      this.localStock.customerCode = customerData.code
      this.localStock.customerName = customerData.nameTh || customerData.nameEn || ''
      this.localStock.customerAddress = customerData.address || ''
      this.localStock.customerPhone = customerData.telephone1 || ''
      this.localStock.customerEmail = customerData.email || ''
      this.localStock.customerId = customerData.id
      this.showCustomerCreate = false
    },

    onCloseCustomerModal() {
      this.showCustomerSearch = false
      this.showCustomerCreate = false
    },

    // AutoComplete Configuration Methods
    getApiEndpoint(nameGroup) {
      switch (nameGroup) {
        case 'Gem':
          return 'StockGem/Search'
        default:
          return ''
      }
    },

    getSearchField(nameGroup) {
      return 'text'
    },

    useStaticList(nameGroup) {
      switch (nameGroup) {
        case 'Gold':
          return true
        case 'Worker':
          return true
        case 'Embed':
          return true
        case 'ETC':
          return true
        case 'Gem':
          return false
        default:
          return true
      }
    },

    getStaticOptions(nameGroup) {
      switch (nameGroup) {
        case 'Gold':
          return this.masterGoldList
        case 'Worker':
          return this.masterWorkerList
        case 'Embed':
          return this.masterEmbedList
        case 'ETC':
          return this.masterETCList
        default:
          return []
      }
    },

    getPlaceholder(nameGroup) {
      switch (nameGroup) {
        case 'Gold':
          return this.$t('view.sale.costStock.searchGold')
        case 'Gem':
          return this.$t('view.sale.costStock.searchGem')
        case 'Worker':
          return this.$t('view.sale.costStock.searchWorker')
        case 'Embed':
          return this.$t('view.sale.costStock.searchEmbed')
        case 'ETC':
          return this.$t('view.sale.costStock.searchEtc')
        default:
          return this.$t('view.sale.costStock.searchDefault')
      }
    },

    getOptionLabel(nameGroup) {
      switch (nameGroup) {
        case 'Gold':
          return 'code'
        default:
          return 'name'
      }
    },

    getMinLength(nameGroup) {
      switch (nameGroup) {
        case 'Gem':
          return 3
        default:
          return 1
      }
    },

    getOptionDisplay(option, nameGroup) {
      switch (nameGroup) {
        case 'Gold':
          return option.code || option.name
        default:
          return option.name
      }
    },

    // Item Select Handler
    onItemSelect(event, rowData) {
      const selected = event.value
      if (selected) {
        // Update nameDescription
        if (rowData.nameGroup === 'Gold') {
          rowData.nameDescription = selected.code
        } else {
          rowData.nameDescription = selected.name
        }

        // Auto-fill price if available (for Gem)
        if (rowData.nameGroup === 'Gem' && selected.price) {
          rowData.qtyWeightPrice = selected.price
        }
      }
    }
  },

  async created() {
    // Load master gold data
    await this.masterStore.fetchGold()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';

.appraisal-form-container {
  margin-top: 10px;
  padding: 0 5px;
}

.type-container {
  font-size: 15px;
  font-weight: bold;
  color: var(--base-font-color);
  padding: 5px;

  @media (max-width: 1024px) {
    font-size: 14px;
  }
}

input {
  margin-top: 5px !important;
}

textarea {
  margin-top: 5px !important;
  resize: vertical;
}

:deep(.p-autocomplete .p-component) {
  margin-top: 0px !important;
}

// Plan Display Field Styles
.plan-info-display {
  margin-top: 10px;
}

.plan-display-field {
  background-color: #fff9e6;
  border: 1px solid #fabc3f;
  border-radius: 4px;
  padding: 8px 12px;
  margin-top: 5px;
  min-height: 36px;
  color: #495057;
  font-size: 14px;
  font-weight: 600;

  @media (max-width: 1024px) {
    font-size: 13px;
    padding: 6px 10px;
    min-height: 34px;
  }
}

// Customer Display Field Styles
.customer-info-display {
  margin-top: 10px;
}

.customer-display-field {
  background-color: #f8f9fa;
  border: 1px solid #ced4da;
  border-radius: 4px;
  padding: 8px 12px;
  margin-top: 5px;
  min-height: 36px;
  color: #495057;
  font-size: 14px;

  @media (max-width: 1024px) {
    font-size: 13px;
    padding: 6px 10px;
    min-height: 34px;
  }
}

// Responsive DataTable styles for Tablet
:deep(.p-datatable) {
  font-size: 14px;

  @media (max-width: 1024px) {
    font-size: 13px;

    .p-datatable-thead > tr > th {
      padding: 0.5rem 0.4rem;
    }

    .p-datatable-tbody > tr > td {
      padding: 0.5rem 0.4rem;
    }

    input.form-control {
      font-size: 13px;
    }
  }
}

// Tag Price Multiplier Row
.tag-price-multiplier {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;

  .multiplier-label {
    font-size: 14px;
    font-weight: bold;
    color: var(--base-font-color);
    white-space: nowrap;
  }

  input {
    max-width: 120px;
    background-color: #b5dad4 !important;

    @media (max-width: 1024px) {
      max-width: 100px;
    }
  }
}

.tag-price-value {
  font-size: 15px;
  color: #e65100;

  @media (max-width: 1024px) {
    font-size: 14px;
  }
}

.currency-summary-row {
  color: #1565c0;
  font-weight: 600;
}

.tag-reference-text {
  color: #999;
  font-size: 12px;
}

// Currency Preview Block (ใต้ currency form inputs)
.currency-preview-block {
  background: #f0f7ff;
  border: 1px solid #b3d4f5;
  border-radius: 6px;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 400px;
}

.currency-preview-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.currency-preview-label {
  color: #555;
}

.currency-preview-value {
  color: #1565c0;
}

// AutoCompleteGeneric — match form-control-sm sizing
:deep(.appraisal-currency-ac) {
  width: 100%;

  .p-autocomplete,
  .p-autocomplete-input {
    width: 100%;
  }

  .p-autocomplete-input {
    height: calc(1.5em + 0.5rem + 2px);
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
    border: 1px solid #ced4da;
    border-radius: 0.2rem;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;

    &:focus {
      border-color: #80bdff;
      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
      outline: 0;
    }
  }
}

// Custom Stock Info row
.custom-info-row {
  display: flex;
  align-items: center;
  gap: 8px;

  .custom-info-label {
    width: 200px;
    flex-shrink: 0;

    @media (max-width: 1024px) {
      width: 150px;
    }
  }

  .custom-info-value {
    flex: 1;
  }
}

// Responsive Column widths for Tablet
:deep(.p-datatable) {
  @media (max-width: 1024px) {
    th[style*="width: 130px"],
    td[style*="width: 130px"] {
      width: 110px !important;
    }

    th[style*="width: 110px"],
    td[style*="width: 110px"] {
      width: 95px !important;
    }

    th[style*="width: 150px"],
    td[style*="width: 150px"] {
      width: 130px !important;
    }
  }
}

</style>
