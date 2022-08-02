import React from 'react'
import './styles.less'
import { Menu, Modal } from 'antd'
import { Link } from 'react-router-dom'
import user from '../../../../assets/user.png'
import { useHistory } from 'react-router'
import { useState} from 'react'
import {
  ImportOutlined,
  MailOutlined,
  UserOutlined,
  HomeOutlined,
  AppstoreOutlined,
} from '@ant-design/icons'
import httpUtil from '../../../../utils/httpUtil'
const { SubMenu } = Menu
const { confirm } = Modal
export const Header = () => {
  const history = useHistory()
  const [current, setCurrent] = useState('home')
  const handleClick = (e) => {
    setCurrent(e.key)
  }
  const logOut=()=> {
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
  return (
    <div className="header">
      <div className="menu_wrap">
        <Menu subMenuCloseDelay={0.2}>
          <Menu
            className="header_left"
            onClick={handleClick}
            selectedKeys={current}
          >
            <Menu.Item key="home" icon={<HomeOutlined />}>
              <Link to="/user">首页</Link>
            </Menu.Item>
            <Menu.Item key="tddisplay" icon={<AppstoreOutlined />}>
              <Link to="/user/tddisplay"> 客户管理</Link>
            </Menu.Item>
          </Menu>
          <div className="header_right">
            <SubMenu
              key="user"
              popupOffse={(0, 10, 10)}
              icon={<img src={user} className="header_image" />}
            >
              <Menu.Item
                key="msgcenter"
                icon={<MailOutlined style={{ fontSize: '16px' }} />}
              >
                <Link to="/user/msgcenter">消息中心</Link>
              </Menu.Item>
              <Menu.Item
                key="percenter"
                icon={<UserOutlined style={{ fontSize: '16px' }} />}
              >
                <Link to="/user/percenter">个人中心</Link>
              </Menu.Item>
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
  )
}
