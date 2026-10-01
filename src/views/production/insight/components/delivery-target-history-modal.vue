<!--
  delivery-target-history-modal — ประวัติการเปลี่ยนเป้า % ตรงเวลา (ProductionInsight/DeliveryTargetHistory)
  — เปิดจากลิงก์ "ประวัติ" ใน delivery-target-panel.vue (ค่าเดียวระดับทั้งบริษัท ไม่มี deptKey)

  Props:
    show — Boolean (required) — เปิด/ปิด modal

  Emits: closeModal
-->
<template>
  <modal :showModal="show" @closeModal="$emit('closeModal')" width="600px">
    <template #title>
      <span class="title-text-lg">{{ $t('view.productionInsight.delivery.targetHistoryTitle') }}</span>
    </template>
    <template #content>
      <div v-if="!rows.length" class="delivery-target-history-modal__empty">
        {{ $t('view.productionInsight.delivery.targetHistoryEmpty') }}
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
  name: 'DeliveryTargetHistoryModal',

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
        { field: 'effectiveFrom', header: this.$t('view.productionInsight.delivery.targetHistoryColDate'), sortable: false, minWidth: '120px' },
        { field: 'targetPercent', header: this.$t('view.productionInsight.delivery.targetHistoryColPercent'), sortable: false, minWidth: '80px', align: 'right' },
        { field: 'createBy', header: this.$t('view.productionInsight.delivery.targetHistoryColBy'), sortable: false, minWidth: '120px' },
        { field: 'remark', header: this.$t('view.productionInsight.delivery.targetHistoryColRemark'), sortable: false, minWidth: '180px' }
      ]
    }
  },

  watch: {
    show(value) {
      if (value) this.fetchHistory()
    }
  },

  methods: {
    formatDate,

    async fetchHistory() {
      const res = await this.productionInsightStore.fetchDeliveryTargetHistory()
      this.rows = res || []
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';

.delivery-target-history-modal__empty {
  padding: var(--sp-xl) 0;
  text-align: center;
  color: var(--base-sub-color);
}
</style>
