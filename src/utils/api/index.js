/* eslint-disable */
import axios from 'axios'
import finalUrl from './finalUrl'
// 请求拦截
axios.interceptors.request.use(config => {
  return config
}, error => Promise.reject(error))
// 响应拦截
axios.interceptors.response.use(response => {
  if (response.status === 200 || response.status === 304) return response
},(error) => {
  return Promise.reject(error)
})

const httpRequest = (options) => {
  return axios({
    ...options,
    timeout: 15000,
    header: {
      'content-type': 'application/x-www-form-urlencoded',
    }
  })
}
// 获取搜索下拉框数据
export const searchFields = () => {
  return httpRequest({
    url: finalUrl('/tobacco/sample/enums/')
  })
}

// 查询组列表数据
export const getGroupList = (data) => {
  return httpRequest({
    url: finalUrl('/tobacco/group/'),
    params: data,
    method: 'GET'
  })
}
// 查询附表信息
export const getSampleList = (data={}) => {
  return httpRequest({
    url: finalUrl('/tobacco/sample/'),
    params: data,
    method: 'GET'
  })
}
