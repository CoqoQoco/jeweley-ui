<template>
  <modal :showModal="isShow" @closeModal="$emit('closeModal')" width="600px">
    <!-- <template #title>
      <span class="title-text-lg">คำนวณราคาทอง/กรัม</span>
    </template> -->
    <template #content>
      <div class="p-3">
        <span class="title-text-lg">คำนวณราคาทอง/กรัม</span>
        <!-- Input fields -->
        <div class="row mb-2">
          <div class="col-4">
            <span class="title-text">Gold Price (US$/Oz.)</span>
            <input
              class="form-control"
              type="number"
              v-model.number="goldPrice"
              step="any"
              min="0"
            />
          </div>
          <div class="col-4">
            <span class="title-text">Premium</span>
            <input class="form-control" type="number" v-model.number="premium" step="any" />
          </div>
          <div class="col-4">
            <span class="title-text">Markup %</span>
            <input class="form-control" type="number" v-model.number="markup" step="any" min="0" />
          </div>
        </div>

        <!-- Formula display -->
        <div class="mb-3" style="font-size: 0.85rem; color: #666">
          สูตร: (Gold Price + Premium) / 31.104 × Gold% × (1 + Markup%)
        </div>

        <!-- Results table -->
        <table class="table table-bordered table-sm">
          <thead>
            <tr style="background: #8b0000; color: white">
              <th class="text-center">Karat</th>
              <th class="text-center">Gold %</th>
              <th class="text-center">ราคา/กรัม (US$)</th>
              <th class="text-center">ราคา/Oz (US$)</th>
              <th class="text-center" style="width: 80px"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in calculatedPrices" :key="item.code">
              <td class="text-center">{{ item.code }}</td>
              <td class="text-center">{{ item.goldPercent.toFixed(2) }}%</td>
              <td class="text-right">{{ formatPrice(item.pricePerGram) }}</td>
              <td class="text-right">{{ formatPrice(item.pricePerOz) }}</td>
              <td class="text-center">
                <button class="btn btn-sm btn-green" @click="onSelect(item)">
                  <i class="bi bi-check-lg"></i>
                </button>
              </td>
            </tr>
            <tr v-if="calculatedPrices.length === 0">
              <td colspan="5" class="text-center text-muted">ไม่พบข้อมูลประเภททอง</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'

const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))

export default {
  name: 'GoldCalculatorModal',

  components: { modal },

  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    defaultGoldPrice: {
      type: Number,
      default: 0
    },
    defaultPremium: {
      type: Number,
      default: 1.5
    },
    defaultMarkup: {
      type: Number,
      default: 10
    }
  },

  emits: ['closeModal', 'select'],

  data() {
    return {
      goldPrice: this.defaultGoldPrice,
      premium: this.defaultPremium,
      markup: this.defaultMarkup,
      goldTypes: [],
      masterStore: null
    }
  },

  computed: {
    calculatedPrices() {
      return this.goldTypes
        .filter((g) => g.goldPercent > 0)
        .map((g) => {
          const pricePerGram =
            ((this.goldPrice + this.premium) / 31.104) *
            (g.goldPercent / 100) *
            (1 + this.markup / 100)
          const pricePerOz = pricePerGram * 31.104
          return {
            code: g.code,
            name: g.nameEn || g.nameTh,
            goldPercent: g.goldPercent,
            pricePerGram,
            pricePerOz
          }
        })
    }
  },

  watch: {
    isShow(val) {
      if (val) {
        this.goldPrice = this.defaultGoldPrice
        this.premium = this.defaultPremium
        this.markup = this.defaultMarkup
        this.loadGoldTypes()
      }
    }
  },

  mounted() {
    this.masterStore = useMasterApiStore()
  },

  methods: {
    async loadGoldTypes() {
      if (!this.masterStore) {
        this.masterStore = useMasterApiStore()
      }
      const res = await this.masterStore.fetchGoldSize()
      this.goldTypes = Array.isArray(res) ? res : res?.data || []
    },

    onSelect(item) {
      this.$emit('select', {
        code: item.code,
        name: item.name,
        goldPercent: item.goldPercent,
        pricePerGram: item.pricePerGram,
        pricePerOz: item.pricePerOz
      })
    },

    formatPrice(price) {
      if (typeof price !== 'number' || isNaN(price)) return '0.00'
      return price.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
.table th,
.table td {
  vertical-align: middle;
  padding: 6px 8px;
}
</style>
