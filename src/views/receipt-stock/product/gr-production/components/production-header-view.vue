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
          <div class="d-flex align-items-center">
            <span>{{ `จำนวนรับเเล้ว ${data.qtyRunning ?? 0}/${data.productQty ?? 0}` }}</span>
            <div class="bi bi-arrow-clockwise ml-2" @click="onFetch"></div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="filter-container pt-2 pb-4 pl-4 pr-4">
    <div>
      <div class="title-text ml-2">
        <span class="bi bi-database-fill-gear mr-2"></span>
        <span>รายละเอียด</span>
      </div>
      <div class="form-col-container">
        <BaseDataTable :items="dataHeader" :columns="columns" :paginator="false"> </BaseDataTable>
      </div>
    </div>

    <!-- <div class="mt-2">
    <div class="title-text">
      <span class="bi bi-database-fill-gear mr-2"></span>
      <span>พลอย</span>
    </div>
    <div class="form-col-container">
      <BaseDataTable :items="dataGem" :columns="gemColumn" :paginator="false"> </BaseDataTable>
    </div>
  </div> -->
  </div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  name: 'production-header-view',
  emits: ['onFetch'],

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
    },
    modelGem: {
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
    },
    dataGem() {
      return this.modelGem
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
      ],

      gemColumn: [
        {
          field: 'gemCode',
          header: 'รหัส',
          sortable: false,
          width: '150px'
        },
        {
          field: 'gemName',
          header: 'รายละเอียด',
          sortable: false,
          minWidth: '300px'
        },
        {
          field: 'gemQty',
          header: 'จำนวน',
          sortable: false,
          width: '150px'
        },
        {
          field: 'gemWeight',
          header: 'น้ำหนัก',
          sortable: false,
          width: '150px'
        }
      ]
    }
  },

  methods: {
    onFetch() {
      this.$emit('onFetch')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';
@import '@/assets/scss/custom-style/standard-form';

.bi-arrow-clockwise {
  cursor: pointer;
  transition: transform 0.3s;
}

.bi-arrow-clockwise:hover {
  transform: rotate(90deg);
  color: var(--base-color);
}
</style>
