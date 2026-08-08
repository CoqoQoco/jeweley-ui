<template>
  <SectionCardGeneric
    :title="$t('view.sale.materialSale.sectionDocument')"
    icon="bi-file-earmark-text"
    headerStyle="filled"
  >
    <div class="form-row three-col">
      <FormFieldGeneric :label="$t('view.sale.materialSale.documentNoLabel')" :required="true">
        <div class="input-with-btn">
          <InputTextGeneric
            :modelValue="documentNo"
            :disabled="!editable"
            @update:modelValue="$emit('update:documentNo', $event)"
          />
          <ButtonGeneric
            v-if="editable"
            variant="outline"
            icon="bi-arrow-repeat"
            :title="$t('view.sale.materialSale.generateDocumentNo')"
            @click="$emit('generate')"
          />
        </div>
      </FormFieldGeneric>

      <FormFieldGeneric :label="$t('view.sale.materialSale.documentDateLabel')" :required="true">
        <CalendarGeneric
          :modelValue="documentDate"
          dateFormat="dd/mm/yy"
          :showIcon="true"
          :disabled="!editable"
          @update:modelValue="$emit('update:documentDate', $event)"
        />
      </FormFieldGeneric>

      <FormFieldGeneric v-if="showStatus" :label="$t('common.field.status')">
        <div class="status-field">
          <span :class="['status-pill', `status-pill--${statusVariant}`]">{{ statusLabel }}</span>
        </div>
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
import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'

export default {
  name: 'MaterialSaleDocumentSection',

  components: {
    SectionCardGeneric,
    FormFieldGeneric,
    InputTextGeneric,
    ButtonGeneric,
    CalendarGeneric
  },

  props: {
    documentNo: { type: String, default: '' },
    documentDate: { type: [Date, null], default: null },
    editable: { type: Boolean, default: true },
    statusLabel: { type: String, default: '' },
    statusVariant: { type: String, default: 'gray' },
    showStatus: { type: Boolean, default: false }
  },

  emits: ['update:documentNo', 'update:documentDate', 'generate']
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.form-row {
  display: grid;
  gap: var(--sp-md);

  &.three-col {
    grid-template-columns: 1fr 1fr 1fr;

    @media (max-width: 1024px) {
      grid-template-columns: 1fr 1fr;
    }
  }
}

.input-with-btn {
  display: flex;
  align-items: stretch;
  gap: var(--sp-sm);

  > :first-child {
    flex: 1;
  }
}

.status-field {
  display: flex;
  align-items: center;
  height: 100%;
}

.status-pill {
  display: inline-block;
  padding: var(--sp-xs) var(--sp-sm);
  border-radius: var(--radius-sm);
  font-size: var(--fs-sm);
  font-weight: 700;

  &--gray {
    color: var(--status-closed);
    background: var(--status-closed-bg);
  }

  &--green {
    color: var(--status-resolved);
    background: var(--status-resolved-bg);
  }

  &--red {
    color: var(--status-cancelled);
    background: var(--status-cancelled-bg);
  }
}
</style>
