import axios from 'axios'
import React from 'react'
import { useState, useEffect } from 'react'
import { Map, Marker, NavigationControl, InfoWindow } from 'react-bmapgl'
import { AddClientTables, AddClientHeader } from './commponents/index'
import { message } from 'antd'
import './styles.less'
import { useParams } from 'react-router-dom'
import { myDebounce } from '../../utils/myDebounce'
import httpUtil from '../../utils/httpUtil'
export const AddClientMap = () => {
  const routeParams = useParams()
  const { userId } = routeParams
  const [center, setCenter] = useState({ lng: 116.402544, lat: 39.928216 })
  const [nodes, setNodes] = useState([])
  const [windowInfo, setWindowInfo] = useState([])
  const BMapGL = window.BMapGL
  useEffect(() => {
    getNodes()
  }, [])
  const getNodes = () => {
    const formdata = { userId }
    httpUtil.getQuestionsNodes(formdata).then((res) => {
      if (res.data.length > 0) {
        getBeginCenter([...res.data])
        setNodes([...res.data])
      }
    })
  }

  //获得最初地图中心点（可以看到该项目所有中心点的最佳位置）
  const getBeginCenter = (nodes) => {
    if (nodes.length) {
      for (let item of nodes) {
        const { isCenter } = item
        const { lat, lng } = item
        let point = new BMapGL.Point(lng, lat)
        setCenter(point)
        break
      }
    }
  }

  //地图上面点击站点
  const addNode = (e) => {
    const { lng, lat } = e.latlng
    //逆地址编码，不能携带cookie，故单独写请求
    //高德地图逆地址编码得到的地址更加详细，但是经纬度有略微偏差 故做了加减法
    axios
      .get(
        `https://restapi.amap.com/v3/geocode/regeo?location=${lng - 0.00658},${
          lat - 0.00574
        }&key=e8a9a816ff9e7b6b2a8d365bcb62c3be&radius=1&extensions=all`
      )
      .then((res) => {
        try {
          if (res.data.regeocode.formatted_address.length) {
            const nodeAddress = res.data.regeocode.formatted_address
            const node = {
              userId,
              nodeAddress,
              lng,
              lat,
              questionName: ' ',
              nodeName: nodeAddress,
            }
            httpUtil.addClient(node).then((res) => {
              if (res.status == 9999) {
                getNodes()
              } else {
                message.warn(res.msg)
              }
            })
          } else {
            message.warn('请选中国境内地址')
          }
        } catch(error) {
          message.error('今日地图选点份额已经使用完毕')
        }
      })
  }

  return (
    <div className="selectAddress_wrap">
      <AddClientHeader
        setCenter={setCenter}
        userId={userId}
        getNodes={getNodes}
      />
      <AddClientTables
        nodes={nodes}
        setNodes={setNodes}
        userId={userId}
        getNodes={getNodes}
      />
      <Map
        center={center}
        zoom="11"
        onClick={addNode}
        enableScrollWheelZoom
        style={{
          position: 'relative',
          height: '100vh',
        }}
      >
        {/*   点击后地图上添加Marker */}
        {nodes.map((item) => {
          const { lat, lng, id, nodeAddress, nodeName, isCenter, nodeId } = item
          return (
            <div>
              <Marker
                position={{ lng: lng, lat: lat }}
                icon={isCenter == 1 ? 'simple_blue' : 'simple_red'}
                key={nodeId}
                offset={new BMapGL.Size(0, -8)}
                onMouseover={(e) => {
                  const handle = () => {
                    return setWindowInfo([
                      { lng, lat, nodeAddress, nodeId, nodeName, isCenter },
                    ])
                  }
                  const addWindowInfo = myDebounce(handle, 300, true)
                  addWindowInfo()
                }}
                onMouseout={(e) => {
                  const handle = () => {
                    return setWindowInfo([])
                  }
                  const clearWindowInfo = myDebounce(handle, 2000, false)
                  clearWindowInfo()
                }}
              />
            </div>
          )
        })}
        {/* 对Marker添加标签 */}
        {windowInfo.map((item) => {
          const { lng, lat, nodeAddress, nodeName, isCenter } = item
          return (
            <InfoWindow
              position={new BMapGL.Point(lng, lat)}
              title={isCenter == 1 ? '中心点:' : '用户:'}
              text={nodeName ? nodeName : nodeAddress}
            />
          )
        })}
      </Map>
      <NavigationControl />
    </div>
  )
}
