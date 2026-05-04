<template>
  <div class="app-container">
    <filterBar
      v-model:modelForm="form"
      @search="onSearch"
      @clear="onClear"
    />
    <prePlanTable
      :modelForm="search"
      class="mt-2"
    />
  </div>
</template>

<script>
import filterBar from './components/filter-bar.vue'
import prePlanTable from './components/pre-plan-table.vue'

const interfaceForm = {
  moldCode: null,
  status: null,
  orderDateFrom: null,
  orderDateTo: null,
}

export default {
  name: 'PrePlanList',
  components: { filterBar, prePlanTable },
  data() {
    return {
      form: { ...interfaceForm },
      search: {},
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
  },
}
</script>
