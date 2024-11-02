<template>
  <div>
    <loading :isLoading="isLoading"></loading>
    <modal :showModal="isShowModal" @closeModal="closeModal">
      <template v-slot:content>
        <div class="title-text-lg-header mb-2">
          <span>หลอมงาน</span>
          <span class="bi bi-arrow-right ml-1"></span>
          <span class="ml-1">{{ `: ใบจ่าย-รับคืนงาน เลขที่: ${model.wo}-${model.woNumber}` }}</span>
        </div>
        <form @submit.prevent="onSubmit">
          <div class="form-col-container">
            <!-- date -->
            <div>
              <span class="title-text">วันที่หลอม</span>
              <Calendar
                class="w-100"
                :class="val.isValReceiveDate === true ? `p-invalid` : ``"
                v-model="form.receiveDate"
                dateFormat="dd/mm/yy"
                showIcon
                showTime
                hourFormat="24"
                showButtonBar
              />
            </div>

            <!-- name -->
            <div>
              <span class="title-text">ลงชื่อผู้รับหลอม</span>
              <input
                type="text"
                class="form-control custom-input"
                v-model="form.receiveBy"
                required
              />
            </div>

            <div></div>
            <div></div>
          </div>

          <div class="line mt-3"></div>

          <div class="form-col-container mt-3">
            <!-- gold -->
            <DataTable
              class="p-datatable-sm"
              showGridlines
              dataKey="id"
              ref="dt"
              resizableColumns
              scrollable
              stripedRows
              columnResizeMode="fit"
              v-model:editingRows="editingRows"
              :value="matAssign"
              editMode="row"
              @row-edit-save="onRowEditSave"
              :pt="{
                table: { style: 'min-width: 50rem' },
                column: {
                  bodycell: ({ state }) => ({
                    style: state['d_editing'] && 'padding-top: 0.6rem; padding-bottom: 0.6rem'
                  })
                }
              }"
            >
              <Column style="width: 30px">
                <template #body="prop">
                  <button class="btn btn-sm btn-red text-center" @click="onDelGold(prop.data)">
                    <i class="bi bi-trash-fill"></i>
                  </button>
                </template>
              </Column>

              <Column field="gold" header="ทอง" style="min-width: 80px">
                <template #editor="{ data, field }">
                  <Dropdown
                    v-model="data[field]"
                    :options="masterGold"
                    optionLabel="code"
                    optionValue="code"
                    class="w-full md:w-14rem"
                    placeholder="เลือกทอง"
                  >
                  </Dropdown>
                </template>
              </Column>
              <Column field="requestDate" header="วันที่" style="min-width: 210px">
                <template #editor="{ data, field }">
                  <div>
                    <Calendar
                      class="w-100"
                      v-model="data[field]"
                      dateFormat="dd/mm/yy"
                      showIcon
                      showTime
                      hourFormat="24"
                      showButtonBar
                    />
                  </div>
                </template>
                <template #body="slotProps">
                  <div v-if="slotProps.data.requestDate">
                    {{ formatDateTime(slotProps.data.requestDate) }}
                  </div>
                </template>
              </Column>
              <Column field="goldQTYSend" header="จำนวน" style="min-width: 100px">
                <template #editor="{ data, field }">
                  <input
                    type="number"
                    :class="data[field] ? `` : `-`"
                    class="form-control"
                    v-model="data[field]"
                  />
                </template>
              </Column>
              <Column field="goldWeightSend" header="น้ำหนัก" style="min-width: 100px">
                <template #editor="{ data, field }">
                  <input
                    type="number"
                    step="any"
                    :class="data[field] ? `` : `-`"
                    class="form-control"
                    v-model="data[field]"
                  />
                </template>
              </Column>
              <Column field="description" header="รายละเอียด" style="min-width: 120px">
                <template #editor="{ data, field }">
                  <input
                    type="text"
                    :class="data[field] ? `` : `-`"
                    class="form-control"
                    v-model="data[field]"
                  />
                </template>
              </Column>

              <Column :rowEditor="true" bodyStyle="text-align:center"> </Column>
              <template #footer>
                <div class="d-flex justify-content-between">
                  <div>ทั้งหมด {{ this.matAssign.length }} รายการ</div>
                  <div @click="addMat">
                    <i class="bi bi-plus-square-fill"></i>
                  </div>
                </div>
              </template>
            </DataTable>
          </div>

          <div class="line mt-3"></div>

          <div class="form-col-container mt-2">
            <div>
              <span class="title-text">หมายเหตุ - 1</span>
              <textarea class="form-control" v-model="form.remark1" style="height: 50px">
              </textarea>
            </div>
          </div>

          <div class="form-col-container">
            <div>
              <span class="title-text">หมายเหตุ - 2</span>
              <textarea class="form-control" v-model="form.remark2" style="height: 50px">
              </textarea>
            </div>
          </div>

          <div class="d-flex justify-content-end mt-3">
            <button class="btn btn-sm btn-dark mr-2" type="button" @click="closeModal">
              ยกเลิก
            </button>
            <button class="btn btn-sm btn-main" type="submit">ยืนยัน</button>
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
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

