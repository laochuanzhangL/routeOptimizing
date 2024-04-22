import React, { useState, useEffect } from 'react'
import './styles.less'
import { Link, useLocation } from 'react-router-dom'
import { Header, Footer } from '../userHome/commponents'
import httpUtil from '../../utils/httpUtil'
import user from '../../assets/user.png'
import { Table, Space, Popconfirm, Modal, Menu } from 'antd'
const { SubMenu } = Menu
import { useHistory } from 'react-router'
import {
  ImportOutlined,
  HomeOutlined,
} from '@ant-design/icons'
export function Manage() {
  const [data, setData] = useState()
  const { confirm } = Modal
  const history = useHistory()
  const { pathname } = useLocation()
  const [current, setCurrent] = useState('home')
  useEffect(() => {
    getPathname()
  }, [current])
  const getPathname = () => {
    let result = pathname.substring(6)
    if (result.length) setCurrent(result)
  }

  const manageOperate = (operationType, userMessage) => {
    const parmas = {
      operationType,
      userMessage,
    }
    httpUtil.manageOperate(parmas).then((res) => {
      if (res.status === 9999) {
        console.log(res.data)
        setData(res.data)
      }
    })
  }
  useEffect(() => {
    manageOperate('4', {})
  }, [])

  const columns = [
    {
      title: 'id',
      dataIndex: 'userId',
      width: 100,
    },
    {
      title: '用户名',
      dataIndex: 'userName',
      width: 100,
    },
    {
      title: '密码',
      dataIndex: 'password',
      width: 100,
    },
    {
      title: '权限',
      dataIndex: 'role',
      width: 100,
      render: (x, _) => {
        return x === 1 ? '管理员' : '普通用户'
      },
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      width: 120,
    },
    {
      title: '操作',
      dataIndex: 'action',
      width: 100,
      render: (_, record) => (
        <div className="btn_wrap">
          <Space size="middle">
            <Popconfirm
              title="是否删除?"
              okText="确定"
              cancelText="取消"
              key="itemPopconfirm"
              // onConfirm={() => handleDelete(record)}
            >
              <a>删除</a>
            </Popconfirm>
          </Space>

          <Space size="middle">
            <a>编辑</a>
          </Space>
        </div>
      ),
    },
  ]
  const logOut = () => {
    confirm({
      title: '确认要退出登陆?',
      okText: '确认',
      cancelText: '取消',
      onOk() {
        httpUtil.logOut().then((res) => {
          history.push('/')
          sessionStorage.removeItem('userId')
        })
      },
      onCancel() {},
    })
  }
  const handleClick = (e) => {
    setCurrent(e.key)
  }
  return (
    <div className="manage">
      <div className="header">
        <div className="menu_wrap">
          <Menu subMenuCloseDelay={0.2}>
            <Menu
              className="header_left"
              onClick={handleClick}
              selectedKeys={current}
            >
              <Menu.Item key="home" icon={<HomeOutlined />}>
                <Link to="/manage">账号管理</Link>
              </Menu.Item>
            </Menu>
            <div className="header_right">
              <SubMenu
                key="user"
                popupOffse={(0, 10, 10)}
                icon={<img src={user} className="header_image" />}
              >
                <Menu.Item
                  key="logOut"
                  onClick={logOut}
                  icon={<ImportOutlined style={{ fontSize: '16px' }} />}
                >
                  退出登录
                </Menu.Item>
              </SubMenu>
            </div>
          </Menu>
        </div>
      </div>

      <div className="manage_content">
        <div className="content">
          <Table
            bordered
            size="large"
            scroll={{ y: 500 }}
            rowKey={(record) => record.userId}
            key="itemTable"
            pagination={false}
            dataSource={data}
            columns={columns}
          />
        </div>
      </div>
      <Footer />
    </div>
  )
}
