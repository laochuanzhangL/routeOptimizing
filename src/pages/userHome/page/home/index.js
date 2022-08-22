import React, { useState, useEffect } from 'react'
import { Table, Button, Popconfirm, message, Space, notification } from 'antd'
import httpUtil from '../../../../utils/httpUtil'
import dayjs from 'dayjs'
import './styles.less'
import { Link } from 'react-router-dom'
import { AddItemModal, ResultModal, UploadResultModal } from './commponents'
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
  const [addItemVisible, setAddItemVisible] = useState(false)
  const [showResultId, setShowResultId] = useState()
  const [allResults, setAllResults] = useState([])
  const [resultVisible, setResultVisible] = useState(false)
  const [uploadResultVisible, setUploadResultVisible] = useState(false)
  const [uploadQuestionId, setUploadQuestionId] = useState()
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
            <span
              className="modify pointor_span"
              onClick={() => {
                openUploadResult(questionId)
              }}
            >
              <font color="#1890ff">导入结果</font>
            </span>
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
        message.success('删除成功')
        getQuestions()
      } else {
        message.error(res.msg)
      }
    })
  }

  const openUploadResult = (questionId) => {
    setUploadQuestionId(questionId)
    setUploadResultVisible(true)
  }
  const getAllResults = (id) => {
    setShowResultId(id)
    httpUtil.getSolution({ questionId: id }).then((res) => {
      if (res.status == 0) {
        setAllResults(res.data)
        setResultVisible(true)
      } else {
        message('暂无数据')
      }
    })
  }

  const addItem = () => {
    setAddItemVisible(true)
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
        <div className="table_wrap">
          <Table
            bordered
            size="large"
            scroll={{ y: 500 }}
            rowKey={(record) => record.questionId}
            key="itemTable"
            pagination={{
              total: data.length,
              pageSizeOptions: [6, 10, 20, 30, data.length],
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
      <AddItemModal
        addItemVisible={addItemVisible}
        setAddItemVisible={setAddItemVisible}
        getQuestions={getQuestions}
        userId={userId}
      />
      <ResultModal
        setResultVisible={setResultVisible}
        showResultId={showResultId}
        resultVisible={resultVisible}
        allResults={allResults}
      />
      <UploadResultModal
        uploadResultVisible={uploadResultVisible}
        setUploadResultVisible={setUploadResultVisible}
        uploadQuestionId={uploadQuestionId}
        getQuestions={getQuestions}
      />
    </div>
  )
}
