<template>
  <modal :showModal="isShow" @closeModal="$emit('closeModal')" width="900px" :isShowActionPart="true">
    <!-- <template #title>
      <span class="title-text-lg ml-4 mt-2">บันทึก Gold Loss Slip</span>
    </template> -->

    <template #content>
      <div class="p-3">
        <div class="d-flex justify-content-between mb-3">
          <span class="title-text">พนักงาน: {{ worker.code }} - {{ worker.nameTh }}</span>
          <span class="title-text mr-4 ">
            ช่วงวันที่: {{ formatDate(dateRange.requestDateStart) }} - {{ formatDate(dateRange.requestDateEnd) }}
          </span>
        </div>

        <div class="section-card mb-3">
          <h6>สรุปยอด</h6>
          <div class="summary-row">
            <span class="summary-label">รวมน้ำหนัก loss (gold loss)</span>
            <span
              class="summary-value"
              :class="totalWeightLoss > 0 ? 'loss-positive' : totalWeightLoss < 0 ? 'loss-negative' : ''"
            >{{ fmtSign(totalWeightLoss) }} กรัม</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">รับคืนทอง (Gold Return) (กรัม)</span>
            <div class="d-flex align-items-center">
              <input
                type="number"
                step="0.001"
                class="form-control input-sm"
                v-model.number="goldReturn"
              />
              <span class="ml-2">กรัม</span>
            </div>
          </div>
          <hr class="my-2" />
          <div class="summary-row">
            <span class="summary-label">น้ำหนัก loss สุทธิ</span>
            <span
              class="summary-value"
              :class="netWeightLoss > 0 ? 'loss-positive' : netWeightLoss < 0 ? 'loss-negative' : ''"
            >{{ fmtSign(netWeightLoss) }} กรัม</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">รวมเงิน (Money Diff)</span>
            <span class="summary-value">{{ totalMoneyDiff.toFixed(2) }}</span>
          </div>
        </div>

        <div class="section-card mb-3">
          <h6>รายการที่จะบันทึก ({{ availableItems.length }} รายการ)</h6>
          <BaseDataTable
            :items="availableItems"
            :totalRecords="availableItems.length"
            :columns="tableColumns"
            :paginator="false"
            scrollHeight="300px"
          >
            <template #goldTemplate="{ data }">
              <span>{{ [data.gold, data.goldSize].filter((v) => v).join(' - ') }}</span>
            </template>
            <template #weightLossActualTemplate="{ data }">
              <span
                :class="data.weightLossActual > 0 ? 'loss-positive' : data.weightLossActual < 0 ? 'loss-negative' : ''"
              >{{ fmtSign(data.weightLossActual) }}</span>
            </template>
          </BaseDataTable>
        </div>

        <div>
          <textarea
            class="form-control"
            v-model="remark"
            placeholder="หมายเหตุ"
            rows="2"
          ></textarea>
        </div>
      </div>
    </template>

    <template #action>
      <button class="btn btn-sm btn-main" @click="onSave">
        <i class="bi bi-save mr-1"></i> บันทึก &amp; พิมพ์
      </button>
      <button class="btn btn-sm btn-outline-main ml-2" @click="$emit('closeModal')">ยกเลิก</button>
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import dayjs from 'dayjs'
import api from '@/axios/axios-helper.js'
import { formatISOString } from '@/services/utils/dayjs'
import { warning, success } from '@/services/alert/sweetAlerts.js'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))

