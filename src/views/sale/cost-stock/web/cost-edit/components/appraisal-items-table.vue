<template>
  <div>
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
          :value="priceItems"
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
                @click="$emit('del-item', slotProps.index)"
              >
                <span class="bi bi-trash"></span>
              </button>
            </template>
          </Column>

          <Column field="nameDescription">
            <template #body="slotProps">
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
                @blur="onBlurPrice(slotProps.data, 'qty')"
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
                @blur="onBlurPrice(slotProps.data, 'qtyPrice')"
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
                @blur="onBlurPrice(slotProps.data, 'qtyWeight')"
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
                @blur="onBlurPrice(slotProps.data, 'qtyWeightPrice')"
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
                    <span>{{ caltotalPrice(priceItems) }}</span>
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
                      :value="formAppraisal.tagPriceMultiplier"
                      type="number"
                      class="form-control form-control-sm text-right"
                      step="any"
                      min="0"
                      @input="$emit('update:tagPriceMultiplier', Number($event.target.value))"
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
          v-model="localMasterValue"
          :options="masterType"
          optionLabel="name"
          optionValue="code"
          :placeholder="$t('common.label.all')"
        />
        <button
          type="button"
          class="btn btn-sm btn-green"
          :title="$t('view.sale.costStock.addItem')"
          @click="onAddItem"
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
            :modelValue="formAppraisal.currencyUnit"
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
            :value="formAppraisal.currencyRate"
            min="0"
            step="0.01"
            :placeholder="$t('view.sale.costStock.placeholder.currencyRate')"
            @input="$emit('update:currencyRate', Number($event.target.value) || null)"
          />
        </div>
        <div></div>
        <div></div>
      </div>

      <!-- Currency Rate Summary Preview -->
      <div v-if="hasCurrencyConversion" class="currency-preview-block mt-3">
        <div class="currency-preview-row">
          <span class="currency-preview-label">{{ $t('view.sale.costStock.currencyRate') }}</span>
          <span class="currency-preview-value">1 {{ formAppraisal.currencyUnit }} = {{ formAppraisal.currencyRate?.toFixed(2) }} THB</span>
        </div>
        <div class="currency-preview-row">
          <span class="currency-preview-label">{{ $t('view.sale.costStock.totalCostCurrency', { currency: formAppraisal.currencyUnit }) }}</span>
          <span class="currency-preview-value font-weight-bold">{{ displayTotalCost }}</span>
        </div>
        <div class="currency-preview-row">
          <span class="currency-preview-label">{{ $t('view.sale.costStock.appraisalPrice', { currency: formAppraisal.currencyUnit }) }}</span>
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
        <button class="btn btn-sm btn-main" type="button" @click="$emit('save-as-origin')">
          <span class="bi bi-save mr-2"></span>
          <span>{{ $t('view.sale.costStock.saveAsOrigin') }}</span>
        </button>
        <button
          class="btn btn-sm btn-main"
          type="button"
          @click="$emit('preview-pdf')"
          :disabled="exportingPreviewPDF"
        >
          <span class="bi bi-file-pdf mr-2"></span>
          <span>{{ exportingPreviewPDF ? $t('view.sale.costStock.previewPdfLoading') : $t('view.sale.costStock.previewPdf') }}</span>
        </button>
        <button class="btn btn-sm btn-outline-main" type="button" @click="$emit('cancel')">
          <span class="bi bi-x mr-2"></span>
          <span>{{ $t('common.btn.cancel') }}</span>
        </button>
      </div>
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

import AutoCompleteGeneric from '@/components/prime-vue/AutoCompleteGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import { CURRENCY_UNITS } from '@/constants/currency-units.js'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'

