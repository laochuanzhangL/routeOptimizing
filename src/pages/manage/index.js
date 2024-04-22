import React, { useState,useEffect } from 'react'
import './styles.less'
import { Header, Footer} from '../userHome/commponents'
import httpUtil from '../../utils/httpUtil'
import { Table } from 'antd'
export function Manage() {
  const [data, setData] = useState({})
  const manageOperate = (operationType, userMessage) => {
    const parmas = {
      operationType,
      userMessage,
    }
    console.log(parmas)
    httpUtil.manageOperate(parmas).then((res) => {
      if(res.status===9999)
      setData(res.data)
    })
  }
  useEffect(() => {
    manageOperate('4',{})
  },[])

  const columns = [
    {
      title: '用户名',
      dataIndex: 'createTimen',
      width: 250,
    },
    {
      title: '邮箱',
      dataIndex: 'createTimen',
      width: 250,
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
            // onConfirm={() => handleDelete(record)}
          >
            <a></a>
          </Popconfirm>
        </Space>
      ),
    },
  ]
  return (
    <div className="manage">
      <Header />
      <div className="home_content">
        <Table
          bordered
          size="large"
          scroll={{ y: 500 }}
          // rowKey={(record) => record.Id}
          key="itemTable"
          pagination={false}
          // dataSource={data}
          columns={columns}
        />
      </div>
      <Footer />
    </div>
  )
}
