<template>
  <div class="mt-2">
    <div class="mb-2 text-right">
      <span class="title-text">{{ $t('view.sale.document.itemCount', { count: mergedList.length }) }}</span>
    </div>

    <BaseDataTable
      :items="mergedList"
      dataKey="uid"
      :columns="columns"
      :paginator="true"
      :perPage="10"
      :showGridlines="true"
      :scrollHeight="'calc(100vh - 360px)'"
    >
      <template #actionTemplate="{ data }">
        <div class="btn-action-container">
          <template v-if="data.sourceType === 'catalog'">
            <button class="btn btn-sm btn-main mr-1" :title="$t('common.btn.edit')" @click="onEditCatalog(data)">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-green mr-1" :title="$t('view.sale.document.previewPdf')" @click="onPreviewCatalog(data)">
              <i class="bi bi-eye"></i>
            </button>
            <button class="btn btn-sm btn-sub-main mr-1" :title="$t('common.btn.download')" @click="onDownloadCatalog(data)">
              <i class="bi bi-download"></i>
            </button>
            <button class="btn btn-sm btn-red" :title="$t('common.btn.delete')" @click="onDeleteCatalog(data)">
              <i class="bi bi-trash"></i>
            </button>
          </template>
          <template v-else>
            <button class="btn btn-sm btn-green mr-1" :title="$t('view.sale.document.previewPdf')" @click="onPreview(data)">
              <i class="bi bi-eye"></i>
            </button>
            <button class="btn btn-sm btn-main mr-1" :title="$t('common.btn.download')" @click="onDownload(data)">
              <i class="bi bi-download"></i>
            </button>
            <button class="btn btn-sm btn-sub-main mr-1" :title="$t('view.sale.document.editTag')" @click="$emit('tag', data)">
              <i class="bi bi-tag"></i>
            </button>
            <button class="btn btn-sm btn-red" :title="$t('common.btn.delete')" @click="onDelete(data)">
              <i class="bi bi-trash"></i>
            </button>
          </template>
        </div>
      </template>

      <template #sourceTypeTemplate="{ data }">
        <span :class="['type-badge', data.sourceType === 'catalog' ? 'type-catalog' : 'type-upload']">
          {{ data.sourceType === 'catalog' ? $t('view.sale.document.sourceTypeSystem') : $t('view.sale.document.sourceTypeUpload') }}
        </span>
      </template>

      <template #monthYearTemplate="{ data }">
        <span>{{ monthName(data.documentMonth) }} {{ data.documentYear }}</span>
      </template>

      <template #statusTemplate="{ data }">
        <span v-if="data.sourceType === 'catalog'" :class="['status-badge', data.status === 1 ? 'status-final' : 'status-draft']">
          {{ data.status === 1 ? $t('view.sale.document.statusFinal') : $t('view.sale.document.statusDraft') }}
        </span>
        <span v-else class="text-muted">-</span>
      </template>

      <template #tagsTemplate="{ data }">
        <div class="tags-container">
          <span
            v-for="(tag, i) in parseTags(data.tags)"
            :key="i"
            class="tag-badge"
          >{{ tag }}</span>
          <span v-if="!data.tags" class="text-muted">-</span>
        </div>
      </template>

      <template #createDateTemplate="{ data }">
        {{ formatDateTime(data.createDate) }}
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import { useSaleDocumentStore } from '@/stores/modules/api/sale/sale-document-store.js'
import { useSaleDocumentCatalogStore } from '@/stores/modules/api/sale/sale-document-catalog-store.js'
import { confirmSubmit, success } from '@/services/alert/sweetAlerts.js'
import { formatDateTime } from '@/services/utils/dayjs.js'
import { ProductCatalogPdfBuilder } from '@/services/helper/pdf/product-catalog/product-catalog-pdf-builder.js'

const MONTH_KEYS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

