<template>
  <div class="mt-2">
    <!-- Header Information -->
    <div class="card-container">
      <div class="card-header d-flex align-items-center justify-content-between">
        <h6 class="mb-0">ข้อมูลตะกร้าสินค้า</h6>
        <span :class="getStatusBadgeClass(form.status)" style="font-size: 0.9rem;">
          {{ form.statusName || 'Draft' }}
        </span>
      </div>
      <div class="card-body">
        <div class="form-col-container">
          <!-- Basket Number -->
          <div>
            <span class="title-text">เลขที่ตะกร้า</span>
            <input
              class="form-control bg-input"
              type="text"
              v-model="form.basketNumber"
              readonly
            />
          </div>

          <!-- Event Date -->
          <div>
            <span class="title-text">วันที่งาน</span>
            <CalendarGeneric
              v-model="form.eventDate"
              dateFormat="dd/mm/yy"
              placeholder="เลือกวันที่"
              :showIcon="true"
              :disabled="isReadOnly"
            />
          </div>

          <!-- Basket Name -->
          <div>
            <span class="title-text">ชื่องาน/บูท <span class="text-danger">*</span></span>
            <input
              class="form-control"
              type="text"
              v-model.trim="form.basketName"
              placeholder="ชื่องาน/บูท"
              :disabled="isReadOnly"
            />
          </div>

          <!-- Responsible -->
          <div>
            <span class="title-text">ผู้รับผิดชอบ</span>
            <input
              class="form-control"
              type="text"
              v-model.trim="form.responsible"
              placeholder="ผู้รับผิดชอบ"
              :disabled="isReadOnly"
            />
          </div>

          <!-- Remark -->
          <div>
            <span class="title-text">หมายเหตุ</span>
            <input
              class="form-control"
              type="text"
              v-model.trim="form.remark"
              placeholder="หมายเหตุ"
              :disabled="isReadOnly"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Add Items Section (only when status === 0) -->
    <div class="card-container mt-3" v-if="form.status === 0">
      <div class="card-header">
        <h6 class="mb-0">เพิ่มสินค้าในตะกร้า</h6>
      </div>
      <div class="card-body">
        <!-- Scan Input -->
        <div class="mb-3">
          <span class="title-text">Scan สินค้า</span>
          <ScanInput
            v-model="scanValue"
            placeholder="Scan หรือพิมพ์ Stock Number..."
            :funcForSingleItem="onScanItem"
          />
        </div>

        <!-- Action buttons for search -->
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-green" @click="isShowStockSearchModal = true">
            <i class="bi bi-search"></i>
            <span class="ml-1">ค้นหาสินค้า</span>
          </button>
          <button class="btn btn-sm btn-outline-main" @click="isShowCategorySelectModal = true">
            <i class="bi bi-collection"></i>
            <span class="ml-1">เลือกทั้ง Category</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Items Table -->
    <div class="card-container mt-3">
      <div class="card-header">
        <h6 class="mb-0">รายการสินค้า ({{ items.length }} รายการ)</h6>
      </div>
      <div class="card-body">
        <BaseDataTable
          :items="items"
          :totalRecords="itemsTotal"
          :columns="itemColumns"
          :perPage="50"
          :paginator="true"
          @page="handleItemsPageChange"
        >
          <template #statusNameTemplate="{ data }">
            <span :class="getItemStatusBadgeClass(data.status)">
              {{ data.statusName }}
            </span>
          </template>

          <template #actionTemplate="{ data }">
            <button
              v-if="data.status === 'InBasket' && form.status === 0"
              class="btn btn-sm btn-red"
              @click="onRemoveItem(data)"
              title="ลบ"
            >
              <i class="bi bi-trash"></i>
            </button>
          </template>
        </BaseDataTable>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="action-btn-group mt-3">
      <template v-if="form.status === 0">
        <button class="btn btn-sm btn-main" @click="onSave">
          <i class="bi bi-save"></i>
          <span class="ml-1">บันทึก</span>
        </button>
        <button class="btn btn-sm btn-outline-main" @click="onSubmitApproval">
          <i class="bi bi-send"></i>
          <span class="ml-1">ส่งอนุมัติ</span>
        </button>
      </template>

      <template v-else-if="form.status === 1">
        <button class="btn btn-sm btn-main" @click="onApprove">
          <i class="bi bi-check-circle"></i>
          <span class="ml-1">อนุมัติ</span>
        </button>
      </template>

      <template v-else-if="form.status === 2">
        <button class="btn btn-sm btn-green" @click="onCheckout">
          <i class="bi bi-box-arrow-right"></i>
          <span class="ml-1">Checkout</span>
        </button>
      </template>

      <button class="btn btn-sm btn-outline-main" @click="$router.push('/sale/stock-basket')">
        <i class="bi bi-arrow-left"></i>
        <span class="ml-1">กลับ</span>
      </button>
    </div>

    <!-- Modals -->
    <stockSearchModal
      :isShow="isShowStockSearchModal"
      @closeModal="isShowStockSearchModal = false"
      @stockSelected="onStockSelectedFromModal"
    />

    <categorySelectModal
      :isShow="isShowCategorySelectModal"
      @closeModal="isShowCategorySelectModal = false"
      @categorySelected="onCategorySelected"
    />
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import ScanInput from '@/components/custom/ScanInput.vue'
import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'
import { useStockBasketApiStore } from '@/stores/modules/api/sale/stock-basket-store.js'
import { warning, success, confirmSubmit } from '@/services/alert/sweetAlerts.js'
import stockSearchModal from '../modal/stock-search-modal.vue'
import categorySelectModal from '../modal/category-select-modal.vue'

