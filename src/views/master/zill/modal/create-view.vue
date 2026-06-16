<template>
  <div>
    <modal :showModal="isShow" @closeModal="closeModal" width="500px" :isShowActionPart="true">
      <template #title>
        <span class="title-text-lg px-3 pt-3 d-block">{{ $t('view.master.zill.createTitle') }}</span>
      </template>

      <template #content>
        <form @submit.prevent="onSubmit" id="form-zill-create">
          <div class="p-3">
            <div class="form-row">
              <FormFieldGeneric :label="$t('common.field.code')" :required="true">
                <InputTextGeneric
                  v-model="form.code"
                  :placeholder="$t('view.master.zill.placeholder.code')"
                  :required="true"
                />
              </FormFieldGeneric>
            </div>

            <div class="form-row">
              <FormFieldGeneric :label="$t('view.master.zill.field.gold')" :required="true">
                <DropdownGeneric
                  :modelValue="form.gold"
                  :options="masterGold"
                  optionLabel="description"
                  :showClear="true"
                  @update:modelValue="form.gold = $event"
                />
              </FormFieldGeneric>
            </div>

            <div class="form-row">
              <FormFieldGeneric :label="$t('view.master.zill.field.goldSize')" :required="true">
                <DropdownGeneric
                  :modelValue="form.goldSize"
                  :options="masterGoldSize"
                  optionLabel="description"
                  :showClear="true"
                  @update:modelValue="form.goldSize = $event"
                />
              </FormFieldGeneric>
            </div>

            <div class="form-row">
              <FormFieldGeneric :label="$t('view.master.zill.field.description')">
                <InputTextGeneric v-model="form.remark" />
              </FormFieldGeneric>
            </div>
          </div>
        </form>
      </template>

      <template #action>
        <ButtonGeneric variant="main" icon="bi-save" :label="$t('common.btn.save')" type="submit" form="form-zill-create" />
        <ButtonGeneric variant="outline" :label="$t('common.btn.cancel')" class="ml-2" @click="closeModal" />
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import { warning } from '@/services/alert/sweetAlerts.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

import { useMasterApiStore } from '@/stores/modules/api/master-store.js'

const interfaceForm = {
  code: null,
  gold: null,
  goldSize: null,
  remark: null
}

export default {
  components: {
    modal,
    InputTextGeneric,
    FormFieldGeneric,
    ButtonGeneric,
    DropdownGeneric
  },

  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    modelMasterGold: {
      type: Array,
      default: () => []
    },
    modelMasterGoldSize: {
      type: Array,
      default: () => []
    }
  },

  setup() {
    const masterStore = useMasterApiStore()
    return { masterStore }
  },

  computed: {
    masterGold() {
      return this.modelMasterGold
    },
    masterGoldSize() {
      return this.modelMasterGoldSize
    }
  },

  data() {
    return {
      form: { ...interfaceForm }
    }
  },

  methods: {
    validateForm() {
      if (!this.form.gold) {
        warning(this.$t('view.master.zill.field.gold'), this.$t('common.label.noData'))
        return false
      }
      if (!this.form.goldSize) {
        warning(this.$t('view.master.zill.field.goldSize'), this.$t('common.label.noData'))
        return false
      }
      return true
    },

    closeModal() {
      this.onClear()
      this.$emit('closeModal')
    },

    onSubmit() {
      if (!this.validateForm()) return
      confirmThenSubmit(
        `${this.form.code}`,
        this.$t('view.master.zill.confirm.create'),
        async () => {
          await this.submit()
        }
      )
    },

    onClear() {
      this.form = { ...interfaceForm }
    },

    async submit() {
      const param = {
        type: 'ZILL',
        code: this.form.code,
        nameTh: this.form.code,
        nameEn: this.form.code,
        description: this.form.remark,
        goldCode: this.form.gold.code,
        goldSizeCode: this.form.goldSize.code
      }
      const res = await this.masterStore.createMaster({
        formValue: param,
        skipLoading: false
      })

      if (res) {
        this.onClear()
        this.$emit('fetch', this.form)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';

.form-row {
  margin-bottom: 12px;
}
</style>
