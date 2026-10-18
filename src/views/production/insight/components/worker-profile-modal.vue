<!--
  worker-profile-modal — โปรไฟล์ช่าง 1 คน (ModalView) ใช้ร่วมกันทั้งหมวด "ทองและ Loss" และ "ช่างและค่าแรง"
  หัว = รหัส ชื่อ · ประเภทช่าง/แผนก · ประเภทการจ้าง · แท็บย่อยเล็ก (ToggleGroupGeneric size sm): Loss ทอง (เฉพาะช่างฝัง/ช่างแต่ง) · ค่าแรง · ใบงาน
  แต่ละแท็บ mount เมื่อเปิดครั้งแรก (ยิง request ของตัวเองเฉพาะแท็บที่เคยเปิด) แล้วซ่อนด้วย v-show ตอนสลับ · เปลี่ยนช่าง = รีเซ็ตเป็นแท็บแรกที่มีและล้างแท็บที่เคยเปิด
  ปุ่ม "ตั้งเป็นตัวกรองทั้งหน้า" แสดงเมื่อ showApplyFilter (หมวดทอง) และช่างมีประเภท 80/50

  Props:
    isShow          — Boolean (false)
    worker          — Object|null — { workerType|null, workerCode, workerName, deptKey, employmentType? }
    pageFilter      — Object — filter ของหมวดตอนนี้ (ช่วงเวลา/metal/olderThanDays)
    peers           — Array|null — Gold.workers ของหน้า (ใช้คำนวณอันดับ Loss) null = แท็บ Loss ยิงเอง
    showApplyFilter — Boolean (false)
  Emits: closeModal · apply-filter({ workerTypes, workerCodes })
-->
<template>
  <modal :showModal="shown" width="1100px" :fitHeight="true" :isShowActionPart="true" headerVariant="main" @closeModal="$emit('closeModal')">
    <template #title>
      <span class="title-text-lg d-block">{{ headerText }}</span>
    </template>

    <template #content>
      <div v-if="shown" class="worker-profile">
        <ToggleGroupGeneric v-if="tabOptions.length > 1" v-model="activeTab" size="sm" :options="tabOptions" :ariaLabel="$t(`${WP}.tabsAria`)" />

        <WorkerLossPanel v-if="visited.loss" v-show="activeTab === 'loss'" :worker="worker" :pageFilter="pageFilter" :peers="peers" @worker-name="loadedName = $event" />
        <WorkerWagesPanel v-if="visited.wages" v-show="activeTab === 'wages'" :worker="worker" :pageFilter="pageFilter" @worker-info="onWorkerInfo" />
        <WorkerJobsPanel v-if="visited.jobs" v-show="activeTab === 'jobs'" :worker="worker" :pageFilter="pageFilter" />
      </div>
    </template>

    <template #action>
      <ButtonGeneric v-if="canApplyFilter" variant="main" icon="bi-funnel" :label="$t('view.productionInsight.gold.workerModal.applyFilter')" @click="onApplyFilter" />
      <ButtonGeneric variant="outline" class="ml-2" :label="$t('common.btn.close')" @click="$emit('closeModal')" />
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'

import { buildWorkerFilterPatch, resolveProfileTabs, resolveFirstProfileTab } from '../topics/worker-profile-helpers.js'

import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import ToggleGroupGeneric from '@/components/generic/ToggleGroupGeneric.vue'
import WorkerLossPanel from './worker-loss-panel.vue'
import WorkerWagesPanel from './worker-wages-panel.vue'
import WorkerJobsPanel from './worker-jobs-panel.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

const WP = 'view.productionInsight.workerProfile'
const G = 'view.productionInsight.gold'
const W = 'view.productionInsight.workers'

export default {
  name: 'WorkerProfileModal',

  components: { modal, ButtonGeneric, ToggleGroupGeneric, WorkerLossPanel, WorkerWagesPanel, WorkerJobsPanel },

  props: {
    isShow: { type: Boolean, default: false },
    worker: { type: Object, default: null },
    pageFilter: { type: Object, default: () => ({}) },
    peers: { type: Array, default: null },
    showApplyFilter: { type: Boolean, default: false }
  },

  emits: ['closeModal', 'apply-filter'],

  data() {
    return {
      WP,
      activeTab: null,
      visited: {},
      loadedName: '',
      loadedEmployment: null
    }
  },

  computed: {
    shown() {
      return this.isShow && !!this.worker
    },

    workerKey() {
      return this.worker ? `${this.worker.deptKey}|${this.worker.workerType}|${this.worker.workerCode}` : ''
    },

    sessionKey() {
      return this.shown ? this.workerKey : ''
    },

    tabOptions() {
      return resolveProfileTabs(this.worker).map((key) => ({ value: key, label: this.$t(`${WP}.tabs.${key}`), icon: { loss: 'bi-gem', wages: 'bi-cash-stack', jobs: 'bi-list-check' }[key] }))
    },

    canApplyFilter() {
      return this.showApplyFilter && !!this.worker?.workerType
    },

    headerText() {
      if (!this.worker) return ''
      const name = this.worker.workerName || this.loadedName
      const kind = this.worker.workerType ? this.$t(`${G}.workerType.${this.worker.workerType}`) : this.$t(`view.executive.department.${this.worker.deptKey}`)
      const employmentType = this.worker.employmentType || this.loadedEmployment
      const parts = [`${this.worker.workerCode}${name ? ` ${name}` : ''}`, kind]
      if (employmentType) parts.push(this.$t(`${W}.employmentType.${employmentType}`))
      return parts.join(' · ')
    }
  },

  watch: {
    // เปิดโปรไฟล์ (หรือเปลี่ยนช่าง) → แท็บแรกที่มีข้อมูล + ล้างแท็บที่เคย mount ไว้
    sessionKey: {
      handler() {
        this.loadedName = ''
        this.loadedEmployment = null
        const first = resolveFirstProfileTab(this.worker)
        this.activeTab = first
        this.visited = first ? { [first]: true } : {}
      },
      immediate: true
    },

    activeTab(tab) {
      if (tab && !this.visited[tab]) this.visited = { ...this.visited, [tab]: true }
    }
  },

  methods: {
    onWorkerInfo(info) {
      this.loadedEmployment = info.employmentType
      if (info.name) this.loadedName = info.name
    },

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
