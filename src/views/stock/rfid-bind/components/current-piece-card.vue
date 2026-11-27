<template>
  <SectionCardGeneric class="piece-card" :title="$t('view.stock.rfidBind.card.current', { no: index + 1 })" icon="bi-gem" accent="main" headerStyle="legend">
    <div v-if="unit" class="piece-card__body">
      <div class="piece-card__image">
        <imagePreview v-if="unit.imagePath" :imageName="unit.imagePath" type="STOCK-PRODUCT" :width="200" :height="200" />
        <div v-else class="piece-card__noimage">
          <i class="bi bi-image" aria-hidden="true"></i>
          <span>{{ $t('view.stock.rfidBind.card.noImage') }}</span>
        </div>
      </div>

      <div class="piece-card__info">
        <span class="piece-card__no">{{ number }}</span>
        <span v-if="secondary" class="piece-card__secondary">{{ secondary }}</span>
        <span class="piece-card__name">{{ name }}</span>
        <span v-if="planText" class="piece-card__secondary">{{ $t('view.stock.rfidBind.plan.colPlan') }} {{ planText }}</span>
        <div class="piece-card__chips">
          <span v-if="unitText" class="piece-chip">{{ $t('view.stock.rfidBind.card.unitOfLot', { unit: unitText }) }}</span>
          <span class="piece-chip">{{ $t('view.stock.rfidBind.card.location', { code: unit.locationCode }) }}</span>
          <span v-if="unit.productNumber" class="piece-chip">{{ $t('view.stock.rfidBind.card.productCode', { code: unit.productNumber }) }}</span>
          <span v-if="unit.unitStatus === 'RESERVED'" class="piece-chip piece-chip--reserved">{{ $t('view.stock.rfidBind.queue.reserved') }}</span>
          <span class="piece-chip piece-chip--src"><i :class="['bi', viaScan ? 'bi-upc-scan' : 'bi-list-ol']" aria-hidden="true"></i> {{ viaScan ? $t('view.stock.rfidBind.card.viaScan') : $t('view.stock.rfidBind.card.viaQueue') }}</span>
        </div>
      </div>
    </div>

    <div v-if="notice" :class="['piece-banner', `piece-banner--${notice.kind}`]" role="status">
      <i :class="['bi', notice.kind === 'success' ? 'bi-check-circle-fill' : notice.kind === 'warn' ? 'bi-exclamation-triangle-fill' : 'bi-info-circle-fill']" aria-hidden="true"></i>
      <span>{{ notice.text }}</span>
    </div>

    <div :class="['status-box', `status-box--${tone}`]" role="status" aria-live="polite">
      <!-- queue ว่าง -->
      <template v-if="kind === 'empty'">
        <i class="bi bi-inbox status-box__icon" aria-hidden="true"></i>
        <div class="status-box__text">
          <span class="status-box__title">{{ $t('view.stock.rfidBind.queue.emptyTitle') }}</span>
          <span class="status-box__hint">{{ $t('view.stock.rfidBind.queue.emptyHint') }}</span>
        </div>
        <ButtonGeneric variant="main" icon="bi-plus-lg" :label="$t('view.stock.rfidBind.toolbar.addToQueue')" @click="$emit('add')" />
      </template>

      <!-- ผูกครบ -->
      <template v-else-if="kind === 'done'">
        <i class="bi bi-check-circle-fill status-box__icon" aria-hidden="true"></i>
        <div class="status-box__text">
          <span class="status-box__title">{{ $t('view.stock.rfidBind.status.doneTitle') }}</span>
          <span class="status-box__hint">{{ $t('view.stock.rfidBind.status.doneHint') }}</span>
        </div>
        <ButtonGeneric variant="main" icon="bi-plus-lg" :label="$t('view.stock.rfidBind.toolbar.addToQueue')" @click="$emit('add')" />
        <ButtonGeneric class="ml-2" variant="outline" icon="bi-trash" :label="$t('view.stock.rfidBind.queue.clear')" @click="$emit('clear')" />
      </template>

      <!-- ยิงป้ายเจอหลายล็อต -->
      <template v-else-if="kind === 'pick'">
        <div class="status-box__text status-box__text--full">
          <span class="status-box__title"><i class="bi bi-upc-scan" aria-hidden="true"></i> {{ $t('view.stock.rfidBind.scan.pickTitle') }}</span>
          <span class="status-box__hint">{{ $t('view.stock.rfidBind.scan.pickHint') }}</span>
          <div class="pick-list" role="listbox">
            <div
              v-for="(lot, i) in lots"
              :key="lot.key"
              role="option"
              :aria-selected="i === pickIndex"
              :class="['pick-item', { 'pick-item--active': i === pickIndex }]"
              @click="$emit('pick', i)"
            >
              {{ lot.line }}
            </div>
          </div>
          <ButtonGeneric variant="outline" :label="$t('view.stock.rfidBind.scan.pickCancel')" @click="$emit('pickCancel')" />
        </div>
      </template>

      <!-- เครื่องอ่านยังไม่ต่อ -->
      <template v-else-if="kind === 'readerOff'">
        <i class="bi bi-broadcast status-box__icon" aria-hidden="true"></i>
        <div class="status-box__text">
          <span class="status-box__title">{{ unsupported ? $t('view.stock.rfidBind.reader.unsupportedWarn') : readerLost ? $t('view.stock.rfidBind.reader.lostWarn') : $t('view.stock.rfidBind.reader.notConnectedTitle') }}</span>
          <span v-if="!unsupported && !readerLost" class="status-box__hint">{{ $t('view.stock.rfidBind.reader.notConnectedHint') }}</span>
        </div>
        <template v-if="!unsupported">
          <ButtonGeneric
            v-if="supportedKinds.includes('ble')"
            variant="main"
            icon="bi-bluetooth"
            :label="$t('view.stock.rfidBasket.reader.connectBle')"
            :disabled="busy"
            @click="$emit('connect', 'ble')"
          />
          <ButtonGeneric
            v-if="supportedKinds.includes('hid')"
            variant="main"
            :class="{ 'ml-2': supportedKinds.includes('ble') }"
            icon="bi-usb-symbol"
            :label="$t('view.stock.rfidBasket.reader.connectHid')"
            :disabled="busy"
            @click="$emit('connect', 'hid')"
          />
        </template>
      </template>

      <!-- หยุดชั่วคราวระหว่างเพิ่มคิว -->
      <template v-else-if="kind === 'paused'">
        <i class="bi bi-pause-circle status-box__icon" aria-hidden="true"></i>
        <div class="status-box__text">
          <span class="status-box__title">{{ $t('view.stock.rfidBind.reader.pausedByModal') }}</span>
        </div>
      </template>

      <!-- bind error -->
      <template v-else-if="kind === 'error'">
        <i class="bi bi-x-octagon-fill status-box__icon" aria-hidden="true"></i>
        <div class="status-box__text">
          <span class="status-box__title">{{ $t('view.stock.rfidBind.status.errorTitle') }}</span>
          <span class="status-box__hint">{{ message }}</span>
          <span class="status-box__hint">{{ $t('view.stock.rfidBind.status.errorHint') }}</span>
        </div>
        <ButtonGeneric variant="main" icon="bi-arrow-repeat" :label="$t('view.stock.rfidBind.status.retry')" @click="$emit('retry')" />
      </template>

      <!-- กำลังผูก -->
      <template v-else-if="kind === 'binding'">
        <i class="bi bi-arrow-repeat status-box__icon status-box__icon--spin" aria-hidden="true"></i>
        <div class="status-box__text">
          <span class="status-box__title">{{ $t('view.stock.rfidBind.status.pendingBinding') }}</span>
          <span class="status-box__hint status-box__epc">EPC {{ epc }}</span>
        </div>
      </template>

      <!-- เจอแท็กใหม่ 1 ใบ -->
      <template v-else-if="kind === 'pending'">
        <i class="bi bi-tag-fill status-box__icon" aria-hidden="true"></i>
        <div class="status-box__text">
          <span class="status-box__title">{{ $t('view.stock.rfidBind.status.pendingTitle') }}</span>
          <span class="status-box__hint status-box__epc">EPC {{ epc }}</span>
        </div>
        <ButtonGeneric v-if="!autoBind" variant="main" icon="bi-link-45deg" :label="$t('view.stock.rfidBind.status.bindNow')" @click="$emit('bind')" />
        <span v-else class="status-box__hint">{{ $t('view.stock.rfidBind.status.pendingBinding') }}</span>
      </template>

      <!-- แท็กใหม่หลายใบ -->
      <template v-else-if="kind === 'multi'">
        <i class="bi bi-exclamation-triangle-fill status-box__icon" aria-hidden="true"></i>
        <div class="status-box__text">
          <span class="status-box__title">{{ $t('view.stock.rfidBind.status.multiTitle', { count }) }}</span>
          <span class="status-box__hint">{{ $t('view.stock.rfidBind.status.multiHint') }}</span>
        </div>
      </template>

      <!-- แท็กผูกกับชิ้นอื่น -->
      <template v-else-if="kind === 'taken'">
        <i class="bi bi-slash-circle-fill status-box__icon" aria-hidden="true"></i>
        <div class="status-box__text">
          <span class="status-box__title">{{ $t('view.stock.rfidBind.status.takenTitle', { no: otherNo }) }}</span>
          <span class="status-box__hint">{{ $t('view.stock.rfidBind.status.takenHint') }}</span>
        </div>
      </template>

      <!-- แท็กของชิ้นที่ขายแล้ว -->
      <template v-else-if="kind === 'sold'">
        <i class="bi bi-exclamation-octagon-fill status-box__icon" aria-hidden="true"></i>
        <div class="status-box__text">
          <span class="status-box__title">{{ $t('view.stock.rfidBind.status.soldTitle', { no: otherNo }) }}</span>
          <span class="status-box__hint">{{ $t('view.stock.rfidBind.status.soldHint') }}</span>
        </div>
      </template>

      <!-- เลือกชิ้นที่ผูกแล้วจากคิว -->
      <template v-else-if="kind === 'boundInfo'">
        <i class="bi bi-check-circle status-box__icon" aria-hidden="true"></i>
        <div class="status-box__text">
          <span class="status-box__title">{{ $t('view.stock.rfidBind.status.boundInfo', { epc }) }}</span>
          <span class="status-box__hint">{{ $t('view.stock.rfidBind.status.boundInfoHint') }}</span>
        </div>
      </template>

      <!-- รอวาง -->
      <template v-else>
        <span class="status-box__wave" aria-hidden="true"></span>
        <div class="status-box__text">
          <span class="status-box__title">{{ $t('view.stock.rfidBind.status.waitingTitle') }}</span>
          <span class="status-box__hint">{{ autoBind ? $t('view.stock.rfidBind.status.waitingHint') : $t('view.stock.rfidBind.status.waitingHintManual') }}</span>
        </div>
      </template>
    </div>
  </SectionCardGeneric>
