<template>
  <div class="payment-dashboard">
    <!-- Header -->
    <div class="header-section">
      <h4 class="page-title">{{ $t('view.sale.paymentTracking.title') }}</h4>
      <p class="page-subtitle">{{ $t('view.sale.paymentTracking.description') }}</p>
    </div>

    <!-- Summary Cards -->
    <div class="row mb-4">
      <div class="col-md-3">
        <div class="summary-card total">
          <div class="card-icon">
            <i class="bi bi-wallet2"></i>
          </div>
          <div class="card-content">
            <h3>฿2,450,000</h3>
            <p>{{ $t('view.sale.paymentTracking.totalSales') }}</p>
            <small class="text-success">+12% จากเดือนก่อน</small>
          </div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="summary-card paid">
          <div class="card-icon">
            <i class="bi bi-check-circle"></i>
          </div>
          <div class="card-content">
            <h3>฿1,980,000</h3>
            <p>{{ $t('view.sale.paymentTracking.paid') }}</p>
            <small class="text-success">80.8% ของยอดรวม</small>
          </div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="summary-card pending">
          <div class="card-icon">
            <i class="bi bi-clock"></i>
          </div>
          <div class="card-content">
            <h3>฿420,000</h3>
            <p>{{ $t('view.sale.paymentTracking.pending') }}</p>
            <small class="text-warning">15 รายการ</small>
          </div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="summary-card overdue">
          <div class="card-icon">
            <i class="bi bi-exclamation-triangle"></i>
          </div>
          <div class="card-content">
            <h3>฿50,000</h3>
            <p>{{ $t('view.sale.paymentTracking.overdue') }}</p>
            <small class="text-danger">3 รายการ</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="action-section mb-4">
      <button class="btn btn-sm btn-main mr-2" @click="recordPayment">
        <i class="bi bi-plus-circle mr-1"></i>
        {{ $t('view.sale.paymentTracking.recordPayment') }}
      </button>
      <button class="btn btn-sm btn-green mr-2" @click="sendReminder">
        <i class="bi bi-send mr-1"></i>
        {{ $t('view.sale.paymentTracking.sendReminder') }}
      </button>
      <button class="btn btn-sm btn-outline-main mr-2" @click="generateReport">
        <i class="bi bi-file-earmark-text mr-1"></i>
        {{ $t('view.sale.paymentTracking.createReport') }}
      </button>
    </div>

    <!-- Payment Status Demo Message -->
    <div class="alert alert-info" role="alert">
      <i class="bi bi-info-circle mr-2"></i>
      <strong>{{ $t('view.sale.paymentTracking.demoNotice') }}</strong><br>
      {{ $t('view.sale.paymentTracking.demoNote') }}
    </div>

    <!-- Recent Payments -->
    <div class="card-container">
      <div class="card-header">
        <h5 class="mb-0">{{ $t('view.sale.paymentTracking.recentPayments') }}</h5>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <!-- eslint-disable-next-line vue/no-restricted-syntax -->
          <!-- static demo layout — not a real data list, no array binding -->
          <table class="table table-hover">
            <thead>
              <tr>
                <th>{{ $t('view.sale.paymentTracking.date') }}</th>
                <th>{{ $t('view.sale.paymentTracking.invoiceNumber') }}</th>
                <th>{{ $t('view.sale.paymentTracking.customerName') }}</th>
                <th>{{ $t('view.sale.paymentTracking.amount') }}</th>
                <th>{{ $t('view.sale.paymentTracking.paymentMethod') }}</th>
                <th>{{ $t('view.sale.paymentTracking.status') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>22/01/2025</td>
                <td>INV-2025-001</td>
                <td>บริษัท ABC จำกัด</td>
                <td>฿42,000</td>
                <td>โอนเงิน</td>
                <td><span class="badge badge-success">ชำระแล้ว</span></td>
              </tr>
              <tr>
                <td>21/01/2025</td>
                <td>INV-2025-002</td>
                <td>คุณสมชาย ใจดี</td>
                <td>฿21,500</td>
                <td>เงินสด</td>
                <td><span class="badge badge-success">ชำระแล้ว</span></td>
              </tr>
              <tr>
                <td>20/01/2025</td>
                <td>INV-2025-003</td>
                <td>บริษัท XYZ จำกัด</td>
                <td>฿57,500</td>
                <td>เครดิต 30 วัน</td>
                <td><span class="badge badge-warning">รอชำระ</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Outstanding Payments -->
    <div class="card-container mt-4">
      <div class="card-header">
        <h5 class="mb-0">{{ $t('view.sale.paymentTracking.outstandingInvoices') }}</h5>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <!-- eslint-disable-next-line vue/no-restricted-syntax -->
          <!-- static demo layout — not a real data list, no array binding -->
          <table class="table table-hover">
            <thead>
              <tr>
                <th>{{ $t('view.sale.paymentTracking.invoiceNumber') }}</th>
                <th>{{ $t('view.sale.paymentTracking.customerName') }}</th>
                <th>{{ $t('view.sale.paymentTracking.dueDate') }}</th>
                <th>{{ $t('view.sale.paymentTracking.amount') }}</th>
                <th>{{ $t('view.sale.paymentTracking.overdueDays') }}</th>
                <th>{{ $t('view.sale.paymentTracking.action') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr class="table-danger">
                <td>INV-2025-010</td>
                <td>บริษัท DEF จำกัด</td>
                <td>15/01/2025</td>
                <td>฿25,000</td>
                <td>7 วัน</td>
                <td>
                  <button class="btn btn-sm btn-main">ส่งแจ้งเตือน</button>
                </td>
              </tr>
              <tr class="table-warning">
                <td>INV-2025-008</td>
                <td>คุณสมหญิง จริงใจ</td>
                <td>25/01/2025</td>
                <td>฿18,000</td>
                <td>-</td>
                <td>
                  <button class="btn btn-sm btn-green">ติดตาม</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PaymentDashboard',

  mounted() {
    this.loadFromQueryParams()
  },

  methods: {
    loadFromQueryParams() {
      const query = this.$route.query

      if (query.saleOrderNumber) {
        // TODO: Load specific payment data for sale order
      }
    },

    recordPayment() {
      // TODO: Navigate to payment entry form
    },

    sendReminder() {
      // TODO: Send payment reminder
    },

    generateReport() {
      // TODO: Generate payment report
    }
  }
}
</script>

<style lang="scss" scoped>
.payment-dashboard {
  padding: var(--sp-2xl);
}

.header-section {
  margin-bottom: 2rem;

  .page-title {
    color: var(--base-font-color);
    margin-bottom: 0.5rem;
    font-weight: 600;
  }

  .page-subtitle {
    color: #6c757d;
    margin-bottom: 0;
    font-size: 0.9rem;
  }
}

.summary-card {
  background: white;
  border-radius: var(--radius-md);
  padding: var(--sp-2xl);
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  border-left: 4px solid transparent;

  &.total {
    border-left-color: var(--base-font-color);
    .card-icon { background: var(--base-font-color); }
  }

  &.paid {
    border-left-color: var(--base-green);
    .card-icon { background: var(--base-green); }
  }

  &.pending {
    border-left-color: var(--base-warning);
    .card-icon { background: var(--base-warning); }
  }

  &.overdue {
    border-left-color: var(--base-red);
    .card-icon { background: var(--base-red); }
  }
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;

  i {
    font-size: 1.5rem;
    color: white;
  }
}

.card-content {
  h3 {
    font-size: 1.8rem;
    font-weight: bold;
    color: #2c3e50;
    margin: 0;
    line-height: 1;
  }

  p {
    color: #6c757d;
    margin: 0.25rem 0;
    font-size: 0.9rem;
  }

  small {
    font-size: 0.8rem;
  }
}

.action-section {
  display: flex;
  flex-wrap: wrap;
}

.card-container {
  background: white;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  margin-bottom: 1.5rem;
}

.card-header {
  background: #f8f9fa;
  border-bottom: 1px solid var(--color-border);
  padding: 1rem 1.5rem;
  border-radius: var(--radius-md) var(--radius-md) 0 0;

  h5 {
    color: var(--base-font-color);
    font-weight: 600;
  }
}

.card-body {
  padding: 1.5rem;
}

.table {
  margin-bottom: 0;

  thead th {
    background: #f8f9fa;
    font-weight: 600;
    color: var(--base-font-color);
    border-top: none;
  }

  tbody tr {
    &:hover {
      background: #f8f9fa;
    }

    &.table-danger {
      background: rgba(220, 53, 69, 0.1);
    }

    &.table-warning {
      background: rgba(255, 193, 7, 0.1);
    }
  }
}

.badge {
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;

  &.badge-success {
    background: var(--base-green);
    color: white;
  }

  &.badge-warning {
    background: var(--base-warning);
    color: #212529;
  }

  &.badge-danger {
    background: var(--base-red);
    color: white;
  }
}

// Responsive design
@media (max-width: 768px) {
  .payment-dashboard {
    padding: 1rem;
  }

  .summary-card {
    flex-direction: column;
    text-align: center;

    .card-icon {
      margin-right: 0;
      margin-bottom: 1rem;
    }
  }

  .action-section {
    .btn {
      width: 100%;
      margin-bottom: 0.5rem;
    }
  }
}
</style>
