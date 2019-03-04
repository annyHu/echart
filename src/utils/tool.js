import moment from 'moment'
export const formateData = (date) => {
  return moment(date).format('hh:mm YY-MM-DD')
}