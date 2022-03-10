import React, { PureComponent } from 'react'
import { Popover } from 'antd'
import Icon from '../../components/Icon'

class Help extends PureComponent {
    render() {
        return (
            <Popover content={
                <div style={{ fontSize: '12px' }}>
                    <ul style={{paddingBottom: 0, paddingLeft: '14px', margin: 0}}>
                        <li>空格 + 鼠标拖拽移动画布</li>
                        <li>command + 滚轮放大缩小</li>
                        <li>delete 删除图形</li>
                        <li>移动图形时按住 command 可单独移动</li>
                        <li>双击树节点编辑名称</li>
                    </ul>
                </div>
            }>
                <button className="btn help"><Icon icon="tip"/></button>
            </Popover>
        )
    }
}

export default Help
