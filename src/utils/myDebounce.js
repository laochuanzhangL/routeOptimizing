/**
 * handle 最终需要执行的事件监听
 * wait 事件触发之后多久开始执行
 * immediate 控制执行第一次还是最后一次,false 执行最后一次
 */

export function myDebounce(handle, wait, immediate) {
  if (typeof handle !== 'function') throw new Error('handle must be a function')
  if (typeof wait === 'undefined') wait = 300
  if (typeof wait === 'boolean') {
    immediate = wait
    wait = 300
  }
  if (typeof immediate !== 'boolean') immediate = false

  let timer = null
  return function proxy(...args) {
    let self = this
    let init = immediate && !timer
    clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      !immediate ? handle.call(self, ...args) : null
    }, wait)

    init ? handle.call(self, ...args) : null
  }
}
