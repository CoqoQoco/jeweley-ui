<template>
  <SearchBarGeneric :title="$t('view.master.gem.searchTitle')" @search="onSubmit" @clear="onClear">
    <template #header-actions>
      <ButtonGeneric variant="green" icon="bi-database-fill-add" :label="$t('view.master.gem.createBtn')" @click="onCreate" />
    </template>

    <template #fields>
      <div>
        <span class="title-text">{{ $t('common.btn.search') }}</span>
        <InputTextGeneric
          v-model.trim="form.text"
          :placeholder="$t('view.master.gem.placeholder.search')"
          :bgInput="true"
        />
      </div>
    </template>

    <template #actions-right>
      <ButtonGeneric variant="main" icon="bi-search" type="submit" :title="$t('common.btn.search')" />
      <ButtonGeneric variant="dark" icon="bi-x-circle" class="ml-2" @click="onClear" :title="$t('common.btn.clear')" />
    </template>
  </SearchBarGeneric>

  <addView :isShow="isShow.add" @closeModal="closeModal" />
</template>

<script>
import SearchBarGeneric from '@/components/generic/SearchBarGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

import addView from '../modal/create-view.vue'

const interfaceIsShowModal = {
  add: false
}

export default {
  components: {
    SearchBarGeneric,
    InputTextGeneric,
    ButtonGeneric,
    addView
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
      isShow: { ...interfaceIsShowModal },
      form: { ...this.modelForm }
    }
  },

  methods: {
    onSubmit() {
      this.$emit('search', this.form)
    },
    onClear() {
      this.$emit('clear')
    },
    onCreate() {
      this.isShow.add = true
    },
    closeModal(event) {
      this.isShow = { ...interfaceIsShowModal }

      if (event === 'fetch') {
        this.$emit('search', this.form)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
