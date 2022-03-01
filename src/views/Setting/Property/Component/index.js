import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Select, Input, Button, Tooltip, Collapse } from 'antd'
import Icon from '../../../components/Icon'
import PreComponent from './PreComponent'
import { preComponentList } from './PRE'
import { getDataById } from '../../../utils/common'
import { changeDataMap } from '@action'
import { StyledComponent } from './styles'

const { Option } = Select

class Component extends PureComponent {

    state = {
        propsList: [], // props 列表，【key】：props 的名称；【type】：仅用于普通props，值是PropTypes里的简单值；【customType】：仅用于自定义props，一个字符串
        preComponent: [], // 预设组件列表
        editingKey: null, // 正在编辑的key，包含 index 和 value
        editingValue: null, // 正在编辑的value，包含 index 和 value
    }

    componentDidMount() {
        this.update()
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.activeId !== this.props.activeId) {
            this.update()
        }
    }

    update = () => {
        const { activeId, dataMap } = this.props
        const data = getDataById(activeId, dataMap)
        const initComponentData =
            data.config && data.config.component
                ?
                data.config.component
                :
                {
                    props: [],
                    preComponent: []
                }

        this.setState({
            propsList: initComponentData.props,
            preComponent: initComponentData.preComponent
        }, () => {
            const newDataMap = {...dataMap}
            const data = getDataById(activeId, newDataMap)
            data.config = {
                ...data.config,
                component: {
                    ...initComponentData
                }
            }
            changeDataMap(newDataMap)
        })
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
        this.updatePropsToDataMap(newList)
    }

    changeValue = (e) => {
        const { propsList, editingValue } = this.state
        const newList = [...propsList]
        const { value } = e.target
        newList[editingValue.index].customType = value
        this.updatePropsToDataMap(newList)
    }

    deleteKey = (e, index) => {
        const { propsList } = this.state
        let dataIndex
        if (index !== undefined) {
            dataIndex = index
        } else {
            dataIndex = +e.target.dataset.index
        }
        const newList = [...propsList]
        newList.splice(dataIndex, 1)
        this.updatePropsToDataMap(newList)
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

    updatePropsToDataMap = (propsList = null, preComponent = null) => {
        const finalParam = {}
        if (propsList) {
            finalParam.props = propsList
            this.setState({
                propsList: propsList
            })
        }
        if (preComponent) {
            finalParam.preComponent = preComponent
            this.setState({
                preComponent: preComponent
            })
        }

        const { activeId, dataMap } = this.props
        const newDataMap = { ...dataMap }
        const data = getDataById(activeId, newDataMap)
        data.config = {
            ...data.config,
            component: {
                ...data.config.component,
                ...finalParam
            }
        }
        changeDataMap(newDataMap)
    }

    handlePreComponentChange = (type, name, isDelete) => {
        console.log(type, name, isDelete)
        const { preComponent } = this.state
        const newPre = [ ...preComponent]
        if (isDelete) {
            const index = newPre.findIndex(a => a.type === type && a.name === name)
            newPre.splice(index, 1)
        } else {
            newPre.push({ name, type })
        }
        this.updatePropsToDataMap(undefined, newPre)
    }

    render() {
        const { propsList, editingKey, editingValue, preComponent } = this.state
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
                                            : <span className="propKey" data-index={index} data-value={item.key} onClick={this.editKey}>{item.key}</span>
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
                                    {index < propsList.length - 1 && <span className="decoration" style={{ marginLeft: '4px' }}>,</span>}
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
                <div className="pre">
                    <span className="preTitle">
                        <span>预设组件</span>
                        <Tooltip title="选择若干个组件，然后我们会在文件中把它们引入并初始化">
                            <span className="icon">
                                <Icon icon="help" color="#787878" style={{ fontSize: '16px' }}/>
                            </span>
                        </Tooltip>
                    </span>

                    <Collapse defaultActiveKey={['1', '2']} ghost style={{ fontSize:'12px' }}>
                        <Collapse.Panel
                            key="1"
                            header={
                                <div className="collapseTitle">
                                    <span>
                                        <Icon icon="pc" style={{ fontSize: '14px', marginRight: '4px' }}/>PC端
                                    </span>
                                    {
                                        preComponent.filter(p => p.type === 'pc').length > 0 &&
                                        <span>已选择<strong>{preComponent.filter(p => p.type === 'pc').length}</strong>个</span>
                                    }
                                </div>
                            }>
                            <div>
                                {
                                    preComponentList.pc.map((c, index) => {
                                        return <PreComponent
                                                    isActive={preComponent && Boolean(preComponent.filter(p => p.type === 'pc').find(a => a.name === c.name))}
                                                    type="pc"
                                                    key={index}
                                                    name={c.name}
                                                    desc={c.desc}
                                                    img={c.img}
                                                    moreUrl={c.moreUrl}
                                                    onChange={this.handlePreComponentChange}/>
                                    })
                                }
                            </div>
                        </Collapse.Panel>
                        <Collapse.Panel
                            key="2"
                            header={
                                <div className="collapseTitle">
                                    <span>
                                        <Icon icon="mobile" style={{ fontSize: '14px', marginRight: '4px' }}/>移动端
                                    </span>
                                    {
                                        preComponent.filter(p => p.type === 'mobile').length > 0 &&
                                        <span>已选择<strong>{preComponent.filter(p => p.type === 'mobile').length}</strong>个</span>
                                    }
                                </div>
                            }>
                            <div>
                                {
                                    preComponentList.mobile.map((c, index) => {
                                        return <PreComponent
                                                    isActive={preComponent && Boolean(preComponent.filter(p => p.type === 'mobile').find(a => a.name === c.name))}
                                                    type="mobile"
                                                    key={index}
                                                    name={c.name}
                                                    desc={c.desc}
                                                    img={c.img}
                                                    moreUrl={c.moreUrl}
                                                    onChange={this.handlePreComponentChange}/>
                                    })
                                }
                            </div>
                        </Collapse.Panel>
                    </Collapse>
                </div>
            </StyledComponent>
        )
    }
}

function mapStateToProps(state) {
    const { activeId, dataMap } = state;
    return { activeId, dataMap }
}

export default connect(mapStateToProps)(Component)
