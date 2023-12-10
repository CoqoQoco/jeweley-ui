<template>
  <div class="app-container">
    <loading :isLoading="isLoading"></loading>
    <div class="filter-container mb-2">
      <pageTitle
        :title="`โหมดเเก้ไข : ใบจ่าย-รับคืนงาน เลขที่: ${data?.wo ?? ''}-${data?.woNumber ?? ''}`"
        description="เเก้ไขการผลิต เเละรายละเอียดต่างๆ"
        :isShowBtnClose="false"
        isShowRightSlot
      >
      </pageTitle>
      <TabMenu :model="tabItems" v-model:activeIndex="tabCctive" />
    </div>
    <div v-if="tabCctive === 0">
      <FormHeader
        :modelValue="data"
        :modelMatValue="mat"
        :masterCustomerType="masterCustomer"
        :masterProductType="masterProduct"
        @onShowFormHeaderUpdate="onShowFormHeaderUpdate"
      >
      </FormHeader>
      <FormHeaderUpdate
        :isShow="isShowFormHeaderUpdate"
        :modelValue="data"
        :masterCustomerType="masterCustomer"
        :masterProductType="masterProduct"
        @fetch="fetchFormHeaderUpdate"
        @closeModal="onCloseFormHeaderUpdate"
      >
      </FormHeaderUpdate>
    </div>
    <div v-if="tabCctive === 1">
      <FormMaterial
        :modelValue="data"
        :modelMatValue="mat"
        @onShowFormMaterialUpdate="onShowFormMaterialAdd"
        @fetch="fetchFormMaterial"
      >
      </FormMaterial>
      <FormMaterialAdd
        :isShow="isShowFormMaterialAdd"
        :masterGold="masterGold"
        :masterGoldSize="masterGoldSize"
        :masterGem="masterGem"
        :masterGemShape="masterGemShape"
        :modelValue="data"
        @fetch="fetchFormMaterialAdd"
        @closeModal="onCloseFormMaterialAdd"
      >
      </FormMaterialAdd>
    </div>
    <div v-if="tabCctive === 2">2222</div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))
const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))

import TabMenu from 'primevue/tabmenu'

import api from '@/axios/axios-config.js'

import FormHeader from './components/form-header/FormHeaderView.vue'
import FormHeaderUpdate from './components/form-header/FormHeaderUpdate.vue'
import FormMaterial from './components/form-material/FormMaterialView.vue'
import FormMaterialAdd from './components/form-material/FormMaterialAdd.vue'

export default {
  components: {
    loading,
    pageTitle,
    TabMenu,
    FormHeader,
    FormHeaderUpdate,
    FormMaterial,
    FormMaterialAdd
  },
  data() {
    return {
      // --- flag --- //
      isLoading: false,
      isShowFormHeaderUpdate: false,
      isShowFormMaterialAdd: false,

      // --- data --- //
      data: {},
      mat: [],
      masterProduct: [],
      masterCustomer: [],
      masterGold: [],
      masterGoldSize: [],
      masterGem: [],
      masterGemShape: [],
      masterStatus: [],

      // --- tab --- //
      tabCctive: 0,
      tabItems: [
        { label: 'รายละเอียด', icon: 'bi bi-clipboard-data' },
        { label: 'ส่วนประกอบการผลิต', icon: 'bi bi-gem' },
        { label: 'สถานะการผลิต', icon: 'bi bi-hammer' }
      ]
    }
  },
  methods: {
    // --- controler --- //
    onShowFormHeaderUpdate() {
      this.isShowFormHeaderUpdate = true
    },
    onCloseFormHeaderUpdate() {
      this.isShowFormHeaderUpdate = false
    },
    fetchFormHeaderUpdate() {
      this.fetchData(this.id)
      this.isShowFormHeaderUpdate = false
    },
    onShowFormMaterialAdd() {
      this.isShowFormMaterialAdd = true
    },
    onCloseFormMaterialAdd() {
      this.isShowFormMaterialAdd = false
    },
    fetchFormMaterial() {
      this.fetchDataMat(this.id)
    },
    fetchFormMaterialAdd() {
      this.fetchDataMat(this.id)
      this.isShowFormMaterialAdd = false
    },
    // --- APIs --- //
    async fetchData(id) {
      try {
        this.isLoading = true
        const param = {
          id: id
        }
        const res = await api.jewelry.get('ProductionPlan/ProductionPlanGet', param)
        if (res) {
          this.data = { ...res }
          //this.statusName = this.data.statusNavigation.nameTh
        }
        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    },
    async fetchDataMat(id) {
      try {
        this.isLoading = true
        const param = {
          id: id
        }
        const res = await api.jewelry.post('ProductionPlan/ProductionPlanMateriaGet', param)
        if (res) {
          this.mat = [...res]
        }
        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    },
    async fetchMasterProductType() {
      try {
        this.isLoading = true
        const res = await api.jewelry.get('Master/MasterProductType')
        if (res) {
          this.masterProduct = [...res]
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
    },
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
    async fetchMasterGem() {
      try {
        this.isLoading = true
        const res = await api.jewelry.get('Master/MasterGem')
        if (res) {
          this.masterGem = [...res]
        }
        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
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
    async fetchMaterStatus() {
      try {
        this.isLoading = true
        const res = await api.jewelry.get('ProductionPlan/GetProductionPlanStatus')
        if (res) {
          //this.data = [...res.data]
          this.masterStatus = [...res]
        }
        //console.log(this.data)
        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    }
  },
  mounted() {
    const url = window.location.href
    this.id = url.split('/').slice(-1)[0]

    this.fetchData(this.id)
    this.fetchDataMat(this.id)

    this.fetchMasterGold()
    this.fetchMasterGoldSize()
    this.fetchMasterGem()
    this.fetchMasterGemShape()
    this.fetchMaterStatus()
    this.fetchMasterCustomerType()
    this.fetchMasterProductType()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/search-bar.scss';
</style>
