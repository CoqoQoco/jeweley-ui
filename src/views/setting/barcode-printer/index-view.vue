<template>
  <div class="app-container">
    <pageTitle
      :title="$t('view.setting.barcodePrinter.pageTitle')"
      :description="$t('view.setting.barcodePrinter.pageDescription')"
      :isShowBtnClose="false"
    />

    <!-- ส่วน ก: ตั้งค่า -->
    <SectionCardGeneric
      class="mt-4"
      :title="$t('view.setting.barcodePrinter.configSectionTitle')"
      :description="$t('view.setting.barcodePrinter.configSectionDescription')"
      icon="bi-printer"
      headerStyle="filled"
    >
      <div class="form-row">
        <FormFieldGeneric :label="$t('view.setting.barcodePrinter.printerNameLabel')">
          <div class="printer-select-row">
            <AutoCompleteGeneric
              :modelValue="form.printerName"
              :staticOptions="printerOptions"
              :useStaticList="true"
              optionLabel="label"
              :placeholder="$t('common.printer.selectPlaceholder')"
              :forceSelection="false"
              :dropdown="true"
              class="printer-ac"
              @update:modelValue="onPrinterChange"
            />
            <ButtonGeneric
              variant="outline"
              icon="bi-arrow-clockwise"
              :label="$t('common.printer.reload')"
              @click="loadPrinters"
            />
            <ButtonGeneric
              variant="outline"
              icon="bi-x-lg"
              :title="$t('common.printer.clear')"
              @click="onClearPrinter"
            />
          </div>
          <small v-if="printerOptions.length === 0" class="field-hint">
            {{ $t('common.printer.manualHint') }}
          </small>
        </FormFieldGeneric>
      </div>

      <div class="form-row two-col">
        <FormFieldGeneric :label="$t('view.setting.barcodePrinter.dpiLabel')">
          <RadioGroupGeneric
            v-model="form.dpi"
            :options="dpiOptions"
            optionLabel="label"
            optionValue="value"
            :inline="true"
          />
          <small class="field-hint">{{ $t('view.setting.barcodePrinter.dpiHint') }}</small>
        </FormFieldGeneric>
        <FormFieldGeneric :label="$t('view.setting.barcodePrinter.copyDelayLabel')">
          <InputTextGeneric type="number" step="50" :min="0" v-model.number="form.copyDelayMs" />
          <small class="field-hint">{{ $t('view.setting.barcodePrinter.copyDelayHint') }}</small>
        </FormFieldGeneric>
      </div>
    </SectionCardGeneric>

    <!-- ส่วน ข: สถานะ bridge -->
    <SectionCardGeneric
      class="mt-4"
      :title="$t('view.setting.barcodePrinter.statusSectionTitle')"
      :description="$t('view.setting.barcodePrinter.statusSectionDescription')"
      icon="bi-hdd-network"
      headerStyle="filled"
    >
      <div class="status-box" :class="`status-box--${statusVariant}`">
        <i class="bi" :class="statusIcon"></i>
        <div class="status-box-body">
          <div class="status-box-title">{{ statusTitle }}</div>

          <div v-if="bridgeCheck.status === 'success'" class="status-box-detail">
            {{ $t('view.setting.barcodePrinter.status.readyDetail', { count: bridgeCheck.printers.length }) }}
          </div>

          <div v-else-if="bridgeCheck.status === 'no-printer'" class="status-box-detail">
            {{ $t('view.setting.barcodePrinter.status.noPrinterDetail') }}
          </div>

          <ul v-else-if="isUnreachable" class="status-box-list">
            <li>{{ $t('common.printer.statusUnreachableStep1') }}</li>
            <li>
              {{ $t('common.printer.statusUnreachableStep2Prefix') }}
              <a :href="printerHealthUrl" target="_blank" rel="noopener">{{ printerHealthUrl }}</a>
              {{ $t('common.printer.statusUnreachableStep2Suffix') }}
            </li>
            <li>{{ $t('common.printer.statusUnreachableStep3') }}</li>
          </ul>
        </div>
      </div>
    </SectionCardGeneric>

    <!-- ส่วน ค: พิมพ์ฉลากทดสอบ -->
    <SectionCardGeneric
      class="mt-4"
      :title="$t('view.setting.barcodePrinter.testSectionTitle')"
      :description="$t('view.setting.barcodePrinter.testSectionDescription')"
      icon="bi-upc-scan"
      headerStyle="filled"
    >
      <div class="form-row two-col">
        <FormFieldGeneric :label="$t('view.setting.barcodePrinter.test.stockNumberLabel')">
          <InputTextGeneric v-model.trim="testForm.stockNumber" />
        </FormFieldGeneric>
        <FormFieldGeneric :label="$t('view.setting.barcodePrinter.test.printCountLabel')">
          <InputTextGeneric type="number" :min="1" v-model.number="testForm.printCount" />
        </FormFieldGeneric>
      </div>
      <ButtonGeneric
        variant="green"
        icon="bi-printer"
        :label="$t('common.btn.print')"
        :disabled="isTestPrintDisabled"
        @click="onPrintTest"
      />
    </SectionCardGeneric>

    <!-- ส่วน ง: ปุ่มท้ายหน้า -->
    <div class="action-bar">
      <div></div>
      <div>
        <ButtonGeneric variant="main" icon="bi-save" :label="$t('common.btn.save')" @click="onSave" />
        <ButtonGeneric variant="outline" :label="$t('common.btn.reset')" class="ml-2" @click="onResetDefault" />
      </div>
    </div>
  </div>
