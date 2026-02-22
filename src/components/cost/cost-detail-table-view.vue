<template>
  <div>
    <!-- Currency Information (Conditional) -->
    <div v-if="currencyUnit" class="filter-container mt-3">
      <div class="vertical-center-container mb-2">
        <span class="title-text-lg bi bi-currency-exchange mr-2"></span>
        <span class="title-text-lg">สกุลเงิน</span>
      </div>

      <div class="form-col-sm-container">
        <div>
          <span class="title-text">สกุลเงิน</span>
          <input
            class="form-control form-control-sm"
            type="text"
            :value="currencyUnit"
            readonly
            disabled
          />
        </div>
        <div>
          <span class="title-text">อัตราแลกเปลี่ยน (1 หน่วย = ? บาท)</span>
          <input
            class="form-control form-control-sm"
            type="text"
            :value="formatCurrency(currencyRate)"
            readonly
            disabled
          />
        </div>
      </div>
    </div>

    <!-- Cost Detail Table -->
    <div class="filter-container mt-3">
      <div class="vertical-center-container mb-2">
        <span class="title-text-lg bi bi-calculator mr-2"></span>
        <span class="title-text-lg">รายการตีราคา</span>
      </div>

      <div class="responsive-table-wrapper">
        <DataTable
          :value="groupedTransactions"
          rowGroupMode="subheader"
          groupRowsBy="nameGroup"
          :sortOrder="1"
          :sortField="'groupOrder'"
          stripedRows
          showGridlines
        >
          <ColumnGroup type="header">
            <Row>
              <Column header="รายการ" />
              <Column header="จำนวน" />
              <Column header="ราคา/หน่วย" />
              <Column header="น้ำหนัก" />
              <Column header="ราคา/น้ำหนัก" />
              <Column header="รวม (THB)" />
            </Row>
          </ColumnGroup>

          <Column field="nameDescription">
            <template #body="slotProps">
              <input
                type="text"
                class="form-control"
                :value="slotProps.data.nameDescription"
                readonly
                disabled
              />
            </template>
          </Column>

          <Column field="qty" style="width: 130px">
            <template #body="slotProps">
              <input
                type="text"
                class="form-control text-right"
                :value="formatNumber(slotProps.data.qty)"
                readonly
                disabled
              />
            </template>
          </Column>

          <Column field="qtyPrice" style="width: 110px">
            <template #body="slotProps">
              <input
                type="text"
                class="form-control text-right"
                :value="formatCurrency(slotProps.data.qtyPrice)"
                readonly
                disabled
              />
            </template>
          </Column>

          <Column field="qtyWeight" style="width: 110px">
            <template #body="slotProps">
              <input
                type="text"
                class="form-control text-right"
                :value="formatNumber(slotProps.data.qtyWeight)"
                readonly
                disabled
              />
            </template>
          </Column>

          <Column field="qtyWeightPrice" style="width: 110px">
            <template #body="slotProps">
              <input
                type="text"
                class="form-control text-right"
                :value="formatCurrency(slotProps.data.qtyWeightPrice)"
                readonly
                disabled
              />
            </template>
          </Column>

          <Column field="totalPrice" style="width: 150px">
            <template #body="slotProps">
              <input
                type="text"
                class="form-control text-right"
                :value="formatCurrency(slotProps.data.totalPrice)"
                readonly
                disabled
              />
            </template>
          </Column>

          <template #groupheader="slotProps">
            <div class="flex align-items-center gap-2 type-container">
              <span><i class="bi bi-clipboard2-check mr-2"></i></span>
              <span>{{ getGroupLabel(slotProps.data.nameGroup) }}</span>
            </div>
          </template>

          <ColumnGroup type="footer">
            <Row>
              <Column :colspan="5">
                <template #footer>
                  <div class="text-right type-container">
                    <span>รวมราคาทุกรายการ</span>
                  </div>
                </template>
              </Column>
              <Column :colspan="1">
                <template #footer>
                  <div class="text-right type-container">
                    <span>{{ formatCurrency(totalPrice) }}</span>
                  </div>
                </template>
              </Column>
            </Row>
            <Row v-if="tagPriceMultiplier > 0">
              <Column :colspan="5">
                <template #footer>
                  <div class="text-right type-container tag-price-row">
                    <span>ราคาป้าย (ตัวคูณ x {{ tagPriceMultiplier }})</span>
                  </div>
                </template>
              </Column>
              <Column :colspan="1">
                <template #footer>
                  <div class="text-right type-container tag-price-row">
                    <span>{{ formatCurrency(tagPrice) }}</span>
                  </div>
                </template>
              </Column>
            </Row>
            <Row v-if="hasCurrencyConversion">
              <Column :colspan="5">
                <template #footer>
                  <div class="text-right type-container currency-row">
                    <span>รวม ({{ currencyUnit }})</span>
                  </div>
                </template>
              </Column>
              <Column :colspan="1">
                <template #footer>
                  <div class="text-right type-container currency-row">
                    <span>{{ formatCurrency(totalPriceCurrency) }}</span>
                  </div>
                </template>
              </Column>
            </Row>
            <Row v-if="hasCurrencyConversion && tagPriceMultiplier > 0">
              <Column :colspan="5">
                <template #footer>
                  <div class="text-right type-container currency-row">
                    <span>ราคาป้าย ({{ currencyUnit }})</span>
                  </div>
                </template>
              </Column>
              <Column :colspan="1">
                <template #footer>
                  <div class="text-right type-container currency-row">
                    <span>{{ formatCurrency(tagPriceCurrency) }}</span>
                  </div>
                </template>
              </Column>
            </Row>
          </ColumnGroup>
        </DataTable>
      </div>
    </div>
  </div>
