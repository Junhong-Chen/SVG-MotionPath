function isFunc(f) {
  return f instanceof Function
}

function isArr(arr) {
  return arr instanceof Array
}

function isObj(obj) {
  return obj !== null && typeof obj === 'object'
}

function isStr(str) {
  return typeof str === 'string'
}

function isCoor(node) {
  return isObj(node) && !isNaN(node.x) && !isNaN(node.y)
}

function callFuncs(funcs, params) {
  for (const func of funcs) {
    if (isFunc(func)) func(params)
  }
}

function getRemainderOfArray(array, i) {
  return array.length ? array[i % array.length] : null
}

function getDuration(point1, point2, speed) {
  const dx = point2.x - point1.x
  const dy = point2.y - point1.y
  return (Math.sqrt(dx * dx + dy * dy) / speed) || 0
}

export {
  isFunc,
  isArr,
  isObj,
  isStr,
  isCoor,
  callFuncs,
  getRemainderOfArray,
  getDuration
}