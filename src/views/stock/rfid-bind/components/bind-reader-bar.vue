<template>
  <div class="bind-reader">
    <span :class="['bind-reader__dot', `bind-reader__dot--${dotKind}`]" aria-hidden="true"></span>
    <div class="bind-reader__text">
      <span class="bind-reader__state">{{ stateText }}</span>
      <span v-if="deviceLabel" class="bind-reader__device">{{ deviceLabel }}</span>
    </div>
    <span v-if="state === 'reading'" class="bind-reader__timer" :title="$t('view.stock.rfidBind.reader.elapsed')" :aria-label="$t('view.stock.rfidBind.reader.elapsed')">{{ elapsedText }}</span>
    <span v-if="paused" class="bind-reader__paused"><i class="bi bi-pause-circle"></i> {{ $t('view.stock.rfidBind.reader.pausedByModal') }}</span>
    <div v-if="live" class="bind-reader__actions">
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
    </div>
  </div>
</template>

<script>
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import { formatElapsed } from '../../rfid-basket/rfid-basket-logic.js'

export default {
  name: 'RfidBindReaderBar',

  components: { ButtonGeneric },

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
    paused: { type: Boolean, default: false }
  },

  emits: ['start', 'stop', 'disconnect'],

  computed: {
    elapsedText() {
      return formatElapsed(this.elapsedSec)
    },

    dotKind() {
      if (this.state === 'reading') return 'reading'
      if (this.state === 'connected') return 'connected'
      if (this.state === 'error' || this.connectionLost) return 'error'
      return 'idle'
    },

    stateText() {
      const t = (key) => this.$t(`view.stock.rfidBasket.reader.${key}`)
      if (this.state === 'error') return t(this.errorKey || 'errorUnavailable')
      if (this.state === 'disconnected' && this.connectionLost) return this.$t('view.stock.rfidBind.reader.lostWarn')
      if (this.state === 'reading') return this.$t('view.stock.rfidBind.reader.readyBinding')
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
.bind-reader {
  display: flex;
  align-items: center;
  gap: var(--sp-md);
  flex-wrap: wrap;
  padding: var(--sp-sm) var(--sp-lg);
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.bind-reader__text {
  display: flex;
  flex-direction: column;
}

.bind-reader__state {
  font-weight: 600;
  font-size: var(--fs-base);
}

.bind-reader__device {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}

.bind-reader__timer {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}

.bind-reader__paused {
  font-size: var(--fs-base);
  font-weight: 600;
  color: var(--base-sub-color);
}

.bind-reader__actions {
  display: flex;
  margin-left: auto;
}

.bind-reader__dot {
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
    animation: bind-pulse 1.2s ease-in-out infinite;
  }

  &--error {
    background: var(--status-cancelled);
  }
}

@keyframes bind-pulse {
  50% {
    opacity: 0.3;
  }
}

@media (prefers-reduced-motion: reduce) {
  .bind-reader__dot--reading {
    animation: none;
  }
}
</style>
