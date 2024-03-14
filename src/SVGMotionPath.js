import {
  isFunc,
  isStr,
  isCoor,
  callFuncs,
  getRemainderOfArray,
} from './utils.js'
import {
  SVG_EL,
  SVG_STYLE_EL,
  SVG_PATH,
  SVG_TRACE,
  SVG_NODE,
  SVG_MOBILE,
  EASE_LINEAR,
} from './constant.js'
import gsap from 'gsap'
import MotionPathPlugin from 'gsap/MotionPathPlugin'
gsap.registerPlugin(MotionPathPlugin)

window.gsap = gsap

// 默认样式
const TRACE_DASH = '20 40'
const WIDTH = 1
const OPACITY = 1
const COLOR_DARK = 'black'
const COLOR_LIGHT = 'white'

function getDurations(paths, duration, speed) {
  const durations = []
  const pathLengths = []
  let count = 0
  for (const path of paths) {
    const pathLength = MotionPathPlugin.getLength(path)
    count += pathLength
    pathLengths.push(pathLength)
  }

  if (duration) {
    speed = count / duration
  }

  for (let i = 0; i < paths.length; i++) {
    durations[i] = pathLengths[i] / speed
  }

  return durations
}

function dataToPath(data, className) {
  let result = ''
  for (let i = 0; i < data.length; i++) {
    const cur = data[i]
    let path
    if (isStr(cur)) {
      path = cur
    } else if (isCoor(cur)) {
      const next = data[i + 1]
      if (next && isCoor(next)) {
        path = pointsToLinePath([cur, next])
      }
    }
    
    if (path) {
      result += `<path class="${className}" d="${path}"/>`
    }

  }
  return result
}

function dataToNode(data, className, style) {
  let result = ''
  let j = 0
  const { images = [], radius } = style
  for (let i = 0; i < data.length; i++) {
    const prev = data[i - 1]
    const cur = data[i]
    let x, y, rawPath
    
    if (isStr(cur)) {
      [rawPath] = MotionPathPlugin.stringToRawPath(cur);
      [x, y] = rawPath
    } else if(isCoor(cur)) {
      ({x, y} = cur)
    }

    if (isCoor(cur) || isStr(cur) && !isCoor(prev)) {
      const image = getRemainderOfArray(images, i + j)
      result += createNode([x, y], className, Object.assign({ image }, style))
    }

    if ((i === data.length - 1) && isStr(cur)) {
      const [x1, y1] = rawPath.slice(-2)
      const image = getRemainderOfArray(images, i + j + 1)
      result += createNode([x1, y1], className, Object.assign({ image }, style))
    }

    if (isStr(cur)) {
      j--
    }
  }
  return result
}

function createNode(position, className, style) {
  const { radius = 5, image, offsetX = 0, offsetY = 0 } = style
  const [x, y] = position
  let node
  if (image) {
    node = `<image
      class="${className}"
      href="${image}"
      x="${x + offsetX - radius}" y="${y + offsetY - radius}"
      width="${radius * 2}" height="${radius * 2}"
    />`
  } else {
    node = `<circle class="${className}" cx="${x + offsetX}" cy="${y + offsetY}" r="${radius}" />`
  }
  return node
}

function dataToMobile(data, id, style) {
  const [first, second] = data
  let pos
  if (isStr(first)) {
    pos = getPositionOnPath(first)
  } else {
    let nextPoint
    if (isStr(second)) {
      const [rawPath] = MotionPathPlugin.stringToRawPath(second)
      const [x, y] = rawPath
      nextPoint = { x, y }
    } else {
      nextPoint = second
    }
    pos = getPositionOnPath(pointsToLinePath([first, nextPoint]))
  }

  return createMobile(pos, id, style)
}

function createMobile(positon, id, style) {
  const { x, y, angle } = positon
  const { size, image, autoRotate } = style
  const [w = 16, h = 16] = size
  let mobile

  if (image) {
    mobile = `<image
      id="${id}"
      href="${image}"
      width="${w}"
      height="${h}"
      transform="translate(${x - (w / 2)},${y - (h / 2)}), rotate(${autoRotate ? angle : 0})"
      transform-origin="${w / 2} ${h / 2}"
      />
    `
  } else {
    mobile = `<polygon
      id="${id}"
      points="0,0 ${w},${h / 2} 0,${h}"
      transform="translate(${x - (w / 2)},${y - (h / 2)}), rotate(${autoRotate ? angle : 0})"
      transform-origin="${w / 2} ${h / 2}"
    />`
  }

  return mobile
}

