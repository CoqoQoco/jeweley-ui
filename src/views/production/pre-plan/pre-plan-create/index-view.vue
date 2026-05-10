<template>
  <div class="app-container">
    <div class="page-header-bar">
      <button class="btn-back" @click="$router.push({ name: 'pre-plan-list' })" title="กลับ" type="button">
        <i class="bi bi-arrow-left"></i>
      </button>
      <h2 class="page-title">{{ isEditMode ? 'แก้ไขใบสั่งผลิต' : 'สร้างใบสั่งผลิต' }}</h2>
    </div>

    <headerSection
      v-model:form="form"
      :jobTypes="masterStore.jobTypes"
      :jobLocations="masterStore.jobLocations"
      :goldTypes="masterStore.goldSizes"
    />

    <itemsSection
      v-model:items="items"
      :masterGold="masterStore.golds"
      :masterGoldSize="masterStore.goldSizes"
      :masterGem="masterStore.gems"
      :masterGemShape="masterStore.gemShapes"
      :masterProduct="masterStore.productTypes"
      class="mt-3"
    />

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
import { useMasterPrePlanStore } from '@/stores/modules/api/master/master-pre-plan-store.js'
import { confirmSubmit, warning, success } from '@/services/alert/sweetAlerts.js'
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
    productType: null,
    productQty: null,
    productQtyUnit: null,
    productDetail: null,
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
    const masterStore = useMasterPrePlanStore()
    return { store, masterStore }
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
    await this.masterStore.fetchAll()
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
          productType: it.productType || null,
          productQty: it.productQty || null,
          productQtyUnit: it.productQtyUnit || null,
          productDetail: it.productDetail || null,
          materials: (it.materials || []).map((m) => ({
            ...m,
            id: m.id || Date.now() + Math.random(),
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
            productType: data.productType || null,
            productQty: null,
            productQtyUnit: null,
            productDetail: null,
            materials: (data.materials || []).map((m) => ({
              ...m,
              id: m.id || Date.now() + Math.random(),
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
        if (!it.materials || it.materials.length < 1) {
          warning(`${label}: ต้องมีวัสดุอย่างน้อย 1 รายการ`, 'ข้อมูลไม่ครบ')
          return false
        }
      }
      return true
    },

    buildPayload() {
      return {
        productionRound: this.form.productionRound,
        jobType: this.form.jobType,
        jobLocation: this.form.jobLocation,
        goldType: this.form.goldType,
        remark: this.form.remark,
        orderDate: formatISOString(this.form.orderDate),
        deliveryDate: formatISOString(this.form.deliveryDate),
        items: this.items.map((it) => ({
          moldCode: it.moldCode,
          moldDetail: it.moldDetail,
          productType: it.productType,
          productQty: it.productQty,
          productQtyUnit: it.productQtyUnit,
          productDetail: it.productDetail,
          productImagePath: it.productImagePath || null,
          materials: (it.materials || []).map((m) => ({
            gold: m.gold,
            goldSize: m.goldSize,
            goldQty: m.goldQty,
            gem: m.gem,
            gemShape: m.gemShape,
            gemQty: m.gemQty,
            gemUnit: m.gemUnit,
            gemSize: m.gemSize,
            gemWeight: m.gemWeight,
            gemWeightUnit: m.gemWeightUnit,
            diamondQty: m.diamondQty,
            diamondUnit: m.diamondUnit,
            diamondSize: m.diamondSize,
            diamondWeight: m.diamondWeight,
            diamondWeightUnit: m.diamondWeightUnit,
            diamondQuality: m.diamondQuality,
          })),
        })),
      }
    },

    async onSaveDraft() {
      if (!this.validateForm()) return
      const payload = this.buildPayload()
      let result
      if (this.isEditMode) {
        result = await this.store.updatePrePlan(this.prePlanId, payload)
      } else {
        result = await this.store.createPrePlan(payload)
      }
      if (result) {
        success('บันทึกร่างใบสั่งผลิตสำเร็จ')
        this.$router.push({ name: 'pre-plan-list' })
      }
    },

    onSubmit() {
      if (!this.validateForm()) return
      confirmSubmit('ยืนยันส่งใบสั่งผลิตเพื่อรออนุมัติ?', 'ยืนยันการส่ง', async () => {
        const payload = this.buildPayload()
        let savedId = this.prePlanId
        if (this.isEditMode) {
          await this.store.updatePrePlan(savedId, payload)
        } else {
          const result = await this.store.createPrePlan(payload)
          if (result) {
            savedId = result.id || result
          }
        }
        if (savedId) {
          await this.store.submitPrePlan(savedId)
        }
        success('ส่งใบสั่งผลิตสำเร็จ')
        this.$router.push({ name: 'pre-plan-list' })
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
