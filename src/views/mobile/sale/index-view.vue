<template>
  <div class="mobile-sale-view">
    <!-- Main Tabs: SO | Invoice -->
    <div class="mobile-container mobile-mt-1">
      <div class="main-tabs">
        <button
          class="main-tab"
          :class="{ active: activeTab === 'so' }"
          @click="changeTab('so')"
        >
          <i class="bi bi-receipt"></i>
          Sale Order
        </button>
        <button
          class="main-tab"
          :class="{ active: activeTab === 'invoice' }"
          @click="changeTab('invoice')"
        >
          <i class="bi bi-file-earmark-text"></i>
          Invoice
        </button>
      </div>
    </div>

    <!-- SO Tab Content -->
    <div v-if="activeTab === 'so'" class="mobile-container mobile-mt-1">
      <div v-if="soList.length > 0" class="card-list">
        <div
          v-for="so in soList"
          :key="so.soNumber"
          class="list-card"
          @click="viewSoDetail(so)"
        >
          <div class="list-card-header">
            <span class="card-number">{{ so.soNumber }}</span>
            <span class="card-status-badge" :style="{ background: getStatusColor(so.statusName) }">
              {{ so.statusName || '-' }}
            </span>
          </div>
          <div class="list-card-body">
            <div class="card-customer">
              <i class="bi bi-person"></i>
              <span>{{ so.customerName || 'ไม่ระบุลูกค้า' }}</span>
            </div>
            <div class="card-info-row">
              <div class="card-date">
                <i class="bi bi-calendar3"></i>
                <span>{{ formatDate(so.createDate) }}</span>
              </div>
            </div>
          </div>
        </div>

        <button
          v-if="soHasMore"
          class="mobile-btn mobile-btn-outline mobile-mt-2"
          @click="loadMoreSo"
        >
          <i class="bi bi-arrow-down-circle"></i>
          โหลดเพิ่มเติม
        </button>
      </div>

      <div v-else class="mobile-empty-state">
        <i class="bi bi-receipt"></i>
        <div class="empty-title">ไม่มีใบสั่งขาย</div>
        <div class="empty-subtitle">ยังไม่มีใบสั่งขายที่คุณสร้าง</div>
      </div>
    </div>

    <!-- Invoice Tab Content -->
    <div v-if="activeTab === 'invoice'" class="mobile-container mobile-mt-1">
      <div v-if="invoiceList.length > 0" class="card-list">
        <div
          v-for="inv in invoiceList"
          :key="inv.invoiceNumber"
          class="list-card"
          @click="viewInvoiceDetail(inv)"
        >
          <div class="list-card-header">
            <span class="card-number">{{ inv.invoiceNumber }}</span>
            <span class="card-status-badge" :style="{ background: getStatusColor(inv.statusName) }">
              {{ inv.statusName || '-' }}
            </span>
          </div>
          <div class="list-card-body">
            <div class="card-customer">
              <i class="bi bi-person"></i>
              <span>{{ inv.customerName || 'ไม่ระบุลูกค้า' }}</span>
            </div>
            <div class="card-info-row">
              <div class="card-date">
                <i class="bi bi-calendar3"></i>
                <span>{{ formatDate(inv.createDate) }}</span>
              </div>
              <div v-if="inv.itemCount" class="card-items-count">
                <i class="bi bi-box-seam"></i>
                <span>{{ inv.itemCount }} รายการ</span>
              </div>
            </div>
            <div v-if="inv.totalAmount" class="card-total">
              <span class="total-label">ยอดรวม</span>
              <span class="total-value">{{ formatCurrency(inv.totalAmount) }} บาท</span>
            </div>
          </div>
        </div>

        <button
          v-if="invoiceHasMore"
          class="mobile-btn mobile-btn-outline mobile-mt-2"
          @click="loadMoreInvoice"
        >
          <i class="bi bi-arrow-down-circle"></i>
          โหลดเพิ่มเติม
        </button>
      </div>

      <div v-else class="mobile-empty-state">
        <i class="bi bi-file-earmark-text"></i>
        <div class="empty-title">ไม่มี Invoice</div>
        <div class="empty-subtitle">ยังไม่มี Invoice ที่คุณสร้าง</div>
      </div>
    </div>

    <!-- Sticky Create Button (SO tab only) -->
    <div v-if="activeTab === 'so'" class="sticky-bottom-btn">
      <button class="mobile-btn mobile-btn-primary" @click="$router.push('/mobile/sale/create')">
        <i class="bi bi-plus-circle"></i>
        สร้างใบสั่งขาย
      </button>
    </div>
  </div>
</template>

<script>
import { usrSaleOrderApiStore } from '@/stores/modules/api/sale/sale-order-store.js'
import { useInvoiceApiStore } from '@/stores/modules/api/sale/invoice-store.js'
import { useAuthStore } from '@/stores/modules/authen/authen-store.js'
import dayjs from 'dayjs'

