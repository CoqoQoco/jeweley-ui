<template>
  <div class="filter-container-searchBar">
    <form @submit.prevent="onSearch">
      <div>
        <div>
          <pageTitle title="รายงานรับสินค้า" :isShowBtnClose="false"> </pageTitle>
        </div>

        <div class="form-col-container">
          <!-- receipt date -->
          <div>
            <span class="title-text">{{ $t('view.receiptStock.product.reportGr.receiptDate') }}</span>
            <div class="flex-group">
              <CalendarGeneric
                class="w-100"
                v-model="form.receiptDateStart"
                :max-date="form.receiptDateEnd"
                :showIcon="true"
                :manualInput="true"
                :placeholder="$t('common.label.start')"
                dateFormat="dd/mm/yy"
              />
              <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
              <CalendarGeneric
                class="w-100"
                v-model="form.receiptDateEnd"
                :min-date="form.receiptDateStart"
                :showIcon="true"
                :manualInput="false"
                :placeholder="$t('common.label.end')"
                dateFormat="dd/mm/yy"
              />
            </div>
          </div>

          <div class="form-col-container">
            <!-- stock number -->
            <div>
              <span class="title-text">{{ $t('view.receiptStock.product.reportGr.stockNumber') }}</span>
              <InputTextGeneric v-model.trim="form.stockNumber" placeholder="EX: DK-2502-00X" />
            </div>

            <!-- product number -->
            <div>
              <span class="title-text">{{ $t('view.receiptStock.product.reportGr.productNumber') }}</span>
              <InputTextGeneric v-model.trim="form.productNumber" placeholder="EX: R08X50XXXL" />
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
              <!-- receipt type -->
              <div>
                <span class="title-text">{{ $t('view.receiptStock.product.reportGr.receiptType') }}</span>
                <MultiSelectGeneric
                  v-model="form.receiptType"
                  :options="receiptTypeMaster"
                  optionLabel="description"
                  optionValue="value"
                />
              </div>

              <!-- mold -->
              <div>
                <span class="title-text">{{ $t('view.receiptStock.product.reportGr.mold') }}</span>
                <InputTextGeneric v-model.trim="form.mold" placeholder="EX: CN-2400XX" />
              </div>

              <!-- productNameEn -->
              <div>
                <span class="title-text">{{ $t('view.receiptStock.product.reportGr.productNameEn') }}</span>
                <InputTextGeneric v-model.trim="form.productNameEn" placeholder="EX: Gold Ring #66" />
              </div>

              <!-- productNameTh -->
              <div>
                <span class="title-text">{{ $t('view.receiptStock.product.reportGr.productNameTh') }}</span>
                <InputTextGeneric v-model.trim="form.productNameTh" />
              </div>

              <!-- woText -->
              <div>
                <span class="title-text">{{ $t('view.receiptStock.product.reportGr.wo') }}</span>
                <InputTextGeneric v-model.trim="form.woText" placeholder="EX: 6802017XX" />
              </div>

              <!-- size -->
              <div>
                <span class="title-text">{{ $t('view.receiptStock.product.reportGr.size') }}</span>
                <InputTextGeneric v-model.trim="form.size" placeholder="EX: #66" />
              </div>

              <!-- product type -->
              <div>
                <span class="title-text">{{ $t('view.receiptStock.product.reportGr.productType') }}</span>
                <MultiSelectGeneric
                  v-model="form.productType"
                  :options="masterProductType"
                  optionLabel="description"
                  optionValue="code"
                />
              </div>
            </div>
          </template>
        </dialogView>

        <div class="btn-submit-container-between">
          <div></div>
          <div>
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
              <!-- <span>ค้นหา</span> -->
            </button>
            <button class="btn btn-sm btn-dark mr-2" type="button" @click="onClear" title="ล้าง">
              <span><i class="bi bi-x-circle"></i></span>
              <!-- <span>ล้าง</span> -->
            </button>

            <button
              class="btn btn-sm btn-green"
              type="button"
              :disabled="!receiptProductionStore.dataReceiptHistory.total > 0"
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

import { useReceiptProductionApiStore } from '@/stores/modules/api/receipt/receipt-production-api.js'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'
import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'
import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'

const pageTitle = defineAsyncComponent(() => import('@/components/custom/page-title.vue'))
const dialogView = defineAsyncComponent(() => import('@/components/prime-vue/DialogSearchView.vue'))

const interfaceIsShow = {
  dialog: false
}
export default {
  components: {
    pageTitle,
    CalendarGeneric,
    MultiSelectGeneric,
    InputTextGeneric,
    dialogView
  },

  setup() {
    const receiptProductionStore = useReceiptProductionApiStore()
    const masterStore = useMasterApiStore()
    return { receiptProductionStore, masterStore }
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
    masterProductType() {
      return this.masterStore.productType
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
      isShow: { ...interfaceIsShow },
      receiptTypeMaster: [
        { value: 'production', description: 'Production' }
        // { value: 2, description: 'งานรับสินค้าและส่งสินค้า' }
      ]
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
      await this.masterStore.fetchProductType()
    })
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
