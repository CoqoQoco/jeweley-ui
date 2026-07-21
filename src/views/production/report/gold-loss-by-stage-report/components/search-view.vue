<template>
  <SearchBarGeneric
    :title="$t('view.production.goldLossByStage.searchTitle')"
    :description="$t('view.production.goldLossByStage.searchDesc')"
    @search="onSearch"
  >
    <template #fields>
      <div>
        <span class="title-text">{{ $t('view.production.goldLossByStage.year') }}</span>
        <DropdownGeneric
          v-model="form.year"
          :options="yearOptions"
          optionLabel="label"
          optionValue="value"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.production.goldLossByStage.month') }}</span>
        <DropdownGeneric
          v-model="form.month"
          :options="monthOptions"
          optionLabel="label"
          optionValue="value"
        />
      </div>
    </template>

    <template #actions-right>
      <ButtonGeneric
        variant="main"
        icon="bi-search"
        type="submit"
        :label="$t('view.production.goldLossByStage.btnFetch')"
      />
      <ButtonGeneric
        variant="green"
        icon="bi-file-earmark-excel"
        class="ml-2"
        :title="$t('common.btn.export')"
        @click="$emit('export')"
      />
    </template>
  </SearchBarGeneric>
</template>

<script>
import SearchBarGeneric from '@/components/generic/SearchBarGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'

const MONTH_KEYS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

export default {
  name: 'GoldLossByStageReportSearchView',

  components: {
    SearchBarGeneric,
    ButtonGeneric,
    DropdownGeneric
  },

  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    }
  },

  emits: ['search', 'export'],

  watch: {
    modelForm: {
      handler(val) {
        this.form = { ...val }
      },
      deep: true
    }
  },

  data() {
    const currentYear = new Date().getFullYear()

    return {
      form: { ...this.modelForm },
      yearOptions: Array.from({ length: 5 }, (_, i) => ({
        value: currentYear - i,
        label: String(currentYear - i)
      }))
    }
  },

  computed: {
    monthOptions() {
      return MONTH_KEYS.map((key, index) => ({
        value: index + 1,
        label: this.$t(`view.production.goldLossByStage.months.${key}`)
      }))
    }
  },

  methods: {
    onSearch() {
      this.$emit('search', this.form)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
