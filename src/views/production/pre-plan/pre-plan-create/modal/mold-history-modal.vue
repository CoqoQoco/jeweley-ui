<template>
  <modal
    :showModal="isShow"
    @closeModal="$emit('closeModal')"
    width="95vw"
    :isShowActionPart="true"
  >
    <template #title>
      <span class="title-text-lg px-3 pt-3 d-block">
        <i class="bi bi-clock-history mr-2"></i>
        ประวัติการผลิตของแม่พิมพ์ {{ moldCode }}
      </span>
    </template>

    <template #content>
      <MoldHistoryContent
        :moldCode="moldCode"
        :currentMaterialsCount="currentMaterialsCount"
        :isShow="isShow"
        @apply-materials="$emit('apply-materials', $event); $emit('closeModal')"
        @close="$emit('closeModal')"
      />
    </template>

    <template #action>
      <button type="button" class="btn btn-sm btn-outline-main" @click="$emit('closeModal')">{{ $t('common.btn.close') }}</button>
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import MoldHistoryContent from './mold-history-content.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

export default {
  name: 'MoldHistoryModal',

  components: { modal, MoldHistoryContent },

  props: {
    isShow: {
      type: Boolean,
      default: false,
    },
    moldCode: {
      type: String,
      default: '',
    },
    currentMaterialsCount: {
      type: Number,
      default: 0,
    },
  },

  emits: ['closeModal', 'apply-materials'],
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
