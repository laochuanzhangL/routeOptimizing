import React, { useState, useEffect } from 'react'
import {
  Table,
  Input,
  Button,
  Popconfirm,
  Form,
  Modal,
  message,
  Space,
  notification,
} from 'antd'
import { Modify } from './commponents/modify'
import httpUtil from '../../../../utils/httpUtil'
import './styles.scss'
import { Link } from 'react-router-dom'

export const Home = () => {
  // 获取userId
  const userId = sessionStorage.getItem('userId');
  //表格数据
  const [data, setData] = useState([])

  //当前页码
  const [page, setPage] = useState(1)

  //当前页容量
  const [pageSize, setPageSize] = useState(10)

  //添加项目表格显示情况
  const [visible, setVisible] = useState(false)

  //修改数据栏
  const [modifyVisible, setModifyVisible] = useState(false)

  //修改的项目的ID
  const [modifyQuestionId, setModifyQuestionId] = useState()
  //表格列表
  const columns = [
    {
      title: '项目名',
      dataIndex: 'questionName',
      width: 200,
      render: (e) => {
        return e
      },
    },
    {
      title: '数据配备',
      key: 'prepare',
      width: 200,
      render: (e) => {
        const { questionId, processState } = e
        return (
          <Space>
            <Link to={`/selectaddress/${questionId}`}>
              {processState === 0 ? '准备数据' : '更改数据'}
            </Link>
          </Space>
        )
      },
    },
 
    {
      title: '查看结果',
      key: 'result',
      width: 200,
      render: (e) => {
        const { questionId } = e
         return e.processState >= 2 ? (
          <Link to={`/result/${questionId}`}>查看结果</Link>
        ) : (
          <span className="modify">
            <font color="gray">查看结果</font>
          </span>
        )
      },
    },
    {
      title: '操作',
      dataIndex: 'action',
      width: 150,
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

  useEffect(() => {
    getQuestions()
  }, [userId])

  useEffect(() => {
    notification.close('drawRoute')
  }, [])
  const handleDelete = (e) => {
    const { questionId } = e
    const formdata = {
      questionId,
    }
    httpUtil.deleteQuestion(formdata).then((res) => {
      if (res.status == 9999) {
        message.success(res.msg)
        getQuestions()
      } else {
        message.error(res.msg)
      }
    })
  }


  const addItem = () => {
    setVisible(!visible)
  }

  const onFinish = (e) => {
    const questionName = e.itemName
    const data = {
      questionName,
      userId,
    }
    httpUtil.creatQuestion(data).then((res) => {
      if (res.status == 9999) {
        message.success(res.msg)
        getQuestions()
        setVisible(!visible)
      } else {
        message.error(res.msg)
      }
    })
  }

  const cancelAdd = () => {
    setVisible(!visible)
  }
  //获取所有项目
  const getQuestions = () => {
    const formdata = {
      userId,
      pageSize,
      currentPage: page,
    }
    httpUtil.getQuestions(formdata).then((res) => {
      if (res.status == 9999) {
        setData(res.data)
      }
    })
  }

  return (
    <div className="home">
      <div className="content">
        <div className="table_header">
          <Button type="primary" className="table_btn" onClick={addItem}>
            添加项目
          </Button>
        </div>
        <div className="modal">
          <Modal
            title="新增订单"
            onCancel={cancelAdd}
            visible={visible}
            footer={null}
            style={{ marginTop: '200px' }}
          >
            <Form
              labelCol={{
                span: 4,
              }}
              wrapperCol={{
                span: 14,
              }}
              onFinish={onFinish}
              layout="horizontal"
              size="center"
            >
              <Form.Item
                label="项目名称"
                name="itemName"
                style={{
                  width: '500px',
                }}
              >
                <Input bordered="false" placeholder="请输入项目名称" />
              </Form.Item>
              <Form.Item
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <Button type="primary" htmlType="submit" block>
                  添加
                </Button>
              </Form.Item>
            </Form>
          </Modal>
        </div>
        <div className="table_wrap">
          <Table
            bordered
            size="large"
            pagination={{
              total: data.length,
              pageSizeOptions: [6, 10, 20, 30],
              defaultPageSize: pageSize,
              current: page,
              onChange: (page, pageSize) => {
                setPage(page), setPageSize(pageSize)
              },
            }}
            dataSource={data}
            columns={columns}
          />
        </div>
        <Modify
          setModifyVisible={setModifyVisible}
          modifyVisible={modifyVisible}
          modifyQuestionId={modifyQuestionId}
        />
      </div>
    </div>
  )
}
