<template>
  <modal :showModal="isShowModal" @closeModal="closeModal" width="500px">
    <template v-slot:content>
      <div class="title-text-lg-header mb-3">
        <i class="bi bi-upload mr-2"></i>
        <span>Upload เอกสาร PDF</span>
      </div>

      <form @submit.prevent="onSubmit" class="p-2">
        <!-- เลือกไฟล์ -->
        <div class="mb-3">
          <span class="title-text">ไฟล์ PDF <span class="text-danger">*</span></span>
          <input
            type="file"
            accept=".pdf"
            class="form-control bg-input"
            @change="onFileChange"
            ref="fileInput"
          />
          <small v-if="form.file" class="text-muted">{{ form.file.name }} ({{ fileSizeLabel }})</small>
        </div>

        <div class="form-col-container">
          <!-- เดือน -->
          <div>
            <span class="title-text">เดือน <span class="text-danger">*</span></span>
            <select class="form-control bg-input" v-model="form.month" required>
              <option :value="null" disabled>เลือกเดือน</option>
              <option v-for="m in months" :key="m.value" :value="m.value">{{ m.label }}</option>
            </select>
          </div>

          <!-- ปี -->
          <div>
            <span class="title-text">ปี <span class="text-danger">*</span></span>
            <select class="form-control bg-input" v-model="form.year" required>
              <option :value="null" disabled>เลือกปี</option>
              <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
            </select>
          </div>
        </div>

        <!-- Tags -->
        <div class="mt-2">
          <span class="title-text">Tags</span>
          <input
            class="form-control bg-input"
            type="text"
            v-model.trim="form.tags"
            placeholder="เช่น approved, Q1, pending (คั่นด้วยลูกน้ำ)"
          />
        </div>

        <!-- หมายเหตุ -->
        <div class="mt-2">
          <span class="title-text">หมายเหตุ</span>
          <textarea
            class="form-control bg-input"
            v-model.trim="form.remark"
            rows="2"
            placeholder="หมายเหตุ (ถ้ามี)"
          ></textarea>
        </div>

        <div class="btn-submit-container mt-3">
          <button class="btn btn-sm btn-main mr-2" type="submit">
            <i class="bi bi-save mr-1"></i>บันทึก
          </button>
          <button class="btn btn-sm btn-outline-main" type="button" @click="closeModal">
            ยกเลิก
          </button>
        </div>
      </form>
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import { useSaleDocumentStore } from '@/stores/modules/api/sale/sale-document-store.js'
import { success, warning } from '@/services/alert/sweetAlerts.js'

const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))

const MONTHS = [
  { value: 1, label: 'มกราคม' }, { value: 2, label: 'กุมภาพันธ์' },
  { value: 3, label: 'มีนาคม' }, { value: 4, label: 'เมษายน' },
  { value: 5, label: 'พฤษภาคม' }, { value: 6, label: 'มิถุนายน' },
  { value: 7, label: 'กรกฎาคม' }, { value: 8, label: 'สิงหาคม' },
  { value: 9, label: 'กันยายน' }, { value: 10, label: 'ตุลาคม' },
  { value: 11, label: 'พฤศจิกายน' }, { value: 12, label: 'ธันวาคม' }
]

const interfaceForm = {
  file: null,
  month: null,
  year: null,
  tags: null,
  remark: null
}

export default {
  name: 'SaleDocumentUploadModal',

  components: { modal },

  emits: ['close', 'saved'],

  props: {
    isShowModal: {
      type: Boolean,
      default: false
    }
  },

  setup() {
    const store = useSaleDocumentStore()
    return { store }
  },

  data() {
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1
    return {
      form: { ...interfaceForm, month: currentMonth, year: currentYear },
      months: MONTHS,
      years: Array.from({ length: 4 }, (_, i) => currentYear - i)
    }
  },

  computed: {
    fileSizeLabel() {
      if (!this.form.file) return ''
      const kb = this.form.file.size / 1024
      return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(0)} KB`
    }
  },

  methods: {
    onFileChange(e) {
      this.form.file = e.target.files[0] || null
    },

    async onSubmit() {
      if (!this.form.file) {
        warning('กรุณาเลือกไฟล์ PDF', 'ข้อมูลไม่ครบ')
        return
      }
      if (!this.form.month || !this.form.year) {
        warning('กรุณาเลือกเดือนและปี', 'ข้อมูลไม่ครบ')
        return
      }

      const formData = new FormData()
      formData.append('File', this.form.file)
      formData.append('DocumentMonth', this.form.month)
      formData.append('DocumentYear', this.form.year)
      if (this.form.tags) formData.append('Tags', this.form.tags)
      if (this.form.remark) formData.append('Remark', this.form.remark)

      await this.store.uploadDocument(formData)
      success('Upload เอกสารสำเร็จ')
      this.$emit('saved')
      this.closeModal()
    },

    closeModal() {
      this.form = {
        ...interfaceForm,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
      }
      if (this.$refs.fileInput) this.$refs.fileInput.value = ''
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
