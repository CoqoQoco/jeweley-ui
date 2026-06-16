<template>
  <div class="app-container">
    <div class="filter-container-searchBar">
      <pageTitle
        :title="$t('view.productionCost.goldCost.searchTitle')"
        :description="$t('view.productionCost.goldCost.searchDescription')"
        :isShowBtnClose="false"
        isShowRightSlot
      />
      <form @submit.prevent="onSearch">
        <div class="form-col-container">
          <div>
            <span class="title-text">{{ $t('view.productionCost.goldCost.fieldDate') }}</span>
            <div class="flex-group">
              <CalendarGeneric
                class="w-100"
                v-model="form.createStart"
                :max-date="form.createEnd"
                :showIcon="true"
                :placeholder="$t('common.label.start')"
              />
              <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
              <CalendarGeneric
                class="w-100"
                v-model="form.createEnd"
                :min-date="form.createStart"
                :showIcon="true"
                :placeholder="$t('common.label.end')"
              />
            </div>
          </div>
          <div>
            <span class="title-text">{{ $t('view.productionCost.goldCost.fieldSearch') }}</span>
            <InputTextGeneric
              v-model.trim="form.text"
              :placeholder="$t('view.productionCost.goldCost.fieldSearchPlaceholder')"
            />
          </div>
          <div>
            <span class="title-text">{{ $t('view.productionCost.goldCost.fieldRunningNumber') }}</span>
            <InputTextGeneric v-model.trim="form.runningNumber" />
          </div>
        </div>

        <div class="btn-submit-container-between">
          <div></div>
          <div>
            <button type="submit" class="btn btn-sm btn-main mr-2">
              <i class="bi bi-search"></i>
              <span class="ml-1">{{ $t('common.btn.search') }}</span>
            </button>
            <button type="button" @click="onClear" class="btn btn-sm btn-dark mr-2">
              <i class="bi bi-x-circle"></i>
              <span class="ml-1">{{ $t('common.btn.clear') }}</span>
            </button>
            <button type="button" @click="onShowFormAddGoldCost" class="btn btn-sm btn-main mr-2">
              <i class="bi bi-plus"></i>
              <span class="ml-1">{{ $t('view.productionCost.goldCost.btnCreate') }}</span>
            </button>
          </div>
        </div>
      </form>
    </div>

    <FormCreate
      :isShow="isShowFormAddGoldCost"
      :masterGold="masterGold"
      :masterGoldSize="masterGoldSize"
      @fetch="fetchFormAddGoldCost"
      @closeModal="onCloseFormAddGoldCost"
    />
    <FormUpdate
      :isShow="isShowFormUpdateGoldCost"
      :masterGold="masterGold"
      :masterGoldSize="masterGoldSize"
      :modelValue="modelUpdate"
      @fetch="fetchFormUpdateGoldCost"
      @closeModal="onCloseFormUpdateGoldCost"
    />
    <FormView
      :isShow="isShowFormViewGoldCost"
      :masterGold="masterGold"
      :masterGoldSize="masterGoldSize"
      :modelValue="modelUpdate"
      @closeModal="onCloseFormViewGoldCost"
    />

    <BaseDataTable
      class="mt-2"
      :items="data.data || []"
      :totalRecords="data.total || 0"
      :columns="columns"
      :perPage="take"
      :paginator="true"
      scrollHeight="calc(100vh - 310px)"
      @page="handlePageChange"
    >
      <template #actionsTemplate="{ data: row }">
        <div class="btn-action-container">
          <button
            class="btn btn-sm btn-main"
            :title="$t('common.btn.edit')"
            @click="UpdateCost(row)"
          >
            <i class="bi bi-brush"></i>
          </button>
          <button
            class="btn btn-sm btn-dark ml-1"
            title="โหมดดูรายละเอียด"
            @click="ViewCost(row)"
          >
            <i class="bi bi-clipboard2-data-fill"></i>
          </button>
        </div>
      </template>
      <template #requestDateTemplate="{ data: row }">
        {{ formatDate(row.assignDate) }}
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import dataTablePaging from '@/composables/useDataTablePaging.js'

const pageTitle = defineAsyncComponent(() => import('@/components/custom/page-title.vue'))
import { formatDate, formatISOString } from '@/services/utils/dayjs.js'
import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

import api from '@/axios/axios-helper.js'

