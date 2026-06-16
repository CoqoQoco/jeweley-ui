<template>
  <div class="form-container">
    <modal :showModal="isShow" @closeModal="closeModal" width="1000px">
      <template v-slot:content>
        <form @submit.prevent="onSubmit" class="form-content-container">
          <div class="mb-2">
            <span class="txt-title-modal">{{ $t('planUpdate.addMaterial') }}</span>
          </div>
          <div class="mb-2 txt-title-part">
            <span><i class="bi bi-clipboard2-plus-fill mr-2"></i></span>
            <span>{{ $t('planUpdate.goldSection') }}</span>
          </div>
          <div class="form-content-row-container">
            <div>
              <span class="txt-title">{{ $t('planUpdate.goldColor') }}</span>
              <DropdownGeneric
                :modelValue="form.gold"
                :options="masterGold"
                optionLabel="description"
                :showClear="form.gold && form.gold.code ? true : false"
                :class="val.isValGold === true ? `p-invalid` : ``"
                @update:modelValue="form.gold = $event"
              />
            </div>
            <div class="form-content-row-sub-container">
              <div>
                <span class="txt-title">{{ $t('planUpdate.goldPercent') }}</span>
                <DropdownGeneric
                  :modelValue="form.goldSize"
                  :options="masterGoldSize"
                  optionLabel="description"
                  :showClear="form.goldSize && form.goldSize.code ? true : false"
                  :class="val.isValGoldSize === true ? `p-invalid` : ``"
                  @update:modelValue="form.goldSize = $event"
                />
              </div>
              <div>
                <span class="txt-title">{{ $t('planUpdate.goldQty') }}</span>
                <InputTextGeneric v-model.number="form.goldQty" type="number" :min="1" />
              </div>
            </div>
          </div>
          <div class="mb-2 mt-3 txt-title-part">
            <span><i class="bi bi-clipboard2-plus-fill mr-2"></i></span>
            <span>{{ $t('planUpdate.gemSection') }}</span>
          </div>
          <div class="form-content-row-container">
            <div>
              <span class="txt-title">{{ $t('planUpdate.gemType') }}</span>
              <DropdownGeneric
                :modelValue="form.gem"
                :options="masterGem"
                optionLabel="description"
                :showClear="form.gem && form.gem.code ? true : false"
                :class="val.isValGem === true ? `p-invalid` : ``"
                @update:modelValue="form.gem = $event"
              />
            </div>
            <div>
              <span class="txt-title">{{ $t('planUpdate.gemShape') }}</span>
              <DropdownGeneric
                :modelValue="form.gemShape"
                :options="masterGemShape"
                optionLabel="description"
                :showClear="form.gemShape && form.gemShape.code ? true : false"
                :class="val.isValGemShape === true ? `p-invalid` : ``"
                @update:modelValue="form.gemShape = $event"
              />
            </div>
          </div>
          <div class="form-content-row-container">
            <div>
              <span class="txt-title">{{ $t('planUpdate.gemSize') }}</span>
              <InputTextGeneric v-model="form.gemSize" />
            </div>
            <div class="form-content-row-sub-container">
              <div>
                <span class="txt-title">{{ $t('planUpdate.gemQty') }}</span>
                <InputTextGeneric v-model.number="form.gemQty" type="number" :min="1" />
              </div>
              <div>
                <span class="txt-title">{{ $t('planUpdate.gemUnit') }}</span>
                <InputTextGeneric v-model="form.gemUnit" />
              </div>
            </div>
          </div>
          <div class="mb-2 mt-3 txt-title-part">
            <span><i class="bi bi-clipboard2-plus-fill mr-2"></i></span>
            <span>{{ $t('planUpdate.diamondSection') }}</span>
          </div>
          <div class="form-content-row-container">
            <div>
              <span class="txt-title">{{ $t('planUpdate.diamondSize') }}</span>
              <InputTextGeneric v-model="form.diamondSize" />
            </div>
            <div class="form-content-row-sub-container">
              <div>
                <span class="txt-title">{{ $t('planUpdate.diamondWeight') }}</span>
                <InputTextGeneric v-model="form.diamondWeight" />
              </div>
              <div>
                <span class="txt-title">{{ $t('planUpdate.diamondWeightUnit') }}</span>
                <InputTextGeneric v-model="form.diamondWeightUnit" />
              </div>
            </div>
          </div>
          <div class="form-content-row-container">
            <div>
              <span class="txt-title">{{ $t('planUpdate.diamondQuality') }}</span>
              <InputTextGeneric v-model="form.diamondQuality" />
            </div>
            <div class="form-content-row-sub-container">
              <div>
                <span class="txt-title">{{ $t('planUpdate.diamondQty') }}</span>
                <InputTextGeneric v-model.number="form.diamondQty" type="number" :min="1" />
              </div>
              <div>
                <span class="txt-title">{{ $t('planUpdate.diamondUnit') }}</span>
                <InputTextGeneric v-model="form.diamondUnit" />
              </div>
            </div>
          </div>
          <div class="d-flex justify-content-center mt-3">
            <ButtonGeneric variant="outline" :label="$t('common.btn.cancel')" class="mr-2" type="button" @click="closeModal" />
            <ButtonGeneric variant="main" :label="$t('planUpdate.confirmAddMaterial')" type="submit" />
          </div>
        </form>
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { success } from '@/services/alert/sweetAlerts.js'

