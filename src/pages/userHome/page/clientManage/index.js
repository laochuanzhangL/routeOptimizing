import React, { useRef, useState } from 'react'
import {
  Table,
  Button,
  message,
  Modal,
  Input,
  Popconfirm,
  Space,
  Form,
} from 'antd'

import './styles.less'

export const ClientManage = () => {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(7)
  const [data, setData] = useState([
    {
      key: '1',
      number: '1',
      userName: '我的名字',
      longitude: '1,2',
      address: '北京',
    },
    {
      key: '2',
      number: '1',
      userName: '我的名字',
      longitude: '1,2',
      address: '北京',
    },
  ])

  const [visible, setVisible] = useState(false)
  //列
  const columns = [
    {
      title: '编号',
      dataIndex: 'number',
    },
    {
      title: '客户名称',
      dataIndex: 'userName',
    },
    {
      title: '经纬度',
      dataIndex: 'longitude',
    },
    {
      title: '详细地址',
      dataIndex: 'address',
    },

    {
      title: '操作',
      width: 200,
      dataIndex: 'action',
      render: (_, record) => (
        <Popconfirm
          title="确定删除用户吗？"
          okText="确定"
          cancelText="取消"
          key="userPopconfirm"
          onConfirm={() => handleDelete(record)}
        >
          <a>删除</a>
        </Popconfirm>
      ),
    },
  ]

  //单选框变化函数
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(
        `selectedRowKeys: ${selectedRowKeys}`,
        'selectedRows: ',
        selectedRows
      )
    },
  }

  //处理删除函数
  const handleDelete = (e) => {
    console.log(e)
  }
  //新增客户
  const addUser = () => {
    setVisible(!visible)
  }
  //增加用户
  const handleCancel = () => {
    setVisible(false)
  }
  //创建文本域，提交完成后清空表单
  const addFrom = useRef()

  //增加表单提交函数
  const onFinish = (values) => {
    setVisible(false)

    //尝试添加客户
    // const value={key:new Date(),...values}
    // setData([...data,value])

    console.log(values)
    addFrom.current.resetFields()
  }

  //增加表单提交失败函数
  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo)
  }

  return (
    <div className="clientManage">
      <div className="content">
        <div className="table_header">
          <Button
            type="primary"
            className="table_btn"
            key="addUser"
            onClick={addUser}
          >
            添加客户
          </Button>
        </div>
        <div className="modal">
          <Modal
            title="添加客户"
            key="addUserModal"
            footer={null}
            visible={visible}
            onCancel={handleCancel}
          >
            <Form
              name="basic"
              labelCol={{
                span: 4,
              }}
              wrapperCol={{
                span: 20,
              }}
              ref={addFrom}
              autoComplete="off"
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
            >
              <Form.Item
                name="number"
                label="编号"
                rules={[
                  {
                    message: '请输入编号！',
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="客户名称"
                name="userName"
                rules={[
                  {
                    message: '请输入客户名称！',
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="经纬度"
                name="longitude"
                rules={[
                  {
                    message: '请输入经纬度！',
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="详细地址"
                name="address"
                rules={[
                  {
                    message: '请输入详细地址！',
                  },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                wrapperCol={{
                  offset: 3,
                  span: 18,
                }}
              >
                <Button type="primary" htmlType="submit" block>
                  添加
                </Button>
              </Form.Item>
            </Form>
          </Modal>
        </div>
        <div className="table_wrap">
          <Table
            bordered
            rowSelection={{
              type: 'checkbox',
              ...rowSelection,
            }}
            columns={columns}
            dataSource={data}
            key="userTable"
            pagination={{
              total: data.length,
              defaultPageSize: pageSize,
              current: page,
              onChange: (page, pageSize) => {
                setPage(page), setPageSize(pageSize)
              },
            }}
          />
        </div>
      </div>
    </div>
  )
}
