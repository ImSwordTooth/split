import React, { PureComponent } from 'react'
import { StyledComponent } from './styles'
import { Select, Input, Button } from 'antd'

const { Option } = Select

const TEST_LIST = [
    {
        key: 'width',
        type: 'number',
        customType: ''
    },
    {
        key: 'onChange',
        type: 'func',
        customType: ''
    },
    {
        key: 'isTop',
        customType: 'PropTypes.oneOf([true, false])'
    },
    {
        key: 'max',
        type: 'number',
        customType: ''
    },
    {
        key: 'min',
        customType: 'PropTypes.oneOfType([PropTypes.number, PropTypes.string])'
    }
]

class Component extends PureComponent {

    state = {
        propsList: TEST_LIST,
        editingKey: null, // 正在编辑的key，包含 index 和 value
        editingValue: null, // 正在编辑的value，包含 index 和 value
    }

    editKey = (e) => {
        const { index, value } = e.currentTarget.dataset
        this.setState({
            editingKey: {
                index: +index,
                value
            }
        })
    }

    editValue = (e) => {
        const { index, value } = e.currentTarget.dataset
        this.setState({
            editingValue: {
                index: +index,
                value
            }
        })
    }

    changeKey = (e) => {
        const { propsList, editingKey } = this.state
        const newList = [...propsList]
        const { value } = e.target
        newList[editingKey.index].key = value
        this.setState({
            propsList: newList
        })
    }

    changeValue = (e) => {
        const { propsList, editingValue } = this.state
        const newList = [...propsList]
        const { value } = e.target
        newList[editingValue.index].customType = value
        this.setState({
            propsList: newList
        })
    }

    deleteKey = (e, index) => {
        const { propsList } = this.state
        let dataIndex
        if (index) {
            dataIndex = index
        } else {
            dataIndex = +e.target.dataset.index
        }
        const newList = [...propsList]
        newList.splice(dataIndex, 1)
        this.setState({
            propsList: newList
        })
    }

    editType = (index, type) => {
        const { propsList } = this.state
        const newList = [...propsList]
        newList[index].type = type
        this.setState({
            propsList: newList
        })
    }

    handleEnter = (e) => {
        this.editKey(e)
        this.setState({
            editingKey: null
        })
    }

    selectAll = (e) => {
        e.currentTarget.select()
        document.addEventListener('mousedown', this.cancelEdit)
    }

    cancelEdit = (e) => {
        const { propsList, editingKey, editingValue } = this.state
        if (editingKey) {
            if (e.target.id === 'editComponentPropKey') {
                return
            }
            if (!propsList[editingKey.index].key) {
                this.deleteKey(null, editingKey.index)
            }
            this.setState({
                editingKey: null
            })
        }
        if (editingValue) {
            if (e.target.id === 'editComponentPropValue') {
                return
            }
            this.setState({
                editingValue: null
            })
        }

        document.removeEventListener('mousedown', this.cancelEdit)
    }

    add = (e) => {
        const { type } = e.currentTarget.dataset
        const { propsList } = this.state
        const newList = [...propsList]
        if (type === 'normal') {
            newList.push({
                key: '',
                type: 'any'
            })
        } else {
            newList.push({
                key: '',
                customType: 'PropTypes.any'
            })
        }
        this.setState({
            propsList: newList,
            editingKey: {
                index: newList.length - 1,
                value: ''
            }
        })
    }

    render() {
        const { propsList, editingKey, editingValue } = this.state
        return (
            <StyledComponent>
                <div className="propsList">
                    {
                        propsList.map((item, index) => {
                            return (
                                <div className="props" key={index}>
                                    <span className="delete" data-index={index} onClick={this.deleteKey}>-</span>
                                    {
                                        editingKey && editingKey.index === index
                                            ? <Input size="small" id="editComponentPropKey" autoFocus defaultValue={editingKey.value} style={{ width: '100px' }} onChange={this.changeKey} onFocus={this.selectAll} onPressEnter={this.handleEnter}/>
                                            : <span className="key" data-index={index} data-value={item.key} onClick={this.editKey}>{item.key}</span>
                                    }
                                    <span className="colon decoration">:</span>
                                    {
                                        item.type
                                            ?
                                                <span className={`type ${item.customType ? 'custom' : ''}`}>
                                                    <span className="decoration">PropTypes.</span>
                                                    <Select value={item.type} size="small" style={{ width: '90px' }} onChange={(value) => this.editType(index, value)}>
                                                        <Option value="string">string</Option>
                                                        <Option value="number">number</Option>
                                                        <Option value="bool">bool</Option>
                                                        <Option value="func">func</Option>
                                                        <Option value="object">object</Option>
                                                        <Option value="array">array</Option>
                                                        <Option value="element">element</Option>
                                                        <Option value="any">any</Option>
                                                    </Select>
                                                </span>
                                            :
                                            (
                                                editingValue && editingValue.index === index
                                                    ? <Input.TextArea size="small" id="editComponentPropValue" style={{ fontSize: '12px' }} autoFocus cols={2} defaultValue={editingValue.value} onChange={this.changeValue} onFocus={this.selectAll} onPressEnter={this.handleEnter}/>
                                                    : <span className="customType" data-index={index} data-value={item.customType} onClick={this.editValue}>{item.customType}</span>
                                            )
                                    }
                                </div>
                            )
                        })
                    }
                </div>
                <div className="addBtns">
                    <span>添加 propTypes：</span>
                    <Button type="primary" size="small" data-type="normal" onClick={this.add}>基础</Button>
                    <Button type="primary" size="small" ghost data-type="custom" onClick={this.add}>自定义</Button>
                </div>
            </StyledComponent>
        )
    }
}

export default Component