import FormCreate from './components/FormCreate.vue'
import FormUpdate from './components/FormUpdate.vue'
import FormView from './components/FormView.vue'

const interfaceForm = {
  text: null,
  runningNumber: null,
  createStart: null,
  createEnd: null
}

export default {
  components: {
    pageTitle,
    CalendarGeneric,
    InputTextGeneric,
    BaseDataTable,
    FormCreate,
    FormUpdate,
    FormView
  },

  mixins: [dataTablePaging],

  data() {
    return {
      isShowFormAddGoldCost: false,
      isShowFormUpdateGoldCost: false,
      isShowFormViewGoldCost: false,
      form: { ...interfaceForm },
      masterGold: [],
      masterGoldSize: [],
      modelUpdate: {},
      data: {}
    }
  },

  computed: {
    columns() {
      return [
        { field: 'actions', header: '', sortable: false, width: '100px' },
        { field: 'bookNo', header: this.$t('view.productionCost.goldCost.colBookNo'), minWidth: '80px' },
        { field: 'no', header: this.$t('view.productionCost.goldCost.colNo'), minWidth: '80px' },
        { field: 'runningNumber', header: this.$t('view.productionCost.goldCost.colRunningNumber'), minWidth: '100px' },
        { field: 'requestDate', header: this.$t('view.productionCost.goldCost.colRequestDate'), minWidth: '100px', sortable: false },
        { field: 'goldName', header: this.$t('view.productionCost.goldCost.colGoldName'), minWidth: '100px' },
        { field: 'goldSizeName', header: this.$t('view.productionCost.goldCost.colGoldSizeName'), minWidth: '100px' },
        { field: 'goldReceipt', header: this.$t('view.productionCost.goldCost.colGoldReceipt'), minWidth: '150px' },
        { field: 'assignBy', header: this.$t('view.productionCost.goldCost.colAssignBy'), minWidth: '150px' },
        { field: 'receiveBy', header: this.$t('view.productionCost.goldCost.colReceiveBy'), minWidth: '150px' },
        { field: 'remark', header: this.$t('view.productionCost.goldCost.colRemark'), minWidth: '100px' }
      ]
    }
  },

  methods: {
    onSearch() {
      this.resetPaging()
    },
    onClear() {
      this.form = { ...interfaceForm }
    },
    onShowFormAddGoldCost() {
      this.isShowFormAddGoldCost = true
    },
    onCloseFormAddGoldCost() {
      this.isShowFormAddGoldCost = false
    },
    fetchFormAddGoldCost() {
      this.isShowFormAddGoldCost = false
      this.fetchData()
    },
    UpdateCost(e) {
      this.modelUpdate = { ...e }
      this.onShowFormUpdateGoldCost()
    },
    ViewCost(e) {
      this.modelUpdate = { ...e }
      this.isShowFormViewGoldCost = true
    },
    onShowFormUpdateGoldCost() {
      this.isShowFormUpdateGoldCost = true
    },
    onCloseFormUpdateGoldCost() {
      this.isShowFormUpdateGoldCost = false
    },
    fetchFormUpdateGoldCost() {
      this.isShowFormUpdateGoldCost = false
      this.fetchData()
    },
    onCloseFormViewGoldCost() {
      this.isShowFormViewGoldCost = false
    },

    async fetchMasterGold() {
      const res = await api.jewelry.get('Master/MasterGold')
      if (res) {
        this.masterGold = [...res]
      }
    },
    async fetchMasterGoldSize() {
      const res = await api.jewelry.get('Master/MasterGoldSize')
      if (res) {
        this.masterGoldSize = [...res]
      }
    },
    async fetchData() {
      this.data = {}
      const param = {
        take: this.take,
        skip: this.skip,
        search: {
          text: this.form.text,
          runningNumber: this.form.runningNumber,
          createStart: this.form.createStart ? formatISOString(this.form.createStart) : null,
          createEnd: this.form.createEnd ? formatISOString(this.form.createEnd) : null
        }
      }
      const res = await api.jewelry.post('ProductionPlanCost/ListGoldCost', param)
      if (res) {
        this.data = { ...res }
      }
    },

    formatDate(date) {
      return formatDate(date)
    }
  },

  created() {
    this.fetchMasterGold()
    this.fetchMasterGoldSize()
    this.fetchData()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
