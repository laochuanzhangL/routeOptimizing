import React, { useState, useRef } from 'react'
import { Form, Input, Button, message } from 'antd'
import { useHistory } from 'react-router'
import {
  UserOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  FileMarkdownOutlined,
} from '@ant-design/icons'
import httpUtil from '../../../utils/httpUtil'

export const Register = () => {
  const [loading, setLoading] = useState(false)
  const eamilRef = useRef()
  const onFinish = (values) => {
    setLoading(true)
    const { mailCode } = values
    delete values.mailCode
    delete values.rePassword
    const data = { userMessage: { ...values }, code: mailCode }
    httpUtil.register(data).then(
      (res) => {
        if (res.status == 9999) {
          message.success(res.msg)
        } else message.error(res.msg)
        setLoading(false)
      },
      () => {
        setLoading(false)
      }
    )
  }

  const getEmailCode = () => {
    const eamil = eamilRef.current.state.value
    if (!eamil) {
      message.warning('请先输入邮箱号')
    }
    httpUtil.getEmailCode(eamil).then((res) => {
      console.log(res)
      if (res.status == 0) {
        message.success('验证码发送成功')
      } else {
        message.warning('验证码发送失败')
      }
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
        <Input
          prefix={<LockOutlined className="site-form-item-icon" />}
          type="password"
          placeholder="密码"
        />
      </Form.Item>

      <Form.Item
        name="rePassword"
        dependencies={['password']}
        hasFeedback
        rules={[
          {
            required: true,
            message: '请确认您的密码!',
          },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve()
              }
              return Promise.reject(new Error('您输入的两次密码不匹配!'))
            },
          }),
        ]}
      >
        <Input.Password
          prefix={<LockOutlined className="site-form-item-icon" />}
          type="password"
          placeholder="确认密码"
        />
      </Form.Item>

      <Form.Item
        name="email"
        rules={[
          {
            required: true,
            message: '请输入您的邮箱号!',
          },
        ]}
      >
        <Input
          prefix={<FileMarkdownOutlined className="site-form-item-icon" />}
          placeholder="邮箱号"
          ref={eamilRef}
        />
      </Form.Item>
      <div
        style={{
          position: 'relative',
        }}
      >
        <Form.Item
          name="mailCode"
          rules={[
            {
              required: true,
              message: '请输入您的邮箱验证码!',
            },
          ]}
          style={{
            width: '72.3%',
          }}
        >
          <Input
            prefix={
              <SafetyCertificateOutlined className="site-form-item-icon" />
            }
            placeholder="邮箱验证码"
          />
        </Form.Item>
        <Button
          style={{
            width: '28%',
            height: '100%',
            position: 'absolute',
            top: 0,
            right: 0,
            cursor: 'pointer',
          }}
          onClick={getEmailCode}
        >
          获取验证码
        </Button>
      </div>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          style={{ width: '100%', marginTop: 20 }}
          loading={loading}
        >
          注册
        </Button>
      </Form.Item>

      <div
        className="marked"
        style={{
          width: '80%',
          margin: '0 auto 10px',
          height: 12,
          borderBottom: '1px solid #ddd',
          textAlign: 'center',
        }}
      >
        <span
          className="words"
          style={{
            background: 'white',
            paddingLeft: 8,
            paddingRight: 8,
            display: 'inline-block',
          }}
        >
          请记住您的账号和密码
        </span>
      </div>
    </Form>
  )
}
