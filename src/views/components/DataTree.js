import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Tree } from 'antd'

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
                icon={<i className={`iconfont ${val.iconName}`} />}
                title={val.name}
            >
                {son}
            </TreeNode>
        )
    };

    treeNodeOnClick = (keys, e) => {
        const { onChangeId } = this.props
        onChangeId(e.node.key)
    }

    render() {
        const { dataList, activeId } = this.props
        return (
            <Tree showIcon defaultExpandAll draggable
                  selectedKeys={[activeId]}
                  // onDragStart={()=>{                //开始拖拽的时候把hover—mask和抽屉去掉，十分low的行为，有机会改掉
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
                <TreeNode icon={<i className={'iconfont icondiv'}/>} title='总容器' key="0">
                    {dataList.map(val=>this.createNodes(val))}
                </TreeNode>
            </Tree>
        )
    }
}

function mapStateToProps(state) {
    const { activeId,  dataList } = state;
    return { activeId, dataList }
}

export default connect(mapStateToProps)(DataTree)
