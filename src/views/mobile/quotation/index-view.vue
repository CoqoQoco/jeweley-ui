<template>
  <div class="mobile-quotation-view">
    <!-- Date Filter -->
    <div class="mobile-container mobile-mt-1">
      <div class="date-filter">
        <label class="date-label">
          <i class="bi bi-calendar3"></i>
          วันที่ใบเสนอราคา
        </label>
        <input
          type="date"
          class="form-control"
          v-model="filterDate"
          @change="onDateChange"
        />
      </div>
    </div>

    <!-- Quotation List -->
    <div class="mobile-container mobile-mt-1">
      <div v-if="quotationList.length > 0" class="card-list">
        <div
          v-for="item in quotationList"
          :key="item.number"
          class="list-card"
          @click="viewDetail(item)"
        >
          <div class="list-card-header">
            <span class="card-number">{{ item.number }}</span>
            <span v-if="item.currency" class="card-currency-badge">
              {{ item.currency }}
            </span>
          </div>
          <div class="list-card-body">
            <div class="card-customer">
              <i class="bi bi-person"></i>
              <span>{{ item.customerName || 'ไม่ระบุลูกค้า' }}</span>
            </div>
            <div class="card-info-row">
              <div class="card-date">
                <i class="bi bi-calendar3"></i>
                <span>{{ formatDate(item.date) }}</span>
              </div>
            </div>
          </div>
        </div>

        <button
          v-if="hasMore"
          class="mobile-btn mobile-btn-outline mobile-mt-2"
          @click="loadMore"
        >
          <i class="bi bi-arrow-down-circle"></i>
          โหลดเพิ่มเติม
        </button>
      </div>

      <div v-else class="mobile-empty-state">
        <i class="bi bi-file-earmark-text"></i>
        <div class="empty-title">ไม่มีใบเสนอราคา</div>
        <div class="empty-subtitle">ไม่พบใบเสนอราคาในวันที่เลือก</div>
      </div>
    </div>
  </div>
</template>

<script>
import { usrQuotationApiStore } from '@/stores/modules/api/sale/quotation-store.js'
import { formatISOString } from '@/services/utils/dayjs.js'
import dayjs from 'dayjs'

export default {
  name: 'MobileQuotationIndexView',

  setup() {
    const quotationStore = usrQuotationApiStore()
    return { quotationStore }
  },

  data() {
    return {
      filterDate: dayjs().format('YYYY-MM-DD'),
      pageSize: 20,
      quotationList: [],
      page: 0,
      hasMore: false
    }
  },

  mounted() {
    this.loadList()
  },

  methods: {
    onDateChange() {
      this.loadList()
    },

    async loadList() {
      this.page = 0
      this.quotationList = []

      const result = await this.quotationStore.fetchList({
        take: this.pageSize,
        skip: 0,
        sort: [{ field: 'date', dir: 'desc' }],
        formValue: {
          quotationDateStart: formatISOString(this.filterDate),
          quotationDateEnd: formatISOString(this.filterDate)
        }
      })

      if (result && result.data) {
        this.quotationList = result.data
        this.hasMore = result.data.length >= this.pageSize
      }
    },

    async loadMore() {
      this.page++

      const result = await this.quotationStore.fetchList({
        take: this.pageSize,
        skip: this.page * this.pageSize,
        sort: [{ field: 'date', dir: 'desc' }],
        formValue: {
          quotationDateStart: formatISOString(this.filterDate),
          quotationDateEnd: formatISOString(this.filterDate)
        }
      })

      if (result && result.data) {
        this.quotationList.push(...result.data)
        this.hasMore = result.data.length >= this.pageSize
      }
    },

    viewDetail(item) {
      this.$router.push({
        name: 'mobile-quotation-detail',
        params: { number: item.number }
      })
    },

    formatDate(dateString) {
      if (!dateString) return '-'
      return dayjs(dateString).format('DD/MM/YYYY')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/mobile';

.mobile-quotation-view {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px));
}

.date-filter {
  background: white;
  border-radius: 12px;
  padding: 12px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  .date-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.85rem;
    font-weight: 500;
    color: #666;
    margin-bottom: 8px;

    i {
      font-size: 0.9rem;
    }
  }

  .form-control {
    width: 100%;
    border-radius: 8px;
  }
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.list-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.99);
  }

  .list-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #f0f0f0;

    .card-number {
      font-weight: 600;
      color: var(--base-font-color);
      font-size: 0.95rem;
    }

    .card-currency-badge {
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 0.75rem;
      color: white;
      font-weight: 500;
      background: #2196f3;
    }
  }

  .list-card-body {
    padding: 12px 16px;

    .card-customer {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.9rem;
      color: #333;
      margin-bottom: 8px;

      i {
        color: #666;
      }
    }

    .card-info-row {
      display: flex;
      justify-content: space-between;

      .card-date {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 0.8rem;
        color: #666;

        i {
          font-size: 0.85rem;
        }
      }
    }
  }
}

.mobile-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  text-align: center;

  i {
    font-size: 4rem;
    color: #ddd;
    margin-bottom: 16px;
  }

  .empty-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #666;
    margin-bottom: 4px;
  }

  .empty-subtitle {
    font-size: 0.85rem;
    color: #999;
  }
}
</style>
