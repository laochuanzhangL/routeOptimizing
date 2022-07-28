import React from 'react'
import './styles.less'

export const Footer = () => {
  return (
    <div className="footer">
      <div className="content">
        <div>Copyright &copy; {new Date().getFullYear()} MISLab 版权所有</div>
      </div>
    </div>
  )
}
