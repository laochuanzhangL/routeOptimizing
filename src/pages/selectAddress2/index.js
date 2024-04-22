import React from 'react'
import { useState, useEffect } from 'react'
import { Map, Marker, NavigationControl, InfoWindow } from 'react-bmapgl'
import { message } from 'antd'
import { SelectHeader, SelectNodes, SelectSide } from './commponents/index'
import './styles.less'
import { useParams } from 'react-router-dom'
import httpUtil from '../../utils/httpUtil'
export const SelectAddress2 = () => {
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
      if (res.status === 9999) {
        getBeginCenter(res.data)
        setNodes(res.data)
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

  //获取当前问题中所有点的nodeId
  const getNodesId = () => {
    return nodes.map((item) => {
      return item.nodeId
    })
  }

  //删除地图上的点
  const handleDeleteOne = (e) => {
    const parmas = { nodeIdList: [e], questionId }
    httpUtil.deleteNodes(parmas).then((res) => {
      if (res.status == 9999) {
        message.success('删除选点成功')
        getNodes()
        setWindowInfo([])
      } else {
        message.warn('删除选点失败')
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

  //地图点击设置中心点
  const setCenterNode=(nodeId)=>{
    let params = {
      questionId,
      nodeIdList: [nodeId],
    }
    httpUtil.setCenterNodes(params).then((res) => {
      if (res.status == 9999) {
        message.success('中心点设置成功')
        getNodes()
      } else {
        message.error('请提交正确数据')
      }
    })
  }
  return (
    
    <div className="selectAddress_wrap">
      <SelectHeader
        setCenter={setCenter}
        questionId={questionId}
        getNodes={getNodes}
        nodes={nodes}
        getNodesId={getNodesId}
      />
      <SelectNodes
        nodes={nodes}
        setNodes={setNodes}
        getNodesId={getNodesId}
        setWindowInfo={setWindowInfo}
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
          const { lat, lng, isCenter, nodeId } = item
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
        {windowInfo.map((item) => {
          const { lng, lat, nodeAddress, nodeName, isCenter, nodeId } = item
          return (
            <InfoWindow
              position={new BMapGL.Point(lng, lat)}
              title={isCenter == 1 ? '中心点:' : '用户:'}
              height="auto"
              text={nodeName ? nodeName : nodeAddress}
            >
              <span>{nodeName ? nodeName : nodeAddress}</span>
              <div style={{
                display:'flex',
                flexWrap:'nowrap'
              }}>
                <div
                  style={{
                    color: '#1890ff',
                    cursor: 'pointer',
                    display: 'block',
                  }}
                  onClick={(e) => {
                    handleDeleteOne(nodeId)
                  }}
                >
                  删除
                </div>
                <div
                  style={{
                    color: '#1890ff',
                    cursor: 'pointer',
                    display: 'block',
                    marginLeft:'20px',
                  }}
                  onClick={(e) => {
                    setCenterNode(nodeId)
                  }}
                >
                  设为中心点
                </div>
              </div>
            </InfoWindow>
          )
        })}
      </Map>


      
      <NavigationControl />
    </div>
  )
}
