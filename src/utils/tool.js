import moment from 'moment'
export const formateData = (date) => {
  return moment(date).format('HH:mm YY-MM-DD')
}
export const yearformat = (date) => {
  return moment(date).format('YYYY-MM-DD')
}
