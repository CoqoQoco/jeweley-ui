<template>
  <SearchBarGeneric :title="$t('view.customer.searchTitle')" @search="onSearch" @clear="onClear">
    <template #fields>
      <div>
        <span class="title-text">{{ $t('common.field.name') }}</span>
        <InputTextGeneric
          v-model.trim="form.text"
          :placeholder="$t('view.customer.placeholder.search')"
          :bgInput="true"
        />
      </div>
    </template>

    <template #actions-right>
      <ButtonGeneric variant="main" icon="bi-search" type="submit" :title="$t('common.btn.search')" />
      <ButtonGeneric variant="dark" icon="bi-x-circle" class="ml-2" @click="onClear" :title="$t('common.btn.clear')" />
      <ButtonGeneric variant="main" icon="bi-database-fill-add" class="ml-2" @click="onCreate" :title="$t('view.customer.createBtn')" />
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
import createView from '../modal/create-view.vue'

const interfaceIsShow = {
  add: false
}

export default {
  components: {
    SearchBarGeneric,
    InputTextGeneric,
    ButtonGeneric,
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
</style>
