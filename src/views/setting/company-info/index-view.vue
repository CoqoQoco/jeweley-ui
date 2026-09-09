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
        <FormFieldGeneric :label="$t('view.setting.companyInfo.companyNameTh')" :required="true">
          <InputTextGeneric v-model.trim="form.nameTh" />
        </FormFieldGeneric>
        <FormFieldGeneric :label="$t('view.setting.companyInfo.companyName')" :required="true">
          <InputTextGeneric v-model.trim="form.name" />
        </FormFieldGeneric>
      </div>
      <div class="form-row two-col">
        <FormFieldGeneric :label="$t('view.setting.companyInfo.taxId')" :required="true">
          <InputTextGeneric v-model.trim="form.taxId" />
        </FormFieldGeneric>
        <FormFieldGeneric :label="$t('view.setting.companyInfo.branchLabel')">
          <InputTextGeneric v-model.trim="form.branchLabel" />
        </FormFieldGeneric>
      </div>
      <div class="form-row">
        <FormFieldGeneric :label="$t('view.setting.companyInfo.addressTh')" :required="true">
          <TextareaGeneric v-model="form.addressTh" :rows="2" />
        </FormFieldGeneric>
      </div>
      <div class="form-row">
        <FormFieldGeneric :label="$t('view.setting.companyInfo.address')" :required="true">
          <TextareaGeneric v-model="form.address" :rows="2" />
        </FormFieldGeneric>
      </div>
    </SectionCardGeneric>

    <SectionCardGeneric
      class="mt-4"
      :title="$t('view.setting.companyInfo.sectionContact')"
      icon="bi-telephone-fill"
      headerStyle="filled"
    >
      <div class="form-row two-col">
        <FormFieldGeneric :label="$t('view.setting.companyInfo.phone')">
          <InputTextGeneric type="tel" icon="bi-telephone-fill" v-model.trim="form.phone" />
        </FormFieldGeneric>
        <FormFieldGeneric :label="$t('view.setting.companyInfo.fax')">
          <InputTextGeneric icon="bi-printer-fill" v-model.trim="form.fax" />
        </FormFieldGeneric>
      </div>
      <div class="form-row two-col">
        <FormFieldGeneric :label="$t('view.setting.companyInfo.email')" :error="emailError">
          <InputTextGeneric type="email" icon="bi-envelope-check-fill" v-model.trim="form.email" />
        </FormFieldGeneric>
        <FormFieldGeneric :label="$t('view.setting.companyInfo.website')">
          <InputTextGeneric icon="bi-globe2" v-model.trim="form.website" @blur="onWebsiteBlur" />
        </FormFieldGeneric>
      </div>
    </SectionCardGeneric>

    <SectionCardGeneric
      class="mt-4"
      :title="$t('view.setting.companyInfo.sectionSocial')"
      icon="bi-share-fill"
      headerStyle="filled"
    >
      <div class="social-hint">
        <i class="bi bi-info-circle-fill mr-1"></i>
        {{ $t('view.setting.companyInfo.socialHint') }}
      </div>
      <div class="form-row two-col mt-3">
        <div class="social-field-row">
          <FormFieldGeneric class="social-field" :label="$t('view.setting.companyInfo.facebook')">
            <InputTextGeneric icon="bi-facebook" v-model.trim="form.social.facebook" @blur="onSocialBlur('facebook')" />
          </FormFieldGeneric>
          <ButtonGeneric
            variant="outline"
            icon="bi-qr-code"
            :label="$t('view.setting.companyInfo.qrBtn')"
            :disabled="!form.social.facebook"
            @click="openQr('facebook')"
          />
        </div>
        <div class="social-field-row">
          <FormFieldGeneric class="social-field" :label="$t('view.setting.companyInfo.instagram')">
            <InputTextGeneric icon="bi-instagram" v-model.trim="form.social.instagram" @blur="onSocialBlur('instagram')" />
          </FormFieldGeneric>
          <ButtonGeneric
            variant="outline"
            icon="bi-qr-code"
            :label="$t('view.setting.companyInfo.qrBtn')"
            :disabled="!form.social.instagram"
            @click="openQr('instagram')"
          />
        </div>
      </div>
      <div class="form-row two-col">
        <div class="social-field-row">
          <FormFieldGeneric class="social-field" :label="$t('view.setting.companyInfo.tiktok')">
            <InputTextGeneric icon="bi-tiktok" v-model.trim="form.social.tiktok" @blur="onSocialBlur('tiktok')" />
          </FormFieldGeneric>
          <ButtonGeneric
            variant="outline"
            icon="bi-qr-code"
            :label="$t('view.setting.companyInfo.qrBtn')"
            :disabled="!form.social.tiktok"
            @click="openQr('tiktok')"
          />
        </div>
        <div class="social-field-row">
          <FormFieldGeneric class="social-field" :label="$t('view.setting.companyInfo.lineOa')">
            <InputTextGeneric icon="bi-line" v-model.trim="form.social.lineOa" @blur="onSocialBlur('lineOa')" />
          </FormFieldGeneric>
          <ButtonGeneric
            variant="outline"
            icon="bi-qr-code"
            :label="$t('view.setting.companyInfo.qrBtn')"
            :disabled="!form.social.lineOa"
            @click="openQr('lineOa')"
          />
        </div>
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

    <socialQrDialog v-model:visible="qrDialog.visible" :channel="qrDialog.channel" :handle="qrDialog.handle" />
  </div>
