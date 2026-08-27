<template>
  <SectionCardGeneric :title="$t('view.dashboard.home.actionCards.title')" icon="bi-grid-3x3-gap" accent="main" headerStyle="legend">
    <div class="action-cards-grid">
      <router-link v-if="flags.canApprovePrePlan" :to="{ name: 'pre-plan-list' }" class="action-card-link">
        <StatCardGeneric icon="bi-hourglass-split" :value="data.prePlanWaitingCount" :label="$t('view.dashboard.home.actionCards.pendingApproval')" variant="warning" />
      </router-link>

      <router-link v-if="flags.canViewPrePlan" :to="{ name: 'pre-plan-list' }" class="action-card-link">
        <StatCardGeneric icon="bi-file-earmark-text" :value="data.prePlanMyCount" :label="$t('view.dashboard.home.actionCards.myPrePlan')" />
      </router-link>

      <template v-if="flags.canViewProduction">
        <router-link :to="{ name: 'plan-order' }" class="action-card-link">
          <StatCardGeneric icon="bi-collection" :value="data.planTotal" :label="$t('view.dashboard.home.actionCards.planTotal')" />
        </router-link>
        <router-link :to="{ name: 'plan-order' }" class="action-card-link">
          <StatCardGeneric icon="bi-gear" :value="data.planProcess" :label="$t('view.dashboard.home.actionCards.planProcess')" variant="warning" />
        </router-link>
        <router-link :to="{ name: 'plan-order' }" class="action-card-link">
          <StatCardGeneric icon="bi-check-circle" :value="data.planCompletedYesterday" :label="$t('view.dashboard.home.actionCards.planCompletedYesterday')" variant="green" />
        </router-link>
        <router-link :to="{ name: 'plan-order' }" class="action-card-link">
          <StatCardGeneric icon="bi-exclamation-triangle" :value="data.planOverdue" :label="$t('view.dashboard.home.actionCards.planOverdue')" variant="grey" />
        </router-link>
      </template>

      <router-link v-if="flags.canViewStockProductGr" :to="{ name: 'goods-receipt-production-list' }" class="action-card-link">
        <StatCardGeneric icon="bi-box-arrow-in-down" :value="data.pendingGR" :label="$t('view.dashboard.home.actionCards.pendingGR')" variant="green" />
      </router-link>

      <router-link v-if="flags.canManageTicket" :to="{ name: 'ticket-manage' }" class="action-card-link">
        <StatCardGeneric icon="bi-exclamation-circle" :value="data.ticketOpenCount" :label="$t('view.dashboard.home.actionCards.ticketOpen')" variant="warning" />
      </router-link>

      <router-link :to="{ name: 'ticket-my' }" class="action-card-link">
        <StatCardGeneric icon="bi-chat-dots" :value="myTicketLabel" :label="$t('view.dashboard.home.actionCards.myTicket')" />
      </router-link>

      <router-link v-if="flags.canViewReport" :to="{ name: 'report-gold-cost' }" class="action-card-link">
        <StatCardGeneric icon="bi-gem" :value="scrapWeightLabel" :label="$t('view.dashboard.home.actionCards.scrapWeightMonth')" variant="grey" />
      </router-link>
    </div>
  </SectionCardGeneric>
</template>

<script>
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import StatCardGeneric from '@/components/generic/StatCardGeneric.vue'

export default {
  name: 'ActionCards',

  components: {
    SectionCardGeneric,
    StatCardGeneric
  },

  props: {
    data: {
      type: Object,
      required: true
    },
    flags: {
      type: Object,
      required: true
    }
  },

  computed: {
    myTicketLabel() {
      return `${this.data.ticketMyTotal || 0} (${this.data.ticketMyUnreadCount || 0})`
    },

    scrapWeightLabel() {
      return (this.data.scrapWeightMonth || 0).toFixed(2)
    }
  }
}
</script>

<style lang="scss" scoped>
.action-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--sp-md);
}

.action-card-link {
  display: block;
  text-decoration: none;
  color: inherit;

  &:hover {
    text-decoration: none;
    color: inherit;
  }
}
</style>
