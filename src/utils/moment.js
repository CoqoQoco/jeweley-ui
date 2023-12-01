import dayjs from 'dayjs'

const formatDate = (date) => {
  return dayjs(date).format('DD/MM/YYYY')
}

const formatDateTime = (date) => {
  return dayjs(date).format('DD/MM/YYYY HH:mm:ss')
}

const formatISOString = (date) => {
  return dayjs(date).toISOString(true)
}

const formatDateShortYear = (date) => {
  return dayjs(date).format('DD/MM/YY')
}

const formatExcelReport = () => {
  return dayjs().format('YYMMDD_HHmmss')
}

const formatOnlyTime = (date) => {
  return dayjs(date).format('HH:mm')
}

export {
  formatDate,
  formatDateTime,
  formatISOString,
  formatDateShortYear,
  formatExcelReport,
  formatOnlyTime
}
