<template>
  <div class="app-container">
    <div class="box-center">
      <stepperStatus :events="events" :eventsIdActive="1"></stepperStatus>
    </div>
    <div id="step1" class="filter-container mt-2">
      <form @submit.prevent="onSubmit">
        <div class="form-col-container">
          <!-- code -->
          <div>
            <div>
              <span class="title-text">{{ $t('view.mold.planRemodel.fieldCode') }}</span>
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
              <span class="title-text">{{ $t('view.mold.planRemodel.fieldCategory') }}</span>
              <span class="txt-required"> *</span>
            </div>
            <DropdownGeneric
              :modelValue="form.category"
              :options="masterProduct"
              optionLabel="description"
              :showClear="!!form.category"
              :class="val.isValCategory === true ? `p-invalid` : ``"
              @update:modelValue="onCategoryChange"
            />
          </div>

          <!-- re-code -->
          <div>
            <div>
              <span class="title-text">{{ $t('view.mold.planRemodel.fieldRemodel') }}</span>
            </div>
            <AutoCompleteGeneric
              :modelValue="form.remodel"
              :suggestions="moldSearch"
              @complete="onSearchMold"
              optionLabel="code"
              :forceSelection="true"
              @update:modelValue="form.remodel = $event"
            />
          </div>
        </div>

        <div class="form-col-container">
          <!-- work by -->
          <div>
            <span>
              <span class="title-text">{{ $t('view.mold.planRemodel.fieldMoldBy') }}</span>
              <span class="txt-required"> *</span>
            </span>
            <input class="form-control" v-model="form.workBy" type="text" required />
          </div>

          <!-- location -->
          <div>
            <div>
              <span class="title-text">{{ $t('view.mold.planRemodel.fieldLocation') }}</span>
              <span class="txt-required"> *</span>
            </div>
            <DropdownGeneric
              :modelValue="form.LocationName"
              :options="masterLocationt"
              optionLabel="value"
              :showClear="!!form.LocationName"
              :class="val.isValLocation === true ? `p-invalid` : ``"
              @update:modelValue="onLocationChange"
            />
          </div>
          <div></div>
        </div>

        <div class="form-col-container">
          <!-- remark -->
          <div>
            <span class="title-text">{{ $t('view.mold.planRemodel.fieldRemark') }}</span>
            <textarea class="form-control" v-model="form.remark" style="height: 50px" />
          </div>
        </div>

        <div class="form-col-container mt-2">
          <uploadImages
            :title="$t('view.mold.planRemodel.imgTitle')"
            @onUpdateFile="updateFile"
          ></uploadImages>
        </div>

        <div class="d-flex justify-content-end mt-2">
          <button class="btn btn-sm btn-main" type="submit">
            <span class="mr-2">
              <i class="bi bi-gem"></i>
            </span>
            <span>{{ $t('view.mold.planRemodel.btnSubmit') }}</span>
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

import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import AutoCompleteGeneric from '@/components/prime-vue/AutoCompleteGeneric.vue'

import { confirmSubmit, success } from '@/services/alert/sweetAlerts.js'
import api from '@/axios/axios-helper.js'

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
    DropdownGeneric,
    AutoCompleteGeneric,
    uploadImages
  },
  watch: {
    'form.LocationName'() {
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
      ]
    }
  },
  methods: {
    onCategoryChange(value) {
      this.form.category = value
      if (value) this.val.isValCategory = false
    },
    onLocationChange(value) {
      this.form.LocationName = value
      if (value) this.val.isValLocation = false
    },
    onSubmit() {
      if (this.VaidateForm()) {
        confirmSubmit(
          `${this.form.code}`,
          this.$t('view.mold.planRemodel.confirmTitle'),
          async () => {
            await this.submit()
          },
          null,
          null
        )
      }
    },
    VaidateForm() {
      if (!this.form.LocationName) {
        this.val = { isValLocation: true }
        return false
      }
      if (!this.form.category) {
        this.val = { isValCategory: true }
        return false
      }
      return true
    },
    updateFile(files) {
      this.form.images = files
    },
    async getMaster(type) {
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
    },
    async onSearchMold(e) {
      const params = {
        take: 0,
        skip: 0,
        sort: [],
        search: {
          text: e.query ?? null
        }
      }
      const res = await api.jewelry.post('Mold/SearchMold', params)
      if (res) {
        this.moldSearch = [...res.data]
      }
    },
    async submit() {
      let params = new FormData()
      params.append('code', this.form.code)
      params.append('workBy', this.form.workBy)
      params.append('remark', this.form.remark)
      params.append('location', this.form.LocationName.code)
      params.append('catagory', this.form.category.nameTh)
      params.append('catagoryCode', this.form.category.code)
      params.append('remodel', this.form.remodel ? this.form.remodel.code : '')

      this.form.images.forEach((file) => {
        params.append(`images`, file)
      })

      let options = {
        headers: {
          'Content-Type': `multipart/form-data`
        }
      }
      const res = await api.jewelry.post('Mold/PlanRemodel', params, options)
      if (res) {
        success(``, '', () => {
          window.location.reload()
        }, null, null)
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
