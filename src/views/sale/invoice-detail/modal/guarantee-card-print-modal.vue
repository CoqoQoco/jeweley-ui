<template>
  <DrawerGeneric
    :show="isShowModal"
    width="760px"
    :isShowActionPart="true"
    headerVariant="main"
    @close="closeModal"
  >
    <template #title>
      <span class="drawer-print-title">
        <i class="bi bi-patch-check mr-2"></i>
        {{ $t('view.sale.guaranteeCard.title') }}
      </span>
    </template>

    <template #content>
      <div class="guarantee-card-print-container p-3">
        <!-- Info Container -->
        <div class="filter-container-search mb-3">
          <div class="p-3">
            <div class="info-grid mb-2">
              <div>
                <span class="info-label-sm">{{ $t('view.sale.guaranteeCard.invoiceNumber') }}</span>
                <div class="info-value-sm">{{ invoiceData?.invoiceNumber || '-' }}</div>
              </div>
              <div>
                <span class="info-label-sm">{{ $t('view.sale.guaranteeCard.customer') }}</span>
                <div class="info-value-sm">{{ invoiceData?.customerName || '-' }}</div>
              </div>
              <div>
                <span class="info-label-sm">{{ $t('view.sale.guaranteeCard.itemsCount') }}</span>
                <div class="info-value-sm">{{ cards.length }}</div>
              </div>
            </div>
            <div class="d-flex align-items-start">
              <i class="bi bi-info-circle text-info mr-2 info-icon"></i>
              <p class="mb-0 info-text">{{ $t('view.sale.guaranteeCard.hint') }}</p>
            </div>
          </div>
        </div>

        <!-- History Container -->
        <SectionCardGeneric
          headerStyle="legend"
          accent="main"
          icon="bi-clock-history"
          :title="`${$t('view.sale.guaranteeCard.historyTitle')} (${history.length})`"
          class="mb-3"
        >
          <div v-if="historyLoading" class="history-loading">{{ $t('common.label.loading') }}</div>
          <div v-else-if="history.length === 0" class="history-empty">
            {{ $t('view.sale.guaranteeCard.historyEmpty') }}
          </div>
          <div v-else class="history-list">
            <div v-for="entry in historyNewestFirst" :key="entry.running" class="print-history-item">
              <div class="print-history-item__copy">
                {{ $t('view.sale.guaranteeCard.historyRound', { round: entry.round }) }}
              </div>
              <div class="print-history-item__date">{{ formatHistoryDate(entry.printedAt) }}</div>
              <div class="print-history-item__by">{{ entry.printedBy }}</div>
              <div class="print-history-item__mode">
                {{ $t('view.sale.guaranteeCard.historyItems', { count: entry.count }) }}
              </div>
              <div class="print-history-item__stocks">{{ entry.stockNumbers.join(', ') }}</div>
            </div>
          </div>
        </SectionCardGeneric>

        <!-- Settings Container -->
        <div class="filter-container mb-3">
          <div class="p-3">
            <FormFieldGeneric :label="$t('view.sale.guaranteeCard.signerTitle')" inputId="guarantee-signer-title">
              <InputTextGeneric id="guarantee-signer-title" v-model="signerTitle" type="text" />
            </FormFieldGeneric>
          </div>
        </div>

        <!-- Selection Toolbar -->
        <div class="selection-toolbar mb-3">
          <span class="selection-count">
            {{ $t('view.sale.guaranteeCard.selectedCount', { selected: selectedCount, total: cards.length }) }}
          </span>
          <div class="selection-actions">
            <button type="button" class="btn btn-sm btn-outline-main" @click="selectAllCards">
              {{ $t('view.sale.guaranteeCard.selectAll') }}
            </button>
            <button type="button" class="btn btn-sm btn-dark" @click="selectNoneCards">
              {{ $t('view.sale.guaranteeCard.selectNone') }}
            </button>
          </div>
        </div>

        <!-- Card Items -->
        <SectionCardGeneric
          v-for="(card, index) in cards"
          :key="index"
          headerStyle="legend"
          accent="main"
          icon="bi-gem"
          :title="cardTitle(card, index)"
          class="mb-3"
        >
          <CheckboxGeneric
            v-model="card.selected"
            :label="$t('view.sale.guaranteeCard.printThisCard')"
            class="mb-2"
          />

          <div
            class="issue-badge mb-3"
            :class="getIssueStat(card.stockNumber).count > 0 ? 'issue-badge--issued' : 'issue-badge--never'"
          >
            <template v-if="getIssueStat(card.stockNumber).count > 0">
              {{ $t('view.sale.guaranteeCard.issuedCount', { count: getIssueStat(card.stockNumber).count }) }}
              <span class="mx-1">·</span>
              {{
                $t('view.sale.guaranteeCard.lastIssued', {
                  date: formatHistoryDate(getIssueStat(card.stockNumber).lastAt),
                  by: getIssueStat(card.stockNumber).lastBy
                })
              }}
            </template>
            <template v-else>{{ $t('view.sale.guaranteeCard.neverIssued') }}</template>
          </div>

          <div class="form-row two-col">
            <FormFieldGeneric :label="$t('view.sale.guaranteeCard.code')">
              <InputTextGeneric v-model="card.code" :disabled="!card.selected" />
            </FormFieldGeneric>
            <FormFieldGeneric :label="$t('view.sale.guaranteeCard.goodsSpecify')">
              <InputTextGeneric v-model="card.goodsSpecify" :disabled="!card.selected" />
            </FormFieldGeneric>
            <FormFieldGeneric :label="$t('view.sale.guaranteeCard.goldWeight')">
              <InputTextGeneric v-model="card.goldWeight" :disabled="!card.selected" />
            </FormFieldGeneric>
            <FormFieldGeneric :label="$t('view.sale.guaranteeCard.diamondWeight')">
              <InputTextGeneric v-model="card.diamondWeight" :disabled="!card.selected" />
            </FormFieldGeneric>
            <FormFieldGeneric :label="$t('view.sale.guaranteeCard.diamondQuality')">
              <InputTextGeneric v-model="card.diamondQuality" :disabled="!card.selected" />
            </FormFieldGeneric>
          </div>

          <div class="gem-rows">
            <div v-for="(gem, gemIndex) in card.gemRows" :key="gemIndex" class="gem-row">
              <InputTextGeneric
                v-model="gem.name"
                :placeholder="$t('view.sale.guaranteeCard.gemName')"
                :disabled="!card.selected"
              />
              <InputTextGeneric
                v-model="gem.weight"
                :placeholder="$t('view.sale.guaranteeCard.gemWeight')"
                :disabled="!card.selected"
              />
              <button
                type="button"
                class="btn btn-sm btn-outline-main"
                :disabled="!card.selected"
                :title="$t('view.sale.guaranteeCard.removeGem')"
                @click="removeGemRow(card, gemIndex)"
              >
                <i class="bi bi-trash"></i>
              </button>
            </div>
            <button
              type="button"
              class="btn btn-sm btn-dark mt-2"
              :disabled="!card.selected"
              @click="addGemRow(card)"
            >
              <i class="bi bi-plus-circle mr-1"></i>{{ $t('view.sale.guaranteeCard.addGem') }}
            </button>
          </div>
        </SectionCardGeneric>
      </div>
    </template>

    <template #action>
      <button class="btn btn-main mr-2" type="button" :disabled="selectedCount === 0" @click="onPreview">
        <i class="bi bi-eye mr-1"></i>
        {{ $t('view.sale.guaranteeCard.previewBtn') }}
      </button>

      <button class="btn btn-green mr-2" type="button" :disabled="selectedCount === 0" @click="onDownload">
        <i class="bi bi-download mr-1"></i>
        {{ $t('view.sale.guaranteeCard.downloadBtnCount', { selected: selectedCount, total: cards.length }) }}
      </button>

      <button class="btn btn-outline-main" type="button" @click="closeModal">
        <i class="bi bi-x-circle mr-1"></i>
        {{ $t('view.sale.guaranteeCard.cancelBtn') }}
      </button>
    </template>
  </DrawerGeneric>
