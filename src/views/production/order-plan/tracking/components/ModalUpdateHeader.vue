<template>
  <div class="app-container-modal">
    <loading :isLoading="isLoading"></loading>
    <modal :showModal="isShowModal" @closeModal="closeModal" width="400px">
      <template v-slot:title>
        <h5>{{ `${model.wo}-${model.woNumber}` }}</h5>
      </template>
      <template v-slot:content>
        <form @submit.prevent="onSubmit">
          <div class="form-container">
            <!-- <div><label class="title">ระบุข้อมูลพลอย</label></div> -->
            <div class="row form-group">
              <div class="col-md-12">
                <label>เเม่พิมพ์</label>
                <!-- <input type="text" class="form-control" v-model="form.mold" required /> -->
                <div class="flex-group">
                  <div class="w-25">{{ model.mold }}</div>
                  <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
                  <AutoComplete
                    v-model="form.mold"
                    :suggestions="itemMold"
                    @complete="onSearchMold"
                    placeholder="กรอกรหัสเเม่พิมพ์ ...."
                    :class="val.isValMold === true ? `p-invalid` : ``"
                    forceSelection
                  />
                </div>
              </div>
            </div>
            <div class="row form-group">
              <div class="col-md-12">
                <label>วันส่งงานลุกค้า</label>
                <div class="flex-group">
                  <!-- <Calendar
                    class="w-100"
                    v-model="model.requestDate"
                    dateFormat="dd/mm/yy"
                    showIcon
                    showButtonBar
                    required
                    disable
                  /> -->
                  <div class="w-25">{{ formatDate(model.requestDate) }}</div>

                  <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
                  <Calendar class="w-100" v-model="form.requestDate" showIcon />
                </div>
              </div>
            </div>
            <div class="row form-group">
              <div class="col-md-12">
                <label>รหัสลุกค้า</label>
                <input type="text" class="form-control" v-model="form.customerNumber" required />
              </div>
            </div>
            <!-- customer type -->
            <div class="row form-group">
              <div class="col-md-12">
                <label>ประเภทลูกค้า</label>
                <div class="flex-group">
                  <div class="w-25">{{ model.customerTypeNavigation.nameTh }}</div>
                  <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
                  <Dropdown
                    v-model="form.customerType"
                    :options="modelMasterCustomerType"
                    optionLabel="description"
                    class="md:w-14rem"
                    :showClear="form.customerType ? true : false"
                  />
                </div>
              </div>
            </div>
            <!-- qty -->
            <div class="row form-group">
              <div class="col-md-6">
                <label>จำนวนสินค้า</label>
                <input
                  type="Number"
                  min="1"
                  class="form-control"
                  v-model="form.productQty"
                  required
                />
              </div>
              <div class="col-md-6">
                <label>หน่วย</label>
                <input type="text" class="form-control" v-model="form.productQtyUnit" required />
              </div>
            </div>
            <!-- product name -->
            <div class="row form-group">
              <div class="col-md-12">
                <label>ชื่อสินค้า</label>
                <input type="text" class="form-control" v-model="form.productName" required />
              </div>
            </div>
            <div class="row form-group">
              <div class="col-md-12">
                <label>รหัสสินค้า</label>
                <input type="text" class="form-control" v-model="form.productNumber" required />
              </div>
            </div>
            <!-- product type -->
            <div class="row form-group">
              <div class="col-md-12">
                <label>ประเภทสินค้า</label>
                <div class="flex-group">
                  <div class="w-25">{{ model.productTypeNavigation.nameTh }}</div>
                  <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
                  <Dropdown
                    v-model="form.productType"
                    :options="modelMasterProductType"
                    optionLabel="description"
                    class="md:w-14rem"
                    :showClear="form.productType ? true : false"
                  />
                </div>
              </div>
            </div>
            <!-- product detail -->
            <div class="row form-group">
              <div class="col-md-12">
                <label>รายละเอียดสินค้า</label>
                <textarea
                  class="form-control"
                  v-model="form.productDetail"
                  style="height: 70px"
                  required
                >
                </textarea>
              </div>
            </div>
            <!-- remark -->
            <div class="row form-group">
              <div class="col-md-12">
                <label>หมายเหตุ</label>
                <textarea class="form-control" v-model="form.remark" style="height: 70px">
                </textarea>
              </div>
            </div>

            <!-- submit -->
            <div class="line"></div>
            <div class="row form-group">
              <div class="col-md-12">
                <div class="btn-container">
                  <button class="btn btn-sm btn-main" type="submit">
                    <span class="mr-2"><i class="bi bi-gem"></i></span
                    ><span>เเก้ไขงาน : {{ `${model.wo}-${model.woNumber}` }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

import swAlert from '@/js/alert/sweetAlerts.js'
import api from '@/axios/axios-config.js'
import { formatDate, formatDateTime, formatISOString } from '@/utils/moment'
import moment from 'dayjs'

const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))
//import modal from '@/components/modal/ModalView.vue'
const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))

