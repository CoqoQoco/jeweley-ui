<template>
  <div class="app-container">
    <loading :isLoading="isLoading"> </loading>
    <div class="filter-container">
      <pageTitle
        :title="`รายละเอียดตั้งเเม่พิมพ์`"
        description=""
        :isShowBtnClose="false"
        :isShowRightSlot="true"
      >
        <template #rightSlot>
          <div class="d-flex">
            <div
              :class="data.status === 60 ? 'box-status-success' : 'box-status-show'"
            >
              {{ data.statusName }}
            </div>
            <!-- <div class="box-status-next" @click="goCreateResin">
              <span><i class="bi bi-brush mr-2"></i></span>
              <span> {{ data.nextStatusName }}</span>
            </div> -->
          </div>
        </template>
      </pageTitle>
      <div class="form-col-sm-container">
        <div class="d-flex flex-column">
          <span class="title-text">รหัสตั้งเเม่พิมพ์</span>
          <span class="desc-text">{{ data?.design?.moldCode }}</span>
        </div>
        <div class="d-flex flex-column">
          <span class="title-text">ประเภท</span>
          <span class="desc-text">{{ data?.design?.catagoryName }}</span>
        </div>
        <div class="d-flex flex-column">
          <span class="title-text">วันที่สร้าง</span>
          <span class="desc-text">{{ formatDate(data.createDate) }}</span>
        </div>
        <div class="d-flex flex-column">
          <span class="title-text">วันที่เเก้ไขล่าสุด</span>
          <span class="desc-text">{{ formatDate(data.updateDate) }}</span>
        </div>
      </div>
    </div>
    <div v-if="data.store" class="mt-2">
      <statusStore :modelValue="data"></statusStore>
    </div>
    <div v-if="data.cutting" class="mt-2">
      <statusCutting :modelValue="data"></statusCutting>
    </div>
    <div v-if="data.casting" class="mt-2">
      <statusCasting :modelValue="data"></statusCasting>
    </div>
    <div v-if="data.castingSilver" class="mt-2">
      <statusCastingSilver :modelValue="data"></statusCastingSilver>
    </div>
    <div v-if="data.resin" class="mt-2">
      <statusResin :modelValue="data"></statusResin>
    </div>
    <div class="mt-2">
      <statusDesign :modelValue="data" />
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))
const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))

import api from '@/axios/axios-config.js'
import { formatDate, formatDateTime } from '@/services/utils/dayjs.js'

import statusDesign from './components/statusDesignView.vue'
import statusResin from './components/statusResinView.vue'
import statusCastingSilver from './components/statusCastingSilverView.vue'
import statusCasting from './components/statusCastingView.vue'
import statusCutting from './components/statusCuttingView.vue'
import statusStore from './components/statusStoreView.vue'

export default {
  components: {
    pageTitle,
    loading,
    statusDesign,
    statusResin,
    statusCastingSilver,
    statusCasting,
    statusCutting,
    statusStore
  },
  data() {
    return {
      isLoading: false,
      id: null,
      data: {}
    }
  },
  methods: {
    // ------- helper ------- //
    formatDateTime(date) {
      return date ? formatDateTime(date) : ''
    },
    formatDate(date) {
      return formatDate(date)
    },
    // ----- controller ----- //
    async fetchData() {
      try {
        this.isLoading = true
        //console.log('fetchdata', id)

        const param = {
          id: this.id
        }
        const res = await api.jewelry.get('Mold/PlanGet', param)
        if (res) {
          this.data = { ...res }
        }

        console.log(this.data)
        this.isLoading = false
      } catch (error) {
        this.isLoading = false
        console.log(error)
      }
    }
  },
  async created() {
    //get id from route
    this.id = this.$route.params.id
    console.log(this.id)
    this.fetchData()

    // this.$nextTick(async () => {
    //   await this.fetchData(this.id)
    // })
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