import moment from 'dayjs'
import api from '@/axios/axios-helper.js'
import swAlert from '@/services/alert/sweetAlerts.js'
import { formatDate, formatDateTime, formatISOString } from '@/services/utils/dayjs'

const interfaceForm = {
  status: null,

  receiveDate: new Date(),
  receiveBy: null,

  assignTo: null,
  remark1: null,
  remark2: null,
  totalWages: null
}
// const interfaceMat = {
//   //id: null,
//   //gold: null,
//   goldQTYSend: null,
//   goldWeightSend: null,
//   goldQTYCheck: null,
//   goldWeightCheck: null,
//   workers: null,
//   workersSub: null,
//   description: null,
//   wages: null
// }
const interfaceIsValid = {
  isValStatus: false,
  isValReceiveDate: false,
  isValGemAssignDate: false,
  isValCVDAssignDate: false
}

export default {
  components: {
    modal,
    loading,
    AutoComplete,
    Calendar,
    Dropdown,
    DataTable,
    Column
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
    modelMatValue: {
      type: Array,
      required: true,
      default: () => []
    },
    masterStatus: {
      type: Array,
      required: true,
      default: () => []
    },
    masterGold: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  watch: {
    'form.receiveDate'(val) {
      if (val) {
        this.val = {
          //...interfaceIsValid,
          isValReceiveDate: false
        }
      }
    }
  },
  computed: {
    isShowModal() {
      return this.isShow
    },
    model() {
      console.log('model', this.modelValue)
      return this.modelValue
    },
    modelMat() {
      return this.modelMatValue
    },
    modelStatus() {
      return this.masterStatus
    },
    modelGold() {
      return this.masterGold
    }
  },
  data() {
    return {
      // --- flag --- //
      isLoading: false,
      autoId: 0,
      autoIdGem: 0,
      status: 500,

      // --- from --- //
      form: {
        ...interfaceForm
      },
      val: {
        ...interfaceIsValid
      },

      tempMatAssign: [],
      matAssign: [],
      editingRows: [],
      gemAssign: [],
      editingGemRows: [],
      workerItemSearch: [],
      gemItemSearch: []
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
    calTotalWages(data) {
      data.totalWages = data.wages * (data.goldQTYCheck ?? 0)
      //console.log(data.totalWages)
    },
    truncateName(name, maxLength) {
      if (name.length <= maxLength) {
        return name
      }
      return name.slice(0, maxLength) + '...'
    },

    // ----- event
    onRowEditSave(event) {
      let { newData, index } = event
      this.matAssign[index] = newData
    },
    onGemRowEditSave(event) {
      let { newData, index } = event
      this.gemAssign[index] = newData
    },
    onDelGold(item) {
      const index = this.matAssign.indexOf(item)
      this.matAssign.splice(index, 1)
    },
    onDelGem(item) {
      const index = this.gemAssign.indexOf(item)
      this.gemAssign.splice(index, 1)
    },
    addMat() {
      const add = {
        id: ++this.autoId,
        gold: 'YG',
        requestDate: new Date(),
        goldQTYSend: null,
        goldWeightSend: null,
        goldQTYCheck: null,
        goldWeightCheck: null,
        worker: null,
        workerSub: null,
        wages: null
      }
      this.matAssign.push(add)
    },
    addGem() {
      const add = {
        id: ++this.autoIdGem,
        gem: null,
        qty: null,
        weight: null
      }
      this.gemAssign.push(add)
    },
    onclear() {
      this.form = {
        ...interfaceForm
      }
      this.val = {
        ...interfaceIsValid
      }
      this.matAssign = [...this.tempMatAssign]
      this.gemAssign = []
    },
    closeModal() {
      this.onclear()
      this.$emit('closeModal', 'add')
    },

    onSubmit() {
      if (this.validateForm()) {
        swAlert.confirmSubmit(
          `ยืนยันหลอม [งานที่หลอมจะไม่สามารถแก้ไขได้อีกต่อไป]`,
          `${this.model.wo}-${this.model.woNumber}`,
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
      //   if (!this.form.mold) {
      //     this.val = {
      //       isValMold: true
      //     }
      //     return false
      //   }

      return true
    },

    // --- APIs --- //

    async submit() {
      try {
        this.isLoading = true
        this.matAssign = this.matAssign.map((item) => {
          return {
            ...item,
            worker: item.workers?.code,
            workerSub: item.workersSub?.code
          }
        })
        this.gemAssign = this.gemAssign.map((item) => {
          return {
            id: item.gem?.id,
            code: item.gem?.code,
            name: item.gem?.name,
            QTY: item.QTY,
            weight: item.weight
          }
        })
        const param = {
          wo: this.model.wo,
          woNumber: this.model.woNumber,
          productionPlanId: this.model.id,

          status: this.status,
          sendName: this.form.receiveBy,
          sendDate: this.form.receiveDate ? formatISOString(this.form.receiveDate) : null,
          checkName: this.form.receiveBy,
          checkDate: this.form.receiveDate ? formatISOString(this.form.receiveDate) : null,
          remark1: this.form.remark1,
          remark2: this.form.remark2,
          totalWages: this.form.totalWages,
          golds: [...this.matAssign],
          gems: [...this.gemAssign]
        }
        //console.log(param)
        const res = await api.jewelry.post('ProductionPlan/ProductionPlanAddStatusDetail', param)
        if (res) {
          swAlert.success(
            ``,
            '',
            () => {
              this.form = {
                ...interfaceForm
              }
              this.val = {
                ...interfaceIsValid
              }
              this.matAssign = [...this.tempMatAssign]
              this.gemAssign = []
              this.$emit('fetch')
            },
            null,
            null
          )
        }
        this.isLoading = false
      } catch (error) {
        this.isLoading = false
        console.log(error)
      }
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
            type: this.status,
            active: 1
          }
        }
        const res = await api.jewelry.post('Worker/Search', params)
        if (res) {
          //console.log(res)
          this.workerItemSearch = [...res.data]
          //this.workerItemSearch = res.data.map((x) => `${x.code} : ${x.nameTh}`)
        }
        //this.isLoading = false
      } catch (error) {
        console.log(error)
        //this.isLoading = false
      }
    },
    async onSearchGem(e) {
      try {
        //this.isLoading = true
        //console.log(this.formValue)
        const params = {
          take: 0,
          skip: 0,
          search: {
            text: e.query ?? null
          }
        }
        const res = await api.jewelry.post('StockGem/Search', params)
        if (res) {
          //console.log(res)
          this.gemItemSearch = [...res]
          //this.workerItemSearch = res.data.map((x) => `${x.code} : ${x.nameTh}`)
        }
        //this.isLoading = false
      } catch (error) {
        console.log(error)
        //this.isLoading = false
      }
    }
  },
  created() {
    this.matAssign = [...this.modelMat]
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

// ** ------ overide primevue style ------
.custom-input {
  margin-top: 5px !important;
}
input {
  margin-top: 0px !important;
}
:deep(.p-autocomplete .p-component) {
  margin-top: 0px !important;
  //background-color: #dad4b5;
}
</style>
