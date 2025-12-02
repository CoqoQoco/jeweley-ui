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
//const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))

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
    //pageTitle,
    headerBar,
    dataTable
  },

  data() {
    return {
      isLoading: false,
      form: { ...interfaceForm },
      search: {},
      exportData: {},
      isExport: false,

      groupOptions: [],
      shapeOptions: [],
      sizeOptions: [],
      gradeOptions: [],
      masterGemShape: [],
      masterGrade: [],
      masterTypeCheck: [
        { id: 1, name: 'มีจำนวนคงคลัง', value: 'qty-remain' },
        { id: 2, name: 'มีจำนวนยืมคลัง', value: 'qty-process-remain' },
        { id: 3, name: 'มีน้ำหนักคงคลัง', value: 'qty-weight-remain' },
        { id: 3, name: 'มีน้ำหนักยืมคลัง', value: 'qty-weight-process-remain' }
      ]
    }
  },

  methods: {
    //  ---------------- event --------
    onSearchFilter(data) {
      //////console.log('onSearchFilter', data)
      this.search = { ...data }
    },
    onClearFilter() {
      //////console.log('onClearFilter')
      this.form = { ...interfaceForm }
    },
    exportExcel(data) {
      //////console.log('exportExcel', data)
      this.exportData = { ...data }
    },
    exportExcelFlag(value) {
      //////console.log('exportExcelFlag', value)
      this.isExport = value
    },

    // ---------------- APIs
    async fetchGroupOptions() {
      try {
        this.isLoading = true

        const params = {
          type: 'GROUPGEM',
          Value: null
        }
        //////console.log('params', params)
        const res = await api.jewelry.post('StockGem/GroupGemData', params)
        if (res) {
          this.groupOptions = [...res]
        }
        this.isLoading = false
      } catch (error) {
        this.isLoading = false
        //////console.log(error)
      }
    },
    async fetchShapeOptions() {
      try {
        this.isLoading = true

        const params = {
          type: 'SHAPE',
          Value: null
        }
        //////console.log('params', params)
        const res = await api.jewelry.post('StockGem/GroupGemData', params)
        if (res) {
          this.shapeOptions = [...res]
        }
        this.isLoading = false
      } catch (error) {
        this.isLoading = false
        //////console.log(error)
      }
    },

    async fetchSizeOption() {
      try {
        this.isLoading = true

        const params = {
          type: 'SIZE',
          Value: null
        }
        //////console.log('params', params)
        const res = await api.jewelry.post('StockGem/GroupGemData', params)
        if (res) {
          this.sizeOptions = [...res]
        }
        this.isLoading = false
      } catch (error) {
        this.isLoading = false
        //////console.log(error)
      }
    },

    async fetchGradeOption() {
      try {
        this.isLoading = true

        const params = {
          type: 'GRADE',
          Value: null
        }
        //////console.log('params', params)
        const res = await api.jewelry.post('StockGem/GroupGemData', params)
        if (res) {
          this.gradeOptions = [...res]
        }
        this.isLoading = false
      } catch (error) {
        this.isLoading = false
        //////console.log(error)
      }
    },
    async fetchMasterGemShape() {
      try {
        this.isLoading = true
        const res = await api.jewelry.get('Master/MasterGemShape')
        if (res) {
          this.masterGemShape = [...res]
        }
        this.isLoading = false
      } catch (error) {
        //////console.log(error)
        this.isLoading = false
      }
    },
    async fetchMasterGoldGrade() {
      try {
        this.isLoading = true
        const res = await api.jewelry.get('Master/MasterGoldSize')
        if (res) {
          this.masterGrade = [...res]
        }
        this.isLoading = false
      } catch (error) {
        //////console.log(error)
        this.isLoading = false
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
