<!--
  wip-standard-history-modal — ประวัติการเปลี่ยนมาตรฐานเวลาผลิตของ 1 แผนก (ProductionInsight/
  StageStandardHistory) — เปิดจากลิงก์ "ประวัติ" ต่อแผนกใน wip-standards-panel.vue

  Props:
    show      — Boolean (required) — เปิด/ปิด modal
    deptKey   — String ('') — แผนกที่ดูประวัติ
    deptLabel — String ('') — ชื่อแผนกที่แปลแล้ว (ใช้ในหัวข้อ)

  Emits: closeModal
-->
<template>
  <modal :showModal="show" @closeModal="$emit('closeModal')" width="600px">
    <template #title>
      <span class="title-text-lg">{{ $t('view.productionInsight.wip.standardsHistoryTitle', { name: deptLabel }) }}</span>
    </template>
    <template #content>
      <div v-if="!rows.length" class="wip-standard-history-modal__empty">
        {{ $t('view.productionInsight.wip.standardsHistoryEmpty') }}
      </div>
      <div v-else class="responsive-table-wrapper">
        <BaseDataTable :items="rows" :columns="columns" :paginator="false" dataKey="effectiveFrom">
          <template #effectiveFromTemplate="{ data }">{{ formatDate(data.effectiveFrom) }}</template>
          <template #standardDaysTemplate="{ data }">
            <div class="text-right">{{ data.standardDays }}</div>
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
  name: 'WipStandardHistoryModal',

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
    deptKey: {
      type: String,
      default: ''
    },
    deptLabel: {
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
        { field: 'effectiveFrom', header: this.$t('view.productionInsight.wip.standardsHistoryColDate'), sortable: false, minWidth: '120px' },
        { field: 'standardDays', header: this.$t('view.productionInsight.wip.standardsHistoryColDays'), sortable: false, minWidth: '80px', align: 'right' },
        { field: 'createBy', header: this.$t('view.productionInsight.wip.standardsHistoryColBy'), sortable: false, minWidth: '120px' },
        { field: 'remark', header: this.$t('view.productionInsight.wip.standardsHistoryColRemark'), sortable: false, minWidth: '180px' }
      ]
    }
  },

  watch: {
    show(value) {
      if (value && this.deptKey) this.fetchHistory()
    }
  },

  methods: {
    formatDate,

    async fetchHistory() {
      const res = await this.productionInsightStore.fetchStageStandardHistory(this.deptKey)
      this.rows = res || []
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';

.wip-standard-history-modal__empty {
  padding: var(--sp-xl) 0;
  text-align: center;
  color: var(--base-sub-color);
}
</style>
