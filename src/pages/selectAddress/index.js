import axios from 'axios'
import React from 'react'
import { useState, useEffect } from 'react'
import { Map, Marker, NavigationControl, InfoWindow } from 'react-bmapgl'
import { message } from 'antd'
import { SelectHeader, SelectNodes, SelectSide } from './commponents/index'
import './styles.less'
import { useParams } from 'react-router-dom'
import { myDebounce } from '../../utils/myDebounce'
import httpUtil from '../../utils/httpUtil'
export const SelectAddress = () => {
  const routeParams = useParams()
  const { questionId } = routeParams
  const [center, setCenter] = useState({ lng: 116.402544, lat: 39.928216 })
  const [haveCenter, setHaveCenter] = useState(false)
  const [nodes, setNodes] = useState([])
  const [windowInfo, setWindowInfo] = useState([])
  const BMapGL = window.BMapGL
  useEffect(() => {
    getNodes()
  }, [])
  const getNodes = () => {
    const formdata = { questionId }
    httpUtil.getQuestionsNodes(formdata).then((res) => {
      if (res.data.length > 0) {
        getBeginCenter([...res.data])
        setNodes([...res.data])
        for (let node of res.data) {
          if (node.isCenter) {
            setHaveCenter(true)
            break
          }
          setHaveCenter(false)
        }
      } else {
        setHaveCenter(false)
      }
    })
  }

  //获得最初地图中心点（可以看到该项目所有中心点的最佳位置）
  const getBeginCenter = (nodes) => {
    if (nodes.length) {
      for (let item of nodes) {
        const { isCenter } = item
        if (isCenter) {
          const { lat, lng } = item
          let point = new BMapGL.Point(lng, lat)
          setCenter(point)
          break
        }
      }
    }
  }

  return (
    <div className="selectAddress_wrap">
      <SelectHeader
        setCenter={setCenter}
        questionId={questionId}
        getNodes={getNodes}
      />
      <SelectNodes
        nodes={nodes}
        setNodes={setNodes}
        setHaveCente={setHaveCenter}
        questionId={questionId}
        getNodes={getNodes}
      />
      <SelectSide questionId={questionId} haveCenter={haveCenter} />
      <Map
        center={center}
        zoom="11"
        // onClick={addNode}
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
                    return setWindowInfo([
                      { lng, lat, nodeAddress, nodeId, nodeName, isCenter },
                    ])
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
