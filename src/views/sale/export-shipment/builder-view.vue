<template>
  <div class="app-container">
    <PageHeaderGeneric :title="isDetailMode ? $t('view.sale.exportShipment.editTitle') : $t('view.sale.exportShipment.createTitle')" backRoute="sale-export-shipment" />

    <documentInfoSection
      class="mt-4"
      :form="form"
      :editable="true"
      :showStatus="isDetailMode"
      @update:form="form = $event"
    />

    <itemsSection
      class="mt-4"
      :items="items"
      :editable="true"
      @update:items="items = $event"
      @add-item="onAddItem"
      @remove-items="onRemoveItems"
      @recalc-all="onRecalcAll"
    />

    <div v-if="photoProgress" class="photo-progress">
      <i class="bi bi-hourglass-split mr-1"></i>
      {{ $t('view.sale.exportShipment.photoLoadingProgress', { loaded: photoProgress.loaded, total: photoProgress.total }) }}
    </div>

    <div class="action-bar">
      <div class="action-bar-left">
        <ButtonGeneric variant="main" icon="bi-save" :label="$t('view.sale.exportShipment.save')" @click="onSave" />
      </div>
      <div class="action-bar-right">
        <ButtonGeneric variant="outline" icon="bi-printer" :label="$t('view.sale.exportShipment.printInvoice')" @click="onPrintInvoice" />
        <ButtonGeneric variant="outline" icon="bi-printer" :label="$t('view.sale.exportShipment.printSummary')" class="ml-2" @click="onPrintSummary" />
        <ButtonGeneric variant="outline" icon="bi-printer" :label="$t('view.sale.exportShipment.printPackingList')" class="ml-2" @click="onPrintPackingList" />
        <ButtonGeneric variant="outline" icon="bi-printer" :label="$t('view.sale.exportShipment.printPhotoSheet')" class="ml-2" @click="onPrintPhotoSheet" />
        <ButtonGeneric variant="outline" :label="$t('common.btn.back')" class="ml-2" @click="$router.push({ name: 'sale-export-shipment' })" />
      </div>
    </div>

    <stockPickerView
      :isShow="isShowStockPicker"
      :running="form.running"
      @closeModal="isShowStockPicker = false"
      @added="onItemsAdded"
    />
  </div>
</template>

<script>
import { useExportShipmentStore } from '@/stores/modules/api/sale/export-shipment-store.js'
import { formatISOString } from '@/services/utils/dayjs.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { warning, success } from '@/services/alert/sweetAlerts.js'
import { ExportInvoicePdfBuilder } from '@/services/helper/pdf/export-shipment/export-invoice-pdf-builder.js'
import { ExportSummaryPdfBuilder } from '@/services/helper/pdf/export-shipment/export-summary-pdf-builder.js'
import { ExportPackingListPdfBuilder } from '@/services/helper/pdf/export-shipment/export-packing-list-pdf-builder.js'
import { ExportPhotoSheetPdfBuilder } from '@/services/helper/pdf/export-shipment/export-photo-sheet-pdf-builder.js'

import PageHeaderGeneric from '@/components/generic/PageHeaderGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import documentInfoSection from './components/document-info-section.vue'
import itemsSection from './components/items-section.vue'
import stockPickerView from './modal/stock-picker-view.vue'

const defaultForm = () => ({
  running: null,
  documentNumber: '',
  customNumber: '',
  documentDate: new Date(),
  consigneeName: '',
  consigneeAddress: '',
  eventName: '',
  boothNo: '',
  attnName: '',
  attnPassport: '',
  attnTel: '',
  incoterm: 'F.O.B. Bangkok',
  originCountry: 'THAILAND',
  currency: 'USD',
  exchangeRate: null,
  pricePercent: 100,
  parcelCount: 1,
  remark: '',
  status: 0,
  statusName: ''
})

