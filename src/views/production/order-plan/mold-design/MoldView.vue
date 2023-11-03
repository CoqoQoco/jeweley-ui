<template>
  <div class="app-container">
    <loading :isLoading="isLoading"></loading>
    <pageTitle
      title="ออกเเบบ สร้างเเม่พิมพ์"
      description="ข้อมูลออกเเบบ สร้างเเม่พิมพ์ เเละรายละเอียดต่างๆ"
      :isShowBtnClose="false"
      isShowRightSlot
    >
      <!-- <template v-slot:rightSlot>
        <div class="mr-2 p-1 w-50 text-center bg-dark text-white" style="height: 31px" disable>
          สถานะ : {{ statusName }}
        </div>
        <pdf class="btn btn-sm btn-info w-50" :modelValue="data" :matValue="mat"></pdf>
      </template> -->
    </pageTitle>
    <form @submit.prevent="onSearch">
      <div class="filter-container">
        <!-- first row -->
        <div class="row form-group">
          <div class="col-md-8">
            <label>คำค้นหา</label>
            <input
              type="text"
              style="width: 30rem"
              class="form-control"
              placeholder="คำค้นหา ... รหัส ประเภท"
              v-model="form.text"
            />
          </div>
          <div class="col-md-4 btn-container">
            <button class="btn btn-sm btn-main mr-2" type="submit">
              <span class="mr-2"><i class="bi bi-search"></i></span>
              <span>ค้นหา</span>
            </button>
            <button class="btn btn-sm btn-dark mr-2" type="button" @click="onClear">
              <span class="mr-2"><i class="bi bi-x-circle"></i></span>
              <span>ล้างค้นหา</span>
            </button>
            <button class="btn btn-sm btn-warning" type="button" @click="showModalAddMold">
              <span class="mr-2"><i class="bi bi-gem"></i></span>
              <span>สร้างเเม่พิมพ์</span>
            </button>
          </div>
        </div>
        <!-- <div class="row form-group">
          <div class="col-md-12 btn-container">
            <button class="btn btn-sm btn-main mr-2">
              <span class="mr-2"><i class="bi bi-search"></i></span>
              <span>ค้นหา</span>
            </button>
            <button class="btn btn-sm btn-dark">
              <span class="mr-2"><i class="bi bi-x-circle"></i></span>
              <span>ล้างคำค้นหา</span>
            </button>
          </div>
        </div> -->
      </div>
    </form>
    <DataView :value="data" :layout="layout" paginator :rows="8">
      <template #grid="slotProps">
        <div class="col-3 sm:col-6 lg:col-12 xl:col-4 p-2">
          <div class="p-2 border-1 surface-border surface-card border-round">
            <div class="flex flex-wrap align-items-center justify-content-between gap-2">
              <div class="flex align-items-center gap-2">
                <span><i class="bi bi-tags text-custom"></i></span>
                <span class="font-semibold text-custom">{{ slotProps.data.category }}</span>
              </div>
            </div>
            <div class="flex flex-column align-items-center gap-3">
              <imagePreview
                :imageName="slotProps.data.image"
                type="MOLD"
                :width="130"
                :height="130"
                :borderShow="false"
              >
              </imagePreview>
              <div class="text-2xl font-bold">{{ slotProps.data.name }}</div>
            </div>
            <div class="flex align-items-center justify-content-between">
              <div class="flex align-items-center ml-4">
                <!-- <span><i class="bi bi-tags text-custom"></i></span> -->
                <span class="font-semibold text-custom">
                  <u class="">
                    {{ slotProps.data.code }}
                  </u>
                </span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </DataView>
    <modalCreate
      :isShowModal="isShowModalAddMold"
      @closeModal="closeModalCreate"
      @fetch="fetchDataByCreate"
    >
    </modalCreate>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

import DataView from 'primevue/dataview'
//import DataViewLayoutOptions from 'primevue/dataviewlayoutoptions'
//import Card from 'primevue/card'
import api from '@/axios/axios-config.js'

const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))
const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))

const imagePreview = defineAsyncComponent(() => import('@/components/image/PreviewImage.vue'))

import modalCreate from './components/ModalCreate.vue'
export default {
  components: {
    pageTitle,
    loading,
    modalCreate,
    DataView,
    //DataViewLayoutOptions
    //Card
    imagePreview
  },
  data() {
    return {
      isLoading: false,
      isShowModalAddMold: false,
      form: {
        text: null
      },

      //data grid
      totalRecords: 0,
      take: 10, //all
      skip: 0,
      data: [],

      layout: 'grid',
      width: 200,
      height: 200
    }
  },
  methods: {
    // ------ internal -------- //
    onClear() {
      this.form = {
        text: null
      }
    },
    // ------ modalAddMold ------- //
    showModalAddMold() {
      this.isShowModalAddMold = true
    },
    closeModalCreate() {
      this.isShowModalAddMold = false
    },
    fetchDataByCreate() {
      this.isShowModalAddMold = false
      this.fetchData()
    },
    // ------ api -------- //
    onSearch() {
      this.fetchData()
    },
    async fetchData() {
      try {
        this.isLoading = true

        const param = {
          search: {
            text: this.form.text ?? null
          }
        }

        const res = await api.jewelry.post('Mold/SearchMold', param)
        if (res) {
          //console.log(res)
          this.data = [...res]
          this.totalRecords = this.data.length
          console.log(this.data)
        }
        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    }
  },
  created() {
    this.fetchData()
  }
}
</script>

<style lang="scss" scoped>
.filter-container {
  border: 1px solid #dddddd;
  border-radius: 5px;

  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  background-color: #f7f7f7;
  //background-color: var(--base-color);
  padding: 10px;
}
.flex-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.btn-container {
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  margin-top: 10px;
}
label {
  margin-bottom: 0px;
  font-size: 12px;
  font-weight: 700;
  color: var(--base-font-color);
}
.mold-card-container {
  display: flex;
  align-items: center;
  justify-content: center;
  //flex-direction: column;
  //width: 30rem;
  //height: rem;
  margin: 10px;
}
.card-body {
  width: 20rem;
  border: 1px solid #dddddd;
  max-height: 200px;
}
.text-custom {
  color: var(--base-font-color);
}
</style>
