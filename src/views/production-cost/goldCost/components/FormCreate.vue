<template>
  <div class="form-container">
    <loading :isLoading="isLoading"></loading>
    <modal :showModal="isShow" @closeModal="closeModal" width="1000px">
      <template v-slot:content>
        <form @submit.prevent="onSubmit" class="form-content-container-custom">
          <div class="mb-3">
            <span class="txt-title-modal">เพิ่มข้อมูลผสมทอง</span>
          </div>
          <div class="form-content-row-four-columns-container mb-2">
            <div>
              <span class="txt-title">
                <span>เล่มที่</span>
                <span class="txt-required"> *</span>
              </span>
              <input type="text" class="form-control" v-model="form.bookNo" required />
            </div>
            <div>
              <span class="txt-title">
                <span>เลขที่</span>
                <span class="txt-required"> *</span>
              </span>
              <input type="text" class="form-control" v-model="form.no" required />
            </div>
            <div>
              <span class="txt-title">
                <span>วันที่เบิก</span>
                <span class="txt-required"> *</span>
              </span>
              <Calendar
                class="w-100"
                :class="val.isValAssignDate === true ? `p-invalid` : ``"
                v-model="form.assignDate"
                dateFormat="dd/mm/yy"
                showIcon
                showButtonBar
              />
            </div>
          </div>
          <div class="form-content-row-four-columns-container mb-2">
            <div>
              <span class="txt-title">
                <span>ประเภททอง</span>
                <span class="txt-required"> *</span>
              </span>
              <Dropdown
                v-model="form.gold"
                :options="masterGold"
                optionLabel="description"
                class="w-full md:w-14rem"
                :class="val.isValGold === true ? `p-invalid` : ``"
                :showClear="form.gold?.code ? true : false"
              />
            </div>
            <div>
              <span class="txt-title">
                <span>เปอร์เซ็นทอง</span>
                <span class="txt-required"> *</span>
              </span>
              <Dropdown
                v-model="form.goldSize"
                :options="masterGoldSize"
                optionLabel="description"
                class="w-full md:w-14rem"
                :class="val.isValGoldSize === true ? `p-invalid` : ``"
                :showClear="form.goldSize?.code ? true : false"
              />
            </div>
          </div>
          <div class="form-content-row-one-columns-container">
            <div>
              <span class="txt-title">
                <span>สูตรผสมทอง</span>
                <span class="txt-required"> *</span>
              </span>
              <input type="text" class="form-control" v-model="form.goldReceipt" required />
            </div>
          </div>
          <div class="txt-title-part mt-2">
            <span>เบิกทองหลอม (โปรดระบุน้ำหนัก)</span>
          </div>
          <div class="form-content-row-four-columns-container">
            <div>
              <span class="txt-title">
                <span>วันที่เบิกหลอม</span>
                <!-- <span class="txt-required"> *</span> -->
              </span>
              <Calendar
                class="w-100"
                :class="val.isValMeltDate === true ? `p-invalid` : ``"
                v-model="form.meltDate"
                dateFormat="dd/mm/yy"
                showIcon
                showButtonBar
              />
            </div>
            <div>
              <span class="txt-title">
                <span>เบิกทองหลอม</span>
              </span>
              <input type="number" min="0" class="form-control" v-model="form.meltWeight" />
            </div>
            <div>
              <span class="txt-title">
                <span>คืนทองหลอม</span>
              </span>
              <input type="number" min="0" class="form-control" v-model="form.returnMeltWeight" />
            </div>
            <div>
              <span class="txt-title">
                <span>คืนขี้เบ้า</span>
              </span>
              <input
                type="number"
                min="0"
                class="form-control"
                v-model="form.returnMeltScrapWeight"
              />
            </div>
          </div>
          <div class="form-content-row-four-columns-container">
            <div>
              <span class="txt-title">
                <span>น้ำหนักขาด</span>
              </span>
              <input
                type="number"
                min="0"
                class="form-control"
                v-model="form.meltWeightLoss"
                :disabled="form.meltWeightOver > 0"
              />
            </div>
            <div>
              <span class="txt-title">
                <span>น้้ำหนักเกิน</span>
              </span>
              <input
                type="number"
                min="0"
                class="form-control"
                v-model="form.meltWeightOver"
                :disabled="form.meltWeightLoss > 0"
              />
            </div>
          </div>

          <div class="txt-title-part mt-2">
            <span>เบิกทองหล่อ (โปรดระบุน้ำหนัก)</span>
          </div>
          <div class="form-content-row-four-columns-container">
            <div>
              <span class="txt-title">
                <span>วันที่เบิกหล่อ</span>
                <!-- <span class="txt-required"> *</span> -->
              </span>
              <Calendar
                class="w-100"
                :class="val.isValCastDate === true ? `p-invalid` : ``"
                v-model="form.castDate"
                dateFormat="dd/mm/yy"
                showIcon
                showButtonBar
              />
            </div>
            <div>
              <span class="txt-title">
                <span>เบิกทองหล่อ</span>
              </span>
              <input type="number" min="0" class="form-control" v-model="form.castWeight" />
            </div>
            <div>
              <span class="txt-title">
                <span>เบิกพลอยเพชร</span>
              </span>
              <input type="number" min="0" class="form-control" v-model="form.gemWeight" />
            </div>
          </div>
          <div class="form-content-row-four-columns-container">
            <div>
              <span class="txt-title">
                <span>คืนทองหล่อ</span>
              </span>
              <input type="number" min="0" class="form-control" v-model="form.returnCastWeight" />
            </div>
            <div>
              <span class="txt-title">
                <span>คืนตัวเรือน</span>
              </span>
              <input
                type="number"
                min="0"
                class="form-control"
                v-model="form.returnCastBodyWeight"
              />
            </div>
            <div>
              <span class="txt-title">
                <span>คืนขี้เบ้า</span>
              </span>
              <input
                type="number"
                min="0"
                class="form-control"
                v-model="form.returnCastScrapWeight"
              />
            </div>
            <div>
              <span class="txt-title">
                <span>คืนผงทอง</span>
              </span>
              <input
                type="number"
                min="0"
                class="form-control"
                v-model="form.returnCastPowderWeight"
              />
            </div>
          </div>
          <div class="form-content-row-four-columns-container">
            <div>
              <span class="txt-title">
                <span>น้ำหนักขาด</span>
              </span>
              <input
                type="number"
                min="0"
                class="form-control"
                v-model="form.castWeightLoss"
                :disabled="form.castWeightOver > 0"
              />
            </div>
            <div>
              <span class="txt-title">
                <span>น้้ำหนักเกิน</span>
              </span>
              <input
                type="number"
                min="0"
                class="form-control"
                v-model="form.castWeightOver"
                :disabled="form.castWeightLoss > 0"
              />
            </div>
          </div>

          <div class="txt-title-part mt-2">
            <span>รายละเอียดอื่นๆ</span>
          </div>
          <div class="form-content-row-one-columns-container">
            <div>
              <!-- <span class="txt-title">
                <span>สูตรผสมทอง</span>
                <span class="txt-required"> *</span>
              </span> -->
              <textarea class="form-control" v-model="form.remark"></textarea>
            </div>
          </div>

          <div class="form-content-row-two-columns-container mt-3">
            <div>
              <span class="txt-title-part-custom">
                <span>ชื่อผู้เบิกทอง</span>
              </span>
              <input type="text" class="form-control" v-model="form.assignBy" />
            </div>
            <div>
              <span class="txt-title-part-custom">
                <span>ชื่อผู้รับทอง</span>
              </span>
              <input type="text" class="form-control" v-model="form.receiveBy" />
            </div>
          </div>

          <div class="d-flex justify-content-center mt-3">
            <button class="btn btn-sm btn-dark btn-custom mr-2" type="button" @click="closeModal">
              ยกเลิกเพิ่มข้อมูลผสมทอง
            </button>
            <button class="btn btn-sm btn-warning btn-custom" type="submit">
              ยืนยันเพิ่มข้อมูลผสมทอง
            </button>
          </div>
        </form>
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))
const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))

