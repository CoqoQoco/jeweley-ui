<template>
  <div v-if="isVisible" class="customer-search-overlay">
    <div class="customer-search-container">
      <!-- Header -->
      <div class="search-header">
        <button class="btn-close-modal" @click="onClose">
          <i class="bi bi-x-lg"></i>
        </button>
        <h3 class="search-title">
          <i class="bi bi-search"></i>
          ค้นหาลูกค้า
        </h3>
      </div>

      <!-- Search Input -->
      <div class="search-input-section">
        <form @submit.prevent="onSearch">
          <div class="search-input-wrapper">
            <input
              ref="searchInput"
              v-model.trim="searchText"
              type="text"
              class="search-input"
              placeholder="ชื่อลูกค้า, รหัสลูกค้า..."
              @keyup.enter="onSearch"
            />
            <button class="btn-search" type="submit">
              <i class="bi bi-search"></i>
            </button>
          </div>
        </form>
      </div>

      <!-- Customer List -->
      <div class="customer-list-section">
        <div v-if="customerList.length > 0" class="customer-list">
          <div
            v-for="cust in customerList"
            :key="cust.code"
            class="customer-item"
            @click="onSelectCustomer(cust)"
          >
            <div class="customer-item-header">
              <span class="customer-code">{{ cust.code }}</span>
              <i class="bi bi-check-circle select-icon"></i>
            </div>
            <div class="customer-name">{{ cust.nameTh || cust.nameEn || '-' }}</div>
            <div v-if="cust.telephone1" class="customer-detail">
              <i class="bi bi-telephone"></i>
              <span>{{ cust.telephone1 }}</span>
            </div>
            <div v-if="cust.email" class="customer-detail">
              <i class="bi bi-envelope"></i>
              <span>{{ cust.email }}</span>
            </div>
            <div v-if="cust.address" class="customer-detail">
              <i class="bi bi-geo-alt"></i>
              <span class="address-text">{{ cust.address }}</span>
            </div>
          </div>

          <!-- Load More -->
          <button
            v-if="hasMore"
            class="mobile-btn mobile-btn-outline load-more-btn"
            @click="loadMore"
          >
            <i class="bi bi-arrow-down-circle"></i>
            โหลดเพิ่มเติม
          </button>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <i class="bi bi-people"></i>
          <div class="empty-text">
            {{ searchText ? 'ไม่พบลูกค้า' : 'กรุณาค้นหาลูกค้า' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useCustomerDetailApiStore } from '@/stores/modules/api/customer/customer-detail-store.js'

export default {
  name: 'CustomerSearchModal',

  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },

  emits: ['close', 'customer-selected'],

  setup() {
    const customerStore = useCustomerDetailApiStore()
    return { customerStore }
  },

  data() {
    return {
      isVisible: false,
      searchText: '',
      customerList: [],
      take: 20,
      skip: 0,
      hasMore: false
    }
  },

  watch: {
    visible(val) {
      this.isVisible = val
      if (val) {
        this.resetAndLoad()
      }
    }
  },

  methods: {
    resetAndLoad() {
      this.searchText = ''
      this.customerList = []
      this.skip = 0
      this.hasMore = false
      this.fetchCustomers()
      this.$nextTick(() => {
        this.$refs.searchInput?.focus()
      })
    },

    async onSearch() {
      this.skip = 0
      this.customerList = []
      await this.fetchCustomers()
    },

    async loadMore() {
      this.skip += this.take
      await this.fetchCustomers(true)
    },

    async fetchCustomers(append = false) {
      const result = await this.customerStore.fetchCustomerSearch({
        take: this.take,
        skip: this.skip,
        sort: [],
        formValue: { text: this.searchText || null },
        skipLoading: true
      })

      if (result && result.data) {
        if (append) {
          this.customerList.push(...result.data)
        } else {
          this.customerList = result.data
        }
        this.hasMore = result.data.length >= this.take
      }
    },

    onSelectCustomer(customerData) {
      this.$emit('customer-selected', customerData)
      this.isVisible = false
      this.$emit('close')
    },

    onClose() {
      this.isVisible = false
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/mobile';

.customer-search-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #f5f5f5;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.customer-search-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.search-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #e8e8e8;

  .btn-close-modal {
    background: none;
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
    font-size: 1.1rem;
    cursor: pointer;

    &:active {
      background: #f0f0f0;
    }
  }

  .search-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1rem;
    font-weight: 600;
    color: #333;
    margin: 0;

    i {
      color: var(--base-font-color);
    }
  }
}

.search-input-section {
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #e8e8e8;

  .search-input-wrapper {
    display: flex;
    gap: 8px;

    .search-input {
      flex: 1;
      padding: 10px 14px;
      border: 1px solid #e0e0e0;
      border-radius: 10px;
      font-size: 0.9rem;
      outline: none;

      &:focus {
        border-color: var(--base-font-color);
      }

      &::placeholder {
        color: #bbb;
      }
    }

    .btn-search {
      padding: 10px 16px;
      background: var(--base-font-color);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 1rem;
      cursor: pointer;

      &:active {
        opacity: 0.9;
      }
    }
  }
}

.customer-list-section {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px));
}

.customer-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.customer-item {
  background: white;
  border-radius: 10px;
  padding: 14px;
  border: 1px solid #e8e8e8;
  cursor: pointer;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.99);
    border-color: var(--base-font-color);
  }

  .customer-item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;

    .customer-code {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--base-font-color);
      background: rgba(var(--base-font-color-rgb, 0, 0, 0), 0.08);
      padding: 2px 8px;
      border-radius: 6px;
    }

    .select-icon {
      color: var(--base-font-color);
      font-size: 1.1rem;
    }
  }

  .customer-name {
    font-size: 0.95rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 6px;
  }

  .customer-detail {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    font-size: 0.8rem;
    color: #666;
    margin-bottom: 3px;

    i {
      font-size: 0.8rem;
      margin-top: 2px;
      color: #999;
    }

    .address-text {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }
}

.load-more-btn {
  margin-top: 4px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;

  i {
    font-size: 3rem;
    color: #ddd;
    margin-bottom: 12px;
  }

  .empty-text {
    font-size: 0.9rem;
    color: #999;
  }
}
</style>
