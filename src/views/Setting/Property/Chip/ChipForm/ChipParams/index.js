import React, { PureComponent } from 'react'
import Proptypes from 'prop-types'
import { connect } from 'react-redux'
import { Switch, Tooltip } from 'antd'
import LabelInput from '../../../../../components/LabelInput'
import { getDataById } from '../../../../../utils/common'
import { StyledChipParams } from './styles'

class ChipParams extends PureComponent {

    static propTypes = {
        type: Proptypes.string,
        data: Proptypes.object
    }

    state = {
        chipData: {},
        dataId: ''
    }

    componentDidMount() {
        this.initChipData()
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.activeId !== this.props.activeId || prevProps.type !== this.props.type ) {
            this.initChipData()
        }
    }

    initChipData = () => {
        const { type, data: chipDataFromProps, activeId, dataMap, onChange } = this.props
        let initData = {}
        if (chipDataFromProps && Object.keys(chipDataFromProps).length > 0) {
            initData = chipDataFromProps
        } else {
            const parentId = activeId.split('_').length > 1 ? activeId.split('_').slice(0, -1).join('_'): activeId // 如果没有父组件，data-group 就是本身的名字
            const data = getDataById(activeId, dataMap)
            const parent = parentId === activeId ? data : getDataById(parentId, dataMap)
            switch (type) {
                case 'static':{
                    initData = {
                        name: 'chip' + data.id,
                        title: data.name,
                        group: parent.name
                    }
                    break
                }
                case 'recommend': {
                    initData = {
                        name: 'chip' + data.id,
                        title: data.name,
                        group: parent.name,
                        transform: `chip${data.id}Transform`,
                        callback: false
                    }
                    break
                }
                case 'struct': {
                    initData = {
                        id: '',
                        name: 'chip' + data.id,
                        title: data.name,
                        group: parent.name,
                        transform: `chip${data.id}Transform`,
                        callback: false
                    }
                    break
                }
                default: {

                }
            }
            this.setState({ dataId: data.id })
        }
        this.setState({
            chipData: initData,
        })
        onChange(initData)
    }

    updateChipData = (prop, value) => {
        const { chipData } = this.state
        const { onChange } = this.props
        const newChipData = {...chipData}
        newChipData[prop] = value
        this.setState({
            chipData: newChipData
        })
        onChange(newChipData)
    }

    render() {
        const { chipData, dataId } = this.state
        const chipType = Object.keys(chipData)

        return (
            <StyledChipParams>
                <div className="paramsList">
                    {/*data-id*/}
                    {
                        chipType.includes('id') &&
                        <div className="param">
                            <Tooltip placement="left" title="碎片的唯一 id。">
                                <span className="paramName">data-id:</span>
                            </Tooltip>
                            <LabelInput inputStyle={{ width: '120px', fontSize: '12px' }} size="small" onChange={(value) => this.updateChipData('id', value)}>{chipData.id}</LabelInput>
                        </div>
                    }

                    {/*data-name*/}
                    {
                        chipType.includes('name') &&
                        <div className="param">
                            <Tooltip placement="left" title="碎片在库中、allData 里的 key 值，通过该值来找到对应的数据。">
                                <span className="paramName">data-name:</span>
                            </Tooltip>
                            <LabelInput inputStyle={{ width: '120px', fontSize: '12px' }} size="small" onChange={(value) => this.updateChipData('name', value)}>{chipData.name}</LabelInput>
                        </div>
                    }

                    {/*data-title*/}
                    {
                        chipType.includes('title') &&
                        <div className="param">
                            <Tooltip placement="left" title="碎片的说明，命名没有规范，但是要让用户知道这个碎片是干嘛的。">
                                <span className="paramName">data-title:</span>
                            </Tooltip>
                            <LabelInput inputStyle={{ width: '120px', fontSize: '12px' }} size="small" onChange={(value) => this.updateChipData('title', value)}>{chipData.title}</LabelInput>
                        </div>
                    }

                    {/*data-group*/}
                    {
                        chipType.includes('group') &&
                        <div className="param">
                            <Tooltip placement="left" title={<div>碎片的组的名称，如果两个碎片来自同一部分，就可以放在同一个组。<br/>和 title 一样，命名规则的要求就是语义化。单个碎片也应该有个 group 来包裹。</div>}>
                                <span className="paramName">data-group:</span>
                            </Tooltip>
                            <LabelInput inputStyle={{ width: '120px', fontSize: '12px' }} size="small" onChange={(value) => this.updateChipData('group', value)}>{chipData.group}</LabelInput>
                        </div>
                    }

                    {/*data-transform*/}
                    {
                        chipType.includes('transform') &&
                        <div className="param">
                            <Tooltip placement="left" title="一个函数名，该函数要定义在 script 标签中，用于整理数据。">
                                <span className="paramName">data-transform:</span>
                            </Tooltip>
                            <LabelInput inputStyle={{ width: '120px', fontSize: '12px' }} size="small" onChange={(value) => this.updateChipData('transform', value)}>{chipData.transform}</LabelInput>
                        </div>
                    }

                    {/*data-callback*/}
                    {
                        chipType.includes('callback') &&
                        <div className="param">
                            <Tooltip placement="left" title="一个函数名，该函数要定义在 script 标签中，用于数据整理后的回调。">
                                <span className="paramName">data-callback:</span>
                            </Tooltip>
                            <Switch size="small" style={{ marginRight: '10px' }} checked={chipData.callback} onChange={(checked) => this.updateChipData('callback', checked ? `chip${dataId}Callback` : checked)} />
                            {
                                chipData.callback && <LabelInput inputStyle={{ width: '120px', fontSize: '12px' }} size="small" onChange={(value) => this.updateChipData('callback', value)}>{chipData.callback}</LabelInput>
                            }
                        </div>
                    }
                </div>
            </StyledChipParams>
        )
    }
}

function mapStateToProps(state) {
    const { activeId, dataMap } = state;
    return { activeId, dataMap }
}

export default connect(mapStateToProps)(ChipParams)
