<!--
  delivery-late-customers-panel — ตาราง "ลูกค้าที่ได้รับของช้าบ่อย" (reportRef: lateCustomers) ของหมวด
  "ส่งงานตรงเวลา" — มาจาก Delivery.lateCustomers โดยตรง (ไม่มี endpoint แยก ไม่ paginate)

  Props:
    rows    — Array (required) จาก Delivery.lateCustomers
    loading — Boolean (false)
-->
<template>
  <div id="insight-report-lateCustomers" class="delivery-late-customers-panel">
    <SectionCardGeneric :title="$t('view.productionInsight.delivery.lateCustomersTitle')" icon="bi-people" accent="warning" headerStyle="legend">
      <div v-if="!rows.length" class="delivery-late-customers-panel__empty">
        {{ $t('view.productionInsight.delivery.lateCustomersEmpty') }}
      </div>
      <div v-else class="responsive-table-wrapper">
        <BaseDataTable :items="rows" :columns="columns" :paginator="false" dataKey="customerCode" :loading="loading">
          <template #completedCountTemplate="{ data }">
            <div class="text-right">{{ formatCount(data.completedCount) }}</div>
          </template>
          <template #lateCountTemplate="{ data }">
            <div class="text-right">{{ formatCount(data.lateCount) }}</div>
          </template>
          <template #latePercentTemplate="{ data }">
            <div class="text-right">{{ formatPercent(data.latePercent) }}</div>
          </template>
          <template #lateMedianDaysTemplate="{ data }">
            <div class="text-right">{{ formatDays(data.lateMedianDays) }}</div>
          </template>
        </BaseDataTable>
      </div>
    </SectionCardGeneric>
  </div>
</template>

<script>
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  name: 'DeliveryLateCustomersPanel',

  components: {
    SectionCardGeneric,
    BaseDataTable
  },

  props: {
    rows: {
      type: Array,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    columns() {
      return [
        { field: 'customerCode', header: this.$t('view.productionInsight.delivery.lateCustomersColCode'), sortable: false, minWidth: '110px' },
        { field: 'customerName', header: this.$t('view.productionInsight.delivery.lateCustomersColName'), sortable: false, minWidth: '180px' },
        { field: 'completedCount', header: this.$t('view.productionInsight.delivery.lateCustomersColCompleted'), sortable: false, minWidth: '100px', align: 'right' },
        { field: 'lateCount', header: this.$t('view.productionInsight.delivery.lateCustomersColLateCount'), sortable: false, minWidth: '80px', align: 'right' },
        { field: 'latePercent', header: this.$t('view.productionInsight.delivery.lateCustomersColLatePercent'), sortable: false, minWidth: '90px', align: 'right' },
        { field: 'lateMedianDays', header: this.$t('view.productionInsight.delivery.lateCustomersColLateMedianDays'), sortable: false, minWidth: '110px', align: 'right' }
      ]
    }
  },

  methods: {
    formatCount(value) {
      return value != null ? new Intl.NumberFormat('th-TH').format(value) : '—'
    },

    formatPercent(value) {
      return value != null ? `${new Intl.NumberFormat('th-TH', { maximumFractionDigits: 1 }).format(value)}%` : '—'
    },

    formatDays(value) {
      return value != null ? new Intl.NumberFormat('th-TH', { maximumFractionDigits: 1 }).format(value) : '—'
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.delivery-late-customers-panel {
  scroll-margin-top: calc(var(--mainbar-height) + 64px);
  min-width: 0;
}

.delivery-late-customers-panel__empty {
  padding: var(--sp-xl) 0;
  text-align: center;
  color: var(--base-sub-color);
}
</style>
