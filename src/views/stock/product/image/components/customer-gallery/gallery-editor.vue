<template>
  <div class="gallery-editor">
    <div class="gallery-editor__info">
      <span class="gallery-editor__code">{{ mainCode }}</span>
      <span v-if="gallery.mold" class="gallery-editor__mold">
        {{ $t('view.stock.productGallery.infoMoldSummary', { mold: gallery.mold, count: gallery.moldPieceCount || 0 }) }}
      </span>
      <span class="gallery-editor__hint">{{ $t('view.mobile.stockProductPhotos.codeHint') }}</span>
    </div>

    <div class="gallery-editor__groups">
      <SectionCardGeneric
        headerStyle="legend"
        icon="bi-image"
        :title="$t('view.mobile.stockProductPhotos.skuGroupTitle')"
        class="gallery-editor__group"
      >
        <div v-if="!skuShowAdd" class="gallery-editor__full-hint">
          {{ $t('view.mobile.stockProductPhotos.slotFullHint') }}
        </div>
        <GalleryPhotoGroup
          :images="skuImages"
          :pending="skuPending"
          :positionMap="positionMap"
          :showAddTile="skuShowAdd"
          @files-selected="(files) => $emit('files-selected', { scope: 'SKU', files })"
          @retry-pending="(key) => $emit('retry-pending', key)"
          @remove-pending="(key) => $emit('remove-pending', key)"
          @set-primary="(index) => $emit('set-primary', { scope: 'SKU', index })"
          @move="(payload) => $emit('move', { scope: 'SKU', ...payload })"
          @delete="(image) => $emit('delete', image)"
          @reorder="(ids) => $emit('reorder', { scope: 'SKU', ids })"
        />
      </SectionCardGeneric>

      <SectionCardGeneric
        v-if="gallery.canUseMoldScope"
        headerStyle="legend"
        icon="bi-images"
        :title="$t('view.stock.productGallery.moldGroupTitle', { mold: gallery.mold, count: gallery.moldPieceCount || 0 })"
        class="gallery-editor__group"
      >
        <div v-if="!moldShowAdd" class="gallery-editor__full-hint">
          {{ $t('view.mobile.stockProductPhotos.slotFullHint') }}
        </div>
        <GalleryPhotoGroup
          :images="moldImages"
          :pending="moldPending"
          :positionMap="positionMap"
          :showAddTile="moldShowAdd"
          @files-selected="(files) => $emit('files-selected', { scope: 'MOLD', files })"
          @retry-pending="(key) => $emit('retry-pending', key)"
          @remove-pending="(key) => $emit('remove-pending', key)"
          @set-primary="(index) => $emit('set-primary', { scope: 'MOLD', index })"
          @move="(payload) => $emit('move', { scope: 'MOLD', ...payload })"
          @delete="(image) => $emit('delete', image)"
          @reorder="(ids) => $emit('reorder', { scope: 'MOLD', ids })"
        />
      </SectionCardGeneric>
    </div>
  </div>
</template>

<script>
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import GalleryPhotoGroup from './gallery-photo-group.vue'
import { buildGalleryPositionMap, calcFreeSlots } from '@/services/helper/gallery/gallery-helpers.js'

export default {
  name: 'GalleryEditor',

  components: {
    SectionCardGeneric,
    GalleryPhotoGroup
  },

  props: {
    gallery: {
      type: Object,
      required: true
    },
    pendingUploads: {
      type: Array,
      default: () => []
    }
  },

  emits: ['files-selected', 'retry-pending', 'remove-pending', 'set-primary', 'move', 'delete', 'reorder'],

  computed: {
    mainCode() {
      return this.gallery.stockNumberOrigin || this.gallery.stockNumber
    },

    skuImages() {
      return this.gallery.skuImages || []
    },

    moldImages() {
      return this.gallery.moldImages || []
    },

    skuPending() {
      return this.pendingUploads.filter((p) => p.scope === 'SKU')
    },

    moldPending() {
      return this.pendingUploads.filter((p) => p.scope === 'MOLD')
    },

    positionMap() {
      return buildGalleryPositionMap(this.skuImages, this.moldImages)
    },

    skuShowAdd() {
      return calcFreeSlots({ existingCount: this.skuImages.length, pendingCount: this.skuPending.length }) > 0
    },

    moldShowAdd() {
      return (
        !!this.gallery.canUseMoldScope &&
        calcFreeSlots({ existingCount: this.moldImages.length, pendingCount: this.moldPending.length }) > 0
      )
    }
  }
}
</script>

<style lang="scss" scoped>
.gallery-editor__info {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--sp-md);
  margin-bottom: var(--sp-lg);
}

.gallery-editor__code {
  font-size: var(--fs-xl);
  font-weight: 700;
  color: var(--base-font-color);
}

.gallery-editor__mold {
  font-size: var(--fs-base);
  color: var(--base-sub-color);
}

.gallery-editor__hint {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
  opacity: 0.8;
}

.gallery-editor__groups {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-lg);

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
}

.gallery-editor__full-hint {
  font-size: var(--fs-sm);
  color: var(--base-red);
  margin-bottom: var(--sp-sm);
}
</style>
