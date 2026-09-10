<template>
  <DrawerGeneric
    :show="isShowModal"
    width="860px"
    :isShowActionPart="true"
    headerVariant="main"
    @close="closeModal"
  >
    <template #title>
      <span class="drawer-print-title">
        <i class="bi bi-award mr-2"></i>
        {{ $t('view.sale.certificate.title') }}
      </span>
    </template>

    <template #content>
      <div class="certificate-print-container p-3">
        <!-- Info Container -->
        <div class="filter-container-search mb-3">
          <div class="p-3">
            <div class="info-grid mb-2">
              <div>
                <span class="info-label-sm">{{ $t('view.sale.certificate.invoiceNumber') }}</span>
                <div class="info-value-sm">{{ invoiceData?.invoiceNumber || '-' }}</div>
              </div>
              <div>
                <span class="info-label-sm">{{ $t('view.sale.certificate.customer') }}</span>
                <div class="info-value-sm">{{ invoiceData?.customerName || '-' }}</div>
              </div>
              <div>
                <span class="info-label-sm">{{ $t('view.sale.certificate.itemsCount') }}</span>
                <div class="info-value-sm">{{ certificates.length }}</div>
              </div>
            </div>
            <div class="d-flex align-items-start">
              <i class="bi bi-info-circle text-info mr-2 info-icon"></i>
              <p class="mb-0 info-text">{{ $t('view.sale.certificate.hint') }}</p>
            </div>
          </div>
        </div>

        <!-- History Container -->
        <SectionCardGeneric
          headerStyle="legend"
          accent="main"
          icon="bi-clock-history"
          :title="`${$t('view.sale.certificate.historyTitle')} (${history.length})`"
          class="mb-3"
        >
          <div v-if="historyLoading" class="history-loading">{{ $t('common.label.loading') }}</div>
          <div v-else-if="history.length === 0" class="history-empty">
            {{ $t('view.sale.certificate.historyEmpty') }}
          </div>
          <div v-else class="history-list">
            <div v-for="entry in historyNewestFirst" :key="entry.running" class="print-history-item">
              <div class="print-history-item__copy">
                {{ $t('view.sale.certificate.historyRound', { round: entry.round }) }}
              </div>
              <div class="print-history-item__date">{{ formatHistoryDate(entry.printedAt) }}</div>
              <div class="print-history-item__by">{{ entry.printedBy }}</div>
              <div class="print-history-item__mode">
                {{ $t('view.sale.certificate.historyItems', { count: entry.count }) }}
              </div>
              <div class="print-history-item__stocks">{{ entry.stockNumbers.join(', ') }}</div>
            </div>
          </div>
        </SectionCardGeneric>

        <!-- Settings Container -->
        <div class="filter-container mb-3">
          <div class="p-3">
            <FormFieldGeneric :label="$t('view.sale.certificate.signerTitle')" inputId="certificate-signer-title">
              <InputTextGeneric id="certificate-signer-title" v-model="signerTitle" type="text" />
            </FormFieldGeneric>
          </div>
        </div>

        <!-- Selection Toolbar -->
        <div class="selection-toolbar mb-3">
          <span class="selection-count">
            {{ $t('view.sale.certificate.selectedCount', { selected: selectedCount, total: certificates.length }) }}
          </span>
          <div class="selection-actions">
            <button type="button" class="btn btn-sm btn-outline-main" @click="selectAllCertificates">
              {{ $t('view.sale.certificate.selectAll') }}
            </button>
            <button type="button" class="btn btn-sm btn-dark" @click="selectNoneCertificates">
              {{ $t('view.sale.certificate.selectNone') }}
            </button>
          </div>
        </div>

        <!-- Certificate Items -->
        <SectionCardGeneric
          v-for="(certificate, index) in certificates"
          :key="index"
          headerStyle="legend"
          accent="main"
          icon="bi-award"
          :title="certificateTitle(certificate, index)"
          class="mb-3"
        >
          <CheckboxGeneric
            v-model="certificate.selected"
            :label="$t('view.sale.certificate.printThisCertificate')"
            class="mb-2"
          />

          <div
            class="issue-badge mb-3"
            :class="getIssueStat(certificate.stockNumber).count > 0 ? 'issue-badge--issued' : 'issue-badge--never'"
          >
            <template v-if="getIssueStat(certificate.stockNumber).count > 0">
              {{ $t('view.sale.certificate.issuedCount', { count: getIssueStat(certificate.stockNumber).count }) }}
              <span class="mx-1">·</span>
              {{
                $t('view.sale.certificate.lastIssued', {
                  date: formatHistoryDate(getIssueStat(certificate.stockNumber).lastAt),
                  by: getIssueStat(certificate.stockNumber).lastBy
                })
              }}
            </template>
            <template v-else>{{ $t('view.sale.certificate.neverIssued') }}</template>
          </div>

          <div class="field-group-title">{{ $t('view.sale.certificate.groupItemInfo') }}</div>
          <div class="form-row two-col mb-3">
            <FormFieldGeneric :label="$t('view.sale.certificate.certificateNo')">
              <InputTextGeneric v-model="certificate.certificateNo" :disabled="!certificate.selected" />
            </FormFieldGeneric>
            <FormFieldGeneric :label="$t('view.sale.certificate.itemNo')">
              <InputTextGeneric v-model="certificate.itemNo" :disabled="!certificate.selected" />
            </FormFieldGeneric>
            <FormFieldGeneric :label="$t('view.sale.certificate.issueDate')">
              <InputTextGeneric v-model="certificate.issueDate" :disabled="!certificate.selected" />
            </FormFieldGeneric>
            <FormFieldGeneric :label="$t('view.sale.certificate.description')">
              <InputTextGeneric v-model="certificate.description" :disabled="!certificate.selected" />
            </FormFieldGeneric>
            <FormFieldGeneric :label="$t('view.sale.certificate.model')">
              <InputTextGeneric v-model="certificate.model" :disabled="!certificate.selected" />
            </FormFieldGeneric>
            <FormFieldGeneric :label="$t('view.sale.certificate.metal')">
              <InputTextGeneric v-model="certificate.metal" :disabled="!certificate.selected" />
            </FormFieldGeneric>
            <FormFieldGeneric :label="$t('view.sale.certificate.metalWeight')">
              <InputTextGeneric v-model="certificate.metalWeight" :disabled="!certificate.selected" />
            </FormFieldGeneric>
            <FormFieldGeneric :label="$t('view.sale.certificate.itemSize')">
              <InputTextGeneric v-model="certificate.itemSize" :disabled="!certificate.selected" />
            </FormFieldGeneric>
          </div>

          <template v-if="certificate.hasDiamond">
            <div class="field-group-title">{{ $t('view.sale.certificate.groupDiamond') }}</div>
            <div class="form-row two-col mb-3">
              <FormFieldGeneric :label="$t('view.sale.certificate.diamondPcs')">
                <InputTextGeneric v-model="certificate.diamondPcs" type="number" :disabled="!certificate.selected" />
              </FormFieldGeneric>
              <FormFieldGeneric :label="$t('view.sale.certificate.diamondWeight')">
                <InputTextGeneric v-model="certificate.diamondWeight" :disabled="!certificate.selected" />
              </FormFieldGeneric>
              <FormFieldGeneric :label="$t('view.sale.certificate.diamondQuality')">
                <InputTextGeneric v-model="certificate.diamondQuality" :disabled="!certificate.selected" />
              </FormFieldGeneric>
            </div>
          </template>

          <template v-if="certificate.hasGem">
            <div class="field-group-title">{{ $t('view.sale.certificate.groupGem') }}</div>
            <div class="form-row two-col mb-3">
              <FormFieldGeneric :label="$t('view.sale.certificate.gemVariety')">
                <InputTextGeneric v-model="certificate.gemVariety" :disabled="!certificate.selected" />
              </FormFieldGeneric>
              <FormFieldGeneric :label="$t('view.sale.certificate.gemSpecies')">
                <InputTextGeneric v-model="certificate.gemSpecies" :disabled="!certificate.selected" />
              </FormFieldGeneric>
              <FormFieldGeneric :label="$t('view.sale.certificate.gemOrigin')">
                <InputTextGeneric v-model="certificate.gemOrigin" :disabled="!certificate.selected" />
              </FormFieldGeneric>
              <FormFieldGeneric :label="$t('view.sale.certificate.gemWeight')">
                <InputTextGeneric v-model="certificate.gemWeight" :disabled="!certificate.selected" />
              </FormFieldGeneric>
              <FormFieldGeneric :label="$t('view.sale.certificate.gemMeasurement')">
                <InputTextGeneric v-model="certificate.gemMeasurement" :disabled="!certificate.selected" />
              </FormFieldGeneric>
              <FormFieldGeneric :label="$t('view.sale.certificate.gemShape')">
                <InputTextGeneric v-model="certificate.gemShape" :disabled="!certificate.selected" />
              </FormFieldGeneric>
              <FormFieldGeneric :label="$t('view.sale.certificate.gemCut')">
                <InputTextGeneric v-model="certificate.gemCut" :disabled="!certificate.selected" />
              </FormFieldGeneric>
              <FormFieldGeneric :label="$t('view.sale.certificate.gemColor')">
                <InputTextGeneric v-model="certificate.gemColor" :disabled="!certificate.selected" />
              </FormFieldGeneric>
            </div>
          </template>

          <div class="field-group-title">{{ $t('view.sale.certificate.groupRemark') }}</div>
          <div class="form-row two-col">
            <FormFieldGeneric :label="$t('view.sale.certificate.treatment')">
              <InputTextGeneric v-model="certificate.treatment" :disabled="!certificate.selected" />
            </FormFieldGeneric>
            <FormFieldGeneric :label="$t('view.sale.certificate.comment')">
              <InputTextGeneric v-model="certificate.comment" :disabled="!certificate.selected" />
            </FormFieldGeneric>
          </div>
        </SectionCardGeneric>
      </div>
    </template>

    <template #action>
      <button class="btn btn-main mr-2" type="button" :disabled="selectedCount === 0" @click="onPreview">
        <i class="bi bi-eye mr-1"></i>
        {{ $t('view.sale.certificate.previewBtn') }}
      </button>

      <button class="btn btn-green mr-2" type="button" :disabled="selectedCount === 0" @click="onDownload">
        <i class="bi bi-download mr-1"></i>
        {{ $t('view.sale.certificate.downloadBtnCount', { selected: selectedCount, total: certificates.length }) }}
      </button>

      <button class="btn btn-outline-main" type="button" @click="closeModal">
        <i class="bi bi-x-circle mr-1"></i>
        {{ $t('view.sale.certificate.cancelBtn') }}
      </button>
    </template>
  </DrawerGeneric>
