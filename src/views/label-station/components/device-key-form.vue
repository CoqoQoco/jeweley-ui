<template>
  <div class="device-key-form">
    <SectionCardGeneric
      :title="$t('view.labelStation.keyFormTitle')"
      :description="$t('view.labelStation.keyFormDesc')"
      icon="bi-key"
      headerStyle="filled"
    >
      <div v-if="message" class="dk-message">
        <i class="bi bi-exclamation-triangle-fill"></i>
        {{ message }}
      </div>

      <FormFieldGeneric :label="$t('view.labelStation.keyInputLabel')" :required="true">
        <InputTextGeneric
          v-model.trim="keyInput"
          type="password"
          icon="bi-key"
          :placeholder="$t('view.labelStation.keyInputPlaceholder')"
        />
      </FormFieldGeneric>

      <div class="dk-actions">
        <ButtonGeneric
          variant="main"
          icon="bi-check-lg"
          :label="$t('common.btn.save')"
          :disabled="!keyInput"
          @click="onSave"
        />
      </div>
    </SectionCardGeneric>
  </div>
</template>

<script>
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

export default {
  name: 'DeviceKeyForm',

  components: { SectionCardGeneric, FormFieldGeneric, InputTextGeneric, ButtonGeneric },

  props: {
    message: {
      type: String,
      default: ''
    }
  },

  emits: ['save'],

  data() {
    return {
      keyInput: ''
    }
  },

  methods: {
    onSave() {
      if (!this.keyInput) return
      this.$emit('save', this.keyInput)
      this.keyInput = ''
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.device-key-form {
  max-width: 520px;
  margin: var(--sp-xl) auto;
  padding: 0 var(--sp-xl);
}

.dk-message {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  padding: var(--sp-md) var(--sp-lg);
  margin-bottom: var(--sp-lg);
  background: var(--status-cancelled-bg);
  color: var(--base-red);
  border-radius: var(--radius-md);
  font-size: var(--fs-base);
  font-weight: 600;
}

.dk-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--sp-lg);
}
</style>
