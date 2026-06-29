<template>
  <Teleport to="body">
    <Transition name="preview-panel">
      <div v-if="isShowModal" class="pdf-preview-panel">
        <div class="preview-panel-header">
          <span class="preview-panel-title">
            <i class="bi bi-eye mr-2"></i>
            {{ $t('view.sale.invoiceDetail.previewTitle') }}
          </span>
          <button class="preview-panel-close" type="button" @click="closeModal" :title="$t('common.btn.close')">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="preview-panel-content">
          <iframe
            v-if="previewUrl"
            :src="previewUrl"
            class="pdf-preview-frame"
          ></iframe>
        </div>

        <div class="preview-panel-footer">
          <button class="btn btn-sm btn-green mr-2" type="button" @click="$emit('download')">
            <i class="bi bi-download mr-1"></i>
            {{ $t('view.sale.invoiceDetail.downloadBtn') }}
          </button>
          <button class="btn btn-sm btn-outline-main" type="button" @click="closeModal">
            <i class="bi bi-x-circle mr-1"></i>
            {{ $t('common.btn.close') }}
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
export default {
  name: 'InvoicePdfPreviewModal',

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
.pdf-preview-panel {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 1001;
  width: calc(100vw - 820px);
  max-width: 900px;
  min-width: 420px;
  background: var(--color-card-bg);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.preview-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--sp-md) var(--sp-lg);
  background: var(--base-font-color);
  color: #ffffff;
  flex-shrink: 0;
}

.preview-panel-title {
  font-size: var(--fs-lg);
  font-weight: 700;
}

.preview-panel-close {
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 1.1rem;
  cursor: pointer;
  padding: var(--sp-xs);
  line-height: 1;
  border-radius: var(--radius-sm);
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
}

.preview-panel-content {
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
}

.pdf-preview-frame {
  flex: 1;
  width: 100%;
  height: 100%;
  min-height: 400px;
  border: none;
}

.preview-panel-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: var(--sp-md) var(--sp-lg);
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;
}

.preview-panel-enter-from,
.preview-panel-leave-to {
  transform: translateX(-100%);
}

.preview-panel-enter-active,
.preview-panel-leave-active {
  transition: transform 0.35s ease;
}
</style>
