<template>
  <div class="summary-card mt-3">
    <div class="summary-header">
      <h5>{{ $t('view.stock.gem.dashboard.lastActivities') }}</h5>
      <div class="activities-count">
        <span class="badge bg-primary">{{ lastActivities.length }}</span>
      </div>
    </div>
    <div class="summary-body">
      <div v-if="lastActivities.length > 0" class="activity-table-container">
        <BaseDataTable
          :items="activityTableDataFormatted.data"
          :totalRecords="activityTableDataFormatted.total"
          dataKey="id"
          :columns="activityColumns"
          :perPage="activityTableTake"
          @page="handleActivityPageChange"
          @sort="handleActivitySortChange"
          :paginator="false"
          scrollHeight="400px"
        >
          <template #typeTemplate="{ data: rowData }">
            <div class="d-flex align-items-center">
              <span><i class="me-1" :class="getTransactionIcon(rowData.type)"></i></span>
              <span class="text-truncate ml-1">{{ rowData.typeName }}</span>
            </div>
          </template>

          <template #qtyTemplate="{ data: rowData }">
            <div class="d-flex align-items-center">
              <span><i class="me-1" :class="getTransactionIcon(rowData.type)"></i></span>
              <span class="ml-1">{{
                rowData.qty ? Number(rowData.qty).toFixed(3).toLocaleString() : '0.000'
              }}</span>
            </div>
          </template>

          <template #codeTemplate="{ data: rowData }">
            <div class="gem-info">
              <div class="gem-code fw-bold">{{ rowData.code }}</div>
              <small class="text-muted">{{ rowData.groupName }}</small>
            </div>
          </template>

          <template #statusTemplate="{ data: rowData }">
            <span class="status-badge" :class="getStatusClass(rowData.status)">
              {{ rowData.status }}
            </span>
          </template>

          <template #createByTemplate="{ data: rowData }">
            <div class="user-info">
              <div v-if="rowData.createBy" class="create-by">{{ rowData.createBy }}</div>
              <small v-if="rowData.updateBy" class="text-muted">
                {{ $t('view.stock.gem.dashboard.updateBy') }}: {{ rowData.updateBy }}
              </small>
            </div>
          </template>

          <template #runningTemplate="{ data: rowData }">
            <span class="running-number">{{ rowData.running }}</span>
          </template>

          <template #jobOrPoTemplate="{ data: rowData }">
            <span v-if="rowData.jobOrPo" class="job-po">{{ rowData.jobOrPo }}</span>
            <span v-else class="text-muted">-</span>
          </template>
        </BaseDataTable>
      </div>
      <div v-else class="activities-empty">
        <i class="bi bi-clock-history"></i>
        <p>{{ $t('view.stock.gem.dashboard.noActivities') }}</p>
      </div>
    </div>
  </div>
</template>

