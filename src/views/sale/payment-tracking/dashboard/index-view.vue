<template>
  <div class="payment-dashboard">
    <DashboardHeaderGeneric
      :title="$t('view.sale.paymentTracking.title')"
      :subtitle="$t('view.sale.paymentTracking.description')"
      icon="bi-wallet2"
      :showRefresh="false"
    />

    <div class="empty-state">
      <div class="placeholder-content">
        <i class="bi bi-wallet2"></i>
        <h4>{{ $t('view.sale.paymentTracking.emptyTitle') }}</h4>
        <p>{{ $t('view.sale.paymentTracking.emptyDescription') }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import DashboardHeaderGeneric from '@/components/generic/DashboardHeaderGeneric.vue'

export default {
  name: 'PaymentDashboard',

  components: {
    DashboardHeaderGeneric
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/mixin.scss';

.payment-dashboard {
  padding: var(--sp-2xl);
}

.empty-state {
  @include card-base;
  padding: 60px var(--sp-xl);
  text-align: center;

  .placeholder-content {
    i {
      font-size: 64px;
      color: var(--base-sub-color);
      margin-bottom: var(--sp-xl);
    }

    h4 {
      color: var(--base-font-color);
      margin-bottom: var(--sp-sm);
      font-weight: 600;
    }

    p {
      color: var(--base-sub-color);
      margin: 0;
    }
  }
}

@media (max-width: 768px) {
  .payment-dashboard {
    padding: var(--sp-md);
  }
}
</style>
