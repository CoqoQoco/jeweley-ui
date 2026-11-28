<template>
  <div>
    <SearchBarGeneric
      :title="$t('view.sale.invoice.searchTitle')"
      :description="$t('view.sale.invoice.pageDescription')"
      @search="onSearch"
      @clear="onClear"
    >
      <template #fields>
        <div>
          <span class="title-text">{{ $t('view.sale.invoice.invoiceNumber') }}</span>
          <InputTextGeneric
            v-model="form.invoiceNumber"
            :placeholder="$t('view.sale.invoice.invoiceNumberSearchPlaceholder')"
            :trim="true"
          />
        </div>

        <div>
          <span class="title-text">{{ $t('view.sale.invoice.soNumber') }}</span>
          <InputTextGeneric
            v-model="form.soNumber"
            :placeholder="$t('view.sale.invoice.soNumberPlaceholder')"
            :trim="true"
          />
        </div>

        <div>
          <span class="title-text">{{ $t('view.sale.invoice.customerName') }}</span>
          <AutoCompleteGeneric
            :modelValue="form.customerName"
            apiEndpoint="SaleReport/InvoiceCustomerSuggest"
            searchField="text"
            optionLabel="customerName"
            :take="20"
            :forceSelection="false"
            :placeholder="$t('view.sale.invoice.customerName')"
            @update:modelValue="onCustomerInput"
            @item-select="onCustomerSelect"
          >
            <template #option="{ option }">
              <div>
                {{ option.customerName }} · {{ option.customerCode }} ·
                {{ $t('view.sale.invoice.optionInvoiceCount', { count: formatCount(option.invoiceCount) }) }}
              </div>
            </template>
          </AutoCompleteGeneric>
        </div>
      </template>

      <template #actions-right>
        <ButtonGeneric variant="main" icon="bi-search" type="submit" :title="$t('common.btn.search')" />
        <ButtonGeneric variant="outline" icon="bi-sliders" class="ml-2" @click="openFilterPanel">
          {{ $t('view.sale.invoice.filterButton') }}
          <span v-if="activeChips.length" class="invoice-filter-badge">{{ activeChips.length }}</span>
        </ButtonGeneric>
        <ButtonGeneric variant="dark" icon="bi-x-circle" class="ml-2" :title="$t('common.btn.clear')" @click="onClear" />
      </template>
    </SearchBarGeneric>

    <ActiveFilterChipsGeneric :chips="activeChips" @remove="onRemoveChip" @clear-all="onClearPanelFilters" />

    <FilterPanelGeneric
      :show="isFilterPanelOpen"
      :title="$t('view.sale.invoice.filterPanelTitle')"
      width="420px"
      @apply="onFilterApply"
      @clear="onFilterClear"
      @close="closeFilterPanel"
    >
      <template #section>
        <FormFieldGeneric :label="$t('view.sale.invoice.stockNumber')">
          <InputTextGeneric
            v-model="draft.stockNumber"
            :placeholder="$t('view.sale.invoice.stockNumberPlaceholder')"
            :trim="true"
          />
        </FormFieldGeneric>
        <FormFieldGeneric :label="$t('view.sale.invoice.productNumber')">
          <InputTextGeneric
            v-model="draft.productNumber"
            :placeholder="$t('view.sale.invoice.productNumber')"
            :trim="true"
          />
        </FormFieldGeneric>
        <FormFieldGeneric :label="$t('view.sale.invoice.moldNumber')">
          <AutoCompleteGeneric
            :modelValue="draft.moldNumber"
            apiEndpoint="Invoice/MoldSuggest"
            searchField="text"
            optionLabel="moldDesign"
            :take="20"
            :forceSelection="false"
            :placeholder="$t('view.sale.invoice.moldNumber')"
            @update:modelValue="onMoldInput"
            @item-select="onMoldSelect"
          >
            <template #option="{ option }">
              <div>
                {{ option.moldDesign }} ·
                {{ $t('view.sale.invoice.optionInvoiceCount', { count: formatCount(option.invoiceCount) }) }} ·
                {{ $t('view.sale.invoice.optionItemCount', { count: formatCount(option.itemCount) }) }}
              </div>
            </template>
          </AutoCompleteGeneric>
        </FormFieldGeneric>
        <FormFieldGeneric :label="$t('view.sale.invoice.salePersonLabel')">
          <AutoCompleteGeneric
            :modelValue="draft.salePerson"
            :useStaticList="true"
            :staticOptions="salePersonOptions"
            optionLabel="name"
            :forceSelection="false"
            :placeholder="$t('view.sale.invoice.salePersonLabel')"
            @update:modelValue="onSalePersonInput"
            @item-select="onSalePersonSelect"
          >
            <template #option="{ option }">
              <div>
                {{ option.name }} ·
                {{ $t('view.sale.invoice.optionInvoiceCount', { count: formatCount(option.invoiceCount) }) }}
              </div>
            </template>
          </AutoCompleteGeneric>
        </FormFieldGeneric>
        <FormFieldGeneric :label="$t('view.sale.invoice.saleSupportLabel')">
          <AutoCompleteGeneric
            :modelValue="draft.saleSupport"
            :useStaticList="true"
            :staticOptions="saleSupportOptions"
            optionLabel="name"
            :forceSelection="false"
            :placeholder="$t('view.sale.invoice.saleSupportLabel')"
            @update:modelValue="onSaleSupportInput"
            @item-select="onSaleSupportSelect"
          >
            <template #option="{ option }">
              <div>
                {{ option.name }} ·
                {{ $t('view.sale.invoice.optionInvoiceCount', { count: formatCount(option.invoiceCount) }) }}
              </div>
            </template>
          </AutoCompleteGeneric>
        </FormFieldGeneric>
        <FormFieldGeneric :label="$t('view.sale.invoice.saleChannelLabel')">
          <DropdownGeneric
            v-model="draft.saleChannelCode"
            :options="saleChannelOptions"
            optionLabel="name"
            optionValue="code"
            :placeholder="$t('view.sale.invoice.filterAll')"
            :showClear="true"
            class="w-100"
          />
        </FormFieldGeneric>
        <FormFieldGeneric :label="$t('view.sale.invoice.paymentStatusLabel')">
          <DropdownGeneric
            v-model="draft.paymentStatus"
            :options="paymentStatusOptions"
            optionLabel="name"
            optionValue="value"
            :placeholder="$t('view.sale.invoice.filterAll')"
            :showClear="true"
            class="w-100"
          />
        </FormFieldGeneric>
        <FormFieldGeneric :label="$t('view.sale.invoice.invoiceTypeLabel')">
          <DropdownGeneric
            v-model="draft.invoiceType"
            :options="invoiceTypeOptions"
            optionLabel="name"
            optionValue="value"
            :placeholder="$t('view.sale.invoice.filterAll')"
            :showClear="true"
            class="w-100"
          />
        </FormFieldGeneric>
        <FormFieldGeneric :label="$t('view.sale.invoice.createDate')">
          <DateRangeGeneric
            :startDate="draft.createDateStart"
            :endDate="draft.createDateEnd"
            :startPlaceholder="$t('common.label.startDate')"
            :endPlaceholder="$t('common.label.endDate')"
            @update:startDate="draft.createDateStart = $event"
            @update:endDate="draft.createDateEnd = $event"
          />
        </FormFieldGeneric>
        <FormFieldGeneric :label="$t('view.sale.invoice.ownerUsernameLabel')">
          <DropdownGeneric
            v-model="draft.ownerUsername"
            :options="ownerOptions"
            optionLabel="name"
            optionValue="name"
            :placeholder="$t('view.sale.invoice.filterAll')"
            :showClear="true"
            class="w-100"
          />
        </FormFieldGeneric>
        <CheckboxGeneric v-model="draft.overdueOnly" :label="$t('view.sale.invoice.overdueOnlyLabel')" />
      </template>
    </FilterPanelGeneric>
  </div>
