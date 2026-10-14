<template>
  <SearchBarGeneric
    :title="$t('view.receiptStock.product.reportGrOutsource.title')"
    :description="$t('view.receiptStock.product.reportGrOutsource.searchDesc')"
    @search="onSearch"
    @clear="onClear"
  >
    <template #fields>
      <div>
        <span class="title-text">{{ $t('view.receiptStock.product.reportGr.receiptDate') }}</span>
        <DateRangeGeneric
          :startDate="form.receiptDateStart"
          :endDate="form.receiptDateEnd"
          :startPlaceholder="$t('common.label.start')"
          :endPlaceholder="$t('common.label.end')"
          @update:startDate="form.receiptDateStart = $event"
          @update:endDate="form.receiptDateEnd = $event"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.receiptStock.product.reportGr.colVendor') }}</span>
        <InputTextGeneric v-model.trim="form.vendor" />
      </div>

      <div>
        <span class="title-text">{{ $t('view.receiptStock.product.reportGr.colPoNumber') }}</span>
        <InputTextGeneric v-model.trim="form.poNumber" />
      </div>

      <div>
        <span class="title-text">{{ $t('view.receiptStock.product.reportGr.stockNumber') }}</span>
        <InputTextGeneric v-model.trim="form.stockNumber" placeholder="EX: DK-2502-00X" />
      </div>

      <div>
        <span class="title-text">{{ $t('view.receiptStock.product.reportGr.mold') }}</span>
        <InputTextGeneric v-model.trim="form.mold" placeholder="EX: CN-2400XX" />
      </div>

      <div>
        <span class="title-text">{{ $t('view.receiptStock.product.reportGr.productType') }}</span>
        <MultiSelectGeneric
          v-model="form.productType"
          :options="masterProductType"
          optionLabel="description"
          optionValue="code"
          :placeholder="$t('common.label.all')"
        />
      </div>
    </template>

    <template #actions-right>
      <ButtonGeneric variant="main" icon="bi-search" type="submit" :label="$t('common.btn.search')" />
      <ButtonGeneric
        variant="sub-main"
        icon="bi-zoom-in"
        class="ml-2"
        :title="$t('common.btn.advancedSearch')"
        @click="onShowAdvanced"
      />
      <ButtonGeneric
        variant="dark"
        icon="bi-x-circle"
        class="ml-2"
        :title="$t('common.btn.clear')"
        @click="onClear"
      />
      <ButtonGeneric
        variant="green"
        icon="bi-filetype-csv"
        class="ml-2"
        :title="$t('common.btn.export')"
        :disabled="!receiptOutsourceStore.dataReceiptHistory.total"
        @click="onExport"
      />
      <ButtonGeneric
        variant="outline"
        icon="bi-file-earmark-pdf"
        class="ml-2"
        :title="$t('view.receiptStock.product.reportGr.btnPdf')"
        :disabled="!receiptOutsourceStore.dataReceiptHistory.total"
        @click="onPdf"
      />
    </template>
  </SearchBarGeneric>

  <modal
    :showModal="showAdvanced"
    @closeModal="onCloseAdvanced"
    width="900px"
    headerVariant="main"
    :isShowActionPart="true"
  >
    <template #title>
      <span class="title-text-lg d-block">
        <i class="bi bi-zoom-in mr-2"></i>{{ $t('common.btn.advancedSearch') }}
      </span>
    </template>
    <template #content>
      <div>
        <div class="form-row two-col">
          <div>
            <span class="title-text">{{ $t('view.receiptStock.product.reportGr.productNumber') }}</span>
            <InputTextGeneric v-model.trim="form.productNumber" placeholder="EX: R08X50XXXL" />
          </div>

          <div>
            <span class="title-text">{{ $t('view.receiptStock.product.reportGr.size') }}</span>
            <InputTextGeneric v-model.trim="form.size" placeholder="EX: #66" />
          </div>

          <div>
            <span class="title-text">{{ $t('view.receiptStock.product.reportGr.productNameEn') }}</span>
            <InputTextGeneric v-model.trim="form.productNameEn" placeholder="EX: Gold Ring #66" />
          </div>

          <div>
            <span class="title-text">{{ $t('view.receiptStock.product.reportGr.productNameTh') }}</span>
            <InputTextGeneric v-model.trim="form.productNameTh" />
          </div>
        </div>
      </div>
    </template>
    <template #action>
      <ButtonGeneric
        variant="main"
        icon="bi-search"
        :label="$t('common.btn.search')"
        @click="onAdvancedSearch"
      />
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'

import { useReceiptOutsourceApiStore } from '@/stores/modules/api/receipt/receipt-outsource-api.js'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'

import SearchBarGeneric from '@/components/generic/SearchBarGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import DateRangeGeneric from '@/components/prime-vue/DateRangeGeneric.vue'
import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

export default {
  name: 'ReportGrOutsourceSearchView',

  components: {
    SearchBarGeneric,
    ButtonGeneric,
    InputTextGeneric,
    DateRangeGeneric,
    MultiSelectGeneric,
    modal
  },

  setup() {
    const receiptOutsourceStore = useReceiptOutsourceApiStore()
    const masterStore = useMasterApiStore()
    return { receiptOutsourceStore, masterStore }
  },

  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    }
  },

  emits: ['search', 'clear', 'export', 'pdf'],

  computed: {
    masterProductType() {
      return this.masterStore.productType
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
      showAdvanced: false
    }
  },

  created() {
    this.$nextTick(async () => {
      await this.masterStore.fetchProductType()
    })
  },

  methods: {
    onSearch() {
      this.$emit('search', this.form)
    },
    onExport() {
      this.$emit('export', this.form)
    },
    onPdf() {
      this.$emit('pdf', this.form)
    },
    onClear() {
      this.$emit('clear')
    },
    onShowAdvanced() {
      this.showAdvanced = true
    },
    onCloseAdvanced() {
      this.showAdvanced = false
    },
    onAdvancedSearch() {
      this.showAdvanced = false
      this.onSearch()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/mixin.scss';

.form-row {
  &.two-col {
    @include form-row-grid(2);
  }
}
</style>
