<template>
  <modal :showModal="isShow" @closeModal="$emit('closeModal')" width="980px" :isShowActionPart="true">
    <template #title>
      <span class="title-text-lg px-3 pt-3 d-block">บันทึก Gold Loss Slip</span>
    </template>
    <template #content>
      <div class="p-3">
        <div class="d-flex justify-content-between mb-3">
          <span class="title-text">พนักงาน: {{ worker.code }} - {{ worker.nameTh }}</span>
          <span class="title-text mr-4">
            ช่วงวันที่: {{ formatDate(dateRange.requestDateStart) }} - {{ formatDate(dateRange.requestDateEnd) }}
          </span>
        </div>

        <div class="section-card mb-3">
          <h6>รายการที่จะบันทึก ({{ availableItems.length }} รายการ)</h6>
          <BaseDataTable
            :items="availableItems"
            :totalRecords="availableItems.length"
            :columns="tableColumns"
            :paginator="false"
            scrollHeight="240px"
          >
            <template #woTextTemplate="{ data }">
              <span>{{ data.wo }}{{ data.woNumber ? ' - ' + data.woNumber : '' }}</span>
            </template>
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

        <div class="section-card mb-3">
          <pageTitle title="รับคืนทอง" :isShowBtnClose="false" />

          <div v-if="goldReturnItems.length === 0" class="text-muted text-center py-2" style="font-size:0.9rem">
            ไม่มีรายการรับคืนทอง
          </div>

          <div v-else>
            <!-- eslint-disable-next-line vue/no-restricted-syntax -->
            <!-- editable form table — rows contain inline inputs (InputTextGeneric + AutoCompleteGeneric) -->
            <table class="return-table w-100">
              <thead>
                <tr>
                  <th>Gold Size</th>
                  <th>น้ำหนัก (g)</th>
                  <th>ราคา/กรัม</th>
                  <th class="text-right">จำนวนเงิน</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, idx) in goldReturnItems" :key="idx">
                  <td>
                    <span class="title-text">{{ row.goldSize }}</span>
                  </td>
                  <td>
                    <InputTextGeneric
                      type="number"
                      step="0.001"
                      :min="0"
                      v-model.number="row.weight"
                    />
                  </td>
                  <td>
                    <AutoCompleteGeneric
                      :modelValue="getPriceDisplayValue(row)"
                      :useStaticList="true"
                      :staticOptions="getPriceOptions(row.goldSize)"
                      optionLabel="label"
                      :forceSelection="false"
                      placeholder="ราคา/กรัม"
                      customClass="price-ac"
                      @update:modelValue="onPriceChange(idx, $event)"
                    />
                  </td>
                  <td class="text-right">
                    <span>{{ fmt2(getRowAmount(row)) }}</span>
                  </td>
                </tr>
              </tbody>
            </table>

            <div class="d-flex justify-content-end mt-2">
              <span class="summary-label mr-3">รวมรับคืนทอง (เงิน):</span>
              <span class="summary-value">{{ fmt2(totalGoldReturnAmount) }} บาท</span>
            </div>
          </div>
        </div>

        <div class="section-card mb-3">
          <h6>สรุปยอด</h6>
          <div class="summary-row">
            <span class="summary-label">รวมเงิน loss</span>
            <span class="summary-value">{{ fmt2(totalMoneyLoss) }} บาท</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">(+) รับคืนทอง (เงิน)</span>
            <span class="summary-value text-teal">+ {{ fmt2(totalGoldReturnAmount) }} บาท</span>
          </div>
          <hr class="my-2" />
          <div class="summary-row">
            <span class="summary-label fw-bold">ยอดสุทธิจ่ายช่าง</span>
            <span class="summary-value" :class="netPayAmount < 0 ? 'loss-negative' : netPayAmount > 0 ? 'loss-positive' : ''">
              {{ fmtSign(netPayAmount) }} บาท
            </span>
          </div>
          <hr class="my-2" />
          <div class="summary-row">
            <span class="summary-label">รวมน้ำหนัก loss</span>
            <span class="summary-value" :class="totalWeightLoss > 0 ? 'loss-positive' : totalWeightLoss < 0 ? 'loss-negative' : ''">
              {{ fmtSign(totalWeightLoss) }} กรัม
            </span>
          </div>
          <div class="summary-row">
            <span class="summary-label">รวมน้ำหนักคืน</span>
            <span class="summary-value">{{ fmt2(totalReturnWeight) }} กรัม</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">น้ำหนัก loss สุทธิ</span>
            <span
              class="summary-value"
              :class="netWeightLoss > 0 ? 'loss-positive' : netWeightLoss < 0 ? 'loss-negative' : ''"
            >{{ fmtSign(netWeightLoss) }} กรัม</span>
          </div>
        </div>

        <div>
          <TextareaGeneric
            v-model="remark"
            placeholder="หมายเหตุ"
            :rows="2"
          />
        </div>
      </div>
    </template>

    <template #action>
      <button class="btn btn-sm btn-main" @click="onSave">
        <i class="bi bi-save mr-1"></i> {{ $t('common.btn.save') }} &amp; พิมพ์
      </button>
      <button class="btn btn-sm btn-outline-main ml-2" @click="$emit('closeModal')">{{ $t('common.btn.cancel') }}</button>
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
import AutoCompleteGeneric from '@/components/prime-vue/AutoCompleteGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import TextareaGeneric from '@/components/generic/TextareaGeneric.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))
const pageTitle = defineAsyncComponent(() => import('@/components/custom/page-title.vue'))

