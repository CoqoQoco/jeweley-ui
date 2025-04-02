<template>
  <div class="app-container">
    <div class="filter-container-main mb-2">
      <pageTitle
        :title="`ข้อมูลแผนงานผลิต ใบจ่าย-รับคืนงาน เลขที่: ${data?.wo ?? ''}-${
          data?.woNumber ?? ''
        }`"
        description="ตรวจสอบ | เเก้ไข | ปรับปรุง แผนงานผลิตเเละรายละเอียดต่างๆ"
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
      <TabMenu :model="tabItems" v-model:activeIndex="tabActive" />
    </div>

    <!-- plan view -->
    <div v-if="tabActive === 0">
      <keep-alive>
        <planView
          :modelValue="data"
          :modelMatValue="mat"
          :masterCustomerType="masterCustomerType"
          :masterProductType="masterProductType"
          @onShowFormHeaderUpdate="onUpdated('plan')"
        ></planView>
      </keep-alive>
      <keep-alive>
        <planViewUpdate
          :isShow="isUpdate.plan"
          :modelValue="data"
          :masterCustomerType="masterCustomerType"
          :masterProductType="masterProductType"
          :masterGold="masterGold"
          :masterGoldSize="masterGoldSize"
          @fetch="fetchData('plan')"
          @closeModal="onCloseModal"
        ></planViewUpdate>
      </keep-alive>
    </div>

    <!-- mat -->
    <div v-if="tabActive === 1">
      <planMat
        :modelValue="data"
        :modelMatValue="mat"
        :modelGoldItem="gold"
        @onShowFormMaterialUpdate="onUpdated('mat')"
        @fetch="fetchData('mat')"
      >
      </planMat>
      <planMatUpdate
        :isShow="isUpdate.mat"
        :modelValue="data"
        :masterGold="masterGold"
        :masterGoldSize="masterGoldSize"
        :masterGem="masterGem"
        :masterGemShape="masterGemShape"
        @fetch="fetchData('mat')"
        @closeModal="onCloseModal"
      >
      </planMatUpdate>
    </div>

    <div v-if="[2, 3, 4, 5, 6, 8, 9].includes(tabActive)">
      <planProcess
        :status="getStatusByTapActive()"
        :modelValue="data"
        :modelMatValue="mat"
        :masterStatus="masterStatus"
        :masterGold="masterGold"
        @onShowUpdate="onUpdated('process')"
        @transfer="onTransferJob"
      ></planProcess>
      <planProcessUpdate
        :isShow="isUpdate.process"
        :statusCode="getStatusByTapActive()"
        :modelValue="data"
        :modelMatValue="mat"
        :masterStatus="masterStatus"
        :masterGold="masterGold"
        @closeModal="onCloseModal"
        @fetch="fetchData('plan')"
      ></planProcessUpdate>
    </div>

    <div v-if="tabActive === 7">
      <planPriceView
        :modelValue="data"
        :modelMatValue="mat"
        :masterStatus="masterStatus"
        :masterGold="masterGold"
        @onShowAdd="onUpdated('price')"
        @fetch="fetchData('plan')"
        @receipt="onTransferProduct"
      ></planPriceView>
      <planPriceViewUpdate
        :isShow="isUpdate.price"
        :modelValue="data"
        :modelMatValue="mat"
        :masterStatus="masterStatus"
        :masterGold="masterGold"
        @closeModal="onCloseModal"
        @fetch="fetchData('plan')"
        @receipt="onTransferProduct"
      ></planPriceViewUpdate>
    </div>

    <transferJob
      :isShow="isUpdate.transferJob"
      :statusTransferValue="statusTransferValue"
      :modelValue="jobTransfer"
      :masterStatusValue="masterStatus"
      @closeModal="onCloseModal"
      @fetch="fetchData('plan')"
    ></transferJob>
    <transferProduct
      :isShow="isUpdate.transferProduct"
      :statusTransferValue="statusTransferValue"
      :modelValue="jobTransfer"
      @closeModal="onCloseModal"
      @fetch="goReceipt"
    ></transferProduct>
  </div>
</template>

<script>
import TabMenu from 'primevue/tabmenu'

import pageTitle from '@/components/custom/PageTitle.vue'
import { usePlanSearchApiStore } from '@/stores/modules/api/plan-search-store.js'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'

import planView from './components/plan-view.vue'
import planViewUpdate from './modal/update-plan-view.vue'

import planMat from './components/plan-mat-view.vue'
import planMatUpdate from './modal/update-mat-view.vue'

import transferJob from './modal/transfer-job-view.vue'
import transferProduct from './modal/transfer-product-view.vue'

import planProcess from './components/plan-process-view.vue'
import planProcessUpdate from './modal/update-process-view.vue'

import planPriceView from './components/plan-price-view.vue'
import planPriceViewUpdate from './modal/update-price-view.vue'

const interfaceIsUpdate = {
  plan: false,
  mat: false,
  process: false,
  price: false,

  transferJob: false,
  transferProduct: false
}

export default {
  name: 'plan-view',
  components: {
    pageTitle,
    TabMenu,

    planView,
    planViewUpdate,

    planMat,
    planMatUpdate,

    transferJob,
    transferProduct,

    planProcess,
    planProcessUpdate,

    planPriceView,
    planPriceViewUpdate
  },

  setup() {
    const planSearchStore = usePlanSearchApiStore()
    const masterStore = useMasterApiStore()
    return { planSearchStore, masterStore }
  },

  computed: {
    masterProductType() {
      return this.masterStore.productType
    },
    masterCustomerType() {
      return this.masterStore.customerType
    },
    masterGold() {
      return this.masterStore.gold
    },
    masterGoldSize() {
      return this.masterStore.goldSize
    },
    masterGem() {
      return this.masterStore.gem
    },
    masterGemShape() {
      return this.masterStore.gemShape
    },
    masterStatus() {
      return this.masterStore.planStatus
    }
  },

  data() {
    return {
      tabActive: 0,
      tabItems: [
        { id: 0, label: 'รายละเอียด', icon: 'bi bi-clipboard-data' },
        { id: 1, label: 'ทอง', icon: 'bi bi-box-fill' },
        { id: 2, label: 'แต่ง', icon: 'bi bi-hammer' },
        { id: 3, label: 'ขัดดิบ', icon: 'bi bi-hammer' },
        { id: 4, label: 'คัดพลอย', icon: 'bi bi-hammer' },
        { id: 5, label: 'ฝัง', icon: 'bi bi-hammer' },
        // { id: 6, label: 'ตรวจ CVD', icon: 'bi bi-hammer' },
        { id: 6, label: 'ขัดชุบ', icon: 'bi bi-hammer' },
        { id: 7, label: 'บัตรต้นทุน', icon: 'bi bi-cash-coin' },
        { id: 8, label: 'สำเร็จ', icon: 'bi bi-clipboard-check-fill' },
        { id: 9, label: 'หลอม', icon: 'bi bi-clipboard-x-fill' }
        //{ id: 11, label: 'สถานะการผลิต', icon: 'bi bi-hammer' }
      ],

      isUpdate: {
        ...interfaceIsUpdate
      },

      data: {}, //plan data from API
      mat: [], // material data from API
      gold: [], // gold data from API

      statusTransferValue: 0,
      jobTransfer: {}
    }
  },

  methods: {
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
    },
    getStatusByTapActive() {
      //console.log('getStatusByTapActive', this.tabActive)
      switch (this.tabActive) {
        case 2:
          return 50
        case 3:
          return 60
        case 4:
          return 70
        case 5:
          return 80
        case 6:
          return 90
        case 7:
          return 50
        case 8:
          return 100
        case 9:
          return 500
        default:
          return 500
      }
    },

    onCloseModal() {
      this.isUpdate = {
        ...interfaceIsUpdate
      }
    },
    onUpdated(type) {
      this.isUpdate[type] = true
    },

    //trnasfer
    onTransferJob(job, from) {
      this.statusTransferValue = from
      this.jobTransfer = { ...job }

      //console.log('onTransferJob; job', this.jobTransfer)
      //console.log('onTransferJob; form', this.statusTransferValue)

      this.isUpdate.transferJob = true
      //this.interfaceIsShowUpdate.transferJob = true
    },
    onTransferProduct(job, from) {
      this.statusTransferValue = from
      this.jobTransfer = { ...job }

      this.isUpdate.transferProduct = true
    },
    goReceipt(value) {
      this.$router.push({ name: 'goods-receipt-production', params: { id: value } })
    },

    // ------ Apis ------
    async fetchData(type) {
      switch (type) {
        case 'plan':
          this.fetchPlan()
          this.tabActive = 0
          break
        case 'mat':
          this.fetchMat()
          this.tabActive = 0
          break
      }

      this.onCloseModal()
    },
    async fetchPlan() {
      this.data = await this.planSearchStore.fetchProductionPlanGet({
        id: this.id
      })
    },
    async fetchMat() {
      this.mat = await this.planSearchStore.fetchProductionPlanMateriaGet({
        id: this.id
      })
    },
    async fetchDataGoldCostItem(planNumber) {
      const res = await this.planSearchStore.fetchDataGoldCostItem({
        planNumber: planNumber
      })

      if (res) {
        this.gold = [...res.data]
      }
    }
  },

  async created() {
    this.$nextTick(async () => {
      const url = window.location.href
      this.id = url.split('/').slice(-1)[0]

      await this.fetchPlan()
      await this.fetchMat()

      if (this.data) {
        this.fetchDataGoldCostItem(`${this.data.wo}-${this.data.woNumber}`)
      }

      await this.masterStore.fetchProductType()
      await this.masterStore.fetchCustomerType()
      await this.masterStore.fetchGold()
      await this.masterStore.fetchGoldSize()
      await this.masterStore.fetchGem()
      await this.masterStore.fetchGemShape()
      await this.masterStore.fetchPlanStatus()
    })
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
