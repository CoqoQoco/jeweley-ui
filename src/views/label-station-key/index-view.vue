<template>
  <div class="app-container">
    <pageTitle
      :title="$t('view.labelStationKey.pageTitle')"
      :description="$t('view.labelStationKey.pageDescription')"
      :isShowBtnClose="false"
    />

    <SectionCardGeneric
      class="mt-4"
      :title="$t('view.labelStationKey.sectionKey')"
      icon="bi-key"
      headerStyle="filled"
    >
      <template v-if="hasKey">
        <FormFieldGeneric :label="$t('view.labelStationKey.keyLabel')">
          <div class="key-row">
            <InputTextGeneric
              class="key-input"
              :type="isRevealed ? 'text' : 'password'"
              :modelValue="deviceKey"
              :disabled="true"
              icon="bi-key"
            />
            <ButtonGeneric
              variant="outline"
              :icon="isRevealed ? 'bi-eye-slash' : 'bi-eye'"
              :label="isRevealed ? $t('view.labelStationKey.hideBtn') : $t('view.labelStationKey.showBtn')"
              @click="isRevealed = !isRevealed"
            />
            <ButtonGeneric
              variant="green"
              icon="bi-clipboard"
              :label="$t('common.btn.copy')"
              @click="onCopy"
            />
          </div>
        </FormFieldGeneric>

        <div class="meta-row">
          <span>{{ $t('view.labelStationKey.createDate') }}: {{ formatDate(createDate) }}</span>
          <span>{{ $t('view.labelStationKey.createBy') }}: {{ createBy || '-' }}</span>
        </div>
      </template>
      <div v-else class="empty-hint">{{ $t('view.labelStationKey.noKeyMsg') }}</div>

      <div class="actions-row">
        <ButtonGeneric
          :variant="hasKey ? 'red' : 'main'"
          icon="bi-arrow-repeat"
          :label="hasKey ? $t('view.labelStationKey.regenerateBtn') : $t('view.labelStationKey.generateBtn')"
          @click="onGenerate"
        />
      </div>
    </SectionCardGeneric>

    <SectionCardGeneric
      class="mt-4"
      :title="$t('view.labelStationKey.sectionHowTo')"
      icon="bi-info-circle"
      headerStyle="filled"
    >
      <p class="howto-text">{{ $t('view.labelStationKey.howToMsg') }}</p>
      <div class="howto-link">
        <i class="bi bi-link-45deg"></i>
        <a :href="stationUrl" target="_blank" rel="noopener">{{ stationUrl }}</a>
      </div>
    </SectionCardGeneric>
  </div>
</template>

<script>
import { useLabelStationKeyApiStore } from '@/stores/modules/api/print/label-station-key-store.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { success } from '@/services/alert/sweetAlerts.js'
import { formatDateTime } from '@/services/utils/dayjs.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

export default {
  name: 'LabelStationKeyIndexView',

  components: { SectionCardGeneric, FormFieldGeneric, InputTextGeneric, ButtonGeneric },

  setup() {
    const keyStore = useLabelStationKeyApiStore()
    return { keyStore }
  },

  data() {
    return {
      deviceKey: null,
      createDate: null,
      createBy: null,
      isRevealed: false
    }
  },

  computed: {
    hasKey() {
      return !!this.deviceKey
    },

    stationUrl() {
      return `${window.location.origin}/label-station`
    }
  },

  mounted() {
    this.loadKey()
  },

  methods: {
    applyKey(res) {
      this.deviceKey = res?.deviceKey || null
      this.createDate = res?.createDate || null
      this.createBy = res?.createBy || null
      this.isRevealed = false
    },

    async loadKey() {
      this.applyKey(await this.keyStore.fetchKey())
    },

    formatDate(date) {
      return date ? formatDateTime(date) : '-'
    },

    // clipboard API อาจใช้ไม่ได้ (สิทธิ์/เบราว์เซอร์เก่า) — จุดที่ได้รับอนุญาตให้ try-catch
    async onCopy() {
      try {
        await navigator.clipboard.writeText(this.deviceKey)
        success(this.$t('view.labelStationKey.copiedMsg'))
      } catch {
        this.isRevealed = true
      }
    },

    onGenerate() {
      const title = this.hasKey
        ? this.$t('view.labelStationKey.confirmRegenerateTitle')
        : this.$t('view.labelStationKey.confirmGenerateTitle')
      const msg = this.hasKey ? this.$t('view.labelStationKey.confirmRegenerateMsg') : ''
      confirmThenSubmit(msg, title, async () => {
        const res = await this.keyStore.generateKey()
        this.applyKey(res)
        success(this.$t('view.labelStationKey.generateSuccessMsg'))
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.key-row {
  display: flex;
  align-items: center;
  gap: var(--sp-md);
  flex-wrap: wrap;
}

.key-input {
  flex: 1;
  min-width: 260px;
}

.meta-row {
  display: flex;
  gap: var(--sp-xl);
  flex-wrap: wrap;
  margin-top: var(--sp-md);
  color: var(--base-font-color);
  font-size: var(--fs-sm);
}

.empty-hint {
  color: var(--base-font-color);
  font-size: var(--fs-base);
}

.actions-row {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--sp-lg);
}

.howto-text {
  margin: 0 0 var(--sp-sm);
  color: var(--base-font-color);
}

.howto-link {
  display: flex;
  align-items: center;
  gap: var(--sp-xs);
}
</style>
