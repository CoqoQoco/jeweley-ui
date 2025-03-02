<template>
  <div class="filter-container-searchBar">
    <form @submit.prevent="onSearch">
      <div>
        <pageTitle
          title="ข้อมูลประเภทสินค้า"
          description="เเก้ไขปรับปรุง/เพิ่ม ประเภทสินค้าเเละรายละเอียดต่างๆ"
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
              placeholder="EX: B, Bracelet, สร้อยข้อมือ......"
            />
          </div>
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
import { defineAsyncComponent } from 'vue'
const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))
//const dialogView = defineAsyncComponent(() => import('@/components/prime-vue/DialogSearchView.vue'))

//import MultiSelect from 'primevue/multiselect'
//import Calendar from 'primevue/calendar'

const interfaceIsShow = {
  dialog: false
}
export default {
  components: {
    pageTitle
    //MultiSelect,
    //Calendar,
    //Dropdown,
    //dialogView
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
    this.$nextTick(async () => {})
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
