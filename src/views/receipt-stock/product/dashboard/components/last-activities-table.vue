<template>
  <div class="activities-card">
    <div class="activities-header">
      <h5>{{ $t('view.stock.product.dashboard.lastActivitiesTitle') }}</h5>
      <div class="activities-header-actions">
        <span class="badge bg-primary">{{ lastActivities.length }}</span>
        <ButtonGeneric
          variant="green"
          icon="bi-file-earmark-excel"
          class="ml-2"
          :title="$t('common.btn.export')"
          @click="onExportExcel"
        />
      </div>
    </div>
    <div class="activities-body">
      <div v-if="lastActivities && lastActivities.length > 0">
        <BaseDataTable
          :items="lastActivities"
          :totalRecords="lastActivities.length"
          :columns="columns"
          :paginator="false"
          dataKey="stockNumber"
          scrollHeight="400px"
        >
          <template #stockNumberTemplate="{ data }">
            <div>
              <strong>{{ data.stockNumber }}</strong>
              <br />
              <small class="text-muted">{{ data.productNumber }}</small>
            </div>
          </template>
          <template #productNameThTemplate="{ data }">
            <div>
              <div>{{ data.productNameTh }}</div>
              <small class="text-muted">{{ data.productNameEn }}</small>
            </div>
          </template>
          <template #productionTypeTemplate="{ data }">
            <div>
              {{ data.productionType }}
              <br />
              <small class="text-muted">{{ data.productionTypeSize }}</small>
            </div>
          </template>
          <template #qtyTemplate="{ data }">
            {{ formatNumber(data.qty) }}
          </template>
          <template #productPriceTemplate="{ data }">
            {{ formatCurrency(data.productPrice) }}
          </template>
          <template #woTextTemplate="{ data }">
            <small>{{ data.woText }}</small>
          </template>
          <template #createDateTemplate="{ data }">
            <small>{{ formatDateTime(data.createDate) }}</small>
          </template>
          <template #statusTemplate="{ data }">
            <span
              class="badge"
              :class="{
                'bg-success': data.status === 'Available',
                'bg-warning': data.status !== 'Available'
              }"
            >
              {{ data.status }}
            </span>
          </template>
        </BaseDataTable>
      </div>
      <div v-else class="activities-empty">
        <i class="bi bi-inbox"></i>
        <p>{{ $t('view.stock.product.dashboard.noActivities') }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'

import { formatDate } from '@/services/utils/dayjs.js'
import { ExcelHelper } from '@/services/utils/excel-js.js'
import { warning } from '@/services/alert/sweetAlerts.js'

import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

export default {
  name: 'LastActivitiesTable',

  components: {
    BaseDataTable,
    ButtonGeneric
  },

  props: {
    lastActivities: {
      type: Array,
      default: () => []
    }
  },

  computed: {
    columns() {
      return [
        { field: 'stockNumber', header: this.$t('view.stock.product.dashboard.colStockNumber'), minWidth: '120px', sortable: false },
        { field: 'productNameTh', header: this.$t('view.stock.product.dashboard.colProductName'), minWidth: '150px', sortable: false },
        { field: 'productTypeName', header: this.$t('view.stock.product.dashboard.colProductType'), minWidth: '100px', sortable: false },
        { field: 'productionType', header: this.$t('view.stock.product.dashboard.colProductionType'), minWidth: '110px', sortable: false },
        { field: 'qty', header: this.$t('view.stock.product.dashboard.colQty'), minWidth: '80px', align: 'right', sortable: false },
        { field: 'productPrice', header: this.$t('view.stock.product.dashboard.colPrice'), minWidth: '100px', align: 'right', sortable: false },
        { field: 'woText', header: this.$t('view.stock.product.dashboard.colWo'), minWidth: '100px', sortable: false },
        { field: 'createDate', header: this.$t('view.stock.product.dashboard.colDate'), minWidth: '120px', sortable: false },
        { field: 'status', header: this.$t('view.stock.product.dashboard.colStatus'), minWidth: '90px', sortable: false }
      ]
    }
  },

  methods: {
    formatNumber(value) {
      if (!value) return '0'
      return new Intl.NumberFormat('en-US').format(value)
    },
    formatCurrency(value) {
      if (!value) return '฿0'
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value)
    },
    formatDateTime(date) {
      return dayjs(date).format('DD/MM/YYYY HH:mm')
    },
    onExportExcel() {
      if (!this.lastActivities || this.lastActivities.length === 0) {
        warning(this.$t('view.stock.product.dashboard.noActivities'))
        return
      }

      const dataExcel = this.lastActivities.map((item) => ({
        stockNumber: item.stockNumber,
        productNameTh: item.productNameTh,
        productTypeName: item.productTypeName,
        productionType: item.productionType,
        qty: item.qty,
        productPrice: item.productPrice,
        woText: item.woText,
        createDate: this.formatDateTime(item.createDate),
        status: item.status
      }))

      ExcelHelper.exportToExcel(dataExcel, {
        filename: `${this.$t('view.stock.product.dashboard.exportFileName')}[${formatDate(new Date())}].xlsx`,
        sheetName: this.$t('view.stock.product.dashboard.exportFileName'),
        columns: [
          { header: this.$t('view.stock.product.dashboard.colStockNumber'), key: 'stockNumber' },
          { header: this.$t('view.stock.product.dashboard.colProductName'), key: 'productNameTh' },
          { header: this.$t('view.stock.product.dashboard.colProductType'), key: 'productTypeName' },
          { header: this.$t('view.stock.product.dashboard.colProductionType'), key: 'productionType' },
          { header: this.$t('view.stock.product.dashboard.colQty'), key: 'qty' },
          { header: this.$t('view.stock.product.dashboard.colPrice'), key: 'productPrice' },
          { header: this.$t('view.stock.product.dashboard.colWo'), key: 'woText' },
          { header: this.$t('view.stock.product.dashboard.colDate'), key: 'createDate' },
          { header: this.$t('view.stock.product.dashboard.colStatus'), key: 'status' }
        ]
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/variable.scss';

.activities-card {
  background: white;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  overflow: hidden;

  .activities-header {
    padding: var(--sp-xl);
    border-bottom: 1px solid var(--color-border);
    display: flex;
    justify-content: space-between;
    align-items: center;

    h5 {
      color: var(--base-font-color);
      font-weight: bold;
      margin: 0;
    }

    .activities-header-actions {
      display: flex;
      align-items: center;

      .badge {
        font-size: 12px;
      }
    }
  }

  .activities-body {
    padding: var(--sp-xl);

    .activities-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      color: $base-sub-color;

      i {
        font-size: 48px;
        margin-bottom: 15px;
      }
    }
  }
}
</style>
