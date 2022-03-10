import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import axios from 'axios'
import { Dropdown, Menu, message, Tag } from 'antd'
import { changeDataMap } from '@action'

class ChannelChoose extends PureComponent {

    state = {
        channelList: [], // 频道列表
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
        const { dataMap } = this.props
        const newDataMap = {...dataMap}
        const [ id, name ] = e.key.split(':')
        newDataMap.channel = { id, name }
        changeDataMap(newDataMap)
    }

    render() {
        const { channelList } = this.state
        const { dataMap: { channel } } = this.props

        return (
            <Dropdown
                trigger="click"
                overlayStyle={{ backgroundColor: '#ffffff' }}
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
                <span style={{ userSelect: 'none' }}>
                    {
                        channel.name ? <Tag color="cyan">{channel.name}</Tag> : <Tag>未指定频道</Tag>
                    }
                </span>
            </Dropdown>
        )
    }
}

function mapStateToProps(state) {
    const { dataMap } = state;
    return {  dataMap }
}

export default connect(mapStateToProps)(ChannelChoose)
