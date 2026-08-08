<template>
  <PrintPreviewPanel
    :isShow="isShowModal"
    :title="previewTitle"
    @close="onClose"
  >
    <template #toolbar>
      <div class="continuous-preview-toolbar">
        <div class="toolbar-group">
          <span class="toolbar-label">{{ $t('view.sale.invoiceDetail.previewZoomLabel') }}</span>
          <DropdownGeneric
            v-model="zoom"
            :options="zoomOptions"
            optionLabel="label"
            optionValue="value"
            customClass="zoom-dropdown"
          />
        </div>

        <div class="toolbar-group">
          <ButtonGeneric
            variant="outline"
            icon="bi-chevron-left"
            :disabled="!canGoPrev"
            @click="prevPage"
          />
          <span class="toolbar-page-label">
            {{ $t('view.sale.invoiceDetail.previewPageLabel', { current: currentPage + 1, total: pageCount }) }}
          </span>
          <ButtonGeneric
            variant="outline"
            icon="bi-chevron-right"
            :disabled="!canGoNext"
            @click="nextPage"
          />
        </div>

        <div class="toolbar-group">
          <CheckboxGeneric v-model="showGrid" :label="$t('view.sale.invoiceDetail.previewGridToggle')" />
        </div>

        <div v-if="offsetLabel" class="toolbar-group toolbar-offset">
          <i class="bi bi-arrows-move mr-1"></i>{{ offsetLabel }}
        </div>
      </div>
    </template>

    <div ref="previewMeasure" class="continuous-preview-stage">
      <PrintModelPreview
        :model="model"
        :pageIndex="currentPage"
        :zoom="effectiveZoom"
        :showGrid="showGrid"
      />
    </div>

    <template #footer>
      <ButtonGeneric
        variant="green"
        icon="bi-printer"
        :label="$t('view.sale.invoiceDetail.previewPrintNowBtn')"
        class="mr-2"
        @click="onPrintNow"
      />
      <ButtonGeneric
        variant="outline"
        :label="$t('common.btn.close')"
        @click="onClose"
      />
    </template>
  </PrintPreviewPanel>
</template>

<script>
import PrintPreviewPanel from '@/components/print/print-preview-panel.vue'
import PrintModelPreview from '@/components/print/print-model-preview.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import CheckboxGeneric from '@/components/prime-vue/CheckboxGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

export default {
  name: 'ContinuousPrintPreviewPanel',

  components: {
    PrintPreviewPanel,
    PrintModelPreview,
    DropdownGeneric,
    CheckboxGeneric,
    ButtonGeneric
  },

  props: {
    isShowModal: {
      type: Boolean,
      default: false
    },
    model: {
      type: Object,
      default: () => null
    },
    paperLabel: {
      type: String,
      default: ''
    },
    offsetLabel: {
      type: String,
      default: ''
    }
  },

  emits: ['close-modal', 'print-now'],

  data() {
    return {
      zoom: 'fit',
      fitZoomValue: 1,
      currentPage: 0,
      showGrid: true
    }
  },

  computed: {
    zoomOptions() {
      return [
        { value: 'fit', label: this.$t('view.sale.invoiceDetail.previewZoomFit') },
        { value: 0.5, label: '50%' },
        { value: 0.75, label: '75%' },
        { value: 1, label: '100%' },
        { value: 1.25, label: '125%' },
        { value: 1.5, label: '150%' }
      ]
    },

    effectiveZoom() {
      return this.zoom === 'fit' ? this.fitZoomValue : this.zoom
    },

    pageCount() {
      return this.model?.pages?.length || 1
    },

    canGoPrev() {
      return this.currentPage > 0
    },

    canGoNext() {
      return this.currentPage < this.pageCount - 1
    },

    previewTitle() {
      return this.paperLabel
        ? this.$t('view.sale.invoiceDetail.previewTitleWithPaper', { paper: this.paperLabel })
        : this.$t('view.sale.invoiceDetail.previewTitle')
    }
  },

  watch: {
    isShowModal(newVal) {
      if (newVal) {
        this.currentPage = 0
        this.$nextTick(() => this.computeFitZoom())
      }
    },

    pageCount(newVal) {
      if (this.currentPage > newVal - 1) {
        this.currentPage = Math.max(0, newVal - 1)
      }
    }
  },

  mounted() {
    window.addEventListener('resize', this.computeFitZoom)
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.computeFitZoom)
  },

  methods: {
    computeFitZoom() {
      const el = this.$refs.previewMeasure
      if (!el) return

      const containerWidth = el.clientWidth
      if (!containerWidth) return

      const paperWidthIn = (this.model?.paper?.widthHundredthInch || 900) / 100
      const paperWidthPxAtScale1 = paperWidthIn * 96
      const scale = (containerWidth - 60) / paperWidthPxAtScale1
      this.fitZoomValue = Math.max(0.25, scale)
    },

    prevPage() {
      if (this.canGoPrev) this.currentPage--
    },

    nextPage() {
      if (this.canGoNext) this.currentPage++
    },

    onClose() {
      this.$emit('close-modal')
    },

    onPrintNow() {
      this.$emit('print-now')
    }
  }
}
</script>

<style lang="scss" scoped>
.continuous-preview-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--sp-lg);
  padding: var(--sp-sm) var(--sp-lg);
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
}

.toolbar-label {
  font-size: var(--fs-sm);
  font-weight: 600;
  color: var(--base-sub-color);
}

.toolbar-page-label {
  font-size: var(--fs-sm);
  color: var(--base-font-color);
  font-weight: 600;
  white-space: nowrap;
}

.toolbar-offset {
  margin-left: auto;
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}

:deep(.zoom-dropdown) {
  min-width: 90px;
}

.continuous-preview-stage {
  width: 100%;
}
</style>
