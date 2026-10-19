<template>
  <div class="receipt-progress">
    <div class="receipt-progress-grid">
      <StatCardGeneric
        icon="bi-box-seam"
        :value="formatNumber(total)"
        :label="$t('view.stock.stockRfidTracking.statTotal')"
        variant="grey"
      />
      <StatCardGeneric
        icon="bi-check-circle"
        :value="formatNumber(bound)"
        :label="$t('view.stock.stockRfidTracking.statBound')"
        variant="green"
      />
      <StatCardGeneric
        icon="bi-hourglass-split"
        :value="formatNumber(remaining)"
        :label="$t('view.stock.stockRfidTracking.statRemaining')"
        variant="warning"
      />
    </div>

    <div class="progress-block">
      <div class="progress-head">
        <span>{{ $t('view.stock.stockRfidTracking.progressLabel', { percent }) }}</span>
        <span :class="['live-state', { 'live-state--error': failing }]">
          <i :class="['bi', failing ? 'bi-wifi-off' : 'bi-broadcast']"></i>
          {{ failing ? $t('view.stock.stockRfidTracking.liveError') : $t('view.stock.stockRfidTracking.liveOn') }}
        </span>
      </div>
      <div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="percent">
        <div class="progress-fill" :style="{ width: percent + '%' }"></div>
      </div>
    </div>
  </div>
</template>

<script>
import StatCardGeneric from '@/components/generic/StatCardGeneric.vue'

export default {
  name: 'RfidReceiptProgress',

  components: { StatCardGeneric },

  props: {
    total: { type: Number, default: 0 },
    bound: { type: Number, default: 0 },
    failing: { type: Boolean, default: false }
  },

  computed: {
    remaining() {
      return Math.max(this.total - this.bound, 0)
    },

    percent() {
      if (!this.total) return 0
      return Math.min(100, Math.floor((this.bound / this.total) * 100))
    }
  },

  methods: {
    formatNumber(value) {
      return new Intl.NumberFormat('th-TH').format(value || 0)
    }
  }
}
</script>

<style lang="scss" scoped>
.receipt-progress {
  margin-bottom: var(--sp-lg);
}

.receipt-progress-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--sp-lg);
  margin-bottom: var(--sp-lg);
}

.progress-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--sp-xs);
  font-weight: 600;
  color: var(--base-font-color);
}

.live-state {
  font-size: var(--fs-sm);
  font-weight: 400;
  color: var(--status-resolved);

  &--error {
    color: var(--status-cancelled);
  }
}

.progress-track {
  height: var(--sp-md);
  border-radius: var(--radius-lg);
  background: var(--status-closed-bg);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: var(--radius-lg);
  background: var(--status-resolved);
  transition: width 0.4s ease;
}

@media (prefers-reduced-motion: reduce) {
  .progress-fill {
    transition: none;
  }
}

@media (max-width: 768px) {
  .receipt-progress-grid {
    grid-template-columns: 1fr;
  }
}
</style>
