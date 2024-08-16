<template>
  <div class="filter-container">
    <loading :isLoading="isLoading"></loading>
    <pageTitle
      title="วัตถุดิบ เพชร/พลอย"
      description=""
      :isShowBtnClose="false"
      :isShowRightSlot="true"
    >
      <template #rightSlot>
        <div>
          <button class="btn btn-sm btn-main" @click="onShowCreate">
            <i class="bi bi-pencil"></i>
            <span class="ml-2">สร้างข้อมูลเพชรเเละพลอย</span>
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

        <!-- size -->
        <div>
          <span class="title-text">ขนาด</span>
          <!-- <input type="text" class="form-control" v-model="form.groupName" /> -->
          <MultiSelect
            v-model="form.size"
            :options="sizeOptions"
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
            :options="shapeOptions"
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
            :options="gradeOptions"
            filter
            optionLabel="value"
            optionValue="value"
            class="w-full md:w-14rem"
          />
        </div>
      </div>
      <div class="btn-submit-container">
        <button class="btn btn-sm btn-main mr-2" type="submit">
          <span><i class="bi bi-search mr-2"></i></span>
          <span>ค้นหา</span>
        </button>
        <button class="btn btn-sm btn-secondary mr-2" type="button" @click="onClear">
          <span><i class="bi bi-x mr-2"></i></span>
          <span>ล้าง</span>
        </button>
        <button
          :class="['btn btn-sm btn-primary', { 'btn-secondary': !isExportData }]"
          type="button"
          style="width: 120px"
          :disabled="!isExportData"
          @click="onSubmitExport"
        >
          <span><i class="bi bi-filetype-csv"></i></span>
          <span class="ml-2">ออกเอกสาร</span>
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
const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))

//import Calendar from 'primevue/calendar'
import MultiSelect from 'primevue/multiselect'

import api from '@/axios/axios-config.js'

import createView from './CreateView.vue'

const interfaceIsShow = {
  isCreate: false
}
export default {
  components: {
    pageTitle,
    MultiSelect,
    loading,
    createView
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
    }
  },
  data() {
    return {
      isLoading: false,
      form: { ...this.modelForm },
      isShow: { ...interfaceIsShow },
      groupOptions: [],
      gradeOptions: [],
      shapeOptions: [],
      sizeOptions: [],
      masterGemShape: [],
      masterGrade: []
    }
  },
  methods: {
    // ---------------- event
    onSubmit() {
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
      this.fetchGroupOptions()
      this.fetchSizeOption()
      this.fetchGradeOption()
      this.fetchShapeOptions()
      this.fetchMasterGemShape()
      this.fetchMasterGoldGrade()
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
