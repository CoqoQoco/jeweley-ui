<template>
  <div class="expnad-container">
    <DataTable
      :value="dataExpand.items"
      dataKey="id"
      ref="dt"
      class="p-datatable-sm"
      stripedRows
      columnResizeMode="fit"
      showGridlines
    >
      <!-- <Column field="no" header="ลำดับ" style="width: 20px"> </Column> -->
      <Column field="no" header="ลำดับ" style="width: 10px">
        <template #body="slotProps">
          <div class="text-center">
            {{ slotProps.index + 1 }}
          </div>
        </template>
      </Column>
      <Column field="name" header="พลอย/เพชร" style="min-width: 200px"> </Column>
      <Column field="qty" header="จำนวน" style="min-width: 200px">
        <template #body="slotProps">
          <div>
            <span><i class="mr-1" :class="getIconQty(slotProps.data.type)"></i></span>
            <span>
              {{
                slotProps.data.qty
                  ? Number(slotProps.data.qty).toFixed(3).toLocaleString()
                  : '0.000'
              }}
            </span>
          </div>
        </template>
      </Column>
      <Column field="qtyWeight" header="น้ำหนัก" style="min-width: 200px">
        <template #body="slotProps">
          <div>
            <span><i class="mr-1" :class="getIconQty(slotProps.data.type)"></i></span>
            <span>
              {{
                slotProps.data.qtyWeight
                  ? Number(slotProps.data.qtyWeight).toFixed(3).toLocaleString()
                  : '0.000'
              }}
            </span>
          </div>
        </template>
      </Column>

      <Column field="code" header="รหัส" style="min-width: 200px"> </Column>
      <Column field="groupName" header="หมวดหมู่" style="min-width: 200px"> </Column>
      <Column field="size" header="ขนาด" style="min-width: 200px"> </Column>
      <Column field="shape" header="รูปร่าง" style="min-width: 200px"> </Column>
      <Column field="grade" header="เกรด" style="min-width: 200px"> </Column>

      <Column field="remark2" header="หมายเหตุ-2" style="min-width: 200px"> </Column>
    </DataTable>
  </div>
</template>

<script>
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

export default {
  components: {
    //modal,
    DataTable,
    Column
  },
  props: {
    modelExpand: {
      type: Object,
      required: true,
      default: () => {}
    },
    slotIndex: {
      type: Number,
      required: true,
      default: 0
    }
  },
  computed: {
    dataExpand() {
      return this.modelExpand
    },
    index() {
      return this.slotIndex
    },
    formattedOptionLabel() {
      return (option) => `${option.woText}-${option.woNumber}`
    }
  },
  data() {
    return {
      isLoading: false,
      modelMasterType: [
        { id: 1, description: 'รับเข้าคลัง [พลอยใหม่]' },
        { id: 2, description: 'รับเข้าคลัง [พลอยนอกสต๊อก]' },
        { id: 3, description: 'รับเข้าคลัง [พลอยคืน]' },
        { id: 4, description: 'จ่ายออกคลัง' },
        { id: 5, description: 'ยืมออกคลัง' }
      ],
      gemsReturn: [],
      expandedRows: [],
      planSearch: []
    }
  },
  methods: {
    getIconQty(type) {
      switch (type) {
        case 1:
        case 2:
        case 3:
          return 'bi bi-arrow-down-square-fill text-success'
        case 4:
          return 'bi bi-arrow-up-square-fill text-danger'
        case 5:
          return 'bi bi-arrow-right-square-fill text-secondary'
        default:
          return ''
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';
@import '@/assets/scss/custom-style/standard-form.scss';

:deep(.p-datatable) {
  thead th {
    background-color: #460505 !important;
  }
}
.expnad-container {
  padding: 5px;
}
</style>
