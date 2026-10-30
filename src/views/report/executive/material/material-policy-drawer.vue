<!--
  material-policy-drawer — ตั้งค่าเกณฑ์ของคลังวัตถุดิบ (MaterialInsight/Policy/Save) ใน DrawerGeneric — เฉพาะ material:manage-min
  ทอง (GOLD) ใช้ 7 field: ช่วงดูการใช้ (เดือน) · lead time · safety · ขั้นต่ำพื้น · ใกล้หมด % · ค้างนิ่ง (วัน) · ประวัติขั้นต่ำก่อนพยากรณ์ — field ที่ทองไม่ใช้ (ตัวชี้วัดของที่อยู่ในกระบวนการ/ราคา/ความกระจุก) ไม่แสดงและไม่ส่ง
  บันทึก = ส่ง kind + เฉพาะ field ที่เปลี่ยนจากค่าปัจจุบัน · ช่วงค่าเช็คฝั่งหน้าจอตาม clamp ของ API · policy.source บอกที่มาของค่า (db / default / request)

  Props: isShow · kind ('GOLD') · policy (Overview.policy)
  Emits: close · saved
-->
<template>
  <DrawerGeneric :show="isShow" :title="$t('view.productionInsight.materialInsight.drawer.title')" width="460px" :isShowActionPart="true" @close="$emit('close')">
    <template #content>
      <div class="material-policy-drawer">
        <p class="material-policy-drawer__formula">{{ $t('view.productionInsight.materialInsight.drawer.formula') }}</p>
        <p v-if="policy" class="material-policy-drawer__source">{{ $t('view.productionInsight.materialInsight.drawer.source', { source: $t(`view.productionInsight.materialInsight.drawer.sourceName.${policy.source || 'default'}`) }) }}</p>

        <FormFieldGeneric v-for="field in fields" :key="field.key" :label="$t(`view.productionInsight.materialInsight.drawer.field.${field.key}`)" :tip="$t(`view.productionInsight.materialInsight.drawer.help.${field.key}`)" :error="errorText(field.key)">
          <InputTextGeneric v-model="form[field.key]" type="number" :min="field.min" :max="field.max" step="any" />
        </FormFieldGeneric>
      </div>
    </template>

    <template #action>
      <ButtonGeneric variant="main" icon="bi-save" :label="$t('common.btn.save')" @click="onSave" />
      <ButtonGeneric variant="outline" class="ml-2" :label="$t('common.btn.cancel')" @click="$emit('close')" />
    </template>
  </DrawerGeneric>
</template>

<script>
import { useMaterialInsightApiStore } from '@/stores/modules/api/material/material-insight-api.js'
import { success, info } from '@/services/alert/sweetAlerts.js'
import { policyFieldsFor, createPolicyForm, validatePolicyForm, buildPolicySaveBody, hasPolicyChanges } from './material-helpers.js'

import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import DrawerGeneric from '@/components/generic/DrawerGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'

export default {
  name: 'MaterialPolicyDrawer',

  components: { ButtonGeneric, DrawerGeneric, FormFieldGeneric, InputTextGeneric },

  setup() {
    const materialStore = useMaterialInsightApiStore()
    return { materialStore }
  },

  props: {
    isShow: { type: Boolean, default: false },
    kind: { type: String, default: 'GOLD' },
    policy: { type: Object, default: null }
  },

  emits: ['close', 'saved'],

  data() {
    return {
      form: createPolicyForm(null),
      errors: {}
    }
  },

  computed: {
    fields() {
      return policyFieldsFor(this.kind)
    }
  },

  watch: {
    // เปิด drawer = เริ่มฟอร์มใหม่จากเกณฑ์ปัจจุบัน
    isShow: {
      handler(value) {
        if (!value) return
        this.form = createPolicyForm(this.policy)
        this.errors = {}
      },
      immediate: true
    }
  },

  methods: {
    errorText(field) {
      if (!this.errors[field]) return ''
      const def = this.fields.find((f) => f.key === field)
      return this.$t('view.productionInsight.materialInsight.error.range', { min: def.min, max: def.max === Number.MAX_SAFE_INTEGER ? '∞' : def.max })
    },

    async onSave() {
      this.errors = validatePolicyForm(this.form, this.fields)
      if (Object.keys(this.errors).length) return
      const body = buildPolicySaveBody(this.kind, this.form, this.policy, this.fields)
      if (!hasPolicyChanges(body)) {
        info(this.$t('view.productionInsight.materialInsight.drawer.noChange'))
        return
      }
      await this.materialStore.savePolicy(body)
      success(this.$t('view.productionInsight.materialInsight.drawer.saved'))
      this.$emit('saved')
    }
  }
}
</script>

<style lang="scss" scoped>
.material-policy-drawer {
  padding: var(--sp-lg);
  display: flex;
  flex-direction: column;
  gap: var(--sp-md);
}

.material-policy-drawer__formula {
  margin: 0;
  padding: var(--sp-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-highlight-bg);
  font-size: var(--fs-sm);
}

.material-policy-drawer__source {
  margin: 0;
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}
</style>
