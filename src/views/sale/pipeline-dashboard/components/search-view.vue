<template>
  <SearchBarGeneric
    :title="$t('view.sale.pipelineDashboard.searchTitle')"
    :description="$t('view.sale.pipelineDashboard.searchDesc')"
    @search="onSearch"
    @clear="onClear"
  >
    <template #fields>
      <div>
        <span class="title-text">{{ $t('view.sale.pipelineDashboard.dateRangeLabel') }}</span>
        <DateRangeGeneric
          :startDate="form.start"
          :endDate="form.end"
          :startPlaceholder="$t('common.label.start')"
          :endPlaceholder="$t('common.label.end')"
          @update:startDate="form.start = $event"
          @update:endDate="form.end = $event"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.sale.pipelineDashboard.channelLabel') }}</span>
        <MultiSelectGeneric
          v-model="form.saleChannelCodes"
          :options="channelOptions"
          optionLabel="label"
          optionValue="value"
          :placeholder="$t('common.label.all')"
          :showClear="true"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.sale.pipelineDashboard.customerLabel') }}</span>
        <AutoCompleteGeneric
          :modelValue="form.customerName"
          apiEndpoint="SaleReport/InvoiceCustomerSuggest"
          searchField="text"
          optionLabel="customerName"
          :additionalSearchParams="customerSearchParams"
          :take="20"
          :forceSelection="false"
          :placeholder="$t('view.sale.pipelineDashboard.customerPlaceholder')"
          @update:modelValue="onCustomerInput"
          @item-select="onCustomerSelect"
        >
          <template #option="{ option }">
            <div>
              {{ option.customerName }} · {{ option.customerCode }} ·
              {{ $t('view.sale.pipelineDashboard.customerOptionInvoiceCount', { count: formatCount(option.invoiceCount) }) }}
            </div>
          </template>
        </AutoCompleteGeneric>
      </div>
    </template>

    <template #actions-right>
      <ButtonGeneric variant="main" icon="bi-search" type="submit" :label="$t('common.btn.search')" />
      <ButtonGeneric variant="dark" icon="bi-x-circle" class="ml-2" :title="$t('common.btn.clear')" @click="onClear" />
    </template>
  </SearchBarGeneric>
</template>

<script>
import { useSaleChannelApiStore } from '@/stores/modules/api/sale/sale-channel-store.js'
import { formatISOString } from '@/services/utils/dayjs.js'

import SearchBarGeneric from '@/components/generic/SearchBarGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import DateRangeGeneric from '@/components/prime-vue/DateRangeGeneric.vue'
import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'
import AutoCompleteGeneric from '@/components/prime-vue/AutoCompleteGeneric.vue'

// จุดขาย "ไม่ระบุ" — ค่าพิเศษที่ backend ตีความว่าเป็นบิลที่ไม่มีจุดขาย (ดู contract SalesSummary/ProductGroupSales)
const NONE_CHANNEL_VALUE = '__NONE__'

export default {
  name: 'SalePipelineDashboardSearchView',

  components: {
    SearchBarGeneric,
    ButtonGeneric,
    DateRangeGeneric,
    MultiSelectGeneric,
    AutoCompleteGeneric
  },

  setup() {
    const saleChannelStore = useSaleChannelApiStore()
    return { saleChannelStore }
  },

  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    }
  },

  emits: ['search', 'clear'],

  data() {
    return {
      form: { ...this.modelForm },
      channelList: [],
      isSyncingForm: false
    }
  },

  computed: {
    channelOptions() {
      const options = this.channelList.map((channel) => ({
        value: channel.code,
        label: channel.nameTh || channel.nameEn || channel.code
      }))
      options.push({ value: NONE_CHANNEL_VALUE, label: this.$t('view.sale.pipelineDashboard.channelNotSpecified') })
      return options
    },

    customerSearchParams() {
      return {
        start: this.form.start ? formatISOString(this.form.start) : null,
        end: this.form.end ? formatISOString(this.form.end) : null,
        saleChannelCodes: this.form.saleChannelCodes && this.form.saleChannelCodes.length ? this.form.saleChannelCodes : []
      }
    }
  },

  watch: {
    modelForm: {
      handler(val) {
        this.isSyncingForm = true
        this.form = { ...val }
        this.$nextTick(() => {
          this.isSyncingForm = false
        })
      },
      deep: true
    },

    'form.start'() {
      this.clearCustomerIfUserChanged()
    },

    'form.end'() {
      this.clearCustomerIfUserChanged()
    },

    'form.saleChannelCodes': {
      handler() {
        this.clearCustomerIfUserChanged()
      },
      deep: true
    }
  },

  methods: {
    // ลูกค้าที่เลือกไว้ผูกกับช่วงวันที่/จุดขายตอนค้นหา (suggestion ยิงตาม additionalSearchParams เดียวกัน)
    // ถ้า user เปลี่ยนวันที่/จุดขายเอง ต้องเคลียร์ลูกค้าทิ้ง — ไม่เคลียร์ตอน sync กลับจาก URL (isSyncingForm guard)
    clearCustomerIfUserChanged() {
      if (this.isSyncingForm) return
      if (!this.form.customerCode && !this.form.customerName) return
      this.form.customerCode = null
      this.form.customerName = null
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

    formatCount(value) {
      return new Intl.NumberFormat('th-TH').format(value || 0)
    },

    onSearch() {
      // customerName ที่เหลืออยู่โดยไม่มี customerCode = ข้อความที่ user พิมพ์แต่ไม่เคยเลือกจากรายการ
      // ไม่ได้ใช้ filter จริง — ต้องเคลียร์ทิ้งก่อน emit กันไปโชว์/ติด URL ทั้งที่ไม่ได้กรองอะไร
      const searchForm = { ...this.form }
      if (!searchForm.customerCode) searchForm.customerName = null
      this.$emit('search', searchForm)
    },

    onClear() {
      this.$emit('clear')
    },

    async loadChannels() {
      this.channelList = await this.saleChannelStore.fetchActiveList({ skipLoading: true })
    }
  },

  created() {
    this.loadChannels()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
