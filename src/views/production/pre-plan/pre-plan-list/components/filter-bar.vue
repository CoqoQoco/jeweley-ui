<template>
  <div class="filter-container-searchBar">
    <form @submit.prevent="$emit('search')">
      <div>
        <pageTitle :title="$t('view.production.prePlan.searchTitle')" :isShowBtnClose="false" />

        <div class="form-col-container">
          <div>
            <span class="title-text">{{ $t('view.production.prePlan.moldCode') }}</span>
            <InputTextGeneric
              :modelValue="modelForm.moldCode"
              :placeholder="$t('view.production.prePlan.placeholder.moldCode')"
              @update:modelValue="update('moldCode', $event)"
            />
          </div>

          <div>
            <span class="title-text">{{ $t('common.field.status') }}</span>
            <MultiSelectGeneric
              :modelValue="modelForm.status"
              :options="masterStore.statuses"
              optionLabel="description"
              optionValue="code"
              :placeholder="$t('common.label.all')"
              :showClear="true"
              @update:modelValue="update('status', $event)"
            />
          </div>

          <div>
            <span class="title-text">{{ $t('view.production.prePlan.orderDate') }}</span>
            <div class="flex-group">
              <CalendarGeneric
                class="w-100"
                :modelValue="modelForm.orderDateFrom"
                dateFormat="dd/mm/yy"
                :showIcon="true"
                :manualInput="true"
                :placeholder="$t('view.production.prePlan.placeholder.startDate')"
                @update:modelValue="update('orderDateFrom', $event)"
              />
              <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
              <CalendarGeneric
                class="w-100"
                :modelValue="modelForm.orderDateTo"
                dateFormat="dd/mm/yy"
                :showIcon="true"
                :manualInput="true"
                :placeholder="$t('view.production.prePlan.placeholder.endDate')"
                @update:modelValue="update('orderDateTo', $event)"
              />
            </div>
          </div>
        </div>

        <div class="btn-submit-container-between">
          <div class="d-flex align-items-center">
            <CheckboxGeneric
              :modelValue="modelForm.includeCompleted"
              :label="$t('view.production.prePlan.showCompleted')"
              @update:modelValue="update('includeCompleted', $event)"
            />
          </div>
          <div>
            <button class="btn btn-sm btn-main" type="submit" :title="$t('common.btn.search')">
              <i class="bi bi-search"></i>
            </button>
            <button class="btn btn-sm btn-dark ml-2" type="button" @click="$emit('clear')" :title="$t('common.btn.clear')">
              <i class="bi bi-x-circle"></i>
            </button>
            <button
              :class="['btn btn-sm ml-2', canExport ? 'btn-green' : 'btn-secondary']"
              type="button"
              title="Export CSV"
              :disabled="!canExport"
              @click="$emit('export')"
            >
              <i class="bi bi-filetype-csv"></i>
            </button>
            <button
              class="btn btn-sm btn-main ml-2"
              type="button"
              :title="$t('view.production.prePlan.btnCreate')"
              @click="$router.push({ name: 'pre-plan-create' })"
            >
              <i class="bi bi-plus"></i>
            </button>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'
import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'
import CheckboxGeneric from '@/components/prime-vue/CheckboxGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import { useMasterPrePlanStore } from '@/stores/modules/api/master/master-pre-plan-store.js'

const pageTitle = defineAsyncComponent(() => import('@/components/custom/page-title.vue'))

export default {
  name: 'FilterBar',
  components: { pageTitle, CalendarGeneric, MultiSelectGeneric, CheckboxGeneric, InputTextGeneric },
  props: {
    modelForm: {
      type: Object,
      default: () => ({}),
    },
    canExport: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelForm', 'search', 'clear', 'export'],
  setup() {
    const masterStore = useMasterPrePlanStore()
    return { masterStore }
  },
  async created() {
    if (!this.masterStore.statuses.length) {
      await this.masterStore.fetchStatuses()
    }
  },
  methods: {
    update(field, value) {
      this.$emit('update:modelForm', { ...this.modelForm, [field]: value })
    },
  },
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
