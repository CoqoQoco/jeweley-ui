<template>
  <DrawerGeneric
    :show="!!entry"
    :title="$t('view.stock.rfidBasket.detail.title')"
    width="480px"
    :clickToClose="true"
    :isShowActionPart="true"
    @close="$emit('close')"
  >
    <template #content>
      <div v-if="entry" class="tag-detail">
        <div class="tag-detail-image">
          <imagePreview
            v-if="entry.piece && entry.piece.imagePath"
            :imageName="entry.piece.imagePath"
            type="STOCK-PRODUCT"
            :width="240"
            :height="240"
          />
          <i v-else class="bi bi-image tag-detail-noimage"></i>
        </div>

        <p v-if="!entry.piece" :class="entry.check === 'unbound' ? 'tag-detail-unbound' : 'tag-detail-pending'">
          {{ entry.check === 'unbound' ? $t('view.stock.rfidBasket.row.unbound') : $t('view.stock.rfidBasket.row.checking') }}
        </p>

        <p v-if="entry.piece && entry.piece.soldMismatch" class="tag-detail-warning">
          {{ $t('view.stock.rfidBasket.detail.soldMismatchNote') }}
        </p>

        <dl class="tag-detail-list">
          <template v-if="entry.piece">
            <dt>{{ $t('view.stock.rfidBasket.detail.stockNumber') }}</dt>
            <dd class="tag-detail-strong">{{ entry.piece.stockNumber }}</dd>
            <dt>{{ $t('view.stock.rfidBasket.detail.productCode') }}</dt>
            <dd>{{ entry.piece.productNumber }}</dd>
            <dt>{{ $t('view.stock.rfidBasket.detail.name') }}</dt>
            <dd>{{ entry.piece.productName }}</dd>
            <dt>{{ $t('view.stock.rfidBasket.detail.status') }}</dt>
            <dd>
              <span v-if="isSold" class="tag-detail-sold">{{ $t('view.stock.rfidBasket.row.sold') }}</span>
              <template v-else>{{ statusText }}</template>
            </dd>
            <dt>{{ $t('view.stock.rfidBasket.detail.qty') }}</dt>
            <dd>{{ formatLotQty(entry.piece.lotQty) }}</dd>
            <dt>{{ $t('view.stock.rfidBasket.detail.location') }}</dt>
            <dd>{{ display.locationCode || '-' }}</dd>
          </template>
          <dt>{{ $t('view.stock.rfidBasket.detail.epc') }}</dt>
          <dd class="tag-detail-epc">{{ entry.epc }}</dd>
          <dt>{{ $t('view.stock.rfidBasket.detail.hits') }}</dt>
          <dd>{{ entry.hits }}</dd>
          <dt>{{ $t('view.stock.rfidBasket.detail.rssi') }}</dt>
          <dd>{{ rssiText }}</dd>
          <dt>{{ $t('view.stock.rfidBasket.detail.firstSeen') }}</dt>
          <dd>{{ firstSeenText }}</dd>
        </dl>

        <div v-if="canOpenProduct && entry.piece && entry.piece.stockNumber">
          <ButtonGeneric
            variant="green"
            icon="bi-box-arrow-up-right"
            :label="$t('view.stock.rfidBasket.detail.openProduct')"
            @click="openProduct"
          />
        </div>
      </div>
    </template>

    <template #action>
      <ButtonGeneric variant="outline" :label="$t('view.stock.rfidBasket.detail.close')" @click="$emit('close')" />
      <ButtonGeneric
        class="ml-2"
        variant="red"
        icon="bi-trash"
        :label="$t('view.stock.rfidBasket.detail.remove')"
        @click="$emit('remove', entry.epc)"
      />
    </template>
  </DrawerGeneric>
</template>

<script>
import DrawerGeneric from '@/components/generic/DrawerGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import imagePreview from '@/components/prime-vue/ImagePreview.vue'
import dayjs from 'dayjs'
import { useAuthStore } from '@/stores/modules/authen/authen-store.js'
import { PermissionService } from '@/services/permission/permission.js'
import { PERMISSIONS } from '@/services/permission/config.js'
import { formatLotQty } from '../rfid-basket-logic.js'
import { isSoldPiece, pieceDisplay, pieceStatusLabel } from '../rfid-basket-status.js'

export default {
  name: 'RfidBasketTagDetailDrawer',

  components: { DrawerGeneric, ButtonGeneric, imagePreview },

  props: {
    entry: { type: Object, default: null }
  },

  emits: ['close', 'remove'],

  methods: {
    formatLotQty,

    // เปิดแท็บใหม่ ไม่ออกจากหน้านี้ (ตะกร้าและการเชื่อมต่อเครื่องอ่านต้องอยู่ต่อ)
    openProduct() {
      const route = this.$router.resolve({
        name: 'stock-product-detail',
        params: { stockNumber: this.entry.piece.stockNumber }
      })
      window.open(route.href, '_blank', 'noopener')
    }
  },

  computed: {
    isSold() {
      return isSoldPiece(this.entry?.piece)
    },

    display() {
      return pieceDisplay(this.entry?.piece)
    },

    statusText() {
      return pieceStatusLabel(this.entry?.piece, (key) => this.$t(key))
    },

    // ปุ่มไปหน้าสินค้าต้องมีสิทธิ์คลังสินค้า (หน้า detail ใช้ STOCK_PRODUCT) ไม่งั้นกดแล้วเด้ง
    canOpenProduct() {
      const authStore = useAuthStore()
      return new PermissionService(authStore.getUser, authStore.permissions).hasPermission(PERMISSIONS.STOCK_PRODUCT)
    },

    rssiText() {
      const rssi = this.entry?.rssi
      if (rssi === undefined || rssi === null) return this.$t('view.stock.rfidBasket.detail.rssiMissing')
      return this.$t('view.stock.rfidBasket.row.rssi', { value: rssi })
    },

    firstSeenText() {
      return this.entry ? dayjs(this.entry.firstSeen).format('DD/MM/YYYY HH:mm:ss') : ''
    }
  }
}
</script>

<style lang="scss" scoped>
.tag-detail {
  padding: var(--sp-xl);
  display: flex;
  flex-direction: column;
  gap: var(--sp-lg);
}

.tag-detail-image {
  display: flex;
  justify-content: center;
}

.tag-detail-noimage {
  font-size: var(--fs-xl);
  color: var(--base-sub-color);
}

.tag-detail-pending {
  margin: 0;
  text-align: center;
  color: var(--base-sub-color);
}

.tag-detail-unbound {
  margin: 0;
  text-align: center;
  font-weight: 600;
  color: var(--status-open);
}

.tag-detail-list {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: var(--sp-sm) var(--sp-lg);
  margin: 0;

  dt {
    color: var(--base-sub-color);
  }

  dd {
    margin: 0;
    word-break: break-all;
  }
}

.tag-detail-sold {
  padding: var(--sp-xs) var(--sp-sm);
  border-radius: var(--radius-sm);
  font-size: var(--fs-sm);
  font-weight: 600;
  background: var(--status-cancelled-bg);
  color: var(--status-cancelled);
}

.tag-detail-warning {
  margin: 0;
  padding: var(--sp-md);
  border-radius: var(--radius-md);
  background: var(--status-cancelled-bg);
  color: var(--status-cancelled);
}

.tag-detail-strong {
  font-weight: 700;
}

.tag-detail-epc {
  font-family: monospace;
}

</style>
