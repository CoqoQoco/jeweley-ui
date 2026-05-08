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
          <span>{{ form.jobType || '-' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">สถานที่:</span>
          <span>{{ form.jobLocation || '-' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">ประเภททอง:</span>
          <span>{{ form.goldType || '-' }}</span>
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
          <div class="item-info flex-grow-1">
            <div class="info-row">
              <span class="info-label">รหัสแม่พิมพ์:</span>
              <span>{{ item.moldCode || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">ประเภทสินค้า:</span>
              <span>{{ item.productType || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">จำนวน:</span>
              <span>{{ item.productQty || '-' }} {{ item.productQtyUnit || '' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">วัสดุ:</span>
              <span>{{ (item.materials || []).length }} รายการ</span>
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

const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))
const imagePreview = defineAsyncComponent(() => import('@/components/prime-vue/ImagePreview.vue'))

export default {
  name: 'InfoReadonly',
  components: { pageTitle, imagePreview },
  props: {
    form: { type: Object, default: () => ({}) },
    items: { type: Array, default: () => [] },
  },
  methods: { formatDate },
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
</style>
