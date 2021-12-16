import React, { PureComponent } from 'react'
import * as PIXI from 'pixi.js'
import { connect } from 'react-redux'
import { Button, message, Select, Tooltip, Popover, Input, Tag, Dropdown, Menu } from 'antd'
import axios from 'axios'
import UploadImage from '../components/UploadImage'
import Icon from '../components/Icon'
import { changeMode, changeDataMap, changeActiveId, changeEditId, changeParentId, changeName, changeCName, changeChannel } from '@action'
import { copyText, getDataById, getRandomColor, hex2PixiColor, resize, startChoose } from '../utils/common'
import { hitTest } from '../utils/pixiUtils'
import { StyledToolbar } from './styles'

const { Option } = Select

const SCALE_LIST = [ 0.1, 0.25, 0.5, 1, 1.5, 2, 4 ] // 缩放值列表，放在 Select 里快速选择
class ToolBar extends PureComponent {

    state = {
        reNaming: '', // 正在重命名的字段, '' || 'cn' || 'en'
        channelList: [], // 频道列表
        hitObject: null, // 创建模式，鼠标hover的图形，放在这里是起到缓存的作用
        nextRectColor: '' // 即将创建的图形的颜色，随机颜色
    }

    selectRef = React.createRef();

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
        if (e.keyCode === 82) {
            this.drawNormal()
        }
    }

    drawNormal = () => {
        const { dataMap, scale } = this.props
        const { app } = window
        const blocks = app.stage.children.filter(c => c.name !== 'bc' && c.name !== 'point')
        changeMode('rect')
        blocks.forEach(b => b.interactive = false)
        app.stage.removeAllListeners()
        app.stage.on('pointermove', this.findHit)
        let start = {}
        let ing = false
        let duringRect = new PIXI.Graphics()
        app.stage.cursor = 'crosshair'
        const color = getRandomColor()
        this.setState({
            nextRectColor: color
        })
        const pixiColor = hex2PixiColor(color)

        const handleEnd = (event) => {
            const { parentId } = this.props
            if (ing) {
                const end = {...event.data.global}

                const shape = new PIXI.Graphics()
                app.stage.removeChild(duringRect)
                if (Math.abs(end.x - start.x) < 2 && Math.abs(end.y-start.y) < 2) {
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
                ing = false
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
                    app.stage.addChild(shape)
                    changeActiveId(newId)
                    changeEditId(newId)
                }
                this.drawNormal()
            }
        }

        app.stage.on('pointerdown', (event) => {
            start = {...event.data.global}
            app.stage.off('pointermove', this.findHit)
            duringRect.visible = false
            duringRect.name = 'tmp'
            app.stage.addChild(duringRect)
            ing = true

            app.stage.on('pointermove', (event) => {
                duringRect.visible = true
                if (ing) {
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
                }
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
                hitObject.tint = 0xffffff
            }
            if (hit) {
                hit.tint = 0xc7c7c7;
            }
            this.setState({
                hitObject: hit
            })
        }
    }

    resizeTo = e => {
        resize(null, e.value)
    }

    print = () => {
        const { dataMap } = this.props
        copyText(JSON.stringify(dataMap))
        console.log('dataMap：', dataMap)
        message.success('已复制到控制台和剪切板')
    }

    selectBlur = () => {
        this.selectRef.current.blur()
    }

    clickToScale = (e) => {
        const { type } = e.currentTarget.dataset
        const { scale } = this.props
        if (type === '-') {
            const index = SCALE_LIST.findIndex(s => s >= scale)

            if (index > 0) {
               resize(null, SCALE_LIST[index - 1])
            }
        } else {
            const index = SCALE_LIST.findIndex(s => s > scale)
            if (index < SCALE_LIST.length) {
                resize(null, SCALE_LIST[index])
            }
        }
    }

    markParent = () => {
        const { activeId, parentId } = this.props
        if (activeId === parentId || activeId === '0') {
            changeParentId('')
        } else {
            changeParentId(activeId)
        }
    }

    clearParent = (e) => {
        e.stopPropagation()
        changeParentId('')
    }

    startReName = (e) => {
        e.stopPropagation()
        const { type } = e.currentTarget.dataset
        this.setState({ reNaming: type })
        document.addEventListener('click', this.cancelReName)
    }

    finishReName = (e) => {
        const { reNaming } = this.state
        if (reNaming === 'en') {
            changeName(e.target.value)
        }
        if (reNaming === 'cn') {
            changeCName(e.target.value)
        }
        this.setState({ reNaming: '' })
    }

    cancelReName = (e) => {
        const { reNaming } = this.state
        if (reNaming === 'en') {
            const en = document.getElementById('en')
            if (en.contains(e.target)) {
                return
            }
            changeName(en.value)
        }
        if (reNaming === 'cn') {
            const cn = document.getElementById('cn')
            if (cn.contains(e.target)) {
                return
            }
            changeCName(cn.value)
        }
        this.setState({ reNaming: '' })
        document.removeEventListener('click', this.cancelReName)
    }

    handleChannelChange = (e) => {
        const [ id, name ] = e.key.split(':')
        changeChannel({ id, name })
    }

    render() {
        const { name, cname, channel, mode, scale, parentId, activeId } = this.props
        const { nextRectColor, reNaming, channelList } = this.state
        return (
            <StyledToolbar>
                {/*左侧*/}
                <div>
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
                </div>
                {/*中间，为保持视觉居中，需要absolute*/}
                <div className="centerPart">
                    <div className="fileNameWp">
                        {
                            reNaming === 'en'
                                ? <Input id="en" defaultValue={name} autoFocus style={{ width: '160px' }} onPressEnter={this.finishReName}/>
                                :  <span className="en" data-type="en" onClick={this.startReName}>{name}</span>
                        }
                        <span>-</span>
                        {
                            reNaming === 'cn'
                                ? <Input id="cn" defaultValue={cname} autoFocus style={{ width: '160px', fontSize: '12px' }} onPressEnter={this.finishReName}/>
                                : <span className="cn" data-type="cn" onClick={this.startReName}>{cname}</span>
                        }
                    </div>
                    <div className="channel">
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
                            {
                                channel.name ? <Tag color="cyan">{channel.name}</Tag> : <Tag>未指定频道</Tag>
                            }
                        </Dropdown>
                    </div>
                </div>
                {/*右侧*/}
                <div>
                    <UploadImage />
                    <Tooltip title={
                        <div>
                            <span>指定为父容器</span>
                            <br/>
                            <span style={{ fontWeight: 'lighter' }}>新的组件将强制创建在该组件内，表现在树状图中为<span style={{ color: '#ffc864' }}>橙色边框</span></span>
                        </div>
                    }>
                        <button className={`btn ${parentId && parentId === activeId ? 'active': ''}`} onClick={this.markParent}>
                            <Icon icon="parent"/>
                            {
                                parentId &&
                                <div className="clearParent" onClick={this.clearParent}>
                                    <Icon icon="x"/>
                                </div>
                            }
                        </button>
                    </Tooltip>
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
                    <div className="resize">
                        <button data-type="-" className="btn" style={{ margin: '0 2px' }} onClick={this.clickToScale}>-</button>
                        <Select
                            ref={this.selectRef}
                            value={{ value: scale, label: parseInt(scale * 100) + '%' }}
                            labelInValue
                            showArrow={false}
                            onChange={this.resizeTo}
                            onSelect={this.selectBlur}
                            dropdownStyle={{ textAlign: 'center' }}
                            style={{ width: 70, textAlign: 'center' }}
                        >
                            {
                                SCALE_LIST.map((scale, index) => {
                                    return <Option value={scale} key={index}>{scale * 100 + '%'}</Option>
                                })
                            }
                        </Select>
                        <button data-type="+" className="btn" style={{ margin: '0 2px' }}  onClick={this.clickToScale}>+</button>
                    </div>
                    <Button type="primary" onClick={this.print} style={{ marginLeft: '20px' }}>数据</Button>
                </div>
            </StyledToolbar>
        )
    }
}

function mapStateToProps(state) {
    const { name, cname, channel, mode, scale, activeId, parentId, dataMap } = state;
    return { name, cname, channel, mode, scale, activeId, parentId, dataMap }
}

export default connect(mapStateToProps)(ToolBar)
