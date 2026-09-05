<template>
  <SearchBarGeneric
    :title="$t('view.production.dashboard.filterTitle')"
    :description="$t('view.production.dashboard.filterDesc')"
    @search="onSearch"
    @clear="onClear"
  >
    <template #fields>
      <div>
        <span class="title-text">{{ $t('view.production.dashboard.filterText') }}</span>
        <InputTextGeneric v-model="form.text" icon="bi-search" />
      </div>

      <div>
        <span class="title-text">{{ $t('view.production.dashboard.filterMold') }}</span>
        <InputTextGeneric v-model="form.mold" />
      </div>

      <div>
        <span class="title-text">{{ $t('view.production.dashboard.filterProductNumber') }}</span>
        <InputTextGeneric v-model="form.productNumber" />
      </div>

      <div>
        <span class="title-text">{{ $t('view.production.dashboard.filterGold') }}</span>
        <MultiSelectGeneric
          v-model="form.gold"
          :options="masterApiStore.gold"
          optionLabel="nameTh"
          optionValue="nameEn"
          :placeholder="$t('common.label.all')"
          :showClear="true"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.production.dashboard.filterGoldSize') }}</span>
        <MultiSelectGeneric
          v-model="form.goldSize"
          :options="masterApiStore.goldSize"
          optionLabel="nameTh"
          optionValue="nameEn"
          :placeholder="$t('common.label.all')"
          :showClear="true"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.production.dashboard.productType') }}</span>
        <MultiSelectGeneric
          v-model="form.productType"
          :options="masterApiStore.productType"
          optionLabel="nameTh"
          optionValue="code"
          :placeholder="$t('common.label.all')"
          :showClear="true"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.production.dashboard.customerType') }}</span>
        <MultiSelectGeneric
          v-model="form.customerType"
          :options="masterApiStore.customerType"
          optionLabel="nameTh"
          optionValue="code"
          :placeholder="$t('common.label.all')"
          :showClear="true"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.production.dashboard.filterCustomerCode') }}</span>
        <InputTextGeneric v-model="form.customerCode" />
      </div>

      <template v-if="isSummaryTab">
        <div>
          <span class="title-text">{{ $t('view.production.dashboard.filterDateRange') }}</span>
          <DateRangeGeneric
            :startDate="form.start"
            :endDate="form.end"
            :startPlaceholder="$t('view.production.dashboard.filterDateFrom')"
            :endPlaceholder="$t('view.production.dashboard.filterDateTo')"
            @update:startDate="form.start = $event"
            @update:endDate="form.end = $event"
          />
        </div>

        <div>
          <span class="title-text">{{ $t('common.field.status') }}</span>
          <MultiSelectGeneric
            v-model="form.status"
            :options="masterApiStore.planStatus"
            optionLabel="nameTh"
            optionValue="id"
            :placeholder="$t('common.label.all')"
            :showClear="true"
          />
        </div>

        <div class="filter-checkbox-field">
          <span class="title-text">&nbsp;</span>
          <div class="checkbox-row">
            <CheckboxGeneric v-model="isOverPlanChecked" :label="$t('view.production.dashboard.filterOverPlanOnly')" />
          </div>
        </div>
      </template>
    </template>

    <template #actions-right>
      <ButtonGeneric variant="main" icon="bi-search" type="submit" :label="$t('common.btn.search')" />
      <ButtonGeneric variant="dark" icon="bi-x-circle" class="ml-2" :title="$t('common.btn.clear')" @click="onClear" />
    </template>
  </SearchBarGeneric>
</template>

<script>
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'

import SearchBarGeneric from '@/components/generic/SearchBarGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'
import CheckboxGeneric from '@/components/prime-vue/CheckboxGeneric.vue'
import DateRangeGeneric from '@/components/prime-vue/DateRangeGeneric.vue'

export default {
  name: 'DashboardFilterView',

  components: {
    SearchBarGeneric,
    ButtonGeneric,
    InputTextGeneric,
    MultiSelectGeneric,
    CheckboxGeneric,
    DateRangeGeneric
  },

  setup() {
    const masterApiStore = useMasterApiStore()
    return { masterApiStore }
  },

  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    },
    activeTab: {
      type: String,
      default: 'summary'
    }
  },

  emits: ['search', 'clear'],

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
      form: { ...this.modelForm }
    }
  },

  computed: {
    isSummaryTab() {
      return this.activeTab === 'summary'
    },

    isOverPlanChecked: {
      get() {
        return this.form.isOverPlan === 1
      },
      set(val) {
        this.form.isOverPlan = val ? 1 : 0
      }
    }
  },

  methods: {
    onSearch() {
      this.$emit('search', this.form)
    },
    onClear() {
      this.$emit('clear')
    }
  },

  created() {
    if (!this.masterApiStore.gold.length) this.masterApiStore.fetchGold()
    if (!this.masterApiStore.goldSize.length) this.masterApiStore.fetchGoldSize()
    if (!this.masterApiStore.productType.length) this.masterApiStore.fetchProductType()
    if (!this.masterApiStore.customerType.length) this.masterApiStore.fetchCustomerType()
    if (!this.masterApiStore.planStatus.length) this.masterApiStore.fetchPlanStatus()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.filter-checkbox-field {
  display: flex;
  flex-direction: column;

  .checkbox-row {
    display: flex;
    align-items: center;
    height: 100%;
    padding-top: var(--sp-sm);
  }
}
</style>
