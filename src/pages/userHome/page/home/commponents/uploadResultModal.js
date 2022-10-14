import React, { useState } from 'react'
import { Button, message, Modal, Upload, Spin } from 'antd'
import { exportFile } from '../../../../../utils/exportFile'
import httpUtil from '../../../../../utils/httpUtil'
import { InboxOutlined } from '@ant-design/icons'
export const UploadResultModal = (props) => {
  const [fileList, setFileList] = useState([])
  const [loading, setLoading] = useState(false)
  const {
    uploadResultVisible,
    setUploadResultVisible,
    uploadQuestionId,
    getQuestions,
  } = props
  const { Dragger } = Upload
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
    httpUtil.downloadResultsTemplate().then((res) => {
      exportFile(res, '结果导入模板文件')
    })
  }
  //手动上传文件
  const handleUpload = () => {
    if (fileList && fileList.length) {
      //检验是否有上传文件
      let formData = new FormData()
      formData.append('questionId', uploadQuestionId)
      formData.append('file', fileList[0].originFileObj)
      setLoading(true)
      httpUtil
        .uploadResultFile(formData)
        .then((res) => {
          setLoading(false)
          if (res.status === 200) {
            message.success('文件上传成功')
            setUploadResultVisible(false)
            getQuestions()
            setFileList([])
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

  return (
    <Modal
      key="nodesUploadModal"
      visible={uploadResultVisible}
      //onOk={}
      onCancel={() => {
        if (loading) {
          message.warn('文件正在上传，请稍后')
        } else setUploadResultVisible(false)
      }}
      title="导入结果"
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
  )
}
