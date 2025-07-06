// ALL
import breadcrumb from './breadcrumb/en.js'
import alerts from './alerts/en.js'
import button from './button/en.js'
export default {
  breadcrumb: { ...breadcrumb },
  alert: { ...alerts },
  button: { ...button },
  view: {
    production: {
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
      }
    },
    stock: {
      gem: {
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
          monthlyAnalysis: 'Monthly Analysis',
          noMonthlyData: 'No monthly data',
          
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
