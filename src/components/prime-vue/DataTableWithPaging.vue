<template>
  <div class="base-datatable">
    <!-- Toolbar gear: สำหรับตารางที่ไม่มี paginator -->
    <div v-if="showColumnSettings && !paginator" class="table-settings-toolbar">
      <div class="col-settings-btn-wrapper">
        <button class="col-settings-btn" @click.stop="isSettingsOpen = !isSettingsOpen" title="ตั้งค่าคอลัมน์">
          <i class="bi bi-gear-fill"></i>
        </button>
        <div v-if="isSettingsOpen" class="col-settings-panel col-settings-panel--down">
          <div class="col-settings-header">
            <i class="bi bi-gear-fill"></i> ตั้งค่าคอลัมน์
          </div>
          <div class="col-settings-list">
            <div v-for="col in columns" :key="col.field" class="col-settings-item">
              <span class="col-settings-name">{{ col.header || col.field }}</span>
              <div class="col-settings-freeze-btns">
                <button
                  :class="['freeze-btn', { active: isFreezeBtnActive(col, 'left') }]"
                  @click="toggleFreeze(col.field, 'left')"
                  title="ปักหมุดซ้าย"
                ><i class="bi bi-pin-angle-fill"></i> ซ้าย</button>
                <button
                  :class="['freeze-btn', { active: isFreezeBtnActive(col, 'right') }]"
                  @click="toggleFreeze(col.field, 'right')"
                  title="ปักหมุดขวา"
                ><i class="bi bi-pin-angle-fill"></i> ขวา</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <DataTable
      :value="items"
      :selection="itemsSelection"
      @update:selection="$emit('update:itemsSelection', $event)"
      v-model:expandedRows="expandedRows"
      :dataKey="dataKey"
      class="p-datatable-sm"
      scrollable
      :scrollHeight="scrollHeight"
      columnResizeMode="expand"
      resizableColumns
      :paginator="paginator"
      @page="handlePageChange"
      :lazy="true"
      sortMode="multiple"
      @sort="handleSortChange"
      stripedRows
      :showGridlines="showGridlines"
      removableSort
      :rows="perPage"
      :rowsPerPageOptions="rowsPerPageOptions"
      :totalRecords="totalRecords"
      :paginatorTemplate="paginatorTemplate"
      :currentPageReportTemplate="computedPageReport"
      :reorderableColumns="reorderableColumns"
      v-model:multiSortMeta="internalSortMeta"
      @column-reorder="$emit('column-reorder', $event)"
      v-bind="$attrs"
    >
      <!-- Expander Column -->
      <Column v-if="expandable" :expander="true" headerStyle="width: 50px" />

      <!-- Expanded Row Template -->
      <template #expansion="slotProps">
        <slot name="expansion" v-bind="slotProps">
          <div class="expanded-row-content">
            {{ slotProps.data }}
          </div>
        </slot>
      </template>

      <!-- select template -->
      <!-- <Column v-if="selectionMode" selectionMode="multiple" headerStyle="width: 50px"></Column> -->

      <!-- <Column v-if="selectionMode" selectionMode="null" headerStyle="width: 50px">
        <template #body="slotProps">
          <div class="flex align-items-center justify-content-center">
            <Checkbox
              :modelValue="isSelected(slotProps.data)"
              :disabled="isDisabled(slotProps.data)"
              @change="onSelectionChange($event, slotProps.data)"
              :binary="true"
              :class="{ 'selected-row': isSelected(slotProps.data) }"
              :data-pre-selected="isPreSelected(slotProps.data)"
            />
          </div>
        </template>


        <template #header>
          <div class="flex align-items-center justify-content-center">
            <Checkbox
              :modelValue="isAllSelected"
              :disabled="false"
              @update:modelValue="onSelectAllChange"
              :binary="true"
            />
          </div>
        </template>
      </Column> -->

      <Column v-if="selectionMode" selectionMode="null" headerStyle="width: 50px">
        <template #body="slotProps">
          <div class="flex align-items-center justify-content-center">
            <template v-if="selectionType === 'single'">
              <RadioButton
                :modelValue="isSelectedSingle(slotProps.data)"
                :disabled="isDisabled(slotProps.data)"
                @change="onSingleSelectionChange($event, slotProps.data)"
                :binary="true"
                :class="{ 'selected-row': isSelectedSingle(slotProps.data) }"
                name="selection-group"
              />
            </template>
            <template v-else>
              <Checkbox
                :modelValue="isSelected(slotProps.data)"
                :disabled="isDisabled(slotProps.data)"
                @change="onSelectionChange($event, slotProps.data)"
                :binary="true"
                :class="{ 'selected-row': isSelected(slotProps.data) }"
                :data-pre-selected="isPreSelected(slotProps.data)"
              />
            </template>
          </div>
        </template>

        <!-- เพิ่ม header template เพื่อจัดการ check all (เฉพาะ multiple mode) -->
        <template #header v-if="selectionType === 'multiple'">
          <div class="flex align-items-center justify-content-center" style="width: 10px !important">
            <Checkbox
              :modelValue="isAllSelected"
              :disabled="false"
              @update:modelValue="onSelectAllChange"
              :binary="true"
            />
          </div>
        </template>
      </Column>

      <!-- Dynamic Columns -->
      <template v-for="col in computedColumns" :key="col.field">
        <Column
          v-bind="col"
          :sortable="col.sortable !== false"
          :style="{
            'min-width': col.minWidth,
            width: col.width || 'auto',
            backgroundColor: col.backgroundColor || 'transparent'
          }"
          :alignHeader="col.align || 'left'"
          :bodyStyle="{ textAlign: col.align || 'left' }"
          :class="col.className"
        >
          <template #header v-if="$slots[`header-${col.field}`] || col.frozen">
            <slot :name="`header-${col.field}`">
              <span v-if="col.frozen" class="frozen-icon-wrapper">
                <i class="bi bi-pin-angle-fill"></i>
              </span>
            </slot>
          </template>

          <template #body="slotProps">
            <slot
              :name="`${col.field}Template`"
              v-bind="slotProps"
              v-if="$slots[`${col.field}Template`]"
            >
            </slot>
            <template v-else>
              <div :style="{ textAlign: col.align || 'left' }">
                <div v-if="col.format">
                  {{ formatValue(slotProps.data[col.field], col.format) }}
                </div>
                <div v-else>
                  {{ slotProps.data[col.field] }}
                </div>
              </div>
            </template>
          </template>
        </Column>
      </template>

      <!-- เพิ่ม empty template -->
      <template #empty>
        <slot name="empty">
          <div class="empty-message">
            <i class="bi bi-inbox text-muted"></i>
            <p>{{ computedEmptyMessage }}</p>
          </div>
        </slot>
      </template>

      <!-- Custom Paginator Templates -->
      <template #paginatorstart>
        <slot name="paginatorstart"></slot>
      </template>

      <template #paginatorend>
        <div class="paginator-end-content">
          <slot name="paginator-buttons"></slot>
          <div v-if="showColumnSettings && paginator" class="col-settings-btn-wrapper">
            <button class="col-settings-btn" @click.stop="isSettingsOpen = !isSettingsOpen" title="ตั้งค่าคอลัมน์">
              <i class="bi bi-gear-fill"></i>
            </button>
            <div v-if="isSettingsOpen" class="col-settings-panel">
              <div class="col-settings-header">
                <i class="bi bi-gear-fill"></i> ตั้งค่าคอลัมน์
              </div>
              <div class="col-settings-list">
                <div v-for="col in columns" :key="col.field" class="col-settings-item">
                  <span class="col-settings-name">{{ col.header || col.field }}</span>
                  <div class="col-settings-freeze-btns">
                    <button
                      :class="['freeze-btn', { active: isFreezeBtnActive(col, 'left') }]"
                      @click="toggleFreeze(col.field, 'left')"
                      title="ปักหมุดซ้าย"
                    ><i class="bi bi-pin-angle-fill"></i> ซ้าย</button>
                    <button
                      :class="['freeze-btn', { active: isFreezeBtnActive(col, 'right') }]"
                      @click="toggleFreeze(col.field, 'right')"
                      title="ปักหมุดขวา"
                    ><i class="bi bi-pin-angle-fill"></i> ขวา</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Footer Group (for ColumnGroup type="footer") -->
      <slot name="footerGroup" />

      <!-- Footer -->
      <template #footer v-if="$slots.footer">
        <slot name="footer" />
      </template>
    </DataTable>
  </div>
