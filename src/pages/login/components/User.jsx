import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router'
import { Form, Input, Button, Checkbox, Skeleton, message } from 'antd'
import {
  UserOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'
import httpUtil from '../../../utils/httpUtil'

export const User = () => {
  // 拿到派发action的工具
  //const dispatch = useDispatch()

  const history = useHistory()
  const onFinish = (values) => {
    const { code } = values
    delete values.code
    const data = {
      userMessage: values,
      code,
    }
    httpUtil.login(data).then((res) => {
      if (res.status == 9999) {
        const { userId } = res.data
        sessionStorage.setItem('userId', userId);
        history.push('/user')
      } else {
        message.warn(res.msg)
      }
    })
  }

  const [serverCode, setServerCode] = useState('')

  useEffect(() => {
    getServerCode()
  }, [])

  const getServerCode = () => {
    httpUtil.getVerifyCode().then((res) => {
      const imgUrl = window.URL.createObjectURL(res)
      setServerCode(imgUrl)
    })
  }

  return (
    <Form
      name="normal_login"
      className="login-form"
      initialValues={{
        remember: true,
      }}
      onFinish={onFinish}
    >
      <Form.Item
        name="userName"
        rules={[
          {
            required: true,
            message: '请输入您的账号!',
          },
        ]}
      >
        <Input
          prefix={<UserOutlined className="site-form-item-icon" />}
          placeholder="账号"
        />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[
          {
            required: true,
            message: '请输入您的密码!',
          },
        ]}
      >
        <Input.Password
          prefix={<LockOutlined className="site-form-item-icon" />}
          type="password"
          placeholder="密码"
        />
      </Form.Item>

      <div
        style={{
          position: 'relative',
        }}
      >
        <Form.Item
          name="code"
          rules={[
            {
              required: true,
              message: '请输入验证码！',
            },
          ]}
          style={{
            width: '72%',
          }}
        >
          <Input
            prefix={<SafetyCertificateOutlined />}
            type="text"
            placeholder="验证码"
          />
        </Form.Item>
        {serverCode ? (
          <img
            src={serverCode}
            alt=""
            style={{
              width: '28%',
              height: '100%',
              position: 'absolute',
              top: 0,
              right: 0,
              cursor: 'pointer',
            }}
            onClick={getServerCode}
          />
        ) : (
          <Skeleton.Button
            active
            style={{
              width: '28%',
              position: 'absolute',
              top: 0,
              right: 0,
              cursor: 'pointer',
            }}
          />
        )}
      </div>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          style={{ width: '100%', marginTop: 20 }}
        >
          登陆
        </Button>
      </Form.Item>

      <Form.Item>
        <Form.Item valuePropName="checked" noStyle>
          <Checkbox>记住密码</Checkbox>
        </Form.Item>
      </Form.Item>
    </Form>
  )
}