function getPositionOnPath(path) {
  const rawPath = MotionPathPlugin.stringToRawPath(path)
  MotionPathPlugin.cacheRawPathMeasurements(rawPath)
  return MotionPathPlugin.getPositionOnPath(rawPath, 0, true) // rawPath、progress、includeAngle
}

function pointsToLinePath(points) {
  let result = ''
  const length = points.length
  if (length > 1) {
    const [first] = points
    result += `M ${first.x} ${first.y}`
    for (let i = 1; i < length; i++) {
      const cur = points[i]
      result += ` L ${cur.x} ${cur.y}`
    }
  }
  return result
}

function initSVGElement(container, data, svg, style, autoRotate) {
  if (isStr(container)) {
    container = document.querySelector(container)
    if (!container) {
      throw Error(`element ${container} was not found.`)
    }
  }
  if (!container instanceof HTMLElement) {
    throw TypeError('param container is not a HTMLElement.')
  }
  if (!data instanceof Array) {
    throw TypeError('param data is not an Array.')
  }
  if (!data.length) {
    throw Error('param data cannot be an empty array.')
  }
  if (data.length === 1 && isCoor(data[0])) {
    throw Error('Only one coordinate couldn\'t generate the route.')
  }

  const { flow: flowStyle, mobile: mobileStyle = {}, node: nodeStyle = {} } = style
  mobileStyle.autoRotate = autoRotate

  let { width, height } = svg
  if (!width || !height) {
    ({ width, height } = container.getBoundingClientRect())
  }

  container.innerHTML = `
    <svg id="path-svg" viewBox="0 0 ${width} ${height}">
      ${dataToPath(data, SVG_PATH.slice(1))}
      ${flowStyle ? dataToPath(data, SVG_TRACE.slice(1)) : ''}
      ${dataToNode(data, SVG_NODE.slice(1), nodeStyle)}
      ${dataToMobile(data, SVG_MOBILE.slice(1), mobileStyle)}
    </svg>
  `
  return container
}

function initSVGStyle(style) {
  let styleEl = document.head.querySelector(SVG_STYLE_EL)
  if (!styleEl) {
    const { line = {}, flow = {}, node = {}, mobile = {} } = style
    const {
      width: lineWidth = WIDTH,
      color: lineColor = COLOR_DARK,
      opacity: lineOpacity = OPACITY,
      dash: lineDash = '0'
    } = line
    const {
      width: flowWidth = WIDTH,
      color: flowColor = COLOR_LIGHT,
      opacity: flowOpacity = OPACITY,
      dash: flowDash = TRACE_DASH
    } = flow
    const {
      borderWidth: nodeStrokeWidth = WIDTH,
      borderColor: nodeStroke = COLOR_DARK,
      fill: nodeFill = COLOR_LIGHT
    } = node
    const {
      borderWidth: mobileStrokeWidth = WIDTH,
      borderColor: mobileStroke = COLOR_DARK,
      fill: mobileFill = COLOR_LIGHT
    } = mobile

    styleEl = document.createElement('style')
    styleEl.id = SVG_STYLE_EL.slice(1)
    styleEl.innerHTML = `
      ${SVG_EL} {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
      ${SVG_PATH} {
        stroke: ${lineColor};
        stroke-width: ${lineWidth};
        stroke-dasharray: ${lineDash};
        opacity: ${lineOpacity};
        fill: none;
      }
      ${SVG_TRACE} {
        stroke: ${flowColor};
        stroke-width: ${flowWidth};
        stroke-dasharray: ${flowDash};
        opacity: ${flowOpacity};
        fill: none;
      }
      ${SVG_NODE} {
        stroke: ${nodeStroke};
        stroke-width: ${nodeStrokeWidth};
        fill: ${nodeFill};
      }
      ${SVG_MOBILE} {
        stroke: ${mobileStroke};
        stroke-width: ${mobileStrokeWidth};
        fill: ${mobileFill};
      }
    `
    document.head.appendChild(styleEl)
  }

  return styleEl
}

