<template>
  <div class="home">
    <div class="search">
      <Form :model="formItem" :label-width="80">
        <Row>
          <Col span="5">
              <FormItem label="开始时间：" >
                  <DatePicker type="date" class="form_width" placeholder="请选择"  v-model="formItem.bdate_0"></DatePicker>
              </FormItem>
          </Col>
          <Col span="5">
              <FormItem label="结束时间：">
                  <DatePicker type="date" placeholder="请选择" class="form_width" v-model="formItem.edate_1"></DatePicker>
              </FormItem>
          </Col>
      </Row>
      <Row>
          <Col span="5">
              <FormItem label="牌号：">
                  <Select v-model="formItem.specification" class="form_width" clearable>
                      <Option :value="item" v-for="(item) in fieldsList.specifications" :key="item">{{item}}</Option>
                  </Select>
              </FormItem>
          </Col>
          <Col span="5">
              <FormItem label="机台：">
                  <Select v-model="formItem.macid" class="form_width" clearable>
                      <Option :value="item" v-for="(item) in fieldsList.macids" :key="item">{{item}}</Option>
                  </Select>
              </FormItem>
          </Col>
          <Col span="5">
              <FormItem label="班次：">
                  <Select v-model="formItem.classid" class="form_width" clearable>
                      <Option :value="item" v-for="(item) in fieldsList.classids" :key="item">{{item}}</Option>
                  </Select>
              </FormItem>
          </Col>
          <Col span="4">
              <FormItem label="测量类型：">
                  <Select v-model="formItem.type" class="form_width" clearable>
                      <Option :value="item" v-for="(item) in fieldsList.types" :key="item">{{item}}</Option>
                  </Select>
              </FormItem>
          </Col>
          <Col span="5">
              <FormItem>
                <Button type="primary" class="form_width" @click="search">查询</Button>
              </FormItem>
          </Col>
      </Row>
      </Form>
    </div>
    <Row :gutter="30">
        <Col span="18" push="6">
          <Table stripe :columns="defaultColumns" :data="fieldsList.standards">
          </Table>
        </Col>
    </Row>
    <div class="content">
      <Row :gutter="30">
        <Col span="6" v-if="list.length > 0">
        <div >
          <Table stripe :columns="columns" :data="list" @on-selection-change="selected" height="500"></Table>
        </div>
            <div class="get_detail">
              <Button type="primary" class="form_width" @click="queryDetailList">查询详情</Button>
            </div>
          </Col>
          <Col span="18" v-if="detailList.length > 0">
            <Table stripe :columns="detailColumns" :data="detailList" :show-header="false" height="500"></Table>
            <Table stripe :columns="numResultColumns" :data="numResult" :show-header="false" ></Table>
          </Col>
      </Row>
    </div>
    <div class="echars_wrapper">
     
      <div ref="myCharts_weight" id="myCharts_weight" class="myCharts"></div>
    </div>
  </div>
</template>

