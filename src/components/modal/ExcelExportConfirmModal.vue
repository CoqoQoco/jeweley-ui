<template>
  <div>
    <modal
      :showModal="isShowModal"
      @closeModal="closeModal"
      width="560px"
    >
      <template #title>
        <div class="title-text-lg-bg">
          <i class="bi bi-file-earmark-excel mr-2"></i>
          <span>{{ title }}</span>
        </div>
      </template>

      <template #content>
        <div class="p-3">
          <!-- Document Number -->
          <div class="form-group mb-3">
            <span class="title-text">{{ numberLabel }}</span>
            <input
              v-model.trim="form.documentNumber"
              type="text"
              class="form-control bg-input mt-1"
              :placeholder="numberLabel"
            />
            <small class="text-muted">ค่าเดิม: {{ documentNumber || '-' }}</small>
          </div>

          <!-- Document Date -->
          <div class="form-group mb-3">
            <span class="title-text">{{ dateLabel }}</span>
            <CalendarGeneric
              v-model="form.documentDate"
              dateFormat="dd/mm/yy"
              :placeholder="dateLabel"
              :showIcon="true"
              :showButtonBar="true"
              customClass="w-100 mt-1"
            />
            <small class="text-muted">ค่าเดิม: {{ formatDate(documentDate) }}</small>
          </div>

          <!-- Info notice -->
          <div class="notice-box">
            <i class="bi bi-info-circle mr-2"></i>
            <span>การเปลี่ยนแปลงข้อมูลนี้มีผลเฉพาะเอกสาร Excel ที่ Export เท่านั้น ข้อมูลในระบบจะไม่เปลี่ยนแปลง</span>
          </div>

          <!-- Actions -->
          <div class="d-flex justify-content-end mt-3" style="gap: 8px;">
            <button class="btn btn-sm btn-outline-main" type="button" @click="closeModal">
              ยกเลิก
            </button>
            <button class="btn btn-sm btn-main" type="button" @click="onConfirm">
              <i class="bi bi-file-earmark-excel mr-1"></i>
              Export Excel
            </button>
          </div>
        </div>
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'
import { warning } from '@/services/alert/sweetAlerts.js'
import dayjs from 'dayjs'

const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))

export default {
  name: 'ExcelExportConfirmModal',

  components: {
    modal,
    CalendarGeneric
  },

  props: {
    isShowModal: {
      type: Boolean,
      default: false
    },
    documentNumber: {
      type: String,
      default: ''
    },
    documentDate: {
      type: [Date, String],
      default: null
    },
    numberLabel: {
      type: String,
      default: 'Document Number'
    },
    dateLabel: {
      type: String,
      default: 'Document Date'
    },
    title: {
      type: String,
      default: 'ยืนยันการ Export Excel'
    }
  },

  emits: ['close-modal', 'confirm-export'],

  data() {
    return {
      form: {
        documentNumber: '',
        documentDate: null
      }
    }
  },

  watch: {
    isShowModal(val) {
      if (val) this.initForm()
    }
  },

  methods: {
    initForm() {
      this.form = {
        documentNumber: this.documentNumber || '',
        documentDate: this.documentDate ? new Date(this.documentDate) : new Date()
      }
    },

    closeModal() {
      this.$emit('close-modal')
    },

    onConfirm() {
      if (!this.form.documentNumber || !this.form.documentNumber.trim()) {
        warning(`กรุณากรอก ${this.numberLabel}`, 'ข้อมูลไม่ครบถ้วน')
        return
      }
      if (!this.form.documentDate) {
        warning(`กรุณาเลือก ${this.dateLabel}`, 'ข้อมูลไม่ครบถ้วน')
        return
      }

      const normalizedDate = new Date(this.form.documentDate)
      normalizedDate.setHours(0, 0, 0, 0)

      this.$emit('confirm-export', {
        documentNumber: this.form.documentNumber.trim(),
        documentDate: normalizedDate
      })
      this.closeModal()
    },

    formatDate(date) {
      if (!date) return '-'
      return dayjs(date).format('DD/MM/YYYY')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.notice-box {
  padding: 8px 12px;
  background: #f7f7f7;
  border-left: 3px solid var(--base-green);
  border-radius: 4px;
  font-size: 13px;
  color: #555;
  display: flex;
  align-items: flex-start;

  i {
    color: var(--base-green);
    font-size: 14px;
    margin-top: 1px;
    flex-shrink: 0;
  }
}
</style>
