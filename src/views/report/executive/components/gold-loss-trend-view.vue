<!--
  gold-loss-trend-view — สรุป Gold Loss จากใบ (SLIP) 6 เดือนล่าสุด (รวมเดือนปัจจุบันที่ยังไม่ครบ) ในหน้า
  ภาพรวมผู้บริหาร ใช้กราฟชุดเดียวกับ gold-loss-dashboard (slip-compare-chart / slip-worker-ranking-chart)
  ผ่าน shared component — ไม่มี logic คำนวณซ้ำ

  ยิง endpoint ต่อช่างแบบ groupByMonth:true ครั้งเดียวตอน mount (lazy ตาม tab การผลิตของหน้านี้) ครอบคลุม
  ทั้งช่วง 6 เดือน แล้ว slice ฝั่ง client ด้วย filterRowsByMonthKeys สำหรับตัวเลือกช่วงกราฟอันดับ
  (เดือนนี้/3 เดือน) — ไม่ยิง endpoint ซ้ำตอนสลับช่วง
-->
<template>
  <div class="gold-loss-trend">
    <div class="gold-loss-trend__header">
      <h6 class="gold-loss-trend__title">{{ $t('view.executive.goldLossTrend.title') }}</h6>
      <router-link v-if="canViewGoldLossDashboard" :to="{ path: '/gold-loss-dashboard' }" class="gold-loss-trend__link">
        {{ $t('view.executive.goldLossTrend.detailLink') }}
        <i class="bi bi-chevron-right"></i>
      </router-link>
    </div>

    <div class="gold-loss-trend__grid">
      <SlipCompareChart :tangRows="normalizedTangRows" :setterRows="normalizedSetterRows" :monthKeys="compareMonthKeys" />

      <SlipWorkerRankingChart :tangRows="rankingTangRows" :setterRows="rankingSetterRows" v-model:dept="rankingDept">
        <template #controls>
          <ToggleGroupGeneric v-model="rankingRangeValue" :options="rangeOptions" :ariaLabel="$t('view.executive.goldLossTrend.rangeLabel')" />
        </template>
      </SlipWorkerRankingChart>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'

import api from '@/axios/axios-helper.js'
import { formatISOString } from '@/services/utils/dayjs.js'
import { normalizeTangRow, normalizeSetterRow, buildMonthRange, monthKeyOf, filterRowsByMonthKeys } from '@/services/utils/gold-loss/slip-monthly-helpers.js'
import { useAuthStore } from '@/stores/modules/authen/authen-store.js'
import { PermissionService } from '@/services/permission/permission.js'
import { PERMISSIONS } from '@/services/permission/config.js'

import ToggleGroupGeneric from '@/components/generic/ToggleGroupGeneric.vue'
import SlipCompareChart from '@/components/gold-loss/slip-compare-chart.vue'
import SlipWorkerRankingChart from '@/components/gold-loss/slip-worker-ranking-chart.vue'

export default {
  name: 'ExecutiveGoldLossTrendView',

  components: {
    ToggleGroupGeneric,
    SlipCompareChart,
    SlipWorkerRankingChart
  },

  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },

  props: {
    refreshToken: {
      type: Number,
      default: 0
    },
    rankingRange: {
      type: String,
      default: '3m'
    }
  },

  emits: ['update:rankingRange'],

  data() {
    return {
      tangWorkerRows: [],
      setterWorkerRows: [],
      rankingDept: 'tang'
    }
  },

  computed: {
    permissionService() {
      return new PermissionService(this.authStore.getUser, this.authStore.permissions)
    },

    canViewGoldLossDashboard() {
      return this.permissionService.hasAnyPermission([PERMISSIONS.PRODUCTION_VIEW, PERMISSIONS.WORKER_VIEW])
    },

    rankingRangeValue: {
      get() {
        return this.rankingRange
      },
      set(value) {
        this.$emit('update:rankingRange', value)
      }
    },

    rangeOptions() {
      return [
        { value: 'thisMonth', label: this.$t('view.executive.goldLossTrend.rangeThisMonth') },
        { value: '3m', label: this.$t('view.executive.goldLossTrend.range3Months') }
      ]
    },

    normalizedTangRows() {
      return this.tangWorkerRows.map((r) => normalizeTangRow(r))
    },

    normalizedSetterRows() {
      return this.setterWorkerRows.map((r) => normalizeSetterRow(r))
    },

    // 6 เดือนล่าสุดรวมเดือนปัจจุบัน — ช่วงคงที่ ไม่มีตัวควบคุมจาก user
    compareMonthKeys() {
      return buildMonthRange(dayjs().subtract(5, 'month'), dayjs()).map((m) => monthKeyOf(m.year, m.month))
    },

    rankingMonthKeys() {
      return this.rankingRange === 'thisMonth' ? this.compareMonthKeys.slice(-1) : this.compareMonthKeys.slice(-3)
    },

    rankingTangRows() {
      return filterRowsByMonthKeys(this.normalizedTangRows, this.rankingMonthKeys)
    },

    rankingSetterRows() {
      return filterRowsByMonthKeys(this.normalizedSetterRows, this.rankingMonthKeys)
    }
  },

  watch: {
    refreshToken() {
      this.fetchTangWorkerReport()
      this.fetchSetterWorkerReport()
    }
  },

  methods: {
    async fetchTangWorkerReport() {
      const res = await api.jewelry.post(
        'Worker/ReportGoldLossTangByWorker',
        {
          take: 0,
          skip: 0,
          sort: [],
          search: {
            requestDateStart: formatISOString(dayjs().subtract(5, 'month').startOf('month')),
            requestDateEnd: formatISOString(dayjs()),
            groupByMonth: true
          }
        },
        { skipLoading: true }
      )
      this.tangWorkerRows = res?.data || []
    },

    async fetchSetterWorkerReport() {
      const res = await api.jewelry.post(
        'Worker/ReportGoldLossSlipByWorker',
        {
          take: 0,
          skip: 0,
          sort: [],
          search: {
            requestDateStart: formatISOString(dayjs().subtract(5, 'month').startOf('month')),
            requestDateEnd: formatISOString(dayjs()),
            groupByMonth: true
          }
        },
        { skipLoading: true }
      )
      this.setterWorkerRows = res?.data || []
    }
  },

  mounted() {
    this.fetchTangWorkerReport()
    this.fetchSetterWorkerReport()
  }
}
</script>

<style lang="scss" scoped>
.gold-loss-trend__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--sp-md);
}

.gold-loss-trend__title {
  color: var(--base-font-color);
  font-weight: 600;
  font-size: var(--fs-base);
  margin: 0;
}

.gold-loss-trend__link {
  font-size: var(--fs-sm);
  font-weight: 600;
  color: var(--base-green);
  white-space: nowrap;

  &:hover {
    text-decoration: underline;
  }
}

.gold-loss-trend__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-md);
  align-items: start;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
}

</style>
