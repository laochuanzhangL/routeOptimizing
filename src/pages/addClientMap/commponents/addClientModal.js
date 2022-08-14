import React from 'react'
import { Button, Modal, Form, Input, message } from 'antd'
import httpUtil from '../../../utils/httpUtil'
export const AddClientModal = (props) => {
  const { addingClient, setClientAddVisible, getNodes, clientAddVisible } =
    props
  const addClient = (e) => {
    const client = {
      lat: parseFloat(e.lat),
      lng: parseFloat(e.lng),
      nodeAddress: e.nodeaddress,
      nodeName: e.nodename,
      clientId: parseInt(e.clientid),
    }
    httpUtil.addClient(client).then((res) => {
        if (res.status == 9999) {
          getNodes()
          message.success(res.msg)
          setClientAddVisible(false)
        } else {
          message.error("当前客户编号已存在")
        }
      })
  }

  return (
    <Modal
      key="clientaddmodal"
      visible={clientAddVisible}
      destroyOnClose={true}
      onCancel={() => {
        setClientAddVisible(false)
      }}
      footer={false}
      cancelText="取消"
      okText="确定"
      title="添加站点"
      className="client_add_modal"
    >
      <Form
        key="addclientform"
        labelCol={{
          span: 4,
        }}
        wrapperCol={{
          span: 14,
        }}
        onFinish={addClient}
        layout="horizontal"
        size="center"
      >
        <Form.Item
          label="客户编号"
          key="clientId"
          name="clientid"
          rules={[{ required: true, message: '请输入客户编号' }]}
        >
          <Input bordered="false" placeholder="请输入客户编号" />
        </Form.Item>
        <Form.Item
          label="客户名称"
          name="nodename"
          key="nodeName"
          initialValue={addingClient?.nodeName ?? 0}
          rules={[{ required: true, message: '请输入客户名称' }]}
        >
          <Input bordered="false" placeholder="请输入客户名称" />
        </Form.Item>
        <Form.Item
          label="详细地址"
          name="nodeaddress"
          key="nodeAddress"
          initialValue={addingClient?.nodeAddress ?? 0}
          rules={[{ required: true, message: '请输入详细地址' }]}
        >
          <Input bordered="false" placeholder="请输入详细地址" />
        </Form.Item>
        <Form.Item
          label="地点经度"
          name="lng"
          key="clientlng"
          initialValue={addingClient?.lng ?? 0}
          required
        >
          {addingClient?.lng ?? 0}
        </Form.Item>
        <Form.Item
          label="地点纬度"
          name="lat"
          key="clientlat"
          initialValue={addingClient?.lat ?? 0}
        >
          {addingClient?.lat ?? 0}
        </Form.Item>
        <Form.Item
          key="submitAddClient"
          style={{
            display: 'flex',
            justifyContent: 'center',
            paddingTop: '25px',
          }}
        >
          <Button type="primary" htmlType="submit" block key="submitEditClient">
            确认信息
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
