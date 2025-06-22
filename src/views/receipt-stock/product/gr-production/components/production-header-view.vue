<template>
  <div class="filter-container-highlight">
    <div class="form-col-container">
      <div class="d-flex justify-content-between">
        <span class="desc-text-white">
          {{
            `รับสินค้างานผลิต แผนผลิตเลขที่ [ W.O. ] : 
              ${data.wo ? `${data.wo}-${data.woNumber}` : 'loading...'}`
          }}
        </span>
        <div class="desc-text-white">
          <div class="d-flex align-items-center">
            <span>{{ `จำนวนรับแล้ว ${data.qtyRunning ?? 0}/${data.productQty ?? 0}` }}</span>
            <div class="bi bi-arrow-clockwise ml-2" @click="onFetch"></div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="pt-2 pb-2 pl-4 pr-4">
    <div>
      <div class="title-text ml-2">
        <span class="bi bi-database-fill-gear mr-2"></span>
        <span>รายละเอียดแผนผลิต</span>
      </div>

      <!-- Production Details Grid -->
      <div class="form-col-container" v-if="dataHeader && dataHeader.length > 0">
        <div v-for="(item, index) in dataHeader" :key="index" class="production-item mb-3">
          <!-- Item Header -->
          <!-- <div class="item-header">
            <span class="item-number">รายการที่ {{ index + 1 }}</span>
            <span class="receipt-number">{{ item.receiptNumber }}</span>
          </div> -->

          <!-- Item Details -->
          <div class="item-details">
            <div class="detail-row">
              <div class="detail-item">
                <span class="detail-label">วันที่ผลิตสำเร็จ:</span>
                <span class="detail-value">{{ formatDateTime(item.receiptDate) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">แม่พิมพ์:</span>
                <span class="detail-value">{{ item.mold || '-' }}</span>
              </div>
            </div>

            <div class="detail-row">
              <div class="detail-item">
                <span class="detail-label">รหัสสินค้าผลิต:</span>
                <span class="detail-value">{{ item.productNumber || '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">ประเภทสินค้า:</span>
                <span class="detail-value">{{ item.productTypeName || '-' }}</span>
              </div>
            </div>

            <div class="detail-row">
              <div class="detail-item">
                <span class="detail-label">สีของทอง/เงิน:</span>
                <span class="detail-value">{{ item.gold || '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">ประเภททอง/เงิน:</span>
                <span class="detail-value">{{ item.goldSize || '-' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-4">
        <div class="empty-message">
          <span class="bi bi-inbox mr-2"></span>
          ไม่พบข้อมูลการผลิต
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { formatDate, formatDateTime } from '@/services/utils/dayjs'

export default {
  name: 'production-header-view',
  emits: ['onFetch'],

  props: {
    model: {
      type: Object,
      required: true,
      default: () => ({})
    },
    modelHeader: {
      type: Array,
      required: true,
      default: () => []
    },
    modelGem: {
      type: Array,
      required: true,
      default: () => []
    }
  },

  computed: {
    data() {
      return this.model
    },
    dataHeader() {
      return this.modelHeader
    },
    dataGem() {
      return this.modelGem
    }
  },

  data() {
    return {}
  },

  methods: {
    onFetch() {
      this.$emit('onFetch')
    },
    formatDateTime(date) {
      return date ? formatDateTime(date) : '-'
    },
    formatDate(date) {
      return date ? formatDate(date) : '-'
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';
@import '@/assets/scss/custom-style/standard-form';

.bi-arrow-clockwise {
  cursor: pointer;
  transition: transform 0.3s;
}

.bi-arrow-clockwise:hover {
  transform: rotate(90deg);
  color: var(--base-color);
}

// Production Items
.production-item {
  background: white;
  border: 1px solid #dddddd;
  border-radius: 5px;
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  overflow: hidden;

  .item-header {
    background-color: var(--base-font-color);
    color: white;
    padding: 8px 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .item-number {
      font-weight: 600;
      font-size: 0.9rem;
    }

    .receipt-number {
      background: rgba(255, 255, 255, 0.2);
      padding: 2px 8px;
      border-radius: 3px;
      font-size: 0.8rem;
    }
  }

  .item-details {
    padding: 15px;

    .detail-row {
      display: flex;
      margin-bottom: 12px;
      gap: 20px;

      &:last-child {
        margin-bottom: 0;
      }

      .detail-item {
        flex: 1;
        min-width: 0;

        .detail-label {
          display: block;
          font-size: 0.8rem;
          color: #6c757d;
          margin-bottom: 3px;
          font-weight: 500;
        }

        .detail-value {
          display: block;
          font-size: 0.9rem;
          color: #2d3748;
          font-weight: 500;
          word-break: break-word;
        }
      }
    }
  }
}

// Empty State
.empty-message {
  color: #6c757d;
  font-size: 1rem;

  .bi {
    font-size: 1.2rem;
  }
}

// Gem Items
.gem-item {
  background: white;
  border: 1px solid #dddddd;
  border-radius: 5px;
  padding: 12px;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 4px;

  .gem-details {
    .gem-row {
      display: flex;
      margin-bottom: 8px;
      gap: 20px;

      &:last-child {
        margin-bottom: 0;
      }

      .gem-field {
        flex: 1;
        min-width: 0;

        .gem-label {
          font-size: 0.8rem;
          color: #6c757d;
          margin-right: 5px;
          font-weight: 500;
        }

        .gem-value {
          font-size: 0.9rem;
          color: #2d3748;
          font-weight: 500;
        }
      }
    }
  }
}

// Responsive adjustments
@media (max-width: 768px) {
  .production-item {
    .item-details {
      .detail-row {
        flex-direction: column;
        gap: 8px;
      }
    }
  }

  .gem-item {
    .gem-details {
      .gem-row {
        flex-direction: column;
        gap: 4px;
      }
    }
  }
}
</style>
