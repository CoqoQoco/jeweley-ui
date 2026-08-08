<template>
  <div class="app-container">
    <pageTitle
      :title="$t('view.setting.companyInfo.pageTitle')"
      :description="$t('view.setting.companyInfo.pageDescription')"
      :isShowBtnClose="false"
    />

    <SectionCardGeneric
      class="mt-4"
      :title="$t('view.setting.companyInfo.sectionCompany')"
      icon="bi-building"
      headerStyle="filled"
    >
      <div class="form-row two-col">
        <FormFieldGeneric :label="$t('view.setting.companyInfo.companyName')" :required="true">
          <InputTextGeneric v-model.trim="form.name" />
        </FormFieldGeneric>
        <FormFieldGeneric :label="$t('view.setting.companyInfo.taxId')" :required="true">
          <InputTextGeneric v-model.trim="form.taxId" />
        </FormFieldGeneric>
      </div>
      <div class="form-row">
        <FormFieldGeneric :label="$t('view.setting.companyInfo.address')" :required="true">
          <TextareaGeneric v-model="form.address" :rows="2" />
        </FormFieldGeneric>
      </div>
      <div class="form-row two-col">
        <FormFieldGeneric :label="$t('view.setting.companyInfo.phone')">
          <InputTextGeneric type="tel" icon="bi-telephone-fill" v-model.trim="form.phone" />
        </FormFieldGeneric>
        <FormFieldGeneric :label="$t('view.setting.companyInfo.fax')">
          <InputTextGeneric v-model.trim="form.fax" />
        </FormFieldGeneric>
      </div>
      <div class="form-row">
        <FormFieldGeneric :label="$t('view.setting.companyInfo.email')">
          <InputTextGeneric type="email" icon="bi-envelope-check-fill" v-model.trim="form.email" />
        </FormFieldGeneric>
      </div>
    </SectionCardGeneric>

    <SectionCardGeneric
      class="mt-4"
      :title="$t('view.setting.companyInfo.sectionBank')"
      icon="bi-bank"
      headerStyle="filled"
    >
      <div class="bank-hint">
        <i class="bi bi-exclamation-triangle-fill mr-1"></i>
        {{ $t('view.setting.companyInfo.accountNumberHint') }}
      </div>
      <div class="form-row two-col mt-3">
        <FormFieldGeneric :label="$t('view.setting.companyInfo.bankName')">
          <InputTextGeneric v-model.trim="form.bankName" />
        </FormFieldGeneric>
        <FormFieldGeneric :label="$t('view.setting.companyInfo.accountName')">
          <InputTextGeneric v-model.trim="form.accountName" />
        </FormFieldGeneric>
      </div>
      <div class="form-row two-col">
        <FormFieldGeneric :label="$t('view.setting.companyInfo.accountNumber')">
          <InputTextGeneric v-model.trim="form.accountNumber" />
        </FormFieldGeneric>
        <FormFieldGeneric :label="$t('view.setting.companyInfo.swift')">
          <InputTextGeneric v-model.trim="form.swift" />
        </FormFieldGeneric>
      </div>
      <div class="form-row">
        <FormFieldGeneric :label="$t('view.setting.companyInfo.branch')">
          <InputTextGeneric v-model.trim="form.branch" />
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
import { getCompanySetting, saveCompanySetting } from '@/services/helper/company-info-store.js'
import { COMPANY_INFO, COMPANY_TAX_ID, COMPANY_BANK, resetCompanyInfoCache } from '@/config/company-info.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { warning, success } from '@/services/alert/sweetAlerts.js'

// Local components
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import TextareaGeneric from '@/components/generic/TextareaGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

const pageTitle = defineAsyncComponent(() => import('@/components/custom/page-title.vue'))

const interfaceForm = {
  name: '',
  taxId: '',
  address: '',
  phone: '',
  fax: '',
  email: '',
  bankName: '',
  accountName: '',
  accountNumber: '',
  swift: '',
  branch: ''
}

export default {
  name: 'CompanyInfoSettingView',

  components: {
    pageTitle,
    SectionCardGeneric,
    FormFieldGeneric,
    InputTextGeneric,
    TextareaGeneric,
    ButtonGeneric
  },

  data() {
    return {
      form: { ...interfaceForm }
    }
  },

  async mounted() {
    const saved = await getCompanySetting()

    this.form = {
      name: saved?.info?.name || COMPANY_INFO.name,
      taxId: saved?.taxId || COMPANY_TAX_ID,
      address: saved?.info?.address || COMPANY_INFO.address,
      phone: saved?.info?.phone || COMPANY_INFO.phone,
      fax: saved?.info?.fax || COMPANY_INFO.fax,
      email: saved?.info?.email || COMPANY_INFO.email,
      bankName: saved?.bank?.bankName || COMPANY_BANK.bankName,
      accountName: saved?.bank?.accountName || COMPANY_BANK.accountName,
      accountNumber: saved?.bank?.accountNumber ?? COMPANY_BANK.accountNumber,
      swift: saved?.bank?.swift || COMPANY_BANK.swift,
      branch: saved?.bank?.branch || COMPANY_BANK.branch
    }
  },

  methods: {
    validateForm() {
      if (!this.form.name?.trim()) {
        warning(this.$t('view.setting.companyInfo.validation.companyNameRequired'))
        return false
      }
      if (!this.form.taxId?.trim()) {
        warning(this.$t('view.setting.companyInfo.validation.taxIdRequired'))
        return false
      }
      if (!this.form.address?.trim()) {
        warning(this.$t('view.setting.companyInfo.validation.addressRequired'))
        return false
      }
      return true
    },

    onSave() {
      if (!this.validateForm()) return

      confirmThenSubmit(this.form.name, this.$t('view.setting.companyInfo.confirmSaveTitle'), async () => {
        const payload = {
          info: {
            name: this.form.name,
            address: this.form.address,
            phone: this.form.phone,
            fax: this.form.fax,
            email: this.form.email
          },
          taxId: this.form.taxId,
          bank: {
            bankName: this.form.bankName,
            accountName: this.form.accountName,
            accountNumber: this.form.accountNumber,
            swift: this.form.swift,
            branch: this.form.branch
          }
        }
        await saveCompanySetting(payload)
        resetCompanyInfoCache()
        success(this.$t('view.setting.companyInfo.saveSuccess'))
      })
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

.bank-hint {
  display: flex;
  align-items: center;
  padding: var(--sp-sm) var(--sp-lg);
  border: 1px solid var(--base-warning);
  border-radius: var(--radius-md);
  color: var(--base-warning);
  font-weight: 600;
  font-size: var(--fs-sm);
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
