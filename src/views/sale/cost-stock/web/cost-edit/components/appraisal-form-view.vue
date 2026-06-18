<template>
  <div class="appraisal-form-container">
    <form @submit.prevent="onSubmit">
      <!-- Stock Information + Plan Info + Custom Info + Customer Info -->
      <AppraisalStockInfo
        :stockData="localStock"
        :customStockInfo="customInfoItems"
        @view-plan-cost="showPlanCostModal = true"
        @check-gold-price="openKitco"
        @add-custom-info="addCustomInfoItem"
        @remove-custom-info="removeCustomInfoItem"
        @update:customStockInfo="customInfoItems = $event"
        @search-customer="onSearchCustomer"
        @create-customer="onCreateCustomer"
        @update:remark="localStock.remark = $event"
      />

      <!-- Price Appraisal DataTable + Currency + Action Buttons -->
      <AppraisalItemsTable
        :priceItems="tranItems"
        :formAppraisal="{ tagPriceMultiplier, currencyUnit, currencyRate }"
        :exportingPreviewPDF="exportingPreviewPDF"
        @del-item="delTranItem"
        @add-item="addTranItem"
        @update:tagPriceMultiplier="tagPriceMultiplier = $event"
        @update:currencyUnit="currencyUnit = $event"
        @update:currencyRate="currencyRate = $event"
        @save-as-origin="onSaveAsOriginCost"
        @preview-pdf="onPreviewPDF"
        @cancel="onCancel"
      />

    </form>

    <!-- Customer Search Modal -->
    <CustomerSearchModal
      :showModal="showCustomerSearch"
      @closeModal="onCloseCustomerModal"
      @customerSelected="onCustomerSelected"
    />

    <!-- Customer Create Modal -->
    <CustomerCreateModal
      :showModal="showCustomerCreate"
      @closeModal="onCloseCustomerModal"
      @customerCreated="onCustomerCreated"
    />

    <!-- Plan Cost Modal -->
    <PlanCostModal
      v-model:visible="showPlanCostModal"
      :planPriceItems="planPriceItems"
      :planQty="planProductQty"
      :wo="localStock.wo"
      :woNumber="localStock.woNumber"
    />
  </div>
</template>

<script>
import CustomerSearchModal from '@/views/sale/quotation/modal/customer-search-modal.vue'
import CustomerCreateModal from '@/views/sale/quotation/modal/customer-create-modal.vue'
import PlanCostModal from './plan-cost-modal.vue'
import AppraisalStockInfo from './appraisal-stock-info.vue'
import AppraisalItemsTable from './appraisal-items-table.vue'

import { useMasterApiStore } from '@/stores/modules/api/master-store.js'
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { AppraisalHistoryPdfBuilder } from '@/services/helper/pdf/appraisal/appraisal-history-pdf-builder.js'

