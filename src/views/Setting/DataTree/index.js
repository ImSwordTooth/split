import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Tree, Input, message } from 'antd'
import Icon from '../../components/Icon'
import { changeActiveId, changeDataMap, changeEditId, dragData } from '../../../store/action'
import { getDataById, startChoose } from '../../utils/common'
import { StyledDataTree } from './styles'

const { TreeNode } = Tree

class DataTree extends PureComponent {

    state = {
        expandedKeys: ['0'],
        isVisible: false
    }
    
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.activeId !== this.props.activeId) {
            this.updateExpandedkeys()
        }
    }

    getClassName = (id) => {
        const { activeId, editId, parentId } = this.props
        let str = ''
        if (activeId === id) {
            str += 'ant-tree-node-selected '
        }
        if (editId === id) {
            str += 'edit '
        }
        if (parentId === id) {
            str += 'parent '
        }
        return str
    }

    createNodes = (val) => {
        const { editId } = this.props

        let son = null;
        if (val.children){
            son = [...val.children.map(val => this.createNodes(val))];
        }
        return (
            <TreeNode
                key={val.id}
                className={this.getClassName(val.id)}
                icon={<Icon icon="div" color={val.color}/>}
                title={
                    editId === val.id
                        ? 
                            <span>
                                <Input autoFocus value={val.name} style={{ width: '120px' }} size="small" onChange={this.changeName} onFocus={this.selectAll} onPressEnter={this.handleEnter}/>
                            </span>
                        : val.name
                }
            >
                {son}
            </TreeNode>
        )
    };

    changeName = (e) => {
        const { value } = e.target
        const { editId, dataMap } = this.props
        const newDataMap = {...dataMap}
        const data = getDataById(editId, newDataMap)
        data.name = value
        changeDataMap(newDataMap)
    }

    handleEnter = (e) => {
        this.changeName(e)
        changeEditId('')
    }

    cancelEdit = () => {
        changeEditId('')
        document.removeEventListener('mousedown', this.cancelEdit)
    }

    selectAll = (e) => {
        e.currentTarget.select()
        document.addEventListener('mousedown', this.cancelEdit)
    }

    treeNodeOnClick = (keys, e) => {
        changeActiveId(e.node.key)
        changeEditId('')
        startChoose()
    }

    treeNodeOnDoubleClick = (e, treeNode) => {
        const id = treeNode.key
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

    treeNodeonRightClick = (e) => {
        // const { activeId, dataMap } = this.props
        // const { app } = window
        // const graphics = app.stage.children.find(a => a.name === e.node.key)
        // graphics.clear()
        // graphics.lineStyle(2, 0xff0000, .85)
        // graphics.beginFill(0x1099bb, 0.1)
        // const data = getDataById(activeId, dataMap)
        // graphics.drawRect(
        //     0,
        //     0,
        //     data.width,
        //     data.height
        // )
        // graphics.endFill()
        // updateLineStyle(graphics, 2, 0xff0000, 1)
    }

    render() {
        const { dataMap, activeId } = this.props
        const { expandedKeys } = this.state
        return (
            <StyledDataTree>
                <Tree showIcon
                      draggable
                      allowDrop={() => true}
                      selectedKeys={[activeId]}
                      expandedKeys={expandedKeys}
                      onRightClick={this.treeNodeonRightClick}
                      onExpand={this.handleExpand}
                      onDoubleClick={this.treeNodeOnDoubleClick}
                      onSelect={this.treeNodeOnClick}
                      onDrop={this.drop}
                >
                    {
                        dataMap && dataMap.children &&
                        <TreeNode icon={<Icon icon="all" />} title='总容器' key="0">
                            {dataMap.children.map(val=>this.createNodes(val))}
                        </TreeNode>
                    }
                </Tree>
            </StyledDataTree>
        )
    }
}

function mapStateToProps(state) {
    const { activeId, editId, parentId, dataMap } = state;
    return { activeId, editId, parentId, dataMap }
}

export default connect(mapStateToProps)(DataTree)
