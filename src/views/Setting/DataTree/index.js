import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Tree, Input, message, Tooltip } from 'antd'
import Icon from '../../components/Icon'
import { changeActiveId, changeDataMap, changeEditId, dragData } from '@action'
import { getDataById, startChoose } from '../../utils/common'
import { preComponentList } from '../Property/Component/PRE'
import { StyledDataTree } from './styles'

class DataTree extends PureComponent {

    state = {
        expandedKeys: ['0'],
        localEditId: '',
        isVisible: false,
        isShowTreeIcon: true,
        isAutoFocus: true,
        isShowText: true
    }
    
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.activeId !== this.props.activeId) {
            this.updateExpandedkeys()
        }
    }

    getClassName = (id) => {
        const { activeId, editId, parentId } = this.props
        const { isAutoFocus } = this.state
        let str = ''
        if (activeId === id) {
            str += 'ant-tree-node-selected'
        }
        if (isAutoFocus && editId === id) {
            str += ' edit'
        }
        if (parentId === id) {
            str += ' parent'
        }
        return str
    }

    changeName = (e) => {
        const { value } = e.target
        const { editId, dataMap } = this.props
        const newDataMap = {...dataMap}
        const data = getDataById(editId, newDataMap)
        data.name = value
        const graphic = window.app.stage.children.find(a => a.name === editId)
        if (graphic) {
            const text = graphic.children.find(a => a.name === 'text')
            text.text = value
        }
        changeDataMap(newDataMap)
    }

    handleEnter = (e) => {
        this.changeName(e)
        this.setState({
            localEditId: ''
        })
        changeEditId('')
    }

    cancelEdit = (e) => {
        if (e.target.id === 'treeNodeInput') {
            return
        }
        this.setState({
            localEditId: ''
        })
        changeEditId('')
        document.removeEventListener('mousedown', this.cancelEdit)
    }

    selectAll = (e) => {
        e.currentTarget.select()
        document.addEventListener('mousedown', this.cancelEdit)
    }

    treeNodeOnClick = (keys, e) => {
        const { editId } = this.props
        if (editId === e.node.key) {
            return
        }
        changeActiveId(e.node.key)
        this.setState({
            localEditId: ''
        })
        changeEditId('')
        startChoose()
    }

    treeNodeOnDoubleClick = (e, treeNode) => {
        const id = treeNode.key
        this.setState({
            localEditId: id
        })
        changeActiveId(id)
        changeEditId(id)
    }

    handleExpand = (e) => {
        this.setState({
            expandedKeys: e
        })
    }

    updateExpandedkeys = () => {
        const { activeId } = this.props
        const { expandedKeys } = this.state
        const splited = activeId.split('_')
        const keys = [splited[0]]
        splited.reduce((a, b) => {
            const k = a+'_'+b
            keys.push(k)
            return k
        })
        const newKeys = [...expandedKeys]
        keys.forEach(k => {
            if (!newKeys.includes(k)) {
                newKeys.push(k)
            }
        })
        this.setState({
            expandedKeys: newKeys
        })
    }

    drop = (e) => {
        if(e.node.props.eventKey === '0' && !e.node.props.dragOver){
            message.error('根元素只能为一个');
        }else {
            dragData({
                dropOver: e.node.props.dragOver, // 是否拖拽到目标内部
                originKey: e.dragNodesKeys, // 被拖拽的对象的key的列表（最后一位是当前对象）
                targetKey: e.node.props.eventKey, // 拖拽目标key
                dropPosition: e.node.props.dragOverGapTop ? 'top':'bottom' // 拖拽位置,不是top就是bottom
            })
        }
    }

    toggleSetting = (e) => {
        const { setting } = e.currentTarget.dataset
        if (setting === 'isAutoFocus') {
            changeEditId('')
        }
        if (setting === 'isShowText') {
            const graphics = window.app.stage.children.filter(a => a.name !== 'bc' && a.name !=='point')
            let text = []
            for (let i of graphics) {
                text.push(i.children.find(a => a.name === 'text'))
            }
            for (let j of text) {
                j.visible = !this.state.isShowText
            }
        }
        this.setState({
            [setting]: !this.state[setting]
        })
    }

    getTreeData = (list) => {
        const { editId } = this.props
        const { isShowTreeIcon, isAutoFocus, localEditId } = this.state
        return list
            ?
                list.map(data => {
                    let iconName = 'div'
                    if (data.config && data.config.component) {
                        const { pc, mobile } = data.config.component.preComponent
                        if (pc.length + mobile.length > 1) {
                            iconName = 'div'
                        } else {
                            if (mobile.length > 0) {
                                iconName = preComponentList.mobile.find(a => a.name === mobile[0]).icon
                            }
                            if (pc.length > 0) {
                                iconName = preComponentList.pc.find(a => a.name === pc[0]).icon
                            }
                        }
                    }
                    return {
                        key: data.id,
                        className: this.getClassName(data.id),
                        icon: <Icon icon={iconName || 'div'} color={data.color}/>,
                        title:
                            <div className="treeTitle">
                                <span>
                                    {
                                        (isAutoFocus && editId === data.id) || localEditId === data.id
                                            ?
                                            <span>
                                                <Input autoFocus id="treeNodeInput" value={data.name} style={{ width: '120px' }} size="small" onChange={this.changeName} onFocus={this.selectAll} onPressEnter={this.handleEnter}/>
                                            </span>
                                            : data.name
                                    }
                                </span>
                                <span className="iconPart">
                                    {
                                        isShowTreeIcon && data.config && data.config.track && data.config.track.trackId &&
                                        <img style={{ width: '14px' }} src="https://x0.ifengimg.com/ucms/2021_51/04BF5ED7540F3BC2AE6D3AC19C0D10974FA606B5_size2_w50_h48.png" alt=""/>
                                    }
                                    {
                                        isShowTreeIcon && data.config && data.config.chip && data.config.chip.length > 0 &&
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

    render() {
        const { dataMap, activeId } = this.props
        const { expandedKeys, isShowTreeIcon, isAutoFocus, isShowText } = this.state
        const { cname } = dataMap
        return (
            <StyledDataTree>
                <div className="toolbar">
                    <Tooltip title="显示小图标">
                        <button data-setting="isShowTreeIcon" onClick={this.toggleSetting} className={`btn ${isShowTreeIcon ? 'active': ''}`}>
                            <Icon icon="treeIcon" style={{ fontSize: '18px' }} color="rgb(116 116 116)"/>
                        </button>
                    </Tooltip>
                    <Tooltip title="创建树节点时自动开启文本框修改名称">
                        <button data-setting="isAutoFocus" onClick={this.toggleSetting} className={`btn ${isAutoFocus ? 'active': ''}`}>
                            <Icon icon="treeAutoFocus" style={{ fontSize: '18px' }} color="rgb(116 116 116)"/>
                        </button>
                    </Tooltip>
                    <Tooltip title="是否在画布中显示文本">
                        <button data-setting="isShowText" onClick={this.toggleSetting} className={`btn ${isShowText ? 'active': ''}`}>
                            <Icon icon="text" color="rgb(116 116 116)"/>
                        </button>
                    </Tooltip>
                </div>
                <Tree showIcon
                      draggable
                      allowDrop={() => true}
                      selectedKeys={[activeId]}
                      expandedKeys={expandedKeys}
                      onExpand={this.handleExpand}
                      onDoubleClick={this.treeNodeOnDoubleClick}
                      onSelect={this.treeNodeOnClick}
                      onDrop={this.drop}
                      treeData={
                          [
                              {
                                  key: '0',
                                  icon: <Icon icon="all" />,
                                  className: this.getClassName('0'),
                                  title: cname,
                                  children: (dataMap && dataMap.children) ? this.getTreeData(dataMap.children) : []
                              }
                          ]
                      }
                />
            </StyledDataTree>
        )
    }
}

function mapStateToProps(state) {
    const { activeId, editId, parentId, dataMap } = state;
    return { activeId, editId, parentId, dataMap }
}

export default connect(mapStateToProps)(DataTree)
