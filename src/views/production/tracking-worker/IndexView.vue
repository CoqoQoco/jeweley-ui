<template>
  <div class="app-container">
    <form @submit.prevent="onSearch">
      <div class="filter-container">
        <div>
          <pageTitle :title="$t('view.production.trackingWorker.searchTitle')" :isShowBtnClose="false"> </pageTitle>
        </div>
        <div class="search-bar-container">
          <div>
            <span class="text-title">{{ $t('view.production.trackingWorker.createDate') }}</span>
            <div class="flex-group">
              <CalendarGeneric
                v-model="search.start"
                :maxDate="search.end"
                :placeholder="$t('common.label.start')"
              />
              <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
              <CalendarGeneric
                v-model="search.end"
                :minDate="search.start"
                :placeholder="$t('common.label.end')"
              />
            </div>
          </div>
          <div>
            <span class="text-title">{{ $t('view.production.trackingWorker.searchText') }}</span>
            <InputTextGeneric
              ref="inputText"
              id="inputText"
              v-model="search.text"
              :trim="true"
              :placeholder="$t('common.label.searchPlaceholder')"
              icon="bi-upc-scan"
            />
          </div>
          <div></div>
          <div class="btn-container">
            <button class="btn btn-sm btn-main mr-2" type="submit">
              <span><i class="bi bi-search"></i></span>
              <span class="ml-2">{{ $t('common.btn.search') }}</span>
            </button>
            <button class="btn btn-sm btn-dark" type="button" @click="onClear">
              <span><i class="bi bi-x-circle"></i></span>
              <span class="ml-2">{{ $t('common.btn.clear') }}</span>
            </button>
          </div>
        </div>
      </div>
    </form>
    <tableMain v-model:formValue="formSearch" v-model:masterStatusValue="masterStatus"></tableMain>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const pageTitle = defineAsyncComponent(() => import('@/components/custom/page-title.vue'))

import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import tableMain from './components/TableMainView.vue'

import api from '@/axios/axios-helper.js'

const interfaceSearch = {
  start: null,
  end: null,
  sendStart: null,
  sendEnd: null,
  text: null,
  status: null,
  isOverPlan: { id: 0, description: 'ทั้งหมด' }
}
export default {
  components: {
    tableMain,
    pageTitle,
    CalendarGeneric,
    InputTextGeneric
  },
  data() {
    return {
      id: '',
      form: {},
      search: {
        ...interfaceSearch
      },
      formSearch: {},
      masterStatus: []
    }
  },
  methods: {
    onView(item) {
      this.$router.push(`pickinglist-tag/${item.wo}-${item.woNumber}`)
    },
    onSearch() {
      this.formSearch = { ...this.search }
    },
    onClear() {
      this.search = {
        ...interfaceSearch
      }
    },
    async fetchMaterStatus() {
      const res = await api.jewelry.get('ProductionPlan/GetProductionPlanStatus')
      if (res) {
        this.masterStatus = [...res]
      }
    }
  },
  created() {
    this.fetchMaterStatus()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/search-bar.scss';

.search-bar-container {
  display: grid;
  grid-template-columns: 2fr 2fr 2fr 2fr;
  gap: 10px;
  margin-bottom: 10px;
}
</style>
