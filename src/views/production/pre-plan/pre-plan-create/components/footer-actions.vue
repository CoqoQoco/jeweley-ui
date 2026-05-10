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
      v-if="status === 'Draft' || !status"
      class="btn btn-sm btn-outline-main ms-2"
      @click="$emit('save-draft')"
    >
      <i class="bi bi-save"></i> บันทึกร่าง
    </button>
    <button
      class="btn btn-sm btn-outline-main ms-2"
      @click="$router.push({ name: 'pre-plan-list' })"
    >
      <i class="bi bi-x"></i> ยกเลิก
    </button>
  </div>
</template>

<script>
export default {
  name: 'FooterActions',
  props: {
    isEditMode: { type: Boolean, default: false },
    status: { type: String, default: 'Draft' },
  },
  emits: ['save-draft', 'submit'],
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';
</style>
