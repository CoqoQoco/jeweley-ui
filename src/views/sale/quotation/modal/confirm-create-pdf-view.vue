<template>
  <modal :showModal="isShowModal" @closeModal="onCancel" width="400px">
    <template v-slot:content>
      <div class="p-3">
        <div class="title-text-lg mb-3">
          <span><i class="bi bi-file-earmark-pdf mr-2"></i></span>
          <span>ยืนยันการสร้าง PDF ใบเสนอราคา</span>
        </div>
        <div class="form-group mb-3">
          <span class="title-text" for="itemsPerPageInput"
            >จำนวนรายการต่อหน้า (Items per page):</span
          >
          <input
            id="itemsPerPageInput"
            v-model.number="itemsPerPage"
            type="number"
            min="1"
            max="50"
            class="form-control"
            style="width: 25%"
          />
        </div>
        <div class="d-flex justify-content-end mt-4">
          <button class="btn btn-main" @click="onConfirm">
            <span><i class="bi bi-calendar-check"></i></span>
            <span class="ml-2">ยืนยัน</span>
          </button>
        </div>
      </div>
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'
const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))

export default {
  name: 'ConfirmCreatePdfView',

  components: {
    modal
  },

  props: {
    showModal: { type: Boolean, default: false },
    defaultItemsPerPage: { type: Number, default: 10 }
  },

  data() {
    return {
      isShowModal: this.showModal,
      itemsPerPage: this.defaultItemsPerPage
    }
  },
  watch: {
    showModal(val) {
      this.isShowModal = val
    },
    isShowModal(val) {
      if (!val) this.$emit('closeModal')
    }
  },
  methods: {
    onConfirm() {
      this.$emit('confirm', this.itemsPerPage)
      this.isShowModal = false
    },
    onCancel() {
      this.isShowModal = false
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.title-text-lg-bg {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--base-font-color);
  display: flex;
  align-items: center;
}
</style>
