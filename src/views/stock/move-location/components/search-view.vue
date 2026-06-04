<template>
  <div class="filter-container-searchBar">
    <form @submit.prevent="onSearch">
      <div>
        <pageTitle title="ค้นหาสินค้า" :isShowBtnClose="false" />

        <div class="form-col-container">
          <div>
            <span class="title-text">เลขที่ผลิต</span>
            <input
              class="form-control bg-input"
              type="text"
              v-model.trim="form.stockNumber"
              placeholder="เช่น STK-2024-001"
            />
          </div>

          <div>
            <span class="title-text">รหัสสินค้า</span>
            <input
              class="form-control bg-input"
              type="text"
              v-model.trim="form.productNumber"
              placeholder="เช่น DK-B-001"
            />
          </div>

          <div>
            <span class="title-text">จัดเก็บปัจจุบัน</span>
            <DropdownGeneric
              :modelValue="form.location"
              :options="locationOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="ทั้งหมด"
              :showClear="true"
              @update:modelValue="form.location = $event"
            />
          </div>
        </div>

        <div class="btn-submit-container-between">
          <div class="d-flex align-items-center">
            <button
              class="btn btn-sm btn-main"
              type="button"
              :disabled="selectedCount === 0"
              @click="onMove"
              title="ย้าย Storage Location"
            >
              <i class="bi bi-arrow-left-right"></i> ย้าย Storage Location
            </button>
            <span v-if="selectedCount > 0" class="ml-2 selected-count">
              เลือกแล้ว {{ selectedCount }} รายการ
            </span>
          </div>
          <div>
            <button class="btn btn-sm btn-outline-main mr-2" type="button" @click="$emit('manual')" title="คู่มือการใช้งาน">
              <i class="bi bi-journal-text"></i> คู่มือ
            </button>
            <button class="btn btn-sm btn-green" type="submit" title="ค้นหา">
              <i class="bi bi-search"></i>
            </button>
            <button class="btn btn-sm btn-dark ml-2" type="button" @click="onClear" title="ล้าง">
              <i class="bi bi-x-circle"></i>
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
import { useStockLocationApiStore } from '@/stores/modules/api/stock/stock-location-api.js'

const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))

const interfaceForm = {
  stockNumber: null,
  productNumber: null,
  location: null
}

export default {
  name: 'MoveLocationSearchView',

  components: {
    pageTitle,
    DropdownGeneric
  },

  setup() {
    const locationStore = useStockLocationApiStore()
    return { locationStore }
  },

  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    },
    selectedCount: {
      type: Number,
      default: 0
    }
  },

  emits: ['search', 'clear', 'move', 'manual'],

  watch: {
    modelForm: {
      handler(val) {
        this.form = { ...val }
      },
      deep: true
    }
  },

  computed: {
    locationOptions() {
      return this.locationStore.all
        .filter((item) => item.isActive)
        .map((item) => ({ value: item.code, label: `${item.code} — ${item.nameTh}` }))
    }
  },

  data() {
    return {
      form: { ...interfaceForm }
    }
  },

  async created() {
    await this.locationStore.fetchAllForMap()
  },

  methods: {
    onSearch() {
      this.$emit('search', this.form)
    },
    onClear() {
      this.$emit('clear')
    },
    onMove() {
      this.$emit('move')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/custom-style/standard-form.scss';

.selected-count {
  font-size: 0.875rem;
  color: var(--base-font-color);
  font-weight: 600;
}
</style>
