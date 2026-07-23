<template>
  <SearchBarGeneric
    :title="$t('view.stock.storageMoveReport.searchTitle')"
    :description="$t('view.stock.storageMoveReport.searchDesc')"
    @search="onSearch"
    @clear="onClear"
  >
    <template #fields>
      <div>
        <span class="title-text">{{ $t('view.stock.storageMoveReport.dateRange') }}</span>
        <DateRangeGeneric
          :startDate="form.dateFrom"
          :endDate="form.dateTo"
          :startPlaceholder="$t('common.label.start')"
          :endPlaceholder="$t('common.label.end')"
          @update:startDate="form.dateFrom = $event"
          @update:endDate="form.dateTo = $event"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.stock.storageMoveReport.fromLocation') }}</span>
        <DropdownGeneric
          :modelValue="form.fromLocation"
          :options="locationOptions"
          optionLabel="label"
          optionValue="value"
          :placeholder="$t('common.label.all')"
          :showClear="true"
          @update:modelValue="form.fromLocation = $event"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.stock.storageMoveReport.toLocation') }}</span>
        <DropdownGeneric
          :modelValue="form.toLocation"
          :options="locationOptions"
          optionLabel="label"
          optionValue="value"
          :placeholder="$t('common.label.all')"
          :showClear="true"
          @update:modelValue="form.toLocation = $event"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.stock.storageMoveReport.stockNumber') }}</span>
        <InputTextGeneric
          v-model.trim="form.stockNumber"
          :placeholder="$t('view.stock.storageMoveReport.placeholder.stockNumber')"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.stock.storageMoveReport.currentLocation') }}</span>
        <DropdownGeneric
          :modelValue="form.currentLocation"
          :options="locationOptions"
          optionLabel="label"
          optionValue="value"
          :placeholder="$t('common.label.all')"
          :showClear="true"
          @update:modelValue="form.currentLocation = $event"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.stock.storageMoveReport.movedBy') }}</span>
        <InputTextGeneric v-model.trim="form.movedBy" />
      </div>

      <div>
        <span class="title-text">{{ $t('view.stock.product.stockNumberOld') }}</span>
        <InputTextGeneric v-model.trim="form.stockNumberOrigin" />
      </div>
    </template>

    <template #actions-right>
      <ButtonGeneric variant="main" icon="bi-search" type="submit" :label="$t('common.btn.search')" />
      <ButtonGeneric variant="dark" icon="bi-x-circle" class="ml-2" :title="$t('common.btn.clear')" @click="onClear" />
      <ButtonGeneric
        variant="green"
        icon="bi-filetype-csv"
        class="ml-2"
        :title="$t('common.btn.export')"
        :disabled="!moveStore.movementSearch.total"
        @click="onExport"
      />
    </template>
  </SearchBarGeneric>
</template>

<script>
import { useStockLocationApiStore } from '@/stores/modules/api/stock/stock-location-api.js'
import { useStockMoveLocationApiStore } from '@/stores/modules/api/stock/stock-move-location-api.js'

import SearchBarGeneric from '@/components/generic/SearchBarGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import DateRangeGeneric from '@/components/prime-vue/DateRangeGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'

export default {
  name: 'StorageMoveReportSearchView',

  components: {
    SearchBarGeneric,
    ButtonGeneric,
    InputTextGeneric,
    DateRangeGeneric,
    DropdownGeneric
  },

  setup() {
    const locationStore = useStockLocationApiStore()
    const moveStore = useStockMoveLocationApiStore()
    return { locationStore, moveStore }
  },

  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    }
  },

  emits: ['search', 'clear', 'export'],

  watch: {
    modelForm: {
      handler(val) {
        this.form = { ...val }
      },
      deep: true
    }
  },

  computed: {
    locationOptions() {
      return this.locationStore.all
        .filter((item) => item.isActive)
        .map((item) => ({ value: item.code, label: `${item.code} — ${item.nameTh}` }))
    }
  },

  data() {
    return {
      form: { ...this.modelForm }
    }
  },

  async created() {
    await this.locationStore.fetchAllForMap()
  },

  methods: {
    onSearch() {
      this.$emit('search', this.form)
    },
    onClear() {
      this.$emit('clear')
    },
    onExport() {
      this.$emit('export', this.form)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
