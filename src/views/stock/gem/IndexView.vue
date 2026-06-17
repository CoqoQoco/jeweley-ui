<template>
  <div class="app-container">
    <headerBar
      v-model:modelForm="form"
      :isExport="isExport"
      :masterGroupOptions="groupOptions"
      :masterGradeOptions="shapeOptions"
      :masterShapeOptions="sizeOptions"
      :masterSizeOptions="gradeOptions"
      :masterGemShapeData="masterGemShape"
      :masterGradeData="masterGrade"
      :masterTypeCheckOption="masterTypeCheck"
      @search="onSearchFilter"
      @export="exportExcel"
      @clear="onClearFilter"
    ></headerBar>
    <dataTable
      v-model:modelForm="search"
      v-model:modelFormExport="exportData"
      :masterGroupOptions="groupOptions"
      :masterGradeOptions="shapeOptions"
      :masterShapeOptions="sizeOptions"
      :masterSizeOptions="gradeOptions"
      :masterGemShapeData="masterGemShape"
      :masterGradeData="masterGrade"
      class="mt-2"
      @export="exportExcelFlag"
    ></dataTable>
  </div>
</template>

<script>
import headerBar from './components/search-view.vue'
import dataTable from './components/data-table-view.vue'

import api from '@/axios/axios-helper.js'

const interfaceForm = {
  id: null,
  code: null,
  groupName: [],
  grade: [],
  shape: [],
  size: [],

  typeCheck: []
}
export default {
  components: {
    headerBar,
    dataTable
  },

  computed: {
    masterTypeCheck() {
      return [
        { id: 1, name: this.$t('view.stock.gem.typeCheckQtyRemain'), value: 'qty-remain' },
        { id: 2, name: this.$t('view.stock.gem.typeCheckQtyProcess'), value: 'qty-process-remain' },
        { id: 3, name: this.$t('view.stock.gem.typeCheckWeightRemain'), value: 'qty-weight-remain' },
        { id: 4, name: this.$t('view.stock.gem.typeCheckWeightProcess'), value: 'qty-weight-process-remain' }
      ]
    }
  },

  data() {
    return {
      form: { ...interfaceForm },
      search: {},
      exportData: {},
      isExport: false,

      groupOptions: [],
      shapeOptions: [],
      sizeOptions: [],
      gradeOptions: [],
      masterGemShape: [],
      masterGrade: []
    }
  },

  methods: {
    onSearchFilter(data) {
      this.search = { ...data }
    },
    onClearFilter() {
      this.form = { ...interfaceForm }
    },
    exportExcel(data) {
      this.exportData = { ...data }
    },
    exportExcelFlag(value) {
      this.isExport = value
    },

    async fetchGroupOptions() {
      const params = { type: 'GROUPGEM', Value: null }
      const res = await api.jewelry.post('StockGem/GroupGemData', params)
      if (res) {
        this.groupOptions = [...res]
      }
    },
    async fetchShapeOptions() {
      const params = { type: 'SHAPE', Value: null }
      const res = await api.jewelry.post('StockGem/GroupGemData', params)
      if (res) {
        this.shapeOptions = [...res]
      }
    },

    async fetchSizeOption() {
      const params = { type: 'SIZE', Value: null }
      const res = await api.jewelry.post('StockGem/GroupGemData', params)
      if (res) {
        this.sizeOptions = [...res]
      }
    },

    async fetchGradeOption() {
      const params = { type: 'GRADE', Value: null }
      const res = await api.jewelry.post('StockGem/GroupGemData', params)
      if (res) {
        this.gradeOptions = [...res]
      }
    },
    async fetchMasterGemShape() {
      const res = await api.jewelry.get('Master/MasterGemShape')
      if (res) {
        this.masterGemShape = [...res]
      }
    },
    async fetchMasterGoldGrade() {
      const res = await api.jewelry.get('Master/MasterGoldSize')
      if (res) {
        this.masterGrade = [...res]
      }
    }
  },

  created() {
    this.$nextTick(() => {
      this.fetchGroupOptions()
      this.fetchSizeOption()
      this.fetchGradeOption()
      this.fetchShapeOptions()
      this.fetchMasterGemShape()
      this.fetchMasterGoldGrade()
    })
  }
}
</script>

<style lang="scss" scoped></style>
