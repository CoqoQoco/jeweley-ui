<template>
  <SectionCardGeneric :title="$t('view.dashboard.home.favoriteReports.title')" icon="bi-star" accent="main" headerStyle="legend">
    <div class="report-links">
      <router-link :to="{ name: 'report-wip-by-stage' }" class="report-link">
        <i class="bi bi-diagram-3"></i>
        <span>{{ $t('view.dashboard.home.favoriteReports.wip') }}</span>
        <i class="bi bi-chevron-right report-link-arrow"></i>
      </router-link>
      <router-link :to="{ name: 'report-gold-cost' }" class="report-link">
        <i class="bi bi-coin"></i>
        <span>{{ $t('view.dashboard.home.favoriteReports.goldCost') }}</span>
        <i class="bi bi-chevron-right report-link-arrow"></i>
      </router-link>
      <router-link :to="{ name: 'report-lead-time' }" class="report-link">
        <i class="bi bi-stopwatch"></i>
        <span>{{ $t('view.dashboard.home.favoriteReports.leadTime') }}</span>
        <i class="bi bi-chevron-right report-link-arrow"></i>
      </router-link>
      <router-link :to="{ name: 'report-production-worker-wages' }" class="report-link">
        <i class="bi bi-cash-stack"></i>
        <span>{{ $t('view.dashboard.home.favoriteReports.wages') }}</span>
        <i class="bi bi-chevron-right report-link-arrow"></i>
      </router-link>
      <router-link :to="{ name: 'report-worker-wages-by-person' }" class="report-link">
        <i class="bi bi-person-badge"></i>
        <span>{{ $t('view.dashboard.home.favoriteReports.wagesByPerson') }}</span>
        <i class="bi bi-chevron-right report-link-arrow"></i>
      </router-link>
    </div>
  </SectionCardGeneric>
</template>

<script>
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'

export default {
  name: 'FavoriteReports',

  components: {
    SectionCardGeneric
  }
}
</script>

<style lang="scss" scoped>
.report-links {
  display: flex;
  flex-direction: column;
  gap: var(--sp-xs);
}

.report-link {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  padding: var(--sp-sm) var(--sp-md);
  border-radius: var(--radius-md);
  color: var(--base-font-color);
  text-decoration: none;
  transition: background 0.2s ease;

  &:hover {
    background: var(--color-highlight-bg);
    color: var(--base-font-color);
    text-decoration: none;
  }

  i:first-child {
    font-size: 1.1rem;
    width: 20px;
    text-align: center;
  }

  span {
    flex: 1;
    font-size: var(--fs-base);
  }
}

.report-link-arrow {
  color: var(--base-sub-color);
  font-size: 0.8rem;
}
</style>
