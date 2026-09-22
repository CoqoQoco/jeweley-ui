<template>
  <form class="scan-search-row" @submit.prevent="$emit('search')">
    <InputTextGeneric
      :modelValue="modelValue"
      icon="bi-upc-scan"
      :trim="true"
      :placeholder="$t('view.stock.productGallery.scanPlaceholder')"
      @update:modelValue="$emit('update:modelValue', $event)"
    />
    <ButtonGeneric variant="green" icon="bi-search" type="submit" :title="$t('common.btn.search')" />
  </form>
</template>

<script>
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

export default {
  name: 'ScanSearchRow',

  components: {
    InputTextGeneric,
    ButtonGeneric
  },

  props: {
    modelValue: {
      type: String,
      default: ''
    }
  },

  emits: ['update:modelValue', 'search']
}
</script>

<style lang="scss" scoped>
.scan-search-row {
  display: flex;
  align-items: stretch;
  gap: var(--sp-sm);

  :deep(.input-icon-group),
  :deep(input.form-control) {
    flex: 1;
  }
}
</style>
