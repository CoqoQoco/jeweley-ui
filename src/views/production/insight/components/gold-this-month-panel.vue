<!--
  gold-this-month-panel — mini card "ทองเดือนนี้" ในหมวดภาพรวม (overview-section.vue)
  loss% เทียบ allowed% ต่อแผนก (ช่างแต่ง/ช่างฝัง) ของเดือนปัจจุบัน (เวลาไทย) + ปุ่มสลับไปหมวด "ทอง"

  ยิง Worker/ReportGoldLossTangByWorker + Worker/ReportGoldLossSlipByWorker (groupByMonth:true) ตรงด้วย
  axios-helper (ไม่ผ่าน store) เหมือน gold-loss-trend-view.vue/overview-tab-view.vue — normalize ผ่าน
  slip-monthly-helpers.js shape กลางแล้วรวมด้วย buildDeptKpi() เดียวกันทุกจุด ไม่คำนวณซ้ำ

  หมายเหตุ (ตามพิมพ์เขียว): endpoint นี้ให้ยอดรวมต่อช่าง/เดือนเท่านั้น ไม่มีข้อมูลระดับ "รายใบ" จึงแสดงได้
  แค่ loss% เทียบ allowed% (เขียว/เหลือง) — ไม่แสดง "เกินรายใบ n ใบ" เพราะไม่มีข้อมูลพอจะนับต่อใบจริง
-->
<template>
  <SectionCardGeneric
    :title="$t('view.productionInsight.overview.goldThisMonthTitle')"
    icon="bi-gem"
    accent="green"
    headerStyle="legend"
    class="gold-this-month-panel"
  >
    <div v-if="loading" class="gold-this-month-panel__loading">
      <i class="bi bi-arrow-repeat spin"></i>
      <span>{{ $t('common.label.loading') }}</span>
    </div>
    <div v-else class="gold-this-month-panel__rows">
      <div v-for="dept in deptRows" :key="dept.key" class="gold-this-month-panel__row">
        <span class="gold-this-month-panel__label">{{ dept.label }}</span>
        <span class="gold-this-month-panel__value" :class="`gold-this-month-panel__value--${dept.variant}`">
          {{ formatPercentTH(dept.lossPercent) }}
          <span class="gold-this-month-panel__vs">/ {{ dept.thresholdPercent != null ? formatPercentTH(dept.thresholdPercent) : '—' }}</span>
        </span>
      </div>
    </div>
    <ButtonGeneric
      variant="plain"
      icon="bi-chevron-right"
      class="gold-this-month-panel__link"
      :label="$t('view.productionInsight.overview.goldThisMonthLink')"
      @click="$emit('switch-section', 'gold')"
    />
  </SectionCardGeneric>
</template>

<script>
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

import api from '@/axios/axios-helper.js'
import { formatISOString } from '@/services/utils/dayjs.js'
import { normalizeTangRow, normalizeSetterRow, buildDeptKpi, formatPercentTH } from '@/services/utils/gold-loss/slip-monthly-helpers.js'
import { resolveGoldLossKpiVariant } from '@/views/report/executive/executive-helpers.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

dayjs.extend(utc)
dayjs.extend(timezone)

const THAI_TIMEZONE = 'Asia/Bangkok'

export default {
  name: 'GoldThisMonthPanel',

  components: {
    SectionCardGeneric,
    ButtonGeneric
  },

  emits: ['switch-section'],

  data() {
    return {
      loading: false,
      tangRows: [],
      setterRows: []
    }
  },

  computed: {
    normalizedTangRows() {
      return this.tangRows.map((r) => normalizeTangRow(r))
    },

    normalizedSetterRows() {
      return this.setterRows.map((r) => normalizeSetterRow(r))
    },

    deptRows() {
      return [
        { key: 'tang', label: this.$t('view.production.goldLossDashboard.overview.slipDeptTang'), kpi: buildDeptKpi(this.normalizedTangRows) },
        { key: 'setter', label: this.$t('view.production.goldLossDashboard.overview.slipDeptSetter'), kpi: buildDeptKpi(this.normalizedSetterRows) }
      ].map((row) => ({
        key: row.key,
        label: row.label,
        lossPercent: row.kpi.lossPercent,
        thresholdPercent: row.kpi.thresholdPercent,
        variant: resolveGoldLossKpiVariant(row.kpi.lossPercent, row.kpi.thresholdPercent ?? row.kpi.lossPercent)
      }))
    }
  },

  methods: {
    formatPercentTH,

    async fetchGoldThisMonth() {
      this.loading = true
      const now = dayjs().tz(THAI_TIMEZONE)
      const search = {
        requestDateStart: formatISOString(now.startOf('month')),
        requestDateEnd: formatISOString(now),
        groupByMonth: true
      }
      const [tangRes, setterRes] = await Promise.all([
        api.jewelry.post('Worker/ReportGoldLossTangByWorker', { take: 0, skip: 0, sort: [], search }, { skipLoading: true }),
        api.jewelry.post('Worker/ReportGoldLossSlipByWorker', { take: 0, skip: 0, sort: [], search }, { skipLoading: true })
      ])
      this.tangRows = tangRes?.data || []
      this.setterRows = setterRes?.data || []
      this.loading = false
    }
  },

  mounted() {
    this.fetchGoldThisMonth()
  }
}
</script>

<style lang="scss" scoped>
.gold-this-month-panel__loading {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-sm);
  color: var(--base-sub-color);
  font-size: var(--fs-base);
  padding: var(--sp-lg) 0;

  i {
    font-size: var(--fs-lg);
    animation: gold-this-month-spin 0.8s linear infinite;
  }
}

@keyframes gold-this-month-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.gold-this-month-panel__rows {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  gap: var(--sp-md);
  margin-bottom: var(--sp-md);
}

.gold-this-month-panel__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-md);
  padding-bottom: var(--sp-sm);
  border-bottom: 1px solid var(--color-border);

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
}

.gold-this-month-panel__label {
  font-size: var(--fs-base);
  color: var(--base-font-color);
  font-weight: 600;
}

.gold-this-month-panel__value {
  font-size: var(--fs-lg);
  font-weight: 700;

  &--green {
    color: var(--base-green);
  }

  &--warning {
    color: var(--base-warning);
  }
}

.gold-this-month-panel__vs {
  font-size: var(--fs-sm);
  font-weight: 500;
  color: var(--base-sub-color);
}

.gold-this-month-panel__link.btn {
  padding: 0;
  margin-top: auto;
  align-self: flex-start;
}
</style>
