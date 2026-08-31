<template>
  <div>
    <modal :showModal="isShow" @closeModal="closeModal" :isShowActionPart="true">
      <template #title>
        <span class="title-text-lg px-3 pt-3 d-block">{{ $t('view.production.planGold.editTitle') }}</span>
      </template>
      <template #content>
        <form @submit.prevent="onSubmit" id="gold-update-form">
          <div class="p-4">
            <GoldInfoSection
              v-model="form"
              :errors="errors"
              :masterGold="masterGold"
              :masterGoldSize="masterGoldSize"
              mode="edit"
            />
            <MeltSection v-model="form" />
            <CastSection v-model="form" />
          </div>
        </form>
      </template>
      <template #action>
        <ButtonGeneric variant="main" type="submit" form="gold-update-form" icon="bi-save" :label="$t('common.btn.save')" />
        <ButtonGeneric variant="outline" type="button" class="ml-2" :label="$t('common.btn.cancel')" @click="closeModal" />
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

// External dependencies
import api from '@/axios/axios-helper.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { success, warning } from '@/services/alert/sweetAlerts.js'
import { formatISOString } from '@/services/utils/dayjs'

// Local components
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import GoldInfoSection from '@/views/production/plan-gold/components/gold-info-section.vue'
import MeltSection from '@/views/production/plan-gold/components/melt-section.vue'
import CastSection from '@/views/production/plan-gold/components/cast-section.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

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
  castDate: null,
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
  name: 'PlanGoldUpdateView',

  components: {
    modal,
    ButtonGeneric,
    GoldInfoSection,
    MeltSection,
    CastSection
  },

  props: {
    isShow: {
      type: Boolean,
      default: false,
      required: true
    },
    modelMasterGold: {
      type: Array,
      required: true,
      default: () => []
    },
    modelMasterGoldSize: {
      type: Array,
      required: true,
      default: () => []
    },
    modelValue: {
      type: Object,
      required: true,
      default: () => {}
    }
  },

  emits: ['closeModal', 'fetch'],

  data() {
    return {
      autoId: 0,

      form: {
        ...interfaceForm
      },
      errors: {
        ...interfaceErrors
      }
    }
  },

  computed: {
    masterGold() {
      return this.modelMasterGold
    },
    masterGoldSize() {
      return this.modelMasterGoldSize
    }
  },

  watch: {
    async modelValue(value) {
      if (!value || !Object.keys(value).length) return
      this.form = {
        bookNo: value.bookNo,
        no: value.no,
        assignDate: value.assignDate ? new Date(value.assignDate) : null,
        gold: this.masterGold.find((x) => x.code === value.goldCode),
        goldSize: this.masterGoldSize.find((x) => x.code === value.goldSizeCode),
        goldReceipt: value.goldReceipt,
        meltDate: value.meltDate ? new Date(value.meltDate) : null,
        meltWeight: value.meltWeight,
        returnMeltWeight: value.returnMeltWeight,
        returnMeltScrapWeight: value.returnMeltScrapWeight,
        returnMeltScrapWeightDate: value.returnMeltScrapWeightDate
          ? new Date(value.returnMeltScrapWeightDate)
          : null,
        meltWeightLoss: value.meltWeightLoss,
        meltWeightOver: value.meltWeightOver,
        castDate: value.castDate ? new Date(value.castDate) : null,
        castWeight: value.castWeight,
        gemWeight: value.gemWeight,
        returnCastWeight: value.returnCastWeight,
        returnCastMoldWeight: value.returnCastMoldWeight,
        returnCastBodyBrokenWeight: value.returnCastBodyBrokenWeight,
        returnCastScrapWeight: value.returnCastScrapWeight,
        returnCastScrapWeightDate: value.returnCastScrapWeightDate
          ? new Date(value.returnCastScrapWeightDate)
          : null,
        returnCastPowderWeight: value.returnCastPowderWeight,
        castWeightLoss: value.castWeightLoss,
        castWeightOver: value.castWeightOver,
        remark: value.remark,
        assignBy: value.assignBy,
        receiveBy: value.receiveBy,
        zill: value.zill,
        zillQty: value.zillQty,
        cost: value.cost,
        items: []
      }
      // per-item recovery: one failed lookup must not blank the whole slip
      this.form.items = await Promise.all(
        (value.items ?? []).map(async (x) => {
          let res = null
          try {
            res = await this.onSearchProductionPlanIdByCode(x.productionPlanId)
          } catch {
            res = null
          }
          return {
            id: ++this.autoId,
            productionPlan: { ...(res ?? {}) },
            returnWeight: x.returnWeight,
            returnQTY: x.returnQTY,
            remark: x.remark
          }
        })
      )
    }
  },

  methods: {
    closeModal() {
      this.form = { ...interfaceForm }
      this.errors = { ...interfaceErrors }
      this.$emit('closeModal')
    },
    onSubmit() {
      if (this.validateForm()) {
        confirmThenSubmit(
          `${this.$t('view.production.planGold.labelNo')}${this.form.no} | ${this.$t('view.production.planGold.labelBookNo')}${this.form.bookNo}`,
          this.$t('view.production.planGold.confirmSave'),
          async () => {
            await this.submit()
          }
        )
      }
    },
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

      const res = await api.jewelry.post('ProductionPlanCost/UpdateGoldCost', params)
      if (res) {
        success(null, null, () => {
          this.form = { ...interfaceForm }
          this.errors = { ...interfaceErrors }
          this.$emit('fetch')
        })
      }
    },
    async onSearchProductionPlanIdByCode(e) {
      const productionPlanId = e.replace(/-/g, '')
      const params = {
        take: 0,
        skip: 0,
        search: {
          text: productionPlanId
        }
      }
      const res = await api.jewelry.post(
        'ProductionPlan/ProductionPlanSearchByProductionPlanId',
        params
      )
      if (res && Array.isArray(res.data)) {
        return res.data.find((x) => x.woText === productionPlanId) ?? null
      }
      return null
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
