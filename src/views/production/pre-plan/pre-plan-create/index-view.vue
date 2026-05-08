<template>
  <div class="app-container">
    <div class="page-header-bar">
      <button class="btn-back" @click="$router.push({ name: 'pre-plan-list' })" title="กลับ" type="button">
        <i class="bi bi-arrow-left"></i>
      </button>
      <h2 class="page-title">{{ isEditMode ? 'แก้ไขใบสั่งผลิต' : 'สร้างใบสั่งผลิต' }}</h2>
    </div>

    <headerSection v-model:form="form" />

    <itemsSection v-model:items="items" class="mt-3" />

    <footerActions
      :isEditMode="isEditMode"
      :status="form.status"
      @save-draft="onSaveDraft"
      @submit="onSubmit"
      class="mt-3"
    />
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import { usePrePlanStore } from '@/stores/modules/api/production/pre-plan-store.js'
import { confirmSubmit, warning, info } from '@/services/alert/sweetAlerts.js'
import { formatISOString } from '@/services/utils/dayjs.js'

const headerSection = defineAsyncComponent(() => import('./components/header-section.vue'))
const itemsSection = defineAsyncComponent(() => import('./components/items-section.vue'))
const footerActions = defineAsyncComponent(() => import('./components/footer-actions.vue'))

let localIdCounter = 100

function createEmptyItem() {
  return {
    _localId: localIdCounter++,
    moldCode: null,
    moldDetail: null,
    moldImageCad: null,
    moldImageFinish: null,
    productImageFile: null,
    productImagePreview: null,
    customerNumber: null,
    customerType: null,
    productName: null,
    productType: null,
    productQty: null,
    productQtyUnit: null,
    productDetail: null,
    goldType: '18K',
    goldSize: null,
    materials: [],
  }
}

const defaultForm = () => ({
  jobLocation: 'Domestic',
  jobType: 'NewDesign',
  productionRound: 1,
  goldType: '18K',
  remark: '',
  orderDate: new Date(),
  deliveryDate: new Date(new Date().setDate(new Date().getDate() + 7)),
  status: 'Draft',
})

export default {
  name: 'PrePlanCreate',
  components: { headerSection, itemsSection, footerActions },

  setup() {
    const store = usePrePlanStore()
    return { store }
  },

  data() {
    return {
      form: defaultForm(),
      items: [createEmptyItem()],
    }
  },

  computed: {
    isEditMode() {
      return !!this.$route.params.id
    },
    prePlanId() {
      return this.$route.params.id ? parseInt(this.$route.params.id) : null
    },
  },

  async created() {
    if (this.isEditMode) {
      await this.loadPrePlan()
    }
  },

  methods: {
    async loadPrePlan() {
      const data = await this.store.getPrePlan(this.prePlanId)
      if (!data) return

      this.form = {
        jobLocation: data.jobLocation || 'Domestic',
        jobType: data.jobType || 'NewDesign',
        productionRound: data.productionRound || 1,
        goldType: data.goldType || '18K',
        remark: data.remark || '',
        orderDate: data.orderDate ? new Date(data.orderDate) : new Date(),
        deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : new Date(),
        status: data.status || 'Draft',
      }

      if (data.items && data.items.length) {
        this.items = data.items.map((it) => ({
          _localId: localIdCounter++,
          moldCode: it.moldCode || null,
          moldDetail: it.moldDetail || null,
          moldImageCad: null,
          moldImageFinish: null,
          productImageFile: null,
          productImagePreview: null,
          customerNumber: it.customerNumber || null,
          customerType: it.customerType || null,
          productName: it.productName || null,
          productType: it.productType || null,
          productQty: it.productQty || null,
          productQtyUnit: it.productQtyUnit || null,
          productDetail: it.productDetail || null,
          goldType: it.goldType || '18K',
          goldSize: it.goldSize || null,
          materials: (it.materials || []).map((m) => ({
            ...m,
            _id: m.id || Date.now() + Math.random(),
          })),
        }))
      } else {
        this.items = [
          {
            _localId: localIdCounter++,
            moldCode: data.moldCode || null,
            moldDetail: data.moldDetail || null,
            moldImageCad: null,
            moldImageFinish: null,
            productImageFile: null,
            productImagePreview: null,
            customerNumber: null,
            customerType: null,
            productName: null,
            productType: data.productType || null,
            productQty: null,
            productQtyUnit: null,
            productDetail: null,
            goldType: data.goldType || '18K',
            goldSize: null,
            materials: (data.materials || []).map((m) => ({
              ...m,
              _id: m.id || Date.now() + Math.random(),
            })),
          },
        ]
      }
    },

    validateForm() {
      if (!this.form.productionRound) {
        warning('กรุณาระบุผลิตครั้งที่', 'ข้อมูลไม่ครบ')
        return false
      }
      if (!this.form.orderDate) {
        warning('กรุณาเลือกวันที่ออกใบสั่ง', 'ข้อมูลไม่ครบ')
        return false
      }
      if (!this.form.deliveryDate) {
        warning('กรุณาเลือกวันที่ส่งงาน', 'ข้อมูลไม่ครบ')
        return false
      }
      if (!this.items.length) {
        warning('ต้องมีอย่างน้อย 1 รายการ', 'ข้อมูลไม่ครบ')
        return false
      }
      for (let i = 0; i < this.items.length; i++) {
        const it = this.items[i]
        const label = `รายการที่ ${i + 1}`
        if (!it.moldCode) {
          warning(`${label}: กรุณาเลือกแม่พิมพ์`, 'ข้อมูลไม่ครบ')
          return false
        }
        if (!it.goldType) {
          warning(`${label}: กรุณาเลือกประเภททอง`, 'ข้อมูลไม่ครบ')
          return false
        }
        if (!it.materials || it.materials.length < 1) {
          warning(`${label}: ต้องมีวัสดุอย่างน้อย 1 รายการ`, 'ข้อมูลไม่ครบ')
          return false
        }
      }
      return true
    },

    buildPayload() {
      return {
        ...this.form,
        orderDate: formatISOString(this.form.orderDate),
        deliveryDate: formatISOString(this.form.deliveryDate),
        items: this.items.map((it) => ({
          moldCode: it.moldCode,
          customerNumber: it.customerNumber,
          customerType: it.customerType,
          productName: it.productName,
          productType: it.productType,
          productQty: it.productQty,
          productQtyUnit: it.productQtyUnit,
          productDetail: it.productDetail,
          goldType: it.goldType,
          goldSize: it.goldSize,
          productImagePath: null,
          materials: it.materials,
        })),
      }
    },

    async onSaveDraft() {
      if (!this.validateForm()) return
      const payload = this.buildPayload()
      console.warn('[UI-Only] Save Draft payload:', payload)
      info('บันทึก UI-only — API ยังไม่ wire', 'Preview')
    },

    onSubmit() {
      if (!this.validateForm()) return
      confirmSubmit('ยืนยันส่งใบสั่งผลิตเพื่อรออนุมัติ?', 'ยืนยันการส่ง', () => {
        const payload = this.buildPayload()
        console.warn('[UI-Only] Submit payload:', payload)
        info('ส่ง UI-only — API ยังไม่ wire', 'Preview')
      })
    },
  },
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
  transition: all 0.2s;
  padding: 0;

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
</style>