export default {
  name: 'AppraisalItemsTable',

  components: {
    DataTable,
    Column,
    ColumnGroup,
    Row,
    AutoCompleteGeneric,
    DropdownGeneric
  },

  props: {
    priceItems: {
      type: Array,
      default: () => []
    },
    formAppraisal: {
      type: Object,
      default: () => ({
        tagPriceMultiplier: 1,
        currencyUnit: '',
        currencyRate: null
      })
    },
    exportingPreviewPDF: {
      type: Boolean,
      default: false
    }
  },

  emits: [
    'del-item',
    'add-item',
    'update:tagPriceMultiplier',
    'update:currencyUnit',
    'update:currencyRate',
    'save-as-origin',
    'preview-pdf',
    'cancel'
  ],

  setup() {
    const masterStore = useMasterApiStore()
    return { masterStore, CURRENCY_UNITS }
  },

  data() {
    return {
      localMasterValue: 'ETC'
    }
  },

  computed: {
    hardcodedGoldList() {
      return [
        { code: 'น้ำหนักแป้น', name: this.$t('view.sale.costStock.goldListPlate') },
        { code: 'Gold Loss', name: this.$t('view.sale.costStock.goldListGoldLoss') },
        { code: 'Alloy', name: this.$t('view.sale.costStock.goldListAlloy') }
      ]
    },

    masterGoldList() {
      const apiGold = this.masterStore.gold || []
      const combined = [...this.hardcodedGoldList]
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

    masterType() {
      return [
        { code: 'Gold', name: this.$t('view.sale.costStock.group.gold') },
        { code: 'Gem', name: this.$t('view.sale.costStock.group.material') },
        { code: 'Worker', name: this.$t('view.sale.costStock.group.worker') },
        { code: 'Embed', name: this.$t('view.sale.costStock.group.embed') },
        { code: 'ETC', name: this.$t('view.sale.costStock.group.etc') }
      ]
    },

    hasCurrencyConversion() {
      const { currencyUnit, currencyRate } = this.formAppraisal
      return !!(currencyUnit && currencyRate && currencyRate > 0 && currencyRate !== 1)
    },

    displayCurrency() {
      return this.hasCurrencyConversion ? this.formAppraisal.currencyUnit : 'THB'
    },

    tagPrice() {
      const total = this.priceItems.reduce((sum, item) => sum + Number(item.totalPrice), 0)
      return (total * (Number(this.formAppraisal.tagPriceMultiplier) || 0)).toFixed(2)
    },

    displayTotalCost() {
      const total = this.priceItems.reduce((sum, item) => sum + Number(item.totalPrice), 0)
      if (!this.hasCurrencyConversion) return total.toFixed(2)
      return (total / this.formAppraisal.currencyRate).toFixed(2)
    },

    displayTagPrice() {
      const tagPriceNum = Number(this.tagPrice) || 0
      if (!this.hasCurrencyConversion) return tagPriceNum.toFixed(2)
      return (tagPriceNum / this.formAppraisal.currencyRate).toFixed(2)
    }
  },

  methods: {
    onAddItem() {
      this.$emit('add-item', this.localMasterValue ?? 'ETC')
    },

    onCurrencyChange(value) {
      if (typeof value === 'object' && value !== null) {
        this.$emit('update:currencyUnit', value.code || '')
      } else {
        this.$emit('update:currencyUnit', value || '')
      }
    },

    onBlurPrice(item, fieldName) {
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
      return this.priceItems
        .filter((item) => item.nameGroup === groupName)
        .reduce((total, item) => total + Number(item.totalPrice), 0)
    },

    getApiEndpoint(nameGroup) {
      switch (nameGroup) {
        case 'Gem':
          return 'StockGem/Search'
        default:
          return ''
      }
    },

    getSearchField() {
      return 'text'
    },

    useStaticList(nameGroup) {
      switch (nameGroup) {
        case 'Gold':
        case 'Worker':
        case 'Embed':
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

    onItemSelect(event, rowData) {
      const selected = event.value
      if (selected) {
        if (rowData.nameGroup === 'Gold') {
          rowData.nameDescription = selected.code
        } else {
          rowData.nameDescription = selected.name
        }
        if (rowData.nameGroup === 'Gem' && selected.price) {
          rowData.qtyWeightPrice = selected.price
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

input {
  margin-top: 5px !important;
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

:deep(.p-autocomplete .p-component) {
  margin-top: 0px !important;
}

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
</style>
