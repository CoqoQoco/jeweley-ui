<template>
  <modal
    :showModal="isShow"
    width="480px"
    headerVariant="main"
    :isShowActionPart="true"
    @closeModal="$emit('closeModal')"
  >
    <template #title>
      <span class="title-text-lg d-block">{{ $t('common.catalogPdf.title') }}</span>
    </template>

    <template #content>
      <div class="pdf-options">
        <CheckboxGeneric
          v-model="showPrice"
          :label="$t('common.catalogPdf.showPrice')"
          :disabled="!canShowPrice"
        />
        <p v-if="disabledReason" class="pdf-options__reason">{{ disabledReason }}</p>

        <div class="pdf-options__strike">
          <CheckboxGeneric
            v-model="showStrike"
            :label="$t('common.catalogPdf.showStrike')"
            :disabled="!showPrice"
          />
        </div>

        <div v-if="canViewPrice" class="pdf-options__counts">
          <span>{{ $t('common.catalogPdf.countWithPrice', { count: pricedCount }) }}</span>
          <span>{{ $t('common.catalogPdf.countWithoutPrice', { count: unpricedCount }) }}</span>
        </div>
      </div>
    </template>

    <template #action>
      <ButtonGeneric variant="main" icon="bi-file-pdf" :label="confirmLabel || $t('common.catalogPdf.confirm')" @click="onConfirm" />
      <ButtonGeneric variant="outline" class="ml-2" :label="$t('common.btn.cancel')" @click="$emit('closeModal')" />
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'

import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import CheckboxGeneric from '@/components/prime-vue/CheckboxGeneric.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

export default {
  name: 'CatalogPdfOptionsModal',

  components: { modal, ButtonGeneric, CheckboxGeneric },

  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    canViewPrice: {
      type: Boolean,
      default: false
    },
    pricedCount: {
      type: Number,
      default: 0
    },
    unpricedCount: {
      type: Number,
      default: 0
    },
    confirmLabel: {
      type: String,
      default: ''
    }
  },

  emits: ['closeModal', 'confirm'],

  data() {
    return {
      showPrice: false,
      showStrike: true
    }
  },

  computed: {
    canShowPrice() {
      return this.canViewPrice && this.pricedCount > 0
    },

    disabledReason() {
      if (!this.canViewPrice) return this.$t('common.catalogPdf.reasonNoPermission')
      if (this.pricedCount === 0) return this.$t('common.catalogPdf.reasonNoPrice')
      return ''
    }
  },

  watch: {
    isShow(value) {
      if (value) {
        this.showPrice = false
        this.showStrike = true
      }
    }
  },

  methods: {
    onConfirm() {
      this.$emit('confirm', {
        showPrice: this.canShowPrice && this.showPrice,
        showStrike: this.showStrike
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.pdf-options {
  display: flex;
  flex-direction: column;
  gap: var(--sp-md);

  &__reason {
    margin: 0;
    font-size: var(--fs-sm);
    color: var(--base-red);
  }

  &__strike {
    padding-left: var(--sp-xl);
  }

  &__counts {
    display: flex;
    flex-direction: column;
    gap: var(--sp-xs);
    font-size: var(--fs-sm);
    color: var(--base-sub-color);
  }
}
</style>
