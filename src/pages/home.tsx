import React from 'react'
import style from './home.module.less'
import Scene from '@/components/scene'

const HomePage: React.FC = () => {
  return (
    <>
      <div className={style.home}>
        <header>智慧城市管理系统平台</header>
      </div>
      <Scene />
    </>
  )
}
export default HomePage
