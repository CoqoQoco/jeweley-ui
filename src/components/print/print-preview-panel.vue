<template>
  <Teleport to="body">
    <Transition name="preview-panel">
      <div v-if="isShow" class="print-preview-shell">
        <div class="preview-panel-header">
          <span class="preview-panel-title">
            <i class="bi bi-eye mr-2"></i>
            {{ title }}
          </span>
          <button class="preview-panel-close" type="button" @click="onClose" :title="$t('common.btn.close')">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div v-if="$slots.toolbar" class="preview-panel-toolbar">
          <slot name="toolbar"></slot>
        </div>

        <div class="preview-panel-content">
          <slot></slot>
        </div>

        <div v-if="$slots.footer" class="preview-panel-footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
export default {
  name: 'PrintPreviewPanel',

  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    }
  },

  emits: ['close'],

  methods: {
    onClose() {
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
.print-preview-shell {
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
    background: var(--overlay-white-solid);
  }
}

.preview-panel-toolbar {
  flex-shrink: 0;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-highlight-bg);
}

.preview-panel-content {
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
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
