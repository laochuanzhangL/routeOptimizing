import React from 'react'
import { useState, useEffect } from 'react'
import { Table, Input, Button, Popconfirm, message, Space, Modal } from 'antd'
import httpUtil from '../../../utils/httpUtil'
export const AddClientTables = (props) => {
  const [detailsVisible, setDetailsVisible] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [detailSelectedRowKeys, setDetailSelectedRowKeys] = useState([])
  const [searchClients, setSearchClients] = useState([])
  const [pageNum, setPageNum] = useState(1)
  const [pageSize, setPageSize] = useState(8)
  const [clients, setClients] = useState([])
  const [clientsLen, setClientsLen] = useState(0)
  const { getNodes, setWindowInfo, nodes } = props
  const { Search } = Input
  const nodeColumns = [
    {
      title: '编号',
      dataIndex: 'nodeId',
      width: 100,
      render: (render) => {
        return render
      },
    },
    {
      title: '客户名称',
      dataIndex: 'nodeName',
      render: (render) => {
        return render
      },
    },
    {
      title: '操作',
      dataIndex: 'action',
      width: 70,
      render: (_, record) => (
        <span
          style={{ color: '#1890ff', cursor: 'pointer', display: 'block' }}
          onClick={() => {
            setWindowInfo([record])
          }}
        >
          跳转
        </span>
      ),
    },
  ]
  //详细页面Columns
  const detailsColumns = [
    {
      title: '编号',
      dataIndex: 'nodeId',
      width: 100,
      render: (render) => {
        return render
      },
    },
    {
      title: '用户名称',
      dataIndex: 'nodeName',
      render: (render) => {
        return render
      },
    },
    {
      title: '详细地址',
      dataIndex: 'nodeAddress',
      render: (render) => {
        return render
      },
    },
  ]
  useEffect(() => {
    getClients()
  }, [pageNum, pageSize,nodes])

  //获取所有客户
  const getClients = () => {
    const params = {
      pageNum,
      pageSize,
    }
    httpUtil.getPartClients(params).then((res) => {
      if (res.status == 9999) {
        setClients(res.data.records)
        setClientsLen(res.data.total)
      }
    })
  }
  useEffect(() => {
    getselectedRowKeys()
  }, [clients])

  const openDetails = () => {
    setDetailsVisible(true)
  }

  const cancelDetail = () => {
    setDetailsVisible(false)
    setSearchClients([])
  }
  // 查看详细页面的删除
  const deleteSelect = () => {
    if (detailSelectedRowKeys.length == 0) {
      message.warn('请至少选择一个点')
    } else {
      if (confirm('是否要删除所选站点')) {
        let parmas = { nodeIdList: detailSelectedRowKeys }
        httpUtil.deleteClients(parmas).then((res) => {
          if (res.status == 9999) {
            message.success(res.msg)
            getClients()
            getNodes()
            setDetailSelectedRowKeys([])
          }
        })
      }
    }
  }
  //处理删除函数
  const handleDeleteClient = (nodeId) => {
    let parmas = { nodeId }
    httpUtil.deleteClients(parmas).then((res) => {
      if (res.status == 9999) {
        getClients()
        getNodes()
        message.success('删除成功')
      } else message.error('删除失败')
    })
  }
  //清空所有点
  const deleteAll = () => {
    if (confirm('是否要清空所有站点')) {
      httpUtil.deleteAllClients().then((res) => {
        if (res.status == 9999) {
          message.success('删除成功')
          getClients()
          getNodes()
        }
      })
    }
  }

  const detailSelectChange = (selectedRowKeys, selectedRows) => {
    setDetailSelectedRowKeys(selectedRowKeys)
  }

  const getselectedRowKeys = () => {
    const arr = []
    clients.map((item) => {
      const { isCenter } = item
      if (isCenter) {
        const { nodeId } = item
        arr.push(nodeId)
      }
    })
    setSelectedRowKeys(arr)
  }

  //查看详细table的rowSelection
  const detailRowSelection = {
    detailSelectedRowKeys,
    onChange: detailSelectChange,
  }
  //左下角table的底部元素
  const nodeFooter = () => {
    return (
      <div className="node_footer">
        <div className="button_wrap">
          <Button type="primary" onClick={openDetails}>
            查看详细
          </Button>
        </div>
      </div>
    )
  }
  return (
    <div className="nodes">
      <Table
        bordered
        key="clientsAddTable"
        dataSource={nodes}
        columns={nodeColumns}
        rowKey={(record) => {
          return record.nodeId
        }}
        pagination={false}
        footer={nodeFooter}
        scroll={{ y: 300 }}
      />

      {/* 查看详细的Modal */}
      <Modal
        visible={detailsVisible}
        onCancel={cancelDetail}
        title="站点详细"
        key="clientDetailsModal"
        className="details_modal"
        width="1000px"
        style={{
          minWidth: '1000px',
          minHeight: '500px',
        }}
        height="auto"
        footer={[
          <Button type="Link" key="deleteall" onClick={deleteAll}>
            清空所有
          </Button>,
          <Button
            type="primary"
            key="delete"
            onClick={deleteSelect}
            style={{ marginRight: '700px' }}
          >
            删除已选
          </Button>,
          <Button type="primary" key="ok" onClick={cancelDetail}>
            确认
          </Button>,
        ]}
      >
        <div className="detail_search">
          <Search
            key="clientDetailsSearch"
            placeholder="请输入目标编号/名称/地址/经纬度"
            // onChange={detailSearch}
            enterButton
          />
        </div>
        <Table
          bordered
          scroll={{ y: '50vh' }}
          key="clientsAddDetailsTable"
          dataSource={searchClients.length ? searchClients : clients}
          rowSelection={detailRowSelection}
          columns={detailsColumns}
          rowKey={(record) => {
            return record.nodeId
          }}
          height="50vh"
          pagination={{
            total: clientsLen,
            defaultPageSize: pageSize,
            showSizeChanger: true,
            pageSizeOptions: [2, 20, 50, 100, clientsLen],
            current: pageNum,
            onChange: (page, pageSize) => {
              setPageNum(page), setPageSize(pageSize)
            },
          }}
        />
      </Modal>
    </div>
  )
}