<script>
import { formateData } from '@/utils/tool'
import echarts from 'echarts'
import { searchFields, getGroupList, getSampleList } from '@/utils/api'
export default {
  name: 'home',
  data () {
    return {
      columns: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        {
          title: '序号',
          key: 'numb',
          render: (h, params) => {
            const { numb, gid } = params.row
            return h('div', {
              on: {
                click: () => {
                  this.queryDetailListFunc(gid)
                }
              }
            }, numb)
          }
        },
        {
          title: '开始时间',
          key: 'bdate',
          render: (h, params) => {
            const { bdate, gid } = params.row
            return h('div', {
              on: {
                click: () => {
                  this.queryDetailListFunc(gid)
                }
              }
            }, bdate)
          }
        }
      ],
      list: [],
      defaultColumns: [
        {
          title: '序号',
          key: 'numb',
          render: (h, params) => {
            const limitKey = {
              standard: '标准',
              up: '上限',
              lower: '下限'
            }
            return h('div', limitKey[params.row.numb])
          }
        },
        {
          title: '重量',
          key: 'WEIGHT'
        },
        {
          title: '圆周',
          key: 'CIRCLE'
        },
        {
          title: '圆度',
          key: 'CIRCLERATE'
        },
        {
          title: '长度',
          key: 'LENGTH'
        },
        {
          title: '吸粗',
          key: 'RESISTANCE'
        }
      ],
      detailColumns: [
        {
          title: '序号',
          key: 'numb',
          render: (h, params) => {
            return h('div', params.index + 1)
          }
        },
        {
          title: '重量',
          key: 'weight'
        },
        {
          title: '圆周',
          key: 'circle'
        },
        {
          title: '圆度',
          key: 'circlerate'
        },
        {
          title: '长度',
          key: 'length'
        },
        {
          title: '吸粗',
          key: 'resistance'
        }
      ],
      detailList: [], // 附表内容
      formItem: {
        bdate_0: formateData(new Date()),
        edate_1: formateData(new Date())
      }, // 查询条件
      selectedIds: '',
      fieldsList: {}, // 下拉框字段
      chartOptions_weight: {
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: []
        },
        yAxis: {
          type: 'value'
        },
        color: ['#d48265'],
        series: [{
          data: [],
          type: 'line',
          markLine: {
            data: [
              { name: '上限', yAxis: 1.65, lineStyle: { color: 'red' } },
              { name: '下限', yAxis: 1.25, lineStyle: { color: 'green' } }
            ]
          }
        }]
      }, // echarts数据
      numResult: [], // 平均值
      numResultColumns: [
        {
          title: '序号',
          key: 'numb',
          render: (h, params) => {
            const data = { average: '平均值', max: '最大值', min: '最小值' }
            return h('div', data[params.row.numb])
          }
        },
        {
          title: '重量',
          key: 'weight'
        },
        {
          title: '圆周',
          key: 'circle'
        },
        {
          title: '圆度',
          key: 'circlerate'
        },
        {
          title: '长度',
          key: 'length'
        },
        {
          title: '吸粗',
          key: 'resistance'
        }
      ]
    }
  },
  methods: {
    search () {
      this.detailList = []
      const formItem = this.formItem
      if (formItem.bdate_0) {
        formItem.bdate_0 = formateData(formItem.bdate_0)
      }
      if (formItem.edate_1) {
        formItem.edate_1 = formateData(formItem.edate_1)
      }
      getGroupList(formItem).then((res) => {
        this.list = this.setNumb(res.data)
      })
    },
    // 设置序列号
    setNumb (data) {
      const result = data.map((v, i) => {
        v.numb = i + 1
        if (v.bdate) {
          v.bdate = formateData(v.bdate)
        }
        return v
      })
      return result
    },
    // 查询选项
    querySearchFields () {
      searchFields().then(res => {
        const fieldsList = res.data
        fieldsList.standards = this.getStandard(fieldsList.standards)
        this.fieldsList = fieldsList
        this.chartOptions_weight.series[0].markLine.data[0].yAxis = fieldsList.standards[1].WEIGHT
        this.chartOptions_weight.series[0].markLine.data[1].yAxis = fieldsList.standards[2].WEIGHT
        const visualMap = [{
          pieces: [{
            gt: 0, // 区间
            lte: fieldsList.standards[2].WEIGHT, // 区间
            color: 'blue' // 红色
          },
          {
            gt: fieldsList.standards[1].WEIGHT,
            lte: 1000,
            color: 'red'
          }],
          outOfRange: { // 区间外
            color: 'green'
          }
        }]
        this.chartOptions_weight.visualMap = visualMap
      })
    },
    queryDetailListFunc (gid) {
      const params = {
        groupids: gid
      }
      getSampleList(params).then(res => {
        const { data } = res.data
        this.detailList = data
        // 折线图
        let indexArr = []
        let params = []
        data.forEach((v, index) => {
          indexArr.push(index + 1)
          params.push(v.weight)
        })
        this.chartOptions_weight.xAxis.data = indexArr
        this.chartOptions_weight.series[0].data = params
        // 设置echarts
        this.myCharts_weight = echarts.init(this.$refs.myCharts_weight)
        this.myCharts_weight.setOption(this.chartOptions_weight)
        // 平均值
        this.numResult = this.getResult(res)
        let datas = this.detailList
        const standard = this.fieldsList.standards
        datas.forEach(item => {
          let cellClassName = {}
          if (item.weight > standard[1].WEIGHT) {
            cellClassName.weight = 'max_limit'
          }
          if (item.circle > standard[1].CIRCLE) {
            cellClassName.circle = 'max_limit'
          }
          if (item.circlerate > standard[1].CIRCLERATE) {
            cellClassName.circlerate = 'max_limit'
          }
          if (item.length > standard[1].LENGTH) {
            cellClassName.length = 'max_limit'
          }
          if (item.resistance > standard[1].RESISTANCE) {
            cellClassName.resistance = 'max_limit'
          }
          // 最小
          if (item.weight < standard[2].WEIGHT) {
            cellClassName.weight = 'min_limit'
          }
          if (item.circle < standard[2].CIRCLE) {
            cellClassName.circle = 'min_limit'
          }
          if (item.circlerate < standard[2].CIRCLERATE) {
            cellClassName.circlerate = 'min_limit'
          }
          if (item.length < standard[2].LENGTH) {
            cellClassName.length = 'min_limit'
          }
          if (item.resistance < standard[2].RESISTANCE) {
            cellClassName.resistance = 'min_limit'
          }
          item.cellClassName = cellClassName
        })
        this.detailList = datas
      })
    },
    // 查询详情
    queryDetailList () {
      this.queryDetailListFunc(this.selectedIds)
    },
    // 拼装标准数据
    getStandard (standard) {
      let data = []
      const columns = ['standard', 'up', 'lower']
      const field = ['WEIGHT', 'CIRCLE', 'CIRCLERATE', 'LENGTH', 'RESISTANCE']
      columns.forEach((v, i) => {
        field.forEach((item, itemIndex) => {
          const keys = `${item}`
          let params = {}
          params[keys] = standard[itemIndex][`limit_${v}`]
          params['numb'] = v
          data[i] = Object.assign({}, data[i], params)
        })
      })
      return data
    },
    // 拼装详情数据汇总数据
    getResult (num) {
      num = num.data
      let data = []
      const columns = ['average', 'max', 'min']
      const field = ['weight', 'circle', 'circlerate', 'length', 'resistance']
      columns.forEach((v, i) => {
        field.forEach((item, itemIndex) => {
          const keys = `${item}`
          let params = {}
          params[keys] = num[`${v}_${item}`]
          params['numb'] = v
          data[i] = Object.assign({}, data[i], params)
        })
      })
      return data
    },
    // 多选框
    selected (selection) {
      let ids = []
      selection.forEach(v => ids.push(v.gid))
      this.selectedIds = ids.toString()
    }
  },
  mounted () {
    // myCharts_weight myCharts_circle myCharts_circlerate myCharts_length myCharts_resistance

    // this.myCharts_circle = echarts.init(this.$refs.myCharts_circle)
    // this.myCharts_circle.setOption(this.chartOptions_circle)

    // this.myCharts_circlerate = echarts.init(this.$refs.myCharts_circlerate)
    // this.myCharts_circlerate.setOption(this.chartOptions_circlerate)

    // this.myCharts_length = echarts.init(this.$refs.myCharts_length)
    // this.myCharts_length.setOption(this.chartOptions_length)

    // this.myCharts_resistance = echarts.init(this.$refs.myCharts_resistance)
    // this.myCharts_resistance.setOption(this.chartOptions_resistance)
    this.querySearchFields()
  }
}
</script>

<style lang="scss">
.home{
  padding: 30px;
}
.search{
  margin-top: 20px;
}
.form_width{
  width: 180px;
}
.get_detail{
  margin-top: 30px;
}
.content{
  margin-top: 30px;
}
.myCharts{
  width: 100%;
  height: 400px;
}
.max_limit{
  color: red !important;
}
.min_limit{
  color: green!important;
}
.overFollow{
  height: 500px;
  overflow-y: scroll;
}
  // @import '@/assets/styles/mixin.scss';

  // @mixin text{
  //   padding: 10px;
  //   width: 500px;
  //   line-height: 30px;
  //   border: 1px solid #f1f0f8;
  //   box-sizing: border-box;
  // }
  // .inner_title{
  //   @include text;
  // }
</style>
