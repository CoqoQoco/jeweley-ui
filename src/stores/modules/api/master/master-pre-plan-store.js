import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'

export const useMasterPrePlanStore = defineStore('masterPrePlan', {
  state: () => ({
    jobTypes: [],
    jobLocations: [],
    statuses: [],
    golds: [],
    goldSizes: [],
    gems: [],
    gemShapes: [],
    productTypes: [],
  }),
  actions: {
    async fetchAll() {
      const tasks = []
      if (!this.jobTypes.length) tasks.push(this.fetchJobTypes())
      if (!this.jobLocations.length) tasks.push(this.fetchJobLocations())
      if (!this.statuses.length) tasks.push(this.fetchStatuses())
      if (!this.golds.length) tasks.push(this.fetchGolds())
      if (!this.goldSizes.length) tasks.push(this.fetchGoldSizes())
      if (!this.gems.length) tasks.push(this.fetchGems())
      if (!this.gemShapes.length) tasks.push(this.fetchGemShapes())
      if (!this.productTypes.length) tasks.push(this.fetchProductTypes())
      await Promise.all(tasks)
    },
    async fetchJobTypes() {
      this.jobTypes = (await api.jewelry.get('ProductionPrePlan/MasterJobType')) || []
    },
    async fetchJobLocations() {
      this.jobLocations = (await api.jewelry.get('ProductionPrePlan/MasterJobLocation')) || []
    },
    async fetchStatuses() {
      this.statuses = (await api.jewelry.get('ProductionPrePlan/MasterPrePlanStatus')) || []
    },
    async fetchGolds() {
      this.golds = (await api.jewelry.get('Master/MasterGold')) || []
    },
    async fetchGoldSizes() {
      this.goldSizes = (await api.jewelry.get('Master/MasterGoldSize')) || []
    },
    async fetchGems() {
      this.gems = (await api.jewelry.get('Master/MasterGem')) || []
    },
    async fetchGemShapes() {
      this.gemShapes = (await api.jewelry.get('Master/MasterGemShape')) || []
    },
    async fetchProductTypes() {
      this.productTypes = (await api.jewelry.get('Master/MasterProductType')) || []
    },
  },
})
