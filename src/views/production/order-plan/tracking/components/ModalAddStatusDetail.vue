<template>
  <div class="app-container-modal">
    <loading :isLoading="isLoading"></loading>
    <modal :showModal="isShowModal" @closeModal="closeModal" width="950px">
      <template v-slot:title>
        <h5>เพิ่มการดำเนินงานสินค้า</h5>
      </template>
      <template v-slot:content>
        <div><label class="title">เลือกสถานะงาน</label></div>
        <div class="row form-group">
          <div class="col-md-6">
            <label></label>
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
        <div class="line mt-3 mb-3"></div>
        <form v-if="showType === 1" @submit.prevent="onSubmit">
          <div class="add-update-container">
            <!-- normal -->
            <!-- <div><label class="title">ข้อมูลจ่ายงาน</label></div> -->
            <div class="row form-group">
              <div class="col-md-6">
                <label>วันจ่ายงาน</label>
                <Calendar
                  class="w-100"
                  :class="val.isValAssignDate === true ? `p-invalid` : ``"
                  v-model="form.assignDate"
                  dateFormat="dd/mm/yy"
                  showIcon
                  showButtonBar
                />
                <!-- @date-select="onResetValDate('isValAssignDate')" -->
                <small v-if="val.isValAssignDate" class="p-error">Date is required.</small>
              </div>
              <div class="col-md-6">
                <label>ผู้จ่ายงาน</label>
                <input type="text" class="form-control" v-model="form.assignBy" />
              </div>
            </div>
            <div class="row form-group">
              <div class="col-md-6">
                <label>วันที่รับงาน</label>
                <Calendar
                  class="w-100"
                  :class="val.isValReceiveDate === true ? `p-invalid` : ``"
                  v-model="form.receiveDate"
                  dateFormat="dd/mm/yy"
                  showIcon
                  showButtonBar
                />
                <!-- @date-select="onResetValDate('isValReceiveDate')" -->
                <small v-if="val.isValReceiveDate" class="p-error">Date is required.</small>
              </div>
              <div class="col-md-6">
                <label>ผู้รับงาน</label>
                <input type="text" class="form-control" v-model="form.receiveBy" />
              </div>
            </div>
            <div class="row form-group">
              <!-- <div class="col-md-12" v-for="(item, index) in matAssign" :key="index">
                {{ item.name }}
              </div> -->
              <div class="col-md-12 mt-2">
                <label>รายละเอียด</label>
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
                  <Column style="width: 10%">
                    <template #body="prop">
                      <div class="btn btn-danger text-center w-100" @click="onDelGold(prop.data)">
                        <i class="bi bi-trash-fill"></i>
                      </div>
                    </template>
                  </Column>
                  <!-- <Column field="id" header="ID" style="width: 10%">
                    <template #editor="{ data, field }">
                      <input type="number" class="form-control" v-model="data[field]" disabled />
                    </template>
                  </Column> -->
                  <Column field="gold" header="ทอง" style="width: 10%">
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
                  <Column field="goldQTYSend" header="จำนวนจ่าย" style="width: 15%">
                    <template #editor="{ data, field }">
                      <input
                        type="number"
                        :class="data[field] ? `` : `bg-warning`"
                        class="form-control"
                        v-model="data[field]"
                      />
                    </template>
                  </Column>
                  <Column field="goldWeightSend" header="น้ำหนักจ่าย" style="width: 15%">
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
                  <Column field="goldQTYCheck" header="จำนวนรับ" style="width: 15%">
                    <template #editor="{ data, field }">
                      <input
                        type="number"
                        :class="data[field] ? `` : `bg-warning`"
                        class="form-control"
                        v-model="data[field]"
                      />
                    </template>
                  </Column>
                  <Column field="goldWeightCheck" header="น้ำหนักรับ" style="width: 15%">
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
                  <Column field="worker" header="ช่างรับงาน" style="width: 20%">
                    <template #editor="{ data, field }">
                      <input
                        type="text"
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
            </div>
            <div class="row form-group">
              <div class="col-md-12">
                <label>หมายเหตุ - 1</label>
                <textarea class="form-control" v-model="form.remark1" style="height: 50px">
                </textarea>
              </div>
              <div class="col-md-12">
                <label>หมายเหตุ - 2</label>
                <textarea class="form-control" v-model="form.remark2" style="height: 50px">
                </textarea>
              </div>
            </div>

            <div class="line mt-3"></div>
            <div class="row form-group">
              <div class="col-md-12">
                <div class="btn-container">
                  <button class="btn btn-sm btn-main" type="submit">
                    <span class="mr-2"><i class="bi bi-gem"></i></span><span>บันทึกสถานะงาน</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
        <form v-if="showType === 2" @submit.prevent="onSubmit">
          <div class="add-update-container">
            <div class="row form-group">
              <div class="col-md-6">
                <label>วันคัดพลอย</label>
                <Calendar
                  class="w-100"
                  :class="val.isValReceiveDate === true ? `p-invalid` : ``"
                  v-model="form.receiveDate"
                  dateFormat="dd/mm/yy"
                  showIcon
                  showButtonBar
                />
                <!-- @date-select="onResetValDate('isValReceiveDate')" -->
                <small v-if="val.isValReceiveDate" class="p-error">Date is required.</small>
              </div>
              <div class="col-md-6">
                <label>ผู้คัดพลอย</label>
                <input type="text" class="form-control" v-model="form.receiveBy" />
              </div>
            </div>
            <div class="row form-group">
              <!-- <div class="col-md-12" v-for="(item, index) in matAssign" :key="index">
                {{ item.name }}
              </div> -->
              <div class="col-md-12 mt-2">
                <label>รายละเอียด</label>
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
                  <Column style="width: 10%">
                    <template #body="prop">
                      <div class="btn btn-danger text-center w-100" @click="onDelGold(prop.data)">
                        <i class="bi bi-trash-fill"></i>
                      </div>
                    </template>
                  </Column>
                  <!-- <Column field="id" header="ID" style="width: 10%">
                    <template #editor="{ data, field }">
                      <input type="number" class="form-control" v-model="data[field]" disabled />
                    </template>
                  </Column> -->
                  <Column field="gold" header="ทอง" style="width: 25%">
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
                  <!-- <Column field="goldQTYSend" header="จำนวนจ่าย" style="width: 15%">
                    <template #editor="{ data, field }">
                      <input
                        type="number"
                        :class="data[field] ? `` : `bg-warning`"
                        class="form-control"
                        v-model="data[field]"
                      />
                    </template>
                  </Column>
                  <Column field="goldWeightSend" header="น้ำหนักจ่าย" style="width: 15%">
                    <template #editor="{ data, field }">
                      <input
                        type="number"
                        step="any"
                        :class="data[field] ? `` : `bg-warning`"
                        class="form-control"
                        v-model="data[field]"
                      />
                    </template>
                  </Column> -->
                  <Column field="goldQTYCheck" header="จำนวน" style="width: 25%">
                    <template #editor="{ data, field }">
                      <input
                        type="number"
                        :class="data[field] ? `` : `bg-warning`"
                        class="form-control"
                        v-model="data[field]"
                      />
                    </template>
                  </Column>
                  <Column field="goldWeightCheck" header="น้ำหนัก" style="width: 25%">
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
                  <!-- <Column field="worker" header="ช่างรับงาน" style="width: 20%">
                    <template #editor="{ data, field }">
                      <input
                        type="text"
                        :class="data[field] ? `` : `bg-warning`"
                        class="form-control"
                        v-model="data[field]"
                      />
                    </template>
                  </Column> -->
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
            </div>
            <div class="row form-group">
              <div class="col-md-12">
                <label>หมายเหตุ - 1</label>
                <textarea class="form-control" v-model="form.remark1" style="height: 50px">
                </textarea>
              </div>
              <div class="col-md-12">
                <label>หมายเหตุ - 2</label>
                <textarea class="form-control" v-model="form.remark2" style="height: 50px">
                </textarea>
              </div>
            </div>

            <div class="line mt-3"></div>
            <div class="row form-group">
              <div class="col-md-12">
                <div class="btn-container">
                  <button class="btn btn-sm btn-main" type="submit">
                    <span class="mr-2"><i class="bi bi-gem"></i></span><span>บันทึกสถานะงาน</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
        <form v-if="showType === 3" @submit.prevent="onSubmit">
          <div class="add-update-container">
            <div class="row form-group">
              <div class="col-md-6">
                <label>วันตรวจ CVD</label>
                <Calendar
                  class="w-100"
                  :class="val.isValReceiveDate === true ? `p-invalid` : ``"
                  v-model="form.receiveDate"
                  dateFormat="dd/mm/yy"
                  showIcon
                  showButtonBar
                />
                <!-- @date-select="onResetValDate('isValReceiveDate')" -->
                <small v-if="val.isValReceiveDate" class="p-error">Date is required.</small>
              </div>
              <div class="col-md-6">
                <label>ผู้ตรวจ CVD</label>
                <input type="text" class="form-control" v-model="form.receiveBy" />
              </div>
            </div>
            <div class="row form-group">
              <div class="col-md-12">
                <label>หมายเหตุ - 1</label>
                <textarea class="form-control" v-model="form.remark1" style="height: 50px">
                </textarea>
              </div>
              <div class="col-md-12">
                <label>หมายเหตุ - 2</label>
                <textarea class="form-control" v-model="form.remark2" style="height: 50px">
                </textarea>
              </div>
            </div>

            <div class="line mt-3"></div>
            <div class="row form-group">
              <div class="col-md-12">
                <div class="btn-container">
                  <button class="btn btn-sm btn-main" type="submit">
                    <span class="mr-2"><i class="bi bi-gem"></i></span><span>บันทึกสถานะงาน</span>
                  </button>
                </div>
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