import Calendar from 'primevue/calendar'
import Dropdown from 'primevue/dropdown'
import AutoComplete from 'primevue/autocomplete'

export default {
  components: { modal, loading, Calendar, Dropdown, AutoComplete },
  props: {
    isShowModal: {
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
  computed: {
    model() {
      return this.modelValue
    },
    modelMasterCustomerType() {
      return this.masterCustomerType
    },
    modelMasterProductType() {
      return this.masterProductType
    }
  },
  watch: {
    async modelValue(value) {
      //console.log(value)
      this.form = {
        wo: value.wo,
        woNumber: value.woNumber,
        mold: value.mold
      }
      this.getValue()
    }
  },
  data() {
    return {
      isLoading: false,
      form: {
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
      },
      itemMold: [],
      val: {
        isValMold: false
      }
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
    closeModal() {
      //this.onclear()
      this.getValue() // restore value
      this.form.requestDate = null
      this.form.customerType = null
      this.form.productType = null

      this.$emit('closeModal')
    },
    onSubmit() {
      if (this.validateForm()) {
        swAlert.confirmSubmit(
          `${this.model.wo}-${this.model.woNumber}`,
          `ยืนยันเเก้ไขใบงาน`,
          async () => {
            //console.log('call submitPlan')
            await this.submit()
          },
          null,
          null
        )
      }
    },
    async submit() {
      try {
        this.isLoading = true

        const params = {
          id: this.model.id,
          wo: this.model.wo,
          woNumber: this.model.woNumber,

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
        const res = await api.jewelry.post('ProductionPlan/ProductionPlanUpdateHeader', params)
        if (res) {
          //console.log(res)
          swAlert.success(
            ``,
            ``,
            async () => {
              //this.onclear()
              this.form.requestDate = null
              this.form.customerType = null
              this.form.productType = null

              this.onClearVal()

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
    },
    onclear() {
      this.form.requestDate = null
    },
    async onSearchMold(e) {
      try {
        //this.isLoading = true

        const param = {
          take: this.take,
          skip: this.skip,
          search: {
            text: e.query ?? null
          }
        }

        const res = await api.jewelry.post('Mold/SearchMold', param)
        if (res) {
          //console.log(res)
          //this.data = [...res.data]
          //this.totalRecords = res.total
          //console.log(this.totalRecords)
          this.itemMold = res.data.map((x) => `${x.code}`)
        }
        //this.isLoading = false
      } catch (error) {
        console.log(error)
        //this.isLoading = false
      }
    },
    getValue() {
      //console.log('get')
      this.form = {
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
    validateForm() {
      if (!this.form.mold) {
        this.val = {
          isValMold: true
        }
        return false
      }

      return true
    },
    onClearVal() {
      this.val = {
        isValMold: false
      }
    }
  },
  created() {
    //this.getValue()
    this.onClearVal()
  },
  onMounted() {
    //this.getValue()
  }
}
</script>

<style lang="scss" scoped>
h5 {
  padding: 10px 0px 0px 10px;
  font-size: 21px;
  font-weight: 600;
  color: var(--base-font-color);
}
label {
  color: var(--base-font-color);
  //font-size: 13px;
  font-weight: 300;
  margin: 5px 0px 0px 0px;
}
.form-group {
  margin-bottom: 5px;
}
.title {
  font-size: 21px;
  font-weight: 600;
  width: 100%;
}
.btn-container {
  margin-top: 10px;
  display: grid;
  place-items: end;
}
.line {
  border-bottom: 1px solid var(--base-font-color);
  margin: 10px 20px;
}
.flex-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
