<template>
  <div class="app-container">
    <loading :isLoading="isLoading"></loading>
    <headerBar
      v-model:modelForm="form"
      :isExport="isExport"
      :masterGroupOptions="groupOptions"
      :masterGradeOptions="shapeOptions"
      :masterShapeOptions="sizeOptions"
      :masterSizeOptions="gradeOptions"
      :masterGemShapeData="masterGemShape"
      :masterGradeData="masterGrade"
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
import { defineAsyncComponent } from 'vue'

//const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))
const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))
import headerBar from './components/headerView.vue'
import dataTable from './components/DataTableView.vue'

import api from '@/axios/axios-config.js'

const interfaceForm = {
  id: null,
  code: null,
  groupName: [],
  grade: [],
  shape: [],
  size: []
}
export default {
  components: {
    //pageTitle,
    headerBar,
    dataTable,
    loading
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
      masterGrade: []
    }
  },
  methods: {
    //  ---------------- event --------
    onSearchFilter(data) {
      console.log('onSearchFilter', data)
      this.search = { ...data }
    },
    onClearFilter() {
      console.log('onClearFilter')
      this.form = { ...interfaceForm }
    },
    exportExcel(data) {
      console.log('exportExcel', data)
      this.exportData = { ...data }
    },
    exportExcelFlag(value) {
      console.log('exportExcelFlag', value)
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
        console.log('params', params)
        const res = await api.jewelry.post('StockGem/GroupGemData', params)
        if (res) {
          this.groupOptions = [...res]
        }
        this.isLoading = false
      } catch (error) {
        this.isLoading = false
        console.log(error)
      }
    },
    async fetchShapeOptions() {
      try {
        this.isLoading = true

        const params = {
          type: 'SHAPE',
          Value: null
        }
        console.log('params', params)
        const res = await api.jewelry.post('StockGem/GroupGemData', params)
        if (res) {
          this.shapeOptions = [...res]
        }
        this.isLoading = false
      } catch (error) {
        this.isLoading = false
        console.log(error)
      }
    },

    async fetchSizeOption() {
      try {
        this.isLoading = true

        const params = {
          type: 'SIZE',
          Value: null
        }
        console.log('params', params)
        const res = await api.jewelry.post('StockGem/GroupGemData', params)
        if (res) {
          this.sizeOptions = [...res]
        }
        this.isLoading = false
      } catch (error) {
        this.isLoading = false
        console.log(error)
      }
    },

    async fetchGradeOption() {
      try {
        this.isLoading = true

        const params = {
          type: 'GRADE',
          Value: null
        }
        console.log('params', params)
        const res = await api.jewelry.post('StockGem/GroupGemData', params)
        if (res) {
          this.gradeOptions = [...res]
        }
        this.isLoading = false
      } catch (error) {
        this.isLoading = false
        console.log(error)
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
        console.log(error)
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
        console.log(error)
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
