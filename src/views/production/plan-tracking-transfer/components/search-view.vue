<template>
  <div class="filter-container-searchBar">
    <form @submit.prevent="onSearch">
      <div>
        <div>
          <pageTitle :title="$t('production.planTrackingTransfer.searchTitle')" :isShowBtnClose="false">
          </pageTitle>
        </div>

        <div class="form-col-container">
          <!-- date -->
          <div>
            <span class="title-text">{{ $t('production.planTrackingTransfer.transferDate') }}</span>
            <div class="flex-group">
              <CalendarGeneric
                v-model="form.start"
                :maxDate="form.end"
                :manualInput="false"
                :placeholder="$t('common.label.start')"
              />
              <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
              <CalendarGeneric
                v-model="form.end"
                :minDate="form.start"
                :manualInput="false"
                :placeholder="$t('common.label.end')"
              />
            </div>
          </div>

          <div class="form-col-container">
            <div>
              <span class="title-text">{{ $t('production.planTrackingTransfer.deptTransfer') }}</span>
              <div>
                <div class="flex-group">
                  <DropdownGeneric
                    :modelValue="form.statusFormer"
                    :options="planStatus"
                    optionLabel="nameTh"
                    optionValue="id"
                    @update:modelValue="form.statusFormer = $event"
                  />
                  <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
                  <DropdownGeneric
                    :modelValue="form.statusTarget"
                    :options="planStatus"
                    optionLabel="nameTh"
                    optionValue="id"
                    @update:modelValue="form.statusTarget = $event"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <dialogView
          :isShow="isShow.dialog"
          @closeDialog="closeDialog"
          @search="dialogSearch"
          :txtHeader="$t('common.btn.advancedSearch')"
        >
          <template #content>
            <div class="form-col-container">
              <!-- wo text -->
              <div>
                <span class="title-text">{{ $t('production.planTrackingTransfer.workOrder') }}</span>
                <div class="input-group input-group-inner">
                  <input
                    ref="inputText"
                    id="inputText"
                    :class="['form-control bg-input']"
                    type="text"
                    v-model.trim="form.woText"
                    :placeholder="$t('common.label.searchPlaceholder')"
                  />
                  <div class="input-group-append" @click="focusInputText">
                    <span class="input-group-text">
                      <i class="bi bi-upc-scan text-main-color"></i>
                    </span>
                  </div>
                </div>
              </div>

              <!-- mold -->
              <div>
                <span class="title-text">{{ $t('production.planTrackingTransfer.colMold') }}</span>
                <input :class="['form-control bg-input']" type="text" v-model.trim="form.mold" />
              </div>

              <!-- product type -->
              <div>
                <span class="title-text">{{ $t('production.planTrackingTransfer.colProductType') }}</span>
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
                <span class="title-text">{{ $t('production.planTrackingTransfer.colProductCode') }}</span>
                <input
                  :class="['form-control bg-input']"
                  type="text"
                  v-model.trim="form.productNumber"
                />
              </div>

              <!-- gold -->
              <div>
                <span class="title-text">{{ $t('production.planTrackingTransfer.goldColor') }}</span>
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
                <span class="title-text">{{ $t('production.planTrackingTransfer.goldType') }}</span>
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
              :title="$t('common.btn.advancedSearch')"
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
              :disabled="!planSearchStore.dataTransferTotalRecord > 0"
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
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'

import { mapState } from 'pinia'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'
import { usePlanUpdateApiStore } from '@/stores/modules/api/plan-update-store.js'

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

  setup() {
    const planSearchStore = usePlanUpdateApiStore()
    return { planSearchStore }
  },

  methods: {
    focusInputText() {
      this.$refs.inputText.focus()
    },
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
    onClear() {
      this.$emit('clear')
    },
    onShowDialog() {
      this.isShow.dialog = true
    },
    closeDialog() {
      this.isShow.dialog = false
    }
  },
  created() {
    this.$nextTick(() => {})
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
