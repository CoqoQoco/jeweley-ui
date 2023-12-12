<template>
  <div class="form-container">
    <loading :isLoading="isLoading"></loading>
    <modal :showModal="isShow" @closeModal="onCloseModal" width="1400px">
      <template v-slot:content>
        <div class="form-content-container">
          <div class="mb-2">
            <span class="txt-title-modal">เพิ่มสถานะการผลิต</span>
          </div>
          <div class="form-content-row-container mb-3">
            <div>
              <span class="txt-title">เลือกสถานะงานผลิต</span>
              <Dropdown
                v-model="form.status"
                :options="modelMasterStatus"
                optionLabel="nameTh"
                optionValue="id"
                placeholder="เลือกสถานะงาน"
                class="w-full md:w-14rem"
                :class="val.isValStatus === true ? `p-invalid` : ``"
                @change="onSelectType()"
              />
              <small v-if="val.isValStatus" class="p-error">Status is required.</small>
            </div>
          </div>
          <form v-if="showType === 1" @submit.prevent="onSubmit">
            <div class="mb-2 txt-title-part">
              <span><i class="bi bi-clipboard2-plus-fill mr-2"></i></span>
              <span>ระบุข้อมูลจ่ายงาน</span>
            </div>
            <div class="form-content-row-container">
              <div>
                <span class="txt-title">วันที่จ่ายงาน</span>
                <Calendar
                  class="w-100"
                  :class="val.isValAssignDate === true ? `p-invalid` : ``"
                  v-model="form.assignDate"
                  dateFormat="dd/mm/yy"
                  showIcon
                  showButtonBar
                />
              </div>
              <div>
                <span class="txt-title">ผู้จ่ายงาน</span>
                <input type="text" class="form-control" v-model="form.assignBy" required />
              </div>
            </div>
            <div class="mb-2 mt-2 txt-title-part">
              <span><i class="bi bi-clipboard2-plus-fill mr-2"></i></span>
              <span>ระบุข้อมูลรับงาน</span>
            </div>
            <div class="form-content-row-container">
              <div>
                <span class="txt-title">วันที่รับงาน</span>
                <Calendar
                  class="w-100"
                  :class="val.isValReceiveDate === true ? `p-invalid` : ``"
                  v-model="form.receiveDate"
                  dateFormat="dd/mm/yy"
                  showIcon
                  showButtonBar
                />
              </div>
              <div>
                <span class="txt-title">ผู้รับงาน</span>
                <input type="text" class="form-control" v-model="form.receiveBy" />
              </div>
            </div>
            <div class="mb-2 mt-2 txt-title-part">
              <span><i class="bi bi-clipboard2-plus-fill mr-2"></i></span>
              <span>ระบุรายละเอียด</span>
            </div>
            <div class="form-content-row-grid-container">
              <DataTable
                class="p-datatable-sm"
                showGridlines
                v-model:editingRows="editingRows"
                :value="matAssign"
                editMode="row"
                dataKey="id"
                scrollable
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
                <Column style="width: 20px">
                  <template #body="prop">
                    <div
                      class="btn btn-sm btn-danger text-center w-100"
                      @click="onDelGold(prop.data)"
                    >
                      <i class="bi bi-trash-fill"></i>
                    </div>
                  </template>
                </Column>
                <!-- <Column field="id" header="ID" style="width: 10%">
                    <template #editor="{ data, field }">
                      <input type="number" class="form-control" v-model="data[field]" disabled />
                    </template>
                  </Column> -->
                <Column field="gold" header="ทอง" style="width: 100px">
                  <template #editor="{ data, field }">
                    <!-- <input type="text" class="form-control" v-model="data[field]" /> -->
                    <Dropdown
                      v-model="data[field]"
                      :options="masterGold"
                      optionLabel="code"
                      optionValue="code"
                      class="w-full md:w-14rem"
                      placeholder="เลือกทอง"
                    >
                      <!-- :showClear="data[field] ? true : false" -->
                      <!-- <template #option="slotProps">
                          <Tag
                            :value="slotProps.option.value"
                            :severity="getStatusLabel(slotProps.option.value)"
                          />
                        </template> -->
                    </Dropdown>
                  </template>
                </Column>
                <Column field="goldQTYSend" header="จำนวนจ่าย">
                  <template #editor="{ data, field }">
                    <input
                      type="number"
                      :class="data[field] ? `` : `bg-warning`"
                      class="form-control"
                      v-model="data[field]"
                    />
                  </template>
                </Column>
                <Column field="goldWeightSend" header="น้ำหนักจ่าย">
                  <template #editor="{ data, field }">
                    <input
                      type="number"
                      step="any"
                      :class="data[field] ? `` : `bg-warning`"
                      class="form-control"
                      v-model="data[field]"
                    />
                  </template>
                </Column>
                <Column field="goldQTYCheck" header="จำนวนรับ">
                  <template #editor="{ data, field }">
                    <input
                      type="number"
                      :class="data[field] ? `` : `bg-warning`"
                      class="form-control"
                      v-model="data[field]"
                    />
                  </template>
                </Column>
                <Column field="goldWeightCheck" header="น้ำหนักรับ">
                  <template #editor="{ data, field }">
                    <input
                      type="number"
                      step="any"
                      :class="data[field] ? `` : `bg-warning`"
                      class="form-control"
                      v-model="data[field]"
                    />
                  </template>
                </Column>
                <Column field="description" header="รายละเอียด" style="min-width: 100px">
                  <template #editor="{ data, field }">
                    <input
                      type="text"
                      :class="data[field] ? `` : `bg-warning`"
                      class="form-control"
                      v-model="data[field]"
                    />
                  </template>
                </Column>
                <Column field="worker" header="ช่างรับงาน" style="min-width: 120px">
                  <template #editor="{ data, field }">
                    <input
                      type="text"
                      :class="data[field] ? `` : `bg-warning`"
                      class="form-control"
                      v-model="data[field]"
                    />
                  </template>
                </Column>
                <Column field="wages" header="ค่าแรงช่าง" style="min-width: 100px">
                  <template #editor="{ data, field }">
                    <input
                      type="number"
                      min="1"
                      step="any"
                      :class="data[field] ? `` : `bg-warning`"
                      class="form-control"
                      v-model="data[field]"
                    />
                  </template>
                </Column>
                <Column
                  :rowEditor="true"
                  style="width: 10%; min-width: 7rem"
                  bodyStyle="text-align:center"
                >
                </Column>
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
            <div class="mb-2 mt-2 txt-title-part">
              <span><i class="bi bi-clipboard2-plus-fill mr-2"></i></span>
              <span>ระบุข้อมูลเพิ่มเติม</span>
            </div>
            <div class="form-content-row-container">
              <div>
                <span class="txt-title">หมายเหตุ - 1</span>
                <textarea class="form-control" v-model="form.remark1" style="height: 50px">
                </textarea>
              </div>
              <div>
                <span class="txt-title">หมายเหตุ - 2</span>
                <textarea class="form-control" v-model="form.remark2" style="height: 50px">
                </textarea>
              </div>
            </div>
            <div class="d-flex justify-content-center mt-3">
              <button class="btn btn-sm btn-dark btn-custom mr-2" type="button" @click="closeModal">
                ยกเลิกเพิ่มสถานะการผลิต
              </button>
              <button class="btn btn-sm btn-warning btn-custom" type="submit">
                ยืนยันเพิ่มสถานะการผลิต
              </button>
            </div>
          </form>
          <form v-if="showType === 2" @submit.prevent="onSubmit">
            <div class="mb-2 txt-title-part">
              <span><i class="bi bi-clipboard2-plus-fill mr-2"></i></span>
              <span>ระบุข้อมูลคัดพลอย</span>
            </div>
            <div class="form-content-row-container">
              <div>
                <span class="txt-title">วันคัดพลอย</span>
                <Calendar
                  class="w-100"
                  :class="val.isValReceiveDate === true ? `p-invalid` : ``"
                  v-model="form.receiveDate"
                  dateFormat="dd/mm/yy"
                  showIcon
                  showButtonBar
                />
              </div>
              <div>
                <span class="txt-title">ผู้คัดพลอย</span>
                <input type="text" class="form-control" v-model="form.receiveBy" />
              </div>
            </div>
            <div class="mb-2 txt-title-part">
              <span><i class="bi bi-clipboard2-plus-fill mr-2"></i></span>
              <span>ระบุรายละเอียด</span>
            </div>
            <div class="form-content-row-grid-container">
              <DataTable
                class="p-datatable-sm"
                showGridlines
                v-model:editingRows="editingRows"
                :value="matAssign"
                editMode="row"
                dataKey="id"
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
                <Column style="width: 20px">
                  <template #body="prop">
                    <div
                      class="btn btn-sm btn-danger text-center w-100"
                      @click="onDelGold(prop.data)"
                    >
                      <i class="bi bi-trash-fill"></i>
                    </div>
                  </template>
                </Column>
                <Column field="gold" header="ทอง">
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
                <Column field="goldQTYCheck" header="จำนวน">
                  <template #editor="{ data, field }">
                    <input
                      type="number"
                      :class="data[field] ? `` : `bg-warning`"
                      class="form-control"
                      v-model="data[field]"
                    />
                  </template>
                </Column>
                <Column field="goldWeightCheck" header="น้ำหนัก">
                  <template #editor="{ data, field }">
                    <input
                      type="number"
                      step="any"
                      :class="data[field] ? `` : `bg-warning`"
                      class="form-control"
                      v-model="data[field]"
                    />
                  </template>
                </Column>
                <Column
                  :rowEditor="true"
                  style="width: 10%; min-width: 8rem"
                  bodyStyle="text-align:center"
                ></Column>
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
            <div class="mb-2 mt-2 txt-title-part">
              <span><i class="bi bi-clipboard2-plus-fill mr-2"></i></span>
              <span>ระบุค่าเเรง</span>
            </div>
            <div class="form-content-row-price-container">
              <div>
                <span class="txt-title">ค่าเเรงคัดพลอย</span>
                <input type="number" step="any" class="form-control" v-model="form.totalWages" />
              </div>
            </div>
            <div class="mb-2 mt-2 txt-title-part">
              <span><i class="bi bi-clipboard2-plus-fill mr-2"></i></span>
              <span>ระบุข้อมูลเพิ่มเติม</span>
            </div>
            <div class="form-content-row-container">
              <div>
                <span class="txt-title">หมายเหตุ - 1</span>
                <textarea class="form-control" v-model="form.remark1" style="height: 50px">
                </textarea>
              </div>
              <div>
                <span class="txt-title">หมายเหตุ - 2</span>
                <textarea class="form-control" v-model="form.remark2" style="height: 50px">
                </textarea>
              </div>
            </div>
            <div class="d-flex justify-content-center mt-3">
              <button class="btn btn-sm btn-dark btn-custom mr-2" type="button" @click="closeModal">
                ยกเลิกเพิ่มสถานะการผลิต
              </button>
              <button class="btn btn-sm btn-warning btn-custom" type="submit">
                ยืนยันเพิ่มสถานะการผลิต
              </button>
            </div>
          </form>
          <form v-if="showType === 3" @submit.prevent="onSubmit">
            <div class="mb-2 txt-title-part">
              <span><i class="bi bi-clipboard2-plus-fill mr-2"></i></span>
              <span>ระบุข้อมูลตรวจ CVD</span>
            </div>
            <div class="form-content-row-container">
              <div>
                <span class="txt-title">วันตรวจ CVD</span>
                <Calendar
                  class="w-100"
                  :class="val.isValReceiveDate === true ? `p-invalid` : ``"
                  v-model="form.receiveDate"
                  dateFormat="dd/mm/yy"
                  showIcon
                  showButtonBar
                />
              </div>
              <div>
                <span class="txt-title">ผู้ตรวจ CVD</span>
                <input type="text" class="form-control" v-model="form.receiveBy" />
              </div>
            </div>
            <div class="form-content-row-container">
              <div>
                <span class="txt-title">หมายเหตุ - 1</span>
                <textarea class="form-control" v-model="form.remark1" style="height: 50px">
                </textarea>
              </div>
              <div>
                <span class="txt-title">หมายเหตุ - 2</span>
                <textarea class="form-control" v-model="form.remark2" style="height: 50px">
                </textarea>
              </div>
            </div>
            <div class="d-flex justify-content-center mt-3">
              <button class="btn btn-sm btn-dark btn-custom mr-2" type="button" @click="closeModal">
                ยกเลิกเพิ่มสถานะการผลิต
              </button>
              <button class="btn btn-sm btn-warning btn-custom" type="submit">
                ยืนยันเพิ่มสถานะการผลิต
              </button>
            </div>
          </form>
        </div>
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
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

