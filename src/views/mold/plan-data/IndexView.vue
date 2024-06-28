<template>
  <div class="app-container">
    <loading :isLoading="isLoading"> </loading>
    <div class="filter-container">
      <pageTitle
        :title="`รายละเอียดตั้งเเม่พิมพ์: ${
          data && data.design ? data.design.moldCode : 'กำลังโหลด...'
        }`"
        description=""
        :isShowBtnClose="false"
        :isShowRightSlot="true"
      >
        <template #rightSlot>
          <div class="box-status-show">
            {{ data.statusName }}
          </div>
        </template>
      </pageTitle>
    </div>
    <div></div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))
const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))

import api from '@/axios/axios-config.js'

export default {
  components: {
    pageTitle,
    loading
  },
  data() {
    return {
      isLoading: false,
      id: null,
      data: {}
    }
  },
  methods: {
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

<style>
@import '@/assets/scss/custom-style/standard-form.scss';
.box-status-show {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px;
  border-radius: 5px;
  color: var(--base-font-color);
  font-weight: bold;
  font-size: 15px;
  background-color: #f1c40f;
  width: 70%;
  height: 100%;
}
</style>