import swAlert from '@/js/alert/sweetAlerts.js'
import api from '@/axios/axios-config.js'

import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
//import InputText from 'primevue/inputtext'

import { formatISOString } from '@/utils/moment'

const interfaceForm = {
  status: null,
  assignDate: null,
  assignBy: null,
  receiveDate: null,
  receiveBy: null,
  assignTo: null,
  remark1: null,
  remark2: null
}
const interfaceMat = {
  //id: null,
  //gold: null,
  goldQTYSend: null,
  goldWeightSend: null,
  goldQTYCheck: null,
  goldWeightCheck: null,
  worker: null
}

export default {
  components: {
    modal,
    loading,
    Dropdown,
    Calendar,
    DataTable,
    Column
    //InputText
  },
  props: {
    isShowModal: {
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
    modelMat: {
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
      //console.log('this.modelValue')
      return this.masterStatus.filter((x) => x.id !== 10 && x.id !== 100 && x.id !== 95)
    },
    model() {
      //console.log('this.modelValue')
      //console.log(this.modelValue)
      return this.modelValue
    }
    // mat() {
    //   //console.log(this.modelMat)
    //   return this.modelMat
    // }
  },
  watch: {
    modelMat(value) {
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
      isLoading: false,
      autoId: 0,
      showType: 0,
      form: {
        ...interfaceForm
      },
      val: {
        isValStatus: false,
        isValAssignDate: false,
        isValReceiveDate: false,
        isValGemAssignDate: false,
        isValCVDAssignDate: false
      },
      tempMatAssign: [],
      matAssign: [],
      editingRows: []
    }
  },
  methods: {
    closeModal() {
      //this.showType = 0
      this.matAssign = [...this.tempMatAssign]
      this.onclear()
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
        //console.log(this.form.status)
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
    onclear() {
      this.form = {
        ...interfaceForm
      }
      //this.matAssign = []
    },

    // ------ api --------//
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
          golds: [...this.matAssign]
        }
        //console.log(param)
        const res = await api.jewelry.post('ProductionPlan/ProductionPlanAddStatusDetail', param)
        if (res) {
          swAlert.success(
            ``,
            '',
            () => {
              this.onclear()
              this.$emit('success')
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

    // ----------- Grid -------------------//
    onRowEditSave(event) {
      let { newData, index } = event
      this.matAssign[index] = newData
    },
    onDelGold(item) {
      const index = this.matAssign.indexOf(item)
      //console.log(index)
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
        worker: null
      }
      this.matAssign.push(add)
    }
  },
  created() {
    //console.log(this.model)
  }
}
</script>

<style lang="scss" scoped>
h5 {
  padding: 5px 0px 0px 5px;
  //font-size: 21px;
  //font-weight: 600;
  color: var(--base-font-color);
}
input {
  //font-size: 12px;
  //margin-top: 5px;
}
label {
  color: var(--base-font-color);
  //font-size: 13px;
  font-weight: 300;
  margin: 5px 0px 0px 0px;
}
:deep(.p-datatable-tbody > tr > td) {
  padding: 3px 5px 3px 5px !important;
}
.title {
  font-size: 14px;
  //padding: 0px 10px 0px 10px;
  font-weight: 600;
  width: 100%;
  //background-color: var(--base-color);
}
.line {
  border-bottom: 1px solid var(--base-font-color);
  margin: 10px 0px;
}
.form-group {
  margin-bottom: 5px;
}
.btn-container {
  margin-top: 10px;
  display: grid;
  place-items: end;
}
</style>