</template>

<script>
// External dependencies
import { defineAsyncComponent } from 'vue'
import { getCompanySetting, saveCompanySetting } from '@/services/helper/company-info-store.js'
import {
  COMPANY_INFO,
  COMPANY_TAX_ID,
  COMPANY_BANK,
  COMPANY_SOCIAL,
  resetCompanyInfoCache,
  normalizeSocialHandle,
  normalizeWebsite
} from '@/config/company-info.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { warning, success } from '@/services/alert/sweetAlerts.js'

// Local components
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import TextareaGeneric from '@/components/generic/TextareaGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

const pageTitle = defineAsyncComponent(() => import('@/components/custom/page-title.vue'))
const socialQrDialog = defineAsyncComponent(() => import('./components/social-qr-dialog.vue'))

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const interfaceForm = {
  name: '',
  nameTh: '',
  branchLabel: '',
  taxId: '',
  address: '',
  addressTh: '',
  phone: '',
  fax: '',
  email: '',
  website: '',
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
    ButtonGeneric,
    socialQrDialog
  },

  data() {
    return {
      form: {
        ...interfaceForm,
        social: {
          facebook: '',
          instagram: '',
          tiktok: '',
          lineOa: ''
        }
      },
      qrDialog: {
        visible: false,
        channel: '',
        handle: ''
      }
    }
  },

  computed: {
    emailError() {
      if (!this.form.email?.trim()) return ''
      return EMAIL_REGEX.test(this.form.email.trim()) ? '' : this.$t('view.setting.companyInfo.validation.emailInvalid')
    }
  },

  async mounted() {
    const saved = await getCompanySetting()

    this.form = {
      name: saved?.info?.name || COMPANY_INFO.name,
      nameTh: saved?.info?.nameTh || COMPANY_INFO.nameTh,
      branchLabel: saved?.info?.branchLabel || COMPANY_INFO.branchLabel,
      taxId: saved?.taxId || COMPANY_TAX_ID,
      address: saved?.info?.address || COMPANY_INFO.address,
      addressTh: saved?.info?.addressTh || COMPANY_INFO.addressTh,
      phone: saved?.info?.phone || COMPANY_INFO.phone,
      fax: saved?.info?.fax || COMPANY_INFO.fax,
      email: saved?.info?.email || COMPANY_INFO.email,
      website: saved?.info?.website || COMPANY_INFO.website,
      bankName: saved?.bank?.bankName || COMPANY_BANK.bankName,
      accountName: saved?.bank?.accountName || COMPANY_BANK.accountName,
      accountNumber: saved?.bank?.accountNumber ?? COMPANY_BANK.accountNumber,
      swift: saved?.bank?.swift || COMPANY_BANK.swift,
      branch: saved?.bank?.branch || COMPANY_BANK.branch,
      social: {
        facebook: saved?.social?.facebook ?? COMPANY_SOCIAL.facebook,
        instagram: saved?.social?.instagram ?? COMPANY_SOCIAL.instagram,
        tiktok: saved?.social?.tiktok ?? COMPANY_SOCIAL.tiktok,
        lineOa: saved?.social?.lineOa ?? COMPANY_SOCIAL.lineOa
      }
    }
  },

  methods: {
    onSocialBlur(channel) {
      this.form.social[channel] = normalizeSocialHandle(channel, this.form.social[channel])
    },

    onWebsiteBlur() {
      this.form.website = normalizeWebsite(this.form.website)
    },

    openQr(channel) {
      this.qrDialog = {
        visible: true,
        channel,
        handle: this.form.social[channel]
      }
    },

    validateForm() {
      if (!this.form.nameTh?.trim()) {
        warning(this.$t('view.setting.companyInfo.validation.companyNameThRequired'))
        return false
      }
      if (!this.form.name?.trim()) {
        warning(this.$t('view.setting.companyInfo.validation.companyNameRequired'))
        return false
      }
      if (!this.form.taxId?.trim()) {
        warning(this.$t('view.setting.companyInfo.validation.taxIdRequired'))
        return false
      }
      if (!this.form.addressTh?.trim()) {
        warning(this.$t('view.setting.companyInfo.validation.addressThRequired'))
        return false
      }
      if (!this.form.address?.trim()) {
        warning(this.$t('view.setting.companyInfo.validation.addressRequired'))
        return false
      }
      if (this.form.email?.trim() && !EMAIL_REGEX.test(this.form.email.trim())) {
        warning(this.$t('view.setting.companyInfo.validation.emailInvalid'))
        return false
      }
      return true
    },

    onSave() {
      if (!this.validateForm()) return

      this.form.website = normalizeWebsite(this.form.website)
      this.form.social.facebook = normalizeSocialHandle('facebook', this.form.social.facebook)
      this.form.social.instagram = normalizeSocialHandle('instagram', this.form.social.instagram)
      this.form.social.tiktok = normalizeSocialHandle('tiktok', this.form.social.tiktok)
      this.form.social.lineOa = normalizeSocialHandle('lineOa', this.form.social.lineOa)

      confirmThenSubmit(this.form.name, this.$t('view.setting.companyInfo.confirmSaveTitle'), async () => {
        const payload = {
          info: {
            name: this.form.name,
            nameTh: this.form.nameTh,
            branchLabel: this.form.branchLabel,
            address: this.form.address,
            addressTh: this.form.addressTh,
            phone: this.form.phone,
            fax: this.form.fax,
            email: this.form.email,
            website: this.form.website
          },
          taxId: this.form.taxId,
          bank: {
            bankName: this.form.bankName,
            accountName: this.form.accountName,
            accountNumber: this.form.accountNumber,
            swift: this.form.swift,
            branch: this.form.branch
          },
          social: {
            facebook: this.form.social.facebook,
            instagram: this.form.social.instagram,
            tiktok: this.form.social.tiktok,
            lineOa: this.form.social.lineOa
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

.social-hint {
  display: flex;
  align-items: center;
  padding: var(--sp-sm) var(--sp-lg);
  border: 1px solid var(--base-green);
  border-radius: var(--radius-md);
  color: var(--base-green);
  font-weight: 600;
  font-size: var(--fs-sm);
}

.social-field-row {
  display: flex;
  align-items: flex-end;
  gap: var(--sp-sm);

  .social-field {
    flex: 1;
    min-width: 0;
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
