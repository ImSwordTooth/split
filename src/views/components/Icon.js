import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'

class Icon extends PureComponent {

    static propTypes = {
        icon: PropTypes.string
    }

    render() {
        const { icon } = this.props
        return (
            <i className={`iconfont icon-${icon}`}/>
        )
    }
}

export default Icon
