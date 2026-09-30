<!--
  plan-info-section — กล่อง "ข้อมูลใบงาน" ของ executive/plan-detail (read-only) — รูปแบบ + ฟิลด์ข้อมูล
  หลักของใบงาน ไม่มี input/ปุ่มแก้ไขใดๆ ทั้งสิ้น

  Props:
    info — Object (required) ของ { mold, productNumber, productName, customerName, customerNumber,
           productQty, productQtyUnit, gold, goldSize, requestDate, createDate, lastUpdateBy, lastUpdateDate }
-->
<template>
  <SectionCardGeneric :title="$t('view.executive.planDetail.sectionInfo')" icon="bi-info-circle" accent="main" headerStyle="legend">
    <div class="plan-info-section__layout">
      <ImagePreview :imageName="info.mold" type="MOLD" :width="180" :height="180" :alt="info.mold" />

      <div class="plan-info-section__fields">
        <div class="plan-info-section__field">
          <span class="plan-info-section__label">{{ $t('view.executive.planDetail.fieldProductNumber') }}</span>
          <span class="plan-info-section__value">{{ info.productNumber || '-' }}</span>
        </div>
        <div class="plan-info-section__field">
          <span class="plan-info-section__label">{{ $t('view.executive.planDetail.fieldProductName') }}</span>
          <span class="plan-info-section__value">{{ info.productName || '-' }}</span>
        </div>
        <div class="plan-info-section__field">
          <span class="plan-info-section__label">{{ $t('view.executive.planDetail.fieldCustomerName') }}</span>
          <span class="plan-info-section__value">{{ info.customerName || '-' }}</span>
        </div>
        <div class="plan-info-section__field">
          <span class="plan-info-section__label">{{ $t('view.executive.planDetail.fieldCustomerCode') }}</span>
          <span class="plan-info-section__value">{{ info.customerNumber || '-' }}</span>
        </div>
        <div class="plan-info-section__field">
          <span class="plan-info-section__label">{{ $t('view.executive.planDetail.fieldQty') }}</span>
          <span class="plan-info-section__value">{{ info.productQty ?? '-' }}</span>
        </div>
        <div class="plan-info-section__field">
          <span class="plan-info-section__label">{{ $t('view.executive.planDetail.fieldUnit') }}</span>
          <span class="plan-info-section__value">{{ info.productQtyUnit || '-' }}</span>
        </div>
        <div class="plan-info-section__field">
          <span class="plan-info-section__label">{{ $t('view.executive.planDetail.fieldGold') }}</span>
          <span class="plan-info-section__value">{{ info.gold || '-' }}</span>
        </div>
        <div class="plan-info-section__field">
          <span class="plan-info-section__label">{{ $t('view.executive.planDetail.fieldGoldSize') }}</span>
          <span class="plan-info-section__value">{{ info.goldSize || '-' }}</span>
        </div>
        <div class="plan-info-section__field">
          <span class="plan-info-section__label">{{ $t('view.executive.planDetail.fieldRequestDate') }}</span>
          <span class="plan-info-section__value">{{ formatDate(info.requestDate) }}</span>
        </div>
        <div class="plan-info-section__field">
          <span class="plan-info-section__label">{{ $t('view.executive.planDetail.fieldCreateDate') }}</span>
          <span class="plan-info-section__value">{{ formatDate(info.createDate) }}</span>
        </div>
        <div class="plan-info-section__field">
          <span class="plan-info-section__label">{{ $t('view.executive.planDetail.fieldLastUpdateBy') }}</span>
          <span class="plan-info-section__value">{{ info.lastUpdateBy || '-' }}</span>
        </div>
        <div class="plan-info-section__field">
          <span class="plan-info-section__label">{{ $t('view.executive.planDetail.fieldLastUpdateDate') }}</span>
          <span class="plan-info-section__value">{{ formatDateTime(info.lastUpdateDate) }}</span>
        </div>
      </div>
    </div>
  </SectionCardGeneric>
</template>

<script>
import { formatDate, formatDateTime } from '@/services/utils/dayjs.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ImagePreview from '@/components/prime-vue/ImagePreview.vue'

export default {
  name: 'PlanInfoSection',

  components: {
    SectionCardGeneric,
    ImagePreview
  },

  props: {
    info: {
      type: Object,
      required: true
    }
  },

  methods: {
    formatDate(date) {
      return date ? formatDate(date) : '-'
    },
    formatDateTime(date) {
      return date ? formatDateTime(date) : '-'
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/mixin.scss';

.plan-info-section__layout {
  display: flex;
  gap: var(--sp-xl);
  align-items: flex-start;
  flex-wrap: wrap;
}

.plan-info-section__fields {
  flex: 1;
  min-width: 0;
  @include form-row-grid(4);
}

.plan-info-section__field {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.plan-info-section__label {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}

.plan-info-section__value {
  font-size: var(--fs-base);
  color: var(--base-font-color);
  font-weight: 600;
}
</style>
