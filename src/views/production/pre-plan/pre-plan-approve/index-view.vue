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
      <h2 class="page-title">{{ isApprovalMode ? 'อนุมัติใบสั่งผลิต' : 'ดูใบสั่งผลิต' }}</h2>
    </div>

    <infoReadonly :form="form" :items="items" />

    <div class="section-card mt-3">
      <h6>เอกสารอนุมัติ (เซ็นแล้ว) <span v-if="isApprovalMode" class="text-danger">*</span></h6>

      <div v-if="form.approvedDocumentPath">
        <div class="approved-doc-preview">
          <imagePreview
            :imageName="form.approvedDocumentPath"
            :width="200"
            :height="200"
            alt="เอกสารอนุมัติ"
          />
          <div class="mt-2">
            <button
              class="btn btn-sm btn-green"
              type="button"
              @click="onOpenApprovedDoc"
            >
              <i class="bi bi-arrows-fullscreen"></i> เปิดดูเต็มจอ
            </button>
          </div>
        </div>
      </div>

      <div v-else-if="isApprovalMode">
        <p class="text-muted mb-2" style="font-size: 0.9rem;">
          <i class="bi bi-exclamation-triangle text-warning"></i>
          กรุณา upload รูปเอกสารใบสั่งผลิตที่เซ็นอนุมัติแล้ว ก่อนกดปุ่มอนุมัติ
        </p>
        <UploadImage
          :modelValue="approvedDocumentFile"
          :previewUrl="approvedDocumentPreview"
          title="เอกสารอนุมัติ"
          accept="image/jpeg,image/png"
          :maxSizeMB="10"
          :previewSize="150"
          :compact="true"
          :showClear="true"
          @update:modelValue="approvedDocumentFile = $event"
          @update:previewUrl="approvedDocumentPreview = $event"
          @clear="approvedDocumentFile = null; approvedDocumentPreview = null"
        />
      </div>

      <div v-else>
        <p class="text-muted mb-0" style="font-size: 0.9rem;">— ไม่มีเอกสารอนุมัติ</p>
      </div>
    </div>

    <div v-if="isApprovalMode" class="action-bar mt-3">
      <button class="btn btn-sm btn-main" @click="onApprove">
        <i class="bi bi-check-lg"></i> อนุมัติ
      </button>
      <button class="btn btn-sm btn-red ml-2" @click="onOpenReject">
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
import { defineAsyncComponent } from 'vue'

import { usePrePlanStore } from '@/stores/modules/api/production/pre-plan-store.js'
import { useMasterPrePlanStore } from '@/stores/modules/api/master/master-pre-plan-store.js'
import { confirmSubmit, success, warning } from '@/services/alert/sweetAlerts.js'
import { getAzureBlobUrl } from '@/config/azure-storage-config.js'

import UploadImage from '@/components/prime-vue/UploadImage.vue'
import infoReadonly from './components/info-readonly.vue'
import rejectReasonModal from './modal/reject-reason-modal.vue'

const imagePreview = defineAsyncComponent(() => import('@/components/prime-vue/ImagePreview.vue'))

export default {
  name: 'PrePlanApprove',
  components: { infoReadonly, rejectReasonModal, UploadImage, imagePreview },
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
      approvedDocumentFile: null,
      approvedDocumentPreview: null,
    }
  },
  computed: {
    id() {
      return this.$route.params.id
    },
    isApprovalMode() {
      return this.$route.name === 'pre-plan-approve'
    },
  },
  async created() {
    await this.masterStore.fetchAll()
    await this.loadPrePlan()
  },
  methods: {
    async loadPrePlan() {
      const data = await this.store.getPrePlan(this.id)
      if (!data) return
      this.form = data
      this.items = data.items || []
    },
    async onApprove() {
      if (!this.approvedDocumentFile && !this.form.approvedDocumentPath) {
        warning('กรุณา upload เอกสารใบสั่งผลิตที่เซ็นแล้ว ก่อนกดปุ่มอนุมัติ', 'เอกสารไม่ครบ')
        return
      }
      confirmSubmit('ยืนยันอนุมัติใบสั่งผลิตนี้?', 'ยืนยันการอนุมัติ', async () => {
        let path = this.form.approvedDocumentPath
        if (this.approvedDocumentFile) {
          path = await this.store.uploadApproveDocument(this.approvedDocumentFile)
          if (!path) return
        }
        await this.store.approvePrePlan(this.id, { id: Number(this.id), approvedDocumentPath: path })
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
      await this.store.rejectPrePlan(this.id, { id: Number(this.id), rejectReason: reason.trim() })
      this.showRejectModal = false
      success('ปฏิเสธสำเร็จ')
      this.$router.push({ name: 'pre-plan-list' })
    },
    onOpenApprovedDoc() {
      if (!this.form.approvedDocumentPath) return
      window.open(getAzureBlobUrl(this.form.approvedDocumentPath), '_blank')
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

.section-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: rgba(0, 0, 0, 0.06) 0 2px 8px;
  padding: 20px;
  background: #ffffff !important;

  h6 {
    color: var(--base-font-color);
    font-weight: 600;
    padding-bottom: 8px;
    border-bottom: 1px solid #f0f0f0;
    margin-bottom: 16px;
    background: transparent !important;
  }
}

.approved-doc-preview {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
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
