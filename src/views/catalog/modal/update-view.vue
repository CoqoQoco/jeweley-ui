<template>
  <div>
    <modal :showModal="isShow" @closeModal="closeModal" width="550px" :isShowActionPart="true" headerVariant="main">
      <template #title>
        <span class="title-text-lg d-block">{{ `${$t('view.catalog.updateTitle')}: ${model.code}` }}</span>
      </template>

      <template #content>
        <form @submit.prevent="onSubmit" id="form-catalog-update">
          <div class="p-3">
            <SectionCardGeneric class="modal-section">
              <div class="form-row">
                <FormFieldGeneric :label="$t('view.catalog.field.code')">
                  <InputTextGeneric v-model="form.code" :disabled="true" />
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
            </SectionCardGeneric>
          </div>
        </form>
      </template>

      <template #action>
        <ButtonGeneric variant="main" icon="bi-save" :label="$t('common.btn.save')" type="submit" form="form-catalog-update" />
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
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { success } from '@/services/alert/sweetAlerts.js'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

import { useCatalogStore } from '@/stores/modules/api/catalog-store.js'

const interfaceForm = {
  id: null,
  code: null,
  nameTh: null,
  nameEn: null,
  headerLabel: null,
  collectionTitle: null
}

export default {
  components: { modal, InputTextGeneric, FormFieldGeneric, ButtonGeneric, SectionCardGeneric },
  props: {
    isShow: {
      type: Boolean,
      default: false,
      required: true
    },
    modelUpdate: {
      type: Object,
      default: () => ({}),
      required: true
    }
  },

  computed: {
    model() {
      return this.modelUpdate
    }
  },

  watch: {
    modelUpdate: {
      handler(newVal) {
        if (newVal) {
          this.form = { ...newVal }
        } else {
          this.form = { ...interfaceForm }
        }
      },
      deep: true,
      immediate: true
    }
  },

  setup() {
    const catalogStore = useCatalogStore()
    return { catalogStore }
  },

  data() {
    return {
      form: { ...interfaceForm }
    }
  },

  methods: {
    closeModal() {
      this.onClear()
      this.$emit('closeModal')
    },
    onSubmit() {
      confirmThenSubmit(
        `${this.model.code} : ${this.form.nameTh}`,
        this.$t('view.catalog.confirm.update'),
        async () => {
          await this.submit()
        }
      )
    },
    async submit() {
      const currentData = await this.catalogStore.fetchGet({ id: this.form.id })

      const existingItems = currentData && currentData.items ? currentData.items : []

      const res = await this.catalogStore.fetchUpdate({
        form: {
          id: this.form.id,
          code: this.form.code,
          nameTh: this.form.nameTh,
          nameEn: this.form.nameEn,
          headerLabel: this.form.headerLabel,
          collectionTitle: this.form.collectionTitle,
          items: existingItems
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

.modal-section {
  margin-bottom: var(--sp-lg);

  &:last-child {
    margin-bottom: 0;
  }
}
</style>
