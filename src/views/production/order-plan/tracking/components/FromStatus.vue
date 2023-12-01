<template>
  <div class="from-status-container">
    <loading :isLoading="isLoading"></loading>
    <div class="data-container">
      <div class="data-header">
        <div class="mr-2 p-1 text-left" style="height: 31px; width: 450px" disable>
          <h5 style="color: var(--base-font-color)">สถานะการดำเนินงานผลิต</h5>
        </div>
        <div class="d-flex">
          <button
            class="btn btn-sm btn-warning mr-2"
            style="height: 31px; width: 250px"
            @click="onAddUpdate"
          >
            <span class="mr-1"><i class="bi bi-gem"></i></span>
            <span>เพิ่มสถานะการดำเนินงานผลิต</span>
          </button>

          <div v-if="checkNull(model.tbtProductionPlanStatusHeader)">
            <pdf
              class="btn btn-sm btn-info w-100"
              :modelValue="model"
              :matValue="modelMat"
              :statusValue="model.tbtProductionPlanStatusHeader"
              :statusMasterValue="modelMasterStatus"
              disable
            ></pdf>
          </div>
          <div v-else>
            <button class="btn btn-sm btn-secondary w-100" disable>
              <span class="mr-2"> <i class="bi bi-printer"></i></span>
              <span>พิมพ์รายละเอียดงานผลิต</span>
            </button>
          </div>
        </div>
      </div>
      <div v-if="checkNull(model.tbtProductionPlanStatusHeader)">
        <div v-for="(data, index) in model.tbtProductionPlanStatusHeader" :key="index">
          <panel v-if="onCheckStatus(data.status) === 1" toggleable class="mt-3">
            <template #header>
              <div class="flex align-items-center gap-2">
                <!-- <span class="font-bold">{{ `${data.statusNavigation.nameTh}` }}</span> -->
                <h5 class="title" style="margin: 0px">{{ getStatusName(data.status) }}</h5>
                <p class="description">{{ formatDateTime(data.createDate) }}</p>
              </div>
            </template>
            <template #icons>
              <button class="p-panel-header-icon p-link mr-2" @click="onDelStatus(data.id)">
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
                >
                  <Column field="gold" header="ทอง" style="width: 10%"> </Column>
                  <Column field="goldQtySend" header="จำนวนจ่าย" style="width: 10%"> </Column>
                  <Column field="goldWeightSend" header="นำหนักจ่าย" style="width: 10%"> </Column>
                  <Column field="goldQtyCheck" header="จำนวนรับ" style="width: 10%"> </Column>
                  <Column field="goldWeightCheck" header="น้ำหนักรับ" style="width: 10%"> </Column>
                  <Column field="goldWeightDiff" header="ขาด" style="width: 10%">
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
                  <!-- <Column field="goldWeightDiffPercent" header="ทอง" style="width: 10%"> </Column> -->
                  <Column field="worker" header="ช่างรับงาน" style="width: 20%"> </Column>
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
          <panel v-if="onCheckStatus(data.status) === 2" toggleable class="mt-3">
            <template #header>
              <div class="flex align-items-center gap-2">
                <!-- <span class="font-bold">{{ `${data.statusNavigation.nameTh}` }}</span> -->
                <h5 class="title" style="margin: 0px">{{ getStatusName(data.status) }}</h5>
                <p class="description">{{ formatDateTime(data.createDate) }}</p>
              </div>
            </template>
            <template #icons>
              <button class="p-panel-header-icon p-link mr-2" @click="onDelStatus(data.id)">
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
                  <p class="description">ผู้คัดพลอย</p>
                  <p class="title">{{ data.checkName }}</p>
                </div>
                <div>
                  <p class="description">วันคัดพลอย</p>
                  <p class="title">{{ formatDate(data.checkDate) }}</p>
                </div>
              </div>
              <div v-if="data.tbtProductionPlanStatusDetail">
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
          <panel v-if="onCheckStatus(data.status) === 3" toggleable class="mt-3">
            <template #header>
              <div class="flex align-items-center gap-2">
                <!-- <span class="font-bold">{{ `${data.statusNavigation.nameTh}` }}</span> -->
                <h5 class="title" style="margin: 0px">{{ getStatusName(data.status) }}</h5>
                <p class="description">{{ formatDateTime(data.createDate) }}</p>
              </div>
            </template>
            <template #icons>
              <button class="p-panel-header-icon p-link mr-2" @click="onDelStatus(data.id)">
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
        </div>
      </div>
      <div v-else class="mt-5 text-center" style="height: 31px; width: 100%" disable>
        <h6 style="color: var(--base-sub-color)">--- ไม่พบสถานะการดำเนินงานสินค้า ---</h6>
      </div>
      <!-- <div v-if="model.tbtProductionPlanStatusDetail">
        <Timeline
          :value="model.tbtProductionPlanStatusDetail"
          align="alternate"
          class="customized-timeline"
        >
          <template #marker>
            <span class="icon-timeline-container">
              <i class="bi bi-calendar-check text-success"></i>
            </span>
          </template>
          <template #content="slotProps">
            <Card class="mt-2">
              <template #title>
                <div class="title">
                  {{ getStatusName(slotProps.item.status) }}
                </div>
              </template>
              <template #subtitle>
                <div class="title">
                  วันที่: {{ formatDate(slotProps.item.assignDate) }} | ผู้ทำ:
                  {{ slotProps.item.assignBy }}
                </div>
                <div v-if="slotProps.item.assignTo">
                  <label class="title">ช่างรับงาน: {{ slotProps.item.assignTo }}</label>
                </div>
                <div v-if="slotProps.item.assignDetail">
                  <label class="title">รายละเอียด: {{ slotProps.item.receiveDetail }}</label>
                </div>
              </template>
              <template #content>
                <div v-if="slotProps.item.receiveDate">
                  <h4 class="title">ตรวจรับ</h4>
                  <div>
                    <label class="title">
                      วันที่: {{ formatDate(slotProps.item.receiveDate) }} | ผู้ทำ:
                      {{ slotProps.item.receiveBy }}
                    </label>
                  </div>
                  <div>
                    <label class="title"> รายละเอียด: {{ slotProps.item.receiveDetail }} </label>
                  </div>
                </div>
                <div v-if="slotProps.item.remark">
                  <h4 class="title">รายละเอียดอื่นๆ</h4>
                  <div class="title">
                    <label>{{ slotProps.item.remark }} </label>
                  </div>
                </div>
                <button class="btn btn-sm btn-danger" @click="onDelStatus(slotProps.item.id)">
                  <i class="bi bi-trash-fill"></i>
                </button>
              </template>
            </Card>
          </template>
        </Timeline>
      </div> -->
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import _ from 'lodash'

