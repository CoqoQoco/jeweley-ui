<template>
  <SectionCardGeneric
    :title="$t('view.sale.billingNote.step1Title')"
    icon="bi-person-fill"
    accent="main"
    headerStyle="legend"
  >
    <div v-if="!customerCode" class="customer-empty">
      <i class="bi bi-person-plus customer-empty-icon"></i>
      <span class="customer-empty-text">{{ $t('view.sale.billingNote.noCustomerSelected') }}</span>
      <ButtonGeneric
        v-if="!isEdit"
        variant="main"
        icon="bi-search"
        :label="$t('view.sale.billingNote.selectCustomer')"
        class="ml-3"
        @click="$emit('open-select')"
      />
    </div>

    <div v-else class="form-row two-col">
      <FormFieldGeneric :label="$t('view.sale.billingNote.customerName')">
        <InputTextGeneric :modelValue="customerName" :readonly="true" bgInput="bg-input" />
      </FormFieldGeneric>

      <FormFieldGeneric :label="$t('view.sale.billingNote.documentDate')" :required="true">
        <CalendarGeneric
          :modelValue="documentDate"
          dateFormat="dd/mm/yy"
          :showIcon="true"
          @update:modelValue="$emit('update:documentDate', $event)"
        />
      </FormFieldGeneric>

      <FormFieldGeneric :label="$t('view.sale.billingNote.customerAddress')">
        <InputTextGeneric :modelValue="customerAddress" :readonly="true" bgInput="bg-input" />
      </FormFieldGeneric>

      <FormFieldGeneric :label="$t('view.sale.billingNote.customerTel')">
        <InputTextGeneric :modelValue="customerTel" :readonly="true" bgInput="bg-input" />
      </FormFieldGeneric>

      <div v-if="!isEdit" class="mt-2">
        <ButtonGeneric
          variant="outline"
          icon="bi-arrow-repeat"
          :label="$t('view.sale.billingNote.changeCustomer')"
          @click="$emit('open-select')"
        />
      </div>
    </div>
  </SectionCardGeneric>
</template>

<script>
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'

export default {
  name: 'BillingNoteCustomerSection',

  components: {
    SectionCardGeneric,
    FormFieldGeneric,
    InputTextGeneric,
    ButtonGeneric,
    CalendarGeneric
  },

  props: {
    customerCode: { type: String, default: '' },
    customerName: { type: String, default: '' },
    customerAddress: { type: String, default: '' },
    customerTel: { type: String, default: '' },
    documentDate: { type: [Date, null], default: null },
    isEdit: { type: Boolean, default: false }
  },

  emits: ['open-select', 'update:documentDate']
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';
@import '@/assets/scss/custom-style/standard-form.scss';

.customer-empty {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--sp-sm);
  padding: var(--sp-sm) 0;
}

.customer-empty-icon {
  color: var(--base-font-color);
  font-size: 1.2rem;
}

.customer-empty-text {
  color: var(--base-font-color);
  opacity: 0.7;
  font-size: var(--fs-base);
}

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
