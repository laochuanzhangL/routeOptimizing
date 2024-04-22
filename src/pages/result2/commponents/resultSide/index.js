import React, { useState, useEffect } from 'react'
import { Drawer, Button, Table, message, Modal, Spin } from 'antd'
import { RightOutlined, DownloadOutlined } from '@ant-design/icons'
import car from '../../../../assets/car.png'
import './styles.less'
import httpUtil from '../../../../utils/httpUtil'
import { exportFile } from '../../../../utils/exportFile'
export const ResultSide = (props) => {
  const {
    sideVisible,
    setSideVisible,
    carRoutes,
    trackAnis,
    routeLoading,
    finalSolutionId,
    map,
  } = props
  const [textVisible, setTextVisible] = useState(false)
  const [carDistance, setCarDistance] = useState({})
  const [downLoading, setDownLoading] = useState(false)
  const [data, setData] = useState()
  const [showTrackAnis, setShowTrackAni] = useState([])
  const { BMap, BMapLib } = window
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
      render: (_, record) => {
        let { vehicleId } = record.vehicle
        return (
          <div>
            <Button
              size="small"
              type="link"
              onClick={() => findText(vehicleId)}
            >
              文本查看
            </Button>
            <Button
              size="small"
              type="link"
              key="startTrackAnis"
              onClick={() => startTrackAnis(vehicleId)}
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
      render: (render) => {
        return render ?? '加载中'
      },
    },
    {
      title: '操作',
      width: 80,
      render: (render) => {
        return (
          <span
            style={{ color: '#1890ff', cursor: 'pointer', display: 'block' }}
            onClick={() => {
              onePointAnimation(render)
            }}
          >
            {render.id === data.path.length - 1 ? '' : '单点动画'}
          </span>
        )
      },
    },
  ]

  // useEffect(() => {
  //   startShowCar(showCarId)
  // }, [showCarId])

  useEffect(() => {
    getCarDistance()
  }, [trackAnis])

  useEffect(() => {
    openText()
  }, [data])
  //页面播放的动画只能有一条
  useEffect(() => {
    showTrackAnisChange()
  }, [showTrackAnis])
  const showTrackAnisChange = () => {
    while (showTrackAnis.length > 1) {
      let temp = showTrackAnis.shift()
      temp.stop()
      temp.hideInfoWindow()
    }
    map?.clearOverlays()
    showTrackAnis[0]?.start()
  }

  const closeSide = () => {
    setSideVisible(false)
  }

  const getCarDistance = () => {
    let tempCarDistance = {}
    trackAnis.map((item) => {
      const { vehicleId, distance } = item
      tempCarDistance[vehicleId] = distance
    })
    setCarDistance(tempCarDistance)
  }

  //开始对应的lushu动画
  const startTrackAnis = (id) => {
    if (!routeLoading) {
      trackAnis.map((item) => {
        let { trackAni, vehicleId } = item
        if (vehicleId === id) {
          setShowTrackAni([...showTrackAnis, trackAni])
        }
      })
    } else {
      message.warn('请等待路线绘制完成')
    }
  }

  //找到对应要打开的车辆信息
  const findText = (id) => {
    carRoutes.map((item) => {
      const { vehicleId } = item.vehicle
      if (vehicleId == id) {
        const { route, vehicle } = item
        const { vehicleNumber, type } = vehicle
        let path = []
        const len = route.length
        for (let i = 0; i < len; i++) {
          const { nodeName, nodeAddress, dis, lat, lng } = route[i]
          path.push({ nodeName, nodeAddress, id: i, dis, lat, lng })
        }
        const data = {
          vehicleNumber,
          type,
          path,
          distance: carDistance[vehicleId],
          vehicleId,
        }
        setData(data)
      }
    })
  }
  //单点动画
  const onePointAnimation = (cur) => {
    setTextVisible(false)
    const driving = new BMap.DrivingRoute(map)
    const { id, lat: curLat, lng: curLng } = cur
    const next = data.path[id + 1]
    const { lat: nextLat, lng: nextLng } = next
    let curPoint = new BMap.Point(curLng+ 0.00658, curLat+0.00574)
    let nextPoint = new BMap.Point(nextLng+ 0.00658, nextLat+0.00574)
    driving.search(curPoint, nextPoint)
    driving.setSearchCompleteCallback(function () {
      const pts = driving.getResults().getPlan(0).getRoute(0).getPath()
      let dis = driving.getResults().getPlan(0).getDistance()
      if (dis[dis.length - 1] == '里') {
        dis = parseFloat(dis) * 1000
      } else {
        dis = parseFloat(dis)
      }
      let speed
      if (dis / 1000 > 1000) {
        speed = dis / 120
      } else if (dis / 1000 > 500) {
        speed = dis / 100
      } else if (dis / 1000 > 200) {
        speed = dis / 80
      } else if (dis / 1000 > 100) {
        speed = dis / 60
      } else if (dis / 1000 > 50) {
        speed = dis / 30
      } else if (dis / 1000 > 10) {
        speed = dis / 20
      } else if (dis > 1000) {
        speed = dis / 10
      } else speed = dis / 5
      const lushu = new BMapLib.LuShu(map, pts, {
        landmarkPois: [],
        speed: speed,
        icon: new BMap.Icon(`${car}`, new BMap.Size(24, 24), {
          anchor: new BMap.Size(5, 10),
        }),
        autoView: true,
        enableRotation: false,
      })
      setShowTrackAni([...showTrackAnis, lushu])
    })
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
