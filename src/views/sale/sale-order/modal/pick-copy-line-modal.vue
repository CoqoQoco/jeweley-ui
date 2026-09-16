<template>
  <modal :showModal="isShow" @closeModal="onClose" width="500px" headerVariant="main" :isShowActionPart="true">
    <template #title>
      <span class="title-text-lg d-block">{{ $t('view.sale.saleOrder.pendingConvertPickLineTitle') }}</span>
    </template>
    <template #content>
      <FormFieldGeneric :label="$t('view.sale.saleOrder.pendingConvertPickLineLabel')" :required="true">
        <DropdownGeneric
          v-model="selectedLineKey"
          :options="lineOptions"
          optionLabel="label"
          optionValue="lineKey"
        />
      </FormFieldGeneric>
    </template>
    <template #action>
      <ButtonGeneric variant="main" icon="bi-check2" :label="$t('common.btn.confirm')" :disabled="!selectedLineKey" @click="onConfirm" />
      <ButtonGeneric variant="outline" :label="$t('common.btn.cancel')" class="ml-2" @click="onClose" />
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'

import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

export default {
  name: 'PickCopyLineModal',

  components: {
    modal,
    FormFieldGeneric,
    DropdownGeneric,
    ButtonGeneric
  },

  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    copyItems: {
      type: Array,
      default: () => []
    }
  },

  emits: ['closeModal', 'confirm'],

  data() {
    return {
      selectedLineKey: null
    }
  },

  computed: {
    lineOptions() {
      return this.copyItems.map((item) => ({
        lineKey: item.lineKey,
        label: `${item.productNumber || item.description || '-'} (${this.$t('common.field.quantity')}: ${item.qty || 0})`
      }))
    }
  },

  watch: {
    isShow(val) {
      if (val) this.selectedLineKey = null
    }
  },

  methods: {
    onConfirm() {
      const copyItem = this.copyItems.find((item) => item.lineKey === this.selectedLineKey)
      if (!copyItem) return
      this.$emit('confirm', copyItem)
    },

    onClose() {
      this.$emit('closeModal')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
