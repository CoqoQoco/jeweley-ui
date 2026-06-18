<template>
  <div class="app-container">
    <div class="page-header-bar">
      <button class="btn-back" @click="$router.push({ name: 'sale-document' })" :title="$t('common.btn.back')" type="button">
        <i class="bi bi-arrow-left"></i>
      </button>
      <h2 class="page-title">{{ isEditMode ? $t('view.sale.document.editTitle') : $t('view.sale.document.createTitle') }}</h2>
    </div>

    <documentInfoSection
      :form="docForm"
      @update:form="docForm = $event"
    />

    <itemsSection
      :items="catalogItems"
      @update:items="catalogItems = $event"
      @add-item="isShowStockPicker = true"
      @upload-image="onUploadImage"
    />

    <div class="action-bar">
      <button class="btn btn-sm btn-main" @click="onSaveDraft" type="button">
        <i class="bi bi-save mr-1"></i> {{ $t('view.sale.document.saveDraft') }}
      </button>
      <button class="btn btn-sm btn-green ml-2" @click="onPreviewPDF" type="button">
        <i class="bi bi-eye mr-1"></i> {{ $t('view.sale.document.previewPdf') }}
      </button>
      <button class="btn btn-sm btn-sub-main ml-2" @click="onDownloadPDF" type="button">
        <i class="bi bi-download mr-1"></i> {{ $t('view.sale.document.downloadPdf') }}
      </button>
      <button class="btn btn-sm btn-outline-main ml-2" @click="$router.push({ name: 'sale-document' })" type="button">
        {{ $t('common.btn.back') }}
      </button>
    </div>

    <stockPickerView
      :isShow="isShowStockPicker"
      @closeModal="isShowStockPicker = false"
      @select="onStockSelected"
    />
  </div>
</template>

<script>
import { useSaleDocumentCatalogStore } from '@/stores/modules/api/sale/sale-document-catalog-store.js'
import { success, warning } from '@/services/alert/sweetAlerts.js'
import { ProductCatalogPdfBuilder } from '@/services/helper/pdf/product-catalog/product-catalog-pdf-builder.js'

import documentInfoSection from './components/document-info-section.vue'
import itemsSection from './components/items-section.vue'
import stockPickerView from './modal/stock-picker-view.vue'

const defaultDocForm = () => ({
  headerLabel: '',
  collectionTitle: '',
  documentMonth: new Date().getMonth() + 1,
  documentYear: new Date().getFullYear(),
  status: 0,
  tags: '',
  remark: ''
})

