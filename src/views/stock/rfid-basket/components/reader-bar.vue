<template>
  <SectionCardGeneric :title="$t('view.stock.rfidBasket.reader.title')" icon="bi-broadcast" accent="main" headerStyle="legend">
    <div class="reader-bar">
      <div class="reader-bar-status">
        <span :class="['reader-dot', `reader-dot--${dotKind}`]"></span>
        <div class="reader-bar-text">
          <div class="reader-bar-state">{{ stateText }}</div>
          <div v-if="deviceLabel" class="reader-bar-device">{{ deviceLabel }}</div>
        </div>
        <span v-if="reading" class="reader-bar-timer">{{ elapsedText }}</span>
      </div>

      <p v-if="state !== 'unsupported'" class="reader-bar-hint">
        <i class="bi bi-info-circle"></i>
        {{ $t('view.stock.rfidBasket.reader.exclusiveHint') }}
      </p>

      <div class="reader-bar-actions">
        <template v-if="state === 'unsupported'"></template>
        <template v-else-if="live">
          <ButtonGeneric
            :variant="canStop ? 'red' : 'main'"
            :icon="canStop ? 'bi-stop-circle' : 'bi-play-circle'"
            :label="canStop ? $t('view.stock.rfidBasket.reader.stop') : $t('view.stock.rfidBasket.reader.start')"
            :disabled="busy"
            @click="$emit(canStop ? 'stop' : 'start')"
          />
          <ButtonGeneric
            class="ml-2"
            variant="outline"
            icon="bi-plug"
            :label="$t('view.stock.rfidBasket.reader.disconnect')"
            :disabled="busy"
            @click="$emit('disconnect')"
          />
        </template>
        <template v-else>
          <ButtonGeneric
            v-if="supportedKinds.includes('ble')"
            variant="main"
            icon="bi-bluetooth"
            :label="connectionLost ? $t('view.stock.rfidBasket.reader.reconnectBle') : $t('view.stock.rfidBasket.reader.connectBle')"
            :disabled="busy || state === 'connecting'"
            @click="$emit('connect', 'ble')"
          />
          <ButtonGeneric
            v-if="supportedKinds.includes('hid')"
            :class="{ 'ml-2': supportedKinds.includes('ble') }"
            variant="main"
            icon="bi-usb-symbol"
            :label="connectionLost ? $t('view.stock.rfidBasket.reader.reconnectHid') : $t('view.stock.rfidBasket.reader.connectHid')"
            :disabled="busy || state === 'connecting'"
            @click="$emit('connect', 'hid')"
          />
        </template>
      </div>
    </div>

  </SectionCardGeneric>
</template>

<script>
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import { formatElapsed } from '../rfid-basket-logic.js'

export default {
  name: 'RfidBasketReaderBar',

  components: { SectionCardGeneric, ButtonGeneric },

  props: {
    state: { type: String, required: true },
    deviceName: { type: String, default: '' },
    activeKind: { type: String, default: '' },
    errorKey: { type: String, default: '' },
    busy: { type: Boolean, default: false },
    live: { type: Boolean, default: false },
    canStop: { type: Boolean, default: false },
    connectionLost: { type: Boolean, default: false },
    elapsedSec: { type: Number, default: 0 },
    supportedKinds: { type: Array, default: () => [] }
  },

  emits: ['connect', 'start', 'stop', 'disconnect'],

  computed: {
    reading() {
      return this.state === 'reading'
    },

    connected() {
      return this.state === 'connected' || this.state === 'reading'
    },

    elapsedText() {
      return formatElapsed(this.elapsedSec)
    },

    dotKind() {
      if (this.reading) return 'reading'
      if (this.connected) return 'connected'
      if (this.state === 'error' || this.connectionLost) return 'error'
      return 'idle'
    },

    stateText() {
      const t = (key, params) => this.$t(`view.stock.rfidBasket.reader.${key}`, params)
      if (this.state === 'error') return t(this.errorKey || 'errorUnavailable')
      if (this.state === 'disconnected' && this.connectionLost) return t('lost')
      return t(this.state)
    },

    deviceLabel() {
      if (!this.live || !this.deviceName) return ''
      const via = this.activeKind === 'ble' ? 'deviceBle' : 'deviceHid'
      return `${this.deviceName} · ${this.$t(`view.stock.rfidBasket.reader.${via}`)}`
    }
  }
}
</script>

<style lang="scss" scoped>
.reader-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-lg);
  flex-wrap: wrap;
}

.reader-bar-status {
  display: flex;
  align-items: center;
  gap: var(--sp-md);
}

.reader-bar-state {
  font-weight: 600;
}

.reader-bar-device {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}

.reader-bar-timer {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  color: var(--base-font-color);
}

.reader-bar-actions {
  display: flex;
  flex-wrap: wrap;
}

.reader-bar-hint {
  flex: 1;
  min-width: 240px;
  margin: 0;
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}

.reader-dot {
  width: var(--sp-md);
  height: var(--sp-md);
  border-radius: 50%;
  background: var(--status-closed);
  flex-shrink: 0;

  &--connected {
    background: var(--status-resolved);
  }

  &--reading {
    background: var(--status-resolved);
    animation: reader-pulse 1.2s ease-in-out infinite;
  }

  &--error {
    background: var(--status-cancelled);
  }
}

@keyframes reader-pulse {
  50% {
    opacity: 0.3;
  }
}

@media (prefers-reduced-motion: reduce) {
  .reader-dot--reading {
    animation: none;
  }
}
</style>
