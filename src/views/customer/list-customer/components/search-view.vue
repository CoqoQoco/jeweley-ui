<template>
  <SearchBarGeneric :title="$t('view.customer.searchTitle')" :description="$t('view.customer.searchDesc')" @search="onSearch" @clear="onClear">
    <template #header-actions>
      <ButtonGeneric variant="green" icon="bi-database-fill-add" :label="$t('view.customer.createBtn')" @click="onCreate" />
    </template>

    <template #fields>
      <div>
        <span class="title-text">{{ $t('common.field.name') }}</span>
        <InputTextGeneric
          v-model.trim="form.text"
          :placeholder="$t('view.customer.placeholder.search')"
          :bgInput="true"
        />
      </div>
      <div>
        <span class="title-text">{{ $t('view.customer.field.customerType') }}</span>
        <MultiSelectGeneric
          v-model="form.typeCodes"
          :options="masterCustomerType"
          optionLabel="description"
          optionValue="code"
          :placeholder="$t('view.customer.placeholder.customerTypeFilter')"
          :showClear="true"
        />
      </div>
      <div>
        <span class="title-text">{{ $t('view.customer.field.discount') }}</span>
        <div class="discount-range">
          <InputTextGeneric
            v-model.number="form.discountMin"
            type="number"
            :min="0"
            :max="99"
            :placeholder="$t('view.customer.placeholder.discountMin')"
          />
          <span class="range-separator">–</span>
          <InputTextGeneric
            v-model.number="form.discountMax"
            type="number"
            :min="0"
            :max="99"
            :placeholder="$t('view.customer.placeholder.discountMax')"
          />
        </div>
      </div>
    </template>

    <template #actions-right>
      <ButtonGeneric variant="main" icon="bi-search" type="submit" :title="$t('common.btn.search')" />
      <ButtonGeneric variant="dark" icon="bi-x-circle" class="ml-2" @click="onClear" :title="$t('common.btn.clear')" />
    </template>
  </SearchBarGeneric>

  <createView
    :isShow="isShow.add"
    :masterCustomer="masterCustomerType"
    @closeModal="onCloseModal"
  />
</template>

<script>
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'

import SearchBarGeneric from '@/components/generic/SearchBarGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'
import createView from '../modal/create-view.vue'

const interfaceIsShow = {
  add: false
}

export default {
  components: {
    SearchBarGeneric,
    InputTextGeneric,
    ButtonGeneric,
    MultiSelectGeneric,
    createView
  },

  setup() {
    const masterStore = useMasterApiStore()
    return { masterStore }
  },

  emits: ['search', 'clear', 'update:modelForm'],

  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    }
  },

  computed: {
    masterCustomerType() {
      return this.masterStore.customerType
    }
  },

  watch: {
    modelForm: {
      handler(val) {
        this.form = { ...val }
      },
      deep: true
    }
  },

  data() {
    return {
      form: { ...this.modelForm },
      isShow: { ...interfaceIsShow }
    }
  },

  methods: {
    onSearch() {
      this.$emit('search', this.form)
    },
    onClear() {
      this.$emit('clear')
    },
    onCloseModal() {
      this.isShow = { ...interfaceIsShow }
    },
    onCreate() {
      this.isShow.add = true
    }
  },

  created() {
    this.$nextTick(async () => {
      await this.masterStore.fetchCustomerType()
    })
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.discount-range {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);

  .range-separator {
    flex-shrink: 0;
    color: var(--base-font-color);
    font-weight: 600;
  }
}
</style>
