<template>
  <SearchBarGeneric
    :title="$t('view.production.reportProductionWages.searchTitle')"
    :description="$t('view.production.reportProductionWages.searchDesc')"
    @search="onSearch"
    @clear="onClear"
  >
    <template #fields>
      <div>
        <span class="title-text">{{ $t('view.production.reportProductionWages.dateRange') }}</span>
        <span class="text-required"> *</span>
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
        <span class="title-text">{{ $t('view.production.reportProductionWages.woText') }}</span>
        <InputTextGeneric
          v-model.trim="form.woText"
          :placeholder="$t('view.production.reportProductionWages.placeholder.woText')"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.production.reportProductionWages.productNumber') }}</span>
        <InputTextGeneric
          v-model.trim="form.productNumber"
          :placeholder="$t('view.production.reportProductionWages.placeholder.productNumber')"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.production.reportProductionWages.goldType') }}</span>
        <MultiSelectGeneric
          v-model="form.gold"
          :options="masterApiStore.gold"
          optionLabel="nameTh"
          optionValue="code"
          :placeholder="$t('common.label.all')"
          :showClear="true"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.production.reportProductionWages.goldColor') }}</span>
        <MultiSelectGeneric
          v-model="form.goldSize"
          :options="masterApiStore.goldSize"
          optionLabel="nameTh"
          optionValue="nameTh"
          :placeholder="$t('common.label.all')"
          :showClear="true"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.production.reportProductionWages.department') }}</span>
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
        <span class="title-text">{{ $t('view.production.reportProductionWages.worker') }}</span>
        <AutoCompleteGeneric
          v-model="form.worker"
          apiEndpoint="Worker/Search"
          searchField="text"
          :additionalSearchParams="{ type: null, active: 1 }"
          optionLabel="nameTh"
          :forceSelection="true"
          :placeholder="$t('view.production.reportProductionWages.placeholder.searchWorker')"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.production.reportProductionWages.mold') }}</span>
        <InputTextGeneric
          v-model.trim="form.mold"
          :placeholder="$t('view.production.reportProductionWages.placeholder.mold')"
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
        :disabled="!reportProductionWagesStore.dataSearch.total"
        @click="onExport"
      />
    </template>
  </SearchBarGeneric>
</template>

<script>
import { useReportProductionWagesApiStore } from '@/stores/modules/api/production/report-production-wages-api.js'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'
import { warning } from '@/services/alert/sweetAlerts.js'

import SearchBarGeneric from '@/components/generic/SearchBarGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import DateRangeGeneric from '@/components/prime-vue/DateRangeGeneric.vue'
import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'
import AutoCompleteGeneric from '@/components/prime-vue/AutoCompleteGeneric.vue'

export default {
  name: 'ReportProductionWagesSearchView',

  components: {
    SearchBarGeneric,
    ButtonGeneric,
    InputTextGeneric,
    DateRangeGeneric,
    MultiSelectGeneric,
    AutoCompleteGeneric
  },

  setup() {
    const reportProductionWagesStore = useReportProductionWagesApiStore()
    const masterApiStore = useMasterApiStore()
    return { reportProductionWagesStore, masterApiStore }
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
    isDateValid() {
      if (!this.form.start || !this.form.end) {
        warning(this.$t('view.production.reportProductionWages.validationDate'))
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
      if (!this.isDateValid()) return
      this.$emit('export', this.form)
    }
  },

  created() {
    this.masterApiStore.fetchGold()
    this.masterApiStore.fetchGoldSize()
    this.masterApiStore.fetchPlanStatus()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
