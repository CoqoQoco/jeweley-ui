<template>
  <div class="app-container">
    <filterBar
      v-model:modelForm="form"
      :canExport="hasData"
      @search="onSearch"
      @clear="onClear"
      @export="onExport"
    />
    <prePlanTable
      :modelForm="search"
      :exportTrigger="exportTrigger"
      class="mt-2"
      @total-loaded="onTotalLoaded"
    />
  </div>
</template>

<script>
import filterBar from './components/filter-bar.vue'
import prePlanTable from './components/pre-plan-table.vue'

const interfaceForm = {
  moldCode: null,
  status: [],
  orderDateFrom: null,
  orderDateTo: null,
  includeCompleted: false,
}

export default {
  name: 'PrePlanList',
  components: { filterBar, prePlanTable },
  data() {
    return {
      form: { ...interfaceForm },
      search: {},
      exportTrigger: 0,
      hasData: false,
    }
  },
  methods: {
    onSearch() {
      this.search = { ...this.form }
    },
    onClear() {
      this.form = { ...interfaceForm }
      this.search = {}
    },
    onExport() {
      this.exportTrigger++
    },
    onTotalLoaded(total) {
      this.hasData = total > 0
    },
  },
}
</script>
