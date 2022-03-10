import React, { PureComponent } from 'react'
import * as PIXI from 'pixi.js'
import { GlowFilter } from '@pixi/filter-glow'
import { connect } from 'react-redux'
import { Button, message, Tooltip, Popover, Tag, Dropdown, Menu } from 'antd'
import axios from 'axios'
import RandomColor from 'randomcolor'
import Color from 'color'
import UploadImage from './features/UploadImage'
import Paste from './features/Paste'
import Parent from './features/Parent'
import Resize from './features/Resize'
import Finish from "./features/Finish/index"
import Icon from '../components/Icon'
import LabelInput from '../components/LabelInput'
import { changeMode, changeDataMap, changeActiveId, changeEditId } from '@action'
import { copyText, getDataById, hex2PixiColor, startChoose } from '../utils/common'
import { hitTest } from '../utils/pixiUtils'
import { StyledToolbar } from './styles'

const outlineFilter = new GlowFilter({ distance: 8, outerStrength: 3, color: 0xaaaaaa, quality: 1 })
const ENV_CONFIG_MAP = {
    default: {
        color: '#b8b8b8',
        desc: '纯净独立的默认开发环境'
    },
    custom: {
        color: '#ffc65c',
        desc: '来自个性化页面，项目修改'
    },
    custom_new: {
        color: '#3fd136',
        desc: '来自个性化页面，项目初始化'
    }
}

class ToolBar extends PureComponent {

    state = {
        channelList: [], // 频道列表
        hitObject: null, // 创建模式，鼠标hover的图形，放在这里是起到缓存的作用
        nextRectColor: '', // 即将创建的图形的颜色，随机颜色
        randomColorType: 'hue' // 随机颜色的范围，'' || 'light' || 'dark' || 'hue'
    }

    componentDidMount() {
        document.addEventListener('keydown', this.keyEvent, false)
        this.fetchChannelList()
    }

