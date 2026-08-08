<template>
  <SectionCardGeneric
    :title="$t('view.sale.materialSale.sectionCustomer')"
    icon="bi-person-fill"
    headerStyle="filled"
  >
    <div v-if="editable" class="mb-3">
      <ButtonGeneric
        variant="green"
        icon="bi-search"
        :label="$t('view.sale.materialSale.selectCustomer')"
        @click="$emit('open-select')"
      />
    </div>

    <div class="form-row two-col">
      <FormFieldGeneric :label="$t('view.sale.materialSale.customerCodeLabel')">
        <InputTextGeneric :modelValue="customerCode" :readonly="true" bgInput="bg-input" />
      </FormFieldGeneric>

      <FormFieldGeneric :label="$t('view.sale.materialSale.customerNameLabel')" :required="true">
        <InputTextGeneric
          :modelValue="customerName"
          :disabled="!editable"
          @update:modelValue="$emit('update:customerName', $event)"
        />
      </FormFieldGeneric>

      <FormFieldGeneric :label="$t('view.sale.materialSale.customerAddressLabel')">
        <InputTextGeneric
          :modelValue="customerAddress"
          :disabled="!editable"
          @update:modelValue="$emit('update:customerAddress', $event)"
        />
      </FormFieldGeneric>

      <FormFieldGeneric :label="$t('view.sale.materialSale.customerTelLabel')">
        <InputTextGeneric
          type="tel"
          icon="bi-telephone-fill"
          :modelValue="customerTel"
          :disabled="!editable"
          @update:modelValue="$emit('update:customerTel', $event)"
        />
      </FormFieldGeneric>

      <FormFieldGeneric :label="$t('view.sale.materialSale.customerEmailLabel')">
        <InputTextGeneric
          type="email"
          icon="bi-envelope-check-fill"
          :modelValue="customerEmail"
          :disabled="!editable"
          @update:modelValue="$emit('update:customerEmail', $event)"
        />
      </FormFieldGeneric>

      <FormFieldGeneric :label="$t('view.sale.materialSale.customerTaxIdLabel')">
        <InputTextGeneric
          :modelValue="customerTaxId"
          :disabled="!editable"
          @update:modelValue="$emit('update:customerTaxId', $event)"
        />
      </FormFieldGeneric>
    </div>
  </SectionCardGeneric>
</template>

<script>
// Local components
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

export default {
  name: 'MaterialSaleCustomerSection',

  components: {
    SectionCardGeneric,
    FormFieldGeneric,
    InputTextGeneric,
    ButtonGeneric
  },

  props: {
    customerCode: { type: String, default: '' },
    customerName: { type: String, default: '' },
    customerAddress: { type: String, default: '' },
    customerTel: { type: String, default: '' },
    customerEmail: { type: String, default: '' },
    customerTaxId: { type: String, default: '' },
    editable: { type: Boolean, default: true }
  },

  emits: [
    'open-select',
    'update:customerName',
    'update:customerAddress',
    'update:customerTel',
    'update:customerEmail',
    'update:customerTaxId'
  ]
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.form-row {
  display: grid;
  gap: var(--sp-md);

  &.two-col {
    grid-template-columns: 1fr 1fr;

    @media (max-width: 1024px) {
      grid-template-columns: 1fr;
    }
  }
}
</style>
