<template>
  <div class="filter-container-searchBar">
    <form @submit.prevent="onSearch">
      <div>
        <div>
          <pageTitle title="รายงานใบงานสำเร็จ (น้ำหนักทองชุบ)" :isShowBtnClose="false"> </pageTitle>
        </div>

        <div class="form-col-container">
          <div>
            <span class="title-text">วันที่สร้างใบงาน</span>
            <div class="flex-group">
              <CalendarGeneric
                class="w-100"
                v-model="form.start"
                :max-date="form.end"
                :manualInput="true"
                showIcon
                placeholder="เริ่มต้น"
                dateFormat="dd/mm/yy"
              />
              <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
              <CalendarGeneric
                class="w-100"
                v-model="form.end"
                :min-date="form.start"
                showIcon
                :manualInput="true"
                placeholder="สิ้นสุด"
                dateFormat="dd/mm/yy"
              />
            </div>
          </div>

          <div class="form-col-container">
            <!-- text -->
            <div>
              <span class="title-text">W.O.</span>
              <div class="input-group input-group-inner">
                <input
                  ref="inputText"
                  id="inputText"
                  :class="['form-control bg-input']"
                  type="text"
                  v-model.trim="form.text"
                  placeholder="EX: 202502211"
                />
                <div class="input-group-append" @click="focusInputText">
                  <span class="input-group-text">
                    <i class="bi bi-upc-scan text-main-color"></i>
                  </span>
                </div>
              </div>
            </div>

            <div></div>
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
                <span class="title-text">วันที่สถานะใบงาน</span>
                <div class="flex-group">
                  <CalendarGeneric
                    class="w-100"
                    v-model="form.sendStart"
                    :max-date="form.sendEnd"
                    showIcon
                    :manualInput="true"
                    placeholder="เริ่มต้น"
                    dateFormat="dd/mm/yy"
                  />
                  <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
                  <CalendarGeneric
                    class="w-100"
                    v-model="form.sendEnd"
                    :min-date="form.sendStart"
                    showIcon
                    :manualInput="true"
                    placeholder="สิ้นสุด"
                    dateFormat="dd/mm/yy"
                  />
                </div>
              </div>

              <div class="form-col-container">
                <!-- modld -->
                <div>
                  <span class="title-text">เเม่พิมพ์</span>
                  <input :class="['form-control bg-input']" type="text" v-model.trim="form.mold" />
                </div>

                <!-- plan target -->
                <div>
                  <span class="title-text">กำหนดส่งงาน</span>
                  <DropdownGeneric
                    v-model="form.isOverPlan"
                    :options="overPlanOptions"
                    optionLabel="description"
                  />
                </div>
              </div>
            </div>

            <div class="form-col-container mt-2">
              <!-- customer code -->
              <div>
                <span class="title-text">รหัสลูกค้า</span>
                <input
                  :class="['form-control bg-input']"
                  type="text"
                  v-model.trim="form.customerCode"
                />
              </div>

              <!-- customer type -->
              <div>
                <span class="title-text">ประเภทลูกค้า</span>
                <div>
                  <MultiSelectGeneric
                    v-model="form.customerType"
                    :options="customerType"
                    optionLabel="nameTh"
                    optionValue="code"
                  />
                </div>
              </div>

              <!-- product type -->
              <div>
                <span class="title-text">ประเภทสินค้า</span>
                <div>
                  <MultiSelectGeneric
                    v-model="form.productType"
                    :options="productType"
                    optionLabel="nameTh"
                    optionValue="code"
                  />
                </div>
              </div>

              <!-- product number -->
              <div>
                <span class="title-text">รหัสสินค้า</span>
                <input
                  :class="['form-control bg-input']"
                  type="text"
                  v-model.trim="form.productNumber"
                />
              </div>

              <!-- gold -->
              <div>
                <span class="title-text">สีของทอง/เงิน</span>
                <div>
                  <MultiSelectGeneric
                    v-model="form.gold"
                    :options="gold"
                    optionLabel="nameTh"
                    optionValue="nameEn"
                  />
                </div>
              </div>

              <!-- gold size -->
              <div>
                <span class="title-text">ประเภททอง/เงิน</span>
                <div>
                  <MultiSelectGeneric
                    v-model="form.goldSize"
                    :options="goldSize"
                    optionLabel="nameTh"
                    optionValue="nameEn"
                  />
                </div>
              </div>
            </div>
          </template>
        </dialogView>

        <div class="btn-submit-container-between">
          <div></div>
          <div>
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
            <button class="btn btn-sm btn-outline-main mr-2" type="button" @click="onClear" title="ล้าง">
              <span><i class="bi bi-x-circle"></i></span>
            </button>
            <button
              class="btn btn-sm btn-main"
              type="button"
              :disabled="!planCompletedStore.dataPlanCompleted.total > 0"
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

import { mapState } from 'pinia'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'
import { usePlanSearchApiStore } from '@/stores/modules/api/plan-search-store.js'

import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'
import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'

const pageTitle = defineAsyncComponent(() => import('@/components/custom/page-title.vue'))
const dialogView = defineAsyncComponent(() => import('@/components/prime-vue/DialogSearchView.vue'))

const interfaceIsShow = {
  dialog: false
}

export default {
  components: {
    pageTitle,
    MultiSelectGeneric,
    CalendarGeneric,
    DropdownGeneric,
    dialogView
  },

  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    },
    masterPlanStatus: {
      type: Array,
      default: () => []
    }
  },

  setup() {
    const planCompletedStore = usePlanSearchApiStore()
    return { planCompletedStore }
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
    ...mapState(useMasterApiStore, [
      'planStatus',
      'gold',
      'goldSize',
      'customerType',
      'productType',
      'overPlanOptions'
    ])
  },

  data() {
    return {
      form: { ...this.modelForm },
      isShow: { ...interfaceIsShow }
    }
  },

  methods: {
    focusInputText() {
      this.$refs.inputText.focus()
    },
    onSearch() {
      this.$emit('search', this.form)
    },
    onExport() {
      this.$emit('export', this.form)
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
