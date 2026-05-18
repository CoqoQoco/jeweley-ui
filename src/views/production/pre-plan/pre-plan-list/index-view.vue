<template>
  <div class="app-container">
    <div class="page-header-bar">
      <h2 class="page-title">รายการใบสั่งผลิต</h2>
    </div>
    <filterBar v-model:modelForm="form" @search="onSearch" @clear="onClear" />
    <prePlanTable :modelForm="search" class="mt-2" />
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
  includeCompleted: false,
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

<style lang="scss" scoped>
.page-header-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #ffffff;
  border-radius: 8px;
  border-bottom: 2px solid var(--base-font-color);
  box-shadow: rgba(0, 0, 0, 0.06) 0 2px 8px;
  margin-bottom: 16px;
}

.page-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--base-font-color);
}
</style>
