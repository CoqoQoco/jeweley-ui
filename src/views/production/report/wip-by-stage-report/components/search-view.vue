<template>
  <SearchBarGeneric
    :title="$t('view.production.wipByStageReport.searchTitle')"
    :description="$t('view.production.wipByStageReport.searchDesc')"
    @search="onSearch"
    @clear="onClear"
  >
    <template #fields>
      <div>
        <span class="title-text">{{ $t('view.production.wipByStageReport.dateRange') }}</span>
        <DateRangeGeneric
          :startDate="form.receiveWorkDateStart"
          :endDate="form.receiveWorkDateEnd"
          :startPlaceholder="$t('common.label.start')"
          :endPlaceholder="$t('common.label.end')"
          @update:startDate="form.receiveWorkDateStart = $event"
          @update:endDate="form.receiveWorkDateEnd = $event"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.production.wipByStageReport.stage') }}</span>
        <MultiSelectGeneric
          v-model="form.status"
          :options="masterApiStore.planStatus"
          optionLabel="nameTh"
          optionValue="id"
          :placeholder="$t('common.label.all')"
          :showClear="true"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.production.wipByStageReport.gold') }}</span>
        <MultiSelectGeneric
          v-model="form.gold"
          :options="masterApiStore.gold"
          optionLabel="nameTh"
          optionValue="nameEn"
          :placeholder="$t('common.label.all')"
          :showClear="true"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.production.wipByStageReport.woText') }}</span>
        <InputTextGeneric
          v-model.trim="form.woText"
          :placeholder="$t('view.production.wipByStageReport.placeholder.woText')"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.production.wipByStageReport.productNumber') }}</span>
        <InputTextGeneric
          v-model.trim="form.productNumber"
          :placeholder="$t('view.production.wipByStageReport.placeholder.productNumber')"
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
        :disabled="!wipReportStore.dataSearch.total"
        @click="onExport"
      />
    </template>
  </SearchBarGeneric>
</template>

<script>
import { useWipReportApiStore } from '@/stores/modules/api/production/wip-report-api.js'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'

import SearchBarGeneric from '@/components/generic/SearchBarGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import DateRangeGeneric from '@/components/prime-vue/DateRangeGeneric.vue'
import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'

export default {
  name: 'WipByStageReportSearchView',

  components: {
    SearchBarGeneric,
    ButtonGeneric,
    InputTextGeneric,
    DateRangeGeneric,
    MultiSelectGeneric
  },

  setup() {
    const wipReportStore = useWipReportApiStore()
    const masterApiStore = useMasterApiStore()
    return { wipReportStore, masterApiStore }
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
    this.masterApiStore.fetchGold()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