</template>

<script>
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ColumnGroup from 'primevue/columngroup'
import Row from 'primevue/row'
import { formatDecimal } from '@/services/utils/decimal.js'

export default {
  name: 'CostDetailTableView',

  components: {
    DataTable,
    Column,
    ColumnGroup,
    Row
  },

  props: {
    transactions: {
      type: Array,
      default: () => []
    },
    tagPriceMultiplier: {
      type: Number,
      default: 1
    },
    currencyUnit: {
      type: String,
      default: ''
    },
    currencyRate: {
      type: Number,
      default: null
    }
  },

  data() {
    return {
      groupOrder: {
        Gold: 1,
        Gem: 2,
        Worker: 3,
        Embed: 4,
        ETC: 5
      }
    }
  },

  computed: {
    groupedTransactions() {
      if (!this.transactions || !Array.isArray(this.transactions)) return []
      return this.transactions.map((item) => ({
        ...item,
        groupOrder: this.groupOrder[item.nameGroup] || 999
      }))
    },

    totalPrice() {
      if (!this.transactions) return 0
      return this.transactions.reduce((sum, item) => sum + (item.totalPrice || 0), 0)
    },

    tagPrice() {
      return this.totalPrice * this.tagPriceMultiplier
    },

    hasCurrencyConversion() {
      return !!(
        this.currencyUnit &&
        this.currencyRate &&
        this.currencyRate > 0 &&
        this.currencyRate !== 1
      )
    },

    totalPriceCurrency() {
      if (!this.hasCurrencyConversion) return 0
      return this.totalPrice / this.currencyRate
    },

    tagPriceCurrency() {
      if (!this.hasCurrencyConversion) return 0
      return this.tagPrice / this.currencyRate
    }
  },

  methods: {
    getGroupLabel(group) {
      const labels = {
        Gold: 'รายการทอง',
        Gem: 'รายการวัถุดิบ',
        Worker: 'รายการงานช่าง',
        Embed: 'รายการงานฝัง',
        ETC: 'รายการเพิ่มเติม'
      }
      return labels[group] || group
    },

    formatCurrency(value) {
      if (value === null || value === undefined || value === '') return '-'
      return formatDecimal(Number(value), 2)
    },

    formatNumber(value) {
      if (value === null || value === undefined || value === '') return '-'
      return formatDecimal(Number(value), 2)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';

.type-container {
  font-size: 15px;
  font-weight: bold;
  color: var(--base-font-color);
  padding: 5px;

  @media (max-width: 1024px) {
    font-size: 14px;
  }
}

.tag-price-row {
  color: #e65100;
}

.currency-row {
  color: #1565c0;
}

input {
  margin-top: 5px !important;
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
    th[style*='width: 130px'],
    td[style*='width: 130px'] {
      width: 110px !important;
    }

    th[style*='width: 110px'],
    td[style*='width: 110px'] {
      width: 95px !important;
    }

    th[style*='width: 150px'],
    td[style*='width: 150px'] {
      width: 130px !important;
    }
  }
}
</style>
