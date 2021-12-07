import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

class Icon extends PureComponent {

    static propTypes = {
        icon: PropTypes.string, // 图标的名称，对应 iconfont 里的设置
        color: PropTypes.string // 图标的颜色
    }

    render() {
        const { icon, color } = this.props
        return (
            <i className={`iconfont icon-${icon}`} style={{ color }}/>
        )
    }
}

export default Icon
