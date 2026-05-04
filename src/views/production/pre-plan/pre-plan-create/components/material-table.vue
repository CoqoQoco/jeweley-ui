<template>
  <div class="card p-3">
    <div class="d-flex justify-content-between align-items-center mb-2">
      <h6 class="mb-0">วัสดุที่ใช้ (ทอง / พลอย / เพชร)</h6>
      <button class="btn btn-sm btn-main" @click="addRow">
        <i class="bi bi-plus"></i> เพิ่มแถว
      </button>
    </div>

    <BaseDataTable
      :items="localMaterials"
      :totalRecords="localMaterials.length"
      :columns="columns"
      :paginator="false"
      scrollHeight="300px"
      dataKey="_id"
    >
      <template #materialTypeTemplate="{ data }">
        <span v-if="!isEditing(data)">{{ getMaterialTypeLabel(data.materialType) }}</span>
        <Dropdown
          v-else
          v-model="editBuffer[data._id].materialType"
          :options="materialTypeOptions"
          optionLabel="label"
          optionValue="value"
          class="w-100"
        />
      </template>

      <template #materialCodeTemplate="{ data }">
        <span v-if="!isEditing(data)">{{ data.materialCode }}</span>
        <input
          v-else
          class="form-control form-control-sm"
          v-model="editBuffer[data._id].materialCode"
        />
      </template>

      <template #sizeTemplate="{ data }">
        <span v-if="!isEditing(data)">{{ data.size }}</span>
        <input
          v-else
          class="form-control form-control-sm"
          v-model="editBuffer[data._id].size"
        />
      </template>

      <template #qtyTemplate="{ data }">
        <span v-if="!isEditing(data)">{{ data.qty }}</span>
        <input
          v-else
          class="form-control form-control-sm"
          type="number"
          v-model.number="editBuffer[data._id].qty"
        />
      </template>

      <template #isLockedTemplate="{ data }">
        <i
          v-if="!isEditing(data)"
          :class="data.isLocked ? 'bi bi-lock-fill text-danger' : 'bi bi-unlock'"
        ></i>
        <input v-else type="checkbox" v-model="editBuffer[data._id].isLocked" />
      </template>

      <template #remarkTemplate="{ data }">
        <span v-if="!isEditing(data)">{{ data.remark }}</span>
        <input
          v-else
          class="form-control form-control-sm"
          v-model="editBuffer[data._id].remark"
        />
      </template>

      <template #actionTemplate="{ data }">
        <div class="d-flex gap-1">
          <button
            v-if="!isEditing(data)"
            class="btn btn-sm btn-green"
            @click="startEdit(data)"
            title="แก้ไข"
          >
            <i class="bi bi-pencil"></i>
          </button>
          <button
            v-if="isEditing(data)"
            class="btn btn-sm btn-main"
            @click="saveEdit(data)"
            title="บันทึก"
          >
            <i class="bi bi-check"></i>
          </button>
          <button
            v-if="isEditing(data)"
            class="btn btn-sm btn-outline-main"
            @click="cancelEdit(data)"
            title="ยกเลิก"
          >
            <i class="bi bi-x"></i>
          </button>
          <button class="btn btn-sm btn-red" @click="removeRow(data)" title="ลบ">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import Dropdown from 'primevue/dropdown'

export default {
  name: 'MaterialTable',
  components: { BaseDataTable, Dropdown },
  props: {
    materials: { type: Array, default: () => [] },
  },
  emits: ['update:materials'],
  data() {
    return {
      editingIds: new Set(),
      editBuffer: {},
      materialTypeOptions: [
        { value: 'Gem', label: 'พลอย' },
        { value: 'Diamond', label: 'เพชร' },
        { value: 'Gold', label: 'ทอง' },
      ],
      columns: [
        { field: 'action', header: '', minWidth: '100px', sortable: false },
        { field: 'materialType', header: 'ประเภท', minWidth: '100px', sortable: false },
        { field: 'materialCode', header: 'รหัส', minWidth: '100px', sortable: false },
        { field: 'size', header: 'ไซส์', minWidth: '80px', sortable: false },
        { field: 'qty', header: 'จำนวน', minWidth: '80px', align: 'center', sortable: false },
        { field: 'isLocked', header: 'ล็อค', minWidth: '60px', align: 'center', sortable: false },
        { field: 'remark', header: 'หมายเหตุ', minWidth: '150px', sortable: false },
      ],
    }
  },
  computed: {
    localMaterials() {
      return this.materials
    },
  },
  methods: {
    addRow() {
      const newRow = {
        _id: Date.now() + Math.random(),
        materialType: 'Gem',
        masterId: null,
        materialCode: '',
        shapeCode: '',
        size: '',
        qty: 1,
        color: '',
        weight: null,
        weightUnit: '',
        isLocked: false,
        remark: '',
      }
      const updated = [...this.materials, newRow]
      this.$emit('update:materials', updated)
      this.startEdit(newRow)
    },
    removeRow(data) {
      this.editingIds.delete(data._id)
      delete this.editBuffer[data._id]
      this.$emit(
        'update:materials',
        this.materials.filter((m) => m._id !== data._id)
      )
    },
    isEditing(data) {
      return this.editingIds.has(data._id)
    },
    startEdit(data) {
      this.editingIds = new Set([...this.editingIds, data._id])
      this.editBuffer = { ...this.editBuffer, [data._id]: { ...data } }
    },
    saveEdit(data) {
      const updated = this.materials.map((m) =>
        m._id === data._id ? { ...m, ...this.editBuffer[data._id] } : m
      )
      this.$emit('update:materials', updated)
      this.editingIds.delete(data._id)
      const buf = { ...this.editBuffer }
      delete buf[data._id]
      this.editBuffer = buf
      this.editingIds = new Set([...this.editingIds])
    },
    cancelEdit(data) {
      this.editingIds.delete(data._id)
      const buf = { ...this.editBuffer }
      delete buf[data._id]
      this.editBuffer = buf
      this.editingIds = new Set([...this.editingIds])
    },
    getMaterialTypeLabel(type) {
      return { Gem: 'พลอย', Diamond: 'เพชร', Gold: 'ทอง' }[type] || type
    },
  },
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';
</style>
