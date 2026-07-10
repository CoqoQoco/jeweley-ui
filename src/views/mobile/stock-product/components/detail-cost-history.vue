<template>
  <div class="detail-cost-history">
    <div v-if="versions.length" class="version-select-label">{{ $t('view.mobile.stockProduct.selectVersion') }}</div>

    <div v-if="versions.length" class="version-selector">
      <button
        v-for="v in versions"
        :key="v.versionId"
        type="button"
        class="version-chip"
        :class="{ active: selectedVersion?.versionId === v.versionId }"
        @click="selectVersion(v)"
      >
        {{ v.running }}
      </button>
    </div>

    <template v-if="selectedVersion">
      <div class="info-card mobile-mt-2">
        <div class="card-header">
          <i class="bi bi-bookmark-check-fill"></i>
          <span>{{ selectedVersion.running }} - {{ formatDate(selectedVersion.createDate) }}</span>
        </div>
        <div class="card-body">
          <div class="info-row">
            <span class="info-label"><i class="bi bi-person-fill"></i></span>
            <span class="info-value">{{ selectedVersion.createBy || '-' }}</span>
          </div>
        </div>
      </div>

      <div v-if="selectedVersion.remark" class="info-card mobile-mt-2">
        <div class="card-header">
          <i class="bi bi-chat-left-text"></i>
          <span>{{ $t('view.stock.product.appraisalRemark') }}</span>
        </div>
        <div class="card-body">
          <div class="remark-text">{{ selectedVersion.remark }}</div>
        </div>
      </div>

      <div v-if="hasCustomerInfo" class="info-card mobile-mt-2">
        <div class="card-header">
          <i class="bi bi-person-fill"></i>
          <span>{{ $t('view.stock.product.customerInfo') }}</span>
        </div>
        <div class="card-body">
          <div class="info-row">
            <span class="info-label">{{ $t('view.stock.product.customerName') }}</span>
            <span class="info-value">{{ selectedVersion.customerName || '-' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ $t('view.stock.product.customerCode') }}</span>
            <span class="info-value">{{ selectedVersion.customerCode || selectedVersion.customerNumber || '-' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ $t('view.stock.product.customerTel') }}</span>
            <span class="info-value">{{ selectedVersion.customerTel || '-' }}</span>
          </div>
        </div>
      </div>

      <div class="mobile-mt-2">
        <cost-breakdown
          :transactions="selectedVersion.priceTransactions"
          :tagPriceMultiplier="selectedVersion.tagPriceMultiplier || 1"
        />
      </div>
    </template>

    <div v-if="!versions.length" class="mobile-empty-state small">
      <i class="bi bi-inbox"></i>
      <div class="empty-title">{{ $t('common.label.noData') }}</div>
    </div>
  </div>
</template>

<script>
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import dayjs from 'dayjs'
import 'dayjs/locale/th'

import costBreakdown from './cost-breakdown.vue'

dayjs.locale('th')

export default {
  name: 'DetailCostHistory',

  components: { costBreakdown },

  setup() {
    const productStore = usrStockProductApiStore()
    return { productStore }
  },

  props: {
    stockNumber: {
      type: String,
      required: true
    },
    stockData: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return {
      versions: [],
      selectedVersion: null
    }
  },

  computed: {
    hasCustomerInfo() {
      const v = this.selectedVersion
      return !!(v && (v.customerCode || v.customerName || v.customerNumber))
    }
  },

  created() {
    this.loadVersionHistory()
  },

  methods: {
    async loadVersionHistory() {
      const response = await this.productStore.fetchGetProductCostDetailVersion(this.stockNumber)

      let rawVersions = []
      if (Array.isArray(response)) {
        rawVersions = response
      } else if (response && Array.isArray(response.data)) {
        rawVersions = response.data
      } else if (response && response.data) {
        rawVersions = [response.data]
      }

      this.versions = rawVersions.map((version, index) => {
        const totalPrice = version.prictransection
          ? version.prictransection.reduce((sum, item) => sum + (item.totalPrice || 0), 0)
          : 0

        return {
          ...version,
          versionId: version.running || `v-${index}`,
          priceTransactions: version.prictransection || [],
          totalPrice,
          customerNumber: version.customerCode || null
        }
      })

      if (this.versions.length > 0) {
        this.selectedVersion = this.versions[0]
      }
    },

    selectVersion(v) {
      this.selectedVersion = v
    },

    formatDate(date) {
      if (!date) return '-'
      return dayjs(date).format('DD/MM/YYYY')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/mobile';

.version-select-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #666;
  margin-bottom: var(--sp-sm);
}

.version-selector {
  display: flex;
  gap: var(--sp-sm);
  overflow-x: auto;
  padding-bottom: 4px;
}

.version-chip {
  flex-shrink: 0;
  padding: 8px 16px;
  border-radius: 9999px;
  border: 1.5px solid var(--color-border);
  background: var(--color-card-bg);
  color: #666;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.97);
  }

  &.active {
    border-color: var(--base-green);
    background: #e8f5e9;
    color: var(--base-green);
  }
}

.info-card {
  background: var(--color-card-bg);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.card-header {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  padding: var(--sp-md) var(--sp-lg);
  background: #f8f9fa;
  border-bottom: 1px solid var(--color-border);
  font-weight: 600;
  color: var(--base-font-color);
  font-size: 0.9rem;

  i {
    font-size: 1.05rem;
  }
}

.card-body {
  padding: var(--sp-lg);
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
  gap: var(--sp-md);

  &:last-child {
    margin-bottom: 0;
  }
}

.info-label {
  font-size: 0.85rem;
  color: #666;
  font-weight: 500;
  flex-shrink: 0;
  min-width: 110px;
}

.info-value {
  font-size: 0.9rem;
  color: #333;
  text-align: right;
  word-break: break-word;
}

.remark-text {
  font-size: 0.9rem;
  color: #333;
  line-height: 1.5;
}

.mobile-empty-state.small {
  padding: var(--sp-2xl) var(--sp-lg);

  i {
    font-size: 2rem;
    margin-bottom: var(--sp-sm);
  }
}
</style>
