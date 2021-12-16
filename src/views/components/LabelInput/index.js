import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import { Input } from 'antd'
import { StyledLabelInput } from './styles'

class LabelInput extends PureComponent {

    static propTypes = {
        style: PropTypes.object, // 文本的样式
        inputStyle: PropTypes.object, // 文本框的样式
        size: PropTypes.oneOf(['small', 'normal', 'large']), // antd的文本框的size
        onChange: PropTypes.func // 更新函数
    }

    state = {
        isEditing: false
    }

    inputRef = React.createRef()

    startEdit = () => {
        this.setState({
            isEditing: true
        })
        setTimeout(() => {
            document.addEventListener('click', this.cancelEdit)
        })
    }

    cancelEdit = (e) => {
        const { onChange } = this.props
        if (this.inputRef.current && !this.inputRef.current.input.contains(e.target)) {
            if (onChange) {
                onChange(this.inputRef.current.input.value)
            }
            this.setState({ isEditing: false })
            document.removeEventListener('click', this.cancelEdit)
        }
    }

    render() {
        const { children, style, size, inputStyle } = this.props
        const { isEditing } = this.state

        return isEditing
            ?
                <Input
                    ref={this.inputRef}
                    size={size}
                    autoFocus
                    defaultValue={children}
                    style={inputStyle}/>
            :
                <StyledLabelInput style={style} onClick={this.startEdit}>
                    {children}
                    <img src="https://x0.ifengimg.com/ucms/2021_51/CBFEA224AAA021F13FB679CC0AA31703DAF88B56_size1_w48_h48.png" alt=""/>
                </StyledLabelInput>
    }
}

export default LabelInput
