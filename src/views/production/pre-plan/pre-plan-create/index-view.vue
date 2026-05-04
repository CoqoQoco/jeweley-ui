<template>
  <div class="app-container">
    <div class="d-flex align-items-center mb-3">
      <button
        class="btn btn-sm btn-outline-main me-2"
        @click="$router.push({ name: 'pre-plan-list' })"
      >
        <i class="bi bi-arrow-left"></i> กลับ
      </button>
      <h5 class="mb-0">{{ isEditMode ? 'แก้ไขใบสั่งผลิต' : 'สร้างใบสั่งผลิต' }}</h5>
    </div>

    <headerSection v-model:form="form" />

    <moldSection
      v-model:moldCode="form.moldCode"
      v-model:productType="form.productType"
      v-model:moldDetail="form.moldDetail"
      @mold-loaded="onMoldLoaded"
      class="mt-3"
    />

    <goldSection v-model:goldType="form.goldType" class="mt-3" />

    <materialTable v-model:materials="materials" class="mt-3" />

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
import { confirmSubmit, success, warning } from '@/services/alert/sweetAlerts.js'
import { formatISOString } from '@/services/utils/dayjs.js'

const headerSection = defineAsyncComponent(() => import('./components/header-section.vue'))
const moldSection = defineAsyncComponent(() => import('./components/mold-section.vue'))
const goldSection = defineAsyncComponent(() => import('./components/gold-section.vue'))
const materialTable = defineAsyncComponent(() => import('./components/material-table.vue'))
const footerActions = defineAsyncComponent(() => import('./components/footer-actions.vue'))

const defaultForm = () => ({
  orderNo: '',
  jobLocation: 'Domestic',
  jobType: 'NewDesign',
  productionRound: 1,
  moldCode: '',
  productType: '',
  goldType: '18K',
  moldDetail: '',
  remark: '',
  orderDate: new Date(),
  deliveryDate: new Date(new Date().setDate(new Date().getDate() + 7)),
  status: 'Draft',
})

export default {
  name: 'PrePlanCreate',
  components: { headerSection, moldSection, goldSection, materialTable, footerActions },

  setup() {
    const store = usePrePlanStore()
    return { store }
  },

  data() {
    return {
      form: defaultForm(),
      materials: [],
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
      if (data) {
        this.form = {
          orderNo: data.orderNo,
          jobLocation: data.jobLocation,
          jobType: data.jobType,
          productionRound: data.productionRound,
          moldCode: data.moldCode,
          productType: data.productType || '',
          goldType: data.goldType,
          moldDetail: data.moldDetail || '',
          remark: data.remark || '',
          orderDate: data.orderDate ? new Date(data.orderDate) : new Date(),
          deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : new Date(),
          status: data.status,
        }
        this.materials = (data.materials || []).map((m) => ({
          ...m,
          _id: m.id || Date.now() + Math.random(),
        }))
      }
    },

    onMoldLoaded({ gems }) {
      if (gems && gems.length && !this.materials.length) {
        this.materials = gems.map((g, i) => ({
          _id: Date.now() + i,
          materialType: 'Gem',
          masterId: g.gemId || null,
          materialCode: g.gemCode || '',
          shapeCode: g.gemShapeCode || '',
          size: g.size || '',
          qty: g.qty || 0,
          color: '',
          weight: null,
          weightUnit: '',
          isLocked: false,
          remark: '',
        }))
      }
    },

    buildPayload() {
      return {
        orderNo: this.form.orderNo,
        jobLocation: this.form.jobLocation,
        jobType: this.form.jobType,
        productionRound: this.form.productionRound,
        moldCode: this.form.moldCode,
        productType: this.form.productType,
        goldType: this.form.goldType,
        moldDetail: this.form.moldDetail,
        remark: this.form.remark,
        orderDate: formatISOString(this.form.orderDate),
        deliveryDate: formatISOString(this.form.deliveryDate),
        materials: this.materials.map((m) => ({
          materialType: m.materialType,
          masterId: m.masterId || null,
          materialCode: m.materialCode || '',
          shapeCode: m.shapeCode || '',
          size: m.size || '',
          qty: m.qty || 0,
          color: m.color || '',
          weight: m.weight || null,
          weightUnit: m.weightUnit || '',
          isLocked: m.isLocked || false,
          remark: m.remark || '',
        })),
      }
    },

    validateForm() {
      if (!this.form.orderNo) {
        warning('กรุณากรอกเลขที่ใบสั่ง', 'ข้อมูลไม่ครบ')
        return false
      }
      if (!this.form.moldCode) {
        warning('กรุณาเลือกแม่พิมพ์', 'ข้อมูลไม่ครบ')
        return false
      }
      if (!this.form.goldType) {
        warning('กรุณาเลือกประเภททอง', 'ข้อมูลไม่ครบ')
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
      return true
    },

    async onSaveDraft() {
      if (!this.validateForm()) return
      const payload = this.buildPayload()
      if (this.isEditMode) {
        await this.store.updatePrePlan(this.prePlanId, payload)
      } else {
        await this.store.createPrePlan(payload)
      }
      success('บันทึกร่างเรียบร้อยแล้ว')
      this.$router.push({ name: 'pre-plan-list' })
    },

    onSubmit() {
      if (!this.validateForm()) return
      confirmSubmit('ยืนยันส่งใบสั่งผลิตเพื่อรออนุมัติ?', 'ยืนยันการส่ง', async () => {
        const payload = this.buildPayload()
        let id = this.prePlanId
        if (this.isEditMode) {
          await this.store.updatePrePlan(id, payload)
        } else {
          const res = await this.store.createPrePlan(payload)
          id = res?.id || res
        }
        await this.store.submitPrePlan(id)
        success('ส่งใบสั่งผลิตเรียบร้อยแล้ว รอหัวหน้าอนุมัติ')
        this.$router.push({ name: 'pre-plan-list' })
      })
    },
  },
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';
</style>
