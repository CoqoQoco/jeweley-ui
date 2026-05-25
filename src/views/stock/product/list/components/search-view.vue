<template>
  <div class="filter-container-searchBar">
    <form @submit.prevent="onSearch">
      <div>
        <div>
          <pageTitle
            title="ตรวจคลัง"
            description="ตรวจสอบคลังสินค้า พิมพ์ป้าย หรือเเก้ไขข้อมูลสินค้า"
            :isShowBtnClose="false"
          >
          </pageTitle>
        </div>

        <div class="form-col-container">
            <!-- stock number -->
            <div>
              <span class="title-text">เลขที่ผลิต (ใหม่)</span>
              <input
                :class="['form-control bg-input']"
                type="text"
                v-model.trim="form.stockNumber"
                placeholder="EX: DK-2502-00X"
              />
            </div>

            <div>
              <span class="title-text">เลขที่ผลิต (เก่า)</span>
              <input
                :class="['form-control bg-input']"
                type="text"
                v-model.trim="form.stockNumberOrigin"
                placeholder="EX: A0211XX"
              />
            </div>

            <!-- product number -->
            <div>
              <span class="title-text">รหัสสินค้า</span>
              <input
                :class="['form-control bg-input']"
                type="text"
                v-model.trim="form.productNumber"
                placeholder="EX: R08X50XXXL"
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
                  :class="['form-control bg-input']"
                  type="text"
                  v-model.trim="form.mold"
                  placeholder="EX: CN-2400XX"
                />
              </div>

              <!-- productNameEn -->
              <div>
                <span class="title-text">ชื่อสินค้า EN</span>
                <input
                  :class="['form-control bg-input']"
                  type="text"
                  v-model.trim="form.productNameEn"
                  placeholder="EX: Gold Ring #66"
                />
              </div>

              <!-- productNameTh -->
              <div>
                <span class="title-text">ชื่อสินค้า TH</span>
                <input
                  :class="['form-control bg-input']"
                  type="text"
                  v-model.trim="form.productNameTh"
                  placeholder="EX: แหวนทอง ขนาด #66"
                />
              </div>

              <!-- woText -->
              <div>
                <span class="title-text">W.O.</span>
                <input
                  :class="['form-control bg-input']"
                  type="text"
                  v-model.trim="form.woText"
                  placeholder="EX: 6802017XX"
                />
              </div>

              <!-- size -->
              <div>
                <span class="title-text">ขนาด</span>
                <input
                  :class="['form-control bg-input']"
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
          <div></div>
          <div>
            <button class="btn btn-sm btn-main" type="submit" title="ค้นหา">
              <span><i class="bi bi-search"></i></span>
            </button>
            <button
              class="btn btn-sm btn-sub-main ml-2"
              type="button"
              title="เพิ่มเติม"
              @click="onShowDialog"
            >
              <span><i class="bi bi-zoom-in"></i></span>
            </button>
            <button class="btn btn-sm btn-dark ml-2" type="button" @click="onClear" title="ล้าง">
              <span><i class="bi bi-x-circle"></i></span>
            </button>

            <button
              :class="[
                'btn btn-sm btn-primary ml-2',
                { 'btn-secondary': !productStore.dataSearch.total > 0 }
              ]"
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
const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))
const dialogView = defineAsyncComponent(() => import('@/components/prime-vue/DialogSearchView.vue'))

import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'

import MultiSelect from 'primevue/multiselect'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'

const interfaceIsShow = {
  dialog: false
}
export default {
  components: {
    pageTitle,
    MultiSelect,
    DropdownGeneric,
    dialogView
  },

  setup() {
    const productStore = usrStockProductApiStore()
    const masterStore = useMasterApiStore()
    return { productStore, masterStore }
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
      isLoading: false,
      form: { ...this.modelForm },
      isShow: { ...interfaceIsShow },
      receiptTypeMaster: [
        { value: 'production', description: 'Production' }
        // { value: 2, description: 'งานรับสินค้าและส่งสินค้า' }
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
      //await this.masterStore.fetchProductType()
    })
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
