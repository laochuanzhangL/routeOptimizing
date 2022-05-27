//节流
export function myThrottle(handle, wait) {
  if (typeof handle !== 'function') throw new Error('handle must be a function')
  if (typeof wait === 'undefined') wait = 400

  let previous = 0
  let timer = null
  return function proxy(...args) {
    let now = new Date()
    let self = this
    let interval = wait - (now - previous)
    if (interval <= 0) {
      handle.call(self, ...args)

      clearTimeout(timer)
      timer = null

      previous = new Date()
    } else if (!timer) {
      timer = setTimeout(() => {
        clearTimeout(timer)
        timer = null
        handle.call(self, ...args)
        previous = new Date()
      }, interval)
    }
  }
}
