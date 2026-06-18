<template>
  <div>
    <modal
      :showModal="isShow"
      @closeModal="closeModal"
      width="600px"
      :isShowActionPart="true"
    >
      <template #title>
        <span class="title-text-lg px-3 pt-3 d-block">
          {{ isEditMode ? $t('view.stock.location.editTitle') : $t('view.stock.location.createTitle') }}
        </span>
      </template>

      <template #content>
        <div class="p-3">
          <div class="form-row two-col">
            <div class="form-field">
              <span class="title-text">{{ $t('view.stock.location.code') }} <span class="text-danger">*</span></span>
              <input
                type="text"
                class="form-control"
                v-model.trim="form.code"
                :placeholder="$t('view.stock.location.codePlaceholder')"
                :disabled="isEditMode"
              />
            </div>
            <div class="form-field">
              <span class="title-text">{{ $t('view.stock.location.sortOrder') }}</span>
              <input
                type="number"
                class="form-control"
                v-model.number="form.sortOrder"
                placeholder="1"
                min="0"
              />
            </div>
          </div>

          <div class="form-row two-col">
            <div class="form-field">
              <span class="title-text">{{ $t('view.stock.location.nameTh') }} <span class="text-danger">*</span></span>
              <input
                type="text"
                class="form-control"
                v-model.trim="form.nameTh"
                :placeholder="$t('view.stock.location.namePlaceholder')"
              />
            </div>
            <div class="form-field">
              <span class="title-text">{{ $t('view.stock.location.nameEn') }}</span>
              <input
                type="text"
                class="form-control"
                v-model.trim="form.nameEn"
                :placeholder="$t('view.stock.location.placeholder.nameEn')"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-field">
              <span class="title-text">{{ $t('view.stock.location.locType') }}</span>
              <DropdownGeneric
                :modelValue="form.type"
                :options="typeOptions"
                optionLabel="label"
                optionValue="value"
                :placeholder="$t('common.label.all')"
                :showClear="true"
                @update:modelValue="form.type = $event"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="checkbox-group">
              <CheckboxGeneric v-model="form.isSalesPoint" :label="$t('view.stock.location.isSalesPoint')" />
              <CheckboxGeneric v-model="form.isTemporary" :label="$t('view.stock.location.isTemporary')" />
              <CheckboxGeneric v-model="form.isActive" :label="$t('view.stock.location.isActiveLabel')" />
            </div>
          </div>
        </div>
      </template>

      <template #action>
        <button class="btn btn-sm btn-main" type="button" @click="onSubmit">
          <i class="bi bi-save"></i> {{ $t('common.btn.save') }}
        </button>
        <button class="btn btn-sm btn-outline-main ml-2" type="button" @click="closeModal">
          {{ $t('common.btn.cancel') }}
        </button>
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
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
  margin-bottom: 16px;

  &.two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;

    @media (max-width: 600px) {
      grid-template-columns: 1fr;
    }
  }
}

.form-field {
  width: 100%;

  .title-text {
    display: block;
    margin-bottom: 6px;
  }
}

input.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--fs-base);
  line-height: var(--lh-sm);

  &:focus {
    border-color: var(--base-font-color);
    box-shadow: none;
    outline: none;
  }

  &:disabled {
    background: #f8f9fa;
    cursor: not-allowed;
  }
}

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2xl);
  align-items: center;
}
</style>
