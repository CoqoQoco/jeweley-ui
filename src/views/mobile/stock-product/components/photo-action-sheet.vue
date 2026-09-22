<template>
  <Teleport to="body">
    <div v-if="visible" class="photo-action-overlay">
      <div class="photo-action-container">
        <div class="photo-action-header">
          <h3 class="photo-action-title">
            <i class="bi bi-image"></i>
            {{ $t('view.mobile.stockProductPhotos.actionSheetTitle') }}
          </h3>
          <button type="button" class="btn-close-sheet" @click="onClose">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="photo-action-body">
          <div class="photo-action-preview">
            <ImagePreview v-if="image" :imageName="image.blobPath" :preview="false" :width="120" :height="120" />
          </div>

          <button v-if="!isPrimary" type="button" class="action-row" @click="$emit('set-primary')">
            <i class="bi bi-star-fill"></i>
            <span>{{ $t('view.mobile.stockProductPhotos.actionSetPrimary') }}</span>
          </button>

          <button type="button" class="action-row" :disabled="!canMoveLeft" @click="$emit('move-left')">
            <i class="bi bi-arrow-left-circle"></i>
            <span>{{ $t('view.mobile.stockProductPhotos.actionMoveLeft') }}</span>
          </button>

          <button type="button" class="action-row" :disabled="!canMoveRight" @click="$emit('move-right')">
            <i class="bi bi-arrow-right-circle"></i>
            <span>{{ $t('view.mobile.stockProductPhotos.actionMoveRight') }}</span>
          </button>

          <button type="button" class="action-row is-danger" @click="$emit('delete')">
            <i class="bi bi-trash"></i>
            <span>{{ $t('common.btn.delete') }}</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
import ImagePreview from '@/components/prime-vue/ImagePreview.vue'

export default {
  name: 'PhotoActionSheet',

  components: { ImagePreview },

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    image: {
      type: Object,
      default: null
    },
    isPrimary: {
      type: Boolean,
      default: false
    },
    canMoveLeft: {
      type: Boolean,
      default: false
    },
    canMoveRight: {
      type: Boolean,
      default: false
    }
  },

  emits: ['close', 'set-primary', 'move-left', 'move-right', 'delete'],

  methods: {
    onClose() {
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/mobile';

.photo-action-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #f5f5f5;
  z-index: 1100;
  display: flex;
  flex-direction: column;
}

.photo-action-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.photo-action-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-md);
  padding: var(--sp-md) var(--sp-lg);
  padding-top: calc(var(--sp-md) + env(safe-area-inset-top, 0px));
  background: var(--color-card-bg);
  border-bottom: 1px solid var(--color-border);
}

.photo-action-title {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin: 0;

  i {
    color: var(--base-font-color);
  }
}

.btn-close-sheet {
  background: none;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 1.1rem;
  cursor: pointer;

  &:active {
    background: #f0f0f0;
  }
}

.photo-action-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--sp-lg);
  padding-bottom: calc(var(--sp-lg) + env(safe-area-inset-bottom, 0px));
  display: flex;
  flex-direction: column;
  gap: var(--sp-sm);
}

.photo-action-preview {
  display: flex;
  justify-content: center;
  margin-bottom: var(--sp-md);
}

.action-row {
  display: flex;
  align-items: center;
  gap: var(--sp-md);
  width: 100%;
  padding: var(--sp-md) var(--sp-lg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-card-bg);
  color: var(--base-font-color);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;

  i {
    font-size: 1.1rem;
  }

  &:active {
    background: var(--color-highlight-bg);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &.is-danger {
    color: var(--base-red);
  }
}
</style>
