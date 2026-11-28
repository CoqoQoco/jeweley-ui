<template>
  <div class="app-container">
    <SearchBarGeneric
      :title="$t('view.receiptStock.gem.returnUnlinked.title')"
      :description="$t('view.receiptStock.gem.returnUnlinked.description')"
      icon="bi-link-45deg"
      @search="onSearch"
      @clear="onClear"
    >
      <template #fields>
        <div>
          <span class="title-text">{{ $t('view.receiptStock.gem.returnUnlinked.fieldDate') }}</span>
          <DateRangeGeneric
            :startDate="form.requestDateStart"
            :endDate="form.requestDateEnd"
            :startPlaceholder="$t('common.label.start')"
            :endPlaceholder="$t('common.label.end')"
            :maxRangeDays="MAX_RANGE_DAYS"
            @update:startDate="form.requestDateStart = $event"
            @update:endDate="form.requestDateEnd = $event"
          />
        </div>
      </template>

      <template #actions-right>
        <ButtonGeneric variant="main" icon="bi-search" type="submit" :label="$t('common.btn.search')" />
        <ButtonGeneric
          variant="dark"
          icon="bi-x-circle"
          class="ml-2"
          :title="$t('common.btn.reset')"
          @click="onClear"
        />
      </template>
    </SearchBarGeneric>

    <div class="responsive-table-wrapper mt-2">
      <BaseDataTable
        :items="items"
        :totalRecords="total"
        :columns="columns"
        :perPage="take"
        dataKey="transectionId"
        :emptyMessage="$t('view.receiptStock.gem.returnUnlinked.emptyMessage')"
        @page="handlePageChange"
        @sort="handleSortChange"
      >
        <template #qtyWeightTemplate="{ data }">
          {{ fmt3(data.remainQty) }} / {{ fmt3(data.remainWeight) }}
        </template>
        <template #jobOrPoTemplate="{ data }">{{ data.woText || data.jobOrPo || '-' }}</template>
        <template #remarkTemplate="{ data }">
          {{ [data.remark1, data.remark2].filter(Boolean).join(' · ') || '-' }}
        </template>
        <template #suggestedTemplate="{ data }">
          <span v-if="data.suggestedOutboundRunning">
            {{ data.suggestedOutboundRunning }} · {{ fmt3(data.suggestedQty) }} / {{ fmt3(data.suggestedWeight) }}
          </span>
          <span v-else>-</span>
        </template>
        <template #actionTemplate="{ data }">
          <ButtonGeneric
            variant="green"
            icon="bi-box-arrow-up-right"
            :label="$t('view.receiptStock.gem.returnUnlinked.btnOpenPlan')"
            :disabled="!data.productionPlanId"
            @click="openPlan(data)"
          />
        </template>
      </BaseDataTable>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'

import { warning } from '@/services/alert/sweetAlerts.js'

import { useGemReturnApiStore } from '@/stores/modules/api/stock/gem-return-api.js'
import dataTablePaging from '@/composables/useDataTablePaging.js'

import SearchBarGeneric from '@/components/generic/SearchBarGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import DateRangeGeneric from '@/components/prime-vue/DateRangeGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

// API รับช่วงวันที่ไม่เกิน 366 วัน
const MAX_RANGE_DAYS = 366

// ค่าเริ่มต้น: 1 ม.ค. ปีนี้ ถึงวันนี้ (ปุ่มล้างคืนค่านี้)
const defaultForm = () => ({
  requestDateStart: dayjs().startOf('year').toDate(),
  requestDateEnd: dayjs().endOf('day').toDate()
})

export default {
  name: 'ReturnUnlinkedView',

  components: { SearchBarGeneric, ButtonGeneric, DateRangeGeneric, BaseDataTable },

  mixins: [dataTablePaging],

  setup() {
    const gemReturnStore = useGemReturnApiStore()
    return { gemReturnStore }
  },

  data() {
    return {
      MAX_RANGE_DAYS,
      form: defaultForm(),
      items: [],
      total: 0
    }
  },

  computed: {
    columns() {
      const t = (k) => this.$t(`view.receiptStock.gem.returnUnlinked.${k}`)
      return [
        { field: 'running', header: t('colRunning'), minWidth: '150px', sortable: false },
        { field: 'requestDate', header: t('colDate'), minWidth: '110px', format: 'date', sortable: false },
        { field: 'code', header: t('colGem'), minWidth: '160px', sortable: false },
        { field: 'qtyWeight', header: t('colQtyWeight'), minWidth: '150px', sortable: false },
        { field: 'jobOrPo', header: t('colPlan'), minWidth: '140px', sortable: false },
        { field: 'remark', header: t('colRemark'), minWidth: '180px', sortable: false },
        { field: 'suggested', header: t('colSuggested'), minWidth: '230px', sortable: false },
        { field: 'action', header: t('colAction'), minWidth: '150px', sortable: false }
      ]
    }
  },

  mounted() {
    this.fetchData()
  },

  methods: {
    isRangeValid() {
      const { requestDateStart: start, requestDateEnd: end } = this.form
      if (!start || !end) {
        warning(this.$t('view.receiptStock.gem.returnUnlinked.rangeRequired'))
        return false
      }
      if (dayjs(end).diff(dayjs(start), 'day') > MAX_RANGE_DAYS) {
        warning(this.$t('view.receiptStock.gem.returnUnlinked.rangeTooLong', { days: MAX_RANGE_DAYS }))
        return false
      }
      return true
    },

    async fetchData() {
      if (!this.isRangeValid()) return
      const res = await this.gemReturnStore.listUnlinkedReturn({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        formValue: this.form
      })
      this.items = res.data ?? []
      this.total = res.total ?? 0
    },

    onSearch() {
      this.resetPaging()
    },

    onClear() {
      this.form = defaultForm()
      this.resetPaging()
    },

    fmt3(val) {
      return Number(val || 0).toFixed(3)
    },

    openPlan(row) {
      const { href } = this.$router.resolve({
        name: 'plan-order-tracking-detail',
        params: { id: row.productionPlanId }
      })
      window.open(href, '_blank')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';
</style>
