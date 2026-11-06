<template>
  <div class="card p-3">
    <pageTitle title="วัสดุที่ใช้ (ทอง / พลอย / เพชร)" :isShowBtnClose="false" class="mb-3" />

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
        <DropdownGeneric
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

      <template #ringSizeTemplate="{ data }">
        <input v-model="data.ringSize" maxlength="50" class="form-control form-control-sm" @input="emitUpdate" />
      </template>

      <template #gemTemplate="{ data }">
        <DropdownGeneric
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
        <DropdownGeneric
          v-model="data.gemShape"
          :options="masterGemShape"
          optionLabel="description"
          placeholder="รูปร่าง"
          :showClear="!!data.gemShape"
          @change="emitUpdate"
          class="material-dropdown"
        />
      </template>

      <template #gemSizeTemplate="{ data }">
        <input v-model="data.gemSize" class="form-control form-control-sm" @input="emitUpdate" />
      </template>

      <template #diamondSizeTemplate="{ data }">
        <input v-model="data.diamondSize" class="form-control form-control-sm" @input="emitUpdate" />
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
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'

const BaseDataTable = defineAsyncComponent(
  () => import('@/components/prime-vue/DataTableWithPaging.vue')
)
const pageTitle = defineAsyncComponent(() => import('@/components/custom/page-title.vue'))

let materialIdCounter = 1

function createEmptyMaterial() {
  return {
    id: materialIdCounter++,
    gold: null,
    goldQty: null,
    ringSize: null,
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

  components: { BaseDataTable, DropdownGeneric, pageTitle },

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
        { field: 'ringSize', header: 'ไซส์แหวน', minWidth: '110px', sortable: false },
        { field: 'gem', header: 'ประเภทพลอย', minWidth: '150px', sortable: false },
        { field: 'gemShape', header: 'รูปร่างพลอย', minWidth: '130px', sortable: false },
        { field: 'gemSize', header: 'ขนาดพลอย', minWidth: '110px', sortable: false },
        { field: 'diamondSize', header: 'ขนาดเพชร', minWidth: '110px', sortable: false },
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
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';

.card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #ffffff !important;
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
