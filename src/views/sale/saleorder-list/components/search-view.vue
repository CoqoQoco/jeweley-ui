<template>
  <div class="filter-container-searchBar">
    <pageTitle
      :title="$t('view.sale.saleOrderList.title')"
      :description="$t('view.sale.saleOrderList.pageDescription')"
      :isShowBtnClose="false"
      :isShowRightSlot="true"
    >
      <template #rightSlot>
        <button
          class="btn btn-sm btn-main"
          type="button"
          :title="$t('view.sale.saleOrderList.createSaleOrder')"
          @click="$router.push({ name: 'sale-order' })"
        >
          <span class="bi bi-database-fill-add"></span>
        </button>
      </template>
    </pageTitle>
    
    <form @submit.prevent="onSearch">
      <div class="form-col-container">
        <!-- so number -->
        <div>
          <span class="title-text">{{ $t('view.sale.saleOrderList.soNumber') }}</span>
          <InputTextGeneric
            v-model="form.soNumber"
            :trim="true"
            placeholder="EX: SO-2025-001"
          />
        </div>

        <!-- stock number -->
        <div>
          <span class="title-text">{{ $t('view.sale.saleOrderList.stockNumber') }}</span>
          <InputTextGeneric
            v-model="form.stockNumber"
            :trim="true"
            :placeholder="$t('view.sale.saleOrderList.stockNumber')"
          />
        </div>

        <!-- product number -->
        <div>
          <span class="title-text">{{ $t('view.sale.saleOrderList.productNumber') }}</span>
          <InputTextGeneric
            v-model="form.productNumber"
            :trim="true"
            :placeholder="$t('view.sale.saleOrderList.productNumber')"
          />
        </div>

        <!-- mold number -->
        <div>
          <span class="title-text">{{ $t('view.sale.saleOrderList.moldNumber') }}</span>
          <InputTextGeneric
            v-model="form.moldNumber"
            :trim="true"
            :placeholder="$t('view.sale.saleOrderList.moldNumber')"
          />
        </div>
      </div>

      <dialogView
        :isShow="isShow.dialog"
        @closeDialog="closeDialog"
        @search="dialogSearch"
        :txtHeader="$t('common.label.advancedSearch')"
      >
        <template #content>
          <div class="form-col-container">
            <!-- customer name -->
            <div>
              <span class="title-text">{{ $t('view.sale.saleOrderList.customerName') }}</span>
              <InputTextGeneric
                v-model="form.customerName"
                :trim="true"
                :placeholder="$t('view.sale.saleOrderList.customerName')"
              />
            </div>

            <!-- ref quotation -->
            <div>
              <span class="title-text">{{ $t('view.sale.saleOrderList.refQuotation') }}</span>
              <InputTextGeneric
                v-model="form.refQuotation"
                :trim="true"
                :placeholder="$t('view.sale.saleOrderList.refQuotation')"
              />
            </div>

            <!-- currency -->
            <div>
              <span class="title-text">{{ $t('view.sale.saleOrderList.currency') }}</span>
              <InputTextGeneric
                v-model="form.currencyUnit"
                :trim="true"
                placeholder="EX: USD, THB"
              />
            </div>

            <!-- create by -->
            <div>
              <span class="title-text">{{ $t('view.sale.saleOrderList.createBy') }}</span>
              <InputTextGeneric
                v-model="form.createBy"
                :trim="true"
                :placeholder="$t('view.sale.saleOrderList.createBy')"
              />
            </div>
          </div>

          <div class="form-col-container mt-2">
            <!-- create date -->
            <div>
              <span class="title-text">{{ $t('view.sale.saleOrderList.createDate') }}</span>
              <div class="flex-group">
                <CalendarGeneric
                  class="w-100"
                  v-model="form.createDateStart"
                  :maxDate="form.createDateEnd"
                  :showIcon="true"
                  :manualInput="false"
                  :placeholder="$t('common.label.startDate')"
                  dateFormat="dd/mm/yy"
                />
                <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
                <CalendarGeneric
                  class="w-100"
                  v-model="form.createDateEnd"
                  :minDate="form.createDateStart"
                  :showIcon="true"
                  :manualInput="false"
                  :placeholder="$t('common.label.endDate')"
                  dateFormat="dd/mm/yy"
                />
              </div>
            </div>

            <!-- delivery date -->
            <div>
              <span class="title-text">{{ $t('view.sale.saleOrderList.deliveryDate') }}</span>
              <div class="flex-group">
                <CalendarGeneric
                  class="w-100"
                  v-model="form.deliveryDateStart"
                  :maxDate="form.deliveryDateEnd"
                  :showIcon="true"
                  :manualInput="false"
                  :placeholder="$t('common.label.startDate')"
                  dateFormat="dd/mm/yy"
                />
                <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
                <CalendarGeneric
                  class="w-100"
                  v-model="form.deliveryDateEnd"
                  :minDate="form.deliveryDateStart"
                  :showIcon="true"
                  :manualInput="false"
                  :placeholder="$t('common.label.endDate')"
                  dateFormat="dd/mm/yy"
                />
              </div>
            </div>
          </div>
        </template>
      </dialogView>

      <div class="btn-submit-container">
        <button class="btn btn-sm btn-main mr-2" type="submit" :title="$t('common.btn.search')">
          <span><i class="bi bi-search"></i></span>
        </button>
        <button
          class="btn btn-sm btn-sub-main mr-2"
          type="button"
          :title="$t('common.btn.more')"
          @click="onShowDialog"
        >
          <span><i class="bi bi-zoom-in"></i></span>
        </button>
        <button class="btn btn-sm btn-dark mr-2" type="button" @click="onClear" :title="$t('common.btn.clear')">
          <span><i class="bi bi-x-circle"></i></span>
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import pageTitle from '@/components/custom/page-title.vue'
import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'

const dialogView = defineAsyncComponent(() => import('@/components/prime-vue/DialogSearchView.vue'))

const interfaceIsShow = {
  dialog: false
}

export default {
  name: 'SaleOrderListSearchView',

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