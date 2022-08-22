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
  //删除所有选点
  deleteAllNodes = (params) =>
    httpReq('delete', `/node/clearNodes?questionId=${params.questionId}`)
  //删除指定点
  deleteNodes = (params) =>
    httpReq('delete', `/node/batch/${params.questionId}`, params.nodeIdList)
  //获取项目选点信息
  getQuestionsNodes = (params) =>
    httpReq(
      'get',
      `/node/getQuestionNodes?questionId=${params.questionId}`,
      params
    )
  //批量设置中心点
  setCenterNodes = (params) =>
    httpReq('put', `/node/batch/center/${params.questionId}`, params.nodeIdList)
  //修改点信息
  updateNode = (params) => httpReq('patch', '/node/updateNode', params)
  //批量选点
  batchUploadNodes = (params) =>
    httpReq('post', `/node/batch/${params.questionId}`, params.nodeIdList)

  //下载文件模板
  downloadNodesFile = () =>
    downloadFile('get', '/file/node/download', {}, 'blob')
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
      `/vehicleSystem/excelVehicleInfo/${params.get('questionId')}`,
      params
    )
  /**结果模块 */
  getSolution = (params) =>
    httpReq('get', `/scheme/list?questionId=${params.questionId}`)
  //获取某个结果的路径
  getResultRoutes = (params) =>
    httpReq('get', `/scheme/${params.finalSolutionId}`)
  //获得结果的所有点
  getResultNodes = (params) =>
    httpReq('get', `/scheme/nodes/${params.finalSolutionId}`)
  //下载文本结果
  downloadResultsFile = (params) =>
    downloadFile(
      'get',
      `/scheme/downloadResult?finalSolutionId=${params.finalSolutionId}`,
      {},
      'blob'
    )
  //文本导入结果
  uploadResultFile = (params) =>
    uploadFile('post', `/scheme/import/${params.get('questionId')}`, params)

  //导入结果模板文件
  downloadResultsTemplate = () =>
    downloadFile('get', `/file/result/download`, {}, 'blob')

  /**客户模块 */
  //点击地图添加选点
  addClient = (params) => httpReq('post', '/node/newClientNode', params)
  //文件导入客户
  clientsFileUpload = (params) =>
    uploadFile('post', `/node/excelClientNodeInfo`, params)
  //获取所有客户
  getAllClients = () => httpReq('get', `/node/getClientNodes`)
  //删除单个用户
  deleteClient = (params) =>
    httpReq('delete', `/node/deleteClientNode?nodeId=${params.nodeId}`)
  //修改用户信息
  editClients = (params) => httpReq('PATCH', '/node/updateClientNode', params)
  //分页获取客户
  getPartClients = (params) =>
    httpReq(
      'get',
      `/node/pageClientNodes?pageNum=${params.pageNum}&pageSize=${params.pageSize}`
    )
  //搜索客户
  searchClients = (params) =>
    httpReq(
      'post',
      `/node/fuzzyMatchingClientNode?partInfo=${params.keyValue}&pageNum=${params.pageNum}&pageSize=${params.pageSize}`
    )
  //清空所有客户
  deleteAllClients = () => httpReq('delete', '/node/deleteClientNodesByUserId')

  //批量删除客户
  deleteClients = (parmas) =>
    httpReq('delete', '/node/batch', parmas.nodeIdList)
}

export default new HttpUtil()
