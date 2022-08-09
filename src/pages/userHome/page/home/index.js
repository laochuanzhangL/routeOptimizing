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
import httpUtil from '../../../../utils/httpUtil'
import './styles.less'
import { Link } from 'react-router-dom'
import dayjs from 'dayjs'
export const Home = () => {
  // 获取userId
  const userId = sessionStorage.getItem('userId')
  //表格数据
  const [data, setData] = useState([])

  //当前页码
  const [page, setPage] = useState(1)

  //当前页容量
  const [pageSize, setPageSize] = useState(10)

  //添加项目表格显示情况
  const [visible, setVisible] = useState(false)

  const [showResultId, setShowResultId] = useState()

  const [allResults, setAllResults] = useState([])

  const [resultModalVisible, setResultModalVisible] = useState(false)
  //表格列表
  const columns = [
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 250,
      render: (e) => {
        return dayjs(e).format('YYYY-MM-DD')
      },
    },
    {
      title: '项目名',
      dataIndex: 'questionName',
      render: (e) => {
        return e
      },
    },

    {
      title: '数据配备',
      key: 'prepare',
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
      render: (e) => {
        const { questionId } = e

        return e.processState == 4 ? (
          <span
            className="pointor_span"
            onClick={() => {
              getAllResults(questionId)
            }}
          >
            <font color="#1890ff">查看结果</font>
          </span>
        ) : (
          <span className="modify pointor_span">
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
            key="itemPopconfirm"
            onConfirm={() => handleDelete(record)}
          >
            <a>删除</a>
          </Popconfirm>
        </Space>
      ),
    },
  ]
  const resultcolumns = [
    {
      title: '结果创建时间',
      dataIndex: 'createTime',
      render: (_, record) => {
        const { createTime } = record
        const time = dayjs(createTime).format('YYYY-MM-DD HH:mm')
        return time
      },
    },
    {
      title: '使用算法',
      dataIndex: 'algorithm',
      render: (e) => {
        return e
      },
    },
    {
      title: '操作',
      dataIndex: 'action',
      width: 100,
      render: (_, record) => {
        const { routes } = record
        return routes ? (
          <Link to={`/result/${showResultId}/${record.finalSolutionId}`}>
            前往查看
          </Link>
        ) : (
          <font color="gray">暂无数据</font>
        )
      },
    },
  ]
  useEffect(() => {
    getQuestions()
  }, [userId])

  // useEffect(() => {
  //   getAllResults()
  // }, [showResultId])

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
        message.success('删除成功')
        getQuestions()
      } else {
        message.error(res.msg)
      }
    })
  }

  const getAllResults = (id) => {
    setShowResultId(id)
    httpUtil.getSolution({ questionId: id }).then((res) => {
      if (res.status == 0) {
        setAllResults(res.data)
        setResultModalVisible(true)
      } else {
        message('暂无数据')
      }
    })
  }

  const addItem = () => {
    setVisible(!visible)
  }
  const closeResult = () => {
    setResultModalVisible(false)
  }

  const onFinish = (e) => {
    const questionName = e.itemName
    const data = {
      questionName,
      userId,
    }
    httpUtil.creatQuestion(data).then((res) => {
      if (res.status == 9999) {
        message.success('添加成功')
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
          <Button
            type="primary"
            className="table_btn"
            onClick={addItem}
            key="addItem"
          >
            添加项目
          </Button>
        </div>
        <div className="modal">
          <Modal
            title="新增订单"
            onCancel={cancelAdd}
            visible={visible}
            key="addItemModal"
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
                <Input
                  bordered="false"
                  placeholder="请输入项目名称"
                  key="itemInput"
                />
              </Form.Item>
              <Form.Item
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <Button type="primary" htmlType="submit" block key="submitItem">
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
            scroll={{y:500}}
            rowKey={(record) => record.questionId}
            key="itemTable"
            pagination={{
              total: data.length,
              pageSizeOptions: [6, 10, 20, 30,data.length],
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
      </div>
      <Modal
        visible={resultModalVisible}
        key="resultModal"
        width="600px"
        zIndex="1001"
        title="所有结果"
        onCancel={closeResult}
        footer={
          <Button type="primary" key="ok" onClick={closeResult}>
            确认
          </Button>
        }
      >
        <Table
          columns={resultcolumns}
          dataSource={allResults}
          key="resultsTable"
        />
      </Modal>
    </div>
  )
}
