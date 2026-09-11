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
          {{ isEditMode ? $t('view.master.saleChannel.updateTitle') : $t('view.master.saleChannel.createTitle') }}
        </span>
      </template>

      <template #content>
        <div>
          <SectionCardGeneric class="modal-section">
            <div class="form-row two-col">
              <FormFieldGeneric :label="$t('common.field.code')" :required="true">
                <InputTextGeneric
                  v-model.trim="form.code"
                  :placeholder="$t('view.master.saleChannel.placeholder.code')"
                  :disabled="isEditMode"
                />
              </FormFieldGeneric>
              <FormFieldGeneric :label="$t('view.master.saleChannel.field.sortOrder')">
                <InputTextGeneric
                  type="number"
                  v-model.number="form.sortOrder"
                  placeholder="1"
                  :min="0"
                />
              </FormFieldGeneric>
            </div>

            <div class="form-row two-col">
              <FormFieldGeneric :label="$t('common.field.nameTh')" :required="true">
                <InputTextGeneric
                  v-model.trim="form.nameTh"
                  :placeholder="$t('view.master.saleChannel.placeholder.nameTh')"
                />
              </FormFieldGeneric>
              <FormFieldGeneric :label="$t('common.field.nameEn')">
                <InputTextGeneric
                  v-model.trim="form.nameEn"
                  :placeholder="$t('view.master.saleChannel.placeholder.nameEn')"
                />
              </FormFieldGeneric>
            </div>

            <div class="form-row two-col">
              <FormFieldGeneric :label="$t('common.field.type')" :required="true">
                <DropdownGeneric
                  :modelValue="form.type"
                  :options="typeOptions"
                  optionLabel="label"
                  optionValue="value"
                  :placeholder="$t('common.label.all')"
                  @update:modelValue="form.type = $event"
                />
              </FormFieldGeneric>
              <FormFieldGeneric :label="$t('view.master.saleChannel.field.venue')">
                <InputTextGeneric
                  v-model.trim="form.venue"
                  :placeholder="$t('view.master.saleChannel.placeholder.venue')"
                />
              </FormFieldGeneric>
            </div>

            <div class="form-row two-col">
              <FormFieldGeneric :label="$t('common.label.startDate')">
                <CalendarGeneric v-model="form.startDate" :showClear="true" />
              </FormFieldGeneric>
              <FormFieldGeneric :label="$t('common.label.endDate')">
                <CalendarGeneric v-model="form.endDate" :showClear="true" :minDate="minEndDate" />
              </FormFieldGeneric>
            </div>

            <div class="form-row">
              <div class="checkbox-group">
                <CheckboxGeneric v-model="form.isDefault" :label="$t('view.master.saleChannel.field.isDefault')" />
                <CheckboxGeneric v-model="form.isActive" :label="$t('view.master.saleChannel.field.isActiveLabel')" />
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
import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'
import { warning, success } from '@/services/alert/sweetAlerts.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { formatISOString } from '@/services/utils/dayjs.js'
import { useSaleChannelMasterStore } from '@/stores/modules/api/master/sale-channel-store.js'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

const defaultForm = () => ({
  code: null,
  nameTh: null,
  nameEn: null,
  type: null,
  venue: null,
  startDate: null,
  endDate: null,
  isDefault: false,
  isActive: true,
  sortOrder: null
})

export default {
  name: 'SaleChannelUpsertView',

  components: {
    modal,
    FormFieldGeneric,
    InputTextGeneric,
    ButtonGeneric,
    SectionCardGeneric,
    DropdownGeneric,
    CheckboxGeneric,
    CalendarGeneric
  },

  setup() {
    const saleChannelStore = useSaleChannelMasterStore()
    return { saleChannelStore }
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
    minEndDate() {
      return this.form.startDate ? new Date(this.form.startDate) : null
    },
    typeOptions() {
      return [
        { value: 'SHOP', label: this.$t('view.master.saleChannel.type.shop') },
        { value: 'FAIR', label: this.$t('view.master.saleChannel.type.fair') },
        { value: 'ONLINE', label: this.$t('view.master.saleChannel.type.online') },
        { value: 'EXPORT', label: this.$t('view.master.saleChannel.type.export') },
        { value: 'OTHER', label: this.$t('view.master.saleChannel.type.other') }
      ]
    }
  },

  watch: {
    isShow(val) {
      if (val) {
        if (this.modelData) {
          this.form = {
            ...defaultForm(),
            ...this.modelData,
            startDate: this.modelData.startDate ? new Date(this.modelData.startDate) : null,
            endDate: this.modelData.endDate ? new Date(this.modelData.endDate) : null
          }
        } else {
          this.form = defaultForm()
        }
      }
    },
    'form.startDate'(newVal) {
      if (newVal && this.form.endDate && new Date(this.form.endDate) < new Date(newVal)) {
        this.form.endDate = null
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

    onSubmit() {
      if (!this.form.code || !this.form.code.trim()) {
        warning(this.$t('view.master.saleChannel.warnCode'), this.$t('common.label.incompleteData'))
        return
      }
      if (!this.form.nameTh || !this.form.nameTh.trim()) {
        warning(this.$t('view.master.saleChannel.warnName'), this.$t('common.label.incompleteData'))
        return
      }
      if (!this.form.type) {
        warning(this.$t('view.master.saleChannel.warnType'), this.$t('common.label.incompleteData'))
        return
      }

      confirmThenSubmit(
        `${this.form.code} : ${this.form.nameTh}`,
        this.isEditMode
          ? this.$t('view.master.saleChannel.confirm.update')
          : this.$t('view.master.saleChannel.confirm.create'),
        async () => {
          await this.submit()
        }
      )
    },

    async submit() {
      const param = {
        ...this.form,
        startDate: this.form.startDate ? formatISOString(this.form.startDate) : null,
        endDate: this.form.endDate ? formatISOString(this.form.endDate) : null
      }

      if (this.isEditMode) {
        await this.saleChannelStore.update(param)
      } else {
        await this.saleChannelStore.create(param)
      }

      success(this.$t('view.master.saleChannel.saveSuccess'))
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
