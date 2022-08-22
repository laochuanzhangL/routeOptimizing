import React from 'react'
import { Button, Modal, Table } from 'antd'
import { Link } from 'react-router-dom'
import dayjs from 'dayjs'
export const ResultModal = (props) => {
  const { setResultVisible, showResultId, resultVisible, allResults } = props
  const closeResult = () => {
    setResultVisible(false)
  }
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
  return (
    <Modal
      visible={resultVisible}
      key="result"
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
  )
}
