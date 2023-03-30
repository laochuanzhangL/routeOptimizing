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
  const { setCenter, getNodes,AMap,map } = props
  const history = useHistory()
  const { Search } = Input
  const { Dragger } = Upload
    // 关键字搜索功能
    const onSearch = (value) => {
        if (value.trim() === '') return
        const placeSearch = new AMap.PlaceSearch({
        //city: "重庆", // 兴趣点城市
        //citylimit: true, //是否强制限制在设置的城市内搜索
        pageSize: 10, // 单页显示结果条数
        children: 0, //不展示子节点数据
        pageIndex: 1, //页码
        extensions: 'base', //返回基本地址信息
        })
        //详情查询
        placeSearch.search(value, function (status, result) {
        if (status === 'complete' && result.info === 'OK') {
            placeSearch_CallBack(result)
        } else {
            message.error('查询地址失败', 1)
        }
        })
        //回调函数
        function placeSearch_CallBack(data) {
        const poiArr = data.poiList.pois
        const {location } = poiArr[0]
        const { lng, lat} = location
        map.setCenter([lng, lat])
        map.setZoom(16,false,500)
        }
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
