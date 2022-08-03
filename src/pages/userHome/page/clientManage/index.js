import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import {
  Table,
  Popconfirm,
  Input,
} from 'antd'

import './styles.less'
import httpUtil from '../../../../utils/httpUtil'
import { ClientTableHeader } from './commponents/clientTableHeader'
export const ClientManage = () => {
  const userId = sessionStorage.getItem('userId')
  const [clients, setClients] = useState([])
  const [page, setPage] = useState(1)
  const history = useHistory()
  const [pageSize, setPageSize] = useState(10)
  const [data, setData] = useState([
    {
      key: '1',
      number: '1',
      userName: '我的名字',
      longitude: '1,2',
      address: '北京',
    },
    {
      key: '1',
      number: '1',
      userName: '我的名字',
      longitude: '1,2',
      address: '北京',
    },
    {
      key: '1',
      number: '1',
      userName: '我的名字',
      longitude: '1,2',
      address: '北京',
    },
    {
      key: '1',
      number: '1',
      userName: '我的名字',
      longitude: '1,2',
      address: '北京',
    },
    {
      key: '1',
      number: '1',
      userName: '我的名字',
      longitude: '1,2',
      address: '北京',
    },
  ])

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

  //获取所有客户
  const getClients=()=>{

  }

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

  return (
    <div className="clientManage">
      <div className="content">
       <ClientTableHeader userId={userId} getClients={getClients}  clients={clients} setClients={setClients}/>
        <div className="table_wrap">
          <Table
            bordered
            rowSelection={{
              type: 'checkbox',
              ...rowSelection,
            }}
            columns={columns}
            dataSource={data}
            key="clientTable"
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
