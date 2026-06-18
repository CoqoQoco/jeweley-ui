<template>
  <div class="sales-dashboard">
    <!-- Header Section -->
    <div class="dashboard-header">
      <h3 class="dashboard-title">
        <i class="bi bi-graph-up mr-2"></i>
        {{ $t('view.sale.saleDashboard.title') }}
      </h3>
      <p class="dashboard-subtitle">
        {{ $t('view.sale.saleDashboard.description') }}
      </p>
    </div>

    <!-- Sales Flow Process -->
    <div class="card-container">
      <div class="card-header">
        <h5 class="mb-0">{{ $t('view.sale.saleDashboard.flowTitle') }}</h5>
      </div>
      <div class="card-body">
        <div class="process-flow">
          <div
            v-for="(step, index) in salesFlowSteps"
            :key="step.id"
            class="process-step"
            :class="{ 'completed': step.completed, 'current': step.current }"
          >
            <div class="step-number">{{ index + 1 }}</div>
            <div class="step-content">
              <div class="step-icon">
                <i :class="step.icon"></i>
              </div>
              <h6 class="step-title">{{ $t(step.titleKey) }}</h6>
              <p class="step-description">{{ $t(step.descKey) }}</p>
              <div class="step-actions">
                <button
                  v-for="action in step.actions"
                  :key="action.labelKey"
                  :class="action.class"
                  @click="action.handler"
                  :disabled="action.disabled"
                >
                  <i :class="action.icon"></i>
                  {{ $t(action.labelKey) }}
                </button>
              </div>
            </div>
            <div v-if="index < salesFlowSteps.length - 1" class="step-arrow">
              <i class="bi bi-arrow-right"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="row mt-4">
      <div class="col-md-6">
        <div class="card-container">
          <div class="card-header">
            <h5 class="mb-0">{{ $t('view.sale.saleDashboard.quickActionsTitle') }}</h5>
          </div>
          <div class="card-body">
            <div class="quick-actions">
              <button class="btn btn-main btn-block mb-2" @click="createNewSaleOrder">
                <i class="bi bi-plus-circle mr-2"></i>
                {{ $t('view.sale.saleDashboard.createNewSO') }}
              </button>
              <button class="btn btn-green btn-block mb-2" @click="viewProductionOrders">
                <i class="bi bi-tools mr-2"></i>
                {{ $t('view.sale.saleDashboard.viewProduction') }}
              </button>
              <button class="btn btn-green btn-block mb-2" @click="viewStockReservations">
                <i class="bi bi-bookmark mr-2"></i>
                {{ $t('view.sale.saleDashboard.viewReservation') }}
              </button>
              <button class="btn btn-outline-main btn-block" @click="viewPaymentStatus">
                <i class="bi bi-wallet2 mr-2"></i>
                {{ $t('view.sale.saleDashboard.trackPayment') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="card-container">
          <div class="card-header">
            <h5 class="mb-0">{{ $t('view.sale.saleDashboard.statsTitle') }}</h5>
          </div>
          <div class="card-body">
            <div class="stats-grid">
              <div class="stat-item stat-item--primary">
                <div class="stat-icon stat-icon--primary">
                  <i class="bi bi-cart"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-number">12</div>
                  <div class="stat-label">{{ $t('view.sale.saleDashboard.pendingSO') }}</div>
                </div>
              </div>

              <div class="stat-item stat-item--warning">
                <div class="stat-icon stat-icon--warning">
                  <i class="bi bi-tools"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-number">8</div>
                  <div class="stat-label">{{ $t('view.sale.saleDashboard.inProduction') }}</div>
                </div>
              </div>

              <div class="stat-item stat-item--info">
                <div class="stat-icon stat-icon--info">
                  <i class="bi bi-bookmark"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-number">15</div>
                  <div class="stat-label">{{ $t('view.sale.saleDashboard.reservedItems') }}</div>
                </div>
              </div>

              <div class="stat-item stat-item--success">
                <div class="stat-icon stat-icon--success">
                  <i class="bi bi-truck"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-number">6</div>
                  <div class="stat-label">{{ $t('view.sale.saleDashboard.readyToDeliver') }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Demo Instructions -->
    <div class="card-container mt-4">
      <div class="card-header">
        <h5 class="mb-0">{{ $t('view.sale.saleDashboard.howToTitle') }}</h5>
      </div>
      <div class="card-body">
        <div class="demo-instructions">
          <div class="instruction-step">
            <div class="instruction-number">1</div>
            <div class="instruction-content">
              <h6>{{ $t('view.sale.saleDashboard.howTo1Title') }}</h6>
              <p>{{ $t('view.sale.saleDashboard.howTo1Desc') }}</p>
            </div>
          </div>

          <div class="instruction-step">
            <div class="instruction-number">2</div>
            <div class="instruction-content">
              <h6>{{ $t('view.sale.saleDashboard.howTo2Title') }}</h6>
              <p>{{ $t('view.sale.saleDashboard.howTo2Desc') }}</p>
            </div>
          </div>

          <div class="instruction-step">
            <div class="instruction-number">3</div>
            <div class="instruction-content">
              <h6>{{ $t('view.sale.saleDashboard.howTo3Title') }}</h6>
              <p>{{ $t('view.sale.saleDashboard.howTo3Desc') }}</p>
            </div>
          </div>

          <div class="instruction-step">
            <div class="instruction-number">4</div>
            <div class="instruction-content">
              <h6>{{ $t('view.sale.saleDashboard.howTo4Title') }}</h6>
              <p>{{ $t('view.sale.saleDashboard.howTo4Desc') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SalesDashboard',

  computed: {
    salesFlowSteps() {
      return [
        {
          id: 'sale-order',
          titleKey: 'view.sale.saleDashboard.stepSO',
          descKey: 'view.sale.saleDashboard.stepSODesc',
          icon: 'bi bi-cart',
          completed: false,
          current: true,
          actions: [
            {
              labelKey: 'view.sale.saleDashboard.createNew',
              icon: 'bi bi-plus',
              class: 'btn btn-sm btn-main',
              handler: this.createNewSaleOrder,
              disabled: false
            },
            {
              labelKey: 'view.sale.saleDashboard.viewList',
              icon: 'bi bi-list',
              class: 'btn btn-sm btn-outline-main',
              handler: this.viewSaleOrders,
              disabled: false
            }
          ]
        },
        {
          id: 'production',
          titleKey: 'view.sale.saleDashboard.stepProduction',
          descKey: 'view.sale.saleDashboard.stepProductionDesc',
          icon: 'bi bi-tools',
          completed: false,
          current: false,
          actions: [
            {
              labelKey: 'view.sale.saleDashboard.viewStatus',
              icon: 'bi bi-eye',
              class: 'btn btn-sm btn-green',
              handler: this.viewProductionOrders,
              disabled: false
            }
          ]
        },
        {
          id: 'stock-reservation',
          titleKey: 'view.sale.saleDashboard.stepReservation',
          descKey: 'view.sale.saleDashboard.stepReservationDesc',
          icon: 'bi bi-bookmark',
          completed: false,
          current: false,
          actions: [
            {
              labelKey: 'view.sale.saleDashboard.viewStatus',
              icon: 'bi bi-eye',
              class: 'btn btn-sm btn-green',
              handler: this.viewStockReservations,
              disabled: false
            }
          ]
        },
        {
          id: 'delivery',
          titleKey: 'view.sale.saleDashboard.stepDelivery',
          descKey: 'view.sale.saleDashboard.stepDeliveryDesc',
          icon: 'bi bi-truck',
          completed: false,
          current: false,
          actions: [
            {
              labelKey: 'view.sale.saleDashboard.createDeliveryNote',
              icon: 'bi bi-plus',
              class: 'btn btn-sm btn-main',
              handler: this.createDeliveryNote,
              disabled: false
            }
          ]
        },
        {
          id: 'invoice',
          titleKey: 'view.sale.saleDashboard.stepInvoice',
          descKey: 'view.sale.saleDashboard.stepInvoiceDesc',
          icon: 'bi bi-receipt',
          completed: false,
          current: false,
          actions: [
            {
              labelKey: 'view.sale.saleDashboard.createInvoice',
              icon: 'bi bi-plus',
              class: 'btn btn-sm btn-main',
              handler: this.createInvoice,
              disabled: false
            }
          ]
        },
        {
          id: 'payment',
          titleKey: 'view.sale.saleDashboard.stepPayment',
          descKey: 'view.sale.saleDashboard.stepPaymentDesc',
          icon: 'bi bi-wallet2',
          completed: false,
          current: false,
          actions: [
            {
              labelKey: 'view.sale.saleDashboard.trackPaymentBtn',
              icon: 'bi bi-eye',
              class: 'btn btn-sm btn-outline-main',
              handler: this.viewPaymentStatus,
              disabled: false
            }
          ]
        }
      ]
    }
  },

  methods: {
    createNewSaleOrder() {
      this.$router.push('/sale/sale-order')
    },

    viewSaleOrders() {
      this.$router.push('/sale/sale-order-list')
    },

    viewProductionOrders() {
      this.$router.push('/sale/production-order')
    },

    viewStockReservations() {
      this.$router.push('/sale/stock-reservation')
    },

    createDeliveryNote() {
      this.$router.push('/sale/delivery-note')
    },

    createInvoice() {
      this.$router.push('/sale/invoice')
    },

    viewPaymentStatus() {
      this.$router.push('/sale/payment-dashboard')
    }
  }
}
</script>

<style lang="scss" scoped>
.sales-dashboard {
  padding: var(--sp-2xl);
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-header {
  text-align: center;
  margin-bottom: var(--sp-2xl);

  .dashboard-title {
    color: var(--base-font-color);
    font-weight: 600;
    margin-bottom: var(--sp-sm);
  }

  .dashboard-subtitle {
    color: #6c757d;
    font-size: var(--fs-base);
    margin: 0;
  }
}

.card-container {
  background: var(--color-card-bg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--sp-2xl);
}

.card-header {
  background: #f8f9fa;
  border-bottom: 1px solid var(--color-border);
  padding: var(--sp-md) var(--sp-2xl);
  border-radius: var(--radius-md) var(--radius-md) 0 0;

  h5 {
    color: var(--base-font-color);
    font-weight: 600;
  }
}

.card-body {
  padding: var(--sp-2xl);
}

// Process Flow Styles
.process-flow {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2xl);
  justify-content: center;
  align-items: flex-start;
}

.process-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 200px;
  position: relative;

  &.completed {
    .step-number {
      background: var(--base-green);
      color: white;
    }
    .step-icon {
      color: var(--base-green);
    }
  }

  &.current {
    .step-number {
      background: var(--base-font-color);
      color: white;
      animation: pulse 2s infinite;
    }
    .step-icon {
      color: var(--base-font-color);
    }
  }
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e9ecef;
  color: #6c757d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-bottom: var(--sp-md);
  font-size: 1.1rem;
}

.step-content {
  .step-icon {
    font-size: 2rem;
    color: #6c757d;
    margin-bottom: var(--sp-sm);
  }

  .step-title {
    font-size: var(--fs-base);
    font-weight: 600;
    color: #495057;
    margin-bottom: var(--sp-sm);
  }

  .step-description {
    font-size: var(--fs-sm);
    color: #6c757d;
    line-height: var(--lh-sm);
    margin-bottom: var(--sp-md);
  }
}

.step-actions {
  display: flex;
  flex-direction: column;
  gap: var(--sp-sm);
  width: 100%;

  .btn {
    font-size: 0.8rem;
    padding: 0.4rem 0.8rem;
  }
}

.step-arrow {
  position: absolute;
  right: -1.25rem;
  top: 2rem;
  font-size: 1.5rem;
  color: #dee2e6;
}

// Quick Actions
.quick-actions .btn {
  text-align: left;

  i {
    width: 20px;
  }
}

// Stats Grid
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--sp-md);
}

.stat-item {
  display: flex;
  align-items: center;
  padding: var(--sp-md);
  background: #f8f9fa;
  border-radius: var(--radius-sm);
  border-left: 4px solid transparent;

  &--primary { border-left-color: var(--base-font-color); }
  &--warning { border-left-color: var(--base-warning); }
  &--info { border-left-color: var(--base-green); }
  &--success { border-left-color: var(--base-green); }
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--sp-md);

  i {
    font-size: 1.5rem;
    color: white;
  }

  &--primary { background: var(--base-font-color); }
  &--warning { background: var(--base-warning); }
  &--info { background: var(--base-green); }
  &--success { background: var(--base-green); }
}

