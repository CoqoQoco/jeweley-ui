<template>
  <div class="app-container">
    <loading :isLoading="isLoading"></loading>
    <pageTitle
      :title="`ใบจ่าย-รับคืนงาน เลขที่: ${data?.wo ?? ''}-${data?.woNumber ?? ''}`"
      description="ข้อมูลการผลิต เเละรายละเอียดต่างๆ"
      :isShowBtnClose="false"
      isShowRightSlot
    >
      <template v-slot:rightSlot>
        <div class="mr-2 p-1 w-50 text-center bg-dark text-white" style="height: 31px" disable>
          สถานะ : {{ statusName }}
        </div>
        <pdf class="btn btn-sm btn-dark w-50" :modelValue="data" :matValue="mat"></pdf>
      </template>
    </pageTitle>
    <FromHeader
      :modelValue="data"
      :modelMatValue="mat"
      @headerFetchData="headerFetchData"
      @matFetchData="matFetchData"
      @showModalAddMat="onShowModalAddMaterial"
    ></FromHeader>
    <FromStatus @showModalAddUpdate="onShowModalStatus"></FromStatus>
    <modalAddMat
      :isShowModal="isShowModal"
      :masterGold="masterGold"
      :masterGoldSize="masterGoldSize"
      :masterGem="masterGem"
      :masterGemShape="masterGemShape"
      :modelValue="data"
      @closeModal="closeModal"
      @matFetchData="matFetchData"
    ></modalAddMat>
    <modalAddUpdateStatus
      :isShowModal="isShowModalAddUpdateStatus"
      :masterStatus="masterStatus"
      :modelValue="data"
      @closeModal="closeModalStatus"
    ></modalAddUpdateStatus>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))
const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))
const pdf = defineAsyncComponent(() => import('@/components/pdf-make/SavePDFOrderPlan.vue'))

import FromHeader from '../components/FromHeder.vue'
import FromStatus from '../components/FromStatus.vue'
import modalAddMat from '../components/ModalAddMaterial.vue'
import modalAddUpdateStatus from '../components/ModalAddUpdateStatusDetail.vue'
import api from '@/axios/axios-config.js'
export default {
  components: {
    loading,
    pageTitle,
    pdf,
    FromHeader,
    modalAddMat,
    FromStatus,
    modalAddUpdateStatus
  },
  data() {
    return {
      isLoading: false,
      data: {},
      mat: [],
      id: null,
      statusName: null,
      isShowModal: false,
      isShowModalAddUpdateStatus: false,
      masterProduct: [],
      masterCustomer: [],
      masterGold: [],
      masterGoldSize: [],
      masterGem: [],
      masterGemShape: [],
      masterStatus: []
    }
  },
  methods: {
    // ----- tag ------ //
    getStatusSeverity(status) {
      console.log(status)
      switch (status) {
        case 9999:
          return 'bg-danger'
        case 100:
          return 'bg-success'
        case 10:
          return 'bg-info'
        case 50:
        case 60:
        case 70:
        case 80:
        case 85:
        case 90:
        case 95:
          return 'bg-warning'
      }
    },
    getStatusTextColor(status) {
      switch (status) {
        case 9999:
          return 'text-white'
        case 100:
          return 'bg-success'
        case 10:
          return 'bg-info'
        case 50:
        case 60:
        case 70:
        case 80:
        case 85:
        case 90:
        case 95:
          return ''
      }
    },
    // ----- api ------ //
    async fetchData(id) {
      try {
        this.isLoading = true
        const param = {
          id: id
        }
        const res = await api.jewelry.get('ProductionPlan/ProductionPlanGet', param)
        if (res) {
          //this.data = [...res.data]
          this.data = { ...res }

          this.statusName = this.data.statusNavigation.nameTh
        }
        //console.log(this.data)
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
          //this.data = [...res.data]
          this.mat = [...res]
        }
        //console.log(this.mat)
        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    },
    headerFetchData() {
      this.fetchData(this.id)
      //this.fetchDataMat(this.id)
    },
    matFetchData() {
      //this.fetchData(this.id)
      this.isShowModal = false
      this.fetchDataMat(this.id)
    },

    // ---------- add mat ------------- //
    onShowModalAddMaterial() {
      this.isShowModal = true
    },
    onShowModalStatus() {
      this.isShowModalAddUpdateStatus = true
    },
    closeModal() {
      this.isShowModal = false
    },
    closeModalStatus() {
      this.isShowModalAddUpdateStatus = false
    },

    // ----- master -------//
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
  }
}
</script>

<style lang="scss" scoped></style>
