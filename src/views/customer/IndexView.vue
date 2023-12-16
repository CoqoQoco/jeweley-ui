<template>
  <div class="app-container">
    <loading :isLoading="isLoading"></loading>
    <div class="filter-container">
      <pageTitle
        title="รายชื่อลูกค้า"
        description="รายชื่อลูกค้า เเละรายละเอียดต่างๆ"
        :isShowBtnClose="false"
        isShowRightSlot
      >
      </pageTitle>
      <form @submit.prevent="onSearch">
        <div class="search-bar-container">
          <div>
            <span class="text-titel">ค้นหาลูกค้า</span>
            <div class="input-group input-group-inner">
              <input
                id="inputStockID"
                :class="['form-control bg-input']"
                type="text"
                v-model.trim="search.text"
                placeholder="พิมพ์บางอย่างเพื่อค้นหา"
                required
              />
              <div class="input-group-append">
                <span class="input-group-text">
                  <i class="bi bi-person-fill-gear"></i>
                </span>
              </div>
            </div>
          </div>
          <div class="btn-container">
            <button type="submit" class="btn btn-sm btn-main mr-2">
              <span class="mr-2">
                <i class="bi bi-search"></i>
              </span>
              <span>ค้นหา</span>
            </button>
            <button type="button" @click="onClear" class="btn btn-sm btn-dark mr-2">
              <span class="mr-2">
                <i class="bi bi-x-circle"></i>
              </span>
              <span>ล้างคำค้นหา</span>
            </button>
            <button type="button" @click="onShowFormAddCustomer" class="btn btn-sm btn-warning">
              <span class="mr-2">
                <i class="bi bi-plus"></i>
              </span>
              <span>เพิ่มข้อมูลลูกค้า</span>
            </button>
          </div>
        </div>
      </form>
    </div>
    <FormView v-if="isShowFormView" :modelValue="data" :total="total"></FormView>
    <FormCreate
      :isShow="isShowFormCustomerAdd"
      :masterCustomer="masterCustomer"
      @closeModal="onCloseFormCustomerAdd"
    ></FormCreate>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))
const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))

import api from '@/axios/axios-config.js'

import FormCreate from './components/FormCreate.vue'
import FormView from './components/FormView.vue'

const interfaceSearch = {
  text: null
}

export default {
  components: {
    loading,
    pageTitle,
    FormCreate,
    FormView
  },
  data() {
    return {
      // ----- flag --------
      isLoading: false,
      isShowFormCustomerAdd: false,
      isShowFormView: false,

      //data grid
      total: 0,
      take: 0, //0 all
      skip: 0,
      data: [],

      // ------ param -------- //
      search: {
        ...interfaceSearch
      },
      masterCustomer: []
    }
  },
  methods: {
    // ------------------ controller -------------------- //
    onClear() {
      this.search = {
        ...interfaceSearch
      }
    },
    onShowFormAddCustomer() {
      this.isShowFormCustomerAdd = true
    },
    onCloseFormCustomerAdd() {
      this.isShowFormCustomerAdd = false
    },
    onSearch() {
      this.fetchData()
    },

    // --- APIs --- //
    async fetchData() {
      try {
        this.isLoading = true

        const param = {
          take: this.take,
          skip: this.skip,
          search: {
            text: this.search.text ?? null
          }
        }

        const res = await api.jewelry.post('Customer/Search', param)
        if (res) {
          //console.log(res)
          this.data = [...res.data]
          this.total = res.total
          this.isShowFormView = true
          //console.log(this.data)
        }
        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    },
    async fetchMasterCustomerType() {
      try {
        this.isLoading = true
        const res = await api.jewelry.get('Master/MasterCustomerType')
        if (res) {
          this.masterCustomer = [...res]
        }
        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    }
  },
  mounted() {
    this.fetchMasterCustomerType()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/search-bar.scss';

.search-bar-container {
  display: grid;
  grid-template-columns: 500px auto;
  gap: 10px;
  margin-bottom: 10px;
}

:deep(.input-group-append) {
  height: 40px;
  padding-top: 5px;
}
</style>