.stat-content {
  .stat-number {
    font-size: 1.8rem;
    font-weight: bold;
    color: #495057;
    line-height: 1;
  }

  .stat-label {
    font-size: var(--fs-sm);
    color: #6c757d;
    margin-top: var(--sp-xs);
  }
}

// Demo Instructions
.demo-instructions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--sp-2xl);
}

.instruction-step {
  display: flex;
  align-items: flex-start;
}

.instruction-number {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background: var(--base-font-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: var(--sp-md);
  flex-shrink: 0;
}

.instruction-content {
  h6 {
    color: #495057;
    margin-bottom: var(--sp-sm);
    font-weight: 600;
  }

  p {
    color: #6c757d;
    font-size: 0.9rem;
    line-height: var(--lh-sm);
    margin: 0;
  }
}

// Animations
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(146, 19, 19, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(146, 19, 19, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(146, 19, 19, 0);
  }
}

// Responsive Design
@media (max-width: 1200px) {
  .process-flow {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .sales-dashboard {
    padding: var(--sp-md);
  }

  .process-flow {
    flex-direction: column;
    align-items: center;
  }

  .process-step {
    max-width: 100%;
    margin-bottom: var(--sp-2xl);
  }

  .step-arrow {
    display: none;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .demo-instructions {
    grid-template-columns: 1fr;
  }
}
</style>