</template>

<script>
import dayjs from 'dayjs'
import { warning } from '@/services/alert/sweetAlerts.js'
import { useInvoiceApiStore } from '@/stores/modules/api/sale/invoice-store.js'
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import DrawerGeneric from '@/components/generic/DrawerGeneric.vue'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import CheckboxGeneric from '@/components/prime-vue/CheckboxGeneric.vue'
import {
  buildCertificatesFromItems,
  parseCertificateLogs,
  buildCertificateIssueStats
} from '@/services/helper/pdf/certificate/certificate-data.js'

export default {
  name: 'CertificatePrintModal',

  components: {
    DrawerGeneric,
    SectionCardGeneric,
    FormFieldGeneric,
    InputTextGeneric,
    CheckboxGeneric
  },

  props: {
    isShowModal: {
      type: Boolean,
      default: false
    },
    invoiceData: {
      type: Object,
      default: () => ({})
    },
    invoiceItems: {
      type: Array,
      default: () => []
    },
    defaultSignerTitle: {
      type: String,
      default: 'General Manager'
    },
    historyVersion: {
      type: Number,
      default: 0
    }
  },

  emits: ['close-modal', 'preview-print', 'confirm-print'],

  data() {
    return {
      invoiceStore: useInvoiceApiStore(),
      productStore: usrStockProductApiStore(),
      certificates: [],
      signerTitle: this.defaultSignerTitle,
      history: [],
      historyLoading: false
    }
  },

  computed: {
    selectedCount() {
      return this.certificates.filter((c) => c.selected === true).length
    },

    historyNewestFirst() {
      return [...this.history].reverse()
    },

    issueStats() {
      return buildCertificateIssueStats(this.certificates, this.history)
    }
  },

  watch: {
    isShowModal: {
      async handler(newVal) {
        if (newVal) {
          this.signerTitle = this.defaultSignerTitle
          await this.buildCertificates()
          this.loadHistory()
        }
      },
      immediate: true
    },

    historyVersion() {
      if (this.isShowModal) {
        this.loadHistory()
      }
    }
  },

  methods: {
    closeModal() {
      this.$emit('close-modal')
    },

    async buildCertificates() {
      const enrichedItems = await this.enrichItemsTypeOrigin(this.invoiceItems)
      this.certificates = buildCertificatesFromItems(enrichedItems)
    },

    // typeOrigin ไม่มีใน snapshot ของ invoiceItem — enrich จาก StockProduct/Get ต่อชิ้น
    // ล้มเหลวทั้งก้อนหรือรายชิ้นก็ไม่พังหน้าจอ แค่ใช้ค่าจาก snapshot (fallback typeCode ใน certificate-data.js)
    async enrichItemsTypeOrigin(items) {
      const list = Array.isArray(items) ? items : []
      try {
        return await Promise.all(list.map((item) => this.enrichSingleItem(item)))
      } catch {
        return list
      }
    },

    async enrichSingleItem(item) {
      if (!item.stockNumber || !Array.isArray(item.materials) || !item.materials.length) return item

      try {
        const res = await this.productStore.fetchDataGet({
          formValue: { stockNumber: item.stockNumber },
          skipError: true
        })
        const liveMaterials = Array.isArray(res?.materials) ? res.materials : []

        const materials = item.materials.map((m, idx) => {
          const live = liveMaterials[idx]
          const typeOrigin = m.typeOrigin || (live && live.type === m.type ? live.typeOrigin : '') || m.typeCode
          return { ...m, typeOrigin }
        })

        return { ...item, materials }
      } catch {
        return item
      }
    },

    async loadHistory() {
      if (!this.invoiceData || !this.invoiceData.invoiceNumber) {
        this.history = []
        return
      }

      this.historyLoading = true
      try {
        const res = await this.invoiceStore.fetchPrintLogList({
          invoiceNumber: this.invoiceData.invoiceNumber
        })
        this.history = parseCertificateLogs(res?.data || [])
      } catch {
        this.history = []
      } finally {
        this.historyLoading = false
      }
    },

    formatHistoryDate(date) {
      if (!date) return '-'
      return dayjs(date).format('DD/MM/YYYY HH:mm')
    },

    getIssueStat(stockNumber) {
      return this.issueStats[stockNumber] || { count: 0, lastAt: null, lastBy: '' }
    },

    // ล็อตเงิน qty > 1 → หลายใบใช้เลขเดียวกัน ใส่ "สำเนาที่ x/N" กันสับสนว่าเป็นใบเดียวกัน
    certificateTitle(certificate, index) {
      const sameStockCertificates = this.certificates.filter((c) => c.stockNumber === certificate.stockNumber)
      const base = `#${index + 1} ${certificate.stockNumber} · ${certificate.itemNo}`
      if (sameStockCertificates.length <= 1) return base
      const copyIndex = sameStockCertificates.indexOf(certificate) + 1
      return `${base} · ${this.$t('view.sale.certificate.copiesPerItem', { index: copyIndex, total: sameStockCertificates.length })}`
    },

    selectAllCertificates() {
      this.certificates.forEach((c) => {
        c.selected = true
      })
    },

    selectNoneCertificates() {
      this.certificates.forEach((c) => {
        c.selected = false
      })
    },

    buildPayload() {
      const selectedCertificates = this.certificates.filter((c) => c.selected === true)
      return {
        certificates: JSON.parse(JSON.stringify(selectedCertificates)),
        signerTitle: this.signerTitle.trim() || 'General Manager'
      }
    },

    validateSelection() {
      const hasSelected = this.certificates.some((c) => c.selected === true)
      if (!hasSelected) {
        warning(
          this.$t('view.sale.certificate.validation.noItemSelected'),
          this.$t('common.label.incompleteData')
        )
        return false
      }
      return true
    },

    onPreview() {
      if (!this.validateSelection()) return
      this.$emit('preview-print', this.buildPayload())
    },

    onDownload() {
      if (!this.validateSelection()) return
      this.$emit('confirm-print', this.buildPayload())
      this.closeModal()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/mixin.scss';

.certificate-print-container {
  // Component-specific styles only
}

.drawer-print-title {
  font-size: var(--fs-lg);
  font-weight: 700;
  color: #ffffff;
}

.info-icon {
  font-size: var(--fs-lg);
}

.info-text {
  font-size: var(--fs-sm);
  color: #6c757d;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--sp-md);
}

.info-label-sm {
  font-size: 0.7rem;
  color: #6c757d;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  display: block;
  margin-bottom: var(--sp-xs);
}

.info-value-sm {
  font-size: var(--fs-sm);
  color: var(--base-font-color);
  font-weight: 600;
}

.field-group-title {
  font-size: 0.7rem;
  color: var(--base-green);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-bottom: var(--sp-sm);
}

.form-row {
  margin-bottom: var(--sp-lg);

  &.two-col {
    @include form-row-grid(2);
  }
}

// History section — reuse the visual style of .print-history-item from invoice-confirm-print-modal.vue
.history-loading,
.history-empty {
  padding: var(--sp-lg) var(--sp-md);
  text-align: center;
  color: #6c757d;
  font-size: var(--fs-sm);
}

.history-list {
  max-height: 240px;
  overflow-y: auto;
}

.print-history-item {
  padding: var(--sp-sm) var(--sp-md);
  border-bottom: 1px solid var(--color-border);
  font-size: var(--fs-sm);

  &:last-child {
    border-bottom: none;
  }

  &__copy {
    font-weight: 700;
    color: var(--base-font-color);
    display: inline;
  }

  &__date {
    display: inline;
    margin-left: var(--sp-xs);
    font-size: 11px;
    color: #6c757d;
  }

  &__by {
    font-size: 11px;
    color: var(--base-green);
    margin-top: 1px;
  }

  &__mode {
    font-size: 11px;
    color: #6c757d;
    margin-top: 2px;
  }

  &__stocks {
    font-size: 11px;
    color: #6c757d;
    margin-top: 2px;
    word-break: break-word;
  }
}

.selection-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-sm);
  padding: var(--sp-sm) var(--sp-md);
  background: var(--color-highlight-bg);
  border-radius: var(--radius-sm);
}

.selection-count {
  font-size: var(--fs-sm);
  font-weight: 600;
  color: var(--base-font-color);
}

.selection-actions {
  display: flex;
  gap: var(--sp-sm);
}

.issue-badge {
  display: inline-block;
  padding: var(--sp-xs) var(--sp-sm);
  border-radius: var(--radius-sm);
  font-size: 11px;
  font-weight: 600;

  &--issued {
    background: var(--color-green-bg);
    color: var(--base-green);
  }

  &--never {
    background: var(--color-highlight-bg);
    color: #6c757d;
  }
}
</style>
