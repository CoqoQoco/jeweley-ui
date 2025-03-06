<template>
  <div class="filter-container-searchBar">
    <form @submit.prevent="onSearch">
      <div>
        <pageTitle
          title="ข้อมูลช่าง"
          description="ข้อมูลช่าง ตรวจสอบ | เพิ่ม | เเก้ไข รายละเอียดต่างๆ"
          :isShowBtnClose="true"
          :isShowRightSlot="true"
        >
          <template #rightSlot>
            <button class="btn btn-sm btn-main mr-2" type="button" @click="onCreate" title="สร้าง">
              <span><i class="bi bi-database-fill-add"></i></span>
            </button>
          </template>
        </pageTitle>

        <div class="form-col-container">
          <!-- text -->
          <div>
            <span class="title-text">ค้นหา</span>
            <input
              :class="['form-control bg-input']"
              type="text"
              v-model.trim="form.text"
              placeholder="EX: ชื่อช่าง | รหัสช่าง ..."
            />
          </div>

          <!-- type -->
          <div>
            <span class="title-text">
              <span>แผนกช่าง</span>
            </span>
            <Dropdown
              v-model="form.type"
              :options="masterWorkerProductionType"
              optionLabel="description"
              optionValue="id"
              :showClear="form.type ? true : false"
              placeholder="เลือกประเภทช่าง"
            />
          </div>
          <div></div>
          <div></div>
        </div>

        <div class="btn-submit-container-between">
          <div></div>
          <div>
            <button class="btn btn-sm btn-main mr-2" type="submit" title="ค้นหา">
              <span><i class="bi bi-search"></i></span>
              <!-- <span>ค้นหา</span> -->
            </button>
            <!-- <button
              class="btn btn-sm btn-sub-main mr-2"
              type="button"
              title="เพิ่มเติม"
              @click="onShowDialog"
            >
              <span><i class="bi bi-zoom-in"></i></span>
            </button> -->
            <button class="btn btn-sm btn-dark mr-2" type="button" @click="onClear" title="ล้าง">
              <span><i class="bi bi-x-circle"></i></span>
              <!-- <span>ล้าง</span> -->
            </button>

            <!-- <button
                :class="[
                  'btn btn-sm btn-primary',
                  { 'btn-secondary': !receiptProductionStore.dataListPlan.total > 0 }
                ]"
                type="button"
                :disabled="!receiptProductionStore.dataListPlan.total > 0"
                @click="onExport"
              >
                <span><i class="bi bi-filetype-csv"></i></span>
              </button> -->
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import pageTitle from '@/components/custom/PageTitle.vue'

import Dropdown from 'primevue/dropdown'

import { useMasterApiStore } from '@/stores/modules/api/master-store.js'

const interfaceIsShow = {
  dialog: false
}
export default {
  components: {
    pageTitle,
    //MultiSelect,
    //Calendar,
    Dropdown
    //dialogView
  },

  setup() {
    const masterStore = useMasterApiStore()
    return { masterStore }
  },

  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    }
  },

  computed: {
    isExportData() {
      return true
    },
    masterWorkerProductionType() {
      return this.masterStore.workerType
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

  data() {
    return {
      isLoading: false,
      form: { ...this.modelForm },
      isShow: { ...interfaceIsShow }
    }
  },

  methods: {
    // ---------------- event
    onSearch() {
      //console.log('onSubmit')
      this.$emit('search', this.form)
    },
    onExport() {
      //console.log('onExport')
      this.$emit('export', this.form)
    },
    onCreate() {
      //console.log('onCreate')
      this.$emit('create')
    },
    dialogSearch() {
      this.isShow.dialog = false
      this.$emit('search')
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
    onShowDialog() {
      this.isShow.dialog = true
    },
    closeDialog() {
      this.isShow.dialog = false
    }
  },

  created() {
    this.$nextTick(async () => {
      await this.masterStore.fetchWorkerType()
    })
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
