<template>
  <div class="item-card">
    <div class="item-card-header d-flex justify-content-between align-items-center">
      <span class="fw-semibold">รายการที่ {{ index + 1 }}</span>
      <div>
        <button type="button" class="btn btn-sm btn-main mr-2" @click="$emit('edit')">
          <i class="bi bi-pencil"></i> แก้ไข
        </button>
        <button type="button" class="btn btn-sm btn-red ms-2" @click="$emit('remove')">
          <i class="bi bi-trash"></i> ลบ
        </button>
      </div>
    </div>

    <div class="item-card-body d-flex align-items-start gap-3">
      <div class="item-thumbnail flex-shrink-0">
        <img
          v-if="item.productImagePreview"
          :src="item.productImagePreview"
          alt="product"
          class="product-img"
        />
        <imagePreview
          v-else-if="item.moldCode"
          :imageName="item.moldCode"
          type="MOLD"
          :width="80"
          :height="80"
        />
        <div v-else class="thumbnail-placeholder">
          <i class="bi bi-image text-muted"></i>
        </div>
      </div>

      <div class="item-info flex-grow-1 ml-2">
        <div class="info-row">
          <span class="info-label">รหัสแม่พิมพ์:</span>
          <span class="info-value">{{ item.moldCode || '-' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">ประเภทสินค้า:</span>
          <span class="info-value">{{ productTypeLabel }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">จำนวน:</span>
          <span class="info-value">
            {{ item.productQty != null ? item.productQty : '-' }}
            {{ item.productQtyUnit || '' }}
          </span>
        </div>
        <div class="info-row align-items-start">
          <span class="info-label">วัสดุ:</span>
          <div class="info-value flex-grow-1">
            <div v-if="!(item.materials || []).length" class="text-muted">-</div>
            <ul v-else class="material-list">
              <li v-for="(m, idx) in item.materials" :key="m.id || idx">
                {{ formatMaterial(m) }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const imagePreview = defineAsyncComponent(
  () => import('@/components/prime-vue/ImagePreview.vue')
)

export default {
  name: 'ItemCard',

  components: { imagePreview },

  props: {
    item: {
      type: Object,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
  },

  emits: ['edit', 'remove'],

  computed: {
    productTypeLabel() {
      const pt = this.item.productType
      if (!pt) return '-'
      if (typeof pt === 'object' && pt !== null) return pt.description || '-'
      return pt
    },
  },

  methods: {
    formatMaterial(m) {
      const parts = []
      const goldName = this.descOf(m.gold)
      if (goldName || m.goldQty) {
        const seg = ['ทอง:', goldName, m.goldQty != null ? `× ${m.goldQty}` : '']
          .filter(Boolean).join(' ')
        parts.push(seg)
      }
      const gemName = this.descOf(m.gem)
      const gemShape = this.descOf(m.gemShape)
      if (gemName || gemShape || m.gemQty || m.gemSize) {
        const seg = ['พลอย:', gemName, gemShape,
          m.gemQty != null ? `${m.gemQty}${m.gemUnit ? ' ' + m.gemUnit : ''}` : '',
          m.gemSize ? `(${m.gemSize})` : ''].filter(Boolean).join(' ')
        parts.push(seg)
      }
      if (m.diamondQty || m.diamondSize || m.diamondQuality) {
        const seg = ['เพชร:',
          m.diamondQty != null ? `${m.diamondQty}${m.diamondUnit ? ' ' + m.diamondUnit : ''}` : '',
          m.diamondSize ? `(${m.diamondSize})` : '',
          m.diamondQuality || ''].filter(Boolean).join(' ')
        parts.push(seg)
      }
      return parts.length ? parts.join(' · ') : '(ไม่ระบุ)'
    },
    descOf(obj) {
      if (!obj) return ''
      if (typeof obj === 'object') return obj.description || ''
      return String(obj)
    },
  },
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.item-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
}

.item-card-header {
  background: #fdf2f2;
  color: var(--base-font-color);
  padding: 10px 16px;
}

.item-card-body {
  padding: 12px 16px;
}

.item-thumbnail {
  .thumbnail-placeholder {
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
    border: 1px dashed #ccc;
    border-radius: 6px;
    font-size: 1.5rem;
  }

  .product-img {
    width: 80px;
    height: 80px;
    object-fit: contain;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    background: #fff;
  }
}

.item-info {
  .info-row {
    display: flex;
    gap: 6px;
    margin-bottom: 4px;
    font-size: 0.9rem;
  }

  .info-label {
    color: #666;
    min-width: 110px;
    flex-shrink: 0;
  }

  .info-value {
    color: #333;
    font-weight: 500;
  }

  .info-row.align-items-start {
    align-items: flex-start;
  }
}

.material-list {
  margin: 0;
  padding-left: 16px;
  list-style: disc;
  font-size: 0.85rem;

  li {
    margin-bottom: 2px;
    color: #333;
  }
}
</style>
