import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Dropdown, Menu, message, Slider, Tag, Tooltip } from 'antd'
import axios from 'axios'
import LabelInput from '../../../components/LabelInput'
import Icon from '../../../components/Icon'
import { changeDataMap } from '@action'
import { StyledMainSetting } from './styles'

class MainSetting extends PureComponent {
    
    state = {
        channelList: [],
        bcScale: 100 // 不放到state里，点击Slider的marks的时候不会更新视图，不知道原因
    }

    componentDidMount() {
        const { dataMap } = this.props
        this.fetchChannelList()
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

    fetchChannelList = async () => {
        const res = await axios.get(`https://ucms.ifeng.com/platform/area/areaApi/area/ucms/searchpath/root/list`)
        const { code, data } = res.data
        if (code === 0) {
            this.setState({
                channelList: data
            })
        } else {
            message.error('获取频道列表失败')
            this.setState({ channelList: [] }) // 失败不至于影响整个项目
        }
    }

    handleChannelChange = (e) => {
        const { dataMap } = this.props
        const newDataMap = {...dataMap}
        const [ id, name ] = e.key.split(':')
        newDataMap.channel = { id, name }
        changeDataMap(newDataMap)
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
        const { trackProjectId, dataMap } = this.props
        const { channelList, bcScale } = this.state
        const { name, cname, channel } = dataMap
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
                            <LabelInput inputStyle={{ width: '180px', fontSize: '12px' }} size="small" onChange={(value) => this.updateName('en', value)}>{name}</LabelInput>
                        </div>
                        <div className="settingItem">
                            <Tooltip placement="left" title="项目的中文名称">
                                <span className="prop">项目中文名称:</span>
                            </Tooltip>
                            <LabelInput inputStyle={{ width: '180px', fontSize: '12px' }} size="small" onChange={(value) => this.updateName('cn', value)}>{cname}</LabelInput>
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
                            <Dropdown
                                trigger="click"
                                overlay={
                                    <Menu selectedKeys={[`${channel.id}:${channel.name}`]} style={{ maxHeight: '500px', overflow: 'auto' }}>
                                        {channelList.map((item) => (
                                            <Menu.Item key={`${item.channel}:${item.title}`} value={item.channel} onClick={this.handleChannelChange}>
                                                {item.title}
                                            </Menu.Item>
                                        ))}
                                    </Menu>
                                }
                            >
                                <span style={{ cursor: 'pointer' }}>
                                    {
                                        channel.name ? <Tag color="blue">{channel.name}</Tag> : <Tag>未指定频道</Tag>
                                    }
                                </span>
                            </Dropdown>
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
                                    ? <span style={{ fontFamily: 'monospace' }}>{trackProjectId}</span>
                                    : <span style={{ color: '#8b8b8b' }}>首次创建埋点时自动创建</span>
                            }
                        </div>
                    </div>
                </div>

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
            </StyledMainSetting>
        )
    }
}

function mapStateToProps(state) {
    const { trackProjectId, dataMap } = state;
    return { trackProjectId, dataMap }
}

export default connect(mapStateToProps)(MainSetting)
