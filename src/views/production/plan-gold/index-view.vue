<template>
  <div class="app-container">
    <PageHeaderGeneric :title="$t('view.production.planGold.pageTitle')" backRoute="plan-gold-tracking" />

    <form @submit.prevent="onSubmit">
      <GoldInfoSection
        v-model="form"
        :errors="errors"
        :masterGold="masterGold"
        :masterGoldSize="masterGoldSize"
        mode="create"
      />
      <MeltSection v-model="form" />
      <CastSection v-model="form" />

      <div class="btn-submit-container-between mt-4">
        <div></div>
        <div>
          <ButtonGeneric
            variant="outline"
            type="button"
            icon="bi-x-circle"
            :label="$t('common.btn.clear')"
            @click="onClearForm"
          />
          <ButtonGeneric
            variant="main"
            type="submit"
            icon="bi-calendar-check"
            :label="$t('view.production.planGold.btnCreate')"
            class="ml-2"
          />
        </div>
      </div>
    </form>
  </div>
</template>

<script>
// External dependencies
import api from '@/axios/axios-helper.js'
import { success, warning } from '@/services/alert/sweetAlerts.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { formatISOString } from '@/services/utils/dayjs'

// Local components
import PageHeaderGeneric from '@/components/generic/PageHeaderGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import GoldInfoSection from './components/gold-info-section.vue'
import MeltSection from './components/melt-section.vue'
import CastSection from './components/cast-section.vue'

const interfaceForm = {
  bookNo: null,
  no: null,
  assignDate: new Date(),
  gold: null,
  goldSize: null,
  goldReceipt: null,
  meltDate: null,
  meltWeight: null,
  returnMeltWeight: null,

  returnMeltScrapWeight: null,
  returnMeltScrapWeightDate: null,

  meltWeightLoss: null,
  meltWeightOver: null,
  castWeight: null,
  gemWeight: null,
  returnCastWeight: null,
  returnCastMoldWeight: null,
  returnCastBodyBrokenWeight: null,

  returnCastScrapWeight: null,
  returnCastScrapWeightDate: null,

  returnCastPowderWeight: null,
  castWeightLoss: null,
  castWeightOver: null,
  remark: null,
  assignBy: null,
  receiveBy: null,
  zill: null,
  zillQty: null,
  items: [],
  cost: 0
}

const interfaceErrors = {
  assignDate: '',
  gold: '',
  goldSize: ''
}

export default {
  name: 'PlanGoldCreateView',

  components: {
    PageHeaderGeneric,
    ButtonGeneric,
    GoldInfoSection,
    MeltSection,
    CastSection
  },

  data() {
    return {
      form: {
        ...interfaceForm,
        items: []
      },
      errors: {
        ...interfaceErrors
      },
      initialFormSnapshot: '',

      masterGold: [],
      masterGoldSize: []
    }
  },

  computed: {
    isFormDirty() {
      return JSON.stringify(this.form) !== this.initialFormSnapshot
    }
  },

  methods: {
    validateForm() {
      const errors = { ...interfaceErrors }
      const messages = []

      if (!this.form.assignDate) {
        errors.assignDate = this.$t('view.production.planGold.errorAssignDateRequired')
        messages.push(errors.assignDate)
      }
      if (!this.form.gold) {
        errors.gold = this.$t('view.production.planGold.errorGoldRequired')
        messages.push(errors.gold)
      }
      if (!this.form.goldSize) {
        errors.goldSize = this.$t('view.production.planGold.errorGoldSizeRequired')
        messages.push(errors.goldSize)
      }

      const missingWoRows = (this.form.items || [])
        .map((item, index) => (!item.productionPlan ? index + 1 : null))
        .filter((rowNo) => rowNo !== null)

      if (missingWoRows.length > 0) {
        messages.push(
          this.$t('view.production.planGold.errorMissingWoRows', { rows: missingWoRows.join(', ') })
        )
      }

      this.errors = errors

      if (messages.length > 0) {
        warning(
          messages.map((m) => `• ${m}`).join('<br/>'),
          this.$t('view.production.planGold.validationTitle')
        )
        return false
      }

      return true
    },
    onSubmit() {
      if (this.validateForm()) {
        confirmThenSubmit(
          `${this.$t('view.production.planGold.labelNo')}${this.form.no} | ${this.$t('view.production.planGold.labelBookNo')}${this.form.bookNo}`,
          this.$t('view.production.planGold.confirmCreate'),
          async () => {
            await this.submit()
          }
        )
      }
    },
    onClearForm() {
      confirmThenSubmit(
        this.$t('view.production.planGold.clearFormConfirm'),
        this.$t('view.production.planGold.clearFormTitle'),
        () => {
          this.resetForm()
        }
      )
    },
    resetForm() {
      this.form = {
        ...interfaceForm,
        items: []
      }
      this.errors = { ...interfaceErrors }
      this.initialFormSnapshot = JSON.stringify(this.form)
    },

    async submit() {
      const items = this.form.items
        .filter((x) => x.productionPlan)
        .map((x) => ({
          ...x,
          id: x.productionPlan.id,
          productionPlanId: `${x.productionPlan.wo}-${x.productionPlan.woNumber}`
        }))

      const params = {
        ...this.form,
        items,
        goldCode: this.form.gold.code,
        goldSizeCode: this.form.goldSize.code,
        assignDateFormat: this.form.assignDate ? formatISOString(this.form.assignDate) : null,
        meltDateFormat: this.form.meltDate ? formatISOString(this.form.meltDate) : null,
        castDateFormat: this.form.castDate ? formatISOString(this.form.castDate) : null,

        returnMeltScrapWeightDate:
          this.form.returnMeltScrapWeight && this.form.returnMeltScrapWeightDate
            ? formatISOString(this.form.returnMeltScrapWeightDate)
            : null,
        returnCastScrapWeightDate:
          this.form.returnCastScrapWeight && this.form.returnCastScrapWeightDate
            ? formatISOString(this.form.returnCastScrapWeightDate)
            : null
      }

      const res = await api.jewelry.post('ProductionPlanCost/CreateGoldCost', params)
      if (res) {
        success(null, null, () => {
          this.resetForm()
          this.$router.push('/plan-gold-tracking')
        })
      }
    },
    async fetchMasterGold() {
      const res = await api.jewelry.get('Master/MasterGold')
      if (res) {
        this.masterGold = [...res]
      }
    },
    async fetchMasterGoldSize() {
      const res = await api.jewelry.get('Master/MasterGoldSize')
      if (res) {
        this.masterGoldSize = [...res]
      }
    }
  },

  created() {
    this.initialFormSnapshot = JSON.stringify(this.form)
    this.fetchMasterGold()
    this.fetchMasterGoldSize()
  },

  beforeRouteLeave(to, from, next) {
    if (!this.isFormDirty) {
      next()
      return
    }
    confirmThenSubmit(
      this.$t('view.production.planGold.leaveWarning'),
      this.$t('view.production.planGold.leaveTitle'),
      () => next()
    )
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/responsive-style/web';

.app-container {
  padding: var(--sp-lg);
}
</style>
