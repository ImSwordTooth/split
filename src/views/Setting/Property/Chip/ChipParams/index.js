import React, { PureComponent } from 'react'
import Proptypes from 'prop-types'
import { connect } from 'react-redux'
import { Divider } from 'antd'
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
    }

    state = {
        chipData: {}
    }

    componentDidMount() {
        this.initChipData()
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.type !== this.props.type) {
            this.initChipData()
        }
    }

    initChipData = () => {
        const { type, activeId, dataMap, onChange } = this.props
        const parentId = activeId.split('_').length > 1 ? activeId.split('_').slice(0, -1).join('_'): activeId // 如果没有父组件，data-group 就是本身的名字
        const data = getDataById(activeId, dataMap)
        const parent = parentId === activeId ? data : getDataById(parentId, dataMap)
        let initData = {}
        switch (type) {
            case 'static': {
                initData = {
                    name: 'chip' + data.id,
                    title: data.name,
                    group: parent.name
                }
                break
            }
            default: {

            }
        }
        this.setState({
            chipData: initData
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

    DataName = () => {
        const { chipData } = this.state
        return (
            <div className="param">
                <span className="paramName">data-name:</span>
                <LabelInput inputStyle={{ width: '120px', fontSize: '12px' }} size="small" onChange={(value) => this.updateChipData('name', value)}>{chipData.name}</LabelInput>
            </div>
        )
    }

    DataTitle = () => {
        const { chipData } = this.state
        return (
            <div className="param">
                <span className="paramName">data-title:</span>
                <LabelInput inputStyle={{ width: '120px', fontSize: '12px' }} size="small" onChange={(value) => this.updateChipData('title', value)}>{chipData.title}</LabelInput>
            </div>
        )
    }

    DataGroup = () => {
        const { chipData } = this.state
        return (
            <div className="param">
                <span className="paramName">data-group:</span>
                <LabelInput inputStyle={{ width: '120px', fontSize: '12px' }} size="small" onChange={(value) => this.updateChipData('group', value)}>{chipData.group}</LabelInput>
            </div>
        )
    }



    GetFormItemsByType = () => {
        const { type } = this.props
        switch (type) {
            case 'static':
            case 'recommend': {
                return (
                    <div>
                        {this.DataName()}
                        {this.DataTitle()}
                        {this.DataGroup()}
                    </div>
                )
            }
            default: return
        }
    }

    render() {
        const { type } = this.props

        return (
            <StyledChipParams>
                <Divider orientation="left" style={{ fontSize: '12px' }} plain>碎片参数{type ? ` - ${TYPE_MAP[type]}` : ''}</Divider>
                <div className="paramsList">
                    {this.GetFormItemsByType()}
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
