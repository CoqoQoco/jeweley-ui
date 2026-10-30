<!--
  material-min-modal — ตั้งขั้นต่ำ/lead time/หมายเหตุของ 1 รายการวัตถุดิบ (MaterialInsight/Min/Save) หรือลบการตั้งเอง (Min/Delete) — เฉพาะ material:manage-min
  แสดงขั้นต่ำอัตโนมัติ (อ่านอย่างเดียว) พร้อมสูตร: ใช้เฉลี่ย/วัน × (lead + safety) · บันทึก/ลบสำเร็จ → emit saved (parent ยิง Overview ซ้ำ) · ลบต้องยืนยันก่อน

  Props:
    isShow — Boolean (false)
    item   — Object|null — แถวจาก Overview.items
    kind   — String ('GOLD')
    policy — Object|null — Overview.policy (ใช้อธิบายสูตร)
  Emits: closeModal · saved
-->
<template>
  <modal :showModal="shown" width="640px" :fitHeight="true" :isShowActionPart="true" headerVariant="main" @closeModal="$emit('closeModal')">
    <template #title>
      <span class="title-text-lg d-block">{{ $t('view.productionInsight.materialInsight.modal.title') }}</span>
    </template>

    <template #content>
      <div v-if="shown" class="material-min-modal">
        <p class="material-min-modal__item">{{ item.label }}</p>

        <dl class="material-min-modal__facts">
          <dt>{{ $t('view.productionInsight.materialInsight.modal.autoMin') }}</dt>
          <dd>{{ formatGram(item.autoMin) }} {{ unit }}</dd>
          <dt>{{ $t('view.productionInsight.materialInsight.modal.onHand') }}</dt>
          <dd>{{ formatGram(item.onHand) }} {{ unit }}</dd>
        </dl>
        <p class="material-min-modal__formula">{{ $t('view.productionInsight.materialInsight.modal.formula', formula) }}</p>

        <FormFieldGeneric :label="$t('view.productionInsight.materialInsight.modal.minQty', { unit })" :required="true" :error="errorText('minQty')">
          <InputTextGeneric v-model="form.minQty" type="number" min="0" step="any" />
        </FormFieldGeneric>
        <FormFieldGeneric :label="$t('view.productionInsight.materialInsight.modal.leadTimeDays')" :error="errorText('leadTimeDays')">
          <InputTextGeneric v-model="form.leadTimeDays" type="number" min="0" max="365" :placeholder="$t('view.productionInsight.materialInsight.modal.leadTimePlaceholder', { days: item.leadTimeDays })" />
        </FormFieldGeneric>
        <FormFieldGeneric :label="$t('common.field.remark')" :error="errorText('note')">
          <TextareaGeneric v-model="form.note" :rows="2" :maxlength="500" />
        </FormFieldGeneric>
      </div>
    </template>

    <template #action>
      <ButtonGeneric variant="main" icon="bi-save" :label="$t('common.btn.save')" @click="onSave" />
      <ButtonGeneric v-if="hasOverride" variant="red" icon="bi-trash" class="ml-2" :label="$t('view.productionInsight.materialInsight.modal.deleteOverride')" @click="onDelete" />
      <ButtonGeneric variant="outline" class="ml-2" :label="$t('common.btn.cancel')" @click="$emit('closeModal')" />
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'

import { useMaterialInsightApiStore } from '@/stores/modules/api/material/material-insight-api.js'
import { success } from '@/services/alert/sweetAlerts.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { qtyUnitLabelKey } from '@/components/insight/insight-helpers.js'
import { createMinForm, validateMinForm, buildMinSaveBody, buildMinDeleteBody, describeAutoMin, formatGram } from './material-helpers.js'

import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import TextareaGeneric from '@/components/generic/TextareaGeneric.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

export default {
  name: 'MaterialMinModal',

  components: { modal, ButtonGeneric, FormFieldGeneric, InputTextGeneric, TextareaGeneric },

  setup() {
    const materialStore = useMaterialInsightApiStore()
    return { materialStore }
  },

  props: {
    isShow: { type: Boolean, default: false },
    item: { type: Object, default: null },
    kind: { type: String, default: 'GOLD' },
    policy: { type: Object, default: null }
  },

  emits: ['closeModal', 'saved'],

  data() {
    return {
      form: createMinForm(null),
      errors: {}
    }
  },

  computed: {
    shown() {
      return this.isShow && !!this.item
    },

    unit() {
      return this.kind === 'GOLD' ? 'g' : this.$t(qtyUnitLabelKey(this.item?.unit))
    },

    hasOverride() {
      return this.item?.overrideMin !== null && this.item?.overrideMin !== undefined
    },

    formula() {
      return { ...describeAutoMin(this.item, this.policy), unit: this.unit }
    }
  },

  watch: {
    // เปิดโมดัล/เปลี่ยนรายการ → เริ่มฟอร์มใหม่จากข้อมูลรายการ
    item: {
      handler(value) {
        this.form = createMinForm(value)
        this.errors = {}
      },
      immediate: true
    }
  },

  methods: {
    formatGram,

    errorText(field) {
      return this.errors[field] ? this.$t(`view.productionInsight.materialInsight.error.${this.errors[field]}`) : ''
    },

    async onSave() {
      this.errors = validateMinForm(this.form)
      if (Object.keys(this.errors).length) return
      await this.materialStore.saveMin(buildMinSaveBody(this.kind, this.item.itemKey, this.form))
      success(this.$t('view.productionInsight.materialInsight.modal.saved'))
      this.$emit('saved')
    },

    onDelete() {
      confirmThenSubmit(this.item.label, this.$t('view.productionInsight.materialInsight.modal.confirmDelete'), async () => {
        await this.materialStore.deleteMin(buildMinDeleteBody(this.kind, this.item.itemKey))
        success(this.$t('view.productionInsight.materialInsight.modal.deleted'))
        this.$emit('saved')
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.material-min-modal__item {
  margin: 0 0 var(--sp-md);
  font-size: var(--fs-lg);
  font-weight: 700;
  color: var(--base-font-color);
}

.material-min-modal__facts {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: var(--sp-xs) var(--sp-lg);
  margin: 0 0 var(--sp-xs);

  dt {
    color: var(--base-sub-color);
    font-weight: 600;
  }

  dd {
    margin: 0;
  }
}

.material-min-modal__formula {
  margin: 0 0 var(--sp-lg);
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
  font-style: italic;
}
</style>
