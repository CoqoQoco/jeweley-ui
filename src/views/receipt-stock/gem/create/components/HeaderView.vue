<template>
  <div class="filter-container">
    <loading :isLoading="isLoading"></loading>
    <pageTitle
      title="สร้างรหัสวัถุดิบ"
      description="สร้างรหัสวัถุดิบ ระบุข้อมูลรหัส หมวดหมู่ ขนาด รูปร่าง เกรด เเละคำอธิบายอื่นๆ"
      :isShowBtnClose="false"
      :isShowRightSlot="true"
    >
      <template #rightSlot>
        <div>
          <button class="btn btn-sm btn-main" @click="onShowCreate">
            <i class="bi bi-pencil"></i>
            <span class="ml-2">สร้างรหัส</span>
          </button>
        </div>
      </template>
    </pageTitle>
    <form @submit.prevent="onSubmit">
      <div class="form-col-container">
        <div>
          <span class="title-text">รหัส</span>
          <input type="text" class="form-control" v-model="form.code" />
        </div>
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
      </div>
      <div class="btn-submit-container">
        <button class="btn btn-sm btn-main mr-2" type="submit">
          <span><i class="bi bi-search mr-2"></i></span>
          <span>ค้นหา</span>
        </button>
        <button class="btn btn-sm btn-secondary" type="button" @click="onClear">
          <span><i class="bi bi-x mr-2"></i></span>
          <span>ล้าง</span>
        </button>
      </div>
    </form>

    <createView :isShow="isShow.isCreate" @closeModal="onCloseModal"></createView>
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
      isShow: { ...interfaceIsShow },

      form: { ...this.modelForm },
      groupOptions: [],
      gradeOptions: [],
      shapeOptions: [],
      sizeOptions: []
    }
  },
  methods: {
    onSubmit() {
      this.$emit('search', this.form)
    },
    onClear() {
      this.$emit('clear')
    },
    // ---------------- event
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
    }
  },
  created() {
    this.$nextTick(() => {
      this.fetchGroupOptions()
      this.fetchSizeOption()
      this.fetchGradeOption()
      this.fetchShapeOptions()
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
