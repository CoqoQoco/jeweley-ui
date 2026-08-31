<template>
  <div class="pos-help-quick-card">
    <div class="quick-card-header">
      <i class="bi bi-lightning-charge-fill"></i>
      <span>{{ $t('view.mobile.posHelp.quickStart.title') }}</span>
    </div>
    <ol class="quick-steps">
      <li v-for="(step, idx) in steps" :key="idx" class="quick-step">
        <span class="step-num">{{ idx + 1 }}</span>
        <div class="step-body">
          <div class="step-title">{{ step.title }}</div>
          <div class="step-desc">{{ step.desc }}</div>
        </div>
      </li>
    </ol>
  </div>
</template>

<script>
export default {
  name: 'PosHelpQuickCard',

  computed: {
    steps() {
      return this.$tm('view.mobile.posHelp.quickStart.steps')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/mobile';

.pos-help-quick-card {
  background: var(--surface-inverse-gradient, var(--base-font-color));
  border-radius: var(--radius-md);
  padding: var(--sp-lg);
  color: var(--on-inverse, #fff);
}

.quick-card-header {
  display: flex;
  align-items: center;
  gap: var(--sp-xs);
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: var(--sp-md);

  i {
    font-size: 1.1rem;
  }
}

.quick-steps {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--sp-md);
}

.quick-step {
  display: flex;
  align-items: flex-start;
  gap: var(--sp-sm);
}

.step-num {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--overlay-white-solid, rgba(255, 255, 255, 0.2));
  font-size: 0.8rem;
  font-weight: 700;
}

.step-body {
  flex: 1;
  min-width: 0;
}

.step-title {
  font-size: 0.9rem;
  font-weight: 600;
}

.step-desc {
  font-size: 0.8rem;
  color: var(--on-inverse-muted, rgba(255, 255, 255, 0.85));
  line-height: 1.5;
  margin-top: 2px;
}
</style>
