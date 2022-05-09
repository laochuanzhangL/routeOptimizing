import React from 'react'
import { useState, useEffect } from 'react'
import {
  Modal,
  Button,
  Table,
  message,
  Form,
  Select,
  Input,
  Space,
  Popconfirm,
  DatePicker,
  notification,
} from 'antd'
import httpUtil from '../../../utils/httpUtil'
import { useHistory } from 'react-router'
import { CheckOutlined } from '@ant-design/icons'
const { Option } = Select
export const SelectSide = (props) => {
  const { questionId, haveCenter } = props
  const [carsVisible, setCarsVisible] = useState(false)
  const [cars, setCars] = useState([])
  const [addCarsVisible, setAddCarsVisible] = useState(false)
  const [mathVisible, setMathVisible] = useState(false)
  const [mathes, setMathes] = useState([])
  const [math, setMath] = useState(1)
  const history = useHistory()
  const { userId } = localStorage
  const carsColumns = [
    {
      title: '车辆类型',
      dataIndex: 'type',
      render: (render) => {
        return render
      },
    },
    {
      title: '车牌号',
      dataIndex: 'vehicleNumber',
      render: (render) => {
        return render
      },
    },
    {
      title: '车辆容量',
      dataIndex: 'capacity',
      render: (render) => {
        return render
      },
    },
    {
      title: '车辆耗油量',
      dataIndex: 'oil',
      render: (render) => {
        return render
      },
    },
    {
      title: '车辆运费',
      dataIndex: 'price',
      render: (render) => {
        return render
      },
    },
    {
      title: '车辆生产日期',
      dataIndex: 'date',
      render: (render) => {
        return render.slice(0, 10)
      },
    },
    {
      title: '操作',
      dataIndex: 'action',
      width: 70,
      render: (_, record) => (
        <Space size="middle">
          <Popconfirm
            title="是否删除?"
            okText="确定"
            cancelText="取消"
            onConfirm={() => deleteCar(record)}
          >
            <a>删除</a>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  useEffect(() => {
    getAllCars()
    getAllMathes()
  }, [])
  const openAddCars = () => {
    setAddCarsVisible(true)
  }
  const cancelAddCars = () => {
    setAddCarsVisible(false)
  }
  const deleteCar = (e) => {
    const { vehicleId } = e
    const carsId = [vehicleId]
    httpUtil.deleteCars(carsId).then((res) => {
      if (res.status == 9999) {
        message.success('删除成功')
        getAllCars()
      } else {
        message.error('删除失败')
      }
    })
  }
  const addCars = (e) => {
    const time = e.date.format('yyyy-MM-DD')
    e.date = time
    e.questionId = questionId
    e.ownerId = userId
    console.log(e)
    httpUtil.addCars(e).then((res) => {
      console.log(res)
      if (res.status == 9999) {
        setAddCarsVisible(false)
        message.success('添加成功')
        getAllCars()
      } else {
        message.error('添加失败')
      }
    })
  }
  const getAllCars = () => {
    const data = { questionId }
    httpUtil.getAllCars(data).then((res) => {
      if (res.status == 9999) {
        setCars([...res.data])
      }
    })
  }
  const getAllMathes = () => {
    httpUtil.getAllAlgorithmNames().then((res) => {
      if (res.status == 9999) {
        const obj = res.data
        const temp = []
        for (let key in obj) {
          temp.push({ key: key, value: obj[key] })
        }
        setMathes(temp)
      }
    })
  }
  const openCars = () => {
    if (haveCenter) {
      setCarsVisible(true)
    } else {
      message.warn('请先完成地图选点')
    }
  }
  const cancelCars = () => {
    setCarsVisible(false)
  }
  const openMath = () => {
    if (cars.length == 0) {
      message.error('请先完成车辆配备')
    } else {
      setCarsVisible(false)
      setMathVisible(true)
    }
  }
  const startExecute = () => {
    const query = { questionId, key: math }
    httpUtil.executeAlgorithm(query).then((res) => {
      if (res.status === 0) {
        openNotification()
        setMathVisible(false)
      } else {
        message.error('数据有误')
      }
    })
  }
  //算法计算完成后的通知
  const openNotification = () => {
    const key = `open${Date.now()}`
    const btn = (
      <Button
        type="primary"
        size="small"
        onClick={() => {
          notification.close(key)
          history.push(`/result/${questionId}`)
        }}
      >
        前往查看
      </Button>
    )
    notification.open({
      message: '计算成功',
      description: '可点击以下按钮前往查看，本框4秒后自动消失',
      btn,
      key,
      duration: 4,
      icon: <CheckOutlined style={{ color: '#52c41a' }} />,
    })
  }
  const cancelMath = () => {
    setMathVisible(false)
  }
  const mathToCars = () => {
    setMathVisible(false)
    setCarsVisible(true)
  }
  const onMathChange = (e) => {
    setMath(e)
  }

  return (
    <div className="implement_wrap">
      <Button type="primary" onClick={openCars} key="implement">
        开始执行
      </Button>
      <Modal
        key="carsModal"
        visible={carsVisible}
        //onOk={}
        onCancel={cancelCars}
        title="车辆配备"
        className="cars_modal"
        width="1000px"
        style={{
          minWidth: '800px',
          minHeight: '600px',
        }}
        height="600px"
        footer={[
          <div className="footer_btn">
            <div className="left_btn">
              <Button type="primary" onClick={openAddCars}>
                添加车辆
              </Button>
              <Button type="link">文件导入</Button>
            </div>
            <div className="right_btn">
              <Button type="primary" onClick={cancelCars}>
                取消
              </Button>
              <Button type="primary" onClick={openMath}>
                下一步
              </Button>
            </div>
          </div>,
        ]}
      >
        <Table
          bordered
          columns={carsColumns}
          scroll={{ y: 300 }}
          dataSource={cars}
        />
      </Modal>

      <Modal
        title="添加车辆"
        visible={addCarsVisible}
        onCancel={cancelAddCars}
        footer={null}
      >
        <Form
          labelCol={{
            span: 4,
          }}
          wrapperCol={{
            span: 14,
          }}
          onFinish={addCars}
          layout="horizontal"
          size="center"
        >
          <Form.Item
            label="类型"
            name="type"
            rules={[{ required: true, message: '请输入车辆类型' }]}
          >
            <Input bordered="false" placeholder="请输入车辆类型" />
          </Form.Item>
          <Form.Item
            label="类型"
            name="vehicleNumber"
            rules={[{ required: true, message: '请输入车牌号' }]}
          >
            <Input bordered="false" placeholder="请输入车牌号" />
          </Form.Item>
          <Form.Item
            label="容量"
            name="capacity"
            required
            rules={[{ required: true, message: '请输入数字' }]}
          >
            <Input bordered="false" placeholder="请输入车辆容量" />
          </Form.Item>
          <Form.Item
            label="耗油量"
            name="oil"
            rules={[{ required: true, message: '请输入车辆耗油量' }]}
          >
            <Input bordered="false" placeholder="请输入车辆耗油量" />
          </Form.Item>
          <Form.Item
            label="价格"
            name="price"
            rules={[{ required: true, message: '请输入车辆价格' }]}
          >
            <Input bordered="false" placeholder="请输入车辆价格" />
          </Form.Item>
          <Form.Item
            label="生产日期"
            name="date"
            rules={[{ required: true, message: '请选择车辆生产日期日期' }]}
          >
            <DatePicker placeholder="生产日期" />
          </Form.Item>
          <Form.Item
            style={{
              display: 'flex',
              justifyContent: 'center',
              paddingTop: '25px',
            }}
          >
            <Button type="primary" htmlType="submit" block>
              确认订单
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        key="mathModal"
        visible={mathVisible}
        onCancel={cancelMath}
        title="算法选择"
        className="math_modal"
        width="400px"
        style={{
          marginTop: '10vw',
          minWidth: '400px',
        }}
        height="300px"
        footer={[
          <Button type="primary" onClick={mathToCars}>
            返回
          </Button>,
          <Button type="primary" onClick={startExecute}>
            开始执行
          </Button>,
        ]}
      >
        <Form.Item name="gender" label="算法" rules={[{ required: true }]}>
          <Select
            onChange={onMathChange}
            defaultActiveFirstOption
            allowClear
            value={math}
            placeholder="随机算法"
          >
            {mathes.map((item) => {
              const { key, value } = item
              return <Option value={key}>{value}</Option>
            })}
          </Select>
        </Form.Item>
      </Modal>
    </div>
  )
}
