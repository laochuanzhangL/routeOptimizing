import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Button, message, Modal, Input, Upload, Spin } from 'antd'
import { exportFile } from '../../../../../utils/exportFile'
import httpUtil from '../../../../../utils/httpUtil'
import throttle from 'lodash/throttle'
import { InboxOutlined } from '@ant-design/icons'
export const ClientTableHeader = (props) => {
  const { getClients, pageSize, pageNum, setClients, setClientLen } = props
  const { Search } = Input
  const [uploadVisible, setUploadVisible] = useState(false)
  const [fileList, setFileList] = useState([])
  const [loading, setLoading] = useState(false)
  const { Dragger } = Upload
  const history = useHistory()
  //上传的配置参数
  const uploadProps = {
    fileList: fileList,
    beforeUpload(info) {
      //文件类型校验
      const fileType = info.name.split('.').pop()
      if (fileType !== 'xlsx' && fileType !== 'xls') {
        message.error(`上传失败：上传文件格式非excel文件格式`)
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
      httpUtil.clientsFileUpload(formData).then((res) => {
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
    } else {
      message.error('请上传文件后再提交！')
    }
  }

  //查找用户
  const clientSearch = (e) => {
    let keyValue = e.target.value
    let params = { keyValue, pageNum, pageSize }
    httpUtil.searchClients(params).then((res) => {
      if (res.status == 9999) {
        setClientLen(res.data.total)
        setClients(res.data.records)
      }
    })
  }
  //节流操作
  const throttleSearh = throttle((e) => clientSearch(e), 500)

  return (
    <div className="table_header_content">
      <div className="btn_wrap">
        <Button
          type="primary"
          className="mapAddBtn"
          key="addClient"
          onClick={() => {
            history.push(`/addClientMap`)
          }}
        >
          地图添加
        </Button>
        <Button
          type="primary"
          className="fileAddBtn"
          key="uploadClients"
          onClick={() => {
            setUploadVisible(true)
          }}
        >
          文件导入
        </Button>
      </div>
      <div className="client_search">
        <Search
          key="clientSearch"
          placeholder="请输入客户编号/名称/详细地址/经纬度"
          onChange={throttleSearh}
          style={{ height: '100%' }}
          enterButton
        />
      </div>
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