const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))
const pdf = defineAsyncComponent(() => import('@/components/pdf-make/SavePDFOrderStatus.vue'))

//import Timeline from 'primevue/timeline'
//import Card from 'primevue/card'
//import Fieldset from 'primevue/fieldset'
import Panel from 'primevue/panel'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

//import Accordion from 'primevue/accordion'
//import AccordionTab from 'primevue/accordiontab'

import { formatDate, formatDateTime } from '@/utils/moment'
import moment from 'dayjs'
import api from '@/axios/axios-config.js'

import swAlert from '@/js/alert/sweetAlerts.js'
export default {
  components: {
    loading,
    Panel,
    DataTable,
    Column,
    pdf
    //Timeline,
    //Card
    //Accordion,
    //AccordionTab
  },
  props: {
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
    masterStatus: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  computed: {
    model() {
      //console.log(this.modelValue)
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
      isLoading: false,
      masterStatusFetch: null,
      groupedData: {}
    }
  },
  methods: {
    onAddUpdate() {
      this.$emit('showModalAddUpdate')
    },

    // ----- helper ------ //
    getStatusName(id) {
      //console.log(id)
      //console.log(this.modelMasterStatus)
      if (this.modelMasterStatus.length) {
        const status = this.modelMasterStatus.filter((x) => x.id === id)
        return status[0].nameTh
      } else {
        //console.log(this.masterStatusFetch)

        const status = this.masterStatusFetch.filter((x) => x.id === id)
        return status[0].nameTh
      }
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
    onCheckStatus(status) {
      if (status === 50 || status === 60 || status === 80 || status === 90) {
        return 1
      } else if (status === 70) {
        return 2
      } else if (status === 85) {
        return 3
      }
    },
    checkNull(item) {
      //console.log(!_.isEmpty(item))
      return !_.isEmpty(item)
    },
    //getStatusName(status) {},

    // ------ api ---------//
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
    async DelStatus(id) {
      console.log(id)
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
              this.$emit('fetchData')
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
  async created() {
    if (!this.modelMasterStatus.length) {
      if (!this.masterStatusFetch) {
        //console.log('fetch')
        this.fetchMaterStatus()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.data-container {
  border: 1px solid #dddddd;
  border-radius: 5px;
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  background-color: #f7f7f7;
  //background-color: var(--base-color);
  padding: 20px 40px;
  margin-bottom: 20px;
}
.data-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
// @media screen and (max-width: 960px) {
//   ::v-deep(.customized-timeline) {
//     .p-timeline-event:nth-child(even) {
//       flex-direction: row !important;

//       .p-timeline-event-content {
//         text-align: left !important;
//       }
//     }

//     .p-timeline-event-opposite {
//       flex: 0;
//     }
//   }
// }
// .icon-timeline-container {
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   //width: 150px;
// }
.title {
  color: var(--base-font-color);
}
.text-container {
  display: grid;
}

:deep(.p-panel .p-panel-header) {
  border: 1px solid var(--base-color);
  padding: 1 rem;
  background: var(--base-color);
  color: #343a40;
  border-top-right-radius: 6px;
  border-top-left-radius: 6px;
}
p {
  margin-bottom: 0px;
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
  grid-template-columns: 50% 50%;
  gap: 10px;
  margin-bottom: 10px;
}
</style>
