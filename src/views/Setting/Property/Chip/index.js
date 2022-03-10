import React, { PureComponent } from 'react'
import { Collapse, message } from 'antd'
import { connect } from 'react-redux'
import axios from 'axios'
import ChipForm from './ChipForm'
import { getDataById, md5 } from '../../../utils/common'
import { changeDataMap } from '../../../../store/action'
import { StyledChipParams } from './styles'

const CREATE_CHIP_URL = {
    static: 'https://test0.ucms.ifeng.com/api/ns/addStaticFragment',
    recommend: 'https://test0.ucms.ifeng.com/api/ns/addRecommendFragment'
}

class Chip extends PureComponent {

    state = {
        isReady: false, // 本组件在 mount 和 update 的时候会读取节点上的 chip 信息，如果没有会新建一个，组件应该在这个阶段准备完毕之后再渲染
        localChipList: [], // 当前节点的碎片列表，一个节点可以有多个碎片
        newChip: {
            chipId: '',
            chipType: '',
            chipData: {}
        }
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
        this.setState({ isOK: false })
        const initChipData =
            data.config && data.config.chip
                ?
                data.config.chip
                :
                []

        this.setState({
            localChipList: initChipData
        }, () => {
            this.setState({isOK: true})
            const newDataMap = {...dataMap}
            const data = getDataById(activeId, newDataMap)
            data.config = {
                ...data.config,
                chip: [...initChipData]
            }
            changeDataMap(newDataMap)
        })
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

    createChip = async () => {
        const { dataMap } = this.props
        const { cname, channel } = dataMap
        const { newChip: { chipType, chipData } } = this.state

        if (!channel.id) {
            message.warn('还没指定频道，创建失败')
            return
        }

        const { title } = chipData

        const params = {
            name: `${channel.name}-${cname}-from Split-${title}`,
            channel: channel.id,
            channelName: channel.name,
            content: undefined,
        };
        params.signature = this.getSignature(params);

        const res = await axios.post(CREATE_CHIP_URL[chipType], params)
        if (res.data.code === 0) {
            const { localChipList } = this.state
            const newList = [...localChipList]
            newList.push({
                chipId: res.data.data,
                chipType,
                chipData
            })
            this.setState({
                localChipList: newList,
                newChip: {
                    chipId: '',
                    chipType: '',
                    chipData: {}
                }
            }, this.updateChip)

            message.success('创建成功')
        } else {
            message.error('创建碎片失败')
        }
    }

    updateChip = () => {
        const { activeId, dataMap } = this.props
        const { localChipList } = this.state
        const newDataMap = {...dataMap}
        const data = getDataById(activeId, newDataMap)
        data.config = {
            ...data.config,
            chip: localChipList
        }
        changeDataMap(newDataMap)
    }

    changeNewChip = (data) => {
        this.setState({
            newChip: data
        })
    }

    changeLocalChipList = (newChip, index) => {
        const { localChipList } = this.state
        const newList = [...localChipList]
        if (newChip) {
            newList.splice(index, 1, newChip)
        } else {
            newList.splice(index, 1)
        }
        this.setState({
            localChipList: newList
        }, this.updateChip)
    }

    render() {
        const { localChipList, newChip } = this.state
        return (
            <StyledChipParams>
                <Collapse ghost style={localChipList.length > 0 ? { fontSize:'12px', marginBottom: '16px' } : { fontSize:'12px' }}>
                    {
                        this.state.isOK && localChipList.map((chip, index) => {
                            return (
                                <Collapse.Panel
                                    key={index}
                                    header={
                                        <div className="collapseTitle">
                                            <strong>{chip.chipId} - {chip.chipType}</strong>
                                            <span>
                                                {chip.chipData.name}
                                            </span>
                                        </div>
                                    }>
                                    <div>
                                        <ChipForm index={index} chip={{...chip}} onChange={(obj) => this.changeLocalChipList(obj, index)} onDelete={() => this.changeLocalChipList(undefined, index)}/>
                                    </div>
                                </Collapse.Panel>
                            )
                        })
                    }
                </Collapse>
                <div className="title">新增碎片</div>
                <ChipForm chip={newChip} onChange={this.changeNewChip} onAdd={this.createChip} />
            </StyledChipParams>
        )
    }
}

function mapStateToProps(state) {
    const { activeId, dataMap } = state;
    return { activeId, dataMap }
}

export default connect(mapStateToProps)(Chip)
