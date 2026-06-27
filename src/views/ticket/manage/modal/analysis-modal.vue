<template>
  <modal
    :showModal="isShow"
    @closeModal="$emit('closeModal')"
    width="640px"
    :clickToClose="true"
    :isShowActionPart="true"
    headerVariant="main"
  >
    <template #title>
      <span class="title-text-lg d-block">{{ $t('view.ticket.field.latestAnalysis') }}</span>
    </template>

    <template #content>
      <div class="p-3">
        <div class="mb-3">
          <div class="ticket-ref">{{ ticket.ticketNo }} — {{ ticket.title }}</div>
        </div>

        <div v-if="ticket.latestAnalysis" class="analysis-text-box">{{ ticket.latestAnalysis }}</div>
        <div v-else class="analysis-empty">{{ $t('view.ticket.thread.empty') }}</div>
      </div>
    </template>

    <template #action>
      <ButtonGeneric
        variant="outline"
        :label="$t('common.btn.close')"
        @click="$emit('closeModal')"
      />
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'

import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

export default {
  name: 'AnalysisModal',

  components: {
    modal,
    ButtonGeneric
  },

  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    ticket: {
      type: Object,
      default: () => ({})
    }
  },

  emits: ['closeModal']
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';

.ticket-ref {
  font-weight: 600;
  color: var(--base-font-color);
  font-size: var(--fs-base);
  padding: var(--sp-sm) var(--sp-md);
  background: var(--color-highlight-bg);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.analysis-text-box {
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 400px;
  overflow-y: auto;
  padding: var(--sp-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--fs-base);
  line-height: var(--lh-md);
  color: var(--base-font-color);
  background: var(--color-card-bg);
}

.analysis-empty {
  color: var(--base-font-color);
  font-size: var(--fs-base);
  opacity: 0.6;
  padding: var(--sp-md);
  text-align: center;
}
</style>
