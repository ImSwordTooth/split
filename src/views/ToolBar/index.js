import React, { PureComponent } from 'react'
import * as PIXI from 'pixi.js'
import { GlowFilter } from '@pixi/filter-glow'
import { connect } from 'react-redux'
import { Button, message, Tooltip, Popover, Tag, Dropdown, Menu } from 'antd'
import axios from 'axios'
import RandomColor from 'randomcolor'
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

class ToolBar extends PureComponent {

    state = {
        channelList: [], // 频道列表
        hitObject: null, // 创建模式，鼠标hover的图形，放在这里是起到缓存的作用
        nextRectColor: '', // 即将创建的图形的颜色，随机颜色
        randomColorType: '' // 随机颜色的范围，'' || 'light' || 'dark'
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
        const { randomColorType } = this.state
        const { app } = window
        const blocks = app.stage.children.filter(c => c.name !== 'bc' && c.name !== 'point')
        changeMode('rect')
        blocks.forEach(b => b.interactive = false)
        app.stage.removeAllListeners()
        app.stage.on('pointermove', this.findHit)
        let start = {}
        let duringRect = new PIXI.Graphics()
        app.stage.cursor = 'crosshair'
        const color = RandomColor({ luminosity: randomColorType })
        this.setState({
            nextRectColor: color
        })
        const pixiColor = hex2PixiColor(color)

        const handleEnd = (event) => {
            const { parentId, scale } = this.props
            const end = {...event.data.global}

            const shape = new PIXI.Graphics()
            app.stage.removeChild(duringRect)
            if (Math.abs(end.x - start.x) < 2 && Math.abs(end.y-start.y) < 2) {
                app.stage.off('pointerup')
                app.stage.off('pointerupoutside')
                return
            }
            shape.lineStyle(4, pixiColor, 1)
            shape.beginFill(pixiColor, 0.2)
            const width = Math.abs(end.x-start.x) / scale
            const height = Math.abs(end.y-start.y) / scale
            shape.drawRect(
                0,
                0,
                width,
                height
            )

            shape.x = (Math.min(start.x, end.x) - app.stage.x) / scale
            shape.y = (Math.min(start.y, end.y) - app.stage.y) / scale
            shape.endFill()

            const textStyle = {
                fontFamily: 'Arial',
                fontSize: '14px',
                fontStyle: 'italic',
                fontWeight: 'bold',
                fill: color,
                stroke: '#000000',
                strokeThickness: 2,
                dropShadow: true,
                dropShadowColor: '#000000',
                dropShadowAngle: Math.PI / 6,
                dropShadowDistance: 2,
                wordWrap: true, //是否允许换行
                wordWrapWidth: 440 //换行执行宽度
            }

            start = {}
            // 有命中，在命中的容器内创建
            const { hitObject: hit } = this.state

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
            let basicText = new PIXI.Text(shape.text, textStyle)
            basicText.name = 'text'
            basicText.x = 0
            basicText.y = -24
            shape.addChild(basicText)
            this.drawNormal()
            app.stage.off('pointerup')
            app.stage.off('pointerupoutside')
        }

        app.stage.on('pointerdown', (event) => {
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

    render() {
        const { mode, dataMap } = this.props
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
                                    <div style={{ backgroundImage: `url('https://x0.ifengimg.com/ucms/2022_07/F595B4788AB1EA1C98B1F7146DF9D0A0347918EA_size1477_w800_h450.gif')`, WebkitBackgroundClip: 'text', color: 'transparent' }}>完全随机</div>
                                </Menu.Item>
                                <Menu.Item key="light" onClick={this.handleRandomColorTypeChange}>亮色</Menu.Item>
                                <Menu.Item key="dark" onClick={this.handleRandomColorTypeChange}>暗色</Menu.Item>
                            </Menu>
                        }
                    >
                        <span className="colorType">
                            {
                                randomColorType
                                    ? randomColorType === 'light' ? '亮色' : '暗色'
                                    : '完全随机'
                            }
                        </span>
                    </Dropdown>
                </div>
                {/*中间，为保持视觉居中，需要absolute*/}
                <div className="centerPart">
                    <div className="fileNameWp">
                        <LabelInput style={{fontSize: '16px', fontWeight: 'bold' }} inputStyle={{ width: '160px' }} onChange={(value) => this.finishReName('en', value)}>
                            {name}
                        </LabelInput>
                        <span>-</span>
                        <LabelInput style={{fontSize: '12px' }} inputStyle={{ width: '160px', fontSize: '12px' }} onChange={(value) => this.finishReName('cn', value)}>
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
    const { mode, scale, parentId, dataMap } = state;
    return { mode, scale, parentId, dataMap }
}

export default connect(mapStateToProps)(ToolBar)
