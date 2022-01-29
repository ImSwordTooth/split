import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

class Icon extends PureComponent {

    static propTypes = {
        icon: PropTypes.string.isRequired, // 图标的名称，对应 iconfont 里的设置
        color: PropTypes.string, // 图标的颜色
        style: PropTypes.object, // 行内样式，加在这里会很方便
        className: PropTypes.string // icon 的类名
    }

    render() {
        const { icon, color, style, className } = this.props
        return (
            <i className={`iconfont icon-${icon} ${className || ''}`} style={{...style, color}}/>
        )
    }
}

export default Icon
