import React from 'react'
import { useState, useEffect } from 'react'
import { message } from 'antd'
import { SelectHeader, SelectNodes, SelectSide } from './commponents/index'
import './styles.less'
import { useParams } from 'react-router-dom'
import httpUtil from '../../utils/httpUtil'
import AMapLoader from '@amap/amap-jsapi-loader'

import mark_r from '../../assets/mark_r.png'
import mark_b from '../../assets/mark_b.png'

export const SelectAddress = () => {
  const routeParams = useParams()
  const { questionId } = routeParams
  const [center, setCenter] = useState({ lng: 116.402544, lat: 39.928216 })
  const [haveCenter, setHaveCenter] = useState(false)
  const [nodes, setNodes] = useState([])
  const [windowInfo, setWindowInfo] = useState([])

  const mapKey = '48f5d3cab5e0e772cb43a617a1b03f47'
  const [map, setMap] = useState()
  const [AMap, setAMap] = useState({})

  useEffect(() => {
    getNodes()
    return () => {
      setNodes([])
    }
  }, [])
  
  // 展示地图
  useEffect(() => {
    initMap()
  }, [center])

  useEffect(() => {
    showPoint(AMap, map)
  }, [nodes,map, AMap])

  // useEffect(() => {
  //   showPoint(AMap, map)
  // }, [])
  useEffect(() => {
    changeCenterNode()
  }, [windowInfo])

  //初始化地图
  const initMap = () => {
    // 使用高德2.0
    AMapLoader.load({
      key: mapKey, // 申请好的Web端开发者Key，首次调用 load 时必填
      version: '2.0', // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
      plugins: ['AMap.Geocoder', 'AMap.PlaceSearch', 'AMap.InfoWindow'], // 需要使用的的插件列表，如比例尺'AMap.Scale'等
    })
      .then(async (AMap) => {
        let map = new AMap.Map('container', {
          resizeEnable: true,
          mapStyle: 'amap://styles/normal',
          zoom: 10,
          center: [center.lng, center.lat],
        })
        setAMap(AMap)
        setMap(map)
      })
      .catch((e) => {
        console.log(e)
      })
  }
  // 获取点
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

  // 处理指定点标记
  const dealPoint =(map, type, key, value,deal) => {
    let marks = map.getAllOverlays(type)
     marks.map((item) => {
      let name = item.getExtData()[key]
      if (name == value) {
        if(deal=="delete"){
          closeInfoWindow()
          map.remove(item)
        }
        if(deal=="setSenter"){
          item.setIcon(mark_r)
        }
      }
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
    dealPoint(map, 'marker', 'nodeId',`${e}`,"delete")
  }

  //获得最初地图中心点（可以看到该项目所有中心点的最佳位置）
  const getBeginCenter = (nodes) => {
    if (nodes.length) {
      for (let item of nodes) {
        const { isCenter } = item
        if (isCenter) {
          const { lat, lng } = item
          setCenter({ lng, lat })
          break
        }
      }
    }
  }

  //地图点击设置中心点
  const setCenterNode = (nodeId) => {
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
    dealPoint(map, 'marker', 'nodeId',`${nodeId}`,"setSenter")
  }

  // 跳转重定中心点
  const changeCenterNode = () => {
    if (map && windowInfo.length!=0) {
      map.setCenter([windowInfo[0].lng, windowInfo[0].lat])
    }
  }

  // 创建窗体
  let createInfoWindow = (title, content, nodeId) => {
    let info = document.createElement('div')
    info.className = 'custom-info input-card content-window-card'

    //可以通过下面的方式修改自定义窗体的宽高
    info.style.width = '240px'
    // 定义顶部标题
    let top = document.createElement('div')
    let titleD = document.createElement('div')
    let closeX = document.createElement('img')
    top.className = 'info-top'
    titleD.innerHTML = title
    closeX.src = 'https://webapi.amap.com/images/close2.gif'
    closeX.onclick = closeInfoWindow

    top.appendChild(titleD)
    top.appendChild(closeX)
    info.appendChild(top)

    // 定义中部内容
    let middle = document.createElement('div')
    let btn = document.createElement('div')
    let sc = document.createElement('div')
    let zx = document.createElement('div')
    btn.style.display = 'flex'
    btn.style.flexWrap = 'nowrap'
    sc.innerHTML = '删除'
    sc.style.color = '#1890ff'
    sc.style.cursor = 'pointer'
    sc.style.display = 'block'
    zx.innerHTML = '设为中心点'
    zx.style.color = '#1890ff'
    zx.style.cursor = 'pointer'
    zx.style.display = 'block'
    zx.style.marginLeft = '20px'

    sc.addEventListener('click', () => {
      handleDeleteOne(nodeId)
    })
    zx.addEventListener('click', () => {
      setCenterNode(nodeId)
    })

    middle.className = 'info-middle'
    middle.style.backgroundColor = 'white'
    middle.innerHTML = content

    btn.appendChild(sc)
    btn.appendChild(zx)
    middle.appendChild(btn)
    info.appendChild(middle)

    // 定义底部内容
    let bottom = document.createElement('div')
    bottom.className = 'info-bottom'
    bottom.style.position = 'relative'
    bottom.style.top = '0px'
    bottom.style.margin = '0 auto'
    let sharp = document.createElement('img')
    sharp.src = 'https://webapi.amap.com/images/sharp.png'
    bottom.appendChild(sharp)
    info.appendChild(bottom)
    return info
  }

  //关闭信息窗体
  let closeInfoWindow = () => {
    if(map){
      map.clearInfoWindow()
    }
  }

  // 展示所有点
  const showPoint = (AMap, map) => {
    if (!nodes) return 0
    if (map) {
      closeInfoWindow();
      let marks = map.getAllOverlays('marker')
      map.remove(marks)
    
    nodes.map((item) => {
      const { nodeId, isCenter } = item
      let marker = new AMap.Marker({
        name: item.nodeName,
        position: new AMap.LngLat(item.lng, item.lat),
        zIndex: 16,
        icon: isCenter == 1 ? mark_r : mark_b,
        offset: new AMap.Pixel(-10, -31),
        extData:{
          nodeId
        }
      })
      marker.on('mouseover', (e) => {
        // 清除其他窗体
        map.clearInfoWindow()
        //实例化信息窗体
        let title = `<span style="font-size:20px;">${
            isCenter ? '中心点' : '用户'
          }</span>`,
          content = []
        content.push(item.nodeName)
        let infoWindow = new AMap.InfoWindow({
          isCustom: true, //使用自定义窗体
          content: createInfoWindow(title, content.join('<br/>'), nodeId),
          offset: new AMap.Pixel(10, -45),
        })
        infoWindow.open(map, marker.getPosition())
      })
      map.add(marker)
    })
    }
  }

  return (
    <div className="selectAddress_wrap">
      <SelectHeader
        setCenter={setCenter}
        questionId={questionId}
        getNodes={getNodes}
        nodes={nodes}
        getNodesId={getNodesId}
        AMap={AMap}
        map={map}
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
      <div id="container"></div>
    </div>
  )
}
