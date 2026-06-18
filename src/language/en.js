// ALL
import breadcrumb from './breadcrumb/en.js'
import alerts from './alerts/en.js'
import button from './button/en.js'
import common from './common/en.js'

//view
import pickinglist from './view/pickinglist/en.js'
import catalog from './view/catalog/en.js'
import customer from './view/customer/en.js'
import master from './view/master/en.js'
import stock from './view/stock/en.js'
import receiptStock from './view/receipt-stock/en.js'
import productionLang from './view/production/en.js'
import saleLang from './view/sale/en.js'
import moldLang from './view/mold/en.js'
import workerLang from './view/worker/en.js'
import productionCostLang from './view/production-cost/en.js'
import settingLang from './view/setting/en.js'
import reportProductionLang from './view/report-production/en.js'
import * as mobileLang from './view/mobile/en.js'
export default {
  breadcrumb: { ...breadcrumb },
  alert: { ...alerts },
  button: { ...button },
  common: { ...common },
  setting: { ...settingLang },
  reportProduction: { ...reportProductionLang },
  view: {
    pickinglist: { ...pickinglist },
    catalog: { ...catalog },
    customer: { ...customer },
    master: { ...master },
    receiptStock: { ...receiptStock },
    production: {
      ...productionLang,
      dashboard: {
        title: 'Production Dashboard',
        lastUpdate: 'Last Update',
        totalPlans: 'Total Plans',
        allActivePlans: 'All active plans',
        inProcess: 'In Process',
        currentlyWorking: 'Currently being worked on',
        completedYesterday: 'Completed Yesterday',
        yesterdayFinished: 'Work finished yesterday',
        overduePlans: 'Overdue',
        behindSchedule: 'Work behind schedule',
        activeProjects: 'Active Projects',
        currentlyActive: 'Currently active projects',
        completedToday: 'Completed Today',
        finishedToday: 'Work finished today',
        pendingApproval: 'Pending Approval',
        waitingApproval: 'Waiting for approval',
        completionRate: 'Completion Rate',
        overallProgress: 'Overall progress',
        statusChart: 'Production Status Statistics',
        productionStatus: 'Production Status',
        statusTrends: 'Status Trends',
        productTypeSummary: 'Product Type Summary',
        customerTypeSummary: 'Customer Type Summary',
        productType: 'Product Type',
        count: 'Count',
        quantity: 'Quantity',
        weight: 'Weight',
        customerType: 'Customer Type',
        orders: 'Orders',
        totalQty: 'Total Qty',
        loadingChart: 'Loading data...',
        noData: 'No data available',
        noTrends: 'No trend data',
        noProductData: 'No product data',
        noCustomerData: 'No customer data',
        recentActivities: 'Recent Activities',
        noRecentActivities: 'No recent activities',
        workOrder: 'Work Order',
        product: 'Product',
        customer: 'Customer',
        status: 'Status',
        goldType: 'Gold Type',
        updatedBy: 'Updated By',
        viewDetails: 'View Details',
        daily: 'Daily',
        monthly: 'Monthly',
        monthlyReport: 'Monthly Report',
        monthlyComingSoon: 'Monthly Report Coming Soon',

        // recent activities columns
        colType: 'Type',
        colActivity: 'Activity',
        colDate: 'Date',
        colDetail: 'Detail',

        // summary table columns
        colProductType: 'Product Type',
        colOrderCount: 'Order Count',
        colPieceCount: 'Piece Count',
        colCustomerType: 'Customer Type',

        // scrap weight labels
        scrapWeightTitle: 'Monthly Gold Scrap Weight ({year})',
        loading: 'Loading...',
        scrapMelt: 'Melt Scrap',
        scrapCast: 'Cast Scrap',
        yearly: 'Yearly',
        exportExcel: 'Export Excel',
        exporting: 'Exporting...',
        excel: 'Excel',
        weightUnit: 'Grams',
        weightUnitShort: 'g.',
        yearSummaryTitle: 'Annual Summary {year} - By Type and Gold Size',
        weightPerYear: 'g./year',
        monthsWithData: 'Months with data',
        avgPerMonth: 'Average per month',
        ofTotal: 'of total',

        // monthly success report
        selectMonth: 'Select Month',
        placeholderMonth: 'Select month and year',
        selectedMonth: 'Selected month:',
        goldType2: 'Gold Type:',
        productType2: 'Product Type:',
        customerType2: 'Customer Type:',
        chartTitleGold: 'Completed Plans Summary - By Gold Type',
        chartTitleProduct: 'Completed Plans Summary - By Product Type',
        chartTitleCustomer: 'Completed Plans Summary - By Customer Type',
        tableDetailGold: 'Details by Gold Type',
        tableDetailProduct: 'Details by Product Type',
        tableDetailCustomer: 'Details by Customer Type',
        countLabel: 'Count',
        colGoldType: 'Gold Type',
        colProductCount: 'Plan Count',
        colOrderCount2: 'Production Count',
        colPercent: 'Percent',
        unitPiece: 'pcs'
      }
    },
    sale: { ...saleLang },
    mobile: {
      sale: { ...mobileLang.sale },
      costVersion: { ...mobileLang.costVersion },
      scan: { ...mobileLang.scan },
      dashboard: { ...mobileLang.dashboard },
      tasks: { ...mobileLang.tasks },
      profile: { ...mobileLang.profile },
      quotation: { ...mobileLang.quotation },
      notifications: { ...mobileLang.notifications },
      saleIndex: { ...mobileLang.saleIndex },
      components: { ...mobileLang.components }
    },
    mold: { ...moldLang },
    worker: { ...workerLang },
    productionCost: { ...productionCostLang },
    stock: {
      product: { ...stock.product },
      location: { ...stock.location },
      moveLocation: { ...stock.moveLocation },
      cost: { ...stock.cost },
      gem: {
        ...stock.gem,
        dashboard: {
          title: 'Gem Stock Dashboard',
          lastUpdate: 'Last Update',
          filters: 'Filters',
          groupName: 'Gem Group',
          shape: 'Shape',
          grade: 'Grade',
          allGroups: 'All Groups',
          allShapes: 'All Shapes',
          allGrades: 'All Grades',

          // Tabs
          overview: 'Overview',
          today: 'Today',
          weekly: 'Weekly',
          monthly: 'Monthly',

          // Main stats
          totalGemTypes: 'Total Gem Types',
          uniqueGemVarieties: 'Unique gem varieties',
          totalQuantity: 'Total Quantity',
          pieceCount: 'Piece Count',
          totalWeight: 'Total Weight',
          weightInGrams: 'Weight (Grams)',
          totalValue: 'Total Value',
          inventoryValue: 'Inventory value',
          lowStockItems: 'Low Stock Items',
          outOfStock: 'Out of stock',

          // Availability
          availability: 'Availability Status',
          available: 'Available',
          onProcess: 'On Process',

          // Charts and tables
          categoryBreakdown: 'Category Breakdown',
          topMovements: 'Top Movements',
          priceAlerts: 'Price Alerts',
          gemCode: 'Gem Code',
          category: 'Category',
          transactions: 'Transactions',
          totalMoved: 'Total Moved',

          // Today report
          todayTransactions: "Today's Transactions",
          priceChanges: 'Price Changes',
          newItems: 'New Items',
          lowStockAlerts: 'Low Stock Alerts',
          quantity: 'Quantity',
          weight: 'Weight',
          status: 'Status',
          jobOrPo: 'Job/PO',
          createBy: 'Created By',
          updateBy: 'Updated By',
          createDate: 'Create Date',
          type: 'Type',
          running: 'Running No.',

          // Last activities
          lastActivities: 'Last Activities',
          noActivities: 'No activities',

          // Weekly report
          weeklyTransactions: 'Weekly Transactions',
          weeklyAnalysis: 'Weekly Analysis',
          noWeeklyData: 'No weekly data',

          // Monthly report
          monthlyTransactions: 'Monthly Transactions',
          monthlyTransactionSummaries: 'Monthly Transaction Summaries',
          monthlyAnalysis: 'Monthly Analysis',
          noMonthlyData: 'No monthly data',
          noMonthlyTransactionData: 'No monthly transaction data',
          transactionTypeBreakdown: 'Transaction Type Breakdown',
          gemType: 'Gem Type',
          qtyUsed: 'Qty Used',
          weightUsed: 'Weight Used',
          inbound: 'Inbound',
          outbound: 'Outbound',
          currentStock: 'Current Stock',
          actions: 'Actions',
          cost: 'Cost',
          noTransactionTypes: 'No transaction type data',
          processBorrow: 'Process Borrow',
          total: 'Total',
          pcs: 'pcs',
          borrow: 'Borrow',
          return: 'Return',
          grams: 'g',

          // Monthly specific
          monthSelection: 'Month Selection',
          selectedPeriod: 'Selected Period',
          transactionSummariesByType: 'Transaction Summaries by Type',
          productionType: 'Production Type',
          lastTransaction: 'Last Transaction',
          noGemDetails: 'No gem details',
          noTransactionData: 'No transaction data',
          selectMonthToView: 'Please select a month to view data',
          loadingData: 'Loading data...',
          selectTransactionType: 'Select Transaction Type',
          selectedType: 'Selected Type',
          transactionChart: 'Transaction Chart',
          quantityChart: 'Quantity Chart',
          weightChart: 'Weight Chart',
          transactionDetails: 'Transaction Details',
          items: 'items',

          // No data messages
          loadingChart: 'Loading data...',
          noData: 'No data to display',
          noMovements: 'No movements',
          noPriceChanges: 'No price changes',
          noTodayTransactions: 'No transactions today',

          // Coming soon
          weeklyReportComingSoon: 'Weekly Report Coming Soon',
          monthlyReportComingSoon: 'Monthly Report Coming Soon'
        }
      }
    }
  }
}