</template>

<script>
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import imagePreview from '@/components/prime-vue/ImagePreview.vue'
import { planTextOf, labelNumber, labelSecondary, unitOfLot, productName } from '../rfid-bind-logic.js'

const TONES = {
  empty: 'neutral',
  done: 'success',
  pick: 'neutral',
  readerOff: 'warn',
  paused: 'neutral',
  error: 'danger',
  binding: 'info',
  pending: 'info',
  multi: 'warn',
  taken: 'danger',
  sold: 'danger',
  boundInfo: 'neutral',
  waiting: 'info'
}

export default {
  name: 'RfidBindCurrentPieceCard',

  components: { SectionCardGeneric, ButtonGeneric, imagePreview },

  props: {
    unit: { type: Object, default: null },
    index: { type: Number, default: 0 },
    kind: { type: String, default: 'waiting' },
    viaScan: { type: Boolean, default: false },
    notice: { type: Object, default: null },
    message: { type: String, default: '' },
    epc: { type: String, default: '' },
    count: { type: Number, default: 0 },
    otherNo: { type: String, default: '' },
    autoBind: { type: Boolean, default: true },
    lots: { type: Array, default: () => [] },
    pickIndex: { type: Number, default: 0 },
    unsupported: { type: Boolean, default: false },
    readerLost: { type: Boolean, default: false },
    busy: { type: Boolean, default: false },
    supportedKinds: { type: Array, default: () => [] }
  },

  emits: ['add', 'clear', 'bind', 'retry', 'connect', 'pick', 'pickCancel'],

  computed: {
    tone() {
      return TONES[this.kind] || 'info'
    },

    number() {
      return labelNumber(this.unit)
    },

    secondary() {
      return labelSecondary(this.unit)
    },

    planText() {
      return planTextOf(this.unit)
    },

    unitText() {
      return unitOfLot(this.unit)
    },

    name() {
      return productName(this.unit, this.$i18n.locale)
    }
  }
}
</script>

