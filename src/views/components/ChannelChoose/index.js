import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import axios from 'axios'
import { Menu, message, Tag, Input, Popover } from 'antd'
import { changeDataMap } from '@action'
import { StyledChannelChoose } from './styles'

class ChannelChoose extends PureComponent {

    state = {
        channelList: [], // 频道列表
        searchChannel: '', // 搜索
        isShowPopover: false
    }

    componentDidMount() {
        this.fetchChannelList()
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
        this.toggleIsShowPopover()
        const { dataMap } = this.props
        const newDataMap = {...dataMap}
        const [ id, name ] = e.key.split(':')
        newDataMap.channel = { id, name }
        changeDataMap(newDataMap)
    }

    handleSearchChange = (e) => {
        const { value } = e.target
        this.setState({
            searchChannel: value
        })
    }

    toggleIsShowPopover = () => {
        const { isShowPopover } = this.state
        this.setState({ isShowPopover: !isShowPopover })
        setTimeout(() => {
            if (!isShowPopover) {
                document.addEventListener('click', this.cancel, false)
            } else {
                document.removeEventListener('click', this.cancel, false)
            }
        })
    }

    cancel = (e) => {
        const wp = document.getElementById('channelChoose')
        if (wp && !wp.contains(e.target)) {
            this.toggleIsShowPopover()
        }
    }

    render() {
        const { channelList, searchChannel, isShowPopover } = this.state
        const { dataMap: { channel } } = this.props

        return (
            <Popover
                trigger="click"
                visible={isShowPopover}
                placement="bottomLeft"
                overlayClassName="noPaddingPopover"
                content={
                    <StyledChannelChoose id="channelChoose">
                        <div className="inputWp">
                            <Input placeholder="搜索..." value={searchChannel} onChange={this.handleSearchChange} allowClear size="small"/>
                        </div>
                        <Menu selectedKeys={[`${channel.id}:${channel.name}`]} style={{ maxHeight: '500px', overflow: 'auto' }}>
                            {
                                !searchChannel &&
                                <Menu.Item key={`:`} value="" onClick={this.handleChannelChange}>
                                    --无--
                                </Menu.Item>
                            }
                            {channelList.filter(a => a.title.indexOf(searchChannel) > -1).map((item) => (
                                <Menu.Item key={`${item.channel}:${item.title}`} value={item.channel} onClick={this.handleChannelChange}>
                                    {item.title}
                                </Menu.Item>
                            ))}
                        </Menu>
                    </StyledChannelChoose>
                }
            >
                <span style={{ userSelect: 'none' }} onClick={this.toggleIsShowPopover}>
                    {
                        channel.name ? <Tag color="cyan">{channel.name}</Tag> : <Tag>未指定频道</Tag>
                    }
                </span>
            </Popover>
        )
    }
}

function mapStateToProps(state) {
    const { dataMap } = state;
    return {  dataMap }
}

export default connect(mapStateToProps)(ChannelChoose)