</template>

<script>
// External dependencies
import { defineAsyncComponent } from 'vue'
import { zebraPrinterApi } from '@/stores/modules/api/printer/zebra-store.js'
import { PRINT_BRIDGE_BASE_URL } from '@/services/api/printer-config-service.js'
import {
  getBarcodePrinterName,
  setBarcodePrinterName,
  getBarcodeDpi,
  setBarcodeDpi,
  getCopyDelayMs,
  setCopyDelayMs,
  DEFAULT_BARCODE_DPI,
  DEFAULT_COPY_DELAY_MS
} from '@/services/api/barcode-printer-config.js'
import { success, error } from '@/services/alert/sweetAlerts.js'

// Local components
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import AutoCompleteGeneric from '@/components/prime-vue/AutoCompleteGeneric.vue'
import RadioGroupGeneric from '@/components/prime-vue/RadioGroupGeneric.vue'

const pageTitle = defineAsyncComponent(() => import('@/components/custom/page-title.vue'))

export default {
  name: 'BarcodePrinterSettingView',

  components: {
    pageTitle,
    SectionCardGeneric,
    FormFieldGeneric,
    InputTextGeneric,
    ButtonGeneric,
    AutoCompleteGeneric,
    RadioGroupGeneric
  },

  setup() {
    const zebraPrinter = zebraPrinterApi()
    return { zebraPrinter }
  },

  data() {
    return {
      form: {
        printerName: getBarcodePrinterName(),
        dpi: getBarcodeDpi(),
        copyDelayMs: getCopyDelayMs()
      },
      printerOptions: [],
      bridgeCheck: { status: 'no-printer', printerName: '', printers: [], detail: null },
      testForm: {
        stockNumber: 'TEST-0001',
        printCount: 1
      }
    }
  },

  computed: {
    dpiOptions() {
      return [
        { value: 203, label: this.$t('view.setting.barcodePrinter.dpiOption203') },
        { value: 300, label: this.$t('view.setting.barcodePrinter.dpiOption300') }
      ]
    },

    printerHealthUrl() {
      return `${PRINT_BRIDGE_BASE_URL}/health`
    },

    statusVariant() {
      if (this.bridgeCheck.status === 'success') return 'green'
      if (this.bridgeCheck.status === 'bridge-error') return 'red'
      return 'warning'
    },

    statusIcon() {
      switch (this.statusVariant) {
        case 'green':
          return 'bi-check-circle-fill'
        case 'red':
          return 'bi-x-circle-fill'
        default:
          return 'bi-exclamation-triangle-fill'
      }
    },

    bridgeErrorBucket() {
      return this.bridgeCheck.detail?.bridgeStatus || 'unreachable'
    },

    isUnreachable() {
      return this.bridgeCheck.status === 'bridge-error' && this.bridgeErrorBucket === 'unreachable'
    },

    statusTitle() {
      switch (this.bridgeCheck.status) {
        case 'success':
          return this.$t('view.setting.barcodePrinter.status.readyTitle')
        case 'no-printer':
          return this.$t('common.printer.noPrinterSet')
        case 'printer-not-found':
          return this.$t('common.printer.savedNotFound', { name: this.bridgeCheck.printerName })
        case 'bridge-error':
          if (this.bridgeErrorBucket === 'blocked') return this.$t('common.printer.statusBlocked')
          if (this.bridgeErrorBucket === 'empty') return this.$t('common.printer.statusEmpty')
          return this.$t('common.printer.statusUnreachableTitle')
        default:
          return ''
      }
    },

    isTestPrintDisabled() {
      return this.bridgeCheck.status !== 'success'
    }
  },

  mounted() {
    this.checkBridgeStatus()
  },

  methods: {
    async checkBridgeStatus() {
      this.bridgeCheck = await this.zebraPrinter.fetchBarcodePrinterStatus()
      this.printerOptions = this.bridgeCheck.printers || []
    },

    async loadPrinters() {
      await this.checkBridgeStatus()
    },

    onPrinterChange(value) {
      this.form.printerName = typeof value === 'object' && value !== null ? value.name : value
    },

    onClearPrinter() {
      this.form.printerName = ''
    },

    onSave() {
      setBarcodePrinterName(this.form.printerName)
      setBarcodeDpi(this.form.dpi)
      setCopyDelayMs(this.form.copyDelayMs)
      success(this.$t('view.setting.barcodePrinter.saveSuccess'))
    },

    onResetDefault() {
      this.form = {
        printerName: '',
        dpi: DEFAULT_BARCODE_DPI,
        copyDelayMs: DEFAULT_COPY_DELAY_MS
      }
      success(this.$t('view.setting.barcodePrinter.resetSuccess'))
    },

    buildTestFormValue() {
      return {
        stockNumber: this.testForm.stockNumber,
        madeIn: 'MADE IN THAILAND',
        gold: '3.50 g',
        size: '54',
        goldType: '18K',
        barcodeType: 'original',
        print: Math.max(1, Number(this.testForm.printCount) || 1)
      }
    },

    async onPrintTest() {
      const formValue = this.buildTestFormValue()
      const res = await this.zebraPrinter.fetchZebraPrint({ formValue, skipLoading: true })
      if (res?.status === 'success') {
        success(res.message || this.$t('view.setting.barcodePrinter.test.printSuccess'))
      } else {
        error(res?.message || this.$t('common.printer.printFailedTitle'), this.$t('common.printer.printFailedTitle'))
      }
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

.field-hint {
  display: block;
  margin-top: var(--sp-xs);
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}

.printer-select-row {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: var(--sp-sm);

  .printer-ac {
    flex: 1 1 200px;
    min-width: 200px;
  }
}

.status-box {
  display: flex;
  align-items: flex-start;
  gap: var(--sp-md);
  padding: var(--sp-md) var(--sp-lg);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  border-left: 4px solid var(--color-border);
  background: var(--color-card-bg);

  > .bi {
    font-size: var(--fs-xl);
    line-height: 1;
    margin-top: 2px;
    flex-shrink: 0;
  }

  &--green {
    border-left-color: var(--base-green);

    > .bi {
      color: var(--base-green);
    }
  }

  &--warning {
    border-left-color: var(--base-warning);

    > .bi {
      color: var(--base-warning);
    }
  }

  &--red {
    border-left-color: var(--base-red);

    > .bi {
      color: var(--base-red);
    }
  }
}

.status-box-title {
  font-weight: 700;
  color: var(--base-font-color);
}

.status-box-detail {
  margin-top: var(--sp-xs);
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}

.status-box-list {
  margin: var(--sp-xs) 0 0;
  padding-left: var(--sp-lg);
  font-size: var(--fs-sm);
  color: var(--base-sub-color);

  a {
    color: var(--base-green);
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
