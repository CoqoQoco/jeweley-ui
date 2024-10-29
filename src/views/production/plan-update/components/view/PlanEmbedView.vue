<template>
    <div class="filter-container-custom">
      <div class="filter-container-highlight">
        <div class="d-flex justify-content-between">
          <!-- time -->
          <div class="title-text-white vertical-center-container">
            <span class="bi bi-clock mr-2"></span>
            <span v-if="modelPlanStatus">{{ formatDateTime(modelPlanStatus.updateDate) }}</span>
            <span v-else class="ml-2">---</span>
          </div>
  
          <!-- action -->
          <div>
            <button
              :class="['btn btn-sm ml-2', checkBtn('close') ? 'btn-secondary' : 'btn-primary']"
              title="พิมพ์แบบ"
              :disabled="checkBtn('close')"
            >
              <span class="bi bi-printer"></span>
            </button>
            <button
              :class="['btn btn-sm ml-2', checkBtn('add') ? 'btn-secondary' : 'btn-green']"
              title="เพิ่มจ่ายแต่ง"
              :disabled="checkBtn('add')"
              @click="addStatus()"
            >
              <span class="bi bi-database-fill-add"></span>
            </button>
            <button
              :class="['btn btn-sm ml-2', checkBtn('edit') ? 'btn-secondary' : 'btn-warning']"
              title="เเก้ไขจ่ายแต่ง"
              :disabled="checkBtn('edit')"
              @click="updateStatus()"
            >
              <span class="bi bi-brush"></span>
            </button>
            <button
              :class="['btn btn-sm ml-2', checkBtn('delete') ? 'btn-secondary' : 'btn-red']"
              title="ลบจ่ายแต่ง"
              :disabled="checkBtn('delete')"
              @click="onDelStatus(modelPlanStatus.id)"
            >
              <span class="bi bi-trash-fill"></span>
            </button>
          </div>
        </div>
      </div>
      <div v-if="modelPlanStatus">
        <div class="form-col-container pl-2 mt-3">
          <!-- name -->
          <div class="d-flex flex-column">
            <span class="title-text">ชื่อ จ่ายงาน/รับงาน</span>
            <span class="desc-text">{{ modelPlanStatus.sendName }}</span>
          </div>
          <!-- date -->
          <div class="d-flex flex-column">
            <span class="title-text">วันที่</span>
            <span class="desc-text">{{ formatDate(modelPlanStatus.sendDate) }}</span>
          </div>
          <div></div>
          <div></div>
        </div>
  
        <div class="line"></div>
  
        <!-- grid -->
        <div class="filter-container-highlight mt-3">
          <span class="desc-text-white">รายละเอียดทอง</span>
        </div>
        <div class="mb-4">
          <DataTable
            :value="modelPlanStatus.tbtProductionPlanStatusDetail"
            showGridlines
            dataKey="id"
            ref="dt"
            class="p-datatable-sm"
            resizableColumns
            scrollable
            stripedRows
            columnResizeMode="fit"
            scrollHeight="calc(100vh - 160px)"
          >
            <Column field="gold" header="ทอง" style="min-width: 100px"> </Column>
            <Column field="requestDate" header="วันที่" style="min-width: 100px">
              <template #body="slotProps">
                <div class="text-left">
                  {{ formatDate(slotProps.data.requestDate) }}
                </div>
              </template>
            </Column>
            <Column field="goldQtySend" header="จำนวนจ่าย" style="min-width: 100px">
              <template #body="slotProps">
                <div>
                  {{
                    `${
                      slotProps.data.goldQtySend
                        ? Number(slotProps.data.goldQtySend).toFixed(3).toLocaleString()
                        : ''
                    }`
                  }}
                </div>
              </template>
            </Column>
            <Column field="goldWeightSend" header="นำหนักจ่าย" style="min-width: 100px">
              <template #body="slotProps">
                <div>
                  {{
                    `${
                      slotProps.data.goldWeightSend
                        ? Number(slotProps.data.goldWeightSend).toFixed(3).toLocaleString()
                        : Number(0).toFixed(3)
                    }`
                  }}
                </div>
              </template>
            </Column>
            <Column field="goldQtyCheck" header="จำนวนรับ" style="min-width: 100px">
              <template #body="slotProps">
                <div>
                  {{
                    `${
                      slotProps.data.goldQtyCheck
                        ? Number(slotProps.data.goldQtyCheck).toFixed(3).toLocaleString()
                        : ''
                    }`
                  }}
                </div>
              </template>
            </Column>
            <Column field="goldWeightCheck" header="น้ำหนักรับ" style="min-width: 100px">
              <template #body="slotProps">
                <div>
                  {{
                    `${
                      slotProps.data.goldWeightCheck
                        ? Number(slotProps.data.goldWeightCheck).toFixed(3).toLocaleString()
                        : Number(0).toFixed(3)
                    }`
                  }}
                </div>
              </template>
            </Column>
            <Column field="goldWeightDiff" header="น้ำหนัก ขาด/เกิน" style="min-width: 150px">
              <template #body="prop">
                <div
                  style="font-weight: 600"
                  :style="
                    calculateWeightDifference(prop.data.goldWeightSend, prop.data.goldWeightCheck)
                      .style
                  "
                >
                  <span>
                    {{
                      calculateWeightDifference(prop.data.goldWeightSend, prop.data.goldWeightCheck)
                        .difference
                    }}
                  </span>
                  <span class="ml-1">{{
                    `(${
                      calculateWeightDifference(prop.data.goldWeightSend, prop.data.goldWeightCheck)
                        .percentage
                    })`
                  }}</span>
                </div>
              </template>
            </Column>
            <Column field="description" header="รายละเอียด" style="min-width: 200px">
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
              field="worker"
              :header="modelPlanStatus.status === 90 ? `ช่างขัด` : `ช่างรับงาน`"
              style="min-width: 200px"
            >
              <template #body="slotProps">
                <div class="text-center">
                  {{
                    `${
                      slotProps.data.worker
                        ? `${slotProps.data.worker} - ${slotProps.data.workerName}`
                        : ''
                    }`
                  }}
                </div>
              </template>
            </Column>
            <Column
              v-if="modelPlanStatus.status === 90"
              field="workerSub"
              header="ช่างชุบ"
              style="min-width: 200px"
            >
              <template #body="slotProps">
                <div class="text-center">
                  {{
                    `${
                      slotProps.data.workerSub
                        ? `${slotProps.data.workerSub} - ${slotProps.data.workerSubName}`
                        : null
                    }`
                  }}
                </div>
              </template>
            </Column>
            <Column field="wages" header="ค่าเเรงต่อชิ้น" style="min-width: 100px">
              <template #body="slotProps">
                <div class="text-right">
                  {{
                    `${
                      slotProps.data.wages
                        ? Number(slotProps.data.wages).toFixed(2).toLocaleString()
                        : ''
                    }`
                  }}
                </div>
              </template>
            </Column>
            <Column field="totalWages" header="รวมค่าแรง" style="min-width: 100px">
              <template #body="slotProps">
                <div class="text-right">
                  {{
                    `${
                      slotProps.data.wages
                        ? Number(slotProps.data.totalWages).toFixed(2).toLocaleString()
                        : Number(wages).toFixed(2).toLocaleString()
                    }`
                  }}
                </div>
              </template>
            </Column>
            <template #footer>
              <div class="d-flex justify-content-between">
                <div>ทั้งหมด {{ modelPlanStatus.tbtProductionPlanStatusDetail.length }} รายการ</div>
                <div>
                  รวมค่าแรงทั้งหมด
                  {{
                    `${
                      modelPlanStatus.wagesTotal
                        ? Number(modelPlanStatus.wagesTotal).toFixed(2).toLocaleString()
                        : Number(wages).toFixed(2).toLocaleString()
                    }`
                  }}
                </div>
              </div>
            </template>
          </DataTable>
        </div>
  
        <div class="line"></div>
  
        <div class="form-col-container pl-2 mt-3">
          <!-- หมายเหตุ - 1 -->
          <div class="d-flex flex-column">
            <span class="title-text">หมายเหตุ - 1</span>
            <span class="desc-text">{{ modelPlanStatus.remark1 }}</span>
          </div>
        </div>
  
        <div class="form-col-container pl-2 mt-3">
          <!-- หมายเหตุ - 2 -->
          <div class="d-flex flex-column">
            <span class="title-text">หมายเหตุ - 2</span>
            <span class="desc-text">{{ modelPlanStatus.remark2 }}</span>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import _ from 'lodash'
  
  import DataTable from 'primevue/datatable'
  import Column from 'primevue/column'
  
  import { formatDate, formatDateTime } from '@/services/utils/dayjs'
  import api from '@/axios/axios-config.js'
  import swAlert from '@/services/alert/sweetAlerts.js'
  import { calculateWeightDifference } from '@/services/helper/match.js'
  
  export default {
    components: {
      DataTable,
      Column
    },
    props: {
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
    computed: {
      model() {
        return this.modelValue
      },
      modelPlanStatus() {
        const tbtProductionPlanStatusHeader = this.modelValue.tbtProductionPlanStatusHeader
  
        if (_.isEmpty(tbtProductionPlanStatusHeader)) {
          return null
        } else {
          var value = tbtProductionPlanStatusHeader.find((x) => x.status === this.status)
          //console.log('modelPlanStatus', value)
          return value
        }
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
        wages: 0,
        status: 80,
      }
    },
    methods: {
      // ----- helper
      formatDateTime(date) {
        return date ? formatDateTime(date) : ''
      },
      formatDate(date) {
        return date ? formatDate(date) : ''
      },
      calculateWeightDifference(weightSend, weightReceived) {
        return calculateWeightDifference(weightSend, weightReceived)
      },
      checkBtn(action) {
        //console.log('checkBtn', this.modelPlanStatus)
        const disStatus = [100, 500]
        if (!disStatus.includes(this.model.status)) {
          switch (action) {
            case 'print':
              return this.modelPlanStatus ? false : true
            case 'add':
              return this.modelPlanStatus ? true : false
              //return true
            case 'edit':
              return this.modelPlanStatus ? false : true
            case 'delete':
              return true
            //return this.modelPlanStatus ? false : true
            case 'close':
              return true
          }
        } else {
          return true
        }
      },
  
      // ----- event
      addStatus() {
        console.log('addStatus')
        this.$emit('onShowAddStatus', 'scrubb')
      },
      updateStatus() {
        console.log('updateStatus')
        this.$emit('onShowUpdateStatus', 'scrubb')
      },
      onDelStatus(id) {
        swAlert.confirmSubmit(
          `ยืนยันลบงาน [ฝัง]`,
          `${this.model.wo}-${this.model.woNumber}`,
          async () => {
            //console.log('call submitPlan')
            await this.DelStatus(id)
          },
          null,
          null
        )
      },
  
      // ----- APIs
      async DelStatus(id) {
        //console.log(id)
        try {
          this.isLoading = true
  
          const params = {
            productionPlanId: this.model.id,
            wo: this.model.wo,
            woNumber: this.model.woNumber,
            id: id
          }
          const res = await api.jewelry.post(
            'ProductionPlan/ProductionPlanDeleteStatusDetail',
            params
          )
          if (res) {
            swAlert.success(
              ``,
              '',
              async () => {
                //this.closeModal()
                this.$emit('fetch')
              },
              null,
              null
            )
          }
  
          this.isLoading = false
        } catch (error) {
          this.isLoading = false
        }
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  @import '@/assets/scss/custom-style/standard-form.scss';
  
  .filter-container-custom {
    border: 1px solid #dddddd;
    border-radius: 5px;
  
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
    background-color: #f7f7f7;
    padding: 10px;
    height: calc(100vh - 160px);
    overflow: auto;
  }
  </style>
  