<template>
  <div class="app-container">
    <pageTitle
      :title="$t('view.sale.materialSale.pageTitle')"
      :description="$t('view.sale.materialSale.pageDescription')"
      :isShowBtnClose="false"
      :isShowRightSlot="true"
    >
      <template #rightSlot>
        <ButtonGeneric
          variant="outline"
          icon="bi-arrow-left"
          :label="$t('common.btn.back')"
          @click="$router.push({ name: 'sale-material-sale' })"
        />
      </template>
    </pageTitle>

    <div v-if="isCancelled && detail && detail.cancelReason" class="cancel-reason-banner">
      <i class="bi bi-exclamation-triangle-fill mr-1"></i>
      {{ $t('view.sale.materialSale.cancelReasonDisplay') }}: {{ detail.cancelReason }}
    </div>

    <documentSection
      class="mt-4"
      :documentNo="form.documentNo"
      :documentDate="form.documentDate"
      :editable="isEditable"
      :statusLabel="statusLabel"
      :statusVariant="statusVariant"
      :showStatus="!!detail"
      @update:documentNo="form.documentNo = $event"
      @update:documentDate="form.documentDate = $event"
      @generate="onGenerateDocumentNo"
    />

    <customerSection
      class="mt-4"
      :customerCode="form.customerCode"
      :customerName="form.customerName"
      :customerAddress="form.customerAddress"
      :customerTel="form.customerTel"
      :customerEmail="form.customerEmail"
      :customerTaxId="form.customerTaxId"
      :editable="isEditable"
      @open-select="isShowCustomerSearch = true"
      @update:customerName="form.customerName = $event"
      @update:customerAddress="form.customerAddress = $event"
      @update:customerTel="form.customerTel = $event"
      @update:customerEmail="form.customerEmail = $event"
      @update:customerTaxId="form.customerTaxId = $event"
    />

    <gemSearchSection
      class="mt-4"
      :editable="isEditable"
      @open-picker="isShowGemPicker = true"
    />

    <itemsSection
      class="mt-4"
      :items="displayItems"
      :editable="isEditable"
      :subTotal="subTotal"
      :vatPercent="displayVatPercent"
      :vatAmount="vatAmount"
      :grandTotal="grandTotal"
      @update:items="onItemsUpdate"
      @remove="onRemoveItem"
    />

    <SectionCardGeneric
      class="mt-4"
      :title="$t('view.sale.materialSale.sectionRemark')"
      icon="bi-card-text"
      headerStyle="filled"
    >
      <FormFieldGeneric :label="$t('view.sale.materialSale.remark')">
        <TextareaGeneric
          :modelValue="form.remark"
          :rows="2"
          :disabled="!isEditable"
          @update:modelValue="form.remark = $event"
        />
      </FormFieldGeneric>
    </SectionCardGeneric>

    <div v-if="isEditable && validationMessages.length" class="validation-warning-box mt-4">
      <div class="validation-warning-title">
        <i class="bi bi-exclamation-triangle-fill mr-1"></i>
        {{ $t('common.label.incompleteData') }}:
      </div>
      <ul class="validation-warning-list">
        <li v-for="msg in validationMessages" :key="msg">{{ msg }}</li>
      </ul>
    </div>

    <div class="action-bar">
      <div class="action-bar-left">
        <ButtonGeneric
          v-if="showDelete"
          variant="red"
          icon="bi-trash"
          :label="$t('view.sale.materialSale.deleteBtn')"
          @click="onDelete"
        />
        <ButtonGeneric
          v-if="showConfirm"
          variant="green"
          icon="bi-check-circle"
          :label="$t('view.sale.materialSale.confirmAndCut')"
          class="ml-2"
          @click="onConfirm"
        />
        <ButtonGeneric
          v-if="showCancel"
          variant="red"
          icon="bi-x-circle"
          :label="$t('view.sale.materialSale.cancelDoc')"
          class="ml-2"
          @click="onOpenCancel"
        />
        <ButtonGeneric
          v-if="showPrintPdf"
          variant="outline"
          icon="bi-printer"
          :label="$t('view.sale.materialSale.printPdf')"
          class="ml-2"
          @click="onPrintPdf"
        />
      </div>
      <div class="action-bar-right">
        <ButtonGeneric
          v-if="showSaveDraft"
          variant="main"
          icon="bi-save"
          :label="$t('view.sale.materialSale.saveDraft')"
          @click="onSaveDraft"
        />
      </div>
    </div>

    <customerSearchModal
      :showModal="isShowCustomerSearch"
      @closeModal="isShowCustomerSearch = false"
      @customerSelected="onSelectCustomer"
    />

    <gemPickerModal
      :showModal="isShowGemPicker"
      :existingCodes="existingCodes"
      @closeModal="isShowGemPicker = false"
      @select="onPickerSelect"
    />

    <modal :showModal="isShowCancelModal" @closeModal="isShowCancelModal = false" width="500px" :isShowActionPart="true">
      <template #title>
        <span class="title-text-lg px-3 pt-3 d-block">{{ $t('view.sale.materialSale.cancelReasonTitle') }}</span>
      </template>
      <template #content>
        <div class="p-3">
          <span class="title-text">{{ $t('view.sale.materialSale.cancelReasonLabel') }} <span class="text-danger">*</span></span>
          <TextareaGeneric
            v-model="cancelReasonText"
            :rows="4"
            :placeholder="$t('view.sale.materialSale.cancelReasonPlaceholder')"
            class="mt-1"
          />
        </div>
      </template>
      <template #action>
        <ButtonGeneric variant="red" icon="bi-x-circle" :label="$t('view.sale.materialSale.cancelDoc')" @click="onSubmitCancel" />
        <ButtonGeneric variant="outline" :label="$t('common.btn.cancel')" class="ml-2" @click="isShowCancelModal = false" />
      </template>
    </modal>
  </div>
