<template>
  <div>
    <modal :showModal="isShowModal" @closeModal="closeModal" :width="'500px'">
      <template v-slot:content>
        <div class="delete-reason-container">
          <div class="title-text-lg-bg">
            <i class="bi bi-exclamation-triangle mr-2"></i>
            <span>{{ $t('view.sale.invoiceDetail.deleteReasonTitle') }}</span>
          </div>

          <div class="form-group mt-3">
            <label class="form-label required">{{ $t('view.sale.invoiceDetail.deleteReasonLabel') }}</label>
            <TextareaGeneric
              v-model="reason"
              :rows="3"
              :placeholder="$t('view.sale.invoiceDetail.deleteReasonPlaceholder')"
            />
          </div>

          <div class="btn-submit-container mt-3">
            <div class="d-flex justify-content-end">
              <button class="btn btn-red mr-2" type="button" @click="onConfirm">
                <i class="bi bi-trash mr-1"></i>
                {{ $t('common.btn.confirm') }}
              </button>
              <button class="btn btn-outline-main" type="button" @click="closeModal">
                <i class="bi bi-x-circle mr-1"></i>
                {{ $t('common.btn.cancel') }}
              </button>
            </div>
          </div>
        </div>
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import TextareaGeneric from '@/components/generic/TextareaGeneric.vue'
import { warning } from '@/services/alert/sweetAlerts.js'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

export default {
  name: 'DeleteInvoiceReasonModal',

  components: {
    modal,
    TextareaGeneric
  },

  props: {
    isShowModal: {
      type: Boolean,
      default: false
    }
  },

  emits: ['close-modal', 'confirm'],

  data() {
    return {
      reason: ''
    }
  },

  watch: {
    isShowModal(newVal) {
      if (newVal) {
        this.reason = ''
      }
    }
  },

  methods: {
    onConfirm() {
      const trimmed = (this.reason || '').trim()
      if (!trimmed) {
        warning(
          this.$t('view.sale.invoiceDetail.validation.deleteReasonRequired'),
          this.$t('common.label.incompleteData')
        )
        return
      }

      this.$emit('confirm', trimmed)
    },

    closeModal() {
      this.$emit('close-modal')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form';

.form-label {
  font-weight: 600;
  color: var(--base-sub-color);
  margin-bottom: var(--sp-sm);
  display: block;

  &.required::after {
    content: ' *';
    color: var(--base-red);
  }
}
</style>
