<template>
  <div class="app-container">
    <moldInfoHeader
      :planId="data.id || 0"
      :planStatus="data.status || 0"
      :statusName="data.statusName || ''"
      :moldCode="data.design?.moldCode || ''"
      :catagoryName="data.design?.catagoryName || ''"
      :createDate="data.createDate || ''"
      :updateDate="data.updateDate || ''"
      @melt="onMelting"
      @updated="fetchData"
    />

    <gemsSection
      :planId="data.id || 0"
      :planStatus="data.status || 0"
      :gems="data.gems || []"
      :masterGem="masterGem"
      :masterGemShape="masterGemShape"
      @update:gems="data.gems = $event"
      @updated="fetchData"
    />

    <div v-if="data.store" class="mt-2">
      <statusStore :modelValue="data" @updated="fetchData" />
    </div>
    <div v-if="data.cutting" class="mt-2">
      <statusCutting :modelValue="data" @updated="fetchData" />
    </div>
    <div v-if="data.casting" class="mt-2">
      <statusCasting :modelValue="data" @updated="fetchData" />
    </div>
    <div v-if="data.castingSilver" class="mt-2">
      <statusCastingSilver :modelValue="data" @updated="fetchData" />
    </div>
    <div v-if="data.resin" class="mt-2">
      <statusResin :modelValue="data" @updated="fetchData" />
    </div>
    <div class="mt-2">
      <statusDesign :modelValue="data" @updated="fetchData" />
    </div>
  </div>
</template>

<script>
import { useMoldPlanStore } from '@/stores/modules/api/mold/mold-plan-store.js'
import { confirmSubmit } from '@/services/alert/sweetAlerts.js'

import moldInfoHeader from './components/mold-info-header.vue'
import gemsSection from './components/gems-section.vue'
import statusDesign from './components/statusDesignView.vue'
import statusResin from './components/statusResinView.vue'
import statusCastingSilver from './components/statusCastingSilverView.vue'
import statusCasting from './components/statusCastingView.vue'
import statusCutting from './components/statusCuttingView.vue'
import statusStore from './components/statusStoreView.vue'

export default {
  components: {
    moldInfoHeader,
    gemsSection,
    statusDesign,
    statusResin,
    statusCastingSilver,
    statusCasting,
    statusCutting,
    statusStore
  },

  setup() {
    return {
      store: useMoldPlanStore()
    }
  },

  data() {
    return {
      id: null,
      data: {},
      masterGem: [],
      masterGemShape: []
    }
  },

  methods: {
    onMelting() {
      confirmSubmit(
        'แม่พิมพ์ที่ถูกหลอมจะไม่สามารถแก้ไขหรือใช้งานได้อีก',
        'หลอมแม่พิมพ์',
        async () => {
          const res = await this.store.meltPlan(this.id)
          if (res !== undefined) {
            await this.fetchData()
          }
        }
      )
    },

    async fetchData() {
      const res = await this.store.fetchPlan(this.id)
      if (res) {
        this.data = {
          ...res,
          gems: (res.gems || []).map((item) => ({
            ...item,
            gem: this.masterGem.find((gem) => gem.code === item.gemCode),
            gemShape: this.masterGemShape.find((shape) => shape.code === item.gemShapeCode)
          }))
        }
      }
    }
  },

  async created() {
    this.id = this.$route.params.id

    const [gemRes, gemShapeRes] = await Promise.all([
      this.store.fetchMasterGem(),
      this.store.fetchMasterGemShape()
    ])

    if (gemRes) this.masterGem = [...gemRes]
    if (gemShapeRes) this.masterGemShape = [...gemShapeRes]

    await this.fetchData()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
