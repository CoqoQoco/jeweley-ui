<template>
  <SearchBarGeneric :title="$t('view.master.saleChannel.searchTitle')" @search="onSearch" @clear="onClear">
    <template #header-actions>
      <ButtonGeneric variant="green" icon="bi-database-fill-add" :label="$t('view.master.saleChannel.createBtn')" @click="onCreate" />
    </template>

    <template #fields>
      <div>
        <span class="title-text">{{ $t('view.master.saleChannel.field.nameOrCode') }}</span>
        <InputTextGeneric
          v-model.trim="form.nameOrCode"
          :placeholder="$t('view.master.saleChannel.placeholder.search')"
          :bgInput="true"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('common.field.type') }}</span>
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

      <div>
        <span class="title-text">{{ $t('common.field.status') }}</span>
        <DropdownGeneric
          :modelValue="form.isActive"
          :options="statusOptions"
          optionLabel="label"
          optionValue="value"
          :placeholder="$t('common.label.all')"
          :showClear="true"
          @update:modelValue="form.isActive = $event"
        />
      </div>
    </template>

    <template #actions-right>
      <ButtonGeneric variant="main" icon="bi-search" type="submit" :title="$t('common.btn.search')" />
      <ButtonGeneric variant="dark" icon="bi-x-circle" class="ml-2" @click="onClear" :title="$t('common.btn.clear')" />
    </template>
  </SearchBarGeneric>
</template>

<script>
import SearchBarGeneric from '@/components/generic/SearchBarGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'

const interfaceForm = {
  nameOrCode: null,
  type: null,
  isActive: null
}

export default {
  name: 'SaleChannelSearchView',

  components: {
    SearchBarGeneric,
    InputTextGeneric,
    ButtonGeneric,
    DropdownGeneric
  },

  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    }
  },

  emits: ['search', 'clear', 'create'],

  computed: {
    typeOptions() {
      return [
        { value: 'SHOP', label: this.$t('view.master.saleChannel.type.shop') },
        { value: 'FAIR', label: this.$t('view.master.saleChannel.type.fair') },
        { value: 'ONLINE', label: this.$t('view.master.saleChannel.type.online') },
        { value: 'EXPORT', label: this.$t('view.master.saleChannel.type.export') },
        { value: 'OTHER', label: this.$t('view.master.saleChannel.type.other') }
      ]
    },
    statusOptions() {
      return [
        { value: true, label: this.$t('view.master.saleChannel.status.active') },
        { value: false, label: this.$t('view.master.saleChannel.status.inactive') }
      ]
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
      form: { ...interfaceForm, ...this.modelForm }
    }
  },

  methods: {
    onSearch() {
      this.$emit('search', this.form)
    },
    onClear() {
      this.$emit('clear')
    },
    onCreate() {
      this.$emit('create')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
