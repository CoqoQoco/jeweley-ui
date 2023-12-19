<template>
  <div class="app-container">
    <loading :isLoading="isLoading"> </loading>
    <div class="filter-container">
      <pageTitle
        title="ข้อมูลพนักงาน (ช่าง)"
        description="ข้อมูลพนักงาน(ช่าง) เพิ่ม/เเก้ไข เเละรายละเอียดต่างๆ"
        :isShowBtnClose="false"
        isShowRightSlot
      >
      </pageTitle>
      <form @submit.prevent="onSearch">
        <div class="search-bar-container">
          <div>
            <span class="text-title">
              <span>ประเภทช่าง</span>
              <span class="text-required"> *</span>
            </span>
            <Dropdown
              v-model="form.type"
              :options="masterWorkerProductionType"
              optionLabel="description"
              :class="val.isValWorkerProductionType === true ? `p-invalid` : ``"
              :showClear="form.type ? true : false"
            />
          </div>
          <div>
            <span class="text-title">ค้นหาช่าง</span>
            <div class="input-group input-group-inner">
              <input
                id="inputStockID"
                :class="['form-control bg-input']"
                type="text"
                v-model.trim="form.text"
                placeholder="พิมพ์บางอย่างเพื่อค้นหา"
              />
              <div class="input-group-append">
                <span class="input-group-text">
                  <i class="bi bi-person-bounding-box text-main-color"></i>
                </span>
              </div>
            </div>
          </div>
          <div>
            <span class="text-title">
              <span>สถานะ</span>
              <!-- <span class="text-required"> *</span> -->
            </span>
            <Dropdown
              v-model="form.active"
              :options="masterActive"
              optionLabel="description"
              :showClear="form.active ? true : false"
            />
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
            <button type="button" @click="onShowFormAddWorker" class="btn btn-sm btn-warning">
              <span class="mr-2">
                <i class="bi bi-plus"></i>
              </span>
              <span>เพิ่มข้อมูลพนักงาน</span>
            </button>
          </div>
        </div>
      </form>
    </div>
    <TableMain :formValue="formValue"></TableMain>
    <FormCreate
      :isShow="isShowFormAddWorker"
      :masterWorkerProductionType="masterWorkerProductionType"
      @closeModal="onCloseFormAddWorker"
      @fetch="onFetchFormAddWorker"
    ></FormCreate>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))
const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))

import Dropdown from 'primevue/dropdown'

import FormCreate from './components/FormCreate.vue'
import TableMain from './components/TableMainView.vue'

import api from '@/axios/axios-config.js'

const interfaceForm = {
  type: null,
  text: null,
  active: { id: 0, description: 'เลือกทั้งหมด' }
}
const interfaceIsValid = {
  isValWorkerProductionType: false
}
export default {
  components: {
    loading,
    pageTitle,
    Dropdown,
    FormCreate,
    TableMain
  },
  watch: {
    'form.type'() {
      if (this.form.type) {
        this.val.isValWorkerProductionType = false
      }
    }
  },
  data() {
    return {
      // --- flag --- //
      isLoading: false,
      isShowFormAddWorker: false,

      // --- form --- //
      form: {
        ...interfaceForm
      },
      formValue: {
        type: null,
        text: null,
        active: 0
      },
      val: {
        ...interfaceIsValid
      },
      masterWorkerProductionType: [],
      masterActive: [
        { id: 0, description: 'เลือกทั้งหมด' },
        { id: 1, description: 'เลือกเปิดใช้งาน' },
        { id: 2, description: 'เลือกปิดใช้งาน' }
      ]
    }
  },
  methods: {
    // --- controller ---//
    onSearch() {
      console.log(this.form)
      this.formValue = {
        type: this.form.type?.id,
        text: this.form.text,
        active: this.form.active?.id
      }
    },
    onClear() {
      this.form = {
        ...interfaceForm
      }
    },
    onShowFormAddWorker() {
      this.isShowFormAddWorker = true
    },
    onCloseFormAddWorker() {
      this.isShowFormAddWorker = false
    },
    onFetchFormAddWorker() {
      this.isShowFormAddWorker = false
      this.formValue = {
        type: this.form.type?.id,
        text: this.form.text,
        active: this.form.active?.id
      }
    },

    // --- APIs --- //
    async fetchMasterWorkerProductionType() {
      try {
        this.isLoading = true
        const res = await api.jewelry.get('Worker/GetWorkerProductionType')
        if (res) {
          this.masterWorkerProductionType = [...res]
        }
        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    }
  },
  mounted() {
    this.fetchMasterWorkerProductionType()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/search-bar.scss';

.search-bar-container {
  display: grid;
  grid-template-columns: 2fr 2fr 2fr 4fr;
  gap: 10px;
  margin-bottom: 10px;
}
</style>
