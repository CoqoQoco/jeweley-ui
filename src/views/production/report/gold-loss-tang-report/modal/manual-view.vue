<template>
  <modal
    :showModal="isShow"
    @closeModal="$emit('closeModal')"
    width="900px"
    :fitHeight="true"
    :clickToClose="true"
  >
    <template #title>
      <span class="title-text-lg px-3 pt-3 d-block">{{ $t('view.production.goldLossTang.manualTitle') }}</span>
    </template>

    <template #content>
      <div class="p-3">
        <h6 class="section-heading">{{ $t('view.production.goldLossTang.manualSectionUsage') }}</h6>

        <div class="item-card">
          <div class="item-card-header">
            <span class="step-number">1</span>
            <span class="step-title">{{ $t('view.production.goldLossTang.manualStep1Title') }}</span>
          </div>
          <div class="item-card-body">
            <p class="step-desc">{{ $t('view.production.goldLossTang.manualStep1Desc') }}</p>
            <img :src="imgList" :alt="$t('view.production.goldLossTang.manualImgList')" class="manual-img" />
          </div>
        </div>

        <div class="item-card">
          <div class="item-card-header">
            <span class="step-number">2</span>
            <span class="step-title">{{ $t('view.production.goldLossTang.manualStep2Title') }}</span>
          </div>
          <div class="item-card-body">
            <p class="step-desc">{{ $t('view.production.goldLossTang.manualStep2Desc') }}</p>
            <img :src="imgCreate" :alt="$t('view.production.goldLossTang.manualImgCreate')" class="manual-img" />
          </div>
        </div>

        <div class="item-card">
          <div class="item-card-header">
            <span class="step-number">3</span>
            <span class="step-title">{{ $t('view.production.goldLossTang.manualStep3Title') }}</span>
          </div>
          <div class="item-card-body">
            <p class="step-desc">{{ $t('view.production.goldLossTang.manualStep3Desc') }}</p>
            <img :src="imgDetail" :alt="$t('view.production.goldLossTang.manualImgDetail')" class="manual-img" />
          </div>
        </div>
      </div>
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'

import imgList from '@/assets/manuals/gold-loss-tang/01-list.png'
import imgCreate from '@/assets/manuals/gold-loss-tang/02-create.png'
import imgDetail from '@/assets/manuals/gold-loss-tang/03-detail.png'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

export default {
  name: 'GoldLossTangManualView',

  components: { modal },

  props: {
    isShow: {
      type: Boolean,
      default: false
    }
  },

  emits: ['closeModal'],

  data() {
    return {
      imgList,
      imgCreate,
      imgDetail
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';

.section-heading {
  color: var(--base-font-color);
  font-weight: 600;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
  background: transparent !important;
  margin-bottom: 16px;
}

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
  display: flex;
  align-items: center;
  gap: 10px;
}

.step-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--base-font-color);
  color: #ffffff;
  font-size: 0.8rem;
  font-weight: 700;
  flex-shrink: 0;
}

.step-title {
  font-weight: 600;
  font-size: 0.95rem;
}

.item-card-body {
  padding: 12px 16px;
}

.step-desc {
  margin-bottom: 10px;
  font-size: 0.9rem;
  color: #444;
  line-height: 1.6;
}

.manual-img {
  width: 100%;
  max-width: 820px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: rgba(0, 0, 0, 0.06) 0 2px 8px;
  display: block;
}
</style>
