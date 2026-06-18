<template>
  <div class="filter-container mt-2">
    <!-- Stock Information Section -->
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
          :value="stockData.stockNumber || stockData.stockNumberOrigin"
          readonly
          disabled
        />
      </div>
      <div>
        <span class="title-text">{{ $t('view.sale.costStock.productCode') }}</span>
        <input
          class="form-control form-control-sm"
          type="text"
          :value="stockData.productNumber"
          readonly
          disabled
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.sale.costStock.description') }}</span>
        <input
          class="form-control form-control-sm"
          type="text"
          :value="stockData.description"
          readonly
          disabled
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.sale.costStock.mold') }}</span>
        <input
          class="form-control form-control-sm"
          type="text"
          :value="stockData.mold || '-'"
          readonly
          disabled
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.sale.costStock.woNumber') }}</span>
        <input
          class="form-control form-control-sm"
          type="text"
          :value="stockData.wo && stockData.woNumber ? `${stockData.wo}${stockData.woNumber}` : (stockData.wo || '-')"
          readonly
          disabled
        />
      </div>
    </div>

    <!-- Plan Information (Only show when planRunning exists) -->
    <template v-if="stockData.planRunning">
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
              {{ stockData.planRunning }}
            </div>
          </div>
          <div>
            <span class="title-text">{{ $t('view.sale.costStock.planCreateDate') }}</span>
            <div class="plan-display-field">
              {{ formatDate(stockData.planCreateDate) }}
            </div>
          </div>
          <div>
            <span class="title-text">{{ $t('view.sale.costStock.planCreateBy') }}</span>
            <div class="plan-display-field">
              {{ stockData.planCreateBy }}
            </div>
          </div>
          <div></div>
        </div>
      </div>
    </template>

    <!-- Plan Cost Button — always visible -->
    <div class="mt-3 responsive-btn-group">
      <button
        class="btn btn-sm btn-main"
        type="button"
        @click="$emit('view-plan-cost')"
      >
        <i class="bi bi-graph-up mr-1"></i>
        <span>{{ $t('view.sale.costStock.viewPlanCost') }}</span>
      </button>
      <button
        class="btn btn-sm btn-main"
        type="button"
        @click="$emit('check-gold-price')"
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
      v-for="(item, index) in customStockInfo"
      :key="index"
      class="custom-info-row mb-2"
    >
      <input
        class="form-control form-control-sm custom-info-label"
        type="text"
        :value="item.label"
        :placeholder="$t('view.sale.costStock.placeholder.appraisalTitle')"
        @input="onCustomLabelInput(index, $event.target.value)"
      />
      <input
        class="form-control form-control-sm custom-info-value"
        type="text"
        :value="item.value"
        :placeholder="$t('view.sale.costStock.placeholder.appraisalValue')"
        @input="onCustomValueInput(index, $event.target.value)"
      />
      <button
        class="btn btn-sm btn-red"
        type="button"
        @click="$emit('remove-custom-info', index)"
      >
        <i class="bi bi-trash"></i>
      </button>
    </div>

    <button class="btn btn-sm btn-main mt-1" type="button" @click="$emit('add-custom-info')">
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
        @click="$emit('search-customer')"
        :title="$t('view.sale.costStock.searchCustomer')"
      >
        <i class="bi bi-search mr-1"></i>
        <span>{{ $t('view.sale.costStock.searchCustomer') }}</span>
      </button>
      <button
        class="btn btn-sm btn-main"
        type="button"
        @click="$emit('create-customer')"
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
            {{ stockData.customerName || '-' }}
          </div>
        </div>
        <div>
          <span class="title-text">{{ $t('view.sale.costStock.customerAddress') }}</span>
          <div class="customer-display-field">
            {{ stockData.customerAddress || '-' }}
          </div>
        </div>
        <div>
          <span class="title-text">{{ $t('common.field.phone') }}</span>
          <div class="customer-display-field">
            {{ stockData.customerPhone || '-' }}
          </div>
        </div>
        <div>
          <span class="title-text">{{ $t('common.field.email') }}</span>
          <div class="customer-display-field">
            {{ stockData.customerEmail || '-' }}
          </div>
        </div>
      </div>
      <div class="form-col-sm-container mt-2">
        <div>
          <span class="title-text">{{ $t('common.field.remark') }}</span>
          <textarea
            class="form-control form-control-sm"
            :value="stockData.remark"
            :placeholder="$t('view.sale.costStock.placeholder.remark')"
            rows="2"
            autocomplete="off"
            @input="$emit('update:remark', $event.target.value)"
          ></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { formatDate } from '@/services/utils/dayjs.js'

export default {
  name: 'AppraisalStockInfo',

  setup() {
    return { formatDate }
  },

  props: {
    stockData: {
      type: Object,
      default: () => ({})
    },
    customStockInfo: {
      type: Array,
      default: () => []
    },
    isShowPlanCostBtn: {
      type: Boolean,
      default: false
    }
  },

  emits: [
    'view-plan-cost',
    'check-gold-price',
    'add-custom-info',
    'remove-custom-info',
    'update:customStockInfo',
    'search-customer',
    'create-customer',
    'update:remark'
  ],

  methods: {
    onCustomLabelInput(index, value) {
      const updated = this.customStockInfo.map((item, i) =>
        i === index ? { ...item, label: value } : item
      )
      this.$emit('update:customStockInfo', updated)
    },

    onCustomValueInput(index, value) {
      const updated = this.customStockInfo.map((item, i) =>
        i === index ? { ...item, value: value } : item
      )
      this.$emit('update:customStockInfo', updated)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';

input {
  margin-top: 5px !important;
}

textarea {
  margin-top: 5px !important;
  resize: vertical;
}

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
</style>
