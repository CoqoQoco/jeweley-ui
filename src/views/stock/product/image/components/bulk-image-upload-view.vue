<template>
  <div class="bulk-upload-view">
    <SectionCardGeneric :title="$t('view.stock.product.bulkSectionTitle')">
      <div class="bulk-grid">
        <div>
          <JpgDropZoneGeneric
            v-model="uploadFile"
            v-model:previewUrl="uploadPreviewUrl"
            :dropLabel="$t('view.stock.product.imageUploadDropHere')"
            :browseLabel="$t('view.stock.product.imageUploadBrowse')"
            :hintLabel="$t('view.stock.product.imageUploadSupportedFormat')"
            :formatWarningLabel="$t('view.stock.product.uploadFormatWarning')"
          />
          <FormFieldGeneric :label="$t('view.stock.product.bulkDescriptionLabel')" class="mt-2">
            <TextareaGeneric v-model="description" :rows="2" />
          </FormFieldGeneric>
        </div>

        <div>
          <FormFieldGeneric :label="$t('view.stock.product.bulkStockNumbersLabel')" :required="true">
            <TextareaGeneric
              v-model="stockNumbersText"
              :rows="6"
              :placeholder="$t('view.stock.product.bulkStockNumbersPlaceholder')"
            />
          </FormFieldGeneric>
          <CheckboxGeneric
            v-model="includeSameMoldInReceipt"
            :label="$t('view.stock.product.bulkIncludeSameMoldLabel')"
            class="mt-2"
          />
          <div class="mt-2">
            <ButtonGeneric
              variant="green"
              icon="bi-search"
              :label="$t('view.stock.product.bulkCheckListBtn')"
              @click="onCheckList"
            />
          </div>
        </div>
      </div>

      <div v-if="previewRows.length > 0" class="bulk-preview mt-3">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <span class="title-text">
            {{ $t('view.stock.product.bulkPreviewTitle', { count: previewRows.length }) }}
          </span>
          <CheckboxGeneric
            v-model="overwrite"
            :label="$t('view.stock.product.bulkOverwriteToggleLabel')"
          />
        </div>

        <BaseDataTable
          :items="previewRows"
          :columns="previewColumns"
          :paginator="false"
          scrollHeight="420px"
          dataKey="stockNumber"
          :selectionMode="true"
          selectionType="multiple"
          :itemsSelection="selectedRows"
          :disabledItems="disabledRows"
          @update:itemsSelection="selectedRows = $event"
        >
          <template #statusTemplate="{ data }">
            <span :class="['status-badge', statusBadgeClass(data)]">{{ statusLabel(data) }}</span>
          </template>
        </BaseDataTable>

        <div class="d-flex justify-content-between align-items-center mt-2">
          <span class="scope-label">
            {{ $t('view.stock.product.bulkSelectedCount', { count: selectedRows.length, total: previewRows.length }) }}
          </span>
          <ButtonGeneric
            variant="main"
            icon="bi-cloud-arrow-up"
            :label="$t('view.stock.product.bulkSaveBtn')"
            :disabled="selectedRows.length === 0"
            @click="onSaveBulk"
          />
        </div>
      </div>
    </SectionCardGeneric>
  </div>
</template>

<script>
import swAlert from '@/services/alert/sweetAlerts.js'
import { stockProductImageApiStor } from '@/stores/modules/api/stock/image-api.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import TextareaGeneric from '@/components/generic/TextareaGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import JpgDropZoneGeneric from '@/components/generic/JpgDropZoneGeneric.vue'
import CheckboxGeneric from '@/components/prime-vue/CheckboxGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

const MAX_ROWS = 200

