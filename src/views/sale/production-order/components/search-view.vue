<template>
  <div class="card-container">
    <div class="card-header">
      <h6 class="mb-0">{{ $t('view.sale.productionOrder.searchTitle') }}</h6>
    </div>
    <div class="card-body">
      <div class="form-col-container">
        <!-- Search Type -->
        <div>
          <span class="title-text">{{ $t('view.sale.productionOrder.searchType') }}</span>
          <DropdownGeneric
            v-model="formSearch.searchType"
            :options="searchTypeOptions"
            optionLabel="name"
            optionValue="value"
            :placeholder="$t('view.sale.productionOrder.selectSearchType')"
            class="w-100"
            @change="onSearchTypeChange"
          />
        </div>

        <!-- Sale Order Number (when searchType = saleOrder) -->
        <div v-if="formSearch.searchType === 'saleOrder'">
          <span class="title-text">{{ $t('view.sale.productionOrder.soNumber') }}</span>
          <div class="input-group">
            <InputTextGeneric
              v-model.trim="formSearch.saleOrderNumber"
              placeholder="SO-2025-001"
              @keyup.enter="onSearch"
            />
            <div class="input-group-append">
              <button
                class="btn btn-green"
                type="button"
                @click="onSearch"
                :title="$t('view.sale.saleOrder.title')"
              >
                <i class="bi bi-receipt mr-1"></i>
                {{ $t('view.sale.saleOrder.title') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Product Number (when searchType = product) -->
        <div v-if="formSearch.searchType === 'product'">
          <span class="title-text">{{ $t('view.sale.productionOrder.productNumber') }}</span>
          <div class="input-group">
            <InputTextGeneric
              v-model.trim="formSearch.productNumber"
              :placeholder="$t('view.sale.productionOrder.placeholder.stockNumberExample')"
              @keyup.enter="onSearch"
            />
            <div class="input-group-append">
              <button
                class="btn btn-main"
                type="button"
                @click="onSearch"
                :title="$t('common.btn.search')"
              >
                <i class="bi bi-search mr-1"></i>
                {{ $t('common.btn.search') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div>
          <span class="title-text">{{ $t('view.sale.productionOrder.actions') }}</span>
          <div class="btn-group" role="group">
            <button
              class="btn btn-green"
              type="button"
              @click="openSaleOrderModal"
              :title="$t('view.sale.productionOrder.selectFromSaleOrder')"
            >
              <i class="bi bi-list-ul mr-1"></i>
              {{ $t('view.sale.productionOrder.selectSaleOrder') }}
            </button>
            <button
              class="btn btn-dark"
              type="button"
              @click="clearSearch"
              :title="$t('common.btn.clear')"
            >
              <i class="bi bi-arrow-clockwise mr-1"></i>
              {{ $t('common.btn.clear') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Search Results Info -->
      <div v-if="searchResultInfo" class="alert alert-info mt-3" role="alert">
        <i class="bi bi-info-circle mr-2"></i>
        {{ searchResultInfo }}
      </div>
    </div>
  </div>
</template>

<script>
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'

export default {
  name: 'SearchView',

  components: {
    DropdownGeneric,
    InputTextGeneric
  },

  emits: ['update:modelForm', 'search'],

  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return {
      formSearch: {
        searchType: 'saleOrder',
        saleOrderNumber: '',
        productNumber: ''
      },

      searchResultInfo: null
    }
  },

  computed: {
    searchTypeOptions() {
      return [
        { name: this.$t('view.sale.productionOrder.searchBySaleOrder'), value: 'saleOrder' },
        { name: this.$t('view.sale.productionOrder.searchByProduct'), value: 'product' }
      ]
    }
  },

  watch: {
    modelForm: {
      handler(newVal) {
        if (newVal) {
          this.formSearch = { ...this.formSearch, ...newVal }
        }
      },
      deep: true,
      immediate: true
    },

    formSearch: {
      handler(newVal) {
        this.$emit('update:modelForm', newVal)
      },
      deep: true
    }
  },

  methods: {
    onSearchTypeChange() {
      // Clear search fields when type changes
      this.formSearch.saleOrderNumber = ''
      this.formSearch.productNumber = ''
      this.searchResultInfo = null
    },

    onSearch() {
      const searchData = { ...this.formSearch }
      
      // Validate search input
      if (searchData.searchType === 'saleOrder' && !searchData.saleOrderNumber.trim()) {
        this.searchResultInfo = this.$t('view.sale.productionOrder.enterSoNumber')
        return
      }

      if (searchData.searchType === 'product' && !searchData.productNumber.trim()) {
        this.searchResultInfo = this.$t('view.sale.productionOrder.enterProductNumber')
        return
      }

      this.searchResultInfo = null
      this.$emit('search', searchData)
    },

    openSaleOrderModal() {
      this.$emit('search', { 
        ...this.formSearch, 
        openModal: true 
      })
    },

    clearSearch() {
      this.formSearch = {
        searchType: 'saleOrder',
        saleOrderNumber: '',
        productNumber: ''
      }
      this.searchResultInfo = null
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.card-container {
  background: var(--color-card-bg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--sp-lg);
}

.card-header {
  background: #f8f9fa;
  border-bottom: 1px solid var(--color-border);
  padding: var(--sp-sm) var(--sp-lg);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
}

.card-body {
  padding: var(--sp-lg);
}

.input-group {
  display: flex;

  .form-control {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
}

.input-group-append {
  .btn {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    border-left: 0;
  }
}

.btn-group {
  display: flex;

  .btn:not(:last-child) {
    margin-right: var(--sp-sm);
  }
}

.alert {
  padding: var(--sp-sm) var(--sp-lg);
  margin-bottom: var(--sp-lg);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);

  &.alert-info {
    color: #0c5460;
    background-color: #d1ecf1;
    border-color: #bee5eb;
  }
}
</style>