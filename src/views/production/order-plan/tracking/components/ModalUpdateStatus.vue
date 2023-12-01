<template>
  <div class="modal-container">
    <loading :isLoading="isLoading"></loading>
    <modal :showModal="isShowModal" @closeModal="closeModal" width="550px" isShowActionPart>
      <template v-slot:title>
        <div class="p-2 mt-2">
          <h5>เเก้ไขสถานะใบงาน: {{ `${modelValue.data.wo}-${modelValue.data.woNumber}` }}</h5>
        </div>
      </template>
      <template v-slot:content>
        <div class="staus-container">
          <div class="old-staus-container w-50">
            <label>สถานะเดิม</label>
            <div
              class="old-text-status"
              style="height: 35px"
              :class="getStatusSeverity(modelValue.data.status)"
            >
              {{ modelValue.data.statusNavigation.nameTh }}
            </div>
          </div>
          <div class="ml-3 mr-3 mb-2 arrow-container">
            <i class="bi bi-arrow-right"></i>
          </div>
          <div class="old-staus-container w-50">
            <label>สถานะใหม่</label>
            <Dropdown
              v-model="newStatus"
              :options="masterStatus"
              optionLabel="nameTh"
              optionValue="id"
              placeholder="เลือกสถานะใหม่"
              class="w-full md:w-14rem"
              required
            />
          </div>
        </div>
      </template>
      <template v-slot:action>
        <div>
          <button
            class="btn btn-sm"
            :class="[this.newStatus ? `btn-main` : `btn-secondary`]"
            @click="onSubmit"
            :disabled="!this.newStatus"
          >
            ตกลง
          </button>
        </div>
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))
const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))
//import Tag from 'primevue/tag'
import Dropdown from 'primevue/dropdown'
import api from '@/axios/axios-config.js'
export default {
  components: { modal, Dropdown, loading },
  data() {
    return { isLoading: false, newStatus: null }
  },
  props: {
    modelValue: {
      type: Object,
      required: true,
      default: () => {}
    },
    masterStatus: {
      type: Array,
      required: true,
      default: () => []
    },
    isShowModal: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    closeModal() {
      this.newStatus = ''
      this.$emit('closeModal')
    },
    async onSubmit() {
      try {
        this.isLoading = true
        const param = {
          id: this.modelValue.data.id,
          wo: this.modelValue.data.wo,
          woNumber: this.modelValue.data.woNumber,
          status: this.newStatus
        }
        const res = await api.jewelry.post('ProductionPlan/ProductionPlanUpdateStatus', param)
        if (res) {
          this.$emit('fetchData', res)
        }
        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    },
    getStatusSeverity(status) {
      switch (status) {
        case 9999:
          return 'bg-danger'
        case 100:
          return 'bg-success'
        case 10:
          return 'bg-info'
        case 50:
        case 60:
        case 70:
        case 80:
        case 85:
        case 90:
        case 95:
          return 'bg-warning'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
H5,
label {
  color: var(--base-font-color);
}
.staus-container {
  display: flex;
  justify-content: space-between;
}
.old-staus-container {
  display: grid;
}
.old-text-status {
  color: black;
  display: grid;
  place-content: center;
  border-radius: 5px;
}
.arrow-container {
  display: flex;
  flex-direction: column;
  justify-content: end;
}
</style>