export default {
  name: 'BulkImageUploadView',

  components: {
    SectionCardGeneric,
    FormFieldGeneric,
    TextareaGeneric,
    ButtonGeneric,
    JpgDropZoneGeneric,
    CheckboxGeneric,
    BaseDataTable
  },

  setup() {
    const stockProductImageStore = stockProductImageApiStor()
    return { stockProductImageStore }
  },

  data() {
    return {
      uploadFile: null,
      uploadPreviewUrl: null,
      description: '',
      stockNumbersText: '',
      includeSameMoldInReceipt: true,
      overwrite: false,
      previewRows: [],
      selectedRows: []
    }
  },

  computed: {
    disabledRows() {
      return this.previewRows.filter((row) => !row.found)
    },
    previewColumns() {
      return [
        {
          field: 'stockNumber',
          header: this.$t('view.stock.product.bulkColStockNumber'),
          sortable: false,
          minWidth: '140px'
        },
        {
          field: 'productCode',
          header: this.$t('view.stock.product.bulkColProductCode'),
          sortable: false,
          minWidth: '120px'
        },
        {
          field: 'mold',
          header: this.$t('view.stock.product.bulkColMold'),
          sortable: false,
          minWidth: '100px'
        },
        {
          field: 'receiptNumber',
          header: this.$t('view.stock.product.bulkColReceiptNumber'),
          sortable: false,
          minWidth: '140px'
        },
        {
          field: 'status',
          header: this.$t('view.stock.product.bulkColStatus'),
          sortable: false,
          minWidth: '100px',
          align: 'center'
        }
      ]
    }
  },

  methods: {
    parseStockNumbers(text) {
      if (!text) return []
      const raw = text
        .split(/[\n,\s]+/)
        .map((s) => s.trim())
        .filter(Boolean)
      return [...new Set(raw)]
    },

    statusLabel(row) {
      if (!row.found) return this.$t('view.stock.product.bulkStatusNotFound')
      if (row.hasImage) return this.$t('view.stock.product.bulkStatusHasImage')
      return this.$t('view.stock.product.bulkStatusReady')
    },

    statusBadgeClass(row) {
      if (!row.found) return 'status-badge--not-found'
      if (row.hasImage) return 'status-badge--has-image'
      return 'status-badge--ready'
    },

    async onCheckList() {
      let stockNumbers = this.parseStockNumbers(this.stockNumbersText)

      if (stockNumbers.length === 0) {
        swAlert.warning('', this.$t('view.stock.product.bulkNoStockNumbers'))
        return
      }

      if (stockNumbers.length > MAX_ROWS) {
        swAlert.warning('', this.$t('view.stock.product.bulkMaxRowsWarning', { max: MAX_ROWS }))
        stockNumbers = stockNumbers.slice(0, MAX_ROWS)
      }

      const res = await this.stockProductImageStore.fetchBulkPreview({
        stockNumbers,
        includeSameMoldInReceipt: this.includeSameMoldInReceipt
      })

      if (res) {
        this.previewRows = res
        this.selectedRows = res.filter((row) => row.found)
      }
    },

    async onSaveBulk() {
      if (!this.uploadFile) {
        swAlert.warning('', this.$t('view.stock.product.bulkNoImage'))
        return
      }

      if (this.selectedRows.length === 0) {
        swAlert.warning('', this.$t('view.stock.product.bulkNoSelection'))
        return
      }

      const formData = new FormData()
      formData.append('Image', this.uploadFile)
      this.selectedRows.forEach((row) => formData.append('StockNumbers', row.stockNumber))
      formData.append('Overwrite', this.overwrite ? 'true' : 'false')
      formData.append('Description', this.description || '')

      const res = await this.stockProductImageStore.fetchCreateBulk({ form: formData })

      if (res) {
        const summary = this.$t('view.stock.product.bulkSummaryMsg', {
          created: res.created?.length || 0,
          overwritten: res.overwritten?.length || 0,
          skipped: res.skipped?.length || 0,
          notFound: res.notFound?.length || 0
        })
        swAlert.success(summary, this.$t('view.stock.product.bulkSummaryTitle'), () => this.resetForm())
      }
    },

    resetForm() {
      this.uploadFile = null
      this.uploadPreviewUrl = null
      this.description = ''
      this.stockNumbersText = ''
      this.previewRows = []
      this.selectedRows = []
      this.overwrite = false
    }
  }
}
</script>

<style lang="scss" scoped>
.bulk-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-lg);
}

@media screen and (max-width: 768px) {
  .bulk-grid {
    grid-template-columns: 1fr;
  }
}

.scope-label {
  font-weight: 600;
  color: var(--base-font-color);
}

.status-badge {
  display: inline-block;
  padding: var(--sp-xs) var(--sp-sm);
  border-radius: var(--radius-sm);
  font-size: var(--fs-sm);
  font-weight: 600;
  white-space: nowrap;

  &--not-found {
    background: var(--status-cancelled-bg);
    color: var(--status-cancelled);
  }

  &--has-image {
    background: var(--status-open-bg);
    color: var(--status-open);
  }

  &--ready {
    background: var(--status-resolved-bg);
    color: var(--status-resolved);
  }
}
</style>
