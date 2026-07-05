<template>
  <modal :showModal="isShowModal" @closeModal="onCancel" width="400px">
    <template v-slot:content>
      <div class="p-3">
        <div class="title-text-lg mb-3">
          <span><i class="bi bi-file-earmark-pdf mr-2"></i></span>
          <span>{{ $t('view.sale.quotation.confirmPdfTitle') }}</span>
        </div>
        <div class="form-group mb-3">
          <span class="title-text" for="itemsPerPageInput"
            >{{ $t('view.sale.quotation.itemsPerPage') }}:</span
          >
          <input
            id="itemsPerPageInput"
            v-model.number="itemsPerPage"
            type="number"
            min="1"
            max="50"
            class="form-control"
            style="width: 25%"
          />
        </div>
        <div class="form-group mb-3">
          <div class="d-flex align-items-center" style="gap: 8px; cursor: pointer" @click="showCifLabel = !showCifLabel">
            <input
              id="showCifLabelInput"
              type="checkbox"
              v-model="showCifLabel"
              style="width: 16px; height: 16px; cursor: pointer"
            />
            <span class="title-text" for="showCifLabelInput" style="cursor: pointer">{{ $t('view.sale.quotation.showCifLabel') }}</span>
          </div>
        </div>
        <div class="form-group mb-3">
          <CheckboxGeneric
            v-model="showDecimals"
            :label="$t('common.field.showDecimals')"
            @update:modelValue="onShowDecimalsChange"
          />
        </div>
        <div class="d-flex justify-content-end mt-4">
          <button class="btn btn-sm btn-green mr-2" @click="onConfirm">
            <span><i class="bi bi-calendar-check"></i></span>
            <span class="ml-2">Confirm</span>
          </button>
          <button
            v-if="quotationNumber && quotationNumber.trim() !== ''"
            class="btn btn-sm btn-main"
            @click="onSaveAndCreate"
          >
            <span><i class="bi bi-save"></i></span>
            <span class="ml-2">Save And Confirm</span>
          </button>
        </div>
      </div>
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import { storage } from '@/services/storage.js'
import { isForeignCurrency } from '@/services/utils/decimal.js'
import CheckboxGeneric from '@/components/prime-vue/CheckboxGeneric.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

const SHOW_DECIMALS_STORAGE_KEY = 'quotation-print-show-decimals'

export default {
  name: 'ConfirmCreatePdfView',

  components: {
    modal,
    CheckboxGeneric
  },

  props: {
    showModal: { type: Boolean, default: false },
    defaultItemsPerPage: { type: Number, default: 10 },
    quotationNumber: { type: String, default: '' },
    defaultShowCifLabel: { type: Boolean, default: true },
    currencyUnit: { type: String, default: 'THB' }
  },

  data() {
    return {
      isShowModal: this.showModal,
      itemsPerPage: this.defaultItemsPerPage,
      showCifLabel: this.defaultShowCifLabel,
      showDecimals: true
    }
  },
  watch: {
    showModal(val) {
      this.isShowModal = val
      if (val) this.initShowDecimals()
    },
    isShowModal(val) {
      if (!val) this.$emit('closeModal')
    },
    defaultShowCifLabel(val) {
      this.showCifLabel = val
    }
  },
  mounted() {
    this.initShowDecimals()
  },
  methods: {
    initShowDecimals() {
      const saved = storage.getItem(SHOW_DECIMALS_STORAGE_KEY)
      this.showDecimals = saved !== null ? saved === 'true' : !isForeignCurrency(this.currencyUnit)
    },
    onShowDecimalsChange(val) {
      storage.setItem(SHOW_DECIMALS_STORAGE_KEY, String(val))
    },
    onConfirm() {
      this.$emit('confirm', this.itemsPerPage, this.showCifLabel, this.showDecimals)
      this.isShowModal = false
    },
    onSaveAndCreate() {
      this.$emit('saveAndCreate', this.itemsPerPage, this.showCifLabel, this.showDecimals)
      this.isShowModal = false
    },
    onCancel() {
      this.isShowModal = false
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.title-text-lg-bg {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--base-font-color);
  display: flex;
  align-items: center;
}
</style>
