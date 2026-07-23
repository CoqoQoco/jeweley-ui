<template>
  <SearchBarGeneric
    :title="$t('view.stock.gemMovementReport.searchTitle')"
    :description="$t('view.stock.gemMovementReport.searchDesc')"
    @search="onSearch"
    @clear="onClear"
  >
    <template #fields>
      <div>
        <span class="title-text">{{ $t('view.stock.gemMovementReport.dateRange') }}</span>
        <DateRangeGeneric
          :startDate="form.requestDateStart"
          :endDate="form.requestDateEnd"
          :startPlaceholder="$t('common.label.start')"
          :endPlaceholder="$t('common.label.end')"
          @update:startDate="form.requestDateStart = $event"
          @update:endDate="form.requestDateEnd = $event"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.stock.gemMovementReport.running') }}</span>
        <InputTextGeneric
          v-model.trim="form.running"
          :placeholder="$t('view.stock.gemMovementReport.placeholder.running')"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.stock.gemMovementReport.code') }}</span>
        <InputTextGeneric
          v-model.trim="form.code"
          :placeholder="$t('view.stock.gemMovementReport.placeholder.code')"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.stock.gemMovementReport.groupName') }}</span>
        <MultiSelectGeneric
          v-model="form.groupName"
          :options="gemMovementReportStore.groupOptions"
          optionLabel="value"
          optionValue="value"
          :filter="true"
          :showClear="true"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.stock.gemMovementReport.type') }}</span>
        <MultiSelectGeneric
          v-model="form.type"
          :options="typeOptions"
          optionLabel="label"
          optionValue="value"
          :filter="true"
          :showClear="true"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.stock.gemMovementReport.jobOrPo') }}</span>
        <InputTextGeneric
          v-model.trim="form.jobOrPo"
          :placeholder="$t('view.stock.gemMovementReport.placeholder.jobOrPo')"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.stock.gemMovementReport.wo') }}</span>
        <InputTextGeneric v-model.trim="form.wo" :placeholder="$t('view.stock.gemMovementReport.placeholder.wo')" />
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
        :disabled="!gemMovementReportStore.dataSearch.total"
        @click="onExport"
      />
    </template>
  </SearchBarGeneric>
</template>

<script>
import { useGemMovementReportApiStore } from '@/stores/modules/api/stock/gem-movement-report-api.js'

import SearchBarGeneric from '@/components/generic/SearchBarGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'
import DateRangeGeneric from '@/components/prime-vue/DateRangeGeneric.vue'

export default {
  name: 'GemMovementReportSearchView',

  components: {
    SearchBarGeneric,
    ButtonGeneric,
    InputTextGeneric,
    MultiSelectGeneric,
    DateRangeGeneric
  },

  setup() {
    const gemMovementReportStore = useGemMovementReportApiStore()
    return { gemMovementReportStore }
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

  computed: {
    typeOptions() {
      return [
        { value: 1, label: this.$t('view.stock.gemMovementReport.type1') },
        { value: 2, label: this.$t('view.stock.gemMovementReport.type2') },
        { value: 3, label: this.$t('view.stock.gemMovementReport.type3') },
        { value: 4, label: this.$t('view.stock.gemMovementReport.type4') },
        { value: 5, label: this.$t('view.stock.gemMovementReport.type5') },
        { value: 6, label: this.$t('view.stock.gemMovementReport.type6') },
        { value: 7, label: this.$t('view.stock.gemMovementReport.type7') }
      ]
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

  mounted() {
    this.gemMovementReportStore.fetchGroupOptions()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
