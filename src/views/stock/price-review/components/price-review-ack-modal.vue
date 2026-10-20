<template>
  <modal :showModal="isShow" width="520px" headerVariant="main" :isShowActionPart="true" @closeModal="$emit('close')">
    <template #title>
      <span class="title-text-lg d-block">
        <i class="bi bi-check2-circle"></i>
        {{ $t('view.stock.priceReview.ackModalTitle') }}
      </span>
    </template>

    <template #content>
      <p class="intro">{{ $t('view.stock.priceReview.ackModalIntro', { count }) }}</p>
      <span class="title-text">{{ $t('view.stock.priceReview.ackNoteLabel') }}</span>
      <TextareaGeneric
        v-model="note"
        :rows="3"
        :maxlength="noteMax"
        :placeholder="$t('view.stock.priceReview.ackNotePlaceholder')"
      />
      <div class="note-counter">{{ note.length }}/{{ noteMax }}</div>
    </template>

    <template #action>
      <ButtonGeneric variant="main" icon="bi-check2" :label="$t('common.btn.confirm')" @click="onConfirm" />
      <ButtonGeneric variant="outline" class="ml-2" :label="$t('common.btn.cancel')" @click="$emit('close')" />
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'

import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import TextareaGeneric from '@/components/generic/TextareaGeneric.vue'
import { ACK_NOTE_MAX } from '../price-review-helpers.js'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

export default {
  name: 'PriceReviewAckModal',

  components: { modal, ButtonGeneric, TextareaGeneric },

  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    count: {
      type: Number,
      default: 0
    }
  },

  emits: ['close', 'confirm'],

  data() {
    return {
      note: '',
      noteMax: ACK_NOTE_MAX
    }
  },

  watch: {
    isShow(value) {
      if (value) this.note = ''
    }
  },

  methods: {
    onConfirm() {
      this.$emit('confirm', this.note.trim())
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.intro {
  margin: 0 0 var(--sp-lg);
  color: var(--base-font-color);
  font-weight: 600;
}

.note-counter {
  margin-top: var(--sp-xs);
  text-align: right;
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}
</style>
