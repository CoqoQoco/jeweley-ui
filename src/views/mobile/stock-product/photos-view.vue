<template>
  <div class="photos-view">
    <div class="mobile-container mobile-mt-2">
      <div class="photos-code-row">
        <div class="photos-code-value">{{ mainCode }}</div>
      </div>
      <div class="photos-code-hint">{{ $t('view.mobile.stockProductPhotos.codeHint') }}</div>
    </div>

    <div v-if="!gallery" class="mobile-container mobile-mt-2">
      <div class="mobile-loading">
        <div class="spinner"></div>
        <div class="loading-text">{{ $t('view.mobile.stockProduct.loadingText') }}</div>
      </div>
    </div>

    <template v-else>
      <div class="mobile-container mobile-mt-2 photos-scroll-area">
        <div class="photo-group">
          <div class="group-header">
            <span class="group-title">{{ $t('view.mobile.stockProductPhotos.skuGroupTitle') }}</span>
            <span v-if="!skuShowAdd" class="group-hint">
              {{ $t('view.mobile.stockProductPhotos.slotFullHint') }}
            </span>
          </div>
          <photo-grid
            :images="skuGalleryImages"
            :pending="skuPending"
            :positionMap="photoPositionMap"
            :showAddTile="skuShowAdd"
            @tap-image="(img, idx, total) => openActionSheet('SKU', img, idx, total)"
            @tap-add="onTapAddSku"
            @retry-pending="retryPending"
            @remove-pending="removePending"
          />
        </div>

        <div v-if="gallery.canUseMoldScope" class="photo-group mobile-mt-2">
          <div class="group-header">
            <span class="group-title">
              {{ $t('view.mobile.stockProductPhotos.moldGroupTitle', { mold: gallery.mold }) }}
            </span>
            <span class="group-sub">
              {{ $t('view.mobile.stockProductPhotos.moldGroupSub', { count: gallery.moldPieceCount }) }}
            </span>
          </div>
          <div v-if="!moldShowAdd" class="group-hint">
            {{ $t('view.mobile.stockProductPhotos.slotFullHint') }}
          </div>
          <photo-grid
            :images="moldGalleryImages"
            :pending="moldPending"
            :positionMap="photoPositionMap"
            :showAddTile="moldShowAdd"
            @tap-image="(img, idx, total) => openActionSheet('MOLD', img, idx, total)"
            @tap-add="onTapAddMold"
            @retry-pending="retryPending"
            @remove-pending="removePending"
          />
        </div>
      </div>

      <div class="sticky-bottom-bar">
        <div class="capture-actions">
          <ButtonGeneric
            variant="main"
            icon="bi-camera-fill"
            :label="$t('view.mobile.stockProductPhotos.captureBtn')"
            :disabled="!hasFreeSlot"
            @click="triggerCamera"
          />
          <ButtonGeneric
            variant="outline"
            icon="bi-images"
            :label="$t('view.mobile.stockProductPhotos.pickBtn')"
            :disabled="!hasFreeSlot"
            @click="triggerPick"
          />
        </div>

        <div v-if="showScopeChoice" class="scope-row">
          <span class="scope-label">{{ $t('view.mobile.stockProductPhotos.scopeLabel') }}</span>
          <RadioGroupGeneric v-model="scope" :options="scopeOptions" optionValue="value" optionLabel="label" :inline="true" />
        </div>

        <input
          ref="cameraInput"
          type="file"
          accept="image/*"
          capture="environment"
          style="display: none"
          @change="onFilesSelected"
        />
        <input ref="pickInput" type="file" accept="image/*" multiple style="display: none" @change="onFilesSelected" />
      </div>
    </template>

    <photo-action-sheet
      :visible="actionSheet.visible"
      :image="actionSheet.image"
      :isPrimary="actionSheet.index === 0"
      :canMoveLeft="actionSheet.index > 0"
      :canMoveRight="actionSheet.index < actionSheet.total - 1"
      @close="closeActionSheet"
      @set-primary="onSetPrimary"
      @move-left="onMoveLeft"
      @move-right="onMoveRight"
      @delete="onDelete"
    />
  </div>
</template>

<script>
import { useStockProductGalleryApiStore } from '@/stores/modules/api/stock/product-gallery-api.js'
import { compressGalleryImage } from '@/services/helper/file/compress-image.js'
import { warning } from '@/services/alert/sweetAlerts.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import {
  buildGalleryPositionMap,
  calcFreeSlots,
  runUploadQueue,
  moveIdToFront,
  swapIds
} from '@/services/helper/gallery/gallery-helpers.js'

import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import RadioGroupGeneric from '@/components/prime-vue/RadioGroupGeneric.vue'
import PhotoGrid from './components/photo-grid.vue'
import PhotoActionSheet from './components/photo-action-sheet.vue'

