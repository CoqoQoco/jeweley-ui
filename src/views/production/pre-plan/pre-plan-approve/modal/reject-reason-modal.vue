<template>
  <modal
    :showModal="isShow"
    @closeModal="$emit('closeModal')"
    width="500px"
    :isShowActionPart="true"
  >
    <template #title>
      <span class="title-text-lg px-3 pt-3 d-block">ระบุเหตุผลการปฏิเสธ</span>
    </template>
    <template #content>
      <div class="p-3">
        <span class="title-text">เหตุผล <span class="text-danger">*</span></span>
        <textarea
          class="form-control mt-1"
          v-model="reason"
          rows="4"
          placeholder="ระบุเหตุผลการปฏิเสธ..."
        ></textarea>
      </div>
    </template>
    <template #action>
      <button class="btn btn-sm btn-red" @click="onSubmit">
        <i class="bi bi-x-lg"></i> ปฏิเสธ
      </button>
      <button class="btn btn-sm btn-outline-main ms-2" @click="$emit('closeModal')">
        ยกเลิก
      </button>
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import { warning } from '@/services/alert/sweetAlerts.js'

const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))

export default {
  name: 'RejectReasonModal',
  components: { modal },
  props: {
    isShow: { type: Boolean, default: false },
  },
  emits: ['closeModal', 'submit'],
  data() {
    return { reason: '' }
  },
  watch: {
    isShow(val) {
      if (val) this.reason = ''
    },
  },
  methods: {
    onSubmit() {
      if (!this.reason.trim()) {
        warning('กรุณาระบุเหตุผลการปฏิเสธ', 'ข้อมูลไม่ครบ')
        return
      }
      this.$emit('submit', this.reason.trim())
    },
  },
}
</script>

<style lang="scss" scoped>
textarea.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.9rem;
  resize: vertical;

  &:focus {
    border-color: var(--base-font-color);
    box-shadow: none;
    outline: none;
  }
}
</style>