    componentWillUnmount() {
        const { app } = window
        document.removeEventListener('keydown', this.keyEvent, false)
        app.stage.removeAllListeners()
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

    keyEvent = (e) => {
        const { mode } = this.props

        // Esc 取消创建
        if (e.keyCode === 27 && mode === 'rect') {
            startChoose()
        }

        // ---------------  在文本框等内不监听的情况
        const ignoreTag = ['input', 'textarea', 'select', 'button']
        if (ignoreTag.includes(e.target.tagName.toLowerCase())) {
            return
        }
        // R 创建矩形
        if (e.keyCode === 82 && !e.metaKey ) {
            this.drawNormal()
        }
    }

    drawNormal = () => {
        const { dataMap } = this.props
        const { randomColorType, nextRectColor } = this.state
        const { app } = window
        const blocks = app.stage.children.filter(c => c.name !== 'bc' && c.name !== 'point')
        changeMode('rect')
        blocks.forEach(b => b.interactive = false)
        app.stage.removeAllListeners()
        app.stage.on('pointermove', this.findHit)
        let start = {}
        let duringRect = new PIXI.Graphics()
        app.stage.cursor = 'crosshair'

        let color, pixiColor
        if (randomColorType !== 'hue') {
            color = RandomColor({ luminosity: randomColorType })
            pixiColor = hex2PixiColor(color)
            this.setState({
                nextRectColor: color
            })
        } else {
            color = RandomColor({ luminosity: nextRectColor })
            pixiColor = hex2PixiColor(color)
        }

        const handleEnd = (event) => {
            const { parentId, scale, extraSetting } = this.props
            const { hitObject: hit } = this.state
            const end = {...event.data.global}

            const shape = new PIXI.Graphics()
            app.stage.removeChild(duringRect)
            // 如果只移动了很小的距离，就不创建
            if (Math.abs(end.x - start.x) < 2 && Math.abs(end.y-start.y) < 2) {
                app.stage.off('pointerup')
                app.stage.off('pointerupoutside')
                return
            }

            const width = Math.abs(end.x-start.x) / scale
            const height = Math.abs(end.y-start.y) / scale
            shape.lineStyle(4, pixiColor, 1)
            shape.beginFill(pixiColor, 0.2)
            shape.drawRect(
                0,
                0,
                width,
                height
            )
            shape.x = (Math.min(start.x, end.x) - app.stage.x) / scale
            shape.y = (Math.min(start.y, end.y) - app.stage.y) / scale
            shape.endFill()

            // 有命中，在命中的容器内创建
            if (parentId || hit) {
                const newDataMap = { ...dataMap }
                let parent
                if (parentId) {
                    parent = getDataById(parentId, newDataMap)
                } else {
                    parent = getDataById(hit.name, newDataMap)
                }

                const newId = parent.id + '_' + parent.willCreateKey + ''
                parent.children.push({
                    id: newId,
                    name: `组件${newId}`,
                    x: shape.x,
                    y: shape.y,
                    width,
                    height,
                    children: [],
                    color,
                    willCreateKey: 1
                })
                parent.willCreateKey++
                shape.name = newId
                shape.text = `组件${newId}`
                app.stage.addChild(shape)

                changeActiveId(newId)
                changeEditId(newId)
                changeDataMap(newDataMap)
            } else {
                // 没有命中，创建到总容器内
                const newId = dataMap.willCreateKey + ''
                changeDataMap({
                    ...dataMap,
                    willCreateKey: dataMap.willCreateKey + 1,
                    children: [
                        ...dataMap.children,
                        {
                            id: newId,
                            name: `组件${newId}`,
                            x: shape.x,
                            y: shape.y,
                            width,
                            height,
                            children: [],
                            color,
                            willCreateKey: 1
                        }
                    ]
                })
                shape.name = newId
                shape.text = `组件${newId}`
                app.stage.addChild(shape)
                changeActiveId(newId)
                changeEditId(newId)
            }
            start = {}
            const textStyle = {
                fontFamily: 'Arial',
                fontSize: '13px',
                fontWeight: 'bold',
                fill: color,
                stroke: Color(color).isLight() ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                strokeThickness: 4,
                dropShadow: true,
                dropShadowColor: '#cccccc',
                dropShadowAngle: Math.PI / 6,
                dropShadowDistance: 2,
                dropShadowBlur: 4,
                wordWrap: true, //是否允许换行
                wordWrapWidth: 440 //换行执行宽度
            }
            let basicText = new PIXI.Text(shape.text, textStyle)
            basicText.name = 'text'
            basicText.x = 0
            basicText.y = -24
            basicText.resolution = 2
            basicText.visible = extraSetting.isShowText
            shape.addChild(basicText)
            this.drawNormal()
            app.stage.off('pointerup')
            app.stage.off('pointerupoutside')
        }

        app.stage.on('pointerdown', (event) => {
            const { parentId, dataMap } = this.props
            const { hitObject: hit } = this.state

            if (randomColorType === 'hue' && (parentId || hit)) {
                let parent = getDataById(parentId || hit.name, dataMap)
                color = RandomColor({hue: parent ? parent.color : ''})
            }
            pixiColor = hex2PixiColor(color)
            this.setState({
                nextRectColor: color
            })

            if (event.data.button !== 0) {
                return
            }
            start = {...event.data.global}
            app.stage.off('pointermove', this.findHit)
            duringRect.visible = false
            duringRect.name = 'tmp'
            app.stage.addChild(duringRect)

            app.stage.on('pointermove', (event) => {
                duringRect.visible = true
                const current = {...event.data.global}
                duringRect.clear()
                duringRect.lineStyle(4, pixiColor, 1)
                duringRect.beginFill(pixiColor, 0.2)
                duringRect.drawRect(
                    (start.x - app.stage.x) / app.stage.scale.x,
                    (start.y - app.stage.y) / app.stage.scale.y,
                    (current.x-start.x) / app.stage.scale.x,
                    (current.y-start.y) / app.stage.scale.y
                )
                duringRect.endFill()
            })
            app.stage.on('pointerup', handleEnd)
            app.stage.on('pointerupoutside', handleEnd)
        })
    }

    findHit = (event) => {
        const { hitObject } = this.state
        const hit = hitTest(event.data.global)
        if (!hitObject || !hit || (hitObject && hit && hit.name !== hitObject.name)) {
            if (hitObject) {
                hitObject.filters = []
                hitObject.isHit = false
            }
            if (hit) {
                hit.filters = [outlineFilter]
                hit.isHit = true // 标记一下，用于全局清除
            }
            this.setState({
                hitObject: hit
            })
        }
    }

    print = () => {
        const { dataMap } = this.props
        copyText(JSON.stringify(dataMap))
        console.log('dataMap：', dataMap)
        message.success('已复制到控制台和剪切板')
    }

    finishReName = (type, value) => {
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

    handleChannelChange = (e) => {
        const { dataMap } = this.props
        const newDataMap = {...dataMap}
        const [ id, name ] = e.key.split(':')
        newDataMap.channel = { id, name }
        changeDataMap(newDataMap)
    }

    handleRandomColorTypeChange = (e) => {
        this.setState({ randomColorType: e.key }, () => {
            this.drawNormal()
        })
    }

    getRandomColorTypeText = (type) => {
        const { randomColorType } = this.state
        switch (type || randomColorType) {
            case 'light': return <div style={{ color: 'silver', textShadow: '1px 1px 5px #cbcbcb' }}>随机亮色</div>
            case 'dark': return <div style={{ fontWeight: 'bold' }}>随机暗色</div>
            case 'hue': {
                return (
                    <div>
                        <span style={{color: '#a31131'}}>系</span>
                        <span style={{color: '#d81316'}}>列</span>
                        <span style={{color: '#ef758b'}}>颜</span>
                        <span style={{color: '#f9bdcb'}}>色</span>
                    </div>
                )
            }
            default: return <div style={{ backgroundImage: `url('https://x0.ifengimg.com/ucms/2022_07/16E4BA1EA98E030BBCB4ACC21679A66C83E60C7C_size583_w800_h450.gif')`, WebkitBackgroundClip: 'text', color: 'transparent' }}>完全随机</div>
        }
    }

    render() {
        const { env, mode, dataMap } = this.props
        const { nextRectColor, channelList, randomColorType } = this.state
        const { name, cname, channel } = dataMap
        return (
            <StyledToolbar>
                {/*左侧*/}
                <div className="flex">
                    <Tooltip title="选择 (Esc)">
                        <button onClick={startChoose} className={`btn ${mode === 'choose' ? 'active': ''}`}>
                            <Icon icon="choose"/>
                        </button>
                    </Tooltip>

                    <Tooltip title="创建矩形 (R)">
                        <button onClick={this.drawNormal} className={`btn ${mode === 'rect' ? 'active': ''}`} style={mode === 'rect' ? { color: nextRectColor } : {}}>
                            <Icon icon="rect"/>
                        </button>
                    </Tooltip>

                    <Dropdown
                        trigger="click"
                        overlayStyle={{ backgroundColor: '#ffffff' }}
                        overlay={
                            <Menu selectedKeys={[randomColorType]} style={{ maxHeight: '500px', overflow: 'auto' }}>
                                <Menu.Item key="" onClick={this.handleRandomColorTypeChange}>
                                    {this.getRandomColorTypeText('random')}
                                </Menu.Item>
                                <Menu.Item key="light" onClick={this.handleRandomColorTypeChange}>
                                    {this.getRandomColorTypeText('light')}
                                </Menu.Item>
                                <Menu.Item key="dark" onClick={this.handleRandomColorTypeChange}>
                                    {this.getRandomColorTypeText('dark')}
                                </Menu.Item>
                                <Menu.Item key="hue" onClick={this.handleRandomColorTypeChange}>
                                    {this.getRandomColorTypeText('hue')}
                                </Menu.Item>
                            </Menu>
                        }
                    >
                        <span className="colorType">
                            {this.getRandomColorTypeText()}
                        </span>
                    </Dropdown>
                </div>
                {/*中间，为保持视觉居中，需要absolute*/}
                <div className="centerPart">
                    <div className="fileNameWp">
                        <Tooltip title={
                            <div>
                                <span style={{ fontWeight: 'bold' }} >环境</span>
                                <br/>
                                {
                                    Object.entries(ENV_CONFIG_MAP).map(([key, value], index) => {
                                        return (
                                            <div key={index}>
                                                <span style={{ color: value.color, marginRight: '4px', fontStyle: 'italic', textShadow: '1px 1px 3px rgba(189, 189, 189, 0.48)' }}>{key}:</span>
                                                <span>{value.desc}</span>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        }>
                            <div className="env" style={{ color: ENV_CONFIG_MAP[env].color }}>{env}</div>
                        </Tooltip>
                        <LabelInput style={{fontSize: '16px', fontWeight: 'bold' }} inputStyle={{ width: '160px', fontWeight: 'bold' }} onChange={(value) => this.finishReName('en', value)}>
                            {name}
                        </LabelInput>
                        <span>-</span>
                        <LabelInput readOnly={env.indexOf('custom') === 0} style={{fontSize: '12px' }} inputStyle={{ width: '160px', fontSize: '12px' }} onChange={(value) => this.finishReName('cn', value)}>
                            {cname}
                        </LabelInput>
                    </div>
                    <div className="channel">
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
                            {
                                channel.name ? <Tag color="blue">{channel.name}</Tag> : <Tag>未指定频道</Tag>
                            }
                        </Dropdown>
                    </div>
                </div>
                {/*右侧*/}
                <div className="flex">
                    <UploadImage />
                    <Parent />
                    <Popover content={
                        <div style={{ fontSize: '12px' }}>
                            <ul style={{paddingBottom: 0, paddingLeft: '14px', margin: 0}}>
                                <li>空格 + 鼠标拖拽移动画布</li>
                                <li>command + 滚轮放大缩小</li>
                                <li>delete 删除图形</li>
                                <li>移动图形时按住 command 可单独移动</li>
                                <li>双击树节点编辑名称</li>
                            </ul>
                        </div>
                    }>
                        <button className="btn"><Icon icon="tip"/></button>
                    </Popover>
                    <Resize />
                    <Button type="primary" onClick={this.print} style={{ marginLeft: '20px' }}>数据</Button>
                    <Paste />
                    <Finish />
                </div>
            </StyledToolbar>
        )
    }
}

function mapStateToProps(state) {
    const { env, mode, scale, parentId, dataMap, extraSetting } = state;
    return { env, mode, scale, parentId, dataMap, extraSetting }
}

export default connect(mapStateToProps)(ToolBar)
