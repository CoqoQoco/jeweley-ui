<template>
  <div class="app-container">
    <div class="page-header-bar">
      <button
        class="btn-back"
        @click="$router.push({ name: 'pre-plan-list' })"
        title="กลับ"
        type="button"
      >
        <i class="bi bi-arrow-left"></i>
      </button>
      <h2 class="page-title">อนุมัติใบสั่งผลิต</h2>
    </div>

    <infoReadonly :form="form" :items="items" />

    <div class="action-bar mt-3">
      <button class="btn btn-sm btn-main" @click="onApprove">
        <i class="bi bi-check-lg"></i> อนุมัติ
      </button>
      <button class="btn btn-sm btn-red ms-2" @click="onOpenReject">
        <i class="bi bi-x-lg"></i> ปฏิเสธ
      </button>
    </div>

    <rejectReasonModal
      :isShow="showRejectModal"
      @closeModal="showRejectModal = false"
      @submit="onReject"
    />
  </div>
</template>

<script>
import { usePrePlanStore } from '@/stores/modules/api/production/pre-plan-store.js'
import { useMasterPrePlanStore } from '@/stores/modules/api/master/master-pre-plan-store.js'
import { confirmSubmit, success, warning } from '@/services/alert/sweetAlerts.js'

import infoReadonly from './components/info-readonly.vue'
import rejectReasonModal from './modal/reject-reason-modal.vue'

export default {
  name: 'PrePlanApprove',
  components: { infoReadonly, rejectReasonModal },
  setup() {
    const store = usePrePlanStore()
    const masterStore = useMasterPrePlanStore()
    return { store, masterStore }
  },
  data() {
    return {
      form: {},
      items: [],
      showRejectModal: false,
    }
  },
  async created() {
    await this.masterStore.fetchAll()
    await this.loadPrePlan()
  },
  methods: {
    async loadPrePlan() {
      const id = this.$route.params.id
      const data = await this.store.getPrePlan(id)
      if (!data) return
      if (data.status !== 'Submitted') {
        warning('ใบสั่งผลิตนี้ไม่อยู่ในสถานะรออนุมัติ')
        this.$router.push({ name: 'pre-plan-list' })
        return
      }
      this.form = data
      this.items = data.items || []
    },
    onApprove() {
      const id = this.$route.params.id
      confirmSubmit('ยืนยันอนุมัติใบสั่งผลิตนี้?', 'ยืนยันการอนุมัติ', async () => {
        await this.store.approvePrePlan(id, { id: Number(id) })
        success('อนุมัติสำเร็จ')
        this.$router.push({ name: 'pre-plan-list' })
      })
    },
    onOpenReject() {
      this.showRejectModal = true
    },
    async onReject(reason) {
      if (!reason || !reason.trim()) {
        warning('กรุณาระบุเหตุผลการปฏิเสธ', 'ข้อมูลไม่ครบ')
        return
      }
      const id = this.$route.params.id
      await this.store.rejectPrePlan(id, { id: Number(id), rejectReason: reason.trim() })
      this.showRejectModal = false
      success('ปฏิเสธสำเร็จ')
      this.$router.push({ name: 'pre-plan-list' })
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
  padding: 0;
  transition: all 0.2s;

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

.action-bar {
  display: flex;
  justify-content: flex-end;
  padding: 12px 16px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: rgba(0, 0, 0, 0.06) 0 2px 8px;
}
</style>