import api from '@/axios/axios-helper.js'

import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

const interfaceForm = {
  gold: {
    id: null,
    code: null,
    nameTh: null,
    nameEn: null,
    description: null
  },
  goldSize: {
    id: null,
    code: null,
    nameTh: null,
    nameEn: null,
    description: null
  },
  goldQty: null,
  gem: null,
  gemShape: null,
  gemQty: null,
  gemUnit: 'pcs',
  gemWeight: null,
  gemWeightUnit: 'ct.',
  gemSize: null,
  diamondQty: null,
  diamondUnit: 'pcs',
  diamondQuality: null,
  diamondWeight: null,
  diamondWeightUnit: 'ct.',
  diamondSize: null
}
const interfaceIsValid = {
  isValGold: false,
  isValGoldSize: false,
  isValGem: false,
  isValGemShape: false
}

export default {
  components: {
    modal,
    DropdownGeneric,
    InputTextGeneric,
    ButtonGeneric
  },
  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    modelValue: {
      type: Object,
      required: true,
      default: () => {}
    },
    masterGold: {
      type: Array,
      required: true,
      default: () => []
    },
    masterGoldSize: {
      type: Array,
      required: true,
      default: () => []
    },
    masterGem: {
      type: Array,
      required: true,
      default: () => []
    },
    masterGemShape: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  data() {
    return {
      form: { ...interfaceForm },
      val: { ...interfaceIsValid }
    }
  },
  methods: {
    closeModal() {
      this.form = { ...interfaceForm }
      this.val = { ...interfaceIsValid }
      this.$emit('closeModal')
    },
    onSubmit() {
      if (this.validateForm()) {
        confirmThenSubmit(
          ``,
          this.$t('planUpdate.confirmAddMaterial'),
          async () => {
            await this.submit()
          }
        )
      }
    },
    validateForm() {
      if (!this.form.gold.id) {
        this.val = { isValGold: true }
        return false
      }
      if (!this.form.goldSize.id) {
        this.val = { isValGoldSize: true }
        return false
      }
      return true
    },

    async submit() {
      const params = {
        id: this.modelValue.id,
        wo: this.modelValue.wo,
        woNumber: this.modelValue.woNumber,
        material: { ...this.form }
      }
      const res = await api.jewelry.post('ProductionPlan/ProductionPlanUpdateMaterial', params)
      if (res) {
        success(
          ``,
          '',
          async () => {
            this.form = { ...interfaceForm }
            this.val = { ...interfaceIsValid }
            this.$emit('fetch')
          }
        )
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.form-content-container {
  padding: var(--sp-xl);
  overflow: auto;
  height: 570px;
}
.form-content-row-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-xl);
  padding: 0 var(--sp-xl);
  margin-bottom: var(--sp-lg);
}
.form-content-row-sub-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-md);
}
.txt-title-modal {
  padding: var(--sp-xl);
  font-size: var(--fs-xl);
  color: var(--base-font-color);
}
.txt-title-part {
  padding-left: var(--sp-xl);
  padding-top: var(--sp-md);
  font-size: var(--fs-base);
  color: var(--base-font-color);
}
.txt-title {
  font-size: var(--fs-sm);
}
</style>
