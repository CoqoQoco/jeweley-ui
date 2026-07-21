<template>
  <SearchBarGeneric
    :title="$t('view.production.planCompletedAllGold.searchTitle')"
    :description="$t('view.production.planCompletedAllGold.searchDesc')"
    @search="onSearch"
    @clear="onClear"
  >
    <template #fields>
      <div>
        <span class="title-text">{{ $t('view.production.planCompletedAllGold.createDate') }}</span>
        <DateRangeGeneric
          :startDate="form.start"
          :endDate="form.end"
          :startPlaceholder="$t('view.production.planCompletedAllGold.placeholderStart')"
          :endPlaceholder="$t('view.production.planCompletedAllGold.placeholderEnd')"
          @update:startDate="form.start = $event"
          @update:endDate="form.end = $event"
        />
      </div>

      <div>
        <span class="title-text">W.O.</span>
        <InputTextGeneric
          ref="inputText"
          id="inputText"
          v-model="form.text"
          :trim="true"
          placeholder="EX: 202502211"
          icon="bi-upc-scan"
        />
      </div>
    </template>

    <template #actions-right>
      <ButtonGeneric variant="main" icon="bi-search" type="submit" :label="$t('common.btn.search')" />
      <ButtonGeneric
        variant="sub-main"
        icon="bi-zoom-in"
        class="ml-2"
        :title="$t('view.production.planCompletedAllGold.advancedSearch')"
        @click="onShowDialog"
      />
      <ButtonGeneric variant="dark" icon="bi-x-circle" class="ml-2" :title="$t('common.btn.clear')" @click="onClear" />
      <ButtonGeneric
        variant="green"
        icon="bi-filetype-csv"
        class="ml-2"
        :title="$t('common.btn.export')"
        :disabled="!planCompletedStore.dataPlanCompleted.total"
        @click="onExport"
      />
    </template>
  </SearchBarGeneric>

  <dialogView
    :isShow="isShow.dialog"
    @closeDialog="closeDialog"
    @search="dialogSearch"
    :txtHeader="$t('view.production.planCompletedAllGold.advancedSearch')"
  >
    <template #content>
      <div class="form-col-container">
        <div>
          <span class="title-text">{{ $t('view.production.planCompletedAllGold.statusDate') }}</span>
          <DateRangeGeneric
            :startDate="form.sendStart"
            :endDate="form.sendEnd"
            :startPlaceholder="$t('view.production.planCompletedAllGold.placeholderStart')"
            :endPlaceholder="$t('view.production.planCompletedAllGold.placeholderEnd')"
            @update:startDate="form.sendStart = $event"
            @update:endDate="form.sendEnd = $event"
          />
        </div>

        <div>
          <span class="title-text">{{ $t('view.production.planCompletedAllGold.mold') }}</span>
          <InputTextGeneric v-model.trim="form.mold" />
        </div>

        <div>
          <span class="title-text">{{ $t('view.production.planCompletedAllGold.planTarget') }}</span>
          <DropdownGeneric
            v-model="form.isOverPlan"
            :options="overPlanOptions"
            optionLabel="description"
          />
        </div>

        <div>
          <span class="title-text">{{ $t('view.production.planCompletedAllGold.customerCode') }}</span>
          <InputTextGeneric v-model.trim="form.customerCode" />
        </div>

        <div>
          <span class="title-text">{{ $t('view.production.planCompletedAllGold.customerType') }}</span>
          <div>
            <MultiSelectGeneric
              v-model="form.customerType"
              :options="customerType"
              optionLabel="nameTh"
              optionValue="code"
            />
          </div>
        </div>

        <div>
          <span class="title-text">{{ $t('view.production.planCompletedAllGold.productType') }}</span>
          <div>
            <MultiSelectGeneric
              v-model="form.productType"
              :options="productType"
              optionLabel="nameTh"
              optionValue="code"
            />
          </div>
        </div>

        <div>
          <span class="title-text">{{ $t('view.production.planCompletedAllGold.productCode') }}</span>
          <InputTextGeneric v-model.trim="form.productNumber" />
        </div>

        <div>
          <span class="title-text">{{ $t('view.production.planCompletedAllGold.goldColor') }}</span>
          <div>
            <MultiSelectGeneric
              v-model="form.gold"
              :options="gold"
              optionLabel="nameTh"
              optionValue="nameEn"
            />
          </div>
        </div>

        <div>
          <span class="title-text">{{ $t('view.production.planCompletedAllGold.goldType') }}</span>
          <div>
            <MultiSelectGeneric
              v-model="form.goldSize"
              :options="goldSize"
              optionLabel="nameTh"
              optionValue="nameEn"
            />
          </div>
        </div>
      </div>
    </template>
  </dialogView>
</template>

<script>
import { defineAsyncComponent } from 'vue'

// External
import { mapState } from 'pinia'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'
import { usePlanSearchApiStore } from '@/stores/modules/api/plan-search-store.js'

// Local
import SearchBarGeneric from '@/components/generic/SearchBarGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import DateRangeGeneric from '@/components/prime-vue/DateRangeGeneric.vue'
import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'

const dialogView = defineAsyncComponent(() => import('@/components/prime-vue/DialogSearchView.vue'))

const interfaceIsShow = {
  dialog: false
}

export default {
  components: {
    SearchBarGeneric,
    ButtonGeneric,
    InputTextGeneric,
    DateRangeGeneric,
    MultiSelectGeneric,
    DropdownGeneric,
    dialogView
  },

  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    },
    masterPlanStatus: {
      type: Array,
      default: () => []
    }
  },

  setup() {
    const planCompletedStore = usePlanSearchApiStore()
    return { planCompletedStore }
  },

  watch: {
    modelForm: {
      handler(val) {
        this.form = { ...val }
      },
      deep: true
    }
  },

  computed: {
    ...mapState(useMasterApiStore, [
      'planStatus',
      'gold',
      'goldSize',
      'customerType',
      'productType',
      'overPlanOptions'
    ])
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
    onExport() {
      this.$emit('export', this.form)
    },
    dialogSearch() {
      this.isShow.dialog = false
      this.$emit('search', this.form)
    },
    onClear() {
      this.$emit('clear')
    },
    onShowDialog() {
      this.isShow.dialog = true
    },
    closeDialog() {
      this.isShow.dialog = false
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.form-col-container {
  display: grid;
  gap: var(--sp-md);
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
}
</style>