export default {
  name: 'GoldLossSlipModal',

  components: { modal, BaseDataTable },

  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    worker: {
      type: Object,
      default: () => ({})
    },
    dateRange: {
      type: Object,
      default: () => ({})
    },
    items: {
      type: Array,
      default: () => []
    }
  },

  emits: ['closeModal', 'saved'],

  data() {
    return {
      goldReturn: 0,
      remark: '',
      tableColumns: [
        { field: 'woText', header: 'เลขที่ใบงาน', minWidth: '120px' },
        { field: 'jobDate', header: 'วันที่', minWidth: '100px', format: 'date' },
        { field: 'gold', header: 'รายละเอียด', minWidth: '140px', sortable: false },
        { field: 'lossPercent', header: '%loss', minWidth: '80px', align: 'right', format: 'number' },
        { field: 'weightLossActual', header: 'น้ำหนัก loss', minWidth: '110px', align: 'right' },
        { field: 'totalWages', header: 'จำนวนเงิน', minWidth: '110px', align: 'right', format: 'decimal2' }
      ]
    }
  },

  computed: {
    availableItems() {
      return this.items.filter((i) => !i.workerGoldLossSlipId)
    },

    totalWeightLoss() {
      return this.availableItems.reduce((sum, i) => sum + (i.weightLossActual || 0), 0)
    },

    netWeightLoss() {
      return this.totalWeightLoss + Number(this.goldReturn || 0)
    },

    totalMoneyDiff() {
      return this.availableItems.reduce((sum, i) => sum + (i.totalWages || 0), 0)
    }
  },

  watch: {
    isShow(val) {
      if (val) {
        this.goldReturn = 0
        this.remark = ''
      }
    }
  },

  methods: {
    formatDate(val) {
      if (!val) return ''
      return dayjs(val).format('DD/MM/YYYY')
    },

    fmtSign(val) {
      if (val == null) return '0.00'
      const v = Number(val)
      const abs = Math.abs(v).toFixed(2)
      if (v > 0) return `+${abs}`
      if (v < 0) return `-${abs}`
      return abs
    },

    async onSave() {
      if (this.availableItems.length === 0) {
        warning('ไม่มีรายการให้บันทึก', 'ข้อมูลไม่ครบ')
        return
      }

      const payload = {
        workerCode: this.worker.code,
        workerName: this.worker.nameTh,
        requestDateStart: formatISOString(this.dateRange.requestDateStart),
        requestDateEnd: formatISOString(this.dateRange.requestDateEnd),
        goldReturn: this.goldReturn,
        remark: this.remark,
        items: this.availableItems.map((i) => ({
          productionPlanStatusDetailId: i.id,
          productionPlanId: i.productionPlanId,
          itemNo: i.itemNo,
          wo: i.wo,
          woNumber: i.woNumber,
          productNumber: i.productNumber,
          productName: i.productName,
          gold: i.gold,
          goldSize: i.goldSize,
          jobDate: i.jobDate,
          goldQtySend: i.goldQtySend,
          goldWeightSend: i.goldWeightSend,
          goldQtyCheck: i.goldQtyCheck,
          goldWeightCheck: i.goldWeightCheck,
          lossPercent: i.lossPercent,
          weightLossAllowed: i.weightLossAllowed,
          weightLossActual: i.weightLossActual,
          goldLossPrice: i.wages,
          moneyDiff: i.totalWages
        }))
      }

      const res = await api.jewelry.post('Worker/CreateGoldLossSlip', payload)
      if (res) {
        success('บันทึก slip สำเร็จ — เลขที่ ' + (res.documentNo || ''), 'สำเร็จ')
        this.$emit('saved', res)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.section-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  background: #ffffff !important;

  h6 {
    color: var(--base-font-color);
    font-weight: 600;
    padding-bottom: 8px;
    border-bottom: 1px solid #f0f0f0;
    margin-bottom: 12px;
    background: transparent !important;
  }
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.summary-label {
  font-weight: 500;
  color: var(--base-font-color);
}

.summary-value {
  font-weight: 600;
}

.input-sm {
  width: 120px;
  padding: 4px 8px;
  font-size: 0.9rem;
}

.loss-positive {
  color: #038387;
  font-weight: 600;
}

.loss-negative {
  color: var(--base-red);
  font-weight: 600;
}

textarea.form-control {
  resize: vertical;
}
</style>
