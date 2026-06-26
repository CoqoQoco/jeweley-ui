<template>
  <div class="filter-container-searchBar">
    <form @submit.prevent="onSearch">
      <div>
        <div>
          <pageTitle
            :title="$t('view.production.planTrackingWorker.searchTitle')"
            :isShowBtnClose="false"
          >
          </pageTitle>
        </div>

        <div class="form-col-container">
          <!-- receive work date -->
          <div>
            <span class="title-text">{{ $t('view.production.planTrackingWorker.createDate') }}</span>
            <div class="flex-group">
              <CalendarGeneric
                class="w-100"
                v-model="form.start"
                :max-date="form.end"
                dateFormat="dd/mm/yy"
                showIcon
                :placeholder="$t('common.label.start')"
              />
              <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
              <CalendarGeneric
                class="w-100"
                v-model="form.end"
                :min-date="form.start"
                dateFormat="dd/mm/yy"
                showIcon
                :placeholder="$t('common.label.end')"
              />
            </div>
          </div>

          <div class="form-col-container">
            <div>
              <span class="title-text">{{ $t('common.btn.search') }}</span>
              <InputTextGeneric
                ref="inputText"
                v-model="form.text"
                :placeholder="$t('common.btn.search')"
                icon="bi-upc-scan"
              />
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
              <!-- status -->
              <div>
                <span class="title-text">{{ $t('view.production.planTrackingWorker.planStatus') }}</span>
                <div>
                  <MultiSelectGeneric
                    v-model="form.status"
                    :options="masterApiStore.planStatus"
                    optionLabel="nameTh"
                    optionValue="id"
                    :placeholder="$t('common.label.all')"
                  />
                </div>
              </div>

              <!-- gold -->
              <div>
                <span class="title-text">{{ $t('common.field.type') }}</span>
                <MultiSelectGeneric
                  v-model="form.gold"
                  :options="masterApiStore.gold"
                  optionLabel="description"
                  optionValue="code"
                  :placeholder="$t('common.label.all')"
                />
              </div>

              <!-- wo -->
              <div>
                <span class="title-text">{{ $t('view.production.planTrackingWorker.workOrder') }}</span>
                <InputTextGeneric v-model="form.wo" />
              </div>

              <!-- product no  -->
              <div>
                <span class="title-text">{{ $t('common.field.code') }}</span>
                <InputTextGeneric v-model="form.productNo" />
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
              title="เพิ่มเติม"
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
                { 'disabled': !planWorkerStore.dataSearcTotalRecord > 0 }
              ]"
              type="button"
              :disabled="!planWorkerStore.dataSearcTotalRecord > 0"
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
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'
import { usePlanWorkerApiStore } from '@/stores/modules/api/worker/plan-worker-store.js'

// Local
import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'
import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'
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
    InputTextGeneric,
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
    const planWorkerStore = usePlanWorkerApiStore()
    return { planWorkerStore, masterApiStore }
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
