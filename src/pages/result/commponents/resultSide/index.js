import React, { useState, useEffect } from 'react'
import { Drawer, Button, Table, message, Modal, Spin } from 'antd'
import { RightOutlined, DownloadOutlined } from '@ant-design/icons'
import car from '../../../../assets/newcar.png'
import './styles.less'
import httpUtil from '../../../../utils/httpUtil'
import { exportFile } from '../../../../utils/exportFile'

import { startAnimation } from '../../../../utils/AMap'

export const ResultSide = (props) => {
  const {
    sideVisible,
    setSideVisible,
    carRoutes,
    trackAnis,
    routeLoading,
    finalSolutionId,
    map,
    AMap,
    carList,
  } = props
  const [textVisible, setTextVisible] = useState(false)
  const [carDistance, setCarDistance] = useState({})
  const [downLoading, setDownLoading] = useState(false)
  const [data, setData] = useState()
  const [showTrackAnis, setShowTrackAni] = useState([])
  const [carMarkers, setCarMarker] = useState([])

  const resultsColumns = [
    {
      title: '车牌号',
      dataIndex: 'vehicle',
      width: 100,
      render: (render) => {
        return render.vehicleNumber ?? `虚拟车 ${render.vehicleId}`
      },
    },

    {
      title: '操作',
      dataIndex: 'action',
      width: 180,
      render: (_, record, index) => {
        let { vehicleId } = record.vehicle
        return (
          <div>
            <Button
              size="small"
              type="link"
              onClick={() => findText(vehicleId,index)}
            >
              文本查看
            </Button>
            <Button
              size="small"
              type="link"
              key="startTrackAnis"
              onClick={() => {
                //展示各点的动画1.清楚2.添加3.展示
                deletePoint(map, 'marker', 'name', 'car')
                map.add(carList[index].carMarker)
                startTrackAnis(vehicleId,index) 
              }}
            >
              {/* {isRunning ? '暂停动画' : '轨迹动画'} */}
              轨迹动画
            </Button>
          </div>
        )
      },
    },
  ]
  const textResultcolumns = [
    {
      title: '顺序号',
      dataIndex: 'id',
      width: 80,
      render: (render) => {
        return render + 1
      },
    },
    {
      title: '地点名称',
      dataIndex: 'nodeName',
      width: 250,
      render: (render) => {
        return render
      },
    },
    {
      title: '详细地址',
      dataIndex: 'nodeAddress',
      width: 250,
      render: (render) => {
        return render
      },
    },
    {
      title: '里程',
      dataIndex: 'dis',
      width: 100,
      render: (render, index) => {
        return index.id === data.path.length - 1
          ? '终点'
          : `${(render / 1000).toFixed(1)}公里` ?? '加载中'
      },
    },
    {
      title: '操作',
      width: 80,
      render: (text, render, index) => {
        return (
          <span
            style={{ color: '#1890ff', cursor: 'pointer', display: 'block' }}
            onClick={() => {
              onePointAnimation(index,data.line)
            }}
          >
            {render.id === data.path.length - 1 ? '' : '单点动画'}
          </span>
        )
      },
    },
  ]

  useEffect(() => {
    getCarDistance()
  }, [trackAnis])

  useEffect(() => {
    openText()
  }, [data])

  const closeSide = () => {
    setSideVisible(false)
  }

  const getCarDistance = () => {
    let tempCarDistance = {}
    for(let i=0;i<trackAnis.length;i++){
      let sum = 0
      trackAnis[i].map((item) => {
        const { vehicleId, distance } = item
        sum += distance
        tempCarDistance[vehicleId] = sum
      })
    }
    setCarDistance(tempCarDistance)
  }

  //开始对应的lushu动画
  const startTrackAnis = (id,index) => {
    let lineArr = []
    if (!routeLoading) {
      for(let i=0;i<trackAnis.length;i++){
        trackAnis[i].map((item) => {
          let { trackAni, vehicleId, carMarker } = item
          if (vehicleId === id) {
            lineArr.push(trackAni)
          }
        })
      }
      lineArr = lineArr.flat()
      lineArr.pop()
      let speed=35
      if(carDistance[id]){
      if (carDistance[id] / 1000 > 1000) {
        speed = (carDistance[id] / 1000) / 200
      } else if (carDistance[id] / 1000 > 500) {
        speed = (carDistance[id] / 1000) / 67
      } else if (carDistance[id] / 1000 > 200) {
        speed = (carDistance[id] / 1000) / 17
      } else if (carDistance[id] / 1000 > 100) {
        speed = (carDistance[id] / 1000) / 7
      } else if (carDistance[id] / 1000 > 50) {
        speed = (carDistance[id] / 1000) / 2.6
      } else {
        speed = (carDistance[id] / 1000) / 0.7
        speed = speed < 35 ? 35 : speed}
      }
      startAnimation(carList[index].carMarker, lineArr,speed)
    } else {
      message.warn('请等待路线绘制完成')
    }
  }

  //找到对应要打开的车辆信息
  const findText = (id,dex) => {
    carRoutes.map((item, index) => {
      const { vehicleId } = item.vehicle
      if (vehicleId == id) {
        const { route, vehicle } = item
        const { vehicleNumber, type } = vehicle
        let path = []
        const len = route.length
        for (let i = 0; i < len; i++) {
          const { nodeName, nodeAddress, lat, lng } = route[i]
          const { distance = 0 } = trackAnis[index] && trackAnis[index][i] ? trackAnis[index][i] : {};//distance,自己传递,默认为0
          path.push({ nodeName, nodeAddress, id: i, dis: distance, lat, lng })
        }
        const data = {
          vehicleNumber,
          type,
          path,
          distance: carDistance[vehicleId],
          vehicleId,
          line:dex
        }
        setData(data)
      }
    })
  }
  // 删除点标记
  const deletePoint = async (map, type, key, value) => {
    let marks = map.getAllOverlays(type)
    await marks.map((item) => {
      let name = item.getExtData()[key]
      if (name == value) {
        item.stopMove()
        map.remove(item)
      }
    })
  }
  // 单点动画
  const onePointAnimation = async (index,line) => {
    setTextVisible(false)
    deletePoint(map, 'marker', 'name', 'car')
    map.add(trackAnis[line][index].carMarker)
    trackAnis[line][index].start()
  }
  //打开文本轨迹
  const openText = () => {
    if (data) {
      setTextVisible(true)
    }
  }
  //关闭对应的文本轨迹
  const closeTextResult = () => {
    setTextVisible(false)
  }

  //到处文本结果
  const downloadResults = () => {
    setDownLoading(true)
    httpUtil.downloadResultsFile({ finalSolutionId }).then((res) => {
      exportFile(res, '123')
      setDownLoading(false)
      message.success('下载成功')
    })
  }
  return (
    <div className="resultside_wrap">
      <Drawer
        className="resultside_Drawer"
        title={
          <div className="drawer_title">
            <div>计算结果</div>{' '}
            {downLoading ? (
              <Spin
                className="spin"
                style={{ marginTop: '6px', marginRight: '15px' }}
              />
            ) : (
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={downloadResults}
              >
                导出
              </Button>
            )}
          </div>
        }
        placement="right"
        onClose={closeSide}
        visible={sideVisible}
        autoFocus={false}
        closable={false}
        mask={false}
        width="25vw"
        key="textResult"
        zIndex={1000}
      >
        <Button
          type="primary"
          icon={<RightOutlined style={{ fontSize: '25px' }} />}
          style={{
            position: 'fixed',
            top: '50vh',
            left: '0',
            height: '80px',
            marginTop: '-40px',
          }}
          onClick={closeSide}
          key="closeSide"
        ></Button>
        <Table
          style={{
            width: '90%',
            minWidth: '300px',
            margin: '0 auto',
          }}
          rowKey={(record) => record.vehicleId}
          key="resultTable"
          columns={resultsColumns}
          dataSource={carRoutes}
          pagination={false}
        />
      </Drawer>

      <Modal
        visible={textVisible}
        key="textResultModal"
        width="1000px"
        zIndex="1001"
        className="text_result"
        title={
          <div className="text_result_title">
            <div>
              {data
                ? `${data.type ?? '虚拟车'} : ${
                    data.vehicleNumber || data.vehicleId
                  }`
                : ''}
            </div>
            <div className="distance">
              总里程:
              {data && data.distance
                ? `${(data.distance / 1000).toFixed(3)}km`
                : '请等待渲染完成'}
            </div>
          </div>
        }
        onCancel={closeTextResult}
        footer={
          <Button type="primary" key="ok" onClick={closeTextResult}>
            确认
          </Button>
        }
      >
        <Table
          columns={textResultcolumns}
          dataSource={data ? data.path : []}
          key="textResultTable"
          scroll={{ y: 500 }}
          pagination={false}
        />
      </Modal>
    </div>
  )
}
