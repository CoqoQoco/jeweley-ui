<template>
  <div class="filter-container-searchBar">
    <form @submit.prevent="onSearch">
      <div>
        <div>
          <pageTitle
            title="จัดการเเละเเก้ไขบัญชีผู้ใช้งาน"
            description="ค้นหาข้อมูลผู้ใช้งาน ปรับปรุงหรืออนุมัติการใช้งาน"
            :isShowBtnClose="false"
          >
          </pageTitle>
        </div>

        <div class="form-col-container">
          <div>
            <span class="title-text">บัญชี</span>
            <input
              ref="inputAccountName"
              id="inputAccountName"
              :class="['form-control bg-input']"
              type="text"
              v-model.trim="form.username"
            />
          </div>
        </div>

        <!-- <dialogView
          :isShow="isShow.dialog"
          @closeDialog="closeDialog"
          @search="dialogSearch"
          txtHeader="ค้นหาเพิ่มเติม"
        >
          <template #content>
            <div class="form-col-container"></div>
          </template>
        </dialogView> -->

        <div class="btn-submit-container-between">
          <div></div>
          <div>
            <button class="btn btn-sm btn-main mr-2" type="submit" title="ค้นหา">
              <span><i class="bi bi-search"></i></span>
            </button>
            <button
              class="btn btn-sm btn-secondary mr-2"
              type="button"
              title="เพิ่มเติม"
              @click="onShowDialog"
              disabled
            >
              <span><i class="bi bi-zoom-in"></i></span>
            </button>
            <button class="btn btn-sm btn-dark mr-2" type="button" @click="onClear" title="ล้าง">
              <span><i class="bi bi-x-circle"></i></span>
            </button>
            <button
              :class="['btn btn-sm btn-primary btn-secondary']"
              type="button"
              :disabled="true"
              @click="onExport"
            >
              <span><i class="bi bi-filetype-csv"></i></span>
            </button>
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

//import Calendar from 'primevue/calendar'
//import MultiSelect from 'primevue/multiselect'
//import Calendar from 'primevue/calendar'
//import Dropdown from 'primevue/dropdown'

//import { useMasterApiStore } from '@/stores/modules/api/master-store.js'

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
    },
    masterPlanStatus: {
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
      return true
    }
  },
  data() {
    return {
      isLoading: false,
      form: { ...this.modelForm },
      isShow: { ...interfaceIsShow }
    }
  },

  setup() {
    // const planSearchStore = usePlanUpdateApiStore()
    // return { planSearchStore }
  },

  methods: {
    // ---------------- event
    onSearch() {
      console.log('onSubmit')
      this.$emit('search', this.form)
    },
    onExport() {
      console.log('onExport')
      this.$emit('export')
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
    onShowDialog() {
      this.isShow.dialog = true
    },
    closeDialog() {
      this.isShow.dialog = false
    }
  },
  created() {
    this.$nextTick(() => {})
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
