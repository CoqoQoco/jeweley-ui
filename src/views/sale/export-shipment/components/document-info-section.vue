<template>
  <SectionCardGeneric :title="$t('view.sale.exportShipment.sectionDocument')" icon="bi-file-earmark-text" headerStyle="filled">
    <template v-if="showStatus" #header-actions>
      <span class="status-pill">{{ form.statusName }}</span>
    </template>

    <div class="form-row three-col">
      <FormFieldGeneric :label="$t('view.sale.exportShipment.documentNumberLabel')">
        <InputTextGeneric :modelValue="form.documentNumber" :readonly="true" :bgInput="true" />
      </FormFieldGeneric>

      <FormFieldGeneric :label="$t('view.sale.exportShipment.customNumberLabel')" :required="true">
        <InputTextGeneric :modelValue="form.customNumber" :disabled="!editable" @update:modelValue="update('customNumber', $event)" />
      </FormFieldGeneric>

      <FormFieldGeneric :label="$t('view.sale.exportShipment.documentDateLabel')" :required="true">
        <CalendarGeneric
          :modelValue="form.documentDate"
          dateFormat="dd/mm/yy"
          :showIcon="true"
          :disabled="!editable"
          @update:modelValue="update('documentDate', $event)"
        />
      </FormFieldGeneric>
    </div>

    <div class="form-row three-col">
      <FormFieldGeneric :label="$t('view.sale.exportShipment.consigneeNameLabel')" :required="true">
        <InputTextGeneric :modelValue="form.consigneeName" :disabled="!editable" @update:modelValue="update('consigneeName', $event)" />
      </FormFieldGeneric>

      <FormFieldGeneric :label="$t('view.sale.exportShipment.eventNameLabel')">
        <InputTextGeneric :modelValue="form.eventName" :disabled="!editable" @update:modelValue="update('eventName', $event)" />
      </FormFieldGeneric>

      <FormFieldGeneric :label="$t('view.sale.exportShipment.boothNoLabel')">
        <InputTextGeneric :modelValue="form.boothNo" :disabled="!editable" @update:modelValue="update('boothNo', $event)" />
      </FormFieldGeneric>
    </div>

    <div class="form-row">
      <FormFieldGeneric :label="$t('view.sale.exportShipment.consigneeAddressLabel')">
        <TextareaGeneric :modelValue="form.consigneeAddress" :rows="2" :disabled="!editable" @update:modelValue="update('consigneeAddress', $event)" />
      </FormFieldGeneric>
    </div>

    <div class="form-row three-col">
      <FormFieldGeneric :label="$t('view.sale.exportShipment.attnNameLabel')">
        <InputTextGeneric :modelValue="form.attnName" :disabled="!editable" @update:modelValue="update('attnName', $event)" />
      </FormFieldGeneric>

      <FormFieldGeneric :label="$t('view.sale.exportShipment.attnPassportLabel')">
        <InputTextGeneric :modelValue="form.attnPassport" :disabled="!editable" @update:modelValue="update('attnPassport', $event)" />
      </FormFieldGeneric>

      <FormFieldGeneric :label="$t('view.sale.exportShipment.attnTelLabel')">
        <InputTextGeneric :modelValue="form.attnTel" :disabled="!editable" @update:modelValue="update('attnTel', $event)" />
      </FormFieldGeneric>
    </div>

    <div class="form-row four-col">
      <FormFieldGeneric :label="$t('view.sale.exportShipment.incotermLabel')">
        <InputTextGeneric :modelValue="form.incoterm" :disabled="!editable" @update:modelValue="update('incoterm', $event)" />
      </FormFieldGeneric>

      <FormFieldGeneric :label="$t('view.sale.exportShipment.originCountryLabel')">
        <InputTextGeneric :modelValue="form.originCountry" :disabled="!editable" @update:modelValue="update('originCountry', $event)" />
      </FormFieldGeneric>

      <FormFieldGeneric :label="$t('view.sale.exportShipment.currencyLabel')">
        <InputTextGeneric :modelValue="form.currency" :disabled="!editable" @update:modelValue="update('currency', $event)" />
      </FormFieldGeneric>

      <FormFieldGeneric :label="$t('view.sale.exportShipment.parcelCountLabel')">
        <InputTextGeneric type="number" min="0" :modelValue="form.parcelCount" :disabled="!editable" @update:modelValue="update('parcelCount', $event)" />
      </FormFieldGeneric>
    </div>

    <div class="form-row three-col">
      <FormFieldGeneric :label="$t('view.sale.exportShipment.exchangeRateLabel')" :required="true">
        <InputTextGeneric type="number" min="0" step="0.0001" :modelValue="form.exchangeRate" :disabled="!editable" @update:modelValue="update('exchangeRate', $event)" />
      </FormFieldGeneric>

      <FormFieldGeneric :label="$t('view.sale.exportShipment.pricePercentLabel')">
        <InputTextGeneric type="number" min="0" step="0.01" :modelValue="form.pricePercent" :disabled="!editable" @update:modelValue="update('pricePercent', $event)" />
      </FormFieldGeneric>
    </div>

    <div class="form-row">
      <FormFieldGeneric :label="$t('common.field.remark')">
        <TextareaGeneric :modelValue="form.remark" :rows="2" :disabled="!editable" @update:modelValue="update('remark', $event)" />
      </FormFieldGeneric>
    </div>
  </SectionCardGeneric>
</template>

<script>
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import TextareaGeneric from '@/components/generic/TextareaGeneric.vue'
import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'

export default {
  name: 'ExportShipmentDocumentInfoSection',

  components: {
    SectionCardGeneric,
    FormFieldGeneric,
    InputTextGeneric,
    TextareaGeneric,
    CalendarGeneric
  },

  props: {
    form: {
      type: Object,
      default: () => ({})
    },
    editable: {
      type: Boolean,
      default: true
    },
    showStatus: {
      type: Boolean,
      default: false
    }
  },

  emits: ['update:form'],

  methods: {
    update(field, value) {
      this.$emit('update:form', { ...this.form, [field]: value })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.form-row {
  display: grid;
  gap: var(--sp-md);
  margin-bottom: var(--sp-md);

  &.three-col {
    grid-template-columns: repeat(3, 1fr);
  }

  &.four-col {
    grid-template-columns: repeat(4, 1fr);
  }

  @media (max-width: 1024px) {
    &.three-col,
    &.four-col {
      grid-template-columns: 1fr 1fr;
    }
  }
}

.status-pill {
  display: inline-block;
  padding: var(--sp-xs) var(--sp-sm);
  border-radius: var(--radius-sm);
  font-size: var(--fs-sm);
  font-weight: 700;
  background: var(--overlay-white-chip);
  color: var(--on-inverse);
}
</style>
