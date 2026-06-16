<template>
  <div>
    <modal :showModal="isShowModal" @closeModal="closeModal" width="600px">
      <template v-slot:content>
        <div class="title-text-lg-bg">
          <span class="mr-2"><i class="bi bi-house-gear-fill"></i></span>
          <span>{{ $t('view.receiptStock.gem.pickOff.confirmTitle') }}</span>
        </div>
        <form @submit.prevent="onSubmit" class="p-2">
          <!-- type -->
          <div class="form-col-container">
            <div>
              <div>
                <span class="title-text">{{ $t('view.receiptStock.gem.pickOff.selectType') }}</span>
                <span class="txt-required"> *</span>
              </div>
              <DropdownGeneric
                :modelValue="form.type"
                :options="masterType"
                optionLabel="description"
                optionValue="id"
                :class="val.isType === true ? `p-invalid` : ``"
                :showClear="form.type ? true : false"
                @update:modelValue="form.type = $event"
              />
            </div>
          </div>

          <div class="form-col-container mt-1">
            <!-- วันที่ยืม -->
            <div>
              <div>
                <span class="title-text">{{ $t('view.receiptStock.gem.pickOff.requestDate') }}</span>
                <span class="txt-required"> *</span>
              </div>
              <CalendarGeneric
                class="w-100"
                :class="val.isRequestDate === true ? `p-invalid` : ``"
                v-model="form.requestDate"
                :max-date="form.returnDate"
                dateFormat="dd/mm/yy"
                :showTime="true"
                hourFormat="24"
                :showIcon="true"
                :showButtonBar="true"
              />
            </div>

            <!-- วันที่คืน -->
            <div>
              <div>
                <span class="title-text">{{ $t('view.receiptStock.gem.pickOff.returnDate') }}</span>
                <span class="txt-required"> *</span>
              </div>
              <CalendarGeneric
                class="w-100"
                :class="val.isReturnDate === true ? `p-invalid` : ``"
                v-model="form.returnDate"
                :min-date="form.requestDate"
                dateFormat="dd/mm/yy"
                :showTime="true"
                hourFormat="24"
                :showIcon="true"
                :showButtonBar="true"
              />
            </div>
          </div>

          <!-- operator by -->
          <div class="form-col-container mt-1">
            <div>
              <div>
                <span class="title-text">{{ $t('view.receiptStock.gem.pickOff.operator') }}</span>
                <span class="txt-required"> *</span>
              </div>
              <AutoCompleteGeneric
                :modelValue="form.operator"
                :suggestions="workerItemSearch"
                @complete="onSearchWorker"
                optionLabel="description"
                :forceSelection="true"
                :class="val.isOperator === true ? 'p-invalid' : ''"
                @update:modelValue="form.operator = $event"
              >
                <template #option="{ option }">
                  <div>{{ `${option.code} - ${option.nameTh}` }}</div>
                </template>
              </AutoCompleteGeneric>
            </div>
          </div>

          <!-- remark -->
          <div class="form-col-container mt-1">
            <div>
              <div>
                <span class="title-text">{{ $t('common.field.remark') }}</span>
              </div>
              <InputTextGeneric
                v-model="form.remark"
                autocomplete="off"
              />
            </div>
          </div>

          <!-- pass to confirm -->
          <div class="form-col-container mt-3">
            <div>
              <div>
                <span class="title-text">{{ $t('view.receiptStock.gem.confirmPass') }}</span>
                <span class="txt-required"> *</span>
              </div>
              <input
                type="password"
                class="form-control"
                :style="[form.pass ? 'background-color: #b5dad4' : 'background-color:#dad4b5']"
                v-model="form.pass"
                autocomplete="off"
              />
            </div>
          </div>

          <!-- btn -->
          <div class="form-col-container mt-2">
            <div class="d-flex justify-content-end">
              <button class="btn btn-outline-main" type="button" @click="closeModal">
                <span>{{ $t('common.btn.cancel') }}</span>
              </button>
              <button class="btn btn-main ml-2" type="submit">
                <span>{{ $t('common.btn.confirm') }}</span>
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
import { success } from '@/services/alert/sweetAlerts.js'
import { formatISOString } from '@/services/utils/dayjs'
import api from '@/axios/axios-helper.js'

import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import AutoCompleteGeneric from '@/components/prime-vue/AutoCompleteGeneric.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

const interfaceIsVal = {
  isType: false,
  isOperator: false,
  isRequestDate: false,
  isReturnDate: false
}

export default {
  components: {
    modal,
    DropdownGeneric,
    CalendarGeneric,
    InputTextGeneric,
    AutoCompleteGeneric
  },
  props: {
    isShow: {
      type: Boolean,
      required: true,
      default: false
    },
    modelForm: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      isShowModal: this.isShow,
      form: null,
      val: { ...interfaceIsVal },
      masterType: [{ id: 5, description: 'ยืมออกคลัง' }],
      workerItemSearch: []
    }
  },
  watch: {
    isShow: {
      handler(val) {
        this.isShowModal = val
      },
      immediate: true
    },
    modelForm: {
      handler(val) {
        this.form = { ...val }
      },
      immediate: true,
      deep: true
    },
    'form.type'() {
      if (this.form.type) {
        this.val.isType = false
      }
    },
    'form.operator'() {
      if (this.form.operator) {
        this.val.isOperator = false
      }
    },
    'form.requestDate'() {
      if (this.form.requestDate) {
        this.val.isRequestDate = false
      }
    },
    'form.returnDate'() {
      if (this.form.returnDate) {
        this.val.isReturnDate = false
      }
    }
  },
  methods: {
    closeModal() {
      this.onClear()
      this.$emit('closeModal')
    },

    onSubmit() {
      if (!this.form.type) {
        this.val.isType = true
        return
      }
      if (!this.form.operator) {
        this.val.isOperator = true
        return
      }
      if (!this.form.requestDate) {
        this.val.isRequestDate = true
        return
      }
      if (!this.form.returnDate) {
        this.val.isReturnDate = true
        return
      }

      this.submit()
    },

    async submit() {
      const params = {
        type: this.form.type,
        operatorBy: this.form.operator.nameTh,
        remark: this.form.remark,
        pass: this.form.pass,
        requestDate: formatISOString(this.form.requestDate),
        returnDate: formatISOString(this.form.returnDate),
        gems: this.form.gems.map((gem) => {
          return {
            code: gem.code,
            issueQty: gem.issueQty,
            issueQtyWeight: gem.issueQtyWeight,
            remark: gem.remark
          }
        })
      }

      const res = await api.jewelry.post('ReceiptAndIssueStockGem/PickOffGem', params)
      if (res) {
        success(`${this.$t('view.receiptStock.gem.pickOff.successMsg')}: ${res}`, '', () => {
          this.onClear()
          this.$emit('closeModal', 'confirm')
        })
      }
    },

    onClear() {
      this.val = { ...interfaceIsVal }
    },

    async onSearchWorker(e) {
      const params = {
        take: 0,
        skip: 0,
        search: {
          text: e.query ?? null,
          active: 1
        }
      }
      const res = await api.jewelry.post('Worker/Search', params, { skipLoading: true })
      if (res) {
        this.workerItemSearch = res.data.map((item) => {
          return {
            ...item,
            description: `${item.code} - ${item.nameTh}`
          }
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
