<template>
  <div class="form-container">
    <!-- <loading :isLoading="isLoading"></loading> -->
    <div class="data-container">
      <div class="data-title-container mb-2">
        <div class="data-title-custom">
          <span>สถานะการผลิตล่าสุด : </span>
          <span>{{ getStatusName(model.status) }}</span>
        </div>
      </div>
      <div class="data-status-container" v-if="checkNull(model.tbtProductionPlanStatusHeader)">
        <div v-for="(data, index) in model.tbtProductionPlanStatusHeader" :key="index">
          <panel v-if="onCheckStatus(data.status) === 1" toggleable class="mt-2">
            <template #header>
              <div class="flex align-items-center gap-2">
                <!-- <span class="font-bold">{{ `${data.statusNavigation.nameTh}` }}</span> -->
                <h5 class="title" style="margin: 0px">{{ getStatusName(data.status) }}</h5>
                <p class="description">{{ formatDateTime(data.updateDate) }}</p>
              </div>
            </template>
            <template #icons>
              <button
                class="p-panel-header-icon p-link mr-2"
                @click="onUpdateStatus(data)"
                title="เเก้ไข"
              >
                <span><i class="bi bi-brush text-warning"></i></span>
              </button>
              <button
                v-if="data.status === 80"
                :disabled="!checkNull(data.tbtProductionPlanStatusDetail)"
                class="p-panel-header-icon p-link mr-2"
                title="พิมพ์สลิป"
                @click="onShowPrintEmbedBill(data)"
              >
                <span><i class="bi bi-printer text-info"></i></span>
              </button>
              <button
                class="p-panel-header-icon p-link mr-2"
                @click="onDelStatus(data.id)"
                title="ลบ"
              >
                <span><i class="bi bi-trash-fill text-danger"></i></span>
              </button>
            </template>
            <div>
              <div class="status-detail-container">
                <div>
                  <p class="description">จ่ายงาน</p>
                  <p class="title">{{ data.sendName }}</p>
                </div>
                <div>
                  <p class="description">วันจ่ายงาน</p>
                  <p class="title">{{ formatDate(data.sendDate) }}</p>
                </div>
                <div>
                  <p class="description">รับงาน</p>
                  <p class="title">{{ data.checkName }}</p>
                </div>
                <div>
                  <p class="description">วันรับงาน</p>
                  <p class="title">{{ formatDate(data.checkDate) }}</p>
                </div>
              </div>
              <div v-if="data.tbtProductionPlanStatusDetail">
                <DataTable
                  :value="data.tbtProductionPlanStatusDetail"
                  class="p-datatable-sm"
                  showGridlines
                  scrollable
                >
                  <Column field="gold" header="ทอง" style="width: 120px"> </Column>
                  <Column field="requestDate" header="วันที่" style="width: 120px">
                    <template #body="slotProps">
                      <div class="text-left">
                        {{ formatDate(slotProps.data.requestDate) }}
                      </div>
                    </template>
                  </Column>
                  <Column field="goldQtySend" header="จำนวนจ่าย" style="width: 120px"> </Column>
                  <Column field="goldWeightSend" header="นำหนักจ่าย" style="width: 120px">
                    <template #body="slotProps">
                      <div>
                        {{
                          `${
                            slotProps.data.goldWeightSend
                              ? Number(slotProps.data.goldWeightSend).toFixed(2).toLocaleString()
                              : Number(wages).toFixed(2).toLocaleString()
                          }`
                        }}
                      </div>
                    </template>
                  </Column>
                  <Column field="goldQtyCheck" header="จำนวนรับ" style="width: 120px"> </Column>
                  <Column field="wages" header="ค่าเเรงต่อชิ้น" style="width: 120px">
                    <template #body="slotProps">
                      <div class="text-right">
                        {{
                          `${
                            slotProps.data.wages
                              ? Number(slotProps.data.wages).toFixed(2).toLocaleString()
                              : Number(wages).toFixed(2).toLocaleString()
                          }`
                        }}
                      </div>
                    </template>
                  </Column>
                  <Column field="goldWeightCheck" header="น้ำหนักรับ" style="width: 120px">
                    <template #body="slotProps">
                      <div>
                        {{
                          `${
                            slotProps.data.goldWeightCheck
                              ? Number(slotProps.data.goldWeightCheck).toFixed(2).toLocaleString()
                              : ''
                          }`
                        }}
                      </div>
                    </template>
                  </Column>
                  <Column field="goldWeightDiff" header="ขาด" style="width: 120px">
                    <template #body="prop">
                      <div v-if="prop.data.goldWeightDiff">
                        {{
                          `${
                            prop.data.goldWeightDiff
                          } (${prop.data.goldWeightDiffPercent.toLocaleString()}%)`
                        }}
                      </div>
                      <div v-else>-</div>
                    </template>
                  </Column>
                  <Column field="description" header="รายละเอียด" style="min-width: 120px">
                    <template #editor="{ data, field }">
                      <input
                        type="text"
                        :class="data[field] ? `` : `bg-warning`"
                        class="form-control"
                        v-model="data[field]"
                      />
                    </template>
                  </Column>
                  <!-- <Column field="goldWeightDiffPercent" header="ทอง" style="width: 10%"> </Column> -->
                  <Column
                    field="worker"
                    :header="data.status === 90 ? `ช่างขัด` : `ช่างรับงาน`"
                    style="min-width: 120px"
                  >
                    <template #body="slotProps">
                      <div class="text-center">
                        {{
                          `${
                            slotProps.data.worker
                              ? `${slotProps.data.worker} - ${slotProps.data.workerName}`
                              : null
                          }`
                        }}
                      </div>
                    </template>
                  </Column>
                  <Column
                    v-if="data.status === 90"
                    field="workerSub"
                    header="ช่างชุบ"
                    style="min-width: 120px"
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
                  <Column field="totalWages" header="รวมค่าแรงช่าง" style="width: 120px">
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
                    <!-- <row>
                      <Column footer="lastYearTotal" />
                      <Column footer="lastYearTotal" />
                      <Column footer="lastYearTotal" />
                    </row> -->
                    <div class="d-flex justify-content-between">
                      <div>ทั้งหมด {{ data.tbtProductionPlanStatusDetail.length }} รายการ</div>
                      <div>
                        รวมค่าแรงทั้งหมด
                        {{
                          `${
                            data.wagesTotal
                              ? Number(data.wagesTotal).toFixed(2).toLocaleString()
                              : Number(wages).toFixed(2).toLocaleString()
                          }`
                        }}
                      </div>
                    </div>
                  </template>
                </DataTable>
              </div>
              <div class="status-remark-container mt-3">
                <div>
                  <p class="description">หมายเหตุ - 1</p>
                  <p class="title">{{ `${data.remark1 ? data.remark1 : '---'}` }}</p>
                </div>
                <div>
                  <p class="description">หมายเหตุ - 2</p>
                  <p class="title">{{ `${data.remark2 ? data.remark2 : '---'}` }}</p>
                </div>
              </div>
            </div>
          </panel>
          <panel v-if="onCheckStatus(data.status) === 2" toggleable class="mt-2">
            <template #header>
              <div class="flex align-items-center gap-2">
                <!-- <span class="font-bold">{{ `${data.statusNavigation.nameTh}` }}</span> -->
                <h5 class="title" style="margin: 0px">{{ getStatusName(data.status) }}</h5>
                <p class="description">{{ formatDateTime(data.updateDate) }}</p>
              </div>
            </template>
            <template #icons>
              <button
                class="p-panel-header-icon p-link mr-2"
                @click="onUpdateStatus(data)"
                title="เเก้ไข"
              >
                <span><i class="bi bi-brush text-warning"></i></span>
              </button>
              <button
                class="p-panel-header-icon p-link mr-2"
                @click="onDelStatus(data.id)"
                title="ลบ"
              >
                <span><i class="bi bi-trash-fill text-danger"></i></span>
              </button>
            </template>
            <div>
              <div class="status-gem-selection-container">
                <!-- <div>
                  <p class="description">จ่ายงาน</p>
                  <p class="title">{{ data.sendName }}</p>
                </div>
                <div>
                  <p class="description">วันจ่ายงาน</p>
                  <p class="title">{{ formatDate(data.sendDate) }}</p>
                </div> -->
                <div>
                  <p class="description">ผู้คัดพลอย</p>
                  <p class="title">{{ data.checkName }}</p>
                </div>
                <div>
                  <p class="description">วันคัดพลอย</p>
                  <p class="title">{{ formatDate(data.checkDate) }}</p>
                </div>
                <div>
                  <p class="description">ค่าเเรงคัดพลอย</p>
                  <p class="title">
                    {{
                      data.wagesTotal ? Number(data.wagesTotal).toFixed(2).toLocaleString() : '0'
                    }}
                  </p>
                </div>
              </div>
              <div v-if="data.tbtProductionPlanStatusDetail">
                <DataTable
                  :value="data.tbtProductionPlanStatusDetail"
                  class="p-datatable-sm"
                  showGridlines
                >
                  <Column field="gold" header="ทอง" style="width: 20%"> </Column>
                  <Column field="requestDate" header="วันที่" style="width: 20%">
                    <template #body="slotProps">
                      <div class="text-left">
                        {{ formatDate(slotProps.data.requestDate) }}
                      </div>
                    </template>
                  </Column>
                  <Column field="goldQtyCheck" header="จำนวนรับ" style="width: 10%"> </Column>
                  <Column field="goldWeightCheck" header="น้ำหนักรับ" style="width: 10%"> </Column>
                  <Column field="worker" header="ช่างคัดพลอย" style="width: 20%">
                    <template #body="slotProps">
                      <div class="text-center">
                        {{
                          `${
                            slotProps.data.worker
                              ? `${slotProps.data.worker} - ${slotProps.data.workerName}`
                              : null
                          }`
                        }}
                      </div>
                    </template>
                  </Column>
                  <Column field="workerSub" header="ช่างคัดเพชร" style="width: 20%">
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
                  <template #footer>
                    <div class="d-flex justify-content-between">
                      <div>ทั้งหมด {{ data.tbtProductionPlanStatusDetail.length }} รายการ</div>
                      <!-- <div @click="addMat">
                        <i class="bi bi-plus-square-fill"></i>
                      </div> -->
                    </div>
                  </template>
                </DataTable>
              </div>
              <div class="status-remark-container mt-3">
                <div>
                  <p class="description">หมายเหตุ - 1</p>
                  <p class="title">{{ `${data.remark1 ? data.remark1 : '---'}` }}</p>
                </div>
                <div>
                  <p class="description">หมายเหตุ - 2</p>
                  <p class="title">{{ `${data.remark2 ? data.remark2 : '---'}` }}</p>
                </div>
              </div>
            </div>
          </panel>
          <panel v-if="onCheckStatus(data.status) === 3" toggleable class="mt-2">
            <template #header>
              <div class="flex align-items-center gap-2">
                <!-- <span class="font-bold">{{ `${data.statusNavigation.nameTh}` }}</span> -->
                <h5 class="title" style="margin: 0px">{{ getStatusName(data.status) }}</h5>
                <p class="description">{{ formatDateTime(data.updateDate) }}</p>
              </div>
            </template>
            <template #icons>
              <button
                class="p-panel-header-icon p-link mr-2"
                @click="onUpdateStatus(data)"
                title="เเก้ไข"
              >
                <span><i class="bi bi-brush text-warning"></i></span>
              </button>
              <button
                class="p-panel-header-icon p-link mr-2"
                @click="onDelStatus(data.id)"
                title="ลบ"
              >
                <span><i class="bi bi-trash-fill text-danger"></i></span>
              </button>
            </template>
            <div>
              <div class="status-remark-container">
                <!-- <div>
                  <p class="description">จ่ายงาน</p>
                  <p class="title">{{ data.sendName }}</p>
                </div>
                <div>
                  <p class="description">วันจ่ายงาน</p>
                  <p class="title">{{ formatDate(data.sendDate) }}</p>
                </div> -->
                <div>
                  <p class="description">ผู้ตรวจ CVD</p>
                  <p class="title">{{ data.checkName }}</p>
                </div>
                <div>
                  <p class="description">วันตรวจ CVD</p>
                  <p class="title">{{ formatDate(data.checkDate) }}</p>
                </div>
              </div>
              <!-- <div v-if="data.tbtProductionPlanStatusDetail">
                <DataTable
                  :value="data.tbtProductionPlanStatusDetail"
                  class="p-datatable-sm"
                  showGridlines
                >
                  <Column field="gold" header="ทอง" style="width: 20%"> </Column>
                  <Column field="goldQtyCheck" header="จำนวนรับ" style="width: 20%"> </Column>
                  <Column field="goldWeightCheck" header="น้ำหนักรับ" style="width: 20%"> </Column>
                  <template #footer>
                    <div class="d-flex justify-content-between">
                      <div>ทั้งหมด {{ data.tbtProductionPlanStatusDetail.length }} รายการ</div>
                      <i class="bi bi-plus-square-fill"></i>
                    </div>
                  </template>
                </DataTable>
              </div> -->
              <div class="status-remark-container mt-3">
                <div>
                  <p class="description">หมายเหตุ - 1</p>
                  <p class="title">{{ `${data.remark1 ? data.remark1 : '---'}` }}</p>
                </div>
                <div>
                  <p class="description">หมายเหตุ - 2</p>
                  <p class="title">{{ `${data.remark2 ? data.remark2 : '---'}` }}</p>
                </div>
              </div>
            </div>
          </panel>
          <panel v-if="onCheckStatus(data.status) === 4" toggleable class="mt-2">
            <template #header>
              <div class="flex align-items-center gap-2">
                <!-- <span class="font-bold">{{ `${data.statusNavigation.nameTh}` }}</span> -->
                <h5 class="title" style="margin: 0px">{{ getStatusName(data.status) }}</h5>
                <p class="description">{{ formatDateTime(data.updateDate) }}</p>
              </div>
            </template>
            <template #icons>
              <button
                class="p-panel-header-icon p-link mr-2"
                @click="onUpdateStatus(data)"
                title="เเก้ไข"
              >
                <span><i class="bi bi-brush text-warning"></i></span>
              </button>
              <button
                class="p-panel-header-icon p-link mr-2"
                @click="onDelStatus(data.id)"
                title="ลบ"
              >
                <span><i class="bi bi-trash-fill text-danger"></i></span>
              </button>
            </template>
            <div>
              <div class="status-gem-selection-container">
                <!-- <div>
                  <p class="description">จ่ายงาน</p>
                  <p class="title">{{ data.sendName }}</p>
                </div>
                <div>
                  <p class="description">วันจ่ายงาน</p>
                  <p class="title">{{ formatDate(data.sendDate) }}</p>
                </div> -->
                <div>
                  <p class="description">ผู้หล่องาน</p>
                  <p class="title">{{ data.checkName }}</p>
                </div>
                <div>
                  <p class="description">วันหล่องาน</p>
                  <p class="title">{{ formatDate(data.checkDate) }}</p>
                </div>
                <!-- <div>
                  <p class="description">ค่าเเรงคัดพลอย</p>
                  <p class="title">
                    {{
                      data.wagesTotal ? Number(data.wagesTotal).toFixed(2).toLocaleString() : '0'
                    }}
                  </p>
                </div> -->
              </div>
              <div v-if="data.tbtProductionPlanStatusDetail">
                <DataTable
                  :value="data.tbtProductionPlanStatusDetail"
                  class="p-datatable-sm"
                  showGridlines
                >
                  <Column field="gold" header="ทอง" style="width: 20%"> </Column>
                  <Column field="requestDate" header="วันที่" style="width: 20%">
                    <template #body="slotProps">
                      <div class="text-left">
                        {{ formatDate(slotProps.data.requestDate) }}
                      </div>
                    </template>
                  </Column>
                  <Column field="goldQtyCheck" header="จำนวนรับ" style="width: 20%"> </Column>
                  <Column field="goldWeightCheck" header="น้ำหนักรับ" style="width: 20%"> </Column>
                  <template #footer>
                    <div class="d-flex justify-content-between">
                      <div>ทั้งหมด {{ data.tbtProductionPlanStatusDetail.length }} รายการ</div>
                      <!-- <div @click="addMat">
                        <i class="bi bi-plus-square-fill"></i>
                      </div> -->
                    </div>
                  </template>
                </DataTable>
              </div>
              <div class="status-remark-container mt-3">
                <div>
                  <p class="description">หมายเหตุ - 1</p>
                  <p class="title">{{ `${data.remark1 ? data.remark1 : '---'}` }}</p>
                </div>
                <div>
                  <p class="description">หมายเหตุ - 2</p>
                  <p class="title">{{ `${data.remark2 ? data.remark2 : '---'}` }}</p>
                </div>
              </div>
            </div>
          </panel>
          <panel v-if="onCheckStatus(data.status) === 5" toggleable class="mt-2">
            <template #header>
              <div class="flex align-items-center gap-2">
                <!-- <span class="font-bold">{{ `${data.statusNavigation.nameTh}` }}</span> -->
                <h5 class="title" style="margin: 0px">{{ getStatusName(data.status) }}</h5>
                <p class="description">{{ formatDateTime(data.updateDate) }}</p>
              </div>
            </template>
            <template #icons>
              <button
                class="p-panel-header-icon p-link mr-2"
                @click="onUpdateStatus(data)"
                title="เเก้ไข"
              >
                <span><i class="bi bi-brush text-warning"></i></span>
              </button>
              <button
                class="p-panel-header-icon p-link mr-2"
                @click="onDelStatus(data.id)"
                title="ลบ"
              >
                <span><i class="bi bi-trash-fill text-danger"></i></span>
              </button>
            </template>
            <div>
              <div class="status-remark-container">
                <!-- <div>
                  <p class="description">จ่ายงาน</p>
                  <p class="title">{{ data.sendName }}</p>
                </div>
                <div>
                  <p class="description">วันจ่ายงาน</p>
                  <p class="title">{{ formatDate(data.sendDate) }}</p>
                </div> -->
                <div>
                  <p class="description">ผู้ประเมินราคา</p>
                  <p class="title">{{ data.checkName }}</p>
                </div>
                <div>
                  <p class="description">วันประเมินราคา</p>
                  <p class="title">{{ formatDate(data.checkDate) }}</p>
                </div>
              </div>
              <!-- <div v-if="data.tbtProductionPlanStatusDetail">
                <DataTable
                  :value="data.tbtProductionPlanStatusDetail"
                  class="p-datatable-sm"
                  showGridlines
                >
                  <Column field="gold" header="ทอง" style="width: 20%"> </Column>
                  <Column field="goldQtyCheck" header="จำนวนรับ" style="width: 20%"> </Column>
                  <Column field="goldWeightCheck" header="น้ำหนักรับ" style="width: 20%"> </Column>
                  <template #footer>
                    <div class="d-flex justify-content-between">
                      <div>ทั้งหมด {{ data.tbtProductionPlanStatusDetail.length }} รายการ</div>
                      <i class="bi bi-plus-square-fill"></i>
                    </div>
                  </template>
                </DataTable>
              </div> -->
              <div class="status-remark-container mt-3">
                <div>
                  <p class="description">หมายเหตุ - 1</p>
                  <p class="title">{{ `${data.remark1 ? data.remark1 : '---'}` }}</p>
                </div>
                <div>
                  <p class="description">หมายเหตุ - 2</p>
                  <p class="title">{{ `${data.remark2 ? data.remark2 : '---'}` }}</p>
                </div>
              </div>
            </div>
          </panel>
        </div>
      </div>
    </div>
    <div class="d-flex justify-content-end mt-3">
      <pdf
        class="btn btn-sm btn-info btn-custom mr-2"
        :modelValue="model"
        :matValue="modelMat"
        :statusValue="model.tbtProductionPlanStatusHeader"
        :statusMasterValue="modelMasterStatus"
        disable
      >
      </pdf>
      <button class="btn btn-sm btn-warning btn-custom" @click="onShowFormStatusAdd">
        <span>
          <i class="bi bi-plus mr-2"></i>
        </span>
        <span>เพิ่มสถานะการผลิต</span>
      </button>
    </div>
    <FormStatusUpdate
      :isShow="isShowFormStatusUpdate"
      :modelValue="model"
      :modelMatValue="matStatusItemUpdate"
      :masterStatus="masterStatus"
      :masterGold="masterGold"
      @closeModal="onCloseFormStatusUpdate"
      @fetch="fetchFormStatusUpdate"
    ></FormStatusUpdate>
    <PrintEnbedBill
      :isShow="isShowPrintEmbedBill"
      :modelValue="model"
      :modelValueStatus="embedDataPrint"
      @closeModal="onClosePrintEmbedBill"
    ></PrintEnbedBill>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

