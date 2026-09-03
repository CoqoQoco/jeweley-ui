// ALL
import breadcrumb from './breadcrumb/en.js'
import alerts from './alerts/en.js'
import button from './button/en.js'
import common from './common/en.js'
import sidebar from './sidebar/en.js'

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
import ticketLang from './view/ticket/en.js'
import graphLang from './view/graph/en.js'
import downloadsLang from './view/downloads/en.js'
import reportLang from './view/report/en.js'
import printStationLang from './view/print-station/en.js'
import * as mobileLang from './view/mobile/en.js'
export default {
  breadcrumb: { ...breadcrumb },
  alert: { ...alerts },
  button: { ...button },
  common: { ...common },
  sidebar: { ...sidebar },
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
        summaryTab: 'Overview',
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
        filterDateFrom: 'Created from',
        filterDateTo: 'To',

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
        exportNoDataMsg: 'No data to export',
        exportSuccessMsg: 'Excel exported successfully',
        exportErrorMsg: 'Unable to export Excel',
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
        unitPiece: 'pcs',
        validationSelectMonth: 'Please select month and year',

        // Forecast layer (frontend-only estimate — run-rate)
        forecast: {
          title: 'Monthly Completion Forecast (Run-rate)',
          quantityLabel: 'Forecasted completions by month end ({month})',
          actualSeries: 'Actual Cumulative Completions',
          forecastSeries: 'Forecasted Cumulative Completions',
          assumption: 'Based on run-rate from {days} days of data this month — an estimate, not actual figures',
          notEnoughData: 'Not enough data to forecast this month',
          chartEmpty: 'No completion data recorded this month yet'
        }
      }
    },
    sale: { ...saleLang },
    setting: {
      companyInfo: { ...settingLang.companyInfo }
    },
    mobile: {
      nav: { ...mobileLang.nav },
      sale: { ...mobileLang.sale },
      pos: { ...mobileLang.pos },
      costVersion: { ...mobileLang.costVersion },
      scan: { ...mobileLang.scan },
      dashboard: { ...mobileLang.dashboard },
      tasks: { ...mobileLang.tasks },
      profile: { ...mobileLang.profile },
      quotation: { ...mobileLang.quotation },
      notifications: { ...mobileLang.notifications },
      saleIndex: { ...mobileLang.saleIndex },
      components: { ...mobileLang.components },
      stockProduct: { ...mobileLang.stockProduct },
      receipt: { ...mobileLang.receipt },
      posHelp: { ...mobileLang.posHelp }
    },
    ticket: { ...ticketLang },
    graph: { ...graphLang },
    downloads: { ...downloadsLang },
    report: { ...reportLang },
    printStation: { ...printStationLang },
    mold: { ...moldLang },
    worker: { ...workerLang },
    productionCost: { ...productionCostLang },
    dashboard: {
      messageBox1: 'Message Box 1',
      messageBox2: 'Message Box 2',
      messageBox3: 'Message Box 3',
      messageBox4: 'Message Box 4',
      welcomeDesc: 'Welcome to the Jewelry Production / Storage / Sales / Service Management System',
      companyFooter: '@Duangkaew Jewelry Manufacturer',
      home: {
        greeting: {
          hello: 'Hello, {name}'
        },
        quickActions: {
          title: 'Quick Actions',
          createPrePlan: 'New Production Order',
          createCustomer: 'Add New Customer',
          goodsReceipt: 'Goods Receipt',
          createQuotation: 'New Quotation',
          stockSearch: 'Search Stock',
          createTicket: 'Report Issue / Request'
        },
        myJobs: {
          title: 'My Jobs',
          empty: 'No pending jobs right now'
        },
        actionCards: {
          title: 'Key Summary',
          pendingApproval: 'Pending Approval',
          myPrePlan: 'My Production Orders',
          planTotal: 'Total Plans',
          planProcess: 'In Process',
          planCompletedYesterday: 'Completed Yesterday',
          planOverdue: 'Overdue',
          pendingGR: 'Received Today',
          ticketOpen: 'Open Tickets',
          myTicket: 'My Tickets (Unread)',
          scrapWeightMonth: 'Scrap Gold This Month (g)'
        },
        wipByStage: {
          title: 'Work In Process by Department',
          unit: 'items'
        },
        completedTrend: {
          title: 'Completed Production Trend',
          notEnoughData: 'Not enough data to forecast yet',
          forecastLabel: 'Month-end Forecast',
          actual: 'Actual',
          forecast: 'Forecast',
          assumption: 'Calculated from the average of the last {days} days'
        },
        stockSummary: {
          title: 'Stock Overview',
          gemTitle: 'Gems / Diamonds',
          productTitle: 'Finished Products',
          totalQuantity: 'Quantity On-hand',
          totalValue: 'Total Value',
          lowStock: 'Low Stock',
          onProcess: 'In Process'
        },
        recentActivities: {
          title: 'Recent Activities',
          empty: 'No recent activities'
        },
        customerProductionStatus: {
          title: 'Customer Production Status',
          onlyMine: 'My Customers',
          all: 'All',
          empty: 'No data found',
          inProduction: 'In Production',
          completed: 'Completed',
          overdue: 'Overdue'
        },
        favoriteReports: {
          title: 'Favorite Reports',
          wip: 'Work In Process Report',
          goldCost: 'Gold Cost Report',
          leadTime: 'Production Lead Time Report',
          wages: 'Wages Report',
          wagesByPerson: 'Worker Wages Summary'
        }
      }
    },
    stock: {
      product: { ...stock.product },
      location: { ...stock.location },
      moveLocation: { ...stock.moveLocation },
      storageMoveReport: { ...stock.storageMoveReport },
      cost: { ...stock.cost },
      gemOnhandReport: { ...stock.gemOnhandReport },
      gemMovementReport: { ...stock.gemMovementReport },
      gemMovementAnalysis: { ...stock.gemMovementAnalysis },
      materialValuationReport: { ...stock.materialValuationReport },
      stockBalanceSummary: { ...stock.stockBalanceSummary },
      gold: { ...stock.gold },
      gem: {
        ...stock.gem,
        dashboard: {
          title: 'Gem Stock Dashboard',
          searchDesc: 'Filter dashboard data by group, shape, grade, and date range',
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
          categoryGroupBy: 'Group By',
          topMovements: 'Top Movements',
          priceAlerts: 'Price Alerts',
          gemCode: 'Gem Code',
          category: 'Category',
          transactions: 'Transactions',
          totalMoved: 'Total Moved',

          // Today report
          todayTransactions: "Today's Transactions",
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

          // Stock alert panel
          stockAlert: {
            title: 'Raw Material Stock Alerts',
            viewAll: 'View All',
            outLabel: 'Out of Stock',
            criticalLabel: 'Critical (<7 days)',
            lowLabel: 'Low (<30 days)',
            colLevel: 'Level',
            noAlerts: 'No raw materials need attention'
          },

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

          // Forecast layer (frontend-only estimate)
          forecast: {
            title: 'Forecast Layer (Estimate)',
            quantityLabel: 'Forecasted Quantity Used by Month End',
            weightLabel: 'Forecasted Weight Used by Month End (g)',
            actualSeries: 'Actual Cumulative Usage',
            forecastSeries: 'Forecasted Cumulative Usage',
            assumption:
              'Estimated using the average daily actual usage run-rate (issued + withdrawn, excluding returned loans) based on the first {days} days of this month — an estimate, not actual figures',
            notEnoughData: 'Not enough data to forecast this month',
            chartEmpty: 'No usage data recorded this month yet'
          },

          // Aging layer (stock aging report)
          aging: {
            title: 'Gem Stock Aging',
            deadCodesOverYear: 'Items Stuck Over 1 Year',
            deadCodes: 'Stuck Item Codes',
            chartEmpty: 'No stock aging data yet',
            countLabel: 'Item Count',
            bucket: {
              d0_30: '0-30 days',
              d31_90: '31-90 days',
              d91_180: '91-180 days',
              d181_365: '181-365 days',
              over365: 'Over 1 year',
              never: 'Never moved'
            }
          },

          // Monthly report overview (backend-computed sections)
          // named monthlyReport to avoid colliding with the `monthly` tab label key above
          monthlyReport: {
            summary: {
              title: 'Monthly Summary',
              totalTransactions: 'Total Transactions',
              totalQuantityIn: 'Total Quantity In',
              totalQuantityOut: 'Total Quantity Out',
              monthOverMonthGrowth: 'Month-over-Month Growth',
              inventoryTurnoverRatio: 'Inventory Turnover Ratio'
            },
            weeklyComparison: {
              title: 'Weekly Comparison in Month',
              weekLabel: 'Week {n}',
              quantityIn: 'Quantity In',
              quantityOut: 'Quantity Out',
              chartEmpty: 'No weekly data for this month yet'
            },
            topPerformers: {
              title: 'Top Moving Gems',
              performanceType: 'Performance Type',
              noData: 'No top performer data for this month',
              type: {
                highestVolume: 'Highest Volume',
                highestValue: 'Highest Value',
                mostActive: 'Most Active',
                fastestMoving: 'Fastest Moving'
              }
            },
            inventoryAnalysis: {
              title: 'Monthly Inventory Analysis',
              itemCount: 'Item Count',
              inventoryDays: 'Inventory Days',
              inventoryStatus: 'Inventory Status',
              monthOverMonthChange: 'Change from Last Month (%)',
              noData: 'No inventory analysis data for this month',
              status: {
                overstock: 'Overstock',
                optimal: 'Optimal',
                understock: 'Understock'
              }
            },
            supplierAnalysis: {
              title: 'Monthly Supplier Analysis',
              supplierName: 'Supplier Name',
              gemTypes: 'Gem Types',
              preferredGemCategory: 'Preferred Gem Category',
              deliveryCount: 'Delivery Count',
              reliabilityRating: 'Reliability Rating',
              noData: 'No supplier data for this month',
              noDataScope: 'This data covers only newly received gems (Type 1: New Stock In)',
              rating: {
                excellent: 'Excellent',
                good: 'Good',
                average: 'Average',
                poor: 'Poor'
              }
            },
            priceAnalysis: {
              title: 'Monthly Price Analysis',
              priceChangeCount: 'Price Change Count',
              averagePriceStart: 'Average Price (Start)',
              averagePriceEnd: 'Average Price (End)',
              priceVolatility: 'Price Volatility',
              maxPriceIncrease: 'Max Price Increase',
              maxPriceDecrease: 'Max Price Decrease',
              priceTrend: 'Price Trend',
              mostRecentPriceChange: 'Most Recent Price Change',
              noData: 'No price analysis data for this month',
              trend: {
                increasing: 'Increasing',
                decreasing: 'Decreasing',
                stable: 'Stable',
                volatile: 'Volatile'
              }
            }
          }
        }
      }
    }
  }
}
