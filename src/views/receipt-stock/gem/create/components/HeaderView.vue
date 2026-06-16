<template>
  <div class="filter-container">
    <pageTitle
      :title="$t('view.receiptStock.gem.create.title')"
      :description="$t('view.receiptStock.gem.create.description')"
      :isShowBtnClose="false"
      :isShowRightSlot="true"
    >
      <template #rightSlot>
        <div>
          <button class="btn btn-sm btn-main" @click="onShowCreate">
            <i class="bi bi-pencil"></i>
            <span class="ml-2">{{ $t('view.receiptStock.gem.create.createCode') }}</span>
          </button>
        </div>
      </template>
    </pageTitle>
    <form @submit.prevent="onSubmit">
      <div class="form-col-container">
        <div>
          <span class="title-text">{{ $t('common.field.code') }}</span>
          <InputTextGeneric v-model="form.code" />
        </div>
        <div>
          <span class="title-text">{{ $t('view.receiptStock.gem.create.groupName') }}</span>
          <MultiSelectGeneric
            v-model="form.groupName"
            :options="groupOptions"
            optionLabel="value"
            optionValue="value"
          />
        </div>
        <div>
          <span class="title-text">{{ $t('view.receiptStock.gem.create.size') }}</span>
          <MultiSelectGeneric
            v-model="form.size"
            :options="sizeOptions"
            optionLabel="value"
            optionValue="value"
          />
        </div>
        <div>
          <span class="title-text">{{ $t('view.receiptStock.gem.create.shape') }}</span>
          <MultiSelectGeneric
            v-model="form.shape"
            :options="shapeOptions"
            optionLabel="value"
            optionValue="value"
          />
        </div>
      </div>
      <div class="btn-submit-container">
        <button class="btn btn-sm btn-main mr-2" type="submit">
          <span><i class="bi bi-search mr-2"></i></span>
          <span>{{ $t('common.btn.search') }}</span>
        </button>
        <button class="btn btn-sm btn-dark" type="button" @click="onClear">
          <span><i class="bi bi-x mr-2"></i></span>
          <span>{{ $t('common.btn.clear') }}</span>
        </button>
      </div>
    </form>

    <createView :isShow="isShow.isCreate" @closeModal="onCloseModal"></createView>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

import api from '@/axios/axios-helper.js'
import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import createView from './CreateView.vue'

const pageTitle = defineAsyncComponent(() => import('@/components/custom/page-title.vue'))

const interfaceIsShow = {
  isCreate: false
}

export default {
  components: {
    pageTitle,
    MultiSelectGeneric,
    InputTextGeneric,
    createView
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
      isShow: { ...interfaceIsShow },

      form: { ...this.modelForm },
      groupOptions: [],
      gradeOptions: [],
      shapeOptions: [],
      sizeOptions: []
    }
  },
  methods: {
    onSubmit() {
      this.$emit('search', this.form)
    },
    onClear() {
      this.$emit('clear')
    },
    // ---------------- event
    onCloseModal() {
      this.isShow = { ...interfaceIsShow }
    },
    onShowCreate() {
      this.isShow.isCreate = true
    },

    async fetchGroupOptions() {
      const res = await api.jewelry.post('StockGem/GroupGemData', { type: 'GROUPGEM', Value: null })
      if (res) {
        this.groupOptions = [...res]
      }
    },
    async fetchShapeOptions() {
      const res = await api.jewelry.post('StockGem/GroupGemData', { type: 'SHAPE', Value: null })
      if (res) {
        this.shapeOptions = [...res]
      }
    },
    async fetchSizeOption() {
      const res = await api.jewelry.post('StockGem/GroupGemData', { type: 'SIZE', Value: null })
      if (res) {
        this.sizeOptions = [...res]
      }
    },
    async fetchGradeOption() {
      const res = await api.jewelry.post('StockGem/GroupGemData', { type: 'GRADE', Value: null })
      if (res) {
        this.gradeOptions = [...res]
      }
    }
  },
  created() {
    this.$nextTick(() => {
      this.fetchGroupOptions()
      this.fetchSizeOption()
      this.fetchGradeOption()
      this.fetchShapeOptions()
    })
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/custom-style/standard-form.scss';

.header-bar-container {
  display: grid;
  grid-template-columns: 2fr 2fr 2fr 2fr;
  gap: var(--sp-sm);
  margin-bottom: var(--sp-sm);
}
</style>
