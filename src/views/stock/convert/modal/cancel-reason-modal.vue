<template>
  <modal :showModal="isShow" @closeModal="onClose" width="500px" headerVariant="main" :isShowActionPart="true">
    <template #title>
      <span class="title-text-lg d-block">{{ $t('view.stock.convert.cancelBtn') }}</span>
    </template>
    <template #content>
      <FormFieldGeneric :label="$t('view.stock.convert.cancelReasonLabel')" :required="true">
        <TextareaGeneric
          v-model="reason"
          :rows="3"
          :placeholder="$t('view.stock.convert.cancelReasonPlaceholder')"
        />
      </FormFieldGeneric>
    </template>
    <template #action>
      <ButtonGeneric variant="red" icon="bi-x-circle" :label="$t('common.btn.confirm')" @click="onConfirm" />
      <ButtonGeneric variant="outline" :label="$t('common.btn.cancel')" class="ml-2" @click="onClose" />
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'

import { warning } from '@/services/alert/sweetAlerts.js'

import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import TextareaGeneric from '@/components/generic/TextareaGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

export default {
  name: 'StockConvertCancelReasonModal',

  components: {
    modal,
    FormFieldGeneric,
    TextareaGeneric,
    ButtonGeneric
  },

  props: {
    isShow: {
      type: Boolean,
      default: false
    }
  },

  emits: ['closeModal', 'confirm'],

  data() {
    return {
      reason: ''
    }
  },

  watch: {
    isShow(val) {
      if (val) this.reason = ''
    }
  },

  methods: {
    onConfirm() {
      const trimmed = (this.reason || '').trim()
      if (!trimmed) {
        warning(this.$t('common.label.incompleteData'))
        return
      }
      this.$emit('confirm', trimmed)
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
