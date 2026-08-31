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
        ref="itemsTable"
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
        @open-gold-calculator="onOpenGoldCalculator"
        @open-alloy-calculator="onOpenAlloyCalculator"
      />

    </form>

    <GoldCalculatorModal
      :isShow="showGoldCalculator"
      :defaultCurrencyRate="goldCalculatorRate"
      @closeModal="showGoldCalculator = false"
      @select="onGoldCalculatorSelect"
    />

    <AlloyCalculatorModal
      :isShow="showAlloyCalculator"
      :goldWeight="alloyMainGoldWeight"
      :defaultKarat="alloyDefaultKarat"
      :goldColorTypeCode="alloyGoldColorTypeCode"
      :goldColorFallback="alloyGoldColorFallback"
      :goldLossPercent="breakdownSetting.goldLossPercent"
      :alloyFactor18K="breakdownSetting.alloyFactor18K"
      :alloyFactor14K="breakdownSetting.alloyFactor14K"
      :alloyFactor9K="breakdownSetting.alloyFactor9K"
      :alloyRateYgWgUsd="breakdownSetting.alloyRateYgWgUsd"
      :alloyRatePgUsd="breakdownSetting.alloyRatePgUsd"
      :currencyRate="goldCalculatorRate"
      @closeModal="showAlloyCalculator = false"
      @select="onAlloyCalculatorSelect"
    />

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
import GoldCalculatorModal from '@/components/modal/gold-calculator-modal.vue'
import AlloyCalculatorModal from '@/components/modal/alloy-calculator-modal.vue'

import { useMasterApiStore } from '@/stores/modules/api/master-store.js'
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { warning } from '@/services/alert/sweetAlerts.js'
import { AppraisalHistoryPdfBuilder } from '@/services/helper/pdf/appraisal/appraisal-history-pdf-builder.js'
import { getBreakdownSetting, BREAKDOWN_SETTING_DEFAULT } from '@/services/helper/breakdown-setting-store.js'
import { getTermHistory, saveTermHistory, addTerms } from '@/services/helper/breakdown-term-history-store.js'

