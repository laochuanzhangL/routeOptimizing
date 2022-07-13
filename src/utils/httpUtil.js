/* 
  请求url配置
*/
// 引入请求方法
import { downloadFile } from './downloadFile'
import { httpReq } from './httpReq'
import { uploadFile } from './uploadFile'
class HttpUtil {
  /* 用户登录模块 */
  //注册
  register = (params) => httpReq('post', '/userSystem/user', params)
  //登陆
  login = (params) => httpReq('post', '/userSystem/session/user', params)
  //获取图片验证码
  getVerifyCode = () => httpReq('get', '/userSystem/verifyCode', null, 'blob')
  //获取邮箱验证码
  getEmailCode = (email) =>
    httpReq('get', `/userSystem/user/eMailCode/?email=${email}`)
  // 退出登陆
  logOut = () => httpReq('delete', '/userSystem/session/user')
  /*  首页展示方案模块 */
  //获取全部方案
  getQuestions = (params) => httpReq('post', '/question/getQuestions', params)
  //创建方案
  creatQuestion = (params) => httpReq('post', '/question/question', params)
  //删除方案
  deleteQuestion = (params) =>
    httpReq(
      'delete',
      `/question/removeQuestion?questionId=${params.questionId}`
    )

  /**地图选点模块 */
  //点击地图添加选点
  addNode = (params) => httpReq('post', '/node/newNode', params)
  //提交所有选点
  uploadNodes = (params) => httpReq('post', '/node/newNodeBatch', params)
  //删除所有选点
  deleteAllNodes = (params) =>
    httpReq('delete', `/node/clearNodes?questionId=${params.questionId}`)
  //删除指定点
  deleteNode = (params) => httpReq('delete', '/node/deleteNode', params)
  //获取项目选点信息
  getQuestionsNodes = (params) =>
    httpReq('get', `/node/getQuestionNodes?questionId=${params.questionId}`)
  //修改点信息
  updateNode = (params) => httpReq('patch', '/node/updateNode', params)
  //文件上传导入选点
  nodesFileUpload = (params) =>
    uploadFile(
      'post',
      `/node/excelNodeInfo/${params.get('questionId')}`,
      params
    )
  //下载文件模板
  downloadNodesFile = () => downloadFile('get', '/node/download', {}, 'blob')
  /**算法模块 */
  //获取所有算法
  getAllAlgorithmNames = () => httpReq('get', '/algorithm/list?type=0')
  //选择算法并执行
  executeAlgorithm = (params) =>
    httpReq('post', `/scheme?key=${params.key}&questionId=${params.questionId}`)

  /**车辆模块 */
  //获取所有车辆信息
  getAllCars = (params) =>
    httpReq(
      'get',
      `/vehicleSystem/user/vehicle?questionId=${params.questionId}`
    )
  //添加车辆
  addCars = (params) => httpReq('post', '/vehicleSystem/user/vehicle', params)

  //删除车辆
  deleteCars = (params) =>
    httpReq('delete', '/vehicleSystem/user/vehicle', params)

  //文件导入车辆
  carsFileUpload = (params) =>
  uploadFile(
    'post',
    `vehicleSystem/excelVehicleInfo/${params.get('questionId')}`,
    params
  )
  /**结果模块 */
  getSolution = (params) =>
    httpReq('get', `/scheme/list?questionId=${params.questionId}`)
  //获取某个结果的路径
  getResultRoutes=(params)=>
    httpReq('get', `/scheme/${params.finalSolutionId}`)
  
  getResultNodes=(params)=>
    httpReq('get', `/scheme/nodes/${params.finalSolutionId}`)
}

export default new HttpUtil()
