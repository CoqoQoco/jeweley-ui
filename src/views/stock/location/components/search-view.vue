<template>
  <div class="filter-container-searchBar">
    <form @submit.prevent="onSearch">
      <div>
        <pageTitle title="ค้นหา Storage Location" :isShowBtnClose="false" />

        <div class="form-col-container">
          <div>
            <span class="title-text">รหัส</span>
            <input
              class="form-control bg-input"
              type="text"
              v-model.trim="form.code"
              placeholder="เช่น MAIN, SHOW-01"
            />
          </div>

          <div>
            <span class="title-text">ชื่อ</span>
            <input
              class="form-control bg-input"
              type="text"
              v-model.trim="form.nameTh"
              placeholder="เช่น คลังหลัก, โชว์รูม"
            />
          </div>

          <div>
            <span class="title-text">ประเภท</span>
            <DropdownGeneric
              :modelValue="form.type"
              :options="typeOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="ทั้งหมด"
              :showClear="true"
              @update:modelValue="form.type = $event"
            />
          </div>

          <div>
            <span class="title-text">สถานะ</span>
            <DropdownGeneric
              :modelValue="form.isActive"
              :options="statusOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="ทั้งหมด"
              :showClear="true"
              @update:modelValue="form.isActive = $event"
            />
          </div>
        </div>

        <div class="btn-submit-container-between">
          <div></div>
          <div>
            <button class="btn btn-sm btn-green" type="submit" title="ค้นหา">
              <i class="bi bi-search"></i>
            </button>
            <button class="btn btn-sm btn-dark ml-2" type="button" @click="onClear" title="ล้าง">
              <i class="bi bi-x-circle"></i>
            </button>
            <button
              class="btn btn-sm btn-main ml-2"
              type="button"
              title="สร้างใหม่"
              @click="$emit('create')"
            >
              <i class="bi bi-plus"></i>
            </button>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'

const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))

const TYPE_OPTIONS = [
  { value: 'WAREHOUSE', label: 'คลัง' },
  { value: 'SHOWROOM', label: 'โชว์รูม' },
  { value: 'BRANCH', label: 'สาขา' },
  { value: 'TEMP', label: 'ชั่วคราว' }
]

const STATUS_OPTIONS = [
  { value: true, label: 'ใช้งาน' },
  { value: false, label: 'ปิด' }
]

const interfaceForm = {
  code: null,
  nameTh: null,
  type: null,
  isActive: null
}

export default {
  name: 'LocationSearchView',

  components: {
    pageTitle,
    DropdownGeneric
  },

  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    }
  },

  emits: ['search', 'clear', 'create'],

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
      form: { ...interfaceForm },
      typeOptions: TYPE_OPTIONS,
      statusOptions: STATUS_OPTIONS
    }
  },

  methods: {
    onSearch() {
      this.$emit('search', this.form)
    },
    onClear() {
      this.$emit('clear')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