export default {
  name: 'AppraisalFormView',

  components: {
    CustomerSearchModal,
    CustomerCreateModal,
    PlanCostModal,
    AppraisalStockInfo,
    AppraisalItemsTable
  },

  props: {
    stock: {
      type: Object,
      required: true,
      default: () => ({})
    }
  },

  emits: ['save', 'cancel'],

  setup() {
    const masterStore = useMasterApiStore()
    const productStore = usrStockProductApiStore()
    return { masterStore, productStore }
  },

  computed: {
    planPriceItems() {
      return this.localStock.planPriceItems || []
    },

    hasPlanProductionCost() {
      return this.planPriceItems.length > 0
    },

    planProductQty() {
      return Number(this.localStock.planQty) || 1
    }
  },


  watch: {
    stock: {
      handler(val) {
        if (!val) return
        this.localStock = { ...val }
        this.tagPriceMultiplier = val.tagPriceMultiplier || 1
        this.currencyUnit = val.currencyUnit || ''
        this.currencyRate = val.currencyRate || null
        this.customInfoItems = (val.customStockInfo || []).map((item) => ({
          label: item.label || '',
          value: item.value || ''
        }))

        // Initialize transaction items from priceTransactions only
        if (this.localStock.priceTransactions && this.localStock.priceTransactions.length > 0) {
          this.tranItems = this.localStock.priceTransactions.map((item) => ({
            nameGroup: item.nameGroup || (item.type === 'Diamond' ? 'Gem' : item.type) || 'ETC',
            nameDescription:
              item.nameDescription || item.typeCode || item.description || item.type || '',
            qty: Number(item.qty) || 0,
            qtyPrice: Number(item.qtyPrice) || 0,
            qtyWeight: Number(item.qtyWeight) || 0,
            qtyWeightPrice: Number(item.qtyWeightPrice) || 0,
            totalPrice: Number(item.totalPrice).toFixed(2) || '0.00',
            isAdd: true
          }))
        } else {
          this.tranItems = []
        }

        // Auto-add "น้ำหนักแป้น" for Ring products (productType === 'R')
        if (this.localStock.productType === 'ES') {
          const hasRingP = this.tranItems.some(
            (item) =>
              item.nameGroup === 'Gold' &&
              (item.nameDescription === 'RINGP' || item.nameDescription === 'น้ำหนักแป้น')
          )

          if (!hasRingP) {
            this.tranItems.push({
              nameGroup: 'Gold',
              nameDescription: 'น้ำหนักแป้น',
              qty: 0,
              qtyPrice: 0,
              qtyWeight: 0,
              qtyWeightPrice: 0,
              totalPrice: '0.00',
              isAdd: true
            })

            // Sort by group order
            this.tranItems = this.tranItems.sort(
              (a, b) => this.groupOrderRunning[a.nameGroup] - this.groupOrderRunning[b.nameGroup]
            )
          }
        }
      },
      immediate: true
    }
  },

  data() {
    return {
      localStock: {},
      tranItems: [],
      tagPriceMultiplier: 1,
      currencyUnit: '',
      currencyRate: null,
      showCustomerSearch: false,
      showCustomerCreate: false,
      exportingPreviewPDF: false,
      showPlanCostModal: false,
      customInfoItems: [],

      groupOrderRunning: {
        Gold: 1,
        Worker: 2,
        Embed: 3,
        Gem: 4,
        ETC: 5
      },


    }
  },

  methods: {
    addCustomInfoItem() {
      this.customInfoItems.push({ label: '', value: '' })
    },

    removeCustomInfoItem(index) {
      this.customInfoItems.splice(index, 1)
    },

    addTranItem(masterValue) {
      this.tranItems.push({
        nameGroup: masterValue ?? 'ETC',
        nameDescription: '',
        qty: 0,
        qtyPrice: 0,
        qtyWeight: 0,
        qtyWeightPrice: 0,
        totalPrice: '0.00',
        isAdd: true
      })
      this.tranItems = this.tranItems.sort(
        (a, b) => this.groupOrderRunning[a.nameGroup] - this.groupOrderRunning[b.nameGroup]
      )
    },

    delTranItem(index) {
      this.tranItems.splice(index, 1)
    },

    onSubmit() {
      confirmThenSubmit('', this.$t('view.sale.costStock.confirm.save'), async () => {
        await this.fetchSave(false)
      })
    },

    onSaveAsOriginCost() {
      confirmThenSubmit('', this.$t('view.sale.costStock.confirm.saveAsOrigin'), async () => {
        await this.fetchSave(true)
      })
    },

    async fetchSave(isOriginCost = false) {
      // Mapping data to match API request structure
      const requestData = {
        stockNumber: this.localStock.stockNumber || this.localStock.stockNumberOrigin,
        planRunning: this.localStock.planRunning || null,
        customerCode: this.localStock.customerCode || null,
        customerName: this.localStock.customerName || null,
        customerAddress: this.localStock.customerAddress || null,
        customerTel: this.localStock.customerPhone || null,
        customerEmail: this.localStock.customerEmail || null,
        remark: this.localStock.remark || null,
        tagPriceMultiplier: Number(this.tagPriceMultiplier) || 1,
        currencyUnit: this.currencyUnit || null,
        currencyRate: this.currencyRate ? Number(this.currencyRate) : null,
        customStockInfo: this.customInfoItems
          .filter((i) => i.label.trim())
          .map((i) => ({ label: i.label.trim(), value: i.value.trim() })),
        prictransection: this.tranItems.map((item, index) => ({
          no: index + 1,
          name: item.nameGroup || '',
          nameDescription: item.nameDescription || '',
          nameGroup: item.nameGroup || '',
          date: null,
          qty: Number(item.qty) || 0,
          qtyPrice: Number(item.qtyPrice) || 0,
          qtyWeight: Number(item.qtyWeight) || 0,
          qtyWeightPrice: Number(item.qtyWeightPrice) || 0
        })),
        isOriginCost: isOriginCost
      }

      const response = await this.productStore.fetchAddProductCostDeatialVersion({
        formValue: requestData
      })

      if (response) {
        this.$emit('save', this.localStock)
      }
    },

    onCancel() {
      this.$emit('cancel')
    },

    // Customer Management Methods
    onSearchCustomer() {
      this.showCustomerSearch = true
    },

    onCreateCustomer() {
      this.showCustomerCreate = true
    },

    openKitco() {
      window.open('https://www.kitco.com/', '_blank', 'noopener,noreferrer')
    },

    async onPreviewPDF() {
      this.exportingPreviewPDF = true
      const versionData = {
        running: 'Preview',
        createDate: new Date().toISOString(),
        createBy: '-',
        remark: this.localStock.remark || null,
        customerName: this.localStock.customerName || null,
        customerCode: this.localStock.customerCode || null,
        customerTel: this.localStock.customerPhone || null,
        tagPriceMultiplier: Number(this.tagPriceMultiplier) || 1,
        currencyUnit: this.currencyUnit || '',
        currencyRate: this.currencyRate || null,
        prictransection: this.tranItems.map((item, index) => ({
          no: index + 1,
          name: item.nameGroup || '',
          nameDescription: item.nameDescription || '',
          nameGroup: item.nameGroup || '',
          qty: Number(item.qty) || 0,
          qtyPrice: Number(item.qtyPrice) || 0,
          qtyWeight: Number(item.qtyWeight) || 0,
          qtyWeightPrice: Number(item.qtyWeightPrice) || 0,
          totalPrice: Number(item.totalPrice) || 0
        }))
      }
      const customStockInfo = this.customInfoItems
        .filter((i) => i.label.trim())
        .map((i) => ({ label: i.label.trim(), value: i.value.trim() }))
      const pdfOptions = {
        ...(this.currencyUnit ? { currencyUnit: this.currencyUnit, currencyRate: this.currencyRate } : {}),
        ...(customStockInfo.length ? { customStockInfo } : {})
      }
      const pdfBuilder = new AppraisalHistoryPdfBuilder(this.localStock, versionData, pdfOptions)
      const pdf = await pdfBuilder.generatePDF()
      pdf.open()
      this.exportingPreviewPDF = false
    },

    onCustomerSelected(customerData) {
      this.localStock.customerCode = customerData.code
      this.localStock.customerName = customerData.nameTh || customerData.nameEn
      this.localStock.customerAddress = customerData.address
      this.localStock.customerPhone = customerData.telephone1
      this.localStock.customerEmail = customerData.email
      this.localStock.customerId = customerData.id
      this.showCustomerSearch = false
    },

    onCustomerCreated(customerData) {
      this.localStock.customerCode = customerData.code
      this.localStock.customerName = customerData.nameTh || customerData.nameEn || ''
      this.localStock.customerAddress = customerData.address || ''
      this.localStock.customerPhone = customerData.telephone1 || ''
      this.localStock.customerEmail = customerData.email || ''
      this.localStock.customerId = customerData.id
      this.showCustomerCreate = false
    },

    onCloseCustomerModal() {
      this.showCustomerSearch = false
      this.showCustomerCreate = false
    },

  },

  async created() {
    // Load master gold data
    await this.masterStore.fetchGold()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';

.appraisal-form-container {
  margin-top: 10px;
  padding: 0 5px;
}

</style>
