gsap.registerPlugin(MotionPathHelper)
let motionPathHelper;
let wrapEl;
function createPaintSVG(wrap) {
  // viewBox 需要和运动路径所在的 SVG 元素的一致
  wrap.innerHTML = `
    <svg id="paint-svg" viewBox="0 0 1000 668">
      <path id="paint-path" fill="none" d="M 10 10 C 20 40, 80 40, 90 10"/>
      <circle id="paint-path-mobile" r="5" />
    </svg>
  `;

  const styleEl = document.createElement('style');
  styleEl.id = 'path-svg-paint-style';
  styleEl.innerHTML = `
    #paint-svg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
    #paint-path {
      fill: none;
      stroke: black;
      stroke-miterlimit: 10;
    }
    #paint-path-mobile {
      fill: white;
      stroke: black;
      stroke-width: 1;
    }
    #path-svg-paint-manual {
      pointer-events: none;
      position: absolute;
      left: 0;
      padding: 0 8px;
      font-size: 12px;
      color: white;
      background: #333;
      opacity: 0.6;
    }
  `;
  document.head.appendChild(styleEl);

  const manualEl = document.createElement('div');
  manualEl.id = 'path-svg-paint-manual';
  manualEl.innerHTML = `
    <p>控制点添加：按住 ALT 键，点击路径上任意一处</p>
    <p>控制点删除：选中控制点，按下 DELETE 键</p>
    <p>控制点多选：按住 SHIFT 键，点击控制点</p>
    <p>控制点切换（平滑与直角）：按住 ALT 键，点击需要切换的控制点</p>
    <p>路径拖动：点击路径上任意一处，按住左键不放即可拖动</p>
    <p>操作撤销：CTRL + Z</p>
  `;
  document.body.appendChild(manualEl);
}

function paint(wrap = document.body) {
  wrapEl = wrap;
  createPaintSVG(wrap);

  window.gsap.to('#paint-path-mobile', {
    duration: 5, 
    ease: 'none',
    immediateRender: true,
    motionPath: {
      path: '#paint-path',
      align: "#paint-path",
      alignOrigin: [0.5, 0.5],
      autoRotate: true
    }
  });

  motionPathHelper = MotionPathHelper.create('#paint-path-mobile');
  return motionPathHelper
}

function paintKill() {
  if (motionPathHelper) {
    motionPathHelper.kill();
    motionPathHelper = null;
  }
  wrapEl.innerHTML = '';
  document.head.removeChild(document.head.querySelector('#path-svg-paint-style'));
  document.body.removeChild(document.body.querySelector('#path-svg-paint-manual'));
}

export { paint, paintKill };