import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
//import DataTable from 'primevue/datatable'
//import Column from 'primevue/column'

import api from '@/axios/axios-config.js'
import swAlert from '@/services/alert/sweetAlerts.js'
import { formatDate, formatISOString } from '@/services/utils/dayjs'

const interfaceForm = {
  bookNo: null,
  no: null,
  assignDate: new Date(),
  gold: null,
  goldSize: null,
  goldReceipt: null,
  meltDate: null,
  meltWeight: null,
  returnMeltWeight: null,
  returnMeltScrapWeight: null,
  meltWeightLoss: null,
  meltWeightOver: null,
  castWeight: null,
  gemWeight: null,
  returnCastWeight: null,
  returnCastBodyWeight: null,
  returnCastScrapWeight: null,
  returnCastPowderWeight: null,
  castWeightLoss: null,
  castWeightOver: null,
  remark: null,
  assignBy: null,
  receiveBy: null
  //data: []
}
const interfaceIsValid = {
  isValAssignDate: false,
  isValMeltDate: false,
  isValCastDate: false,
  isValGold: false,
  isValGoldSize: false
}
export default {
  components: {
    modal,
    loading,
    Dropdown,
    Calendar
    //DataTable,
    //Column
  },
  props: {
    isShow: {
      type: Boolean,
      default: false
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
    'form.assignDate'() {
      if (this.form.assignDate) {
        this.val.isValAssignDate = false
      }
    },
    'form.gold'() {
      if (this.form.gold) {
        this.val.isValGold = false
      }
    },
    'form.goldSize'() {
      if (this.form.goldSize) {
        this.val.isValGoldSize = false
      }
    }
    // 'form.meltDate'() {
    //   if (this.form.meltDate) {
    //     this.val.isValMeltDate = false
    //   }
    // }
  },
  data() {
    return {
      // --- flag --- //
      isLoading: false,
      autoId: 0,

      // ---- form ------ //
      form: {
        ...interfaceForm
      },
      val: {
        ...interfaceIsValid
      },

      // ----- table -------- //
      editingRows: []
    }
  },
  methods: {
    // --- controller --- //
    closeModal() {
      this.form = {
        ...interfaceForm
      }
      this.val = {
        ...interfaceIsValid
      }
      this.$emit('closeModal')
    },
    onSubmit() {
      if (this.validateForm()) {
        swAlert.confirmSubmit(
          `เลขที่:${this.form.no} | เล่มที่:${this.form.bookNo} `,
          'ยืนยันเพิ่มใบเบิกทอง',
          async () => {
            await this.submit()
          },
          null,
          null
        )
      }
    },
    validateForm() {
      if (!this.form.assignDate) {
        this.val = {
          isValAssignDate: true
        }
        return false
      }
      // if (!this.form.meltDate) {
      //   this.val = {
      //     isValMeltDate: true
      //   }
      //   return false
      // }
      if (!this.form.gold) {
        this.val = {
          isValGold: true
        }
        return false
      }
      if (!this.form.goldSize) {
        this.val = {
          isValGoldSize: true
        }
        return false
      }

      return true
    },

    // ----------- Grid -------------------//
    onRowEditSave(event) {
      let { newData, index } = event
      this.form.data[index] = newData
    },
    addDetail() {
      const add = {
        id: ++this.autoId,
        data: new Date(),
        detail: null
      }
      this.form.data.push(add)
    },

    // ------ helper ----- //
    formatDate(date) {
      return date ? formatDate(date) : ''
    },

    // --- APIs --- //
    async submit() {
      try {
        this.isLoading = true
        //console.log(this.form)

        const params = {
          ...this.form,
          goldCode: this.form.gold.code,
          goldSizeCode: this.form.goldSize.code,
          assignDateFormat: this.form.assignDate ? formatISOString(this.form.assignDate) : null,
          meltDateFormat: this.form.meltDate ? formatISOString(this.form.meltDate) : null,
          castDateFormat: this.form.castDate ? formatISOString(this.form.castDate) : null
        }
        console.log(params)

        const res = await api.jewelry.post('ProductionPlanCost/CreateGoldCost', params)
        if (res) {
          //this.isResetImage = !this.isResetImage
          swAlert.success(
            null,
            null,
            () => {
              this.form = {
                ...interfaceForm
              }
              this.val = {
                ...interfaceIsValid
              }
              this.$emit('fetch')
            },
            null,
            null
          )
          //this.onClearVal()
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
@import '@/assets/scss/custom-style/form-modal.scss';

.form-content-container-custom {
  padding: 20px 20px;
  overflow: auto;
}
.form-content-custom-columns-container {
  display: grid;
  grid-template-columns: 1fr 1fr 4fr;
  gap: 10px;
  padding: 0px 30px;
  margin-top: 5px;
}
.txt-title-part-custom {
  //padding-left: 30px;
  padding-top: 10px;
  font-size: 14px;
  color: var(--base-font-color);
}
</style>
