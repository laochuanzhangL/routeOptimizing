//用于下载文件
export const exportFile = (content, customFileName, type) => {
  let blob = new Blob([content], { type: type || 'application/vnd.ms-excel' }) // 默认excel
  let filename = content.filename || customFileName
  let URL = window.URL || window.webkitURL
  let objectUrl = URL.createObjectURL(content)
  let a = document.createElement('a')
  a.href = objectUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
}
