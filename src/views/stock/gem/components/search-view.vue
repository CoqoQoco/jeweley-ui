<template>
  <div class="filter-container-searchBar">
  
    <pageTitle
      title="คลังวัถุดิบ"
      description="ตรวจสอบจำนวนคงคลัง ราคา รายละเอียดต่างๆ ของวัถุดิบ"
      :isShowBtnClose="false"
      :isShowRightSlot="true"
    >
      <template #rightSlot>
        <div>
          <button class="btn btn-sm btn-main" @click="onShowCreate" title="สร้างข้อมูลวัถุดิบ">
            <i class="bi bi-pencil"></i>
            <!-- <span class="ml-2">สร้างข้อมูลวัถุดิบ</span> -->
          </button>
        </div>
      </template>
    </pageTitle>
    <form @submit.prevent="onSubmit">
      <div class="form-col-container">
        <!-- code -->
        <div>
          <span class="title-text">รหัส</span>
          <input type="text" class="form-control" v-model="form.code" />
        </div>
      </div>

      <dialogView
        :isShow="isShow.dialog"
        @closeDialog="closeDialog"
        @search="dialogSearch"
        txtHeader="ค้นหาเพิ่มเติม"
      >
        <template #content>
          <div class="form-col-container">
            <!-- groupName -->
            <div>
              <span class="title-text">หมวดหมู่</span>
              <!-- <input type="text" class="form-control" v-model="form.groupName" /> -->
              <MultiSelect
                v-model="form.groupName"
                :options="groupOptions"
                filter
                optionLabel="value"
                optionValue="value"
                class="w-full md:w-14rem"
              />
            </div>

            <!-- grade -->
            <div>
              <span class="title-text">เกรด</span>
              <!-- <input type="text" class="form-control" v-model="form.groupName" /> -->
              <MultiSelect
                v-model="form.grade"
                :options="sizeOptions"
                filter
                optionLabel="value"
                optionValue="value"
                class="w-full md:w-14rem"
              />
            </div>

            <!-- size -->
            <div>
              <span class="title-text">ขนาด</span>
              <!-- <input type="text" class="form-control" v-model="form.groupName" /> -->
              <MultiSelect
                v-model="form.size"
                :options="shapeOptions"
                filter
                optionLabel="value"
                optionValue="value"
                class="w-full md:w-14rem"
              />
            </div>

            <!-- shape -->
            <div>
              <span class="title-text">รูปร่าง</span>
              <!-- <input type="text" class="form-control" v-model="form.groupName" /> -->
              <MultiSelect
                v-model="form.shape"
                :options="gradeOptions"
                filter
                optionLabel="value"
                optionValue="value"
                class="w-full md:w-14rem"
              />
            </div>
          </div>
        </template>
      </dialogView>

      <div class="btn-submit-container">
        <button class="btn btn-sm btn-main mr-2" type="submit" title="ค้นหา">
          <span><i class="bi bi-search"></i></span>
          <!-- <span>ค้นหา</span> -->
        </button>
        <button
          class="btn btn-sm btn-sub-main mr-2"
          type="button"
          title="เพิ่มเติม"
          @click="onShowDialog"
        >
          <span><i class="bi bi-zoom-in"></i></span>
          <!-- <span>ค้นหา</span> -->
        </button>
        <button class="btn btn-sm btn-dark mr-2" type="button" @click="onClear" title="ล้าง">
          <span><i class="bi bi-x-circle"></i></span>
          <!-- <span>ล้าง</span> -->
        </button>
        <button
          :class="['btn btn-sm btn-primary', { 'btn-secondary': !isExportData }]"
          type="button"
          :disabled="!isExportData"
          @click="onSubmitExport"
          title="ออกเอกสาร"
        >
          <span><i class="bi bi-filetype-csv"></i></span>
          <!-- <span class="ml-2">ออกเอกสาร</span> -->
        </button>
      </div>
    </form>

    <createView
      :isShow="isShow.isCreate"
      :modelGroupName="groupOptions"
      :masterGemShape="masterGemShape"
      :masterGrade="masterGrade"
      @closeModal="onCloseModal"
    ></createView>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))

const dialogView = defineAsyncComponent(() => import('@/components/prime-vue/DialogSearchView.vue'))

//import Calendar from 'primevue/calendar'
import MultiSelect from 'primevue/multiselect'

import api from '@/axios/axios-helper.js'

import createView from './create-view.vue'