export default {
  name: 'GoldLossSlipModal',

  components: { modal, BaseDataTable, AutoCompleteGeneric, pageTitle, InputTextGeneric, TextareaGeneric },

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
      goldReturnItems: [],
      remark: '',
      tableColumns: [
        { field: 'woText', header: 'เลขที่ใบงาน', minWidth: '120px' },
        { field: 'jobDate', header: 'วันที่', minWidth: '100px', format: 'date' },
        { field: 'gold', header: 'รายละเอียด', minWidth: '140px', sortable: false },
        { field: 'lossPercent', header: '%loss', minWidth: '80px', align: 'right', format: 'number' },
        { field: 'weightLossActual', header: 'น้ำหนัก loss', minWidth: '110px', align: 'right' },
        { field: 'goldLossPrice', header: 'ราคา/กรัม', minWidth: '110px', align: 'right', format: 'decimal2' },
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

    totalReturnWeight() {
      return this.goldReturnItems.reduce((sum, r) => sum + (r.weight || 0), 0)
    },

    netWeightLoss() {
      return this.totalWeightLoss + this.totalReturnWeight
    },

    totalMoneyLoss() {
      return this.availableItems.reduce((sum, i) => sum + (i.totalWages || 0), 0)
    },

    totalGoldReturnAmount() {
      return this.goldReturnItems.reduce((sum, r) => sum + this.getRowAmount(r), 0)
    },

    netPayAmount() {
      return this.totalMoneyLoss + this.totalGoldReturnAmount
    }
  },

  watch: {
    isShow(val) {
      if (val) {
        this.remark = ''
        if (this.goldReturnItems.length === 0) {
          this.initReturnRowsFromItems()
        }
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

    fmt2(val) {
      if (val == null) return '0.00'
      return Number(val).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    },

    getPriceOptions(goldSize) {
      const prices = this.availableItems
        .filter((i) => i.goldSize === goldSize)
        .map((i) => i.goldLossPrice ?? i.wages)
        .filter((p) => p != null)
      const distinct = [...new Set(prices)]
      return distinct.map((p) => ({ label: this.fmt2(p), value: p }))
    },

    getPriceDisplayValue(row) {
      if (row.pricePerGram == null || row.pricePerGram === 0) return null
      return { label: this.fmt2(row.pricePerGram), value: row.pricePerGram }
    },

    onPriceChange(idx, val) {
      const row = this.goldReturnItems[idx]
      if (val == null) {
        row.pricePerGram = 0
      } else if (typeof val === 'object' && val !== null) {
        row.pricePerGram = Number(val.value) || 0
      } else {
        const parsed = parseFloat(String(val).replace(/,/g, ''))
        row.pricePerGram = isNaN(parsed) ? 0 : parsed
      }
    },

    getRowAmount(row) {
      return (row.weight || 0) * (row.pricePerGram || 0)
    },

    initReturnRowsFromItems() {
      const groups = new Map()
      for (const it of this.availableItems) {
        if (it.goldSize && !groups.has(it.goldSize)) {
          groups.set(it.goldSize, it.goldLossPrice ?? it.wages ?? 0)
        }
      }
      this.goldReturnItems = Array.from(groups.entries()).map(([goldSize, price]) => ({
        goldSize,
        weight: 0,
        pricePerGram: price,
        amount: 0
      }))
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
        remark: this.remark,
        goldReturnItems: this.goldReturnItems.map((r) => ({
          goldSize: r.goldSize,
          weight: r.weight || 0,
          pricePerGram: r.pricePerGram || 0,
          amount: this.getRowAmount(r)
        })),
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
          goldLossPrice: i.goldLossPrice ?? 0,
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
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--sp-lg);
  background: var(--color-card-bg) !important;

  h6 {
    color: var(--base-font-color);
    font-weight: 600;
    padding-bottom: var(--sp-sm);
    border-bottom: 1px solid #f0f0f0;
    margin-bottom: var(--sp-md);
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

.text-teal {
  color: var(--base-green);
}

.loss-positive {
  color: var(--base-green);
  font-weight: 600;
}

.loss-negative {
  color: var(--base-red);
  font-weight: 600;
}

.return-table {
  border-collapse: collapse;
  font-size: var(--fs-base);

  th, td {
    padding: 6px 8px;
    border-bottom: 1px solid #f0f0f0;
    vertical-align: middle;
  }

  th {
    font-weight: 600;
    color: var(--base-font-color);
    border-bottom: 2px solid var(--color-border);
    white-space: nowrap;
  }

  .text-right {
    text-align: right;
  }
}

:deep(.price-ac) {
  width: 100%;

  .p-autocomplete-input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    font-size: var(--fs-base);
  }
}
</style>
