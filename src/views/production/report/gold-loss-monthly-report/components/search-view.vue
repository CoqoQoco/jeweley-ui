<template>
  <SearchBarGeneric
    :title="$t('view.production.goldLossMonthly.searchTitle')"
    :description="$t('view.production.goldLossMonthly.searchDesc')"
    @search="onSearch"
  >
    <template #fields>
      <div>
        <span class="title-text">{{ $t('view.production.goldLossMonthly.year') }}</span>
        <DropdownGeneric
          v-model="form.year"
          :options="yearOptions"
          optionLabel="label"
          optionValue="value"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.production.goldLossMonthly.month') }}</span>
        <DropdownGeneric
          v-model="form.month"
          :options="monthOptions"
          optionLabel="label"
          optionValue="value"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.production.goldLossMonthly.stage') }}</span>
        <DropdownGeneric
          v-model="form.status"
          :options="masterApiStore.planStatus"
          optionLabel="nameTh"
          optionValue="id"
        />
      </div>
    </template>

    <template #actions-right>
      <ButtonGeneric
        variant="main"
        icon="bi-search"
        type="submit"
        :label="$t('view.production.goldLossMonthly.btnFetch')"
      />
    </template>
  </SearchBarGeneric>
</template>

<script>
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'

import SearchBarGeneric from '@/components/generic/SearchBarGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'

const MONTH_KEYS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

export default {
  name: 'GoldLossMonthlyReportSearchView',

  components: {
    SearchBarGeneric,
    ButtonGeneric,
    DropdownGeneric
  },

  setup() {
    const masterApiStore = useMasterApiStore()
    return { masterApiStore }
  },

  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    }
  },

  emits: ['search'],

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
        label: this.$t(`view.production.goldLossMonthly.months.${key}`)
      }))
    }
  },

  methods: {
    onSearch() {
      this.$emit('search', this.form)
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
