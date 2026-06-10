<template>
  <div class="filter-container-searchBar">
    <form @submit.prevent="onSearch">
      <div>
        <pageTitle title="จัดเก็บสินค้า" :isShowBtnClose="false" />

        <div class="form-col-container">
          <div>
            <span class="title-text">เลขที่ผลิต (ใหม่)</span>
            <input
              class="form-control bg-input"
              type="text"
              v-model.trim="form.stockNumber"
              placeholder="เช่น STK-2024-001"
            />
          </div>

          <div>
            <span class="title-text">เลขที่ผลิต (เก่า)</span>
            <input
              class="form-control bg-input"
              type="text"
              v-model.trim="form.stockNumberOrigin"
              placeholder="EX: A0211XX"
            />
          </div>

          <div>
            <span class="title-text">รหัสสินค้า</span>
            <input
              class="form-control bg-input"
              type="text"
              v-model.trim="form.productNumber"
              placeholder="เช่น DK-B-001"
            />
          </div>

          <div>
            <span class="title-text">จัดเก็บปัจจุบัน</span>
            <DropdownGeneric
              :modelValue="form.location"
              :options="locationOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="ทั้งหมด"
              :showClear="true"
              @update:modelValue="form.location = $event"
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
              <!-- receipt type -->
              <div>
                <span class="title-text">ประเภทงานรับ</span>
                <div>
                  <MultiSelect
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
                <span class="title-text">เเม่พิมพ์</span>
                <input
                  class="form-control bg-input"
                  type="text"
                  v-model.trim="form.mold"
                  placeholder="EX: CN-2400XX"
                />
              </div>

              <!-- productNameEn -->
              <div>
                <span class="title-text">ชื่อสินค้า EN</span>
                <input
                  class="form-control bg-input"
                  type="text"
                  v-model.trim="form.productNameEn"
                  placeholder="EX: Gold Ring #66"
                />
              </div>

              <!-- productNameTh -->
              <div>
                <span class="title-text">ชื่อสินค้า TH</span>
                <input
                  class="form-control bg-input"
                  type="text"
                  v-model.trim="form.productNameTh"
                  placeholder="EX: แหวนทอง ขนาด #66"
                />
              </div>

              <!-- woText -->
              <div>
                <span class="title-text">W.O.</span>
                <input
                  class="form-control bg-input"
                  type="text"
                  v-model.trim="form.woText"
                  placeholder="EX: 6802017XX"
                />
              </div>

              <!-- size -->
              <div>
                <span class="title-text">ขนาด</span>
                <input
                  class="form-control bg-input"
                  type="text"
                  v-model.trim="form.size"
                  placeholder="EX: #66"
                />
              </div>

              <!-- product type -->
              <div>
                <span class="title-text">ประเภทสินค้า</span>
                <div>
                  <MultiSelect
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
                <span class="title-text">สีของทอง/เงิน</span>
                <div>
                  <MultiSelect
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
                <span class="title-text">ประเภททอง/เงิน</span>
                <div>
                  <MultiSelect
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
                <span class="title-text">สถานะต้นทุน</span>
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
                <span class="title-text">สถานะคงคลัง</span>
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
          <div class="d-flex align-items-center">
            <button
              class="btn btn-sm btn-main"
              type="button"
              :disabled="selectedCount === 0"
              @click="onMove"
              title="ย้าย Storage Location"
            >
              <i class="bi bi-arrow-left-right"></i> ย้าย Storage Location
            </button>
            <span v-if="selectedCount > 0" class="ml-2 selected-count">
              เลือกแล้ว {{ selectedCount }} รายการ
            </span>
          </div>
          <div>
            <button class="btn btn-sm btn-outline-main mr-2" type="button" @click="$emit('manual')" title="คู่มือการใช้งาน">
              <i class="bi bi-journal-text"></i> คู่มือ
            </button>
            <button class="btn btn-sm btn-green" type="submit" title="ค้นหา">
              <i class="bi bi-search"></i>
            </button>
            <button
              class="btn btn-sm btn-sub-main ml-2"
              type="button"
              title="เพิ่มเติม"
              @click="onShowDialog"
            >
              <i class="bi bi-zoom-in"></i>
            </button>
            <button class="btn btn-sm btn-dark ml-2" type="button" @click="onClear" title="ล้าง">
              <i class="bi bi-x-circle"></i>
            </button>
            <button
              :class="[
                'btn btn-sm btn-primary ml-2',
                { 'btn-secondary': !moveStore.dataSearch.total > 0 }
              ]"
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
import MultiSelect from 'primevue/multiselect'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import { useStockLocationApiStore } from '@/stores/modules/api/stock/stock-location-api.js'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'
import { useStockMoveLocationApiStore } from '@/stores/modules/api/stock/stock-move-location-api.js'

const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))
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
    MultiSelect,
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
    }
  },

  data() {
    return {
      form: { ...interfaceForm },
      isShow: { dialog: false },
      receiptTypeMaster: [
        { value: 'production', description: 'Production' }
      ],
      costDetailOptions: [
        { value: true, description: 'มีต้นทุน' },
        { value: false, description: 'ยังไม่มีต้นทุน' }
      ],
      pieceStatusOptions: [
        { value: 'IN_STOCK', description: 'พร้อมขาย' },
        { value: 'RESERVED', description: 'จองแล้ว' },
        { value: 'SOLD', description: 'ขายไปแล้ว' }
      ]
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
