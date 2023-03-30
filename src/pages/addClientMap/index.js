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
import AMapLoader from '@amap/amap-jsapi-loader'

export const AddClientMap = () => {
  const [center, setCenter] = useState({ lng: 116.402544, lat: 39.928216 })
  const [addingClient, setAddingClient] = useState()
  const [clientAddVisible, setClientAddVisible] = useState(false)
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

  useEffect(() => {
    openAddClientModal()
  }, [addingClient])

  useEffect(() => {
    getBeginCenter()

  }, [nodes])

  useEffect(() => {
    showPoint(AMap, map)
  }, [AMap,map])

  useEffect(() => {
    changeCenterNode()
  }, [windowInfo])

  // 展示地图
  useEffect(() => {
    initMap()
  }, [center])

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
          zoom: 13,
          center: [center.lng, center.lat],
        })
        map.on('click', e => handleClick(e, AMap, map))
        setAMap(AMap)
        setMap(map)
      })
      .catch((e) => {
        console.log(e)
      })
  }

  const getNodes = () => {
    httpUtil.getAllClients().then((res) => {
      if (res.status == 9999) {
        setNodes([...res.data])
      }
    })
  }

  // 处理指定点标记
  const dealPoint =(map, type, key, value) => {
    let marks = map.getAllOverlays(type)
     marks.map((item) => {
      let name = item.getExtData()[key]
      if (name == value) {
          closeInfoWindow()
          map.remove(item)
      }
    })
  }

  // 删除点
  const handleDeleteClient = (nodeId) => {
    let parmas = { nodeId }
    httpUtil.deleteClient(parmas).then((res) => {
      if (res.status == 9999) {
        getNodes()
        message.success('删除成功')
        setWindowInfo([])
      } else message.error('删除失败')
    })
    // dealPoint(map, 'marker', 'nodeId',`${nodeId}`)
  }

  const openAddClientModal = () => {
    if (addingClient) {
      setClientAddVisible(true)
    }
  }

  //获得最初地图中心点（可以看到该项目所有中心点的最佳位置）
  const getBeginCenter = () => {
    if (nodes.length) {
      for (let item of nodes) {
        const { lat, lng } = item
        setCenter({ lng, lat })
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
  // 点击地图添加用户的回调
  const handleClick = (e, AMap, map) => {
    const geocoder = new AMap.Geocoder({ radius: 1000 })
    const lng = e.lnglat.getLng() //获得点击的经度
    const lat = e.lnglat.getLat() //获得点击的维度
    let lnglat = [lng, lat]
    // let marker=new AMap.Marker({
    //   position: new AMap.LngLat(lng,lat),   // 经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
    // });
    
    geocoder.getAddress(lnglat, (status, result) => {
      if (status === 'complete' && result.regeocode) {
        try {
          if (result.regeocode.formattedAddress.length) {
            const nodeAddress = result.regeocode.formattedAddress
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
          console.log(error);
          message.error('站点添加错误')
        }
      } else {
        console.log('根据经纬度查询地址失败')
      }
    })
    // map.add(marker)
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
      btn.style.display = 'flex'
      btn.style.flexWrap = 'nowrap'
      sc.innerHTML = '删除'
      sc.style.color = '#1890ff'
      sc.style.cursor = 'pointer'
      sc.style.display = 'block'
  
      sc.addEventListener('click', () => {
        handleDeleteClient(nodeId)
      })
  
      middle.className = 'info-middle'
      middle.style.backgroundColor = 'white'
      middle.innerHTML = content
  
      btn.appendChild(sc)
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
        const { nodeId } = item
        let marker = new AMap.Marker({
          name: item.nodeName,
          position: new AMap.LngLat(item.lng, item.lat),
          zIndex: 16,
          // offset: new AMap.Pixel(-10, -31),
          extData:{
            nodeId
          }
        })
        marker.on('mouseover', (e) => {
          // 清除其他窗体
          map.clearInfoWindow()
          //实例化信息窗体
          let title = `<span style="font-size:20px;">用户</span>`,
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
      <AddClientHeader setCenter={setCenter} getNodes={getNodes} AMap={AMap} map={map} />
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
      <div id="container"></div>
    </div>
  )
}
