<template>
  <modal
    :showModal="isShow"
    width="680px"
    headerVariant="main"
    :clickToClose="false"
    :isShowActionPart="true"
    @closeModal="onClose"
  >
    <template #title>
      <span class="title-text-lg d-block">
        {{ created ? $t('view.aiConnector.pat.resultTitle') : $t('view.aiConnector.pat.createTitle') }}
      </span>
    </template>

    <template #content>
      <div v-if="!created" class="pat-form">
        <div class="notice" role="note">
          <i class="bi bi-shield-lock notice__icon"></i>
          <span>{{ $t('view.aiConnector.pat.sensitiveWarning') }}</span>
        </div>

        <FormFieldGeneric :label="$t('view.aiConnector.pat.nameLabel')" :required="true" :error="nameError" inputId="pat-name">
          <InputTextGeneric id="pat-name" v-model="form.name" :maxlength="100" @keyup.enter="onSubmit" :placeholder="$t('view.aiConnector.pat.namePlaceholder')" />
        </FormFieldGeneric>

        <FormFieldGeneric :label="$t('view.aiConnector.pat.expiryLabel')">
          <ToggleGroupGeneric v-model="form.expiresInDays" :options="expiryOptions" :ariaLabel="$t('view.aiConnector.pat.expiryLabel')" />
        </FormFieldGeneric>

        <FormFieldGeneric v-if="patScopes.length" :label="$t('view.aiConnector.pat.scopesLabel')">
          <div v-for="scope in patScopes" :key="scope.code" class="scope-row">
            <CheckboxGeneric
              v-model="form.scopes"
              :value="scope.code"
              :binary="false"
              :label="scope.nameTh"
            />
            <div class="scope-desc">{{ scope.descriptionTh }}</div>
          </div>
        </FormFieldGeneric>
      </div>

      <div v-else class="pat-result">
        <div class="notice notice--strong" role="alert">
          <i class="bi bi-exclamation-triangle-fill notice__icon"></i>
          <span>{{ $t('view.aiConnector.pat.onceWarning') }}</span>
        </div>

        <FormFieldGeneric :label="$t('view.aiConnector.pat.codeLabel')">
          <div class="token-row">
            <code ref="tokenText" class="token-text">{{ created.token }}</code>
            <CopyButtonGeneric :value="created.token" variant="main" @copied="hasCopied = true" @fail="onCopyFail" />
          </div>
          <small v-if="copyFailed" class="copy-failed" role="alert">{{ $t('view.aiConnector.pat.copyFailed') }}</small>
        </FormFieldGeneric>

        <div class="summary">
          <div class="summary__title">{{ $t('view.aiConnector.pat.seesTitle') }}</div>
          <span v-for="code in created.scopes" :key="code" class="chip">{{ scopeName(code) }}</span>
          <div class="summary__expire">{{ $t('view.aiConnector.pat.expiresOn', { date: formatDate(created.expiresAt) }) }}</div>
        </div>
      </div>
    </template>

    <template #action>
      <template v-if="!created">
        <ButtonGeneric variant="main" icon="bi-key" :label="$t('view.aiConnector.pat.submitBtn')" @click="onSubmit" />
        <ButtonGeneric variant="outline" class="ml-2" :label="$t('common.btn.cancel')" @click="onClose" />
      </template>
      <ButtonGeneric v-else variant="main" :label="$t('view.aiConnector.pat.doneBtn')" @click="onClose" />
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'

import { useAiConnectorStore } from '@/stores/modules/api/ai-connector/ai-connector-store.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { formatDate } from '@/services/utils/dayjs.js'

import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import ToggleGroupGeneric from '@/components/generic/ToggleGroupGeneric.vue'
import CopyButtonGeneric from '@/components/generic/CopyButtonGeneric.vue'
import CheckboxGeneric from '@/components/prime-vue/CheckboxGeneric.vue'

import { PAT_EXPIRY_DAYS, formatScopeName } from '../ai-connect-helpers.js'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

const defaultForm = (patScopes) => ({
  name: '',
  expiresInDays: PAT_EXPIRY_DAYS[0],
  scopes: patScopes.map((scope) => scope.code)
})

