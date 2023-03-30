import React from 'react'
import { Input, Button, message, Modal, Table, Upload, Spin } from 'antd'
import { useEffect } from 'react'
import { ImportOutlined, UserAddOutlined } from '@ant-design/icons'
import { useHistory } from 'react-router'
import { useState } from 'react'
import { exportFile } from '../../../utils/exportFile'
import httpUtil from '../../../utils/httpUtil'
import throttle from 'lodash/throttle'
import { InboxOutlined } from '@ant-design/icons'
export const SelectHeader = (props) => {
  const [clients, setClients] = useState([])
  const [pageNum, setPageNum] = useState(1)
  const [pageSize, setPageSize] = useState(8)
  const [clientsSelectedRowKeys, setClientsSelectedRowKeys] = useState([])
  const [clientAddVisible, setClientAddVisible] = useState(false)
  const [clientLen, setClientLen] = useState(0)
  const { setCenter, questionId, getNodes, nodes, getNodesId } = props
  const history = useHistory()
  const BMapGL = window.BMapGL
  const { Search } = Input
  const { Dragger } = Upload
  const [uploadVisible, setUploadVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fileList, setFileList] = useState([])

  const clientsColumns = [
    {
      title: '编号',
      dataIndex: 'nodeId',
      width: 120,
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
    setClientsSelectedRowKeys(getNodesId())
  }, [nodes])

  //改变地图中心位置
  const onSearch = (e) => {
    //不能携带cookie，故单独写请求
    const myGeo = new BMapGL.Geocoder()
    // 将地址解析结果显示在地图上，并调整地图视野
    myGeo.getPoint(
      e,
      function (point) {
        if (point) {
          setCenter(point)
        } else {
          alert('您选择的地址没有解析到结果！')
        }
      },
      '中国'
    )
  }

  //返回首页
  const goBack = () => {
    history.push('/user')
  }

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

  const submitClients = () => {
    const parmas = {
      questionId,
      nodeIdList: clientsSelectedRowKeys,
    }

    httpUtil.batchUploadNodes(parmas).then((res) => {
      if (res.status == 9999) {
        message.success(res.msg)
        getNodes()
        setClientAddVisible(false)
      }
    })
  }

  const clientsSelectChange = (selectedRowKeys, selectedRows) => {
    setClientsSelectedRowKeys(selectedRowKeys)
  }

  const clientsRowSelection = {
    clientsSelectedRowKeys,
    defaultSelectedRowKeys: getNodesId(),
    onChange: clientsSelectChange,
  }

  //上传的配置参数
  const uploadProps = {
    fileList,
    beforeUpload(info) {
      //文件类型校验
      const fileType = info.name.split('.').pop()
      if (fileType !== 'xlsx' && fileType !== 'xls') {
        message.error(`上传失败:上传文件格式非excel文件格式`)
      }
      return false
    },
    progress: {},
    onChange(info) {
      const fileType = info.file.name.split('.').pop()
      if (fileType === 'xlsx' || fileType === 'xls') {
        setFileList(info.fileList.slice(-1)) //限制只上传一个文件
        info.file.status = 'done' //更改文件状态
      }
    },
  }

  //下载文件
  const downloadFile = () => {
    httpUtil.downloadNodesFile().then((res) => {
      exportFile(res, '选点模板文件')
    })
  }

  //手动上传文件
  const handleUpload = () => {
    if (fileList && fileList.length) {
      //检验是否有上传文件
      let formData = new FormData()
      formData.append('file', fileList[0].originFileObj)
      setLoading(true)
      httpUtil
        .clientsFileUpload(formData)
        .then((res) => {
          setLoading(false)
          if (res.status === 200) {
            message.success('文件上传成功')
            setUploadVisible(false)
            setFileList([])
            getClients()
          } else {
            message.error(res.msg)
            setLoading(false)
          }
        })
        .catch((e) => {
          setLoading(false)
          message.error('文件格式错误')
        })
    } else {
      message.error('请上传文件后再提交！')
    }
  }

  //查找用户
  const clientsSearch = (e) => {
    let keyValue = e.target.value
    let params = { keyValue, pageNum, pageSize }
    httpUtil.searchClients(params).then((res) => {
      if (res.status == 9999) {
        setClientLen(res.data.total)
        setClients(res.data.records)
      }
    })
  }

  const throttleSearh = throttle((e) => clientsSearch(e), 500)

  return (
    <div className="selectAddress_header">
      <div className="search_wrap">
        <Search
          placeholder="输入地点名称"
          enterButton="跳转"
          className="search"
          size="large"
          onSearch={onSearch}
          style={{ borderRadius: '10px' }}
        />
      </div>
      <div className="button_wrap">
        <Button
          type="primary"
          size="large"
          onClick={() => {
            setClientAddVisible(true)
          }}
          icon={<UserAddOutlined style={{ fontSize: '20px' }} />}
        >
          添加用户
        </Button>
        <Button
          type="primary"
          size="large"
          icon={<ImportOutlined style={{ fontSize: '20px' }} />}
          onClick={goBack}
        >
          返回首页
        </Button>
      </div>
      <Modal
        key="clientAddModal"
        visible={clientAddVisible}
        destroyOnClose={true}
        title="添加客户"
        onCancel={() => {
          setClientAddVisible(false)
        }}
        footer={[
          <Button
            type="primary"
            style={{ float: 'left' }}
            key="uploadClients"
            onClick={() => {
              setUploadVisible(true)
            }}
          >
            文件导入
          </Button>,
          <Button
            type="Link"
            key="delete"
            onClick={() => {
              setClientAddVisible(false)
            }}
          >
            取消
          </Button>,
          <Button type="primary" key="ok" onClick={submitClients}>
            确认
          </Button>,
        ]}
        className="client_add_modal"
        width="1000px"
        style={{
          minWidth: '800px',
          minHeight: '600px',
        }}
        height="600px"
      >
        <div className="clients_map_search">
          <Search
            key="clientsMapSearch"
            placeholder="请输入目标编号/名称/地址/经纬度"
            onChange={throttleSearh}
            enterButton
          />
        </div>
        <Table
          bordered
          key="clientsTable"
          dataSource={clients}
          rowSelection={clientsRowSelection}
          columns={clientsColumns}
          rowKey={(record) => {
            return record.nodeId
          }}
          scroll={{ y: '50vh' }}
          height="600px"
          pagination={{
            total: clientLen,
            defaultPageSize: pageSize,
            showSizeChanger: true,
            pageSizeOptions: [8, 20, 50, 100, clientLen],
            current: pageNum,
            onShowSizeChange: (current, pageSize) => {
              console.log(current, pageSize)
            },
            onChange: (page, pageSize) => {
              setPageNum(page), setPageSize(pageSize)
            },
          }}
        />
      </Modal>
      {/* 文件上传对话框 */}
      <Modal
        key="nodesUploadModal"
        visible={uploadVisible}
        //onOk={}
        onCancel={() => {
          if (loading) {
            message.warn('文件正在上传，请稍后')
          } else setUploadVisible(false)
        }}
        title="文件上传"
        className="node_upload_modal"
        width="400px"
        style={{
          minWidth: '400px',
        }}
        height="300px"
        footer={[
          <Button type="link" onClick={downloadFile}>
            模板下载
          </Button>,
          <div>
            {loading ? (
              <Spin
                className="spin"
                style={{ marginTop: '6px', marginRight: '15px' }}
              />
            ) : (
              <Button type="primary" onClick={handleUpload}>
                确定
              </Button>
            )}
          </div>,
        ]}
      >
        <Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">单击或拖动文件到此区域上传</p>
          <p className="ant-upload-hint">仅支持EXCEL文件</p>
        </Dragger>
      </Modal>
    </div>
  )
}
