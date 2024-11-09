<template>
  <div>
  
    <modal :showModal="isShowModal" @closeModal="closeModal">
      <template v-slot:content>
        <div class="title-text-lg-header mb-2">
          <span>{{ `เเก้ไขแผนงานผลิต ใบจ่าย-รับคืนงาน เลขที่: ${form.wo}-${form.woNumber}` }}</span>
        </div>
        <form @submit.prevent="onSubmit">
          <div class="form-col-container">
            <!-- mold -->
            <div>
              <span class="title-text">เเม่พิมพ์</span>
              <AutoComplete
                v-model="form.mold"
                :suggestions="modelMold"
                @complete="onSearchMold"
                placeholder="กรอกรหัสเเม่พิมพ์ ...."
                :class="val.isValMold === true ? `p-invalid` : ``"
                forceSelection
              />
            </div>

            <div></div>
            <div></div>
          </div>
          <div class="form-col-container mt-3">
            <!-- send date -->
            <div>
              <span class="title-text">วันส่งงานลูกค้า</span>
              <Calendar
                class="w-100"
                dateFormat="dd/mm/yy"
                v-model="form.requestDate"
                :class="val.isValRequestDate === true ? `p-invalid` : ``"
                showIcon
              />
            </div>
            <!-- customer number -->
            <div>
              <span class="title-text">รหัสลุกค้า</span>
              <!-- <input type="text" class="form-control" v-model="form.customerNumber" required /> -->
              <AutoComplete
                v-model="form.customerNumber"
                :suggestions="modelCustomer"
                @complete="onSearchCustomer"
                placeholder="กรอกรหัสลูกค้า...."
                :class="val.isValCustomerNumber === true ? `p-invalid` : ``"
                forceSelection
              />
            </div>

            <!-- customer type -->
            <div>
              <span class="title-text">ประเภทลูกค้า</span>
              <Dropdown
                v-model="form.customerType"
                :options="modelMasterCustomerType"
                optionLabel="description"
                class="md:w-14rem"
                :class="val.isValCustomerType === true ? `p-invalid` : ``"
                :showClear="form.customerType ? true : false"
              />
            </div>
          </div>

          <div class="line-main mt-4"></div>

          <div class="form-col-container mt-3">
            <!-- product name -->
            <div>
              <span class="title-text">ชื่อสินค้า</span>
              <input type="text" class="form-control" v-model="form.productName" required />
            </div>

            <!-- product number -->
            <div>
              <span class="title-text">รหัสสินค้า</span>
              <input type="text" class="form-control" v-model="form.productNumber" required />
            </div>

            <!-- product type -->
            <div>
              <span class="title-text">ประเภทสินค้า</span>
              <Dropdown
                v-model="form.productType"
                :options="modelMasterProductType"
                optionLabel="description"
                class="md:w-14rem"
                :class="val.isValProductType === true ? `p-invalid` : ``"
                :showClear="form.productType ? true : false"
              />
            </div>
          </div>
          <div class="form-col-container filter-container-highlight mt-2">
            <div class="form-col-sm-container pl-2">
              <!-- qty -->
              <div>
                <span class="title-text-white">จำนวนสินค้า</span>
                <input
                  type="number"
                  min="1"
                  class="form-control"
                  style="background-color: #dad4b5"
                  :style="form.productQty ? 'background-color: #b5dad4' : ''"
                  v-model="form.productQty"
                  required
                />
              </div>

              <!-- unit -->
              <div>
                <span class="title-text-white">หน่วย</span>
                <input
                  type="text"
                  class="form-control"
                  style="background-color: #dad4b5"
                  :style="form.productQtyUnit ? 'background-color: #b5dad4' : ''"
                  v-model="form.productQtyUnit"
                  required
                />
              </div>
            </div>

            <div></div>
            <div></div>
          </div>
          <div class="form-col-container">
            <!-- product detail -->
            <div>
              <span class="title-text">รายละเอียดสินค้า</span>
              <textarea
                class="form-control"
                v-model="form.productDetail"
                style="height: 50px"
                required
              >
              </textarea>
            </div>
          </div>

          <div class="line-main mt-4"></div>

          <div class="form-col-container mt-3">
            <div>
              <span class="title-text">หมายเหตุ</span>
              <textarea class="form-control" v-model="form.remark" style="height: 50px"> </textarea>
            </div>
          </div>

          <div class="line-main mt-4"></div>

          <div class="d-flex justify-content-end mt-1">
            <button class="btn btn-sm btn-dark mr-2" type="button" @click="closeModal">
              ยกเลิก
            </button>
            <button class="btn btn-sm btn-main" type="submit">ยืนยัน</button>
          </div>
        </form>
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))


import AutoComplete from 'primevue/autocomplete'
import Calendar from 'primevue/calendar'
import Dropdown from 'primevue/dropdown'

import moment from 'dayjs'
import api from '@/axios/axios-helper.js'
import swAlert from '@/services/alert/sweetAlerts.js'
import { formatDate, formatDateTime, formatISOString } from '@/services/utils/dayjs'

const interfaceForm = {
  wo: null,
  woNumber: null,
  mold: null,
  customerNumber: null,
  requestDate: null,
  customerType: null,
  productQty: null,
  productQtyUnit: null,
  productName: null,
  productNumber: null,
  productType: null,
  productDetail: null
}
const interfaceIsValid = {
  isValMold: false,
  isValRequestDate: false,
  isValCustomerType: false,
  isValProductType: false,
  isValCustomerNumber: false
}

