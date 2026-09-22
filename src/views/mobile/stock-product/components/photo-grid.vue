<template>
  <div class="photo-grid">
    <button
      v-for="(img, idx) in decoratedImages"
      :key="img.id"
      type="button"
      class="photo-tile"
      :aria-label="$t('view.mobile.stockProductPhotos.photoOptionsAria', { n: idx + 1 })"
      @click="$emit('tap-image', img, idx, decoratedImages.length)"
    >
      <ImagePreview :imageName="img.blobPath" :preview="false" :borderShow="false" :width="150" :height="150" />
      <span v-if="img.badgeType === 'primary'" class="primary-badge">{{ img.badgeLabel }}</span>
      <span v-else-if="img.badgeType === 'number'" class="number-badge">{{ img.badgeLabel }}</span>
      <span v-else class="hidden-badge">{{ img.badgeLabel }}</span>
    </button>

    <div v-for="pendingItem in pending" :key="pendingItem.key" class="photo-tile is-pending">
      <img :src="pendingItem.previewUrl" class="pending-preview" alt="" />

      <div v-if="pendingItem.status === 'queued' || pendingItem.status === 'uploading'" class="pending-progress">
        <div class="pending-progress-bar" :style="{ width: pendingItem.progress + '%' }"></div>
      </div>

      <div v-else-if="pendingItem.status === 'error'" class="pending-error">
        <i class="bi bi-exclamation-triangle-fill"></i>
        <div class="pending-error-actions">
          <button type="button" @click="$emit('retry-pending', pendingItem.key)">
            <i class="bi bi-arrow-clockwise"></i>
          </button>
          <button type="button" @click="$emit('remove-pending', pendingItem.key)">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
      </div>

      <div v-else-if="pendingItem.status === 'done'" class="pending-done">
        <i class="bi bi-check-circle-fill"></i>
      </div>
    </div>

    <button v-if="showAddTile" type="button" class="photo-tile is-add" @click="$emit('tap-add')">
      <i class="bi bi-plus-lg"></i>
    </button>
  </div>
</template>

<script>
import ImagePreview from '@/components/prime-vue/ImagePreview.vue'
import { classifyGalleryPosition } from '@/services/helper/gallery/gallery-helpers.js'

export default {
  name: 'PhotoGrid',

  components: { ImagePreview },

  props: {
    images: {
      type: Array,
      default: () => []
    },
    pending: {
      type: Array,
      default: () => []
    },
    // id -> ตำแหน่งใน resolved display order รวม (SKU ก่อน MOLD, 0-based) — มาจาก photos-view.vue
    positionMap: {
      type: Object,
      default: () => ({})
    },
    showAddTile: {
      type: Boolean,
      default: false
    }
  },

  emits: ['tap-image', 'tap-add', 'retry-pending', 'remove-pending'],

  computed: {
    decoratedImages() {
      return this.images.map((img) => {
        const pos = this.positionMap[img.id]
        const badgeType = classifyGalleryPosition(pos)
        let badgeLabel = this.$t('view.mobile.stockProductPhotos.hiddenBadge')

        if (badgeType === 'primary') {
          badgeLabel = this.$t('view.mobile.stockProductPhotos.primaryBadge')
        } else if (badgeType === 'number') {
          badgeLabel = String(pos + 1)
        }

        return { ...img, badgeType, badgeLabel }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.photo-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--sp-sm);
}

.photo-tile {
  position: relative;
  aspect-ratio: 1 / 1;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: #f5f5f5;
  border: 1px solid var(--color-border);
  cursor: pointer;
  padding: 0;
  appearance: none;
  font: inherit;

  :deep(img),
  :deep(.p-image) {
    width: 100%;
    height: 100%;
  }

  :deep(img) {
    object-fit: cover;
  }
}

.primary-badge,
.number-badge,
.hidden-badge {
  position: absolute;
  left: 4px;
  bottom: 4px;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-size: 0.65rem;
  font-weight: 600;
}

.primary-badge {
  background: var(--base-font-color);
  color: #fff;
}

.number-badge {
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
}

.hidden-badge {
  left: auto;
  right: 4px;
  background: rgba(255, 255, 255, 0.9);
  color: #666;
  font-weight: 500;
}

.pending-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.pending-progress {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 6px;
  background: rgba(0, 0, 0, 0.25);
}

.pending-progress-bar {
  height: 100%;
  background: var(--base-green);
  transition: width 0.2s ease;
}

.pending-error {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--sp-xs);
  background: rgba(0, 0, 0, 0.55);
  color: #fff;

  i {
    font-size: 1.4rem;
    color: var(--base-red);
  }
}

.pending-error-actions {
  display: flex;
  gap: var(--sp-sm);

  button {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: none;
    background: rgba(255, 255, 255, 0.9);
    color: #333;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
}

.pending-done {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);

  i {
    font-size: 1.8rem;
    color: var(--base-green);
  }
}

.photo-tile.is-add {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-card-bg);
  border: 1.5px dashed var(--color-border);
  color: var(--base-font-color);
  font-size: 1.4rem;

  &:active {
    background: var(--color-highlight-bg);
  }
}
</style>
