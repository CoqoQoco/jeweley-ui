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
        <div class="form-group mb-3">
          <div class="d-flex align-items-center" style="gap: 8px; cursor: pointer" @click="showCifLabel = !showCifLabel">
            <input
              id="showCifLabelInput"
              type="checkbox"
              v-model="showCifLabel"
              style="width: 16px; height: 16px; cursor: pointer"
            />
            <span class="title-text" for="showCifLabelInput" style="cursor: pointer">แสดงป้าย C.I.F</span>
          </div>
        </div>
        <div class="d-flex justify-content-end mt-4">
          <button class="btn btn-sm btn-green mr-2" @click="onConfirm">
            <span><i class="bi bi-calendar-check"></i></span>
            <span class="ml-2">Confirm</span>
          </button>
          <button
            v-if="quotationNumber && quotationNumber.trim() !== ''"
            class="btn btn-sm btn-main"
            @click="onSaveAndCreate"
          >
            <span><i class="bi bi-save"></i></span>
            <span class="ml-2">Save And Confirm</span>
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
    defaultItemsPerPage: { type: Number, default: 10 },
    quotationNumber: { type: String, default: '' } // เพิ่ม prop รับเลขที่ quotation
  },

  data() {
    return {
      isShowModal: this.showModal,
      itemsPerPage: this.defaultItemsPerPage,
      showCifLabel: true
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
      this.$emit('confirm', this.itemsPerPage, this.showCifLabel)
      this.isShowModal = false
    },
    onSaveAndCreate() {
      this.$emit('saveAndCreate', this.itemsPerPage, this.showCifLabel)
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
