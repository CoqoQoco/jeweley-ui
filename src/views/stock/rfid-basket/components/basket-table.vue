<template>
  <BaseDataTable
    :items="pagedItems"
    :totalRecords="items.length"
    :columns="columns"
    :perPage="take"
    :rowsPerPageOptions="[50, 100, 200]"
    :rowClass="rowClass"
    scrollHeight="max(calc(100vh - 440px), 320px)"
    :first="skip"
    dataKey="epc"
    @page="handlePageChange"
    @row-click="$emit('select', $event.data.epc)"
  >
    <template #imageTemplate="{ data }">
      <div class="image-container">
        <div v-if="data.piece && data.piece.imagePath">
          <imagePreview :imageName="data.piece.imagePath" type="STOCK-PRODUCT" :width="32" :height="32" />
        </div>
      </div>
    </template>

    <template #codeTemplate="{ data }">
      <div v-if="data.piece" class="basket-code">
        <strong>{{ data.piece.stockNumber }}</strong>
        <span class="basket-sub">{{ data.piece.productNumber }}</span>
      </div>
      <span v-else-if="data.check === 'unbound'" class="basket-unknown">?</span>
      <span v-else class="basket-pending">—</span>
    </template>

    <template #nameTemplate="{ data }">
      <div class="basket-name">
        <span v-if="data.piece" class="basket-name-text">{{ data.piece.productName }}</span>
        <span v-else-if="data.check === 'unbound'" class="basket-unknown">{{ $t('view.stock.rfidBasket.row.unbound') }}</span>
        <span v-else class="basket-sub">{{ $t('view.stock.rfidBasket.row.checking') }}</span>
        <span :class="['basket-new', { 'basket-new--hidden': !isNew(data) }]">{{ $t('view.stock.rfidBasket.row.new') }}</span>
      </div>
    </template>

    <template #statusTemplate="{ data }">
      <template v-if="data.piece">
        <span v-if="isSold(data.piece)" class="basket-sold">{{ $t('view.stock.rfidBasket.row.sold') }}</span>
        <span v-else class="basket-status">{{ statusLabel(data.piece) }}</span>
      </template>
    </template>

    <template #locationTemplate="{ data }">
      <span v-if="data.piece">{{ display(data.piece).locationCode }}</span>
    </template>

    <template #qtyTemplate="{ data }">
      <span v-if="data.piece">{{ formatLotQty(data.piece.lotQty) }}</span>
    </template>

    <template #rssiTemplate="{ data }">
      <span v-if="data.rssi !== undefined && data.rssi !== null">{{ $t('view.stock.rfidBasket.row.rssi', { value: data.rssi }) }}</span>
    </template>

    <template #epcTemplate="{ data }">
      <span class="basket-epc">{{ shortEpc(data.epc) }}</span>
    </template>

    <template #empty>
      <div class="basket-empty">
        <i class="bi bi-basket"></i>
        <strong>{{ $t('view.stock.rfidBasket.empty.title') }}</strong>
        <p>{{ $t('view.stock.rfidBasket.empty.hint') }}</p>
      </div>
    </template>
  </BaseDataTable>
</template>

<script>
import dataTablePaging from '@/composables/useDataTablePaging.js'

import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import imagePreview from '@/components/prime-vue/ImagePreview.vue'
import { formatLotQty, shortEpc, isNewEntry } from '../rfid-basket-logic.js'
import { isSoldPiece, pieceDisplay, pieceStatusLabel } from '../rfid-basket-status.js'

