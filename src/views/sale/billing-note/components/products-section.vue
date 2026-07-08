<template>
  <SectionCardGeneric
    :title="$t('view.sale.billingNote.step3Title')"
    icon="bi-box-seam"
    accent="main"
    headerStyle="legend"
  >
    <div class="section-toolbar mb-2">
      <ButtonGeneric
        variant="green"
        icon="bi-cloud-download"
        :label="$t('view.sale.billingNote.fetchProducts')"
        :disabled="disabled"
        @click="$emit('fetch')"
      />
      <ButtonGeneric
        variant="outline"
        icon="bi-plus-circle"
        :label="$t('view.sale.billingNote.addProductRow')"
        @click="$emit('add-row')"
      />
    </div>

    <div v-if="products.length === 0" class="empty-state">
      <i class="bi bi-inbox empty-icon"></i>
      <span class="empty-text">{{ $t('view.sale.billingNote.noProducts') }}</span>
    </div>

    <BaseDataTable
      v-else
      :items="products"
      :totalRecords="products.length"
      :columns="columns"
      :paginator="false"
      scrollHeight="360px"
      dataKey="_key"
    >
      <template #invoiceRunningTemplate="{ data, index }">
        <InputTextGeneric
          :modelValue="data.invoiceRunning"
          @update:modelValue="updateField(index, 'invoiceRunning', $event)"
        />
      </template>

      <template #productNumberTemplate="{ data, index }">
        <InputTextGeneric
          :modelValue="data.productNumber"
          @update:modelValue="updateField(index, 'productNumber', $event)"
        />
      </template>

      <template #productTypeNameTemplate="{ data, index }">
        <InputTextGeneric
          :modelValue="data.productTypeName"
          @update:modelValue="updateField(index, 'productTypeName', $event)"
        />
      </template>

      <template #productionTypeTemplate="{ data, index }">
        <InputTextGeneric
          :modelValue="data.productionType"
          @update:modelValue="updateField(index, 'productionType', $event)"
        />
      </template>

      <template #qtyTemplate="{ data, index }">
        <InputTextGeneric
          type="number"
          :modelValue="data.qty"
          @update:modelValue="updateField(index, 'qty', $event)"
        />
      </template>

      <template #amountTemplate="{ data, index }">
        <InputTextGeneric
          type="number"
          step="0.01"
          :modelValue="data.amount"
          @update:modelValue="updateField(index, 'amount', $event)"
        />
      </template>

      <template #actionTemplate="{ index }">
        <div class="text-center">
          <ButtonGeneric
            variant="red"
            icon="bi-trash"
            :title="$t('common.btn.delete')"
            @click="$emit('remove-row', index)"
          />
        </div>
      </template>
    </BaseDataTable>
  </SectionCardGeneric>
</template>

<script>
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  name: 'BillingNoteProductsSection',

  components: {
    SectionCardGeneric,
    ButtonGeneric,
    InputTextGeneric,
    BaseDataTable
  },

  props: {
    products: { type: Array, default: () => [] },
    disabled: { type: Boolean, default: false }
  },

  emits: ['fetch', 'add-row', 'remove-row', 'update:products'],

  computed: {
    columns() {
      return [
        { field: 'invoiceRunning', header: this.$t('view.sale.billingNote.invoiceRunning'), minWidth: '150px', sortable: false, template: 'invoiceRunningTemplate' },
        { field: 'productNumber', header: this.$t('view.sale.billingNote.productNumber'), minWidth: '150px', sortable: false, template: 'productNumberTemplate' },
        { field: 'productTypeName', header: this.$t('view.sale.billingNote.productTypeName'), minWidth: '150px', sortable: false, template: 'productTypeNameTemplate' },
        { field: 'productionType', header: this.$t('view.sale.billingNote.productionType'), minWidth: '150px', sortable: false, template: 'productionTypeTemplate' },
        { field: 'qty', header: this.$t('view.sale.billingNote.qty'), minWidth: '100px', sortable: false, template: 'qtyTemplate' },
        { field: 'amount', header: this.$t('view.sale.billingNote.amount'), minWidth: '120px', sortable: false, template: 'amountTemplate' },
        { field: 'action', header: '', width: '60px', sortable: false, template: 'actionTemplate' }
      ]
    }
  },

  methods: {
    updateField(index, field, value) {
      const updated = this.products.map((p, i) => (i === index ? { ...p, [field]: value } : p))
      this.$emit('update:products', updated)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.section-toolbar {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  flex-wrap: wrap;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--sp-2xl) var(--sp-lg);
  gap: var(--sp-sm);
}

.empty-icon {
  font-size: 2.5rem;
  color: var(--base-green);
  opacity: 0.5;
}

.empty-text {
  color: var(--base-font-color);
  opacity: 0.6;
  font-size: var(--fs-base);
}
</style>
