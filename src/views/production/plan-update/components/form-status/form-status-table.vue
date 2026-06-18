<template>
  <div class="form-content-row-grid-container">
    <!-- Gold Table -->
    <!-- eslint-disable-next-line no-restricted-imports -->
    <DataTable
      class="p-datatable-sm"
      showGridlines
      v-model:editingRows="localEditingRows"
      :value="mat"
      editMode="row"
      dataKey="id"
      :scrollable="tableType === 1"
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
      <!-- Delete column -->
      <Column style="width: 20px">
        <template #body="prop">
          <div
            class="btn btn-sm btn-red text-center w-100"
            @click="$emit('del-gold', prop.data)"
          >
            <i class="bi bi-trash-fill"></i>
          </div>
        </template>
      </Column>

      <!-- Gold dropdown -->
      <Column field="gold" header="ทอง" :style="tableType === 1 ? 'width: 100px' : ''">
        <template #editor="{ data, field }">
          <DropdownGeneric
            v-model="data[field]"
            :options="masterGold"
            optionLabel="code"
            optionValue="code"
            class="w-full md:w-14rem"
            placeholder="เลือกทอง"
          />
        </template>
      </Column>

      <!-- Request Date -->
      <Column field="requestDate" header="วันที่" :style="tableType === 1 ? 'min-width: 120px' : ''">
        <template #editor="{ data, field }">
          <div>
            <CalendarGeneric
              class="w-100"
              v-model="data[field]"
              dateFormat="dd/mm/yy"
              :showIcon="true"
              :showButtonBar="true"
            />
          </div>
        </template>
        <template #body="slotProps">
          <div v-if="slotProps.data.requestDate">
            {{ formatDate(slotProps.data.requestDate) }}
          </div>
        </template>
      </Column>

      <!-- QTY Send — tableType 1 only -->
      <Column v-if="tableType === 1" field="goldQTYSend" header="จำนวนจ่าย" style="width: 100px">
        <template #editor="{ data, field }">
          <InputTextGeneric
            type="number"
            :class="data[field] ? '' : 'bg-warning'"
            v-model="data[field]"
          />
        </template>
      </Column>

      <!-- Weight Send — tableType 1 only -->
      <Column v-if="tableType === 1" field="goldWeightSend" header="น้ำหนักจ่าย" style="width: 100px">
        <template #editor="{ data, field }">
          <InputTextGeneric
            type="number"
            step="any"
            :class="data[field] ? '' : 'bg-warning'"
            v-model="data[field]"
          />
        </template>
      </Column>

      <!-- QTY Check -->
      <Column
        field="goldQTYCheck"
        :header="tableType === 1 ? 'จำนวนรับ' : 'จำนวน'"
        :style="tableType === 1 ? 'width: 100px' : ''"
      >
        <template #editor="{ data, field }">
          <InputTextGeneric
            type="number"
            :class="data[field] ? '' : 'bg-warning'"
            v-model="data[field]"
            @change="tableType === 1 ? $emit('cal-total-wages', data) : undefined"
          />
        </template>
      </Column>

      <!-- Wages per unit — tableType 1 only -->
      <Column v-if="tableType === 1" field="wages" header="ค่าเเรงต่อชิ้น" style="min-width: 100px">
        <template #editor="{ data, field }">
          <InputTextGeneric
            type="number"
            min="1"
            step="any"
            v-model="data[field]"
            :disabled="!data.goldQTYCheck"
            @change="$emit('cal-total-wages', data)"
          />
        </template>
      </Column>

      <!-- Weight Check -->
      <Column
        field="goldWeightCheck"
        :header="tableType === 1 ? 'น้ำหนักรับ' : 'น้ำหนัก'"
        :style="tableType === 1 ? 'width: 100px' : ''"
      >
        <template #editor="{ data, field }">
          <InputTextGeneric
            type="number"
            step="any"
            :class="data[field] ? '' : 'bg-warning'"
            v-model="data[field]"
          />
        </template>
      </Column>

      <!-- Description — tableType 1 only -->
      <Column v-if="tableType === 1" field="description" header="รายละเอียด" style="width: 150px">
        <template #editor="{ data, field }">
          <InputTextGeneric
            type="text"
            :class="data[field] ? '' : 'bg-warning'"
            v-model="data[field]"
          />
        </template>
      </Column>

      <!-- Workers — tableType 1 and 2 -->
      <Column
        v-if="tableType === 1 || tableType === 2"
        field="workers"
        :header="workerColumnHeader"
        style="min-width: 150px"
      >
        <template #editor="{ data, field }">
          <AutoCompleteGeneric
            v-model="data[field]"
            :suggestions="workerItemSearch"
            @complete="$emit('search-worker', $event)"
            placeholder="กรอกรหัส/ชื่อช่าง...."
            :class="data[field] ? '' : 'bg-warning'"
            optionLabel="code"
            :forceSelection="true"
          >
            <template #option="slotProps">
              <div class="flex align-options-center">
                <div>{{ `${slotProps.option.code} - ${slotProps.option.nameTh}` }}</div>
              </div>
            </template>
          </AutoCompleteGeneric>
        </template>
        <template #body="slotProps">
          <div v-if="slotProps.data.workers">
            {{ `${slotProps.data.workers.code} - ${slotProps.data.workers.nameTh}` }}
          </div>
        </template>
      </Column>

      <!-- Workers Sub (ช่างชุบ) — tableType 1 only, status 90 -->
      <Column
        v-if="tableType === 1 && status === 90"
        field="workersSub"
        header="ช่างชุบ"
        style="min-width: 150px"
      >
        <template #editor="{ data, field }">
          <AutoCompleteGeneric
            v-model="data[field]"
            :suggestions="workerItemSearch"
            @complete="$emit('search-worker', $event)"
            placeholder="กรอกรหัส/ชื่อช่าง...."
            :class="data[field] ? '' : 'bg-warning'"
            optionLabel="code"
            :forceSelection="true"
          >
            <template #option="slotProps">
              <div class="flex align-options-center">
                <div>{{ `${slotProps.option.code} - ${slotProps.option.nameTh}` }}</div>
              </div>
            </template>
          </AutoCompleteGeneric>
        </template>
        <template #body="slotProps">
          <div v-if="slotProps.data.workersSub">
            {{ `${slotProps.data.workersSub.code} - ${slotProps.data.workersSub.nameTh}` }}
          </div>
        </template>
      </Column>

      <!-- Workers Sub (ช่างคัดเพชร) — tableType 2 only -->
      <Column
        v-if="tableType === 2"
        field="workersSub"
        header="ช่างคัดเพชร"
        style="min-width: 150px"
      >
        <template #editor="{ data, field }">
          <AutoCompleteGeneric
            v-model="data[field]"
            :suggestions="workerItemSearch"
            @complete="$emit('search-worker', $event)"
            placeholder="กรอกรหัส/ชื่อช่าง...."
            :class="data[field] ? '' : 'bg-warning'"
            optionLabel="code"
            :forceSelection="true"
          >
            <template #option="slotProps">
              <div class="flex align-options-center">
                <div>{{ `${slotProps.option.code} - ${slotProps.option.nameTh}` }}</div>
              </div>
            </template>
          </AutoCompleteGeneric>
        </template>
        <template #body="slotProps">
          <div v-if="slotProps.data.workersSub">
            {{ `${slotProps.data.workersSub.code} - ${slotProps.data.workersSub.nameTh}` }}
          </div>
        </template>
      </Column>

      <!-- Total Wages — tableType 1 only -->
      <Column v-if="tableType === 1" field="totalWages" header="รวมค่าแรงช่าง" style="width: 120px">
        <template #editor="{ data, field }">
          <InputTextGeneric
            type="number"
            min="1"
            step="any"
            v-model="data[field]"
            :disabled="true"
          />
        </template>
      </Column>

      <!-- Row editor -->
      <Column
        :rowEditor="true"
        :style="tableType === 1 ? 'width: 10%; min-width: 7rem' : 'width: 10%; min-width: 8rem'"
        bodyStyle="text-align:center"
      />

      <template #footer>
        <div class="d-flex justify-content-between">
          <div>ทั้งหมด {{ mat.length }} รายการ</div>
          <div @click="$emit('add-mat')">
            <i class="bi bi-plus-square-fill"></i>
          </div>
        </div>
      </template>
    </DataTable>
  </div>
