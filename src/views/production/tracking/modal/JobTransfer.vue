<template>
  <div>
    <loading :isLoading="isLoading"></loading>
    <modal :showModal="isShowModal" @closeModal="closeModal">
      <template v-slot:content>
        <form @submit.prevent="onSubmit">
          <div class="filter-container-highlight">
            <div class="form-col-container">
              <div class="d-flex justify-content-between">
                <div class="vertical-center-container desc-text-white">
                  <span>
                    {{ `โอนสถานะงาน: ${statusTransfer.nameTh}` }}
                  </span>
                  <span class="ml-2 bi bi-arrow-right"></span>
                  <span class="ml-2">
                    {{
                      `${
                        form.statustarget ? getStatusName(form.statustarget) : 'โปรดเลือกแผนกรับโอน'
                      }`
                    }}
                  </span>
                </div>
                <div>
                  <span class="mr-4 desc-text-white">
                    {{ `จำนวนทั้งหมด ${modelTransfer.total} รายการ` }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div class="form-col-container mt-1">
            <div>
              <div>
                <span class="title-text">แผนกรับโอน</span>
                <Dropdown
                  v-model="form.statustarget"
                  :options="allowSelectStatus"
                  optionLabel="nameTh"
                  optionValue="id"
                  class="w-full md:w-14rem"
                  :class="val.isTargetStatus === true ? `p-invalid` : ``"
                />
              </div>
            </div>
            <div>
              <span class="title-text">ผู้โอน</span>
              <input
                :class="['form-control bg-input']"
                type="text"
                v-model.trim="form.name"
                required
              />
            </div>
            <div></div>
            <div></div>
          </div>
          <div class="mt-2">
            <DataTable
              :totalRecords="modelTransferValue.total"
              :value="modelTransferValue.data"
              v-model:selection="selectedValue"
              dataKey="id"
              class="p-datatable-sm"
              scrollable
              scrollHeight="500px"
              resizableColumns
              :lazy="true"
              stripedRows
            >
              <Column selectionMode="multiple" headerStyle="width: 50px"></Column>
              <Column field="woText" header="W.O." style="min-width: 150px">
                <template #body="slotProps">
                  {{ `${slotProps.data.wo}-${slotProps.data.woNumber}` }}
                </template>
              </Column>
              <Column field="mold" header="เเม่พิมพ์" style="min-width: 150px"></Column>
              <Column
                header="สถานะใบงาน (วันที่)"
                field="lastUpdateStatus"
                style="min-width: 150px"
              >
                <template #body="prop">
                  <div class="notification">
                    <span>{{ formatDate(prop.data.lastUpdateStatus) }}</span>
                  </div>
                </template>
              </Column>
              <Column header="วันส่งงานลูกค้า" field="requestDate" style="min-width: 150px">
                <template #body="prop">
                  <div class="notification">
                    <span>{{ formatDate(prop.data.requestDate) }}</span>
                    <span v-if="prop.data.isOverPlan" class="overdue-tag">เกินกำหนด</span>
                  </div>
                </template>
              </Column>
              <Column header="รหัสสินค้า" field="productNumber" style="min-width: 150px"></Column>
              <Column
                header="ประเภทสินค้า"
                field="productTypeName"
                style="min-width: 150px"
              ></Column>
              <Column header="จำนวนสินค้า" field="productQty" style="min-width: 150px"></Column>
              <Column header="ประเภททอง/เงิน" field="gold" style="min-width: 150px"></Column>
              <Column header="ขนาดทอง/เงิน" field="goldSize" style="min-width: 150px"></Column>
              <Column header="รหัสลูกค้า" field="customerNumber" style="min-width: 150px"></Column>
              <Column header="ชื่อลูกค้า" field="customerName" style="min-width: 150px"></Column>
              <Column
                header="ประเภทลูกค้า"
                field="customerTypeName"
                style="min-width: 150px"
              ></Column>
              <Column header="วันสร้างใบสินค้า" field="createDate" style="min-width: 150px">
                <template #body="prop">
                  {{ formatDate(prop.data.createDate) }}
                </template>
              </Column>
              <template #footer>
                <div class="d-flex justify-content-between">
                  <div></div>
                  <div></div>
                </div>
              </template>
            </DataTable>
          </div>
          <div class="filter-container mt-1">
            <div class="d-flex justify-content-between vertical-center-container">
              <div class="title-text">
                <span>{{ `จำนวนที่เลือก ${selectedValue.length} รายการ` }}</span>
              </div>
              <div>
                <button
                  :class="['btn btn-sm', selectedValue.length > 0 ? 'btn-main' : 'btn-secondary']"
                  style="height: 34px"
                  :disabled="!selectedValue.length > 0"
                  @click="onTransferStatus"
                  type="submit"
                >
                  <span>
                    <i class="bi bi-arrow-left-right"></i>
                  </span>
                </button>
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

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dropdown from 'primevue/dropdown'

import api from '@/axios/axios-config.js'
import swAlert from '@/services/alert/sweetAlerts.js'
import { formatDate, formatDateTime } from '@/services/utils/dayjs.js'

const interfaceForm = {
  formerStatus: null,
  targetStatus: null,
  name: null,
  job: []
}
const interfaceVal = {
  isTargetStatus: false
}

export default {
  components: {
    modal,
    loading,
    DataTable,
    Column,
    Dropdown
  },
  props: {
    isShow: {
      type: Boolean,
      required: true,
      default: false
    },
    modelValue: {
      type: Object,
      //required: true,
      default: () => {}
    },
    modelTransferValue: {
      type: Object,
      required: true,
      default: () => {}
    },
    stausTransferValue: {
      type: Number,
      required: true,
      default: () => 0
    },
    masterStatusValue: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  computed: {
    isShowModal() {
      return this.isShow
    },
    model() {
      return this.modelValue
    },
    modelTransfer() {
      return this.modelTransferValue
    },
    masterStatus() {
      return this.masterStatusValue
    },
    statusTransfer() {
      return this.masterStatusValue.find((item) => item.id === this.stausTransferValue) || null
    },
    allowSelectStatus() {
      //rremove status transfer
      const removeStatus = [100, 500, 10, 55, this.stausTransferValue]
      return this.masterStatus.filter((item) => !removeStatus.includes(item.id))
    }
  },
  watch: {
    'form.statustarget'() {
      if (this.form.statustarget) {
        this.val.isTargetStatus = false
      }
    }
  },
  data() {
    return {
      isLoading: false,
      selectedValue: [],
      form: {
        ...interfaceForm
      },
      val: {
        ...interfaceVal
      }
    }
  },
  methods: {
    // ----- event
    closeModal() {
      this.$emit('closeModal')
    },
    onSubmit() {
      if (this.validateForm()) {
        swAlert.confirmSubmit('', 'ยืนยันการโอนสถานะงาน?', async () => {
          await this.submit()
        })
      }
    },
    validateForm() {
      let isValid = true

      if (!this.form.statustarget) {
        this.val.isTargetStatus = true
        isValid = false
      }
      return isValid
    },

    // ------ helper ------//
    formatDateTime(date) {
      return date ? formatDateTime(date) : ''
    },
    formatDate(date) {
      return formatDate(date)
    },

    getStatusName(statusId) {
      return this.masterStatus.find((item) => item.id === statusId)?.nameTh || ''
    },

    // ------ APIs ------//
    async submit() {
      this.isLoading = true
      try {
        const param = {
          formerStatus: this.stausTransferValue,
          targetStatus: this.form.statustarget,
          transferBy: this.form.name,
          plans: this.selectedValue.map((item) => {
            return {
              wo: item.wo,
              woNumber: item.woNumber,
              id: item.id
            }
          })
        }

        console.log('param', param)

        const res = await api.jewelry.post('ProductionPlan/ProductionPlanTransfer', param)
        if (res) {
          console.log('res', res)

          //check res.errors.length > 0 --> alert ewarning
          if (res.errors.length > 0) {
            //const msg = res.errors.map((item) => item.message).join('<br>')
            const msg = res.errors
              .map((item) => `${item.wo}-${item.woNumber} : ${item.message}`)
              .join('<br>')
            swAlert.warning(msg, `พบข้อผิดพลาด`, () => {
              this.$emit('closeModal', 'fetch')
            })
          } else {
            this.$emit('closeModal', 'fetch')
          }
        }
      } catch (error) {
        console.error(error)
      }
      this.isLoading = false
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';

.notification {
  display: inline-flex;
  align-items: center;
  //background-color: #ffe6e6; /* ส้มอ่อน */
  //padding: 4px 8px;
  //border-radius: 4px;
}

.overdue-tag {
  background-color: #ff4d4d; /* สีแดง */
  color: white;
  padding: 2px 4px;
  border-radius: 2px;
  margin-left: 4px;
  font-size: 12px;
}
</style>
