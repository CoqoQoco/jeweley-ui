<template>
  <SearchBarGeneric
    :title="$t('view.stock.gold.searchTitle')"
    :description="$t('view.stock.gold.searchDesc')"
    @search="onSearch"
    @clear="onClear"
  >
    <template #fields>
      <div>
        <span class="title-text">{{ $t('view.stock.gold.fieldGoldType') }}</span>
        <MultiSelectGeneric
          :modelValue="goldCode"
          :options="masterGold"
          optionLabel="description"
          optionValue="code"
          :placeholder="$t('common.label.all')"
          :showClear="true"
          @update:modelValue="$emit('update:goldCode', $event)"
        />
      </div>

      <div>
        <span class="title-text">{{ $t('view.stock.gold.fieldGoldPercent') }}</span>
        <MultiSelectGeneric
          :modelValue="goldSizeCode"
          :options="masterGoldSize"
          optionLabel="description"
          optionValue="code"
          :placeholder="$t('common.label.all')"
          :showClear="true"
          @update:modelValue="$emit('update:goldSizeCode', $event)"
        />
      </div>
    </template>

    <template #actions-right>
      <ButtonGeneric variant="main" icon="bi-search" type="submit" :label="$t('common.btn.search')" />
      <ButtonGeneric
        variant="dark"
        icon="bi-x-circle"
        class="ml-2"
        :title="$t('common.btn.clear')"
        @click="onClear"
      />
      <ButtonGeneric
        variant="green"
        icon="bi-file-earmark-excel"
        class="ml-2"
        :title="$t('common.btn.export')"
        @click="$emit('export')"
      />
    </template>
  </SearchBarGeneric>
</template>

<script>
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'

import SearchBarGeneric from '@/components/generic/SearchBarGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'

export default {
  name: 'StockGoldSearchView',

  components: {
    SearchBarGeneric,
    ButtonGeneric,
    MultiSelectGeneric
  },

  setup() {
    const masterStore = useMasterApiStore()
    return { masterStore }
  },

  props: {
    goldCode: {
      type: Array,
      default: () => []
    },
    goldSizeCode: {
      type: Array,
      default: () => []
    }
  },

  emits: ['update:goldCode', 'update:goldSizeCode', 'search', 'clear', 'export'],

  computed: {
    masterGold() {
      return this.masterStore.gold
    },
    masterGoldSize() {
      return this.masterStore.goldSize
    }
  },

  created() {
    this.masterStore.fetchGold()
    this.masterStore.fetchGoldSize()
  },

  methods: {
    onSearch() {
      this.$emit('search')
    },
    onClear() {
      this.$emit('clear')
    }
  }
}
</script>
