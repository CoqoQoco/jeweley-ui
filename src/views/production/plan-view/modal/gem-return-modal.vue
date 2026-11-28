<template>
  <modal
    :showModal="isShow"
    width="640px"
    headerVariant="main"
    :isShowActionPart="true"
    @closeModal="onClose"
  >
    <template #title>
      <span class="title-text-lg d-block">{{ $t('view.production.planView.gemReturn.title') }}</span>
    </template>

    <template #content>
      <div class="gem-return-body">
        <div v-if="hasSavedPrice || hasSavedBom" class="warn-box" role="alert">
          <i class="bi bi-exclamation-triangle-fill"></i>
          <span>{{ $t('view.production.planView.gemReturn.warnPriced') }}</span>
        </div>

        <div v-if="mode === RETURN_MODE.NOW && planInbound.length" class="warn-box mt-2" role="alert">
          <i class="bi bi-exclamation-triangle-fill"></i>
          <span>
            {{
              $t('view.production.planView.gemReturn.warnLinkedInbound', {
                running: planInbound.map((l) => l.running).join(', '),
                qty: fmt3(planInbound[0].qty),
                weight: fmt3(planInbound[0].qtyWeight)
              })
            }}
          </span>
        </div>

        <div v-if="autoPreselected && mode === RETURN_MODE.LINK" class="info-line mt-2">
          <i class="bi bi-info-circle"></i>
          <span>
            {{
              $t('view.production.planView.gemReturn.infoAutoLink', {
                running: planInbound.map((l) => l.running).join(', ')
              })
            }}
          </span>
        </div>

        <div class="info-box mt-2">
          <div>
            <span class="info-label">{{ $t('view.production.planView.gemReturn.infoPlan') }}</span>
            {{ planText }}
          </div>
          <div>
            <span class="info-label">{{ $t('view.production.planView.gemReturn.infoGem') }}</span>
            {{ row.code }} {{ row.name }}
          </div>
          <div>
            <span class="info-label">{{ $t('view.production.planView.gemReturn.infoOutbound') }}</span>
            {{ outboundText }}
          </div>
          <div>
            <span class="info-label">{{ $t('view.production.planView.gemReturn.infoInPlan') }}</span>
            {{ fmt3(row.qty) }} {{ $t('view.production.planView.gemReturn.unitQty') }} · {{ fmt3(row.weight) }} {{ row.unit }}
          </div>
        </div>

        <FormFieldGeneric
          :label="$t('view.production.planView.gemReturn.whereLabel')"
          :required="true"
          :error="errorText('mode')"
          class="mt-3"
        >
          <div class="gem-return-mode">
            <RadioGroupGeneric
              :modelValue="mode"
              :options="modeOptions"
              optionLabel="label"
              optionValue="value"
              @update:modelValue="onModeChange"
            />
          </div>
          <small v-if="modeHint" class="mode-hint d-block">{{ modeHint }}</small>
        </FormFieldGeneric>

        <FormFieldGeneric
          v-if="mode === RETURN_MODE.LINK"
          :label="$t('view.production.planView.gemReturn.linkLabel')"
          :required="true"
          :error="errorText('link')"
          class="mt-2"
        >
          <DropdownGeneric
            inputId="gem-return-link"
            :ariaLabel="$t('view.production.planView.gemReturn.linkLabel')"
            :modelValue="linkId"
            :options="linkOptions"
            optionLabel="label"
            optionValue="value"
            :placeholder="$t('view.production.planView.gemReturn.linkPlaceholder')"
            @update:modelValue="linkId = $event"
          />
          <small class="mode-hint d-block">
            {{ linkOptions.length ? $t('view.production.planView.gemReturn.linkHint', { code: row.code }) : $t('view.production.planView.gemReturn.linkEmpty') }}
          </small>
        </FormFieldGeneric>

        <div class="gem-return-grid mt-2">
          <FormFieldGeneric
            :label="$t('view.production.planView.gemReturn.qtyLabel')"
            :required="true"
            inputId="gem-return-qty"
            :error="errorText('qty')"
          >
            <InputTextGeneric id="gem-return-qty" v-model="qty" type="number" step="any" min="0" />
          </FormFieldGeneric>
          <FormFieldGeneric
            :label="$t('view.production.planView.gemReturn.weightLabel')"
            :required="true"
            inputId="gem-return-weight"
            :error="errorText('weight')"
          >
            <InputTextGeneric id="gem-return-weight" v-model="weight" type="number" step="any" min="0" />
          </FormFieldGeneric>
        </div>
        <small v-if="attempted && validation.errors.pair" class="text-danger d-block" role="alert">
          {{ $t('view.production.planView.gemReturn.err.pair') }}
        </small>

        <div class="gem-return-grid mt-2">
          <FormFieldGeneric
            :label="$t('view.production.planView.gemReturn.reasonLabel')"
            :required="true"
            :error="errorText('reason')"
          >
            <DropdownGeneric
              inputId="gem-return-reason"
              :ariaLabel="$t('view.production.planView.gemReturn.reasonLabel')"
              v-model="reason"
              :options="reasonOptions"
              optionLabel="label"
              optionValue="value"
              :placeholder="$t('view.production.planView.gemReturn.reasonPlaceholder')"
            />
          </FormFieldGeneric>
          <FormFieldGeneric
            :label="$t('view.production.planView.gemReturn.remarkLabel')"
            :required="reason === 'OTHER'"
            inputId="gem-return-remark"
            :error="errorText('remark')"
          >
            <InputTextGeneric id="gem-return-remark" v-model="remark" />
          </FormFieldGeneric>
        </div>

        <div v-if="previewLines.length" class="preview-box mt-2">
          <div class="title-text">{{ $t('view.production.planView.gemReturn.previewTitle') }}</div>
          <div v-for="line in previewLines" :key="line">{{ line }}</div>
        </div>
      </div>
    </template>

    <template #action>
      <ButtonGeneric
        variant="main"
        icon="bi-box-arrow-in-down"
        :label="$t('view.production.planView.gemReturn.btnConfirm')"
        :loading="saving"
        @click="onConfirm"
      />
      <ButtonGeneric variant="outline" class="ml-2" :label="$t('common.btn.cancel')" @click="onClose" />
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'