<style lang="scss" scoped>
.piece-card__body {
  display: flex;
  gap: var(--sp-xl);
  flex-wrap: wrap;
  margin-bottom: var(--sp-lg);
}

.piece-card__image {
  width: 200px;
  height: 200px;
  flex: 0 0 auto;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-highlight-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.piece-card__image :deep(img) {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.piece-card__noimage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-sm);
  color: var(--base-sub-color);
  font-size: var(--fs-base);

  i {
    font-size: 48px;
  }
}

.piece-card__info {
  flex: 1 1 260px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--sp-sm);
}

.piece-card__no {
  font-size: 36px;
  line-height: 1.1;
  font-weight: 700;
  color: var(--base-font-color);
  word-break: break-all;
}

.piece-card__secondary {
  font-size: var(--fs-base);
  color: var(--base-sub-color);
}

.piece-card__name {
  font-size: var(--fs-lg);
  font-weight: 500;
  color: var(--base-font-sub-color);
}

.piece-card__chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-sm);
}

.piece-chip {
  background: var(--status-closed-bg);
  border-radius: var(--radius-lg);
  padding: var(--sp-xs) var(--sp-md);
  font-size: var(--fs-base);

  &--reserved {
    background: var(--status-open-bg);
    color: var(--base-font-color);
    font-weight: 600;
  }

  &--src {
    background: transparent;
    border: 1px solid var(--color-border);
    color: var(--base-sub-color);
  }
}

