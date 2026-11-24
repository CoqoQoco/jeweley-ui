<template>
  <div class="authorize-page">
    <main class="authorize-card" aria-live="polite">
      <h1 class="authorize-card__brand">{{ $t('view.aiConnector.authorize.pageTitle') }}</h1>

      <div v-if="state === 'loading'" class="status status--loading">
        <i class="bi bi-arrow-repeat spin"></i>
        {{ $t('view.aiConnector.authorize.loadingConsent') }}
      </div>

      <div v-else-if="state === 'framed'" class="status status--error">
        <i class="bi bi-window-x status__no"></i>
        <h2 class="authorize-card__title">{{ $t('view.aiConnector.authorize.framedTitle') }}</h2>
        <p>{{ $t('view.aiConnector.authorize.framedBody') }}</p>
      </div>

      <template v-else-if="state === 'ready'">
        <h2 class="authorize-card__title">{{ $t('view.aiConnector.authorize.requestTitle', { name: consent.clientName }) }}</h2>

        <div v-if="consent.clientVerified !== true" class="notice notice--warn" role="alert">
          <i class="bi bi-exclamation-triangle-fill notice__icon"></i>
          <span>{{ $t('view.aiConnector.authorize.unverifiedWarning') }}</span>
        </div>
        <dl class="client-detail">
          <template v-if="consent.clientVerified !== true">
            <dt>{{ $t('view.aiConnector.authorize.redirectUriLabel') }}</dt>
            <dd class="client-detail__uri">{{ consent.redirectUri }}</dd>
          </template>
          <dt>{{ $t('view.aiConnector.authorize.clientIdLabel') }}</dt>
          <dd>{{ consent.clientId }}</dd>
          <dt>{{ $t('view.aiConnector.authorize.redirectHostsLabel') }}</dt>
          <dd v-for="host in redirectHosts" :key="host">{{ host }}</dd>
        </dl>
        <p class="authorize-card__meta">
          {{ $t('view.aiConnector.authorize.signedInAs', { name: consent.userDisplayName }) }}
          ·
          <ButtonGeneric variant="plain" :label="$t('view.aiConnector.authorize.notYou')" @click="onSwitchAccount" />
        </p>

        <div class="notice" role="note">
          <i class="bi bi-eye notice__icon"></i>
          <span>{{ $t('view.aiConnector.authorize.readOnlyNote') }}</span>
        </div>

        <section v-if="scopeGroups.module.length" class="scope-group">
          <h3 class="scope-group__title">{{ $t('view.aiConnector.authorize.scopesTitle') }}</h3>
          <div v-for="scope in scopeGroups.module" :key="scope.code" class="scope-item">
            <CheckboxGeneric
              :modelValue="checked[scope.code]"
              :disabled="scope.required || !scope.available"
              :label="scope.nameTh"
              @update:modelValue="checked[scope.code] = $event"
            />
            <span v-if="scope.required" class="tag">{{ $t('view.aiConnector.authorize.requiredScope') }}</span>
            <div class="scope-item__desc">{{ scope.descriptionTh }}</div>
            <div v-if="!scope.available" class="scope-item__unavailable">
              <i class="bi bi-slash-circle"></i> {{ scope.unavailableReasonTh || $t('view.aiConnector.authorize.unavailableScope') }}
            </div>
          </div>
        </section>

        <section v-if="scopeGroups.data.length" class="scope-group">
          <h3 class="scope-group__title">{{ $t('view.aiConnector.authorize.dataScopesTitle') }}</h3>
          <div v-for="scope in scopeGroups.data" :key="scope.code" class="scope-item">
            <CheckboxGeneric
              :modelValue="checked[scope.code]"
              :disabled="scope.required || !scope.available"
              :label="scope.nameTh"
              @update:modelValue="checked[scope.code] = $event"
            />
            <div class="scope-item__desc">{{ scope.descriptionTh }}</div>
            <div v-if="!scope.available" class="scope-item__unavailable">
              <i class="bi bi-slash-circle"></i> {{ scope.unavailableReasonTh || $t('view.aiConnector.authorize.unavailableScope') }}
            </div>
          </div>
        </section>

        <div class="authorize-actions">
          <ButtonGeneric
            variant="main"
            icon="bi-check2-circle"
            :block="true"
            :loading="submitting === 'allow'"
            :disabled="submitting !== ''"
            :label="submitting === 'allow' ? $t('view.aiConnector.authorize.allowingBtn') : $t('view.aiConnector.authorize.allowBtn')"
            @click="onApprove"
          />
          <ButtonGeneric
            variant="outline"
            :block="true"
            :loading="submitting === 'deny'"
            :disabled="submitting !== ''"
            :label="submitting === 'deny' ? $t('view.aiConnector.authorize.denyingBtn') : $t('view.aiConnector.authorize.denyBtn')"
            @click="onDeny"
          />
        </div>
      </template>

      <div v-else-if="state === 'approved' || state === 'denied'" class="status status--done">
        <i :class="['bi', state === 'approved' ? 'bi-check-circle-fill status__ok' : 'bi-x-circle-fill status__no']"></i>
        <h2 class="authorize-card__title">
          {{ state === 'approved' ? $t('view.aiConnector.authorize.approvedTitle') : $t('view.aiConnector.authorize.deniedTitle') }}
        </h2>
        <p>{{ $t(`view.aiConnector.authorize.${doneMessageKey}`, { name: consent.clientName }) }}</p>
        <a v-if="redirectUrl" class="btn btn-sm btn-main back-link" :href="redirectUrl">
          {{ $t('view.aiConnector.authorize.backToApp', { name: consent.clientName }) }}
        </a>
      </div>

      <div v-else-if="state === 'noPermission'" class="status status--error">
        <i class="bi bi-shield-x status__no"></i>
        <h2 class="authorize-card__title">{{ $t('view.aiConnector.authorize.noPermissionTitle') }}</h2>
        <p>{{ consent.denyReasonTh || $t('view.aiConnector.authorize.noPermissionBody') }}</p>
        <ButtonGeneric variant="outline" :block="true" icon="bi-box-arrow-right" :label="$t('view.aiConnector.authorize.switchAccount')" @click="onSwitchAccount" />
      </div>

      <div v-else class="status status--error">
        <i class="bi bi-exclamation-octagon status__no"></i>
        <h2 class="authorize-card__title">{{ $t(`view.aiConnector.authorize.${errorKey}Title`) }}</h2>
        <p>{{ $t(`view.aiConnector.authorize.${errorKey}Body`) }}</p>
        <ButtonGeneric v-if="errorKey === 'unknown'" variant="outline" :block="true" :label="$t('view.aiConnector.authorize.retryBtn')" @click="loadConsent" />
      </div>
    </main>
  </div>
