<template>
  <div class="filter-container-searchBar">
    <form @submit.prevent="onSearch">
      <div>
        <div>
          <pageTitle
            title="รับสินค้างานผลิต"
            description="ตรวจสอบเเละรับสินค้าจากงานผลิตเข้าคลัง"
            :isShowBtnClose="false"
          >
          </pageTitle>
        </div>

        <div class="form-col-container">
          <!-- receipt date -->
          <div>
            <span class="title-text">{{ $t('view.receiptStock.product.productionReceiptList.receiptDate') }}</span>
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
            <!-- wo -->
            <div>
              <span class="title-text">{{ $t('view.receiptStock.product.productionReceiptList.wo') }}</span>
              <InputTextGeneric v-model.trim="form.woText" placeholder="EX: 6802017XX" />
            </div>

            <!-- receipt number -->
            <div>
              <span class="title-text">{{ $t('view.receiptStock.product.productionReceiptList.receiptNumber') }}</span>
              <InputTextGeneric v-model.trim="form.receiptNumber" placeholder="EX: REP2411090XX" />
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
              <!-- mold -->
              <div>
                <span class="title-text">{{ $t('view.receiptStock.product.productionReceiptList.mold') }}</span>
                <InputTextGeneric v-model.trim="form.mold" placeholder="EX: CN-2400XX" />
              </div>

              <!-- productNumber -->
              <div>
                <span class="title-text">{{ $t('view.receiptStock.product.productionReceiptList.productNumber') }}</span>
                <InputTextGeneric v-model.trim="form.productNumber" placeholder="EX: DAY250303A" />
              </div>

              <!-- product type -->
              <div>
                <span class="title-text">{{ $t('view.receiptStock.product.productionReceiptList.productType') }}</span>
                <MultiSelectGeneric
                  v-model="form.productType"
                  :options="masterProductType"
                  optionLabel="description"
                  optionValue="code"
                  :placeholder="$t('common.label.all')"
                />
              </div>

              <!-- gold type -->
              <div>
                <span class="title-text">{{ $t('view.receiptStock.product.productionReceiptList.goldType') }}</span>
                <MultiSelectGeneric
                  v-model="form.goldType"
                  :options="masterGold"
                  optionLabel="description"
                  optionValue="nameEn"
                  :placeholder="$t('common.label.all')"
                />
              </div>

              <!-- gold size -->
              <div>
                <span class="title-text">{{ $t('view.receiptStock.product.productionReceiptList.goldSize') }}</span>
                <MultiSelectGeneric
                  v-model="form.goldSize"
                  :options="masterGoldSize"
                  optionLabel="description"
                  optionValue="nameEn"
                  :placeholder="$t('common.label.all')"
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
    },
    masterGold() {
      return this.masterStore.gold
    },
    masterGoldSize() {
      return this.masterStore.goldSize
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
    this.$nextTick(async () => {
      await this.masterStore.fetchProductType()
      await this.masterStore.fetchGold()
      await this.masterStore.fetchGoldSize()
    })
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