export default {
  name: 'SaleDocumentDataTableView',

  components: { BaseDataTable },

  emits: ['tag'],

  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    }
  },

  setup() {
    const store = useSaleDocumentStore()
    const catalogStore = useSaleDocumentCatalogStore()
    return { store, catalogStore }
  },

  computed: {
    columns() {
      return [
        { field: 'action', header: '', width: '180px', sortable: false },
        { field: 'sourceType', header: this.$t('view.sale.document.sourceTypeTitle'), minWidth: '120px', sortable: false, template: 'sourceTypeTemplate' },
        { field: 'fileName', header: this.$t('view.sale.document.fileNameTitle'), minWidth: '200px', sortable: true },
        { field: 'status', header: this.$t('common.field.status'), minWidth: '90px', sortable: false, template: 'statusTemplate' },
        { field: 'monthYear', header: this.$t('view.sale.document.monthYear'), minWidth: '130px', sortable: false, template: 'monthYearTemplate' },
        { field: 'tags', header: this.$t('view.sale.document.tags'), minWidth: '160px', sortable: false, template: 'tagsTemplate' },
        { field: 'remark', header: this.$t('common.field.remark'), minWidth: '160px', sortable: false },
        { field: 'createBy', header: this.$t('common.field.createBy'), minWidth: '120px', sortable: true },
        { field: 'createDate', header: this.$t('common.field.createDate'), minWidth: '160px', sortable: true, template: 'createDateTemplate' }
      ]
    },

    form() {
      return this.modelForm || {}
    },

    mergedList() {
      const uploaded = (this.store.dataList || []).map((item) => ({
        ...item,
        uid: `upload-${item.id}`,
        sourceType: 'upload',
        fileName: item.fileName,
        status: null
      }))

      const catalogs = (this.catalogStore.dataList || []).map((item) => ({
        ...item,
        uid: `catalog-${item.id}`,
        sourceType: 'catalog',
        fileName: item.headerLabel || `Catalog #${item.id}`
      }))

      let list = [...catalogs, ...uploaded]

      const keyword = this.form.keyword?.toLowerCase()
      if (keyword) {
        list = list.filter(
          (item) =>
            item.fileName?.toLowerCase().includes(keyword) ||
            item.tags?.toLowerCase().includes(keyword)
        )
      }

      return list
    }
  },

  watch: {
    async modelForm() {
      await this.fetchData()
    }
  },

  methods: {
    async fetchData() {
      const payload = {
        documentMonth: this.form.month || null,
        documentYear: this.form.year || null
      }
      await Promise.all([
        this.store.fetchList({
          month: this.form.month || null,
          year: this.form.year || null
        }),
        this.catalogStore.list(payload)
      ])
    },

    monthName(month) {
      if (!month || month < 1 || month > 12) return '-'
      const key = MONTH_KEYS[month - 1]
      return this.$t(`view.sale.document.months.${key}`)
    },

    parseTags(tags) {
      if (!tags) return []
      return tags.split(',').map((t) => t.trim()).filter(Boolean)
    },

    formatDateTime(date) {
      return date ? formatDateTime(date) : '-'
    },

    onEditCatalog(data) {
      this.$router.push({ name: 'sale-document-catalog-edit', params: { id: data.id } })
    },

    async onPreviewCatalog(data) {
      const res = await this.catalogStore.get(data.id)
      if (!res) return
      const catalog = res
      const items = res.items || []
      const builder = new ProductCatalogPdfBuilder(catalog, items)
      await builder.preparePDF()
      builder.openPDF()
    },

    async onDownloadCatalog(data) {
      const res = await this.catalogStore.get(data.id)
      if (!res) return
      const catalog = res
      const items = res.items || []
      const builder = new ProductCatalogPdfBuilder(catalog, items)
      await builder.preparePDF()
      const filename = `${catalog.headerLabel || 'catalog'}_${catalog.documentMonth}_${catalog.documentYear}.pdf`
      builder.downloadPDF(filename)
    },

    onDeleteCatalog(data) {
      confirmSubmit(
        this.$t('view.sale.document.confirm.delete', { fileName: data.fileName }),
        this.$t('view.sale.document.confirm.deleteTitle'),
        async () => {
          await this.catalogStore.delete(data.id)
          success(this.$t('view.sale.document.success.delete'))
          await this.fetchData()
        }
      )
    },

    async onPreview(data) {
      const response = await this.store.downloadDocument(data.id)
      if (response?.data) {
        const blob = new Blob([response.data], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        window.open(url, '_blank')
      }
    },

    async onDownload(data) {
      const response = await this.store.downloadDocument(data.id)
      if (response?.data) {
        const blob = new Blob([response.data], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = data.fileName
        a.click()
        URL.revokeObjectURL(url)
      }
    },

    onDelete(data) {
      confirmSubmit(
        this.$t('view.sale.document.confirm.delete', { fileName: data.fileName }),
        this.$t('view.sale.document.confirm.deleteTitle'),
        async () => {
          await this.store.deleteDocument(data.id)
          success(this.$t('view.sale.document.success.delete'))
          await this.fetchData()
        }
      )
    }
  },

  async mounted() {
    await this.fetchData()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';
@import '@/assets/scss/custom-style/standard-form';

.btn-action-container {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 2px;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.tag-badge {
  display: inline-block;
  padding: 2px 8px;
  font-size: 0.75rem;
  border-radius: 12px;
  background-color: var(--base-font-color);
  color: #fff;
}

.type-badge {
  display: inline-block;
  padding: 2px 8px;
  font-size: 0.75rem;
  border-radius: 12px;
  font-weight: 600;
}

.type-catalog {
  background-color: #e8f4fd;
  color: #0369a1;
}

.type-upload {
  background-color: #f0fdf4;
  color: #15803d;
}

.status-badge {
  display: inline-block;
  padding: 2px 8px;
  font-size: 0.75rem;
  border-radius: 12px;
}

.status-draft {
  background-color: #fef9c3;
  color: #854d0e;
}

.status-final {
  background-color: #dcfce7;
  color: #15803d;
}
</style>