</template>

<script>
import Checkbox from 'primevue/checkbox'
import RadioButton from 'primevue/radiobutton'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { formatDate, formatDateTime } from '@/services/utils/dayjs'

export default {
  name: 'BaseDataTable',

  components: {
    DataTable,
    Column,
    Checkbox,
    RadioButton
  },

  props: {
    items: {
      type: Array,
      default: () => []
    },
    itemsSelection: {
      type: Array,
      default: () => []
    },
    totalRecords: {
      type: Number,
      default: 0
    },
    selectionMode: {
      type: Boolean,
      default: false
    },
    selectionType: {
      type: String,
      default: 'multiple',
      validator: (value) => ['single', 'multiple'].includes(value)
    },
    columns: {
      type: Array,
      required: true
    },
    dataKey: {
      type: String,
      default: 'id'
    },
    showGridlines: {
      type: Boolean,
      default: true
    },
    perPage: {
      type: Number,
      default: 10
    },
    rowsPerPageOptions: {
      type: Array,
      default: () => [10, 20, 50, 100]
    },
    scrollHeight: {
      type: String,
      default: 'calc(100vh - 360px)'
    },
    showActions: {
      type: Boolean,
      default: true
    },
    showViewButton: {
      type: Boolean,
      default: true
    },
    paginator: {
      type: Boolean,
      default: true
    },
    paginatorTemplate: {
      type: String,
      default:
        'paginatorstart FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport paginatorend'
    },
    currentPageReportTemplate: {
      type: String,
      default: null
    },
    emptyMessage: {
      type: String,
      default: null
    },
    // ถ้าต้องการให้ parent component ควบคุม expanded rows
    modelValue: {
      type: Array,
      default: () => []
    },
    expandable: {
      type: Boolean,
      default: false
    },
    disabledItems: {
      type: Array,
      default: () => []
    },
    preSelectedItems: {
      // สำหรับ items ที่ต้องการให้ติ๊กถูกไว้
      type: Array,
      default: () => []
    },
    reorderableColumns: {
      type: Boolean,
      default: false
    },
    showColumnSettings: {
      type: Boolean,
      default: false
    },
    defaultSortMeta: {
      type: Array,
      default: () => []
      // Format: [{ field: 'createDate', order: -1 }]  order: 1=ASC, -1=DESC
    }
  },

  emits: [
    'page',
    'sort',
    'update:itemsSelection',
    'update:modelValue', // สำหรับ v-model ของ expanded rows
    'row-expand', // เมื่อ row ถูก expand
    'row-collapse', // เมื่อ row ถูก collapse
    'column-reorder'
  ],

  computed: {
    computedColumns() {
      if (!this.showColumnSettings) return this.columns
      return this.columns.map(col => {
        const override = this.localFrozenMap[col.field]
        if (override === undefined) {
          return col
        } else if (override === null) {
          return { ...col, frozen: false, alignFrozen: undefined }
        } else {
          return { ...col, frozen: true, alignFrozen: override }
        }
      })
    },

    computedEmptyMessage() {
      return this.emptyMessage !== null ? this.emptyMessage : this.$t('common.label.noData')
    },

    computedPageReport() {
      if (this.currentPageReportTemplate !== null) return this.currentPageReportTemplate
      return `${this.$t('common.table.showing')} {first} - {last} ${this.$t('common.table.of')} {totalRecords} ${this.$t('common.table.entries')}`
    },

    isAllSelected() {
      if (this.items.length === 0) return false

      // Count only selectable items (non-preselected and non-disabled)
      const selectableItems = this.items.filter((item) => {
        const isPreSelected = this.preSelectedItems.some(
          (preSelected) => preSelected[this.dataKey] === item[this.dataKey]
        )
        const isDisabled = this.isDisabled(item)
        return !isPreSelected && !isDisabled
      })

      // Check if all selectable items are selected
      return (
        selectableItems.length > 0 &&
        selectableItems.every((item) =>
          this.itemsSelection.some((selected) => selected[this.dataKey] === item[this.dataKey])
        )
      )
    }
  },

  watch: {
    // ถ้าต้องการให้ parent component ควบคุม expanded rows
    modelValue: {
      handler(newVal) {
        this.expandedRows = newVal
      },
      deep: true
    },

    expandedRows: {
      handler(newVal) {
        this.$emit('update:modelValue', newVal)
      },
      deep: true
    }
  },

  data() {
    return {
      expandedRows: [],
      isSettingsOpen: false,
      localFrozenMap: {},
      internalSortMeta: []
    }
  },

  methods: {
    handlePageChange(event) {
      this.$emit('page', {
        first: event.first,
        rows: event.rows
      })
    },

    handleSortChange(event) {
      this.$emit('sort', {
        first: event.first,
        rows: event.rows,
        multiSortMeta: event.multiSortMeta
      })
    },

    formatValue(value, format) {
      if (!value && value !== 0) return '-'

      switch (format) {
        case 'date':
          return value ? formatDate(value) : '-'
        case 'datetime':
          return value ? formatDateTime(value) : '-'
        case 'currency':
          return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB'
          }).format(value)
        case 'number':
          return new Intl.NumberFormat('th-TH').format(value)
        case 'decimal3':
          return new Intl.NumberFormat('th-TH', {
            minimumFractionDigits: 3,
            maximumFractionDigits: 3
          }).format(value)
        case 'decimal2':
          return new Intl.NumberFormat('th-TH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }).format(value)
        case 'decimal1':
          return new Intl.NumberFormat('th-TH', {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
          }).format(value)
        default:
          if (typeof format === 'string' && format.startsWith('decimal')) {
            const places = parseInt(format.replace('decimal', ''))
            if (!isNaN(places)) {
              return new Intl.NumberFormat('th-TH', {
                minimumFractionDigits: places,
                maximumFractionDigits: places
              }).format(value)
            }
          }
          return value
      }
    },

    // เช็คว่า item นั้นถูกเลือกหรือไม่
    isSelected(item) {
      return (
        this.itemsSelection.some((selected) => selected[this.dataKey] === item[this.dataKey]) ||
        this.preSelectedItems.some(
          (preSelected) => preSelected[this.dataKey] === item[this.dataKey]
        )
      )
    },

    // เช็คว่า item นั้นถูก disable หรือไม่
    isDisabled(item) {
      return this.disabledItems.some((disabled) => disabled[this.dataKey] === item[this.dataKey])
    },

    // จัดการการเปลี่ยนแปลงการเลือก
    onSelectAllChange(value) {
      // เปลี่ยนชื่อ parameter ให้ชัดเจนขึ้น
      //console.log('select all value:', value) // debug
      let newSelection = [...this.itemsSelection]

      if (value) {
        // Check all
        this.items.forEach((item) => {
          if (this.isPreSelected(item) || this.isDisabled(item)) return

          const exists = newSelection.some(
            (selected) => selected[this.dataKey] === item[this.dataKey]
          )
          if (!exists) {
            newSelection.push(item)
          }
        })
      } else {
        // Uncheck all - เก็บแค่ preSelected items
        //newSelection = [...this.preSelectedItems] // ทำ shallow copy
        newSelection = []
      }

      this.$emit('update:itemsSelection', newSelection)
    },

    // helper method
    isPreSelected(item) {
      return this.preSelectedItems.some(
        (preSelected) => preSelected[this.dataKey] === item[this.dataKey]
      )
    },

    onSelectionChange(checked, item) {
      //console.log('checked', checked, 'item', item)

      if (this.isDisabled(item)) return

      // เพิ่มเช็คว่าอยู่ใน preSelectedItems หรือไม่
      const isPreSelected = this.preSelectedItems.some(
        (preSelected) => preSelected[this.dataKey] === item[this.dataKey]
      )

      // ถ้าเป็น preSelected item ให้ return ออกไปเลย
      if (isPreSelected) {
        console.log('isPreSelected return')
        //return
      }

      let newSelection = [...this.itemsSelection]

      if (checked) {
        // ตรวจสอบว่า item นี้มีอยู่แล้วหรือไม่
        const exists = newSelection.some(
          (selected) => selected[this.dataKey] === item[this.dataKey]
        )
        if (!exists) {
          newSelection.push(item)
        } else {
          newSelection = newSelection.filter(
            (selected) => selected[this.dataKey] !== item[this.dataKey]
          )
        }
      } else {
        newSelection = newSelection.filter(
          (selected) => selected[this.dataKey] !== item[this.dataKey]
        )
      }

      //console.log('newSelection', newSelection)
      this.$emit('update:itemsSelection', newSelection)
    },

    // เช็คว่า item นั้นถูกเลือกหรือไม่ในโหมด single
    isSelectedSingle(item) {
      return (
        this.itemsSelection.length === 1 &&
        this.itemsSelection[0][this.dataKey] === item[this.dataKey]
      )
    },

    // จัดการการเปลี่ยนแปลงการเลือกในโหมด single
    onSingleSelectionChange(checked, item) {
      //console.log('checked', checked, 'item', item)
      if (this.isDisabled(item)) return

      // ถ้าเป็น preSelected item ให้ return ออกไปเลย
      if (this.isPreSelected(item)) return

      let newSelection = []

      if (checked) {
        newSelection = [item]
      }

      this.$emit('update:itemsSelection', newSelection)
    },

    // เช็คว่า item อยู่ใน preSelectedItems หรือไม่
    // isPreSelected(item) {
    //   return this.preSelectedItems.some(
    //     (preSelected) => preSelected[this.dataKey] === item[this.dataKey]
    //   )
    // }

    toggleFreeze(field, side) {
      const current = this.localFrozenMap[field]
      const isCurrentlyThisSide = current === side ||
        (current === undefined && this.isColDefaultFrozen(field, side))

      if (isCurrentlyThisSide) {
        this.localFrozenMap = { ...this.localFrozenMap, [field]: null }
      } else {
        this.localFrozenMap = { ...this.localFrozenMap, [field]: side }
      }
    },

    isColDefaultFrozen(field, side) {
      const col = this.columns.find(c => c.field === field)
      if (!col || !col.frozen) return false
      if (side === 'right') return col.alignFrozen === 'right'
      return col.alignFrozen !== 'right'
    },

    isFreezeBtnActive(col, side) {
      const override = this.localFrozenMap[col.field]
      if (override === null) return false
      if (override !== undefined) return override === side
      if (!col.frozen) return false
      return side === 'right' ? col.alignFrozen === 'right' : col.alignFrozen !== 'right'
    },

    closeSettings() {
      this.isSettingsOpen = false
    },

    handleOutsideClick(e) {
      const panel = this.$el.querySelector('.col-settings-btn-wrapper')
      if (panel && !panel.contains(e.target)) {
        this.isSettingsOpen = false
      }
    }
  },

  mounted() {
    if (this.defaultSortMeta.length > 0) {
      this.internalSortMeta = [...this.defaultSortMeta]
      this.$nextTick(() => {
        this.$emit('sort', {
          first: 0,
          rows: this.perPage,
          multiSortMeta: this.internalSortMeta
        })
      })
    }
    document.addEventListener('click', this.handleOutsideClick)
  },

  beforeUnmount() {
    document.removeEventListener('click', this.handleOutsideClick)
  }
}
</script>

