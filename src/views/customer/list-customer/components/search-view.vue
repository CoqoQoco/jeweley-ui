<template>
  <div class="filter-container-searchBar">
    <form @submit.prevent="onSearch">
      <div>
        <div>
          <pageTitle title="รายชื่อลูกค้า" :isShowBtnClose="false" :isShowRightSlot="true">
            <template #rightSlot>
              <button
                class="btn btn-sm btn-main"
                @click="onCreate"
                type="button"
                title="เพิ่มลูกค้า"
              >
                <span class="bi bi-database-fill-add"></span>
              </button>
            </template>
          </pageTitle>
        </div>

        <div class="form-col-container">
          <div>
            <span class="title-text">ค้าหา</span>
            <input
              :class="['form-control bg-input']"
              type="text"
              v-model.trim="form.text"
              placeholder="EX: ชื่อลุกค้า, รหัสลูกค้า ..."
              required
            />
          </div>
        </div>

        <div class="btn-submit-container-between">
          <div></div>
          <div>
            <button class="btn btn-sm btn-main mr-2" type="submit" title="ค้นหา">
              <span><i class="bi bi-search"></i></span>
            </button>

            <!-- 
            <button
              class="btn btn-sm btn-sub-main mr-2"
              type="button"
              title="เพิ่มเติม"
              @click="onShowDialog"
            >
              <span><i class="bi bi-zoom-in"></i></span>
            </button> -->

            <button class="btn btn-sm btn-dark mr-2" type="button" @click="onClear" title="ล้าง">
              <span><i class="bi bi-x-circle"></i></span>
            </button>
          </div>
        </div>
      </div>
    </form>
  </div>

  <createView
    :isShow="isShow.add"
    :masterCustomer="masterCustomerType"
    @closeModal="onCloseModal"
  />
</template>

<script>
//const dialogView = defineAsyncComponent(() => import('@/components/prime-vue/DialogSearchView.vue'))

import { useMasterApiStore } from '@/stores/modules/api/master-store.js'

//import Calendar from 'primevue/calendar'
//import MultiSelect from 'primevue/multiselect'
//import Calendar from 'primevue/calendar'
//import Dropdown from 'primevue/dropdown'

//import { usePlanSearchApiStore } from '@/stores/modules/api/plan-search-store.js'
//import api from '@/axios/axios-helper.js'

import pageTitle from '@/components/custom/PageTitle.vue'
import createView from '../modal/create-view.vue'

const interfaceIsShow = {
  dialog: false,
  add: false
}

export default {
  components: {
    pageTitle,
    createView
    //MultiSelect,
    //Calendar,
    //Dropdown,
    //dialogView
  },

  setup() {
    const masterStore = useMasterApiStore()
    return { masterStore }
  },
  
  emits: ['search', 'clear', 'update:modelForm'],

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
    masterCustomerType() {
      return this.masterStore.customerType
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
      //this.$emit('export', this.form)
    },
    dialogSearch() {
      this.isShow.dialog = false
      //this.$emit('search')
    },
    onSubmitExport() {
      //this.$emit('export', true)
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
    },
    onCreate() {
      this.isShow.add = true
    }
  },

  created() {
    this.$nextTick(async () => {
      await this.masterStore.fetchCustomerType()
    })
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
