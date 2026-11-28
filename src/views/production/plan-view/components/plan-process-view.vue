<template>
  <div class="filter-container-custom">
    <div class="filter-container-highlight">
      <div class="d-flex justify-content-between">
        <!-- time -->
        <div class="title-text-white vertical-center-container desc-text-white">
          <span class="bi bi-clock mr-2"></span>
          <span v-if="data">{{ formatDateTime(data.updateDate) }}</span>
          <span v-else class="ml-2">---</span>
        </div>

        <!-- action -->
        <div>
          <button
            v-if="canEditPlan"
            :class="['btn btn-sm ml-2', checkBtn('print') ? 'btn-secondary' : 'btn-primary']"
            title="พิมพ์แบบ"
            :disabled="checkBtn('print')"
            @click="onSelectGoldPrint"
          >
            <span class="bi bi-printer"></span>
          </button>
          <button
            v-if="canEditPlan"
            :class="['btn btn-sm ml-2', checkBtn('transfer') ? 'btn-secondary' : 'btn-dark']"
            title="โอนงาน"
            :disabled="checkBtn('transfer')"
            @click="transfer()"
          >
            <span class="bi bi-arrow-down-up"></span>
          </button>
          <button
            v-if="canEditPlan"
            :class="['btn btn-sm ml-2', checkBtn('update') ? 'btn-secondary' : 'btn-warning']"
            title="เเก้ไข"
            :disabled="checkBtn('update')"
            @click="updateStatus()"
          >
            <span class="bi bi-brush"></span>
          </button>
        </div>
      </div>
    </div>

    <div>
      <!-- transfer detail -->
      <div>
        <div class="form-col-sm-container pl-2 mt-3">
          <!-- transfer name -->
          <div class="d-flex flex-column">
            <span class="title-text">ผู้โอนงาน</span>
            <span class="desc-text">{{ data.createBy ?? `-` }}</span>
          </div>
          <!-- transfer date -->
          <div class="d-flex flex-column">
            <span class="title-text">วันโอนงาน</span>
            <span class="desc-text">{{ data.createDate ? formatDate(data.createDate) : `-` }}</span>
          </div>

          <!-- worker receive  -->
          <div class="d-flex flex-column">
            <div v-if="[500, 100].includes(status)"></div>
            <div v-else class="d-flex flex-column">
              <span class="title-text">กำหนดช่างรับงาน</span>
              <span class="desc-text">{{ data.workerName ?? `-` }}</span>
            </div>
          </div>
          <!-- date -->
          <div class="d-flex flex-column">
            <div v-if="[500, 100].includes(status)"></div>
            <div v-else class="d-flex flex-column">
              <span class="title-text">ผู้เเก้ไขล่าสุด</span>
              <span class="desc-text">{{ data.updateBy ?? `-` }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- gold -->
      <div>
        <div class="filter-container-highlight mt-3">
          <span class="desc-text-white bi bi-hammer mr-2"></span>
          <span class="desc-text-white">รายละเอียดงาน</span>
        </div>
        <BaseDataTable
          :value="data.tbtProductionPlanStatusDetail"
          dataKey="id"
          :showGridlines="true"
          scrollable
          stripedRows
          scrollHeight="calc(100vh - 160px)"
          :columns="columns"
          :paginator="false"
        >
          <!-- Templates สำหรับแต่ละช่อง -->
          <!-- <template #requestDateTemplate="{ data }">
            <div class="text-left">
              {{ formatDate(data.requestDate) }}
            </div>
          </template> -->

          <template #goldQtySendTemplate="{ data }">
            <div>
              {{
                data.goldQtySend
                  ? Number(data.goldQtySend).toFixed(3).toLocaleString()
                  : Number(0).toFixed(3)
              }}
            </div>
          </template>

          <template #goldWeightSendTemplate="{ data }">
            <div>
              {{
                data.goldWeightSend
                  ? Number(data.goldWeightSend).toFixed(3).toLocaleString()
                  : Number(0).toFixed(3)
              }}
            </div>
          </template>

          <template #goldQtyCheckTemplate="{ data }">
            <div>
              {{ data.goldQtyCheck ? Number(data.goldQtyCheck).toFixed(3).toLocaleString() : '' }}
            </div>
          </template>

          <template #goldWeightCheckTemplate="{ data }">
            <div>
              {{
                data.goldWeightCheck ? Number(data.goldWeightCheck).toFixed(3).toLocaleString() : ''
              }}
            </div>
          </template>

          <template #goldWeightDiffTemplate="{ data }">
            <div
              style="font-weight: 600"
              :style="calculateWeightDifference(data.goldWeightSend, data.goldWeightCheck).style"
            >
              <span>
                {{
                  calculateWeightDifference(data.goldWeightSend, data.goldWeightCheck).difference
                }}
              </span>
              <span class="ml-1">
                ({{
                  calculateWeightDifference(data.goldWeightSend, data.goldWeightCheck).percentage
                }})
              </span>
            </div>
          </template>

          <template #workerTemplate="{ data }">
            <div class="text-center">
              {{ data.worker ? `${data.worker} - ${data.workerName}` : '' }}
            </div>
          </template>

          <template #workerSubTemplate="{ data }">
            <div class="text-center">
              {{ data.workerSub ? `${data.workerSub} - ${data.workerSubName}` : '' }}
            </div>
          </template>

          <template #wagesTemplate="{ data }">
            <div class="text-right">
              {{ data.wages ? Number(data.wages).toFixed(2).toLocaleString() : '' }}
            </div>
          </template>

          <template #totalWagesTemplate="{ data }">
            <div class="text-right">
              {{
                data.wages
                  ? Number(data.totalWages).toFixed(2).toLocaleString()
                  : Number(wages).toFixed(2).toLocaleString()
              }}
            </div>
          </template>

          <!-- Footer -->
          <template #footer>
            <div class="d-flex justify-content-between title-text">
              <div>
                <span class="mr-2">จำนวน</span>
                <span class="mr-2">{{ data.tbtProductionPlanStatusDetail.length }} </span>
                <span>รายการ</span>
              </div>
              <div v-if="showTotalWages">
                <span>รวมค่าแรง</span>
                <span class="mr-2">:</span>
                <span>
                  {{
                    data && data.wagesTotal
                      ? Number(data.wagesTotal).toFixed(2).toLocaleString()
                      : Number(wages).toFixed(2).toLocaleString()
                  }}
                </span>
              </div>
            </div>
          </template>
        </BaseDataTable>
      </div>
    </div>

    <!-- gold loss - เฉพาะฝัง -->
    <div class="mt-3" v-if="status === 80">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <span class="title-text">คำนวณ Gold Loss</span>
        <div v-if="data.goldLossPrice && canEditPlan" class="d-flex align-items-center">
          <span class="title-text mr-2">ราคาทอง (บาท/กรัม):</span>
          <span class="title-text" style="font-weight: 600">{{ fmt2(data.goldLossPrice) }}</span>
        </div>
      </div>
      <BaseDataTable
        :items="goldLossRows"
        :columns="visibleGoldLossColumns"
        dataKey="id"
        :paginator="false"
        :showGridlines="true"
        scrollHeight="300px"
      >
        <template #weightDiffTemplate="slotProps">
          <div
            style="font-weight: 600"
            :style="calculateWeightDifference(slotProps.data.goldWeightSend, slotProps.data.goldWeightCheck).style"
          >
            <span>{{ calculateWeightDifference(slotProps.data.goldWeightSend, slotProps.data.goldWeightCheck).difference }}</span>
            <span class="ml-1">({{ calculateWeightDifference(slotProps.data.goldWeightSend, slotProps.data.goldWeightCheck).percentage }})</span>
          </div>
        </template>
        <template #lossPercentTemplate="slotProps">
          <span>{{ slotProps.data.lossPercent }}</span>
        </template>
        <template #weightLossAllowedTemplate="slotProps">
          <span style="font-weight: 600">{{ fmt2(slotProps.data.weightLossAllowed) }}</span>
        </template>
        <template #weightLossActualTemplate="slotProps">
          <span
            style="font-weight: 600"
            :style="slotProps.data.weightLossActual > 0 ? 'color: #038387' : slotProps.data.weightLossActual < 0 ? 'color: #ff4d4d' : ''"
          >
            {{ fmtSign2(slotProps.data.weightLossActual) }}
          </span>
        </template>
        <template #moneyDiffTemplate="slotProps">
          <span
            style="font-weight: 600"
            :style="slotProps.data.moneyDiff > 0 ? 'color: #038387' : slotProps.data.moneyDiff < 0 ? 'color: #ff4d4d' : ''"
          >
            {{ fmtSign2(slotProps.data.moneyDiff) }}
          </span>
        </template>
        <template #remarkTemplate="slotProps">
          <span>{{ slotProps.data.lossRemark }}</span>
        </template>
        <template #footer>
          <div class="d-flex justify-content-between title-text">
            <span>{{ goldLossRows.length }} รายการ</span>
            <div v-if="canEditPlan" class="d-flex align-items-center">
              <span class="mr-2">รวมเงิน ได้/ขาด :</span>
              <span
                style="font-weight: 600"
                :style="goldLossMoneyTotal > 0 ? 'color: #038387' : goldLossMoneyTotal < 0 ? 'color: #ff4d4d' : ''"
              >{{ fmtSign2(goldLossMoneyTotal) }}</span>
            </div>
          </div>
        </template>
      </BaseDataTable>
    </div>

    <!-- gem — status 50 (แต่ง): แสดงวัตถุดิบสร้อยคอจากคัดพลอย (read-only) -->
    <div v-if="status === 50">
      <div class="filter-container-highlight mt-3">
        <div class="d-flex justify-content-between">
          <div>
            <span class="desc-text-white bi bi-gem mr-2"></span>
            <span class="desc-text-white">วัตถุดิบ (จากการเบิก)</span>
          </div>
          <div>
            <button
              :class="gemMaterialFromWithdraw.length ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-secondary'"
              @click="exportGemMaterialExcel"
              :disabled="!gemMaterialFromWithdraw.length"
            >
              <span class="bi bi-file-earmark-excel"></span>
            </button>
          </div>
        </div>
      </div>
      <div v-if="gemMaterialFromWithdraw.length === 0 && !gemReturnedRows.length" class="pl-2 pt-2 desc-text">
        ไม่มีรายการวัตถุดิบจากคัดพลอย
      </div>
      <PlanGemTable
        v-else
        :rows="gemMaterialFromWithdraw"
        :returnedRows="gemReturnedRows"
        :showPrice="canEditPlan"
        :canReturn="canReturnGem"
        :returnDisabled="isGemReturnLocked"
        @return-row="onReturnGemRow"
      />
    </div>

    <!-- gem — status 70 (คัดพลอย): คงเดิม + ปุ่ม CSV -->
    <div v-if="status === 70">
      <div class="filter-container-highlight mt-3">
        <div class="d-flex justify-content-between">
          <div>
            <span class="desc-text-white bi bi-gem mr-2"></span>
            <span class="desc-text-white">รายละเอียดพลอย</span>
          </div>
          <div>
            <button
              :class="data.tbtProductionPlanStatusGem.length ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-secondary'"
              @click="exportGemCsv"
              :disabled="!data.tbtProductionPlanStatusGem.length"
            >
              <span class="bi bi-filetype-csv"></span>
            </button>
          </div>
        </div>
      </div>
      <PlanGemTable
        :rows="data.tbtProductionPlanStatusGem"
        :returnedRows="gemReturnedRows"
        :showPrice="canEditPlan"
        :canReturn="canReturnGem"
        :returnDisabled="isGemReturnLocked"
        @return-row="onReturnGemRow"
      />
    </div>

    <div>
      <div class="form-col-container pl-2 mt-4">
        <div class="d-flex flex-column">
          <span class="title-text">หมายเหตุ - 1</span>
          <span class="desc-text">{{ data.remark1 ?? `-` }}</span>
        </div>

        <!-- หมายเหตุ - 2 -->
        <div class="d-flex flex-column">
          <span class="title-text">หมายเหตุ - 2</span>
          <span class="desc-text">{{ data.remark2 ?? `-` }}</span>
        </div>
      </div>
    </div>

    <GemReturnModal
      :isShow="isShow.gemReturn"
      :row="gemReturnRow"
      :planText="`${model.wo}-${model.woNumber}`"
      :planWo="String(model.wo ?? '')"
      :planWoNumber="model.woNumber ?? ''"
      :hasSavedPrice="!!model.hasSavedPrice"
      :hasSavedBom="!!model.hasSavedBom"
      @closeModal="isShow.gemReturn = false"
      @saved="onGemReturned"
    />

    <modal :showModal="isShow.selectGold" @closeModal="closeModal" width="350px">
      <template v-slot:content>
        <div class="title-text-lg-bg">
          <span>เลือกข้อมูลพิมพ์สลิป</span>
        </div>
        <div class="btn-gold-wrapper">
          <div v-for="(data, index) in groupGold" :key="index">
            <div class="btn-gold" @click="handleGeneratePDF(data)">{{ data.selectKey }}</div>
          </div>
        </div>
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import PlanGemTable from './plan-gem-table.vue'
import GemReturnModal from '../modal/gem-return-modal.vue'

import { useMasterApiStore } from '@/stores/modules/api/master-store.js'
import { formatDate, formatDateTime } from '@/services/utils/dayjs'
import { calculateWeightDifference } from '@/services/helper/match.js'
import { ExcelHelper } from '@/services/utils/excel-js.js'
import { EmbedSlipPdfBuilder } from '@/services/helper/pdf/FilePlanEmbed.js'
import { getAzureBlobAsBase64 } from '@/config/azure-storage-config.js'
import { hasProductionEditAccess } from '@/services/permission/production-access.js'
import { hasGemReturnAccess } from '@/services/permission/gem-return-access.js'
import { pickReturnsForHeader } from '../gem-return-helpers.js'

const interfaceIsShow = {
  selectGold: false,
  gemReturn: false
}

const interfaceData = {
  tbtProductionPlanStatusDetail: [],
  tbtProductionPlanStatusGem: [],
  createBy: null,
  createDate: null
}
export default {
  name: 'plan-process-view',
  components: {
    BaseDataTable,
    PlanGemTable,
    GemReturnModal,
    modal
  },

  setup() {
    const masterStore = useMasterApiStore()
    return { masterStore }
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
    status: {
      type: Number,
      required: true,
      default: () => {}
    }
  },

  emits: ['onShowUpdate', 'transfer', 'refresh'],

  computed: {
    model() {
      return this.modelValue
    },

    visibleGoldLossColumns() {
      return this.canEditPlan ? this.goldLossColumns : this.goldLossColumns.filter((c) => c.field !== 'moneyDiff')
    },
    canEditPlan() {
      return hasProductionEditAccess()
    },
    canReturnGem() {
      return hasGemReturnAccess()
    },
    // ใบงานสำเร็จ (100) / หลอม (500) แล้ว คืนพลอยไม่ได้
    isGemReturnLocked() {
      return [100, 500].includes(this.model?.status)
    },
    // ประวัติคืนเป็นระดับใบงาน: แถวที่ itemNo ตรง header นี้ + แถวที่ไม่ตรง header ไหนเลยแสดงที่คัดพลอย (70)
    gemReturnedRows() {
      const headers = this.model?.tbtProductionPlanStatusHeader ?? []
      const own = this.data?.tbtProductionPlanStatusGem ?? []
      const others = headers
        .filter((h) => h.status !== this.status)
        .flatMap((h) => h.tbtProductionPlanStatusGem ?? [])
      return pickReturnsForHeader(this.model?.gemReturns, this.data?.id, own, others, this.status === 70)
    },

    masterProductType() {
      return this.masterStore.productType
    },
    masterCustomerType() {
      return this.masterStore.customerType
    },
    masterGold() {
      return this.masterStore.gold
    },
    masterGoldSize() {
      return this.masterStore.goldSize
    },
    masterGem() {
      return this.masterStore.gem
    },
    masterGemShape() {
      return this.masterStore.gemShape
    },
    masterStatus() {
      return this.masterStore.planStatus
    },

    showTotalWages() {
      return this.status !== 70 && this.canEditPlan // ไม่แสดงในสถานะคัดพลอย / ผู้ใช้ไม่มี production:edit ไม่เห็นค่าแรง
    },
    goldLossRows() {
      if (this.status !== 80 || !this.data || !this.data.tbtProductionPlanStatusDetail) return []
      const goldPrice = this.data.goldLossPrice ?? 0
      return this.data.tbtProductionPlanStatusDetail.map((item) => {
        const lossPercent = Number(item.lossPercent ?? 0)
        const weightSend = item.goldWeightSend ?? 0
        const weightCheck = item.goldWeightCheck ?? 0
        const rawLoss = weightSend - weightCheck
        const weightLossAllowed = weightCheck * (lossPercent / 100)
        const weightLossActual = Math.round((weightLossAllowed - rawLoss) * 10000) / 10000
        const moneyDiff = Math.round(weightLossActual * 100) / 100 * goldPrice
        return { ...item, weightDiff: rawLoss, lossPercent, weightLossAllowed, weightLossActual, moneyDiff }
      })
    },
    goldLossMoneyTotal() {
      return this.goldLossRows.reduce((sum, row) => sum + (row.moneyDiff ?? 0), 0)
    },
    groupGold() {
      //console.log(this.modelValueStatus)

      // group data by gold and worker
      const groupedData = this.data.tbtProductionPlanStatusDetail.reduce((groups, item) => {
        //console.log('groups', groups)
        //console.log('item', item)
        const group = groups.find(
          (g) => g.key === `${item.gold} - [${item.worker}:${item.workerName}]`
        )
        console.log('group', this.model)

        if (group) {
          group.values.push(item)
        } else {
          //groups.push({ gold: `${item.gold} - ${item.workerName}`, values: [item] })
          groups.push({
            key: `${item.gold} - [${item.worker ?? ``}:${item.workerName ?? ``}]`,
            selectKey: `${item.gold} - ${item.workerName ?? ``}`,
            gold: item.gold,
            worker: `${item.worker} - ${item.workerName}`,
            wo: `${this.model.wo} - ${this.model.woNumber}`,
            product: `${this.model.productName} - ${this.model.productTypeName}`,
            mold: this.model.mold,
            values: [item]
          })
        }

        return groups
      }, [])
      return groupedData
    },

    gemMaterialFromWithdraw() {
      const gems = this.data?.tbtProductionPlanStatusGem
      if (!gems) return []
      return gems.filter((x) => x.outboundRunning)
    }
  },

  watch: {
    status: {
      handler() {
        this.syncData()
      },
      immediate: true
    },
    modelValue: {
      handler() {
        this.syncData()
      },
      deep: true
    }
  },

  data() {
    return {
      wages: 0,
      data: null,
      isShow: {
        ...interfaceIsShow
      },
      urlImage: '',
      gemReturnRow: {},

      // --- gold loss (status 80) --- //
      goldLossColumns: [
        { field: 'gold', header: 'ทอง', minWidth: '100px', sortable: false },
        { field: 'requestDate', header: 'วันที่', minWidth: '120px', format: 'date', sortable: false },
        { field: 'goldQtySend', header: 'จำนวนจ่าย [ชิ้น]', minWidth: '120px', align: 'right', format: 'decimal2', sortable: false },
        { field: 'goldWeightSend', header: 'น้ำหนักจ่าย', minWidth: '110px', align: 'right', format: 'decimal2', sortable: false },
        { field: 'goldQtyCheck', header: 'จำนวนฝัง [เม็ด]', minWidth: '120px', align: 'right', format: 'decimal2', sortable: false },
        { field: 'goldWeightCheck', header: 'น้ำหนักรับ', minWidth: '110px', align: 'right', format: 'decimal2', sortable: false },
        { field: 'weightDiff', header: 'น้ำหนัก ขาด/เกิน', minWidth: '150px', align: 'right', sortable: false },
        { field: 'lossPercent', header: '%loss', minWidth: '90px', align: 'center', sortable: false },
        { field: 'weightLossAllowed', header: 'น้ำหนักที่ loss ได้', minWidth: '130px', align: 'right', sortable: false },
        { field: 'weightLossActual', header: 'น้ำหนัก loss', minWidth: '120px', align: 'right', sortable: false },
        { field: 'moneyDiff', header: 'เงิน ได้/ขาด', minWidth: '120px', align: 'right', sortable: false },
        { field: 'remark', header: 'รายละเอียด', minWidth: '160px', sortable: false }
      ],

      columns: [],
      baseColumns: [
        {
          field: 'gold',
          header: 'ทอง',
          minWidth: '100px',
          sortable: false
        },
        {
          field: 'requestDate',
          header: 'วันที่',
          minWidth: '100px',
          format: 'date',
          sortable: false
        }
      ],
      statusColumns: {
        // ส่วนการหล่อ (50)
        50: [
          {
            field: 'goldQtySend',
            header: 'จำนวนจ่าย',
            minWidth: '100px',
            align: 'right',
            sortable: false
          },
          {
            field: 'goldWeightSend',
            header: 'นำหนักจ่าย',
            minWidth: '100px',
            align: 'right',
            sortable: false
          },
          {
            field: 'goldQtyCheck',
            header: 'จำนวนรับ',
            minWidth: '100px',
            align: 'right',
            sortable: false
          },
          {
            field: 'goldWeightCheck',
            header: 'น้ำหนักรับ',
            minWidth: '100px',
            align: 'right',
            sortable: false
          },
          {
            field: 'goldWeightDiff',
            header: 'น้ำหนัก ขาด/เกิน',
            minWidth: '100px',
            align: 'right',
            sortable: false
          },
          { field: 'description', header: 'รายละเอียด', minWidth: '200px', sortable: false },
          {
            field: 'worker',
            header: this.status === 90 ? 'ช่างขัด' : 'ช่างรับงาน',
            minWidth: '200px',
            align: 'center',
            sortable: false
          }
        ],
        // ส่วนการฝัง (80)
        80: [
          {
            field: 'goldQtySend',
            header: 'จำนวนจ่าย [ชิ้น]',
            minWidth: '100px',
            align: 'right',
            sortable: false
          },
          {
            field: 'goldWeightSend',
            header: 'นำหนักจ่าย',
            minWidth: '100px',
            align: 'right',
            sortable: false
          },
          {
            field: 'goldQtyCheck',
            header: 'จำนวนฝัง [เม็ด]',
            minWidth: '100px',
            align: 'right',
            sortable: false
          },
          {
            field: 'goldWeightCheck',
            header: 'น้ำหนักรับ',
            minWidth: '100px',
            align: 'right',
            sortable: false
          },
          {
            field: 'goldWeightDiff',
            header: 'น้ำหนัก ขาด/เกิน',
            minWidth: '100px',
            align: 'right',
            sortable: false
          },
          { field: 'description', header: 'รายละเอียด', minWidth: '200px', sortable: false },
          {
            field: 'worker',
            header: this.status === 90 ? 'ช่างขัด' : 'ช่างรับงาน',
            minWidth: '200px',
            align: 'center',
            sortable: false
          }
        ],
        // ส่วนคัดพลอย (70)
        70: [
          {
            field: 'worker',
            header: 'ช่างคัดพลอย',
            minWidth: '200px',
            align: 'center',
            sortable: false
          },
          {
            field: 'workerSub',
            header: 'ช่างคัดเพชร',
            minWidth: '200px',
            align: 'center',
            sortable: false
          },
          {
            field: 'goldQtyCheck',
            header: 'จำนวน',
            minWidth: '100px',
            align: 'right',
            sortable: false
          },
          {
            field: 'goldWeightCheck',
            header: 'นำหนัก',
            minWidth: '100px',
            align: 'right',
            sortable: false
          }
        ],
        // ส่วนขัดดิบ (60)
        60: [
          {
            field: 'goldQtySend',
            header: 'จำนวนจ่าย',
            minWidth: '100px',
            align: 'right',
            sortable: false
          },
          {
            field: 'goldWeightSend',
            header: 'นำหนักจ่าย',
            minWidth: '100px',
            align: 'right',
            sortable: false
          },
          {
            field: 'goldQtyCheck',
            header: 'จำนวนรับ',
            minWidth: '100px',
            align: 'right',
            sortable: false
          },
          {
            field: 'goldWeightCheck',
            header: 'น้ำหนักรับ',
            minWidth: '100px',
            align: 'right',
            sortable: false
          },
          {
            field: 'goldWeightDiff',
            header: 'น้ำหนัก ขาด/เกิน',
            minWidth: '150px',
            align: 'right',
            sortable: false
          },
          { field: 'description', header: 'รายละเอียด', minWidth: '200px', sortable: false },
          {
            field: 'worker',
            header: this.status === 90 ? 'ช่างขัด' : 'ช่างรับงาน',
            minWidth: '200px',
            align: 'center',
            sortable: false
          }
        ]
      },
      wagesColumns: [
        {
          field: 'wages',
          header: 'ค่าเเรงต่อชิ้น',
          minWidth: '100px',
          align: 'right',
          sortable: false
        },
        {
          field: 'totalWages',
          header: 'รวมค่าแรง',
          minWidth: '100px',
          align: 'right',
          sortable: false
        }
      ]
    }
  },

  methods: {
    syncData() {
      const header = this.modelValue?.tbtProductionPlanStatusHeader
      if (header) {
        const getData = header.find((x) => x.status === this.status)
        this.data = getData ?? { ...interfaceData }
      } else {
        this.data = { ...interfaceData }
      }
      this.getColumns()
    },

    // ----- helper
    fmt3(val) {
      return val != null ? Number(val).toFixed(3) : '0.000'
    },
    fmt2(val) {
      return val != null ? Number(val).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '0.00'
    },
    fmtSign2(val) {
      if (val == null) return '0.00'
      const sign = val >= 0 ? '+' : '-'
      return `${sign}${Math.abs(val).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
    },
    formatDateTime(date) {
      return date ? formatDateTime(date) : ''
    },
    formatDate(date) {
      return date ? formatDate(date) : ''
    },
    calculateWeightDifference(weightSend, weightReceived) {
      return calculateWeightDifference(weightSend ?? 0, weightReceived ?? 0)
    },

    checkBtn(action) {

      //console.log('checkBtn', this.data)
      const disStatus = [100, 500]
      if (!disStatus.includes(this.model.status)) {
        switch (action) {
          case 'print':
            return this.status === 80 ? false : true
          //return true
          case 'update':
            return this.data.createBy ? false : true
          case 'transfer': {
            let check = this.model.status === this.status
            return !check
          }
        }
      } else {
        switch (action) {
          case 'print':
            return this.status === 80 ? false : true
          default: {
            return true
          }
        }
      }
    },
    updateStatus() {
      this.$emit('onShowUpdate')
    },

    closeModal() {
      this.isShow = {
        ...interfaceIsShow
      }
    },
    onSelectGoldPrint() {
      this.isShow.selectGold = true
    },

    async generatePDF(data) {
      try {
        const enrichedData = {
          ...data,
          goldLossPrice: this.data.goldLossPrice ?? 0
        }
        const pdfBuilder = new EmbedSlipPdfBuilder(enrichedData, this.urlImage)
        const pdf = pdfBuilder.generatePDF()
        pdf.open()
      } catch (error) {
        console.error('Error generating PDF:', error)
      }
    },
    async fetchImage() {
      try {
        // Build Azure Blob path and convert to Base64 for pdfMake
        const blobPath = `Mold/${this.modelValue.mold}-Mold.png`
        const base64Image = await getAzureBlobAsBase64(blobPath)

        // Check if Base64 is valid
        if (base64Image && base64Image.length > 0) {
          this.urlImage = base64Image
        } else {
          console.warn('No image found for mold:', this.modelValue.mold)
          this.urlImage = null
        }
      } catch (error) {
        console.error('Error fetching image:', error)
        this.urlImage = null
      }
    },

    // ถ้ามีการ fetch image
    async handleGeneratePDF(data) {
      try {
        await this.fetchImage()
        await this.generatePDF(data)
      } catch (error) {
        console.error('Error:', error)
      }
    },

    getColumns() {
      let selectedColumns = this.statusColumns[this.status] || this.statusColumns[50] // ใช้ค่าเริ่มต้นหากไม่พบสถานะ

      // รวมคอลัมน์พื้นฐานกับคอลัมน์ตามสถานะ
      let allColumns = [...this.baseColumns, ...selectedColumns]

      // เพิ่มคอลัมน์ workerSub เฉพาะเมื่อ status = 90
      if (this.status === 90 && !allColumns.some((col) => col.field === 'workerSub')) {
        // หา index ของ worker เพื่อแทรก workerSub หลังจากนั้น
        const workerIndex = allColumns.findIndex((col) => col.field === 'worker')
        if (workerIndex !== -1) {
          // แก้ไข header ของ worker ก่อน
          allColumns[workerIndex].header = 'ช่างขัด'

          // แทรก workerSub
          allColumns.splice(workerIndex + 1, 0, {
            field: 'workerSub',
            header: 'ช่างชุบ',
            minWidth: '200px',
            align: 'center',
            sortable: false
          })
        }
      }

      // เพิ่มคอลัมน์ค่าแรง (ยกเว้นสถานะคัดพลอย)
      if (this.status !== 70 && this.canEditPlan) {
        allColumns = [...allColumns, ...this.wagesColumns]
      }

      // ปรับแต่งคอลัมน์ตาม props.specialColumns
      if (this.specialColumns && Object.keys(this.specialColumns).length > 0) {
        Object.keys(this.specialColumns).forEach((field) => {
          const columnIndex = allColumns.findIndex((col) => col.field === field)
          if (columnIndex !== -1) {
            allColumns[columnIndex] = {
              ...allColumns[columnIndex],
              ...this.specialColumns[field]
            }
          }
        })
      }
      ;(this.columns = []), (this.columns = [...allColumns])
    },

    transfer() {
      ////console.log('transfer')
      this.$emit('transfer', this.model, this.status)
    },

    onReturnGemRow(row) {
      this.gemReturnRow = { ...row }
      this.isShow.gemReturn = true
    },
    onGemReturned() {
      this.isShow.gemReturn = false
      this.$emit('refresh')
    },

    exportGemCsv() {
      const dataExcel = this.data.tbtProductionPlanStatusGem.map((item) => {
        return {
          เลขที่เบิก: item.outboundRunning,
          ผู้เบิก: item.outboundName,
          รหัส: item.code,
          พลอย: item.name,
          จำนวน: item.qty ? Number(item.qty).toFixed(3) : '0.000',
          น้ำหนัก: item.weight ? Number(item.weight).toFixed(3) : '0.000',
          หน่วย: item.unit,
          ...(this.canEditPlan ? { ราคา: item.price ? Number(item.price).toFixed(2) : '0.000' } : {})
        }
      })

      const options = {
        filename: `รายการวัถุดิบพลอย แผนผลิตเลขที่ [${this.modelValue.wo}-${this.modelValue.woNumber}].xlsx`,
        sheetName: `${this.modelValue.wo}-${this.modelValue.woNumber}`,
        // ลบ columnWidths ออกเพื่อให้ใช้ค่า default width จาก ExcelHelper
        styles: {
          ...ExcelHelper.defaultStyles,
          headerFill: {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '921313' } // สีน้ำเงินเข้ม
          }
        }
      }

      ExcelHelper.exportToExcel(dataExcel, options)
    },

    exportGemMaterialExcel() {
      const dataExcel = this.gemMaterialFromWithdraw.map((item) => {
        return {
          เลขที่เบิก: item.outboundRunning,
          ผู้เบิก: item.outboundName,
          รหัส: item.code,
          พลอย: item.name,
          จำนวน: item.qty ? Number(item.qty).toFixed(3) : '0.000',
          น้ำหนัก: item.weight ? Number(item.weight).toFixed(3) : '0.000',
          หน่วย: item.unit,
          ความยาว: item.length ? Number(item.length).toFixed(3) : '0.000',
          หน่วยความยาว: item.lengthUnit,
          ...(this.canEditPlan ? { ราคา: item.price ? Number(item.price).toFixed(2) : '0.000' } : {})
        }
      })

      const options = {
        filename: `รายการวัตถุดิบ (แต่ง) แผนผลิตเลขที่ [${this.modelValue.wo}-${this.modelValue.woNumber}].xlsx`,
        sheetName: `${this.modelValue.wo}-${this.modelValue.woNumber}`,
        styles: {
          ...ExcelHelper.defaultStyles,
          headerFill: {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '921313' }
          }
        }
      }

      ExcelHelper.exportToExcel(dataExcel, options)
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
  height: calc(100vh - 220px);
  overflow: auto;
}

.btn-gold-wrapper {
  display: grid;
  place-items: center;
  grid-template-columns: repeat(auto-fit, minmax(min(7rem, 100%), 1fr));
  grid-gap: 1rem;

  //   display: flex;
  //   flex-wrap: wrap;
  //   gap: 1rem; /* หรือค่าที่คุณต้องการ */
}
.btn-gold {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50px;
  width: 150px;
  border: 1px solid var(--secondary);
  background-color: var(--base-color);
  border-radius: 5px;
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  transition:
    background-color 0.3s,
    border-color 0.3s;
}
.btn-gold:hover {
  background-color: var(--base-green); /* เปลี่ยนสีพื้นหลังเมื่อโฮเวอร์ */
  border-color: var(--base-font-color); /* เปลี่ยนสีขอบเมื่อโฮเวอร์ */
  cursor: pointer; /* เปลี่ยนเป็นเคอร์เซอร์เมื่อโฮเวอร์ */
}
</style>
