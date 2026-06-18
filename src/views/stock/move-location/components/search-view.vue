<template>
  <div class="filter-container-searchBar">
    <form @submit.prevent="onSearch">
      <div>
        <pageTitle :title="$t('view.stock.moveLocation.searchTitle')" :isShowBtnClose="false" />

        <div class="form-col-container">
          <div>
            <span class="title-text">{{ $t('view.stock.product.stockNumberNew') }}</span>
            <input
              class="form-control bg-input"
              type="text"
              v-model.trim="form.stockNumber"
              :placeholder="$t('view.stock.moveLocation.placeholder.newStockNumber')"
            />
          </div>

          <div>
            <span class="title-text">{{ $t('view.stock.product.stockNumberOld') }}</span>
            <input
              class="form-control bg-input"
              type="text"
              v-model.trim="form.stockNumberOrigin"
              :placeholder="$t('view.stock.moveLocation.placeholder.oldStockNumber')"
            />
          </div>

          <div>
            <span class="title-text">{{ $t('view.stock.product.productNumber') }}</span>
            <input
              class="form-control bg-input"
              type="text"
              v-model.trim="form.productNumber"
              :placeholder="$t('view.stock.moveLocation.placeholder.productNumber')"
            />
          </div>

          <div>
            <span class="title-text">{{ $t('view.stock.product.locationHeader') }}</span>
            <DropdownGeneric
              :modelValue="form.location"
              :options="locationOptions"
              optionLabel="label"
              optionValue="value"
              :placeholder="$t('common.label.all')"
              :showClear="true"
              @update:modelValue="form.location = $event"
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
                  class="form-control bg-input"
                  type="text"
                  v-model.trim="form.mold"
                  :placeholder="$t('view.stock.moveLocation.placeholder.mold')"
                />
              </div>

              <!-- productNameEn -->
              <div>
                <span class="title-text">{{ $t('view.stock.product.productNameEn') }}</span>
                <input
                  class="form-control bg-input"
                  type="text"
                  v-model.trim="form.productNameEn"
                  :placeholder="$t('view.stock.moveLocation.placeholder.productNameEn')"
                />
              </div>

              <!-- productNameTh -->
              <div>
                <span class="title-text">{{ $t('view.stock.product.productNameTh') }}</span>
                <input
                  class="form-control bg-input"
                  type="text"
                  v-model.trim="form.productNameTh"
                  :placeholder="$t('view.stock.moveLocation.placeholder.productNameTh')"
                />
              </div>

              <!-- woText -->
              <div>
                <span class="title-text">{{ $t('view.stock.product.wo') }}</span>
                <input
                  class="form-control bg-input"
                  type="text"
                  v-model.trim="form.woText"
                  :placeholder="$t('view.stock.moveLocation.placeholder.wo')"
                />
              </div>

              <!-- size -->
              <div>
                <span class="title-text">{{ $t('view.stock.product.size') }}</span>
                <input
                  class="form-control bg-input"
                  type="text"
                  v-model.trim="form.size"
                  :placeholder="$t('view.stock.moveLocation.placeholder.size')"
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
          </template>
        </dialogView>

        <div class="btn-submit-container-between">
          <div class="d-flex align-items-center">
            <button
              class="btn btn-sm btn-main"
              type="button"
              :disabled="selectedCount === 0"
              @click="onMove"
              :title="$t('view.stock.moveLocation.moveBtn')"
            >
              <i class="bi bi-arrow-left-right"></i> {{ $t('view.stock.moveLocation.moveBtn') }}
            </button>
            <span v-if="selectedCount > 0" class="ml-2 selected-count">
              {{ $t('view.stock.moveLocation.selectedCount', { count: selectedCount }) }}
            </span>
          </div>
          <div>
            <button class="btn btn-sm btn-outline-main mr-2" type="button" @click="$emit('manual')" :title="$t('view.stock.moveLocation.manualBtnTitle')">
              <i class="bi bi-journal-text"></i> {{ $t('view.stock.moveLocation.manualBtn') }}
            </button>
            <button class="btn btn-sm btn-green" type="submit" :title="$t('common.btn.search')">
              <i class="bi bi-search"></i>
            </button>
            <button
              class="btn btn-sm btn-sub-main ml-2"
              type="button"
              :title="$t('common.btn.advancedSearch')"
              @click="onShowDialog"
            >
              <i class="bi bi-zoom-in"></i>
            </button>
            <button class="btn btn-sm btn-dark ml-2" type="button" @click="onClear" :title="$t('common.btn.clear')">
              <i class="bi bi-x-circle"></i>
            </button>
            <button
              class="btn btn-sm btn-green ml-2"
              type="button"
              :disabled="!moveStore.dataSearch.total > 0"
              @click="onExport"
            >
              <i class="bi bi-filetype-csv"></i>
            </button>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import { useStockLocationApiStore } from '@/stores/modules/api/stock/stock-location-api.js'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'
