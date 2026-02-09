<template>
  <div class="filter-container-highlight-custom">
    <div class="form-col-container custom-center-container">
      <span class="bi bi-hammer title-text-white"></span>
      <span class="title-text-white">ประวัติการจ่ายเเละรับทองของเเต่ละเเผนก </span>
    </div>
  </div>
  <div>
    <DataTable
      :value="modelProcess"
      rowGroupMode="subheader"
      groupRowsBy="nameGroup"
      stripedRows
      showGridlines
    >
      <Column field="nameGroup"> </Column>
      <Column field="index" style="width: 10px">
        <template #body="slotProps">
          <span>{{ slotProps.index + 1 }}</span>
        </template>
      </Column>
      <Column field="statusName" header="แผนก" style="min-width: 100px"> </Column>
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
                  : Number(0).toFixed(3)
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
                  : ''
              }`
            }}
          </div>
        </template>
      </Column>
      <Column field="goldWeightDiff" header="น้ำหนัก ขาด/เกิน" style="min-width: 100px">
        <template #body="prop">
          <div
            style="font-weight: 600"
            :style="
              calculateWeightDifference(prop.data.goldWeightSend, prop.data.goldWeightCheck).style
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
    </DataTable>
  </div>
</template>

<script>
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { formatDate, formatDateTime } from '@/services/utils/dayjs'

import { calculateWeightDifference } from '@/services/helper/match.js'

export default {
  name: 'PlanOverview',
  components: {
    DataTable,
    Column
  },
  props: {
    modelValue: {
      type: Object,
      required: true,
      default: () => {}
    }
  },
  computed: {
    model() {
      console.log('overview model', this.modelValue)
      return this.modelValue
    }
  },
  watch: {
    modelValue: {
      handler() {
        console.log('overview model', this.modelValue)
        this.modelProcess = this.modelValue?.tbtProductionPlanStatusHeader
          ?.reduce((acc, status) => {
            if (
              status.tbtProductionPlanStatusDetail &&
              status.tbtProductionPlanStatusDetail.length > 0
            ) {
              const detailsWithStatus = status.tbtProductionPlanStatusDetail.map((detail) => ({
                ...detail,
                status: status.status,
                statusName: this.getStatusName(status.status),
                createDate: status.createDate
              }))
              return [...acc, ...detailsWithStatus]
            }
            return acc
          }, [])
          .sort((a, b) => {
            if (a.status !== b.status) {
              return a.status - b.status // เรียงจากน้อยไปมาก
            }
            // ถ้า status เท่ากัน ให้เรียงตามวันที่จากใหม่ไปเก่า
            return new Date(b.createDate) - new Date(a.createDate)
          })
      },
      immediate: true,
      deep: true
    }
  },
  data() {
    return {
      modelProcess: []
    }
  },
  methods: {
    formatDateTime(date) {
      return date ? formatDateTime(date) : ''
    },
    formatDate(date) {
      return date ? formatDate(date) : ''
    },

    getStatusName(status) {
      const statusMap = {
        50: 'แต่ง',
        60: 'ขัดดิบ',
        70: 'คัดพลอย',
        80: 'ฝัง',
        90: 'ขัดชุบ',
        95: 'บัตรต้นทุน',
        100: 'สำเร็จ'
        // เพิ่ม status อื่นๆ ตามต้องการ
      }
      return statusMap[status] || 'ไม่ระบุ'
    },
    calculateWeightDifference(weightSend, weightReceived) {
      return calculateWeightDifference(weightSend, weightReceived)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.filter-container-highlight-custom {
  border: 1px solid #dddddd;
  border-radius: 5px;

  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  background-color: var(--base-font-color);
  padding: 10px;
}
.custom-center-container {
  display: flex;
  align-items: center;
  justify-content: start;
}
</style>
