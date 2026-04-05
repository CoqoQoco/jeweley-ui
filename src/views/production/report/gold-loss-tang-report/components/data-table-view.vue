<template>
  <div>
    <pageTitle
      title="รายการ Gold Loss แต่ง"
      :isShowBtnClose="false"
      :isShowRightSlot="true"
    >
      <template #rightSlot>
        <div class="d-flex align-items-center gap-2">
          <!-- New search mode: create job -->
          <template v-if="!readonly && !jobInfo">
            <small v-if="reportData.hasSavedData" class="text-muted">(บันทึกแล้ว)</small>
            <button class="btn btn-sm btn-main" @click="onCreateJob">
              <i class="bi bi-plus-circle"></i> สร้างใบงาน
            </button>
          </template>
          <!-- Readonly mode: edit + PDF -->
          <template v-if="readonly">
            <button class="btn btn-sm btn-main" @click="$emit('edit')">
              <i class="bi bi-pencil"></i> แก้ไข
            </button>
            <button class="btn btn-sm btn-green" @click="$emit('exportPdf')">
              <i class="bi bi-file-earmark-pdf"></i> PDF
            </button>
          </template>
          <!-- Editing saved job: save -->
          <template v-if="!readonly && jobInfo">
            <button class="btn btn-sm btn-main" @click="onSaveEdit">
              <i class="bi bi-save"></i> บันทึก
            </button>
          </template>
        </div>
      </template>
    </pageTitle>

    <div class="mb-2 text-muted" v-if="jobInfo">เลขที่ใบงาน: <strong>{{ jobInfo.documentNo }}</strong></div>

    <div v-if="!readonly" class="d-flex align-items-end gap-2 mb-2">
      <div>
        <span class="title-text">%loss</span>
        <input
          type="number"
          class="form-control form-control-sm"
          v-model.number="batchLossPercent"
          step="any"
          min="0"
          max="100"
          placeholder="0"
        />
      </div>
      <div>
        <span class="title-text">ราคาทอง (บาท/กรัม)</span>
        <input
          type="number"
          class="form-control form-control-sm"
          v-model.number="batchGoldPrice"
          step="any"
          min="0"
          placeholder="0.00"
        />
      </div>
      <button class="btn btn-sm btn-main" @click="onApplyAll">
        <i class="bi bi-arrow-down-circle"></i> ใช้กับทุกรายการ
      </button>
    </div>

    <BaseDataTable
      :items="computedRows"
      :columns="tableColumns"
      :totalRecords="computedRows.length"
      :paginator="false"
      :showGridlines="true"
      dataKey="idx"
    >
      <template #woTemplate="{ data }">
        {{ data.wo }}-{{ data.woNumber }}
      </template>

      <template #workerTemplate="{ data }">
        {{ data.workerCode }} - {{ data.workerName }}
      </template>

      <template #goldTypeTemplate="{ data }">
        <strong>{{ data.goldType }}</strong>
        <small class="text-muted d-block">{{ data.goldTypeName }}</small>
      </template>

      <template #weightDiffTemplate="{ data }">
        <span style="font-weight: 600" :style="colorStyle(data.weightDiff * -1)">
          {{ fmtSign2(data.weightDiff * -1) }}
          <small class="text-muted">({{ weightDiffPercent(data.goldWeightSend, data.goldWeightCheck) }})</small>
        </span>
      </template>

      <template #lossPercentTemplate="{ data }">
        <template v-if="readonly">{{ fmt2(editData[data.idx].lossPercent) }}</template>
        <input
          v-else
          type="number"
          step="any"
          min="0"
          max="100"
          class="form-control form-control-sm text-right"
          v-model.number="editData[data.idx].lossPercent"
          placeholder="0"
        />
      </template>

      <template #goldLossPriceTemplate="{ data }">
        <template v-if="readonly">{{ fmt2(editData[data.idx].goldLossPrice) }}</template>
        <input
          v-else
          type="number"
          step="any"
          min="0"
          class="form-control form-control-sm text-right"
          v-model.number="editData[data.idx].goldLossPrice"
          placeholder="0.00"
        />
      </template>

      <template #weightLossAllowedTemplate="{ data }">
        <span style="font-weight: 600">{{ fmt2(data.weightLossAllowed) }}</span>
      </template>

      <template #weightLossActualTemplate="{ data }">
        <span style="font-weight: 600" :style="colorStyle(data.weightLossActual)">
          {{ fmtSign2(data.weightLossActual) }}
        </span>
      </template>

      <template #moneyDiffTemplate="{ data }">
        <span style="font-weight: 600" :style="colorStyle(data.moneyDiff)">
          {{ fmtSign2(data.moneyDiff) }}
        </span>
      </template>

      <template #lossRemarkTemplate="{ data }">
        <template v-if="readonly">{{ editData[data.idx].lossRemark || '-' }}</template>
        <input
          v-else
          type="text"
          class="form-control form-control-sm"
          v-model="editData[data.idx].lossRemark"
          placeholder="รายละเอียด..."
        />
      </template>

      <template #actionTemplate="{ data }">
        <button class="btn btn-sm btn-red" @click="onDelete(data.idx)">
          <i class="bi bi-trash-fill"></i>
        </button>
      </template>

      <template #footer>
        <div class="d-flex justify-content-between align-items-center">
          <span style="font-weight: 600">จำนวน {{ computedRows.length }} รายการ</span>
          <div>
            <span style="font-weight: 700" class="me-2">รวมเงิน ได้/ขาด :</span>
            <span style="font-weight: 700" :style="colorStyle(totalMoneyDiff)">
              {{ fmtSign2(totalMoneyDiff) }}
            </span>
          </div>
        </div>
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { confirmSubmit } from '@/services/alert/sweetAlerts.js'
import pageTitle from '@/components/custom/PageTitle.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  name: 'GoldLossTangDataTableView',

  components: {
    pageTitle,
    BaseDataTable
  },

  props: {
    reportData: {
      type: Object,
      default: () => ({})
    },
    readonly: {
      type: Boolean,
      default: false
    },
    jobInfo: {
      type: Object,
      default: null
    }
  },

  emits: ['createJob', 'reload', 'deleteRow', 'edit', 'exportPdf', 'saveEdit'],

  data() {
    return {
      editData: [],
      batchLossPercent: null,
      batchGoldPrice: null
    }
  },

  computed: {
    tableColumns() {
      const cols = [
        { field: 'wo', header: 'WO', minWidth: '100px' },
        { field: 'worker', header: 'ช่าง', minWidth: '120px' },
        { field: 'goldType', header: 'ทอง', minWidth: '100px' },
        { field: 'requestDate', header: 'วันที่', minWidth: '100px', format: 'date' },
        { field: 'goldQtySend', header: 'จำนวนจ่าย [ชิ้น]', minWidth: '110px', align: 'right', format: 'decimal2' },
        { field: 'goldWeightSend', header: 'น้ำหนักจ่าย', minWidth: '110px', align: 'right', format: 'decimal2' },
        { field: 'goldQtyCheck', header: 'จำนวนแต่ง [เม็ด]', minWidth: '120px', align: 'right', format: 'decimal2' },
        { field: 'goldWeightCheck', header: 'น้ำหนักรับ', minWidth: '110px', align: 'right', format: 'decimal2' },
        { field: 'weightDiff', header: 'น้ำหนัก ขาด/เกิน', minWidth: '140px', align: 'right', sortable: false },
        { field: 'lossPercent', header: '%loss', minWidth: '100px', align: 'center', sortable: false },
        { field: 'goldLossPrice', header: 'ราคาทอง (บาท/กรัม)', minWidth: '140px', align: 'center', sortable: false },
        { field: 'weightLossAllowed', header: 'น้ำหนักที่ loss ได้', minWidth: '130px', align: 'right', sortable: false },
        { field: 'weightLossActual', header: 'น้ำหนัก loss', minWidth: '120px', align: 'right', sortable: false },
        { field: 'moneyDiff', header: 'เงิน ได้/ขาด', minWidth: '130px', align: 'right', sortable: false },
        { field: 'lossRemark', header: 'หมายเหตุ', minWidth: '160px', sortable: false }
      ]
      if (!this.readonly) {
        cols.push({ field: 'action', header: 'ลบ', minWidth: '60px', align: 'center', sortable: false })
      }
      return cols
    },

    computedRows() {
      if (!this.reportData || !this.reportData.rows) return []

      return this.reportData.rows.map((row, idx) => {
        const edit = this.editData[idx] || {}
        const lossPercent = edit.lossPercent ?? 0
        const goldLossPrice = edit.goldLossPrice ?? 0

        const send = row.goldWeightSend ?? 0
        const check = row.goldWeightCheck ?? 0
        const weightDiff = send - check
        const weightLossAllowed = send * (lossPercent / 100)
        const weightLossActual = weightLossAllowed - weightDiff
        const moneyDiff = weightLossActual * goldLossPrice

        return {
          ...row,
          idx,
          weightDiff,
          weightLossAllowed,
          weightLossActual,
          moneyDiff
        }
      })
    },

    totalMoneyDiff() {
      return this.computedRows.reduce((sum, row) => sum + (row.moneyDiff ?? 0), 0)
    }
  },

  watch: {
    reportData: {
      handler(val) {
        if (val && val.rows) {
          this.editData = val.rows.map((row) => ({
            goldType: row.goldType,
            lossPercent: row.lossPercent ?? 0,
            goldLossPrice: row.goldLossPrice ?? 0,
            lossRemark: row.lossRemark ?? ''
          }))
        }
      },
      immediate: true,
      deep: true
    }
  },

  methods: {
    onCreateJob() {
      confirmSubmit('ต้องการสร้างใบงาน Gold Loss หรือไม่?', 'ยืนยันการสร้างใบงาน', () => {
        const items = this.computedRows.map((row, idx) => {
          const edit = this.editData[idx] || {}
          return {
            productionPlanId: row.productionPlanId,
            itemNo: row.itemNo,
            wo: row.wo,
            woNumber: row.woNumber,
            woText: row.woText,
            workerCode: row.workerCode,
            workerName: row.workerName,
            gold: row.goldType,
            goldQtySend: row.goldQtySend,
            goldWeightSend: row.goldWeightSend,
            goldQtyCheck: row.goldQtyCheck,
            goldWeightCheck: row.goldWeightCheck,
            lossPercent: edit.lossPercent ?? 0,
            goldLossPrice: edit.goldLossPrice ?? 0,
            weightLossAllowed: row.weightLossAllowed,
            weightLossActual: row.weightLossActual,
            moneyDiff: row.moneyDiff,
            lossRemark: edit.lossRemark ?? '',
            requestDate: row.requestDate
          }
        })
        this.$emit('createJob', items)
      })
    },

    onSaveEdit() {
      confirmSubmit('ต้องการบันทึกการแก้ไขหรือไม่?', 'ยืนยันการบันทึก', () => {
        const items = this.computedRows.map((row, idx) => {
          const edit = this.editData[idx] || {}
          return {
            productionPlanId: row.productionPlanId,
            itemNo: row.itemNo,
            wo: row.wo,
            woNumber: row.woNumber,
            woText: row.woText,
            workerCode: row.workerCode,
            workerName: row.workerName,
            gold: row.goldType,
            goldQtySend: row.goldQtySend,
            goldWeightSend: row.goldWeightSend,
            goldQtyCheck: row.goldQtyCheck,
            goldWeightCheck: row.goldWeightCheck,
            lossPercent: edit.lossPercent ?? 0,
            goldLossPrice: edit.goldLossPrice ?? 0,
            weightLossAllowed: row.weightLossAllowed,
            weightLossActual: row.weightLossActual,
            moneyDiff: row.moneyDiff,
            lossRemark: edit.lossRemark ?? '',
            requestDate: row.requestDate
          }
        })
        this.$emit('saveEdit', items)
      })
    },

    onApplyAll() {
      this.editData.forEach((item) => {
        if (this.batchLossPercent != null) item.lossPercent = this.batchLossPercent
        if (this.batchGoldPrice != null) item.goldLossPrice = this.batchGoldPrice
      })
    },

    onDelete(idx) {
      confirmSubmit('ต้องการลบรายการนี้หรือไม่?', 'ยืนยันการลบ', () => {
        this.editData.splice(idx, 1)
        this.$emit('deleteRow', idx)
      })
    },

    weightDiffPercent(send, check) {
      if (!send || send === 0) return '0.00%'
      const diff = send - check
      return ((diff / send) * 100).toFixed(2) + '%'
    },

    formatDate(val) {
      if (!val) return ''
      return dayjs(val).format('DD/MM/YYYY')
    },

    fmt2(val) {
      if (val == null) return '0.00'
      return Number(val)
        .toFixed(2)
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    },

    fmtSign2(val) {
      if (val == null) return '0.00'
      const sign = val >= 0 ? '+' : '-'
      return `${sign}${Math.abs(val)
        .toFixed(2)
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
    },

    colorStyle(val) {
      if (val > 0) return 'color: var(--base-green)'
      if (val < 0) return 'color: var(--base-red)'
      return ''
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';
</style>