</template>

<script>
import { useSaleChannelApiStore } from '@/stores/modules/api/sale/sale-channel-store.js'
import { useInvoiceApiStore } from '@/stores/modules/api/sale/invoice-store.js'
import { INVOICE_TYPES } from '@/constants/invoice-types.js'
import { formatDate } from '@/services/utils/dayjs.js'

import SearchBarGeneric from '@/components/generic/SearchBarGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import CheckboxGeneric from '@/components/prime-vue/CheckboxGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import FilterPanelGeneric from '@/components/generic/FilterPanelGeneric.vue'
import ActiveFilterChipsGeneric from '@/components/generic/ActiveFilterChipsGeneric.vue'
import DateRangeGeneric from '@/components/prime-vue/DateRangeGeneric.vue'
import AutoCompleteGeneric from '@/components/prime-vue/AutoCompleteGeneric.vue'

export const PANEL_KEYS = [
  'stockNumber',
  'productNumber',
  'moldNumber',
  'salePerson',
  'saleSupport',
  'saleChannelCode',
  'paymentStatus',
  'invoiceType',
  'createDateStart',
  'createDateEnd',
  'ownerUsername',
  'overdueOnly'
]

const EMPTY_PANEL_VALUES = { overdueOnly: false }

function pickPanel(source) {
  const result = {}
  PANEL_KEYS.forEach((key) => {
    result[key] = source[key] ?? (key in EMPTY_PANEL_VALUES ? EMPTY_PANEL_VALUES[key] : null)
  })
  return result
}

