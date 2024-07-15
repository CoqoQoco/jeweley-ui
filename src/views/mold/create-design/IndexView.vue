<template>
  <div class="app-container">
    <loading :isLoading="isLoading"></loading>
    <div class="box-center">
      <stepperStatus :events="events" :eventsIdActive="1"></stepperStatus>
    </div>
    <div id="step1" class="filter-container mt-2">
      <form @submit.prevent="onSubmit">
        <div class="form-col-container">
          <div>
            <div>
              <span class="title-text">รหัสตั้งเเม่พิมพ์</span>
              <span class="txt-required"> *</span>
            </div>
            <input
              type="text"
              class="form-control"
              :class="form.moldCode ? `` : `bg-warning`"
              v-model="form.moldCode"
              required
            />
          </div>
          <div>
            <div>
              <span class="title-text">ประเภท</span>
              <span class="txt-required"> *</span>
            </div>
            <Dropdown
              v-model="form.category"
              :options="masterProduct"
              optionLabel="description"
              class="w-full md:w-14rem"
              :showClear="form.category ? true : false"
              :class="val.isValCategory === true ? `p-invalid` : ``"
              @change="onResetValDate('isValCategory')"
            />
            <!-- <input type="text" class="form-control" v-model="form.category" required /> -->
          </div>
          <div>
            <span>
              <span class="title-text">ออกเเบบโดย</span>
              <span class="txt-required"> *</span>
            </span>
            <input type="ะำปะ" required class="form-control" v-model="form.designBy" />
          </div>
        </div>
        <div class="form-col-container">
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
              v-model="form.qtyBeforeCasting"
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
              v-model="form.qtyBeforeSend"
            />
          </div>
          <div></div>
        </div>
        <div class="form-col-container">
          <div>
            <span class="title-text">รายละเอียด</span>
            <textarea class="form-control" v-model="form.remark" style="height: 50px" />
          </div>
        </div>
        <div class="mt-2">
          <uploadImages
            title="รูปต้นเเบบเเม่พิมพ์ (ไม่เกิน 2 รูป)"
            @onUpdateFile="updateFile"
          ></uploadImages>
        </div>
        <div>
          <div class="form-col-container">
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
        </div>
        <div class="d-flex justify-content-end mt-3">
          <!-- <button class="btn btn-sm btn-main mr-2" type="button" @click="onTest">TEST</button> -->
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

import Dropdown from 'primevue/dropdown'

import swAlert from '@/services/alert/sweetAlerts.js'
import api from '@/axios/axios-config.js'

const interfaceForm = {
  images: [],
  moldCode: null,
  sizeGem: null,
  qtyGem: null,
  sizeDiamond: null,
  qtyDiamond: null,
  qtyBeforeCasting: null,
  qtyBeforeSend: null,
  remark: null,
  category: null,
  designBy: null
}
const interfaceVal = {
  isValCategory: false
}
export default {
  components: {
    stepperStatus,
    uploadImages,
    loading,
    Dropdown
  },
  watch: {
    'form.category'() {
      if (this.form.category) {
        this.val.isValCategory = false
      }
    },
  },
  data() {
    return {
      isLoading: false,
      events: [...eventStatus],
      form: { ...interfaceForm },
      val: { ...interfaceVal },
      masterProduct: []
    }
  },
  methods: {
    onSubmit() {
      console.log('submit', this.form)
      if (this.VaidateForm()) {
        swAlert.confirmSubmit(
          `${this.form.moldCode}`,
          `ยืนยันสร้างเเบบเเม่พิมพ์`,
          async () => {
            //console.log('call submitPlan')
            await this.submit()
          },
          null,
          null
        )
      }
    },
    onclear() {
      this.form = { ...interfaceForm }
    },
    updateFile(files) {
      this.form.images = files
    },
    onResetValDate(index) {
      if (index === 'isValCategory') {
        if (this.form.category) {
          this.val.isValCategory = false
        }
      }
    },
    VaidateForm() {
      if (!this.form.category) {
        this.val = {
          isValCategory: true
        }
        return false
      }

      return true // pass
    },
    onTest(){
      this.$router.push({ name: 'plan-list' })
    },

    // ------ Apis ------ //
    async fetchMasterProductType() {
      try {
        this.isLoading = true
        const res = await api.jewelry.get('Master/MasterProductType')
        if (res) {
          this.masterProduct = [...res]
        }
        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    },
    async submit() {
      try {
        this.isLoading = true

        console.log('this.form', this.form)
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
        params.append('qtySend', this.form.qtyBeforeCasting)
        params.append('qtyReceive', this.form.qtyBeforeSend)
        params.append('remark', this.form.remark)
        params.append('Catagory', this.form.category?.code)
        params.append('designBy', this.form.designBy)

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
              this.$router.push({ name: 'plan-list' })
              //this.$router.push({ name: 'design-create' })
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
  },
  created() {
    this.$nextTick(() => {
      this.fetchMasterProductType()
    })
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
