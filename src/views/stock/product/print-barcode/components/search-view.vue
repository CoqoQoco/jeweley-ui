<template>
  <SearchBarGeneric
    :title="$t('view.stock.printBarcode.title')"
    :description="$t('view.stock.printBarcode.desc')"
    @search="onSearch"
    @clear="onClear"
  >
    <template #fields>
      <div class="mode-row">
        <span class="title-text">{{ $t('view.stock.printBarcode.searchBy') }}</span>
        <ToggleGroupGeneric
          v-model="form.mode"
          :options="modeOptions"
          :ariaLabel="$t('view.stock.printBarcode.searchBy')"
        />
      </div>

      <template v-if="form.mode === 'sku'">
        <div>
          <span class="title-text">{{ $t('view.stock.product.productNumber') }}</span>
          <InputTextGeneric v-model="form.productNumber" :trim="true" :bgInput="true" placeholder="EX: R08X50XXXL" />
        </div>
        <div>
          <span class="title-text">{{ $t('view.stock.product.mold') }}</span>
          <InputTextGeneric v-model="form.mold" :trim="true" :bgInput="true" placeholder="EX: CN-2400XX" />
        </div>
      </template>

      <div v-else-if="form.mode === 'wo'">
        <span class="title-text">{{ $t('view.stock.product.wo') }}</span>
        <InputTextGeneric v-model="form.woText" :trim="true" :bgInput="true" placeholder="EX: WO12345" />
      </div>

      <div v-else-if="form.mode === 'location'">
        <span class="title-text">{{ $t('view.stock.product.locationFilterLabel') }}</span>
        <MultiSelectGeneric
          v-model="form.locationCodes"
          :options="locationOptions"
          optionLabel="label"
          optionValue="value"
          :placeholder="$t('view.stock.product.locationFilterLabel')"
          :showClear="true"
        />
      </div>

      <div v-else class="scan-row">
        <span class="title-text">{{ $t('view.stock.printBarcode.scanLabel') }}</span>
        <TextareaGeneric v-model="form.codesText" :rows="5" :placeholder="$t('view.stock.printBarcode.scanPlaceholder')" />
        <span class="scan-hint">{{ $t('view.stock.printBarcode.scanHint') }}</span>
      </div>

      <div>
        <span class="title-text">{{ $t('view.stock.product.pieceStatus') }}</span>
        <DropdownGeneric
          v-model="form.pieceStatus"
          inputId="print-barcode-piece-status"
          :ariaLabel="$t('view.stock.product.pieceStatus')"
          :options="pieceStatusOptions"
          optionLabel="description"
          optionValue="value"
        />
      </div>
    </template>

    <template #actions-right>
      <ButtonGeneric
        variant="main"
        icon="bi-search"
        type="submit"
        :label="$t('common.btn.search')"
      />
      <ButtonGeneric
        variant="dark"
        icon="bi-x-circle"
        class="ml-2"
        :title="$t('common.btn.clear')"
        @click="onClear"
      />
    </template>
  </SearchBarGeneric>
</template>

<script>
import { useStockLocationApiStore } from '@/stores/modules/api/stock/stock-location-api.js'
import { warning } from '@/services/alert/sweetAlerts.js'

import SearchBarGeneric from '@/components/generic/SearchBarGeneric.vue'
import ToggleGroupGeneric from '@/components/generic/ToggleGroupGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import TextareaGeneric from '@/components/generic/TextareaGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'

const interfaceForm = {
  mode: 'sku',
  productNumber: '',
  mold: '',
  woText: '',
  locationCodes: [],
  codesText: '',
  pieceStatus: 'IN_STOCK'
}

export default {
  components: {
    SearchBarGeneric,
    ToggleGroupGeneric,
    InputTextGeneric,
    TextareaGeneric,
    ButtonGeneric,
    MultiSelectGeneric,
    DropdownGeneric
  },

  emits: ['search', 'clear'],

  setup() {
    const locationStore = useStockLocationApiStore()
    return { locationStore }
  },

  data() {
    return {
      form: { ...interfaceForm, locationCodes: [] }
    }
  },

  computed: {
    modeOptions() {
      return [
        { value: 'sku', label: this.$t('view.stock.printBarcode.modeSku') },
        { value: 'wo', label: this.$t('view.stock.printBarcode.modeWo') },
        { value: 'location', label: this.$t('view.stock.printBarcode.modeLocation') },
        { value: 'scan', label: this.$t('view.stock.printBarcode.modeScan') }
      ]
    },
    locationOptions() {
      return this.locationStore.all
        .filter((item) => item.isActive)
        .map((item) => ({ value: item.code, label: `${item.code} — ${item.nameTh}` }))
    },
    pieceStatusOptions() {
      return [
        { value: 'IN_STOCK', description: this.$t('view.stock.product.inStock') },
        { value: 'RESERVED', description: this.$t('view.stock.product.reserved') },
        { value: 'SOLD', description: this.$t('view.stock.product.sold') }
      ]
    },
    hasCondition() {
      const f = this.form
      switch (f.mode) {
        case 'sku':
          return !!(f.productNumber || f.mold)
        case 'wo':
          return !!f.woText
        case 'location':
          return f.locationCodes.length > 0
        default:
          return !!String(f.codesText || '').trim()
      }
    }
  },

  methods: {
    onSearch() {
      if (!this.hasCondition) {
        warning(this.$t('view.stock.printBarcode.needInput'), this.$t('alert.alertTitle.warning'))
        return
      }
      this.$emit('search', { ...this.form, locationCodes: [...this.form.locationCodes] })
    },

    onClear() {
      this.form = { ...interfaceForm, locationCodes: [] }
      this.$emit('clear')
    }
  },

  async created() {
    await this.locationStore.fetchAllForMap()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/custom-style/standard-form.scss';

.mode-row,
.scan-row {
  grid-column: 1 / -1;
}

.scan-hint {
  display: block;
  margin-top: var(--sp-xs);
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}
</style>
