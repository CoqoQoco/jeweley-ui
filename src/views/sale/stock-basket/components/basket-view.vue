<template>
  <div class="mt-2">
    <!-- Header Information -->
    <div class="card-container">
      <div class="card-header d-flex align-items-center justify-content-between">
        <h6 class="mb-0">{{ $t('view.sale.stockBasket.basketInfo') }}</h6>
        <span :class="getStatusBadgeClass(form.status)" style="font-size: 0.9rem;">
          {{ form.statusName || 'Draft' }}
        </span>
      </div>
      <div class="card-body">
        <div class="form-col-container">
          <!-- Basket Number -->
          <div>
            <span class="title-text">{{ $t('view.sale.stockBasket.basketNumber') }}</span>
            <InputTextGeneric
              :modelValue="form.basketNumber"
              :readonly="true"
              bgInput="bg-input"
            />
          </div>

          <!-- Event Date -->
          <div>
            <span class="title-text">{{ $t('view.sale.stockBasket.eventDate') }}</span>
            <CalendarGeneric
              v-model="form.eventDate"
              dateFormat="dd/mm/yy"
              :placeholder="$t('view.sale.stockBasket.selectDate')"
              :showIcon="true"
              :disabled="isReadOnly"
            />
          </div>

          <!-- Basket Name -->
          <div>
            <span class="title-text">{{ $t('view.sale.stockBasket.basketName') }} <span class="text-danger">*</span></span>
            <InputTextGeneric
              v-model="form.basketName"
              :placeholder="$t('view.sale.stockBasket.basketName')"
              :disabled="isReadOnly"
              :trim="true"
            />
          </div>

          <!-- Responsible -->
          <div>
            <span class="title-text">{{ $t('view.sale.stockBasket.responsible') }}</span>
            <InputTextGeneric
              v-model="form.responsible"
              :placeholder="$t('view.sale.stockBasket.responsible')"
              :disabled="isReadOnly"
              :trim="true"
            />
          </div>

          <!-- Remark -->
          <div>
            <span class="title-text">{{ $t('common.field.remark') }}</span>
            <InputTextGeneric
              v-model="form.remark"
              :placeholder="$t('common.field.remark')"
              :disabled="isReadOnly"
              :trim="true"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Add Items Section (only when status === 0) -->
    <div class="card-container mt-3" v-if="form.status === 0">
      <div class="card-header">
        <h6 class="mb-0">{{ $t('view.sale.stockBasket.addItemsSection') }}</h6>
      </div>
      <div class="card-body">
        <!-- Scan Input -->
        <div class="mb-3">
          <span class="title-text">{{ $t('view.sale.stockBasket.scanProduct') }}</span>
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
            <span class="ml-1">{{ $t('view.sale.stockBasket.searchProducts') }}</span>
          </button>
          <button class="btn btn-sm btn-outline-main ml-2" @click="isShowCategorySelectModal = true">
            <i class="bi bi-collection"></i>
            <span class="ml-1">{{ $t('view.sale.stockBasket.selectAllCategories') }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Items Table -->
    <div class="card-container mt-3">
      <div class="card-header">
        <h6 class="mb-0">{{ $t('view.sale.stockBasket.itemListTitle', { count: items.length }) }}</h6>
      </div>
      <div class="card-body">
        <BaseDataTable
          :items="items"
          :totalRecords="itemsTotal"
          :columns="columns"
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
              :title="$t('common.btn.delete')"
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
          <span class="ml-1">{{ $t('common.btn.save') }}</span>
        </button>
        <button class="btn btn-sm btn-outline-main ml-2" @click="onSubmitApproval">
          <i class="bi bi-send"></i>
          <span class="ml-1">{{ $t('view.sale.stockBasket.submitApproval') }}</span>
        </button>
      </template>

      <template v-else-if="form.status === 1">
        <button class="btn btn-sm btn-main" @click="onApprove">
          <i class="bi bi-check-circle"></i>
          <span class="ml-1">{{ $t('view.sale.stockBasket.approve') }}</span>
        </button>
      </template>

      <template v-else-if="form.status === 2">
        <button class="btn btn-sm btn-green" @click="onCheckout">
          <i class="bi bi-box-arrow-right"></i>
          <span class="ml-1">{{ $t('view.sale.stockBasket.checkout') }}</span>
        </button>
      </template>

      <button class="btn btn-sm btn-outline-main ml-2" @click="$router.push('/sale/stock-basket')">
        <i class="bi bi-arrow-left"></i>
        <span class="ml-1">{{ $t('common.btn.back') }}</span>
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
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import ScanInput from '@/components/custom/scan-input.vue'
import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
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
    InputTextGeneric,
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

    }
  },

  setup() {
    const store = useStockBasketApiStore()
    return { store }
  },

  computed: {
    isReadOnly() {
      return this.form.status > 0
    },

    columns() {
      return [
        { field: 'stockNumber', header: 'Stock Number', minWidth: '140px', sortable: true },
        { field: 'productNameTh', header: this.$t('view.sale.stockBasket.productName'), minWidth: '160px', sortable: true },
        { field: 'productType', header: this.$t('view.sale.stockBasket.type'), minWidth: '120px', sortable: true },
        { field: 'productionTypeSize', header: this.$t('view.sale.stockBasket.goldSize'), minWidth: '110px', sortable: true },
        { field: 'statusName', header: this.$t('view.sale.stockBasket.status'), minWidth: '110px', sortable: false },
        { field: 'createDate', header: this.$t('view.sale.stockBasket.addDate'), minWidth: '110px', format: 'date', sortable: true },
        { field: 'action', header: '', minWidth: '80px', sortable: false }
      ]
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
        warning(this.$t('view.sale.stockBasket.validation.nameRequired'), this.$t('common.label.incompleteData'))
        return
      }

      const response = await this.store.fetchUpsert({ formValue: this.form })
      if (response) {
        success(this.$t('view.sale.stockBasket.success.save'))

        if (!this.form.running && response.running) {
          this.form.running = response.running
          this.$router.replace('/sale/stock-basket/' + response.running)
        }
      }
    },

    async onScanItem(stockNumber) {
      if (!this.form.running) {
        warning(this.$t('view.sale.stockBasket.validation.saveFirst'), this.$t('view.sale.stockBasket.notSavedTitle'))
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
          warning(this.$t('view.sale.stockBasket.validation.alreadyInBasket'), this.$t('view.sale.stockBasket.cannotAddTitle'))
        }
        if (response.addedCount > 0) {
          await this.loadBasket(this.form.running)
        }
      }

      this.scanValue = ''
    },

    async onStockSelectedFromModal(stockNumber) {
      if (!this.form.running) {
        warning(this.$t('view.sale.stockBasket.validation.saveFirst'), this.$t('view.sale.stockBasket.notSavedTitle'))
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
          warning(this.$t('view.sale.stockBasket.validation.alreadyInBasket'), this.$t('view.sale.stockBasket.cannotAddTitle'))
        } else if (response.addedCount > 0) {
          success(this.$t('view.sale.stockBasket.success.addItem'))
          await this.loadBasket(this.form.running)
        }
      }
    },

    async onCategorySelected(categoryFilter) {
      if (!this.form.running) {
        warning(this.$t('view.sale.stockBasket.validation.saveFirst'), this.$t('view.sale.stockBasket.notSavedTitle'))
        return
      }

      const response = await this.store.fetchAddItems({
        formValue: {
          basketRunning: this.form.running,
          categoryFilter: categoryFilter
        }
      })

      if (response) {
        success(this.$t('view.sale.stockBasket.success.addItems', { count: response.addedCount || 0 }))
        await this.loadBasket(this.form.running)
      }
    },

    onRemoveItem(item) {
      confirmSubmit(
        this.$t('view.sale.stockBasket.confirm.deleteItem', { stockNumber: item.stockNumber }),
        this.$t('view.sale.stockBasket.confirm.deleteTitle'),
        async () => {
          const response = await this.store.fetchRemoveItem({
            formValue: {
              basketRunning: this.form.running,
              stockNumber: item.stockNumber
            }
          })
          if (response) {
            success(this.$t('view.sale.stockBasket.success.deleteItem'))
            await this.loadBasket(this.form.running)
          }
        }
      )
    },

    onSubmitApproval() {
      confirmSubmit(
        this.$t('view.sale.stockBasket.confirm.submitApproval'),
        this.$t('view.sale.stockBasket.confirm.submitApprovalTitle'),
        async () => {
          const response = await this.store.fetchSubmitApproval({
            formValue: { running: this.form.running }
          })
          if (response) {
            success(this.$t('view.sale.stockBasket.submitApproval'))
            await this.loadBasket(this.form.running)
          }
        }
      )
    },

    onApprove() {
      confirmSubmit(
        this.$t('view.sale.stockBasket.confirm.approve'),
        this.$t('view.sale.stockBasket.confirm.approveTitle'),
        async () => {
          const response = await this.store.fetchApprove({
            formValue: { running: this.form.running }
          })
          if (response) {
            success(this.$t('view.sale.stockBasket.approve'))
            await this.loadBasket(this.form.running)
          }
        }
      )
    },

    onCheckout() {
      confirmSubmit(
        this.$t('view.sale.stockBasket.confirm.checkout'),
        this.$t('view.sale.stockBasket.confirm.checkoutTitle'),
        async () => {
          const response = await this.store.fetchCheckout({
            formValue: { running: this.form.running }
          })
          if (response) {
            success('Checkout')
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
