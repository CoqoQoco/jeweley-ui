<template>
  <div class="mobile-rfid-bind-view">
    <div class="mobile-container">
      <!-- Success state -->
      <SectionCardGeneric v-if="boundResult" :title="$t('view.mobile.rfidBind.bindSuccessTitle')">
        <div class="state-box state-ok">
          <i class="bi bi-check-circle-fill"></i>
          <div class="state-body">
            <span class="break">{{ $t('view.mobile.rfidBind.bindSuccessMsg', { epc: boundResult.epc, stockNumber: boundResult.stockNumber }) }}</span>
            <strong v-if="boundResult.unitLabel">
              {{ $t('view.mobile.rfidBind.boundUnit', { unit: boundResult.unitLabel }) }}
            </strong>
            <span v-if="boundResult.locationName">
              {{ $t('view.mobile.rfidBind.pieceLocation') }}: {{ boundResult.locationName }}
            </span>
          </div>
        </div>
        <ButtonGeneric
          class="big-btn"
          variant="main"
          icon="bi-arrow-right-circle"
          :label="$t('view.mobile.rfidBind.nextPieceBtn')"
          :block="true"
          @click="resetAll"
        />
      </SectionCardGeneric>

      <template v-else>
        <!-- Step 1: pick piece -->
        <SectionCardGeneric :title="$t('view.mobile.rfidBind.stepPiece')">
          <div class="scan-bar-row">
            <InputTextGeneric
              :modelValue="scanInput"
              icon="bi-upc-scan"
              :placeholder="$t('view.mobile.rfidBind.piecePlaceholder')"
              @update:modelValue="onManualInput"
              @keyup.enter="handleManualSearch"
            />
            <ButtonGeneric
              class="big-btn"
              variant="green"
              icon="bi-search"
              :title="$t('common.btn.search')"
              :loading="isSearching"
              @click="handleManualSearch"
            />
            <ButtonGeneric
              class="big-btn"
              variant="outline"
              icon="bi-camera"
              :title="$t('view.mobile.rfidBind.cameraBtn')"
              @click="showCamera = true"
            />
          </div>

          <div v-if="!piece" class="mobile-empty-state mobile-mt-2">
            <i class="bi bi-broadcast"></i>
            <div class="empty-title">{{ $t('view.mobile.rfidBind.emptyTitle') }}</div>
            <div class="empty-subtitle">{{ $t('view.mobile.rfidBind.emptySubtitle') }}</div>
          </div>

          <div v-else class="mobile-mt-2">
            <PieceSummary
              :stockNumber="piece.stockNumber"
              :stockNumberOrigin="piece.stockNumberOrigin"
              :productCode="piece.productCode"
              :name="pieceName"
              :location="piece.location"
              :status="piece.status"
            />

            <p class="hint mobile-mt-2">
              <i class="bi bi-info-circle"></i>
              {{ $t('view.mobile.rfidBind.lotUnitsSummary', { tagged: taggedCount, total: units.length, qty: lotQty }) }}
            </p>

            <UnitList
              v-if="units.length"
              :units="units"
              :lotQty="lotQty"
              :chosenUnitId="chosenUnitId"
              @choose="chosenUnitId = $event"
              @unbind="handleUnbind"
            />
            <div v-else class="state-box state-warn">
              <i class="bi bi-exclamation-triangle-fill"></i>
              <span>{{ $t('view.mobile.rfidBind.noUnits') }}</span>
            </div>
          </div>
        </SectionCardGeneric>

        <!-- Step 2: read tag -->
        <SectionCardGeneric v-if="piece" :title="$t('view.mobile.rfidBind.stepTag')" class="mobile-mt-2">
          <p class="hint">
            <i class="bi bi-info-circle"></i>
            {{ $t('view.mobile.rfidBind.readOneAtATime') }}
          </p>

          <template v-if="available">
            <ButtonGeneric
              v-if="!reading"
              class="big-btn"
              variant="green"
              icon="bi-broadcast"
              :label="tags.length ? $t('view.mobile.rfidBind.rereadBtn') : $t('view.mobile.rfidBind.readBtn')"
              :block="true"
              @click="handleStartRead"
            />
            <ButtonGeneric
              v-else
              class="big-btn"
              variant="dark"
              icon="bi-stop-circle"
              :label="$t('view.mobile.rfidBind.stopReadBtn')"
              :block="true"
              @click="stop"
            />
            <p v-if="reading" class="hint reading-hint">
              <i class="bi bi-broadcast"></i>
              {{ $t('view.mobile.rfidBind.readingHint') }}
            </p>
          </template>

          <ButtonGeneric
            v-if="available && !showManual"
            class="big-btn mobile-mt-1"
            variant="outline"
            icon="bi-keyboard"
            :label="$t('view.mobile.rfidBind.manualToggleBtn')"
            :block="true"
            @click="showManual = true"
          />

          <div v-if="showManual || !available" class="scan-bar-row mobile-mt-1">
            <InputTextGeneric
              :modelValue="manualEpc"
              icon="bi-keyboard"
              :placeholder="$t('view.mobile.rfidBind.manualPlaceholder')"
              @update:modelValue="onManualEpcInput"
              @keyup.enter="handleManualEpc"
            />
            <ButtonGeneric
              class="big-btn"
              variant="main"
              icon="bi-check2"
              :title="$t('view.mobile.rfidBind.manualUseBtn')"
              @click="handleManualEpc"
            />
          </div>

          <div class="mobile-mt-2">
            <p v-if="!tags.length" class="hint">{{ $t('view.mobile.rfidBind.noTagYet') }}</p>
            <template v-else>
              <div v-if="tags.length > 1" class="state-box state-warn">
                <i class="bi bi-exclamation-triangle-fill"></i>
                <span>{{ $t('view.mobile.rfidBind.multiTagWarn', { count: tags.length }) }}</span>
              </div>
              <TagList :tags="tagsByRssi" :selectedEpc="selectedTag ? selectedTag.epc : ''" @select="selectTag" />
            </template>
          </div>
        </SectionCardGeneric>

        <!-- Step 3: confirm -->
        <SectionCardGeneric v-if="piece && selectedTag && epcInfo" :title="$t('view.mobile.rfidBind.stepConfirm')" class="mobile-mt-2">
          <div class="state-box" :class="epcStateClass">
            <i class="bi" :class="epcStateIcon"></i>
            <div class="state-body">
              <strong>{{ epcStateText }}</strong>
              <span class="break">{{ selectedTag.epc }}</span>
              <span v-if="epcInfo.found && !epcIsThisPiece">
                {{ $t('view.mobile.rfidBind.epcBoundOwner', { stockNumber: epcInfo.stockNumber, name: epcInfo.productName || '-' }) }}
              </span>
              <span v-if="epcInfo.found && epcUnitLabel">
                {{ $t('view.mobile.rfidBind.boundUnit', { unit: epcUnitLabel }) }}
                <template v-if="epcInfo.unitStatus"> · {{ unitStatusText(epcInfo.unitStatus) }}</template>
              </span>
              <span v-if="epcInfo.found && (epcInfo.unitLocationName || epcInfo.unitLocationCode)">
                {{ $t('view.mobile.rfidBind.pieceLocation') }}: {{ epcInfo.unitLocationName || epcInfo.unitLocationCode }}
              </span>
            </div>
          </div>

          <div v-if="epcInfo.found && epcInfo.soldMismatch" class="state-box state-warn mobile-mt-1">
            <i class="bi bi-exclamation-triangle-fill"></i>
            <span>{{ $t('view.mobile.rfidBind.soldMismatchWarn') }}</span>
          </div>

          <div v-if="!epcInfo.found && !freeList.length" class="state-box state-warn mobile-mt-1">
            <i class="bi bi-exclamation-triangle-fill"></i>
            <span>{{ $t('view.mobile.rfidBind.lotFullyTaggedBlock') }}</span>
          </div>

          <p v-if="!epcInfo.found && freeList.length" class="hint mobile-mt-1">
            <i class="bi bi-info-circle"></i>
            {{ bindTargetText }}
          </p>

          <ButtonGeneric
            class="big-btn mobile-mt-2"
            variant="main"
            icon="bi-link-45deg"
            :label="$t('view.mobile.rfidBind.bindBtn')"
            :block="true"
            :disabled="!canBind"
            @click="handleBind"
          />
        </SectionCardGeneric>
      </template>
    </div>

    <CameraScanGeneric :visible="showCamera" @detect="onCameraDetect" @close="showCamera = false" />
  </div>
