import React from 'react'
import { Button, Modal, Form, Input, message } from 'antd'
export const EditModal = (props) => {
  const {
    editVisible,
    editingClient,
    setEditVisible,
    setEditingClient,
    uploadEdit,
  } = props
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
        onFinish={uploadEdit}
        layout="horizontal"
        size="center"
      >
        <Form.Item
          label="编号"
          key="nodeId"
          name="nodeid"
          initialValue={editingClient?.nodeId ?? 0}
        >
          {editingClient?.nodeId ?? 0}
        </Form.Item>
        <Form.Item
          label="客户名称"
          name="nodename"
          key="nodeName"
          initialValue={editingClient?.nodeName ?? 0}
          rules={[{ required: true, message: '请输入客户名称' }]}
        >
          <Input bordered="false" placeholder="请输入客户名称" />
        </Form.Item>
        <Form.Item
          label="详细地址"
          name="nodeaddress"
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
          <Input bordered="false" type="number" placeholder="请输入纬度" />
        </Form.Item>
        <Form.Item
          key="submitEditClient"
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
