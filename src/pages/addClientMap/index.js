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
import md5 from 'js-md5'
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
  useEffect(() => {
    getBeginCenter()
  }, [nodes])
  const getNodes = () => {
    httpUtil.getAllClients().then((res) => {
      if (res.data.length > 0) {
        setNodes([...res.data])
      }
    })
  }

  //获得最初地图中心点（可以看到该项目所有中心点的最佳位置）
  const getBeginCenter = () => {
    if (nodes.length) {
      for (let item of nodes) {
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
    let sig = md5(
      `extensions=all&key=e8a9a816ff9e7b6b2a8d365bcb62c3be&location=${lng - 0.00658},${
        lat - 0.00574
      }&radius=155345d03864e8a9b3c32586ec78f9a1b`
    )
    //逆地址编码，不能携带cookie，故单独写请求
    //高德地图逆地址编码得到的地址更加详细，但是经纬度有略微偏差 故做了加减法
    axios
      .get(
        `https://restapi.amap.com/v3/geocode/regeo?extensions=all&location=${
          lng - 0.00658
        },${
          lat - 0.00574
        }&radius=1&key=e8a9a816ff9e7b6b2a8d365bcb62c3be&sig=${sig}`
      )
      .then((res) => {
        console.log(res)
        try {
          if (res.data.regeocode.formatted_address.length) {
            const nodeAddress = res.data.regeocode.formatted_address
            const node = {
              nodeAddress,
              lng,
              lat,
              questionName: ' ',
              nodeName: nodeAddress,
            }
            httpUtil.addClient(node).then((res) => {
              console.log(res)
              if (res.status == 9999) {
                getNodes()
              } else {
                message.warn(res.msg)
              }
            })
          } else {
            message.warn('请选中国境内地址')
          }
        } catch (error) {
          console.log(error)
          message.error('站点添加错误')
        }
      })
  }

  return (
    <div className="selectAddress_wrap">
      <AddClientHeader setCenter={setCenter} getNodes={getNodes} />
      <AddClientTables
        nodes={nodes}
        setNodes={setNodes}
        getNodes={getNodes}
        setCenter={setCenter}
        setWindowInfo={setWindowInfo}
      />
      <Map
        center={new BMapGL.Point(center.lng, center.lat)}
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
          const { lat, lng, nodeAddress, nodeName, isCenter, nodeId } = item
          return (
            <div>
              <Marker
                position={{ lng: lng, lat: lat }}
                icon={isCenter == 1 ? 'simple_blue' : 'simple_red'}
                key={nodeId}
                offset={new BMapGL.Size(0, -8)}
                onMouseover={(e) => {
                  const handle = () => {
                    return setWindowInfo([item])
                  }
                  const addWindowInfo = myDebounce(handle, 300, true)
                  addWindowInfo()
                }}
                // onMouseout={(e) => {
                //   const handle = () => {
                //     return setWindowInfo([])
                //   }
                //   const clearWindowInfo = myDebounce(handle, 2000, false)
                //   clearWindowInfo()
                // }}
              />
            </div>
          )
        })}
        {/* 对Marker添加标签 */}
        {windowInfo.map?.((item) => {
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
