export default {
  months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],

  tabs: {
    news: '📢 Announcements',
    gold: '🪙 Gold Price Today'
  },

  panel: {
    todayTitle: "Today's Announced Price",
    latestTitle: 'Latest Announced Price',
    roundLabel: 'Round {seq}',
    timeSuffix: '{time}'
  },

  source: {
    today: 'Source: Gold Traders Association announced price',
    todayLink: 'goldtraders.or.th',
    history: 'Source: Daily close, gold bar sell — Gold Traders Association'
  },

  cards: {
    barSell: 'Gold Bar Sell',
    barBuy: 'Gold Bar Buy',
    ornamentSell: 'Ornament Gold Sell',
    ornamentBuy: 'Ornament Gold Buy'
  },

  spot: {
    goldSpot: 'Gold Spot',
    goldSpotUnit: 'USD/oz',
    fx: 'USD/THB'
  },

  rounds: {
    showToggle: 'View all rounds today ({count} rounds)',
    hideToggle: 'Hide all rounds today',
    colSeq: 'Round',
    colTime: 'Time',
    colBar: 'Gold Bar Buy/Sell',
    colOrnament: 'Ornament Gold Buy/Sell',
    colDiff: 'Diff'
  },

  stale: {
    message: 'Data may not be up to date — failed to fetch from the Gold Traders Association'
  },

  error: {
    title: 'Failed to load gold price',
    hint: 'Please try again, or check back later.',
    retry: 'Retry'
  },

  chart: {
    title: 'Gold Price History',
    subtitle: 'Gold Bar Sell Price',
    seriesName: 'Gold Bar Sell',
    range1m: '1M',
    range3m: '3M',
    range6m: '6M',
    range1y: '1Y',
    range2y: '2Y',
    rangeAriaLabel: 'Select chart range',
    statMax: 'Highest',
    statMin: 'Lowest',
    statAvg: 'Average',
    statChange: 'Change over period'
  },

  daily: {
    title: 'Daily Price History',
    showToggle: 'View daily table ({count} latest days)',
    hideToggle: 'Hide daily table',
    colDate: 'Date',
    colOpen: 'Open',
    colHigh: 'High',
    colLow: 'Low',
    colClose: 'Close',
    colChange: 'Change',
    footNote: 'Showing latest {count} days · newest to oldest'
  }
}
