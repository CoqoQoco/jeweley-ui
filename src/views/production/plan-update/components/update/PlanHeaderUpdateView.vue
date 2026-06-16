<template>
  <div>
    <modal :showModal="isShowModal" @closeModal="closeModal">
      <template v-slot:content>
        <div class="title-text-lg-header mb-2">
          <span>{{ `เเก้ไขแผนงานผลิต ใบจ่าย-รับคืนงาน เลขที่: ${form.wo}-${form.woNumber}` }}</span>
        </div>
        <form @submit.prevent="onSubmit">
          <div class="p-2">
            <div class="form-col-container">
              <!-- mold -->
              <div>
                <span class="title-text">เเม่พิมพ์</span>
                <AutoCompleteGeneric
                  v-model="form.mold"
                  :suggestions="modelMold"
                  @complete="onSearchMold"
                  placeholder="กรอกรหัสเเม่พิมพ์ ...."
                  :class="val.isValMold === true ? `p-invalid` : ``"
                  :forceSelection="true"
                />
              </div>

              <div></div>
              <div></div>
            </div>
            <div class="form-col-container mt-3">
              <!-- send date -->
              <div>
                <span class="title-text">วันส่งงานลูกค้า</span>
                <CalendarGeneric
                  class="w-100"
                  dateFormat="dd/mm/yy"
                  v-model="form.requestDate"
                  :class="val.isValRequestDate === true ? `p-invalid` : ``"
                  :showIcon="true"
                />
              </div>
              <!-- customer number -->
              <div>
                <span class="title-text">รหัสลุกค้า</span>
                <AutoCompleteGeneric
                  v-model="form.customerNumber"
                  :suggestions="modelCustomer"
                  @complete="onSearchCustomer"
                  placeholder="กรอกรหัสลูกค้า...."
                  :class="val.isValCustomerNumber === true ? `p-invalid` : ``"
                  :forceSelection="true"
                />
              </div>

              <!-- customer type -->
              <div>
                <span class="title-text">ประเภทลูกค้า</span>
                <DropdownGeneric
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
                <InputTextGeneric v-model="form.productName" :required="true" />
              </div>

              <!-- product number -->
              <div>
                <span class="title-text">รหัสสินค้า</span>
                <InputTextGeneric v-model="form.productNumber" :required="true" />
              </div>

              <!-- product type -->
              <div>
                <span class="title-text">ประเภทสินค้า</span>
                <DropdownGeneric
                  v-model="form.productType"
                  :options="modelMasterProductType"
                  optionLabel="description"
                  class="md:w-14rem"
                  :class="val.isValProductType === true ? `p-invalid` : ``"
                  :showClear="form.productType ? true : false"
                />
              </div>
            </div>
            <div class="form-col-container filter-container-highlight mt-2 p-2">
              <div class="form-col-sm-container pl-2">
                <!-- qty -->
                <div>
                  <span class="title-text-white">จำนวนสินค้า</span>
                  <InputTextGeneric
                    type="number"
                    min="1"
                    v-model="form.productQty"
                    :required="true"
                    :bgInput="form.productQty ? '#b5dad4' : '#dad4b5'"
                  />
                </div>

                <!-- unit -->
                <div>
                  <span class="title-text-white">หน่วย</span>
                  <InputTextGeneric
                    v-model="form.productQtyUnit"
                    :required="true"
                    :bgInput="form.productQtyUnit ? '#b5dad4' : '#dad4b5'"
                  />
                </div>
              </div>

              <div></div>
              <div></div>
            </div>
            <div class="form-col-container mt-2">
              <!-- product detail -->
              <div>
                <span class="title-text">รายละเอียดสินค้า</span>
                <TextareaGeneric
                  v-model="form.productDetail"
                  :rows="2"
                  :required="true"
                />
              </div>
            </div>

            <div class="form-col-container mt-2">
              <div>
                <span class="title-text">สีของทองทอง/เงิน</span>
                <DropdownGeneric
                  v-model="form.gold"
                  :options="modelMastergold"
                  optionLabel="description"
                  class="w-full md:w-14rem"
                  placeholder="เลือกทอง"
                />
              </div>
              <div>
                <span class="title-text">ประเภททอง/เงิน</span>
                <DropdownGeneric
                  v-model="form.goldSize"
                  :options="modelMasterGoldSize"
                  optionLabel="description"
                  placeholder="เลือกเปอร์เซ็น"
                  class="w-full md:w-14rem"
                />
              </div>
              <div></div>
            </div>

            <div class="line-main mt-4"></div>

            <div class="form-col-container mt-3">
              <div>
                <span class="title-text">หมายเหตุ</span>
                <TextareaGeneric v-model="form.remark" :rows="2" />
              </div>
            </div>

            <div class="line-main mt-4"></div>

            <div class="d-flex justify-content-end mt-1">
              <button class="btn btn-sm btn-green" type="submit">
                <span class="bi bi-calendar-check"></span>
              </button>
            </div>
          </div>
        </form>
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

