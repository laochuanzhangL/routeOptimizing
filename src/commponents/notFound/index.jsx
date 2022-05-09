import React from 'react'
import styles from './index.module.css'
import NF from '../../assets/NF.png'

export const NotFound = () => {
  return (
    <div className={styles.center}>
      <img src={NF} />
      <h3>您的页面已丢失</h3>
    </div>
  )
}