export default {
  name: 'AppraisalFormView',

  components: {
    CustomerSearchModal,
    CustomerCreateModal,
    PlanCostModal,
    AppraisalStockInfo,
    AppraisalItemsTable,
    GoldCalculatorModal,
    AlloyCalculatorModal
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
    },

    goldCalculatorRate() {
      const unit = (this.currencyUnit || '').trim().toUpperCase()
      if (unit !== 'US$' && unit !== 'USD') return 0
      return Number(this.currencyRate) || 0
    },

    // เงื่อนไขเดียวกับ hasCurrencyConversion ใน appraisal-items-table.vue และ appraisal-history-pdf-builder.js
    // ให้ screen/PDF ตัดสินใจว่า "กำลังใช้สกุลเงินต่างประเทศ" ตรงกันเสมอ
    hasValidCurrencyRate() {
      const rate = Number(this.currencyRate)
      return !!(this.currencyUnit && rate > 0 && rate !== 1)
    },

    // rate ที่ใช้แปลงหน่วยจริง — เป็น 1 เมื่อไม่ได้ใช้สกุลเงินต่างประเทศ (กันหารด้วย 0 และทำให้สูตรเดียวใช้ได้ทุกกรณี)
    conversionRate() {
      return this.hasValidCurrencyRate ? Number(this.currencyRate) : 1
    }
  },


  watch: {
    stock: {
      handler(val) {
        if (!val) return
        // กันไม่ให้ watcher ของ conversionRate rebase ซ้ำระหว่างกำลัง load ข้อมูลชุดใหม่
        this.suppressRateRebase = true
        this.localStock = { ...val }
        this.tagPriceMultiplier = val.tagPriceMultiplier || 1
        this.currencyUnit = val.currencyUnit || ''
        this.currencyRate = val.currencyRate || null
        this.customInfoItems = (val.customStockInfo || []).map((item) => ({
          label: item.label || '',
          value: item.value || ''
        }))

        // Initialize transaction items from priceTransactions only
        // priceTransactions เก็บเป็นบาทเสมอ (DB) — แปลงเป็น "หน่วยที่แสดง" ครั้งเดียวตรงนี้ด้วย conversionRate ปัจจุบัน
        const rate = this.conversionRate
        if (this.localStock.priceTransactions && this.localStock.priceTransactions.length > 0) {
          this.tranItems = this.localStock.priceTransactions.map((item) => {
            const nameGroup = item.nameGroup || (item.type === 'Diamond' ? 'Gem' : item.type) || 'ETC'
            const qty = Number(item.qty) || 0
            const qtyWeight = Number(item.qtyWeight) || 0
            const qtyPrice = this.toDisplay(item.qtyPrice, rate)
            const qtyWeightPrice = this.toDisplay(item.qtyWeightPrice, rate)
            return {
              nameGroup,
              nameDescription:
                item.nameDescription || item.typeCode || item.description || item.type || '',
              qty,
              qtyPrice,
              qtyWeight,
              qtyWeightPrice,
              totalPrice: this.round2(qty * qtyPrice + qtyWeight * qtyWeightPrice).toFixed(2),
              applyGoldLoss: this.resolveApplyGoldLoss(item, nameGroup),
              isAdd: true
            }
          })
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
              applyGoldLoss: true,
              isAdd: true
            })

            // Sort by group order
            this.tranItems = this.tranItems.sort(
              (a, b) => this.groupOrderRunning[a.nameGroup] - this.groupOrderRunning[b.nameGroup]
            )
          }
        }

        this.$nextTick(() => {
          this.suppressRateRebase = false
        })
      },
      immediate: true
    },

    // ผู้ใช้เปลี่ยน currencyUnit/currencyRate กลางคัน (ไม่ใช่ตอน load stock ใหม่) — rebase ค่าที่แสดง
    // จาก rate เดิมกลับเป็นบาทแล้วแปลงไป rate ใหม่ ให้ค่าที่เก็บจริง (บาท) ไม่เพี้ยน
    conversionRate(newRate, oldRate) {
      if (this.suppressRateRebase) return
      this.rebaseCurrencyValues(oldRate, newRate)
    }
  },

  data() {
    return {
      localStock: {},
      tranItems: [],
      tagPriceMultiplier: 1,
      currencyUnit: '',
      currencyRate: null,
      suppressRateRebase: false,
      showCustomerSearch: false,
      showCustomerCreate: false,
      exportingPreviewPDF: false,
      showPlanCostModal: false,
      customInfoItems: [],
      showGoldCalculator: false,
      goldCalculatorTargetRow: null,

      showAlloyCalculator: false,
      alloyCalculatorTargetRow: null,
      alloyMainGoldWeight: 0,
      alloyDefaultKarat: '',
      alloyGoldColorTypeCode: '',
      alloyGoldColorFallback: false,
      breakdownSetting: { ...BREAKDOWN_SETTING_DEFAULT },

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
        applyGoldLoss: masterValue === 'Gold',
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
      // tranItems เก็บเป็น "หน่วยที่แสดง" (อาจเป็นสกุลต่างประเทศ) — แปลงกลับเป็นบาทที่จุดนี้จุดเดียวก่อนส่งเข้า DB
      const rate = this.conversionRate
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
          qtyPrice: this.toThb(item.qtyPrice, rate),
          qtyWeight: Number(item.qtyWeight) || 0,
          qtyWeightPrice: this.toThb(item.qtyWeightPrice, rate),
          applyGoldLoss: this.resolveApplyGoldLoss(item, item.nameGroup)
        })),
        isOriginCost: isOriginCost
      }

      const response = await this.productStore.fetchAddProductCostDeatialVersion({
        formValue: requestData
      })

      if (response) {
        this.saveCustomTermsToHistory()
        this.$emit('save', this.localStock)
      }
    },

    // เก็บคำที่ผู้ใช้พิมพ์เอง (ไม่มีใน master list) เข้า term history — แชร์ทั้งบริษัทผ่าน PrintLayout key แยก
    // fire-and-forget เสมอ: ห้าม await/บล็อก และห้ามให้ error ของ history ไปกระทบผลบันทึกใบตีราคาที่สำเร็จแล้ว
    saveCustomTermsToHistory() {
      try {
        const itemsTable = this.$refs.itemsTable
        if (!itemsTable) return

        const termsByGroup = {}
        this.tranItems.forEach((item) => {
          const nameGroup = item.nameGroup
          const term = (item.nameDescription || '').trim()
          if (!term || !itemsTable.isCustomTerm(nameGroup, term)) return
          if (!termsByGroup[nameGroup]) termsByGroup[nameGroup] = []
          termsByGroup[nameGroup].push(term)
        })

        const groups = Object.keys(termsByGroup)
        if (!groups.length) return

        getTermHistory({ skipError: true, skipLoading: true })
          .then((history) => {
            let updated = history
            groups.forEach((group) => {
              updated = addTerms(updated, group, termsByGroup[group])
            })
            return saveTermHistory(updated, { skipError: true, skipLoading: true })
          })
          .catch(() => {})
      } catch {
        // non-critical — ห้ามให้ term history ที่พังไปกระทบ flow บันทึกใบตีราคาหลัก
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
      // เช่นเดียวกับ fetchSave() — แปลง tranItems (หน่วยที่แสดง) กลับเป็นบาทก่อนส่งให้ builder
      // (AppraisalHistoryPdfBuilder.convertPrice() รับค่าเป็นบาทแล้วแปลงกลับไปแสดงเป็นสกุลที่เลือกเองอีกที)
      const rate = this.conversionRate
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
        prictransection: this.tranItems.map((item, index) => {
          const qty = Number(item.qty) || 0
          const qtyWeight = Number(item.qtyWeight) || 0
          const qtyPriceThb = this.toThb(item.qtyPrice, rate)
          const qtyWeightPriceThb = this.toThb(item.qtyWeightPrice, rate)
          return {
            no: index + 1,
            name: item.nameGroup || '',
            nameDescription: item.nameDescription || '',
            nameGroup: item.nameGroup || '',
            qty,
            qtyPrice: qtyPriceThb,
            qtyWeight,
            qtyWeightPrice: qtyWeightPriceThb,
            totalPrice: this.round2(qty * qtyPriceThb + qtyWeight * qtyWeightPriceThb),
            applyGoldLoss: this.resolveApplyGoldLoss(item, item.nameGroup)
          }
        })
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

    onOpenGoldCalculator(row) {
      this.goldCalculatorTargetRow = row
      this.showGoldCalculator = true
    },

    onGoldCalculatorSelect(data) {
      // GoldCalculatorModal คำนวณราคาออกมาเป็นบาทเสมอ (pricePerGramThb) — แปลงเป็น "หน่วยที่แสดง" ก่อนเก็บลง tranItems
      const pricePerGramThb = Number(data.pricePerGramThb) || 0
      const targetRow = this.goldCalculatorTargetRow

      if (targetRow && pricePerGramThb) {
        targetRow.qtyWeightPrice = this.toDisplay(pricePerGramThb, this.conversionRate)
        targetRow.totalPrice = this.calcTotalPrice(targetRow)
      }

      this.showGoldCalculator = false
      this.goldCalculatorTargetRow = null
    },

    // สูตรเดียวกับ onBlurPrice() ใน appraisal-items-table.vue — ใช้ร่วมกันทุกจุดที่ set ราคาแทนผู้ใช้
    calcTotalPrice(item) {
      return (
        (Number(item.qty) || 0) * (Number(item.qtyPrice) || 0) +
        (Number(item.qtyWeight) || 0) * (Number(item.qtyWeightPrice) || 0)
      ).toFixed(2)
    },

    onOpenAlloyCalculator(rowData) {
      const excludedDescriptions = ['Alloy', 'Gold Loss', 'น้ำหนักแป้น', 'RINGP']
      const mainGoldRow = this.tranItems.find(
        (item) => item.nameGroup === 'Gold' && !excludedDescriptions.includes(item.nameDescription)
      )

      if (!mainGoldRow || !(Number(mainGoldRow.qtyWeight) > 0)) {
        warning(this.$t('view.sale.costStock.alloyCalculator.mainGoldNotFound'))
        return
      }

      this.alloyMainGoldWeight = Number(mainGoldRow.qtyWeight) || 0
      this.alloyDefaultKarat = this.parseKaratFromStockNumber()
      this.alloyGoldColorFallback = false
      this.alloyGoldColorTypeCode = this.detectGoldColorTypeCode()

      this.alloyCalculatorTargetRow = rowData
      this.showAlloyCalculator = true
    },

    parseKaratFromStockNumber() {
      const stockNumber = this.localStock.stockNumber || this.localStock.stockNumberOrigin || ''
      const match = /^DK-(\d+K)-/.exec(stockNumber)
      return match ? match[1] : ''
    },

    detectGoldColorTypeCode() {
      const materials = Array.isArray(this.localStock.materials) ? this.localStock.materials : []
      const goldMaterial = materials.find((m) => m.type === 'Gold' && m.typeCode)
      if (goldMaterial && goldMaterial.typeCode) {
        return goldMaterial.typeCode.toUpperCase()
      }
      this.alloyGoldColorFallback = true
      return 'YG'
    },

    onAlloyCalculatorSelect(data) {
      // AlloyCalculatorModal ก็คำนวณราคาออกมาเป็นบาทเสมอเช่นกัน (ดู alloy-calculator-modal.vue computedQtyWeightPrice) — แปลงก่อนเก็บ
      const targetRow = this.alloyCalculatorTargetRow
      if (targetRow) {
        targetRow.qtyWeight = Number(data.qtyWeight) || 0
        targetRow.qtyWeightPrice = this.toDisplay(Number(data.qtyWeightPrice) || 0, this.conversionRate)
        targetRow.totalPrice = this.calcTotalPrice(targetRow)
      }

      this.showAlloyCalculator = false
      this.alloyCalculatorTargetRow = null
    },

    // ปัดเลขเป็นทศนิยม 2 ตำแหน่งแบบ standard (ใช้ก่อนแปลงหน่วยเงินทุกจุด กันสะสม floating point error)
    round2(num) {
      const n = Number(num)
      if (!Number.isFinite(n)) return 0
      return Math.round((n + Number.EPSILON) * 100) / 100
    },

    // บาท (DB) -> หน่วยที่แสดง (rate=1 เมื่อไม่ได้ใช้สกุลเงินต่างประเทศ)
    toDisplay(thbValue, rate) {
      return this.round2((Number(thbValue) || 0) / (Number(rate) || 1))
    },

    // หน่วยที่แสดง -> บาท (DB)
    toThb(displayValue, rate) {
      return this.round2((Number(displayValue) || 0) * (Number(rate) || 1))
    },

    // fallback ตามกติกา backend: null/undefined ของข้อมูลเก่า -> ใช้ nameGroup === 'Gold'
    resolveApplyGoldLoss(item, nameGroup) {
      return typeof item.applyGoldLoss === 'boolean' ? item.applyGoldLoss : nameGroup === 'Gold'
    },

    // rebase ค่าที่แสดงทั้งหมดจาก rate เดิม (oldRate) ไป rate ใหม่ (newRate) โดยอิงบาทเป็นค่ากลาง
    // เรียกเฉพาะตอน conversionRate เปลี่ยนจริง (ไม่ใช่ทุก keystroke) กันตัวเลขเพี้ยนสะสม
    rebaseCurrencyValues(oldRate, newRate) {
      const from = Number(oldRate) || 1
      const to = Number(newRate) || 1
      if (from === to || !this.tranItems.length) return
      this.tranItems = this.tranItems.map((item) => {
        const qtyPriceThb = this.toThb(item.qtyPrice, from)
        const qtyWeightPriceThb = this.toThb(item.qtyWeightPrice, from)
        const qtyPrice = this.toDisplay(qtyPriceThb, to)
        const qtyWeightPrice = this.toDisplay(qtyWeightPriceThb, to)
        const qty = Number(item.qty) || 0
        const qtyWeight = Number(item.qtyWeight) || 0
        return {
          ...item,
          qtyPrice,
          qtyWeightPrice,
          totalPrice: this.round2(qty * qtyPrice + qtyWeight * qtyWeightPrice).toFixed(2)
        }
      })
    }
  },

  async created() {
    // Load master gold data
    await this.masterStore.fetchGold()
    this.breakdownSetting = await getBreakdownSetting()
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