export default {
  name: 'CatalogBuilderView',

  components: {
    documentInfoSection,
    itemsSection,
    stockPickerView
  },

  setup() {
    const catalogStore = useSaleDocumentCatalogStore()
    return { catalogStore }
  },

  data() {
    return {
      docForm: defaultDocForm(),
      catalogItems: [],
      isShowStockPicker: false,
      savedId: null
    }
  },

  computed: {
    isEditMode() {
      return !!this.$route.params.id
    }
  },

  async mounted() {
    if (this.isEditMode) {
      await this.loadExisting()
    }
  },

  methods: {
    async fetchImageBase64(blobPath) {
      if (!blobPath) return null
      const baseUrl = import.meta.env.VITE_JEWELRY_API_URL || 'https://localhost:7001/'
      const url = `${baseUrl}SaleDocumentCatalog/GetImage?blobPath=${encodeURIComponent(blobPath)}`
      const res = await fetch(url, { headers: { Authorization: localStorage.getItem('token-dk') } })
      if (!res.ok) return null
      const blob = await res.blob()
      return await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.onerror = () => resolve(null)
        reader.readAsDataURL(blob)
      })
    },

    async loadExisting() {
      const id = this.$route.params.id
      const res = await this.catalogStore.get(id)
      if (!res) return

      this.savedId = res.id
      this.docForm = {
        headerLabel: res.headerLabel || '',
        collectionTitle: res.collectionTitle || '',
        documentMonth: res.documentMonth || null,
        documentYear: res.documentYear || null,
        status: res.status ?? 0,
        tags: res.tags || '',
        remark: res.remark || ''
      }

      const items = res.items || []
      this.catalogItems = items.map((item, idx) => {
        const slots = [null, null, null]
        ;(item.images || []).forEach((img) => {
          const slotIdx = img.sortOrder ?? 0
          if (slotIdx >= 0 && slotIdx < 3) slots[slotIdx] = img.blobPath
        })
        return {
          _key: `item-${Date.now()}-${idx}`,
          productNumber: item.productNumber || '',
          descriptionLine1: item.descriptionLine1 || '',
          descriptionLine2: item.descriptionLine2 || '',
          dimension1: item.dimension1 || '',
          dimension2: item.dimension2 || '',
          dimension3: item.dimension3 || '',
          sortOrder: item.sortOrder ?? idx,
          imageBlobPaths: slots,
          imagePreviews: [null, null, null]
        }
      })

      await Promise.all(
        this.catalogItems.map(async (catalogItem) => {
          const previews = await Promise.all(
            catalogItem.imageBlobPaths.map((bp) => this.fetchImageBase64(bp))
          )
          catalogItem.imagePreviews = previews
        })
      )
    },

    validateForm() {
      if (!this.docForm.headerLabel?.trim()) {
        warning(this.$t('view.sale.document.validation.headerRequired'), this.$t('common.label.incompleteData'))
        return false
      }
      if (!this.docForm.documentMonth || !this.docForm.documentYear) {
        warning(this.$t('view.sale.document.validation.monthYearRequired'), this.$t('common.label.incompleteData'))
        return false
      }
      return true
    },

    buildSavePayload(status) {
      return {
        id: this.savedId || null,
        headerLabel: this.docForm.headerLabel,
        collectionTitle: this.docForm.collectionTitle,
        documentMonth: this.docForm.documentMonth,
        documentYear: this.docForm.documentYear,
        tags: this.docForm.tags,
        remark: this.docForm.remark,
        status: status ?? this.docForm.status,
        items: this.catalogItems.map((item, idx) => ({
          productNumber: item.productNumber,
          descriptionLine1: item.descriptionLine1,
          descriptionLine2: item.descriptionLine2,
          dimension1: item.dimension1,
          dimension2: item.dimension2,
          dimension3: item.dimension3,
          sortOrder: idx,
          imageBlobPaths: (item.imageBlobPaths || []).filter(Boolean)
        }))
      }
    },

    async onSaveDraft() {
      if (!this.validateForm()) return

      const payload = this.buildSavePayload(this.docForm.status)
      const res = await this.catalogStore.save(payload)

      if (res) {
        const returnedId = res.id || res
        if (returnedId && !this.savedId) {
          this.savedId = returnedId
          this.$router.replace({
            name: 'sale-document-catalog-edit',
            params: { id: returnedId }
          })
        }
        success(this.$t('view.sale.document.success.saveDraft'))
      }
    },

    async onPreviewPDF() {
      if (!this.validateForm()) return
      const builder = new ProductCatalogPdfBuilder(this.docForm, this.catalogItems)
      await builder.preparePDF()
      builder.openPDF()
    },

    async onDownloadPDF() {
      if (!this.validateForm()) return
      const builder = new ProductCatalogPdfBuilder(this.docForm, this.catalogItems)
      await builder.preparePDF()
      const filename = `${this.docForm.headerLabel || 'catalog'}_${this.docForm.documentMonth}_${this.docForm.documentYear}.pdf`
      builder.downloadPDF(filename)
    },

    onStockSelected(stockInfo) {
      const newItem = {
        _key: `item-${Date.now()}`,
        productNumber: stockInfo.productNumber || '',
        descriptionLine1: stockInfo.descriptionLine1 || '',
        descriptionLine2: stockInfo.descriptionLine2 || '',
        dimension1: '',
        dimension2: '',
        dimension3: '',
        sortOrder: this.catalogItems.length,
        imageBlobPaths: [null, null, null],
        imagePreviews: [null, null, null]
      }
      this.catalogItems = [...this.catalogItems, newItem]
      this.isShowStockPicker = false
    },

    async onUploadImage({ index, imgIdx, file, previewUrl }) {
      const formData = new FormData()
      formData.append('File', file)
      const res = await this.catalogStore.uploadImage(formData)
      if (!res) return

      const blobPath = res.blobPath || res
      const items = [...this.catalogItems]
      const item = { ...items[index] }

      const blobPaths = [...(item.imageBlobPaths || [null, null, null])]
      const previews = [...(item.imagePreviews || [null, null, null])]
      blobPaths[imgIdx] = blobPath
      previews[imgIdx] = previewUrl

      item.imageBlobPaths = blobPaths
      item.imagePreviews = previews
      items[index] = item
      this.catalogItems = items
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.page-header-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #ffffff;
  border-radius: 8px;
  border-bottom: 2px solid var(--base-font-color);
  box-shadow: rgba(0, 0, 0, 0.06) 0 2px 8px;
  margin-bottom: 16px;
}

.btn-back {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--base-font-color);
  color: var(--base-font-color);
  background: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  transition: all 0.2s;

  &:hover {
    background: var(--base-font-color);
    color: #ffffff;
  }
}

.page-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--base-font-color);
}

.action-bar {
  padding: 16px;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  box-shadow: rgba(0, 0, 0, 0.06) 0 2px 8px;
  margin-top: 8px;
}
</style>