const interfaceForm = {
  running: null,
  basketNumber: null,
  basketName: null,
  eventDate: null,
  responsible: null,
  remark: null,
  status: 0,
  statusName: 'Draft'
}

export default {
  name: 'BasketView',

  components: {
    BaseDataTable,
    ScanInput,
    CalendarGeneric,
    stockSearchModal,
    categorySelectModal
  },

  data() {
    return {
      form: { ...interfaceForm },
      scanValue: '',
      items: [],
      itemsTotal: 0,
      itemsSkip: 0,
      isShowStockSearchModal: false,
      isShowCategorySelectModal: false,

      itemColumns: [
        { field: 'stockNumber', header: 'Stock Number', minWidth: '140px', sortable: true },
        { field: 'productNameTh', header: 'ชื่อสินค้า', minWidth: '160px', sortable: true },
        { field: 'productType', header: 'ประเภท', minWidth: '120px', sortable: true },
        { field: 'productionTypeSize', header: 'ขนาดทอง', minWidth: '110px', sortable: true },
        { field: 'statusName', header: 'สถานะ', minWidth: '110px', sortable: false },
        { field: 'createDate', header: 'วันที่เพิ่ม', minWidth: '110px', format: 'date', sortable: true },
        { field: 'action', header: '', minWidth: '80px', sortable: false }
      ]
    }
  },

  setup() {
    const store = useStockBasketApiStore()
    return { store }
  },

  computed: {
    isReadOnly() {
      return this.form.status > 0
    }
  },

  async created() {
    const running = this.$route.params.running

    if (running === 'new') {
      const res = await this.store.fetchGenerateNumber()
      if (res) {
        this.form.basketNumber = res.data || res
      }
    } else {
      await this.loadBasket(running)
    }
  },

  methods: {
    async loadBasket(running) {
      const response = await this.store.fetchGet({ formValue: { running } })
      if (response) {
        this.form = {
          running: response.running,
          basketNumber: response.basketNumber,
          basketName: response.basketName,
          eventDate: response.eventDate ? new Date(response.eventDate) : null,
          responsible: response.responsible,
          remark: response.remark,
          status: response.status,
          statusName: response.statusName
        }
        this.items = response.items || []
        this.itemsTotal = this.items.length
      }
    },

    async onSave() {
      if (!this.form.basketName) {
        warning('กรุณากรอกชื่องาน/บูท', 'ข้อมูลไม่ครบถ้วน')
        return
      }

      const response = await this.store.fetchUpsert({ formValue: this.form })
      if (response) {
        success('บันทึกข้อมูลสำเร็จ')

        if (!this.form.running && response.running) {
          this.form.running = response.running
          this.$router.replace('/sale/stock-basket/' + response.running)
        }
      }
    },

    async onScanItem(stockNumber) {
      if (!this.form.running) {
        warning('กรุณาบันทึกตะกร้าก่อนเพิ่มสินค้า', 'ยังไม่ได้บันทึก')
        return
      }

      const response = await this.store.fetchAddItems({
        formValue: {
          basketRunning: this.form.running,
          stockNumbers: [stockNumber]
        }
      })

      if (response) {
        if (response.skippedStockNumbers && response.skippedStockNumbers.includes(stockNumber)) {
          warning('สินค้านี้อยู่ในตะกร้าอื่นแล้ว', 'ไม่สามารถเพิ่มได้')
        }
        if (response.addedCount > 0) {
          await this.loadBasket(this.form.running)
        }
      }

      this.scanValue = ''
    },

    async onStockSelectedFromModal(stockNumber) {
      if (!this.form.running) {
        warning('กรุณาบันทึกตะกร้าก่อนเพิ่มสินค้า', 'ยังไม่ได้บันทึก')
        return
      }

      const response = await this.store.fetchAddItems({
        formValue: {
          basketRunning: this.form.running,
          stockNumbers: [stockNumber]
        }
      })

      if (response) {
        if (response.skippedStockNumbers && response.skippedStockNumbers.includes(stockNumber)) {
          warning('สินค้านี้อยู่ในตะกร้าอื่นแล้ว', 'ไม่สามารถเพิ่มได้')
        } else if (response.addedCount > 0) {
          success('เพิ่มสินค้าสำเร็จ')
          await this.loadBasket(this.form.running)
        }
      }
    },

    async onCategorySelected(categoryFilter) {
      if (!this.form.running) {
        warning('กรุณาบันทึกตะกร้าก่อนเพิ่มสินค้า', 'ยังไม่ได้บันทึก')
        return
      }

      const response = await this.store.fetchAddItems({
        formValue: {
          basketRunning: this.form.running,
          categoryFilter: categoryFilter
        }
      })

      if (response) {
        success(`เพิ่มสินค้า ${response.addedCount || 0} รายการ`)
        await this.loadBasket(this.form.running)
      }
    },

    onRemoveItem(item) {
      confirmSubmit(
        `ต้องการลบสินค้า ${item.stockNumber} ออกจากตะกร้าหรือไม่?`,
        'ยืนยันการลบ',
        async () => {
          const response = await this.store.fetchRemoveItem({
            formValue: {
              basketRunning: this.form.running,
              stockNumber: item.stockNumber
            }
          })
          if (response) {
            success('ลบสินค้าสำเร็จ')
            await this.loadBasket(this.form.running)
          }
        }
      )
    },

    onSubmitApproval() {
      confirmSubmit(
        'ต้องการส่งตะกร้านี้เพื่อขออนุมัติหรือไม่?',
        'ยืนยันการส่งอนุมัติ',
        async () => {
          const response = await this.store.fetchSubmitApproval({
            formValue: { running: this.form.running }
          })
          if (response) {
            success('ส่งอนุมัติสำเร็จ')
            await this.loadBasket(this.form.running)
          }
        }
      )
    },

    onApprove() {
      confirmSubmit(
        'ต้องการอนุมัติตะกร้านี้หรือไม่?',
        'ยืนยันการอนุมัติ',
        async () => {
          const response = await this.store.fetchApprove({
            formValue: { running: this.form.running }
          })
          if (response) {
            success('อนุมัติสำเร็จ')
            await this.loadBasket(this.form.running)
          }
        }
      )
    },

    onCheckout() {
      confirmSubmit(
        'ต้องการ Checkout ตะกร้านี้หรือไม่?',
        'ยืนยัน Checkout',
        async () => {
          const response = await this.store.fetchCheckout({
            formValue: { running: this.form.running }
          })
          if (response) {
            success('Checkout สำเร็จ')
            await this.loadBasket(this.form.running)
          }
        }
      )
    },

    handleItemsPageChange(e) {
      this.itemsSkip = e.first
    },

    getStatusBadgeClass(status) {
      const map = {
        0: 'badge badge-secondary',
        1: 'badge badge-warning',
        2: 'badge badge-info',
        3: 'badge badge-success',
        4: 'badge badge-dark'
      }
      return map[status] || 'badge badge-secondary'
    },

    getItemStatusBadgeClass(status) {
      const map = {
        InBasket: 'badge badge-info',
        CheckedOut: 'badge badge-success',
        Returned: 'badge badge-secondary'
      }
      return map[status] || 'badge badge-secondary'
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.action-btn-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding: 12px 0;
}

.gap-2 {
  gap: 8px;
}
</style>
