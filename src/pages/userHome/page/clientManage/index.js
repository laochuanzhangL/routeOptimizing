import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Table, Popconfirm, Input, Pagination, message } from 'antd'
import './styles.less'
import httpUtil from '../../../../utils/httpUtil'
import { ClientTableHeader } from './commponents/clientTableHeader'
export const ClientManage = () => {
  const userId = sessionStorage.getItem('userId')
  const [clients, setClients] = useState([])
  const [page, setPage] = useState(1)
  const history = useHistory()
  const [pageSize, setPageSize] = useState(50)

  //列
  const columns = [
    {
      title: '编号',
      dataIndex: 'nodeId',
      width: 100,
    },
    {
      title: '客户名称',
      dataIndex: 'nodeName',
    },
    {
      title: '经纬度(经度/纬度)',
      dataIndex: 'longitude',
      render: (_, record) => {
        const { lat, lng } = record
        return lng + '/' + lat
      },
    },
    {
      title: '详细地址',
      dataIndex: 'nodeAddress',
    },

    {
      title: '操作',
      width: 100,
      dataIndex: 'action',
      render: (_, record) => (
        <Popconfirm
          title="确定删除用户吗？"
          okText="确定"
          cancelText="取消"
          key="userPopconfirm"
          onConfirm={() => handleDelete(record.nodeId)}
        >
          <a>删除</a>
        </Popconfirm>
      ),
    },
  ]

  useEffect(() => {
    getClients()
  },[pageSize])

  //获取所有客户
  const getClients = () => {
    httpUtil.getAllClients().then((res) => {
      if (res.status == 1000) {
        setClients(res.data)
      }
    })
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
  const handleDelete = (nodeId) => {
    let parmas = { nodeId }
    httpUtil.deleteClients(parmas).then((res) => {
      if (res.status == 9999) {
        getClients()
        message.success('删除成功')
      } else message.error('删除失败')
    })
  }

  return (
    <div className="clientManage">
      <div className="content">
        <ClientTableHeader
          userId={userId}
          getClients={getClients}
          clients={clients}
          setClients={setClients}
        />
        <div className="table_wrap">
          <Table
            bordered
            rowSelection={{
              type: 'checkbox',
              ...rowSelection,
            }}
            columns={columns}
            dataSource={clients}
            key="clientTable"
            rowKey={(record) => record.nodeId}
            scroll={{ y: '60vh' }}
            style={{ minHeight: '450px' }}
            pagination={{
              total: clients.length,
              defaultPageSize: pageSize,
              showSizeChanger: true,
              pageSizeOptions: [10, 20, 50, 100, clients.length],
              current: page,
              onShowSizeChange: (current, pageSize) => {
                console.log(current, pageSize)
              },
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
