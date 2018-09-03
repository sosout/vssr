import path from 'path'
import _ from 'lodash'

// TODO
export const chainFn = function chainFn(base, fn) {
  if (typeof fn !== 'function') {
    return base
  }
  return function () {
    if (typeof base !== 'function') {
      return fn.apply(this, arguments)
    }
    let baseResult = base.apply(this, arguments)
    // 允许函数改变第一个参数而不是返回结果
    if (baseResult === undefined) {
      baseResult = arguments[0]
    }
    const fnResult = fn.call(
      this,
      baseResult,
      ...Array.prototype.slice.call(arguments, 1)
    )
    // 如果没有返回结果，则返回改变的参数
    if (fnResult === undefined) {
      return baseResult
    }
    return fnResult
  }
}

// 任务队列
export const sequence = function sequence(tasks, fn) {
  return tasks.reduce(
    (promise, task) => promise.then(() => fn(task)),
    Promise.resolve()
  )
}
