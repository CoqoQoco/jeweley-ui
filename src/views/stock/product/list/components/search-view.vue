<template>
  <div class="filter-container-searchBar">
    <form @submit.prevent="onSearch">
      <div>
        <div>
          <pageTitle
            :title="$t('view.stock.product.searchTitle')"
            :description="$t('view.stock.product.searchDesc')"
            :isShowBtnClose="false"
          >
          </pageTitle>
        </div>

        <div class="form-col-container">
            <!-- stock number -->
            <div>
              <span class="title-text">{{ $t('view.stock.product.stockNumberNew') }}</span>
              <input
                :class="['form-control bg-input']"
                type="text"
                v-model.trim="form.stockNumber"
                placeholder="EX: DK-2502-00X"
              />
            </div>

            <div>
              <span class="title-text">{{ $t('view.stock.product.stockNumberOld') }}</span>
              <input
                :class="['form-control bg-input']"
                type="text"
                v-model.trim="form.stockNumberOrigin"
                placeholder="EX: A0211XX"
              />
            </div>

            <!-- product number -->
            <div>
              <span class="title-text">{{ $t('view.stock.product.productNumber') }}</span>
              <input
                :class="['form-control bg-input']"
                type="text"
                v-model.trim="form.productNumber"
                placeholder="EX: R08X50XXXL"
              />
            </div>

            <!-- location -->
            <div>
              <span class="title-text">{{ $t('view.stock.product.locationFilterLabel') }}</span>
              <MultiSelectGeneric
                v-model="form.locationCodes"
                :options="locationOptions"
                optionLabel="label"
                optionValue="value"
                :placeholder="$t('view.stock.product.locationFilterLabel')"
                :showClear="true"
              />
            </div>
        </div>

        <dialogView
          :isShow="isShow.dialog"
          @closeDialog="closeDialog"
          @search="dialogSearch"
          :txtHeader="$t('view.stock.gem.searchMore')"
        >
          <template #content>
            <div class="form-col-container">
              <!-- receipt type -->
              <div>
                <span class="title-text">{{ $t('view.stock.product.receiptType') }}</span>
                <div>
                  <MultiSelectGeneric
                    v-model="form.receiptType"
                    :options="receiptTypeMaster"
                    optionLabel="description"
                    optionValue="value"
                    class="w-full md:w-14rem"
                  />
                </div>
              </div>

              <!-- mold -->
              <div>
                <span class="title-text">{{ $t('view.stock.product.mold') }}</span>
                <input
                  :class="['form-control bg-input']"
                  type="text"
                  v-model.trim="form.mold"
                  placeholder="EX: CN-2400XX"
                />
              </div>

              <!-- productNameEn -->
              <div>
                <span class="title-text">{{ $t('view.stock.product.productNameEn') }}</span>
                <input
                  :class="['form-control bg-input']"
                  type="text"
                  v-model.trim="form.productNameEn"
                  placeholder="EX: Gold Ring #66"
                />
              </div>

              <!-- productNameTh -->
              <div>
                <span class="title-text">{{ $t('view.stock.product.productNameTh') }}</span>
                <input
                  :class="['form-control bg-input']"
                  type="text"
                  v-model.trim="form.productNameTh"
                  placeholder="EX: แหวนทอง ขนาด #66"
                />
              </div>

              <!-- woText -->
              <div>
                <span class="title-text">{{ $t('view.stock.product.wo') }}</span>
                <input
                  :class="['form-control bg-input']"
                  type="text"
                  v-model.trim="form.woText"
                  placeholder="EX: 6802017XX"
                />
              </div>

              <!-- size -->
              <div>
                <span class="title-text">{{ $t('view.stock.product.size') }}</span>
                <input
                  :class="['form-control bg-input']"
                  type="text"
                  v-model.trim="form.size"
                  placeholder="EX: #66"
                />
              </div>

              <!-- product type -->
              <div>
                <span class="title-text">{{ $t('view.stock.product.productType') }}</span>
                <div>
                  <MultiSelectGeneric
                    v-model="form.productType"
                    :options="masterProductType"
                    optionLabel="description"
                    optionValue="code"
                    class="w-full md:w-14rem"
                  />
                </div>
              </div>

              <!-- gold -->
              <div>
                <span class="title-text">{{ $t('view.stock.product.goldColor') }}</span>
                <div>
                  <MultiSelectGeneric
                    v-model="form.gold"
                    :options="masterGold"
                    optionLabel="nameTh"
                    optionValue="nameEn"
                    class="w-full md:w-14rem"
                  />
                </div>
              </div>

              <!-- gold size -->
              <div>
                <span class="title-text">{{ $t('view.stock.product.goldType') }}</span>
                <div>
                  <MultiSelectGeneric
                    v-model="form.goldSize"
                    :options="masterGoldSize"
                    optionLabel="nameTh"
                    optionValue="nameEn"
                    class="w-full md:w-14rem"
                  />
                </div>
              </div>

              <!-- cost detail status -->
              <div>
                <span class="title-text">{{ $t('view.stock.product.costStatus') }}</span>
                <DropdownGeneric
                  :modelValue="form.hasCostDetail"
                  :options="costDetailOptions"
                  optionLabel="description"
                  optionValue="value"
                  placeholder="ทั้งหมด"
                  :showClear="true"
                  @update:modelValue="form.hasCostDetail = $event"
                />
              </div>

              <!-- piece status -->
              <div>
                <span class="title-text">{{ $t('view.stock.product.pieceStatus') }}</span>
                <div>
                  <DropdownGeneric
                    :modelValue="form.pieceStatus"
                    :options="pieceStatusOptions"
                    optionLabel="description"
                    optionValue="value"
                    placeholder="ทั้งหมด"
                    :showClear="true"
                    @update:modelValue="form.pieceStatus = $event"
                  />
                </div>
              </div>
            </div>
          </template>
        </dialogView>

        <div class="btn-submit-container-between">
          <div></div>
          <div>
            <button class="btn btn-sm btn-main" type="submit" :title="$t('common.btn.search')">
              <span><i class="bi bi-search"></i></span>
            </button>
            <button
              class="btn btn-sm btn-sub-main ml-2"
              type="button"
              :title="$t('common.btn.more')"
              @click="onShowDialog"
            >
              <span><i class="bi bi-zoom-in"></i></span>
            </button>
            <button class="btn btn-sm btn-dark ml-2" type="button" @click="onClear" :title="$t('common.btn.clear')">
              <span><i class="bi bi-x-circle"></i></span>
            </button>

            <button
              class="btn btn-sm btn-main ml-2"
              type="button"
              :disabled="!productStore.dataSearch.total > 0"
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
const pageTitle = defineAsyncComponent(() => import('@/components/custom/page-title.vue'))
const dialogView = defineAsyncComponent(() => import('@/components/prime-vue/DialogSearchView.vue'))

import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'
import { useStockLocationApiStore } from '@/stores/modules/api/stock/stock-location-api.js'

import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'

const interfaceIsShow = {
  dialog: false
}
export default {
  components: {
    pageTitle,
    MultiSelectGeneric,
    DropdownGeneric,
    dialogView
  },

  setup() {
    const productStore = usrStockProductApiStore()
    const masterStore = useMasterApiStore()
    const locationStore = useStockLocationApiStore()
    return { productStore, masterStore, locationStore }
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
    },
    locationOptions() {
      return this.locationStore.all
        .filter((item) => item.isActive)
        .map((item) => ({ value: item.code, label: `${item.code} — ${item.nameTh}` }))
    },
    costDetailOptions() {
      return [
        { value: true, description: this.$t('view.stock.product.hasCost') },
        { value: false, description: this.$t('view.stock.product.noCost') }
      ]
    },
    pieceStatusOptions() {
      return [
        { value: 'IN_STOCK', description: this.$t('view.stock.product.inStock') },
        { value: 'RESERVED', description: this.$t('view.stock.product.reserved') },
        { value: 'SOLD', description: this.$t('view.stock.product.sold') }
      ]
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
      ],
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

  async created() {
    await this.locationStore.fetchAllForMap()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
