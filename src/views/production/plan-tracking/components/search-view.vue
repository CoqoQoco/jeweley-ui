<template>
  <SearchBarGeneric
    :title="$t('view.production.planTracking.searchTitle')"
    :description="$t('view.production.planTracking.searchDesc')"
    @search="onSearch"
    @clear="onClear"
  >
    <template #fields>
      <div>
        <span class="title-text">{{ $t('view.production.planTracking.createDate') }}</span>
        <div class="flex-group">
          <CalendarGeneric
            class="w-100"
            v-model="form.start"
            :max-date="form.end"
            :manualInput="true"
            showIcon
            :placeholder="$t('common.label.start')"
            dateFormat="dd/mm/yy"
          />
          <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
          <CalendarGeneric
            class="w-100"
            v-model="form.end"
            :min-date="form.start"
            showIcon
            :manualInput="true"
            :placeholder="$t('common.label.end')"
            dateFormat="dd/mm/yy"
          />
        </div>
      </div>

      <div>
        <span class="title-text">{{ $t('view.production.planTracking.workOrder') }}</span>
        <InputTextGeneric
          ref="inputText"
          v-model="form.text"
          placeholder="EX: 202502211"
          icon="bi-upc-scan"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.production.planTracking.planStatus') }}</span>
        <MultiSelectGeneric
          v-model="form.status"
          :options="planStatus"
          optionLabel="nameTh"
          optionValue="id"
          :placeholder="$t('common.label.all')"
        />
      </div>
    </template>

    <template #actions-right>
      <ButtonGeneric variant="main" icon="bi-search" type="submit" :label="$t('common.btn.search')" />
      <ButtonGeneric variant="sub-main" icon="bi-zoom-in" class="ml-2" :title="$t('view.production.planTracking.more')" @click="onShowDialog" />
      <ButtonGeneric variant="dark" icon="bi-x-circle" class="ml-2" :title="$t('common.btn.clear')" @click="onClear" />
      <ButtonGeneric
        variant="green"
        icon="bi-filetype-csv"
        class="ml-2"
        :title="$t('common.btn.export')"
        :disabled="!planSearchStore.dataPlanSearch.total > 0"
        @click="onExport"
      />
    </template>
  </SearchBarGeneric>

  <dialogView
    :isShow="isShow.dialog"
    @closeDialog="closeDialog"
    @search="dialogSearch"
    txtHeader="ค้นหาเพิ่มเติม"
  >
    <template #content>
      <div class="form-col-container">
        <div>
          <span class="title-text">{{ $t('view.production.planTracking.statusDate') }}</span>
          <div class="flex-group">
            <CalendarGeneric
              class="w-100"
              v-model="form.sendStart"
              :max-date="form.sendEnd"
              showIcon
              :manualInput="true"
              :placeholder="$t('common.label.start')"
              dateFormat="dd/mm/yy"
            />
            <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
            <CalendarGeneric
              class="w-100"
              v-model="form.sendEnd"
              :min-date="form.sendStart"
              showIcon
              :manualInput="true"
              :placeholder="$t('common.label.end')"
              dateFormat="dd/mm/yy"
            />
          </div>
        </div>

        <div class="form-col-container">
          <div>
            <span class="title-text">{{ $t('view.production.planTracking.mold') }}</span>
            <InputTextGeneric v-model="form.mold" />
          </div>

          <div>
            <span class="title-text">{{ $t('view.production.planTracking.planTarget') }}</span>
            <DropdownGeneric
              v-model="form.isOverPlan"
              :options="overPlanOptions"
              optionLabel="description"
            />
          </div>
        </div>
      </div>

      <div class="form-col-container mt-2">
        <div>
          <span class="title-text">{{ $t('view.production.planTracking.customerCode') }}</span>
          <InputTextGeneric v-model="form.customerCode" />
        </div>

        <div>
          <span class="title-text">{{ $t('view.production.planTracking.customerType') }}</span>
          <div>
            <MultiSelectGeneric
              v-model="form.customerType"
              :options="customerType"
              optionLabel="nameTh"
              optionValue="code"
              :placeholder="$t('common.label.all')"
            />
          </div>
        </div>

        <div>
          <span class="title-text">{{ $t('view.production.planTracking.productType') }}</span>
          <div>
            <MultiSelectGeneric
              v-model="form.productType"
              :options="productType"
              optionLabel="nameTh"
              optionValue="code"
              :placeholder="$t('common.label.all')"
            />
          </div>
        </div>

        <div>
          <span class="title-text">{{ $t('view.production.planTracking.productCode') }}</span>
          <InputTextGeneric v-model="form.productNumber" />
        </div>

        <div>
          <span class="title-text">{{ $t('view.production.planTracking.goldColor') }}</span>
          <div>
            <MultiSelectGeneric
              v-model="form.gold"
              :options="gold"
              optionLabel="nameTh"
              optionValue="nameEn"
              :placeholder="$t('common.label.all')"
            />
          </div>
        </div>

        <div>
          <span class="title-text">{{ $t('view.production.planTracking.goldType') }}</span>
          <div>
            <MultiSelectGeneric
              v-model="form.goldSize"
              :options="goldSize"
              optionLabel="nameTh"
              optionValue="nameEn"
              :placeholder="$t('common.label.all')"
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
import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'
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
    CalendarGeneric,
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

  watch: {
    modelForm: {
      handler(val) {
        this.form = { ...val }
      },
      deep: true
    }
  },

  computed: {
    isExportData() {
      return true
    },

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

  setup() {
    const planSearchStore = usePlanSearchApiStore()
    return { planSearchStore }
  },

  methods: {
    onSearch() {
      this.$emit('search', this.form)
    },
    onExport() {
      this.$emit('export')
    },
    dialogSearch() {
      this.isShow.dialog = false
      this.$emit('search', this.form)
    },
    onSubmitExport() {
      this.$emit('export', true)
    },
    onClear() {
      this.$emit('clear')
    },
    onCloseModal() {
      this.isShow = { ...interfaceIsShow }
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

.flex-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-col-container {
  display: grid;
  gap: var(--sp-md);
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
}
</style>
