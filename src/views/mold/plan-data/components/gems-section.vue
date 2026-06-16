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
          v-model:editingRows="editingRows"
          :value="gems"
          :editMode="!isMelted ? 'row' : ''"
          dataKey="id"
          @row-edit-save="onRowEditSave"
          :pt="{
            table: { style: 'min-width: 50rem' },
            column: {
              bodycell: ({ state }) => ({
                style: state['d_editing'] && 'padding-top: 0.6rem; padding-bottom: 0.6rem'
              })
            }
          }"
        >
          <!-- eslint-disable-next-line no-restricted-imports -->
          <Column
            v-if="!isMelted"
            :rowEditor="true"
            style="width: 100px"
            bodyStyle="text-align:center"
          />
          <!-- eslint-disable-next-line no-restricted-imports -->
          <Column v-if="!isMelted" style="width: 60px">
            <template #body="prop">
              <div class="btn btn-red text-center w-100" @click="onDelGems(prop.data)">
                <i class="bi bi-trash-fill"></i>
              </div>
            </template>
          </Column>

          <!-- eslint-disable-next-line no-restricted-imports -->
          <Column :field="'gem'" :header="$t('view.mold.gems.colGem')" style="min-width: 150px">
            <template #body="slotProps">
              <span>{{ slotProps.data.gem?.description }}</span>
            </template>
            <template #editor="{ data, field }">
              <!-- eslint-disable-next-line no-restricted-imports -->
              <Dropdown
                v-model="data[field]"
                :options="masterGem"
                optionLabel="description"
                class="w-full md:w-14rem"
                :placeholder="$t('view.mold.gems.selectGem')"
                :showClear="data[field] ? true : false"
              />
            </template>
          </Column>
          <!-- eslint-disable-next-line no-restricted-imports -->
          <Column :field="'gemShape'" :header="$t('view.mold.gems.colGemShape')" style="min-width: 150px">
            <template #body="slotProps">
              <span>{{ slotProps.data.gemShape?.description }}</span>
            </template>
            <template #editor="{ data, field }">
              <!-- eslint-disable-next-line no-restricted-imports -->
              <Dropdown
                v-model="data[field]"
                :options="masterGemShape"
                optionLabel="description"
                class="w-full md:w-14rem"
                :placeholder="$t('view.mold.gems.selectShape')"
                :showClear="data[field] ? true : false"
              />
            </template>
          </Column>
          <!-- eslint-disable-next-line no-restricted-imports -->
          <Column :field="'size'" :header="$t('view.mold.gems.colSize')" style="width: 200px">
            <template #editor="{ data, field }">
              <input
                type="text"
                min="1"
                :class="data[field] ? `` : `bg-warning`"
                class="form-control"
                v-model="data[field]"
              />
            </template>
          </Column>
          <!-- eslint-disable-next-line no-restricted-imports -->
          <Column :field="'qty'" :header="$t('common.field.quantity')" style="width: 200px">
            <template #editor="{ data, field }">
              <input
                type="number"
                min="1"
                :class="data[field] ? `` : `bg-warning`"
                class="form-control"
                v-model="data[field]"
              />
            </template>
          </Column>
          <template #footer>
            <div class="d-flex justify-content-between">
              <div>{{ $t('view.mold.gems.totalItems', { count: gems.length }) }}</div>
              <div
                v-if="!isMelted"
                class="btn btn-sm btn-main"
                @click="onAddGems"
              >
                <span class="text-center">
                  <i class="bi bi-plus"></i>
                </span>
              </div>
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
// eslint-disable-next-line no-restricted-imports
import Dropdown from 'primevue/dropdown'

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
    Dropdown
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
      editingRows: [],
      autoId: 0
    }
  },

  computed: {
    isMelted() {
      return this.planStatus === 500
    }
  },

  methods: {
    onRowEditSave(event) {
      const { newData, index } = event
      const updatedGems = [...this.gems]
      updatedGems[index] = newData
      this.$emit('update:gems', updatedGems)
    },

    onDelGems(item) {
      const updatedGems = [...this.gems]
      const index = updatedGems.indexOf(item)
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
