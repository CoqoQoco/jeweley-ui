<template>
  <div>
    <!-- eslint-disable-next-line no-restricted-imports -->
    <DataTable
      :totalRecords="data.total"
      :value="data.data"
      v-model:expandedRows="expnadData"
      dataKey="id"
      ref="dt"
      class="p-datatable-sm"
      scrollable
      scrollHeight="calc(100vh - 290px)"
      resizableColumns
      :paginator="true"
      :lazy="true"
      @page="handlePageChange"
      @sort="handlePageChangeSort"
      :rows="take"
      removableSort
      sortMode="multiple"
      :rowsPerPageOptions="[10, 30]"
      paginatorTemplate="FirstPageLink PrevPageLink  CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
      :currentPageReportTemplate="$t('view.mold.pickingList.paginatorTemplate')"
    >
      <!-- eslint-disable-next-line no-restricted-imports -->
      <Column>
        <template #body="slotProps">
          <div>
            <button
              class="btn btn-sm btn-main"
              :title="$t('view.mold.pickingList.btnReturn')"
              @click="showModalReturn(slotProps.data)"
            >
              <i class="bi bi-arrow-bar-down"></i>
            </button>
          </div>
        </template>
      </Column>
      <!-- eslint-disable-next-line no-restricted-imports -->
      <Column :header="$t('view.mold.pickingList.colDueDate')" field="returnDateSet" sortable style="min-width: 150px">
        <template #body="prop">
          <div class="notification">
            <span>{{ formatDate(prop.data.returnDateSet) }}</span>
            <span v-if="prop.data.isOverReturn && !prop.data.isSetReturn" class="overdue-tag">
              {{ $t('view.mold.pickingList.tagOverdue') }}
            </span>
            <span v-if="prop.data.isSetReturn" class="duedate-tag">
              {{ $t('view.mold.pickingList.tagDueToday') }}
            </span>
          </div>
        </template>
      </Column>
      <!-- eslint-disable-next-line no-restricted-imports -->
      <Column :header="$t('view.mold.pickingList.colRunning')" field="running" sortable style="min-width: 150px"></Column>
      <!-- eslint-disable-next-line no-restricted-imports -->
      <Column :header="$t('view.mold.pickingList.colMold')" field="mold" sortable style="min-width: 150px"></Column>
      <!-- eslint-disable-next-line no-restricted-imports -->
      <Column :header="$t('view.mold.pickingList.colCheckOutDate')" field="checkOutDate" sortable style="min-width: 150px">
        <template #body="prop">
          {{ formatDate(prop.data.checkOutDate) }}
        </template>
      </Column>
      <!-- eslint-disable-next-line no-restricted-imports -->
      <Column :header="$t('view.mold.pickingList.colCheckOutName')" field="checkOutName" sortable style="min-width: 150px"></Column>
      <!-- eslint-disable-next-line no-restricted-imports -->
      <Column
        :header="$t('view.mold.pickingList.colCheckOutDesc')"
        field="checkOutDescription"
        sortable
        style="min-width: 150px"
      ></Column>
    </DataTable>

    <modalReturn
      :isShow="isShowReturn"
      :modelValue="returnModel"
      @closeModal="closeModalReturn"
      @fetch="fetchDataByReturn"
    ></modalReturn>
  </div>
</template>

<script>
// eslint-disable-next-line no-restricted-imports
import DataTable from 'primevue/datatable'
// eslint-disable-next-line no-restricted-imports
import Column from 'primevue/column'

import { formatDate, formatISOString } from '@/services/utils/dayjs.js'
import api from '@/axios/axios-helper.js'

import modalReturn from './ReturnView.vue'

export default {
  components: {
    DataTable,
    Column,
    modalReturn
  },
  props: {
    modelForm: {
      type: Object,
      default: () => ({})
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
      isShowReturn: false,

      take: 10,
      skip: 0,
      sort: [{ field: 'updateDate', dir: 'desc' }],
      data: {},
      expnadData: [],
      form: null,

      returnModel: {}
    }
  },
  methods: {
    handlePageChange(e) {
      this.skip = e.first
      this.take = e.rows
      this.sort = e.multiSortMeta.map((item) => {
        return { field: item.field, dir: item.order === 1 ? 'asc' : 'desc' }
      })
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

    async fetchData() {
      const params = {
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        search: {
          text: this.form.text ?? null,
          checkOutDateStart: this.form.checkOutDateStart
            ? formatISOString(this.form.checkOutDateStart)
            : null,
          checkOutDateEnd: this.form.checkOutDateEnd
            ? formatISOString(this.form.checkOutDateEnd)
            : null,
          returnDateStart: this.form.returnDateStart
            ? formatISOString(this.form.returnDateStart)
            : null,
          returnDateEnd: this.form.returnDateEnd ? formatISOString(this.form.returnDateEnd) : null
        }
      }
      const res = await api.jewelry.post('StockMold/SearchCheckOutList', params)
      if (res) {
        this.data = { ...res }
      }
    },

    formatDate(date) {
      return formatDate(date)
    },

    showModalReturn(data) {
      this.returnModel = { ...data }
      this.isShowReturn = true
    },
    closeModalReturn() {
      this.returnModel = {}
      this.isShowReturn = false
    },
    fetchDataByReturn() {
      this.isShowReturn = false
      this.fetchData()
    }
  },
  created() {
    this.form = { ...this.modelForm }
    this.$nextTick(() => {
      this.fetchData()
    })
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';

.notification {
  display: inline-flex;
  align-items: center;
}

.overdue-tag {
  background-color: var(--base-red);
  color: white;
  padding: 2px 4px;
  border-radius: 2px;
  margin-left: 4px;
  font-size: 12px;
}
.duedate-tag {
  background-color: var(--base-green);
  color: white;
  padding: 2px 4px;
  border-radius: 2px;
  margin-left: 4px;
  font-size: 12px;
}
</style>