export default {
  name: 'ExportShipmentBuilderView',

  components: {
    PageHeaderGeneric,
    ButtonGeneric,
    documentInfoSection,
    itemsSection,
    stockPickerView
  },

  setup() {
    const exportShipmentStore = useExportShipmentStore()
    return { exportShipmentStore }
  },

  data() {
    return {
      form: defaultForm(),
      items: [],
      isShowStockPicker: false,
      photoProgress: null
    }
  },

  computed: {
    isDetailMode() {
      return !!this.$route.params.running
    }
  },

  async mounted() {
    if (this.isDetailMode) {
      await this.loadData(this.$route.params.running)
    } else {
      await this.onGenerateNumber()
    }
  },

  methods: {
    async onGenerateNumber() {
      const res = await this.exportShipmentStore.generateNumber()
      if (res) {
        this.form.documentNumber = res.documentNumber || (typeof res === 'string' ? res : '')
      }
    },

    async loadData(running) {
      const res = await this.exportShipmentStore.get(running)
      if (!res) return

      this.form = {
        running: res.running,
        documentNumber: res.documentNumber,
        customNumber: res.customNumber,
        documentDate: res.documentDate ? new Date(res.documentDate) : new Date(),
        consigneeName: res.consigneeName,
        consigneeAddress: res.consigneeAddress,
        eventName: res.eventName,
        boothNo: res.boothNo,
        attnName: res.attnName,
        attnPassport: res.attnPassport,
        attnTel: res.attnTel,
        incoterm: res.incoterm,
        originCountry: res.originCountry,
        currency: res.currency,
        exchangeRate: res.exchangeRate,
        pricePercent: res.pricePercent,
        parcelCount: res.parcelCount,
        remark: res.remark,
        status: res.status,
        statusName: res.statusName
      }
      this.items = (res.items || []).map((it) => ({ ...it }))
    },

    validateForm() {
      if (!this.form.customNumber?.trim()) {
        warning(this.$t('view.sale.exportShipment.validation.customNumberRequired'), this.$t('common.label.incompleteData'))
        return false
      }
      if (!this.form.documentDate) {
        warning(this.$t('view.sale.exportShipment.validation.documentDateRequired'), this.$t('common.label.incompleteData'))
        return false
      }
      if (!this.form.consigneeName?.trim()) {
        warning(this.$t('view.sale.exportShipment.validation.consigneeNameRequired'), this.$t('common.label.incompleteData'))
        return false
      }
      if (!this.form.exchangeRate) {
        warning(this.$t('view.sale.exportShipment.validation.exchangeRateRequired'), this.$t('common.label.incompleteData'))
        return false
      }
      return true
    },

    buildPayload() {
      return {
        running: this.form.running || null,
        documentNumber: this.form.documentNumber,
        customNumber: this.form.customNumber,
        documentDate: this.form.documentDate ? formatISOString(this.form.documentDate) : null,
        consigneeName: this.form.consigneeName,
        consigneeAddress: this.form.consigneeAddress,
        eventName: this.form.eventName,
        boothNo: this.form.boothNo,
        attnName: this.form.attnName,
        attnPassport: this.form.attnPassport,
        attnTel: this.form.attnTel,
        incoterm: this.form.incoterm,
        originCountry: this.form.originCountry,
        currency: this.form.currency,
        exchangeRate: Number(this.form.exchangeRate) || 0,
        pricePercent: Number(this.form.pricePercent) || 0,
        parcelCount: Number(this.form.parcelCount) || 0,
        remark: this.form.remark || null,
        items: this.items.map((it, idx) => ({
          id: it.id || null,
          itemNo: it.itemNo ?? idx + 1,
          sortOrder: idx,
          stockNumber: it.stockNumber,
          productCode: it.productCode,
          productNumber: it.productNumber,
          description: it.description,
          goldWeight: Number(it.goldWeight) || 0,
          stoneWeight: Number(it.stoneWeight) || 0,
          diamondWeight: Number(it.diamondWeight) || 0,
          netWeight: Number(it.netWeight) || 0,
          qty: Number(it.qty) || 0,
          tagPrice: Number(it.tagPrice) || 0,
          unitPrice: Number(it.unitPrice) || 0,
          amount: Math.round((Number(it.unitPrice) || 0) * (Number(it.qty) || 0) * 100) / 100,
          imagePath: it.imagePath,
          parcelNo: Number(it.parcelNo) || 1
        }))
      }
    },

    onSave() {
      if (!this.validateForm()) return

      confirmThenSubmit(
        this.form.customNumber || this.form.documentNumber,
        this.$t('view.sale.exportShipment.confirmSaveTitle'),
        async () => {
          const payload = this.buildPayload()
          const res = await this.exportShipmentStore.upsert(payload)
          if (res && res.running) {
            success(this.$t('view.sale.exportShipment.saveSuccess'))
            if (!this.form.running) {
              this.$router.replace({ name: 'sale-export-shipment-edit', params: { running: res.running } })
            }
            await this.loadData(res.running)
          }
        }
      )
    },

    onAddItem() {
      if (!this.form.running) {
        warning(this.$t('view.sale.exportShipment.saveFirst'), this.$t('view.sale.exportShipment.notSavedTitle'))
        return
      }
      this.isShowStockPicker = true
    },

    onItemsAdded(newItems) {
      this.items = newItems
      this.isShowStockPicker = false
    },

    onRemoveItems(itemIds) {
      if (!itemIds || !itemIds.length) return

      confirmThenSubmit(
        this.$t('view.sale.exportShipment.confirmRemoveMsg', { count: itemIds.length }),
        this.$t('view.sale.exportShipment.confirmRemoveTitle'),
        async () => {
          const res = await this.exportShipmentStore.removeItems({ running: this.form.running, itemIds })
          if (res) {
            success(this.$t('view.sale.exportShipment.removeSuccess'))
            this.items = res.items || []
          }
        }
      )
    },

    onRecalcAll() {
      if (!this.items.length) return

      confirmThenSubmit(
        this.$t('view.sale.exportShipment.confirmRecalcMsg'),
        this.$t('view.sale.exportShipment.confirmRecalcTitle'),
        () => {
          const rate = Number(this.form.exchangeRate) || 0
          const pct = Number(this.form.pricePercent) || 0
          this.items = this.items.map((it) => {
            const tagPrice = Number(it.tagPrice) || 0
            const unitPrice = rate > 0 ? Math.round(((tagPrice * pct) / 100 / rate) * 100) / 100 : 0
            return { ...it, unitPrice }
          })
          success(this.$t('view.sale.exportShipment.recalcSuccess'))
        }
      )
    },

    validatePdf() {
      if (!this.items.length) {
        warning(this.$t('view.sale.exportShipment.validation.itemsRequiredForPdf'))
        return false
      }
      return true
    },

    async onPrintInvoice() {
      if (!this.validatePdf()) return
      const builder = new ExportInvoicePdfBuilder(this.form, this.items)
      await builder.preparePDF()
      builder.openPDF()
    },

    async onPrintSummary() {
      if (!this.validatePdf()) return
      const builder = new ExportSummaryPdfBuilder(this.form, this.items)
      await builder.preparePDF()
      builder.openPDF()
    },

    async onPrintPackingList() {
      if (!this.validatePdf()) return
      const builder = new ExportPackingListPdfBuilder(this.form, this.items)
      await builder.preparePDF()
      builder.openPDF()
    },

    async onPrintPhotoSheet() {
      if (!this.validatePdf()) return
      const builder = new ExportPhotoSheetPdfBuilder(this.form, this.items)
      this.photoProgress = { loaded: 0, total: this.items.length }
      await builder.preparePDF((loaded, total) => {
        this.photoProgress = { loaded, total }
      })
      this.photoProgress = null
      builder.openPDF()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.app-container {
  padding: var(--sp-lg);
}

.photo-progress {
  margin-top: var(--sp-md);
  padding: var(--sp-sm) var(--sp-lg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-card-bg);
  color: var(--base-font-color);
  font-weight: 600;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--sp-sm);
  border-top: 1px solid var(--color-border);
  padding-top: var(--sp-lg);
  margin-top: var(--sp-lg);
}

.action-bar-left,
.action-bar-right {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--sp-xs);
}
</style>
