// Shared ticket status constants — Options API friendly (plain functions, no Composition API)

export const STATUS_META = {
  1: { i18nKey: 'view.ticket.status.open', badgeClass: 'status-open' },
  2: { i18nKey: 'view.ticket.status.inProgress', badgeClass: 'status-in-progress' },
  3: { i18nKey: 'view.ticket.status.resolved', badgeClass: 'status-resolved' },
  4: { i18nKey: 'view.ticket.status.closed', badgeClass: 'status-closed' },
  5: { i18nKey: 'view.ticket.status.cancelled', badgeClass: 'status-cancelled' }
}

export function getStatusOptions(t) {
  return Object.keys(STATUS_META).map((id) => ({
    value: Number(id),
    label: t(STATUS_META[id].i18nKey)
  }))
}
