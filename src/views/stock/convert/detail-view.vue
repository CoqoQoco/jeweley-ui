<template>
  <div class="app-container">
    <PageHeaderGeneric :title="pageTitle" backRoute="stock-convert-list" />

    <div v-if="notFound">
      <SectionCardGeneric :title="$t('view.stock.convert.notFoundTitle')" headerStyle="legend" icon="bi-exclamation-circle" accent="main">
        <div class="not-found-box">
          <p>{{ $t('view.stock.convert.notFoundDesc', { running }) }}</p>
          <ButtonGeneric variant="outline" icon="bi-arrow-left" :label="$t('view.stock.convert.backToList')" @click="$router.push({ name: 'stock-convert-list' })" />
        </div>
      </SectionCardGeneric>
    </div>

    <template v-else>
      <SectionCardGeneric v-if="!isCreateMode" :title="$t('common.field.status')" headerStyle="legend" icon="bi-info-circle" accent="main" class="mt-3">
        <div class="header-info-grid">
          <div class="header-field">
            <span class="header-label">{{ $t('common.field.status') }}</span>
            <span :class="statusBadgeClass">{{ header.statusName }}</span>
          </div>
          <div class="header-field">
            <span class="header-label">{{ $t('view.stock.convert.colDate') }}</span>
            <span class="header-value">{{ formatDate(header.createDate) }}</span>
          </div>
          <div class="header-field">
            <span class="header-label">{{ $t('view.stock.convert.colCreateBy') }}</span>
            <span class="header-value">{{ header.createBy || '-' }}</span>
          </div>
          <div v-if="header.soNumber" class="header-field">
            <span class="header-label">{{ $t('view.stock.convert.soRefLabel') }}</span>
            <a href="#" class="header-link" @click.prevent="goToSaleOrder">{{ header.soNumber }}</a>
          </div>
        </div>
      </SectionCardGeneric>

      <SectionCardGeneric v-if="isCreateMode && (queryRefSoNumber || queryRefSoLineKey)" :title="$t('view.stock.convert.soRefLabel')" headerStyle="legend" icon="bi-link-45deg" accent="main" class="mt-3">
        <div class="header-info-grid">
          <div class="header-field">
            <span class="header-label">{{ $t('view.stock.convert.soRefLabel') }}</span>
            <span class="header-value">{{ queryRefSoNumber || '-' }}</span>
          </div>
        </div>
      </SectionCardGeneric>

      <SectionCardGeneric :title="$t('view.stock.convert.sourceSectionTitle')" headerStyle="legend" icon="bi-box-seam" accent="main" class="mt-3">
        <div v-if="isEditableSourceStep" class="source-actions-row">
          <ButtonGeneric variant="green" icon="bi-plus-circle" :label="$t('view.stock.convert.addSourceBtn')" @click="isShowSourcePicker = true" />
        </div>
        <sourceListSection :sources="sources" :removable="isEditableSourceStep" @remove="onRemoveSource" />
      </SectionCardGeneric>

      <!-- สร้างใบใหม่ — remark + ปุ่มสร้าง -->
      <SectionCardGeneric v-if="isCreateMode" :title="$t('common.field.remark')" headerStyle="legend" icon="bi-pencil-square" accent="main" class="mt-3">
        <TextareaGeneric v-model="remark" :rows="3" :placeholder="$t('view.stock.convert.remarkPlaceholder')" />
      </SectionCardGeneric>

      <div v-if="isCreateMode" class="action-bar">
        <ButtonGeneric variant="main" icon="bi-save" :label="$t('view.stock.convert.saveCreateBtn')" @click="onCreate" />
      </div>

      <!-- กำลังแปลง — target form + ปุ่มแปลงเสร็จ/ยกเลิก -->
      <SectionCardGeneric v-if="isConverting" :title="$t('view.stock.convert.targetSectionTitle')" headerStyle="legend" icon="bi-gem" accent="main" class="mt-3">
        <targetFormSection
          v-model="targetForm"
          v-model:convertCost="convertCost"
          v-model:locationCode="locationCode"
          :sourceCostTotal="sourceCostTotal"
        />
      </SectionCardGeneric>

      <div v-if="isConverting" class="action-bar">
        <ButtonGeneric variant="main" icon="bi-check2-circle" :label="$t('view.stock.convert.completeBtn')" @click="onComplete" />
        <ButtonGeneric variant="red" icon="bi-x-circle" :label="$t('view.stock.convert.cancelBtn')" class="ml-2" @click="isShowCancelModal = true" />
      </div>

      <!-- เสร็จแล้ว — ผลลัพธ์ read-only -->
      <SectionCardGeneric v-if="isCompleted" :title="$t('view.stock.convert.targetSectionTitle')" headerStyle="legend" icon="bi-gem" accent="main" class="mt-3">
        <div class="header-info-grid">
          <div class="header-field">
            <span class="header-label">{{ $t('view.stock.convert.resultStockNumberLabel') }}</span>
            <a href="#" class="header-link" @click.prevent="goToResultStock">{{ result.stockNumber || '-' }}</a>
          </div>
          <div class="header-field">
            <span class="header-label">{{ $t('view.stock.convert.resultSkuLabel') }}</span>
            <span class="header-value">{{ result.skuCode || '-' }}</span>
          </div>
          <div class="header-field">
            <span class="header-label">{{ $t('view.stock.convert.productNumber') }}</span>
            <span class="header-value">{{ result.productNumber || '-' }}</span>
          </div>
          <div class="header-field">
            <span class="header-label">{{ $t('view.stock.convert.convertCostLabel') }}</span>
            <span class="header-value">{{ formatDecimal(header.convertCost, 2) }}</span>
          </div>
        </div>
        <materialTable :items="result.materials || []" variant="compact" class="mt-3" />
      </SectionCardGeneric>

      <!-- ยกเลิก — read-only -->
      <SectionCardGeneric v-if="isCancelled" :title="$t('view.stock.convert.cancelBtn')" headerStyle="legend" icon="bi-x-circle" accent="main" class="mt-3">
        <div class="header-field">
          <span class="header-label">{{ $t('view.stock.convert.cancelReasonLabel') }}</span>
          <span class="header-value">{{ header.cancelReason || '-' }}</span>
        </div>
      </SectionCardGeneric>
    </template>

    <sourcePickerModal
      :isShow="isShowSourcePicker"
      :excludeStockNumbers="sourceStockNumbers"
      @closeModal="isShowSourcePicker = false"
      @confirm="onSourcesPicked"
    />

    <cancelReasonModal
      :isShow="isShowCancelModal"
      @closeModal="isShowCancelModal = false"
      @confirm="onCancel"
    />
  </div>
