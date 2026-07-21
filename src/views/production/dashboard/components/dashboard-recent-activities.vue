<template>
  <div class="dashboard-recent-activities">
    <!-- Recent Activities -->
    <div class="activities-card">
      <div class="activities-header">
        <h5>{{ $t('view.production.dashboard.recentActivities') }}</h5>
        <!-- <div class="activities-count">
          <span class="badge bg-primary">{{ recentActivities.length }}</span>
        </div> -->
      </div>
      <div class="activities-body">
        <BaseDataTable
          :items="recentActivities || []"
          :columns="recentActivitiesColumns"
          :totalRecords="recentActivities ? recentActivities.length : 0"
          :perPage="10"
          :pagingEnabled="true"
          :paginator="false"
          :emptyMessage="$t('view.production.dashboard.noRecentActivities')"
        >
          <template #typeTemplate="slotProps">
            <div class="activity-type-cell">
              <i :class="getActivityIcon(slotProps.data.type)"></i>
            </div>
          </template>
          <template #titleTemplate="slotProps">
            <div class="activity-title-cell">
              <strong>{{ slotProps.data.title }}</strong>
              <br>
              <small class="text-muted">{{ slotProps.data.description }}</small>
            </div>
          </template>
          <template #detailsTemplate="slotProps">
            <div class="activity-details-cell" v-if="slotProps.data.rawData">
              <div class="detail-item">
                <strong>{{ $t('view.production.dashboard.workOrder') }}:</strong> {{ slotProps.data.rawData.woText }}
              </div>
              <div class="detail-item">
                <strong>{{ $t('view.production.dashboard.product') }}:</strong> 
                {{ slotProps.data.rawData.productName }} ({{ slotProps.data.rawData.productNumber }})
              </div>
              <div class="detail-item">
                <strong>{{ $t('view.production.dashboard.customer') }}:</strong> {{ slotProps.data.rawData.customerName }}
              </div>
              <div class="detail-item">
                <strong>{{ $t('view.production.dashboard.status') }}:</strong>
                <span
                  class="status-badge"
                  :class="getStatusClass(slotProps.data.rawData.status)"
                >
                  {{ slotProps.data.rawData.statusName }}
                </span>
              </div>
              <div class="detail-item" v-if="slotProps.data.rawData.gold">
                <strong>{{ $t('view.production.dashboard.goldType') }}:</strong>
                {{ slotProps.data.rawData.gold }} ({{ slotProps.data.rawData.goldSize }})
              </div>
              <div class="detail-item">
                <strong>{{ $t('view.production.dashboard.updatedBy') }}:</strong> {{ slotProps.data.rawData.updateBy }}
              </div>
            </div>
          </template>
          <template #actionsTemplate="slotProps">
            <div class="activity-actions-cell">
              <router-link
                :to="`/plan-order-tracking-update/${slotProps.data.rawData?.id || ''}`"
                class="btn btn-sm btn-green"
                v-if="slotProps.data.rawData?.id"
              >
                <i class="bi bi-eye"></i>
                {{ $t('view.production.dashboard.viewDetails') }}
              </router-link>
            </div>
          </template>
        </BaseDataTable>
      </div>
    </div>
  </div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  name: 'DashboardRecentActivities',
  components: {
    BaseDataTable
  },
  props: {
    recentActivities: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    recentActivitiesColumns() {
      return [
        {
          field: 'type',
          header: this.$t('view.production.dashboard.colType'),
          sortable: false,
          width: '60px',
          align: 'center'
        },
        {
          field: 'title',
          header: this.$t('view.production.dashboard.colActivity'),
          sortable: false,
          width: '250px'
        },
        {
          field: 'date',
          header: this.$t('view.production.dashboard.colDate'),
          sortable: false,
          format: 'datetime',
          width: '150px',
          align: 'center'
        },
        {
          field: 'details',
          header: this.$t('view.production.dashboard.colDetail'),
          sortable: false,
          width: '300px'
        },
        {
          field: 'actions',
          header: '',
          sortable: false,
          width: '100px',
          align: 'center'
        }
      ]
    }
  },
  methods: {
    getActivityIcon(type) {
      switch (type) {
        case 'create':
          return 'bi bi-plus-circle text-success'
        case 'update':
          return 'bi bi-pencil-square text-warning'
        case 'complete':
          return 'bi bi-check-circle text-success'
        default:
          return 'bi bi-info-circle text-warning'
      }
    },

    getStatusClass(status) {
      if (status === 100) return 'status-completed'
      if (status >= 50 && status < 100) return 'status-progress'
      if (status === 10) return 'status-design'
      if (status === 500) return 'status-melt'
      return 'status-progress'
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/variable.scss';

.dashboard-recent-activities {
  .activities-card {
    background: var(--color-card-bg);
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
      padding: var(--sp-xl);
    }
  }

  // Activity DataTable Styles
  :deep(.activity-type-cell) {
    display: flex;
    align-items: center;
    justify-content: center;
    
    i {
      font-size: 18px;
    }
  }

  :deep(.activity-title-cell) {
    strong {
      color: $base-font-color;
      font-size: 15px;
    }
    
    small {
      font-size: 13px;
      color: $base-sub-color;
    }
  }

  :deep(.activity-details-cell) {
    .detail-item {
      margin-bottom: 6px;
      font-size: 12px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      strong {
        color: $base-sub-color;
        font-weight: 600;
        margin-right: 5px;
      }
      
      .status-badge {
        padding: 2px 6px;
        border-radius: 10px;
        font-weight: bold;
        font-size: 11px;
        margin-left: 5px;
        
        &.status-completed {
          background: var(--base-green);
          color: #ffffff;
        }
        
        &.status-progress {
          background: #ffc21b;
          color: $base-font-color;
        }
        
        &.status-design {
          background: #dad4b5;
          color: $base-font-color;
        }
        
        &.status-pending {
          background: lighten($base-sub-color, 40%);
          color: $base-sub-color;
        }
        
        &.status-melt {
          background: var(--base-red);
          color: #ffffff;
        }
      }
    }
  }

  :deep(.activity-actions-cell) {
    display: flex;
    justify-content: center;
    
    .btn {
      font-size: 11px;
      padding: 4px 8px;
    }
  }
}
</style>