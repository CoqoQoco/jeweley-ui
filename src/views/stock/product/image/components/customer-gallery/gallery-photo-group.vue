<!--
  GalleryPhotoGroup — drop zone + tile grid สำหรับ 1 scope (SKU หรือ MOLD) ของ customer gallery (web)
  เทียบเท่า mobile photo-grid.vue + photo-action-sheet.vue รวมกัน แต่ปรับให้เหมาะกับ desktop:
  - ลากไฟล์จาก OS มาวางที่ dropzone เพื่ออัปโหลด (แยกจากลาก tile ภายในเพื่อจัดเรียงด้วย custom drag mime type)
  - ลาก tile ที่มีอยู่แล้วเพื่อจัดเรียงลำดับ (native HTML5 drag and drop)
  - ปุ่มจริงสำรอง (ตั้งเป็นรูปหลัก/เลื่อนซ้าย/เลื่อนขวา/ลบ) โชว์ตอน hover/focus สำหรับ keyboard user
-->
<template>
  <div
    class="gallery-photo-group"
    :class="{ 'is-file-dragover': isFileDragOver }"
    @dragover.prevent="onZoneDragOver"
    @dragleave="onZoneDragLeave"
    @drop.prevent="onZoneDrop"
  >
    <div class="gallery-photo-group__hint">{{ $t('view.stock.productGallery.dropHint') }}</div>

    <div class="gallery-photo-group__grid">
      <div
        v-for="(img, idx) in decoratedImages"
        :key="img.id"
        class="gallery-tile"
        :class="{ 'is-reorder-target': dragOverIndex === idx }"
        draggable="true"
        @dragstart="onTileDragStart($event, idx)"
        @dragenter="onTileDragEnter(idx)"
        @dragend="onTileDragEnd"
      >
        <ImagePreview :imageName="img.blobPath" :preview="false" :borderShow="false" :width="150" :height="150" />

        <span v-if="img.badgeType === 'primary'" class="primary-badge">
          {{ $t('view.mobile.stockProductPhotos.primaryBadge') }}
        </span>
        <span v-else-if="img.badgeType === 'number'" class="number-badge">{{ img.badgePosition + 1 }}</span>
        <span v-else class="hidden-badge">{{ $t('view.mobile.stockProductPhotos.hiddenBadge') }}</span>

        <div class="gallery-tile__actions">
          <button
            v-if="img.badgeType !== 'primary'"
            type="button"
            class="tile-action-btn"
            :title="$t('view.mobile.stockProductPhotos.actionSetPrimary')"
            @click="$emit('set-primary', idx)"
          >
            <i class="bi bi-star-fill"></i>
          </button>
          <button
            type="button"
            class="tile-action-btn"
            :disabled="idx === 0"
            :title="$t('view.mobile.stockProductPhotos.actionMoveLeft')"
            @click="$emit('move', { index: idx, direction: 'left' })"
          >
            <i class="bi bi-arrow-left"></i>
          </button>
          <button
            type="button"
            class="tile-action-btn"
            :disabled="idx === decoratedImages.length - 1"
            :title="$t('view.mobile.stockProductPhotos.actionMoveRight')"
            @click="$emit('move', { index: idx, direction: 'right' })"
          >
            <i class="bi bi-arrow-right"></i>
          </button>
          <button
            type="button"
            class="tile-action-btn tile-action-btn--danger"
            :title="$t('view.stock.productGallery.deleteAria')"
            @click="$emit('delete', img)"
          >
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>

      <div v-for="item in pending" :key="item.key" class="gallery-tile is-pending">
        <img :src="item.previewUrl" class="pending-preview" alt="" />

        <div v-if="item.status === 'queued' || item.status === 'uploading'" class="pending-progress">
          <div class="pending-progress-bar" :style="{ width: item.progress + '%' }"></div>
        </div>

        <div v-else-if="item.status === 'error'" class="pending-error">
          <i class="bi bi-exclamation-triangle-fill"></i>
          <div class="pending-error-actions">
            <button type="button" :title="$t('common.btn.retry')" @click="$emit('retry-pending', item.key)">
              <i class="bi bi-arrow-clockwise"></i>
            </button>
            <button type="button" :title="$t('common.btn.delete')" @click="$emit('remove-pending', item.key)">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
        </div>

        <div v-else-if="item.status === 'done'" class="pending-done">
          <i class="bi bi-check-circle-fill"></i>
        </div>
      </div>

      <button
        v-if="showAddTile"
        type="button"
        class="gallery-tile is-add"
        :title="$t('view.stock.productGallery.addPhotoAria')"
        @click="triggerFileInput"
      >
        <i class="bi bi-plus-lg"></i>
      </button>
    </div>

    <input ref="fileInput" type="file" accept="image/*" multiple style="display: none" @change="onFileInputChange" />
  </div>
</template>

<script>
import ImagePreview from '@/components/prime-vue/ImagePreview.vue'
import { classifyGalleryPosition, moveIdToIndex } from '@/services/helper/gallery/gallery-helpers.js'

