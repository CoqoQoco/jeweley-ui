<template>
  <modal :showModal="isShow" width="960px" :isShowActionPart="true" headerVariant="main" @closeModal="$emit('closeModal')">
    <template #title>
      <span class="title-text-lg d-block">
        <i class="bi bi-lightning-charge"></i> {{ $t('view.stock.product.quickPrice.boxTitle') }}
      </span>
    </template>
    <template #content>
      <quickPriceForm
        v-if="isShow"
        ref="form"
        :stockNumber="stockNumber"
        :salePrice="salePrice"
        :materials="materials"
        :isLot="isLot"
        :productionTypeSize="productionTypeSize"
        @validChange="canSave = $event"
        @saved="onSaved"
      />
    </template>
    <template #action>
      <ButtonGeneric variant="outline" icon="bi-arrow-counterclockwise" :label="$t('common.btn.clear')" @click="onReset" />
      <ButtonGeneric
        variant="main"
        icon="bi-save"
        class="ml-2"
        :label="$t('view.stock.product.quickPrice.save')"
        :disabled="!canSave"
        @click="onSave"
      />
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'

import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import quickPriceForm from './quick-price-form.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

export default {
  name: 'QuickPriceModal',

  components: { modal, ButtonGeneric, quickPriceForm },

  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    stockNumber: {
      type: String,
      required: true
    },
    salePrice: {
      type: Number,
      default: null
    },
    materials: {
      type: Array,
      default: () => []
    },
    isLot: {
      type: Boolean,
      default: false
    },
    productionTypeSize: {
      type: String,
      default: ''
    }
  },

  emits: ['closeModal', 'saved'],

  data() {
    return {
      canSave: false
    }
  },

  methods: {
    onReset() {
      this.$refs.form?.onReset()
    },

    onSave() {
      this.$refs.form?.onSave()
    },

    onSaved() {
      this.$emit('saved')
      this.$emit('closeModal')
    }
  }
}
</script>
