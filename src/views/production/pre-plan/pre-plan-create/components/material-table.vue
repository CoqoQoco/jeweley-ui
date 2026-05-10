<template>
  <div class="card p-3">
    <h6 class="mb-2">วัสดุที่ใช้ (ทอง / พลอย / เพชร)</h6>

    <BaseDataTable
      :items="materials"
      :columns="columns"
      :paginator="false"
      :showGridlines="true"
      :scrollHeight="'auto'"
      dataKey="id"
    >
      <template #actionTemplate="{ data }">
        <button class="btn btn-sm btn-red" @click="onDelMaterial(data)" title="ลบ">
          <i class="bi bi-trash-fill"></i>
        </button>
      </template>

      <template #goldTemplate="{ data }">
        <Dropdown
          v-model="data.gold"
          :options="masterGold"
          optionLabel="description"
          placeholder="เลือกทอง"
          :showClear="!!data.gold"
          @change="emitUpdate"
          class="material-dropdown"
        />
      </template>

      <template #goldQtyTemplate="{ data }">
        <input
          v-model="data.goldQty"
          type="number"
          class="form-control form-control-sm"
          @input="emitUpdate"
        />
      </template>

      <template #gemTemplate="{ data }">
        <Dropdown
          v-model="data.gem"
          :options="masterGem"
          optionLabel="description"
          placeholder="เลือกพลอย"
          :showClear="!!data.gem"
          @change="emitUpdate"
          class="material-dropdown"
        />
      </template>

      <template #gemShapeTemplate="{ data }">
        <Dropdown
          v-model="data.gemShape"
          :options="masterGemShape"
          optionLabel="description"
          placeholder="รูปร่าง"
          :showClear="!!data.gemShape"
          @change="emitUpdate"
          class="material-dropdown"
        />
      </template>

      <template #gemQtyTemplate="{ data }">
        <input v-model="data.gemQty" type="number" class="form-control form-control-sm" @input="emitUpdate" />
      </template>

      <template #gemUnitTemplate="{ data }">
        <input v-model="data.gemUnit" class="form-control form-control-sm" @input="emitUpdate" />
      </template>

      <template #gemSizeTemplate="{ data }">
        <input v-model="data.gemSize" class="form-control form-control-sm" @input="emitUpdate" />
      </template>

      <template #gemWeightTemplate="{ data }">
        <input v-model="data.gemWeight" type="number" class="form-control form-control-sm" @input="emitUpdate" />
      </template>

      <template #gemWeightUnitTemplate="{ data }">
        <input v-model="data.gemWeightUnit" class="form-control form-control-sm" @input="emitUpdate" />
      </template>

      <template #diamondQtyTemplate="{ data }">
        <input v-model="data.diamondQty" type="number" class="form-control form-control-sm" @input="emitUpdate" />
      </template>

      <template #diamondUnitTemplate="{ data }">
        <input v-model="data.diamondUnit" class="form-control form-control-sm" @input="emitUpdate" />
      </template>

      <template #diamondSizeTemplate="{ data }">
        <input v-model="data.diamondSize" class="form-control form-control-sm" @input="emitUpdate" />
      </template>

      <template #diamondWeightTemplate="{ data }">
        <input v-model="data.diamondWeight" type="number" class="form-control form-control-sm" @input="emitUpdate" />
      </template>

      <template #diamondWeightUnitTemplate="{ data }">
        <input v-model="data.diamondWeightUnit" class="form-control form-control-sm" @input="emitUpdate" />
      </template>

      <template #diamondQualityTemplate="{ data }">
        <input v-model="data.diamondQuality" class="form-control form-control-sm" @input="emitUpdate" />
      </template>

      <template #footer>
        <div class="d-flex justify-content-end">
          <button class="btn btn-sm btn-main" @click="onAddMaterial">
            <i class="bi bi-plus"></i> เพิ่มแถว
          </button>
        </div>
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import Dropdown from 'primevue/dropdown'

const BaseDataTable = defineAsyncComponent(
  () => import('@/components/prime-vue/DataTableWithPaging.vue')
)

let materialIdCounter = 1

function createEmptyMaterial() {
  return {
    id: materialIdCounter++,
    gold: null,
    goldQty: null,
    gem: null,
    gemShape: null,
    gemQty: null,
    gemUnit: null,
    gemSize: null,
    gemWeight: null,
    gemWeightUnit: null,
    diamondQty: null,
    diamondUnit: null,
    diamondSize: null,
    diamondWeight: null,
    diamondWeightUnit: null,
    diamondQuality: null,
  }
}

export default {
  name: 'MaterialTable',

  components: { BaseDataTable, Dropdown },

  props: {
    materials: { type: Array, default: () => [] },
    masterGold: { type: Array, default: () => [] },
    masterGem: { type: Array, default: () => [] },
    masterGemShape: { type: Array, default: () => [] },
  },

  emits: ['update:materials'],

  data() {
    return {
      columns: [
        { field: 'action', header: '', minWidth: '60px', sortable: false, align: 'center' },
        { field: 'gold', header: 'สีของทอง/เงิน', minWidth: '150px', sortable: false },
        { field: 'goldQty', header: 'จำนวนทอง/เงิน', minWidth: '120px', sortable: false },
        { field: 'gem', header: 'ประเภทพลอย', minWidth: '150px', sortable: false },
        { field: 'gemShape', header: 'รูปร่างพลอย', minWidth: '130px', sortable: false },
        { field: 'gemQty', header: 'จำนวนพลอย', minWidth: '110px', sortable: false },
        { field: 'gemUnit', header: 'หน่วยพลอย', minWidth: '100px', sortable: false },
        { field: 'gemSize', header: 'ขนาดพลอย', minWidth: '110px', sortable: false },
        { field: 'gemWeight', header: 'น้ำหนักพลอย', minWidth: '120px', sortable: false },
        { field: 'gemWeightUnit', header: 'หน่วยน้ำหนัก', minWidth: '110px', sortable: false },
        { field: 'diamondQty', header: 'จำนวนเพชร', minWidth: '110px', sortable: false },
        { field: 'diamondUnit', header: 'หน่วยเพชร', minWidth: '100px', sortable: false },
        { field: 'diamondSize', header: 'ขนาดเพชร', minWidth: '110px', sortable: false },
        { field: 'diamondWeight', header: 'น้ำหนักเพชร', minWidth: '120px', sortable: false },
        { field: 'diamondWeightUnit', header: 'หน่วยน้ำหนัก', minWidth: '110px', sortable: false },
        { field: 'diamondQuality', header: 'คุณภาพเพชร', minWidth: '120px', sortable: false },
      ],
    }
  },

  methods: {
    emitUpdate() {
      this.$emit('update:materials', [...this.materials])
    },

    onAddMaterial() {
      this.$emit('update:materials', [...this.materials, createEmptyMaterial()])
    },

    onDelMaterial(row) {
      this.$emit(
        'update:materials',
        this.materials.filter((m) => m.id !== row.id)
      )
    },
  },
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #ffffff !important;
}

h6 {
  color: var(--base-font-color);
  font-weight: 600;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 12px !important;
  background: transparent !important;
}

:deep(.material-dropdown) {
  width: 100%;
  .p-dropdown-label {
    font-size: 0.85rem;
    padding: 6px 8px;
  }
}

:deep(.form-control-sm) {
  font-size: 0.85rem;
  padding: 6px 8px;
}
</style>
