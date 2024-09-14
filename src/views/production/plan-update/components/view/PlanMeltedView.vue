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
            title="หลอม"
            :disabled="checkBtn('add')"
            @click="addStatus()"
          >
            <span class="bi bi-database-fill-add"></span>
          </button>
          <button
            :class="['btn btn-sm ml-2', checkBtn('edit') ? 'btn-secondary' : 'btn-warning']"
            title="เเก้ไข"
            :disabled="checkBtn('edit')"
            @click="updateStatus()"
          >
            <span class="bi bi-brush"></span>
          </button>
          <button
            :class="['btn btn-sm ml-2', checkBtn('delete') ? 'btn-secondary' : 'btn-red']"
            title="ลบ"
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
          <span class="title-text">ชื่อผู้รับหลอม</span>
          <span class="desc-text">{{ modelPlanStatus.sendName }}</span>
        </div>
        <!-- date -->
        <div class="d-flex flex-column">
          <span class="title-text">วันที่หลอม</span>
          <span class="desc-text">{{ formatDate(modelPlanStatus.sendDate) }}</span>
        </div>
        <div></div>
        <div></div>
      </div>

      <div class="line"></div>

      <!-- grid -->
      <div class="mt-3 mb-4">
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
          <Column field="gold" header="ทอง" style="min-width: 80px"> </Column>
          <Column field="requestDate" header="วันที่" style="min-width: 120px">
            <template #body="slotProps">
              <div class="text-left">
                {{ formatDate(slotProps.data.requestDate) }}
              </div>
            </template>
          </Column>
          <Column field="goldQtySend" header="จำนวน" style="min-width: 80px"> </Column>
          <Column field="goldWeightSend" header="นำหนัก" style="min-width: 80px">
            <template #body="slotProps">
              <div>
                {{
                  `${
                    slotProps.data.goldWeightSend
                      ? Number(slotProps.data.goldWeightSend).toFixed(2).toLocaleString()
                      : ''
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
        var value = tbtProductionPlanStatusHeader.find((x) => x.status === 500)
        console.log('modelPlanStatus', value)
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
      wages: 0
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
    checkBtn(action) {
      console.log('checkBtn', this.modelPlanStatus)
      const disStatus = [100, 500]
      if (!disStatus.includes(this.model.status)) {
        switch (action) {
          case 'print':
            return this.modelPlanStatus ? false : true
          case 'add':
            return this.modelPlanStatus ? true : false
          case 'edit':
            return this.modelPlanStatus ? false : true
          case 'delete':
            return this.modelPlanStatus ? false : true
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
      this.$emit('onShowAddStatus', 'melted')
    },
    updateStatus() {
      console.log('updateStatus')
      this.$emit('onShowUpdateStatus', 'casting')
    },
    onDelStatus(id) {
      swAlert.confirmSubmit(
        `ยืนยันลบงาน [จ่ายเเต่ง]`,
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
