<template>
  <div class="sales-dashboard">
    <!-- Header Section -->
    <div class="dashboard-header">
      <h3 class="dashboard-title">
        <i class="bi bi-graph-up mr-2"></i>
        ภาพรวมระบบงานขาย (Sales Flow Demo)
      </h3>
      <p class="dashboard-subtitle">
        แสดงขั้นตอนการทำงานของระบบงานขายครบวงจร จากใบเสนอราคาถึงการชำระเงิน
      </p>
    </div>

    <!-- Sales Flow Process -->
    <div class="card-container">
      <div class="card-header">
        <h5 class="mb-0">ขั้นตอนการดำเนินงาน Sales Flow</h5>
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
              <h6 class="step-title">{{ step.title }}</h6>
              <p class="step-description">{{ step.description }}</p>
              <div class="step-actions">
                <button 
                  v-for="action in step.actions"
                  :key="action.label"
                  :class="action.class"
                  @click="action.handler"
                  :disabled="action.disabled"
                >
                  <i :class="action.icon"></i>
                  {{ action.label }}
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
            <h5 class="mb-0">การดำเนินการด่วน</h5>
          </div>
          <div class="card-body">
            <div class="quick-actions">
              <button class="btn btn-primary btn-block mb-2" @click="createNewSaleOrder">
                <i class="bi bi-plus-circle mr-2"></i>
                สร้างใบสั่งขายใหม่
              </button>
              <button class="btn btn-info btn-block mb-2" @click="viewProductionOrders">
                <i class="bi bi-tools mr-2"></i>
                ดูใบสั่งผลิต
              </button>
              <button class="btn btn-success btn-block mb-2" @click="viewStockReservations">
                <i class="bi bi-bookmark mr-2"></i>
                ดูการจองสต็อก
              </button>
              <button class="btn btn-warning btn-block" @click="viewPaymentStatus">
                <i class="bi bi-wallet2 mr-2"></i>
                ติดตามการชำระเงิน
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="card-container">
          <div class="card-header">
            <h5 class="mb-0">สถานะภาพรวม (Demo Data)</h5>
          </div>
          <div class="card-body">
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-icon bg-primary">
                  <i class="bi bi-cart"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-number">12</div>
                  <div class="stat-label">ใบสั่งขายรอดำเนินการ</div>
                </div>
              </div>
              
              <div class="stat-item">
                <div class="stat-icon bg-warning">
                  <i class="bi bi-tools"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-number">8</div>
                  <div class="stat-label">สินค้าอยู่ระหว่างผลิต</div>
                </div>
              </div>
              
              <div class="stat-item">
                <div class="stat-icon bg-info">
                  <i class="bi bi-bookmark"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-number">15</div>
                  <div class="stat-label">รายการจองสต็อก</div>
                </div>
              </div>
              
              <div class="stat-item">
                <div class="stat-icon bg-success">
                  <i class="bi bi-truck"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-number">6</div>
                  <div class="stat-label">พร้อมส่งมอบ</div>
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
        <h5 class="mb-0">วิธีใช้งาน Sales Flow Demo</h5>
      </div>
      <div class="card-body">
        <div class="demo-instructions">
          <div class="instruction-step">
            <div class="instruction-number">1</div>
            <div class="instruction-content">
              <h6>เริ่มต้นจากใบสั่งขาย</h6>
              <p>คลิก "สร้างใบสั่งขายใหม่" หรือไปที่เมนู งานขาย → ใบสั่งขาย โหลดข้อมูล Demo เพื่อทดสอบ</p>
            </div>
          </div>
          
          <div class="instruction-step">
            <div class="instruction-number">2</div>
            <div class="instruction-content">
              <h6>ยืนยันใบสั่งขาย</h6>
              <p>เลือกสินค้า กรอกข้อมูลครบถ้วน แล้วคลิก "ยืนยันใบสั่งขาย" จะมีปุ่มขั้นตอนต่อไปปรากฏ</p>
            </div>
          </div>
          
          <div class="instruction-step">
            <div class="instruction-number">3</div>
            <div class="instruction-content">
              <h6>ดำเนินการตามประเภทสินค้า</h6>
              <p>สินค้าผลิต → สร้างใบสั่งผลิต | สินค้าคงคลัง → จองสต็อก</p>
            </div>
          </div>
          
          <div class="instruction-step">
            <div class="instruction-number">4</div>
            <div class="instruction-content">
              <h6>ส่งมอบและออกใบแจ้งหนี้</h6>
              <p>สร้างใบส่งของ → สร้างใบแจ้งหนี้ → ติดตามการชำระเงิน</p>
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

  data() {
    return {
      salesFlowSteps: [
        {
          id: 'sale-order',
          title: 'ใบสั่งขาย',
          description: 'สร้างและยืนยันใบสั่งขายจากใบเสนอราคา',
          icon: 'bi bi-cart',
          completed: false,
          current: true,
          actions: [
            {
              label: 'สร้างใหม่',
              icon: 'bi bi-plus',
              class: 'btn btn-sm btn-primary',
              handler: this.createNewSaleOrder,
              disabled: false
            },
            {
              label: 'ดูรายการ',
              icon: 'bi bi-list',
              class: 'btn btn-sm btn-outline-primary',
              handler: this.viewSaleOrders,
              disabled: false
            }
          ]
        },
        {
          id: 'production',
          title: 'การผลิต',
          description: 'สร้างใบสั่งผลิตสำหรับสินค้าที่ต้องผลิตตามคำสั่งซื้อ',
          icon: 'bi bi-tools',
          completed: false,
          current: false,
          actions: [
            {
              label: 'ดูสถานะ',
              icon: 'bi bi-eye',
              class: 'btn btn-sm btn-warning',
              handler: this.viewProductionOrders,
              disabled: false
            }
          ]
        },
        {
          id: 'stock-reservation',
          title: 'จองสต็อก',
          description: 'จองสต็อกสินค้าคงคลังสำหรับลูกค้า',
          icon: 'bi bi-bookmark',
          completed: false,
          current: false,
          actions: [
            {
              label: 'ดูสถานะ',
              icon: 'bi bi-eye',
              class: 'btn btn-sm btn-info',
              handler: this.viewStockReservations,
              disabled: false
            }
          ]
        },
        {
          id: 'delivery',
          title: 'การส่งมอบ',
          description: 'สร้างใบส่งของและจัดส่งสินค้าให้ลูกค้า',
          icon: 'bi bi-truck',
          completed: false,
          current: false,
          actions: [
            {
              label: 'สร้างใบส่งของ',
              icon: 'bi bi-plus',
              class: 'btn btn-sm btn-success',
              handler: this.createDeliveryNote,
              disabled: false
            }
          ]
        },
        {
          id: 'invoice',
          title: 'ใบแจ้งหนี้',
          description: 'ออกใบแจ้งหนี้และใบกำกับภาษี',
          icon: 'bi bi-receipt',
          completed: false,
          current: false,
          actions: [
            {
              label: 'สร้างใบแจ้งหนี้',
              icon: 'bi bi-plus',
              class: 'btn btn-sm btn-danger',
              handler: this.createInvoice,
              disabled: false
            }
          ]
        },
        {
          id: 'payment',
          title: 'การชำระเงิน',
          description: 'ติดตามและบันทึกการรับชำระเงิน',
          icon: 'bi bi-wallet2',
          completed: false,
          current: false,
          actions: [
            {
              label: 'ติดตาม',
              icon: 'bi bi-eye',
              class: 'btn btn-sm btn-secondary',
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
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 2rem;

  .dashboard-title {
    color: #2c3e50;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .dashboard-subtitle {
    color: #6c757d;
    font-size: 1rem;
    margin: 0;
  }
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

// Process Flow Styles
.process-flow {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
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
      background: #28a745;
      color: white;
    }
    .step-icon {
      color: #28a745;
    }
  }

  &.current {
    .step-number {
      background: #007bff;
      color: white;
      animation: pulse 2s infinite;
    }
    .step-icon {
      color: #007bff;
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
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.step-content {
  .step-icon {
    font-size: 2rem;
    color: #6c757d;
    margin-bottom: 0.5rem;
  }

  .step-title {
    font-size: 1rem;
    font-weight: 600;
    color: #495057;
    margin-bottom: 0.5rem;
  }

  .step-description {
    font-size: 0.875rem;
    color: #6c757d;
    line-height: 1.4;
    margin-bottom: 1rem;
  }
}

.step-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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
  gap: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid transparent;

  &:nth-child(1) { border-left-color: #007bff; }
  &:nth-child(2) { border-left-color: #ffc107; }
  &:nth-child(3) { border-left-color: #17a2b8; }
  &:nth-child(4) { border-left-color: #28a745; }
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  
  i {
    font-size: 1.5rem;
    color: white;
  }
  
  &.bg-primary { background: #007bff; }
  &.bg-warning { background: #ffc107; }
  &.bg-info { background: #17a2b8; }
  &.bg-success { background: #28a745; }
}

.stat-content {
  .stat-number {
    font-size: 1.8rem;
    font-weight: bold;
    color: #495057;
    line-height: 1;
  }
  
  .stat-label {
    font-size: 0.875rem;
    color: #6c757d;
    margin-top: 0.25rem;
  }
}

// Demo Instructions
.demo-instructions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.instruction-step {
  display: flex;
  align-items: flex-start;
}

.instruction-number {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background: #007bff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 1rem;
  flex-shrink: 0;
}

.instruction-content {
  h6 {
    color: #495057;
    margin-bottom: 0.5rem;
    font-weight: 600;
  }
  
  p {
    color: #6c757d;
    font-size: 0.9rem;
    line-height: 1.4;
    margin: 0;
  }
}

// Animations
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(0, 123, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 123, 255, 0);
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
    padding: 1rem;
  }
  
  .process-flow {
    flex-direction: column;
    align-items: center;
  }
  
  .process-step {
    max-width: 100%;
    margin-bottom: 2rem;
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