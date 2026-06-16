<template>
  <div class="filter-container-searchBar">
    <form @submit.prevent="onSearch">
      <div>
        <pageTitle
          :title="`${$t('view.worker.workerDailyWages.searchTitle')} : ${worker.code ?? ''} - ${worker.nameTh ?? ''}`"
          :isShowBtnClose="false"
        />

        <div class="form-col-container">
          <div>
            <span class="title-text">{{ $t('view.worker.workerDailyWages.fieldDateRange') }}</span>
            <div class="flex-group">
              <CalendarGeneric
                class="w-100"
                :modelValue="modelForm.requestDateStart"
                :max-date="modelForm.requestDateEnd"
                :manualInput="false"
                :showIcon="true"
                dateFormat="dd/mm/yy"
                :placeholder="$t('common.label.start')"
                @update:modelValue="update('requestDateStart', $event)"
              />
              <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
              <CalendarGeneric
                class="w-100"
                :modelValue="modelForm.requestDateEnd"
                :min-date="modelForm.requestDateStart"
                :manualInput="false"
                :showIcon="true"
                dateFormat="dd/mm/yy"
                :placeholder="$t('common.label.end')"
                @update:modelValue="update('requestDateEnd', $event)"
              />
            </div>
          </div>

          <div>
            <span class="title-text">{{ $t('view.worker.workerDailyWages.fieldWageType') }}</span>
            <DropdownGeneric
              :modelValue="modelForm.wageTypeFilter"
              :options="wageTypeOptions"
              optionLabel="label"
              optionValue="value"
              :showClear="false"
              @update:modelValue="update('wageTypeFilter', $event)"
            />
          </div>
        </div>

        <div class="btn-submit-container-between">
          <div>
            <button class="btn btn-sm btn-sub-main" type="button" @click="$emit('print-success')" :title="$t('view.worker.workerDailyWages.btnPrintSuccess')">
              <i class="bi bi-printer"></i>
              <span class="ml-1">{{ $t('view.worker.workerDailyWages.btnPrintSuccess') }}</span>
            </button>
            <button
              v-if="modelForm.wageTypeFilter !== 'goldLoss'"
              class="btn btn-sm btn-sub-main ml-2"
              type="button"
              @click="$emit('print-tracking')"
              :title="$t('view.worker.workerDailyWages.btnPrintTracking')"
            >
              <i class="bi bi-printer"></i>
              <span class="ml-1">{{ $t('view.worker.workerDailyWages.btnPrintTracking') }}</span>
            </button>
            <router-link
              v-if="modelForm.wageTypeFilter === 'goldLoss'"
              :to="{ name: 'worker-gold-loss-slip-list', params: { workerCode: worker && worker.code ? worker.code : '' } }"
              class="btn btn-sm btn-sub-main ml-2"
              :title="$t('view.worker.workerDailyWages.btnSlipHistory')"
            >
              <i class="bi bi-list-ul"></i> {{ $t('view.worker.workerDailyWages.btnSlipHistory') }}
            </router-link>
          </div>
          <div>
            <button class="btn btn-sm btn-main" type="submit" :title="$t('common.btn.search')">
              <i class="bi bi-search"></i>
            </button>
            <button class="btn btn-sm btn-dark ml-2" type="button" @click="$emit('clear')" :title="$t('common.btn.clear')">
              <i class="bi bi-x-circle"></i>
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
const CalendarGeneric = defineAsyncComponent(() => import('@/components/prime-vue/CalendarGeneric.vue'))
const DropdownGeneric = defineAsyncComponent(() => import('@/components/prime-vue/DropdownGeneric.vue'))

export default {
  name: 'WorkerDailyWagesSearchView',

  components: {
    pageTitle,
    CalendarGeneric,
    DropdownGeneric
  },

  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    },
    worker: {
      type: Object,
      default: () => ({})
    }
  },

  emits: ['update:modelForm', 'search', 'clear', 'print-success', 'print-tracking'],

  computed: {
    wageTypeOptions() {
      return [
        { label: this.$t('view.worker.workerDailyWages.wageTypeWages'), value: 'wages' },
        { label: this.$t('view.worker.workerDailyWages.wageTypeGoldLoss'), value: 'goldLoss' }
      ]
    }
  },

  methods: {
    update(field, value) {
      this.$emit('update:modelForm', { ...this.modelForm, [field]: value })
    },
    onSearch() {
      this.$emit('search')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
