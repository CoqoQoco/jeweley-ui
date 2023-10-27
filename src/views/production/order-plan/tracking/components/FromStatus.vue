<template>
  <div class="from-status-container">
    <loading :isLoading="isLoading"></loading>
    <div class="data-container">
      <div class="data-header">
        <div
          class="mr-2 p-1 text-center bg-success text-white"
          style="height: 31px; width: 250px"
          disable
        >
          รายละเอียดสถานะงาน
        </div>
        <button
          class="btn btn-sm btn-warning"
          style="height: 31px; width: 250px"
          @click="onAddUpdate"
        >
          <span class="mr-1"><i class="bi bi-gem"></i></span>
          <span>บันทึกสถานะงาน</span>
        </button>
      </div>
      <div v-if="model.tbtProductionPlanStatusDetail">
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
              <!-- <template #footer>
                <button class="btn btn-sm btn-danger">
                  <i class="bi bi-trash-fill"></i>
                </button>
              </template> -->
            </Card>
          </template>
        </Timeline>
      </div>
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))

import Timeline from 'primevue/timeline'
import Card from 'primevue/card'
import { formatDate, formatDateTime } from '@/utils/moment'
import moment from 'moment'
import api from '@/axios/axios-config.js'

import swAlert from '@/js/alert/sweetAlerts.js'
export default {
  components: {
    loading,
    Timeline,
    Card
  },
  props: {
    modelValue: {
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
      return this.modelValue
    },
    modelMasterStatus() {
      return this.masterStatus
    }
  },
  data() {
    return {
      isLoading: false,
      masterStatusFetch: null
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
@media screen and (max-width: 960px) {
  ::v-deep(.customized-timeline) {
    .p-timeline-event:nth-child(even) {
      flex-direction: row !important;

      .p-timeline-event-content {
        text-align: left !important;
      }
    }

    .p-timeline-event-opposite {
      flex: 0;
    }
  }
}
.icon-timeline-container {
  display: flex;
  justify-content: center;
  align-items: center;
  //width: 150px;
}
.title {
  color: var(--base-font-color);
}
.text-container {
  display: grid;
}
</style>
