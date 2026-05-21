<template>
  <div class="d-flex justify-content-end responsive-btn-group">
    <button
      v-if="status === 'Draft' || !status"
      class="btn btn-sm btn-main"
      @click="$emit('submit')"
    >
      <i class="bi bi-send"></i> ส่งอนุมัติ
    </button>
    <button
      v-if="isEditable"
      class="btn btn-sm btn-outline-main"
      @click="$emit('save-draft')"
    >
      <i class="bi bi-save"></i>
      {{ status === 'Draft' || !status ? 'บันทึกร่าง' : 'บันทึก' }}
    </button>
    <button
      class="btn btn-sm btn-green"
      :disabled="!hasItems"
      @click="$emit('print-pdf')"
      title="พิมพ์ใบสั่งผลิต"
    >
      <i class="bi bi-printer"></i> พิมพ์ใบสั่งผลิต
    </button>
    <button
      class="btn btn-sm btn-outline-main"
      @click="$router.push({ name: 'pre-plan-list' })"
    >
      <i class="bi bi-x"></i> ยกเลิก
    </button>
  </div>
</template>

<script>
import { isEditableStatus } from '@/constants/pre-plan-status.js'

export default {
  name: 'FooterActions',
  props: {
    isEditMode: { type: Boolean, default: false },
    status: { type: String, default: 'Draft' },
    hasItems: { type: Boolean, default: false },
  },
  emits: ['save-draft', 'submit', 'print-pdf'],
  computed: {
    isEditable() {
      return isEditableStatus(this.status)
    },
  },
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';
</style>
