<template>
  <SearchBarGeneric :title="$t('view.master.diamondGrade.searchTitle')" @search="onSearch" @clear="onClear">
    <template #header-actions>
      <ButtonGeneric variant="green" icon="bi-database-fill-add" :label="$t('view.master.diamondGrade.createBtn')" @click="onCreate" />
    </template>

    <template #fields>
      <div>
        <span class="title-text">{{ $t('common.btn.search') }}</span>
        <InputTextGeneric
          v-model.trim="form.text"
          :placeholder="$t('view.master.diamondGrade.placeholder.search')"
          :bgInput="true"
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

export default {
  components: {
    SearchBarGeneric,
    InputTextGeneric,
    ButtonGeneric
  },

  props: {
    modelForm: {
      type: Object,
      default: () => ({})
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
      form: { ...this.modelForm }
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
