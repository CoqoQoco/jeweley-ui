<template>
  <div>
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
                        form.targetStatus ? getStatusName(form.targetStatus) : 'โปรดเลือกแผนกรับโอน'
                      }`
                    }}
                  </span>
                </div>
                <div>
                  <span class="mr-4 desc-text-white">
                    {{ `จำนวนทั้งหมด ${planSearchStore.dataPlanTransfer.total} รายการ` }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- target status -->
          <div class="form-col-container mt-1">
            <div>
              <div>
                <span class="title-text">แผนกรับโอน</span>
                <Dropdown
                  v-model="form.targetStatus"
                  :options="allowSelectStatus"
                  optionLabel="nameTh"
                  optionValue="id"
                  class="w-full md:w-14rem"
                  :class="val.isTargetStatus === true ? `p-invalid` : ``"
                />
              </div>
            </div>
            <div>
              <!-- <span class="title-text">ผู้โอน</span>
              <input
                :class="['form-control bg-input']"
                type="text"
                v-model.trim="form.name"
                required
              /> -->
            </div>
            <div></div>
            <div></div>
          </div>

          <div class="mt-2">
            <BaseDataTable
              :items="planSearchStore.dataPlanTransfer.data"
              :totalRecords="planSearchStore.dataPlanTransfer.total"
              :columns="columns"
              dataKey="id"
              scrollHeight="350px"
              :selectionMode="true"
              :paginator="false"
              :itemsSelection="selectedValue"
              @update:itemsSelection="selectedValue = $event"
            >
              <!-- WO Template -->
              <template #woTemplate="{ data }">
                {{ `${data.wo}-${data.woNumber}` }}
              </template>

              <!-- Last Update Status Template -->
              <template #lastUpdateStatusTemplate="{ data }">
                <div class="notification">
                  <span>{{ formatDate(data.lastUpdateStatus) }}</span>
                </div>
              </template>

              <!-- Request Date Template -->
              <template #requestDateTemplate="{ data }">
                <div class="notification">
                  <span>{{ formatDate(data.requestDate) }}</span>
                  <span v-if="data.isOverPlan" class="overdue-tag">เกินกำหนด</span>
                </div>
              </template>

              <!-- Create Date Template -->
              <template #createDateTemplate="{ data }">
                {{ formatDate(data.createDate) }}
              </template>
            </BaseDataTable>
          </div>

          <div class="filter-container mt-1">
            <div class="d-flex justify-content-between vertical-center-container">
              <div class="title-text">
                <span>{{
                  `จำนวนที่เลือก ${selectedValue.length} รายการ [เลือกได้สูงสุด ${this.allowItem} รายการ]`
                }}</span>
              </div>
              <div class="d-flex justify-content-between vertical-center-container">
                <div class="check-excel-container">
                  <Checkbox v-model="form.isExportTransfer" :binary="true" />
                  <span for="ingredient1" class="ml-2">ออกเอกสารโอนงาน</span>
                </div>
                <button
                  :class="[
                    'btn btn-sm ml-2',
                    selectedValue.length > 0 ? 'btn-main' : 'btn-secondary'
                  ]"
                  style="height: 34px"
                  :disabled="!selectedValue.length > 0"
                  @click="onTransferStatus"
                  type="submit"
                >
                  <span><i class="bi bi-box-arrow-down"></i></span>
                  <span class="ml-2">โอนงาน</span>
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

import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import Dropdown from 'primevue/dropdown'
import Checkbox from 'primevue/checkbox'

import { usePlanSearchApiStore } from '@/stores/modules/api/plan-search-store.js'
import { usePlanUpdateApiStore } from '@/stores/modules/api/plan-update-store.js'
import swAlert from '@/services/alert/sweetAlerts.js'
import { formatDate, formatDateTime } from '@/services/utils/dayjs.js'

const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))

const interfaceForm = {
  formerStatus: null,
  targetStatus: null,
  name: null,
  isExportTransfer: false,
  job: []
}

const interfaceVal = {
  isTargetStatus: false
}

export default {
  components: {
    modal,
    BaseDataTable,
    Dropdown,
    Checkbox
  },

  props: {
    isShow: {
      type: Boolean,
      required: true,
      default: false
    },
    modelValue: {
      type: Object,
      default: () => ({})
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

  data() {
    return {
      selectedValue: [],
      form: { ...interfaceForm },
      val: { ...interfaceVal },
      allowItem: 100,
      columns: [
        {
          field: 'wo',
          header: 'W.O.',
          minWidth: '150px',
          sortable: false
        },
        {
          field: 'mold',
          header: 'เเม่พิมพ์',
          minWidth: '150px',
          sortable: false
        },
        {
          field: 'lastUpdateStatus',
          header: 'สถานะใบงาน (วันที่)',
          minWidth: '150px',
          sortable: false
        },
        {
          field: 'requestDate',
          header: 'วันส่งงานลูกค้า',
          minWidth: '150px',
          sortable: false
        },
        {
          field: 'productNumber',
          header: 'รหัสสินค้า',
          minWidth: '150px',
          sortable: false
        },
        {
          field: 'productTypeName',
          header: 'ประเภทสินค้า',
          minWidth: '150px',
          sortable: false
        },
        {
          field: 'productQty',
          header: 'จำนวนสินค้า',
          minWidth: '150px',
          sortable: false
        },
        {
          field: 'gold',
          header: 'สีของทอง/เงิน',
          minWidth: '150px',
          sortable: false
        },
        {
          field: 'goldSize',
          header: 'ประเภททอง/เงิน',
          minWidth: '150px',
          sortable: false
        },
        {
          field: 'customerNumber',
          header: 'รหัสลูกค้า',
          minWidth: '150px',
          sortable: false
        },
        {
          field: 'customerName',
          header: 'ชื่อลูกค้า',
          minWidth: '150px',
          sortable: false
        },
        {
          field: 'customerTypeName',
          header: 'ประเภทลูกค้า',
          minWidth: '150px',
          sortable: false
        },
        {
          field: 'createDate',
          header: 'วันสร้างใบสินค้า',
          minWidth: '150px',
          format: 'date',
          sortable: false
        }
      ]
    }
  },

  setup() {
    const planSearchStore = usePlanSearchApiStore()
    const planUpdateStore = usePlanUpdateApiStore()
    return { planSearchStore, planUpdateStore }
  },

  computed: {
    isShowModal() {
      return this.isShow
    },
    model() {
      return this.modelValue
    },
    masterStatus() {
      return this.masterStatusValue
    },
    statusTransfer() {
      return this.masterStatusValue.find((item) => item.id === this.stausTransferValue) || null
    },
    allowSelectStatus() {
      const removeStatus = [
        10,
        49,
        55,
        59,
        69,
        79,
        84,
        85,
        89,
        94,
        100,
        500,
        this.stausTransferValue
      ]
      return this.masterStatus.filter((item) => !removeStatus.includes(item.id))
    }
  },

  watch: {
    'form.targetStatus'() {
      if (this.form.targetStatus) {
        this.val.isTargetStatus = false
      }
    }
  },

  methods: {
    closeModal() {
      this.selectedValue = []
      this.form = { ...interfaceForm }
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

      console.log('this.selectedValue.length:', this.selectedValue.length)

      if (this.selectedValue.length > this.allowItem) {
        swAlert.warning('รายการเลือกเกินจำนวนสูงสุด', '', () => {
          return false
        })
      }

      if (!this.form.targetStatus) {
        this.val.isTargetStatus = true
        isValid = false
      }

      let statusNotAllow = [49, 54, 55, 59, 69, 79, 84, 85, 94, 500]
      if (statusNotAllow.includes(this.form.targetStatus)) {
        swAlert.warning('ไม่สามารถโอนสถานงานนี้ได้', '', () => {
          isValid = false
        })
      }
      return isValid
    },

    formatDateTime(date) {
      return date ? formatDateTime(date) : ''
    },

    formatDate(date) {
      return formatDate(date)
    },

    getStatusName(statusId) {
      return this.masterStatus.find((item) => item.id === statusId)?.nameTh || ''
    },

    async submit() {
      try {
        const res = await this.planUpdateStore.submitTransfer({
          formerStatus: this.stausTransferValue,
          targetStatus: this.form.targetStatus,
          transferBy: this.form.name,
          selectedItems: this.selectedValue
        })

        console.log('res:', res)

        if (res.success) {
          if (res.transferNumber && this.form.isExportTransfer) {
            const form = {
              transferNumber: res.transferNumber
            }
            const sort = [
              {
                field: 'wo',
                dir: 'asc'
              },
              {
                field: 'woNumber',
                dir: 'asc'
              }
            ]

            await this.planUpdateStore.fetchDataTransferExport({
              sort: sort,
              form: form,
              masterStatus: this.masterStatus
            })
          }

          this.selectedValue = []
          this.form = { ...interfaceForm }
          this.$emit('closeModal', 'fetch')
        }
      } catch (error) {
        console.error('Error in submit:', error)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';

.notification {
  display: inline-flex;
  align-items: center;
}

.overdue-tag {
  background-color: #ff4d4d;
  color: white;
  padding: 2px 4px;
  border-radius: 2px;
  margin-left: 4px;
  font-size: 12px;
}
</style>
