import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const formatDate = (date) => {
  return dayjs(date).format('DD/MM/YYYY')
}

const formatDateTime = (date) => {
  return dayjs(date).format('DD/MM/YYYY HH:mm:ss')
}

const formatISOString = (date) => {

  const userTimezone = 'Asia/Bangkok';
  // แปลงวันที่เป็น Day.js object, กำหนดโซนเวลา และแปลงเป็น ISO string
  return dayjs(date).tz(userTimezone).format();
  //return dayjs(date).toISOString(true)
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
