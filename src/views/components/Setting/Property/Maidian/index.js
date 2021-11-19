import React, {PureComponent} from 'react'
import {Form, Switch} from 'antd'
import { StyledMaidian } from './styles'

class Maidian extends PureComponent {
    render() {
        return (
            <StyledMaidian>
                    <div className="item">
                        <span>是否启用埋点</span>
                        <Switch size="small" />
                    </div>
            </StyledMaidian>
        )
    }
}

export default Maidian
