<template>
  <div class="form-container">
    <loading :isLoading="isLoading"></loading>
    <modal :showModal="isShow" @closeModal="closeModal" width="1000px">
      <!-- <template v-slot:title>
        <span class="txt-title-modal">เเก้ไขรายละเอียดสินค้า</span>
      </template> -->
      <template v-slot:content>
        <form @submit.prevent="onSubmit" class="form-content-container">
          <div class="mb-2">
            <span class="txt-title-modal">เเก้ไขรายละเอียดสินค้า</span>
          </div>
          <div class="form-content-row-container">
            <div>
              <span class="txt-title">เเม่พิมพ์</span>
              <div class="flex-group">
                <div class="w-25 txt-desc">{{ model.mold }}</div>
                <div class="mr-2"><i class="bi bi-arrow-right"></i></div>
                <AutoComplete
                  v-model="form.mold"
                  :suggestions="modelMold"
                  @complete="onSearchMold"
                  placeholder="กรอกรหัสเเม่พิมพ์ ...."
                  :class="val.isValMold === true ? `p-invalid` : ``"
                  forceSelection
                />
              </div>
            </div>
            <div>
              <span class="txt-title">วันส่งงานลุกค้า</span>
              <div class="flex-group">
                <div class="w-25 txt-desc">{{ formatDate(model.requestDate) }}</div>
                <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
                <Calendar
                  class="w-100"
                  dateFormat="dd/mm/yy"
                  v-model="form.requestDate"
                  :class="val.isValRequestDate === true ? `p-invalid` : ``"
                  showIcon
                />
              </div>
            </div>
          </div>
          <div class="form-content-row-container">
            <div>
              <span class="txt-title">รหัสลุกค้า</span>
              <input type="text" class="form-control" v-model="form.customerNumber" required />
            </div>
            <div>
              <span class="txt-title">ประเภทลูกค้า</span>
              <div class="flex-group">
                <div class="w-25 txt-desc">{{ model.customerTypeNavigation.nameTh }}</div>
                <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
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
          </div>
          <div class="form-content-row-container">
            <div>
              <span class="txt-title">ชื่อสินค้า</span>
              <input type="text" class="form-control" v-model="form.productName" required />
            </div>
            <div>
              <span class="txt-title">รหัสสินค้า</span>
              <input type="text" class="form-control" v-model="form.productNumber" required />
            </div>
          </div>
          <div class="form-content-row-container">
            <div>
              <span class="txt-title">ประเภทสินค้า</span>
              <div class="flex-group">
                <div class="w-25 txt-desc">{{ model.productTypeNavigation.nameTh }}</div>
                <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
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
            <div class="d-flex flex-columns">
              <div class="w-50 mr-2">
                <div>
                  <span class="txt-title">จำนวนสินค้า</span>
                  <input
                    type="number"
                    min="1"
                    class="form-control"
                    v-model="form.productQty"
                    required
                  />
                </div>
              </div>
              <div class="w-50">
                <div>
                  <span class="txt-title">หน่วย</span>
                  <input type="text" class="form-control" v-model="form.productQtyUnit" required />
                </div>
              </div>
            </div>
          </div>
          <div class="form-content-row-container">
            <div>
              <span class="txt-title">รายละเอียดสินค้า</span>
              <textarea
                class="form-control"
                v-model="form.productDetail"
                style="height: 100px"
                required
              >
              </textarea>
            </div>
            <div>
              <span class="txt-title">หมายเหตุ</span>
              <textarea class="form-control" v-model="form.remark" style="height: 100px">
              </textarea>
            </div>
          </div>
          <div class="d-flex justify-content-center mt-3">
            <button class="btn btn-sm btn-dark btn-custom mr-2" type="button" @click="closeModal">
              ยกเลิกเเก้ไขรายละเอียดสินค้า
            </button>
            <button class="btn btn-sm btn-warning btn-custom" type="submit">
              ยืนยันเเก้ไขรายละเอียดสินค้า
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

import AutoComplete from 'primevue/autocomplete'
import Calendar from 'primevue/calendar'
import Dropdown from 'primevue/dropdown'
import moment from 'dayjs'

import api from '@/axios/axios-config.js'
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
  isValProductType: false
}
export default {
  components: {
    modal,
    loading,
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
    async modelValue() {
      this.getValue()
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
      modelMold: []
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
:deep(input) {
  margin-top: 0px !important;
}
:deep(.p-calendar) {
  height: 35px;
  margin-top: 0px !important;
}
:deep(.p-dropdown) {
  height: 35px !important;
  padding-left: 5px;
  width: 100% !important;
  margin-top: 0px !important;
}
.form-container {
}
.form-content-container {
  //   border: 1px solid #dddddd;
  //   border-radius: 5px;
  //   box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  //   background-color: #f7f7f7;
  padding: 20px 20px;
  overflow: auto;
  height: 470px;
}
.form-content-row-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 50px;
  padding: 0px 30px;
}
.flex-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.txt-title-modal {
  padding: 30px;
  font-size: 20px;
  color: var(--base-font-color);
}
.txt-title {
  font-size: 12px;
}
.txt-desc {
  font-size: 16px;
  color: var(--base-font-color);
}
.btn-custom {
  width: 200px;
}
</style>
