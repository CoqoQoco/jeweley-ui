<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-2">
      <span class="title-text">
        คำนวณ Gold Loss — แต่ง
        <small v-if="reportData.hasSavedData" class="text-muted ms-2">(บันทึกแล้ว)</small>
      </span>
      <button class="btn btn-sm btn-main" @click="onSave">
        <i class="bi bi-save"></i> บันทึก
      </button>
    </div>

    <div class="responsive-table-wrapper">
      <table class="table table-bordered table-sm">
        <thead>
          <tr style="background: #f8f9fa">
            <th style="min-width: 100px">ประเภททอง</th>
            <th class="text-right" style="min-width: 120px">น้ำหนักจ่ายรวม</th>
            <th class="text-right" style="min-width: 120px">น้ำหนักรับรวม</th>
            <th class="text-right" style="min-width: 140px">น้ำหนัก ขาด/เกิน</th>
            <th class="text-center" style="min-width: 100px">%loss</th>
            <th class="text-center" style="min-width: 140px">ราคาทอง (บาท/กรัม)</th>
            <th class="text-right" style="min-width: 130px">น้ำหนักที่ loss ได้</th>
            <th class="text-right" style="min-width: 120px">น้ำหนัก loss</th>
            <th class="text-right" style="min-width: 130px">เงิน ได้/ขาด</th>
            <th style="min-width: 160px">หมายเหตุ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, idx) in computedRows" :key="row.goldType">
            <td>
              <strong>{{ row.goldType }}</strong>
              <small class="text-muted d-block">{{ row.goldTypeName }}</small>
            </td>
            <td class="text-right">{{ fmt2(row.sumGoldWeightSend) }}</td>
            <td class="text-right">{{ fmt2(row.sumGoldWeightCheck) }}</td>
            <td class="text-right" style="font-weight: 600" :style="colorStyle(row.rawLoss * -1)">
              {{ fmtSign2(row.rawLoss * -1) }}
            </td>
            <td>
              <input
                type="number"
                step="any"
                min="0"
                max="100"
                class="form-control form-control-sm text-right"
                v-model.number="editData[idx].lossPercent"
                placeholder="0"
              />
            </td>
            <td>
              <input
                type="number"
                step="any"
                min="0"
                class="form-control form-control-sm text-right"
                v-model.number="editData[idx].goldLossPrice"
                placeholder="0.00"
              />
            </td>
            <td class="text-right" style="font-weight: 600">
              {{ fmt2(row.weightLossAllowed) }}
            </td>
            <td class="text-right" style="font-weight: 600" :style="colorStyle(row.weightLossActual)">
              {{ fmtSign2(row.weightLossActual) }}
            </td>
            <td class="text-right" style="font-weight: 600" :style="colorStyle(row.moneyDiff)">
              {{ fmtSign2(row.moneyDiff) }}
            </td>
            <td>
              <input
                type="text"
                class="form-control form-control-sm"
                v-model="editData[idx].lossRemark"
                placeholder="รายละเอียด..."
              />
            </td>
          </tr>
          <tr v-if="computedRows.length === 0">
            <td colspan="10" class="text-center text-muted py-3">ไม่พบข้อมูล</td>
          </tr>
        </tbody>
        <tfoot v-if="computedRows.length > 0">
          <tr style="background: #f8f9fa">
            <td colspan="8" class="text-right title-text">��วมเงิน ได้/ขาด :</td>
            <td class="text-right" style="font-weight: 700" :style="colorStyle(totalMoneyDiff)">
              {{ fmtSign2(totalMoneyDiff) }}
            </td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script>
import { confirmSubmit } from '@/services/alert/sweetAlerts.js'

export default {
  name: 'GoldLossTangDataTableView',

  props: {
    reportData: {
      type: Object,
      default: () => ({})
    }
  },

  emits: ['save', 'reload'],

  data() {
    return {
      editData: []
    }
  },

  computed: {
    computedRows() {
      if (!this.reportData || !this.reportData.rows) return []

      return this.reportData.rows.map((row, idx) => {
        const edit = this.editData[idx] || {}
        const lossPercent = edit.lossPercent ?? 0
        const goldLossPrice = edit.goldLossPrice ?? 0

        const sumSend = row.sumGoldWeightSend ?? 0
        const sumCheck = row.sumGoldWeightCheck ?? 0
        const rawLoss = sumSend - sumCheck
        const weightLossAllowed = sumSend * (lossPercent / 100)
        const weightLossActual = weightLossAllowed - rawLoss
        const moneyDiff = weightLossActual * goldLossPrice

        return {
          ...row,
          rawLoss,
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
    onSave() {
      confirmSubmit('ต้องการบันทึก Gold Loss แต่ง หรือไม่?', 'ยืนยันการบันทึก', () => {
        this.$emit('save', this.editData)
      })
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
      if (val > 0) return 'color: #038387'
      if (val < 0) return 'color: #ff4d4d'
      return ''
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.table th {
  font-size: 0.85rem;
  font-weight: 600;
}

.table td {
  vertical-align: middle;
  font-size: 0.85rem;
}

.table tfoot td {
  font-size: 0.9rem;
}
</style>