export default {
  name: 'RfidBasketTable',

  components: { BaseDataTable, imagePreview },

  mixins: [dataTablePaging],

  props: {
    items: { type: Array, default: () => [] },
    now: { type: Number, default: 0 },
    resetKey: { type: String, default: '' }
  },

  emits: ['select'],

  data() {
    return { take: 50 }
  },

  computed: {
    pagedItems() {
      return this.items.slice(this.skip, this.skip + this.take).map((entry, i) => ({ ...entry, rowNo: this.skip + i + 1 }))
    },

    columns() {
      const t = (key) => this.$t(`view.stock.rfidBasket.col.${key}`)
      return [
        { field: 'rowNo', header: t('no'), sortable: false, minWidth: '60px', width: '60px', align: 'center' },
        { field: 'image', header: t('image'), sortable: false, minWidth: '60px', width: '60px', align: 'center' },
        { field: 'code', header: t('code'), sortable: false, minWidth: '150px', width: '150px' },
        { field: 'name', header: t('name'), sortable: false, minWidth: '280px', width: '280px' },
        { field: 'status', header: t('status'), sortable: false, minWidth: '120px', width: '120px' },
        { field: 'location', header: t('location'), sortable: false, minWidth: '100px', width: '100px' },
        { field: 'qty', header: t('qty'), sortable: false, minWidth: '100px', width: '100px', align: 'center' },
        { field: 'hits', header: t('hits'), sortable: false, minWidth: '90px', width: '90px', align: 'center' },
        { field: 'rssi', header: t('rssi'), sortable: false, minWidth: '100px', width: '100px' },
        { field: 'epc', header: t('epc'), sortable: false, minWidth: '170px', width: '170px' }
      ]
    }
  },

  watch: {
    resetKey() {
      this.resetPaging()
    },

    // แถวลดลงจนหน้าปัจจุบันว่าง (เอาออกจากตะกร้า) → กลับหน้าแรก
    'items.length'(length) {
      if (this.skip > 0 && this.skip >= length) this.resetPaging()
    }
  },

  methods: {
    // paging ทำฝั่ง client — mixin เรียก fetchData หลังเปลี่ยนหน้า จึงไม่ต้องทำอะไร
    fetchData() {},

    shortEpc,

    formatLotQty,

    isSold: isSoldPiece,

    isNew(entry) {
      return isNewEntry(entry, this.now)
    },

    statusLabel(piece) {
      return pieceStatusLabel(piece, (key) => this.$t(key))
    },

    display: pieceDisplay,

    rowClass(entry) {
      return this.isNew(entry) ? 'basket-row basket-row--new' : 'basket-row'
    }
  }
}
</script>

<style lang="scss" scoped>
.basket-code {
  display: flex;
  flex-direction: column;
}

.basket-sub {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}

.basket-unknown {
  font-weight: 600;
  color: var(--status-open);
}

.basket-status {
  font-size: var(--fs-sm);
  font-weight: 600;
}

.basket-sold {
  padding: var(--sp-xs) var(--sp-sm);
  border-radius: var(--radius-sm);
  font-size: var(--fs-sm);
  font-weight: 600;
  background: var(--status-cancelled-bg);
  color: var(--status-cancelled);
}

.basket-epc {
  font-family: monospace;
}

.basket-pending {
  color: var(--base-sub-color);
}

.basket-name {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
}

.basket-name-text {
  min-width: 0;
  overflow-wrap: anywhere;
}

// ป้าย "ใหม่" จองที่ไว้ตลอด (ซ่อนด้วย visibility) กันคอลัมน์ขยับเมื่อป้ายหาย
.basket-new--hidden {
  visibility: hidden;
}

.basket-new {
  flex-shrink: 0;
  padding: var(--sp-xs) var(--sp-sm);
  border-radius: var(--radius-sm);
  font-size: var(--fs-sm);
  font-weight: 600;
  background: var(--status-resolved-bg);
  color: var(--status-resolved);
}

.basket-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-xs);
  padding: var(--sp-xl);
  color: var(--base-sub-color);

  i {
    font-size: var(--fs-xl);
  }
}

:deep(tr.basket-row) {
  cursor: pointer;
}

:deep(tr.basket-row--new > td) {
  background: var(--row-active-bg);
}
</style>
