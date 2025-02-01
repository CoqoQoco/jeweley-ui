// src/components/common/BaseDataTable.vue
<template>
  <div class="base-datatable">
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
      :currentPageReportTemplate="currentPageReportTemplate"
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

      <Column v-if="selectionMode" selectionMode="null" headerStyle="width: 50px">
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

        <!-- เพิ่ม header template เพื่อจัดการ check all -->

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
      </Column>

      <!-- Dynamic Columns -->
      <template v-for="col in columns" :key="col.field">
        <Column
          v-bind="col"
          :sortable="col.sortable !== false"
          :style="{
            'min-width': col.minWidth || '10px',
            width: col.width || 'auto',
            backgroundColor: col.backgroundColor || 'transparent'
          }"
          :alignHeader="col.align || 'left'"
          :bodyStyle="{ textAlign: col.align || 'left' }"
          :class="col.className"
        >
          <template #header v-if="$slots[`header-${col.field}`]">
            <slot :name="`header-${col.field}`"></slot>
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
            <p>{{ emptyMessage }}</p>
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
        </div>
      </template>

      <!-- Footer -->
      <template #footer v-if="$slots.footer">
        <slot name="footer" />
      </template>
    </DataTable>
  </div>
</template>

<script>
import Checkbox from 'primevue/checkbox'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { formatDate, formatDateTime } from '@/services/utils/dayjs'

export default {
  name: 'BaseDataTable',

  components: {
    DataTable,
    Column,
    Checkbox
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
      default: 'calc(100vh - 280px)'
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
      default: 'แสดงข้อมูล {first} - {last} จากทั้งหมด {totalRecords} รายการ'
    },
    emptyMessage: {
      type: String,
      default: 'ไม่พบข้อมูล'
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
    }
  },

  emits: [
    'page',
    'sort',
    'update:itemsSelection',
    'update:modelValue', // สำหรับ v-model ของ expanded rows
    'row-expand', // เมื่อ row ถูก expand
    'row-collapse' // เมื่อ row ถูก collapse
  ],

  computed: {
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
      expandedRows: []
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
      console.log('select all value:', value) // debug
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
      console.log('checked', checked, 'item', item)

      if (this.isDisabled(item)) return

      // เพิ่มเช็คว่าอยู่ใน preSelectedItems หรือไม่
      const isPreSelected = this.preSelectedItems.some(
        (preSelected) => preSelected[this.dataKey] === item[this.dataKey]
      )

      // ถ้าเป็น preSelected item ให้ return ออกไปเลย
      if (isPreSelected) {
        console.log('isPreSelected return')
        return
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

      console.log('newSelection', newSelection)
      this.$emit('update:itemsSelection', newSelection)
    }

    // เช็คว่า item อยู่ใน preSelectedItems หรือไม่
    // isPreSelected(item) {
    //   return this.preSelectedItems.some(
    //     (preSelected) => preSelected[this.dataKey] === item[this.dataKey]
    //   )
    // }
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
    &:hover {
      background-color: var(--base-font) !important;
    }
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
