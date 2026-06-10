<template>
  <div class="filter-container-search">
    <pageTitle
      :title="`รายละเอียดตั้งแม่พิมพ์`"
      description=""
      :isShowBtnClose="false"
      :isShowRightSlot="true"
    >
      <template #rightSlot>
        <div v-if="!isMelted" class="d-flex">
          <div :class="planStatus === 60 ? 'box-status-success' : 'box-status-show'">
            {{ statusName }}
          </div>
          <div v-if="planStatus !== 100" class="box-status-process ml-2" @click="$emit('melt')">
            <span><i class="bi bi-x-lg mr-2"></i></span>
            <span>หลอมแม่พิมพ์</span>
          </div>
        </div>
        <div v-if="isMelted" class="d-flex">
          <div class="box-status-process">
            {{ statusName }}
          </div>
        </div>
      </template>
    </pageTitle>

    <div class="form-col-sm-container">
      <div class="d-flex flex-column">
        <span class="title-text">รหัสตั้งแม่พิมพ์</span>
        <div v-if="!isEditingMoldCode" class="d-flex align-items-center">
          <span class="desc-text">{{ moldCode }}</span>
          <button
            v-if="!isMelted"
            class="btn btn-sm btn-outline-main ml-2"
            type="button"
            title="แก้ไขรหัส"
            @click="startEditMoldCode"
          >
            <i class="bi bi-pencil"></i>
          </button>
        </div>
        <div v-else class="d-flex align-items-center">
          <input
            v-model="editMoldCodeValue"
            class="form-control form-control-sm"
            style="max-width: 180px"
            type="text"
          />
          <button class="btn btn-sm btn-main ml-2" type="button" @click="saveMoldCode">
            บันทึก
          </button>
          <button class="btn btn-sm btn-outline-main ml-2" type="button" @click="cancelEditMoldCode">
            ยกเลิก
          </button>
        </div>
      </div>
      <div class="d-flex flex-column">
        <span class="title-text">ประเภท</span>
        <span class="desc-text">{{ catagoryName }}</span>
      </div>
      <div class="d-flex flex-column">
        <span class="title-text">วันที่สร้าง</span>
        <span class="desc-text">{{ formatDate(createDate) }}</span>
      </div>
      <div class="d-flex flex-column">
        <span class="title-text">วันที่แก้ไขล่าสุด</span>
        <span class="desc-text">{{ formatDate(updateDate) }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import { useMoldPlanStore } from '@/stores/modules/api/mold/mold-plan-store.js'
import { success, warning, confirmSubmit } from '@/services/alert/sweetAlerts.js'
import { formatDate } from '@/services/utils/dayjs.js'

const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))

export default {
  name: 'MoldInfoHeader',

  components: { pageTitle },

  props: {
    planId: {
      type: Number,
      required: true
    },
    planStatus: {
      type: Number,
      default: 0
    },
    statusName: {
      type: String,
      default: ''
    },
    moldCode: {
      type: String,
      default: ''
    },
    catagoryName: {
      type: String,
      default: ''
    },
    createDate: {
      type: String,
      default: ''
    },
    updateDate: {
      type: String,
      default: ''
    }
  },

  emits: ['melt', 'updated'],

  setup() {
    return {
      store: useMoldPlanStore()
    }
  },

  data() {
    return {
      isEditingMoldCode: false,
      editMoldCodeValue: ''
    }
  },

  computed: {
    isMelted() {
      return this.planStatus === 500
    }
  },

  methods: {
    formatDate(date) {
      return formatDate(date)
    },

    startEditMoldCode() {
      this.editMoldCodeValue = this.moldCode
      this.isEditingMoldCode = true
    },

    cancelEditMoldCode() {
      this.isEditingMoldCode = false
      this.editMoldCodeValue = ''
    },

    saveMoldCode() {
      if (!this.editMoldCodeValue || !this.editMoldCodeValue.trim()) {
        warning('กรุณากรอกรหัสตั้งแม่พิมพ์')
        return
      }

      confirmSubmit('ยืนยันแก้ไขรหัสตั้งแม่พิมพ์?', 'แก้ไขรหัส', async () => {
        const res = await this.store.updateMoldCode({
          id: this.planId,
          moldCode: this.editMoldCodeValue.trim()
        })
        if (res !== undefined) {
          this.isEditingMoldCode = false
          this.editMoldCodeValue = ''
          success('แก้ไขรหัสสำเร็จ')
          this.$emit('updated')
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

input.form-control {
  padding: 6px 10px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.9rem;

  &:focus {
    border-color: var(--base-font-color);
    box-shadow: none;
    outline: none;
  }
}
</style>
