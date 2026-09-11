<template>
  <SearchBarGeneric
    :title="$t('view.report.saleByChannel.searchTitle')"
    :description="$t('view.report.saleByChannel.searchDesc')"
    @search="onSearch"
    @clear="onClear"
  >
    <template #fields>
      <div>
        <span class="title-text">{{ $t('view.report.saleByChannel.dateRangeLabel') }}</span>
        <DateRangeGeneric
          :startDate="form.start"
          :endDate="form.end"
          :startPlaceholder="$t('view.report.common.dateFrom')"
          :endPlaceholder="$t('view.report.common.dateTo')"
          @update:startDate="form.start = $event"
          @update:endDate="form.end = $event"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.report.saleByChannel.channelLabel') }}</span>
        <DropdownGeneric
          v-model="form.saleChannelCode"
          :options="channelOptions"
          optionLabel="name"
          optionValue="code"
          :placeholder="$t('common.label.all')"
          :showClear="true"
        />
      </div>
    </template>

    <template #actions-right>
      <ButtonGeneric variant="main" icon="bi-search" type="submit" :label="$t('common.btn.search')" />
      <ButtonGeneric variant="dark" icon="bi-x-circle" class="ml-2" :title="$t('common.btn.clear')" @click="onClear" />
      <ButtonGeneric
        variant="green"
        icon="bi-file-earmark-excel"
        class="ml-2"
        :title="$t('common.btn.export')"
        :disabled="!saleReportByChannelStore.report.summary.invoiceCount"
        @click="onExport"
      />
    </template>
  </SearchBarGeneric>
</template>

<script>
import { useSaleReportByChannelApiStore } from '@/stores/modules/api/sale/sale-report-by-channel-store.js'
import { useSaleChannelApiStore } from '@/stores/modules/api/sale/sale-channel-store.js'
import { warning } from '@/services/alert/sweetAlerts.js'

import SearchBarGeneric from '@/components/generic/SearchBarGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import DateRangeGeneric from '@/components/prime-vue/DateRangeGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'

export default {
  name: 'ReportSaleByChannelSearchView',

  components: {
    SearchBarGeneric,
    ButtonGeneric,
    DateRangeGeneric,
    DropdownGeneric
  },

  setup() {
    const saleReportByChannelStore = useSaleReportByChannelApiStore()
    const saleChannelStore = useSaleChannelApiStore()
    return { saleReportByChannelStore, saleChannelStore }
  },

  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    }
  },

  emits: ['search', 'clear', 'export'],

  watch: {
    modelForm: {
      handler(val) {
        this.form = { ...val }
      },
      deep: true
    }
  },

  data() {
    return {
      form: { ...this.modelForm },
      channelList: []
    }
  },

  computed: {
    channelOptions() {
      return this.channelList.map((channel) => ({
        code: channel.code,
        name: channel.nameTh || channel.nameEn || channel.code
      }))
    }
  },

  methods: {
    isDateValid() {
      if (!this.form.start || !this.form.end) {
        warning(this.$t('view.report.common.dateFrom'))
        return false
      }
      return true
    },

    onSearch() {
      if (!this.isDateValid()) return
      this.$emit('search', this.form)
    },

    onClear() {
      this.$emit('clear')
    },

    onExport() {
      this.$emit('export')
    }
  },

  async mounted() {
    this.channelList = await this.saleChannelStore.fetchActiveList({ skipLoading: true })
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
