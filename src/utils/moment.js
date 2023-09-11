import moment from 'moment'

const formatDate = (date) => {
  return moment(date).format('DD/MM/YYYY')
}

const formatDateTime = (date) => {
  return moment(date).format('DD/MM/YYYY HH:mm:ss')
}

const formatISOString = (date) => {
  return moment(date).toISOString(true)
}

const formatDateShortYear = (date) => {
  return moment(date).format('DD/MM/YY')
}

const formatExcelReport = () => {
  return moment().format('YYMMDD_HHmmss')
}

const formatOnlyTime = (date) => {
  return moment(date).format('HH:mm')
}

export {
  formatDate,
  formatDateTime,
  formatISOString,
  formatDateShortYear,
  formatExcelReport,
  formatOnlyTime
}
