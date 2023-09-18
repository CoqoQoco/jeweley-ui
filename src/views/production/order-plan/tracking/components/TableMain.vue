<template>
  <div class="table-container">
    <loading :isLoading="isLoading"></loading>
    <!-- <tableMain :isData="isData" :total="total">
      <template v-slot:table>
        <table class="table-main">
          <thead>
            <tr>
              <th class="td-action"></th>
              <th style="width: 100px">เลขที่ W.O.</th>
              <th style="width: 100px">ลำดับ W.O.</th>
              <th style="width: 200px">เเม่พิมพ์</th>
              <th style="width: 200px">วันสร้างใบงาน</th>
              <th>รหัสสินค้า</th>
              <th>รหัสลูกค้า</th>
            </tr>
          </thead>
          <tbody style="max-height: calc(100vh - 330px)">
            <tr v-for="(item, index) in modelValue" :key="index">
              <td class="td-action">
                <button
                  class="btn btn-sm btn-warning mr-2"
                  title="ดูรายละเอียด"
                  @click="onView(item)"
                >
                  <i class="bi bi-gem"></i>
                </button>
                <button class="btn btn-sm btn-main" title="ลบใบจ่าย">
                  <i class="bi bi-trash-fill"></i>
                </button>
              </td>
              <td style="width: 100px">{{ item.wo }}</td>
              <td style="width: 100px">{{ item.woNumber }}</td>
              <td style="width: 200px">{{ item.mold }}</td>
              <td style="width: 00px">{{ formatDate(item.requestDate) }}</td>
              <td>{{ item.productNumber }}</td>
              <td>
                {{ item.customerNumber }}
              </td>
            </tr>
          </tbody>
        </table>
      </template>
    </tableMain> -->

    <!--  ----- prime ng table ----- -->
    <DataTable
      :totalRecords="data.total"
      :value="data.data"
      class="p-datatable-sm custom-table"
      scrollable
      scrollHeight="calc(100vh - 320px)"
      resizableColumns
      columnResizeMode="expand"
      :reorderableColumns="true"
      @columnReorder="onColReorder"
      @rowReorder="onRowReorder"
      :paginator="true"
      @page="handlePageChange"
      :rows="take"
      :rowsPerPageOptions="[10, 20, 50, 100]"
      paginatorTemplate="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
      :currentPageReportTemplate="`{first} to {last} of {totalRecords}`"
    >
      <Column style="width: 100px; text-align: center">
        <template #body>
          <button class="btn btn-sm btn-warning mr-2" title="ดูรายละเอียด" @click="onView(item)">
            <i class="bi bi-gem"></i>
          </button>
          <button class="btn btn-sm btn-main" title="ลบใบจ่าย">
            <i class="bi bi-trash-fill"></i>
          </button>
        </template>
      </Column>
      <Column field="wo" header="เลขที่ W.O."></Column>
      <Column field="woNumber" header="ลำดับ W.O."></Column>
      <Column field="mold" header="เเม่พิมพ์"></Column>
      <Column header="หมายเลขสินค้า" field="productNumber"></Column>
      <Column header="หมายเลขลูกค้า" field="customerNumber"></Column>
      <Column header="วันสร้างใบงาน" field="requestDate">
        <template #body="prop">
          {{ formatDateTime(prop.data.requestDate) }}
        </template>
      </Column>
      <Column header="หมายเหตุ" field="remark">
        <template #body="prop">
          <td class="custom-remark">
            <label>{{ prop.data.remark }}</label>
          </td>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
<script>
//import tableMain from '@/components/table/HtmlTable.vue'
import { formatDate, formatDateTime, formatISOString } from '@/utils/moment'
import loading from '@/components/overlay/loading-overlay.vue'

//prime table
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import api from '@/axios/axios-config.js'
//import ColumnGroup from 'primevue/columngroup' // optional
//import Row from 'primevue/row'

export default {
  components: {
    DataTable,
    Column,
    loading
    //ColumnGroup,
    //Row
  },
  props: {
    modelValue: {
      type: Array,
      default: () => []
    },
    formValue: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      isLoading: false,

      // table
      totalRecords: 100,
      take: 10, //all
      skip: 0,
      data: {}
    }
  },
  computed: {
    isData() {
      return this.modelValue.length ? false : true
    }
  },
  watch: {
    async formValue() {
      //this.take = 10
      //this.skip = 0
      await this.fetchData()
    }
  },
  methods: {
    // ----- table ----- //
    onColReorder() {
      //this.$toast.add({ severity: 'success', summary: 'Column Reordered', life: 3000 })
    },
    onRowReorder(event) {
      this.products = event.value
      //this.$toast.add({ severity: 'success', summary: 'Rows Reordered', life: 3000 })
    },
    handlePageChange(e) {
      console.log('page change')
      console.log(e)
    },

    // ------ helper ------//
    formatDateTime(date) {
      return date ? formatDateTime(date) : ''
    },
    formatDate(date) {
      return formatDate(date)
    },

    // ----- Api ----- //
    async fetchData() {
      try {
        this.isLoading = true

        const param = {
          take: this.take,
          skip: this.skip,
          search: {
            start: formatISOString(this.formValue.start),
            end: formatISOString(this.formValue.end),
            text: this.formValue.text
          }
        }
        const res = await api.jewelry.post('ProductionPlan/ProductionPlanSearch', param)
        if (res) {
          //this.data = [...res.data]
          this.data = { ...res }
        }
        console.log(this.data)

        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    }
  },
  created() {
    //console.log(this.modelValue.length)
  }
}
</script>

<style lang="scss" scoped>
.table-container {
  margin-top: 10px;
}
.custom-table {
  button {
    i {
      font-size: 12px;
    }
  }
}
.custom-remark {
  white-space: nowrap !important;
  text-overflow: ellipsis !important;
}
</style>
