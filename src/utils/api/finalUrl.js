// 判断当前环境
const getIntactUrl = (url) => {
  if (process.env.NODE_ENV === 'development') {
    return `http://39.105.104.66:80${url}`
  }
  return `http://localhost:8000${url}`
}
export default getIntactUrl
