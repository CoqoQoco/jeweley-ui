<template>
  <div class="graph-view">
    <PageHeaderGeneric :title="$t('view.graph.title')" />

    <SectionCardGeneric>
      <div class="graph-toolbar">
        <div class="graph-helper-text">{{ $t('view.graph.helper') }}</div>
        <div class="graph-btn-group">
          <ButtonGeneric
            :variant="activeTarget === 'frontend' ? 'main' : 'outline'"
            icon="bi-diagram-2"
            :label="$t('view.graph.btn.frontend')"
            @click="switchTarget('frontend')"
          />
          <ButtonGeneric
            :variant="activeTarget === 'backend' ? 'main' : 'outline'"
            icon="bi-diagram-3"
            :label="$t('view.graph.btn.backend')"
            class="ml-2"
            @click="switchTarget('backend')"
          />
        </div>
      </div>

      <div class="graph-iframe-wrapper">
        <iframe
          :key="activeTarget"
          :src="iframeSrc"
          :title="activeTarget === 'frontend' ? $t('view.graph.btn.frontend') : $t('view.graph.btn.backend')"
          class="graph-iframe"
          frameborder="0"
          allowfullscreen
        ></iframe>
      </div>
    </SectionCardGeneric>
  </div>
</template>

<script>
// External dependencies
// (none for this view)

// Local components
import PageHeaderGeneric from '@/components/generic/PageHeaderGeneric.vue'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

const GRAPH_SOURCES = {
  frontend: '/graph-frontend.html',
  backend: '/graph-backend.html'
}

export default {
  name: 'GraphIndexView',

  components: {
    PageHeaderGeneric,
    SectionCardGeneric,
    ButtonGeneric
  },

  data() {
    return {
      activeTarget: 'frontend'
    }
  },

  computed: {
    iframeSrc() {
      return GRAPH_SOURCES[this.activeTarget] || GRAPH_SOURCES.frontend
    }
  },

  mounted() {
    const target = this.$route.meta?.graphTarget
    if (target && GRAPH_SOURCES[target]) {
      this.activeTarget = target
    }
  },

  watch: {
    '$route.meta.graphTarget'(newTarget) {
      if (newTarget && GRAPH_SOURCES[newTarget]) {
        this.activeTarget = newTarget
      }
    }
  },

  methods: {
    switchTarget(target) {
      this.activeTarget = target
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.graph-view {
  padding: var(--sp-lg);
}

.graph-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--sp-sm);
  margin-bottom: var(--sp-lg);
}

.graph-helper-text {
  font-size: var(--fs-base);
  color: var(--base-font-color);
  opacity: 0.75;
}

.graph-btn-group {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
}

.graph-iframe-wrapper {
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--color-card-bg);
}

.graph-iframe {
  display: block;
  width: 100%;
  height: calc(100vh - 260px);
  min-height: 500px;
  border: none;
}
</style>
