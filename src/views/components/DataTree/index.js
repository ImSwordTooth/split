import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Tree, Input } from 'antd'
import {changeActiveId, changeDataMap, changeEditId, changeMode} from "../../../store/action";
import Icon from "../Icon";
import { StyledDataTree } from './styles'
import {getDataById} from "../../utils/common";

const { TreeNode } = Tree

class DataTree extends PureComponent {

    state = {
        expandedKeys: ['0']
    }
    
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.activeId !== this.props.activeId) {
            this.updateExpandedkeys()
        }
    }

    getClassName = (id) => {
        const { activeId, editId } = this.props
        let str = ''
        if (activeId === id) {
            str += 'ant-tree-node-selected '
        }
        if (editId === id) {
            str += 'edit '
        }
        return str
    }

    createNodes = (val) => {
        const { activeId, editId } = this.props

        let son = null;
        if (val.children){
            son = [...val.children.map(val => this.createNodes(val))];
        }
        return (
            <TreeNode
                key={val.id}
                className={this.getClassName(val.id)}
                icon={<Icon icon="div" />}
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
        // TODO watch 一下
        changeMode('choose')
    }

    treeNodeOnRightClick = (e) => {
        const id = e.node.key
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


    render() {
        const { dataMap, activeId, editId } = this.props
        const { expandedKeys } = this.state
        return (
            <StyledDataTree>
                <Tree showIcon
                      draggable
                      selectedKeys={[activeId]}
                      expandedKeys={expandedKeys}
                    // onDragStart={()=>{
                    //     changeHoveredTag('');
                    //     changeDrawer(false)
                    // }}
                    // onDrop={(e)=>this.drop(e)}
                    // onSelect={(e)=>this.treeNodeonClick(e)}
                    // onMouseEnter={(e)=>{changeHoveredTag(e.node.props.eventKey)}}
                    // onMouseLeave={()=>{changeHoveredTag('')}}
                    // onRightClick={(e)=>this.treeNodeonRightClick(e)}
                      onExpand={this.handleExpand}
                      onRightClick={this.treeNodeOnRightClick}
                      onSelect={this.treeNodeOnClick}
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
    const { activeId, editId, dataMap } = state;
    return { activeId, editId, dataMap }
}

export default connect(mapStateToProps)(DataTree)
