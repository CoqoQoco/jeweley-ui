<template>
  <modal
    :showModal="isShow"
    @closeModal="$emit('closeModal')"
    width="900px"
    :fitHeight="true"
    :clickToClose="true"
  >
    <template #title>
      <span class="title-text-lg px-3 pt-3 d-block">{{ $t('view.ticket.manual.title') }}</span>
    </template>

    <template #content>
      <div class="p-3">
        <div class="item-card">
          <div class="item-card-header">
            <span class="step-number">1</span>
            <span class="step-title">{{ $t('view.ticket.manual.step1Title') }}</span>
          </div>
          <div class="item-card-body">
            <p class="step-desc">{{ $t('view.ticket.manual.step1Desc') }}</p>
            <img :src="imgSelectType" :alt="$t('view.ticket.manual.step1Title')" class="manual-img" />
          </div>
        </div>

        <div class="item-card">
          <div class="item-card-header">
            <span class="step-number">2</span>
            <span class="step-title">{{ $t('view.ticket.manual.step2Title') }}</span>
          </div>
          <div class="item-card-body">
            <p class="step-desc">{{ $t('view.ticket.manual.step2Desc') }}</p>
            <img :src="imgSelectTopic" :alt="$t('view.ticket.manual.step2Title')" class="manual-img" />
          </div>
        </div>

        <div class="item-card">
          <div class="item-card-header">
            <span class="step-number">3</span>
            <span class="step-title">{{ $t('view.ticket.manual.step3Title') }}</span>
          </div>
          <div class="item-card-body">
            <p class="step-desc">{{ $t('view.ticket.manual.step3Desc') }}</p>
            <img :src="imgFillForm" :alt="$t('view.ticket.manual.step3Title')" class="manual-img" />
          </div>
        </div>

        <div class="item-card">
          <div class="item-card-header">
            <span class="step-number">4</span>
            <span class="step-title">{{ $t('view.ticket.manual.step4Title') }}</span>
          </div>
          <div class="item-card-body">
            <p class="step-desc">{{ $t('view.ticket.manual.step4Desc') }}</p>
            <img :src="imgAttachScreenshot" :alt="$t('view.ticket.manual.step4Title')" class="manual-img" />
          </div>
        </div>

        <div class="item-card">
          <div class="item-card-header">
            <span class="step-number">5</span>
            <span class="step-title">{{ $t('view.ticket.manual.step5Title') }}</span>
          </div>
          <div class="item-card-body">
            <p class="step-desc">{{ $t('view.ticket.manual.step5Desc') }}</p>
            <img :src="imgSubmit" :alt="$t('view.ticket.manual.step5Title')" class="manual-img" />
          </div>
        </div>
      </div>
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'

import imgSelectType from '@/assets/manuals/ticket/01-select-type.png'
import imgSelectTopic from '@/assets/manuals/ticket/02-select-topic.png'
import imgFillForm from '@/assets/manuals/ticket/03-fill-form.png'
import imgAttachScreenshot from '@/assets/manuals/ticket/04-attach-screenshot.png'
import imgSubmit from '@/assets/manuals/ticket/05-submit.png'

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
      imgSelectType,
      imgSelectTopic,
      imgFillForm,
      imgAttachScreenshot,
      imgSubmit
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
