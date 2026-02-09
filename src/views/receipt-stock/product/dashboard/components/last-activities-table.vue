<template>
  <div class="activities-card">
    <div class="activities-header">
      <h5>รายการสินค้าล่าสุด</h5>
      <div class="activities-count">
        <span class="badge bg-primary">{{ lastActivities.length }}</span>
      </div>
    </div>
    <div class="activities-body">
      <div v-if="lastActivities && lastActivities.length > 0" class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>รหัสสินค้า</th>
              <th>ชื่อสินค้า</th>
              <th>ประเภท</th>
              <th>ทอง/เงิน</th>
              <th>จำนวน</th>
              <th>ราคา</th>
              <th>WO</th>
              <th>วันที่</th>
              <th>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="activity in lastActivities" :key="activity.stockNumber">
              <td>
                <strong>{{ activity.stockNumber }}</strong>
                <br />
                <small class="text-muted">{{ activity.productNumber }}</small>
              </td>
              <td>
                <div>{{ activity.productNameTh }}</div>
                <small class="text-muted">{{ activity.productNameEn }}</small>
              </td>
              <td>{{ activity.productTypeName }}</td>
              <td>
                {{ activity.productionType }}
                <br />
                <small class="text-muted">{{ activity.productionTypeSize }}</small>
              </td>
              <td class="text-end">{{ formatNumber(activity.qty) }}</td>
              <td class="text-end">{{ formatCurrency(activity.productPrice) }}</td>
              <td>
                <small>{{ activity.woText }}</small>
              </td>
              <td>
                <small>{{ formatDateTime(activity.createDate) }}</small>
              </td>
              <td>
                <span
                  class="badge"
                  :class="{
                    'bg-success': activity.status === 'Available',
                    'bg-warning': activity.status !== 'Available'
                  }"
                >
                  {{ activity.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
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

export default {
  name: 'LastActivitiesTable',
  props: {
    lastActivities: {
      type: Array,
      default: () => []
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
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;

  .activities-header {
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

    .activities-count {
      .badge {
        font-size: 12px;
      }
    }
  }

  .activities-body {
    padding: 20px;

    .table {
      margin: 0;
      font-size: 13px;

      thead {
        th {
          background-color: #f8f9fa;
          color: $base-font-color;
          font-weight: 600;
          border-bottom: 2px solid $base-color;
          padding: 12px;
        }
      }

      tbody {
        tr {
          &:hover {
            background-color: #f8f9fa;
          }

          td {
            padding: 12px;
            vertical-align: middle;
          }
        }
      }
    }

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
