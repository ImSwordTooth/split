import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {TreeSelect} from "antd";

class SelectNodeFromTree extends PureComponent {

    static propTypes = {
        height: PropTypes.number, // TreeSelect 的高度
        disabledId: PropTypes.string // 不可选的节点的 id
    }

    transferData = () => {
        const { dataMap, disabledId } = this.props
        let res = {}

        const transfer = (obj, to) => {
            to = to || { }
            console.log(obj)
            console.log(to)
            to.value = obj.id
            to.title = obj.name
            to.disabled = disabledId === obj.id
            to.children = []
            to.children = obj.children ? obj.children.forEach((o, index) => transfer(o, to.children[index])) : []
        }

        transfer(dataMap, res)
        console.log(res)
        return res
    }

    render() {
        const { height, dataMap } = this.props

        return (
            <TreeSelect
                multiple={false}
                showSearch
                style={{ width: '100%' }}
                listHeight={height}
                placeholder={"选择节点"}
                allowClear
                treeDefaultExpandAll
                fieldNames={{
                    label: 'name',
                    value: 'id',
                    children: 'children'
                }}
                treeData={[dataMap]}
            />
        )
    }

}

function mapStateToProps(state) {
    const { mode, scale, activeId, dataMap } = state;
    return { mode, scale, activeId, dataMap }
}

export default connect(mapStateToProps)(SelectNodeFromTree)
