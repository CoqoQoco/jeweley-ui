<template>
  <div>
    <modal
      :showModal="isShow"
      @closeModal="closeModal"
      width="600px"
      :isShowActionPart="true"
      headerVariant="main"
    >
      <template #title>
        <span class="title-text-lg d-block">
          {{ isEditMode ? $t('view.stock.location.editTitle') : $t('view.stock.location.createTitle') }}
        </span>
      </template>

      <template #content>
        <div class="p-3">
          <SectionCardGeneric class="modal-section">
            <div class="form-row two-col">
              <FormFieldGeneric :label="$t('view.stock.location.code')" :required="true">
                <InputTextGeneric
                  v-model.trim="form.code"
                  :placeholder="$t('view.stock.location.codePlaceholder')"
                  :disabled="isEditMode"
                />
              </FormFieldGeneric>
              <FormFieldGeneric :label="$t('view.stock.location.sortOrder')">
                <InputTextGeneric
                  type="number"
                  v-model.number="form.sortOrder"
                  placeholder="1"
                  :min="0"
                />
              </FormFieldGeneric>
            </div>

            <div class="form-row two-col">
              <FormFieldGeneric :label="$t('view.stock.location.nameTh')" :required="true">
                <InputTextGeneric
                  v-model.trim="form.nameTh"
                  :placeholder="$t('view.stock.location.namePlaceholder')"
                />
              </FormFieldGeneric>
              <FormFieldGeneric :label="$t('view.stock.location.nameEn')">
                <InputTextGeneric
                  v-model.trim="form.nameEn"
                  :placeholder="$t('view.stock.location.placeholder.nameEn')"
                />
              </FormFieldGeneric>
            </div>

            <div class="form-row two-col">
              <FormFieldGeneric :label="$t('view.stock.location.locType')">
                <DropdownGeneric
                  :modelValue="form.type"
                  :options="typeOptions"
                  optionLabel="label"
                  optionValue="value"
                  :placeholder="$t('common.label.all')"
                  :showClear="true"
                  @update:modelValue="form.type = $event"
                />
              </FormFieldGeneric>
              <div></div>
            </div>

            <div class="form-row">
              <div class="checkbox-group">
                <CheckboxGeneric v-model="form.isSalesPoint" :label="$t('view.stock.location.isSalesPoint')" />
                <CheckboxGeneric v-model="form.isTemporary" :label="$t('view.stock.location.isTemporary')" />
                <CheckboxGeneric v-model="form.isActive" :label="$t('view.stock.location.isActiveLabel')" />
              </div>
            </div>
          </SectionCardGeneric>
        </div>
      </template>

      <template #action>
        <ButtonGeneric variant="main" icon="bi-save" :label="$t('common.btn.save')" @click="onSubmit" />
        <ButtonGeneric variant="outline" :label="$t('common.btn.cancel')" class="ml-2" @click="closeModal" />
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import CheckboxGeneric from '@/components/prime-vue/CheckboxGeneric.vue'
import { warning, success } from '@/services/alert/sweetAlerts.js'
import { useStockLocationApiStore } from '@/stores/modules/api/stock/stock-location-api.js'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

const defaultForm = () => ({
  code: null,
  nameTh: null,
  nameEn: null,
  type: null,
  isSalesPoint: false,
  isTemporary: false,
  isActive: true,
  sortOrder: null
})

export default {
  name: 'UpsertView',

  components: {
    modal,
    FormFieldGeneric,
    InputTextGeneric,
    ButtonGeneric,
    SectionCardGeneric,
    DropdownGeneric,
    CheckboxGeneric
  },

  setup() {
    const locationStore = useStockLocationApiStore()
    return { locationStore }
  },

  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    modelData: {
      type: Object,
      default: null
    }
  },

  emits: ['closeModal', 'fetch'],

  computed: {
    isEditMode() {
      return !!this.modelData?.code
    },
    typeOptions() {
      return [
        { value: 'WAREHOUSE', label: this.$t('view.stock.location.warehouse') },
        { value: 'SHOWROOM', label: this.$t('view.stock.location.showroom') },
        { value: 'BRANCH', label: this.$t('view.stock.location.branch') },
        { value: 'TEMP', label: this.$t('view.stock.location.temp') }
      ]
    }
  },

  watch: {
    isShow(val) {
      if (val) {
        if (this.modelData) {
          this.form = { ...defaultForm(), ...this.modelData }
        } else {
          this.form = defaultForm()
        }
      }
    }
  },

  data() {
    return {
      form: defaultForm()
    }
  },

  methods: {
    closeModal() {
      this.form = defaultForm()
      this.$emit('closeModal')
    },

    async onSubmit() {
      if (!this.form.nameTh || !this.form.nameTh.trim()) {
        warning(this.$t('view.stock.location.warnName'), this.$t('view.stock.location.incomplete'))
        return
      }
      if (!this.form.code || !this.form.code.trim()) {
        warning(this.$t('view.stock.location.warnCode'), this.$t('view.stock.location.incomplete'))
        return
      }

      if (this.isEditMode) {
        await this.locationStore.update({ ...this.form })
      } else {
        await this.locationStore.create({ ...this.form })
      }
      success(this.$t('view.stock.location.saveSuccess'))
      this.$emit('fetch')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';

.form-row {
  margin-bottom: var(--sp-lg);

  &.two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--sp-lg);

    @media (max-width: 1024px) {
      grid-template-columns: 1fr;
    }
  }
}

.modal-section {
  margin-bottom: var(--sp-lg);

  &:last-child {
    margin-bottom: 0;
  }
}

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2xl);
  align-items: center;
}
</style>
