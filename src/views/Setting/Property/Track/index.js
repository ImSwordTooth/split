import React, { PureComponent } from 'react'
import { Form, Input, Select, Radio, Button, Popover, message, Spin } from 'antd'
import { connect } from 'react-redux'
import axios from 'axios'
import { changeDataMap, changeTrackProjectId } from '@action'
import { getDataById } from '../../../utils/common'
import { StyledTrack } from './styles'

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

let updateTimer = null

class Track extends PureComponent {
    state = {
        initConfig: {}, // 表单的初始值，不管是新建的还是从已有的读的，都放在这里
        editingId: '', // 正在编辑的格子，用于参数表格
        paramsList: [], // 参数表格的参数
        isUpdating: false, // 表示正在调接口的 loading
        updateRes: null // 调接口的结果
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
            data.config && data.config.track
                ?
                    data.config.track
                :
                    {
                        isH5: false,
                        parameterType: 'page',
                        parameterDescription: '',
                        trackId: ''
                    }

        this.setState({
            initConfig,
            paramsList: initConfig.parameter || [
                {
                    key: 'id',
                    value: ''
                },
                {
                    key: 'type',
                    value: 'other'
                }
            ]
        }, () => {
            this.formRef.current.resetFields();
            const newDataMap = {...dataMap}
            const data = getDataById(activeId, newDataMap)
            data.config = {
                ...data.config,
                track: {
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
            this.setState({
                editingId: inputtype + index + '',
            })
        }
        document.addEventListener('click', this.hideShadow)
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
        const { index } = e.target.dataset
        const { paramsList } = this.state
        const newParamsList = [...paramsList]
        newParamsList.splice(+index, 1)
        this.setState({
            paramsList: newParamsList,
            editingId: ''
        })
        this.updateParams(newParamsList)
    }

    handleFormChange = async (changedValues, allValues) => {
        const { activeId, dataMap } = this.props
        const { paramsList } = this.state
        const newDataMap = {...dataMap}
        const data = getDataById(activeId, newDataMap)
        data.config = {
            ...data.config,
            track: {
                ...data.config.track,
                ...allValues,
                parameter: paramsList
            }
        }
        changeDataMap(newDataMap)
        await this.updateTrack(data)
    }

    updateParams = (paramsList) => {
        const { activeId, dataMap } = this.props
        const newDataMap = {...dataMap}
        const data = getDataById(activeId, newDataMap)
        data.config = {
            ...data.config,
            track: {
                ...(data.config ? data.config.track : {}),
                parameter: paramsList
            }
        }
        changeDataMap(newDataMap)
        this.updateTrack(data)
    }

    hideShadow = (e) => {
        const table = document.getElementById('trackTable')
        if (!table.contains(e.target)) {
            this.setState({
                editingId: ''
            })
            document.removeEventListener('click', this.hideShadow)
        }
    }

    createTrack = async () => {
        const { activeId, dataMap, dataMap: { name, cname }, trackProjectId } = this.props
        if (!trackProjectId) {
            if (!name) {
                message.error('请先填写项目名称')
                return
            }
            const createItemRes = await axios.post('http://test0.platform.ifengidc.com/platform/server/trackApi/createProject', {
                projectName: name,
                projectNote: cname + '- from Split'
            })
            if (createItemRes.data.code === 0) {
                message.success('创建埋点项目成功')
                changeTrackProjectId(createItemRes.data.data.id)
            } else {
                message.error('创建项目失败')
                return
            }
        }
        const newDataMap = {...dataMap}
        const { paramsList, initConfig } = this.state
        const data = getDataById(activeId, newDataMap)
        const formData = this.formRef.current.getFieldsValue()
        const res = await axios.post('http://test0.platform.ifengidc.com/platform/server/trackApi/createTrackforProject', {
            ...formData,
            parameter: paramsList.map((p) => ({
                parameterIdentification: p.key,
                parameterValue: p.value
            })),
            pageName: data.name,
            projectId: this.props.trackProjectId // 拿实时数据
        })

        if (res.data.code === 0) {
            const { id, pageId, projectName } = res.data.data
            await axios.post('http://test0.platform.ifengidc.com/platform/server/trackApi/goOnlineForTrack', {
                id,
                isOnline: true,
                projectName,
                pageId
            })

            data.config = {
                ...data.config,
                track: {
                    ...(data.config ? data.config.track : {}),
                    trackId: id
                }
            }
            this.setState({
                initConfig: {
                    ...initConfig,
                    trackId: id
                }
            })
            changeDataMap(newDataMap)
            message.success('创建埋点成功')
        } else {
            message.error(res.data.data[0].message)
        }
    }

    deleteTrack = async () => {
        const { activeId, dataMap } = this.props
        const { initConfig } = this.state
        const newDataMap = {...dataMap}
        const data = getDataById(activeId, newDataMap)
        const res = await axios.post('http://test0.platform.ifengidc.com/platform/server/trackApi/deleteTrack', {
            id: initConfig.trackId
        })
        if (res.data.code === 0) {
            data.config = {
                ...data.config,
                track: {
                    ...(data.config ? data.config.track : {}),
                    trackId: ''
                }
            }
            this.setState({
                initConfig: {
                    ...initConfig,
                    trackId: ''
                }
            })
            changeDataMap(newDataMap)
            message.success('删除埋点成功')
        }
    }

    // 更新到埋点后台
    updateTrack = async (data) => {
        const { paramsList } = this.state
        const formData = this.formRef.current.getFieldsValue()
        if (data.config.track.trackId) {
            this.setState({
                isUpdating: true
            })
            const res = await axios.post('http://test0.platform.ifengidc.com/platform/server/trackApi/changeOneTrack', {
                ...formData,
                id: data.config.track.trackId,
                parameter: paramsList.map((p) => ({
                    parameterIdentification: p.key,
                    parameterValue: p.value
                })),
                pageName: data.name
            })
            if (res.data.code === 0) {
                this.setState({
                    updateRes: 1
                })
                if (updateTimer) {
                    clearTimeout(updateTimer)
                }
                updateTimer = setTimeout(() => {
                    this.setState({
                        updateRes: null
                    })
                }, 2000)
            } else {
                if (updateTimer) {
                    clearTimeout(updateTimer)
                }
                this.setState({
                    updateRes: res.data.data[0].message
                })
            }
            this.setState({
                isUpdating: false
            })
        }
    }

    render() {
        const { editingId, paramsList, initConfig, isUpdating, updateRes } = this.state
        const { trackProjectId, dataMap } = this.props
        const { name } = dataMap
        return (
            <StyledTrack>
                <Form ref={this.formRef} size="small" initialValues={{ ...initConfig }} onValuesChange={this.handleFormChange}>
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
                            <Option value="page">page</Option>
                            <Option value="action">action</Option>
                        </Select>
                    </Form.Item>
                    <div style={{ fontSize: '12px', height: '24px', lineHeight: '24px' }}>埋点参数：</div>

                    <div className="params">
                        <table className={'customer_table'} border="1" id="trackTable">
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
                        <Input.TextArea placeholder="可选" style={{ fontSize: '12px' }}/>
                    </Form.Item>
                </Form>
                <div className="btnBox">
                    {
                        trackProjectId
                            ?
                                (initConfig.trackId
                                    ? <Button type="danger" size="small" onClick={this.deleteTrack}>删除埋点</Button>
                                    : <Button type="primary" size="small" onClick={this.createTrack}>创建埋点</Button>)
                            :
                                <Popover placement="left" content={<span style={{ fontSize: '12px' }}>首次创建埋点，会先使用项目名称 <strong>{name}</strong> 来创建埋点项目</span>}>
                                    <Button type="primary" size="small" onClick={this.createTrack}>创建埋点</Button>
                                </Popover>
                    }
                </div>
                <div className="spinning">
                    <Spin size="small" spinning={isUpdating} />
                    {
                        updateRes &&
                        (
                            typeof updateRes === 'string'
                                ?
                                    <Popover
                                        placement="left"
                                        content={
                                            <span style={{ fontSize: '12px' }}>
                                                <span>更新失败：</span>
                                                <br/>
                                                <span>{updateRes}</span>
                                            </span>
                                        }>
                                        <span className="error">Error</span>
                                    </Popover>
                                : <span className="success">已更新</span>
                        )
                    }
                </div>
            </StyledTrack>
        )
    }
}

function mapStateToProps(state) {
    const { trackProjectId, activeId, dataMap } = state;
    return { trackProjectId, activeId, dataMap }
}

export default connect(mapStateToProps)(Track)
