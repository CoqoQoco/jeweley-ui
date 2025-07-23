<template>
  <div class="dashboard-summary-tables">
    <!-- Product Type Summary -->
    <div class="summary-card mt-3">
      <div class="summary-header">
        <h5>{{ $t('view.production.dashboard.productTypeSummary') }}</h5>
      </div>
      <div class="summary-body">
        <BaseDataTable
          :items="productTypeSummary || []"
          :columns="productTypeColumns"
          :totalRecords="productTypeSummary ? productTypeSummary.length : 0"
          :perPage="productTypeSummary ? productTypeSummary.length : 10"
          :pagingEnabled="false"
          :paginator="false"
        />
        <div
          v-if="!productTypeSummary || productTypeSummary.length === 0"
          class="summary-empty"
        >
          <i class="bi bi-box"></i>
          <p>{{ $t('view.production.dashboard.noProductData') }}</p>
        </div>
      </div>
    </div>

    <!-- Customer Type Summary -->
    <div class="summary-card mt-3">
      <div class="summary-header">
        <h5>{{ $t('view.production.dashboard.customerTypeSummary') }}</h5>
      </div>
      <div class="summary-body">
        <BaseDataTable
          :items="customerTypeSummary || []"
          :columns="customerTypeColumns"
          :totalRecords="customerTypeSummary ? customerTypeSummary.length : 0"
          :perPage="customerTypeSummary ? customerTypeSummary.length : 10"
          :pagingEnabled="false"
          :paginator="false"
        />
        <div
          v-if="!customerTypeSummary || customerTypeSummary.length === 0"
          class="summary-empty"
        >
          <i class="bi bi-people"></i>
          <p>{{ $t('view.production.dashboard.noCustomerData') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  name: 'DashboardSummaryTables',
  components: {
    BaseDataTable
  },
  props: {
    productTypeSummary: {
      type: Array,
      default: () => []
    },
    customerTypeSummary: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      productTypeColumns: [
        {
          field: 'productTypeName',
          header: 'ประเภทสินค้า',
          sortable: false,
          width: '2fr'
        },
        {
          field: 'count',
          header: 'จำนวนคำสั่ง',
          sortable: false,
          align: 'center',
          width: '1fr'
        },
        {
          field: 'totalQty',
          header: 'จำนวนชิ้น',
          sortable: false,
          align: 'center',
          width: '1fr'
        }
      ],
      customerTypeColumns: [
        {
          field: 'customerTypeName',
          header: 'ประเภทลูกค้า',
          sortable: false,
          width: '2fr'
        },
        {
          field: 'count',
          header: 'จำนวนคำสั่ง',
          sortable: false,
          align: 'center',
          width: '1fr'
        },
        {
          field: 'totalQty',
          header: 'จำนวนชิ้น',
          sortable: false,
          align: 'center',
          width: '1fr'
        }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/variable.scss';

.dashboard-summary-tables {
  .summary-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow: hidden;

    .summary-header {
      padding: 20px;
      border-bottom: 1px solid $base-color;
      display: flex;
      justify-content: space-between;
      align-items: center;

      h5 {
        color: $base-font-color;
        font-weight: bold;
        margin: 0;
      }
    }

    .summary-body {
      padding: 20px;

      .summary-empty {
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
}
</style>