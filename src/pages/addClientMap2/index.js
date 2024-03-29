import axios from 'axios'
import React from 'react'
import { useState, useEffect } from 'react'
import { Map, Marker, NavigationControl, InfoWindow } from 'react-bmapgl'
import {
  AddClientTables,
  AddClientHeader,
  AddClientModal,
} from './commponents/index'
import { message, Modal } from 'antd'
import './styles.less'
import { useParams } from 'react-router-dom'
import httpUtil from '../../utils/httpUtil'
import md5 from 'js-md5'
export const AddClientMap2 = () => {
  const [center, setCenter] = useState({ lng: 116.402544, lat: 39.928216 })
  const [addingClient, setAddingClient] = useState()
  const [clientAddVisible, setClientAddVisible] = useState(false)
  const [nodes, setNodes] = useState([])
  const [windowInfo, setWindowInfo] = useState([])
  const BMapGL = window.BMapGL
  useEffect(() => {
    getNodes()
  }, [])

  useEffect(() => {
    openAddClientModal()
  }, [addingClient])

  useEffect(() => {
    getBeginCenter()
  }, [nodes])
  const getNodes = () => {
    httpUtil.getAllClients().then((res) => {
      if (res.status == 9999) {
        setNodes([...res.data])
      }
    })
  }

  const handleDeleteClient = (nodeId) => {
    let parmas = { nodeId }
    httpUtil.deleteClient(parmas).then((res) => {
      if (res.status == 9999) {
        getNodes()
        message.success('删除成功')
        setWindowInfo([])
      } else message.error('删除失败')
    })
  }

  const openAddClientModal = () => {
    if (addingClient) {
      console.log(123)
      setClientAddVisible(true)
    }
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
  const getClientMsg = (e) => {
    const { lng, lat } = e.latlng
    let sig = md5(
      `extensions=all&key=e8a9a816ff9e7b6b2a8d365bcb62c3be&location=${
        lng - 0.00658
      },${lat - 0.00574}&radius=155345d03864e8a9b3c32586ec78f9a1b`
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
        try {
          if (res.data.regeocode.formatted_address.length) {
            const nodeAddress = res.data.regeocode.formatted_address
            const node = {
              nodeAddress,
              lng,
              lat,
              nodeName: nodeAddress,
            }
            setAddingClient(node)
            setClientAddVisible(true)
          } else {
            message.warn('请选中国境内地址')
          }
        } catch (error) {
          message.error('站点添加错误')
        }
      })
  }

  return (
    <div className="selectAddress_wrap">
      <AddClientHeader setCenter={setCenter} getNodes={getNodes} />
      <AddClientModal
        addingClient={addingClient}
        setClientAddVisible={setClientAddVisible}
        getNodes={getNodes}
        clientAddVisible={clientAddVisible}
      />
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
        onClick={(e) => {
          getClientMsg(e)
        }}
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
                  setWindowInfo([item])
                }}
              />
            </div>
          )
        })}
        {/* 对Marker添加标签 */}
        {windowInfo.map?.((item) => {
          const { lng, lat, nodeAddress, nodeName, isCenter, nodeId } = item
          return (
            <InfoWindow
              position={new BMapGL.Point(lng, lat)}
              title={isCenter == 1 ? '中心点:' : '用户:'}
              height="auto"
              text={nodeName ? nodeName : nodeAddress}
            >
              <span>{nodeName ? nodeName : nodeAddress}</span>
              <span
                style={{
                  color: '#1890ff',
                  cursor: 'pointer',
                  display: 'block',
                }}
                onClick={(e) => {
                  handleDeleteClient(nodeId)
                }}
              >
                删除
              </span>
            </InfoWindow>
          )
        })}
      </Map>
      <NavigationControl />
    </div>
  )
}
