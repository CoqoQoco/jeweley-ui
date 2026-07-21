<template>
  <SearchBarGeneric
    :title="$t('view.production.transferReport.searchTitle')"
    :description="$t('view.production.transferReport.searchDesc')"
    @search="onSearch"
    @clear="onClear"
  >
    <template #fields>
      <div>
        <span class="title-text">{{ $t('view.production.transferReport.dateRange') }}</span>
        <DateRangeGeneric
          :startDate="form.start"
          :endDate="form.end"
          :startPlaceholder="$t('common.label.start')"
          :endPlaceholder="$t('common.label.end')"
          @update:startDate="form.start = $event"
          @update:endDate="form.end = $event"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.production.transferReport.transferNumber') }}</span>
        <InputTextGeneric
          v-model.trim="form.transferNumber"
          :placeholder="$t('view.production.transferReport.placeholder.transferNumber')"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.production.transferReport.woText') }}</span>
        <InputTextGeneric
          v-model.trim="form.woText"
          :placeholder="$t('view.production.transferReport.placeholder.woText')"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.production.transferReport.statusFormer') }}</span>
        <DropdownGeneric
          :modelValue="form.statusFormer"
          :options="masterApiStore.planStatus"
          optionLabel="nameTh"
          optionValue="id"
          :placeholder="$t('common.label.all')"
          :showClear="true"
          @update:modelValue="form.statusFormer = $event"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.production.transferReport.statusTarget') }}</span>
        <DropdownGeneric
          :modelValue="form.statusTarget"
          :options="masterApiStore.planStatus"
          optionLabel="nameTh"
          optionValue="id"
          :placeholder="$t('common.label.all')"
          :showClear="true"
          @update:modelValue="form.statusTarget = $event"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.production.transferReport.productNumber') }}</span>
        <InputTextGeneric
          v-model.trim="form.productNumber"
          :placeholder="$t('view.production.transferReport.placeholder.productNumber')"
        />
      </div>
    </template>

    <template #actions-right>
      <ButtonGeneric variant="main" icon="bi-search" type="submit" :label="$t('common.btn.search')" />
      <ButtonGeneric variant="dark" icon="bi-x-circle" class="ml-2" :title="$t('common.btn.clear')" @click="onClear" />
      <ButtonGeneric
        variant="green"
        icon="bi-filetype-csv"
        class="ml-2"
        :title="$t('common.btn.export')"
        :disabled="!transferReportStore.dataSearch.total"
        @click="onExport"
      />
    </template>
  </SearchBarGeneric>
</template>

<script>
import { useTransferReportApiStore } from '@/stores/modules/api/production/transfer-report-api.js'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'

import SearchBarGeneric from '@/components/generic/SearchBarGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import DateRangeGeneric from '@/components/prime-vue/DateRangeGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'

export default {
  name: 'TransferReportSearchView',

  components: {
    SearchBarGeneric,
    ButtonGeneric,
    InputTextGeneric,
    DateRangeGeneric,
    DropdownGeneric
  },

  setup() {
    const transferReportStore = useTransferReportApiStore()
    const masterApiStore = useMasterApiStore()
    return { transferReportStore, masterApiStore }
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
      form: { ...this.modelForm }
    }
  },

  methods: {
    onSearch() {
      this.$emit('search', this.form)
    },
    onClear() {
      this.$emit('clear')
    },
    onExport() {
      this.$emit('export', this.form)
    }
  },

  created() {
    this.masterApiStore.fetchPlanStatus()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
