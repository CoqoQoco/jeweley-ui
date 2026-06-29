<template>
  <modal
    :showModal="isShow"
    width="900px"
    :fitHeight="true"
    :clickToClose="true"
    @closeModal="$emit('closeModal')"
  >
    <template #title>
      <span class="title-text-lg px-3 pt-3 d-block">{{ $t('view.downloads.manual.title') }}</span>
    </template>

    <template #content>
      <div class="p-3">
        <h6 class="section-heading">{{ $t('view.downloads.manual.sectionInstall') }}</h6>

        <div class="item-card">
          <div class="item-card-header">
            <span class="step-number">1</span>
            <span class="step-title">{{ $t('view.downloads.manual.step1Title') }}</span>
          </div>
          <div class="item-card-body">
            <p class="step-desc">{{ $t('view.downloads.manual.step1Desc') }}</p>
          </div>
        </div>

        <div class="item-card">
          <div class="item-card-header">
            <span class="step-number">2</span>
            <span class="step-title">{{ $t('view.downloads.manual.step2Title') }}</span>
          </div>
          <div class="item-card-body">
            <p class="step-desc">{{ $t('view.downloads.manual.step2Desc') }}</p>
          </div>
        </div>

        <div class="item-card">
          <div class="item-card-header">
            <span class="step-number">3</span>
            <span class="step-title">{{ $t('view.downloads.manual.step3Title') }}</span>
          </div>
          <div class="item-card-body">
            <p class="step-desc">{{ $t('view.downloads.manual.step3Desc') }}</p>
          </div>
        </div>

        <div class="item-card">
          <div class="item-card-header">
            <span class="step-number">4</span>
            <span class="step-title">{{ $t('view.downloads.manual.step4Title') }}</span>
          </div>
          <div class="item-card-body">
            <p class="step-desc">{{ $t('view.downloads.manual.step4Desc') }}</p>
          </div>
        </div>

        <div class="item-card">
          <div class="item-card-header">
            <span class="step-number">5</span>
            <span class="step-title">{{ $t('view.downloads.manual.step5Title') }}</span>
          </div>
          <div class="item-card-body">
            <p class="step-desc">{{ $t('view.downloads.manual.step5Desc') }}</p>
          </div>
        </div>

        <h6 class="section-heading mt-4">{{ $t('view.downloads.manual.sectionTrouble') }}</h6>

        <div class="item-card">
          <div class="item-card-body">
            <ul class="trouble-list">
              <li class="step-desc">{{ $t('view.downloads.manual.trouble1') }}</li>
              <li class="step-desc">{{ $t('view.downloads.manual.trouble2') }}</li>
              <li class="step-desc">{{ $t('view.downloads.manual.trouble3') }}</li>
            </ul>
          </div>
        </div>
      </div>
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

export default {
  name: 'PrintBridgeManualView',

  components: { modal },

  props: {
    isShow: {
      type: Boolean,
      default: false
    }
  },

  emits: ['closeModal']
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';

.section-heading {
  color: var(--base-font-color);
  font-weight: 600;
  padding-bottom: var(--sp-sm);
  border-bottom: 1px solid var(--color-border);
  background: transparent !important;
  margin-bottom: var(--sp-lg);
}

.item-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  margin-bottom: var(--sp-lg);
  overflow: hidden;
}

.item-card-header {
  background: var(--color-highlight-bg);
  color: var(--base-font-color);
  padding: var(--sp-md) var(--sp-lg);
  display: flex;
  align-items: center;
  gap: var(--sp-md);
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
  font-size: var(--fs-sm);
  font-weight: 700;
  flex-shrink: 0;
}

.step-title {
  font-weight: 600;
  font-size: 0.95rem;
}

.item-card-body {
  padding: var(--sp-md) var(--sp-lg);
}

.step-desc {
  margin-bottom: var(--sp-sm);
  font-size: var(--fs-base);
  color: var(--base-font-color);
  line-height: var(--lh-md);
  opacity: 0.85;

  &:last-child {
    margin-bottom: 0;
  }
}

.trouble-list {
  margin: 0;
  padding-left: var(--sp-xl);

  li {
    margin-bottom: var(--sp-sm);
  }
}
</style>
