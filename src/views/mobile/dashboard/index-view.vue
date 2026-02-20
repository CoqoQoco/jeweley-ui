<template>
  <div class="mobile-dashboard">
    <!-- Header Section -->
    <div class="dashboard-header">
      <div class="header-content">
        <div class="user-greeting">
          <h1 class="greeting-text">สวัสดี, {{ userName }}</h1>
          <p class="greeting-subtitle">{{ currentDate }}</p>
        </div>
        <div class="header-actions">
          <!-- Notification bell -->
          <button class="icon-btn">
            <i class="bi bi-bell"></i>
            <span class="badge">3</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Quick Stats Cards -->
    <!-- <div class="mobile-container">
      <div class="mobile-grid-2">
        <div class="stat-card stat-card-primary">
          <div class="stat-icon">
            <i class="bi bi-box-seam"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">156</div>
            <div class="stat-label">สต็อก</div>
          </div>
        </div>

        <div class="stat-card stat-card-success">
          <div class="stat-icon">
            <i class="bi bi-gear-fill"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">23</div>
            <div class="stat-label">งานผลิต</div>
          </div>
        </div>
      </div>
    </div> -->

    <!-- Quick Actions -->
    <div class="mobile-container mobile-mt-2">
      <h3 class="mobile-subtitle mobile-mb-2">หัวข้องาน</h3>

      <div class="mobile-grid-2">
        <div class="action-card" @click="navigateTo('/mobile/scan')">
          <div class="action-icon">
            <i class="bi bi-qr-code-scan"></i>
          </div>
          <div class="action-label">สแกน QR</div>
        </div>

        <div class="action-card" @click="navigateTo('/mobile/sale')">
          <div class="action-icon">
            <i class="bi bi-receipt"></i>
          </div>
          <div class="action-label">ใบสั่งขาย</div>
        </div>
      </div>
    </div>

    <!-- My Jobs List -->
    <div class="mobile-container mobile-mt-2">
      <div class="mobile-flex mobile-flex-between mobile-mb-2">
        <h3 class="mobile-subtitle">งานของฉัน</h3>
        <div class="header-actions-group">
          <button class="icon-btn-small" @click="refreshJobs" :disabled="isRefreshing">
            <i class="bi bi-arrow-clockwise" :class="{ 'spin-animation': isRefreshing }"></i>
          </button>
          <button class="text-link" @click="navigateTo('/mobile/tasks')">ดูทั้งหมด</button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="mobile-loading">
        <div class="spinner"></div>
        <div class="loading-text">กำลังโหลด...</div>
      </div>

      <!-- Jobs List -->
      <div v-else-if="myJobs.length > 0" class="mobile-list">
        <JobCard
          v-for="job in myJobs"
          :key="job.id"
          :job="job"
          @click="viewJob"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="mobile-empty-state">
        <i class="bi bi-inbox"></i>
        <div class="empty-title">ไม่มีงาน</div>
        <div class="empty-subtitle">ยังไม่มีงานในระบบ</div>
      </div>
    </div>

    <!-- Recent Activities -->
    <!-- <div class="mobile-container mobile-mt-2">
      <div class="mobile-flex mobile-flex-between mobile-mb-2">
        <h3 class="mobile-subtitle">กิจกรรมล่าสุด</h3>
        <button class="text-link" @click="viewAllActivities">ดูทั้งหมด</button>
      </div>

      <div class="mobile-list">
        <div
          v-for="activity in recentActivities"
          :key="activity.id"
          class="mobile-list-item mobile-list-item-clickable"
          @click="viewActivity(activity)"
        >
          <div class="list-icon" :style="{ background: activity.iconBg }">
            <i :class="activity.icon" :style="{ color: activity.iconColor }"></i>
          </div>
          <div class="list-content">
            <div class="list-title">{{ activity.title }}</div>
            <div class="list-subtitle">{{ activity.time }}</div>
          </div>
          <div class="list-action">
            <i class="bi bi-chevron-right"></i>
          </div>
        </div>
      </div>
    </div> -->

    <!-- Empty State Example (ซ่อนไว้ ใช้เมื่อไม่มีข้อมูล) -->
    <!-- <div class="mobile-empty-state" v-if="!hasData">
      <i class="bi bi-inbox"></i>
      <div class="empty-title">ไม่มีกิจกรรม</div>
      <div class="empty-subtitle">ยังไม่มีกิจกรรมในระบบ</div>
    </div> -->

    <!-- Loading Example (ซ่อนไว้ ใช้เมื่อกำลังโหลด) -->
    <!-- <div class="mobile-loading" v-if="isLoading">
      <div class="spinner"></div>
      <div class="loading-text">กำลังโหลด...</div>
    </div> -->
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/modules/authen/authen-store.js'
import { useUserApiStore } from '@/stores/modules/api/user/user-store.js'
import { JOB_TYPE } from '@/constants/job-type.js'
import JobCard from '@/views/mobile/components/job-card.vue'
import dayjs from 'dayjs'
import 'dayjs/locale/th'

dayjs.locale('th')

