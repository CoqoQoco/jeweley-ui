<template>
  <div class="filter-container-searchBar">
    <pageTitle
      title="รายการใบเสนอราคา"
      description="แสดงรายการใบเสนอราคาทั้งหมด พร้อมฟีเจอร์ค้นหาและกรองข้อมูล"
      :isShowBtnClose="false"
      :isShowRightSlot="true"
    >
      <template #rightSlot>
        <button
          class="btn btn-sm btn-main"
          type="button"
          title="สร้างใบเสนอราคา"
          @click="$router.push({ name: 'sale-quotation' })"
        >
          <span class="bi bi-database-fill-add"></span>
        </button>
      </template>
    </pageTitle>
    
    <form @submit.prevent="onSearch">
      <div class="form-col-container">
        <div>
          <span class="title-text">{{ $t('view.sale.quotationList.number') }}</span>
          <InputTextGeneric
            v-model="form.number"
            :trim="true"
            placeholder="EX: QUO-2025-001"
          />
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
            <div>
              <span class="title-text">{{ $t('view.sale.quotationList.customerName') }}</span>
              <InputTextGeneric
                v-model="form.customerName"
                :trim="true"
                placeholder="ชื่อลูกค้า"
              />
            </div>

            <div>
              <span class="title-text">{{ $t('view.sale.quotationList.currency') }}</span>
              <InputTextGeneric
                v-model="form.currency"
                :trim="true"
                placeholder="EX: USD, THB"
              />
            </div>

            <div>
              <span class="title-text">{{ $t('view.sale.quotationList.createBy') }}</span>
              <InputTextGeneric
                v-model="form.createBy"
                :trim="true"
                placeholder="ชื่อผู้สร้าง"
              />
            </div>
          </div>

          <div class="form-col-container mt-2">
            <div>
              <span class="title-text">{{ $t('view.sale.quotationList.createDate') }}</span>
              <div class="flex-group">
                <CalendarGeneric
                  class="w-100"
                  v-model="form.createDateStart"
                  :max-date="form.createDateEnd"
                  :showIcon="true"
                  :manualInput="false"
                  placeholder="เริ่มต้น"
                  dateFormat="dd/mm/yy"
                />
                <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
                <CalendarGeneric
                  class="w-100"
                  v-model="form.createDateEnd"
                  :min-date="form.createDateStart"
                  :showIcon="true"
                  :manualInput="false"
                  placeholder="สิ้นสุด"
                  dateFormat="dd/mm/yy"
                />
              </div>
            </div>

            <div>
              <span class="title-text">{{ $t('view.sale.quotationList.quotationDate') }}</span>
              <div class="flex-group">
                <CalendarGeneric
                  class="w-100"
                  v-model="form.quotationDateStart"
                  :max-date="form.quotationDateEnd"
                  :showIcon="true"
                  :manualInput="false"
                  placeholder="เริ่มต้น"
                  dateFormat="dd/mm/yy"
                />
                <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
                <CalendarGeneric
                  class="w-100"
                  v-model="form.quotationDateEnd"
                  :min-date="form.quotationDateStart"
                  :showIcon="true"
                  :manualInput="false"
                  placeholder="สิ้นสุด"
                  dateFormat="dd/mm/yy"
                />
              </div>
            </div>
          </div>
        </template>
      </dialogView>

      <div class="btn-submit-container">
        <button class="btn btn-sm btn-main mr-2" type="submit" title="ค้นหา">
          <span><i class="bi bi-search"></i></span>
        </button>
        <button
          class="btn btn-sm btn-sub-main mr-2"
          type="button"
          title="เพิ่มเติม"
          @click="onShowDialog"
        >
          <span><i class="bi bi-zoom-in"></i></span>
        </button>
        <button class="btn btn-sm btn-dark mr-2" type="button" @click="onClear" title="ล้าง">
          <span><i class="bi bi-x-circle"></i></span>
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import pageTitle from '@/components/custom/page-title.vue'

const dialogView = defineAsyncComponent(() => import('@/components/prime-vue/DialogSearchView.vue'))

const interfaceIsShow = {
  dialog: false
}

export default {
  name: 'QuotationListSearchView',

  components: {
    CalendarGeneric,
    InputTextGeneric,
    pageTitle,
    dialogView
  },

  emits: ['search', 'clear', 'update:modelForm'],

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
      form: { ...this.modelForm },
      isShow: { ...interfaceIsShow }
    }
  },

  methods: {
    onSearch() {
      this.$emit('search', this.form)
    },

    dialogSearch() {
      this.isShow.dialog = false
      this.$emit('search', this.form)
    },

    onClear() {
      this.$emit('clear')
    },

    onShowDialog() {
      this.isShow.dialog = true
    },

    closeDialog() {
      this.isShow.dialog = false
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/custom-style/standard-form.scss';
</style>