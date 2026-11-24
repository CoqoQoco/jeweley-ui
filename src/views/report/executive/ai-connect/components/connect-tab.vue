<template>
  <div class="connect-tab">
    <div class="info-box" role="note">
      <i class="bi bi-info-circle info-box__icon"></i>
      <div>
        <div class="info-box__title">{{ $t('view.aiConnector.connect.infoTitle') }}</div>
        <ul class="info-box__list">
          <li>{{ $t('view.aiConnector.connect.infoReadOnly') }}</li>
          <li>{{ $t('view.aiConnector.connect.infoSensitive') }}</li>
          <li>{{ $t('view.aiConnector.connect.infoRevoke') }}</li>
        </ul>
      </div>
    </div>

    <SectionCardGeneric :title="$t('view.aiConnector.connect.urlTitle')" icon="bi-link-45deg" headerStyle="legend" class="connect-tab__card">
      <div v-if="!configured" class="not-configured">
        <i class="bi bi-exclamation-triangle"></i>
        {{ $t('view.aiConnector.connect.notConfigured') }}
      </div>
      <template v-else>
        <FormFieldGeneric :label="$t('view.aiConnector.connect.urlLabel')">
          <div class="url-row">
            <code ref="urlText" class="url-text">{{ mcpUrl }}</code>
            <CopyButtonGeneric :value="mcpUrl" @fail="selectUrlText" />
          </div>
        </FormFieldGeneric>
        <p class="hint">{{ $t('view.aiConnector.connect.urlHint') }}</p>
      </template>
    </SectionCardGeneric>

    <SectionCardGeneric :title="$t('view.aiConnector.connect.stepsTitle')" icon="bi-list-ol" headerStyle="legend" class="connect-tab__card">
      <div class="app-picker">
        <span class="title-text">{{ $t('view.aiConnector.connect.appLabel') }}</span>
        <ToggleGroupGeneric
          v-model="app"
          :options="appOptions"
          :ariaLabel="$t('view.aiConnector.connect.appLabel')"
        />
      </div>
      <p class="method-label">
        <i :class="['bi', app === 'other' ? 'bi-key' : 'bi-shield-check']"></i>
        {{ app === 'other' ? $t('view.aiConnector.connect.methodPat') : $t('view.aiConnector.connect.methodOauth') }}
      </p>
      <ol class="steps">
        <li v-for="(step, index) in steps" :key="step" class="step">
          <span class="step-number">{{ index + 1 }}</span>
          <span class="step-text">{{ step }}</span>
        </li>
      </ol>
      <p v-if="app === 'other'" class="hint">{{ $t('view.aiConnector.connect.otherNote') }}</p>
    </SectionCardGeneric>
  </div>
</template>

<script>
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import ToggleGroupGeneric from '@/components/generic/ToggleGroupGeneric.vue'
import CopyButtonGeneric from '@/components/generic/CopyButtonGeneric.vue'

export default {
  name: 'ConnectTab',

  components: { SectionCardGeneric, FormFieldGeneric, ToggleGroupGeneric, CopyButtonGeneric },

  props: {
    mcpUrl: { type: String, default: '' },
    configured: { type: Boolean, default: false }
  },

  data() {
    return { app: 'claude' }
  },

  computed: {
    appOptions() {
      return [
        { value: 'claude', label: this.$t('view.aiConnector.connect.appClaude') },
        { value: 'chatgpt', label: this.$t('view.aiConnector.connect.appChatgpt') },
        { value: 'other', label: this.$t('view.aiConnector.connect.appOther') }
      ]
    },

    steps() {
      return [1, 2, 3].map((n) => this.$t(`view.aiConnector.connect.${this.app === 'other' ? 'other' : this.app}Step${n}`))
    }
  },

  methods: {
    selectUrlText() {
      const node = this.$refs.urlText
      if (!node) return
      const range = document.createRange()
      range.selectNodeContents(node)
      const selection = window.getSelection()
      selection.removeAllRanges()
      selection.addRange(range)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';

.info-box {
  display: flex;
  gap: var(--sp-md);
  padding: var(--sp-lg);
  margin-bottom: var(--sp-lg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-highlight-bg);
  color: var(--base-sub-color);

  &__icon {
    color: var(--base-font-color);
    font-size: var(--fs-lg);
  }

  &__title {
    font-weight: 600;
    color: var(--base-font-color);
    margin-bottom: var(--sp-xs);
  }

  &__list {
    margin: 0;
    padding-left: var(--sp-xl);
    line-height: var(--lh-md);
  }
}

.connect-tab__card {
  margin-bottom: var(--sp-lg);
}

.url-row {
  display: flex;
  align-items: center;
  gap: var(--sp-md);
  flex-wrap: wrap;
}

.url-text {
  flex: 1 1 280px;
  min-width: 0;
  padding: var(--sp-sm) var(--sp-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-card-bg);
  color: var(--base-sub-color);
  word-break: break-all;
  user-select: all;
}

.hint {
  margin: var(--sp-sm) 0 0;
  color: var(--base-sub-color);
  font-size: var(--fs-base);
}

.not-configured {
  display: flex;
  gap: var(--sp-sm);
  align-items: center;
  color: var(--base-font-color);

  i {
    color: var(--base-red);
  }
}

.app-picker {
  display: flex;
  align-items: center;
  gap: var(--sp-md);
  flex-wrap: wrap;
  margin-bottom: var(--sp-md);
}

.method-label {
  margin: 0 0 var(--sp-md);
  color: var(--base-green);
  font-weight: 600;
}

.steps {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--sp-md);
}

.step {
  display: flex;
  align-items: flex-start;
  gap: var(--sp-md);
  padding: var(--sp-md) var(--sp-lg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.step-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--base-font-color);
  color: var(--on-inverse);
  font-size: var(--fs-sm);
  font-weight: 700;
  flex-shrink: 0;
}

.step-text {
  line-height: var(--lh-md);
}
</style>
