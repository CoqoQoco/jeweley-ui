<template>
  <div class="filter-container-searchBar">
    <form @submit.prevent="onSearch">
      <div>
        <div>
          <pageTitle :title="$t('view.production.planBom.searchTitle')" :isShowBtnClose="false"> </pageTitle>
        </div>

        <div class="form-col-container">
          <div>
            <span class="title-text">{{ $t('view.production.planBom.completedDate') }}</span>
            <div class="flex-group">
              <CalendarGeneric
                class="w-100"
                v-model="form.start"
                :max-date="form.end"
                :manualInput="true"
                showIcon
                :placeholder="$t('view.production.planBom.placeholderStart')"
                dateFormat="dd/mm/yy"
              />
              <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
              <CalendarGeneric
                class="w-100"
                v-model="form.end"
                :min-date="form.start"
                showIcon
                :manualInput="true"
                :placeholder="$t('view.production.planBom.placeholderEnd')"
                dateFormat="dd/mm/yy"
              />
            </div>
          </div>

          <div class="form-col-container">
            <!-- text -->
            <div>
              <span class="title-text">W.O.</span>
              <InputTextGeneric
                ref="inputText"
                id="inputText"
                v-model="form.woText"
                :trim="true"
                placeholder="EX: 202502211"
                icon="bi-upc-scan"
              />
            </div>

            <!-- modld -->
            <div>
              <span class="title-text">{{ $t('view.production.planBom.mold') }}</span>
              <input :class="['form-control bg-input']" type="text" v-model.trim="form.mold" />
            </div>
          </div>
        </div>

        <dialogView
          :isShow="isShow.dialog"
          @closeDialog="closeDialog"
          @search="dialogSearch"
          :txtHeader="$t('view.production.planBom.advancedSearch')"
        >
          <template #content>
            <div class="form-col-container">
              <!-- customer code -->
              <div>
                <span class="title-text">{{ $t('view.production.planBom.customerCode') }}</span>
                <input
                  ref="inputText"
                  id="inputText"
                  :class="['form-control bg-input']"
                  type="text"
                  v-model.trim="form.customerCode"
                />
              </div>

              <!-- customer type -->
              <div>
                <span class="title-text">{{ $t('view.production.planBom.customerType') }}</span>
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
                <span class="title-text">{{ $t('view.production.planBom.productType') }}</span>
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
                <span class="title-text">{{ $t('view.production.planBom.productCode') }}</span>
                <input
                  ref="inputText"
                  id="inputText"
                  :class="['form-control bg-input']"
                  type="text"
                  v-model.trim="form.productNumber"
                />
              </div>

              <!-- gold -->
              <div>
                <span class="title-text">{{ $t('view.production.planBom.goldColor') }}</span>
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
                <span class="title-text">{{ $t('view.production.planBom.goldType') }}</span>
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
            <button class="btn btn-sm btn-main mr-2" type="submit" :title="$t('common.btn.search')">
              <span><i class="bi bi-search"></i></span>
            </button>
            <button
              class="btn btn-sm btn-sub-main mr-2"
              type="button"
              :title="$t('view.production.planBom.advancedSearch')"
              @click="onShowDialog"
            >
              <span><i class="bi bi-zoom-in"></i></span>
            </button>
            <button class="btn btn-sm btn-dark mr-2" type="button" @click="onClear" :title="$t('common.btn.clear')">
              <span><i class="bi bi-x-circle"></i></span>
            </button>
            <button
              class="btn btn-sm btn-green"
              type="button"
              :disabled="!planBOMApiStore.bomData.data > 0"
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

import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'
import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'

import { mapState } from 'pinia'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'
import { usePlanBOMApiStore } from '@/stores/modules/api/plan/plan-bom-store.js'

const interfaceIsShow = {
  dialog: false
}
export default {
  components: {
    pageTitle,
    MultiSelectGeneric,
    CalendarGeneric,
    InputTextGeneric,
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
      return true
    },

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

  setup() {
    const planBOMApiStore = usePlanBOMApiStore()
    return { planBOMApiStore }
  },

  methods: {
    // ---------------- event
    onSearch() {
      this.$emit('search', this.form)
    },
    onExport() {
      this.$emit('export')
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
}

</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
