import React, { PureComponent } from 'react'
import { Button, message, Popover, Select } from 'antd'
import { connect } from 'react-redux'
import axios from 'axios'
import ChipParams from './ChipParams'
import { getDataById, md5 } from '../../../utils/common'
import { changeDataMap } from '../../../../store/action'
import { StyledChipParams } from './styles'

const { Option } = Select
const CREATE_CHIP_URL = {
    static: 'https://test0.ucms.ifeng.com/api/ns/addStaticFragment',
    recommend: 'https://test0.ucms.ifeng.com/api/ns/addRecommendFragment'
}
const NEED_NOT_CREATE = ['struct']

class Chip extends PureComponent {

    state = {
        chipId: '',
        chipType: '',
        chipData: {}
    }

    componentDidMount() {
        this.initAndUpdate()
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.activeId !== this.props.activeId) {
            this.initAndUpdate()
        }
    }

    initAndUpdate = () => {
        const { activeId, dataMap } = this.props
        const data = getDataById(activeId, dataMap)
        const initChipData =
            data.config && data.config.chip
                ?
                data.config.chip
                :
                {
                    chipId: '',
                    chipType: '',
                    chipData: {}
                }

        this.setState({
            chipId: initChipData.chipId,
            chipType: initChipData.chipType,
            chipData: initChipData.chipData
        }, () => {
            const newDataMap = {...dataMap}
            const data = getDataById(activeId, newDataMap)
            data.config = {
                ...data.config,
                chip: {
                    ...initChipData
                }
            }
            changeDataMap(newDataMap)
        })
    }

    handleChipTypeChange = value => {
        this.updateChip(value, {})
    }

    changeChipData = (newChipData) => {
        const { activeId, dataMap } = this.props
        const newDataMap = {...dataMap}
        const data = getDataById(activeId, newDataMap)
        data.config = {
            ...data.config,
            chip: {
                ...data.config.chip,
                chipData: newChipData
            }
        }
        this.updateChip(undefined, newChipData)
    }

    getSignature = params => {
        let arr = [];
        for (const key of Object.keys(params).sort()) {
            if (!params[key]) {
                continue;
            }
            if (key === 'signature') {
                continue;
            }
            if (typeof params[key] == 'object') {
                arr.push(`${key}=${JSON.stringify(params[key])}`);
            } else {
                arr.push(`${key}=${params[key]}`);
            }
        }
        arr.push('Ifeng888');
        return md5(arr.join('&')).toUpperCase();
    };

    createTrack = async (data) => {
        const { channel, cname, activeId, dataMap } = this.props
        const { chipType, chipData } = this.state

        if (!channel.id) {
            message.warn('还没指定频道，创建失败')
            return
        }

        const { title } = chipData

        const params = {
            name: `${channel.name}-${cname}-${cname}-${title}`,
            channel: channel.id,
            channelName: channel.name,
            content: undefined,
        };
        params.signature = this.getSignature(params);

        const res = await axios.post(CREATE_CHIP_URL[chipType], params)
        if (res.data.code === 0) {
            const newDataMap = { ...dataMap }
            const data = getDataById(activeId, newDataMap)
            data.config = {
                ...data.config,
                chip: {
                    ...(data.chip ? data.config.chip : {}),
                    chipId: res.data.data,
                    chipType,
                    chipData
                }
            }
            this.setState({ chipId: res.data.data })
            changeDataMap(newDataMap)
            message.success('创建成功')
        } else {
            message.error('创建碎片失败')
        }
    }

    reset = () => {
        this.updateChip('', {} , '')
        message.success('清空成功')
    }

    updateChip = (chipType = undefined, chipData = undefined, chipId = undefined) => {
        const { activeId, dataMap } = this.props
        const newDataMap = {...dataMap}
        const data = getDataById(activeId, newDataMap)
        const finalParam = {}
        if (chipType !== undefined) {
            this.setState({ chipType })
            finalParam.chipType = chipType
        }
        if (chipData !== undefined) {
            this.setState({ chipData })
            finalParam.chipData = chipData
        }
        if (chipId !== undefined) {
            this.setState({ chipId })
            finalParam.chipId = chipId
        }
        data.config = {
            ...data.config,
            chip: {
                ...data.config.chip,
                ...finalParam
            }
        }
        changeDataMap(newDataMap)
    }

    render() {
        const { chipId, chipType, chipData } = this.state
        return (
            <StyledChipParams>
                <div className="chipType">
                    <span className="formProp">碎片类型 : </span>
                    <Select disabled={chipId} size="small" value={chipType} style={{ width: '120px' }} onChange={this.handleChipTypeChange}>
                        <Option value="">无碎片</Option>
                        <Option value="static">静态碎片</Option>
                        <Option value="recommend">推荐位碎片</Option>
                        <Option value="struct">结构化碎片</Option>
                    </Select>
                </div>
                <div>
                    {
                        chipType && <ChipParams type={chipType} data={chipData} onChange={this.changeChipData}/>
                    }
                </div>
                <div className="btnBox">
                    {
                        chipId
                            ?
                                <Popover placement="left" content={
                                    <div style={{ fontSize: '12px' }}>
                                        <span>reset 操作，删除节点里的碎片信息并重置上方的表单。</span>
                                        <div><strong>不会删除 ucms 里的碎片。</strong></div>
                                    </div>
                                }>
                                    <Button type="primary" size="small" ghost onClick={this.reset} style={{ width: '150px' }}>清空并重新创建碎片</Button>
                                </Popover>
                            : (chipType && !NEED_NOT_CREATE.includes(chipType) && <Button type="primary" size="small" onClick={this.createTrack}>创建碎片</Button>)
                    }
                </div>
            </StyledChipParams>
        )
    }
}

function mapStateToProps(state) {
    const { activeId, dataMap, channel, cname } = state;
    return { activeId, dataMap, channel, cname }
}

export default connect(mapStateToProps)(Chip)
