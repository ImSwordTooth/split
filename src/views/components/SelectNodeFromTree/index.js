import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { TreeSelect } from 'antd'
import Icon from '../Icon'
import { preComponentList } from '../../Setting/Property/Component/PRE'
import { StyledSelectNodeFromTree } from './styles'

class SelectNodeFromTree extends PureComponent {

    static propTypes = {
        value: PropTypes.string, // 初始节点id
        height: PropTypes.number, // TreeSelect 的高度
        disabledId: PropTypes.string, // 不可选的节点的 id
        onChange: PropTypes.func // 点击之后的回调
    }

    getTreeData = (list) => {
        const { disabledId } = this.props

        return list
            ?
            list.map(data => {
                let iconName = 'div'
                if (data.config && data.config.component) {
                    const { preComponent } = data.config.component
                    const pc = preComponent.filter(p => p.type === 'pc')
                    const mobile = preComponent.filter(p => p.type === 'mobile')
                    if (pc.length + mobile.length > 1) {
                        iconName = 'div'
                    } else {
                        if (mobile.length > 0) {
                            iconName = preComponentList.mobile.find(a => a.name === mobile[0].name).icon
                        }
                        if (pc.length > 0) {
                            iconName = preComponentList.pc.find(a => a.name === pc[0].name).icon
                        }
                    }
                }
                return {
                    value: data.id,
                    icon: <Icon icon={iconName || 'div'} color={data.color}/>,
                    className: 'treeTitle',
                    disabled: disabledId === data.id,
                    title:
                        <div className="treeTitle">
                            <span>{data.name}</span>
                            <span className="iconPart">
                                {
                                    data.config && data.config.track && data.config.track.trackId &&
                                    <img style={{ width: '14px' }} src="https://x0.ifengimg.com/ucms/2021_51/04BF5ED7540F3BC2AE6D3AC19C0D10974FA606B5_size2_w50_h48.png" alt=""/>
                                }
                                {
                                    data.config && data.config.chip && data.config.chip.length > 0 &&
                                    <span className="chipIcon">
                                        <img src="https://x0.ifengimg.com/ucms/2021_51/CD0B86062ED829ECCAF0B9635F42E3A629DBF2AE_size2_w48_h48.png" alt=""/>
                                        <span>{data.config.chip.length}</span>
                                    </span>
                                }
                            </span>
                        </div>
                    ,
                    children: this.getTreeData(data.children)
                }
            })
            : []
    }

    handleChange = (e) => {
        const { onChange } = this.props
        onChange(e)
    }

    render() {
        const { value, height, dataMap } = this.props

        return (
            <StyledSelectNodeFromTree>
                <TreeSelect
                    multiple={false}
                    showSearch
                    treeIcon
                    style={{ width: '100%' }}
                    listHeight={height}
                    placeholder={"选择节点"}
                    allowClear
                    treeDefaultExpandAll
                    onChange={this.handleChange}
                    value={value}
                    treeData={
                        [
                            {
                                value: '0',
                                icon: <Icon icon="all" />,
                                className: 'treeTitle',
                                title: dataMap.name,
                                children: (dataMap && dataMap.children) ? this.getTreeData(dataMap.children) : []
                            }
                        ]
                    }
                />
            </StyledSelectNodeFromTree>
        )
    }
}

function mapStateToProps(state) {
    const { dataMap } = state;
    return { dataMap }
}

export default connect(mapStateToProps)(SelectNodeFromTree)
