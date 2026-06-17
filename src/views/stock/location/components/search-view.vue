<template>
  <div class="filter-container-searchBar">
    <form @submit.prevent="onSearch">
      <div>
        <pageTitle :title="$t('view.stock.location.searchTitle')" :isShowBtnClose="false" />

        <div class="form-col-container">
          <div>
            <span class="title-text">{{ $t('view.stock.location.code') }}</span>
            <input
              class="form-control bg-input"
              type="text"
              v-model.trim="form.code"
              :placeholder="$t('view.stock.location.codePlaceholder')"
            />
          </div>

          <div>
            <span class="title-text">{{ $t('view.stock.location.name') }}</span>
            <input
              class="form-control bg-input"
              type="text"
              v-model.trim="form.nameTh"
              :placeholder="$t('view.stock.location.namePlaceholder')"
            />
          </div>

          <div>
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

          <div>
            <span class="title-text">{{ $t('view.stock.location.isActive') }}</span>
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
        </div>

        <div class="btn-submit-container-between">
          <div></div>
          <div>
            <button class="btn btn-sm btn-green" type="submit" :title="$t('common.btn.search')">
              <i class="bi bi-search"></i>
            </button>
            <button class="btn btn-sm btn-dark ml-2" type="button" @click="onClear" :title="$t('common.btn.clear')">
              <i class="bi bi-x-circle"></i>
            </button>
            <button
              class="btn btn-sm btn-main ml-2"
              type="button"
              :title="$t('common.btn.create')"
              @click="$emit('create')"
            >
              <i class="bi bi-plus"></i>
            </button>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'

const pageTitle = defineAsyncComponent(() => import('@/components/custom/page-title.vue'))

const interfaceForm = {
  code: null,
  nameTh: null,
  type: null,
  isActive: null
}

export default {
  name: 'LocationSearchView',

  components: {
    pageTitle,
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
        { value: 'WAREHOUSE', label: this.$t('view.stock.location.warehouse') },
        { value: 'SHOWROOM', label: this.$t('view.stock.location.showroom') },
        { value: 'BRANCH', label: this.$t('view.stock.location.branch') },
        { value: 'TEMP', label: this.$t('view.stock.location.temp') }
      ]
    },
    statusOptions() {
      return [
        { value: true, label: this.$t('view.stock.location.active') },
        { value: false, label: this.$t('view.stock.location.inactive') }
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
      form: { ...interfaceForm }
    }
  },

  methods: {
    onSearch() {
      this.$emit('search', this.form)
    },
    onClear() {
      this.$emit('clear')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
