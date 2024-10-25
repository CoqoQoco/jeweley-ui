<template>
  <div>
    <loading :isLoading="isLoading"></loading>
    <modal :showModal="isShowModal" @closeModal="closeModal" width="600px">
      <template v-slot:content>
        <div class="title-text-lg mb-2">
          <span class="mr-2"><i class="bi bi-house-add-fill"></i></span>
          <span>ยืนยันคืนเข้าคลังเเละเบิกออกคลัง วัถุดิบ</span>
        </div>
        <form @submit.prevent="onSubmit">
          <!-- type && request date -->
          <div class="form-col-container">
            <div>
              <div>
                <span class="title-text">เลือกประเภท</span>
                <span class="txt-required"> *</span>
              </div>
              <Dropdown
                v-model="form.type"
                :options="masterType"
                optionLabel="description"
                optionValue="id"
                class="w-full md:w-14rem"
                :class="val.isType === true ? `p-invalid` : ``"
                :showClear="form.type ? true : false"
              />
            </div>
            <div>
              <div>
                <span class="title-text">วันที่</span>
                <span class="txt-required"> *</span>
              </div>
              <Calendar
                class="w-100"
                :class="val.isRequestDate === true ? `p-invalid` : ``"
                v-model="form.requestDate"
                dateFormat="dd/mm/yy"
                showTime
                hourFormat="24"
                showIcon
                showButtonBar
              />
            </div>
          </div>

          <!-- operator by -->
          <div class="form-col-container mt-1">
            <div>
              <div>
                <span class="title-text">ผู้คืน/ผู้เบิก</span>
                <span class="txt-required"> *</span>
              </div>
              <input
                type="text"
                class="form-control"
                v-model="form.operator"
                autocomplete="off"
                autocorrect="off"
                autocapitalize="off"
                spellcheck="false"
                required
              />
            </div>
          </div>

          <!-- remark -->
          <div class="form-col-container mt-1">
            <div>
              <div>
                <span class="title-text">รายละเอียดเพิ่มเติม</span>
                <!-- <span class="txt-required"> *</span> -->
              </div>
              <input
                type="text"
                class="form-control"
                v-model="form.remark"
                autocomplete="off"
                autocorrect="off"
                autocapitalize="off"
                spellcheck="false"
              />
            </div>
          </div>

          <!-- pass to confirm -->
          <div class="form-col-container mt-3">
            <div>
              <div>
                <span class="title-text">โปรดใส่รหัส* เพื่อทำรายการคืนเข้าคลังเเละเบิกออกคลัง</span>
                <span class="txt-required"> *</span>
              </div>
              <input
                type="password"
                class="form-control"
                :style="[form.pass ? 'background-color: #b5dad4' : ' background-color:#dad4b5']"
                v-model="form.pass"
                autocomplete="off"
                autocorrect="off"
                autocapitalize="off"
                spellcheck="false"
              />
            </div>
          </div>

          <!-- btn -->
          <div class="form-col-container mt-2">
            <div class="d-flex justify-content-between">
              <div class="check-return-container">
                <Checkbox v-model="form.isClosePickReturn" :binary="true" />
                <span for="ingredient1" class="ml-2">รายการคืนเข้าคลัง [ปิดใบยืม]</span>
              </div>
              <div>
                <button class="btn btn-secondary" type="button" @click="closeModal">
                  <span>ยกเลิก</span>
                </button>
                <button class="btn btn-main ml-2" type="submit">
                  <span>ยืนยัน</span>
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

const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))
const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))

import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import Checkbox from 'primevue/checkbox'

import api from '@/axios/axios-config.js'
import swAlert from '@/services/alert/sweetAlerts.js'
import { formatISOString } from '@/services/utils/dayjs'

const interfaceIsVal = {
  isType: false,
  isRequestDate: false
}

export default {
  components: {
    modal,
    loading,
    Dropdown,
    Calendar,
    Checkbox
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
      isLoading: false,
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
        //console.log('confirm modelForm', val)
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
    // ----- event
    closeModal() {
      //this.onClear()
      this.$emit('closeModal')
    },

    onSubmit() {
      console.log('onSubmit', this.form)

      if (!this.form.type) {
        this.val.isType = true
        return
      }
      if (!this.form.requestDate) {
        this.val.isRequestDate = true
        return
      }

      this.submit()
      //this.$emit('submit', this.form)
    },

    // ----- APIs
    async submit() {
      this.isLoading = true
      try {
        console.log('this.form', this.form)
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
                      //remove outbumd when isAlreadyOutbound === true
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
        console.log('confirm params', params)

        const res = await api.jewelry.post('ReceiptAndIssueStockGem/PickReturnGem', params)
        if (res) {
          swAlert.success(
            `เลขที่ใบคืนวัถุดิบ: ${res.runningPickReturn ?? '---'}
            </br>
            เลขที่ใบเบิกวัถุดิบ: ${res.runningPickOutbound ?? '---'}`,
            '',
            () => {
              this.onClear()
              this.$emit('closeModal', 'confirm')
            }
          )
        }
      } catch (error) {
        console.log('error', error)
      }
      this.isLoading = false
    },

    // ----- helper
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