</template>

<script>
import { useAiConnectorStore } from '@/stores/modules/api/ai-connector/ai-connector-store.js'
import { useAuthStore } from '@/stores/modules/authen/authen-store.js'

import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import CheckboxGeneric from '@/components/prime-vue/CheckboxGeneric.vue'

import {
  buildApprovedScopes,
  buildConsentRequest,
  buildInitialChecked,
  isConsentRequestComplete,
  isFramed,
  resolveDoneMessageKey,
  resolveFinishResult,
  getRedirectHosts,
  resolveErrorState,
  splitScopesByKind
} from './oauth-authorize-helpers.js'

export default {
  name: 'OauthAuthorizeView',

  components: { ButtonGeneric, CheckboxGeneric },

  setup() {
    return { store: useAiConnectorStore(), authStore: useAuthStore() }
  },

  data() {
    return {
      state: 'loading',
      errorKey: 'invalid',
      request: buildConsentRequest(this.$route.query),
      consent: { clientName: '', clientId: '', clientVerified: false, redirectUri: '', redirectUris: [], redirectHost: '', userDisplayName: '', denyReasonTh: '', scopes: [] },
      checked: {},
      submitting: '',
      redirectUrl: ''
    }
  },

  computed: {
    redirectHosts() {
      const hosts = getRedirectHosts(this.consent.redirectUris)
      return hosts.length ? hosts : [this.consent.redirectHost].filter(Boolean)
    },

    doneMessageKey() {
      return resolveDoneMessageKey(this.state, this.redirectUrl)
    },

    scopeGroups() {
      return splitScopesByKind(this.consent.scopes)
    }
  },

  mounted() {
    if (isFramed()) {
      this.state = 'framed'
      return
    }
    this.loadConsent()
  },

  methods: {
    // try/catch เฉพาะหน้านี้: 400/503 ต้องแสดงสถานะบนหน้าเอง (store ปิด popup กลางด้วย skipError) ไม่ใช่ error ทั่วไป
    async loadConsent() {
      if (!isConsentRequestComplete(this.request)) {
        this.showError('invalid')
        return
      }
      this.state = 'loading'
      try {
        const res = await this.store.getConsent(this.request)
        this.consent = { ...this.consent, ...res, scopes: res?.scopes || [] }
        this.checked = buildInitialChecked(this.consent.scopes)
        this.state = res?.canApprove ? 'ready' : 'noPermission'
      } catch (err) {
        this.showError(resolveErrorState(err))
      }
    },

    showError(kind) {
      this.errorKey = kind === 'session' ? 'unknown' : kind
      this.state = 'error'
    },

    async onApprove() {
      if (this.submitting) return
      this.submitting = 'allow'
      try {
        const res = await this.store.approve({
          ...this.request,
          approvedScopes: buildApprovedScopes(this.consent.scopes, this.checked)
        })
        this.finish('approved', res)
      } catch (err) {
        this.submitting = ''
        this.showError(resolveErrorState(err))
      }
    },

    async onDeny() {
      if (this.submitting) return
      this.submitting = 'deny'
      try {
        const res = await this.store.deny(this.request)
        this.finish('denied', res)
      } catch (err) {
        this.submitting = ''
        this.showError(resolveErrorState(err))
      }
    },

    finish(state, response) {
      const result = resolveFinishResult(response, this.consent.redirectUri)
      if (!result.ok) {
        this.submitting = ''
        this.showError('invalid')
        return
      }
      this.state = state
      this.redirectUrl = result.redirectUrl
      if (result.redirectUrl) window.location.assign(result.redirectUrl)
    },

    async onSwitchAccount() {
      await this.authStore.logout()
      this.$router.push({ path: '/login', query: { redirect: this.$route.fullPath } })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/mixin.scss';

.authorize-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--sp-lg);
  background: var(--surface-inverse-gradient);
}

.authorize-card {
  @include card-base;
  width: 100%;
  max-width: 520px;
  box-shadow: var(--shadow-lg);

  &__brand {
    margin: 0 0 var(--sp-md);
    color: var(--base-green);
    font-size: var(--fs-base);
    font-weight: 600;
  }

  &__title {
    margin: 0 0 var(--sp-sm);
    color: var(--base-font-color);
    font-size: var(--fs-xl);
    line-height: var(--lh-sm);
  }

  &__meta {
    margin: 0 0 var(--sp-sm);
    color: var(--base-sub-color);
    font-size: var(--fs-base);
  }
}

.status {
  text-align: center;
  padding: var(--sp-lg) 0;

  > i {
    font-size: 2.5rem;
    display: block;
    margin-bottom: var(--sp-md);
  }

  &__ok {
    color: var(--base-green);
  }

  &__no {
    color: var(--base-red);
  }

  &--loading {
    color: var(--base-sub-color);

    > i {
      display: inline-block;
      font-size: var(--fs-lg);
      margin: 0 var(--sp-sm) 0 0;
    }
  }
}

.back-link {
  display: block;
  min-height: 44px;
  line-height: 32px;
  margin-top: var(--sp-md);
}

.notice {
  display: flex;
  gap: var(--sp-md);
  padding: var(--sp-md) var(--sp-lg);
  margin: var(--sp-lg) 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-highlight-bg);

  &__icon {
    color: var(--base-font-color);
    font-size: var(--fs-lg);
  }
}

