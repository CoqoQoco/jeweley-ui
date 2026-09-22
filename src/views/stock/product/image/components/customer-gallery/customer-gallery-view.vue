<template>
  <div class="customer-gallery-view">
    <SectionCardGeneric class="customer-gallery-view__search">
      <ScanSearchRow v-model="searchInput" @search="onSearch" />
    </SectionCardGeneric>

    <div v-if="!gallery" class="customer-gallery-view__empty">
      <i class="bi bi-search"></i>
      <span>{{ $t('view.stock.productGallery.notLoadedHint') }}</span>
    </div>

    <GalleryEditor
      v-else
      ref="editorSection"
      :gallery="gallery"
      :pendingUploads="pendingUploads"
      class="customer-gallery-view__editor"
      @files-selected="onFilesSelected"
      @retry-pending="retryPending"
      @remove-pending="removePending"
      @set-primary="onSetPrimary"
      @move="onMove"
      @delete="onDeleteImage"
      @reorder="onReorderScope"
    />

    <MissingList ref="missingList" class="customer-gallery-view__missing" @manage="onManageFromMissingList" />
  </div>
</template>

<script>
import { useStockProductGalleryApiStore } from '@/stores/modules/api/stock/product-gallery-api.js'
import { compressGalleryImage } from '@/services/helper/file/compress-image.js'
import { warning } from '@/services/alert/sweetAlerts.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { calcFreeSlots, runUploadQueue, moveIdToFront, swapIds } from '@/services/helper/gallery/gallery-helpers.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ScanSearchRow from './scan-search-row.vue'
import GalleryEditor from './gallery-editor.vue'
import MissingList from './missing-list.vue'

export default {
  name: 'CustomerGalleryView',

  components: {
    SectionCardGeneric,
    ScanSearchRow,
    GalleryEditor,
    MissingList
  },

  setup() {
    const galleryStore = useStockProductGalleryApiStore()
    return { galleryStore }
  },

  data() {
    return {
      gallery: null,
      searchInput: '',
      pendingUploads: [],
      pendingSeq: 0,
      isProcessingQueue: false
    }
  },

  computed: {
    skuGalleryImages() {
      return this.gallery?.skuImages || []
    },

    moldGalleryImages() {
      return this.gallery?.moldImages || []
    },

    skuPending() {
      return this.pendingUploads.filter((p) => p.scope === 'SKU')
    },

    moldPending() {
      return this.pendingUploads.filter((p) => p.scope === 'MOLD')
    }
  },

  beforeUnmount() {
    this.pendingUploads.forEach((p) => URL.revokeObjectURL(p.previewUrl))
  },

  methods: {
    async onSearch() {
      const value = (this.searchInput || '').trim()
      if (!value) return
      await this.loadGallery(value)
    },

    async loadGallery(stockNumber, skipLoading = false) {
      const res = await this.galleryStore.fetchGet({ stockNumber, skipLoading })
      if (res) {
        this.gallery = res
        this.searchInput = res.stockNumber
      }
    },

    // ยิงซ้ำด้วย stockNumber ที่ resolve แล้วเสมอ (ไม่ใช้ค่าที่ user พิมพ์ดิบๆ) ตามกติกา
    async refreshGallery(skipLoading = true) {
      if (!this.gallery) return
      await this.loadGallery(this.gallery.stockNumber, skipLoading)
    },

    freeSlotsForScope(scope) {
      const images = scope === 'MOLD' ? this.moldGalleryImages : this.skuGalleryImages
      const pendingList = scope === 'MOLD' ? this.moldPending : this.skuPending
      return calcFreeSlots({ existingCount: images.length, pendingCount: pendingList.length })
    },

    async onFilesSelected({ scope, files }) {
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

      this.processQueue(scope)
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

    async processQueue(scope) {
      if (this.isProcessingQueue) return
      this.isProcessingQueue = true

      await runUploadQueue(
        this.pendingUploads,
        (item) =>
          this.galleryStore.fetchUpload({
            stockNumber: this.gallery.stockNumber,
            scope: item.scope,
            file: item.file,
            onUploadProgress: (evt) => {
              if (evt.total) item.progress = Math.round((evt.loaded / evt.total) * 100)
            }
          }),
        { onError: () => this.$t('view.mobile.stockProductPhotos.uploadErrorGeneric') }
      )

      this.isProcessingQueue = false
      await this.refreshGallery(true)
      this.clearFinishedPending()

      // อัปโหลดเข้า scope MOLD สำเร็จ = แบบนี้อาจหลุดจาก backlog list (ครบรูปแล้ว) — รีเฟรชรายการ
      if (scope === 'MOLD') {
        this.$refs.missingList?.fetchData()
      }
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
      this.processQueue(item.scope)
    },

    removePending(key) {
      const idx = this.pendingUploads.findIndex((p) => p.key === key)
      if (idx === -1) return
      URL.revokeObjectURL(this.pendingUploads[idx].previewUrl)
      this.pendingUploads.splice(idx, 1)
    },

    currentIds(scope) {
      const list = scope === 'MOLD' ? this.moldGalleryImages : this.skuGalleryImages
      return list.map((img) => img.id)
    },

    async reorder(scope, ids) {
      await this.galleryStore.fetchReorder({ stockNumber: this.gallery.stockNumber, scope, ids })
      await this.refreshGallery(true)
    },

    onSetPrimary({ scope, index }) {
      this.reorder(scope, moveIdToFront(this.currentIds(scope), index))
    },

    onMove({ scope, index, direction }) {
      const total = (scope === 'MOLD' ? this.moldGalleryImages : this.skuGalleryImages).length
      if (direction === 'left' && index > 0) {
        this.reorder(scope, swapIds(this.currentIds(scope), index - 1, index))
      } else if (direction === 'right' && index < total - 1) {
        this.reorder(scope, swapIds(this.currentIds(scope), index, index + 1))
      }
    },

    onReorderScope({ scope, ids }) {
      this.reorder(scope, ids)
    },

    onDeleteImage(image) {
      confirmThenSubmit(
        this.$t('view.mobile.stockProductPhotos.confirmDeleteMsg'),
        this.$t('view.mobile.stockProductPhotos.confirmDeleteTitle'),
        async () => {
          await this.galleryStore.fetchDelete({ id: image.id })
          await this.refreshGallery(true)
        }
      )
    },

    async onManageFromMissingList(row) {
      await this.loadGallery(row.sampleStockNumber)
      this.$nextTick(() => {
        this.$refs.editorSection?.$el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.customer-gallery-view {
  display: flex;
  flex-direction: column;
  gap: var(--sp-lg);
}

.customer-gallery-view__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--sp-sm);
  padding: var(--sp-2xl);
  color: var(--base-sub-color);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-card-bg);

  i {
    font-size: var(--fs-xl);
  }
}
</style>
