<template>
  <SearchBarGeneric
    :title="$t('view.stock.gemOnhandReport.searchTitle')"
    :description="$t('view.stock.gemOnhandReport.searchDesc')"
    @search="onSearch"
    @clear="onClear"
  >
    <template #fields>
      <div>
        <span class="title-text">{{ $t('common.field.code') }}</span>
        <InputTextGeneric
          v-model.trim="form.code"
          :placeholder="$t('view.stock.gemOnhandReport.placeholder.code')"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.stock.gemOnhandReport.searchText') }}</span>
        <InputTextGeneric
          v-model.trim="form.text"
          :placeholder="$t('view.stock.gemOnhandReport.placeholder.searchText')"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.stock.gemOnhandReport.groupName') }}</span>
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
        <span class="title-text">{{ $t('view.stock.gemOnhandReport.shape') }}</span>
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
        <span class="title-text">{{ $t('view.stock.gemOnhandReport.grade') }}</span>
        <MultiSelectGeneric
          v-model="form.grade"
          :options="gemOnhandReportStore.gradeOptions"
          optionLabel="value"
          optionValue="value"
          :filter="true"
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
        :disabled="!gemOnhandReportStore.dataSearch.total"
        @click="onExport"
      />
    </template>
  </SearchBarGeneric>
</template>

<script>
import { useGemOnhandReportApiStore } from '@/stores/modules/api/stock/gem-onhand-report-api.js'

import SearchBarGeneric from '@/components/generic/SearchBarGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'

export default {
  name: 'GemOnhandReportSearchView',

  components: {
    SearchBarGeneric,
    ButtonGeneric,
    InputTextGeneric,
    MultiSelectGeneric
  },

  setup() {
    const gemOnhandReportStore = useGemOnhandReportApiStore()
    return { gemOnhandReportStore }
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
