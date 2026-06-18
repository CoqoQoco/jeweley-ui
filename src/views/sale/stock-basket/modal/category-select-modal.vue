<template>
  <modal :showModal="isShow" @closeModal="$emit('closeModal')" width="500px" :isShowActionPart="true">
    <template #title>
      <span class="title-text-lg">
        <i class="bi bi-collection mr-2"></i>{{ $t('view.sale.stockBasket.selectAllCategories') }}
      </span>
    </template>
    <template #content>
      <div class="p-3">
        <div class="mb-2">
          <span class="title-text">ProductType</span>
          <InputTextGeneric
            v-model="categoryFilter.productType"
            :trim="true"
            :placeholder="$t('view.sale.stockBasket.placeholder.category')"
          />
        </div>
        <div class="mb-2">
          <span class="title-text">ProductionType</span>
          <InputTextGeneric
            v-model="categoryFilter.productionType"
            :trim="true"
            :placeholder="$t('view.sale.stockBasket.placeholder.material')"
          />
        </div>
        <div class="mb-2">
          <span class="title-text">ProductionTypeSize</span>
          <InputTextGeneric
            v-model="categoryFilter.productionTypeSize"
            :trim="true"
            :placeholder="$t('view.sale.stockBasket.placeholder.karat')"
          />
        </div>
        <div class="mb-2">
          <span class="title-text">{{ $t('view.sale.stockBasket.receiptNumber') }}</span>
          <InputTextGeneric
            v-model="categoryFilter.receiptNumber"
            :trim="true"
            :placeholder="$t('view.sale.stockBasket.placeholder.grNo')"
          />
        </div>
      </div>
    </template>
    <template #action>
      <button class="btn btn-sm btn-main" @click="onConfirm">
        <i class="bi bi-plus-circle"></i>
        <span class="ml-1">{{ $t('view.sale.stockBasket.addAll') }}</span>
      </button>
      <button class="btn btn-sm btn-outline-main" @click="$emit('closeModal')">
        <i class="bi bi-x-circle"></i>
        <span class="ml-1">{{ $t('common.btn.cancel') }}</span>
      </button>
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import { warning } from '@/services/alert/sweetAlerts.js'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

const interfaceCategoryFilter = {
  productType: null,
  productionType: null,
  productionTypeSize: null,
  receiptNumber: null
}

export default {
  name: 'CategorySelectModal',

  components: {
    modal,
    InputTextGeneric
  },

  props: {
    isShow: {
      type: Boolean,
      default: false
    }
  },

  emits: ['closeModal', 'categorySelected'],

  data() {
    return {
      categoryFilter: { ...interfaceCategoryFilter }
    }
  },

  watch: {
    isShow(val) {
      if (val) {
        this.categoryFilter = { ...interfaceCategoryFilter }
      }
    }
  },

  methods: {
    onConfirm() {
      const hasFilter =
        this.categoryFilter.productType ||
        this.categoryFilter.productionType ||
        this.categoryFilter.productionTypeSize ||
        this.categoryFilter.receiptNumber

      if (!hasFilter) {
        warning(this.$t('view.sale.stockBasket.validation.conditionRequired'), this.$t('common.label.incompleteData'))
        return
      }

      this.$emit('categorySelected', { ...this.categoryFilter })
      this.$emit('closeModal')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';
</style>
