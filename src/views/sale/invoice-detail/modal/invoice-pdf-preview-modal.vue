<template>
  <div>
    <modal :showModal="isShowModal" @closeModal="closeModal" :width="'900px'">
      <template v-slot:content>
        <div>
          <div class="title-text-lg-bg">
            <i class="bi bi-eye mr-2"></i>
            <span>{{ $t('view.sale.invoiceDetail.previewTitle') }}</span>
          </div>

          <div class="p-3">
            <iframe
              v-if="previewUrl"
              :src="previewUrl"
              class="pdf-preview-frame"
            ></iframe>

            <div class="btn-submit-container mt-3">
              <div class="d-flex justify-content-end">
                <button class="btn btn-green mr-2" type="button" @click="$emit('download')">
                  <i class="bi bi-download mr-1"></i>
                  {{ $t('view.sale.invoiceDetail.downloadBtn') }}
                </button>

                <button class="btn btn-outline-main" type="button" @click="closeModal">
                  <i class="bi bi-x-circle mr-1"></i>
                  {{ $t('common.btn.close') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

export default {
  name: 'InvoicePdfPreviewModal',

  components: { modal },

  props: {
    isShowModal: {
      type: Boolean,
      default: false
    },
    previewUrl: {
      type: String,
      default: ''
    }
  },

  emits: ['close-modal', 'download'],

  methods: {
    closeModal() {
      this.$emit('close-modal')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form';

.pdf-preview-frame {
  width: 100%;
  height: calc(100vh - 240px);
  min-height: 500px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
}
</style>
