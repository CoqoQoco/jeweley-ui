<template>
  <div class="mobile-pos-help-view">
    <div class="mobile-container mobile-mt-1">
      <PosHelpQuickCard />

      <div class="topics-list">
        <PosHelpSection
          v-for="(topic, idx) in topics"
          :key="idx"
          :icon="topic.icon"
          :title="topic.title"
        >
          <p v-if="topic.intro" class="topic-intro">{{ topic.intro }}</p>

          <div v-if="topic.table" class="help-table-cards">
            <div v-for="(row, ri) in topic.table.rows" :key="ri" class="help-table-card">
              <div class="help-table-card-title">{{ row[0] }}</div>
              <div v-for="(cell, ci) in row.slice(1)" :key="ci" class="help-table-row">
                <span class="help-table-label">{{ topic.table.headers[ci + 1] }}</span>
                <span class="help-table-value">{{ cell }}</span>
              </div>
            </div>
          </div>

          <ul v-if="topic.list" class="help-list">
            <li v-for="(item, li) in topic.list" :key="li">
              <strong v-if="item.label">{{ item.label }}: </strong>{{ item.desc }}
            </li>
          </ul>

          <ol v-if="topic.rules" class="help-rules">
            <li v-for="(rule, ri) in topic.rules" :key="ri">{{ rule }}</li>
          </ol>

          <div v-if="topic.tip" class="help-note help-note--tip">
            <i class="bi bi-lightbulb-fill"></i>
            <span>{{ topic.tip }}</span>
          </div>

          <div v-if="topic.warning" class="help-note help-note--warning">
            <i class="bi bi-exclamation-triangle-fill"></i>
            <span>{{ topic.warning }}</span>
          </div>

          <p v-if="topic.note" class="topic-note">{{ topic.note }}</p>
        </PosHelpSection>
      </div>
    </div>
  </div>
</template>

<script>
import PosHelpQuickCard from './components/pos-help-quick-card.vue'
import PosHelpSection from './components/pos-help-section.vue'

export default {
  name: 'MobilePosHelpIndexView',

  components: {
    PosHelpQuickCard,
    PosHelpSection
  },

  computed: {
    topics() {
      return this.$tm('view.mobile.posHelp.topics')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/mobile';

.mobile-pos-help-view {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px));
}

.topics-list {
  margin-top: var(--sp-lg);
}

.topic-intro {
  font-size: 0.85rem;
  color: #666;
  margin: 0 0 var(--sp-md);
  line-height: 1.5;
}

.topic-note {
  font-size: 0.85rem;
  color: #666;
  margin: var(--sp-md) 0 0;
  line-height: 1.6;
}

// list
.help-list {
  margin: 0;
  padding-left: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: var(--sp-sm);

  li {
    font-size: 0.85rem;
    color: #333;
    line-height: 1.6;
  }

  strong {
    color: var(--base-font-color);
  }
}

// numbered rules
.help-rules {
  margin: 0;
  padding-left: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: var(--sp-sm);

  li {
    font-size: 0.85rem;
    color: #333;
    line-height: 1.6;
    font-weight: 500;
  }
}

// table -> stacked card (มือถือจอแคบ ไม่ใช้ตารางแนวนอน)
.help-table-cards {
  display: flex;
  flex-direction: column;
  gap: var(--sp-sm);
}

.help-table-card {
  background: var(--color-highlight-bg);
  border-radius: var(--radius-md);
  padding: var(--sp-md);
}

.help-table-card-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--base-font-color);
  margin-bottom: var(--sp-xs);
}

.help-table-row {
  display: flex;
  flex-direction: column;
  padding: 4px 0;

  & + & {
    border-top: 1px dashed var(--color-border);
  }
}

.help-table-label {
  font-size: 0.75rem;
  color: #999;
}

.help-table-value {
  font-size: 0.85rem;
  color: #333;
  line-height: 1.5;
}

// tip / warning callouts
.help-note {
  display: flex;
  align-items: flex-start;
  gap: var(--sp-sm);
  margin-top: var(--sp-md);
  padding: var(--sp-md);
  border-radius: var(--radius-md);
  font-size: 0.8rem;
  line-height: 1.6;

  i {
    flex-shrink: 0;
    margin-top: 1px;
  }

  &--tip {
    background: rgba(3, 131, 135, 0.08);
    color: var(--base-green);

    i {
      color: var(--base-green);
    }
  }

  &--warning {
    background: rgba(255, 194, 27, 0.12);
    color: #7a5b00;

    i {
      color: var(--base-warning, #ffc21b);
    }
  }
}
</style>
