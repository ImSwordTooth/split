import React, { PureComponent } from 'react'
import { message } from 'antd'
import Icon from '../Icon'
import { StyledCopy } from './styles'

class Copy extends PureComponent {

    copy = () => {
        const tag = document.createElement('input')
        tag.value = this.props.children.toString()
        document.body.appendChild(tag)
        tag.select()
        document.execCommand('copy')
        document.body.removeChild(tag)
        message.success('复制成功')
    }

    render() {
        const { children } = this.props
        return (
            <StyledCopy onClick={this.copy}>
                {children}
                <Icon icon="copy" color="#1890ff" style={{ fontSize: '12px', marginLeft: '2px' }}/>
            </StyledCopy>
        )
    }
}

export default Copy