</template>

<script>
// External dependencies
import { defineAsyncComponent } from 'vue'
import { useMaterialSaleApiStore } from '@/stores/modules/api/sale/material-sale-store.js'
import { formatISOString } from '@/services/utils/dayjs.js'
import { roundDecimal } from '@/services/utils/decimal.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { warning, success } from '@/services/alert/sweetAlerts.js'
import { MaterialSalePdfBuilder } from '@/services/helper/pdf/material-sale/material-sale-pdf-builder.js'

// Local components
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import TextareaGeneric from '@/components/generic/TextareaGeneric.vue'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import documentSection from './components/document-section.vue'
import customerSection from './components/customer-section.vue'
import gemSearchSection from './components/gem-search-section.vue'
import itemsSection from './components/items-section.vue'
import customerSearchModal from './modal/customer-search-modal.vue'
import gemPickerModal from './modal/gem-picker-modal.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))
const pageTitle = defineAsyncComponent(() => import('@/components/custom/page-title.vue'))

const interfaceForm = {
  running: null,
  documentNo: '',
  documentDate: new Date(),
  customerCode: '',
  customerName: '',
  customerAddress: '',
  customerTel: '',
  customerEmail: '',
  customerTaxId: '',
  remark: ''
}

export default {
  name: 'MaterialSaleCreateView',

  components: {
    modal,
    pageTitle,
    ButtonGeneric,
    TextareaGeneric,
    SectionCardGeneric,
    FormFieldGeneric,
    documentSection,
    customerSection,
    gemSearchSection,
    itemsSection,
    customerSearchModal,
    gemPickerModal
  },

  setup() {
    const materialSaleStore = useMaterialSaleApiStore()
    return { materialSaleStore }
  },

  data() {
    return {
      form: { ...interfaceForm },
      vatPercent: 7,
      items: [],
      detail: null,
      isShowCustomerSearch: false,
      isShowGemPicker: false,
      isShowCancelModal: false,
      cancelReasonText: ''
    }
  },

  computed: {
    isDetailMode() {
      return !!this.$route.params.running
    },

    status() {
      return this.detail ? this.detail.status : 10
    },

    isEditable() {
      return this.status === 10
    },

    isConfirmed() {
      return this.status === 100
    },

    isCancelled() {
      return this.status === 500
    },

    hasRunning() {
      return !!this.form.running
    },

    statusLabel() {
      if (this.isConfirmed) return this.$t('view.sale.materialSale.statusConfirmed')
      if (this.isCancelled) return this.$t('view.sale.materialSale.statusCancelled')
      return this.$t('view.sale.materialSale.statusDraft')
    },

    statusVariant() {
      if (this.isConfirmed) return 'green'
      if (this.isCancelled) return 'red'
      return 'gray'
    },

    existingCodes() {
      return this.items.map((it) => it.gemCode)
    },

    displayItems() {
      if (!this.isEditable) return this.items

      return this.items.map((it) => {
        const priceExclVat = roundDecimal(Number(it.priceInclVat || 0) / 1.07)
        const amount = roundDecimal(priceExclVat * (Number(it.qtyWeight) || 0))
        return { ...it, priceExclVat, amount }
      })
    },

    displayVatPercent() {
      return this.isEditable ? this.vatPercent : this.detail?.vatPercent ?? 7
    },

    subTotal() {
      if (this.isEditable) {
        return roundDecimal(this.displayItems.reduce((sum, it) => sum + (Number(it.amount) || 0), 0))
      }
      return Number(this.detail?.subTotal || 0)
    },

    vatAmount() {
      if (this.isEditable) {
        return roundDecimal((this.subTotal * (Number(this.vatPercent) || 0)) / 100)
      }
      return Number(this.detail?.vatAmount || 0)
    },

    grandTotal() {
      if (this.isEditable) {
        return roundDecimal(this.subTotal + this.vatAmount)
      }
      return Number(this.detail?.grandTotal || 0)
    },

    showSaveDraft() {
      return this.isEditable
    },

    showDelete() {
      return this.isEditable && this.hasRunning
    },

    showConfirm() {
      return this.isEditable && this.hasRunning
    },

    showPrintPdf() {
      return this.hasRunning
    },

    showCancel() {
      return this.isConfirmed
    },

    validationMessages() {
      const messages = []
      if (!this.form.customerName?.trim()) {
        messages.push(this.$t('view.sale.materialSale.validation.customerRequired'))
      }
      if (this.items.length === 0) {
        messages.push(this.$t('view.sale.materialSale.validation.itemsRequired'))
      }
      if (!this.form.documentDate) {
        messages.push(this.$t('view.sale.materialSale.validation.documentDateRequired'))
      }
      return messages
    }
  },

  async mounted() {
    if (this.isDetailMode) {
      await this.loadData(this.$route.params.running)
    } else {
      await this.onGenerateDocumentNo()
    }
  },

  methods: {
    async loadData(running) {
      const res = await this.materialSaleStore.fetchGet({ running })
      if (!res) return

      this.detail = res
      this.form.running = res.running
      this.form.documentNo = res.documentNo
      this.form.documentDate = res.documentDate ? new Date(res.documentDate) : new Date()
      this.form.customerCode = res.customerCode
      this.form.customerName = res.customerName
      this.form.customerAddress = res.customerAddress
      this.form.customerTel = res.customerTel
      this.form.customerEmail = res.customerEmail
      this.form.customerTaxId = res.customerTaxId
      this.form.remark = res.remark || ''
      this.vatPercent = res.vatPercent ?? 7
      this.items = (res.items || []).map((it) => ({ ...it }))
    },

    async onGenerateDocumentNo() {
      const res = await this.materialSaleStore.fetchGenerateDocumentNumber()
      if (res) {
        this.form.documentNo = typeof res === 'string' ? res : res.documentNo || ''
      }
    },

    onSelectCustomer(customerData) {
      this.form.customerCode = customerData.code || ''
      this.form.customerName = customerData.nameTh || customerData.nameEn || ''
      this.form.customerAddress = customerData.address || ''
      this.form.customerTel = customerData.telephone1 || ''
      this.form.customerEmail = customerData.email || ''
      this.form.customerTaxId = customerData.taxId || ''
    },

    onPickerSelect(rows) {
      const newRows = rows.map((p) => ({
        gemCode: p.gemCode,
        gemName: p.gemName,
        gemGroup: p.gemGroup,
        gemShape: p.gemShape,
        gemSize: p.gemSize,
        gemGrade: p.gemGrade,
        description: [p.gemName, p.gemSize].filter(Boolean).join(' '),
        qtyPiece: 0,
        qtyWeight: 0,
        priceInclVat: 0,
        refStockPrice: p.refStockPrice,
        remainQty: p.remainQty,
        remainWeight: p.remainWeight,
        remark: ''
      }))
      this.items = [...this.items, ...newRows]
    },

    onItemsUpdate(newItems) {
      this.items = newItems.map((it) => ({ ...it }))
    },

    onRemoveItem(index) {
      this.items = this.items.filter((_, i) => i !== index)
    },

    validateForm() {
      if (!this.form.documentDate) {
        warning(this.$t('view.sale.materialSale.validation.documentDateRequired'))
        return false
      }
      if (!this.form.customerName?.trim()) {
        warning(this.$t('view.sale.materialSale.validation.customerRequired'))
        return false
      }
      if (this.items.length === 0) {
        warning(this.$t('view.sale.materialSale.validation.itemsRequired'))
        return false
      }
      return true
    },

    buildPayload() {
      return {
        documentNo: this.form.documentNo,
        documentDate: this.form.documentDate ? formatISOString(this.form.documentDate) : null,
        customerCode: this.form.customerCode,
        customerName: this.form.customerName,
        customerAddress: this.form.customerAddress,
        customerTel: this.form.customerTel,
        customerEmail: this.form.customerEmail,
        customerTaxId: this.form.customerTaxId,
        vatPercent: Number(this.vatPercent) || 7,
        remark: this.form.remark || null,
        items: this.displayItems.map((it, idx) => ({
          itemNo: idx + 1,
          gemCode: it.gemCode,
          gemName: it.gemName,
          gemGroup: it.gemGroup,
          gemShape: it.gemShape,
          gemSize: it.gemSize,
          gemGrade: it.gemGrade,
          description: it.description,
          qtyPiece: Number(it.qtyPiece) || 0,
          qtyWeight: Number(it.qtyWeight) || 0,
          priceInclVat: Number(it.priceInclVat) || 0,
          refStockPrice: Number(it.refStockPrice) || 0,
          remark: it.remark || null
        }))
      }
    },

    onSaveDraft() {
      if (!this.validateForm()) return

      confirmThenSubmit(this.form.documentNo, this.$t('view.sale.materialSale.confirmSaveTitle'), async () => {
        await this.doSave()
      })
    },

    async doSave() {
      const payload = this.buildPayload()

      if (this.isDetailMode) {
        payload.running = this.form.running
        const res = await this.materialSaleStore.fetchUpdate({ formValue: payload })
        if (res && res.running) {
          success(this.$t('view.sale.materialSale.updateSuccess'))
          await this.loadData(res.running)
        }
        return
      }

      const res = await this.materialSaleStore.fetchCreate({ formValue: payload })
      if (res && res.running) {
        success(this.$t('view.sale.materialSale.saveSuccess'), null, () => {
          this.$router.push({ name: 'sale-material-sale-detail', params: { running: res.running } })
        })
      }
    },

    onConfirm() {
      confirmThenSubmit(
        this.$t('view.sale.materialSale.confirmConfirmMsg'),
        this.$t('view.sale.materialSale.confirmConfirmTitle'),
        async () => {
          const res = await this.materialSaleStore.fetchConfirm({ running: this.form.running })
          if (res) {
            success(this.$t('view.sale.materialSale.confirmSuccess'))
            await this.loadData(this.form.running)
          }
        }
      )
    },

    onDelete() {
      confirmThenSubmit(this.form.documentNo, this.$t('view.sale.materialSale.confirmDeleteTitle'), async () => {
        const res = await this.materialSaleStore.fetchDelete({ running: this.form.running })
        if (res) {
          success(this.$t('view.sale.materialSale.deleteSuccess'))
          this.$router.push({ name: 'sale-material-sale' })
        }
      })
    },

    onOpenCancel() {
      this.cancelReasonText = ''
      this.isShowCancelModal = true
    },

    onSubmitCancel() {
      if (!this.cancelReasonText.trim()) {
        warning(this.$t('view.sale.materialSale.cancelReasonRequired'))
        return
      }

      confirmThenSubmit(this.cancelReasonText, this.$t('view.sale.materialSale.cancelReasonTitle'), async () => {
        const res = await this.materialSaleStore.fetchCancel({
          running: this.form.running,
          cancelReason: this.cancelReasonText.trim()
        })
        if (res) {
          success(this.$t('view.sale.materialSale.cancelSuccess'))
          this.isShowCancelModal = false
          await this.loadData(this.form.running)
        }
      })
    },

    async onPrintPdf() {
      const res = await this.materialSaleStore.fetchGet({ running: this.form.running })
      if (!res) return

      const builder = new MaterialSalePdfBuilder(res)
      await builder.preparePDF()
      builder.generatePDF().open()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';

.app-container {
  padding: var(--sp-lg);
}

.cancel-reason-banner {
  margin-top: var(--sp-md);
  padding: var(--sp-sm) var(--sp-lg);
  border: 1px solid var(--base-red);
  border-radius: var(--radius-md);
  background: #ffecec;
  color: var(--base-red);
  font-weight: 600;
}

.validation-warning-box {
  padding: var(--sp-md) var(--sp-lg);
  border: 1px solid var(--base-warning);
  border-radius: var(--radius-md);
  background: var(--status-open-bg);
}

.validation-warning-title {
  display: flex;
  align-items: center;
  font-weight: 700;
  color: var(--base-warning);
  margin-bottom: var(--sp-xs);
}

.validation-warning-list {
  margin: 0;
  padding-left: var(--sp-xl);
  color: var(--base-font-color);
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
}
</style>