.notice--warn {
  border-color: var(--base-red);
  color: var(--base-font-color);
  font-weight: 600;

  .notice__icon {
    color: var(--base-red);
  }
}

.client-detail {
  margin: 0 0 var(--sp-md);
  font-size: var(--fs-sm);
  color: var(--base-sub-color);

  dt {
    font-weight: 600;
  }

  dd {
    margin: 0 0 var(--sp-xs);
    word-break: break-all;
  }

  &__uri {
    color: var(--base-font-color);
    font-weight: 600;
    font-size: var(--fs-base);
    user-select: all;
  }
}

.scope-group {
  margin-bottom: var(--sp-lg);

  &__title {
    margin: 0 0 var(--sp-sm);
    font-size: var(--fs-base);
    font-weight: 600;
    color: var(--base-font-color);
  }
}

.scope-item {
  padding: var(--sp-sm) 0;

  &__desc {
    margin-left: var(--sp-2xl);
    color: var(--base-sub-color);
    font-size: var(--fs-sm);
    line-height: var(--lh-md);
  }

  &__unavailable {
    margin-left: var(--sp-2xl);
    color: var(--base-font-color);
    font-size: var(--fs-base);
  }
}

.tag {
  margin-left: var(--sp-sm);
  padding: 0 var(--sp-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  color: var(--base-sub-color);
  font-size: var(--fs-sm);
}

.authorize-actions {
  display: flex;
  flex-direction: column;
  gap: var(--sp-md);
  margin-top: var(--sp-lg);

  :deep(.btn) {
    min-height: 44px;
  }
}

.spin {
  animation: authorize-spin 0.8s linear infinite;
}

@keyframes authorize-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
