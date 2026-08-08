<template>
  <SectionCardGeneric
    v-if="editable"
    :title="$t('view.sale.materialSale.section.gemSearch')"
    icon="bi-search"
    headerStyle="filled"
  >
    <ButtonGeneric
      variant="green"
      icon="bi-search"
      :label="$t('view.sale.materialSale.pickGemBtn')"
      @click="$emit('open-picker')"
    />
  </SectionCardGeneric>
</template>

<script>
// Local components
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

export default {
  name: 'MaterialSaleGemSearchSection',

  components: {
    SectionCardGeneric,
    ButtonGeneric
  },

  props: {
    editable: { type: Boolean, default: true }
  },

  emits: ['open-picker']
}
</script>
