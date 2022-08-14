import React, { useEffect, useState } from 'react'
import { Table, Popconfirm, message, Button } from 'antd'
import './styles.less'
import httpUtil from '../../../../utils/httpUtil'
import { QuestionCircleOutlined } from '@ant-design/icons'
import { ClientTableHeader } from './commponents/clientTableHeader'
import { EditModal } from './commponents/editModal'
export const ClientManage = () => {
  const userId = sessionStorage.getItem('userId')
  const [searchClients, setSearchClients] = useState([])
  const [clients, setClients] = useState([])
  const [pageNum, setPageNum] = useState(1)
  const [editingClient, setEditingClient] = useState()
  const [clientLen, setClientLen] = useState(0)
  const [editVisible, setEditVisible] = useState(false)
  const [pageSize, setPageSize] = useState(10)
  const [selectClients, setSeleceClients] = useState([])

  //列
  const columns = [
    {
      title: '客户编号',
      dataIndex: 'clientId',
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
            onConfirm={() => deleteOneClient(record.nodeId)}
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
  }, [pageNum, pageSize])

  //获取所有客户
  const getClients = () => {
    const params = {
      pageNum,
      pageSize,
    }
    httpUtil.getPartClients(params).then((res) => {
      if (res.status == 9999) {
        setClients(res.data.records)
        setClientLen(res.data.total)
      }
    })
  }

  //单选框变化函数
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      setSeleceClients(selectedRowKeys)
    },
  }
  //删除单个客户
  const deleteOneClient = (nodeId) => {
    let parmas = { nodeId }
    httpUtil.deleteClient(parmas).then((res) => {
      if (res.status == 9999) {
        getClients()
        setSeleceClients([])
        message.success('删除成功')
      } else message.error('删除失败')
    })
  }

  //批量删除
  const deleteClients = () => {
    if (searchClients) {
      let parmas={nodeIdList :selectClients}
      httpUtil.deleteClients(parmas).then((res) => {
        if (res.status == 9999) {
          message.success(res.msg)
          getClients()
        }
      })
    } else {
      message.warn('请选择客户')
    }
  }
  //打开编辑框
  const openEditModal = (record) => {
    setEditingClient(record)
    setEditVisible(true)
  }
  //修改用户信息的请求
  const uploadEdit = (e) => {
    const newClient = {
      lat: parseFloat(e.lat),
      lng: parseFloat(e.lng),
      nodeAddress: e.nodeaddress,
      nodeId: editingClient.nodeId,
      nodeName: e.nodename,
      clientId: parseInt(e.clientid),
    }
    httpUtil.editClients([newClient]).then((res) => {
      if (res.status === 9999) {
        message.success('修改成功')
        getClients()
        setEditVisible(false)
      } else {
        message.error('修改失败')
      }
    })
  }
  //清空所有
  const deleteAllClients = () => {
    httpUtil.deleteAllClients().then((res) => {
      if (res.status == 9999) {
        message.success('删除成功')
        getClients()
      }
    })
  }
  return (
    <div className="clientManage">
      <div className="content">
        <ClientTableHeader
          userId={userId}
          getClients={getClients}
          clients={clients}
          pageSize={pageSize}
          pageNum={pageNum}
          setClients={setClients}
          searchClients={searchClients}
          setSearchClients={setSearchClients}
          setClientLen={setClientLen}
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
              total: clientLen,
              defaultPageSize: pageSize,
              showSizeChanger: true,
              pageSizeOptions: [10, 20, 50, 100, clientLen],
              current: pageNum,
              onShowSizeChange: (current, pageSize) => {
                console.log(current, pageSize)
              },
              onChange: (page, pageSize) => {
                setPageNum(page), setPageSize(pageSize)
              },
            }}
          />
          {clients.length ? (
            <div className="table_footer_btn">
              <Popconfirm
                title="确定要清空用户吗？"
                icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                onConfirm={deleteAllClients}
                okText="确认"
                cancelText="取消"
              >
                <Button type="Link" key="deleteallClients">
                  清空所有
                </Button>
              </Popconfirm>
              {selectClients?.length ?? false ? (
                <Popconfirm
                  title="确定要删除已选用户吗？"
                  icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                  onConfirm={deleteClients}
                  okText="确认"
                  cancelText="取消"
                >
                  <Button
                    key="clientdeleteselect"
                    type="primary"
                    style={{ marginLeft: '10px' }}
                  >
                    {`已选${selectClients.length}个`}
                  </Button>
                </Popconfirm>
              ) : (
                <Button
                  type="Link"
                  key="clientdeleteselect"
                  style={{ marginLeft: '10px' }}
                  onClick={()=>{
                    message.warn('请先选择要删除的客户')
                  }}
                >
                  删除已选
                </Button>
              )}
            </div>
          ) : null}
          <EditModal
            editVisible={editVisible}
            editingClient={editingClient}
            setEditVisible={setEditVisible}
            setEditingClient={setEditingClient}
            uploadEdit={uploadEdit}
          />
        </div>
      </div>
    </div>
  )
}