import swAlert from '@/services/alert/sweetAlerts.js'
import api from '@/axios/axios-config.js'
import { formatISOString } from '@/services/utils/dayjs'

const interfaceForm = {
  status: null,
  assignDate: null,
  assignBy: null,
  receiveDate: null,
  receiveBy: null,
  assignTo: null,
  //wages: null,
  remark1: null,
  remark2: null,
  totalWages: null
}
const interfaceMat = {
  //id: null,
  //gold: null,
  goldQTYSend: null,
  goldWeightSend: null,
  goldQTYCheck: null,
  goldWeightCheck: null,
  worker: null,
  description: null,
  wages: null
}
const interfaceVal = {
  isValStatus: false,
  isValAssignDate: false,
  isValReceiveDate: false,
  isValGemAssignDate: false,
  isValCVDAssignDate: false
}

export default {
  components: {
    modal,
    loading,
    Dropdown,
    Calendar,
    DataTable,
    Column
  },
  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    masterStatus: {
      type: Array,
      required: true,
      default: () => []
    },
    modelValue: {
      type: Object,
      required: true,
      default: () => {}
    },
    modelMatValue: {
      type: Object,
      required: true,
      default: () => {}
    },
    masterGold: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  computed: {
    modelMasterStatus() {
      return this.masterStatus.filter((x) => x.id !== 10 && x.id !== 100 && x.id !== 95)
    },
    model() {
      return this.modelValue
    }
  },
  watch: {
    modelMatValue(value) {
      console.log('new mat')
      this.autoId = 0
      this.tempMatAssign = value.map((thing) => {
        return {
          id: ++this.autoId,
          gold: thing.gold,
          ...interfaceMat
        }
      })
      this.matAssign = [...this.tempMatAssign]
    }
  },
  data() {
    return {
      // --- flag --- //
      isLoading: false,
      showType: 0,
      autoId: 0,

      // --- form --- //
      form: {
        ...interfaceForm
      },
      val: {
        ...interfaceVal
      },
      tempMatAssign: [],
      matAssign: [],
      editingRows: []
    }
  },
  methods: {
    // --- controller --- //
    onCloseModal() {
      this.form = {
        ...interfaceForm
      }
      this.val = {
        ...interfaceVal
      }
      this.matAssign = [...this.tempMatAssign]
      this.showType = 0
      this.$emit('closeModal')
    },
    onSelectType() {
      this.form.assignDate = null
      this.form.assignBy = null
      this.form.receiveDate = null
      this.form.receiveBy = null
      this.form.assignTo = null
      this.form.remark1 = null
      this.form.remark2 = null

      this.matAssign = [...this.tempMatAssign]
      if (this.form.status) {
        if (
          this.form.status === 50 ||
          this.form.status === 60 ||
          this.form.status === 80 ||
          this.form.status === 90
        ) {
          this.showType = 1
        } else if (this.form.status === 70) {
          this.showType = 2
        } else if (this.form.status === 85) {
          this.showType = 3
        }
      } else {
        this.showType = 0
      }
    },
    onSubmit() {
      swAlert.confirmSubmit(
        ``,
        '',
        async () => {
          this.submit()
        },
        null,
        null
      )
    },

    // ----------- Grid -------------------//
    onRowEditSave(event) {
      let { newData, index } = event
      this.matAssign[index] = newData
    },
    onDelGold(item) {
      const index = this.matAssign.indexOf(item)
      this.matAssign.splice(index, 1)
    },
    addMat() {
      const add = {
        id: ++this.autoId,
        gold: 'YG',
        goldQTYSend: null,
        goldWeightSend: null,
        goldQTYCheck: null,
        goldWeightCheck: null,
        worker: null,
        wages: null
      }
      this.matAssign.push(add)
    },

    // --- APIs --- //
    async submit() {
      try {
        this.isLoading = true
        const param = {
          wo: this.model.wo,
          woNumber: this.model.woNumber,
          productionPlanId: this.model.id,

          status: this.form.status,
          sendName: this.form.assignBy,
          sendDate: this.form.assignDate ? formatISOString(this.form.assignDate) : null,
          checkName: this.form.receiveBy,
          checkDate: this.form.receiveDate ? formatISOString(this.form.receiveDate) : null,
          remark1: this.form.remark1,
          remark2: this.form.remark2,
          totalWages: this.form.totalWages,
          golds: [...this.matAssign]
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
                ...interfaceVal
              }
              this.matAssign = [...this.tempMatAssign]
              this.showType = 0
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
    }
  },
  mounted() {
    this.autoId = 0
    this.tempMatAssign = this.modelMatValue.map((thing) => {
      return {
        id: ++this.autoId,
        gold: thing.gold,
        ...interfaceMat
      }
    })
    this.matAssign = [...this.tempMatAssign]
  }
}
</script>

<style lang="scss" scoped>
:deep(input) {
  margin-top: 0px !important;
}
:deep(.p-dropdown) {
  height: 35px !important;
  padding-left: 5px;
  width: 100% !important;
  margin-top: 0px !important;
}
:deep(.p-calendar) {
  height: 35px;
  margin-top: 0px !important;
}
.form-content-container {
  padding: 20px 20px;
  overflow: auto;
  //height: 650px;
}
.form-content-row-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 50px;
  padding: 0px 30px;
}
.form-content-row-grid-container {
  display: grid;
  //grid-template-columns: 1fr;
  //gap: 50px;
  padding: 0px 30px;
}
.form-content-row-price-container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  gap: 50px;
  padding: 0px 30px;
}
.txt-title-part {
  padding-left: 30px;
  padding-top: 10px;
  font-size: 14px;
  color: var(--base-font-color);
}
.txt-title-modal {
  padding: 30px;
  font-size: 20px;
  color: var(--base-font-color);
}
.txt-title {
  font-size: 12px;
}
</style>
