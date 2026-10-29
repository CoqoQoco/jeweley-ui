<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="p-2 filter-container-bg-focus">
    <LotTopupPicker
      class="mb-2"
      :location="slotProps.data.location || 'MAIN'"
      :isSilver="isSilverPlan"
      :topUpStockNumber="slotProps.data.topUpStockNumber || ''"
      @select="onSelectLot"
    />

    <!-- Quantity and Price -->
    <div class="form-col-container">
      <div>
        <div>
          <span class="title-text">{{ $t('common.field.quantity') }}</span>
          <span class="title-text"> *</span>
        </div>
        <input
          class="form-control form-control-sm"
          :style="getBgColor(slotProps.data.isReceipt, slotProps.data.qty)"
          type="number"
          step="1"
          min="1"
          v-model="slotProps.data.qty"
          :required="isRequiredField(slotProps.data)"
        />
        <small v-if="qtyWarning" class="text-danger">{{ qtyWarning }}</small>
      </div>

      <div>
        <div>
          <span class="title-text">{{ $t('view.receiptStock.product.grProduction.salePrice') }}</span>
          <span class="title-text"> *</span>
        </div>
        <PriceInputGeneric
          :style="getBgColor(slotProps.data.isReceipt, slotProps.data.price)"
          v-model="slotProps.data.price"
          :required="isRequiredField(slotProps.data)"
        />
      </div>
    </div>

    <!-- Size and Stud Earring -->
    <div class="form-col-container mt-2">
      <div class="form-col-sm-container">
        <div>
          <div>
            <span class="title-text">{{ $t('view.receiptStock.product.grProduction.matSize') }}</span>
          </div>
          <input
            type="text"
            class="form-control form-control-sm"
            v-model="slotProps.data.size"
            :required="isRequiredField(slotProps.data, true)"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
          />
        </div>

        <div>
          <div>
            <span class="title-text">{{ $t('view.receiptStock.product.grProduction.earringStemSize') }}</span>
          </div>
          <input
            type="text"
            class="form-control form-control-sm"
            v-model="slotProps.data.earringStemSize"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
          />
        </div>

        <div>
          <div>
            <span class="title-text">{{ $t('view.receiptStock.product.grProduction.studEarring') }}</span>
          </div>
          <DropdownGeneric
            :modelValue="slotProps.data.studEarring"
            :options="masterStud"
            optionLabel="description"
            optionValue="value"
            :placeholder="$t('view.receiptStock.product.grProduction.studEarring')"
            :showClear="!!slotProps.data.studEarring"
            :disabled="!requiredStud"
            @update:modelValue="val => { slotProps.data.studEarring = val }"
          />
        </div>
      </div>

      <!-- Location -->
      <div>
        <div>
          <span class="title-text">{{ $t('view.receiptStock.product.grProduction.location') }}</span>
        </div>
        <DropdownGeneric
          :modelValue="slotProps.data.location"
          :options="locationOptions"
          optionLabel="label"
          optionValue="value"
          :showClear="false"
          :placeholder="$t('view.receiptStock.product.grProduction.selectLocation')"
          @update:modelValue="val => { slotProps.data.location = val }"
        />
      </div>
    </div>

    <!-- Remark -->
    <div class="form-col-container mt-2">
      <div>
        <div>
          <span class="title-text">{{ $t('common.field.remark') }}</span>
        </div>
        <textarea
          type="text"
          class="form-control form-control-sm mt-1"
          v-model="slotProps.data.remark"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
        />
      </div>
    </div>
  </div>
</template>

<script>
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import PriceInputGeneric from '@/components/generic/PriceInputGeneric.vue'
import LotTopupPicker from '../../../components/lot-topup-picker.vue'
import { validateReceiptQty } from '@/services/helper/receipt-lot/receipt-lot.js'

export default {
  name: 'StockDetails',

  components: {
    DropdownGeneric,
    PriceInputGeneric,
    LotTopupPicker
  },

  props: {
    slotProps: {
      type: Object,
      required: true
    },
    masterStud: {
      type: Array,
      required: true
    },
    requiredStud: {
      type: Boolean,
      required: true
    },
    isSilverPlan: {
      type: Boolean,
      default: false
    },
    locationOptions: {
      type: Array,
      default: () => []
    },
    getBgColor: {
      type: Function,
      required: true
    },
    isRequiredField: {
      type: Function,
      required: true
    }
  },

  emits: ['selectImage'],

  computed: {
    qtyWarning() {
      const error = validateReceiptQty({
        isSilver: this.isSilverPlan,
        qty: this.slotProps.data.qty
      })
      if (error === 'goldQty') return this.$t('view.receiptStock.product.receiptLot.goldQtyWarn')
      if (error === 'silverQty') return this.$t('view.receiptStock.product.receiptLot.silverQtyWarn')
      return ''
    }
  },

  methods: {
    onSelectLot(lot) {
      // eslint-disable-next-line vue/no-mutating-props
      this.slotProps.data.topUpStockNumber = lot ? lot.stockNumber : ''
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form';

.form-col-sm-container {
  display: grid;
  gap: var(--sp-sm);
  grid-template-columns: 1fr 1fr 1fr;
}

.title-text {
  font-weight: 500;
  color: var(--base-font-color);
}
</style>
