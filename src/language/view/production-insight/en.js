export default {
  filter: {
    button: 'Filters',
    title: 'Filters',
    globalLabel: 'Applies to all sections',
    apply: 'Apply filters',
    clearAll: 'Clear all',
    chipDimmedHint: 'Not applicable to this section'
  },

  nav: {
    ariaLabel: 'Production sub-section menu',
    wip: 'WIP & Bottlenecks',
    delivery: 'On-time Delivery',
    capacity: 'Capacity',
    gold: 'Gold & Loss',
    workers: 'Workers & Wages',
    materials: 'Materials Affecting Production'
  },

  status: {
    critical: 'Critical',
    warning: 'Needs Attention',
    ok: 'Normal'
  },

  section: {
    problems: 'Current Problems',
    forecasts: 'Forecasted Problems',
    actions: 'Recommended Actions'
  },

  findingEmpty: 'No problems found',
  actionEmpty: 'No recommended actions yet',
  relatedPrefix: 'Resolves:',

  ownerRole: {
    deptHead: 'Department Head',
    planner: 'Production Planner',
    productionManager: 'Production Manager',
    goldControl: 'Gold Control'
  },

  wip: {
    filterSectionTitle: 'Specific to "WIP & Bottlenecks"',
    filterDept: 'Department',
    filterStaleDays: 'Stale threshold (days)',
    filterRiskWindowDays: 'Early warning window (days)',
    flowTitle: 'Inflow-Outflow per Department (90 days)',
    flowInflow: 'Inflow',
    flowOutflow: 'Outflow',
    flowNet: 'Net',
    stalePlansTitle: 'Stale Plans',
    dueRiskTitle: 'Due-Risk Plans',
    dueRiskModeLabel: 'View',
    dueRiskModeOverdue: 'Overdue',
    dueRiskModeDueSoon: 'Due within {days} days',
    dueRiskColDueDate: 'Due Date',
    dueRiskColDaysToDue: 'Days Left',
    colLastAction: 'Last Update',
    colWorkers: 'Workers',
    lastActionCreated: 'Plan created'
  },

  rules: {
    WIP_STALE: '{count} plans have been stale too long ({percent}% of {openCount} open plans)',
    WIP_OVERDUE: '{count} plans are already overdue ({percent}% of {openCount} open plans)',
    WIP_DEPT_STALE_TOP: '{deptKey} has the most stale plans: {count} ({share}% of all stale plans)',
    WIP_MELTED_OPEN: '{count} melting plans are still open',
    FC_BECOMING_STALE: 'An estimated {count} more plans will become stale within the next {days} days',
    FC_DUE_SOON_AT_RISK: '{count} plans due within {days} days are still in an early stage and at risk of becoming overdue',
    FC_BOTTLENECK: '{deptKey} has {inflow} in / {outflow} out (net {net}) — at risk of becoming a bottleneck',
    ACT_CLOSE_STALE: 'Review and prioritize closing {count} stale plans',
    ACT_PRIORITIZE_DUE: 'Prioritize {overdue} overdue plans and {dueSoon} plans due soon',
    ACT_STAGE_SLA: 'Define a clear SLA for {deptKey}',
    ACT_CLOSE_MELTED: 'Close {count} outstanding melting plans',

    DELIVERY_PLACEHOLDER_OVERDUE: 'Overdue deliveries',
    DELIVERY_PLACEHOLDER_DUE_SOON: 'Due within 14 days but still in an early stage',
    CAPACITY_PLACEHOLDER_BELOW_AVG: 'This month\'s completions are below average',
    CAPACITY_PLACEHOLDER_MONTH_END_FORECAST: 'Estimated completions by month end',
    GOLD_PLACEHOLDER_OVER_ALLOWED_WORKER: 'Workers exceeding the allowed gold loss',
    GOLD_PLACEHOLDER_UNRETURNED_CASTING: 'Casting books with gold not yet returned',
    GOLD_PLACEHOLDER_RISING_TREND: 'Workers whose loss % has risen for 3 months straight',
    WORKERS_PLACEHOLDER_NO_WAGE: 'Items with no wage recorded',
    WORKERS_PLACEHOLDER_RISING_COST_PER_PIECE: 'Rising wage cost per piece',
    MATERIALS_PLACEHOLDER_GEM_LOW_STOCK: 'Low gem stock vs. pending sorting work',
    MATERIALS_PLACEHOLDER_NEGATIVE_GOLD: 'Negative raw gold balance in the system'
  },

  codeLabel: {
    WIP_STALE: 'Stale plans',
    WIP_OVERDUE: 'Overdue plans',
    WIP_DEPT_STALE_TOP: 'Department with most stale plans',
    WIP_MELTED_OPEN: 'Open melting plans',
    FC_BECOMING_STALE: 'Rising stale-plan trend',
    FC_DUE_SOON_AT_RISK: 'At risk of becoming overdue',
    FC_BOTTLENECK: 'Production bottleneck'
  },

  placeholder: {
    message: 'Being built — data is still available on the previous page.',
    reportTitle: 'Data is on the previous page',
    link: {
      delivery: 'Go to production dashboard',
      capacity: 'Go to production dashboard',
      gold: 'Go to Gold Loss dashboard',
      workers: 'Go to worker wages report',
      materials: 'Go to gem stock dashboard'
    }
  }
}
