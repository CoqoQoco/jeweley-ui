<template>
  <div class="filter-container-searchBar">
    <form @submit.prevent="onSearch">
      <div>
        <div>
          <pageTitle :title="$t('view.production.planTracking.searchTitle')" :isShowBtnClose="false"> </pageTitle>
        </div>

        <div class="form-col-container">
          <div>
            <span class="title-text">{{ $t('view.production.planTracking.createDate') }}</span>
            <div class="flex-group">
              <CalendarGeneric
                class="w-100"
                v-model="form.start"
                :max-date="form.end"
                :manualInput="true"
                showIcon
                :placeholder="$t('common.label.start')"
                dateFormat="dd/mm/yy"
              />
              <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
              <CalendarGeneric
                class="w-100"
                v-model="form.end"
                :min-date="form.start"
                showIcon
                :manualInput="true"
                :placeholder="$t('common.label.end')"
                dateFormat="dd/mm/yy"
              />
            </div>
          </div>

          <div class="form-col-container">
            <!-- text -->
            <div>
              <span class="title-text">{{ $t('view.production.planTracking.workOrder') }}</span>
              <InputTextGeneric
                ref="inputText"
                v-model="form.text"
                placeholder="EX: 202502211"
                icon="bi-upc-scan"
              />
            </div>

            <!-- status -->
            <div>
              <span class="title-text">{{ $t('view.production.planTracking.planStatus') }}</span>
              <div>
                <MultiSelectGeneric
                  v-model="form.status"
                  :options="planStatus"
                  optionLabel="nameTh"
                  optionValue="id"
                  :placeholder="$t('common.label.all')"
                />
              </div>
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
              <div>
                <span class="title-text">{{ $t('view.production.planTracking.statusDate') }}</span>
                <div class="flex-group">
                  <CalendarGeneric
                    class="w-100"
                    v-model="form.sendStart"
                    :max-date="form.sendEnd"
                    showIcon
                    :manualInput="true"
                    :placeholder="$t('common.label.start')"
                    dateFormat="dd/mm/yy"
                  />
                  <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
                  <CalendarGeneric
                    class="w-100"
                    v-model="form.sendEnd"
                    :min-date="form.sendStart"
                    showIcon
                    :manualInput="true"
                    :placeholder="$t('common.label.end')"
                    dateFormat="dd/mm/yy"
                  />
                </div>
              </div>

              <div class="form-col-container">
                <!-- mold -->
                <div>
                  <span class="title-text">{{ $t('view.production.planTracking.mold') }}</span>
                  <InputTextGeneric v-model="form.mold" />
                </div>

                <!-- plan target -->
                <div>
                  <span class="title-text">{{ $t('view.production.planTracking.planTarget') }}</span>
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
                <span class="title-text">{{ $t('view.production.planTracking.customerCode') }}</span>
                <InputTextGeneric v-model="form.customerCode" />
              </div>

              <!-- customer type -->
              <div>
                <span class="title-text">{{ $t('view.production.planTracking.customerType') }}</span>
                <div>
                  <MultiSelectGeneric
                    v-model="form.customerType"
                    :options="customerType"
                    optionLabel="nameTh"
                    optionValue="code"
                    :placeholder="$t('common.label.all')"
                  />
                </div>
              </div>

              <!-- product type -->
              <div>
                <span class="title-text">{{ $t('view.production.planTracking.productType') }}</span>
                <div>
                  <MultiSelectGeneric
                    v-model="form.productType"
                    :options="productType"
                    optionLabel="nameTh"
                    optionValue="code"
                    :placeholder="$t('common.label.all')"
                  />
                </div>
              </div>

              <!-- product number -->
              <div>
                <span class="title-text">{{ $t('view.production.planTracking.productCode') }}</span>
                <InputTextGeneric v-model="form.productNumber" />
              </div>

              <!-- gold -->
              <div>
                <span class="title-text">{{ $t('view.production.planTracking.goldColor') }}</span>
                <div>
                  <MultiSelectGeneric
                    v-model="form.gold"
                    :options="gold"
                    optionLabel="nameTh"
                    optionValue="nameEn"
                    :placeholder="$t('common.label.all')"
                  />
                </div>
              </div>

              <!-- gold size -->
              <div>
                <span class="title-text">{{ $t('view.production.planTracking.goldType') }}</span>
                <div>
                  <MultiSelectGeneric
                    v-model="form.goldSize"
                    :options="goldSize"
                    optionLabel="nameTh"
                    optionValue="nameEn"
                    :placeholder="$t('common.label.all')"
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
              :title="$t('view.production.planTracking.more')"
              @click="onShowDialog"
            >
              <span><i class="bi bi-zoom-in"></i></span>
            </button>
            <button class="btn btn-sm btn-dark mr-2" type="button" @click="onClear" :title="$t('common.btn.clear')">
              <span><i class="bi bi-x-circle"></i></span>
            </button>
            <button
              :class="[
                'btn btn-sm btn-green',
                { 'disabled': !planSearchStore.dataPlanSearch.total > 0 }
              ]"
              type="button"
              :disabled="!planSearchStore.dataPlanSearch.total > 0"
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

// External
import { mapState } from 'pinia'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'
import { usePlanSearchApiStore } from '@/stores/modules/api/plan-search-store.js'

// Local
import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'
import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
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
    DropdownGeneric,
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
    const planSearchStore = usePlanSearchApiStore()
    return { planSearchStore }
  },

  methods: {
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
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
