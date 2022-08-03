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
  const { nodes, setNodes, userId, getNodes } = props
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
      title: '详细地址',
      dataIndex: 'nodeAddress',
      render: (render) => {
        return render
      },
    },
    {
      title: '操作',
      dataIndex: 'action',
      width: 70,
      render: (_, record) => (
        <Space size="middle">
          <Popconfirm
            title="是否删除?"
            okText="确定"
            cancelText="取消"
            onConfirm={() => handleDelete(record)}
          >
            <a>删除</a>
          </Popconfirm>
        </Space>
      ),
    },
  ]
  //详细页面Columns
  const detailsColumns = [
    {
      title: '编号',
      dataIndex: 'nodeId',
      width: 70,
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
    getselectedRowKeys()
  }, [nodes])

  const centerSearch = (e) => {
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
    const query = { nodeId, userId }
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

  //选择中心点
  const selectCenter = () => {
    setCenterVisible(true)
    setSearchNodes([])
  }
  //取消上传
  const hideCenterModal = () => {
    setCenterVisible(false)
    setSearchNodes([])
  }

  const cancelDetail = () => {
    setDetailsVisible(false)
    setSearchNodes([])
  }
  //查看详细页面的删除
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
  //清空所有点
  const deleteAll = () => {
    const params = { userId }
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
      {/*  中心点的Modal */}
      <Modal
        keyboard
        title="选择中心点"
        key="centerModal"
        visible={centerVisible}
        onOk={upload}
        width="1000px"
        style={{
          minWidth: '800px',
          minHeight: '600px',
        }}
        height="600px"
        onCancel={hideCenterModal}
        okText="确认"
        className="center_modal"
        cancelText="取消"
      >
        <div className="center_search">
          <Search
            key="centerSearch"
            placeholder="请输入目标编号/名称/地址/经纬度"
            onChange={centerSearch}
            enterButton
          />
        </div>
        <Table
          rowSelection={rowSelection}
          rowKey={(record) => record.nodeId}
          key="centerTable"
          columns={detailsColumns}
          dataSource={searchNodes.length ? searchNodes : nodes}
          scroll={{ y: 500 }}
          pagination={false}
        />
      </Modal>

      {/* 查看详细的Modal */}
      <Modal
        visible={detailsVisible}
        onCancel={cancelDetail}
        title="站点详细"
        key="detailModal"
        className="details_modal"
        width="1000px"
        style={{
          minWidth: '1000px',
          minHeight: '600px',
        }}
        height="600px"
        footer={[
          <Button
            type="Link"
            style={{ marginRight: '730px' }}
            key="deleteall"
            onClick={deleteAll}
          >
            清空所有
          </Button>,
          <Button type="primary" key="delete" onClick={deleteSelect}>
            删除
          </Button>,
          <Button type="primary" key="ok" onClick={cancelDetail}>
            确认
          </Button>,
        ]}
      >
        <div className="detail_search">
          <Search
            key="detailSearch"
            placeholder="请输入目标编号/名称/地址/经纬度"
            onChange={detailSearch}
            enterButton
          />
        </div>
        <Table
          bordered
          key="detailTable"
          dataSource={searchNodes.length ? searchNodes : nodes}
          rowSelection={detailRowSelection}
          columns={detailsColumns}
          rowKey={(record) => {
            return record.nodeId
          }}
          height="600px"
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
