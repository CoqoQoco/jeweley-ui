<template>
  <div class="form-container">
    <modal :showModal="isShow" @closeModal="closeModal" width="1000px">
      <template v-slot:content>
        <form @submit.prevent="onSubmit" class="form-content-container">
          <div class="mb-2">
            <span class="txt-title-modal">{{ $t('planUpdate.editHeader') }}</span>
          </div>
          <div class="form-content-row-container">
            <div>
              <span class="txt-title">{{ $t('planTracking.mold') }}</span>
              <div class="flex-group">
                <div class="w-25 txt-desc">{{ model.mold }}</div>
                <div class="mr-2"><i class="bi bi-arrow-right"></i></div>
                <AutoCompleteGeneric
                  :modelValue="form.mold"
                  :suggestions="modelMold"
                  optionLabel=""
                  placeholder="กรอกรหัสเเม่พิมพ์ ...."
                  :forceSelection="true"
                  :class="val.isValMold === true ? `p-invalid` : ``"
                  @complete="onSearchMold"
                  @update:modelValue="form.mold = $event"
                />
              </div>
            </div>
            <div>
              <span class="txt-title">{{ $t('planUpdate.requestDate') }}</span>
              <div class="flex-group">
                <div class="w-25 txt-desc">{{ formatDate(model.requestDate) }}</div>
                <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
                <CalendarGeneric
                  v-model="form.requestDate"
                  dateFormat="dd/mm/yy"
                  :showIcon="true"
                  :class="val.isValRequestDate === true ? `p-invalid` : ``"
                  class="w-100"
                />
              </div>
            </div>
          </div>
          <div class="form-content-row-container">
            <div>
              <span class="txt-title">{{ $t('planTracking.customerCode') }}</span>
              <div class="flex-group">
                <div class="w-25 txt-desc">{{ model.customerNumber }}</div>
                <div class="mr-2"><i class="bi bi-arrow-right"></i></div>
                <AutoCompleteGeneric
                  :modelValue="form.customerNumber"
                  :suggestions="modelCustomer"
                  optionLabel=""
                  placeholder="กรอกรหัสลูกค้า...."
                  :forceSelection="true"
                  :class="val.isValCustomerNumber === true ? `p-invalid` : ``"
                  @complete="onSearchCustomer"
                  @update:modelValue="form.customerNumber = $event"
                />
              </div>
            </div>
            <div>
              <span class="txt-title">{{ $t('planTracking.customerType') }}</span>
              <div class="flex-group">
                <div class="w-25 txt-desc">{{ model.customerTypeName }}</div>
                <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
                <DropdownGeneric
                  :modelValue="form.customerType"
                  :options="modelMasterCustomerType"
                  optionLabel="description"
                  :showClear="form.customerType ? true : false"
                  :class="val.isValCustomerType === true ? `p-invalid` : ``"
                  @update:modelValue="form.customerType = $event"
                />
              </div>
            </div>
          </div>
          <div class="form-content-row-container">
            <div>
              <span class="txt-title">{{ $t('planView.productName') }}</span>
              <InputTextGeneric v-model="form.productName" :required="true" />
            </div>
            <div>
              <span class="txt-title">{{ $t('planUpdate.productCode') }}</span>
              <InputTextGeneric v-model="form.productNumber" :required="true" />
            </div>
          </div>
          <div class="form-content-row-container">
            <div>
              <span class="txt-title">{{ $t('planTracking.productType') }}</span>
              <div class="flex-group">
                <div class="w-25 txt-desc">{{ model.productTypeName }}</div>
                <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
                <DropdownGeneric
                  :modelValue="form.productType"
                  :options="modelMasterProductType"
                  optionLabel="description"
                  :showClear="form.productType ? true : false"
                  :class="val.isValProductType === true ? `p-invalid` : ``"
                  @update:modelValue="form.productType = $event"
                />
              </div>
            </div>
            <div class="d-flex flex-columns">
              <div class="w-50 mr-2">
                <div>
                  <span class="txt-title">{{ $t('planUpdate.productQty') }}</span>
                  <InputTextGeneric v-model.number="form.productQty" type="number" :min="1" :required="true" />
                </div>
              </div>
              <div class="w-50">
                <div>
                  <span class="txt-title">{{ $t('planView.unitLabel') }}</span>
                  <InputTextGeneric v-model="form.productQtyUnit" :required="true" />
                </div>
              </div>
            </div>
          </div>
          <div class="form-content-row-container">
            <div>
              <span class="txt-title">{{ $t('planView.productDetail') }}</span>
              <TextareaGeneric v-model="form.productDetail" :rows="4" :required="true" />
            </div>
            <div>
              <span class="txt-title">{{ $t('common.field.remark') }}</span>
              <TextareaGeneric v-model="form.remark" :rows="4" />
            </div>
          </div>
          <div class="d-flex justify-content-center mt-3">
            <ButtonGeneric variant="outline" :label="$t('common.btn.cancel')" class="mr-2" type="button" @click="closeModal" />
            <ButtonGeneric variant="main" :label="$t('planUpdate.confirmEditHeader')" type="submit" />
          </div>
        </form>
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { success } from '@/services/alert/sweetAlerts.js'
import { formatDate, formatISOString } from '@/services/utils/dayjs'

