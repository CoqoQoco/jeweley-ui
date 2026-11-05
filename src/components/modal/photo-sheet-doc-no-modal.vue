<template>
  <modal :showModal="modelValue" width="480px" :isShowActionPart="true" @closeModal="onCancel">
    <template #title>
      <span class="title-text-lg">
        <i class="bi bi-images mr-2"></i>{{ $t('view.sale.photoSheetDialog.title') }}
      </span>
    </template>
    <template #content>
      <div class="form-group">
        <span class="title-text">{{ $t('view.sale.photoSheetDialog.docNoLabel') }}</span>
        <InputTextGeneric
          v-model="docNo"
          class="mt-1"
          :bgInput="true"
          :placeholder="$t('view.sale.photoSheetDialog.docNoLabel')"
          @keyup.enter="onConfirm"
        />
      </div>
      <div class="notice-box mt-3">
        <i class="bi bi-info-circle mr-1"></i>
        {{ $t('view.sale.photoSheetDialog.hint') }}
      </div>
    </template>
    <template #action>
      <ButtonGeneric
        variant="main"
        icon="bi-file-earmark-pdf"
        :label="$t('view.sale.photoSheetDialog.confirm')"
        class="mr-2"
        @click="onConfirm"
      />
      <ButtonGeneric
        variant="outline"
        icon="bi-x-circle"
        :label="$t('view.sale.photoSheetDialog.cancel')"
        @click="onCancel"
      />
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'

import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import { normalizeDocNo } from '@/services/helper/pdf/photo-sheet/photo-sheet-doc-no.js'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

export default {
  name: 'PhotoSheetDocNoModal',

  components: {
    modal,
    ButtonGeneric,
    InputTextGeneric
  },

  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    defaultDocNo: {
      type: String,
      default: ''
    }
  },

  emits: ['update:modelValue', 'confirm'],

  data() {
    return {
      docNo: this.defaultDocNo || ''
    }
  },

  watch: {
    modelValue(val) {
      if (val) this.docNo = this.defaultDocNo || ''
    }
  },

  methods: {
    onConfirm() {
      this.$emit('confirm', normalizeDocNo(this.docNo))
      this.$emit('update:modelValue', false)
    },

    onCancel() {
      this.$emit('update:modelValue', false)
    }
  }
}
</script>

<style lang="scss" scoped>
.title-text-lg {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--base-font-color);
  display: flex;
  align-items: center;
}

.notice-box {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
  background: var(--color-highlight-bg);
  padding: var(--sp-sm) var(--sp-md);
  border-radius: var(--radius-sm);
}
</style>
