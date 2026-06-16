<template>
  <div class="filter-container-searchBar">
    <form @submit.prevent="onSearch">
      <div>
        <pageTitle
          :title="$t('view.worker.workerList.searchTitle')"
          :description="$t('view.worker.workerList.searchDescription')"
          :isShowBtnClose="true"
          :isShowRightSlot="true"
        >
          <template #rightSlot>
            <button class="btn btn-sm btn-main mr-2" type="button" @click="onCreate" :title="$t('common.btn.create')">
              <span><i class="bi bi-database-fill-add"></i></span>
            </button>
          </template>
        </pageTitle>

        <div class="form-col-container">
          <!-- text -->
          <div>
            <span class="title-text">{{ $t('view.worker.workerList.fieldSearch') }}</span>
            <input
              class="form-control bg-input"
              type="text"
              v-model.trim="form.text"
              :placeholder="$t('view.worker.workerList.fieldSearchPlaceholder')"
            />
          </div>

          <!-- type -->
          <div>
            <span class="title-text">{{ $t('view.worker.workerList.fieldDept') }}</span>
            <DropdownGeneric
              v-model="form.type"
              :options="masterWorkerProductionType"
              optionLabel="description"
              optionValue="id"
              :showClear="!!form.type"
              :placeholder="$t('view.worker.workerList.fieldDeptPlaceholder')"
            />
          </div>
          <div></div>
          <div></div>
        </div>

        <div class="btn-submit-container-between">
          <div></div>
          <div>
            <button class="btn btn-sm btn-main mr-2" type="submit" :title="$t('common.btn.search')">
              <span><i class="bi bi-search"></i></span>
            </button>
            <button class="btn btn-sm btn-dark mr-2" type="button" @click="onClear" :title="$t('common.btn.clear')">
              <span><i class="bi bi-x-circle"></i></span>
            </button>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const pageTitle = defineAsyncComponent(() => import('@/components/custom/page-title.vue'))
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'

import { useMasterApiStore } from '@/stores/modules/api/master-store.js'

export default {
  components: {
    pageTitle,
    DropdownGeneric
  },

  setup() {
    const masterStore = useMasterApiStore()
    return { masterStore }
  },

  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    }
  },

  computed: {
    masterWorkerProductionType() {
      return this.masterStore.workerType
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
    onCreate() {
      this.$emit('create')
    },
    onClear() {
      this.$emit('clear')
    }
  },

  created() {
    this.$nextTick(async () => {
      await this.masterStore.fetchWorkerType()
    })
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
