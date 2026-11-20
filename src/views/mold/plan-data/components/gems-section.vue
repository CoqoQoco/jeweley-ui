<template>
  <div class="mt-2 mb-2">
    <form @submit.prevent="onUpdateGems">
      <div class="title-text-lg-header">
        <div class="d-flex justify-content-between">
          <span>{{ $t('view.mold.gems.sectionTitle') }}</span>
          <button
            v-if="!isMelted"
            class="btn btn-sm"
            :class="[gems.length ? 'btn-main' : 'btn-dark']"
            :disabled="!gems.length"
            type="submit"
          >
            <span><i class="bi bi-gem mr-2"></i></span>
            <span>{{ $t('view.mold.gems.btnEdit') }}</span>
          </button>
        </div>
      </div>
      <div>
        <!-- eslint-disable-next-line no-restricted-imports -->
        <DataTable
          class="p-datatable-sm"
          showGridlines
          :value="gems"
          dataKey="id"
          :pt="{ table: { style: 'min-width: 50rem' } }"
        >
          <Column v-if="!isMelted" style="width: 60px">
            <template #body="{ data }">
              <ButtonGeneric
                variant="red"
                type="button"
                icon="bi-trash-fill"
                class="w-100"
                :title="$t('common.btn.delete')"
                @click="onDelGems(data)"
              />
            </template>
          </Column>

          <Column :field="'gem'" :header="$t('view.mold.gems.colGem')" style="min-width: 150px">
            <template #body="{ data }">
              <DropdownGeneric
                :modelValue="data.gem"
                :options="masterGem"
                optionLabel="description"
                :placeholder="$t('view.mold.gems.selectGem')"
                :ariaLabel="$t('view.mold.gems.colGem')"
                :showClear="data.gem && !isMelted ? true : false"
                :disabled="isMelted"
                @update:modelValue="onFieldUpdate(data, 'gem', $event)"
              />
            </template>
          </Column>
          <Column :field="'gemShape'" :header="$t('view.mold.gems.colGemShape')" style="min-width: 150px">
            <template #body="{ data }">
              <DropdownGeneric
                :modelValue="data.gemShape"
                :options="masterGemShape"
                optionLabel="description"
                :placeholder="$t('view.mold.gems.selectShape')"
                :ariaLabel="$t('view.mold.gems.colGemShape')"
                :showClear="data.gemShape && !isMelted ? true : false"
                :disabled="isMelted"
                @update:modelValue="onFieldUpdate(data, 'gemShape', $event)"
              />
            </template>
          </Column>
          <Column :field="'size'" :header="$t('view.mold.gems.colSize')" style="width: 200px">
            <template #body="{ data }">
              <InputTextGeneric
                type="text"
                :modelValue="data.size"
                :aria-label="$t('view.mold.gems.colSize')"
                :class="{ 'cell-readonly': isMelted }"
                :disabled="isMelted"
                @update:modelValue="onFieldUpdate(data, 'size', $event)"
              />
            </template>
          </Column>
          <Column :field="'qty'" :header="$t('common.field.quantity')" style="width: 200px">
            <template #body="{ data }">
              <InputTextGeneric
                type="number"
                min="1"
                :modelValue="data.qty"
                :aria-label="$t('common.field.quantity')"
                :class="{ 'cell-readonly': isMelted }"
                :disabled="isMelted"
                @update:modelValue="onFieldUpdate(data, 'qty', toNum($event))"
              />
            </template>
          </Column>
          <template #footer>
            <div class="d-flex justify-content-between">
              <div>{{ $t('view.mold.gems.totalItems', { count: gems.length }) }}</div>
              <ButtonGeneric
                v-if="!isMelted"
                variant="main"
                type="button"
                icon="bi-plus"
                :title="$t('common.btn.add')"
                @click="onAddGems"
              />
            </div>
          </template>
        </DataTable>
      </div>
    </form>
  </div>
</template>

<script>
import { useMoldPlanStore } from '@/stores/modules/api/mold/mold-plan-store.js'
import { confirmSubmit, warning } from '@/services/alert/sweetAlerts.js'
// eslint-disable-next-line no-restricted-imports
import DataTable from 'primevue/datatable'
// eslint-disable-next-line no-restricted-imports
import Column from 'primevue/column'

import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'

const interfaceGem = {
  gem: null,
  gemShape: null,
  size: null,
  qty: null
}

export default {
  name: 'GemsSection',

  components: {
    DataTable,
    Column,
    DropdownGeneric,
    ButtonGeneric,
    InputTextGeneric
  },

  props: {
    planId: {
      type: Number,
      required: true
    },
    planStatus: {
      type: Number,
      default: 0
    },
    gems: {
      type: Array,
      default: () => []
    },
    masterGem: {
      type: Array,
      default: () => []
    },
    masterGemShape: {
      type: Array,
      default: () => []
    }
  },

  emits: ['update:gems', 'updated'],

  setup() {
    return {
      store: useMoldPlanStore()
    }
  },

  data() {
    return {
      autoId: 0
    }
  },

  computed: {
    isMelted() {
      return this.planStatus === 500
    }
  },

  methods: {
    findRowIndex(item) {
      const byRef = this.gems.indexOf(item)
      if (byRef >= 0) return byRef
      return item?.id != null ? this.gems.findIndex((x) => x.id === item.id) : -1
    },

    toNum(value) {
      return value === '' ? value : Number(value)
    },

    onFieldUpdate(item, field, value) {
      if (this.isMelted) return
      const index = this.findRowIndex(item)
      if (index < 0) return
      const updatedGems = [...this.gems]
      updatedGems[index] = { ...updatedGems[index], [field]: value }
      this.$emit('update:gems', updatedGems)
    },

    onDelGems(item) {
      const index = this.findRowIndex(item)
      if (index < 0) return
      const updatedGems = [...this.gems]
      updatedGems.splice(index, 1)
      this.$emit('update:gems', updatedGems)
    },

    onAddGems() {
      const addGem = {
        id: --this.autoId,
        ...interfaceGem
      }
      const updatedGems = [...this.gems, addGem]
      this.$emit('update:gems', updatedGems)
    },

    onUpdateGems() {
      const updateGems = {
        id: this.planId,
        gems: this.gems
          .filter((item) => item.gem?.code && item.gemShape?.code)
          .map((item) => ({
            gemCode: item.gem.code,
            gemShapeCode: item.gemShape.code,
            size: item.size,
            qty: item.qty
          }))
      }

      if (updateGems.gems?.length) {
        confirmSubmit(
          this.$t('view.mold.gems.confirmMsg'),
          this.$t('view.mold.gems.confirmTitle'),
          async () => {
            const res = await this.store.updateGems(updateGems)
            if (res !== undefined) {
              this.$emit('updated')
            }
          }
        )
      } else {
        warning(this.$t('view.mold.gems.warningMsg'))
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
