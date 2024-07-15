<template>
  <div>
    <loading :isLoading="isLoading"></loading>
    <modal :showModal="isShow" @closeModal="closeModal">
      <template v-slot:content>
        <form @submit.prevent="onSubmit">
          <div class="mt-3">
            <stepperStatus :events="events" :eventsIdActive="2"></stepperStatus>
          </div>
          <div class="filter-container-highlight mt-2">
            <div class="form-col-sm-container">
              <div class="d-flex flex-column">
                <span class="title-text-white">รหัสตั้งเเม่พิมพ์</span>
                <span class="desc-text-white">{{ value?.moldCode }}</span>
              </div>
              <div class="d-flex flex-column">
                <span class="title-text-white">เเก้ไขล่าสุด</span>
                <span class="desc-text-white">{{ formatDate(value?.updateDate) }}</span>
              </div>
              <div></div>
              <div></div>
            </div>
          </div>
          <div class="form-col-container mt-2">
            <div>
              <span>
                <span class="title-text">ปริ้นเรซิ่นโดย</span>
                <span class="txt-required"> *</span>
              </span>
              <input class="form-control" v-model="form.resinBy" type="text" required />
            </div>
            <div>
              <div>
                <span class="title-text">น้ำหนักรับ</span>
                <span class="txt-required"> *</span>
              </div>
              <input
                type="number"
                step="any"
                class="form-control"
                required
                v-model="form.qtyReceive"
              />
            </div>
            <div>
              <div>
                <span class="title-text">น้ำหนักส่ง</span>
                <span class="txt-required"> *</span>
              </div>
              <input
                type="number"
                step="any"
                class="form-control"
                required
                v-model="form.qtySend"
              />
            </div>
          </div>
          <div class="form-col-container">
            <uploadImages
              title="รูปปริ้นเรซิ่น (1 รูป)"
              @onUpdateFile="updateFile"
              @btnClearRef="setBtnClearRef"
            ></uploadImages>
          </div>
          <div class="form-col-container">
            <div>
              <span class="title-text">รายละเอียด</span>
              <textarea class="form-control" v-model="form.remark" style="height: 50px" />
            </div>
          </div>
          <div class="d-flex justify-content-end mt-1">
            <button class="btn btn-sm btn-main" type="submit">
              <span class="mr-2">
                <i class="bi bi-gem"></i>
              </span>
              <span>ปริ้นเรซิ่น</span>
            </button>
          </div>
        </form>
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))
const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))
const stepperStatus = defineAsyncComponent(() => import('@/components/prime-vue/StepperStatus.vue'))
const uploadImages = defineAsyncComponent(() => import('@/components/prime-vue/UploadImages.vue'))

import swAlert from '@/services/alert/sweetAlerts.js'
import api from '@/axios/axios-config.js'
import { formatDate, formatDateTime } from '@/services/utils/dayjs.js'

import { eventStatus } from '@/views/mold/create-design/interface/data.js'

const interfaceForm = {
  images: [],
  resinBy: null,
  remark: null,
  qtyReceive: null,
  qtySend: null
}

export default {
  components: {
    modal,
    loading,
    stepperStatus,
    uploadImages
  },
  props: {
    isShow: {
      type: Boolean,
      default: false,
      required: true
    },
    modelValue: {
      type: Object,
      required: true,
      default: () => {}
    }
  },
  computed: {
    value() {
      return this.modelValue
    }
  },
  data() {
    return {
      isLoading: false,
      events: [...eventStatus],
      form: { ...interfaceForm },
      btnClearImg: null,
      countClearFiles: 0
    }
  },
  methods: {
    // -------- event -------- //
    setBtnClearRef(ref) {
      this.btnClearImg = ref
      console.log('setBtnClearRef', this.btnClearImg)
    },
    closeModal() {
      this.countClearFiles++
      this.onclear()
      this.$emit('closeModal')
    },
    onclear() {
      console.log('closeModal', this.btnClearImg)
      if (this.btnClearImg) {
        this.btnClearImg.click()
      }

      this.form = { ...interfaceForm }
    },
    onSubmit() {
      swAlert.confirmSubmit(
        `${this.value.moldCode}`,
        `ยืนยันสร้างเเบบปริ้นเรซิ่น`,
        async () => {
          //console.log('call submitPlan')
          await this.submit()
        },
        null,
        null
      )
    },
    updateFile(files) {
      this.form.images = files
    },

    // -------- helper function -------- //
    formatDateTime(date) {
      return date ? formatDateTime(date) : ''
    },
    formatDate(date) {
      return formatDate(date)
    },

    // -------- APIs -------- //
    async submit() {
      try {
        this.isLoading = true

        console.log('this.value', this.value)

        let params = new FormData()
        params.append('planId', this.value.id)
        params.append('moldCode', this.value.moldCode)
        params.append('resinBy', this.form.resinBy)
        params.append('remark', this.form.remark)
        params.append('qtyReceive', this.form.qtyReceive)
        params.append('qtySend', this.form.qtySend)
        this.form.images.forEach((file) => {
          params.append(`images`, file) // ใช้ชื่อ "Images" ตรงกับ property ใน model
        })

        console.log('params', params)

        let options = {
          headers: {
            'Content-Type': `multipart/form-data`
          }
        }
        const res = await api.jewelry.post('Mold/PlanResin', params, options)
        if (res) {
          swAlert.success(
            ``,
            '',
            () => {
              //this.onclear()
              this.closeModal()
            },
            null,
            null
          )
        }

        this.isLoading = false
      } catch (error) {
        this.isLoading = false
        console.log(error)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
