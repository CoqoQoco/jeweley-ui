<!--
  gold-worker-modal — ตัวบางของ ModalView สำหรับเจาะข้อมูลช่าง 1 คนของหมวด "ทองและ Loss" · เนื้อหาอยู่ที่ gold-worker-modal-body.vue
  (KPI + กราฟแนวโน้ม + ตารางใบที่ทองเกินเกณฑ์ + ตารางงานที่ยังไม่ครบ slip) · ปุ่ม "ตั้งเป็นตัวกรองทั้งหน้า" ใน footer

  Props:
    isShow     — Boolean (false)
    worker     — Object|null — { workerType, workerCode, workerName }
    pageFilter — Object — filter ของหมวดตอนนี้ (ช่วงเวลา/metal/olderThanDays ที่ modal ใช้ต่อ)
  Emits: closeModal · apply-filter({ workerTypes, workerCodes })
-->
<template>
  <modal :showModal="shown" width="1100px" :fitHeight="true" :isShowActionPart="true" headerVariant="main" @closeModal="$emit('closeModal')">
    <template #title>
      <span class="title-text-lg d-block">{{ headerText }}</span>
    </template>

    <template #content>
      <GoldWorkerModalBody v-if="shown" :worker="worker" :pageFilter="pageFilter" @worker-name="loadedName = $event" />
    </template>

    <template #action>
      <ButtonGeneric variant="main" icon="bi-funnel" :label="$t('view.productionInsight.gold.workerModal.applyFilter')" @click="onApplyFilter" />
      <ButtonGeneric variant="outline" class="ml-2" :label="$t('common.btn.close')" @click="$emit('closeModal')" />
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'

import { buildWorkerFilterPatch } from '../topics/gold-worker-modal-helpers.js'

import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import GoldWorkerModalBody from './gold-worker-modal-body.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

const G = 'view.productionInsight.gold'

export default {
  name: 'GoldWorkerModal',

  components: { modal, ButtonGeneric, GoldWorkerModalBody },

  props: {
    isShow: { type: Boolean, default: false },
    worker: { type: Object, default: null },
    pageFilter: { type: Object, default: () => ({}) }
  },

  emits: ['closeModal', 'apply-filter'],

  data() {
    return {
      loadedName: ''
    }
  },

  computed: {
    shown() {
      return this.isShow && !!this.worker
    },

    // ชื่อช่างจากแถวที่คลิก ไม่มี (ตารางรายแผนก) → จาก Gold.workers ที่ body โหลดมา
    headerText() {
      if (!this.worker) return ''
      const name = this.worker.workerName || this.loadedName
      return `${this.worker.workerCode}${name ? ` ${name}` : ''} · ${this.$t(`${G}.workerType.${this.worker.workerType}`)}`
    }
  },

  watch: {
    shown(value) {
      if (!value) this.loadedName = ''
    }
  },

  methods: {
    onApplyFilter() {
      this.$emit('apply-filter', buildWorkerFilterPatch(this.worker))
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';
</style>