</template>

<script>
// eslint-disable-next-line no-restricted-imports
import DataTable from 'primevue/datatable'
// eslint-disable-next-line no-restricted-imports
import Column from 'primevue/column'

import { formatDate } from '@/services/utils/dayjs'

import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'
import AutoCompleteGeneric from '@/components/prime-vue/AutoCompleteGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'

export default {
  name: 'FormStatusTable',

  components: {
    DataTable,
    Column,
    DropdownGeneric,
    CalendarGeneric,
    AutoCompleteGeneric,
    InputTextGeneric
  },

  props: {
    mat: {
      type: Array,
      required: true,
      default: () => []
    },
    editingRows: {
      type: Array,
      required: true,
      default: () => []
    },
    masterGold: {
      type: Array,
      required: true,
      default: () => []
    },
    workerItemSearch: {
      type: Array,
      default: () => []
    },
    /**
     * tableType controls which columns are visible:
     *   1 = showType 1 (จ่ายงาน: full columns with wages, workers, workersSub for status 90)
     *   2 = showType 2 (คัดพลอย: gold+date+qty+weight+workers+workersSub)
     *   4 = showType 4 (หล่องาน: gold+date+qty+weight only)
     */
    tableType: {
      type: Number,
      default: 1
    },
    status: {
      type: Number,
      default: null
    }
  },

  emits: ['update:editingRows', 'row-edit-save', 'del-gold', 'add-mat', 'cal-total-wages', 'search-worker'],

  computed: {
    localEditingRows: {
      get() {
        return this.editingRows
      },
      set(val) {
        this.$emit('update:editingRows', val)
      }
    },
    workerColumnHeader() {
      if (this.tableType === 2) return 'ช่างคัดพลอ'
      return this.status === 90 ? 'ช่างขัด' : 'ช่างรับงาน'
    }
  },

  methods: {
    formatDate(date) {
      return date ? formatDate(date) : ''
    },
    onRowEditSave(event) {
      this.$emit('row-edit-save', event)
    }
  }
}
</script>
