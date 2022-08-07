import React from 'react'
import { useState, useEffect } from 'react'
import { Table, Input, Button, Popconfirm, message, Space, Modal } from 'antd'
import httpUtil from '../../../utils/httpUtil'
export const AddClientTables = (props) => {
  const [centerVisible, setCenterVisible] = useState(false)
  const [detailsVisible, setDetailsVisible] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [detailSelectedRowKeys, setDetailSelectedRowKeys] = useState([])
  const [searchNodes, setSearchNodes] = useState([])
  const [page, setPage] = useState(1)
  const { nodes, setNodes, getNodes ,setCenter,setWindowInfo} = props
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
        // {/* <Popconfirm
        //   title="是否删除?"
        //   okText="确定"
        //   cancelText="取消"
        //   onConfirm={() => handleDeleteClient(record.nodeId)}
        // >
        //   <a>删除</a>
        // </Popconfirm> */}
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
  }, [])

  //获取所有客户
  const getClients = () => {
    httpUtil.getAllClients().then((res) => {
      if (res.status == 1000) {
        setNodes(res.data)
      }
    })
  }
  useEffect(() => {
    getselectedRowKeys()
  }, [nodes])

  // //改变地图展示中心点
  // const changeCenter = (e) => {
  //   const { lat, lng } = e
  //   console.log(e)
  
  // }

  const detailSearch = (e) => {
    const keyWord = e.target.value
    const arr = []
    nodes.map((item) => {
      for (const [key, value] of Object.entries(item)) {
        const str = value + ''
        if (str.indexOf(keyWord) >= 0) {
          arr.push(item)
          break
        }
      }
    })
    setSearchNodes([...arr])
  }
  const openDetails = () => {
    setDetailsVisible(true)
  }
  const handleDelete = (e) => {
    const { nodeId } = e
    const query = { nodeId }
    httpUtil.deleteNode(query).then((res) => {
      if (res.status == 9999) {
        message.success('删除选点成功')
        const index = nodes.indexOf(e)
        nodes.splice(index, 1)
        setNodes([...nodes])
        getNodes() //会发出请求 反应更慢 用下面的方式，页面反应更快
      } else {
        message.error('删除选点失败')
      }
    })
  }

  const cancelDetail = () => {
    setDetailsVisible(false)
    setSearchNodes([])
  }
  // 查看详细页面的删除
  const deleteSelect = (e) => {
    if (detailSelectedRowKeys.length == 0) {
      message.warn('请至少选择一个点')
    } else {
      if (confirm('是否要删除所选站点')) {
        console.log(e)
        const filtered = nodes.filter(function (value, index, arr) {
          return !detailSelectedRowKeys.includes(value.nodeId)
        })
        setNodes(filtered)
        setDetailSelectedRowKeys([])
      }
    }
  }
  //处理删除函数
  const handleDeleteClient = (nodeId) => {
    let parmas = { nodeId }
    httpUtil.deleteClients(parmas).then((res) => {
      if (res.status == 9999) {
        getClients()
        message.success('删除成功')
      } else message.error('删除失败')
    })
  }
  //清空所有点
  const deleteAll = () => {
    const params = { userId: 1 }
    if (confirm('是否要清空所有站点')) {
      const result = httpUtil.deleteAllNodes(params)
      console.log(result)
      result.then((res) => {
        if (res.status == 9999) {
          getNodes()
          setNodes([])
          message.success(res.msg)
        } else {
          message.warn(res.msg)
        }
      })
    }
  }
  const selectChange = (selectedRowKeys, selectedRows) => {
    setSelectedRowKeys(selectedRowKeys)
  }

  const detailSelectChange = (selectedRowKeys, selectedRows) => {
    setDetailSelectedRowKeys(selectedRowKeys)
  }
  const upload = () => {
    if (selectedRowKeys.length == 0) {
      message.warn('请选择至少一个中心点')
    } else {
      for (let node of nodes) {
        if (selectedRowKeys.includes(node.nodeId)) {
          node.isCenter = 1
        }
      }
      httpUtil.updateNode(nodes).then((res) => {
        if (res.status == 9999) {
          setCenterVisible(false)
          message.success('中心点选择成功')
          getNodes()
          setSelectedRowKeys([])
        } else {
          message.error('请提交正确数据')
        }
      })
    }
  }

  const getselectedRowKeys = () => {
    const arr = []
    nodes.map((item) => {
      const { isCenter } = item
      if (isCenter) {
        const { nodeId } = item
        arr.push(nodeId)
      }
    })
    setSelectedRowKeys(arr)
  }

  //中心点table的rowSelection
  const rowSelection = {
    selectedRowKeys,
    onChange: selectChange,
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
        key="nodesTable"
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
            onChange={detailSearch}
            enterButton
          />
        </div>
        <Table
          bordered
          scroll={{ y: '50vh' }}
          key="clientDetailsTable"
          dataSource={searchNodes.length ? searchNodes : nodes}
          rowSelection={detailRowSelection}
          columns={detailsColumns}
          rowKey={(record) => {
            return record.nodeId
          }}
          height="50vh"
          pagination={{
            total: nodes.length,
            defaultPageSize: 8,
            current: page,
            onChange: (page) => {
              setPage(page)
            },
          }}
        />
      </Modal>
    </div>
  )
}
