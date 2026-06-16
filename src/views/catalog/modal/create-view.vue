<template>
  <div class="app-container-modal">
    <modal :showModal="isShow" @closeModal="closeModal" width="550px" :isShowActionPart="true">
      <template #title>
        <span class="title-text-lg px-3 pt-3 d-block">{{ $t('view.catalog.createTitle') }}</span>
      </template>

      <template #content>
        <form @submit.prevent="onSubmit" id="form-catalog-create">
          <div class="p-3">
            <div class="form-row">
              <FormFieldGeneric :label="$t('view.catalog.field.code')" :required="true">
                <InputTextGeneric
                  v-model="form.code"
                  :placeholder="$t('view.catalog.placeholder.code')"
                  :required="true"
                />
              </FormFieldGeneric>
            </div>

            <div class="form-row">
              <FormFieldGeneric :label="$t('view.catalog.field.nameTh')" :required="true">
                <InputTextGeneric
                  v-model="form.nameTh"
                  :placeholder="$t('view.catalog.placeholder.nameTh')"
                  :required="true"
                />
              </FormFieldGeneric>
            </div>

            <div class="form-row">
              <FormFieldGeneric :label="$t('view.catalog.field.nameEn')">
                <InputTextGeneric
                  v-model="form.nameEn"
                  :placeholder="$t('view.catalog.placeholder.nameEn')"
                />
              </FormFieldGeneric>
            </div>

            <div class="form-row">
              <FormFieldGeneric :label="$t('view.catalog.field.headerLabel')">
                <InputTextGeneric
                  v-model="form.headerLabel"
                  :placeholder="$t('view.catalog.placeholder.headerLabel')"
                />
              </FormFieldGeneric>
            </div>

            <div class="form-row">
              <FormFieldGeneric :label="$t('view.catalog.field.collectionTitle')">
                <InputTextGeneric
                  v-model="form.collectionTitle"
                  :placeholder="$t('view.catalog.placeholder.collectionTitle')"
                />
              </FormFieldGeneric>
            </div>
          </div>
        </form>
      </template>

      <template #action>
        <ButtonGeneric variant="main" icon="bi-save" :label="$t('common.btn.save')" type="submit" form="form-catalog-create" />
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
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { success } from '@/services/alert/sweetAlerts.js'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

import { useCatalogStore } from '@/stores/modules/api/catalog-store.js'

const interfaceForm = {
  code: null,
  nameTh: null,
  nameEn: null,
  headerLabel: null,
  collectionTitle: null
}

export default {
  components: { modal, InputTextGeneric, FormFieldGeneric, ButtonGeneric },
  props: {
    isShow: {
      type: Boolean,
      default: false
    }
  },

  setup() {
    const catalogStore = useCatalogStore()
    return { catalogStore }
  },

  data() {
    return {
      form: {
        ...interfaceForm
      }
    }
  },

  methods: {
    closeModal() {
      this.onClear()
      this.$emit('closeModal')
    },
    onSubmit() {
      confirmThenSubmit(
        `${this.form.code} : ${this.form.nameTh}`,
        this.$t('view.catalog.confirm.create'),
        async () => {
          await this.submit()
        }
      )
    },
    async submit() {
      const res = await this.catalogStore.fetchCreate({
        form: {
          code: this.form.code,
          nameTh: this.form.nameTh,
          nameEn: this.form.nameEn,
          headerLabel: this.form.headerLabel,
          collectionTitle: this.form.collectionTitle,
          items: []
        }
      })

      if (res) {
        success(``, ``, async () => {
          this.onClear()
          this.$emit('closeModal', 'fetch')
        })
      }
    },
    onClear() {
      this.form = { ...interfaceForm }
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