export default class SVGMotionPath {
  #callbacks = {
    start: [],
    end: [],
    pass: [],
    repeat: []
  }
  #mobile
  #flow
  #container
  #nodeIndex = 0
  #seeking = false

  get mobile() {
    return this.#mobile
  }

  get flow() {
    return this.#flow
  }

  get nodes() {
    return this.#container.querySelectorAll(SVG_NODE)
  }

  constructor(container, data, { motion = {}, svg = {}, style = {} }) {
    const { mobile: mobileMotion = {}, ease = EASE_LINEAR, flow: flowMotion = {} } = motion
    const {
      ease: mobileEase = EASE_LINEAR,
      autoRotate = false,
      repeat = 0,
      yoyo = false,
      duration = null,
      speed = 100
    } = mobileMotion
    let {
      durations = []
    } = mobileMotion
    let yoyoComplete = false

    this.#container = initSVGElement(container, data, svg, style, autoRotate)
    initSVGStyle(style)

    const tl = gsap.timeline({
      paused: true
    })
    const paths = document.querySelectorAll(SVG_PATH)

    if (!durations.length) {
      durations = getDurations(paths, duration, speed)
    }

    // 一段路径的动画
    for (const [i, path] of paths.entries()) {
      tl.to(SVG_MOBILE, {
        duration: durations[i] || 0.01, // 如果动画时间为零或空，保证有一个最小的动画时间
        ease: mobileEase,
        motionPath: {
          path: path,
          align: path,
          autoRotate,
          alignOrigin: [0.5, 0.5],
        },
        onComplete: () => {
          if (!this.#seeking) callFuncs(this.#callbacks.pass, ++this.#nodeIndex)
        },
        onReverseComplete: () => {
          if (yoyoComplete) callFuncs(this.#callbacks.pass, --this.#nodeIndex)
        }
      }, `point-${i}`)
    }
    // 将一组连续的动画作为对象
    this.#mobile = gsap.to(tl, {
      // progress: 1 + SECOND_OF_FRAME / tl.duration(),
      progress: 1,
      paused: true,
      ease,
      duration: tl.duration(),
      repeat,
      yoyo,
      onStart: () => {
        callFuncs(this.#callbacks.start, 'start')
        callFuncs(this.#callbacks.pass, this.#nodeIndex = 0)
      },
      onComplete: () => {
        callFuncs(this.#callbacks.end, 'end')
      },
      onRepeat: () => {
        let reset = true
        if (yoyo) {
          reset = yoyoComplete
          yoyoComplete = !yoyoComplete
        }

        // 当路径往复循环(yoyo: true)时，第一条和最后一条路径有概率无法走完(不触发 onComplete)，js浮点数精度问题。
        if (reset) {
          callFuncs(this.#callbacks.repeat, { yoyo })
          if (this.#nodeIndex !== 0) callFuncs(this.#callbacks.pass, this.#nodeIndex = 0)
        } else {
          if (this.#nodeIndex !== paths.length) callFuncs(this.#callbacks.pass, ++this.#nodeIndex)
          callFuncs(this.#callbacks.repeat, { yoyo })
        }
      }
    })

    if (flowMotion.duration) {
      const { flow: flowStyle = {} } = style
      const { dash: flowDash = TRACE_DASH } = flowStyle
      const strokeDashoffset = -flowDash.split(' ').reduce((a, b) => Number(a) + Number(b), 0)
      this.#flow = gsap.to(SVG_TRACE, {
        strokeDashoffset,
        repeat: -1,
        ease: EASE_LINEAR,
        duration: flowMotion.duration
      })
    }
  }

  addEventListener(type, callback) {
    if (!isFunc(callback)) {
      throw TypeError('callback is not a Function.')
    }

    if (this.#callbacks[type]) {
      this.#callbacks[type].push(callback)
    }
  }

  removeEventListener(type, callback) {
    if (!isFunc(callback)) {
      throw TypeError('callback is not a Function.')
    }

    const i = this.#callbacks[type].findIndex(el => el === callback)
    if (i > -1) {
      this.#callbacks[type].splice(i, 1)
    }
  }

  kill() {
    this.#mobile.kill()
    if (this.#flow) this.#flow.kill()
    this.#container.innerHTML = ''
    // document.head.removeChild(document.querySelector(SVG_STYLE_EL))
  }

  seek(position) {
    this.#seeking = true
    this.#mobile.seek(this.#mobile._prev.labels[`point-${position}`])
    this.#nodeIndex = position
    this.#seeking = false
  }
}
