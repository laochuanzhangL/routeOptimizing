import React from 'react'
import { useState, useEffect } from 'react'
import { Table, Input, Button, Popconfirm, message, Space, Modal } from 'antd'
import httpUtil from '../../../utils/httpUtil'
export const SelectNodes = (props) => {
  const [centerVisible, setCenterVisible] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [searchNodes, setSearchNodes] = useState([])
  const { nodes, questionId, getNodes, setWindowInfo, getNodesId } = props
  const { Search } = Input
  const nodeColumns = [
    {
      title: '编号',
      dataIndex: 'clientId',
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
    {
      title: '中心点',
      dataIndex: 'isCenter',
      width: 80,
      render: (render) => {
        return render ? '是' : '否'
      },
    },
  ]

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
  // const detailSearch = (e) => {
  //   const keyWord = e.target.value
  //   const arr = []
  //   nodes.map((item) => {
  //     for (const [key, value] of Object.entries(item)) {
  //       const str = value + ''
  //       if (str.indexOf(keyWord) >= 0) {
  //         arr.push(item)
  //         break
  //       }
  //     }
  //   })
  //   setSearchNodes([...arr])
  // }
  // const openDetails = () => {
  //   setDetailsVisible(true)
  // }

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

  // const cancelDetail = () => {
  //   setDetailsVisible(false)
  //   setSearchNodes([])
  // }
  //删除已选站点
  const deleteSelect = (e) => {
    if (selectedRowKeys.length == 0) {
      message.warn('请至少选择一个点')
    } else {
      if (confirm('是否要删除所选站点')) {
        let parmas = { nodeIdList: selectedRowKeys, questionId }
        httpUtil.deleteNodes(parmas).then((res) => {
          if (res.status == 9999) {
            message.success(res.msg)
            getNodes()
            setSelectedRowKeys([])
          }
        })
      }
    }
  }
  //清空所有点
  const deleteAll = () => {
    if (confirm('是否要清空所有站点')) {
      const params = { questionId, nodeIdList: getNodesId() }
      httpUtil.deleteNodes(params).then((res) => {
        console.log(res)
        if (res.status == 9999) {
          getNodes()
          message.success("清空成功")
        } else {
          message.warn("删除失败")
        }
      })
    }
  }
  const selectChange = (selectedRowKeys, selectedRows) => {
    setSelectedRowKeys(selectedRowKeys)
  }

  const upload = () => {
    if (selectedRowKeys.length == 0) {
      message.warn('请选择至少一个中心点')
    } else {
      let params = {
        questionId,
        nodeIdList: selectedRowKeys,
      }
      httpUtil.setCenterNodes(params).then((res) => {
        console.log(res)
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

  //中心点table的rowSelection
  const rowSelection = {
    selectedRowKeys,
    onChange: selectChange,
  }

  //左下角table的底部元素
  const nodeFooter = () => {
    return (
      <Button type="primary" onClick={selectCenter}>
        选择中心点
      </Button>
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
        width="1100px"
        style={{
          minWidth: '1100px',
          minHeight: '600px',
        }}
        height="600px"
        onCancel={hideCenterModal}
        okText="确认"
        className="center_modal"
        cancelText="取消"
        footer={[
          <Button type="Link" key="deleteall" onClick={deleteAll}>
            清空所有
          </Button>,
          <Button
            type="primary"
            key="delete"
            onClick={deleteSelect}
            style={{ marginRight: '770px' }}
          >
            删除已选
          </Button>,
          <Button type="primary" key="ok" onClick={upload}>
            选为中心点
          </Button>,
        ]}
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
      {/* <Modal
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
          pagination={false}
        />
      </Modal> */}
    </div>
  )
}
