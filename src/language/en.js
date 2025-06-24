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
    }
  }
}
