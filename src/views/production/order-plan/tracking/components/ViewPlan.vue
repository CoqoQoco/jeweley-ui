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
        <pdf class="btn btn-sm btn-info w-50" :modelValue="data" :matValue="mat"></pdf>
      </template>
    </pageTitle>
    <FromHeader :modelValue="data" @fetchData="allFetchData"></FromHeader>
    <div class="data-container"></div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))
const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))
const pdf = defineAsyncComponent(() => import('@/components/pdf-make/SavePDFOrderPlan.vue'))

import FromHeader from '../components/FromHeder.vue'
import api from '@/axios/axios-config.js'
export default {
  components: { loading, pageTitle, pdf, FromHeader },
  data() {
    return { isLoading: false, data: {}, mat: [], id: null }
  },
  methods: {
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
        const res = await api.jewelry.post('ProductionPlan/ProductionPlanMaterialSearch', param)
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
    allFetchData() {
      this.fetchData(this.id)
      this.fetchDataMat(this.id)
    }
  },
  mounted() {
    const url = window.location.href
    this.id = url.split('/').slice(-1)[0]

    this.fetchData(this.id)
    this.fetchDataMat(this.id)
  }
}
</script>

<style lang="scss" scoped></style>
