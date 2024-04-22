import React, { useState, useEffect, useRef } from 'react'
import { Button, message, Spin, notification, List } from 'antd'
import { ResultSide, ResultHeader } from './commponents'
import { LeftOutlined } from '@ant-design/icons'
import httpUtil from '../../utils/httpUtil'
import car from '../../assets/car.png'
import { useParams } from 'react-router-dom'
import './styles.less'
import { generateRouteLine, startAnimation,getRandomColor } from '../../utils/AMap'
import AMapLoader from '@amap/amap-jsapi-loader'

export const Result = () => {
  const mapKey = '48f5d3cab5e0e772cb43a617a1b03f47'

  const routeParams = useParams()
  const { finalSolutionId, questionId } = routeParams
  const [sideVisible, setSideVisible] = useState(true)
  const [center, setCenter] = useState({
    lng: 116.402544,
    lat: 39.928216,
  })
  const [map, setMap] = useState({})
  const [AMap, setAMap] = useState({})
  const [trackAnis, setTrackAnis] = useState([])
  const [routeLoading, setRouteLoading] = useState(true)
  const [nodes, setNodes] = useState([])
  const [carRoutes, setcarRoutes] = useState([])
  const [cars, setCars] = useState([])
  const [carList, setCarList] = useState([])
  const [colors, setColors] = useState([])

  // 获取全部车辆，点，路径
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
  // 获取中心点
  useEffect(() => {
    getBeginCenter()
  }, [nodes])
  // 展示地图
  useEffect(() => {
    initMap()
    return () => {
      setTrackAnis([])
    }
  }, [center])

  useEffect(() => {
    openNotification()
    drawPathes()
  }, [map, AMap])

  //根据路线动画的数量来判断是否绘制完成
  useEffect(() => {
    judgeLoading()
  }, [trackAnis])

  //初始化地图
  const initMap = () => {
    // 使用高德2.0
    AMapLoader.load({
      key: mapKey, // 申请好的Web端开发者Key，首次调用 load 时必填
      version: '2.0', // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
      plugins: [
        'AMap.Geocoder',
        'AMap.PlaceSearch',
        'AMap.InfoWindow',
        'AMap.Driving',
        'AMap.MoveAnimation',
      ], // 需要使用的的插件列表，如比例尺'AMap.Scale'等
    })
      .then(async (AMap) => {
        let map = new AMap.Map('container', {
          resizeEnable: true,
          mapStyle: 'amap://styles/normal',
          viewMode: '3D',
          zoom: 13,
          center: [center.lng, center.lat],
        })
        setAMap(AMap)
        setMap(map)
      })
      .catch((e) => {
        console.log(e)
      })
  }
  //获取所有点
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
  //获得最初地图中心点（可以看到该项目所有中心点的最佳位置）
  const getBeginCenter = () => {
    if (nodes.length > 0) {
      const { lat, lng } = nodes[0]
      setCenter({ lat, lng })
    }
  }
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
  //获取所有车辆
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
  //展示边栏
  const showSide = () => {
    setSideVisible(true)
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
  //路线绘制的提示信息
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
  // 绘制路线
  const drawPathes = async () => {
    setTrackAnis([])
    setColors([])
    const path = []
    for (let i = 0; i < carRoutes.length; i++) {
    let line=[]
    const { route, vehicle } = carRoutes[i]
    const { vehicleId } = vehicle
    const color = getRandomColor(colors)
    setColors([...colors, color])
    let result = await generateRouteLine(route, AMap, map, color)
    let carMarker = result[0].carMarker
    let lineArr = []
    result.map((item) => lineArr.push(item.lineArr))
    lineArr = lineArr.flat()
    lineArr.pop()
    carList.push({
      carMarker: carMarker,
      lineArr: lineArr,
      start: () => startAnimation(carMarker, lineArr,36),
    })
    result.map((item, index) => {
      let carMarker
      if (index < result.length - 1) {
        carMarker = new AMap.Marker({
          position: item.lineArr[0],
          icon: car,
          offset: new AMap.Pixel(-13, -26),
          extData: {
            name: 'car',
          },
        })
          //段落动画视野跟随
        carMarker.on('moving', function (e) {
            map.setCenter(e.target.getPosition(),true)
        });
      }
      let speed=35
      if (item.distance / 1000 > 1000) {
        speed = (item.distance / 1000) / 200
      } else if (item.distance / 1000 > 500) {
        speed = (item.distance / 1000) / 67
      } else if (item.distance / 1000 > 200) {
        speed = (item.distance / 1000) / 17
      } else if (item.distance / 1000 > 100) {
        speed = (item.distance / 1000) / 7
      } else if (item.distance / 1000 > 50) {
        speed = (item.distance / 1000) / 2.6
      } else {
        speed = (item.distance / 1000) / 0.7
        speed = speed < 35 ? 35 : speed}
      line.push({
        carMarker: carMarker,
        trackAni: item.lineArr, //两点的动画对象数组
        vehicleId,
        distance: item.distance, //两点距离
        isRunning: false,
        start: () => startAnimation(carMarker, item.lineArr,speed), //每个点的车标记
      })
    })
    path.push(line)
  }
  setTrackAnis(path)
  }
  // 开始滚动
  const changeSpeedStart= () => {
    let marks = map.getAllOverlays('marker')
    // console.log("maeks=",marks);
     marks.map((item) => {
      let name = item.getExtData().name
      if (name == 'car') {
        // item.stopMove();
      }
    })
  }
  //根据地图大小进行速度的调整
  const changeSpeed=() => {
    console.log("当前地图级别：",map.getZoom());
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
        <div id="container"></div>
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
          onClick={() => {
            showSide()
          }}
        ></Button>
      </div>

      <ResultSide
        key="ResultSide"
        AMap={AMap}
        sideVisible={sideVisible}
        setSideVisible={setSideVisible}
        trackAnis={trackAnis}
        finalSolutionId={finalSolutionId}
        carRoutes={carRoutes}
        carList={carList}
        map={map}
        routeLoading={routeLoading}
      />
    </div>
  )
}
