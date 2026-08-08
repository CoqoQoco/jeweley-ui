<template>
  <SearchBarGeneric
    :title="$t('view.stock.gemMovementAnalysis.searchTitle')"
    :description="$t('view.stock.gemMovementAnalysis.searchDesc')"
    icon="bi-graph-up"
    @search="onSearch"
    @clear="onClear"
  >
    <template #fields>
      <div>
        <span class="title-text">{{ $t('view.stock.gemMovementAnalysis.dateRange') }}</span>
        <DateRangeGeneric
          :startDate="form.startDate"
          :endDate="form.endDate"
          :startPlaceholder="$t('common.label.start')"
          :endPlaceholder="$t('common.label.end')"
          @update:startDate="form.startDate = $event"
          @update:endDate="form.endDate = $event"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('common.field.code') }}</span>
        <InputTextGeneric
          v-model.trim="form.code"
          :placeholder="$t('view.stock.gemMovementAnalysis.placeholder.code')"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.stock.gemMovementAnalysis.groupName') }}</span>
        <MultiSelectGeneric
          v-model="form.groupName"
          :options="gemOnhandReportStore.groupOptions"
          optionLabel="value"
          optionValue="value"
          :filter="true"
          :showClear="true"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.stock.gemMovementAnalysis.shape') }}</span>
        <MultiSelectGeneric
          v-model="form.shape"
          :options="gemOnhandReportStore.shapeOptions"
          optionLabel="value"
          optionValue="value"
          :filter="true"
          :showClear="true"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.stock.gemMovementAnalysis.grade') }}</span>
        <MultiSelectGeneric
          v-model="form.grade"
          :options="gemOnhandReportStore.gradeOptions"
          optionLabel="value"
          optionValue="value"
          :filter="true"
          :showClear="true"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('common.field.status') }}</span>
        <MultiSelectGeneric
          v-model="form.movementStatus"
          :options="statusOptions"
          optionLabel="label"
          optionValue="value"
          :filter="false"
          :showClear="true"
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
        :disabled="!gemMovementAnalysisStore.dataSearch.total"
        @click="onExport"
      />
    </template>
  </SearchBarGeneric>
</template>

<script>
import { useGemOnhandReportApiStore } from '@/stores/modules/api/stock/gem-onhand-report-api.js'
import { useGemMovementAnalysisApiStore } from '@/stores/modules/api/stock/gem-movement-analysis-api.js'

import SearchBarGeneric from '@/components/generic/SearchBarGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'
import DateRangeGeneric from '@/components/prime-vue/DateRangeGeneric.vue'

export default {
  name: 'GemMovementAnalysisSearchView',

  components: {
    SearchBarGeneric,
    ButtonGeneric,
    InputTextGeneric,
    MultiSelectGeneric,
    DateRangeGeneric
  },

  setup() {
    const gemOnhandReportStore = useGemOnhandReportApiStore()
    const gemMovementAnalysisStore = useGemMovementAnalysisApiStore()
    return { gemOnhandReportStore, gemMovementAnalysisStore }
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
    statusOptions() {
      return [
        { value: 'FAST', label: this.$t('view.stock.gemMovementAnalysis.statusType.fast') },
        { value: 'SLOW', label: this.$t('view.stock.gemMovementAnalysis.statusType.slow') },
        { value: 'DEAD', label: this.$t('view.stock.gemMovementAnalysis.statusType.dead') },
        { value: 'LOW', label: this.$t('view.stock.gemMovementAnalysis.alertLevel.low') },
        { value: 'OUT', label: this.$t('view.stock.gemMovementAnalysis.alertLevel.out') }
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
    this.gemOnhandReportStore.fetchGroupOptions()
    this.gemOnhandReportStore.fetchShapeOptions()
    this.gemOnhandReportStore.fetchGradeOptions()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
