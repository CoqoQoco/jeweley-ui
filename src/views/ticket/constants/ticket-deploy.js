// สถานะ Deploy ของ ticket (หน้า manage เท่านั้น) — ตั้งค่าผ่าน skill ไม่มีปุ่มบนหน้าจอ

export const DEPLOY_META = {
  none: { i18nKey: 'view.ticket.deploy.none', badgeClass: 'deploy-none' },
  pending: { i18nKey: 'view.ticket.deploy.pending', badgeClass: 'deploy-pending' },
  deployed: { i18nKey: 'view.ticket.deploy.deployed', badgeClass: 'deploy-deployed' }
}

export function getDeployMeta(deployStatus) {
  return DEPLOY_META[deployStatus] || DEPLOY_META.none
}
