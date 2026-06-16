<template>
  <div class="filter-container-searchBar">
    <pageTitle
      :title="$t('view.receiptStock.gem.transactionOnProcess.title')"
      :description="$t('view.receiptStock.gem.transactionOnProcess.description')"
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
          <span class="title-text">{{ $t('view.receiptStock.gem.transactionOnProcess.borrowDate') }}</span>
          <div class="flex-group">
            <CalendarGeneric
              class="w-100"
              v-model="form.requestDateStart"
              :max-date="form.requestDateEnd"
              dateFormat="dd/mm/yy"
              :showIcon="true"
              :placeholder="$t('common.label.start')"
            />
            <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
            <CalendarGeneric
              class="w-100"
              v-model="form.requestDateEnd"
              :min-date="form.requestDateStart"
              dateFormat="dd/mm/yy"
              :showIcon="true"
              :placeholder="$t('common.label.end')"
            />
          </div>
        </div>

        <div class="form-col-container">
          <div>
            <span class="title-text">{{ $t('view.receiptStock.gem.transactionOnProcess.operator') }}</span>
            <InputTextGeneric v-model="form.operator" />
          </div>
          <div>
            <span class="title-text">{{ $t('view.receiptStock.gem.transactionOnProcess.createBy') }}</span>
            <InputTextGeneric v-model="form.createBy" />
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
            <div class="form-col-container">
              <div>
                <span class="title-text">{{ $t('view.receiptStock.gem.transactionOnProcess.borrowNo') }}</span>
                <InputTextGeneric v-model="form.running" />
              </div>
              <div>
                <span class="title-text">{{ $t('common.field.code') }}</span>
                <InputTextGeneric v-model="form.code" />
              </div>
            </div>

            <!-- returnDate -->
            <div>
              <span class="title-text">{{ $t('view.receiptStock.gem.transactionOnProcess.returnDate') }}</span>
              <div class="flex-group">
                <CalendarGeneric
                  class="w-100"
                  v-model="form.returnDateStart"
                  :max-date="form.returnDateEnd"
                  dateFormat="dd/mm/yy"
                  :showIcon="true"
                  :placeholder="$t('common.label.start')"
                />
                <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
                <CalendarGeneric
                  class="w-100"
                  v-model="form.returnDateEnd"
                  :min-date="form.returnDateStart"
                  dateFormat="dd/mm/yy"
                  :showIcon="true"
                  :placeholder="$t('common.label.end')"
                />
              </div>
            </div>
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

import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'

const pageTitle = defineAsyncComponent(() => import('@/components/custom/page-title.vue'))
const dialogView = defineAsyncComponent(() => import('@/components/prime-vue/DialogSearchView.vue'))

const interfaceIsShow = {
  isCreate: false,
  dialog: false
}

export default {
  components: {
    pageTitle,
    CalendarGeneric,
    InputTextGeneric,
    dialogView
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
      form: { ...this.modelForm },
      isShow: { ...interfaceIsShow }
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
      this.$emit('search', this.form)
      this.isShow.dialog = false
    },
    onShowDialog() {
      this.isShow.dialog = true
    },
    closeDialog() {
      this.isShow.dialog = false
    },

  },
  created() {}
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
