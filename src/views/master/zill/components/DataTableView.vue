<template>
  <div>
    <loading :isLoading="isLoading"></loading>
    <DataTable
      :totalRecords="data.total"
      :value="data.data"
      v-model:expandedRows="expnadData"
      dataKey="id"
      ref="dt"
      class="p-datatable-sm"
      scrollable
      scrollHeight="calc(100vh - 240px)"
      resizableColumns
      :paginator="true"
      :lazy="true"
      @page="handlePageChange"
      @sort="handlePageChangeSort"
      :rows="take"
      removableSort
      sortMode="multiple"
      :rowsPerPageOptions="[10, 20, 50, 100]"
      paginatorTemplate="FirstPageLink PrevPageLink  CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
      :currentPageReportTemplate="`เเสดงข้อมูล {first} - {last} จากทั้งหมด {totalRecords} รายการ`"
    >
      <Column style="width: 20px">
        <template #body="slotProps">
          <div class="col-btn-container">
            <button
              title="เเก้ไข"
              class="btn btn-sm btn btn-secondary"
              disabled
              @click="onUpdate(slotProps.data)"
            >
              <i class="bi bi-brush"></i>
            </button>
          </div>
        </template>
      </Column>
      <Column field="code" header="รหัสซิล" sortable style="min-width: 150px">
        <template #body="slotProps">
          {{ slotProps.data.code }}
        </template>
      </Column>
      <Column field="goldNameTH" header="ประเภททอง" sortable style="min-width: 150px">
        <template #body="slotProps">
          {{ slotProps.data.goldNameTH }}
        </template>
      </Column>
      <Column field="goldSizeNameTH" header="เปอร์เซ็นทอง" sortable style="min-width: 150px">
        <template #body="slotProps">
          {{ slotProps.data.goldSizeNameTH }}
        </template>
      </Column>
      <Column field="description" header="คำอธิบาย" style="min-width: 150px">
        <template #body="slotProps">
          {{ slotProps.data.description }}
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

import api from '@/axios/axios-config.js'

export default {
  components: {
    DataTable,
    Column,
    loading
  },
  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    },
    modelMasterGold: {
      type: Array,
      default: () => []
    },
    modelMasterGoldSize: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    masterGold() {
      return this.modelMasterGold
    },
    masterGoldSize() {
      return this.modelMasterGoldSize
    }
  },
  watch: {
    modelForm: {
      handler(val) {
        this.form = { ...val }
        this.fetchData()
      },
      deep: true
    }
  },
  data() {
    return {
      isLoading: false,
      //--------- table ---------//
      totalRecords: 0,
      take: 10, //all
      skip: 0,
      sort: [],
      data: {},
      expnadData: [],

      form: null
    }
  },
  methods: {
    // ----------- table ----------- //
    handlePageChange(e) {
      this.skip = e.first
      this.take = e.rows
      this.sort = e.multiSortMeta.map((item) => {
        return { field: item.field, dir: item.order === 1 ? 'asc' : 'desc' }
      })
      //console.log(e)
      this.fetchData()
    },
    handlePageChangeSort(e) {
      this.skip = e.first
      this.take = e.rows
      this.sort = e.multiSortMeta.map((item) => {
        return { field: item.field, dir: item.order === 1 ? 'asc' : 'desc' }
      })
      this.fetchData()
    },

    // ----------- APIs ----------- //
    async fetchData() {
      try {
        this.isLoading = true

        console.log('fetchData', this.form)

        const param = {
          take: this.take,
          skip: this.skip,
          sort: this.sort,
          search: {
            type: 'ZILL',
            text: this.form?.text
          }
        }

        const res = await api.jewelry.post('Master/ListMaster', param)
        if (res) {
          this.data = { ...res }
        }
        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    }
  },
  expose: ['fetchData'],
  created() {
    this.$nextTick(() => {
      this.fetchData()
    })
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';
</style>
