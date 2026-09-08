<template>
  <div class="mobile-sale-view">
    <!-- Page Title -->
    <div class="mobile-container mobile-mt-2">
      <h2 class="mobile-title">{{ $t('view.mobile.saleIndex.pageTitle') }}</h2>
    </div>

    <!-- Search + Scope Filter -->
    <div class="mobile-container mobile-mt-1">
      <list-filter-bar
        v-model:searchValue="searchValue"
        v-model:searchField="searchField"
        :scope="scope"
        @search="onSearch"
        @clear="onClearSearch"
        @update:scope="onChangeScope"
      />
    </div>

    <!-- Invoice List -->
    <div class="mobile-container mobile-mt-1">
      <div v-if="invoiceList.length > 0" class="card-list">
        <div
          v-for="inv in invoiceList"
          :key="inv.invoiceNumber"
          class="list-card"
          @click="viewInvoiceDetail(inv)"
        >
          <div class="list-card-header">
            <span class="card-number">{{ inv.invoiceNumber }}</span>
            <div class="card-status-group">
              <span class="card-status-badge" :style="{ background: getStatusColor(inv.statusName) }">
                {{ inv.statusName || '-' }}
              </span>
              <span
                v-if="invoicePaymentStatus(inv)"
                class="mobile-badge"
                :class="paymentStatusBadgeClass(invoicePaymentStatus(inv))"
              >
                {{ paymentStatusLabel(invoicePaymentStatus(inv)) }}
              </span>
            </div>
          </div>
          <div class="list-card-body">
            <div class="card-customer">
              <i class="bi bi-person"></i>
              <span>{{ inv.customerName || $t('view.mobile.saleIndex.unknownCustomer') }}</span>
            </div>
            <div class="card-info-row">
              <div class="card-date">
                <i class="bi bi-calendar3"></i>
                <span>{{ formatDate(inv.createDate) }}</span>
              </div>
              <div v-if="inv.itemCount" class="card-items-count">
                <i class="bi bi-box-seam"></i>
                <span>{{ inv.itemCount }} {{ $t('view.mobile.saleIndex.itemsUnit') }}</span>
              </div>
              <div v-if="scope === 'all' && inv.createBy" class="card-created-by">
                <i class="bi bi-person-badge"></i>
                <span>{{ inv.createBy }}</span>
              </div>
            </div>
            <div v-if="inv.totalAmount" class="card-total">
              <span class="total-label">{{ $t('view.mobile.saleIndex.totalLabel') }}</span>
              <span class="total-value">{{ formatCurrency(inv.totalAmount) }} {{ $t('view.mobile.saleIndex.bahtUnit') }}</span>
            </div>
            <ReceiptPrintAction :invoice-number="inv.invoiceNumber" :compact="true" />
          </div>
        </div>

        <button
          v-if="invoiceHasMore"
          class="mobile-btn mobile-btn-outline mobile-mt-2"
          @click="loadMoreInvoice"
        >
          <i class="bi bi-arrow-down-circle"></i>
          {{ $t('view.mobile.saleIndex.loadMoreBtn') }}
        </button>
      </div>

      <div v-else class="mobile-empty-state">
        <i class="bi bi-file-earmark-text"></i>
        <div class="empty-title">{{ $t('view.mobile.saleIndex.invoiceEmptyTitle') }}</div>
        <div class="empty-subtitle">{{ $t('view.mobile.saleIndex.invoiceEmptySubtitle') }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'

import { useInvoiceApiStore } from '@/stores/modules/api/sale/invoice-store.js'
import { useAuthStore } from '@/stores/modules/authen/authen-store.js'
import { storage } from '@/services/storage.js'
import { getPaymentStatus } from '@/services/utils/payment-status.js'
import listFilterBar from './components/list-filter-bar.vue'
import ReceiptPrintAction from '@/components/receipt/receipt-print-action.vue'

const SCOPE_STORAGE_KEY = 'mobile-sale-scope'

export default {
  name: 'MobileSaleIndexView',

  components: { listFilterBar, ReceiptPrintAction },

  setup() {
    const invoiceStore = useInvoiceApiStore()
    const authStore = useAuthStore()
    return { invoiceStore, authStore }
  },

  data() {
    return {
      pageSize: 20,

      // Search & scope
      searchValue: '',
      searchField: 'number',
      scope: 'mine',

      // Invoice
      invoiceList: [],
      invoicePage: 0,
      invoiceHasMore: false
    }
  },

  computed: {
    currentUsername() {
      return this.authStore.getUser?.username || ''
    },

    invoiceSearchFormValue() {
      const formValue = { createBy: this.scope === 'mine' ? this.currentUsername : null }
      if (this.searchValue) {
        if (this.searchField === 'number') {
          formValue.invoiceNumber = this.searchValue
        } else {
          formValue.customerName = this.searchValue
        }
      }
      return formValue
    }
  },

  created() {
    this.scope = this.loadSavedScope()
  },

  mounted() {
    this.loadInvoiceList()
  },

  methods: {
    // ========== Search & Scope ==========
    onSearch() {
      this.applyFilterChange()
    },

    onClearSearch() {
      this.searchValue = ''
      this.applyFilterChange()
    },

    onChangeScope(scope) {
      if (this.scope === scope) return
      this.scope = scope
      this.saveScope(scope)
      this.applyFilterChange()
    },

    applyFilterChange() {
      this.invoicePage = 0
      this.loadInvoiceList()
    },

    loadSavedScope() {
      try {
        return storage.getItem(SCOPE_STORAGE_KEY) === 'all' ? 'all' : 'mine'
      } catch (e) {
        return 'mine'
      }
    },

    saveScope(scope) {
      try {
        storage.setItem(SCOPE_STORAGE_KEY, scope)
      } catch (e) {
        // localStorage อาจใช้งานไม่ได้ในบาง browser mode — ข้ามการบันทึก
      }
    },

    // ========== Invoice ==========
    async loadInvoiceList() {
      this.invoicePage = 0
      this.invoiceList = []

      const result = await this.invoiceStore.fetchList({
        take: this.pageSize,
        skip: 0,
        sort: [{ field: 'createDate', dir: 'desc' }],
        formValue: this.invoiceSearchFormValue
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
        formValue: this.invoiceSearchFormValue
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

    // ========== Payment status badge (ถัดจาก statusName เดิม — คนละเรื่องกัน) ==========
    // guard: grandTotalRounded เป็น null/undefined (ใบเก่าจำนวนมาก) → คืน null ห้ามเดาว่าค้างชำระ
    invoicePaymentStatus(inv) {
      return getPaymentStatus(inv.grandTotalRounded, inv.deposit, inv.paidAmount)
    },

    paymentStatusLabel(status) {
      const map = {
        paid: this.$t('view.mobile.sale.invoiceStatusPaidLabel'),
        partial: this.$t('view.mobile.sale.invoiceStatusPartialLabel'),
        unpaid: this.$t('view.mobile.sale.invoiceStatusUnpaidLabel')
      }
      return map[status] || ''
    },

    paymentStatusBadgeClass(status) {
      const map = {
        paid: 'mobile-badge-success',
        partial: 'mobile-badge-warning',
        unpaid: 'mobile-badge-danger'
      }
      return map[status] || 'mobile-badge-secondary'
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
  padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px));
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.list-card {
  background: var(--color-card-bg);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
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
    border-bottom: 1px solid var(--color-border);

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

    .card-status-group {
      display: flex;
      align-items: center;
      gap: var(--sp-xs);
      flex-shrink: 0;
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
      flex-wrap: wrap;
      gap: 6px;

      .card-date,
      .card-items-count,
      .card-created-by {
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
      border-top: 1px solid var(--color-border);

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

.mobile-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: var(--color-card-bg);
  border-radius: var(--radius-lg);
  text-align: center;

  i {
    font-size: 4rem;
    color: var(--color-border);
    margin-bottom: var(--sp-lg);
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
