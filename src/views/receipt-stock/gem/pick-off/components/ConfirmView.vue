<template>
  <div>
    <modal :showModal="isShowModal" @closeModal="closeModal" width="600px">
      <template v-slot:content>
        <div class="title-text-lg-bg">
          <span class="mr-2"><i class="bi bi-house-gear-fill"></i></span>
          <span>ยืนยันยืมวัถุดิบ</span>
        </div>
        <form @submit.prevent="onSubmit" class="p-2">
          <!-- type -->
          <div class="form-col-container">
            <div>
              <div>
                <span class="title-text">เลือกประเภทการยืม</span>
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
          </div>

          <div class="form-col-container mt-1">
            <!-- วันที่ยืม -->
            <div>
              <div>
                <span class="title-text">วันที่ยืม</span>
                <span class="txt-required"> *</span>
              </div>
              <Calendar
                class="w-100"
                :class="val.isRequestDate === true ? `p-invalid` : ``"
                v-model="form.requestDate"
                :max-date="form.returnDate"
                dateFormat="dd/mm/yy"
                showTime
                hourFormat="24"
                showIcon
                showButtonBar
              />
            </div>

            <!-- วันที่คืน -->
            <div>
              <div>
                <span class="title-text">วันที่คืน</span>
                <span class="txt-required"> *</span>
              </div>
              <Calendar
                class="w-100"
                :class="val.isReturnDate === true ? `p-invalid` : ``"
                v-model="form.returnDate"
                :min-date="form.requestDate"
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
                <span class="title-text">ผู้ยืม</span>
                <span class="txt-required"> *</span>
              </div>
              <AutoComplete
                v-model="form.operator"
                :suggestions="workerItemSearch"
                @complete="onSearchWorker"
                optionLabel="description"
                forceSelection
                :class="val.isOperator === true ? `p-invalid` : ``"
              >
                <template #option="slotProps">
                  <div class="flex align-options-center">
                    <div>{{ `${slotProps.option.code} - ${slotProps.option.nameTh}` }}</div>
                  </div>
                </template>
              </AutoComplete>
              <!-- <input
                type="text"
                class="form-control"
                v-model="form.operator"
                autocomplete="off"
                autocorrect="off"
                autocapitalize="off"
                spellcheck="false"
                required
              /> -->
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
                <span class="title-text">โปรดใส่รหัส* เพื่อทำรายการยืมวัถุดิบ</span>
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
            <div class="d-flex justify-content-end">
              <button class="btn btn-secondary" type="button" @click="closeModal">
                <span>ยกเลิก</span>
              </button>
              <button class="btn btn-main ml-2" type="submit">
                <span>ยืนยัน</span>
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

const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))

import AutoComplete from 'primevue/autocomplete'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'

import api from '@/axios/axios-helper.js'
import swAlert from '@/services/alert/sweetAlerts.js'
import { formatISOString } from '@/services/utils/dayjs'

const interfaceIsVal = {
  isType: false,
  isOperator: false,
  isRequestDate: false,
  isReturnDate: false
}

export default {
  components: {
    modal,
    Dropdown,
    Calendar,
    AutoComplete
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
      isLoading: false,
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
        console.log('confirm modelForm', this.form)
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
    // ----- event
    closeModal() {
      this.onClear()
      this.$emit('closeModal')
    },

    onSubmit() {
      console.log('onSubmit', this.form)

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
      //this.$emit('submit', this.form)
    },

    // ----- APIs
    async submit() {
      this.isLoading = true

      console.log(this.form.operator)
      try {
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
        console.log('confirm params', params)

        const res = await api.jewelry.post('ReceiptAndIssueStockGem/PickOffGem', params)
        if (res) {
          swAlert.success('', `เลขที่ใบยืมวัถุดิบ: ${res}`, () => {
            this.onClear()
            this.$emit('closeModal', 'confirm')
          })
        }
      } catch (error) {
        console.log('error', error)
      }
      this.isLoading = false
    },

    // ----- helper
    onClear() {
      //this.form = {}
      this.val = { ...interfaceIsVal }
    },

    async onSearchWorker(e) {
      try {
        //this.isLoading = true
        //console.log(this.formValue)
        const params = {
          take: 0,
          skip: 0,
          search: {
            text: e.query ?? null,
            //type: this.status,
            active: 1
          }
        }
        const res = await api.jewelry.post('Worker/Search', params, { skipLoading: true })
        if (res) {
          //console.log(res)
          //this.workerItemSearch = [...res.data]
          this.workerItemSearch = res.data.map((item) => {
            return {
              ...item,
              description: `${item.code} - ${item.nameTh}`
            }
          })
        }
        //this.isLoading = false
      } catch (error) {
        console.log(error)
        //this.isLoading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
