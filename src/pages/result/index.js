import React, { useState, useEffect } from 'react'
import { Button, message, Spin, notification } from 'antd'
import { ResultSide, ResultHeader } from './commponents'
import { LeftOutlined } from '@ant-design/icons'
import httpUtil from '../../utils/httpUtil'
import car from '../../assets/car.png'
import redMark from '../../assets/redMark.png'
import blueMark from '../../assets/blueMark.png'
import { useParams } from 'react-router-dom'
import './styles.less'
export const Result = () => {
  const routeParams = useParams()
  const { finalSolutionId, questionId } = routeParams
  const [sideVisible, setSideVisible] = useState(true)
  const [center, setCenter] = useState({
    lng: 116.402544,
    lat: 39.928216,
  })
  const [nodes, setNodes] = useState([])
  const [cars, setCars] = useState([])
  const [colors, setColors] = useState([])
  const [map, setMap] = useState()
  const [trackAnis, setTrackAnis] = useState([])
  const [routeLoading, setRouteLoading] = useState(true)
  const { BMap, BMapLib } = window
  const [carRoutes, setcarRoutes] = useState([])
  useEffect(() => {
    getRoutes()
    getCars()
    getNodes()
    return () => {
      setcarRoutes([])
      setCars([])
      setNodes([])
    }
  }, [questionId])

  useEffect(() => {
    addMarker()
    getBeginCenter()
  }, [map, nodes])

  useEffect(() => {
    initMap()
    openNotification()
    return () => {
      setTrackAnis([])
    }
  }, [carRoutes])

  useEffect(() => {
    alterCenter()
  }, [center])

  //根据路线动画的数量来判断是否绘制完成
  useEffect(() => {
    judgeLoading()
  }, [trackAnis])

  //请求获得所有路径
  const getRoutes = () => {
    const parmas = {
      finalSolutionId,
    }
    httpUtil.getResultRoutes(parmas).then((res) => {
      if (res.status === 0) {
        setcarRoutes(res.data.routes)
      }
    })
  }
  //获得最初地图中心点（可以看到该项目所有中心点的最佳位置）
  const getBeginCenter = () => {
    if (nodes.length && map) {
      // let centerNodes = []
      // nodes.map((item) => {
      //   const { isCenter } = item
      //   if (isCenter) {
      //     const { lat, lng } = item
      //     let point = new BMap.Point(lng, lat)
      //     centerNodes.push(point)
      //   }
      // })
      // const { center } = map.getViewport(centerNodes, { enableAnimation: true })
      // setCenter(center)
      const { lat, lng } = nodes[0]
      let point = new BMap.Point(lng, lat)
      setCenter(point)
    }
  }
  //修改中心点
  const alterCenter = () => {
    //如果map存在 进行中心点的变化
    if (map) {
      map.centerAndZoom(new BMap.Point(center.lng, center.lat), 14)
    }
  }
  //初始化地图
  const initMap = () => {
    const map = new BMap.Map('allmap')
    map.centerAndZoom(new BMap.Point(center.lng, center.lat), 14)
    map.enableScrollWheelZoom(true)
    setMap(map)
    drawPathes(map)
  }

  //添加标记
  const addMarker = () => {
    if (map && nodes.length) {
      nodes.map((item) => {
        const { nodeName, lat, lng, isCenter, nodeAddress } = item
        let point = new BMap.Point(lng, lat)
        var myIcon = new BMap.Icon(
          `${isCenter ? blueMark : redMark}`,
          new BMap.Size(23, 25),
          {
            anchor: new BMap.Size(0, 2),
            imageOffset: new BMap.Size(0, 0), // 设置图片偏移
          }
        )
        let marker = new BMap.Marker(point, { icon: myIcon })
        marker.addEventListener('mouseover', function (e) {
          controlInfo(map, isCenter, nodeName, nodeAddress, point, true)
        })
        setTimeout(() => {
          map.addOverlay(marker)
        }, 300)
      })
    }
  }

  //鼠标移入标记点中展示信息框
  const controlInfo = (map, isCenter, nodeName, nodeAddress, point, isOpen) => {
    let opts = {
      width: 200,
      height: 100,
      title: !isCenter ? '站点:' : '中心点:',
      offset: new BMap.Size(7, 5),
    }
    let infoWindow = new BMap.InfoWindow(`${nodeAddress}`, opts)
    if (isOpen) {
      map.openInfoWindow(infoWindow, point)
    }
  }

  //判断路线绘制是否完成
  const judgeLoading = () => {
    if (carRoutes.length) {
      if (trackAnis.length == carRoutes.length) {
        message.success('路线绘制成功')
        setRouteLoading(false)
        notification.close('drawRoute')
      }
    }
  }
  //
  const getPath = async (map, route, color) => {
    const points = []
    let totalDistance = 0
    const driving = new BMap.DrivingRoute(map)
    const { lat: lat1, lng: lng1 } = route[0]
    const { lat: lat2, lng: lng2 } = route[1]
    let point1 = new BMap.Point(lng1, lat1)
    let point2 = new BMap.Point(lng2, lat2)
    driving.search(point1, point2)
    function judge(driving) {
      return new Promise((resolve, reject) => {
        driving.setSearchCompleteCallback(function () {
          const pts = driving.getResults().getPlan(0).getRoute(0).getPath()
          let dis = driving.getResults().getPlan(0).getDistance()
          const polyline = new BMap.Polyline(pts, {
            strokeColor: color,
            strokeWeight: 4,
          })
          map.addOverlay(polyline)
          if (pts.length) {
            if (dis[dis.length - 1] == '里') {
              totalDistance = totalDistance + parseFloat(dis) * 1000
            } else {
              totalDistance = totalDistance + parseFloat(dis)
            }
            points.push.apply(points, pts)
            resolve({ points, totalDistance, dis })
          }
        })
      })
    }
    let i = 1
    while (i < route.length - 1) {
      const res = await judge(driving)
      route[i - 1].dis = res.dis
      const { lat: lat1, lng: lng1 } = route[i]
      const { lat: lat2, lng: lng2 } = route[i+1]
      let point1 = new BMap.Point(lng1, lat1)
      let point2 = new BMap.Point(lng2, lat2)
      driving.search(point1, point2)
      i++
    }
    const res = await judge(driving)
    route[route.length - 2].dis = res.dis
    route[route.length - 1].dis = '终点'
    return new Promise((resolve, reject) => {
      resolve({ points, totalDistance })
    })
  }

  //绘制路线
  const drawPathes = (map) => {
    setTrackAnis([])
    const path = []
    const pathLen = carRoutes.length
    setColors([])
    for (let i = 0; i < carRoutes.length; i++) {
      const points = []
      const driving = new BMap.DrivingRoute(map)
      const { route, vehicle } = carRoutes[i]
      const { vehicleId } = vehicle
      const color = getRandomColor(colors)
      setColors([...colors, color])
      const p = getPath(map, route, color)
      p.then((res) => {
        const { points, totalDistance } = res
        carRoutes[i].totalDistance = totalDistance
        let speed
        if (totalDistance / 1000 > 1000) {
          speed = totalDistance / 120
        } else if (totalDistance / 1000 > 500) {
          speed = totalDistance / 100
        } else if (totalDistance / 1000 > 200) {
          speed = totalDistance / 80
        } else if (totalDistance / 1000 > 100) {
          speed = totalDistance / 60
        } else if (totalDistance / 1000 > 50) {
          speed = totalDistance / 35
        } else speed = totalDistance / 25
        const lushu = new BMapLib.LuShu(map, points, {
          landmarkPois: [],
          speed: speed,
          icon: new BMap.Icon(`${car}`, new BMap.Size(24, 24), {
            anchor: new BMap.Size(5, 10),
          }),
          autoView: true,
          enableRotation: false,
        })
        path.push({
          trackAni: lushu,
          vehicleId,
          distance: totalDistance,
          isRunning: false,
        })
        if (path.length == pathLen) {
          setTrackAnis(path)
        }
      })
    }
  }
  //exist_color为已存在的颜色数组
  const getRandomColor = (exist_color) => {
    //以下的*192都是为了是获取到的颜色为深色的
    let r = Math.floor(Math.random() * 192)
    let g = Math.floor(Math.random() * 192)
    let b = Math.floor(Math.random() * 192)
    let r16 =
      r.toString(16).length === 1 && r.toString(16) <= 'f'
        ? 0 + r.toString(16)
        : r.toString(16)
    let g16 =
      g.toString(16).length === 1 && g.toString(16) <= 'f'
        ? 0 + g.toString(16)
        : g.toString(16)
    let b16 =
      b.toString(16).length === 1 && b.toString(16) <= 'f'
        ? 0 + b.toString(16)
        : b.toString(16)
    let color = '#' + r16 + g16 + b16
    // 获取到未重复的颜色，返回该颜色
    if (exist_color.indexOf(color) === -1) {
      return color
    }
    // 获取到的颜色重复，重新生成
    else {
      getRandomColor(exist_color)
    }
  }
  const getNodes = () => {
    const params = {
      finalSolutionId,
    }
    httpUtil.getResultNodes(params).then((res) => {
      if (res.status == 0) {
        setNodes([...res.data])
      }
    })
  }
  const getCars = () => {
    const params = {
      questionId,
    }
    httpUtil.getAllCars(params).then((res) => {
      if (res.status == 9999) {
        setCars([...res.data])
      }
    })
  }

  const showSide = () => {
    setSideVisible(true)
  }

  const openNotification = (allTime) => {
    notification.open({
      message: '路线绘制中......',
      key: 'drawRoute',
      placement: 'bottomLeft',
      duration: allTime / 1000,
      icon: (
        <Spin
          size="small"
          style={{
            margin: '0 auto',
            width: '100%',
            height: '100%',
          }}
        ></Spin>
      ),
    })
  }

  return (
    <div className="result_wrap">
      <div
        className="map_wrap"
        style={
          sideVisible
            ? {
                width: '75vw',
              }
            : {
                width: '100vw',
              }
        }
      >
        <ResultHeader
          key="ResultHeader"
          setCenter={setCenter}
          sideVisible={sideVisible}
        />
        <div
          id="allmap"
          style={{
            width: '100%',
            height: '100%',
          }}
        ></div>
        <Button
          type="primary"
          key="shoSide"
          icon={
            <LeftOutlined
              style={{
                fontSize: '25px',
              }}
            />
          }
          style={{
            zIndex: 1000,
            position: 'fixed',
            top: '50vh',
            right: '0',
            height: '80px',
            marginTop: '-40px',
          }}
          onClick={showSide}
        ></Button>
      </div>
      <ResultSide
        key="ResultSide"
        sideVisible={sideVisible}
        setSideVisible={setSideVisible}
        trackAnis={trackAnis}
        finalSolutionId={finalSolutionId}
        carRoutes={carRoutes}
        routeLoading={routeLoading}
      />
    </div>
  )
}
