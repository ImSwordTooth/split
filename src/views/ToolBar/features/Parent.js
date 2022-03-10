import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Tooltip } from 'antd'
import Icon from '../../components/Icon'
import { changeParentId } from '@action'

class Parent extends PureComponent {

    markParent = () => {
        const { activeId, parentId } = this.props
        if (activeId === parentId) {
            changeParentId('')
        } else {
            changeParentId(activeId)
        }
    }

    clearParent = (e) => {
        e.stopPropagation()
        changeParentId('')
    }

    render() {
        const { activeId, parentId } = this.props

        return (
            <Tooltip title={
                <div>
                    <span>指定为父容器</span>
                    <br/>
                    <span style={{ fontWeight: 'lighter' }}>新的组件将强制创建在该组件内，表现在树状图中为<span style={{ color: '#ffc864' }}>橙色边框</span></span>
                </div>
            }>
                <button className={`btn parent ${parentId && parentId === activeId ? 'active': ''}`} onClick={this.markParent}>
                    <Icon icon="parent"/>
                    {
                        parentId &&
                        <div className="clearParent" onClick={this.clearParent}>
                            <Icon icon="x"/>
                        </div>
                    }
                </button>
            </Tooltip>
        )
    }
}

function mapStateToProps(state) {
    const { activeId, parentId, dataMap } = state;
    return { activeId, parentId, dataMap }
}

export default connect(mapStateToProps)(Parent)
