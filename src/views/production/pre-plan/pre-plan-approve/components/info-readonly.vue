<template>
  <div>
    <div class="header-info-card">
      <pageTitle title="ข้อมูลใบสั่งผลิต" :isShowBtnClose="false" />
      <div class="info-grid">
        <div class="info-row">
          <span class="info-label">ผลิตครั้งที่:</span>
          <span>{{ form.productionRound || '-' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">ประเภทงาน:</span>
          <span>{{ getDesc(masterStore.jobTypes, form.jobType) }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">สถานที่:</span>
          <span>{{ getDesc(masterStore.jobLocations, form.jobLocation) }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">ประเภททอง:</span>
          <span>{{ getDesc(masterStore.goldSizes, form.goldType) }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">วันที่ออก:</span>
          <span>{{ formatDate(form.orderDate) }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">วันที่ส่ง:</span>
          <span>{{ formatDate(form.deliveryDate) }}</span>
        </div>
      </div>
      <div v-if="form.remark" class="mt-2">
        <span class="info-label">หมายเหตุ:</span>
        <p class="mb-0">{{ form.remark }}</p>
      </div>
    </div>

    <div class="items-section mt-3">
      <pageTitle title="รายการสินค้า" :isShowBtnClose="false" />
      <div v-for="(item, idx) in items" :key="item.id || idx" class="item-card mb-3">
        <div class="item-card-header">รายการที่ {{ idx + 1 }}</div>
        <div class="item-card-body d-flex align-items-start gap-3">
          <div class="item-thumbnail flex-shrink-0">
            <imagePreview
              v-if="item.moldCode"
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
              <span>{{ item.moldCode || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">ประเภทสินค้า:</span>
              <span>{{ getDesc(masterStore.productTypes, item.productType) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">จำนวน:</span>
              <span>{{ item.productQty || '-' }} {{ item.productQtyUnit || '' }}</span>
            </div>
            <div class="info-row align-items-start">
              <span class="info-label">วัสดุ:</span>
              <div class="flex-grow-1">
                <div v-if="!(item.materials || []).length" class="text-muted">-</div>
                <ul v-else class="material-list">
                  <li v-for="(m, idx) in item.materials" :key="m.id || idx">
                    {{ formatMaterial(m) }}
                  </li>
                </ul>
              </div>
            </div>
            <div v-if="item.productDetail" class="info-row">
              <span class="info-label">รายละเอียด:</span>
              <span>{{ item.productDetail }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import { formatDate } from '@/services/utils/dayjs.js'
import { useMasterPrePlanStore } from '@/stores/modules/api/master/master-pre-plan-store.js'

const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))
const imagePreview = defineAsyncComponent(() => import('@/components/prime-vue/ImagePreview.vue'))

export default {
  name: 'InfoReadonly',
  components: { pageTitle, imagePreview },
  props: {
    form: { type: Object, default: () => ({}) },
    items: { type: Array, default: () => [] },
  },
  setup() {
    const masterStore = useMasterPrePlanStore()
    return { masterStore }
  },
  methods: {
    formatDate,
    getDesc(list, value) {
      if (value == null || value === '') return '-'
      if (typeof value === 'object') return value.description || value.code || '-'
      const found = (list || []).find((x) => x.code === value)
      return found?.description || value
    },
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

.header-info-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  background: #ffffff !important;
  box-shadow: rgba(0, 0, 0, 0.06) 0 2px 8px;

  h6 {
    background: transparent !important;
  }
}

.items-section {
  .item-card {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    background: #ffffff !important;
    overflow: hidden;
  }

  .item-card-header {
    background: #fdf2f2;
    color: var(--base-font-color);
    padding: 10px 16px;
    font-weight: 600;
  }

  .item-card-body {
    padding: 12px 16px;
  }
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 16px;
  margin-top: 12px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
}

.info-row {
  display: flex;
  gap: 6px;
  align-items: flex-start;
}

.info-label {
  color: #666;
  min-width: 110px;
  flex-shrink: 0;
  font-weight: 500;
}

.item-thumbnail {
  width: 80px;
  height: 80px;

  .thumbnail-placeholder {
    width: 80px;
    height: 80px;
    border: 1px dashed #ccc;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
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

.info-row.align-items-start {
  align-items: flex-start;
}
</style>
