<template>
  <div class="filter-container">
    <loading :isLoading="isLoading"></loading>
    <pageTitle
      title="การเคลื่อนไหว เพชรเเละพลอย"
      description="ตรวจรายการเคลื่อนไหว รับ/จ่าย ยืม/คืน เเละใบเบิก เพชรเเละพลอย"
      :isShowBtnClose="false"
      :isShowRightSlot="false"
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
        <!-- requestDate -->
        <div>
          <span class="title-text">วันทำรายการ</span>
          <div class="flex-group">
            <Calendar
              class="w-100"
              v-model="form.requestDateStart"
              :max-date="form.requestDateEnd"
              dateFormat="dd/mm/yy"
              showIcon
              placeholder="เริ่มต้น"
            />
            <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
            <Calendar
              class="w-100"
              v-model="form.requestDateEnd"
              :min-date="form.requestDateStart"
              dateFormat="dd/mm/yy"
              showIcon
              placeholder="สิ้นสุด"
            />
          </div>
        </div>

        <div class="form-col-container">
          <!-- type -->
          <div>
            <div>
              <span class="title-text">เลือกประเภทการรับ</span>
              <span class="txt-required"> *</span>
            </div>
            <MultiSelect
              v-model="form.type"
              :options="masterType"
              filter
              optionLabel="description"
              optionValue="id"
              class="w-full md:w-14rem"
            />
            <!-- :class="val.isType === true ? `p-invalid` : ``" -->
          </div>

          <!-- job/po -->
          <div>
            <span class="title-text">Invoice/Ref No.</span>
            <input type="text" class="form-control" v-model="form.jobOrPo" />
          </div>
        </div>
      </div>
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
      </div>
      <div class="form-col-container">
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

        <!-- supplier Name -->
        <!-- <div>
          <span class="title-text">ชื่อร้าน</span>
          <input type="text" class="form-control" v-model="form.code" />
        </div> -->

        <div></div>
        <div></div>
        <div></div>
      </div>
      <div class="btn-submit-container">
        <button class="btn btn-sm btn-main mr-2" type="submit" title="ค้นหา">
          <span><i class="bi bi-search"></i></span>
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
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))
const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))

import Calendar from 'primevue/calendar'
//import Dropdown from 'primevue/dropdown'
import MultiSelect from 'primevue/multiselect'

import api from '@/axios/axios-config.js'

const interfaceIsShow = {
  isCreate: false
}
export default {
  components: {
    pageTitle,
    MultiSelect,
    loading,
    Calendar
    //Dropdown
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
    modelMasterType: {
      type: Array,
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
    masterType() {
      return this.modelMasterType
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
    async fetchMasterData(type) {
      this.isLoading = true
      try {
        let params = null
        let url = null
        let res = null

        switch (type) {
          case 'GROUPGEM':
            params = {
              type: 'GROUPGEM',
              Value: null
            }
            url = 'StockGem/GroupGemData'
            break
          case 'SIZE':
            params = {
              type: 'SIZE',
              Value: null
            }
            url = 'StockGem/GroupGemData'
            break
          case 'GRADE':
            params = {
              type: 'GRADE',
              Value: null
            }
            url = 'StockGem/GroupGemData'
            break
          case 'SHAPE':
            params = {
              type: 'SHAPE',
              Value: null
            }
            url = 'StockGem/GroupGemData'
            break
          case 'MASTERGEMSHAPE':
            url = 'Master/MasterGemShape'
            break
        }

        if (type === 'MASTERGEMSHAPE') {
          res = await api.jewelry.get(url)
        } else {
          res = await api.jewelry.post(url, params)
        }

        if (res) {
          console.log('res', res)
          switch (type) {
            case 'GROUPGEM':
              this.groupOptions = [...res]
              break
            case 'SIZE':
              this.sizeOptions = [...res]
              break
            case 'GRADE':
              this.gradeOptions = [...res]
              break
            case 'SHAPE':
              this.shapeOptions = [...res]
              break
            case 'MASTERGEMSHAPE':
              this.masterGemShape = [...res]
              break
          }
        }
      } catch (error) {
        console.log(error)
      }
      this.isLoading = false
    }
  },
  created() {
    this.$nextTick(() => {
      this.fetchMasterData('GROUPGEM')
      this.fetchMasterData('SIZE')
      this.fetchMasterData('GRADE')
      this.fetchMasterData('SHAPE')
      this.fetchMasterData('MASTERGEMSHAPE')
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
