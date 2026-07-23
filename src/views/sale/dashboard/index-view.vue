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
              <span v-if="step.comingSoon" class="step-badge">{{ $t('view.sale.saleDashboard.comingSoon') }}</span>
              <div v-if="step.actions.length" class="step-actions">
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
    <div class="card-container mt-4">
      <div class="card-header">
        <h5 class="mb-0">{{ $t('view.sale.saleDashboard.quickActionsTitle') }}</h5>
      </div>
      <div class="card-body">
        <div class="quick-actions">
          <ButtonGeneric
            variant="main"
            block
            icon="bi-plus-circle"
            class="mb-2"
            :label="$t('view.sale.saleDashboard.createNewSO')"
            @click="createNewSaleOrder"
          />
          <ButtonGeneric
            variant="outline"
            block
            icon="bi-wallet2"
            :label="$t('view.sale.saleDashboard.trackPayment')"
            @click="viewPaymentStatus"
          />
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
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

export default {
  name: 'SalesDashboard',

  components: { ButtonGeneric },

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
          comingSoon: true,
          actions: []
        },
        {
          id: 'stock-reservation',
          titleKey: 'view.sale.saleDashboard.stepReservation',
          descKey: 'view.sale.saleDashboard.stepReservationDesc',
          icon: 'bi bi-bookmark',
          completed: false,
          current: false,
          comingSoon: true,
          actions: []
        },
        {
          id: 'delivery',
          titleKey: 'view.sale.saleDashboard.stepDelivery',
          descKey: 'view.sale.saleDashboard.stepDeliveryDesc',
          icon: 'bi bi-truck',
          completed: false,
          current: false,
          comingSoon: true,
          actions: []
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
      this.$router.push({ name: 'sale-order' })
    },

    viewSaleOrders() {
      this.$router.push({ name: 'sale-order-list' })
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

.step-badge {
  display: inline-block;
  margin-bottom: var(--sp-sm);
  padding: 2px var(--sp-sm);
  font-size: var(--fs-sm);
  color: var(--base-font-color);
  background: var(--color-highlight-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
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

  .demo-instructions {
    grid-template-columns: 1fr;
  }
}
</style>
