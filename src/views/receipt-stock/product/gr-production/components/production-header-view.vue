<template>
  <div class="filter-container-highlight">
    <div class="form-col-container">
      <div class="d-flex justify-content-between">
        <span class="desc-text-white">
          {{
            `รับสินค้างานผลิต แผนผลิตเลขที่ [ W.O. ] : 
              ${data.wo ? `${data.wo}-${data.woNumber}` : 'loading...'}`
          }}
        </span>
        <div class="desc-text-white">
          <div>
            <span>{{ `จำนวนรับเเล้ว ${data.qtyRunning}/${data.productQty}` }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="form-col-container">
    <BaseDataTable :items="dataHeader" :columns="columns" :paginator="false">
      <template #productQtyTemplate="{ data }">
        <div class="d-flex justify-content-end p-1">
          <span>{{ data.qtyRunning }}</span>
          <span>/</span>
          <span>{{ data.productQty }}</span>
        </div>
      </template>
    </BaseDataTable>
  </div>

  <!-- <div class="filter-container-highlight mt-2">
    <div class="form-col-container">
      <div class="desc-text-white d-flex justify-content-between">
        <div>
          <span class="bi bi-box-arrow-in-down mr-2"></span>
          <span>ปรับปรุงรายการสินค้ารับเข้าคลัง</span>
        </div>
        <div>
          <span>{{ `จำนวนรับเเล้ว ${data.qtyRunning}/${data.productQty}` }}</span>
        </div>
      </div>
    </div>
  </div> -->

  <div class="line"></div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  name: 'production-header-view',

  components: {
    BaseDataTable
  },

  props: {
    model: {
      type: Object,
      required: true,
      default: () => ({})
    },
    modelHeader: {
      type: Array,
      required: true,
      default: () => []
    }
  },

  computed: {
    data() {
      return this.model
    },
    dataHeader() {
      return this.modelHeader
    }
  },

  data() {
    return {
      columns: [
        {
          field: 'receiptNumber',
          header: 'เลขที่ตั้งรับแผนผลิต',
          sortable: false,
          minWidth: '150px'
        },
        {
          field: 'receiptDate',
          header: 'วันที่ผลิตสำเร็จ',
          sortable: false,
          minWidth: '150px',
          format: 'datetime'
        },
        {
          field: 'mold',
          header: 'เเม่พิมพ์',
          sortable: false,
          minWidth: '150px'
        },
        {
          field: 'productNumber',
          header: 'รหัสสินค้าผลิต',
          sortable: false,
          minWidth: '150px'
        },
        {
          field: 'productTypeName',
          header: 'ประเภทสินค้า',
          sortable: false,
          minWidth: '150px'
        },
        {
          field: 'gold',
          header: 'สีของทอง/เงิน',
          sortable: false,
          minWidth: '150px'
        },
        {
          field: 'goldSize',
          header: 'ประเภททอง/เงิน',
          sortable: false,
          minWidth: '150px'
        }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';
@import '@/assets/scss/custom-style/standard-form';
</style>
