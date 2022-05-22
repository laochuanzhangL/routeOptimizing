import React from 'react'
import BG from '../../utils/BG'
import styles from './index.module.css'
import { User, Register } from './components/index'
import { Tabs } from 'antd'

const { TabPane } = Tabs

export function Login() {
  return (
    <div>
      <div className={styles['login-wrap']}>
        <div className={styles['login-top']}>物流优化</div>
        <Tabs
          className={styles['login-select-form']}
          defaultActiveKey="1"
          centered={true}
          tabBarGutter={80}
        >
          <TabPane
            className={styles['login-select-form-content']}
            tab="用户"
            key="1"
          >
            <User />
          </TabPane>

          <TabPane
            className={styles['login-select-form-content']}
            tab="注册"
            key="2"
          >
            <Register />
          </TabPane>
        </Tabs>
        <div className={styles['login-text']}>
          Copyright &copy; {new Date().getFullYear()} MISLab 版权所有
        </div>
      </div>
      <BG />
    </div>
  )
}
