import React, { PureComponent } from 'react'
import Proptypes from 'prop-types'
import { connect } from 'react-redux'
import { Divider, Switch } from 'antd'
import LabelInput from '../../../../components/LabelInput/index'
import { getDataById } from '../../../../utils/common'
import { StyledChipParams } from './styles'

const TYPE_MAP = {
    static: '静态碎片',
    recommend: '推荐位碎片',
    struct: '结构化碎片'
}

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
        const { type } = this.props
        const { chipData, dataId } = this.state
        const chipType = Object.keys(chipData)

        return (
            <StyledChipParams>
                <Divider orientation="left" style={{ fontSize: '12px' }} plain>碎片参数{type ? ` - ${TYPE_MAP[type]}` : ''}</Divider>
                <div className="paramsList">
                    {/*data-id*/}
                    {
                        chipType.includes('id') &&
                        <div className="param">
                            <span className="paramName">data-id:</span>
                            <LabelInput inputStyle={{ width: '120px', fontSize: '12px' }} size="small" onChange={(value) => this.updateChipData('id', value)}>{chipData.id}</LabelInput>
                        </div>
                    }

                    {/*data-name*/}
                    {
                        chipType.includes('name') &&
                        <div className="param">
                            <span className="paramName">data-name:</span>
                            <LabelInput inputStyle={{ width: '120px', fontSize: '12px' }} size="small" onChange={(value) => this.updateChipData('name', value)}>{chipData.name}</LabelInput>
                        </div>
                    }

                    {/*data-title*/}
                    {
                        chipType.includes('title') &&
                        <div className="param">
                            <span className="paramName">data-title:</span>
                            <LabelInput inputStyle={{ width: '120px', fontSize: '12px' }} size="small" onChange={(value) => this.updateChipData('title', value)}>{chipData.title}</LabelInput>
                        </div>
                    }

                    {/*data-group*/}
                    {
                        chipType.includes('group') &&
                        <div className="param">
                            <span className="paramName">data-group:</span>
                            <LabelInput inputStyle={{ width: '120px', fontSize: '12px' }} size="small" onChange={(value) => this.updateChipData('group', value)}>{chipData.group}</LabelInput>
                        </div>
                    }

                    {/*data-transform*/}
                    {
                        chipType.includes('transform') &&
                        <div className="param">
                            <span className="paramName">data-transform:</span>
                            <LabelInput inputStyle={{ width: '120px', fontSize: '12px' }} size="small" onChange={(value) => this.updateChipData('transform', value)}>{chipData.transform}</LabelInput>
                        </div>
                    }

                    {/*data-callback*/}
                    {
                        chipType.includes('callback') &&
                        <div className="param">
                            <span className="paramName">data-callback:</span>
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
