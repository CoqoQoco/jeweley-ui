<template>
  <div class="mobile-tasks-view">
    <!-- Header -->
    <div class="tasks-header">
      <div class="mobile-container">
        <h2 class="mobile-title">งานของฉัน</h2>
        <p class="header-subtitle">รายการงานทั้งหมด</p>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="mobile-container mobile-mt-2">
      <div class="filter-tabs">
        <div
          v-for="tab in filterTabs"
          :key="tab.value"
          class="filter-tab"
          :class="{ active: activeFilter === tab.value }"
          @click="changeFilter(tab.value)"
        >
          {{ tab.label }}
          <span v-if="tab.count !== null" class="tab-count">{{ tab.count }}</span>
        </div>
      </div>
    </div>

    <!-- Jobs List -->
    <div class="mobile-container mobile-mt-2">
      <!-- Loading State -->
      <div v-if="isLoading" class="mobile-loading">
        <div class="spinner"></div>
        <div class="loading-text">กำลังโหลด...</div>
      </div>

      <!-- Jobs List -->
      <div v-else-if="myJobs.length > 0" class="mobile-list">
        <div
          v-for="job in myJobs"
          :key="job.id"
          class="mobile-list-item mobile-list-item-clickable"
          @click="viewJobDetail(job)"
        >
          <div class="list-icon" :style="{ background: getStatusColor(job.statusId) + '20' }">
            <i class="bi bi-briefcase" :style="{ color: getStatusColor(job.statusId) }"></i>
          </div>
          <div class="list-content">
            <div class="list-title">{{ getJobTypeNameTh(job.jobTypeId) }}</div>
            <div class="list-subtitle">{{ job.jobRunning }}</div>
            <div class="list-meta">
              <span class="status-badge" :style="{ background: getStatusColor(job.statusId) }">
                {{ job.statusName }}
              </span>
              <span class="date-text">{{ formatDate(job.createDate) }}</span>
            </div>
          </div>
          <div class="list-action">
            <i class="bi bi-chevron-right"></i>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="mobile-empty-state">
        <i class="bi bi-inbox"></i>
        <div class="empty-title">ไม่มีงาน</div>
        <div class="empty-subtitle">ยังไม่มีงานในระบบ</div>
      </div>

      <!-- Load More Button -->
      <div v-if="hasMore && !isLoading" class="mobile-mt-2">
        <button class="mobile-btn mobile-btn-secondary mobile-btn-block" @click="loadMore">
          <i class="bi bi-arrow-down-circle"></i>
          โหลดเพิ่มเติม
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { useUserApiStore } from '@/stores/modules/api/user/user-store.js'
import { getJobTypeName } from '@/constants/job-type.js'
import dayjs from 'dayjs'
import 'dayjs/locale/th'

dayjs.locale('th')

export default {
  name: 'MobileTasksView',

  setup() {
    const userApiStore = useUserApiStore()
    return { userApiStore }
  },

  data() {
    return {
      myJobs: [],
      isLoading: false,
      activeFilter: 'all',
      currentPage: 0,
      pageSize: 20,
      hasMore: true,
      filterTabs: [
        { label: 'ทั้งหมด', value: 'all', count: null },
        { label: 'กำลังดำเนินการ', value: 'active', count: null },
        { label: 'เสร็จสิ้น', value: 'completed', count: null }
      ]
    }
  },

  mounted() {
    this.loadJobs()
  },

  methods: {
    async loadJobs() {
      try {
        this.isLoading = true
        this.currentPage = 0
        this.myJobs = []

        const searchFilter = this.getSearchFilter()

        const result = await this.userApiStore.fetchListMyJob({
          take: this.pageSize,
          skip: 0,
          sort: [{ field: 'createDate', dir: 'desc' }],
          search: searchFilter
        })

        if (result && result.data) {
          this.myJobs = result.data
          this.hasMore = result.data.length >= this.pageSize
        }
      } catch (error) {
        console.error('Error loading jobs:', error)
      } finally {
        this.isLoading = false
      }
    },

    async loadMore() {
      try {
        this.isLoading = true
        this.currentPage++

        const searchFilter = this.getSearchFilter()

        const result = await this.userApiStore.fetchListMyJob({
          take: this.pageSize,
          skip: this.currentPage * this.pageSize,
          sort: [{ field: 'createDate', dir: 'desc' }],
          search: searchFilter
        })

        if (result && result.data) {
          this.myJobs.push(...result.data)
          this.hasMore = result.data.length >= this.pageSize
        }
      } catch (error) {
        console.error('Error loading more jobs:', error)
      } finally {
        this.isLoading = false
      }
    },

    changeFilter(filterValue) {
      this.activeFilter = filterValue
      this.loadJobs()
    },

    getSearchFilter() {
      const filter = {}

      switch (this.activeFilter) {
        case 'active':
          // กำลังดำเนินการ: Pending, Assigned, Started, InProgress, OnHold
          filter.statusId = [10, 20, 30, 40, 50]
          break
        case 'completed':
          // เสร็จสิ้น: Completed
          filter.statusId = [100]
          break
        case 'all':
        default:
          // ทั้งหมด: ไม่ filter status
          filter.isActive = true
          break
      }

      return filter
    },

    viewJobDetail(job) {
      console.log('View job detail:', job)
      // TODO: Navigate to job detail page
      // this.$router.push(`/mobile/job/${job.id}`)
    },

    getStatusColor(statusId) {
      // Based on JobStatus.cs constants
      switch (statusId) {
        case 500:
          return '#f44336' // Cancelled - Red
        case 100:
          return '#4caf50' // Completed - Green
        case 50:
        case 40:
          return '#ff9800' // OnHold/InProgress - Orange
        case 30:
        case 20:
          return '#2196f3' // Started/Assigned - Blue
        case 10:
          return '#9e9e9e' // Pending - Gray
        default:
          return '#9e9e9e'
      }
    },

    formatDate(dateString) {
      return dayjs(dateString).format('DD/MM/YYYY HH:mm')
    },

    getJobTypeNameTh(jobTypeId) {
      return getJobTypeName(jobTypeId)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/mobile';

.mobile-tasks-view {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 80px;
}

.tasks-header {
  background: linear-gradient(
    135deg,
    var(--base-font-color) 0%,
    var(--base-font-sub-color) 100%
  );
  padding: 24px 0 16px 0;
  color: white;
  margin-bottom: 8px;

  .header-subtitle {
    margin: 4px 0 0 0;
    opacity: 0.9;
    font-size: 0.85rem;
  }
}

.filter-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 4px 0;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }

  .filter-tab {
    flex-shrink: 0;
    padding: 8px 16px;
    background: white;
    border: 1px solid #ddd;
    border-radius: 20px;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;

    .tab-count {
      background: #f0f0f0;
      padding: 2px 6px;
      border-radius: 10px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    &.active {
      background: var(--base-font-color);
      color: white;
      border-color: var(--base-font-color);

      .tab-count {
        background: rgba(255, 255, 255, 0.2);
        color: white;
      }
    }

    &:active {
      transform: scale(0.98);
    }
  }
}

.list-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;

  .status-badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.7rem;
    color: white;
    font-weight: 500;
  }

  .date-text {
    font-size: 0.7rem;
    color: #999;
  }
}

.mobile-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: white;
  border-radius: 12px;

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid var(--base-font-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .loading-text {
    margin-top: 16px;
    color: #666;
    font-size: 0.9rem;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
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
