<template>
  <div class="payment-dashboard">
    <!-- Header -->
    <div class="header-section">
      <h4 class="page-title">ภาพรวมการชำระเงิน (Payment Dashboard)</h4>
      <p class="page-subtitle">ติดตามสถานะการชำระเงินและหนี้ค้างชำระ</p>
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
            <p>ยอดขายรวม</p>
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
            <p>ชำระแล้ว</p>
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
            <p>รอชำระ</p>
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
            <p>เลยกำหนด</p>
            <small class="text-danger">3 รายการ</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="action-section mb-4">
      <button class="btn btn-primary mr-2" @click="recordPayment">
        <i class="bi bi-plus-circle mr-1"></i>
        บันทึกการรับชำระ
      </button>
      <button class="btn btn-info mr-2" @click="sendReminder">
        <i class="bi bi-send mr-1"></i>
        ส่งแจ้งเตือนชำระ
      </button>
      <button class="btn btn-success mr-2" @click="generateReport">
        <i class="bi bi-file-earmark-text mr-1"></i>
        สร้างรายงาน
      </button>
    </div>

    <!-- Payment Status Demo Message -->
    <div class="alert alert-info" role="alert">
      <i class="bi bi-info-circle mr-2"></i>
      <strong>หน้านี้เป็น Demo สำหรับแสดงภาพรวมการชำระเงิน</strong><br>
      ในระบบจริงจะแสดงข้อมูลการชำระเงินที่เชื่อมต่อจากใบแจ้งหนี้และ Sale Order
    </div>

    <!-- Recent Payments -->
    <div class="card-container">
      <div class="card-header">
        <h5 class="mb-0">การชำระเงินล่าสุด</h5>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>วันที่</th>
                <th>เลขที่ใบแจ้งหนี้</th>
                <th>ลูกค้า</th>
                <th>จำนวนเงิน</th>
                <th>วิธีการชำระ</th>
                <th>สถานะ</th>
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
        <h5 class="mb-0">หนี้ค้างชำระ</h5>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>เลขที่ใบแจ้งหนี้</th>
                <th>ลูกค้า</th>
                <th>วันที่ครบกำหนด</th>
                <th>จำนวนเงิน</th>
                <th>วันที่เลยกำหนด</th>
                <th>การดำเนินการ</th>
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
                  <button class="btn btn-sm btn-warning">ส่งแจ้งเตือน</button>
                </td>
              </tr>
              <tr class="table-warning">
                <td>INV-2025-008</td>
                <td>คุณสมหญิง จริงใจ</td>
                <td>25/01/2025</td>
                <td>฿18,000</td>
                <td>-</td>
                <td>
                  <button class="btn btn-sm btn-info">ติดตาม</button>
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
        console.log('ติดตามการชำระเงินสำหรับใบสั่งขาย:', query.saleOrderNumber)
        // TODO: Load specific payment data for sale order
      }
    },

    recordPayment() {
      console.log('บันทึกการรับชำระเงิน')
      // TODO: Navigate to payment entry form
    },

    sendReminder() {
      console.log('ส่งแจ้งเตือนการชำระเงิน')
      // TODO: Send payment reminder
    },

    generateReport() {
      console.log('สร้างรายงานการชำระเงิน')
      // TODO: Generate payment report
    }
  }
}
</script>

<style lang="scss" scoped>
.payment-dashboard {
  padding: 1.5rem;
}

.header-section {
  margin-bottom: 2rem;
  
  .page-title {
    color: #2c3e50;
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
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  border-left: 4px solid transparent;
  
  &.total {
    border-left-color: #007bff;
    .card-icon {
      background: #007bff;
    }
  }
  
  &.paid {
    border-left-color: #28a745;
    .card-icon {
      background: #28a745;
    }
  }
  
  &.pending {
    border-left-color: #ffc107;
    .card-icon {
      background: #ffc107;
    }
  }
  
  &.overdue {
    border-left-color: #dc3545;
    .card-icon {
      background: #dc3545;
    }
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
  gap: 0.5rem;
}

.card-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

.card-header {
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  padding: 1rem 1.5rem;
  border-radius: 8px 8px 0 0;

  h5 {
    color: #495057;
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
    color: #495057;
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
    background: #28a745;
    color: white;
  }
  
  &.badge-warning {
    background: #ffc107;
    color: #212529;
  }
  
  &.badge-danger {
    background: #dc3545;
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