export default {
  components: {
    modal,
  
    AutoComplete,
    Calendar,
    Dropdown
  },
  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    modelValue: {
      type: Object,
      required: true,
      default: () => {}
    },
    masterCustomerType: {
      type: Array,
      required: true,
      default: () => []
    },
    masterProductType: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  watch: {
    modelValue: {
      handler(val) {
        this.form = {
          id: val.id,
          wo: val.wo,
          woNumber: val.woNumber,

          mold: val.mold,
          requestDate: val.requestDate ? new Date(val.requestDate) : null,

          customerNumber: val.customerNumber,
          customerType: this.modelMasterCustomerType.find((x) => x.code === val.customerType),

          productName: val.productName,
          productNumber: val.productNumber,
          productType: this.modelMasterProductType.find((x) => x.code === val.productType),

          productQty: val.productQty,
          productQtyUnit: val.productQtyUnit,
          productDetail: val.productDetail,
          remark: val.remark
        }
      },
      deep: true
    }
  },
  computed: {
    isShowModal() {
      return this.isShow
    },
    // model() {
    //   return this.modelValue
    // },
    modelMasterCustomerType() {
      return this.masterCustomerType
    },
    modelMasterProductType() {
      return this.masterProductType
    }
  },
  data() {
    return {
      // --- flag --- //
      isLoading: false,

      // --- from --- //
      form: {
        ...interfaceForm
      },
      val: {
        ...interfaceIsValid
      },
      modelMold: [],
      modelCustomer: []
    }
  },
  methods: {
    // ------ helper ------//
    formatDateTime(date) {
      return date ? formatDateTime(date) : ''
    },
    formatDate(date) {
      return date ? formatDate(date) : ''
    },
    showDate(date) {
      return date ? moment(date).format('DD/MM/yyyy') : ''
    },

    // --- controller --- //
    getValue() {
      //console.log('get')
      this.form = {
        id: this.model.id,
        wo: this.model.wo,
        woNumber: this.model.woNumber,
        mold: this.model.mold,
        customerNumber: this.model.customerNumber,
        productQty: this.model.productQty,
        productQtyUnit: this.model.productQtyUnit,
        productName: this.model.productName,
        productNumber: this.model.productNumber,
        productDetail: this.model.productDetail,
        remark: this.model.remark
      }
    },
    closeModal() {
      this.val = {
        ...interfaceIsValid
      }
      //   this.form = {
      //     ...interfaceForm
      //   }
      this.$emit('closeModal')
    },
    onSubmit() {
      if (this.validateForm()) {
        swAlert.confirmSubmit(
          `${this.form.wo}-${this.form.woNumber}`,
          `ยืนยันเเก้ไขแผนงานผลิต`,
          async () => {
            //console.log('call submitPlan')
            await this.submit()
          },
          null,
          null
        )
      }
    },
    validateForm() {
      if (!this.form.mold) {
        this.val = {
          isValMold: true
        }
        return false
      }
      if (!this.form.requestDate) {
        this.val = {
          isValRequestDate: true
        }
        return false
      }
      if (!this.form.customerType) {
        this.val = {
          isValCustomerType: true
        }
        return false
      }
      if (!this.form.productType) {
        this.val = {
          isValProductType: true
        }
        return false
      }
      if (!this.form.customerNumber) {
        this.val = {
          isValCustomerNumber: true
        }
        return false
      }

      return true
    },

    // --- APIs --- //
    async onSearchMold(e) {
      try {
        const param = {
          take: this.take,
          skip: this.skip,
          search: {
            text: e.query ?? null
          }
        }

        const res = await api.jewelry.post('Mold/SearchMold', param)
        if (res) {
          this.modelMold = res.data.map((x) => `${x.code}`)
        }
      } catch (error) {
        console.log(error)
      }
    },
    async onSearchCustomer(e) {
      try {
        //this.isLoading = true
        const param = {
          take: 0,
          skip: 0,
          search: {
            text: e.query ?? null
          }
        }

        const res = await api.jewelry.post('Customer/SearchCustomer', param)
        if (res) {
          this.modelCustomer = res.data.map((x) => `${x.code}`)
          console.log(this.customerItemSearch)
        }
      } catch (error) {
        console.log(error)
      }
    },
    async submit() {
      try {
        this.isLoading = true

        const params = {
          id: this.form.id,
          wo: this.form.wo,
          woNumber: this.form.woNumber,

          mold: this.form.mold,
          requestDate: this.form.requestDate ? formatISOString(this.form.requestDate) : null,

          customerNumber: this.form.customerNumber,
          customerType: this.form.customerType ? this.form.customerType.code : null,

          productQty: this.form.productQty,
          productQtyUnit: this.form.productQtyUnit,

          productName: this.form.productName,
          productNumber: this.form.productNumber,
          productType: this.form.productType ? this.form.productType.code : null,
          productDetail: this.form.productDetail,
          remark: this.form.remark ?? null
        }

        //console.log(params)
        //this.closeModal()
        const res = await api.jewelry.post('ProductionPlan/ProductionPlanUpdateHeader', params)
        if (res) {
          swAlert.success(
            ``,
            ``,
            async () => {
              //this.onclear()
              this.form.requestDate = null
              this.form.customerType = null
              this.form.productType = null

              //this.onClearVal()
              this.val = {
                ...interfaceIsValid
              }
              this.form = {
                ...interfaceForm
              }
              this.$emit('fetch')
            },
            null,
            null
          )
        }
        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
