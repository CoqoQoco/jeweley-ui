<template>
  <div class="app-container ai-guide-page">
    <PageHeaderGeneric :title="$t('view.aiConnector.guide.title')" backRoute="executive">
      <template v-if="canAiConnect" #actions>
        <ButtonGeneric variant="outline" icon="bi-robot" :label="$t('view.aiConnector.guide.connectBtn')" @click="goConnect" />
      </template>
    </PageHeaderGeneric>
    <p class="ai-guide-page__subtitle">{{ $t('view.aiConnector.guide.subtitle') }}</p>

    <div class="info-box" role="note">
      <i class="bi bi-info-circle info-box__icon"></i>
      <div>
        <div class="info-box__title">{{ $t('view.aiConnector.guide.startTitle') }}</div>
        <p class="info-box__intro">{{ $t('view.aiConnector.guide.startIntro') }}</p>
        <ul class="info-box__list">
          <li class="info-box__emphasis">{{ $t('view.aiConnector.guide.startFreeForm') }}</li>
          <li v-for="app in appKeys" :key="app">{{ $t(`view.aiConnector.guide.app${capitalize(app)}`) }}</li>
          <li>{{ $t('view.aiConnector.guide.startAsOf') }}</li>
          <li>{{ $t('view.aiConnector.guide.startReadOnly') }}</li>
        </ul>
      </div>
    </div>

    <div class="responsive-grid-2col">
      <SectionCardGeneric
        v-for="cat in categories"
        :key="cat.key"
        :title="$t(categoryTitleKey(cat.key))"
        :icon="cat.icon"
        headerStyle="legend"
      >
        <ul class="question-list">
          <li v-for="item in cat.questions" :key="item.key" class="question-row">
            <div class="question-row__body">
              <span class="question-row__text">{{ $t(questionTextKey(item.key)) }}</span>
              <div v-if="item.sensitive.length" class="question-row__needs">
                <span v-for="need in item.sensitive" :key="need" class="needs-tag">
                  <i class="bi bi-lock"></i>{{ $t(needsKey(need)) }}
                </span>
              </div>
            </div>
            <CopyButtonGeneric :value="$t(questionTextKey(item.key))" :label="$t('view.aiConnector.guide.copyLabel')" class="question-row__copy" />
          </li>
        </ul>
      </SectionCardGeneric>

      <SectionCardGeneric :title="$t('view.aiConnector.guide.notYetTitle')" icon="bi-hourglass-split" headerStyle="legend">
        <ul class="plain-list">
          <li v-for="key in notYetKeys" :key="key">{{ $t(`view.aiConnector.guide.notYet.${key}`) }}</li>
        </ul>
      </SectionCardGeneric>

      <SectionCardGeneric :title="$t('view.aiConnector.guide.tipsTitle')" icon="bi-lightbulb" headerStyle="legend">
        <ul class="plain-list">
          <li v-for="key in tipKeys" :key="key">{{ $t(`view.aiConnector.guide.tips.${key}`) }}</li>
          <li>
            {{ $t('view.aiConnector.guide.tips.masked') }}
            <ButtonGeneric
              v-if="canAiConnect"
              variant="outline"
              icon="bi-robot"
              class="tips-link"
              :label="$t('view.aiConnector.guide.tipsConnectLink')"
              @click="goConnect"
            />
          </li>
        </ul>
      </SectionCardGeneric>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/modules/authen/authen-store.js'
import { PermissionService } from '@/services/permission/permission.js'
import { PERMISSIONS } from '@/services/permission/config.js'

import PageHeaderGeneric from '@/components/generic/PageHeaderGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import CopyButtonGeneric from '@/components/generic/CopyButtonGeneric.vue'

import {
  GUIDE_CATEGORIES,
  GUIDE_NOT_YET_KEYS,
  GUIDE_TIP_KEYS,
  GUIDE_APP_KEYS,
  questionTextKey,
  categoryTitleKey,
  needsKey
} from './ai-guide-content.js'

export default {
  name: 'ExecutiveAiGuide',

  components: { PageHeaderGeneric, ButtonGeneric, SectionCardGeneric, CopyButtonGeneric },

  data() {
    return {
      categories: GUIDE_CATEGORIES,
      notYetKeys: GUIDE_NOT_YET_KEYS,
      tipKeys: GUIDE_TIP_KEYS,
      appKeys: GUIDE_APP_KEYS
    }
  },

  computed: {
    canAiConnect() {
      const authStore = useAuthStore()
      return new PermissionService(authStore.getUser, authStore.permissions).hasPermission(PERMISSIONS.AI_CONNECT)
    }
  },

  methods: {
    questionTextKey,
    categoryTitleKey,
    needsKey,

    capitalize(text) {
      return text.charAt(0).toUpperCase() + text.slice(1)
    },

    goConnect() {
      this.$router.push({ name: 'executive-ai-connect' })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.ai-guide-page__subtitle {
  margin: 0 0 var(--sp-lg);
  color: var(--base-sub-color);
  font-size: var(--fs-base);
}

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

  &__intro {
    margin: 0 0 var(--sp-xs);
  }

  &__emphasis {
    font-weight: 600;
    color: var(--base-font-color);
  }

  &__list {
    margin: 0;
    padding-left: var(--sp-xl);
    line-height: var(--lh-md);
  }
}

.question-list,
.plain-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--sp-sm);
}

.plain-list li {
  line-height: var(--lh-md);
}

.question-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--sp-md);
  padding: var(--sp-sm) var(--sp-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);

  &__body {
    flex: 1 1 auto;
    min-width: 0;
  }

  &__text {
    line-height: var(--lh-md);
    overflow-wrap: anywhere;
    user-select: text;
  }

  &__needs {
    display: flex;
    flex-wrap: wrap;
    gap: var(--sp-xs);
    margin-top: var(--sp-xs);
  }

  &__copy {
    flex-shrink: 0;
  }
}

.needs-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
  padding: 0 var(--sp-sm);
  border-radius: var(--radius-md);
  background: var(--status-open-bg);
  color: var(--base-font-color);
  font-size: var(--fs-base);
}

.tips-link {
  display: inline-flex;
  margin-left: var(--sp-sm);
}
</style>
