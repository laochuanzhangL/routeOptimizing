import React from 'react'
import { Input, Button, Upload, message, Modal, Table } from 'antd'
import {
  CloudUploadOutlined,
  ImportOutlined,
  UserAddOutlined,
} from '@ant-design/icons'
import { useHistory } from 'react-router'
import { useState } from 'react'
import httpUtil from '../../../utils/httpUtil'
export const SelectHeader = (props) => {
  const [clientAddVisible, setClientAddVisible] = useState(true)
  const { setCenter, questionId, getNodes } = props
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

  const changeShowClients = () => {}

  const submitClients = () => {}
  return (
    <div className="selectAddress_header">
      <div className="search_wrap">
        <Search
          placeholder="输入地点名称"
          enterButton="跳转"
          className="search"
          size="large"
          onSearch={onSearch}
          style={{ borderRadius: '10px' }}
        />
      </div>
      <div className="button_wrap">
        <Button
          type="primary"
          size="large"
          onClick={() => {
            setClientAddVisible(true)
          }}
          icon={<UserAddOutlined style={{ fontSize: '20px' }} />}
        >
          添加用户
        </Button>
        <Button
          type="primary"
          size="large"
          icon={<ImportOutlined style={{ fontSize: '20px' }} />}
          onClick={goBack}
        >
          返回首页
        </Button>
      </div>
      <Modal
        key="clientAddModal"
        visible={clientAddVisible}
        title="添加客户"
        // okText="确认"
        // cancelText="取消"
        // onOk={submitClients}
        onCancel={() => {
          setClientAddVisible(false)
        }}
        footer={[
          <Button
            type="primary"
            style={{ marginRight: '730px' }}
            key="deleteall"
            onClick={changeShowClients}
          >
            显示所有
          </Button>,
          <Button
            type="Link"
            key="delete"
            onClick={() => {
              setClientAddVisible(false)
            }}
          >
            取消
          </Button>,
          <Button type="primary" key="ok" onClick={submitClients}>
            确认
          </Button>,
        ]}
        className="client_add_modal"
        width="1000px"
        style={{
          minWidth: '800px',
          minHeight: '600px',
        }}
        height="600px"
      >
        <Table></Table>
      </Modal>
    </div>
  )
}
