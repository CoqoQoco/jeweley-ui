<template>
  <div class="filter-container-searchBar">
    <form @submit.prevent="onSearch">
      <div>
        <div>
          <pageTitle
            :title="$t('view.production.planTrackingStatus.searchTitle')"
            description="ตรวจสอบ ติดตาม การดำเนินงาน รับ-จ่ายงาน เเต่ละเเผนก"
            :isShowBtnClose="false"
          >
          </pageTitle>
        </div>

        <div class="form-col-container">
          <!-- receive date -->
          <div>
            <span class="title-text">{{ $t('view.production.planTrackingStatus.receiveDate') }}</span>
            <div class="flex-group">
              <CalendarGeneric
                v-model="form.requestDateStart"
                :maxDate="form.requestDateEnd"
                :manualInput="false"
                :placeholder="$t('common.label.start')"
              />
              <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
              <CalendarGeneric
                v-model="form.requestDateEnd"
                :minDate="form.requestDateStart"
                :manualInput="false"
                :placeholder="$t('common.label.end')"
              />
            </div>
          </div>

          <!-- receive work date -->
          <div>
            <span class="title-text">{{ $t('view.production.planTrackingStatus.workerReceiveDate') }}</span>
            <div class="flex-group">
              <CalendarGeneric
                v-model="form.receiveWorkDateStart"
                :maxDate="form.receiveWorkDateEnd"
                :placeholder="$t('common.label.start')"
              />
              <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
              <CalendarGeneric
                v-model="form.receiveWorkDateEnd"
                :minDate="form.receiveWorkDateStart"
                :placeholder="$t('common.label.end')"
              />
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
              <!-- status -->
              <div>
                <span class="title-text">{{ $t('view.production.planTrackingStatus.planStatus') }}</span>
                <div>
                  <MultiSelectGeneric
                    v-model="form.status"
                    :options="masterApiStore.planStatus"
                    optionLabel="nameTh"
                    optionValue="id"
                    :filter="true"
                  />
                </div>
              </div>

              <!-- gold -->
              <div>
                <span class="title-text">{{ $t('view.production.planTrackingStatus.goldType') }}</span>
                <MultiSelectGeneric
                  v-model="form.gold"
                  :options="masterApiStore.gold"
                  :filter="true"
                  optionLabel="description"
                  optionValue="code"
                />
              </div>

              <!-- wo -->
              <div>
                <span class="title-text">{{ $t('view.production.planTrackingStatus.workOrder') }}</span>
                <input :class="['form-control']" type="text" v-model.trim="form.wo" />
              </div>

              <!-- product no  -->
              <div>
                <span class="title-text">{{ $t('view.production.planTrackingStatus.colProductCode') }}</span>
                <input :class="['form-control']" type="text" v-model.trim="form.productNo" />
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
              :disabled="!planStatusDetailStore.dataSearcTotalRecord > 0"
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

import { useMasterApiStore } from '@/stores/modules/api/master-store.js'
import { usePlanStatusDetailApiStore } from '@/stores/modules/api/plan/plan-status-detail-store.js'

const interfaceIsShow = {
  dialog: false
}
export default {
  components: {
    pageTitle,
    MultiSelectGeneric,
    CalendarGeneric,
    dialogView
  },
  props: {
    modelForm: {
      type: Object,
      default: () => ({})
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
    }
  },
  data() {
    return {
      form: { ...this.modelForm },
      isShow: { ...interfaceIsShow }
    }
  },

  setup() {
    const masterApiStore = useMasterApiStore()
    const planStatusDetailStore = usePlanStatusDetailApiStore()
    return { planStatusDetailStore, masterApiStore }
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
