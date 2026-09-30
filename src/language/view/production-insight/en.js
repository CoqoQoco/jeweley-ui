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
    filterGrowthThreshold: 'Fast WIP growth threshold (%)',
    filterCustomRangeLabel: 'Custom time range',
    rangeAriaLabel: 'Select time range',
    flowTitle: 'Inflow-Outflow per Department (90 days)',
    flowTitleRanged: 'Inflow-Outflow per Department ({range})',
    flowInflow: 'Inflow',
    flowOutflow: 'Outflow',
    flowNet: 'Net',
    asOfTodayNote: 'As of today — independent of the selected range',
    stalePlansTitle: 'Stale Plans',
    dueRiskTitle: 'Due-Risk Plans',
    dueRiskModeLabel: 'View',
    dueRiskModeOverdue: 'Overdue',
    dueRiskModeDueSoon: 'Due within {days} days',
    dueRiskColDueDate: 'Due Date',
    dueRiskColDaysToDue: 'Days Left',
    colLastAction: 'Last Update',
    colWorkers: 'Workers',
    lastActionCreated: 'Plan created',
    planLinkTitle: 'Open plan detail (new tab)',
    planLinkNoPermission: 'You need production edit permission to open the detail',

    trendCardsTitle: 'Department WIP Trend',
    trendCardsHint: 'Click a card to see that department\'s inflow/outflow below',
    trendCardRange: 'Start {start} → End {end}',
    trendCardSelectedTag: 'Viewing details below ↓',
    trendPointWeek: 'Week ending {date}: {wip} plans',
    trendPointMonth: 'Month {date}: {wip} plans',
    bucketWeekly: 'Weekly',
    bucketMonthly: 'Monthly',
    trendTotalLabel: 'Total',
    trendDetailTitleDept: '{name} Department · {range}',
    trendDetailTitleTotal: 'All Departments Overview · {range}',
    trendSeriesWip: 'WIP',
    trendSeriesInflow: 'Inflow',
    trendSeriesOutflow: 'Outflow',
    trendSummary: {
      inflowGreater: 'In {inflow} · Out {outflow} · Net {net} → WIP is rising because work is coming in faster than it is being closed',
      outflowGreater: 'In {inflow} · Out {outflow} · Net {net} → WIP is falling because work is being closed faster than it is coming in',
      equal: 'In {inflow} · Out {outflow} · Net {net} → Inflow and outflow are balanced, WIP is not changing much'
    },
    trendTableTitle: 'Department Comparison Table',
    trendColDept: 'Department',
    trendColStart: 'Start',
    trendColEnd: 'End',
    trendColChange: 'Change',
    trendColChangePercent: '%',
    trendColInflow: 'Inflow',
    trendColOutflow: 'Outflow',
    trendColNet: 'Net'
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
    WIP_DEPT_GROWING: '{deptKey} WIP is up {deltaPercent}% ({startWip}→{endWip}), above the {thresholdPercent}% threshold',

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
    FC_BOTTLENECK: 'Production bottleneck',
    WIP_DEPT_GROWING: 'Fast-growing WIP department'
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
  },

  help: {
    sectionProblems: 'Checked against today\'s data using the configured rules',
    sectionForecasts: 'What will happen if the current rate continues, based on trend and due dates',
    sectionActions: 'Suggestions tied to the problems/forecasts above, with an owner',
    statusMeaning: 'Critical = urgent, act now\nNeeds attention = handle soon · Normal = no urgent issue',

    WIP_STALE: 'No status change for over {staleDays} days\nUrgent when ≥10% of all open plans',
    WIP_OVERDUE: 'Past the customer due date and not yet done, excluding Done/Melting/Awaiting CVD/CVD\nUrgent when ≥20%',
    WIP_DEPT_STALE_TOP: 'The department with the most non-moving stale plans right now',
    WIP_MELTED_OPEN: 'Status is Melting but the plan is still open',
    WIP_DEPT_GROWING: 'End-of-range WIP vs. start-of-range grew past the {thresholdPercent}% threshold\nUrgent when over 2x the threshold',
    FC_BECOMING_STALE: 'Estimated from the recent rate of plans becoming stale (next {days} days)',
    FC_DUE_SOON_AT_RISK: 'Due within {days} days but still in an early stage',
    FC_BOTTLENECK: 'The department where inflow exceeds outflow by the most in the selected range',

    rangeControl: 'The time range affects trend, inflow/outflow, bottleneck, and the fast-growth rule\nIt has no effect on the "as of today" boxes',

    trendCardsTitle: 'Line = department WIP at the end of each week/month (cancelled plans excluded) · Dashed = start-of-range level\n▲ red = increase (worse) · ▼ green = decrease',
    trendDetailChart: 'Line = WIP at the end of each period · Positive bars = inflow · Negative bars = outflow',

    trendColStart: 'WIP in this department at the start of the selected range',
    trendColEnd: 'WIP in this department at the end of the selected range',
    trendColChange: 'End − start (number of plans)',
    trendColChangePercent: 'Change as a percentage of the start value',
    trendColInflow: 'Department rows = moved into this department · Total row = newly created plans',
    trendColOutflow: 'Department rows = moved out of this department · Total row = completed or melted',
    trendColNet: 'Inflow − outflow · positive = WIP is accumulating',

    departmentWipChart: 'Buckets: ≤30 / 30–180 / >180 days, counted from each plan\'s last status change',
    flowChart: 'Inflow = moves into the department in the selected range · Outflow = moves out\nPlans with history older than the range may be slightly over-counted as inflow',

    staleColDays: 'Days since the last update',
    staleColLastAction: 'Who last moved the status and what it was moved to',
    staleColWorkers: 'Workers assigned to the current stage',

    dueRiskModeOverdue: 'Plans past the customer due date and not yet done',
    dueRiskModeDueSoon: 'Plans due within the next {days} days but not yet done',

    filterGrowthThreshold: 'Flag as a problem when end-of-range WIP grows past this % vs. start of range',
    filterCustomRange: 'Set a custom start-end date instead of the 1M/3M/6M/1Y shortcuts'
  }
}
