<template>
  <div class="app-container">
    <pageTitle
      :title="$t('view.setting.breakdown.pageTitle')"
      :description="$t('view.setting.breakdown.pageDescription')"
      :isShowBtnClose="false"
    />

    <SectionCardGeneric
      class="mt-4"
      :title="$t('view.setting.breakdown.sectionTitle')"
      icon="bi-gem"
      headerStyle="filled"
    >
      <div class="form-row two-col">
        <FormFieldGeneric :label="$t('view.setting.breakdown.goldLossPercent')" :required="true">
          <InputTextGeneric type="number" step="0.01" :min="0" v-model.number="form.goldLossPercent" />
        </FormFieldGeneric>
        <FormFieldGeneric :label="$t('view.setting.breakdown.settingDiamondRate')" :required="true">
          <InputTextGeneric type="number" step="0.01" :min="0" v-model.number="form.settingDiamondRate" />
        </FormFieldGeneric>
      </div>
      <div class="form-row">
        <FormFieldGeneric :label="$t('view.setting.breakdown.settingStoneRate')" :required="true">
          <InputTextGeneric type="number" step="0.01" :min="0" v-model.number="form.settingStoneRate" />
        </FormFieldGeneric>
      </div>
    </SectionCardGeneric>

    <SectionCardGeneric
      class="mt-4"
      :title="$t('view.setting.breakdown.alloySectionTitle')"
      icon="bi-droplet-half"
      headerStyle="filled"
    >
      <div class="form-row two-col">
        <FormFieldGeneric :label="$t('view.setting.breakdown.alloyFactor18K')" :required="true">
          <InputTextGeneric type="number" step="0.0001" :min="0" v-model.number="form.alloyFactor18K" />
        </FormFieldGeneric>
        <FormFieldGeneric :label="$t('view.setting.breakdown.alloyFactor14K')" :required="true">
          <InputTextGeneric type="number" step="0.0001" :min="0" v-model.number="form.alloyFactor14K" />
        </FormFieldGeneric>
      </div>
      <div class="form-row two-col">
        <FormFieldGeneric :label="$t('view.setting.breakdown.alloyFactor9K')" :required="true">
          <InputTextGeneric type="number" step="0.0001" :min="0" v-model.number="form.alloyFactor9K" />
        </FormFieldGeneric>
        <FormFieldGeneric :label="$t('view.setting.breakdown.alloyRateYgWgUsd')" :required="true">
          <InputTextGeneric type="number" step="0.01" :min="0" v-model.number="form.alloyRateYgWgUsd" />
        </FormFieldGeneric>
      </div>
      <div class="form-row">
        <FormFieldGeneric :label="$t('view.setting.breakdown.alloyRatePgUsd')" :required="true">
          <InputTextGeneric type="number" step="0.01" :min="0" v-model.number="form.alloyRatePgUsd" />
        </FormFieldGeneric>
      </div>
    </SectionCardGeneric>

    <div class="action-bar">
      <div></div>
      <ButtonGeneric variant="main" icon="bi-save" :label="$t('common.btn.save')" @click="onSave" />
    </div>
  </div>
</template>

<script>
// External dependencies
import { defineAsyncComponent } from 'vue'
import { getBreakdownSetting, saveBreakdownSetting, BREAKDOWN_SETTING_DEFAULT } from '@/services/helper/breakdown-setting-store.js'
import { warning, success } from '@/services/alert/sweetAlerts.js'

// Local components
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

const pageTitle = defineAsyncComponent(() => import('@/components/custom/page-title.vue'))

export default {
  name: 'BreakdownSettingView',

  components: {
    pageTitle,
    SectionCardGeneric,
    FormFieldGeneric,
    InputTextGeneric,
    ButtonGeneric
  },

  data() {
    return {
      form: { ...BREAKDOWN_SETTING_DEFAULT }
    }
  },

  async mounted() {
    this.form = await getBreakdownSetting()
  },

  methods: {
    validateForm() {
      const fields = [
        'goldLossPercent',
        'settingDiamondRate',
        'settingStoneRate',
        'alloyFactor18K',
        'alloyFactor14K',
        'alloyFactor9K',
        'alloyRateYgWgUsd',
        'alloyRatePgUsd'
      ]
      for (const key of fields) {
        const val = Number(this.form[key])
        if (this.form[key] === '' || this.form[key] === null || isNaN(val) || val < 0) {
          warning(this.$t('view.setting.breakdown.validation.invalidNumber'))
          return false
        }
      }
      return true
    },

    async onSave() {
      if (!this.validateForm()) return

      const payload = {
        goldLossPercent: Number(this.form.goldLossPercent),
        settingDiamondRate: Number(this.form.settingDiamondRate),
        settingStoneRate: Number(this.form.settingStoneRate),
        alloyFactor18K: Number(this.form.alloyFactor18K),
        alloyFactor14K: Number(this.form.alloyFactor14K),
        alloyFactor9K: Number(this.form.alloyFactor9K),
        alloyRateYgWgUsd: Number(this.form.alloyRateYgWgUsd),
        alloyRatePgUsd: Number(this.form.alloyRatePgUsd)
      }
      await saveBreakdownSetting(payload)
      success(this.$t('view.setting.breakdown.saveSuccess'))
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/mixin.scss';
@import '@/assets/scss/responsive-style/web';

.app-container {
  padding: var(--sp-lg);
}

.form-row {
  margin-bottom: var(--sp-lg);

  &.two-col {
    @include form-row-grid(2);
  }

  &:last-child {
    margin-bottom: 0;
  }
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--color-border);
  padding-top: var(--sp-lg);
  margin-top: var(--sp-lg);
}
</style>
