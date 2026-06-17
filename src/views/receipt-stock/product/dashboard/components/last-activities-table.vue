<template>
  <div class="activities-card">
    <div class="activities-header">
      <h5>รายการสินค้าล่าสุด</h5>
      <div class="activities-count">
        <span class="badge bg-primary">{{ lastActivities.length }}</span>
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
        <p>ไม่มีรายการสินค้า</p>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  name: 'LastActivitiesTable',

  components: {
    BaseDataTable
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
        { field: 'stockNumber', header: 'รหัสสินค้า', minWidth: '120px', sortable: false },
        { field: 'productNameTh', header: 'ชื่อสินค้า', minWidth: '150px', sortable: false },
        { field: 'productTypeName', header: 'ประเภท', minWidth: '100px', sortable: false },
        { field: 'productionType', header: 'ทอง/เงิน', minWidth: '110px', sortable: false },
        { field: 'qty', header: 'จำนวน', minWidth: '80px', align: 'right', sortable: false },
        { field: 'productPrice', header: 'ราคา', minWidth: '100px', align: 'right', sortable: false },
        { field: 'woText', header: 'WO', minWidth: '100px', sortable: false },
        { field: 'createDate', header: 'วันที่', minWidth: '120px', sortable: false },
        { field: 'status', header: 'สถานะ', minWidth: '90px', sortable: false }
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

    .activities-count {
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
