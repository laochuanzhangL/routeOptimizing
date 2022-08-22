import React from 'react'
import { Input, Button, Form, Modal, message } from 'antd'
import httpUtil from '../../../../../utils/httpUtil'
export const AddItemModal = (props) => {
  const { addItemVisible, setAddItemVisible,getQuestions,userId } = props
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
        setAddItemVisible(false)
      } else {
        message.error(res.msg)
      }
    })
  }

  const cancelAdd = () => {
    setAddItemVisible(false)
  }
  return (
    <Modal
      title="新增订单"
      onCancel={cancelAdd}
      visible={addItemVisible}
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
  )
}
