<template>
  <div>
    <modal :showModal="isShowModal" @closeModal="closeModal" width="600px">
      <template v-slot:content>
        <div class="title-text-lg-bg">
          <span class="mr-2"><i class="bi bi-house-exclamation"></i></span>
          <span>{{ $t('view.receiptStock.gem.pickReturnAndOutbound.confirmTitle') }}</span>
        </div>
        <form @submit.prevent="onSubmit" class="p-2">
          <!-- type && request date -->
          <div class="form-col-container">
            <div>
              <div>
                <span class="title-text">{{ $t('view.receiptStock.gem.pickReturnAndOutbound.selectType') }}</span>
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
            <div>
              <div>
                <span class="title-text">{{ $t('view.receiptStock.gem.pickReturnAndOutbound.requestDate') }}</span>
                <span class="txt-required"> *</span>
              </div>
              <CalendarGeneric
                class="w-100"
                :class="val.isRequestDate === true ? `p-invalid` : ``"
                v-model="form.requestDate"
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
                <span class="title-text">{{ $t('view.receiptStock.gem.pickReturnAndOutbound.operator') }}</span>
                <span class="txt-required"> *</span>
              </div>
              <InputTextGeneric
                v-model="form.operator"
                autocomplete="off"
                :required="true"
              />
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
            <div class="d-flex justify-content-between">
              <div class="check-return-container">
                <CheckboxGeneric v-model="form.isClosePickReturn" :binary="true" />
                <span class="ml-2">{{ $t('view.receiptStock.gem.pickReturnAndOutbound.closePickReturn') }}</span>
              </div>
              <div>
                <button class="btn btn-outline-main" type="button" @click="closeModal">
                  <span>{{ $t('common.btn.cancel') }}</span>
                </button>
                <button class="btn btn-main ml-2" type="submit">
                  <span>{{ $t('common.btn.confirm') }}</span>
                </button>
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
import { success } from '@/services/alert/sweetAlerts.js'
import { formatISOString } from '@/services/utils/dayjs'
import api from '@/axios/axios-helper.js'

import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import CheckboxGeneric from '@/components/prime-vue/CheckboxGeneric.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

const interfaceIsVal = {
  isType: false,
  isRequestDate: false
}

export default {
  components: {
    modal,
    DropdownGeneric,
    CalendarGeneric,
    InputTextGeneric,
    CheckboxGeneric
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
    },
    modelReferenceRunning: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      isShowModal: this.isShow,
      form: {},
      val: { ...interfaceIsVal },
      masterType: [{ id: 6, description: 'คืนเข้าคลังเเละเบิกออกคลัง' }]
    }
  },
  computed: {
    referenceRunning() {
      return this.modelReferenceRunning
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
        this.form = {
          requestDate: new Date(),
          gemsReturn: [...val]
        }
      },
      immediate: true,
      deep: true
    },
    'form.type'() {
      if (this.form.type) {
        this.val.isType = false
      }
    },
    'form.requestDate'() {
      if (this.form.requestDate) {
        this.val.isRequestDate = false
      }
    }
  },
  methods: {
    closeModal() {
      this.$emit('closeModal')
    },

    onSubmit() {
      if (!this.form.type) {
        this.val.isType = true
        return
      }
      if (!this.form.requestDate) {
        this.val.isRequestDate = true
        return
      }

      this.submit()
    },

    async submit() {
      const params = {
        pickOffRunning: this.referenceRunning,
        type: this.form.type,
        operatorBy: this.form.operator,
        remark: this.form.remark,
        pass: this.form.pass,
        requestDate: formatISOString(this.form.requestDate),
        isFullReturn: this.form.isClosePickReturn,
        gemsReturn: this.form.gemsReturn.map((gem) => {
          return {
            code: gem.code,
            pickOffQty: gem.pickOffQty,
            pickOffQtyWeight: gem.pickOffQtyWeight,
            returnQty: gem.returnQty,
            returnQtyWeight: gem.returnQtyWeight,
            gemsOutbound: gem.gemsOutbound
              ? gem.gemsOutbound
                  .filter((x) => !x.isAlreadyOutbound)
                  .map((outbound) => {
                    return {
                      wo: outbound.productionPlan.wo,
                      woNumber: outbound.productionPlan.woNumber,
                      mold: outbound.productionPlan.mold,
                      issueQty: outbound.issueQty,
                      issueQtyWeight: outbound.issueQtyWeight,
                      remark: outbound.remark
                    }
                  })
              : null
          }
        })
      }

      const res = await api.jewelry.post('ReceiptAndIssueStockGem/PickReturnGem', params)
      if (res) {
        success(
          `${this.$t('view.receiptStock.gem.pickReturnAndOutbound.successPickReturn')}: ${res.runningPickReturn ?? '---'}
          </br>
          ${this.$t('view.receiptStock.gem.pickReturnAndOutbound.successPickOutbound')}: ${res.runningPickOutbound ?? '---'}`,
          '',
          () => {
            this.onClear()
            this.$emit('closeModal', 'confirm')
          }
        )
      }
    },

    onClear() {
      this.form = {}
      this.val = { ...interfaceIsVal }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
.check-return-container {
  display: flex;
  align-items: center;
}
</style>
