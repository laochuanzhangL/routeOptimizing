import marke_r from '../assets/mark_b.png'
import mid from '../assets/mid.png'
import car from '../assets/car.png'

export const getRandomColor = (exist_color) => {
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

export const createLabelMarker = (AMap, coordinate, image) => {
  const labelMarker = new AMap.LabelMarker({
    position: [coordinate.longitude, coordinate.latitude],
    opacity: 1,
    zIndex: 2,
    //图标对象
    icon: {
      type: 'image',
      image,
      size: [20, 30],
      anchor: 'bottom-center',
      angel: 0,
      retina: true
    },
    offset: new AMap.Pixel(-10, -30)
  })
  return labelMarker
}

export const createLabelsLayer = AMap => {
  // 创建一个 LabelsLayer 实例来承载 LabelMarker
  const labelsLayer = new AMap.LabelsLayer({
    zooms: [3, 20],
    zIndex: 111,
    animation: false,
    collision: false
  })
  return labelsLayer
}

export const parseRouteToPath = route => {
  const path = []
  for (let i = 0, l = route.steps.length; i < l; i++) {
    const step = route.steps[i]
    for (let j = 0, n = step.path.length; j < n; j++) {
      path.push(step.path[j])
    }
  }
  return path
}

const createMarker = (AMap, map, path, image, x, y) => {
  return new AMap.Marker({
    position: path,
    icon: image,
    map,
    offset: new AMap.Pixel(x, y)
  })
}

const createPolyline = (AMap, path, color) => {
  return new AMap.Polyline({
    path,
    isOutline: true,
    outlineColor: '#ffeeee',
    borderWeight: 1,
    strokeWeight: 6,
    showDir: true,
    strokeOpacity: 0.6,
    strokeColor: color,
    lineJoin: 'round'
  })
}

export const startAnimation = (marker, lineArr,speed) => {
  marker.moveAlong(lineArr, {
    // 每一段的时长
    duration: speed, //可根据实际采集时间间隔设置
    // JSAPI2.0 是否延道路自动设置角度在 moveAlong 里设置
    autoRotation: true
  })
}

export const pauseAnimation = marker => {
  marker.pauseMove()
}

export const resumeAnimation = marker => {
  marker.resumeMove()
}

export const stopAnimation = marker => {
  marker.stopMove()
}

export const generateRouteLine = (route, AMap, map, color) => {
  const length = route.length
  // 构造路线导航类
  const driving = new AMap.Driving({
    policy: AMap.DrivingPolicy.LEAST_TIME
  })
  let carMarkerAndLineArr

  return Promise.all(
    route.map((item, index) => {
      return new Promise((resolve, reject) => {
        if (index === length - 1) {
          resolve({
            distance: 0,
            time: 0
          })
        }
        driving.search(
          new AMap.LngLat(route[index]['lng'], route[index]['lat']),
          new AMap.LngLat(
            route[index + 1]['lng'],
            route[index + 1]['lat']
          ),
          (status, result) => {
            if (status === 'complete') {
              if (result.routes && result.routes.length) {
                carMarkerAndLineArr = drawRoute(
                  result.routes[0],
                  index,
                  route[index].nodeName
                )
              }
            }
            if (index === 0) {
              //段落动画视野跟随
              carMarkerAndLineArr.carMarker.on('moving', function (e) {
                //passedPolyline.setPath(e.passedPath);
                map.setCenter(e.target.getPosition(),true)
              });
              resolve({
                distance: result.routes[0].distance,
                time: result.routes[0].time,
                carMarker: carMarkerAndLineArr.carMarker,
                lineArr: carMarkerAndLineArr.lineArr
              })
            } else {
              resolve({
                distance: result.routes[0].distance,
                time: result.routes[0].time,
                lineArr: carMarkerAndLineArr.lineArr
              })
            }
          }
        )
      })
    })
  )
  // 创建信息窗体
  function createInfoWindow(title, content){
    let info = document.createElement("div");
    info.className = "custom-info input-card content-window-card";

    //可以通过下面的方式修改自定义窗体的宽高
    info.style.width = "240px";
    // 定义顶部标题
    let top = document.createElement("div");
    let titleD = document.createElement("div");
    let closeX = document.createElement("img");
    top.className = "info-top";
    titleD.innerHTML = title;
    closeX.src = "https://webapi.amap.com/images/close2.gif";
    closeX.onclick = closeInfoWindow;

    top.appendChild(titleD);
    top.appendChild(closeX);
    info.appendChild(top);

    // 定义中部内容
    let middle = document.createElement("div");
    middle.className = "info-middle";
    middle.style.backgroundColor = 'white';
    middle.innerHTML = content;
    info.appendChild(middle);

    // 定义底部内容
    let bottom = document.createElement("div");
    bottom.className = "info-bottom";
    bottom.style.position = 'relative';
    bottom.style.top = '0px';
    bottom.style.margin = '0 auto';
    let sharp = document.createElement("img");
    sharp.src = "https://webapi.amap.com/images/sharp.png";
    bottom.appendChild(sharp);
    info.appendChild(bottom);
    return info;
}
 //关闭信息窗体
  function closeInfoWindow() {
    map.clearInfoWindow();
  }
  function drawRoute(route, index, address) {
    const path = parseRouteToPath(route)
    const routeLine = createPolyline(AMap, path, color)
    let marker, carMarker, lineArr
    lineArr = path.map(item => [item.lng, item.lat])
    if (index === 0) {
      marker = createMarker(AMap, map, path[0], marke_r, -10, -31)
      carMarker 
      =new AMap.Marker({
        position: path[0],
        icon: car,
        offset: new AMap.Pixel(-13, -26),
        extData:{
          name:"car"
        }
      })
      marker.on('mouseover',(e) => {
        //实例化信息窗体
         let title = '<span style="font-size:20px;">站点</span>',
         content = [];
         content.push(address);
         let infoWindow = new AMap.InfoWindow({
         isCustom: true,  //使用自定义窗体
         content: createInfoWindow(title, content.join("<br/>")),
         offset: new AMap.Pixel(16, -45)
         });
        infoWindow.open(map, marker.getPosition());
      })
      marker.on('mouseout', function(){
        map.clearInfoWindow();
      });
      map.add(routeLine)
    } else {
      let marker = createMarker(AMap, map, path[0], mid, -13, -26)
      marker.on('mouseover',(e) => {
        //实例化信息窗体
         let title = '<span style="font-size:20px;">站点</span>',
         content = [];
         content.push(address);
         let infoWindow = new AMap.InfoWindow({
         isCustom: true,  //使用自定义窗体
         content: createInfoWindow(title, content.join("<br/>")),
         offset: new AMap.Pixel(16, -45)
         });
        infoWindow.open(map, marker.getPosition());
      })
      marker.on('mouseout', function(){
        map.clearInfoWindow();
      });
      map.add(routeLine)
    }
    return { carMarker, lineArr }
  }
}
