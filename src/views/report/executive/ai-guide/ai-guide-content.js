export const GUIDE_TOOLS = ['get_executive_summary', 'get_executive_digest', 'get_glossary', 'get_customer_production_status']
export const GUIDE_SENSITIVE_VALUES = ['receivables', 'cost', 'customerNames', 'workerNames']

const summary = 'get_executive_summary'
const digest = 'get_executive_digest'
const glossary = 'get_glossary'
const customerProd = 'get_customer_production_status'

// ต้องตรงกับ seed tbm_ai_glossary (20261124_01_ai_connector.sql ข้อ 9)
export const GLOSSARY_METRIC_CODES = [
  'stale_plan',
  'unpaid_invoice',
  'so_gold_rate',
  'diff_loss',
  'worker_slip_mixed_metal',
  'weight_actual',
  'stock_gold_negative',
  'production_receipt_legacy',
  'bottleneck',
  'customer_open_plan',
  'melted_plan'
]

const q = (key, tool, fields, sensitive = []) => ({ key, tool, fields, sensitive })

export const GUIDE_CATEGORIES = [
  {
    key: 'overview',
    icon: 'bi-speedometer2',
    questions: [
      q('overviewAll', summary, ['Production', 'Receivables', 'SalesOrders', 'Stock']),
      q('overviewGold', summary, ['Production', 'Receivables', 'SalesOrders', 'Stock']),
      q('overviewSilver', summary, ['Production', 'Receivables', 'SalesOrders', 'Stock']),
      q('overviewOpenWork', summary, ['Production.OpenCount', 'SalesOrders.OpenCount'])
    ]
  },
  {
    key: 'production',
    icon: 'bi-hammer',
    questions: [
      q('prodOpen', summary, ['Production.OpenCount']),
      q('prodStale', summary, ['Production.Stale180dCount']),
      q('prodMoved', summary, ['Production.Moved30dCount', 'Production.OpenCount']),
      q('prodMelted', summary, ['Production.MeltedOpenCount'])
    ]
  },
  {
    key: 'sales',
    icon: 'bi-receipt',
    questions: [
      q('salesUnpaid', summary, ['Receivables.InvoiceCount', 'Receivables.UnpaidCount', 'Receivables.OverdueCount']),
      q('salesNoDue', summary, ['Receivables.NoDueDateCount']),
      q('salesReceivableThb', summary, ['Receivables'], ['receivables']),
      q('salesSoNoInvoice', summary, ['SalesOrders.OpenCount', 'SalesOrders.NoInvoiceCount']),
      q('salesSoOverdue', summary, ['SalesOrders.OverdueNoInvoiceCount', 'SalesOrders.NoDeliveryDateCount']),
      q('salesSoNoInvoiceThb', summary, ['SalesOrders.NoInvoiceThb'], ['receivables'])
    ]
  },
  {
    key: 'stock',
    icon: 'bi-box-seam',
    questions: [
      q('stockInStock', summary, ['Stock.InStockCount', 'Stock.AgedOver1yCount']),
      q('stockReserved', summary, ['Stock.ReservedCount']),
      q('stockNoCost', summary, ['Stock.NoCostCount', 'Stock.NoCostLotCount']),
      q('stockCost', summary, ['Stock.CostThb'], ['cost'])
    ]
  },
  {
    key: 'loss',
    icon: 'bi-graph-down-arrow',
    questions: [
      q('lossGoldLatest', summary, ['GoldLoss']),
      q('lossOverAllowed', summary, ['GoldLoss.OverAllowedGram', 'GoldLoss.OverSlipCount']),
      q('lossCompare', summary, ['GoldLoss', 'SilverLoss']),
      q('lossSilver', summary, ['SilverLoss'])
    ]
  },
  {
    key: 'customerOrders',
    requires: true,
    icon: 'bi-person-lines-fill',
    questions: [
      q('custOpenByName', customerProd, ['customerName', 'openPlanCount', 'stageCounts', 'plans'], ['customerNames']),
      q('custOpenByCode', customerProd, ['customerCode', 'openPlanCount', 'plans']),
      q('custOldest', customerProd, ['plans.daysSinceMove', 'plans.lastMoveDate'], ['customerNames']),
      q('custMelted', customerProd, ['meltedCount'], ['customerNames'])
    ]
  },
  {
    key: 'watch',
    icon: 'bi-binoculars',
    questions: [
      q('watchList', digest, ['production', 'sales', 'material', 'stock']),
      q('watchCritical', digest, ['production', 'sales', 'material', 'stock']),
      q('watchSales', digest, ['sales']),
      q('watchMoney', digest, ['receivableMetrics', 'costMetrics'], ['receivables', 'cost'])
    ]
  },
  {
    key: 'glossary',
    icon: 'bi-book',
    questions: [
      q('glossStale', glossary, ['stale_plan']),
      q('glossUnpaid', glossary, ['unpaid_invoice']),
      q('glossDiffLoss', glossary, ['diff_loss']),
      q('glossCaveats', glossary, GLOSSARY_METRIC_CODES)
    ]
  }
]

export const GUIDE_NOT_YET_KEYS = ['people', 'dateRange', 'product', 'edit']
export const GUIDE_TIP_KEYS = ['metal', 'unpaidScope', 'followUp', 'reconnect', 'reconnectTick', 'adminOpens']
export const GUIDE_APP_KEYS = ['claude', 'chatgpt', 'gemini']

export const questionTextKey = (key) => `view.aiConnector.guide.q.${key}`
export const categoryRequiresKey = (key) => `view.aiConnector.guide.catRequires.${key}`
export const categoryTitleKey = (key) => `view.aiConnector.guide.cat.${key}`
export const needsKey = (value) => `view.aiConnector.guide.needs.${value}`