</template>

<script>
import { useStockConvertApiStore } from '@/stores/modules/api/stock/stock-convert-store.js'
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import { formatDate } from '@/services/utils/dayjs.js'
import { formatDecimal } from '@/services/utils/decimal.js'
import { warning, success } from '@/services/alert/sweetAlerts.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'

import PageHeaderGeneric from '@/components/generic/PageHeaderGeneric.vue'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import TextareaGeneric from '@/components/generic/TextareaGeneric.vue'
import materialTable from '@/views/stock/product/components/material-table.vue'

import sourceListSection from './components/source-list-section.vue'
import targetFormSection from './components/target-form-section.vue'
import sourcePickerModal from './components/source-picker-modal.vue'
import cancelReasonModal from './modal/cancel-reason-modal.vue'

const defaultTargetForm = () => ({
  productNumber: '',
  productNameEn: '',
  productNameTh: '',
  productType: null,
  productionType: null,
  productionTypeSize: null,
  size: '',
  mold: '',
  moldDesign: '',
  imagePath: null,
  defaultPrice: null,
  materials: []
})

export default {
  name: 'StockConvertDetailView',

  components: {
    PageHeaderGeneric,
    SectionCardGeneric,
    ButtonGeneric,
    TextareaGeneric,
    materialTable,
    sourceListSection,
    targetFormSection,
    sourcePickerModal,
    cancelReasonModal
  },

  setup() {
    const stockConvertStore = useStockConvertApiStore()
    const productStore = usrStockProductApiStore()
    return { stockConvertStore, productStore }
  },

  data() {
    return {
      header: {},
      sources: [],
      result: {},
      remark: '',
      targetForm: defaultTargetForm(),
      convertCost: 0,
      locationCode: null,
      notFound: false,
      isShowSourcePicker: false,
      isShowCancelModal: false
    }
  },

  computed: {
    isCreateMode() {
      return this.$route.name === 'stock-convert-create'
    },
    running() {
      return this.$route.params.running
    },
    queryRefSoNumber() {
      return this.$route.query.soNumber || null
    },
    queryRefSoLineKey() {
      return this.$route.query.soLineKey || null
    },
    isConverting() {
      return !this.isCreateMode && this.header.status === 0
    },
    isCompleted() {
      return !this.isCreateMode && this.header.status === 1
    },
    isCancelled() {
      return !this.isCreateMode && this.header.status === 9
    },
    isEditableSourceStep() {
      return this.isCreateMode
    },
    sourceStockNumbers() {
      return this.sources.map((s) => s.stockNumber).filter(Boolean)
    },
    // productCost = ต้นทุนจริงจาก StockConvert/Get (ItemDto) — ต้องใช้ตัวนี้ตรงกับที่ backend คิด "ต้นทุนชิ้นใหม่"
    // productPrice fallback ไว้เฉพาะตอนยังไม่ Create (sources มาจาก StockProduct/List picker ที่ยังไม่มี productCost)
    sourceCostTotal() {
      return this.sources.reduce((sum, item) => sum + (Number(item.productCost ?? item.productPrice ?? 0) || 0), 0)
    },
    pageTitle() {
      if (this.isCreateMode) return this.$t('view.stock.convert.createTitle')
      return `${this.$t('view.stock.convert.detailTitle')} · ${this.running}`
    },
    statusBadgeClass() {
      const map = {
        0: 'status-badge status-badge--warning',
        1: 'status-badge status-badge--success',
        9: 'status-badge status-badge--danger'
      }
      return map[this.header.status] || 'status-badge'
    }
  },

  created() {
    if (!this.isCreateMode) {
      this.loadData()
    }
  },

  watch: {
    // สร้างใบใหม่แล้ว router.replace ไป stock-convert-detail — ทั้งสอง route ใช้ component เดียวกัน
    // Vue Router reuse instance ไม่เรียก created() ซ้ำ ต้อง reload เองเมื่อ route เปลี่ยนไประหว่าง create/detail
    '$route'() {
      if (!this.isCreateMode) {
        this.loadData()
      }
    }
  },

  methods: {
    formatDate,
    formatDecimal,

    async loadData() {
      const res = await this.stockConvertStore.get(this.running)
      if (!res) {
        this.notFound = true
        return
      }
      this.notFound = false
      this.header = res
      this.result = res.result || {}
      const rawSources = res.sources || []
      this.sources = rawSources

      if (res.status === 0) {
        // StockConvert/Get.ItemDto ไม่มี materials/productType/mold ฯลฯ — ต้อง fetch StockProduct/Get
        // ต่อชิ้นเพื่อให้ตารางวัตถุดิบมีข้อมูล และ prefillTargetForm ใช้ค่าที่ถูกต้องได้แม้โหลดซ้ำ
        this.sources = await this.enrichWithStockProduct(rawSources)
        this.convertCost = res.convertCost || 0
        this.prefillTargetForm(this.sources[0])
      } else if (res.status === 1 && this.result.stockNumber) {
        // ชิ้นผลลัพธ์เป็นสินค้าจริงถาวรแล้ว — enrich ให้ตารางวัตถุดิบของผลลัพธ์มีข้อมูลด้วย
        const [enrichedResult] = await this.enrichWithStockProduct([this.result])
        this.result = enrichedResult
      }
    },

    // เติมข้อมูลเต็มจาก StockProduct/Get ให้แต่ละชิ้น (materials/productType/productionType/size/mold/imagePath ฯลฯ)
    // โดยให้ field เฉพาะของใบแปลง (productCost/qty/locationCode จาก StockConvert/Get) ทับค่าที่ทับซ้อนกันเสมอ
    async enrichWithStockProduct(items) {
      return Promise.all(
        items.map(async (item) => {
          if (!item.stockNumber) return item
          const full = await this.productStore.fetchDataGet({
            formValue: { stockNumber: item.stockNumber },
            skipError: true
          })
          return full ? { ...full, ...item } : item
        })
      )
    },

    prefillTargetForm(source) {
      if (!source) {
        this.targetForm = defaultTargetForm()
        return
      }
      this.targetForm = {
        productNumber: source.productNumber || '',
        productNameEn: source.productNameEn || '',
        productNameTh: source.productNameTh || '',
        productType: source.productType || null,
        productionType: source.productionType || null,
        productionTypeSize: source.productionTypeSize || null,
        size: source.size || '',
        mold: source.mold || '',
        moldDesign: source.moldDesign || source.mold || '',
        imagePath: source.imagePath || null,
        defaultPrice: source.productPrice || null,
        materials: (source.materials || []).map((m) => ({ ...m }))
      }
    },

    onSourcesPicked(items) {
      this.sources = [...this.sources, ...items]
      if (this.isConverting && this.sources.length === items.length) {
        this.prefillTargetForm(this.sources[0])
      }
    },

    onRemoveSource(index) {
      this.sources.splice(index, 1)
    },

    async onCreate() {
      if (!this.sources.length) {
        warning(this.$t('view.stock.convert.validation.selectSourceRequired'))
        return
      }

      const res = await this.stockConvertStore.create({
        soNumber: this.queryRefSoNumber,
        soLineKey: this.queryRefSoLineKey,
        sourceStockNumbers: this.sourceStockNumbers,
        remark: this.remark
      })

      if (res && res.running) {
        success(this.$t('view.stock.convert.success.created', { running: res.running }))
        this.$router.replace({ name: 'stock-convert-detail', params: { running: res.running } })
      }
    },

    onComplete() {
      if (!this.targetForm.productNumber?.trim()) {
        warning(this.$t('view.stock.convert.validation.productNumberRequired'))
        return
      }

      confirmThenSubmit(
        this.$t('view.stock.convert.confirm.completeMessage'),
        this.$t('view.stock.convert.confirm.completeTitle'),
        async () => {
          const res = await this.stockConvertStore.complete({
            running: this.running,
            locationCode: this.locationCode,
            convertCost: this.convertCost,
            result: { ...this.targetForm }
          })

          if (res && res.resultStockNumber) {
            success(this.$t('view.stock.convert.success.completed', { resultStockNumber: res.resultStockNumber }))
            await this.loadData()
          }
        }
      )
    },

    async onCancel(reason) {
      const res = await this.stockConvertStore.cancel({ running: this.running, cancelReason: reason })
      if (res) {
        success(this.$t('view.stock.convert.success.cancelled'))
        this.isShowCancelModal = false
        await this.loadData()
      }
    },

    goToSaleOrder() {
      if (!this.header.soNumber) return
      this.$router.push({ name: 'sale-order', query: { soNumber: this.header.soNumber } })
    },

    goToResultStock() {
      if (!this.result.stockNumber) return
      this.$router.push({ name: 'stock-product-detail', params: { stockNumber: this.result.stockNumber } })
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: var(--sp-lg);
}

.not-found-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-md);
  padding: var(--sp-2xl) 0;
  text-align: center;
}

.header-info-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--sp-sm) var(--sp-lg);

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.header-field {
  display: flex;
  flex-direction: column;
  gap: var(--sp-xs);
}

.header-label {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}

.header-value {
  font-weight: 600;
}

.header-link {
  font-weight: 700;
  color: var(--base-font-color);
  text-decoration: underline;
}

.status-badge {
  display: inline-flex;
  align-self: flex-start;
  padding: var(--sp-xs) var(--sp-sm);
  border-radius: var(--radius-sm);
  font-size: var(--fs-sm);
  font-weight: 600;
  color: #fff;
  background: #6c757d;

  &--warning {
    background: var(--base-warning);
    color: #212529;
  }

  &--success {
    background: var(--base-green);
  }

  &--danger {
    background: var(--base-red);
  }
}

.action-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--sp-sm);
  margin-top: var(--sp-lg);
}

.source-actions-row {
  display: flex;
  justify-content: flex-end;
  margin-bottom: var(--sp-md);
}
</style>
