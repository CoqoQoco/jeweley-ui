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
              <div>
                <span class="title-text">{{ $t('production.planTracking.mold') }}</span>
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
              <div>
                <span class="title-text">{{ $t('production.planTracking.colRequestDate') }}</span>
                <CalendarGeneric
                  v-model="form.requestDate"
                  dateFormat="dd/mm/yy"
                  :showIcon="true"
                  :class="val.isValRequestDate === true ? `p-invalid` : ``"
                />
              </div>
              <div>
                <span class="title-text">{{ $t('production.planTracking.customerCode') }}</span>
                <AutoCompleteGeneric
                  v-model="form.customerNumber"
                  :suggestions="modelCustomer"
                  @complete="onSearchCustomer"
                  placeholder="กรอกรหัสลูกค้า...."
                  :class="val.isValCustomerNumber === true ? `p-invalid` : ``"
                  :forceSelection="true"
                />
              </div>

              <div>
                <span class="title-text">{{ $t('production.planTracking.customerType') }}</span>
                <DropdownGeneric
                  :modelValue="form.customerType"
                  :options="modelMasterCustomerType"
                  optionLabel="description"
                  :class="val.isValCustomerType === true ? `p-invalid` : ``"
                  :showClear="form.customerType ? true : false"
                  @update:modelValue="form.customerType = $event"
                />
              </div>
            </div>

            <div class="line-main mt-4"></div>

            <div class="form-col-container mt-3">
              <div>
                <span class="title-text">{{ $t('production.planView.productName') }}</span>
                <input type="text" class="form-control" v-model="form.productName" required />
              </div>

              <div>
                <span class="title-text">{{ $t('production.planTracking.colProductCode') }}</span>
                <input type="text" class="form-control" v-model="form.productNumber" required />
              </div>

              <div>
                <span class="title-text">{{ $t('production.planTracking.productType') }}</span>
                <DropdownGeneric
                  :modelValue="form.productType"
                  :options="modelMasterProductType"
                  optionLabel="description"
                  :class="val.isValProductType === true ? `p-invalid` : ``"
                  :showClear="form.productType ? true : false"
                  @update:modelValue="form.productType = $event"
                />
              </div>
            </div>
            <div class="form-col-container filter-container-highlight mt-2 p-2">
              <div class="form-col-sm-container pl-2">
                <div>
                  <span class="title-text-white">{{ $t('production.planTracking.colProductQty') }}</span>
                  <input
                    type="number"
                    min="1"
                    class="form-control"
                    :class="form.productQty ? 'input-filled' : 'input-empty'"
                    v-model="form.productQty"
                    required
                  />
                </div>

                <div>
                  <span class="title-text-white">{{ $t('production.planView.unitLabel') }}</span>
                  <input
                    type="text"
                    class="form-control"
                    :class="form.productQtyUnit ? 'input-filled' : 'input-empty'"
                    v-model="form.productQtyUnit"
                    required
                  />
                </div>
              </div>

              <div></div>
              <div></div>
            </div>
            <div class="form-col-container mt-2">
              <div>
                <span class="title-text">{{ $t('production.planView.productDetail') }}</span>
                <textarea
                  class="form-control textarea-sm"
                  v-model="form.productDetail"
                  required
                >
                </textarea>
              </div>
            </div>

            <div class="form-col-container mt-2">
              <div>
                <span class="title-text">{{ $t('production.planTracking.goldColor') }}</span>
                <DropdownGeneric
                  :modelValue="form.gold"
                  :options="modelMastergold"
                  optionLabel="description"
                  :placeholder="$t('production.planView.selectGold')"
                  @update:modelValue="form.gold = $event"
                />
              </div>
              <div>
                <span class="title-text">{{ $t('production.planTracking.goldType') }}</span>
                <DropdownGeneric
                  :modelValue="form.goldSize"
                  :options="modelMasterGoldSize"
                  optionLabel="description"
                  :placeholder="$t('production.planView.selectGoldPercent')"
                  @update:modelValue="form.goldSize = $event"
                />
              </div>
              <div></div>
            </div>

            <div class="line-main mt-4"></div>

            <div class="form-col-container mt-3">
              <div>
                <span class="title-text">{{ $t('common.field.remark') }}</span>
                <textarea class="form-control textarea-sm" v-model="form.remark">
                </textarea>
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

import moment from 'dayjs'
import api from '@/axios/axios-helper.js'
import { confirmSubmit, success } from '@/services/alert/sweetAlerts.js'
import { formatDate, formatDateTime, formatISOString } from '@/services/utils/dayjs'

import AutoCompleteGeneric from '@/components/prime-vue/AutoCompleteGeneric.vue'
import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

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
    DropdownGeneric
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
      //console.log('get')
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
        confirmSubmit(
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
          this.form.requestDate = null
          this.form.customerType = null
          this.form.productType = null

          this.val = { ...interfaceIsValid }
          this.form = { ...interfaceForm }
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

.input-filled {
  background-color: #b5dad4;
}

.input-empty {
  background-color: #dad4b5;
}

.textarea-sm {
  height: 50px;
}
</style>
