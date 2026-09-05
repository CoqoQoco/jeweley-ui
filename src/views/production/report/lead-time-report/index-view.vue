<template>
  <div class="app-container">
    <div class="lead-time-tabs">
      <button
        type="button"
        class="lead-time-tab"
        :class="{ active: activeTab === 'overall' }"
        @click="activeTab = 'overall'"
      >
        <i class="bi bi-bar-chart"></i>
        {{ $t('view.production.leadTime.tabOverall') }}
      </button>
      <button
        type="button"
        class="lead-time-tab"
        :class="{ active: activeTab === 'stage' }"
        @click="activeTab = 'stage'"
      >
        <i class="bi bi-diagram-3"></i>
        {{ $t('view.production.leadTime.tabStage') }}
      </button>
    </div>

    <div v-show="activeTab === 'overall'">
      <searchView v-model:modelForm="form" @search="onSearchFilter" @export="onExport" />
      <resultView ref="resultRef" :modelForm="search" />
    </div>

    <div v-show="activeTab === 'stage'">
      <stageSearchView v-model:modelForm="stageForm" @search="onStageSearchFilter" @clear="onStageClearFilter" @export="onStageExport" />
      <stageResultView ref="stageResultRef" :modelForm="stageSearch" />
    </div>
  </div>
</template>

<script>
import searchView from './components/search-view.vue'
import resultView from './components/result-view.vue'
import stageSearchView from './components/stage-search-view.vue'
import stageResultView from './components/stage-result-view.vue'

const interfaceForm = {
  completedStart: null,
  completedEnd: null,
  groupBy: 'productType',
  productType: [],
  customerType: []
}

const interfaceStageForm = {
  completedStart: null,
  completedEnd: null,
  groupBy: 'none',
  productType: [],
  customerType: [],
  gold: [],
  goldSize: [],
  customerCode: null,
  mold: null,
  productNumber: null,
  text: null
}

export default {
  name: 'LeadTimeReportIndexView',

  components: {
    searchView,
    resultView,
    stageSearchView,
    stageResultView
  },

  data() {
    return {
      activeTab: 'overall',
      form: { ...interfaceForm },
      search: null,
      stageForm: { ...interfaceStageForm },
      stageSearch: null
    }
  },

  methods: {
    onSearchFilter(data) {
      this.search = { ...data }
    },

    onExport() {
      this.$refs.resultRef.exportExcel()
    },

    onStageSearchFilter(data) {
      this.stageSearch = { ...data }
    },

    onStageClearFilter() {
      this.stageForm = { ...interfaceStageForm }
    },

    onStageExport() {
      this.$refs.stageResultRef.exportExcel()
    }
  }
}
</script>

<style lang="scss" scoped>
.lead-time-tabs {
  display: flex;
  gap: var(--sp-sm);
  background: var(--color-card-bg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  padding: 0 var(--sp-xl);
  margin-bottom: var(--sp-lg);
}

.lead-time-tab {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-sm);
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  padding: var(--sp-lg) var(--sp-xl);
  font-weight: 500;
  color: var(--base-sub-color);
  cursor: pointer;

  &:hover {
    color: var(--base-font-color);
  }

  &.active {
    color: var(--base-font-color);
    border-bottom-color: var(--base-font-color);
  }
}
</style>