import moment from 'dayjs'
import api from '@/axios/axios-helper.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { success } from '@/services/alert/sweetAlerts.js'
import { formatDate, formatDateTime, formatISOString } from '@/services/utils/dayjs'

import AutoCompleteGeneric from '@/components/prime-vue/AutoCompleteGeneric.vue'
import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import TextareaGeneric from '@/components/generic/TextareaGeneric.vue'

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

    AutoCompleteGeneric,
    CalendarGeneric,
    DropdownGeneric,
    InputTextGeneric,
    TextareaGeneric
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
    },
    masterGold: {
      type: Array,
      required: true,
      default: () => []
    },
    masterGoldSize: {
      type: Array,
      required: true,
      default: () => []
    }
  },

  watch: {
    modelValue: {
      handler(val) {
        this.getValue(val)
        // this.form = {
        //   id: val.id,
        //   wo: val.wo,
        //   woNumber: val.woNumber,

        //   mold: val.mold,
        //   requestDate: val.requestDate ? new Date(val.requestDate) : null,

        //   customerNumber: val.customerNumber,
        //   customerType: this.modelMasterCustomerType.find((x) => x.code === val.customerType),

        //   productName: val.productName,
        //   productNumber: val.productNumber,
        //   productType: this.modelMasterProductType.find((x) => x.code === val.productType),

        //   productQty: val.productQty,
        //   productQtyUnit: val.productQtyUnit,
        //   productDetail: val.productDetail,
        //   remark: val.remark,

        //   gold: this.modelMastergold.find((x) => x.nameEn === val.gold),
        //   goldSize: this.modelMasterGoldSize.find((x) => x.nameEn === val.goldSize)
        // }
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
    },
    modelMastergold() {
      return this.masterGold
    },
    modelMasterGoldSize() {
      return this.masterGoldSize
    }
  },

  data() {
    return {
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
    getValue(val) {
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
        remark: val.remark,

        gold: this.modelMastergold.find((x) => x.nameEn === val.gold),
        goldSize: this.modelMasterGoldSize.find((x) => x.nameEn === val.goldSize)
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
        confirmThenSubmit(
          `${this.form.wo}-${this.form.woNumber}`,
          `ยืนยันเเก้ไขแผนงานผลิต`,
          async () => {
            await this.submit()
          }
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
      const param = {
        take: 0,
        skip: 0,
        search: {
          text: e.query ?? null
        }
      }

      const res = await api.jewelry.post('Mold/SearchMold', param)
      if (res) {
        this.modelMold = res.data.map((x) => `${x.code}`)
      }
    },
    async onSearchCustomer(e) {
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
      }
    },
    async submit() {
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
        remark: this.form.remark ?? null,

        gold: this.form.gold ? this.form.gold.nameEn : null,
        goldSize: this.form.goldSize ? this.form.goldSize.nameEn : null
      }

      const res = await api.jewelry.post('ProductionPlan/ProductionPlanUpdateHeader', params)
      if (res) {
        success(``, ``, async () => {
          this.val = {
            ...interfaceIsValid
          }
          this.form = {
            ...interfaceForm
          }
          this.$emit('fetch')
        })
      }
    }
  },

  activated() {
    this.getValue(this.modelValue)
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
