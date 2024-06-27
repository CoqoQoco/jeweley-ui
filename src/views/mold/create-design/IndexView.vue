<template>
  <div class="app-container">
    <loading :isLoading="isLoading"></loading>
    <div class="box-center">
      <stepperStatus :events="events" :eventsIdActive="1"></stepperStatus>
    </div>
    <div id="step1" class="filter-container mt-2">
      <form @submit.prevent="onSubmit">
        <div class="form-tree-col-container">
          <div>
            <span class="title-text-lg">รหัสตั้งเเม่พิมพ์</span>
            <span class="txt-required"> *</span>
            <input
              type="text"
              class="form-control"
              :class="form.moldCode ? `` : `bg-warning`"
              v-model="form.moldCode"
              required
            />
          </div>
        </div>
        <div class="mt-2">
          <uploadImages
            title="รูปต้นเเบบเเม่พิมพ์ (ไม่เกิน 3 รูป)"
            @onUpdateFile="updateFile"
          ></uploadImages>
        </div>
        <div>
          <div class="form-four-col-container">
            <div>
              <span class="title-text">ขนาดพลอย</span>
              <input type="number" step="any" class="form-control" v-model="form.sizeGem" />
            </div>
            <div>
              <span class="title-text">จำนวนพลอย</span>
              <input type="number" step="any" class="form-control" v-model="form.qtyGem" />
            </div>
            <div>
              <span class="title-text">ขนาดเพชร</span>
              <input type="number" step="any" class="form-control" v-model="form.sizeDiamond" />
            </div>
            <div>
              <span class="title-text">จำนวนเพชร</span>
              <input type="number" step="any" class="form-control" v-model="form.qtyDiamond" />
            </div>
          </div>
          <div class="form-four-col-container">
            <div>
              <span class="title-text">น้ำหนักก่อนเเต่ง</span>
              <input
                type="number"
                step="any"
                class="form-control"
                v-model="form.qtyBeforeCasting"
              />
            </div>
            <div>
              <span class="title-text">น้ำหนักก่อนส่ง</span>
              <input type="number" step="any" class="form-control" v-model="form.qtyBeforeSend" />
            </div>
          </div>
        </div>
        <div class="d-flex justify-content-end zone-container">
          <button class="btn btn-sm btn-main" type="submit">
            <span class="mr-2">
              <i class="bi bi-gem"></i>
            </span>
            <span>ออกเเบบเเละขึ้น 3D</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

import { eventStatus } from './interface/data.js'

const stepperStatus = defineAsyncComponent(() => import('@/components/prime-vue/StepperStatus.vue'))
const uploadImages = defineAsyncComponent(() => import('@/components/prime-vue/UploadImages.vue'))
const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))
import swAlert from '@/services/alert/sweetAlerts.js'
import api from '@/axios/axios-config.js'

const interfaceForm = {
  images: [],
  moldCode: '',
  sizeGem: '',
  qtyGem: '',
  sizeDiamond: '',
  qtyDiamond: '',
  qtyBeforeCasting: '',
  qtyBeforeSend: ''
}
export default {
  components: {
    stepperStatus,
    uploadImages,
    loading
  },
  data() {
    return {
      isLoading: false,
      events: [...eventStatus],
      form: { ...interfaceForm }
    }
  },
  methods: {
    onSubmit() {
      console.log('submit', this.form)
      this.submit()
    },
    onclear() {
      this.form = { ...interfaceForm }
    },
    updateFile(files) {
      this.form.images = files
    },

    // ------ Apis ------ //
    async submit() {
      try {
        this.isLoading = true

        // const param = {
        //   moldCode: this.form.moldCode,
        //   sizeGem: this.form.sizeGem,
        //   qtyGem: this.form.qtyGem,
        //   sizeDiamond: this.form.sizeDiamond,
        //   qtyDiamond: this.form.qtyDiamond,
        //   qtyBeforeCasting: this.form.qtyBeforeCasting,
        //   qtyBeforeSend: this.form.qtyBeforeSend,
        //   images: this.form.images
        // }
        let params = new FormData()
        params.append('moldCode', this.form.moldCode)
        params.append('sizeGem', this.form.sizeGem)
        params.append('qtyGem', this.form.qtyGem)
        params.append('sizeDiamond', this.form.sizeDiamond)
        params.append('qtyDiamond', this.form.qtyDiamond)
        params.append('qtyBeforeCasting', this.form.qtyBeforeCasting)
        params.append('qtyBeforeSend', this.form.qtyBeforeSend)

        //params.append('images', this.form.images)

        this.form.images.forEach((file) => {
          params.append(`images`, file) // ใช้ชื่อ "Images" ตรงกับ property ใน model
        })

        console.log('params', params)

        let options = {
          headers: {
            'Content-Type': `multipart/form-data`
          }
        }
        const res = await api.jewelry.post('Mold/PlanDesign', params, options)
        if (res) {
          swAlert.success(
            ``,
            '',
            () => {
              this.onclear()
              //this.$router.go(-1)
              this.$router.push({ name: 'design-list' })
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

.zone-container {
  //border: 1px solid #dddddd;
  //border-radius: 5px;
  //box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  //background-color: #f7f7f7;
  padding: 20px 20px;
  //margin-bottom: 20px;
}
</style>
