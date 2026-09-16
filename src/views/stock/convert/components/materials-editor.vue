<template>
  <div class="materials-editor">
    <BaseDataTable :items="items" :columns="columns" :paginator="false">
      <template #typeTemplate="{ data }">
        <DropdownGeneric
          :modelValue="data.type"
          :options="materialTypeOptions"
          optionLabel="description"
          optionValue="value"
          :placeholder="$t('view.stock.convert.placeholderSelectType')"
          @update:modelValue="data.type = $event"
        />
      </template>

      <template #typeCodeTemplate="{ data }">
        <div>
          <DropdownGeneric
            v-if="data.type === 'Gold' || data.type === 'Silver'"
            :modelValue="data.typeCode"
            :options="masterGold"
            optionLabel="description"
            optionValue="code"
            :placeholder="$t('view.stock.convert.placeholderSelectGold')"
            :showClear="!!data.typeCode"
            @update:modelValue="data.typeCode = $event"
          />
          <DropdownGeneric
            v-else-if="data.type === 'Diamond'"
            :modelValue="data.typeCode"
            :options="masterDiamondGrade"
            optionLabel="description"
            optionValue="nameEn"
            :placeholder="$t('view.stock.convert.placeholderSelectDiamond')"
            :showClear="!!data.typeCode"
            @update:modelValue="data.typeCode = $event"
          />
          <DropdownGeneric
            v-else-if="data.type === 'Gem'"
            :modelValue="data.typeCode"
            :options="masterGem"
            optionLabel="description"
            optionValue="nameEn"
            :placeholder="$t('view.stock.convert.placeholderSelectGem')"
            :showClear="!!data.typeCode"
            @update:modelValue="data.typeCode = $event"
          />
          <span v-else class="text-muted">{{ $t('view.stock.convert.placeholderSelectType') }}</span>
        </div>
      </template>

      <template #sizeTemplate="{ data }">
        <InputTextGeneric v-if="data.type === 'Diamond' || data.type === 'Gem'" v-model="data.size" />
        <span v-else class="text-center d-block">—</span>
      </template>

      <template #regionTemplate="{ data }">
        <InputTextGeneric v-if="data.type === 'Diamond' || data.type === 'Gem'" v-model="data.region" />
        <span v-else class="text-center d-block">—</span>
      </template>

      <template #qtyTemplate="{ data }">
        <InputTextGeneric type="number" :min="0" v-model.number="data.qty" />
      </template>

      <template #weightTemplate="{ data }">
        <InputTextGeneric type="number" :min="0" :step="0.01" v-model.number="data.weight" />
      </template>

      <template #priceTemplate="{ data }">
        <InputTextGeneric type="number" :min="0" :step="0.01" v-model.number="data.price" />
      </template>

      <template #actionTemplate="{ index }">
        <ButtonGeneric variant="red" icon="bi-trash" :title="$t('common.btn.delete')" @click="removeItem(index)" />
      </template>
    </BaseDataTable>

    <ButtonGeneric variant="green" icon="bi-plus" :label="$t('view.stock.convert.addMaterialBtn')" class="mt-2" @click="addItem" />
  </div>
</template>

<script>
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'

import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

export default {
  name: 'MaterialsEditor',

  components: {
    BaseDataTable,
    DropdownGeneric,
    InputTextGeneric,
    ButtonGeneric
  },

  props: {
    modelValue: {
      type: Array,
      default: () => []
    }
  },

  emits: ['update:modelValue'],

  setup() {
    const masterStore = useMasterApiStore()
    return { masterStore }
  },

  computed: {
    items() {
      return this.modelValue
    },

    masterGold() {
      return this.masterStore.gold
    },
    masterGem() {
      return this.masterStore.gem
    },
    masterDiamondGrade() {
      return this.masterStore.diamondGrade
    },

    materialTypeOptions() {
      return [
        { value: 'Gold', description: this.$t('view.stock.convert.materialGold') },
        { value: 'Silver', description: this.$t('view.stock.convert.materialSilver') },
        { value: 'Diamond', description: this.$t('view.stock.convert.materialDiamond') },
        { value: 'Gem', description: this.$t('view.stock.convert.materialGem') }
      ]
    },

    columns() {
      return [
        { field: 'type', header: this.$t('view.stock.convert.materialType'), sortable: false, minWidth: '140px' },
        { field: 'typeCode', header: this.$t('view.stock.convert.materialCode'), sortable: false, minWidth: '160px' },
        { field: 'size', header: this.$t('view.stock.convert.materialSize'), sortable: false, minWidth: '100px' },
        { field: 'region', header: this.$t('view.stock.convert.materialRegion'), sortable: false, minWidth: '100px' },
        { field: 'qty', header: this.$t('common.field.quantity'), sortable: false, minWidth: '100px' },
        { field: 'weight', header: this.$t('common.field.weight'), sortable: false, minWidth: '110px' },
        { field: 'price', header: this.$t('common.field.price'), sortable: false, minWidth: '110px' },
        { field: 'action', header: '', sortable: false, width: '60px' }
      ]
    }
  },

  created() {
    if (!this.masterStore.gold.length) this.masterStore.fetchGold()
    if (!this.masterStore.gem.length) this.masterStore.fetchGem()
    if (!this.masterStore.diamondGrade.length) this.masterStore.fetchDiamondGrade()
  },

  methods: {
    addItem() {
      this.$emit('update:modelValue', [
        ...this.modelValue,
        { type: '', typeCode: '', size: '', region: '', qty: 1, qtyUnit: 'pc', weight: 0, weightUnit: 'ct.', price: 0 }
      ])
    },

    removeItem(index) {
      const updated = [...this.modelValue]
      updated.splice(index, 1)
      this.$emit('update:modelValue', updated)
    }
  }
}
</script>

<style lang="scss" scoped>
.materials-editor {
  display: flex;
  flex-direction: column;
  gap: var(--sp-sm);
}

.text-muted {
  color: var(--base-sub-color);
}
</style>
