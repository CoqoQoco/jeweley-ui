<template>
  <div class="mt-3 last-activities-table">
    <SectionCardGeneric
      :title="$t('view.stock.gem.dashboard.lastActivities')"
      icon="bi-clock-history"
      accent="main"
      headerStyle="legend"
    >
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
                rowData.qty ? Number(rowData.qty).toFixed(2) : '0.000'
              }}</span>
            </div>
          </template>

          <template #qtyWeightTemplate="{ data: rowData }">
            <div class="d-flex align-items-center">
              <span><i class="me-1" :class="getTransactionIcon(rowData.type)"></i></span>
              <span class="ml-1">{{
                rowData.qtyWeight ? Number(rowData.qtyWeight).toFixed(3) : '0.000'
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
        </BaseDataTable>
      </div>
      <div v-else class="activities-empty">
        <i class="bi bi-clock-history"></i>
        <p>{{ $t('view.stock.gem.dashboard.noActivities') }}</p>
      </div>
    </SectionCardGeneric>
  </div>
</template>

<script>
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  name: 'LastActivitiesTable',
  components: {
    SectionCardGeneric,
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
      activityTableSkip: 0
    }
  },
  computed: {
    activityColumns() {
      return [
        {
          field: 'createDate',
          header: this.$t('view.stock.gem.dashboard.createDate'),
          sortable: false,
          minWidth: '140px',
          format: 'datetime'
        },
        {
          field: 'code',
          header: this.$t('view.stock.gem.dashboard.gemCode'),
          sortable: false,
          minWidth: '150px',
          template: 'codeTemplate'
        },
        {
          field: 'type',
          header: this.$t('view.stock.gem.dashboard.type'),
          sortable: false,
          minWidth: '80px',
          template: 'typeTemplate'
        },
        {
          field: 'qty',
          header: this.$t('view.stock.gem.dashboard.quantity'),
          sortable: false,
          minWidth: '100px',
          format: 'decimal2',
          template: 'qtyTemplate'
        },
        {
          field: 'qtyWeight',
          header: this.$t('view.stock.gem.dashboard.weight'),
          sortable: false,
          minWidth: '100px',
          format: 'decimal3',
          template: 'qtyWeightTemplate'
        },
        {
          field: 'running',
          header: this.$t('view.stock.gem.dashboard.running'),
          sortable: false,
          minWidth: '120px',
          template: 'runningTemplate'
        },
        {
          field: 'status',
          header: this.$t('view.stock.gem.dashboard.status'),
          sortable: false,
          minWidth: '80px',
          template: 'statusTemplate'
        },
        {
          field: 'createBy',
          header: this.$t('view.stock.gem.dashboard.createBy'),
          sortable: false,
          minWidth: '100px',
          template: 'createByTemplate'
        }
      ]
    },

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
          qtyWeight: activity.qtyWeight,
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
  methods: {
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

.last-activities-table {
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
                border-radius: var(--radius-sm);
              }

              .status-badge {
                font-size: 10px;
                padding: 3px 8px;
                border-radius: var(--radius-lg);
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
</style>