</template>

<script>
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import { useStockRfidApiStore } from '@/stores/modules/api/stock/rfid-api.js'
import { warning, error, success } from '@/services/alert/sweetAlerts.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { useRfidReader, isValidEpc, normalizeEpc } from '@/composables/useRfidReader.js'
import { fetchStockProduct } from '@/services/utils/stock-scan.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import CameraScanGeneric from '@/components/generic/CameraScanGeneric.vue'
import PieceSummary from './components/piece-summary.vue'
import TagList from './components/tag-list.vue'
import UnitList from './components/unit-list.vue'
import { formatUnit, freeUnits, resolveChosenUnitId } from './rfid-bind-helpers.js'

export default {
  name: 'MobileRfidBindView',

  components: {
    SectionCardGeneric,
    InputTextGeneric,
    ButtonGeneric,
    CameraScanGeneric,
    PieceSummary,
    TagList,
    UnitList
  },

  setup() {
    const productStore = usrStockProductApiStore()
    const rfidStore = useStockRfidApiStore()
    const { available, reading, tags, tagsByRssi, start, stop, clear, addManual } = useRfidReader()
    return { productStore, rfidStore, available, reading, tags, tagsByRssi, start, stop, clear, addManual }
  },

  data() {
    return {
      scanInput: '',
      showCamera: false,
      isSearching: false,
      piece: null,
      units: [],
      lotQty: 0,
      chosenUnitId: null,
      selectedTag: null,
      epcInfo: null,
      manualEpc: '',
      showManual: false,
      boundResult: null
    }
  },

  computed: {
    pieceName() {
      if (!this.piece) return ''
      return this.piece.productNameTh || this.piece.productNameEn || ''
    },

    freeList() {
      return freeUnits(this.units)
    },

    taggedCount() {
      return this.units.filter((u) => !!u.epc).length
    },

    epcUnitLabel() {
      return this.epcInfo ? formatUnit(this.epcInfo.unitNo, this.epcInfo.lotQty) : ''
    },

    bindTargetText() {
      const unit = this.freeList.find((u) => u.unitId === this.chosenUnitId)
      return unit
        ? this.$t('view.mobile.rfidBind.bindTargetChosen', { unit: formatUnit(unit.unitNo, this.lotQty) })
        : this.$t('view.mobile.rfidBind.bindTargetAuto')
    },

    epcIsThisPiece() {
      return (
        !!this.epcInfo?.found &&
        !!this.piece &&
        this.epcInfo.stockNumber === this.piece.stockNumber &&
        this.epcInfo.productCode === this.piece.productCode
      )
    },

    canBind() {
      return !!this.piece && !!this.selectedTag && !!this.epcInfo && !this.epcInfo.found && this.freeList.length > 0
    },

    epcStateClass() {
      if (!this.epcInfo.found) return 'state-ok'
      return this.epcIsThisPiece ? 'state-info' : 'state-error'
    },

    epcStateIcon() {
      if (!this.epcInfo.found) return 'bi-check-circle-fill'
      return this.epcIsThisPiece ? 'bi-info-circle' : 'bi-x-circle-fill'
    },

    epcStateText() {
      if (!this.epcInfo.found) return this.$t('view.mobile.rfidBind.epcFree')
      return this.epcIsThisPiece ? this.$t('view.mobile.rfidBind.epcBoundToThis') : this.$t('view.mobile.rfidBind.epcBoundToOther')
    }
  },

  watch: {
    // อ่านได้แท็กเดียว → เลือกให้เลย / หลายแท็ก → ล้างที่เลือกไว้ ให้ผู้ใช้เลือกเอง
    'tags.length'(count) {
      if (count === 1) {
        this.selectTag(this.tags[0])
      } else if (count > 1) {
        this.clearSelection()
      }
    }
  },

  methods: {
    onManualInput(value) {
      this.scanInput = value.toUpperCase()
    },

    onManualEpcInput(value) {
      this.manualEpc = normalizeEpc(value)
    },

    async handleManualSearch() {
      if (!this.scanInput || !this.scanInput.trim()) {
        warning(this.$t('view.mobile.rfidBind.warnEnterCode'))
        return
      }
      await this.searchPiece(this.scanInput.trim())
    },

    onCameraDetect(code) {
      this.showCamera = false
      this.searchPiece(String(code).toUpperCase().trim())
    },

    // ลองรหัสเก่า (stockNumberOrigin) ก่อน แล้วค่อยรหัสใหม่ — เหมือนหน้า /mobile/scan
    async findProduct(code) {
      const byOriginCode = await fetchStockProduct(this.productStore, { stockNumberOrigin: code })
      if (byOriginCode.status !== 'not-found') return byOriginCode
      return await fetchStockProduct(this.productStore, { stockNumber: code })
    },

    // StockProduct/Get ไม่ส่ง productCode (คีย์ผสมของ piece) → ใช้ถ้ามี ไม่มีก็ดึงจาก StockProduct/List
    async resolveProductCode(product) {
      if (product.productCode) return product.productCode

      await this.productStore.fetchDataSearch({
        take: 20,
        skip: 0,
        sort: [],
        formValue: { stockNumber: product.stockNumber }
      })
      const rows = this.productStore.dataSearch?.data || []
      const row = rows.find((r) => r.stockNumber === product.stockNumber && r.productCode)
      return row ? row.productCode : ''
    },

    async searchPiece(code) {
      if (this.isSearching) return
      this.isSearching = true

      const { data, status, httpStatus } = await this.findProduct(code)

      if (status === 'ok') {
        const productCode = await this.resolveProductCode(data)
        if (!productCode) {
          error(this.$t('view.mobile.rfidBind.errorNoProductCode'))
        } else {
          this.resetTag()
          this.piece = {
            stockNumber: data.stockNumber,
            stockNumberOrigin: data.stockNumberOrigin || '',
            productCode,
            productNameTh: data.productNameTh,
            productNameEn: data.productNameEn,
            location: data.location || '',
            status: data.status || ''
          }
          this.scanInput = ''
          await this.loadUnits()
        }
      } else if (status === 'not-found') {
        error(this.$t('view.mobile.rfidBind.errorProductNotFound'), this.$t('view.mobile.rfidBind.errorCheckCode'))
      } else {
        error(this.$t('view.mobile.rfidBind.errorLookupFailed', { status: httpStatus || 'Network' }))
      }

      this.isSearching = false
    },

    async loadUnits() {
      const res = await this.rfidStore.fetchByStock({
        stockNumber: this.piece.stockNumber,
        productCode: this.piece.productCode
      })
      this.units = res?.units || []
      this.lotQty = Number(res?.lotQty) || this.units.length
      this.chosenUnitId = resolveChosenUnitId(this.units, this.chosenUnitId)
    },

    unitStatusText(status) {
      const key = { IN_STOCK: 'unitInStock', RESERVED: 'unitReserved', SOLD: 'unitSold' }[status]
      return key ? this.$t(`view.mobile.rfidBind.${key}`) : status || ''
    },

    handleUnbind(unit) {
      confirmThenSubmit(
        this.$t('view.mobile.rfidBind.unbindConfirmMsg', {
          epc: unit.epc,
          stockNumber: `${this.piece.stockNumber} (${formatUnit(unit.unitNo, this.lotQty)})`
        }),
        this.$t('view.mobile.rfidBind.unbindConfirmTitle'),
        async () => {
          const res = await this.rfidStore.fetchUnbind({
            epc: unit.epc,
            unitId: unit.unitId,
            stockNumber: this.piece.stockNumber,
            productCode: this.piece.productCode
          })
          if (res && res.unbound) {
            success(this.$t('view.mobile.rfidBind.unbindSuccess'))
          } else {
            warning(this.$t('view.mobile.rfidBind.unbindNothing'))
          }
          this.resetTag()
          await this.loadUnits()
        }
      )
    },

    handleStartRead() {
      this.resetTag()
      this.start()
    },

    handleManualEpc() {
      if (!isValidEpc(this.manualEpc)) {
        warning(this.$t('view.mobile.rfidBind.warnInvalidEpc'))
        return
      }
      this.addManual(this.manualEpc)
      this.manualEpc = ''
    },

    async selectTag(tag) {
      this.selectedTag = tag
      this.epcInfo = null
      const info = await this.rfidStore.fetchByEpc(tag.epc)
      // กันผลย้อนกลับมาช้าหลังผู้ใช้เปลี่ยนแท็กไปแล้ว
      if (this.selectedTag && this.selectedTag.epc === tag.epc) {
        this.epcInfo = info || { found: false }
      }
    },

    clearSelection() {
      this.selectedTag = null
      this.epcInfo = null
    },

    // ล้างแท็กที่อ่านไว้ทั้งหมด (ไม่แตะข้อมูลชิ้นสินค้า)
    resetTag() {
      this.stop()
      this.clear()
      this.clearSelection()
    },

    handleBind() {
      if (!this.canBind) return
      confirmThenSubmit(
        this.$t('view.mobile.rfidBind.bindConfirmMsg', { epc: this.selectedTag.epc, stockNumber: this.piece.stockNumber }),
        this.$t('view.mobile.rfidBind.bindConfirmTitle'),
        async () => {
          const res = await this.rfidStore.fetchBind({
            epc: this.selectedTag.epc,
            tid: this.selectedTag.tid,
            stockNumber: this.piece.stockNumber,
            productCode: this.piece.productCode,
            unitId: this.chosenUnitId
          })
          if (res) {
            this.stop()
            this.boundResult = {
              epc: res.epc || this.selectedTag.epc,
              stockNumber: res.stockNumber || this.piece.stockNumber,
              unitLabel: formatUnit(res.unitNo, res.lotQty),
              locationName: res.unitLocationName || res.unitLocationCode || ''
            }
          }
        },
        null,
        'question'
      )
    },

    resetAll() {
      this.resetTag()
      this.piece = null
      this.units = []
      this.lotQty = 0
      this.chosenUnitId = null
      this.boundResult = null
      this.scanInput = ''
      this.manualEpc = ''
      this.showManual = false
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/mobile';

.mobile-rfid-bind-view {
  min-height: 100vh;
  padding-bottom: calc(70px + env(safe-area-inset-bottom, 0px));
}

.scan-bar-row {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);

  > :first-child {
    flex: 1;
  }
}

.big-btn {
  min-height: 52px;
  font-size: 1.05rem;
}

.hint {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  margin: 0 0 var(--sp-md);
  color: var(--base-sub-color);
}

.reading-hint {
  margin: var(--sp-md) 0 0;
  color: var(--base-green);
  font-weight: 600;
}

.state-box {
  display: flex;
  align-items: flex-start;
  gap: var(--sp-md);
  padding: var(--sp-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--base-font-sub-color);

  > i {
    font-size: 1.3rem;
    flex-shrink: 0;
  }

  &.state-ok {
    background: var(--color-green-bg);
    border-color: var(--base-green);

    > i {
      color: var(--base-green);
    }
  }

  &.state-warn {
    border-color: var(--base-warning);

    > i {
      color: var(--base-warning);
    }
  }

  &.state-error {
    background: var(--color-highlight-bg);
    border-color: var(--base-red);

    > i {
      color: var(--base-red);
    }
  }
}

.state-body {
  display: flex;
  flex-direction: column;
  gap: var(--sp-xs);
  min-width: 0;
}

.break {
  word-break: break-all;
}
</style>
