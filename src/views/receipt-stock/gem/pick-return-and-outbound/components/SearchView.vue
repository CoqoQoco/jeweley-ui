<template>
  <div class="filter-container-searchBar">
    <pageTitle
      title="คืนเข้าคลัง/เบิกออกคลัง"
      description="ทำรายการคืนเข้าคลัง/เบิกออกคลัง จากใบยืมออกคลัง"
      :isShowBtnClose="false"
      :isShowRightSlot="false"
    >
      <template #rightSlot>
        <div>
          <button class="btn btn-sm btn-main" @click="onShowCreate">
            <i class="bi bi-pencil"></i>
            <span class="ml-2">สร้างข้อมูลวัถุดิบ</span>
          </button>
        </div>
      </template>
    </pageTitle>
    <form @submit.prevent="onSubmit">
      <div class="form-col-container">
        <!-- requestDate -->
        <div>
          <span class="title-text">วันที่ยืมออกคลัง</span>
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

        <!-- returnDate -->
        <div>
          <span class="title-text">กำหนดคืนเข้าคลัง</span>
          <div class="flex-group">
            <Calendar
              class="w-100"
              v-model="form.returnDateStart"
              :max-date="form.returnDateEnd"
              dateFormat="dd/mm/yy"
              showIcon
              placeholder="เริ่มต้น"
            />
            <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
            <Calendar
              class="w-100"
              v-model="form.returnDateEnd"
              :min-date="form.returnDateStart"
              dateFormat="dd/mm/yy"
              showIcon
              placeholder="สิ้นสุด"
            />
          </div>
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
            <!-- running -->
            <div>
              <span class="title-text">เลขที่ใบยืม</span>
              <input type="text" class="form-control" v-model="form.running" />
            </div>
            <div>
              <span class="title-text">รหัส</span>
              <input type="text" class="form-control" v-model="form.code" />
            </div>
            <div></div>
            <div></div>
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
        </button>
        <button class="btn btn-sm btn-dark" type="button" @click="onClear" title="ล้าง">
          <span><i class="bi bi-x-circle"></i></span>
          <!-- <span>ล้าง</span> -->
        </button>
        <!-- <button
          :class="['btn btn-sm btn-primary', { 'btn-secondary': !isExportData }]"
          type="button"
          :disabled="!isExportData"
          @click="onSubmitExport"
          title="ออกเอกสาร"
        >
          <span><i class="bi bi-filetype-csv"></i></span>
        </button> -->
      </div>
    </form>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))
const dialogView = defineAsyncComponent(() => import('@/components/prime-vue/DialogSearchView.vue'))

import Calendar from 'primevue/calendar'
//import Dropdown from 'primevue/dropdown'

import api from '@/axios/axios-helper.js'

const interfaceIsShow = {
  isCreate: false,
  dialog: false
}

export default {
  components: {
    pageTitle,
    //MultiSelect,
    Calendar,
    dialogView
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
    dialogSearch() {
      console.log(this.search)
      //this.formSearch = { ...this.search }
      this.$emit('search', this.form)
      this.isShow.dialog = false
    },
    onShowDialog() {
      this.isShow.dialog = true
    },
    closeDialog() {
      this.isShow.dialog = false
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
      //this.fetchMasterData('GROUPGEM')
      //this.fetchMasterData('SIZE')
      //this.fetchMasterData('GRADE')
      //this.fetchMasterData('SHAPE')
      //this.fetchMasterData('MASTERGEMSHAPE')
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