//const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))
const pdf = defineAsyncComponent(() => import('@/components/pdf-make/SavePDFOrderStatus.vue'))

import Panel from 'primevue/panel'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

import FormStatusUpdate from './FormStatusUpdate.vue'

import _ from 'lodash'
import { formatDate, formatDateTime } from '@/services/utils/dayjs'
import moment from 'dayjs'
import api from '@/axios/axios-config.js'
import swAlert from '@/services/alert/sweetAlerts.js'

import PrintEnbedBill from './FormPrintEmbedBill.vue'

export default {
  components: {
    pdf,
    Panel,
    DataTable,
    Column,
    FormStatusUpdate,
    PrintEnbedBill
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
    modelMat() {
      return this.modelMatValue
    },
    modelMasterStatus() {
      return this.masterStatus
    }
  },
  data() {
    return {
      // --- flag --- //
      wages: 0,
      isShowFormStatusUpdate: false,
      isShowPrintEmbedBill: false,

      // --- form --- //
      matStatusItemUpdate: {},
      embedDataPrint: {}
    }
  },
  methods: {
    // --- controller --- //
    onShowFormStatusAdd() {
      this.$emit('onShowFormStatusAdd')
    },
    getStatusName(id) {
      if (this.modelMasterStatus.length) {
        const status = this.modelMasterStatus.filter((x) => x.id === id)
        return status[0].nameTh
      } else {
        const status = this.masterStatusFetch.filter((x) => x.id === id)
        return status[0].nameTh
      }
    },
    onCheckStatus(status) {
      if (status === 50 || status === 60 || status === 80 || status === 90) {
        return 1
      } else if (status === 70) {
        return 2
      } else if (status === 85) {
        return 3
      } else if (status === 55) {
        return 4
      } else if (status === 95) {
        return 5
      }
    },
    checkNull(item) {
      return !_.isEmpty(item)
    },
    formatDateTime(date) {
      return date ? formatDateTime(date) : ''
    },
    formatDate(date) {
      return date ? formatDate(date) : ''
    },
    showDate(date) {
      return date ? moment(date).format('DD/MM/yyyy') : ''
    },
    onDelStatus(id) {
      swAlert.confirmSubmit(
        ``,
        'ยืนยันลบสถานะ',
        async () => {
          await this.DelStatus(id)
        },
        null,
        null
      )
    },
    onUpdateStatus(item) {
      //console.log(item)
      this.matStatusItemUpdate = { ...item }
      this.isShowFormStatusUpdate = true
    },
    onCloseFormStatusUpdate() {
      this.isShowFormStatusUpdate = false
    },
    fetchFormStatusUpdate() {
      this.isShowFormStatusUpdate = false
      this.$emit('fetch')
    },
    onShowPrintEmbedBill(data) {
      //console.log(data)
      this.embedDataPrint = { ...data }
      this.isShowPrintEmbedBill = true
    },
    onClosePrintEmbedBill() {
      this.isShowPrintEmbedBill = false
    },

    // --- APIs --- //
    async fetchMaterStatus() {
      try {
        this.isLoading = true
        const res = await api.jewelry.get('ProductionPlan/GetProductionPlanStatus')
        if (res) {
          //this.data = [...res.data]
          this.masterStatusFetch = [...res]
        }
        //console.log(this.data)
        this.isLoading = false
        //return res
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    },
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
  },
  mounted() {
    if (!this.modelMasterStatus.length) {
      if (!this.masterStatusFetch) {
        this.fetchMaterStatus()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
:deep(.p-panel .p-panel-header) {
  border: 1px solid var(--base-color);
  padding: 10px;
  background: var(--base-fon-color);
  color: #343a40;
  border-top-right-radius: 6px;
  border-top-left-radius: 6px;
}
p {
  margin-bottom: 0px;
}
.data-container {
  border: 1px solid #dddddd;
  border-radius: 5px;
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  background-color: #f7f7f7;
  //padding: 10px;
  height: calc(100vh - 260px);
  //overflow: auto;
}
.data-title-container {
  height: 50px;
  background-color: var(--base-font-color);
  //color: #dddddd;
  display: flex;
  justify-content: space-between;
  //margin: 0;
  padding: 0px 20px;
}
.data-status-container {
  padding: 10px 10px;
  overflow: auto;
  height: calc(100vh - 330px);
}
.data-title {
  font-size: 18px;
  color: var(--base-font-color);
  align-self: center;
}
.data-title-custom {
  font-size: 18px;
  color: #ffff;
  align-self: center;
}
.description {
  font-size: 12px;
}
.status-detail-container {
  display: grid;
  grid-template-columns: 25% 25% 25% 25%;
  gap: 10px;
  margin-bottom: 10px;
}
.status-remark-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 10px;
}
.status-gem-selection-container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
  margin-bottom: 10px;
}
.title {
  font-size: 14px;
  font-weight: 600;
  width: 100%;
  color: var(--base-font-color);
}
</style>
