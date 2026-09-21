<template>
  <SearchBarGeneric
    :title="$t('view.sale.invoice.searchTitle')"
    :description="$t('view.sale.invoice.pageDescription')"
    @search="onSearch"
    @clear="onClear"
  >
    <template #fields>
      <!-- row 1 -->
      <div>
        <span class="title-text">{{ $t('view.sale.invoice.invoiceNumber') }}</span>
        <InputTextGeneric
          v-model="form.invoiceNumber"
          placeholder="EX: INV-2025-001"
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

      <div>
        <span class="title-text">{{ $t('view.sale.invoice.stockNumber') }}</span>
        <InputTextGeneric
          v-model="form.stockNumber"
          :placeholder="$t('view.sale.invoice.stockNumberPlaceholder')"
          :trim="true"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.sale.invoice.productNumber') }}</span>
        <InputTextGeneric
          v-model="form.productNumber"
          :placeholder="$t('view.sale.invoice.productNumber')"
          :trim="true"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.sale.invoice.moldNumber') }}</span>
        <AutoCompleteGeneric
          :modelValue="form.moldNumber"
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
      </div>

      <!-- row 2 -->
      <div>
        <span class="title-text">{{ $t('view.sale.invoice.salePersonLabel') }}</span>
        <AutoCompleteGeneric
          :modelValue="form.salePerson"
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
      </div>

      <div>
        <span class="title-text">{{ $t('view.sale.invoice.saleSupportLabel') }}</span>
        <AutoCompleteGeneric
          :modelValue="form.saleSupport"
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
      </div>

      <div>
        <span class="title-text">{{ $t('view.sale.invoice.saleChannelLabel') }}</span>
        <DropdownGeneric
          v-model="form.saleChannelCode"
          :options="saleChannelOptions"
          optionLabel="name"
          optionValue="code"
          :placeholder="$t('view.sale.invoice.filterAll')"
          :showClear="true"
          class="w-100"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.sale.invoice.paymentStatusLabel') }}</span>
        <DropdownGeneric
          v-model="form.paymentStatus"
          :options="paymentStatusOptions"
          optionLabel="name"
          optionValue="value"
          :placeholder="$t('view.sale.invoice.filterAll')"
          :showClear="true"
          class="w-100"
        />
      </div>

      <div class="date-range-field">
        <span class="title-text">{{ $t('view.sale.invoice.createDate') }}</span>
        <DateRangeGeneric
          :startDate="form.createDateStart"
          :endDate="form.createDateEnd"
          :startPlaceholder="$t('common.label.startDate')"
          :endPlaceholder="$t('common.label.endDate')"
          @update:startDate="form.createDateStart = $event"
          @update:endDate="form.createDateEnd = $event"
        />
      </div>
    </template>

    <template #actions-left>
      <div class="owner-filter-group">
        <span class="title-text">{{ $t('view.sale.invoice.ownerUsernameLabel') }}</span>
        <DropdownGeneric
          v-model="form.ownerUsername"
          :options="ownerOptions"
          optionLabel="name"
          optionValue="name"
          :placeholder="$t('view.sale.invoice.filterAll')"
          :showClear="true"
          class="owner-dropdown"
        />
        <CheckboxGeneric
          v-model="form.overdueOnly"
          :label="$t('view.sale.invoice.overdueOnlyLabel')"
        />
      </div>
    </template>

    <template #actions-right>
      <ButtonGeneric variant="main" icon="bi-search" type="submit" :title="$t('common.btn.search')" />
      <ButtonGeneric variant="dark" icon="bi-x-circle" class="ml-2" :title="$t('common.btn.clear')" @click="onClear" />
    </template>
  </SearchBarGeneric>
</template>

<script>
import { useSaleChannelApiStore } from '@/stores/modules/api/sale/sale-channel-store.js'
import { useInvoiceApiStore } from '@/stores/modules/api/sale/invoice-store.js'

import SearchBarGeneric from '@/components/generic/SearchBarGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import CheckboxGeneric from '@/components/prime-vue/CheckboxGeneric.vue'
import DateRangeGeneric from '@/components/prime-vue/DateRangeGeneric.vue'
import AutoCompleteGeneric from '@/components/prime-vue/AutoCompleteGeneric.vue'

export default {
  name: 'InvoiceListSearchView',

  components: {
    SearchBarGeneric,
    InputTextGeneric,
    ButtonGeneric,
    DropdownGeneric,
    CheckboxGeneric,
    DateRangeGeneric,
    AutoCompleteGeneric
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
      saleChannelStore: useSaleChannelApiStore(),
      invoiceStore: useInvoiceApiStore(),
      saleChannelList: [],
      saleTeamData: { salePersons: [], saleSupports: [], owners: [] }
    }
  },

  computed: {
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
      this.form.moldNumber = value || null
    },

    onMoldSelect(event) {
      const option = event.value
      if (!option) return
      this.form.moldNumber = String(option.moldDesign)
    },

    onSalePersonInput(value) {
      if (value && typeof value === 'object') return
      this.form.salePerson = value || null
    },

    onSalePersonSelect(event) {
      const option = event.value
      if (!option) return
      this.form.salePerson = option.name
    },

    onSaleSupportInput(value) {
      if (value && typeof value === 'object') return
      this.form.saleSupport = value || null
    },

    onSaleSupportSelect(event) {
      const option = event.value
      if (!option) return
      this.form.saleSupport = option.name
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
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/custom-style/standard-form.scss';

:deep(.form-col-container) {
  @media (min-width: 1400px) {
    grid-template-columns: repeat(5, 1fr);
  }

  @media (min-width: 1024px) and (max-width: 1399px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 1023px) {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 1024px) and (max-width: 1399px) {
  :deep(.date-range-field) {
    grid-column: span 2;
  }
}

.owner-filter-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--sp-md);

  .title-text {
    white-space: nowrap;
  }

  .owner-dropdown {
    min-width: 200px;
  }
}
</style>