<style lang="scss" scoped>
.base-datatable {
  :deep(.p-datatable) {
    font-size: 14px !important;

    // Header Styles
    .p-datatable-thead > tr > th {
      background-color: var(--base-font-color) !important;
      padding: 0.5rem 1rem !important;
      border: 1px solid #dee2e6 !important;
      color: #ffffff !important;

      .p-column-header-content {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;

        .p-column-title {
          color: #ffffff !important;
          font-weight: normal !important;
          margin-right: 0.5rem !important;
        }

        .p-sortable-column-icon,
        .pi {
          color: #ffffff !important;
          font-size: 0.8rem !important;
        }

        .p-sortable-column-badge {
          background-color: #ffffff !important;
          color: var(--base-font-color) !important;
          font-size: 0.7rem !important;
          margin-left: 0.2rem !important;
        }
      }

      &.p-sortable-column {
        &:hover {
          background-color: var(--base-font-color) !important;
          .p-sortable-column-icon,
          .pi {
            color: #ffffff !important;
          }
        }

        &.p-highlight {
          background-color: var(--base-font-color) !important;

          .p-sortable-column-icon,
          .pi {
            color: #ffffff !important;
          }
        }
      }
    }

    // Body Styles
    .p-datatable-tbody > tr {
      &.p-highlight {
        // เพิ่ม style สำหรับ row ที่ถูก select
        background-color: #e3f2fd !important; // สีฟ้าอ่อน

        // ถ้าต้องการให้ยังคง hover effect
        &:hover {
          background-color: #bbdefb !important; // สีฟ้าที่เข้มขึ้นเมื่อ hover
        }

        // สำหรับ striped rows
        &:nth-child(even) {
          background-color: #e3f2fd !important;
        }
      }

      > td {
        padding: 3px 10px !important;
        font-size: 14px !important;
        //color: #7a1010;
        //border: 1px solid #dee2e6 !important;
      }

      &:nth-child(even) {
        background-color: #f8f9fa !important;
      }

      &:hover {
        background-color: #e9ecef !important;
      }
    }

    // Empty Message
    .p-datatable-emptymessage > td {
      text-align: center !important;
      padding: 2rem !important;
    }

    // Frozen column body cells — must have explicit background to prevent bleed-through
    .p-datatable-tbody > tr {
      > td.p-frozen-column {
        background-color: #ffffff !important;
        z-index: 1;
      }

      &:nth-child(even) > td.p-frozen-column {
        background-color: #f8f9fa !important;
      }

      &:hover > td.p-frozen-column {
        background-color: #e9ecef !important;
      }

      &.p-highlight > td.p-frozen-column {
        background-color: #e3f2fd !important;
      }

      &.p-highlight:hover > td.p-frozen-column {
        background-color: #bbdefb !important;
      }
    }

    // Frozen header cells z-index
    .p-datatable-thead > tr > th.p-frozen-column {
      z-index: 2 !important;
    }
  }

  // Paginator Styles
  :deep(.p-paginator) {
    font-size: 14px !important;
    padding: 5px !important;
    background: #ffffff !important;
    border: 1px solid #dee2e6 !important;
    border-radius: 0px !important;

    .p-paginator-first,
    .p-paginator-prev,
    .p-paginator-next,
    .p-paginator-last,
    .p-paginator-page {
      min-width: 2rem !important;
      height: 2rem !important;
      margin: 0 0.1rem !important;
      border: 1px solid #dee2e6 !important;

      &:not(.p-disabled):not(.p-highlight):hover {
        background: #e9ecef !important;
        border-color: #dee2e6 !important;
      }

      &.p-highlight {
        background: var(--base-font-color) !important;
        color: #ffffff !important;
      }
    }

    .p-dropdown {
      height: 2rem !important;
      width: 100px !important;
      margin: 0 0.5rem !important;

      .p-dropdown-label {
        font-size: 14px !important;
        padding: 0.25rem 0.5rem !important;
      }

      .p-dropdown-trigger {
        width: 2rem !important;
      }
    }

    .p-paginator-current {
      margin: 0 0.5rem !important;
      color: #6c757d !important;
    }
  }

  // Empty Message
  :deep(.empty-message) {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 1rem !important;
    text-align: center !important;
    color: #6c757d !important;

    i {
      font-size: 2rem !important;
      margin-bottom: 0.5rem !important;
    }

    p {
      margin: 0 !important;
      font-size: 14px !important;
    }
  }

  // Action Buttons
  .btn-action-container {
    display: flex !important;
    gap: 0.5rem !important;
    justify-content: center !important;

    .btn {
      padding: 0.25rem 0.5rem !important;

      i {
        font-size: 1rem !important;
      }
    }
  }

  // Loading Overlay
  :deep(.p-datatable-loading-overlay) {
    background: rgba(255, 255, 255, 0.8) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }

  // Table Scrollbar
  :deep(.p-datatable-wrapper) {
    &::-webkit-scrollbar {
      width: 6px !important;
      height: 6px !important;
    }

    &::-webkit-scrollbar-thumb {
      background-color: #c1c1c1 !important;
      border-radius: 3px !important;
    }

    &::-webkit-scrollbar-track {
      background-color: #f1f1f1 !important;
    }
  }

  // Resize Handle
  :deep(.p-column-resizer) {
    width: 4px !important;
    &:hover {
      background-color: var(--base-font-color) !important;
    }
  }

  // Frozen column visual separation
  :deep(.p-datatable) {
    .p-datatable-thead > tr > th.p-frozen-column {
      border-right: 2px solid var(--base-font-color) !important;
    }

    .p-datatable-tbody > tr > td.p-frozen-column {
      border-right: 2px solid #dee2e6 !important;
    }
  }

  // Column settings button
  .col-settings-btn-wrapper {
    position: relative;
    display: inline-flex;
    align-items: center;
    margin-left: 8px;
  }

  .col-settings-btn {
    width: 2rem;
    height: 2rem;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    background: #fff;
    color: var(--base-font-color);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    transition: all 0.2s;

    &:hover {
      background: var(--base-font-color);
      color: #fff;
      border-color: var(--base-font-color);
    }
  }

  .col-settings-panel {
    position: absolute;
    bottom: calc(100% + 4px);
    right: 0;
    min-width: 260px;
    background: #fff;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.12);
    z-index: 100;
  }

  .col-settings-header {
    padding: 8px 12px;
    background: var(--base-font-color);
    color: #fff;
    font-size: 13px;
    font-weight: 600;
    border-radius: 6px 6px 0 0;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .col-settings-list {
    max-height: 300px;
    overflow-y: auto;
  }

  .col-settings-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 12px;
    border-bottom: 1px solid #f0f0f0;
    font-size: 13px;

    &:last-child {
      border-bottom: none;
    }
  }

  .col-settings-name {
    flex: 1;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-right: 8px;
  }

  .col-settings-freeze-btns {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
  }

  .freeze-btn {
    padding: 2px 6px;
    font-size: 11px;
    border: 1px solid #dee2e6;
    border-radius: 3px;
    background: #f8f9fa;
    color: #666;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 2px;
    transition: all 0.15s;
    white-space: nowrap;

    &:hover {
      border-color: var(--base-font-color);
      color: var(--base-font-color);
    }

    &.active {
      background: var(--base-font-color);
      border-color: var(--base-font-color);
      color: #fff;
    }
  }

  .frozen-icon-wrapper {
    margin-right: 4px;
    color: #fff;
    font-size: 0.75rem;
    opacity: 0.8;
  }

  .table-settings-toolbar {
    display: flex;
    justify-content: flex-end;
    padding: 4px 0;
    margin-bottom: 4px;
  }

  // Panel opens downward for toolbar mode (no paginator)
  .col-settings-panel--down {
    top: calc(100% + 4px);
    bottom: auto;
  }

  // Override for sort icons
  :deep(.p-datatable .p-sortable-column),
  :deep(.p-datatable .p-sortable-column.p-highlight) {
    .p-sortable-column-icon,
    .pi-sort,
    .pi-sort-amount-up-alt,
    .pi-sort-amount-down,
    .p-sortable-column-badge {
      color: #ffffff !important;
    }
  }

  // เพิ่ม style สำหรับ expanded content
  :deep(.expanded-row-content) {
    background-color: #f8f9fa;
    //padding: 1rem;
    border-bottom: 1px solid #dee2e6;
  }

  // Style สำหรับ expand button
  :deep(.p-row-toggler) {
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 4px;

    &:hover {
      background-color: var(--row-hover-bg);
    }

    .p-row-toggler-icon {
      font-size: 1rem;
    }
  }
}

// Action Buttons
.btn-action-container {
  display: flex;
  gap: 0.5rem;
  justify-content: center;

  .btn {
    padding: 0.25rem 0.5rem;

    i {
      font-size: 1rem;
    }
  }
}

// Custom CSS Variables
:root {
  --base-font-size: 14px;
  --header-bg-color: var(--base-font-color);
  --header-text-color: #ffffff;
  --header-hover-bg-color: #7a1010;
  --row-alternate-bg: #f8f9fa;
  --row-hover-bg: #e9ecef;
  --paginator-bg: #ffffff;
  --paginator-border: 1px solid #dee2e6;
  --paginator-button-color: #6c757d;
  --paginator-button-hover-bg: #e9ecef;
  --paginator-button-hover-color: #343a40;
  --paginator-text-color: #6c757d;
  --sort-icon-color: #ffffff;
}
@keyframes sortIconFade {
  from {
    opacity: 0.8;
  }
  to {
    opacity: 1;
  }
}
</style>