</template>

<script>
import dayjs from 'dayjs'
import { warning } from '@/services/alert/sweetAlerts.js'
import { useInvoiceApiStore } from '@/stores/modules/api/sale/invoice-store.js'
import DrawerGeneric from '@/components/generic/DrawerGeneric.vue'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import CheckboxGeneric from '@/components/prime-vue/CheckboxGeneric.vue'
import {
  buildGuaranteeCardsFromItems,
  parseGuaranteeLogs,
  buildCardIssueStats
} from '@/services/helper/pdf/guarantee-card/guarantee-card-data.js'

export default {
  name: 'GuaranteeCardPrintModal',

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
      cards: [],
      signerTitle: this.defaultSignerTitle,
      history: [],
      historyLoading: false
    }
  },

  computed: {
    selectedCount() {
      return this.cards.filter((c) => c.selected === true).length
    },

    historyNewestFirst() {
      return [...this.history].reverse()
    },

    issueStats() {
      return buildCardIssueStats(this.cards, this.history)
    }
  },

  watch: {
    isShowModal: {
      handler(newVal) {
        if (newVal) {
          this.cards = buildGuaranteeCardsFromItems(this.invoiceItems)
          this.signerTitle = this.defaultSignerTitle
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
        this.history = parseGuaranteeLogs(res?.data || [])
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

    // ล็อตเงิน qty > 1 → หลายการ์ดใช้เลขเดียวกัน ใส่ "สำเนาที่ x/N" กันสับสนว่าเป็นการ์ดใบเดียวกัน
    cardTitle(card, index) {
      const sameStockCards = this.cards.filter((c) => c.stockNumber === card.stockNumber)
      const base = `#${index + 1} ${card.stockNumber} · ${card.productNumber}`
      if (sameStockCards.length <= 1) return base
      const copyIndex = sameStockCards.indexOf(card) + 1
      return `${base} · ${this.$t('view.sale.guaranteeCard.copiesPerItem', { index: copyIndex, total: sameStockCards.length })}`
    },

    selectAllCards() {
      this.cards.forEach((c) => {
        c.selected = true
      })
    },

    selectNoneCards() {
      this.cards.forEach((c) => {
        c.selected = false
      })
    },

    addGemRow(card) {
      card.gemRows.push({ name: '', weight: '' })
    },

    removeGemRow(card, gemIndex) {
      card.gemRows.splice(gemIndex, 1)
    },

    buildPayload() {
      const selectedCards = this.cards.filter((c) => c.selected === true)
      return {
        cards: JSON.parse(JSON.stringify(selectedCards)),
        signerTitle: this.signerTitle.trim() || 'General Manager'
      }
    },

    validateSelection() {
      const hasSelected = this.cards.some((c) => c.selected === true)
      if (!hasSelected) {
        warning(
          this.$t('view.sale.guaranteeCard.validation.noItemSelected'),
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

.guarantee-card-print-container {
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

.form-row {
  margin-bottom: var(--sp-lg);

  &.two-col {
    @include form-row-grid(2);
  }
}

.gem-rows {
  margin-top: var(--sp-md);
}

.gem-row {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: var(--sp-sm);
  align-items: center;
  margin-bottom: var(--sp-sm);
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
