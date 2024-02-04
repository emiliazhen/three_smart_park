import style from './index.module.less'
import React, { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'

const SceneComponent: React.FC = () => {
  const threeRef = useRef<HTMLDivElement | null>(null)
  // 初始化场景
  const scene = new THREE.Scene()
  // 导入hdr纹理
  const hdrLoader = new RGBELoader()
  hdrLoader.loadAsync('./textures/023.hdr').then((texture) => {
    scene.background = texture
    scene.environment = texture
    scene.environment.mapping = THREE.EquirectangularReflectionMapping
  })

  const camera = new THREE.PerspectiveCamera(75, window.innerHeight / window.innerHeight, 1, 50000)
  // 设置相机位置
  // object3d具有position，属性是1个3维的向量
  camera.position.set(1000, 1000, 1000)

  // 初始化渲染器
  const renderer = new THREE.WebGLRenderer({
    // 抗锯齿
    antialias: true,
    // 图层间太近会闪烁，开启深度检测
    logarithmicDepthBuffer: true,
    // 正确物理光照
    // physicallyCorrectLights: true,
  })
  // 设置渲染尺寸大小
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.shadowMap.enabled = true
  // 初始化控制器
  const controls = new OrbitControls(camera, renderer.domElement)
  // 设置控制器阻尼
  controls.enableDamping = true
  controls.maxPolarAngle = Math.PI / 2
  controls.minPolarAngle = 0
  // 添加平行光
  const light = new THREE.DirectionalLight(0xffffff, 1)
  light.position.set(10, 100, 10)
  scene.add(light)
  // 加入辅助轴，帮助我们查看3维坐标轴
  // const axesHelper = new THREE.AxesHelper(5)
  // 添加辅助坐标轴
  // scene.add(axesHelper)

  const clock = new THREE.Clock()
  const animationFunction = () => {
    const time = clock.getDelta()
    controls.update(time)
    if (mixer) {
      mixer.update(time)
    }
    requestAnimationFrame(animationFunction)
    // 使用渲染器渲染相机看这个场景的内容渲染出来
    renderer.render(scene, camera)
  }
  // 更新摄像头
  camera.aspect = window.innerWidth / window.innerHeight
  //   更新摄像机的投影矩阵
  camera.updateProjectionMatrix()

  // 创建城市
  const gltfLoader = new GLTFLoader()
  // 压缩的文件需要先解压
  const dracoLoader = new DRACOLoader()
  const dracoReadmePath = new URL('/draco/README.md', import.meta.url).href
  const endIndex = dracoReadmePath.lastIndexOf('/')
  dracoLoader.setDecoderPath(dracoReadmePath.substring(0, endIndex + 1))
  gltfLoader.setDRACOLoader(dracoLoader)
  let mixer: THREE.AnimationMixer
  gltfLoader.load(new URL('/model/city4.glb', import.meta.url).href, (gltf: any) => {
    scene.add(gltf.scene)
    // 场景子元素遍历
    gltf.scene.traverse((child) => {
      if (child.name === '热气球') {
        mixer = new THREE.AnimationMixer(child)
        const clip = gltf.animations[0]
        const action = mixer.clipAction(clip)
        action.play()
      }
    })
  })

  // 监听屏幕大小改变的变化，设置渲染的尺寸
  window.addEventListener('resize', () => {
    // 更新摄像头
    camera.aspect = window.innerWidth / window.innerHeight
    //   更新摄像机的投影矩阵
    camera.updateProjectionMatrix()

    //   更新渲染器
    renderer.setSize(window.innerWidth, window.innerHeight)
    //   设置渲染器的像素比例
    renderer.setPixelRatio(window.devicePixelRatio)
    // 曝光程度
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.5
  })
  useEffect(() => {
    threeRef.current!.appendChild(renderer.domElement)
    animationFunction()
  }, [])
  return <div className={style.scene} ref={threeRef}></div>
}

export default SceneComponent
