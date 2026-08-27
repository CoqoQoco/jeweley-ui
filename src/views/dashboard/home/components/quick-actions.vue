<template>
  <SectionCardGeneric :title="$t('view.dashboard.home.quickActions.title')" icon="bi-lightning-charge" accent="main" headerStyle="legend">
    <div class="quick-actions-grid">
      <ButtonGeneric
        v-if="flags.canCreatePrePlan"
        variant="main"
        icon="bi-plus-square"
        :label="$t('view.dashboard.home.quickActions.createPrePlan')"
        @click="go('pre-plan-create')"
      />
      <ButtonGeneric
        v-if="flags.canCreateCustomer"
        variant="green"
        icon="bi-person-plus"
        :label="$t('view.dashboard.home.quickActions.createCustomer')"
        @click="go('customer')"
      />
      <ButtonGeneric
        v-if="flags.canCreateGR"
        variant="outline"
        icon="bi-box-arrow-in-down"
        :label="$t('view.dashboard.home.quickActions.goodsReceipt')"
        @click="go('goods-receipt-production')"
      />
      <ButtonGeneric
        v-if="flags.canCreateQuotation"
        variant="green"
        icon="bi-file-earmark-plus"
        :label="$t('view.dashboard.home.quickActions.createQuotation')"
        @click="go('sale-quotation')"
      />
      <ButtonGeneric
        v-if="flags.canSearchStockProduct"
        variant="outline"
        icon="bi-search"
        :label="$t('view.dashboard.home.quickActions.stockSearch')"
        @click="go('stock-product-list')"
      />
      <ButtonGeneric
        variant="dark"
        icon="bi-life-preserver"
        :label="$t('view.dashboard.home.quickActions.createTicket')"
        @click="go('ticket-create')"
      />
    </div>
  </SectionCardGeneric>
</template>

<script>
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

export default {
  name: 'QuickActions',

  components: {
    SectionCardGeneric,
    ButtonGeneric
  },

  props: {
    flags: {
      type: Object,
      default: () => ({})
    }
  },

  methods: {
    go(name) {
      this.$router.push({ name })
    }
  }
}
</script>

<style lang="scss" scoped>
.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--sp-md);
}
</style>