.piece-banner {
  display: flex;
  align-items: center;
  gap: var(--sp-md);
  padding: var(--sp-sm) var(--sp-lg);
  margin-bottom: var(--sp-md);
  border-radius: var(--radius-md);
  font-size: var(--fs-base);
  font-weight: 600;

  &--success {
    background: var(--base-green);
    color: var(--on-inverse);
  }

  &--info {
    background: var(--status-closed-bg);
    color: var(--base-font-sub-color);
  }

  &--warn {
    background: var(--status-open-bg);
    color: var(--base-font-sub-color);
    border: 1px solid var(--base-warning);
  }
}

.status-box {
  display: flex;
  align-items: center;
  gap: var(--sp-lg);
  flex-wrap: wrap;
  padding: var(--sp-lg) var(--sp-xl);
  border-radius: var(--radius-lg);
  border: 2px solid var(--color-border);
  background: var(--color-card-bg);

  &--info {
    border-color: var(--base-green);
    background: var(--status-resolved-bg);
  }

  &--success {
    border-color: var(--base-green);
    background: var(--status-resolved-bg);
  }

  &--warn {
    border-color: var(--base-warning);
    background: var(--status-open-bg);
  }

  &--danger {
    border-color: var(--base-red);
    background: var(--status-cancelled-bg);
  }
}

.status-box__icon {
  font-size: 36px;
  flex: 0 0 auto;

  &--spin {
    display: inline-block;
    animation: status-spin 1s linear infinite;
  }
}

.status-box--info .status-box__icon,
.status-box--success .status-box__icon {
  color: var(--base-green);
}

.status-box--warn .status-box__icon {
  color: var(--base-font-sub-color);
}

.status-box--danger .status-box__icon {
  color: var(--base-red);
}

.status-box__text {
  display: flex;
  flex-direction: column;
  gap: var(--sp-xs);
  flex: 1 1 240px;
  min-width: 0;

  &--full {
    flex-basis: 100%;
    gap: var(--sp-sm);
  }
}

.status-box__title {
  font-size: var(--fs-xl);
  font-weight: 700;
  color: var(--base-font-sub-color);
}

.status-box__hint {
  font-size: var(--fs-base);
  color: var(--base-sub-color);
}

.status-box__epc {
  font-family: monospace;
}

.status-box__wave {
  width: var(--sp-2xl);
  height: var(--sp-2xl);
  border-radius: 50%;
  background: var(--base-green);
  flex: 0 0 auto;
  animation: status-pulse 1.6s ease-out infinite;
}

.pick-list {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-card-bg);
}

.pick-item {
  padding: var(--sp-sm) var(--sp-md);
  font-size: var(--fs-base);
  cursor: pointer;

  &--active {
    background: var(--base-font-color);
    color: var(--on-inverse);
    font-weight: 600;
  }
}

@keyframes status-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes status-pulse {
  0% {
    box-shadow: 0 0 0 0 var(--base-green);
  }
  70% {
    box-shadow: 0 0 0 var(--sp-lg) transparent;
  }
  100% {
    box-shadow: 0 0 0 0 transparent;
  }
}

@media (max-height: 800px) {
  .piece-card__body {
    gap: var(--sp-lg);
    margin-bottom: var(--sp-sm);
  }

  .piece-card__image {
    width: 140px;
    height: 140px;
  }

  .piece-card__no {
    font-size: 28px;
  }

  .status-box {
    padding: var(--sp-md) var(--sp-lg);
  }

  .status-box__title {
    font-size: var(--fs-lg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .status-box__icon--spin,
  .status-box__wave {
    animation: none;
  }
}
</style>
