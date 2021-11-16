import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Tree } from 'antd'
import {changeActiveId} from "../../store/action";
import Icon from "./Icon";

const { TreeNode } = Tree

class DataTree extends PureComponent {

    createNodes = (val) => {
        const { activeId } = this.props

        let son = null;
        if (val.children){
            son = [...val.children.map(val => this.createNodes(val))];
        }
        return (
            <TreeNode
                key={val.id}
                className={activeId === val.id ? 'ant-tree-node-selected' : ''}
                icon={<Icon icon="div" />}
                title={val.name}
            >
                {son}
            </TreeNode>
        )
    };

    treeNodeOnClick = (keys, e) => {
        changeActiveId(e.node.key)
    }

    render() {
        const { dataMap, activeId } = this.props
        return (
            <Tree showIcon
                  draggable
                  defaultExpandAll
                  selectedKeys={[activeId]}
                  // onDragStart={()=>{
                  //     changeHoveredTag('');
                  //     changeDrawer(false)
                  // }}
                  // onDrop={(e)=>this.drop(e)}
                  // onSelect={(e)=>this.treeNodeonClick(e)}
                  // onMouseEnter={(e)=>{changeHoveredTag(e.node.props.eventKey)}}
                  // onMouseLeave={()=>{changeHoveredTag('')}}
                  // onRightClick={(e)=>this.treeNodeonRightClick(e)}
                  onSelect={this.treeNodeOnClick}
            >
                {
                    dataMap && dataMap.children &&
                    <TreeNode icon={<Icon icon="all" />} title='总容器' key="0">
                        {dataMap.children.map(val=>this.createNodes(val))}
                    </TreeNode>
                }
            </Tree>
        )
    }
}

function mapStateToProps(state) {
    const { activeId, dataMap } = state;
    return { activeId, dataMap }
}

export default connect(mapStateToProps)(DataTree)
