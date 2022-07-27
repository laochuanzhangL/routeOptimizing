import React, { useState, useEffect, Fragment } from 'react'
import { Drawer, Button, Table, message, Modal } from 'antd'
import { RightOutlined, DownloadOutlined } from '@ant-design/icons'
import './styles.scss'
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
  } = props
  const [textVisible, setTextVisible] = useState(false)
  const [showCarId, setShowCarId] = useState()
  const [carDistance, setCarDistance] = useState({})
  const [data, setData] = useState()
  const resultsColumns = [
    {
      title: '车牌号',
      dataIndex: 'vehicle',
      width: 100,
      render: (render) => {
        return render.vehicleNumber
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
      width: 50,
      render: (render) => {
        return render
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
  ]

  // useEffect(() => {
  //   startShowCar(showCarId)
  // }, [showCarId])

  useEffect(() => {
    getCarDistance()
  }, [trackAnis])

  useEffect(() => {
    openText()
    return () => {
      setTextVisible(false)
    }
  }, [data])

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
        let { trackAni, vehicleId, isRunning } = item
        if (vehicleId === id) {
          if (!isRunning) {
            trackAni.start()
            item.isRunning = !isRunning
          } else {
            trackAni.stop()
            item.isRunning = !isRunning
          }
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
          const { nodeName, nodeAddress } = route[i]
          path.push({ nodeName, nodeAddress, id: i + 1 })
        }
        const data = {
          vehicleNumber,
          type,
          path,
          distance: carDistance[vehicleId],
        }
        setData(data)
      }
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
    httpUtil.downloadResultsFile({ finalSolutionId }).then((res) => {
      console.log(res)
      exportFile(res,'123')
    })
  }
  return (
    <div className="resultside_wrap">
      <Drawer
        className="resultside_Drawer"
        title={
          <div className="drawer_title">
            <div>计算结果</div>{' '}
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={downloadResults}
            >
              导出
            </Button>
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
            <div>{data ? `${data.type}  :  ${data.vehicleNumber}` : ''}</div>
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
