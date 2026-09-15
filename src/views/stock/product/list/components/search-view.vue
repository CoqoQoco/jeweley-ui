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
              <InputTextGeneric
                type="text"
                v-model="form.stockNumber"
                :trim="true"
                :bgInput="true"
                placeholder="EX: DK-2502-00X"
              />
            </div>

            <div>
              <span class="title-text">{{ $t('view.stock.product.stockNumberOld') }}</span>
              <InputTextGeneric
                type="text"
                v-model="form.stockNumberOrigin"
                :trim="true"
                :bgInput="true"
                placeholder="EX: A0211XX"
              />
            </div>

            <!-- product number -->
            <div>
              <span class="title-text">{{ $t('view.stock.product.productNumber') }}</span>
              <InputTextGeneric
                type="text"
                v-model="form.productNumber"
                :trim="true"
                :bgInput="true"
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
            <SectionCardGeneric
              :title="$t('view.stock.product.sectionSpecTitle')"
              headerStyle="legend"
              class="dialog-section"
            >
              <div class="form-col-container">
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

                <!-- materials -->
                <div>
                  <span class="title-text">{{ $t('view.stock.product.materialLabel') }}</span>
                  <MultiSelectGeneric
                    v-model="form.materials"
                    :options="materialOptions"
                    optionLabel="label"
                    optionValue="value"
                    :placeholder="$t('view.stock.product.materialPlaceholder')"
                    :showClear="true"
                  />
                  <ToggleGroupGeneric
                    v-if="form.materials?.length >= 2"
                    v-model="form.materialMatch"
                    :options="materialMatchOptions"
                    :ariaLabel="$t('view.stock.product.materialLabel')"
                    class="mt-2"
                  />
                </div>

                <!-- price range -->
                <div>
                  <span class="title-text">{{ $t('view.stock.product.priceRangeLabel') }}</span>
                  <div class="flex-group">
                    <InputTextGeneric
                      type="number"
                      :min="0"
                      v-model="form.priceMin"
                      :placeholder="$t('view.stock.product.pricePlaceholderMin')"
                    />
                    <div class="mx-2">–</div>
                    <InputTextGeneric
                      type="number"
                      :min="0"
                      v-model="form.priceMax"
                      :placeholder="$t('view.stock.product.pricePlaceholderMax')"
                    />
                  </div>
                </div>
              </div>
            </SectionCardGeneric>

            <SectionCardGeneric
              :title="$t('view.stock.product.sectionOtherTitle')"
              headerStyle="legend"
              class="dialog-section"
            >
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
                  <InputTextGeneric
                    type="text"
                    v-model="form.mold"
                    :trim="true"
                    :bgInput="true"
                    placeholder="EX: CN-2400XX"
                  />
                </div>

                <!-- productNameEn -->
                <div>
                  <span class="title-text">{{ $t('view.stock.product.productNameEn') }}</span>
                  <InputTextGeneric
                    type="text"
                    v-model="form.productNameEn"
                    :trim="true"
                    :bgInput="true"
                    placeholder="EX: Gold Ring #66"
                  />
                </div>

                <!-- productNameTh -->
                <div>
                  <span class="title-text">{{ $t('view.stock.product.productNameTh') }}</span>
                  <InputTextGeneric
                    type="text"
                    v-model="form.productNameTh"
                    :trim="true"
                    :bgInput="true"
                    :placeholder="$t('view.stock.product.placeholderProductNameTh')"
                  />
                </div>

                <!-- woText -->
                <div>
                  <span class="title-text">{{ $t('view.stock.product.wo') }}</span>
                  <InputTextGeneric
                    type="text"
                    v-model="form.woText"
                    :trim="true"
                    :bgInput="true"
                    placeholder="EX: 6802017XX"
                  />
                </div>

                <!-- size -->
                <div>
                  <span class="title-text">{{ $t('view.stock.product.size') }}</span>
                  <InputTextGeneric
                    type="text"
                    v-model="form.size"
                    :trim="true"
                    :bgInput="true"
                    placeholder="EX: #66"
                  />
                </div>

                <!-- cost detail status -->
                <div>
                  <span class="title-text">{{ $t('view.stock.product.costStatus') }}</span>
                  <DropdownGeneric
                    :modelValue="form.hasCostDetail"
                    :options="costDetailOptions"
                    optionLabel="description"
                    optionValue="value"
                    :placeholder="$t('common.label.all')"
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
                      :placeholder="$t('common.label.all')"
                      :showClear="true"
                      @update:modelValue="form.pieceStatus = $event"
                    />
                  </div>
                </div>
              </div>
            </SectionCardGeneric>
          </template>
        </dialogView>

        <div class="btn-submit-container-between">
          <div></div>
          <div>
            <ButtonGeneric variant="main" icon="bi-search" type="submit" :title="$t('common.btn.search')" />
            <div class="btn-badge-wrap ml-2">
              <ButtonGeneric
                variant="sub-main"
                icon="bi-zoom-in"
                :title="$t('common.btn.more')"
                @click="onShowDialog"
              />
              <span
                v-if="activeFilterCount > 0"
                class="filter-badge"
                :title="$t('view.stock.product.filterBadgeTooltip')"
              >{{ activeFilterCount }}</span>
            </div>
            <ButtonGeneric
              variant="dark"
              icon="bi-x-circle"
              class="ml-2"
              :title="$t('common.btn.clear')"
              @click="onClear"
            />
            <ButtonGeneric
              variant="main"
              icon="bi-filetype-csv"
              class="ml-2"
              :disabled="!(productStore.dataSearch.total > 0)"
              :title="$t('common.btn.export')"
              @click="onExport"
            />
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
import { warning } from '@/services/alert/sweetAlerts.js'

