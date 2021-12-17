import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { Popover } from 'antd'
import { StyledPreComponent } from './styles'

class PreComponent extends PureComponent {

    static propTypes = {
        type: PropTypes.oneOf(['pc', 'mobile']), // 预设组件的类型
        name: PropTypes.string, // 预设组件名称
        desc: PropTypes.string, // 预设组件描述
        img: PropTypes.string, // 预设组件的缩略图
        moreUrl: PropTypes.string, // 点击缩略图时跳转的地址
        isActive: PropTypes.bool, // 该组件是否已被选中
        onChange: PropTypes.func // 更新函数
    }

    handleClick = () => {
        const { type, name, isActive, onChange } = this.props
        onChange(type, name, isActive)
    }

    jumpToMore = (e) => {
        const { url } = e.currentTarget.dataset
        window.open(url)
    }

    render() {
        const { type, name, desc, img, moreUrl, isActive } = this.props
        return (
            <StyledPreComponent>
                <Popover
                    placement="left"
                    align={{ offset: [0, 0] }}
                    autoAdjustOverflow
                    getPopupContainer={trigger => trigger.parentElement}
                    content={
                        <img className={type} data-url={moreUrl} alt={name} src={img} onClick={this.jumpToMore}/>
                    }>
                    <div className={`preWp ${isActive ? 'active' : ''}`} onClick={this.handleClick}>
                        <span className="name">{name}</span>
                        <span className="desc">{desc}</span>
                    </div>
                </Popover>
            </StyledPreComponent>
        )
    }
}

export default PreComponent
