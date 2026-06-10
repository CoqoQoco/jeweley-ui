<template>
  <div class="mt-2 mb-2">
    <form @submit.prevent="onUpdateGems">
      <div class="title-text-lg-header">
        <div class="d-flex justify-content-between">
          <span>ส่วนประกอบเพชร/พลอย</span>
          <button
            v-if="!isMelted"
            class="btn btn-sm"
            :class="[gems.length ? 'btn-outline-warning' : 'btn-secondary']"
            :disabled="!gems.length"
            type="submit"
          >
            <span><i class="bi bi-gem mr-2"></i></span>
            <span>แก้ไขเพชร/พลอย</span>
          </button>
        </div>
      </div>
      <div>
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
          <Column
            v-if="!isMelted"
            :rowEditor="true"
            style="width: 100px"
            bodyStyle="text-align:center"
          />
          <Column v-if="!isMelted" style="width: 60px">
            <template #body="prop">
              <div class="btn btn-danger text-center w-100" @click="onDelGems(prop.data)">
                <i class="bi bi-trash-fill"></i>
              </div>
            </template>
          </Column>

          <Column field="gem" header="ประเภทเพชร/พลอย" style="min-width: 150px">
            <template #body="slotProps">
              <span>{{ slotProps.data.gem?.description }}</span>
            </template>
            <template #editor="{ data, field }">
              <Dropdown
                v-model="data[field]"
                :options="masterGem"
                optionLabel="description"
                class="w-full md:w-14rem"
                placeholder="เลือกพลอย"
                :showClear="data[field] ? true : false"
              />
            </template>
          </Column>
          <Column field="gemShape" header="รูปร่างพลอย" style="min-width: 150px">
            <template #body="slotProps">
              <span>{{ slotProps.data.gemShape?.description }}</span>
            </template>
            <template #editor="{ data, field }">
              <Dropdown
                v-model="data[field]"
                :options="masterGemShape"
                optionLabel="description"
                class="w-full md:w-14rem"
                placeholder="เลือกรูปร่าง"
                :showClear="data[field] ? true : false"
              />
            </template>
          </Column>
          <Column field="size" header="ขนาด" style="width: 200px">
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
          <Column field="qty" header="จำนวน" style="width: 200px">
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
              <div>ทั้งหมด {{ gems.length }} รายการ</div>
              <div
                v-if="!isMelted"
                class="btn btn-sm btn-warning"
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
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
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
        confirmSubmit('แก้ไขข้อมูลเพชร/พลอย', 'คุณต้องการแก้ไขข้อมูลใช่หรือไม่', async () => {
          const res = await this.store.updateGems(updateGems)
          if (res !== undefined) {
            this.$emit('updated')
          }
        })
      } else {
        warning('กรุณากรอกข้อมูลให้ครบถ้วน')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
