<template>
  <div class="app-container">
    <loading :isLoading="isLoading"></loading>
    <div class="box-center">
      <stepperStatus :events="events" :eventsIdActive="1"></stepperStatus>
    </div>
    <div id="step1" class="filter-container mt-2">
      <form @submit.prevent="onSubmit">
        <div class="form-col-container">
          <!-- code -->
          <div>
            <div>
              <span class="title-text">รหัสเเม่พิมพ์</span>
              <span class="txt-required"> *</span>
            </div>
            <input
              type="text"
              class="form-control"
              :class="form.code ? `` : `bg-warning`"
              v-model="form.code"
              required
            />
          </div>

          <!-- type -->
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

          <!-- re-code -->
          <div>
            <div>
              <span class="title-text">แปลงเเบบ</span>
              <AutoComplete
                v-model="form.remodel"
                :suggestions="moldSearch"
                @complete="onSearchMold"
                optionLabel="code"
                forceSelection
              >
              </AutoComplete>
            </div>
          </div>
        </div>

        <div class="form-col-container">
          <!-- work by -->
          <div>
            <span>
              <span class="title-text">ช่างขึ้นพิมพ์</span>
              <span class="txt-required"> *</span>
            </span>
            <input class="form-control" v-model="form.workBy" type="text" required />
          </div>

          <!-- location -->
          <div>
            <div>
              <span class="title-text">จัดเก็บ</span>
              <span class="txt-required"> *</span>
            </div>
            <Dropdown
              v-model="form.LocationName"
              :options="masterLocationt"
              optionLabel="value"
              class="w-full md:w-14rem"
              :showClear="form.LocationName ? true : false"
              :class="val.isValCategory === true ? `p-invalid` : ``"
              @change="onResetValDate('isValLocation')"
            />
            <!-- <input type="text" class="form-control" v-model="form.category" required /> -->
          </div>
          <div></div>
        </div>

        <div class="form-col-container">
          <!-- remark -->
          <div>
            <span class="title-text">รายละเอียด</span>
            <textarea class="form-control" v-model="form.remark" style="height: 50px" />
          </div>
        </div>

        <div class="form-col-container mt-2">
          <uploadImages
            title="รูปเเม่พิมพ์สำเร็จ (1 รูป)"
            @onUpdateFile="updateFile"
            @btnClearRef="setBtnClearRef"
          ></uploadImages>
        </div>

        <div class="d-flex justify-content-end mt-2">
          <button class="btn btn-sm btn-main" type="submit">
            <span class="mr-2">
              <i class="bi bi-gem"></i>
            </span>
            <span>ยืนยันแปลงเเบบเเละจัดเก็บพิมพ์</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

import { eventReModelStatus, mateiralType } from '../create-design/interface/data.js'

const stepperStatus = defineAsyncComponent(() => import('@/components/prime-vue/StepperStatus.vue'))
const uploadImages = defineAsyncComponent(() => import('@/components/prime-vue/UploadImages.vue'))
const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))

import Dropdown from 'primevue/dropdown'
import AutoComplete from 'primevue/autocomplete'

import swAlert from '@/services/alert/sweetAlerts.js'
import api from '@/axios/axios-config.js'

const interfaceForm = {
  images: [],
  code: null,
  category: null,
  remodel: null,

  remark: null,
  workBy: null,
  LocationName: null
}
const interfaceVal = {
  isValCategory: false,
  isValLocation: false
}

export default {
  components: {
    stepperStatus,
    Dropdown,
    AutoComplete,
    uploadImages,
    loading
  },
  watch: {
    'form.locationName'() {
      if (this.form.LocationName) {
        this.val.isValLocation = false
      }
    },
    'form.category'() {
      if (this.form.category) {
        this.val.isValCategory = false
      }
    }
  },
  data() {
    return {
      isLoading: false,
      events: [...eventReModelStatus],
      mateiralType: [...mateiralType],

      form: { ...interfaceForm },
      val: { ...interfaceVal },

      moldSearch: [],
      masterProduct: [],
      masterLocationt: [
        { id: 1, code: 'A', value: 'คลัง 1' },
        { id: 2, code: 'B', value: 'คลัง 2' },
        { id: 3, code: 'C', value: 'คลัง 3' }
      ],

      btnClearImg: null
    }
  },
  methods: {
    // ----- event
    onSubmit() {
      if (this.VaidateForm()) {
        swAlert.confirmSubmit(
          `${this.form.code}`,
          `ยืนยันสร้างเเบบจัดเก็บพิมพ์`,
          async () => {
            //console.log('call submitPlan')
            await this.submit()
          },
          null,
          null
        )
      }
    },
    // ----- helper
    onResetValDate(key) {
      if (key === 'isValLocation') {
        if (this.form.LocationName) {
          this.val.isValLocation = false
        }
      }
      if (key === 'isValCategory') {
        if (this.form.category) {
          this.val.isValCategory = false
        }
      }
    },
    VaidateForm() {
      if (!this.form.LocationName) {
        this.val = {
          isValLocation: true
        }
        return false
      }
      if (!this.form.category) {
        this.val = {
          isValCategory: true
        }
        return false
      }

      return true // pass
    },
    updateFile(files) {
      this.form.images = files
    },
    setBtnClearRef(ref) {
      this.btnClearImg = ref
      console.log('setBtnClearRef', this.btnClearImg)
    },
    // -----APIs
    async getMaster(type) {
      this.isLoading = true
      try {
        let res = null

        switch (type) {
          case 'PRODUCTTYPE':
            res = await api.jewelry.get('Master/MasterProductType')
            break
          default:
            break
        }

        if (res) {
          switch (type) {
            case 'PRODUCTTYPE':
              this.masterProduct = [...res]
              break
            default:
              break
          }
        }
      } catch (error) {
        console.log('error', error)
      }
      this.isLoading = false
    },
    async onSearchMold(e) {
      this.isLoading = true
      try {
        const params = {
          take: 0,
          skip: 0,
          sort: [],
          search: {
            text: e.query ?? null
          }
        }
        console.log('params', params)
        const res = await api.jewelry.post('Mold/SearchMold', params)
        if (res) {
          this.moldSearch = [...res.data]
        }
      } catch (error) {
        console.log(error)
      }
      this.isLoading = false
    },
    async submit() {
      try {
        this.isLoading = true

        console.log('this.value', this.form)

        let params = new FormData()
        params.append('code', this.form.code)
        params.append('workBy', this.form.workBy)
        params.append('remark', this.form.remark)
        params.append('location', this.form.LocationName.code)
        params.append('catagory', this.form.category.nameTh)
        params.append('catagoryCode', this.form.category.code)
        params.append('remodel', this.form.remodel ? this.form.remodel.code : '')

        this.form.images.forEach((file) => {
          params.append(`images`, file) // ใช้ชื่อ "Images" ตรงกับ property ใน model
        })

        console.log('params', params)

        let options = {
          headers: {
            'Content-Type': `multipart/form-data`
          }
        }
        const res = await api.jewelry.post('Mold/PlanRemodel', params, options)
        if (res) {
          swAlert.success(
            ``,
            '',
            () => {
              //refrsh
              window.location.reload()
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
      this.getMaster('PRODUCTTYPE')
    })
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
