import React, { useState } from 'react'
import style from './home.module.less'
import Scene from '@/components/scene'

const HomePage: React.FC = () => {
  // 热气球穿过、环绕园区
  const [isAcrossState, setIsAcrossState] = useState(true)
  const toggleState = () => {
    setIsAcrossState(!isAcrossState)
  }
  // 热气球穿过、环绕园区
  const [activeCamera, setActiveCamera] = useState('default')
  const changeCamera = (i: string) => {
    setActiveCamera(i)
  }
  // 相机枚举
  const CameraType = {
    default: '默认相机',
    carcamera_Orientation: '汽车第三视角',
    rightcamera_Orientation: '汽车侧面视角',
  } as { [key: string]: string }
  // 相机列表
  const [cameraList, setCameraList] = useState(['default'])
  // 新增相机
  const addCamera = (v: string[]) => {
    setCameraList(v)
  }
  const [activeControls, setActiveControls] = useState('Orbit')
  const toggleControls = (v: string) => {
    setActiveControls(v)
  }
  return (
    <>
      <div className={style.home}>
        <header>智慧园区管理系统平台</header>
        <div className={style.main}>
          <div className={style.left}>
            <div className={style.cityEvent}>
              <h3>
                <span>热气球</span>
              </h3>
              <h1 onClick={toggleState}>
                <span>切换模式：{isAcrossState ? '穿过' : '环绕'}</span>
              </h1>
              <div className={style.footerBorder}></div>
            </div>
            <div className={style.cityEvent}>
              <h3>
                <span>相机</span>
              </h3>
              {cameraList.map((v) => (
                <h1 onClick={() => changeCamera(v)} className={activeCamera === v ? style.active : ''} key={v}>
                  <span>{CameraType[v]}</span>
                </h1>
              ))}

              <div className={style.footerBorder}></div>
            </div>
          </div>
          <div className={style.right}>
            <div className={`${style.cityEvent} ${style.list}`}>
              <h3>
                <span>切换园区观览模式</span>
              </h3>
              <ul>
                <li onClick={() => toggleControls('Orbit')} className={activeControls === 'Orbit' ? style.active : ''}>
                  <h1>
                    <div>
                      <span> 轨道观览 </span>
                    </div>
                  </h1>
                  <p>可以锁定目标建筑和园区进行轨道式360°查看</p>
                </li>
                <li onClick={() => toggleControls('Fly')} className={activeControls === 'Fly' ? style.active : ''}>
                  <h1>
                    <div>
                      <span> 飞行观览 </span>
                    </div>
                  </h1>
                  <p>可以使用飞行模式进行园区进行观览</p>
                </li>
                <li onClick={() => toggleControls('FirstPerson')} className={activeControls === 'FirstPerson' ? style.active : ''}>
                  <h1>
                    <div>
                      <span> 第一人称 </span>
                    </div>
                  </h1>
                  <p>可以使用第一人称模式进行园区进行观览</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Scene isAcrossState={isAcrossState} addCamera={addCamera} currentCameraName={activeCamera} currentControls={activeControls} />
    </>
  )
}
export default HomePage
