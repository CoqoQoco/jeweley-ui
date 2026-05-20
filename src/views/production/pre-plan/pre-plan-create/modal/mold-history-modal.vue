<template>
  <Dialog
    :visible="isShow"
    @update:visible="(v) => !v && $emit('closeModal')"
    :style="{ width: '95vw', height: '90vh' }"
    :modal="true"
    :closable="true"
    :draggable="false"
  >
    <template #header>
      <span class="title-text-lg">
        <i class="bi bi-clock-history mr-2"></i>
        ประวัติการผลิตของแม่พิมพ์ {{ moldCode }}
      </span>
    </template>

    <MoldHistoryContent
      :moldCode="moldCode"
      :currentMaterialsCount="currentMaterialsCount"
      :isShow="isShow"
      @apply-materials="$emit('apply-materials', $event); $emit('closeModal')"
      @close="$emit('closeModal')"
    />

    <template #footer>
      <button type="button" class="btn btn-sm btn-outline-main" @click="$emit('closeModal')">ปิด</button>
    </template>
  </Dialog>
</template>

<script>
import Dialog from 'primevue/dialog'
import MoldHistoryContent from './mold-history-content.vue'

export default {
  name: 'MoldHistoryModal',

  components: { Dialog, MoldHistoryContent },

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
