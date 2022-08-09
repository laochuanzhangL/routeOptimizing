import React, { Suspense, useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Table, Popconfirm, Input, Pagination, message, Button } from 'antd'
import './styles.less'
import httpUtil from '../../../../utils/httpUtil'
import { ClientTableHeader } from './commponents/clientTableHeader'
import { data } from 'browserslist'
import { EditModal } from './commponents/editModal'
export const ClientManage = () => {
  const userId = sessionStorage.getItem('userId')
  const [clients, setClients] = useState([])
  const [page, setPage] = useState(1)
  const [editingClient, setEditingClient] = useState()
  const [editVisible, setEditVisible] = useState(false)
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
        <div className="table_btns">
          <span
            style={{
              color: '#1890ff',
              cursor: 'pointer',
              display: 'block',
            }}
            onClick={() => {
              openEditModal(record)
            }}
          >
            编辑
          </span>
          <Popconfirm
            title="确定删除用户吗？"
            okText="确定"
            cancelText="取消"
            key="userPopconfirm"
            onConfirm={() => handleDelete(record.nodeId)}
          >
            <span
              style={{
                color: '#1890ff',
                cursor: 'pointer',
                display: 'block',
              }}
            >
              删除
            </span>
          </Popconfirm>
        </div>
      ),
    },
  ]

  useEffect(() => {
    getClients()
  }, [page,pageSize])

  //获取所有客户
  const getClients = () => {
    const params={
      page,
      pageSize
    }
    httpUtil.getPartClients(params).then((res) => {
      console.log(res)
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

  const upload = (e) => {
    console.log(e)
  }
  const handleCancel = () => {
    setEditVisible(false)
    setEditingClient()
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

  //打开编辑框
  const openEditModal = (record) => {
    setEditingClient(record)
    setEditVisible(true)
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
            pagination={{
              total: clients.length,
              defaultPageSize: pageSize,
              showSizeChanger: true,
              pageSizeOptions: [2, 20, 50, 100, clients.length],
              current: page,
              onShowSizeChange: (current, pageSize) => {
                console.log(current, pageSize)
              },
              onChange: (page, pageSize) => {
                setPage(page), setPageSize(pageSize)
              },
            }}
          />
          <div className="table_footer_btn">
            <Button type="Link" key="deleteall">
              清空所有
            </Button>
            <Button
              type="Link"
              key="clientdeleteselect"
              style={{ marginLeft: '10px' }}
            >
              删除已选
            </Button>
          </div>
          <EditModal
            editVisible={editVisible}
            editingClient={editingClient}
            setEditVisible={setEditVisible}
            setEditingClient={setEditingClient}
          />
        </div>
      </div>
    </div>
  )
}