export default {
  name: 'MobileSaleIndexView',

  setup() {
    const saleOrderStore = usrSaleOrderApiStore()
    const invoiceStore = useInvoiceApiStore()
    const authStore = useAuthStore()
    return { saleOrderStore, invoiceStore, authStore }
  },

  data() {
    return {
      activeTab: 'so',
      pageSize: 20,

      // SO
      soList: [],
      soPage: 0,
      soHasMore: false,

      // Invoice
      invoiceList: [],
      invoicePage: 0,
      invoiceHasMore: false
    }
  },

  computed: {
    currentUsername() {
      return this.authStore.getUser?.username || ''
    }
  },

  mounted() {
    this.loadSoList()
  },

  methods: {
    changeTab(tab) {
      if (this.activeTab === tab) return
      this.activeTab = tab

      if (tab === 'so' && this.soList.length === 0) {
        this.loadSoList()
      }
      if (tab === 'invoice' && this.invoiceList.length === 0) {
        this.loadInvoiceList()
      }
    },

    // ========== SO ==========
    async loadSoList() {
      this.soPage = 0
      this.soList = []

      const result = await this.saleOrderStore.fetchList({
        take: this.pageSize,
        skip: 0,
        sort: [{ field: 'createDate', dir: 'desc' }],
        formValue: { createBy: this.currentUsername }
      })

      if (result && result.data) {
        this.soList = result.data
        this.soHasMore = result.data.length >= this.pageSize
      }
    },

    async loadMoreSo() {
      this.soPage++

      const result = await this.saleOrderStore.fetchList({
        take: this.pageSize,
        skip: this.soPage * this.pageSize,
        sort: [{ field: 'createDate', dir: 'desc' }],
        formValue: { createBy: this.currentUsername }
      })

      if (result && result.data) {
        this.soList.push(...result.data)
        this.soHasMore = result.data.length >= this.pageSize
      }
    },

    viewSoDetail(so) {
      this.$router.push({
        name: 'mobile-sale-detail',
        params: { soNumber: so.soNumber }
      })
    },

    // ========== Invoice ==========
    async loadInvoiceList() {
      this.invoicePage = 0
      this.invoiceList = []

      const result = await this.invoiceStore.fetchList({
        take: this.pageSize,
        skip: 0,
        sort: [{ field: 'createDate', dir: 'desc' }],
        formValue: { createBy: this.currentUsername }
      })

      if (result && result.data) {
        this.invoiceList = result.data
        this.invoiceHasMore = result.data.length >= this.pageSize
      }
    },

    async loadMoreInvoice() {
      this.invoicePage++

      const result = await this.invoiceStore.fetchList({
        take: this.pageSize,
        skip: this.invoicePage * this.pageSize,
        sort: [{ field: 'createDate', dir: 'desc' }],
        formValue: { createBy: this.currentUsername }
      })

      if (result && result.data) {
        this.invoiceList.push(...result.data)
        this.invoiceHasMore = result.data.length >= this.pageSize
      }
    },

    viewInvoiceDetail(inv) {
      this.$router.push({
        name: 'mobile-invoice-detail',
        params: { invoiceNumber: inv.invoiceNumber }
      })
    },

    // ========== Shared ==========
    getStatusColor(statusName) {
      const name = (statusName || '').toLowerCase()
      if (name.includes('draft') || name.includes('ร่าง')) return '#9e9e9e'
      if (name.includes('confirm') || name.includes('ยืนยัน')) return '#2196f3'
      if (name.includes('invoice') || name.includes('paid') || name.includes('ชำระ')) return '#4caf50'
      if (name.includes('cancel') || name.includes('ยกเลิก')) return '#f44336'
      return '#9e9e9e'
    },

    formatDate(dateString) {
      if (!dateString) return '-'
      return dayjs(dateString).format('DD/MM/YYYY HH:mm')
    },

    formatCurrency(value) {
      if (value === null || value === undefined) return '0.00'
      return new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(Number(value))
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/mobile';

.mobile-sale-view {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 140px;
}

.main-tabs {
  display: flex;
  gap: 0;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  .main-tab {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 12px 16px;
    border: none;
    background: white;
    font-size: 0.9rem;
    font-weight: 500;
    color: #666;
    cursor: pointer;
    transition: all 0.2s ease;

    i {
      font-size: 1rem;
    }

    &.active {
      background: var(--base-font-color);
      color: white;
    }

    &:active {
      opacity: 0.9;
    }
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

    .card-status-badge {
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 0.75rem;
      color: white;
      font-weight: 500;
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

      .card-date,
      .card-items-count {
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

    .card-total {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 8px;
      margin-top: 8px;
      border-top: 1px solid #f0f0f0;

      .total-label {
        font-size: 0.85rem;
        color: #666;
      }

      .total-value {
        font-size: 1rem;
        font-weight: 700;
        color: var(--base-font-color);
      }
    }
  }
}

.sticky-bottom-btn {
  position: fixed;
  bottom: 70px;
  left: 0;
  right: 0;
  padding: 0px 10px 16px 10px;
  //background: white;
  //box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 99;

  .mobile-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;

    i {
      font-size: 1.2rem;
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