export default {
  name: 'InvoiceListSearchView',

  components: {
    SearchBarGeneric,
    InputTextGeneric,
    ButtonGeneric,
    DropdownGeneric,
    CheckboxGeneric,
    DateRangeGeneric,
    AutoCompleteGeneric,
    FormFieldGeneric,
    FilterPanelGeneric,
    ActiveFilterChipsGeneric
  },

  emits: ['search', 'clear', 'update:modelForm'],

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

  data() {
    return {
      form: { ...this.modelForm },
      draft: {},
      isFilterPanelOpen: false,
      saleChannelStore: useSaleChannelApiStore(),
      invoiceStore: useInvoiceApiStore(),
      saleChannelList: [],
      saleTeamData: { salePersons: [], saleSupports: [], owners: [] }
    }
  },

  computed: {
    activeChips() {
      const f = this.form
      const chips = []
      const text = (key, labelKey, value) => {
        if (value) chips.push({ key, label: this.$t(labelKey), value: String(value) })
      }
      const option = (options, valueKey, value) => options.find((o) => o[valueKey] === value)?.name || value
      text('stockNumber', 'view.sale.invoice.stockNumber', f.stockNumber)
      text('productNumber', 'view.sale.invoice.productNumber', f.productNumber)
      text('moldNumber', 'view.sale.invoice.moldNumber', f.moldNumber)
      text('salePerson', 'view.sale.invoice.salePersonLabel', f.salePerson)
      text('saleSupport', 'view.sale.invoice.saleSupportLabel', f.saleSupport)
      text('saleChannelCode', 'view.sale.invoice.saleChannelLabel', f.saleChannelCode && option(this.saleChannelOptions, 'code', f.saleChannelCode))
      text('paymentStatus', 'view.sale.invoice.paymentStatusLabel', f.paymentStatus && option(this.paymentStatusOptions, 'value', f.paymentStatus))
      text('invoiceType', 'view.sale.invoice.invoiceTypeLabel', f.invoiceType && option(this.invoiceTypeOptions, 'value', f.invoiceType))
      if (f.createDateStart || f.createDateEnd) {
        const start = f.createDateStart ? formatDate(f.createDateStart) : ''
        const end = f.createDateEnd ? formatDate(f.createDateEnd) : ''
        chips.push({ key: 'createDate', label: this.$t('view.sale.invoice.createDate'), value: `${start} - ${end}` })
      }
      text('ownerUsername', 'view.sale.invoice.ownerUsernameLabel', f.ownerUsername)
      if (f.overdueOnly) chips.push({ key: 'overdueOnly', label: '', value: this.$t('view.sale.invoice.overdueOnlyLabel') })
      return chips
    },

    saleChannelOptions() {
      return this.saleChannelList.map((channel) => ({
        code: channel.code,
        name: channel.nameTh || channel.nameEn || channel.code
      }))
    },

    paymentStatusOptions() {
      return [
        { value: 'paid', name: this.$t('view.sale.invoice.paymentStatusPaid') },
        { value: 'partial', name: this.$t('view.sale.invoice.paymentStatusPartial') },
        { value: 'unpaid', name: this.$t('view.sale.invoice.paymentStatusUnpaid') }
      ]
    },

    invoiceTypeOptions() {
      return [
        { value: INVOICE_TYPES.PRODUCT, name: this.$t('view.sale.invoice.invoiceTypeProduct') },
        { value: INVOICE_TYPES.MATERIAL, name: this.$t('view.sale.invoice.invoiceTypeMaterial') }
      ]
    },

    salePersonOptions() {
      return this.saleTeamData.salePersons || []
    },

    saleSupportOptions() {
      return this.saleTeamData.saleSupports || []
    },

    ownerOptions() {
      return this.saleTeamData.owners || []
    }
  },

  methods: {
    onSearch() {
      this.$emit('search', this.form)
    },

    onClear() {
      this.$emit('clear')
    },

    openFilterPanel() {
      this.draft = pickPanel(this.form)
      this.isFilterPanelOpen = true
    },

    closeFilterPanel() {
      this.isFilterPanelOpen = false
    },

    onFilterApply() {
      this.form = { ...this.form, ...pickPanel(this.draft) }
      this.closeFilterPanel()
      this.onSearch()
    },

    onFilterClear() {
      this.onClearPanelFilters()
      this.closeFilterPanel()
    },

    onClearPanelFilters() {
      this.form = { ...this.form, ...pickPanel({}) }
      this.onSearch()
    },

    onRemoveChip(key) {
      const keys = key === 'createDate' ? ['createDateStart', 'createDateEnd'] : [key]
      const cleared = pickPanel({})
      keys.forEach((k) => {
        this.form[k] = cleared[k]
      })
      this.onSearch()
    },

    formatCount(value) {
      return new Intl.NumberFormat('th-TH').format(value || 0)
    },

    // AutoCompleteGeneric เขียน object ลง v-model ตอนเลือกจากรายการ — ปล่อยผ่านตรงนี้ (typeof object)
    // แล้วให้ @item-select ด้านล่างเป็นคนตั้งค่าจริง ส่วน string/null คือ user พิมพ์/ลบเอง
    onCustomerInput(value) {
      if (value && typeof value === 'object') return
      this.form.customerCode = null
      this.form.customerName = value || null
    },

    onCustomerSelect(event) {
      const option = event.value
      if (!option) return
      this.form.customerCode = option.customerCode
      this.form.customerName = option.customerName
    },

    onMoldInput(value) {
      if (value && typeof value === 'object') return
      this.draft.moldNumber = value || null
    },

    onMoldSelect(event) {
      const option = event.value
      if (!option) return
      this.draft.moldNumber = String(option.moldDesign)
    },

    onSalePersonInput(value) {
      if (value && typeof value === 'object') return
      this.draft.salePerson = value || null
    },

    onSalePersonSelect(event) {
      const option = event.value
      if (!option) return
      this.draft.salePerson = option.name
    },

    onSaleSupportInput(value) {
      if (value && typeof value === 'object') return
      this.draft.saleSupport = value || null
    },

    onSaleSupportSelect(event) {
      const option = event.value
      if (!option) return
      this.draft.saleSupport = option.name
    },

    async loadSaleChannels() {
      this.saleChannelList = await this.saleChannelStore.fetchActiveList({ skipLoading: true })
    },

    async loadSaleTeam() {
      const res = await this.invoiceStore.fetchSaleTeamSuggest()
      this.saleTeamData = {
        salePersons: res?.salePersons || [],
        saleSupports: res?.saleSupports || [],
        owners: res?.owners || []
      }
    }
  },

  mounted() {
    this.loadSaleChannels()
    this.loadSaleTeam()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

:deep(.form-col-container) {
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 1023px) {
    grid-template-columns: 1fr;
  }
}

.invoice-filter-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  margin-left: var(--sp-xs);
  border-radius: var(--radius-lg);
  background: var(--base-font-color);
  color: var(--on-inverse);
  font-size: var(--fs-sm);
  font-weight: 700;
}
</style>
