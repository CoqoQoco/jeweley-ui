<!--
  slip-monthly-guide-view — panel คำอธิบาย "วิธีอ่านตารางนี้" สำหรับการ์ด "รายงานรายเดือนแยกช่าง"
  (overview tab) ยุบเป็นค่าเริ่มต้น กดปุ่ม toggle เพื่อกาง เนื้อหาเปลี่ยนตามแผนก (tang/setter)
  เพราะสูตร "ยอมให้"/"ยอมให้ %" คำนวณจากคนละฐาน — ช่างแต่ง (tang) รวมระดับใบ, ช่างฝัง (setter)
  รวมระดับชิ้นงาน (ดูหมายเหตุ allowed/allowedBase ใน overview-tab-view.vue)
-->
<template>
  <div class="slip-monthly-guide">
    <div class="slip-monthly-guide__toggle-row">
      <ButtonGeneric
        variant="plain"
        :icon="expanded ? 'bi-chevron-up' : 'bi-info-circle'"
        :label="expanded ? $t('view.production.goldLossDashboard.overview.monthlyGuide.toggleHide') : $t('view.production.goldLossDashboard.overview.monthlyGuide.toggleShow')"
        :aria-expanded="expanded"
        @click="expanded = !expanded"
      />
    </div>

    <div v-if="expanded" class="slip-monthly-guide__panel">
      <div class="slip-monthly-guide__section">
        <div class="slip-monthly-guide__section-title">
          {{ $t('view.production.goldLossDashboard.overview.monthlyGuide.columnsTitle', { dept: deptName }) }}
        </div>
        <dl class="slip-monthly-guide__glossary">
          <template v-for="row in glossaryRows" :key="row.term">
            <dt>{{ row.term }}</dt>
            <dd>
              {{ row.desc }}
              <span v-if="row.hint" class="slip-monthly-guide__hint">{{ row.hint }}</span>
            </dd>
          </template>
        </dl>
      </div>

      <div class="slip-monthly-guide__section">
        <div class="slip-monthly-guide__callout">
          <div class="slip-monthly-guide__callout-title">
            <i class="bi bi-exclamation-triangle-fill"></i>
            {{ $t('view.production.goldLossDashboard.overview.monthlyGuide.weightedTitle') }}
          </div>
          <div class="slip-monthly-guide__callout-line">{{ $t('view.production.goldLossDashboard.overview.monthlyGuide.exampleA') }}</div>
          <div class="slip-monthly-guide__callout-line">{{ $t('view.production.goldLossDashboard.overview.monthlyGuide.exampleB') }}</div>
          <div class="slip-monthly-guide__callout-line">{{ $t('view.production.goldLossDashboard.overview.monthlyGuide.exampleResult') }}</div>
        </div>
      </div>

      <div class="slip-monthly-guide__section slip-monthly-guide__section--last">
        <ul class="slip-monthly-guide__notes">
          <li>{{ $t('view.production.goldLossDashboard.overview.monthlyGuide.noteCompare') }}</li>
          <li>{{ $t('view.production.goldLossDashboard.overview.monthlyGuide.noteZero') }}</li>
          <li>{{ $t('view.production.goldLossDashboard.overview.monthlyGuide.noteExpand') }}</li>
          <li>{{ $t('view.production.goldLossDashboard.overview.monthlyGuide.noteTotal') }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

const I18N_BASE = 'view.production.goldLossDashboard.overview.monthlyGuide'

export default {
  name: 'SlipMonthlyGuideView',

  components: { ButtonGeneric },

  props: {
    dept: {
      type: String,
      required: true,
      validator: (v) => ['tang', 'setter'].includes(v)
    }
  },

  data() {
    return {
      expanded: false
    }
  },

  computed: {
    deptName() {
      return this.dept === 'tang'
        ? this.$t('view.production.goldLossDashboard.overview.slipDeptTang')
        : this.$t('view.production.goldLossDashboard.overview.slipDeptSetter')
    },

    // ลำดับคอลัมน์ตามตารางจริง: ใบ → เบิก/คืน → Loss → %loss → ยอมให้ → ยอมให้% → เกินที่ยอมให้
    // allowed/allowedPercent เป็น dept-specific เพราะฐานการคำนวณต่างกัน (ดู i18n key tang.*/setter.*)
    glossaryRows() {
      return [
        { term: this.$t(`${I18N_BASE}.termSlipCount`), desc: this.$t(`${I18N_BASE}.descSlipCount`) },
        { term: this.$t(`${I18N_BASE}.termIssuedReturned`), desc: this.$t(`${I18N_BASE}.descIssuedReturned`) },
        { term: this.$t(`${I18N_BASE}.termLoss`), desc: this.$t(`${I18N_BASE}.descLoss`) },
        { term: this.$t(`${I18N_BASE}.termLossPercent`), desc: this.$t(`${I18N_BASE}.descLossPercent`) },
        { term: this.$t(`${I18N_BASE}.termAllowed`), desc: this.$t(`${I18N_BASE}.${this.dept}.descAllowed`) },
        { term: this.$t(`${I18N_BASE}.termAllowedPercent`), desc: this.$t(`${I18N_BASE}.${this.dept}.descAllowedPercent`) },
        {
          term: this.$t(`${I18N_BASE}.termOverAllowed`),
          desc: this.$t(`${I18N_BASE}.descOverAllowed`),
          hint: this.$t(`${I18N_BASE}.overAllowedHint`)
        }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
.slip-monthly-guide {
  margin-bottom: var(--sp-md);
}

.slip-monthly-guide__toggle-row {
  margin-bottom: var(--sp-sm);
}

.slip-monthly-guide__panel {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--sp-md) var(--sp-lg);
  margin-bottom: var(--sp-md);
}

.slip-monthly-guide__section {
  padding-bottom: var(--sp-md);
  margin-bottom: var(--sp-md);
  border-bottom: 1px solid var(--color-border);

  &--last {
    padding-bottom: 0;
    margin-bottom: 0;
    border-bottom: none;
  }
}

.slip-monthly-guide__section-title {
  font-weight: 700;
  color: var(--base-font-color);
  font-size: var(--fs-sm);
  margin-bottom: var(--sp-sm);
}

.slip-monthly-guide__glossary {
  display: grid;
  grid-template-columns: 9.5rem 1fr;
  gap: var(--sp-xs) var(--sp-md);
  margin: 0;

  dt {
    font-weight: 700;
    color: var(--base-font-color);
    font-size: var(--fs-sm);
  }

  dd {
    margin: 0;
    font-size: var(--fs-sm);
    line-height: var(--lh-md);
    color: var(--base-font-sub-color);
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;

    dd {
      margin-bottom: var(--sp-xs);
    }
  }
}

.slip-monthly-guide__hint {
  display: block;
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
  margin-top: var(--sp-xs);
}

.slip-monthly-guide__callout {
  background: var(--color-highlight-bg);
  border-radius: var(--radius-md);
  padding: var(--sp-md);
}

.slip-monthly-guide__callout-title {
  display: flex;
  align-items: center;
  gap: var(--sp-xs);
  font-weight: 700;
  color: var(--base-font-color);
  font-size: var(--fs-sm);
  margin-bottom: var(--sp-sm);

  i {
    color: var(--base-warning);
  }
}

.slip-monthly-guide__callout-line {
  font-size: var(--fs-sm);
  line-height: var(--lh-md);
  color: var(--base-font-sub-color);
}

.slip-monthly-guide__notes {
  margin: 0;
  padding-left: var(--sp-lg);

  li {
    font-size: var(--fs-sm);
    line-height: var(--lh-md);
    color: var(--base-font-sub-color);
    margin-bottom: var(--sp-xs);

    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>