import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ToggleGroupGeneric from '@/components/generic/ToggleGroupGeneric.vue'

const interfaceIsShow = {
  dialog: false
}
export default {
  components: {
    pageTitle,
    MultiSelectGeneric,
    DropdownGeneric,
    InputTextGeneric,
    ButtonGeneric,
    SectionCardGeneric,
    ToggleGroupGeneric,
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
    masterGem() {
      return this.masterStore.gem
    },
    materialOptions() {
      const diamondOption = {
        value: 'DIAMOND',
        label: this.$t('view.stock.product.materialDiamondOption')
      }
      const gemOptions = this.masterGem
        .filter((item) => {
          const nameEn = (item.nameEn || '').toLowerCase()
          const code = (item.code || '').toUpperCase()
          return !nameEn.includes('diamond') && !code.startsWith('DI')
        })
        .map((item) => ({ value: item.code, label: `${item.nameTh} (${item.nameEn})` }))
      return [diamondOption, ...gemOptions]
    },
    materialMatchOptions() {
      return [
        { value: 'all', label: this.$t('view.stock.product.materialMatchAll') },
        { value: 'any', label: this.$t('view.stock.product.materialMatchAny') }
      ]
    },
    activeFilterCount() {
      const f = this.form
      const hasPriceRange =
        (f.priceMin !== null && f.priceMin !== undefined && f.priceMin !== '') ||
        (f.priceMax !== null && f.priceMax !== undefined && f.priceMax !== '')
      const checks = [
        f.receiptType?.length > 0,
        !!f.mold,
        !!f.productNameEn,
        !!f.productNameTh,
        !!f.woText,
        !!f.size,
        f.productType?.length > 0,
        f.gold?.length > 0,
        f.goldSize?.length > 0,
        f.hasCostDetail !== null && f.hasCostDetail !== undefined,
        !!f.pieceStatus,
        f.materials?.length > 0,
        hasPriceRange
      ]
      return checks.filter(Boolean).length
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
    isPriceRangeValid() {
      const { priceMin, priceMax } = this.form
      const hasMin = priceMin !== null && priceMin !== undefined && priceMin !== ''
      const hasMax = priceMax !== null && priceMax !== undefined && priceMax !== ''
      if (!hasMin || !hasMax) return true
      return Number(priceMin) <= Number(priceMax)
    },
    onSearch() {
      //console.log('onSubmit')
      if (!this.isPriceRangeValid()) {
        warning(this.$t('view.stock.product.priceRangeInvalid'), this.$t('alert.alertTitle.warning'))
        return
      }
      this.$emit('search', this.form)
    },
    onExport() {
      //console.log('onExport')
      this.$emit('export', this.form)
    },
    dialogSearch() {
      if (!this.isPriceRangeValid()) {
        warning(this.$t('view.stock.product.priceRangeInvalid'), this.$t('alert.alertTitle.warning'))
        return
      }
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

.dialog-section {
  margin-bottom: var(--sp-lg);

  &:last-child {
    margin-bottom: 0;
  }
}

.btn-badge-wrap {
  position: relative;
  display: inline-block;
}

.filter-badge {
  position: absolute;
  top: calc(var(--sp-xs) * -1.5);
  right: calc(var(--sp-xs) * -1.5);
  min-width: var(--sp-lg);
  height: var(--sp-lg);
  padding: 0 var(--sp-xs);
  border-radius: var(--radius-lg);
  background: var(--base-warning);
  color: var(--base-font-color);
  font-size: var(--fs-sm);
  line-height: var(--sp-lg);
  text-align: center;
  font-weight: 700;
  pointer-events: none;
}
</style>