export default {
  name: 'MobileStockProductPhotos',

  components: {
    ButtonGeneric,
    RadioGroupGeneric,
    PhotoGrid,
    PhotoActionSheet
  },

  setup() {
    const galleryStore = useStockProductGalleryApiStore()
    return { galleryStore }
  },

  data() {
    return {
      gallery: null,
      scope: 'MOLD',
      scopeInitialized: false,
      pendingUploads: [],
      pendingSeq: 0,
      isProcessingQueue: false,
      actionSheet: {
        visible: false,
        scope: '',
        image: null,
        index: -1,
        total: 0
      }
    }
  },

  computed: {
    stockNumber() {
      return this.$route.params.stockNumber
    },

    stockNumberOrigin() {
      return this.$route.query.stockNumberOrigin || ''
    },

    mainCode() {
      return this.gallery?.stockNumberOrigin || this.stockNumberOrigin || this.stockNumber
    },

    skuGalleryImages() {
      return this.gallery?.skuImages || []
    },

    moldGalleryImages() {
      return this.gallery?.moldImages || []
    },

    // id -> ตำแหน่งใน resolved display order รวม (SKU เรียง sortOrder ก่อน แล้ว MOLD ต่อ, 0-based)
    // ใช้กำหนด badge: 0=รูปหลัก, 1-3=เลขลำดับ, >=4=ไม่แสดงให้ลูกค้า (เกิน 4 รูปที่หน้าลูกค้าโชว์)
    photoPositionMap() {
      return buildGalleryPositionMap(this.skuGalleryImages, this.moldGalleryImages)
    },

    skuPending() {
      return this.pendingUploads.filter((p) => p.scope === 'SKU')
    },

    moldPending() {
      return this.pendingUploads.filter((p) => p.scope === 'MOLD')
    },

    skuShowAdd() {
      return this.skuGalleryImages.length + this.skuPending.length < 4
    },

    moldShowAdd() {
      return !!this.gallery?.canUseMoldScope && this.moldGalleryImages.length + this.moldPending.length < 4
    },

    showScopeChoice() {
      return !!this.gallery?.canUseMoldScope
    },

    scopeOptions() {
      return [
        {
          value: 'MOLD',
          label: this.$t('view.mobile.stockProductPhotos.scopeMoldOption', {
            count: this.gallery?.moldPieceCount || 0
          })
        },
        { value: 'SKU', label: this.$t('view.mobile.stockProductPhotos.scopeSkuOption') }
      ]
    },

    hasFreeSlot() {
      if (!this.gallery) return false
      return this.freeSlotsForScope(this.scope) > 0
    }
  },

  created() {
    this.loadGallery()
  },

  beforeUnmount() {
    this.pendingUploads.forEach((p) => URL.revokeObjectURL(p.previewUrl))
  },

  methods: {
    async loadGallery(skipLoading = false) {
      const res = await this.galleryStore.fetchGet({ stockNumber: this.stockNumber, skipLoading })
      if (res) {
        this.gallery = res
        if (!this.scopeInitialized) {
          this.scope = res.canUseMoldScope ? 'MOLD' : 'SKU'
          this.scopeInitialized = true
        }
      }
    },

    freeSlotsForScope(scope) {
      const images = scope === 'MOLD' ? this.moldGalleryImages : this.skuGalleryImages
      const pendingList = scope === 'MOLD' ? this.moldPending : this.skuPending
      return calcFreeSlots({ existingCount: images.length, pendingCount: pendingList.length })
    },

    triggerCamera() {
      this.$refs.cameraInput.click()
    },

    triggerPick() {
      this.$refs.pickInput.click()
    },

    onTapAddSku() {
      this.scope = 'SKU'
      this.triggerPick()
    },

    onTapAddMold() {
      this.scope = 'MOLD'
      this.triggerPick()
    },

    async onFilesSelected(event) {
      const files = Array.from(event.target.files || [])
      event.target.value = ''
      if (!files.length) return

      const scope = this.scope
      const freeSlots = this.freeSlotsForScope(scope)
      if (freeSlots <= 0) {
        warning(this.$t('view.mobile.stockProductPhotos.warnScopeFull'))
        return
      }

      let selected = files
      if (files.length > freeSlots) {
        selected = files.slice(0, freeSlots)
        warning(this.$t('view.mobile.stockProductPhotos.warnTooMany', { free: freeSlots }))
      }

      for (const file of selected) {
        await this.enqueueFile(file, scope)
      }

      this.processQueue()
    },

    async enqueueFile(file, scope) {
      try {
        const { file: compressedFile, width, height } = await compressGalleryImage(file)
        this.pendingSeq += 1
        this.pendingUploads.push({
          key: `pending-${this.pendingSeq}`,
          scope,
          file: compressedFile,
          previewUrl: URL.createObjectURL(compressedFile),
          width,
          height,
          progress: 0,
          status: 'queued',
          errorMessage: ''
        })
      } catch (err) {
        warning(err?.message || this.$t('view.mobile.stockProductPhotos.uploadErrorGeneric'))
      }
    },

    async processQueue() {
      if (this.isProcessingQueue) return
      this.isProcessingQueue = true

      await runUploadQueue(
        this.pendingUploads,
        (item) =>
          this.galleryStore.fetchUpload({
            stockNumber: this.stockNumber,
            scope: item.scope,
            file: item.file,
            onUploadProgress: (evt) => {
              if (evt.total) item.progress = Math.round((evt.loaded / evt.total) * 100)
            }
          }),
        { onError: () => this.$t('view.mobile.stockProductPhotos.uploadErrorGeneric') }
      )

      this.isProcessingQueue = false
      await this.loadGallery(true)
      this.clearFinishedPending()
    },

    clearFinishedPending() {
      this.pendingUploads = this.pendingUploads.filter((p) => {
        if (p.status === 'done') {
          URL.revokeObjectURL(p.previewUrl)
          return false
        }
        return true
      })
    },

    retryPending(key) {
      const item = this.pendingUploads.find((p) => p.key === key)
      if (!item) return
      item.status = 'queued'
      item.progress = 0
      item.errorMessage = ''
      this.processQueue()
    },

    removePending(key) {
      const idx = this.pendingUploads.findIndex((p) => p.key === key)
      if (idx === -1) return
      URL.revokeObjectURL(this.pendingUploads[idx].previewUrl)
      this.pendingUploads.splice(idx, 1)
    },

    openActionSheet(scope, image, index, total) {
      this.actionSheet = { visible: true, scope, image, index, total }
    },

    closeActionSheet() {
      this.actionSheet = { visible: false, scope: '', image: null, index: -1, total: 0 }
    },

    currentIds(scope) {
      const list = scope === 'MOLD' ? this.moldGalleryImages : this.skuGalleryImages
      return list.map((img) => img.id)
    },

    async reorder(scope, ids) {
      await this.galleryStore.fetchReorder({ stockNumber: this.stockNumber, scope, ids })
      await this.loadGallery(true)
    },

    async onSetPrimary() {
      const { scope, index } = this.actionSheet
      const ids = moveIdToFront(this.currentIds(scope), index)
      await this.reorder(scope, ids)
      this.closeActionSheet()
    },

    async onMoveLeft() {
      const { scope, index } = this.actionSheet
      if (index <= 0) return
      const ids = swapIds(this.currentIds(scope), index - 1, index)
      await this.reorder(scope, ids)
      this.closeActionSheet()
    },

    async onMoveRight() {
      const { scope, index, total } = this.actionSheet
      if (index >= total - 1) return
      const ids = swapIds(this.currentIds(scope), index, index + 1)
      await this.reorder(scope, ids)
      this.closeActionSheet()
    },

    onDelete() {
      const { image } = this.actionSheet
      confirmThenSubmit(
        this.$t('view.mobile.stockProductPhotos.confirmDeleteMsg'),
        this.$t('view.mobile.stockProductPhotos.confirmDeleteTitle'),
        async () => {
          await this.galleryStore.fetchDelete({ id: image.id })
          this.closeActionSheet()
          await this.loadGallery(true)
        }
      )
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/mobile';

.photos-view {
  min-height: 100vh;
  background: #f5f5f5;
}

.photos-code-row {
  display: flex;
  align-items: center;
  justify-content: center;
}

.photos-code-value {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--base-font-color);
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.photos-code-hint {
  margin-top: 2px;
  font-size: 0.75rem;
  color: #666;
  text-align: center;
}

// ต้องเผื่อพื้นที่ให้ทั้ง sticky-bottom-bar (2 แถว: ปุ่มถ่าย/เลือกรูป + แถว scope radio)
// กับ bottom nav ของ LayoutMobile ที่อยู่ใต้มันอีกชั้น (nav zone = 70px + safe area ตาม mobile-dev skill)
.photos-scroll-area {
  padding-bottom: calc(220px + env(safe-area-inset-bottom, 0px));
}

.photo-group {
  background: var(--color-card-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: var(--sp-lg);
}

.group-header {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: var(--sp-md);
}

.group-title {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--base-font-color);
}

.group-sub {
  font-size: 0.75rem;
  color: #666;
}

.group-hint {
  font-size: 0.75rem;
  color: var(--base-red);
  margin-bottom: var(--sp-sm);
}

// bottom: calc(70px + ...) วางแถบไว้เหนือ bottom nav ของ LayoutMobile พอดี (mobile-dev skill:
// "Sticky btn above nav") — nav เองเป็น fixed bottom:0 อีกชั้น ถ้าใช้ bottom:0 ตรงนี้จะซ้อนทับ/ถูกนาบัง
.sticky-bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: calc(70px + env(safe-area-inset-bottom, 0px));
  z-index: 99;
  display: flex;
  flex-direction: column;
  gap: var(--sp-sm);
  padding: var(--sp-md) var(--sp-lg);
  background: var(--color-card-bg);
  border-top: 1px solid var(--color-border);
  box-shadow: var(--shadow-lg);
}

.capture-actions {
  display: flex;
  gap: var(--sp-sm);

  :deep(.btn) {
    flex: 1;
  }
}

.scope-row {
  display: flex;
  align-items: center;
  gap: var(--sp-md);
  flex-wrap: wrap;
}

.scope-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #666;
}
</style>
