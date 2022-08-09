import React from 'react'
import { useEffect } from 'react'
import { Button, Modal, Form, Input } from 'antd'
import httpUtil from '../../../../../utils/httpUtil'
export const EditModal = (props) => {
  const { editVisible, editingClient, setEditVisible, setEditingClient } = props
  const upload = (e) => {
    e.lng=parseFloat(e.lng)
    e.lat=parseFloat(e.lat)
    httpUtil.editClients(e).then(res=>{
        console.log(res)
    })
}
  const handleCancel = () => {
    setEditVisible(false)
    setEditingClient()
  }
  return (
    <Modal
      title="修改客户信息"
      footer={null}
      visible={editVisible}
      destroyOnClose={true}
      key="editclientvisible"
      onOk={upload}
      onCancel={handleCancel}
    >
      <Form
        key="editclientform"
        labelCol={{
          span: 4,
        }}
        wrapperCol={{
          span: 14,
        }}
        onFinish={upload}
        layout="horizontal"
        size="center"
      >
        <Form.Item
          label="编号"
          key="clientId"
          initialValue={editingClient?.nodeId ?? 0}
          name="nodeId"
        >
          {editingClient?.nodeId ?? 0}
        </Form.Item>
        <Form.Item
          label="客户名称"
          name="clientName"
          initialValue={editingClient?.nodeName ?? 0}
          key="nodeName"
          rules={[{ required: true, message: '请输入客户名称' }]}
        >
          <Input bordered="false"   placeholder="请输入客户名称" />
        </Form.Item>
        <Form.Item
          label="详细地址"
          name="nodeAddress"
          key="nodeAddress"
          initialValue={editingClient?.nodeAddress ?? 0}
          rules={[{ required: true, message: '请输入详细地址' }]}
        >
          <Input bordered="false" placeholder="请输入详细地址" />
        </Form.Item>
        <Form.Item
          label="地点经度"
          name="lng"
          key="clientlng"
          initialValue={editingClient?.lng ?? 0}
          required
          rules={[{ required: true, message: '请输入数字' }]}
        >
          <Input bordered="false" type="number" placeholder="请输入经度" />
        </Form.Item>
        <Form.Item
          label="地点纬度"
          name="lat"
          key="clientlat"
          initialValue={editingClient?.lat ?? 0}
          rules={[{ required: true, message: '请输入数字' }]}
        >
          <Input bordered="false"  type="number" placeholder="请输入纬度" />
        </Form.Item>

        <Form.Item
          key="submmit"
          style={{
            display: 'flex',
            justifyContent: 'center',
            paddingTop: '25px',
          }}
        >
          <Button type="primary" htmlType="submit" block>
            确认信息
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
