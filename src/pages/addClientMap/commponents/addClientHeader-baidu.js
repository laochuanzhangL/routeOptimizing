import React from 'react'
import { Input, Button, Modal, Upload, message, Spin } from 'antd'
import {
  CloudUploadOutlined,
  ImportOutlined,
  InboxOutlined,
} from '@ant-design/icons'
import { useHistory } from 'react-router'
import { useState } from 'react'
import httpUtil from '../../../utils/httpUtil'
import { exportFile } from '../../../utils/exportFile'
export const AddClientHeader = (props) => {
  const [uploadVisible, setUploadVisible] = useState(false)
  const [fileList, setFileList] = useState([])
  const [loading, setLoading] = useState(false)
  const { setCenter, getNodes } = props
  const history = useHistory()
  const BMapGL = window.BMapGL
  const { Search } = Input
  const { Dragger } = Upload
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
  const downloadFile = () => {
    httpUtil.downloadNodesFile().then((res) => {
      exportFile(res, '选点模板文件')
    })
  }

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
            getNodes()
          } else {
            message.error(res.msg)
            setLoading(false)
          }
        })
        .catch((e) => {
          setLoading(false)
          message.error("文件格式错误")
        })
    } else {
      message.error('请上传文件后再提交！')
    }
  }

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
            setUploadVisible(true)
          }}
          icon={<CloudUploadOutlined style={{ fontSize: '20px' }} />}
        >
          文件上传
        </Button>
        <Button
          type="primary"
          size="large"
          icon={<ImportOutlined style={{ fontSize: '20px' }} />}
          onClick={() => {
            history.push('/user/clientManage')
          }}
        >
          退出
        </Button>
      </div>
      <Modal
        key="clientsUploadModal"
        visible={uploadVisible}
        //onOk={}
        onCancel={() => {
          if (loading) {
            message.warn('文件正在上传，请稍等')
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