export default {
  name: 'MobileDashboard',

  components: {
    JobCard
  },

  setup() {
    const authStore = useAuthStore()
    const userApiStore = useUserApiStore()
    return { authStore, userApiStore }
  },

  data() {
    return {
      myJobs: [],
      isLoading: false,
      isRefreshing: false,
      // Placeholder data
      recentActivities: [
        {
          id: 1,
          title: 'แผนการผลิต #P-2024-001',
          time: '10 นาทีที่แล้ว',
          icon: 'bi bi-gear-fill',
          iconBg: '#e3f2fd',
          iconColor: '#1976d2'
        },
        {
          id: 2,
          title: 'รับสต็อกแก้ว 100 ชิ้น',
          time: '1 ชั่วโมงที่แล้ว',
          icon: 'bi bi-box-seam',
          iconBg: '#f3e5f5',
          iconColor: '#7b1fa2'
        },
        {
          id: 3,
          title: 'ตีราคาสินค้า #S-1234',
          time: '2 ชั่วโมงที่แล้ว',
          icon: 'bi bi-gem',
          iconBg: '#fff3e0',
          iconColor: '#e65100'
        }
      ]
    }
  },

  mounted() {
    this.loadMyJobs()
  },

  computed: {
    userName() {
      const user = this.authStore.user
      return user?.firstName || 'ผู้ใช้งาน'
    },

    currentDate() {
      return dayjs().format('วันddddที่ D MMMM YYYY')
    }
  },

  methods: {
    navigateTo(path) {
      this.$router.push(path)
    },

    async loadMyJobs() {
      try {
        this.isLoading = true
        const result = await this.userApiStore.fetchListMyJob({
          take: 5,
          skip: 0,
          search: {
            isActive: true
          }
        })

        if (result && result.data) {
          this.myJobs = result.data
        }
      } catch (error) {
        console.error('Error loading my jobs:', error)
      } finally {
        this.isLoading = false
      }
    },

    async refreshJobs() {
      try {
        this.isRefreshing = true
        const result = await this.userApiStore.fetchListMyJob({
          take: 5,
          skip: 0,
          search: {
            isActive: true
          }
        })

        if (result && result.data) {
          this.myJobs = result.data
        }
      } catch (error) {
        console.error('Error refreshing jobs:', error)
      } finally {
        // Add small delay to show animation
        setTimeout(() => {
          this.isRefreshing = false
        }, 500)
      }
    },

    viewAllActivities() {
      // Navigate to activities page
      console.log('View all activities')
    },

    viewActivity(activity) {
      console.log('View activity:', activity)
    },

    viewJob(job) {
      if (job.jobTypeId === JOB_TYPE.PLAN_STOCK_COST && job.statusId === 100) {
        this.$router.push({
          name: 'mobile-cost-version-detail',
          params: { jobRunning: job.jobRunning }
        })
      } else {
        console.log('View job:', job)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/mobile';

.mobile-dashboard {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 80px; // เว้นที่สำหรับ bottom nav
}

.dashboard-header {
  background: linear-gradient(135deg, var(--base-font-color) 0%, var(--base-font-sub-color) 100%);
  padding: 24px 16px;
  color: white;
  margin-bottom: 16px;

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .user-greeting {
    flex: 1;

    .greeting-text {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 4px 0;
    }

    .greeting-subtitle {
      font-size: 0.85rem;
      opacity: 0.9;
      margin: 0;
    }
  }

  .header-actions {
    .icon-btn {
      position: relative;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;

      i {
        font-size: 1.2rem;
      }

      .badge {
        position: absolute;
        top: -2px;
        right: -2px;
        background: var(--base-red);
        color: white;
        font-size: 0.7rem;
        padding: 2px 5px;
        border-radius: 10px;
        min-width: 18px;
        text-align: center;
      }

      &:active {
        background: rgba(255, 255, 255, 0.3);
      }
    }
  }
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
  }

  .stat-content {
    flex: 1;

    .stat-value {
      font-size: 1.5rem;
      font-weight: 600;
      line-height: 1;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 0.85rem;
      color: #666;
    }
  }

  &-primary {
    .stat-icon {
      background: #e3f2fd;
      color: #1976d2;
    }

    .stat-value {
      color: #1976d2;
    }
  }

  &-success {
    .stat-icon {
      background: #e8f5e9;
      color: #388e3c;
    }

    .stat-value {
      color: #388e3c;
    }
  }
}

.action-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  .action-icon {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: linear-gradient(
      135deg,
      var(--base-font-color) 0%,
      var(--base-font-sub-color) 100%
    );
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.8rem;
  }

  .action-label {
    font-size: 0.9rem;
    font-weight: 500;
    color: #333;
    text-align: center;
  }

  &:active {
    transform: scale(0.98);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  }
}

.header-actions-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-btn-small {
  background: none;
  border: none;
  color: var(--base-font-color);
  font-size: 1.1rem;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;

  &:active:not(:disabled) {
    background: rgba(146, 19, 19, 0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  i.spin-animation {
    animation: spin 1s linear infinite;
  }
}

.text-link {
  background: none;
  border: none;
  color: var(--base-font-color);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0;

  &:active {
    opacity: 0.7;
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
  padding: 40px 20px;
  background: white;
  border-radius: 12px;
  text-align: center;

  i {
    font-size: 3rem;
    color: #ddd;
    margin-bottom: 16px;
  }

  .empty-title {
    font-size: 1rem;
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