export default {
  name: 'GalleryPhotoGroup',

  components: {
    ImagePreview
  },

  props: {
    images: {
      type: Array,
      default: () => []
    },
    pending: {
      type: Array,
      default: () => []
    },
    // id -> ตำแหน่งใน resolved display order รวม (SKU ก่อน MOLD, 0-based) — มาจาก gallery-editor.vue
    positionMap: {
      type: Object,
      default: () => ({})
    },
    showAddTile: {
      type: Boolean,
      default: false
    }
  },

  emits: ['files-selected', 'retry-pending', 'remove-pending', 'set-primary', 'move', 'delete', 'reorder'],

  data() {
    return {
      isFileDragOver: false,
      dragOverIndex: null
    }
  },

  computed: {
    decoratedImages() {
      return this.images.map((img) => {
        const pos = this.positionMap[img.id]
        return { ...img, badgeType: classifyGalleryPosition(pos), badgePosition: pos }
      })
    },

    currentIds() {
      return this.images.map((img) => img.id)
    }
  },

  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click()
    },

    onFileInputChange(event) {
      const files = Array.from(event.target.files || [])
      event.target.value = ''
      if (files.length) this.$emit('files-selected', files)
    },

    // dragover ยิงถี่มาก — เช็คเฉพาะว่ามี Files ติดมาก่อน set flag กันการ re-render ที่ไม่จำเป็น
    onZoneDragOver(e) {
      if (Array.from(e.dataTransfer.types || []).includes('Files') && !this.isFileDragOver) {
        this.isFileDragOver = true
      }
    },

    onZoneDragLeave() {
      this.isFileDragOver = false
    },

    // แยก 2 กรณี: วางไฟล์จาก OS (dataTransfer.files) = อัปโหลดใหม่, วาง tile ภายใน (custom mime type) = จัดเรียง
    onZoneDrop(e) {
      this.isFileDragOver = false
      const types = Array.from(e.dataTransfer.types || [])

      if (types.includes('Files') && e.dataTransfer.files.length) {
        this.$emit('files-selected', Array.from(e.dataTransfer.files))
        this.dragOverIndex = null
        return
      }

      const raw = e.dataTransfer.getData('application/x-gallery-tile-index')
      if (raw !== '' && this.dragOverIndex !== null) {
        const fromIndex = Number(raw)
        if (!Number.isNaN(fromIndex) && fromIndex !== this.dragOverIndex) {
          this.$emit('reorder', moveIdToIndex(this.currentIds, fromIndex, this.dragOverIndex))
        }
      }
      this.dragOverIndex = null
    },

    onTileDragStart(e, idx) {
      e.dataTransfer.setData('application/x-gallery-tile-index', String(idx))
      e.dataTransfer.effectAllowed = 'move'
    },

    onTileDragEnter(idx) {
      this.dragOverIndex = idx
    },

    onTileDragEnd() {
      this.dragOverIndex = null
    }
  }
}
</script>

<style lang="scss" scoped>
.gallery-photo-group {
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--sp-md);
  transition: border-color 0.15s ease, background-color 0.15s ease;

  &.is-file-dragover {
    border-color: var(--base-font-color);
    background: var(--color-highlight-bg);
  }
}

.gallery-photo-group__hint {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
  margin-bottom: var(--sp-sm);
}

.gallery-photo-group__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, 120px);
  gap: var(--sp-sm);
}

.gallery-tile {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--color-highlight-bg);
  border: 1px solid var(--color-border);
  padding: 0;
  appearance: none;
  font: inherit;
  cursor: grab;

  :deep(img),
  :deep(.p-image) {
    width: 100%;
    height: 100%;
  }

  :deep(img) {
    object-fit: cover;
  }

  &.is-reorder-target {
    border-color: var(--base-font-color);
    box-shadow: 0 0 0 2px var(--base-font-color) inset;
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
  font-size: var(--fs-sm);
  font-weight: 600;
  pointer-events: none;
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
  color: var(--base-sub-color);
  font-weight: 500;
}

.gallery-tile__actions {
  position: absolute;
  top: 4px;
  right: 4px;
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.gallery-tile:hover .gallery-tile__actions,
.gallery-tile:focus-within .gallery-tile__actions {
  opacity: 1;
}

.tile-action-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.92);
  color: var(--base-font-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--fs-sm);
  cursor: pointer;

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: var(--base-font-color);
    color: #fff;
  }

  &--danger:hover:not(:disabled) {
    background: var(--base-red);
  }
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
    font-size: var(--fs-xl);
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
    font-size: var(--fs-xl);
    color: var(--base-green);
  }
}

.gallery-tile.is-add {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-card-bg);
  border: 1.5px dashed var(--color-border);
  color: var(--base-font-color);
  font-size: var(--fs-xl);
  cursor: pointer;

  &:hover {
    background: var(--color-highlight-bg);
  }
}
</style>