<script>
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
  data() {
    return {
      activityTableTake: 10,
      activityTableSkip: 0,
      activityColumns: [
        {
          field: 'createDate',
          header: 'Create Date',
          sortable: false,
          minWidth: '140px',
          format: 'datetime'
        },
        {
          field: 'code',
          header: 'Gem Code',
          sortable: false,
          minWidth: '150px',
          template: 'codeTemplate'
        },
        {
          field: 'type',
          header: 'Type',
          sortable: false,
          minWidth: '80px',
          template: 'typeTemplate'
        },
        {
          field: 'qty',
          header: 'Quantity',
          sortable: false,
          minWidth: '100px',
          format: 'decimal3',
          template: 'qtyTemplate'
        },
        {
          field: 'running',
          header: 'Running No.',
          sortable: false,
          minWidth: '120px',
          template: 'runningTemplate'
        },
        // {
        //   field: 'jobOrPo',
        //   header: 'Job/PO',
        //   sortable: false,
        //   minWidth: '100px',
        //   template: 'jobOrPoTemplate'
        // },
        {
          field: 'status',
          header: 'Status',
          sortable: false,
          minWidth: '80px',
          template: 'statusTemplate'
        },
        {
          field: 'createBy',
          header: 'Created By',
          sortable: false,
          minWidth: '100px',
          template: 'createByTemplate'
        }
      ]
    }
  },
  computed: {
    // Activity table data formatted for BaseDataTable
    activityTableDataFormatted() {
      const activities = this.lastActivities || []
      return {
        data: activities.map((activity, index) => ({
          id: activity.running || index,
          createDate: activity.createDate,
          code: activity.code,
          groupName: activity.groupName,
          shape: activity.shape,
          grade: activity.grade,
          size: activity.size,
          type: activity.type,
          typeName: activity.typeName,
          qty: activity.qty,
          running: activity.running,
          jobOrPo: activity.jobOrPo,
          status: activity.status,
          createBy: activity.createBy,
          updateBy: activity.updateBy
        })),
        total: activities.length
      }
    }
  },
  mounted() {
    // Update column headers with translations
    this.updateColumnHeaders()
  },
  methods: {
    updateColumnHeaders() {
      this.activityColumns.forEach((column) => {
        switch (column.field) {
          case 'createDate':
            column.header = this.$t('view.stock.gem.dashboard.createDate')
            break
          case 'code':
            column.header = this.$t('view.stock.gem.dashboard.gemCode')
            break
          case 'type':
            column.header = this.$t('view.stock.gem.dashboard.type')
            break
          case 'qty':
            column.header = this.$t('view.stock.gem.dashboard.quantity')
            break
          case 'running':
            column.header = this.$t('view.stock.gem.dashboard.running')
            break
          case 'jobOrPo':
            column.header = this.$t('view.stock.gem.dashboard.jobOrPo')
            break
          case 'status':
            column.header = this.$t('view.stock.gem.dashboard.status')
            break
          case 'createBy':
            column.header = this.$t('view.stock.gem.dashboard.createBy')
            break
        }
      })
    },

    // Activity table handlers
    handleActivityPageChange(e) {
      this.activityTableSkip = e.first
      this.activityTableTake = e.rows
    },

    handleActivitySortChange(e) {
      this.activityTableSkip = e.first
      this.activityTableTake = e.rows
    },

    getTransactionIcon(type) {
      switch (type) {
        case 1:
        case 2:
        case 3:
        case 6:
          return 'bi bi-arrow-down-square-fill text-success'
        case 4:
        case 7:
          return 'bi bi-arrow-up-square-fill text-danger'
        case 5:
          return 'bi bi-arrow-right-square-fill text-secondary'
        default:
          return ''
      }
    },

    getStatusClass(status) {
      if (!status) return ''
      const statusLower = status.toLowerCase()
      if (
        statusLower.includes('success') ||
        statusLower.includes('completed') ||
        statusLower.includes('สำเร็จ')
      ) {
        return 'badge bg-success'
      } else if (statusLower.includes('pending') || statusLower.includes('รอ')) {
        return 'badge bg-warning'
      } else if (
        statusLower.includes('error') ||
        statusLower.includes('failed') ||
        statusLower.includes('ผิดพลาด')
      ) {
        return 'badge bg-danger'
      } else {
        return 'badge bg-secondary'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/variable.scss';

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

    .activities-count {
      .badge {
        font-size: 12px;
      }
    }
  }

  .summary-body {
    padding: 20px;

    .activity-table-container {
      // Custom styling for BaseDataTable
      :deep(.base-datatable) {
        .p-datatable {
          .p-datatable-tbody {
            tr {
              td {
                padding: 8px 12px;
                font-size: 12px;

                .gem-info {
                  .gem-code {
                    font-weight: 600;
                    color: $base-font-color;
                    font-size: 13px;
                  }
                }

                .running-number {
                  font-family: monospace;
                  font-size: 11px;
                  background: #e9ecef;
                  padding: 2px 6px;
                  border-radius: 3px;
                }

                .job-po {
                  font-size: 11px;
                  color: $base-sub-color;
                }

                .status-badge {
                  font-size: 10px;
                  padding: 3px 8px;
                  border-radius: 12px;
                  font-weight: 600;
                  text-transform: uppercase;
                }

                .user-info {
                  .create-by {
                    font-weight: 500;
                    color: $base-font-color;
                    font-size: 11px;
                  }

                  small {
                    font-size: 10px;
                    line-height: 1.2;
                  }
                }
              }
            }
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
