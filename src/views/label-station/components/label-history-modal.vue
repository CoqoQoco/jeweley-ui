<template>
  <div>
    <modal
      :showModal="isShow"
      @closeModal="$emit('closeModal')"
      width="1100px"
      :fitHeight="true"
      :isShowActionPart="false"
    >
      <template #title>
        <span class="title-text-lg px-3 pt-3 d-block">{{ $t('view.labelStation.historyTitle') }}</span>
      </template>

      <template #content>
        <div>
          <LabelHistoryTable v-if="isShow" />
        </div>
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

import LabelHistoryTable from './label-history-table.vue'

export default {
  name: 'LabelHistoryModal',

  components: {
    modal,
    LabelHistoryTable
  },

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
</style>
