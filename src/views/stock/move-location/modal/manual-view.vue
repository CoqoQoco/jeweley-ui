<template>
  <modal
    :showModal="isShow"
    @closeModal="$emit('closeModal')"
    width="900px"
    :fitHeight="true"
    :clickToClose="true"
  >
    <template #title>
      <span class="title-text-lg px-3 pt-3 d-block">{{ $t('view.stock.moveLocation.manualTitle') }}</span>
    </template>

    <template #content>
      <div class="p-3">
        <h6 class="section-heading">{{ $t('view.stock.moveLocation.sectionA') }}</h6>

        <div class="item-card">
          <div class="item-card-header">
            <span class="step-number">1</span>
            <span class="step-title">{{ $t('view.stock.moveLocation.step1Title') }}</span>
          </div>
          <div class="item-card-body">
            <p class="step-desc">{{ $t('view.stock.moveLocation.step1Desc') }}</p>
            <img :src="imgList" :alt="$t('view.stock.moveLocation.manual.imgList')" class="manual-img mb-2" />
            <img :src="imgSelect" :alt="$t('view.stock.moveLocation.manual.imgSelect')" class="manual-img" />
          </div>
        </div>

        <div class="item-card">
          <div class="item-card-header">
            <span class="step-number">2</span>
            <span class="step-title">{{ $t('view.stock.moveLocation.step2Title') }}</span>
          </div>
          <div class="item-card-body">
            <p class="step-desc">{{ $t('view.stock.moveLocation.step2Desc') }}</p>
            <img :src="imgModalTarget" :alt="$t('view.stock.moveLocation.manual.imgTarget')" class="manual-img" />
          </div>
        </div>

        <div class="item-card">
          <div class="item-card-header">
            <span class="step-number">3</span>
            <span class="step-title">{{ $t('view.stock.moveLocation.step3Title') }}</span>
          </div>
          <div class="item-card-body">
            <p class="step-desc">{{ $t('view.stock.moveLocation.step3Desc') }}</p>
            <img :src="imgConfirm" :alt="$t('view.stock.moveLocation.manual.imgConfirm')" class="manual-img" />
          </div>
        </div>

        <div class="item-card">
          <div class="item-card-header">
            <span class="step-number">4</span>
            <span class="step-title">{{ $t('view.stock.moveLocation.step4Title') }}</span>
          </div>
          <div class="item-card-body">
            <p class="step-desc">{{ $t('view.stock.moveLocation.step4Desc') }}</p>
            <img :src="imgSuccess" :alt="$t('view.stock.moveLocation.manual.imgSuccess')" class="manual-img" />
          </div>
        </div>

        <h6 class="section-heading mt-4">{{ $t('view.stock.moveLocation.sectionB') }}</h6>

        <div class="item-card">
          <div class="item-card-header">
            <span class="step-number">1</span>
            <span class="step-title">{{ $t('view.stock.moveLocation.stepB1Title') }}</span>
          </div>
          <div class="item-card-body">
            <p class="step-desc">{{ $t('view.stock.moveLocation.stepB1Desc') }}</p>
          </div>
        </div>

        <div class="item-card">
          <div class="item-card-header">
            <span class="step-number">2</span>
            <span class="step-title">{{ $t('view.stock.moveLocation.stepB2Title') }}</span>
          </div>
          <div class="item-card-body">
            <p class="step-desc">{{ $t('view.stock.moveLocation.stepB2Desc') }}</p>
            <img :src="imgTempForm" :alt="$t('view.stock.moveLocation.manual.imgTemp')" class="manual-img" />
          </div>
        </div>

        <div class="item-card">
          <div class="item-card-header">
            <span class="step-number">3</span>
            <span class="step-title">{{ $t('view.stock.moveLocation.stepB3Title') }}</span>
          </div>
          <div class="item-card-body">
            <p class="step-desc">{{ $t('view.stock.moveLocation.stepB3Desc') }}</p>
          </div>
        </div>
      </div>
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'

import imgList from '@/assets/manuals/move-location/01-list.png'
import imgSelect from '@/assets/manuals/move-location/02-select.png'
import imgModalTarget from '@/assets/manuals/move-location/03-modal-target.png'
import imgTempForm from '@/assets/manuals/move-location/04-temp-form.png'
import imgConfirm from '@/assets/manuals/move-location/05-confirm.png'
import imgSuccess from '@/assets/manuals/move-location/06-success.png'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

export default {
  name: 'ManualView',

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
      imgSelect,
      imgModalTarget,
      imgTempForm,
      imgConfirm,
      imgSuccess
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