export default {
  name: 'CreatePatModal',

  components: {
    modal,
    InputTextGeneric,
    FormFieldGeneric,
    ButtonGeneric,
    ToggleGroupGeneric,
    CopyButtonGeneric,
    CheckboxGeneric
  },

  props: {
    isShow: { type: Boolean, default: false },
    patScopes: { type: Array, default: () => [] }
  },

  emits: ['closeModal', 'created'],

  setup() {
    return { store: useAiConnectorStore() }
  },

  data() {
    return {
      form: defaultForm(this.patScopes),
      nameError: '',
      created: null,
      hasCopied: false,
      copyFailed: false
    }
  },

  computed: {
    expiryOptions() {
      return PAT_EXPIRY_DAYS.map((days) => ({
        value: days,
        label: this.$t('view.aiConnector.pat.expiryDays', { days })
      }))
    }
  },

  watch: {
    isShow(value) {
      if (value) this.resetState()
    },
    'form.name'() {
      this.nameError = ''
    }
  },

  methods: {
    formatDate,

    resetState() {
      this.form = defaultForm(this.patScopes)
      this.nameError = ''
      this.created = null
      this.hasCopied = false
      this.copyFailed = false
    },

    scopeName(code) {
      return formatScopeName(code, (key) => this.$t(key))
    },

    async onSubmit() {
      if (!this.form.name.trim()) {
        this.nameError = this.$t('view.aiConnector.pat.nameRequired')
        this.$nextTick(() => document.getElementById('pat-name')?.focus())
        return
      }
      const res = await this.store.createPat({
        name: this.form.name.trim(),
        expiresInDays: this.form.expiresInDays,
        scopes: this.form.scopes
      })
      if (res) {
        this.created = res
        this.$emit('created')
      }
    },

    onCopyFail() {
      this.copyFailed = true
      const node = this.$refs.tokenText
      if (!node) return
      const range = document.createRange()
      range.selectNodeContents(node)
      const selection = window.getSelection()
      selection.removeAllRanges()
      selection.addRange(range)
    },

    onClose() {
      if (this.created && !this.hasCopied) {
        confirmThenSubmit(
          this.$t('view.aiConnector.pat.closeConfirmMessage'),
          this.$t('view.aiConnector.pat.closeConfirmTitle'),
          () => this.closeNow(),
          { confirmText: this.$t('view.aiConnector.pat.closeConfirmBtn'), cancelText: this.$t('common.btn.back') }
        )
        return
      }
      this.closeNow()
    },

    closeNow() {
      this.created = null
      this.$emit('closeModal')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';

.notice {
  display: flex;
  gap: var(--sp-md);
  align-items: flex-start;
  padding: var(--sp-md) var(--sp-lg);
  margin-bottom: var(--sp-lg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-highlight-bg);
  line-height: var(--lh-md);

  &__icon {
    color: var(--base-font-color);
    font-size: var(--fs-lg);
  }

  &--strong {
    border-color: var(--base-font-color);
    font-weight: 600;
    color: var(--base-font-color);
  }
}

.pat-form :deep(.form-field) {
  margin-bottom: var(--sp-lg);
}

.scope-row {
  margin-bottom: var(--sp-sm);
}

.scope-desc {
  margin-left: var(--sp-2xl);
  color: var(--base-sub-color);
  font-size: var(--fs-sm);
}

.token-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-md);
  align-items: center;
}

.token-text {
  flex: 1 1 320px;
  min-width: 0;
  padding: var(--sp-sm) var(--sp-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  word-break: break-all;
  user-select: all;
}

.copy-failed {
  display: block;
  margin-top: var(--sp-xs);
  color: var(--base-font-color);
  font-weight: 600;
}

.summary {
  margin-top: var(--sp-lg);

  &__title {
    font-weight: 600;
    margin-bottom: var(--sp-xs);
  }

  &__expire {
    margin-top: var(--sp-sm);
    color: var(--base-sub-color);
    font-size: var(--fs-base);
  }
}

.chip {
  display: inline-block;
  margin: 0 var(--sp-xs) var(--sp-xs) 0;
  padding: 0 var(--sp-sm);
  border: 1px solid var(--base-green);
  border-radius: var(--radius-lg);
  color: var(--base-green);
  font-size: var(--fs-sm);
}
</style>