import api from '@/axios/axios-helper.js'

import AutoCompleteGeneric from '@/components/prime-vue/AutoCompleteGeneric.vue'
import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import TextareaGeneric from '@/components/generic/TextareaGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

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
  productDetail: null,
  remark: null
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
    TextareaGeneric,
    ButtonGeneric
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
      form: { ...interfaceForm },
      val: { ...interfaceIsValid },
      modelMold: [],
      modelCustomer: []
    }
  },
  methods: {
    formatDate(date) {
      return date ? formatDate(date) : ''
    },

    getValue() {
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
      this.val = { ...interfaceIsValid }
      this.$emit('closeModal')
    },
    onSubmit() {
      if (this.validateForm()) {
        confirmThenSubmit(
          `${this.model.wo}-${this.model.woNumber}`,
          this.$t('planUpdate.confirmEditHeader'),
          async () => {
            await this.submit()
          }
        )
      }
    },
    validateForm() {
      if (!this.form.mold) {
        this.val = { isValMold: true }
        return false
      }
      if (!this.form.requestDate) {
        this.val = { isValRequestDate: true }
        return false
      }
      if (!this.form.customerType) {
        this.val = { isValCustomerType: true }
        return false
      }
      if (!this.form.productType) {
        this.val = { isValProductType: true }
        return false
      }
      if (!this.form.customerNumber) {
        this.val = { isValCustomerNumber: true }
        return false
      }
      return true
    },

    async onSearchMold(e) {
      const param = {
        take: 0,
        skip: 0,
        search: { text: e.query ?? null }
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
        search: { text: e.query ?? null }
      }
      const res = await api.jewelry.post('Customer/SearchCustomer', param)
      if (res) {
        this.modelCustomer = res.data.map((x) => `${x.code}`)
      }
    },
    async submit() {
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
      const res = await api.jewelry.post('ProductionPlan/ProductionPlanUpdateHeader', params)
      if (res) {
        success(
          ``,
          ``,
          async () => {
            this.form.requestDate = null
            this.form.customerType = null
            this.form.productType = null
            this.val = { ...interfaceIsValid }
            this.form = { ...interfaceForm }
            this.$emit('fetch')
          }
        )
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.form-content-container {
  padding: var(--sp-xl);
  overflow: auto;
  height: 470px;
}
.form-content-row-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-xl);
  padding: 0 var(--sp-xl);
  margin-bottom: var(--sp-lg);
}
.flex-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.txt-title-modal {
  padding: var(--sp-xl);
  font-size: var(--fs-xl);
  color: var(--base-font-color);
}
.txt-title {
  font-size: var(--fs-sm);
}
.txt-desc {
  font-size: var(--fs-lg);
  color: var(--base-font-color);
}
</style>
