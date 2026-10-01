<!--
  gold-target-history-modal — ประวัติการเปลี่ยนเป้า % Loss ของ 1 คู่ (ประเภทช่าง, โลหะ) (ProductionInsight/
  GoldLossTargetHistory?workerType=&metal=) — เปิดจากลิงก์ "ประวัติ" ต่อแถวใน gold-target-panel.vue

  Props:
    show       — Boolean (required) — เปิด/ปิด modal
    workerType — Number|null (null) — ประเภทช่างที่ดูประวัติ
    metal      — String ('GOLD') — 'GOLD'|'SILVER'
    label      — String ('') — ชื่อประเภทช่าง + โลหะที่แปลแล้ว (ใช้ในหัวข้อ)

  Emits: closeModal
-->
<template>
  <modal :showModal="show" @closeModal="$emit('closeModal')" width="600px">
    <template #title>
      <span class="title-text-lg">{{ $t('view.productionInsight.gold.targetHistoryTitle', { name: label }) }}</span>
    </template>
    <template #content>
      <div v-if="!rows.length" class="gold-target-history-modal__empty">
        {{ $t('view.productionInsight.gold.targetHistoryEmpty') }}
      </div>
      <div v-else class="responsive-table-wrapper">
        <BaseDataTable :items="rows" :columns="columns" :paginator="false" dataKey="effectiveFrom">
          <template #effectiveFromTemplate="{ data }">{{ formatDate(data.effectiveFrom) }}</template>
          <template #targetPercentTemplate="{ data }">
            <div class="text-right">{{ data.targetPercent }}%</div>
          </template>
        </BaseDataTable>
      </div>
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'

import { useProductionInsightApiStore } from '@/stores/modules/api/production/production-insight-api.js'
import { formatDate } from '@/services/utils/dayjs.js'

import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

export default {
  name: 'GoldTargetHistoryModal',

  components: {
    modal,
    BaseDataTable
  },

  setup() {
    const productionInsightStore = useProductionInsightApiStore()
    return { productionInsightStore }
  },

  props: {
    show: {
      type: Boolean,
      required: true
    },
    workerType: {
      type: Number,
      default: null
    },
    metal: {
      type: String,
      default: 'GOLD'
    },
    label: {
      type: String,
      default: ''
    }
  },

  emits: ['closeModal'],

  data() {
    return {
      rows: []
    }
  },

  computed: {
    columns() {
      return [
        { field: 'effectiveFrom', header: this.$t('view.productionInsight.gold.targetHistoryColDate'), sortable: false, minWidth: '120px' },
        { field: 'targetPercent', header: this.$t('view.productionInsight.gold.targetHistoryColPercent'), sortable: false, minWidth: '80px', align: 'right' },
        { field: 'createBy', header: this.$t('view.productionInsight.gold.targetHistoryColBy'), sortable: false, minWidth: '120px' },
        { field: 'remark', header: this.$t('view.productionInsight.gold.targetHistoryColRemark'), sortable: false, minWidth: '180px' }
      ]
    }
  },

  watch: {
    show(value) {
      if (value && this.workerType != null) this.fetchHistory()
    }
  },

  methods: {
    formatDate,

    async fetchHistory() {
      const res = await this.productionInsightStore.fetchGoldLossTargetHistory(this.workerType, this.metal)
      this.rows = res || []
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';

.gold-target-history-modal__empty {
  padding: var(--sp-xl) 0;
  text-align: center;
  color: var(--base-sub-color);
}
</style>
