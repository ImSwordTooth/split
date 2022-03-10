import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Slider, Tooltip } from 'antd'
import LabelInput from '../../../components/LabelInput'
import Icon from '../../../components/Icon'
import Copy from '../../../components/Copy'
import ChannelChoose from '../../../components/ChannelChoose'
import { changeDataMap } from '@action'
import { StyledMainSetting } from './styles'

class MainSetting extends PureComponent {
    
    state = {
        bcScale: 100 // 不放到state里，点击Slider的marks的时候不会更新视图，不知道原因
    }

    componentDidMount() {
        const { dataMap } = this.props
        this.setState({
            bcScale: Math.round(dataMap.bc.scale * 100)
        })
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.dataMap !== this.props.dataMap) {
            this.setState({
                bcScale: Math.round(this.props.dataMap.bc.scale * 100)
            })
        }
    }

    handleBcScaleChange = (value) => {
        const { dataMap } = this.props
        const newDataMap = {...dataMap}
        newDataMap.bc.scale = value / 100
        changeDataMap(newDataMap)
        this.setState({ bcScale: value })
        const bc = window.app.stage.children.find(a => a.name === 'bc')
        bc.setTransform(0, 0, value / 100, value / 100)
    }

    updateName = (type, value) => {
        const { dataMap } = this.props
        const newDataMap = {...dataMap}
        if (type === 'en') {
            newDataMap.name = value
        }
        if (type === 'cn') {
            newDataMap.cname = value
        }
        changeDataMap(newDataMap)
    }

    render() {
        const { env, trackProjectId, dataMap } = this.props
        const { bcScale } = this.state
        const { name, cname, bc } = dataMap
        return (
            <StyledMainSetting>
                <h2 className="settingTitle"><Icon icon="setting"/>项目设置</h2>
                <div>
                    <h3>基础设置</h3>
                    <div>
                        <div className="settingItem">
                            <Tooltip placement="left" title="项目的英文名称">
                                <span className="prop">项目名称:</span>
                            </Tooltip>
                            <LabelInput inputStyle={{ width: '160px', fontSize: '12px' }} size="small" onChange={(value) => this.updateName('en', value)}>{name}</LabelInput>
                        </div>
                        <div className="settingItem">
                            <Tooltip placement="left" title={`项目的${env === 'default' ? '中文名称' : '路径'}`}>
                                <span className="prop">{env === 'default' ? '项目中文名称' : '项目路径'}:</span>
                            </Tooltip>
                            <LabelInput readOnly={env.indexOf('custom') === 0} inputStyle={{ width: '160px', fontSize: '12px' }} size="small" onChange={(value) => this.updateName('cn', value)}>{cname}</LabelInput>
                        </div>
                        <div className="settingItem">
                            <Tooltip
                                placement="left"
                                title={
                                    <div>
                                        <span>项目所属频道</span>
                                        <br/>
                                        <span style={{ fontWeight: 'lighter' }}>用于碎片的创建</span>
                                    </div>
                                }>
                                <span className="prop">频道:</span>
                            </Tooltip>
                            <span style={{ cursor: 'pointer' }}>
                                <ChannelChoose />
                            </span>
                        </div>
                        <div className="settingItem">
                            <Tooltip
                                placement="left"
                                title={
                                    <div>
                                        <span>埋点所属的埋点项目</span>
                                        <br/>
                                        <span style={{ fontWeight: 'lighter' }}>首次创建埋点时自动创建。<span style={{ fontWeight: 'bold' }}>创建后不可修改</span>。</span>
                                    </div>
                                }>
                                <span className="prop">埋点项目:</span>
                            </Tooltip>
                            {
                                trackProjectId
                                    ? <span style={{ fontFamily: 'monospace', fontStyle: 'italic' }}><Copy>{trackProjectId}</Copy></span>
                                    : <span style={{ color: '#8b8b8b' }}>首次创建埋点时自动创建</span>
                            }
                        </div>
                    </div>
                </div>

                {
                    bc.image &&
                    <div>
                        <h3 style={{ marginTop: '16px' }}>背景图管理</h3>
                        <div>
                            <div className="settingItem" style={{ alignItems: 'flex-start' }}>
                                <Tooltip
                                    placement="left"
                                    title={
                                        <div>
                                            <span>修改背景图的缩放比</span>
                                            <br/>
                                            <span style={{ fontWeight: 'lighter' }}>只作用于背景图，不会修改节点图形的大小。</span>
                                        </div>
                                    }>
                                    <span className="prop">背景图大小:</span>
                                </Tooltip>
                                <div className="flex" style={{ marginTop: '-6px' }}>
                                    <Slider
                                        value={bcScale}
                                        tipFormatter={v => v + '%'}
                                        min={1}
                                        marks={{ 25: '25%', 50: '50%', 75: '75%', 100: '100%' }}
                                        style={{ width: '160px' }}
                                        onChange={this.handleBcScaleChange}/>
                                    <span style={{ margin: '-16px 0 0 16px', fontWeight: 'bold' }}>{bcScale}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                }
            </StyledMainSetting>
        )
    }
}

function mapStateToProps(state) {
    const { env, trackProjectId, dataMap } = state;
    return { env, trackProjectId, dataMap }
}

export default connect(mapStateToProps)(MainSetting)
