<template>
  <div class="app-container">
    <loading :isLoading="isLoading"></loading>
    <headerView @create="onShowCreate" @search="onSearchFilter" @clear="onClearFilter"></headerView>
    <dataTable class="mt-2" ref="dataTableRef" v-model:modelForm="formSearch"></dataTable>
    <modalCreate
      v-model:modelForm="formCreate"
      v-model:modelVal="valFormCreate"
      :modelMasterGold="masterGold"
      :modelMasterGoldSize="masterGoldSize"
      :isShowModal="isShowModalCreate"
      @closeModal="onCloseCreate"
      @submit="onSubmitCreate"
    ></modalCreate>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))

import swAlert from '@/services/alert/sweetAlerts.js'
import api from '@/axios/axios-helper.js'

import headerView from './components/HeaderView.vue'
import modalCreate from './components/ModalCreateView.vue'
import dataTable from './components/DataTableView.vue'

const interfaceFormCreate = {
  gold: null,
  goldSize: null,
  code: null,
  remark: null
}
const interfaceValFormCreate = {
  isValGold: false,
  isValGoldSize: false
}
const interfaceFormSearch = {
  text: null
}

export default {
  components: {
    headerView,
    modalCreate,
    loading,
    dataTable
  },
  data() {
    return {
      isLoading: false,
      isShowModalCreate: false,

      // ------ form ------ //
      formCreate: { ...interfaceFormCreate },
      valFormCreate: { ...interfaceValFormCreate },
      formSearch: { ...interfaceFormSearch },

      // ------ master ------ //
      masterGold: [],
      masterGoldSize: []
    }
  },
  methods: {
    // --------- handle modal create ------------
    onShowCreate() {
      this.isShowModalCreate = true
    },
    onCloseCreate() {
      this.isShowModalCreate = false
    },
    onSubmitCreate(data) {
      this.formCreate = { ...data }
      console.log('onSubmitCreate', this.formCreate)
      swAlert.confirmSubmit(
        `${this.formCreate.code}`,
        `ยืนยันเพิ่มซิล`,
        async () => {
          //console.log('call submitPlan')
          await this.submitAdd()
        },
        null,
        null
      )
    },
    onClearFormCreate() {
      this.formCreate = { ...interfaceFormCreate }
      this.valFormCreate = { ...interfaceValFormCreate }
    },

    // --------- handle search ------------
    onSearchFilter(data) {
      this.formSearch = { ...data }
    },
    onClearFilter() {
      this.formSearch = { ...interfaceFormSearch }
    },

    // --------- APIs --------- //
    async fetchMasterGold() {
      try {
        this.isLoading = true
        const res = await api.jewelry.get('Master/MasterGold')
        if (res) {
          this.masterGold = [...res]
        }
        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    },
    async fetchMasterGoldSize() {
      try {
        this.isLoading = true
        const res = await api.jewelry.get('Master/MasterGoldSize')
        if (res) {
          this.masterGoldSize = [...res]
        }
        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    },
    async submitAdd() {
      try {
        this.isLoading = true

        const param = {
          type: 'ZILL',
          code: this.formCreate.code,
          nameTh: this.formCreate.code,
          nameEn: this.formCreate.code,
          description: this.formCreate.remark,

          goldCode: this.formCreate.gold.code,
          goldSizeCode: this.formCreate.goldSize.code
        }

        const res = await api.jewelry.post('Master/CreateMasterModel', param)
        if (res) {
          //console.log(res)
          swAlert.success(
            ``,
            ``,
            async () => {
              this.onClearFormCreate()
              this.onCloseCreate()
              if (this.$refs.dataTableRef) {
                this.$refs.dataTableRef.fetchData()
              }
              //this.$emit('fetch')
            },
            null,
            null
          )
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
      this.fetchMasterGold()
      this.fetchMasterGoldSize()
    })
    //this.fetchMasterGold()
    //this.fetchMasterGoldSize()
  }
}
</script>

<style></style>
