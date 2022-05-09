import React, { useState } from 'react'
import { Button, Form, Modal, Select } from 'antd'
export const Modify = (props) => {
  const { setModifyVisible, modifyVisible } = props
  //修改哪一项
  const [modifedItem, setModifedItem] = useState('nodes')

  const { Option } = Select

  const onModifyChange = (e) => {
    setModifedItem(e)
  }

  const cancelModify = () => {
    setModifyVisible(false)
  }
  const goToModify = () => {
    console.log(modifedItem)
  }
  return (
    <div className="modify_wrap">
      <Modal
        key="mathModal"
        visible={modifyVisible}
        onCancel={cancelModify}
        title="数据修改"
        className="modify_modal"
        width="400px"
        style={{
          marginTop: '10vw',
          minWidth: '400px',
        }}
        height="300px"
        footer={[
          <Button type="primary" onClick={cancelModify}>
            取消
          </Button>,
          <Button type="primary" onClick={goToModify}>
            下一步
          </Button>,
        ]}
      >
        <Form.Item name="gender" label="修改项" rules={[{ required: true }]}>
          <Select
            onChange={(e) => {
              onModifyChange(e)
            }}
            defaultActiveFirstOption
            allowClear
            placeholder="站点修改"
            value={modifedItem}
          >
            <Option value="nodes">站点修改</Option>
            <Option value="cars">车辆修改</Option>
          </Select>
        </Form.Item>
      </Modal>
    </div>
  )
}
