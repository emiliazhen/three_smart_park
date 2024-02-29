import style from './index.module.less'
import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { FlyControls } from 'three/examples/jsm/controls/FlyControls.js'
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import gsap from 'gsap'

interface PropsType {
  // 是否是直穿
  isAcrossState: boolean
  // 新增相机
  addCamera: (v: string[]) => void
  currentCameraName: string
  currentControls: string
}

const SceneComponent: React.FC<PropsType> = (props) => {
  const threeRef = useRef<HTMLDivElement | null>(null)

  // 初始化场景
  const scene = new THREE.Scene()
  const cameraObject = useRef<{ [key: string]: THREE.PerspectiveCamera }>({})
  const currentCameraName = useRef('default')
  const renderer = useRef<THREE.WebGLRenderer | null>(null)
  const controls = useRef<OrbitControls | FlyControls | FirstPersonControls | null>(null)
  // 导入hdr纹理
  const hdrLoader = new RGBELoader()
  hdrLoader.loadAsync('./textures/023.hdr').then((texture) => {
    scene.background = texture
    scene.environment = texture
    scene.environment.mapping = THREE.EquirectangularReflectionMapping
  })

  // 添加平行光
  const light = new THREE.DirectionalLight(0xffffff, 1)
  light.position.set(10, 100, 10)
  scene.add(light)

  const clock = new THREE.Clock()
  const animationFunction = () => {
    const time = clock.getDelta()
    controls.current!.update(time)
    if (mixer.current) {
      mixer.current.update(time)
    }
    requestAnimationFrame(animationFunction)
    // 使用渲染器渲染相机看这个场景的内容渲染出来
    renderer.current!.render(scene, cameraObject.current[currentCameraName.current])
  }

  // 创建城市
  const gltfLoader = new GLTFLoader()
  // 压缩的文件需要先解压
  const dracoLoader = new DRACOLoader()
  const dracoReadmePath = new URL('/draco/README.md', import.meta.url).href
  const endIndex = dracoReadmePath.lastIndexOf('/')
  dracoLoader.setDecoderPath(dracoReadmePath.substring(0, endIndex + 1))
  gltfLoader.setDRACOLoader(dracoLoader)
  const cityGltf = useRef<any>(null)

  // 热气球动画
  const action = useRef<THREE.AnimationAction | null>(null)
  // 动画混合器
  const mixer = useRef<THREE.AnimationMixer | null>(null)
  // 小红车
  const redCar = useRef<any>(null)
  // 路线
  const carPath = useRef<THREE.CatmullRomCurve3 | null>(null)
  // 进度
  const curveProgress = useRef(0)

  const initThree = () => {
    const defaultCamera = new THREE.PerspectiveCamera(75, window.innerHeight / window.innerHeight, 1, 50000)
    // 设置相机位置
    // object3d具有position，属性是1个3维的向量
    defaultCamera.position.set(1000, 1000, 1000)
    // 更新摄像头
    defaultCamera.aspect = window.innerWidth / window.innerHeight
    //  更新摄像机的投影矩阵
    defaultCamera.updateProjectionMatrix()
    cameraObject.current['default'] = defaultCamera
    gltfLoader.load(new URL('/model/city4.glb', import.meta.url).href, (gltf: any) => {
      cityGltf.current = gltf
      scene.add(gltf.scene)
      // 场景子元素遍历
      gltf.scene.traverse((child: any) => {
        if (child.name === '热气球') {
          mixer.current = new THREE.AnimationMixer(child)
          const clip = gltf.animations[props.isAcrossState ? 0 : 1]
          action.current = mixer.current.clipAction(clip)
          action.current.play()
        } else if (child.name === '汽车园区轨迹') {
          const line = child
          line.visible = false
          const points = []
          for (let i = line.geometry.attributes.position.count - 1; i >= 0; i--) {
            points.push(new THREE.Vector3(line.geometry.attributes.position.getX(i), line.geometry.attributes.position.getY(i), line.geometry.attributes.position.getZ(i)))
          }
          carPath.current = new THREE.CatmullRomCurve3(points)
          curveProgress.current = 0
          carAnimation()
        } else if (child.name === 'redcar') {
          redCar.current = child
        }
      })
      const tmpAddCameraList = ['default']
      // 相机
      gltf.cameras.forEach((camera: THREE.PerspectiveCamera) => {
        cameraObject.current[camera.name] = camera
        tmpAddCameraList.push(camera.name)
      })
      props.addCamera(tmpAddCameraList)
    })
    // 初始化渲染器
    renderer.current = new THREE.WebGLRenderer({
      // 抗锯齿
      antialias: true,
      // 图层间太近会闪烁，开启深度检测
      logarithmicDepthBuffer: true,
      // 正确物理光照
      // physicallyCorrectLights: true,
    })
    // 设置渲染尺寸大小
    renderer.current.setSize(window.innerWidth, window.innerHeight)
    renderer.current.shadowMap.enabled = true
    // 初始化控制器
    controls.current = new OrbitControls(cameraObject.current[currentCameraName.current], renderer.current.domElement)
    // 设置控制器阻尼
    controls.current.enableDamping = true
    controls.current.maxPolarAngle = Math.PI / 2
    controls.current.minPolarAngle = 0
    threeRef.current!.appendChild(renderer.current.domElement)
    animationFunction()
    // 监听屏幕大小改变的变化，设置渲染的尺寸
    window.addEventListener('resize', () => {
      // 更新摄像头
      cameraObject.current[currentCameraName.current].aspect = window.innerWidth / window.innerHeight
      //   更新摄像机的投影矩阵
      cameraObject.current[currentCameraName.current].updateProjectionMatrix()
      //   更新渲染器
      renderer.current!.setSize(window.innerWidth, window.innerHeight)
      //   设置渲染器的像素比例
      renderer.current!.setPixelRatio(window.devicePixelRatio)
      // 曝光程度
      renderer.current!.toneMapping = THREE.ACESFilmicToneMapping
      renderer.current!.toneMappingExposure = 1.5
    })
  }
  // 汽车动画
  const carAnimation = () => {
    gsap.to(curveProgress, {
      current: 0.999,
      duration: 10,
      repeat: -1,
      onUpdate() {
        const point = carPath.current!.getPoint(curveProgress.current)
        redCar.current.position.set(point.x, point.y, point.z)
        if (curveProgress.current + 0.001 < 1) {
          const nextPoint = carPath.current!.getPoint(curveProgress.current + 0.001)
          redCar.current.lookAt(nextPoint)
        }
      },
    })
  }

  useEffect(() => {
    initThree()
    return () => {
      mixer.current = null
      action.current = null
      renderer.current!.dispose()
      renderer.current!.forceContextLoss()
      renderer.current = null
      controls.current = null
    }
  }, [])

  useEffect(() => {
    if (action.current) {
      action.current.reset()
      const clip = cityGltf.current!.animations[props.isAcrossState ? 0 : 1]
      action.current = mixer.current!.clipAction(clip)
      action.current.play()
    }
  }, [props.isAcrossState])
  useEffect(() => {
    currentCameraName.current = props.currentCameraName
  }, [props.currentCameraName])
  useEffect(() => {
    if (props.currentControls === 'Orbit') {
      controls.current = new OrbitControls(cameraObject.current[currentCameraName.current], renderer.current!.domElement)
      // 设置控制器阻尼
      controls.current.enableDamping = true
      // 设置自动旋转
      // controls.autoRotate = true;

      controls.current.maxPolarAngle = Math.PI / 2
      controls.current.minPolarAngle = 0
    } else if (props.currentControls === 'Fly') {
      controls.current = new FlyControls(cameraObject.current[currentCameraName.current], renderer.current!.domElement)
      controls.current.movementSpeed = 100
      controls.current.rollSpeed = Math.PI / 60
    } else if (props.currentControls === 'FirstPerson') {
      controls.current = new FirstPersonControls(cameraObject.current[currentCameraName.current], renderer.current!.domElement)
      controls.current.movementSpeed = 100
      ;(controls.current as any).rollSpeed = Math.PI / 60
    }
  }, [props.currentControls])
  return <div className={style.scene} ref={threeRef}></div>
}
SceneComponent.defaultProps = {
  isAcrossState: true,
}
export default SceneComponent
