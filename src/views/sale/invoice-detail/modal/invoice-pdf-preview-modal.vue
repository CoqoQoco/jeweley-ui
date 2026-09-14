<template>
  <PrintPreviewPanel
    :isShow="isShowModal"
    :title="previewTitle"
    @close="closeModal"
  >
    <iframe
      v-if="previewUrl"
      :src="previewUrl"
      class="pdf-preview-frame"
    ></iframe>

    <template #footer>
      <button class="btn btn-sm btn-green mr-2" type="button" @click="$emit('download')">
        <i class="bi bi-download mr-1"></i>
        {{ $t('view.sale.invoiceDetail.downloadBtn') }}
      </button>
      <button class="btn btn-sm btn-outline-main" type="button" @click="closeModal">
        <i class="bi bi-x-circle mr-1"></i>
        {{ $t('common.btn.close') }}
      </button>
    </template>
  </PrintPreviewPanel>
</template>

<script>
import PrintPreviewPanel from '@/components/print/print-preview-panel.vue'

export default {
  name: 'InvoicePdfPreviewModal',

  components: {
    PrintPreviewPanel
  },

  props: {
    isShowModal: {
      type: Boolean,
      default: false
    },
    previewUrl: {
      type: String,
      default: ''
    },
    previewSource: {
      type: String,
      default: 'invoice'
    }
  },

  emits: ['close-modal', 'download'],

  computed: {
    // certificate มีชื่อ preview ของตัวเอง — paper type อื่นคงข้อความเดิมไว้ทั้งหมด
    previewTitle() {
      return this.previewSource === 'certificate'
        ? this.$t('view.sale.certificate.previewTitle')
        : this.$t('view.sale.invoiceDetail.previewTitle')
    }
  },

  methods: {
    closeModal() {
      this.$emit('close-modal')
    }
  }
}
</script>

<style lang="scss" scoped>
.pdf-preview-frame {
  flex: 1;
  width: 100%;
  height: 100%;
  min-height: 400px;
  border: none;
}
</style>