import { useStockMoveLocationApiStore } from '@/stores/modules/api/stock/stock-move-location-api.js'

const pageTitle = defineAsyncComponent(() => import('@/components/custom/page-title.vue'))
const dialogView = defineAsyncComponent(() => import('@/components/prime-vue/DialogSearchView.vue'))

const interfaceForm = {
  stockNumber: null,
  productNumber: null,
  location: null,
  stockNumberOrigin: null,
  mold: null,
  productNameEn: null,
  productNameTh: null,
  woText: null,
  size: null,
  productType: [],
  gold: null,
  goldSize: null,
  hasCostDetail: null,
  pieceStatus: null
}

export default {
  name: 'MoveLocationSearchView',

  components: {
    pageTitle,
    MultiSelectGeneric,
    DropdownGeneric,
    dialogView
  },

  setup() {
    const locationStore = useStockLocationApiStore()
    const masterStore = useMasterApiStore()
    const moveStore = useStockMoveLocationApiStore()
    return { locationStore, masterStore, moveStore }
  },

  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    },
    selectedCount: {
      type: Number,
      default: 0
    }
  },

  emits: ['search', 'clear', 'move', 'manual', 'export'],

  watch: {
    modelForm: {
      handler(val) {
        this.form = { ...val }
      },
      deep: true
    }
  },

  computed: {
    locationOptions() {
      return this.locationStore.all
        .filter((item) => item.isActive)
        .map((item) => ({ value: item.code, label: `${item.code} — ${item.nameTh}` }))
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
    receiptTypeMaster() {
      return [{ value: 'production', description: this.$t('view.stock.moveLocation.productionLabel') }]
    },
    costDetailOptions() {
      return [
        { value: true, description: this.$t('view.stock.moveLocation.hasCost') },
        { value: false, description: this.$t('view.stock.moveLocation.noCost') }
      ]
    },
    pieceStatusOptions() {
      return [
        { value: 'IN_STOCK', description: this.$t('view.stock.moveLocation.inStock') },
        { value: 'RESERVED', description: this.$t('view.stock.moveLocation.reserved') },
        { value: 'SOLD', description: this.$t('view.stock.moveLocation.sold') }
      ]
    }
  },

  data() {
    return {
      form: { ...interfaceForm },
      isShow: { dialog: false }
    }
  },

  async created() {
    await this.locationStore.fetchAllForMap()
  },

  methods: {
    onSearch() {
      this.$emit('search', this.form)
    },
    onClear() {
      this.$emit('clear')
    },
    onMove() {
      this.$emit('move')
    },
    onExport() {
      this.$emit('export', this.form)
    },
    dialogSearch() {
      this.isShow.dialog = false
      this.$emit('search', this.form)
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

.selected-count {
  font-size: 0.875rem;
  color: var(--base-font-color);
  font-weight: 600;
}
</style>