const interfaceIsShow = {
  isCreate: false,
  dialog: false
}
export default {
  components: {
    pageTitle,
    MultiSelect,
  
    createView,
    dialogView
    //Calendar
  },
  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    },
    isExport: {
      type: Boolean,
      default: false
    },
    masterGroupOptions: {
      type: Array,
      Required: true,
      default: () => []
    },
    masterGradeOptions: {
      type: Array,
      Required: true,
      default: () => []
    },
    masterShapeOptions: {
      type: Array,
      Required: true,
      default: () => []
    },
    masterSizeOptions: {
      type: Array,
      Required: true,
      default: () => []
    },
    masterGemShapeData: {
      type: Array,
      Required: true,
      default: () => []
    },
    masterGradeData: {
      type: Array,
      Required: true,
      default: () => []
    }
  },
  watch: {
    modelForm: {
      handler(val) {
        this.form = { ...val }
      },
      deep: true
    }
  },
  computed: {
    isExportData() {
      return this.isExport
    },
    groupOptions() {
      return this.masterGroupOptions
    },
    shapeOptions() {
      return this.masterShapeOptions
    },
    sizeOptions() {
      return this.masterSizeOptions
    },
    gradeOptions() {
      return this.masterGradeOptions
    },
    masterGemShape() {
      return this.masterGemShapeData
    },
    masterGrade() {
      return this.masterGradeData
    }
  },
  data() {
    return {
      isLoading: false,
      form: { ...this.modelForm },
      isShow: { ...interfaceIsShow },
    }
  },
  methods: {
    // ---------------- event
    onSubmit() {
      this.$emit('search', this.form)
    },
    dialogSearch() {
      this.isShow.dialog = false
      this.$emit('search', this.form)
    },
    onSubmitExport() {
      this.$emit('export', true)
    },
    onClear() {
      this.$emit('clear')
    },
    onCloseModal() {
      this.isShow = { ...interfaceIsShow }
    },
    onShowCreate() {
      this.isShow.isCreate = true
    },
    onShowDialog() {
      this.isShow.dialog = true
    },
    closeDialog() {
      this.isShow.dialog = false
    },

    // ---------------- APIs
    async fetchGroupOptions() {
      try {
        this.isLoading = true

        const params = {
          type: 'GROUPGEM',
          Value: null
        }
        console.log('params', params)
        const res = await api.jewelry.post('StockGem/GroupGemData', params)
        if (res) {
          this.groupOptions = [...res]
        }
        this.isLoading = false
      } catch (error) {
        this.isLoading = false
        console.log(error)
      }
    },
    async fetchShapeOptions() {
      try {
        this.isLoading = true

        const params = {
          type: 'SHAPE',
          Value: null
        }
        console.log('params', params)
        const res = await api.jewelry.post('StockGem/GroupGemData', params)
        if (res) {
          this.shapeOptions = [...res]
        }
        this.isLoading = false
      } catch (error) {
        this.isLoading = false
        console.log(error)
      }
    },

    async fetchSizeOption() {
      try {
        this.isLoading = true

        const params = {
          type: 'SIZE',
          Value: null
        }
        console.log('params', params)
        const res = await api.jewelry.post('StockGem/GroupGemData', params)
        if (res) {
          this.sizeOptions = [...res]
        }
        this.isLoading = false
      } catch (error) {
        this.isLoading = false
        console.log(error)
      }
    },

    async fetchGradeOption() {
      try {
        this.isLoading = true

        const params = {
          type: 'GRADE',
          Value: null
        }
        console.log('params', params)
        const res = await api.jewelry.post('StockGem/GroupGemData', params)
        if (res) {
          this.gradeOptions = [...res]
        }
        this.isLoading = false
      } catch (error) {
        this.isLoading = false
        console.log(error)
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
    async fetchMasterGoldGrade() {
      try {
        this.isLoading = true
        const res = await api.jewelry.get('Master/MasterGoldSize')
        if (res) {
          this.masterGrade = [...res]
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
      // this.fetchGroupOptions()
      // this.fetchSizeOption()
      // this.fetchGradeOption()
      // this.fetchShapeOptions()
      // this.fetchMasterGemShape()
      // this.fetchMasterGoldGrade()
    })
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/custom-style/standard-form.scss';

.header-bar-container {
  display: grid;
  grid-template-columns: 2fr 2fr 2fr 2fr;
  gap: 10px;
  margin-bottom: 10px;
}
</style>
