// worker-profile-slot.js — block `floating` ของโปรไฟล์ช่าง (state.workerModal) ที่หมวดทอง/หมวดช่างและค่าแรงใช้ร่วมกัน
// modal โหลดแบบ lazy → ไม่เกิด import วนกับ gold.config.js (แท็บ Loss ทองยืม block จาก gold.config)
import { defineAsyncComponent, markRaw } from 'vue'

const WorkerProfileModal = markRaw(defineAsyncComponent(() => import('../components/worker-profile-modal.vue')))

// peers(ctx) = Gold.workers ที่หน้าโหลดอยู่ (ใช้คำนวณอันดับ Loss) · showApplyFilter = หมวดนี้มีแผงตัวกรองช่างให้ตั้งต่อ
export function workerProfileSlot({ id, peers = () => null, showApplyFilter = false }) {
  return {
    type: 'slot',
    id,
    component: WorkerProfileModal,
    props: (ctx) => ({
      isShow: !!ctx.state.workerModal,
      worker: ctx.state.workerModal,
      pageFilter: ctx.filter,
      peers: peers(ctx),
      showApplyFilter
    }),
    events: {
      closeModal: (ctx) => ctx.setState('workerModal', null),
      'apply-filter': (ctx, patch) => {
        ctx.updateFilter(patch)
        ctx.setState('workerModal', null)
      }
    }
  }
}
