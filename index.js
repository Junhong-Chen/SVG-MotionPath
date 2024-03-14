import SVGMotionPath from './packages/SVGMotionPath.js'
import { paint, paintKill } from './src/paint.js'

const $ = document.querySelector.bind(document)

const data = [
  'M323,322 C343,295 368.407,304.775 376.208,316.9 C387.919,335.102 387.119,364.628 355.513,383.475 C342.185,391.422 321.623,395.165 295.217,386.523',
  'M295.217,386.523 C266.8061,377.2242 234.902,350.393 206.858,321.519',
  'M206.858,321.519 C199.0244,313.4536 185.503,287.64 205.445,262.092 C226.155,235.561 295.96,217.215 327.831,218.695 C384.61,221.333 447.037,247.811 473.113,272.248 C487.31,285.554 489.177,299.413 515.483,311.054',
  'M515.483,311.054 C532.891,318.758 556.169,323.598 565.786,341.234 C575.647,359.318 584.253,374.263 566.243,397.741 C550.952,417.674 604.373,440.211 613.846,411.727 C624.749,378.94 604.137,337.049 631.539,306.969 C658.658,277.2 684.213,272.181 725.825,278.702',
  'M725.825,278.702 C750.282,282.535 787.27,290.903 804.342,313.947 C823.341,339.593 841.544,355.03 858.542,353.685 C882.454,351.793 886.907,341.969 906,343'
]

const motionPath = new SVGMotionPath('#svg-container', data, {
  svg: {
    width: 1000,
    height: 668
  },
  motion: {
    // ease: 'none',
    mobile: {
      ease: 'power1.inOut',
      // durations: []
      // duration: 10,
      speed: 80,
      // repeat: -1,
      yoyo: false,
      autoRotate: false,
    },
    flow: {
      duration: 2
    }
  },
  style: {
    line: {
      width: 8,
      color: '#999',
      opacity: 0.4,
      // dash: '2 4'
    },
    flow: {
      width: 1,
      color: 'white',
      // opacity: 1,
      dash: '20 40',
    },
    node: {
      images: ['/static/bus-stop.png'],
      offsetX: 0,
      offsetY: -22,
      radius: 24,
      fill: 'gold',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    mobile: {
      image: '/static/airship.png',
      size: [50, 50],
      fill: 'gold',
      borderWidth: 2,
      borderColor: 'black',
    }
  }
})

Array.prototype.map.call(motionPath.nodes, node => {
  node.style.transformOrigin = `
    ${Number(node.getAttribute('x')) + Number(node.getAttribute('width')) / 2}px
    ${Number(node.getAttribute('y')) + Number(node.getAttribute('height'))}px
  `
})

motionPath.addEventListener('start', function(event) { console.log(event) })
motionPath.addEventListener('end', function(event) { console.log(event) })
motionPath.addEventListener('repeat', function(event) { console.log('repeat') })
motionPath.addEventListener('pass', nodePass)

function nodePass(i) {
  const node = motionPath.nodes[i]
  const cb = function(e) {
    motionPath.mobile.resume()
    node.style.animation = ''
    node.removeEventListener('animationend', cb)
  }
  node.style.animation = '0.5s linear 1 rotate'
  motionPath.mobile.pause()
  node.addEventListener('animationend', cb)
}

const pauseEl = $('#pause')
$('#play').onclick = () => { motionPath.mobile.play(); pauseEl.textContent = '暂停' }
$('#restart').onclick = () => { motionPath.mobile.restart(); pauseEl.textContent = '暂停' }
pauseEl.onclick = function() {
  if (pauseEl.textContent === '暂停') {
    pauseEl.textContent = '继续'
    motionPath.mobile.pause()
  } else {
    pauseEl.textContent = '暂停'
    motionPath.mobile.resume()
  }
}

const paintEl = $('#paint')
paintEl.onclick = function() {
  if (paintEl.textContent === '路径绘制') {
    paintEl.textContent = '停止绘制'
    paint($('#path-paint-container'))
  } else {
    paintEl.textContent = '路径绘制'
    paintKill()
  }
}
