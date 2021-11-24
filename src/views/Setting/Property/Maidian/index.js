import React, { PureComponent } from 'react'
import { Form, Input, Select, Radio } from 'antd'
import { connect } from 'react-redux'
import { changeDataMap } from '../../../../store/action'
import { getDataById } from '../../../utils/common'
import { StyledMaidian } from './styles'

const { Option } = Select

const PAGE_PARAMS = [
    {
        key: 'id',
        value: ''
    },
    {
        key: 'type',
        value: 'other'
    }
]

const ACTION_PARAMS = [
    {
        key: 'type',
        value: 'other'
    }
]

class Maidian extends PureComponent {
    state = {
        initConfig: {},
        editingId: '',
        paramsList: PAGE_PARAMS
    }

    formRef = React.createRef();

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
        const initConfig =
            data.config && data.config.maiDian
                ?
                    data.config.maiDian
                :
                    {
                        pageName: '',
                        isH5: false,
                        parameterType: 'page',
                        parameterDescription: ''
                    }

        this.setState({
            initConfig,
            paramsList: initConfig.parameter || PAGE_PARAMS
        }, () => {
            this.formRef.current.resetFields();
            const newDataMap = {...dataMap}
            const data = getDataById(activeId, newDataMap)
            data.config = {
                ...data.config,
                maiDian: {
                    ...initConfig,
                    parameter: initConfig.parameter || PAGE_PARAMS
                }
            }
            changeDataMap(newDataMap)
        })
    }

    handleFocus = (e)=>{
        const { editingId } = this.state;
        const { index,inputtype } = e.target.dataset;
        if (editingId !== inputtype + index + ''){
            this.setState({editingId: inputtype + index + ''})
        }
    };

    handleTabKey = (e)=>{
        const { editingId } = this.state;
        if (e.key === 'Tab'){
            if (/^key/.test(editingId)) {
                this.setState({
                    editingId:editingId.replace('key','value')
                })
            }else {
                this.setState({
                    editingId:'key'+(parseInt(/[0-9]+/.exec(editingId)[0])+1)
                })
            }
        }
    };

    handleTypeChange = (value) => {
        const initList = value === 'page' ? PAGE_PARAMS : ACTION_PARAMS
        this.setState({
            paramsList: initList
        })
        this.updateParams(initList)
    }

    handleParamsChange = (e) => {
        let { dataset:{ index, inputtype }, value} = e.target;
        index = +index
        const { paramsList } = this.state

        const newParamsList = [...paramsList];
        if (index === newParamsList.length){
            newParamsList.push({
                key:'',
                value:''
            })
        }
        newParamsList[index][inputtype] = value;
        this.setState({
            paramsList: newParamsList
        })
        this.updateParams(newParamsList)
    }

    deleteParams = (e) => {
        const { index } = e.target.dataset;
        const { paramsList } = this.state
        const newParamsList = [...paramsList]
        newParamsList.splice(+index, 1)
        this.setState({
            paramsList: newParamsList
        })
        this.updateParams(newParamsList)
    }

    handleFormChange = (changedValues, allValues) => {
        const { activeId, dataMap } = this.props
        const { paramsList } = this.state
        const newDataMap = {...dataMap}
        const data = getDataById(activeId, newDataMap)
        data.config = {
            ...data.config,
            maiDian: {
                ...allValues,
                parameter: paramsList
            }
        }
        changeDataMap(newDataMap)
    }

    updateParams = (paramsList) => {
        const { activeId, dataMap } = this.props
        const newDataMap = {...dataMap}
        const data = getDataById(activeId, newDataMap)
        data.config = {
            ...data.config,
            maiDian: {
                ...(data.config ? data.config.maiDian : {}),
                parameter: paramsList
            }
        }
        changeDataMap(newDataMap)
    }

    render() {
        const { editingId, paramsList, initConfig } = this.state
        return (
            <StyledMaidian>
                <Form ref={this.formRef} size="small" initialValues={{ ...initConfig }} onValuesChange={this.handleFormChange}>
                    <Form.Item label="页面名称" name="pageName">
                        <Input style={{ width: '160px', fontSize: '12px', padding: '2px 7px' }} />
                    </Form.Item>
                    <Form.Item
                        label="埋点位置"
                        name="isH5"
                    >
                        <Radio.Group>
                            <Radio value={false}>客户端</Radio>
                            <Radio value={true}>h5</Radio>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item label="埋点类型" name="parameterType">
                        <Select style={{ width: '120px' }} onChange={this.handleTypeChange}>
                            <Option value="page" style={{ fontSize: '12px', padding: '0 10px',minHeight: '28px', lineHeight: '28px' }}>page</Option>
                            <Option value="action" style={{ fontSize: '12px', padding: '0 10px',minHeight: '28px', lineHeight: '28px' }}>action</Option>
                        </Select>
                    </Form.Item>
                    <div style={{ fontSize: '12px' }}>埋点参数：</div>

                    <div className="params">
                        <table className={'customer_table'} border="1">
                            <tbody>
                                <tr>
                                    <th style={{ width:'32px',textAlign:'center' }}/>
                                    <th style={{ width:'30%' }}>key</th>
                                    <th>value</th>
                                </tr>
                                {
                                    paramsList.concat({key: '', value: ''}).map((p, i) => {
                                        return (
                                            <tr key={i}>
                                                {
                                                    i === paramsList.length ? <td/> : <td className="delete" data-index={i} onClick={this.deleteParams}>-</td>
                                                }
                                                <td className={editingId === `key${i}` ?'editing':''}>
                                                    <input value={p.key} data-index={i} data-inputtype={'key'} onFocus={this.handleFocus} onChange={this.handleParamsChange} onKeyDown={this.handleTabKey}/>
                                                </td>
                                                <td className={editingId === `value${i}` ?'editing':''}>
                                                    <input value={p.value} data-index={i} data-inputtype={'value'} onFocus={this.handleFocus} onChange={this.handleParamsChange} onKeyDown={this.handleTabKey}/>
                                                </td>
                                            </tr>
                                        )
                                    })
                                }
                            </tbody>
                        </table>
                    </div>

                    <Form.Item label="备注" name="parameterDescription">
                        <Input.TextArea style={{ fontSize: '12px' }}/>
                    </Form.Item>
                </Form>
            </StyledMaidian>
        )
    }
}

function mapStateToProps(state) {
    const { activeId, dataMap } = state;
    return { activeId, dataMap }
}

export default connect(mapStateToProps)(Maidian)
