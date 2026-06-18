<template>
  <modal :showModal="isShowModal" @closeModal="closeModal" width="500px">
    <template v-slot:content>
      <div class="title-text-lg-header mb-3">
        <i class="bi bi-upload mr-2"></i>
        <span>{{ $t('view.sale.document.uploadTitle') }}</span>
      </div>

      <form @submit.prevent="onSubmit" class="p-2">
        <!-- เลือกไฟล์ -->
        <div class="mb-3">
          <span class="title-text">{{ $t('view.sale.document.pdfFile') }} <span class="text-danger">*</span></span>
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
            <span class="title-text">{{ $t('view.sale.document.month') }} <span class="text-danger">*</span></span>
            <select class="form-control bg-input" v-model="form.month" required>
              <option :value="null" disabled>{{ $t('view.sale.document.selectMonth') }}</option>
              <option v-for="m in monthOptions" :key="m.value" :value="m.value">{{ m.label }}</option>
            </select>
          </div>

          <!-- ปี -->
          <div>
            <span class="title-text">{{ $t('view.sale.document.year') }} <span class="text-danger">*</span></span>
            <select class="form-control bg-input" v-model="form.year" required>
              <option :value="null" disabled>{{ $t('view.sale.document.selectYear') }}</option>
              <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
            </select>
          </div>
        </div>

        <!-- Tags -->
        <div class="mt-2">
          <span class="title-text">{{ $t('view.sale.document.tags') }}</span>
          <InputTextGeneric
            v-model="form.tags"
            :trim="true"
            :placeholder="$t('view.sale.document.placeholder.tagsExample')"
          />
        </div>

        <!-- หมายเหตุ -->
        <div class="mt-2">
          <span class="title-text">{{ $t('view.sale.document.remark') }}</span>
          <TextareaGeneric
            v-model="form.remark"
            :rows="2"
            :placeholder="$t('view.sale.document.placeholder.remarkOptional')"
          />
        </div>

        <div class="btn-submit-container mt-3">
          <ButtonGeneric variant="main" type="submit" icon="bi-save" :label="$t('common.btn.save')" />
          <ButtonGeneric variant="outline" type="button" :label="$t('common.btn.cancel')" class="ml-2" @click="closeModal" />
        </div>
      </form>
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import { useSaleDocumentStore } from '@/stores/modules/api/sale/sale-document-store.js'
import { success, warning } from '@/services/alert/sweetAlerts.js'

import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import TextareaGeneric from '@/components/generic/TextareaGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

const interfaceForm = {
  file: null,
  month: null,
  year: null,
  tags: null,
  remark: null
}

const MONTH_KEYS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

export default {
  name: 'SaleDocumentUploadModal',

  components: { modal, InputTextGeneric, TextareaGeneric, ButtonGeneric },

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
      years: Array.from({ length: 4 }, (_, i) => currentYear - i)
    }
  },

  computed: {
    monthOptions() {
      return MONTH_KEYS.map((key, index) => ({
        value: index + 1,
        label: this.$t(`view.sale.document.months.${key}`)
      }))
    },

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
        warning(this.$t('view.sale.document.validation.pdfRequired'), this.$t('common.label.incompleteData'))
        return
      }
      if (!this.form.month || !this.form.year) {
        warning(this.$t('view.sale.document.validation.monthYearRequired'), this.$t('common.label.incompleteData'))
        return
      }

      const formData = new FormData()
      formData.append('File', this.form.file)
      formData.append('DocumentMonth', this.form.month)
      formData.append('DocumentYear', this.form.year)
      if (this.form.tags) formData.append('Tags', this.form.tags)
      if (this.form.remark) formData.append('Remark', this.form.remark)

      await this.store.uploadDocument(formData)
      success(this.$t('view.sale.document.success.upload'))
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
