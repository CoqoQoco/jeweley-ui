<template>
  <div class="app-container">
    <div class="d-flex align-items-center mb-3">
      <button
        class="btn btn-sm btn-outline-main me-2"
        @click="$router.push({ name: 'pre-plan-list' })"
      >
        <i class="bi bi-arrow-left"></i> กลับ
      </button>
      <h5 class="mb-0">อนุมัติใบสั่งผลิต</h5>
    </div>
    <div class="card p-4 text-center text-muted">
      <i class="bi bi-hourglass" style="font-size: 2rem"></i>
      <p class="mt-2">หน้าอนุมัติกำลังพัฒนา (Phase 2)</p>
    </div>
  </div>
</template>

<script>
export default { name: 'PrePlanApprove' }
</script>