import { success } from '@/services/alert/sweetAlerts.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { formatDate, formatISOString } from '@/services/utils/dayjs.js'
import { useGemReturnApiStore } from '@/stores/modules/api/stock/gem-return-api.js'

import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import RadioGroupGeneric from '@/components/prime-vue/RadioGroupGeneric.vue'

import {
  RETURN_MODE,
  RETURN_REASONS,
  validateGemReturn,
  previewRemaining,
  buildReturnBody,
  formatLinkLabel,
  findInboundForPlan
} from '../gem-return-helpers.js'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

export default {
  name: 'GemReturnModal',

  components: { modal, ButtonGeneric, FormFieldGeneric, InputTextGeneric, DropdownGeneric, RadioGroupGeneric },

  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    row: {
      type: Object,
      default: () => ({})
    },
    planText: {
      type: String,
      default: ''
    },
    planWo: {
      type: String,
      default: ''
    },
    planWoNumber: {
      type: [String, Number],
      default: ''
    },
    hasSavedPrice: {
      type: Boolean,
      default: false
    },
    hasSavedBom: {
      type: Boolean,
      default: false
    }
  },

  emits: ['closeModal', 'saved'],

  setup() {
    const gemReturnStore = useGemReturnApiStore()
    return { gemReturnStore }
  },

  data() {
    return {
      RETURN_MODE,
      mode: null,
      qty: '',
      weight: '',
      linkId: null,
      linkLines: [],
      reason: null,
      remark: '',
      saving: false,
      attempted: false,
      autoPreselected: false
    }
  },

  computed: {
    outboundText() {
      const date = this.row.outboundDate ? formatDate(this.row.outboundDate) : ''
      return [this.row.outboundRunning, date, this.row.outboundName].filter(Boolean).join(' · ')
    },
    modeOptions() {
      return [
        { value: RETURN_MODE.NOW, label: this.$t('view.production.planView.gemReturn.modeNow') },
        { value: RETURN_MODE.LINK, label: this.$t('view.production.planView.gemReturn.modeLink') }
      ]
    },
    modeHint() {
      if (this.mode === RETURN_MODE.NOW) {
        return this.$t('view.production.planView.gemReturn.modeNowHint', { code: this.row.code })
      }
      if (this.mode === RETURN_MODE.LINK) return this.$t('view.production.planView.gemReturn.modeLinkHint')
      return ''
    },
    reasonOptions() {
      return RETURN_REASONS.map((value) => ({
        value,
        label: this.$t(`view.production.planView.gemReturn.reason.${value}`)
      }))
    },
    linkOptions() {
      return this.linkLines.map((line) => ({
        value: line.transectionId,
        label: `${this.linkTag(line)}${formatLinkLabel(line, formatDate)}`
      }))
    },
    planInbound() {
      const byText = new Set(findInboundForPlan(this.linkLines, this.planWo, this.planWoNumber))
      return this.linkLines.filter((l) => l.matchesPlan === true || byText.has(l))
    },
    link() {
      return this.linkLines.find((l) => l.transectionId === this.linkId) ?? null
    },
    validation() {
      return validateGemReturn({
        mode: this.mode,
        rowQty: this.row.qty,
        rowWeight: this.row.weight,
        qty: this.qty,
        weight: this.weight,
        link: this.link,
        reason: this.reason,
        remark: this.remark
      })
    },
    previewLines() {
      const { errors } = this.validation
      if (!this.mode || errors.qty || errors.weight || errors.pair) return []
      const t = (k, p) => this.$t(`view.production.planView.gemReturn.${k}`, p)
      const left = previewRemaining({
        rowQty: this.row.qty,
        rowWeight: this.row.weight,
        qty: this.qty,
        weight: this.weight
      })
      const lines = [
        left.isFull
          ? t('previewFull', { plan: this.planText, outbound: this.row.outboundRunning })
          : t('previewRemain', {
              plan: this.planText,
              code: this.row.code,
              qty: left.remainQty,
              weight: left.remainWeight.toFixed(3)
            })
      ]
      lines.push(
        this.mode === RETURN_MODE.NOW
          ? t('previewStockNow', {
              code: this.row.code,
              qty: Number(this.qty),
              weight: Number(this.weight).toFixed(3)
            })
          : t('previewStockLink', { code: this.row.code })
      )
      return lines
    }
  },

  watch: {
    isShow: {
      handler(val) {
        if (val) {
          this.resetForm()
          this.loadLinkLines()
        }
      },
      immediate: true
    }
  },

  methods: {
    linkTag(line) {
      if (line.matchesPlan === true) return `[${this.$t('view.production.planView.gemReturn.tagThisPlan')}] `
      if (line.matchesPlan === false) return `[${this.$t('view.production.planView.gemReturn.tagOtherPlan')}] `
      return ''
    },

    async loadLinkLines() {
      const code = this.row.code
      const lines = await this.gemReturnStore.listLinkableInbound(code, this.row.productionPlanId)
      if (!this.isShow || this.row.code !== code) return
      this.linkLines = lines
      // พบใบรับคืนที่อ้างใบงานนี้ = น่าจะคืนเข้าคลังไปแล้ว: เลือกโหมดผูกใบรับคืนให้ (ผู้ใช้เปลี่ยนได้)
      if (!this.mode && this.planInbound.length) {
        this.mode = RETURN_MODE.LINK
        this.linkId = this.planInbound[0].transectionId
        this.autoPreselected = true
      }
    },

    onModeChange(value) {
      this.mode = value
      this.autoPreselected = false
    },

    fmt3(val) {
      return val ? Number(val).toFixed(3) : '0.000'
    },

    resetForm() {
      this.mode = null
      this.qty = this.row.qty ?? ''
      this.weight = this.row.weight ?? ''
      this.linkId = null
      this.linkLines = []
      this.reason = null
      this.remark = ''
      this.saving = false
      this.attempted = false
      this.autoPreselected = false
    },

    errorText(field) {
      if (!this.attempted) return ''
      const code = this.validation.errors[field]
      if (!code) return ''
      if (code === 'required') return this.$t(`view.production.planView.gemReturn.err.${field}Required`)
      const max = this.maxFor(field === 'qty' ? 'qty' : 'weight')
      return this.$t(`view.production.planView.gemReturn.err.${code}`, { max })
    },

    focusFirstInvalid() {
      const { errors } = this.validation
      const targets = [
        ['mode', '.gem-return-mode input'],
        ['link', '#gem-return-link'],
        ['qty', '#gem-return-qty'],
        ['pair', '#gem-return-qty'],
        ['weight', '#gem-return-weight'],
        ['reason', '#gem-return-reason'],
        ['remark', '#gem-return-remark']
      ]
      const hit = targets.find(([key]) => errors[key])
      if (hit) document.querySelector(hit[1])?.focus()
    },

    maxFor(field) {
      const rowVal = field === 'qty' ? this.row.qty : this.row.weight
      if (this.validation.errors[field] === 'overLink' && this.link) {
        return Number(field === 'qty' ? this.link.remainQty : this.link.remainWeight).toFixed(3)
      }
      return Number(rowVal).toFixed(3)
    },

    onClose() {
      if (this.saving) return
      this.$emit('closeModal')
    },

    onConfirm() {
      if (this.saving) return
      this.attempted = true
      if (!this.validation.valid) {
        this.$nextTick(() => this.focusFirstInvalid())
        return
      }
      // พลอยอยู่ในมือแต่มีใบรับคืนที่อ้างใบงานนี้ — ถามย้ำก่อนบวกสต็อก กันนับซ้ำ
      if (this.mode === RETURN_MODE.NOW && this.planInbound.length) {
        confirmThenSubmit(
          this.$t('view.production.planView.gemReturn.confirmStockAdd', {
            code: this.row.code,
            qty: Number(this.qty),
            weight: Number(this.weight).toFixed(3)
          }),
          this.$t('view.production.planView.gemReturn.confirmStockTitle'),
          () => this.submit()
        )
        return
      }
      this.submit()
    },

    async submit() {
      this.saving = true
      try {
        const body = buildReturnBody({
          row: this.row,
          mode: this.mode,
          qty: this.qty,
          weight: this.weight,
          link: this.link,
          reason: this.reason,
          remark: this.remark,
          requestDate: formatISOString(new Date())
        })
        const res = await this.gemReturnStore.returnFromPlan(body)
        if (res) {
          success(this.$t('view.production.planView.gemReturn.success'))
          this.$emit('saved', res)
        }
      } finally {
        this.saving = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.gem-return-body {
  max-height: calc(100vh - 220px);
  overflow-y: auto;
}

.info-line {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  color: var(--base-sub-color);
}

.info-box {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-xs) var(--sp-lg);
  padding: var(--sp-md) var(--sp-lg);
  background: var(--color-highlight-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.info-label {
  color: var(--base-sub-color);
  font-weight: 600;
  margin-right: var(--sp-xs);
}

.mode-hint {
  margin-top: var(--sp-xs);
  color: var(--base-sub-color);
  font-size: var(--fs-sm);
}

// ไม่ใช้ .form-row (Bootstrap 4 มี margin ลบซ้าย/ขวา -5px ทำให้ถูกตัดขอบใน body ที่ scroll)
.gem-return-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-lg);
  margin: 0;

  > * {
    min-width: 0;
  }
}

.preview-box {
  padding: var(--sp-md) var(--sp-lg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-green-bg);
  font-size: var(--fs-base);
}

.warn-box {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  padding: var(--sp-md) var(--sp-lg);
  border: 1px solid var(--base-warning);
  border-radius: var(--radius-md);
  background: var(--status-open-bg);
  color: var(--base-sub-color);
}
</style>
