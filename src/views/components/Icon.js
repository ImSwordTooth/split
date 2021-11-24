import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

class Icon extends PureComponent {

    static propTypes = {
        icon: PropTypes.string,
        color: PropTypes.string
    }

    render() {
        const { icon, color } = this.props
        return (
            <i className={`iconfont icon-${icon}`} style={{ color }}/>
        )
    }
}

export default Icon
