<template>
  <modal
    :showModal="isShow"
    width="560px"
    headerVariant="main"
    :clickToClose="false"
    :isShowActionPart="true"
    @closeModal="$emit('closeModal')"
  >
    <template #title>
      <span class="title-text-lg d-block">{{ $t('view.aiAdmin.suspend.title', { name: user?.displayName || '' }) }}</span>
    </template>

    <template #content>
      <div class="suspend-form">
        <p class="suspend-form__account">
          {{ $t('view.aiAdmin.suspend.account', { name: user?.displayName || '', username: user?.username || '' }) }}
        </p>
        <div class="notice" role="note">
          <i class="bi bi-exclamation-triangle-fill notice__icon"></i>
          <span>{{ $t('view.aiAdmin.suspend.effect') }}</span>
        </div>

        <FormFieldGeneric :label="$t('view.aiAdmin.suspend.reasonLabel')" :required="true" :error="reasonError" inputId="suspend-reason">
          <TextareaGeneric
            id="suspend-reason"
            v-model="reason"
            :rows="4"
            :maxlength="500"
            :placeholder="$t('view.aiAdmin.suspend.reasonPlaceholder')"
          />
        </FormFieldGeneric>
      </div>
    </template>

    <template #action>
      <div class="modal-actions">
        <ButtonGeneric variant="outline" :label="$t('common.btn.cancel')" @click="$emit('closeModal')" />
        <ButtonGeneric variant="red" icon="bi-slash-circle" :loading="submitting" :label="$t('view.aiAdmin.suspend.submitBtn')" @click="onSubmit" />
      </div>
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'

import { useAiAdminStore } from '@/stores/modules/api/ai-admin/ai-admin-store.js'
import { error as showError, success } from '@/services/alert/sweetAlerts.js'

import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import TextareaGeneric from '@/components/generic/TextareaGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

import { extractErrorText, isConflict } from '../ai-admin-helpers.js'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

export default {
  name: 'AiAdminSuspendModal',

  components: { modal, FormFieldGeneric, TextareaGeneric, ButtonGeneric },

  props: {
    isShow: { type: Boolean, default: false },
    user: { type: Object, default: null }
  },

  emits: ['closeModal', 'suspended'],

  setup() {
    return { store: useAiAdminStore() }
  },

  data() {
    return { reason: '', reasonError: '', submitting: false }
  },

  watch: {
    isShow(value) {
      if (value) {
        this.reason = ''
        this.reasonError = ''
      }
    },
    reason() {
      this.reasonError = ''
    }
  },

  methods: {
    // try/catch เฉพาะหน้านี้: 409 (ระงับอยู่แล้ว) ต้องแปลงเป็นข้อความเฉพาะ + โหลดรายการใหม่ ไม่ใช่ error ทั่วไป
    async onSubmit() {
      if (this.submitting) return
      const reason = this.reason.trim()
      if (!reason) {
        this.reasonError = this.$t('view.aiAdmin.suspend.reasonRequired')
        this.$nextTick(() => document.getElementById('suspend-reason')?.focus())
        return
      }
      this.submitting = true
      try {
        await this.store.suspend({ userId: this.user.userId, reason })
      } catch (err) {
        if (isConflict(err)) {
          showError(this.$t('view.aiAdmin.suspend.alreadySuspended'))
          this.$emit('suspended')
          this.$emit('closeModal')
          return
        }
        showError(extractErrorText(err, this.$t('view.aiAdmin.unknownError')))
        return
      } finally {
        this.submitting = false
      }
      success(this.$t('view.aiAdmin.suspend.done', { name: this.user.displayName }))
      this.$emit('suspended')
      this.$emit('closeModal')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';

.modal-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.suspend-form__account {
  margin: 0 0 var(--sp-md);
  font-weight: 600;
  color: var(--base-font-color);
}

.notice {
  display: flex;
  gap: var(--sp-md);
  align-items: flex-start;
  padding: var(--sp-md) var(--sp-lg);
  margin-bottom: var(--sp-lg);
  border: 1px solid var(--base-red);
  border-radius: var(--radius-md);
  background: var(--color-highlight-bg);
  line-height: var(--lh-md);
  font-weight: 600;

  &__icon {
    color: var(--base-red);
    font-size: var(--fs-lg);
  }
}
</style>
