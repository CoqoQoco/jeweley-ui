<template>
  <div class="app-container">
    <!-- <loading :isLoading="isLoading"></loading> -->
    <div class="filter-container mb-2">
      <pageTitle
        :title="`ข้อมูลแผนงานผลิต ใบจ่าย-รับคืนงาน เลขที่: ${data?.wo ?? ''}-${
          data?.woNumber ?? ''
        }`"
        description="เเก้ไข/ปรับปรุง/ตรวจสอบ แผนงานผลิตเเละรายละเอียดต่างๆ"
        :isShowBtnClose="false"
        :isShowRightSlot="true"
      >
        <template v-slot:rightSlot>
          <div
            class="text-center"
            style="font-size: medium"
            :class="getStatusSeverity(data.status)"
          >
            {{ data.statusName }}
          </div>
        </template>
      </pageTitle>
      <TabMenu :model="tabItems" v-model:activeIndex="tabCctive" />
    </div>

    <!-- header -->
    <div v-if="tabCctive === 0">
      <keep-alive>
        <planHeaderView
          :modelValue="data"
          :modelMatValue="mat"
          :masterCustomerType="masterCustomer"
          :masterProductType="masterProduct"
          @onShowFormHeaderUpdate="onShowFormHeaderUpdate"
        ></planHeaderView>
      </keep-alive>
      <keep-alive>
        <planHeaderUpdateView
          :isShow="isShowFormHeaderUpdate"
          :modelValue="data"
          :masterCustomerType="masterCustomer"
          :masterProductType="masterProduct"
          :masterGold="masterGold"
          :masterGoldSize="masterGoldSize"
          @fetch="fetchFormHeaderUpdate"
          @closeModal="onCloseFormHeaderUpdate"
        ></planHeaderUpdateView>
      </keep-alive>
      <!-- <FormHeader
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
      </FormHeaderUpdate> -->
    </div>

    <!-- gold -->
    <div v-if="tabCctive === 1">
      <FormMaterial
        :modelValue="data"
        :modelMatValue="mat"
        :modelGoldItem="dataGoldCostItem"
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

    <!-- casting -->
    <div v-if="tabCctive === 2">
      <planCatingView
        :modelValue="data"
        :modelMatValue="mat"
        :masterStatus="masterStatus"
        :masterGold="masterGold"
        @onShowAddStatus="onShowAddStatus"
        @onShowUpdateStatus="onShowUpdateStatus"
        @fetch="fetchFormStatusAdd"
      ></planCatingView>
      <planCastingAdd
        :isShow="add.casting"
        :modelValue="data"
        :modelMatValue="mat"
        :masterStatus="masterStatus"
        :masterGold="masterGold"
        @closeModal="onCloseFormStatusAdd"
        @fetch="fetchFormStatusAdd"
      ></planCastingAdd>
      <planCastingUpdate
        :isShow="update.casting"
        :modelValue="data"
        :modelMatValue="mat"
        :masterStatus="masterStatus"
        :masterGold="masterGold"
        @closeModal="onCloseFormStatusAdd"
        @fetch="fetchFormStatusAdd"
      ></planCastingUpdate>
    </div>

    <!-- scrubb -->
    <div v-if="tabCctive === 3">
      <planScrubb
        :modelValue="data"
        :modelMatValue="mat"
        :masterStatus="masterStatus"
        :masterGold="masterGold"
        @onShowAddStatus="onShowAddStatus"
        @onShowUpdateStatus="onShowUpdateStatus"
        @fetch="fetchFormStatusAdd"
      ></planScrubb>
      <planScrubbAdd
        :isShow="add.scrubb"
        :modelValue="data"
        :modelMatValue="mat"
        :masterStatus="masterStatus"
        :masterGold="masterGold"
        @closeModal="onCloseFormStatusAdd"
        @fetch="fetchFormStatusAdd"
      ></planScrubbAdd>
      <planScrubbUpdate
        :isShow="update.scrubb"
        :modelValue="data"
        :modelMatValue="mat"
        :masterStatus="masterStatus"
        :masterGold="masterGold"
        @closeModal="onCloseFormStatusAdd"
        @fetch="fetchFormStatusAdd"
      ></planScrubbUpdate>
    </div>

    <!-- gem -->
    <div v-if="tabCctive === 4">
      <planGemView
        :modelValue="data"
        :modelMatValue="mat"
        :masterStatus="masterStatus"
        :masterGold="masterGold"
        @onShowAddStatus="onShowAddStatus"
        @onShowUpdateStatus="onShowUpdateStatus"
        @fetch="fetchFormStatusAdd"
      ></planGemView>
      <planGemUpdate
        :isShow="update.gems"
        :modelValue="data"
        :modelMatValue="mat"
        :masterStatus="masterStatus"
        :masterGold="masterGold"
        @closeModal="onCloseFormStatusAdd"
        @fetch="fetchFormStatusAdd"
      ></planGemUpdate>
      <planGemAdd
        :isShow="add.gems"
        :modelValue="data"
        :modelMatValue="mat"
        :masterStatus="masterStatus"
        :masterGold="masterGold"
        @closeModal="onCloseFormStatusAdd"
        @fetch="fetchFormStatusAdd"
      ></planGemAdd>
    </div>

    <!-- embed -->
    <div v-if="tabCctive === 5">
      <planEmbed
        :modelValue="data"
        :modelMatValue="mat"
        :masterStatus="masterStatus"
        :masterGold="masterGold"
        @onShowAddStatus="onShowAddStatus"
        @onShowUpdateStatus="onShowUpdateStatus"
        @fetch="fetchFormStatusAdd"
      ></planEmbed>
      <planEmbedUpdate
        :isShow="update.embed"
        :modelValue="data"
        :modelMatValue="mat"
        :masterStatus="masterStatus"
        :masterGold="masterGold"
        @closeModal="onCloseFormStatusAdd"
        @fetch="fetchFormStatusAdd"
      ></planEmbedUpdate>
    </div>

    <!-- cvd -->
    <!-- <div v-if="tabCctive === 6"></div> -->

    <!-- plate -->
    <div v-if="tabCctive === 6">
      <planPlateView
        :modelValue="data"
        :modelMatValue="mat"
        :masterStatus="masterStatus"
        :masterGold="masterGold"
        @onShowAddStatus="onShowAddStatus"
        @onShowUpdateStatus="onShowUpdateStatus"
        @fetch="fetchFormStatusAdd"
      ></planPlateView>
      <PlanPlateUpdateView
        :isShow="update.plate"
        :modelValue="data"
        :modelMatValue="mat"
        :masterStatus="masterStatus"
        :masterGold="masterGold"
        @closeModal="onCloseFormStatusAdd"
        @fetch="fetchFormStatusAdd"
      ></PlanPlateUpdateView>
    </div>

    <!-- price -->
    <div v-if="tabCctive === 7">
      <planPriceView
        :modelValue="data"
        :modelMatValue="mat"
        :masterStatus="masterStatus"
        :masterGold="masterGold"
        @onShowAddStatus="onShowAddStatus"
        @onShowUpdateStatus="onShowUpdateStatus"
        @fetch="fetchFormStatusAdd"
      ></planPriceView>
      <planPriceAddView
        :isShow="add.price"
        :modelValue="data"
        :modelMatValue="mat"
        :masterStatus="masterStatus"
        :masterGold="masterGold"
        @closeModal="onCloseFormStatusAdd"
        @fetch="fetchFormStatusAdd"
      ></planPriceAddView>
    </div>

    <!-- succes -->
    <div v-if="tabCctive === 8"></div>

    <!-- melt -->
    <div v-if="tabCctive === 9">
      <planMeltedView
        :modelValue="data"
        :modelMatValue="mat"
        :masterStatus="masterStatus"
        :masterGold="masterGold"
        @onShowAddStatus="onShowAddStatus"
        @onShowUpdateStatus="onShowUpdateStatus"
        @fetch="fetchFormStatusAdd"
      ></planMeltedView>
      <planMeltedAdd
        :isShow="add.melted"
        :modelValue="data"
        :modelMatValue="mat"
        :masterStatus="masterStatus"
        :masterGold="masterGold"
        @closeModal="onCloseFormStatusAdd"
        @fetch="fetchFormStatusAdd"
      ></planMeltedAdd>
    </div>

    <!-- old function -->
    <div v-if="tabCctive === 10">
      <FormStatus
        :modelValue="data"
        :modelMatValue="mat"
        :masterStatus="masterStatus"
        :masterGold="masterGold"
        @onShowFormStatusAdd="onShowFormStatusAdd"
        @fetch="fetchFormStatus"
        @add="onShowAddStatus"
      >
      </FormStatus>
      <FormStatusAdd
        :isShow="isShowFormStatusAdd"
        :modelValue="data"
        :modelMatValue="mat"
        :masterStatus="masterStatus"
        :masterGold="masterGold"
        @closeModal="onCloseFormStatusAdd"
        @fetch="fetchFormStatusAdd"
      >
      </FormStatusAdd>
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

//
const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))

import TabMenu from 'primevue/tabmenu'

import api from '@/axios/axios-helper.js'

//import FormHeader from './components/form-header/FormHeaderView.vue'
//import FormHeaderUpdate from './components/form-header/FormHeaderUpdate.vue'
import FormMaterial from './components/view/PlanMaterialView.vue'
import FormMaterialAdd from './components/add/plan-material-add.vue'
import FormStatus from './components/form-status/FormStatusView.vue'
import FormStatusAdd from './components/form-status/FormStatusAdd.vue'

//new
import planHeaderView from './components/view/PlanHeaderView.vue'
import planHeaderUpdateView from './components/update/PlanHeaderUpdateView.vue'

import planCatingView from './components/view/PlanCastingView.vue'
import planCastingAdd from './components/add/PlanCatingAddView.vue'
import planCastingUpdate from './components/update/PlanCastingUpdateView.vue'

import planMeltedView from './components/view/PlanMeltedView.vue'
import planMeltedAdd from './components/add/PlanMeltedAddView.vue'

import planGemView from './components/view/PlanGemView.vue'
import planGemUpdate from './components/update/PlanGemUpdateView.vue'
import planGemAdd from './components/add/PlanGemAddView.vue'

import planScrubb from './components/view/PlanScrubbView.vue'
import planScrubbAdd from './components/add/PlanScrubbAddView.vue'
import planScrubbUpdate from './components/update/PlanScrubbUpdateView.vue'

import planPriceView from './components/view/PlanPriceView.vue'
import planPriceAddView from './components/add/PlanPriceAddView.vue'

import planEmbed from './components/view/PlanEmbedView.vue'
import planEmbedUpdate from './components/update/PlanEmbedUpdateView.vue'

import planPlateView from './components/view/PlanPlateView.vue'
import PlanPlateUpdateView from './components/update/PlanPlateUpdateView.vue'

const interfaceIsShowAdd = {
  casting: false,
  scrubb: false,
  melted: false,
  gems: false,
  price: false,
  embed: false,
  plate: false
}
const interfaceIsShowUpdate = {
  casting: false,
  scrubb: false,
  melted: false,
  gems: false,
  price: false
}

export default {
  components: {
    //loading,
    pageTitle,
    TabMenu,
    //FormHeader,
    //FormHeaderUpdate,
    FormMaterial,
    FormMaterialAdd,
    FormStatus,
    FormStatusAdd,
    planHeaderView,
    planHeaderUpdateView,

    planCatingView,
    planCastingAdd,
    planCastingUpdate,

    planMeltedView,
    planMeltedAdd,

    planGemView,
    planGemUpdate,
    planGemAdd,

    planScrubb,
    planScrubbAdd,
    planScrubbUpdate,

    planPriceView,
    planPriceAddView,

    planEmbed,
    planEmbedUpdate,

    planPlateView,
    PlanPlateUpdateView
  },
  data() {
    return {
      // --- flag --- //
      isLoading: false,
      isShowFormHeaderUpdate: false,
      isShowFormMaterialAdd: false,
      isShowFormStatusAdd: false,
      add: { ...interfaceIsShowAdd },
      update: { ...interfaceIsShowUpdate },

      // --- data --- //
      data: {},
      dataGoldCostItem: [],
      mat: [],
      masterProduct: [],
      masterCustomer: [],
      masterGold: [],
      masterGoldSize: [],
      masterGem: [],
      masterGemShape: [],
      masterStatus: [],
      id: '',

      // --- tab --- //
      tabCctive: 0,
      tabItems: [
        { id: 0, label: 'รายละเอียด', icon: 'bi bi-clipboard-data' },
        { id: 1, label: 'ทอง', icon: 'bi bi-box-fill' },
        { id: 2, label: 'แต่ง', icon: 'bi bi-hammer' },
        { id: 3, label: 'ขัดดิบ', icon: 'bi bi-hammer' },
        { id: 4, label: 'คัดพลอย', icon: 'bi bi-hammer' },
        { id: 5, label: 'ฝัง', icon: 'bi bi-hammer' },
        // { id: 6, label: 'ตรวจ CVD', icon: 'bi bi-hammer' },
        { id: 7, label: 'ขัดชุบ', icon: 'bi bi-hammer' },
        { id: 8, label: 'บัตรต้นทุน', icon: 'bi bi-cash-coin' },
        { id: 9, label: 'สำเร็จ', icon: 'bi bi-clipboard-check-fill' },
        { id: 10, label: 'หลอม', icon: 'bi bi-clipboard-x-fill' }
        //{ id: 11, label: 'สถานะการผลิต', icon: 'bi bi-hammer' }
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
    onShowFormStatusAdd() {
      this.isShowFormStatusAdd = true
    },
    onCloseFormStatusAdd() {
      this.isShowFormStatusAdd = false
      this.add = { ...interfaceIsShowAdd }
      this.update = { ...interfaceIsShowUpdate }
    },
    fetchFormStatus() {
      this.isShowFormStatusAdd = false
      this.fetchData(this.id)
    },
    fetchFormStatusAdd() {
      this.isShowFormStatusAdd = false
      this.add = { ...interfaceIsShowAdd }
      this.update = { ...interfaceIsShowUpdate }
      this.fetchData(this.id)
    },
    onShowAddStatus(status) {
      //console.log('onShowAddStatus', status)
      this.add = { ...interfaceIsShowAdd }
      if (status === 'casting') {
        this.add.casting = true
      }
      if (status === 'scrubb') {
        this.add.scrubb = true
      }
      if (status === 'melted') {
        this.add.melted = true
      }
      if (status === 'gems') {
        this.add.gems = true
      }
      if (status === 'price') {
        this.add.price = true
      }
    },
    onShowUpdateStatus(status) {
      //console.log('onShowUpdateStatus', status)
      this.update = { ...interfaceIsShowUpdate }
      if (status === 'casting') {
        this.update.casting = true
      }

      if (status === 'scrubb') {
        this.update.scrubb = true
      }

      if (status === 'gems') {
        this.update.gems = true
      }

      if (status === 'price') {
        this.update.price = true
      }

      if (status === 'embed') {
        this.update.embed = true
      }

      if (status === 'plate') {
        this.update.plate = true
      }
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
          //console.log('this.data', this.data)

          const planNumber = `${this.data.wo}-${this.data.woNumber}`
          this.fetchDataGoldCostItem(planNumber)
        }
        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    },
    async fetchMasterData(type) {
      this.isLoading = true
      try {
        let params = null
        let url = null
        let res = null

        switch (type) {
          case 'PRODUCTTYPE':
            url = 'Master/MasterProductType'
            break
          case 'CUSTOMERTYPE':
            url = 'Master/MasterCustomerType'
            break
          case 'GOLDSIZE':
            url = 'Master/MasterGoldSize'
            break
          case 'GEM':
            url = 'Master/MasterGem'
            break
          case 'GEMSHAPE':
            url = 'Master/MasterGemShape'
            break
          case 'GOLD':
            url = 'Master/MasterGold'
            break
          case 'STATUS':
            url = 'ProductionPlan/GetProductionPlanStatus'
            break
        }

        const apiGet = [
          'PRODUCTTYPE',
          'CUSTOMERTYPE',
          'GOLDSIZE',
          'GEMSHAPE',
          'GOLD',
          'STATUS',
          'GEM'
        ]
        const apiPost = []

        if (apiGet.includes(type)) {
          res = await api.jewelry.get(url)
        } else if (apiPost.includes(type)) {
          res = await api.jewelry.post(url, params)
        }

        if (res) {
          //console.log('res', res)
          switch (type) {
            case 'PRODUCTTYPE':
              this.masterProduct = [...res]
              break
            case 'CUSTOMERTYPE':
              this.masterCustomer = [...res]
              break
            case 'GOLDSIZE':
              this.masterGoldSize = [...res]
              break
            case 'GEM':
              this.masterGem = [...res]
              break
            case 'GEMSHAPE':
              this.masterGemShape = [...res]
              break
            case 'GOLD':
              this.masterGold = [...res]
              break
            case 'STATUS':
              this.masterStatus = [...res]
              break
          }
        }
      } catch (error) {
        console.log(error)
      }
      this.isLoading = false
    },
    async fetchDataMat(id) {
      try {
        this.isLoading = true
        const param = {
          id: id
        }
        const res = await api.jewelry.post('ProductionPlan/ProductionPlanMateriaGet', param, {
          skipLoading: true
        })
        if (res) {
          this.mat = [...res]
        }
        //console.log('this.mat', this.mat)
        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    },
    async fetchDataGoldCostItem(planNumber) {
      try {
        //console.log('planNumber', planNumber)
        this.isLoading = true
        const param = {
          take: 0,
          skip: 0,
          sort: [],
          search: {
            ProductionPlanNumber: planNumber
          }
        }
        const res = await api.jewelry.post('ProductionPlanCost/ListGoldCostItem', param)
        if (res) {
          this.dataGoldCostItem = [...res.data]
          //this.statusName = this.data.statusNavigation.nameTh
          //console.log('this.dataGoldCostItem', this.dataGoldCostItem)
        }
        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    },

    // ----- helprt
    getStatusSeverity(status) {
      switch (status) {
        case 9999:
          return 'box-status-process'
        case 500:
          return 'box-status-disable'
        case 100:
        case 95:
          return 'box-status-success'
        case 10:
        case 49:
        case 54:
        case 59:
        case 69:
        case 79:
        case 84:
        case 89:
        case 94:
          return 'box-status-process'
        case 50:
        case 55:
        case 60:
        case 70:
        case 80:
        case 85:
        case 90:
          return 'box-status-show'
      }
    }
  },

  created() {
    this.$nextTick(() => {
      const url = window.location.href
      this.id = url.split('/').slice(-1)[0]

      this.fetchData(this.id)
      this.fetchDataMat(this.id)

      //this.fetchData(this.id)
      //this.fetchDataMat(this.id)

      this.fetchMasterData('PRODUCTTYPE')
      this.fetchMasterData('CUSTOMERTYPE')
      this.fetchMasterData('GOLDSIZE')
      this.fetchMasterData('GEM')
      this.fetchMasterData('GEMSHAPE')
      this.fetchMasterData('GOLD')
      this.fetchMasterData('STATUS')
    })
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/search-bar.scss';

.box-status-show {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px;
  border-radius: 5px;
  color: var(--base-font-color);
  font-weight: bold;
  font-size: 12px;
  background-color: #ffc21b;
  width: 120px;
  height: 100%;
}
.box-status-success {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px;
  border-radius: 5px;
  color: white;
  font-weight: bold;
  font-size: 12px;
  background-color: #038387;
  width: 120px;
  height: 100%;
}
.box-status-next {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px;
  border-radius: 5px;
  color: var(--base-color);
  font-weight: bold;
  font-size: 12px;
  background-color: var(--base-font-color);
  width: 120px;
  height: 100%;
  cursor: pointer;
}
.box-status-process {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px;
  border-radius: 5px;
  color: var(--base-font-color);
  font-weight: bold;
  font-size: 12px;
  background-color: #dad4b5;
  width: 120px;
  height: 100%;
}
.box-status-disable {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px;
  border-radius: 5px;
  color: white;
  font-weight: bold;
  font-size: 12px;
  background-color: #ff4d4d;
  width: 120px;
  height: 100%;
}
</style>
