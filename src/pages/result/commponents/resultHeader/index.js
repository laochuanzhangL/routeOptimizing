import React from 'react'
import { Input, Button } from 'antd'
import { ImportOutlined } from '@ant-design/icons'
import { useHistory } from 'react-router'
import './styles.scss'
import { useState } from 'react'
export const ResultHeader = (props) => {
  const { setCenter, sideVisible } = props
  const history = useHistory()
  const BMapGL = window.BMapGL
  const { Search } = Input
  //改变地图中心位置
  const onSearch = (e) => {
    //不能携带cookie，故单独写请求
    const myGeo = new BMapGL.Geocoder()
    // 将地址解析结果显示在地图上，并调整地图视野
    myGeo.getPoint(
      e,
      function (point) {
        if (point) {
        console.log(point)

          setCenter(point)
        } else {
          alert('您选择的地址没有解析到结果！')
        }
      },
      '中国'
    )
  }

  //返回首页
  const goBack = () => {
    history.push('/user')
  }

  return (
    <div
      className="result_header"
      style={sideVisible ? { width: '75vw' } : { width: '100vw' }}
    >
      <div className="search_wrap">
        <Search
          placeholder="输入地点名称"
          enterButton="跳转"
          className="search"
          size="large"
          onSearch={onSearch}
          style={{ borderRadius: '10px' }}
        />
        <Button
          type="primary"
          size="large"
          icon={<ImportOutlined style={{ fontSize: '20px' }} />}
          onClick={goBack}
        >
          返回首页
        </Button>
      </div>
    </div>
  )
}
